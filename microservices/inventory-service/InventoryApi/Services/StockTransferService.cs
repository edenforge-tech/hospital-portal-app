using InventoryApi.Data;
using InventoryApi.Models.DTOs;
using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Services;

public interface IStockTransferService
{
    Task<PagedResult<object>> ListTransfersAsync(Guid tenantId, Guid? fromStoreId, int page, int pageSize, CancellationToken ct);
    Task<StockTransfer> CreateTransferAsync(Guid tenantId, Guid userId, StockTransferRequest req, CancellationToken ct);
    Task<StockTransfer?> ApproveTransferAsync(Guid tenantId, Guid transferId, Guid userId, CancellationToken ct);
    Task<StockTransfer?> DispatchTransferAsync(Guid tenantId, Guid transferId, Guid userId, CancellationToken ct);
    Task<StockTransfer?> ReceiveTransferAsync(Guid tenantId, Guid transferId, Guid userId, CancellationToken ct);
    Task<StockTransfer?> CancelTransferAsync(Guid tenantId, Guid transferId, Guid userId, string? reason, CancellationToken ct);
}

public sealed class StockTransferService : IStockTransferService
{
    private readonly InventoryDbContext _db;
    private readonly IStockService _stock;

    public StockTransferService(InventoryDbContext db, IStockService stock)
    {
        _db = db;
        _stock = stock;
    }

    public async Task<PagedResult<object>> ListTransfersAsync(
        Guid tenantId, Guid? fromStoreId, int page, int pageSize, CancellationToken ct)
    {
        var q = _db.StockTransfers
            .Where(t => t.TenantId == tenantId && t.DeletedAt == null);

        if (fromStoreId.HasValue)
            q = q.Where(t => t.FromStoreId == fromStoreId.Value);

        var total = await q.CountAsync(ct);
        var items = await q
            .OrderByDescending(t => t.TransferDate)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(t => (object)new
            {
                t.Id,
                t.TransferNumber,
                t.FromStoreId,
                t.ToStoreId,
                t.TransferDate,
                t.TransferStatus,
                t.CreatedAt
            })
            .ToListAsync(ct);

        return new PagedResult<object>(items, total, page, pageSize);
    }

    public async Task<StockTransfer> CreateTransferAsync(Guid tenantId, Guid userId, StockTransferRequest req, CancellationToken ct)
    {
        var count = await _db.StockTransfers.CountAsync(t => t.TenantId == tenantId, ct);
        var transferNumber = $"TRF/{DateTime.UtcNow:yyyyMMdd}/{count + 1:D4}";

        var transfer = new StockTransfer
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            FromStoreId = req.FromStoreId,
            ToStoreId = req.ToStoreId,
            TransferNumber = transferNumber,
            TransferDate = req.TransferDate.Date,
            TransferStatus = "Pending",
            Remarks = req.Remarks,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedByUserId = userId,
            UpdatedByUserId = userId
        };
        _db.StockTransfers.Add(transfer);

        foreach (var lineReq in req.Items)
        {
            var batch = await _db.StockBatches.FindAsync([lineReq.StockBatchId], ct)
                ?? throw new InvalidOperationException($"Batch {lineReq.StockBatchId} not found.");

            _db.StockTransferItems.Add(new StockTransferItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                TransferId = transfer.Id,
                ItemId = lineReq.ItemId,
                StockBatchId = lineReq.StockBatchId,
                TransferQuantity = lineReq.TransferQuantity,
                UnitRate = batch.PurchaseRate,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedByUserId = userId
            });
        }

        await _db.SaveChangesAsync(ct);
        return transfer;
    }

    public async Task<StockTransfer?> ApproveTransferAsync(Guid tenantId, Guid transferId, Guid userId, CancellationToken ct)
    {
        var transfer = await _db.StockTransfers
            .Include(t => t.Items)
            .FirstOrDefaultAsync(t => t.Id == transferId && t.TenantId == tenantId && t.DeletedAt == null, ct);

        if (transfer is null || transfer.TransferStatus != "Pending") return null;

        transfer.TransferStatus = "Approved";
        transfer.ApprovedBy = userId;
        transfer.ApprovedAt = DateTime.UtcNow;
        transfer.UpdatedAt = DateTime.UtcNow;
        transfer.UpdatedByUserId = userId;

        await _db.SaveChangesAsync(ct);
        return transfer;
    }

    public async Task<StockTransfer?> DispatchTransferAsync(Guid tenantId, Guid transferId, Guid userId, CancellationToken ct)
    {
        var transfer = await _db.StockTransfers
            .FirstOrDefaultAsync(t => t.Id == transferId && t.TenantId == tenantId && t.DeletedAt == null, ct);

        if (transfer is null || transfer.TransferStatus != "Approved") return null;

        transfer.TransferStatus = "InTransit";
        transfer.DispatchedBy = userId;
        transfer.DispatchedAt = DateTime.UtcNow;
        transfer.UpdatedAt = DateTime.UtcNow;
        transfer.UpdatedByUserId = userId;

        await _db.SaveChangesAsync(ct);
        return transfer;
    }

    public async Task<StockTransfer?> ReceiveTransferAsync(Guid tenantId, Guid transferId, Guid userId, CancellationToken ct)
    {
        var transfer = await _db.StockTransfers
            .Include(t => t.Items)
            .FirstOrDefaultAsync(t => t.Id == transferId && t.TenantId == tenantId && t.DeletedAt == null, ct);

        if (transfer is null || transfer.TransferStatus != "InTransit") return null;

        await _stock.PostTransferAsync(tenantId, transfer, userId, ct);

        transfer.TransferStatus = "Completed";
        transfer.ReceivedBy = userId;
        transfer.ReceivedAt = DateTime.UtcNow;
        transfer.UpdatedAt = DateTime.UtcNow;
        transfer.UpdatedByUserId = userId;

        await _db.SaveChangesAsync(ct);
        return transfer;
    }

    public async Task<StockTransfer?> CancelTransferAsync(Guid tenantId, Guid transferId, Guid userId, string? reason, CancellationToken ct)
    {
        var transfer = await _db.StockTransfers
            .FirstOrDefaultAsync(t => t.Id == transferId && t.TenantId == tenantId && t.DeletedAt == null, ct);

        if (transfer is null) return null;
        if (transfer.TransferStatus is "Completed" or "Cancelled") return null;

        transfer.TransferStatus = "Cancelled";
        transfer.Remarks = string.IsNullOrWhiteSpace(reason) ? transfer.Remarks
            : (transfer.Remarks is null ? reason : $"{transfer.Remarks}; Cancelled: {reason}");
        transfer.DeletedAt = DateTime.UtcNow;
        transfer.UpdatedAt = DateTime.UtcNow;
        transfer.UpdatedByUserId = userId;

        await _db.SaveChangesAsync(ct);
        return transfer;
    }
}
