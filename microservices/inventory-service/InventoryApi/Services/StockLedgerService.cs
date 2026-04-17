using InventoryApi.Data;
using InventoryApi.Models.DTOs;
using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Services;

public interface IStockLedgerService
{
    Task<IReadOnlyList<StockBatchDto>> GetBatchesAsync(Guid tenantId, Guid storeId, Guid itemId, CancellationToken ct);
    Task<IReadOnlyList<StockSummaryDto>> GetSummaryAsync(Guid tenantId, Guid? storeId, CancellationToken ct);
    Task<IReadOnlyList<StockSummaryDto>> GetBelowReorderAsync(Guid tenantId, CancellationToken ct);
    Task<PagedResult<StockLedgerDto>> GetLedgerAsync(Guid tenantId, Guid? storeId, Guid? itemId, DateTime? from, DateTime? to, int page, int pageSize, CancellationToken ct);
    Task<StockLedger> CreateAdjustmentAsync(Guid tenantId, Guid userId, CreateStockAdjustmentRequest req, CancellationToken ct);
    /// <summary>
    /// Returns active stock batches where the item requires cold storage
    /// but the batch is held in a store that is NOT of type "Refrigerated".
    /// </summary>
    Task<IReadOnlyList<ColdChainAlertDto>> GetColdChainAlertsAsync(Guid tenantId, CancellationToken ct);
    /// <summary>
    /// Deducts return quantities from stock batches and writes RETURN_TO_VENDOR ledger rows.
    /// Called immediately when a purchase return is created.
    /// </summary>
    Task RecordReturnToVendorAsync(Guid tenantId, Guid userId, IEnumerable<PurchaseReturnItem> items, string returnNumber, Guid returnId, CancellationToken ct);
    /// <summary>
    /// Reverses a previous RecordReturnToVendorAsync call — adds stock back to batches
    /// and writes RETURN_TO_VENDOR_REVERSAL ledger rows. Called when a return is cancelled.
    /// </summary>
    Task ReverseReturnToVendorAsync(Guid tenantId, Guid userId, IEnumerable<PurchaseReturnItem> items, string returnNumber, Guid returnId, CancellationToken ct);
}

public sealed class StockLedgerService : IStockLedgerService
{
    private readonly InventoryDbContext _db;

    public StockLedgerService(InventoryDbContext db) => _db = db;

    public async Task<IReadOnlyList<StockBatchDto>> GetBatchesAsync(Guid tenantId, Guid storeId, Guid itemId, CancellationToken ct)
    {
        return await _db.StockBatches
            .Include(b => b.Item)
            .Where(b => b.TenantId == tenantId && b.StoreId == storeId && b.ItemId == itemId
                     && b.QuantityAvailable > 0 && b.DeletedAt == null)
            .OrderBy(b => b.ExpiryDate ?? DateTime.MaxValue)
            .Select(b => new StockBatchDto(
                b.Id, b.ItemId,
                b.Item != null ? b.Item.ItemName : string.Empty,
                b.BatchNumber, b.ExpiryDate, b.Barcode,
                b.Mrp, b.PurchaseRate, b.QuantityAvailable))
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<StockSummaryDto>> GetSummaryAsync(Guid tenantId, Guid? storeId, CancellationToken ct)
    {
        var q = _db.StockBatches
            .Include(b => b.Item)
            .Include(b => b.Store)
            .Where(b => b.TenantId == tenantId && b.DeletedAt == null && b.QuantityAvailable > 0);

        if (storeId.HasValue) q = q.Where(b => b.StoreId == storeId.Value);

        var grouped = await q
            .GroupBy(b => new { b.StoreId, b.Store!.StoreName, b.Store.StoreType, b.ItemId,
                                b.Item!.ItemName, b.Item.GenericName, b.Item.Unit,
                                b.Item.ReorderLevel, b.Item.ItemType })
            .Select(g => new
            {
                g.Key,
                TotalAvailable = g.Sum(b => b.QuantityAvailable),
                NearestExpiry  = g.Min(b => b.ExpiryDate),
                BatchCount     = g.Count()
            })
            .ToListAsync(ct);

        return grouped.Select(g => new StockSummaryDto(
            g.Key.StoreId, g.Key.StoreName,
            g.Key.ItemId,  g.Key.ItemName, g.Key.GenericName,
            g.Key.Unit, g.TotalAvailable, g.NearestExpiry,
            g.BatchCount, g.Key.ReorderLevel,
            g.TotalAvailable <= g.Key.ReorderLevel
        )).ToList();
    }

    public async Task<IReadOnlyList<StockSummaryDto>> GetBelowReorderAsync(Guid tenantId, CancellationToken ct)
    {
        var all = await GetSummaryAsync(tenantId, null, ct);
        return all.Where(s => s.BelowReorder).ToList();
    }

    public async Task<PagedResult<StockLedgerDto>> GetLedgerAsync(
        Guid tenantId, Guid? storeId, Guid? itemId,
        DateTime? from, DateTime? to,
        int page, int pageSize, CancellationToken ct)
    {
        var q = _db.StockLedgers
            .Include(l => l.Item)
            .Where(l => l.TenantId == tenantId && l.DeletedAt == null);

        if (storeId.HasValue) q = q.Where(l => l.StoreId == storeId.Value);
        if (itemId.HasValue)  q = q.Where(l => l.ItemId  == itemId.Value);
        if (from.HasValue)    q = q.Where(l => l.TransactionDate >= from.Value.Date);
        if (to.HasValue)      q = q.Where(l => l.TransactionDate <= to.Value.Date);

        var total = await q.CountAsync(ct);
        var items = await q
            .OrderByDescending(l => l.TransactionDate)
            .ThenByDescending(l => l.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(l => new StockLedgerDto(
                l.Id, l.StoreId, l.ItemId,
                l.Item != null ? l.Item.ItemName : string.Empty,
                l.StockBatchId, l.TransactionType,
                l.ReferenceId, l.ReferenceNumber,
                l.QuantityIn, l.QuantityOut, l.BalanceQuantity,
                l.UnitRate, l.TotalValue, l.Remarks,
                l.PatientName, l.PatientIpNo,
                l.TransactionDate, l.CreatedAt))
            .ToListAsync(ct);

        return new PagedResult<StockLedgerDto>(items, total, page, pageSize);
    }

    public async Task<StockLedger> CreateAdjustmentAsync(
        Guid tenantId, Guid userId, CreateStockAdjustmentRequest req, CancellationToken ct)
    {
        // Update batch quantity if a specific batch is given
        if (req.StockBatchId.HasValue)
        {
            var batch = await _db.StockBatches.FindAsync([req.StockBatchId.Value], ct)
                ?? throw new InvalidOperationException($"Stock batch {req.StockBatchId} not found.");
            if (batch.TenantId != tenantId)
                throw new InvalidOperationException("Batch does not belong to this tenant.");

            batch.QuantityAvailable += req.AdjustmentQuantity;
            if (req.AdjustmentQuantity > 0)
                batch.QuantityIn += req.AdjustmentQuantity;
            else
                batch.QuantityOut += Math.Abs(req.AdjustmentQuantity);
            batch.UpdatedAt = DateTime.UtcNow;
            batch.UpdatedByUserId = userId;
        }

        // Calculate running balance
        var lastLedger = await _db.StockLedgers
            .Where(l => l.TenantId == tenantId && l.StoreId == req.StoreId && l.ItemId == req.ItemId)
            .OrderByDescending(l => l.CreatedAt)
            .FirstOrDefaultAsync(ct);

        var balance = (lastLedger?.BalanceQuantity ?? 0) + req.AdjustmentQuantity;

        var entry = new StockLedger
        {
            Id               = Guid.NewGuid(),
            TenantId         = tenantId,
            StoreId          = req.StoreId,
            ItemId           = req.ItemId,
            StockBatchId     = req.StockBatchId,
            TransactionType  = "ADJUSTMENT",
            QuantityIn       = req.AdjustmentQuantity > 0 ? req.AdjustmentQuantity : 0,
            QuantityOut      = req.AdjustmentQuantity < 0 ? Math.Abs(req.AdjustmentQuantity) : 0,
            BalanceQuantity  = balance,
            UnitRate         = req.UnitRate,
            TotalValue       = Math.Round(Math.Abs(req.AdjustmentQuantity) * req.UnitRate, 2),
            Remarks          = req.Remarks,
            TransactionDate  = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc),
            CreatedAt        = DateTime.UtcNow,
            UpdatedAt        = DateTime.UtcNow,
            CreatedByUserId  = userId,
            UpdatedByUserId  = userId
        };
        _db.StockLedgers.Add(entry);
        await _db.SaveChangesAsync(ct);
        return entry;
    }

    public async Task<IReadOnlyList<ColdChainAlertDto>> GetColdChainAlertsAsync(Guid tenantId, CancellationToken ct)
    {
        return await _db.StockBatches
            .Include(b => b.Item)
            .Include(b => b.Store)
            .Where(b => b.TenantId == tenantId
                     && b.DeletedAt == null
                     && b.QuantityAvailable > 0
                     && b.RequiresColdStorage
                     && b.Store!.StoreType != "Refrigerated")
            .OrderBy(b => b.ExpiryDate ?? DateTime.MaxValue)
            .Select(b => new ColdChainAlertDto(
                b.Id,
                b.ItemId,
                b.Item != null ? b.Item.ItemName : string.Empty,
                b.StoreId,
                b.Store != null ? b.Store.StoreName : string.Empty,
                b.Store != null ? b.Store.StoreType : string.Empty,
                b.BatchNumber,
                b.ExpiryDate,
                b.QuantityAvailable))
            .ToListAsync(ct);
    }

    public async Task RecordReturnToVendorAsync(
        Guid tenantId, Guid userId,
        IEnumerable<PurchaseReturnItem> items,
        string returnNumber, Guid returnId,
        CancellationToken ct)
    {
        foreach (var item in items)
        {
            if (!item.StockBatchId.HasValue) continue;

            var batch = await _db.StockBatches
                .FirstOrDefaultAsync(b => b.Id == item.StockBatchId.Value && b.TenantId == tenantId, ct);
            if (batch == null) continue;

            batch.QuantityAvailable -= item.ReturnQuantity;
            batch.QuantityOut       += item.ReturnQuantity;
            batch.UpdatedAt          = DateTime.UtcNow;
            batch.UpdatedByUserId    = userId;

            var lastLedger = await _db.StockLedgers
                .Where(l => l.TenantId == tenantId && l.StoreId == batch.StoreId && l.ItemId == item.ItemId)
                .OrderByDescending(l => l.CreatedAt)
                .FirstOrDefaultAsync(ct);

            _db.StockLedgers.Add(new StockLedger
            {
                Id              = Guid.NewGuid(),
                TenantId        = tenantId,
                StoreId         = batch.StoreId,
                ItemId          = item.ItemId,
                StockBatchId    = item.StockBatchId,
                TransactionType = "RETURN_TO_VENDOR",
                ReferenceId     = returnId.ToString(),
                ReferenceNumber = returnNumber,
                QuantityIn      = 0,
                QuantityOut     = item.ReturnQuantity,
                BalanceQuantity = (lastLedger?.BalanceQuantity ?? batch.QuantityAvailable + item.ReturnQuantity) - item.ReturnQuantity,
                UnitRate        = item.PurchaseRate,
                TotalValue      = Math.Round(item.ReturnQuantity * item.PurchaseRate, 2),
                TransactionDate = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc),
                CreatedAt       = DateTime.UtcNow,
                UpdatedAt       = DateTime.UtcNow,
                CreatedByUserId = userId,
                UpdatedByUserId = userId,
            });
        }
        await _db.SaveChangesAsync(ct);
    }

    public async Task ReverseReturnToVendorAsync(
        Guid tenantId, Guid userId,
        IEnumerable<PurchaseReturnItem> items,
        string returnNumber, Guid returnId,
        CancellationToken ct)
    {
        foreach (var item in items)
        {
            if (!item.StockBatchId.HasValue) continue;

            var batch = await _db.StockBatches
                .FirstOrDefaultAsync(b => b.Id == item.StockBatchId.Value && b.TenantId == tenantId, ct);
            if (batch == null) continue;

            batch.QuantityAvailable += item.ReturnQuantity;
            batch.QuantityOut       -= item.ReturnQuantity;
            batch.UpdatedAt          = DateTime.UtcNow;
            batch.UpdatedByUserId    = userId;

            var lastLedger = await _db.StockLedgers
                .Where(l => l.TenantId == tenantId && l.StoreId == batch.StoreId && l.ItemId == item.ItemId)
                .OrderByDescending(l => l.CreatedAt)
                .FirstOrDefaultAsync(ct);

            _db.StockLedgers.Add(new StockLedger
            {
                Id              = Guid.NewGuid(),
                TenantId        = tenantId,
                StoreId         = batch.StoreId,
                ItemId          = item.ItemId,
                StockBatchId    = item.StockBatchId,
                TransactionType = "RETURN_TO_VENDOR_REVERSAL",
                ReferenceId     = returnId.ToString(),
                ReferenceNumber = returnNumber,
                QuantityIn      = item.ReturnQuantity,
                QuantityOut     = 0,
                BalanceQuantity = (lastLedger?.BalanceQuantity ?? 0) + item.ReturnQuantity,
                UnitRate        = item.PurchaseRate,
                TotalValue      = Math.Round(item.ReturnQuantity * item.PurchaseRate, 2),
                TransactionDate = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc),
                CreatedAt       = DateTime.UtcNow,
                UpdatedAt       = DateTime.UtcNow,
                CreatedByUserId = userId,
                UpdatedByUserId = userId,
            });
        }
        await _db.SaveChangesAsync(ct);
    }
}
