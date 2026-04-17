using InventoryApi.Data;
using InventoryApi.Models.DTOs;
using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Services;

public interface ISurgeryConsumableService
{
    Task<PagedResult<object>> ListConsumablesAsync(Guid tenantId, Guid? storeId, int page, int pageSize, CancellationToken ct);
    Task IssueSurgeryConsumablesAsync(Guid tenantId, Guid userId, IssueSurgeryConsumableRequest req, CancellationToken ct);
    Task<bool> CancelConsumableAsync(Guid tenantId, Guid consumableId, Guid userId, CancellationToken ct);
    // Staged OT/IOL flow
    Task<List<SurgeryConsumable>> PlanAsync(Guid tenantId, Guid userId, PlanConsumableRequest req, CancellationToken ct);
    Task<SurgeryConsumable> CheckStockAsync(Guid tenantId, Guid userId, Guid consumableId, CancellationToken ct);
    Task<SurgeryConsumable> IssueInOTAsync(Guid tenantId, Guid userId, Guid consumableId, CancellationToken ct);
    Task<SurgeryConsumable> RaiseEscalationAsync(Guid tenantId, Guid userId, Guid consumableId, string reason, CancellationToken ct);
    Task<SurgeryConsumable> ResolveEscalationAsync(Guid tenantId, Guid userId, Guid consumableId, CancellationToken ct);
    Task<SurgeryConsumable> PostReturnAsync(Guid tenantId, Guid userId, Guid consumableId, decimal returnedQty, CancellationToken ct);
    Task<SurgeryConsumable> CloseAsync(Guid tenantId, Guid userId, Guid consumableId, CancellationToken ct);
}

public sealed class SurgeryConsumableService : ISurgeryConsumableService
{
    private readonly InventoryDbContext _db;
    private readonly IStockService _stock;

    public SurgeryConsumableService(InventoryDbContext db, IStockService stock)
    {
        _db = db;
        _stock = stock;
    }

    public async Task<PagedResult<object>> ListConsumablesAsync(
        Guid tenantId, Guid? storeId, int page, int pageSize, CancellationToken ct)
    {
        var q = _db.SurgeryConsumables
            .Where(sc => sc.TenantId == tenantId && sc.DeletedAt == null);

        if (storeId.HasValue)
            q = q.Where(sc => sc.StoreId == storeId.Value);

        var total = await q.CountAsync(ct);
        var items = await q
            .OrderByDescending(sc => sc.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(sc => (object)new
            {
                sc.Id,
                sc.StoreId,
                sc.SurgeryId,
                sc.ItemId,
                IssuedQuantity = sc.Quantity,
                sc.ReturnedQuantity,
                sc.IolBillingMode,
                sc.PatientName,
                sc.PatientIpNo,
                sc.ConsumableStatus,
                sc.EscalationReason,
                sc.IssuedAt,
                sc.ClosedAt,
                sc.CreatedAt
            })
            .ToListAsync(ct);

        return new PagedResult<object>(items, total, page, pageSize);
    }

    public async Task IssueSurgeryConsumablesAsync(Guid tenantId, Guid userId, IssueSurgeryConsumableRequest req, CancellationToken ct)
    {
        foreach (var itemReq in req.Items)
        {
            var batch = await _stock.DeductFefoAsync(
                tenantId, req.StoreId, itemReq.ItemId, itemReq.Quantity,
                userId, req.IolBillingMode == "PatientSpecific" ? "PATIENT_IOL_ISSUE" : "OT_ISSUE",
                req.SurgeryId?.ToString() ?? string.Empty,
                $"OT-{req.SurgeryId?.ToString("N")[..8] ?? "NOSURG"}",
                ct);

            _db.SurgeryConsumables.Add(new SurgeryConsumable
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                StoreId = req.StoreId,
                SurgeryId = req.SurgeryId,
                ItemId = itemReq.ItemId,
                StockBatchId = itemReq.StockBatchId ?? batch.Id,
                IolBillingMode = req.IolBillingMode,
                PatientName = req.PatientName,
                PatientIpNo = req.PatientIpNo,
                Quantity = itemReq.Quantity,
                UnitRate = batch.PurchaseRate,
                Amount = Math.Round(itemReq.Quantity * batch.PurchaseRate, 2),
                Barcode = itemReq.Barcode,
                Remarks = itemReq.Remarks,
                ConsumableStatus = "IssuedInOT",
                IssuedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedByUserId = userId,
                UpdatedByUserId = userId
            });
        }

        await _db.SaveChangesAsync(ct);
    }

    public async Task<bool> CancelConsumableAsync(Guid tenantId, Guid consumableId, Guid userId, CancellationToken ct)
    {
        var consumable = await _db.SurgeryConsumables
            .FirstOrDefaultAsync(sc => sc.TenantId == tenantId && sc.Id == consumableId && sc.DeletedAt == null, ct);
        if (consumable is null || consumable.ConsumableStatus == "Cancelled") return false;

        if (consumable.ConsumableStatus == "IssuedInOT")
            await ReverseStockAsync(consumable, ct);

        consumable.ConsumableStatus = "Cancelled";
        consumable.DeletedAt = DateTime.UtcNow;
        consumable.UpdatedAt = DateTime.UtcNow;
        consumable.UpdatedByUserId = userId;
        await _db.SaveChangesAsync(ct);
        return true;
    }

    // ── Staged OT/IOL flow ────────────────────────────────────────────────────

    public async Task<List<SurgeryConsumable>> PlanAsync(
        Guid tenantId, Guid userId, PlanConsumableRequest req, CancellationToken ct)
    {
        var created = new List<SurgeryConsumable>();
        foreach (var item in req.Items)
        {
            var consumable = new SurgeryConsumable
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                StoreId = req.StoreId,
                SurgeryId = req.SurgeryId,
                ItemId = item.ItemId,
                StockBatchId = item.StockBatchId,
                IolBillingMode = req.IolBillingMode,
                PatientName = req.PatientName,
                PatientIpNo = req.PatientIpNo,
                Quantity = item.PlannedQuantity,
                UnitRate = 0,
                Amount = 0,
                Barcode = item.Barcode,
                Remarks = item.Remarks,
                ConsumableStatus = "Planned",
                IssuedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedByUserId = userId,
                UpdatedByUserId = userId
            };
            _db.SurgeryConsumables.Add(consumable);
            created.Add(consumable);
        }
        await _db.SaveChangesAsync(ct);
        return created;
    }

    public async Task<SurgeryConsumable> CheckStockAsync(
        Guid tenantId, Guid userId, Guid consumableId, CancellationToken ct)
    {
        var consumable = await GetOrThrowAsync(tenantId, consumableId, ct);
        if (consumable.ConsumableStatus != "Planned")
            throw new InvalidOperationException($"Expected status 'Planned', found '{consumable.ConsumableStatus}'.");

        var available = await _db.StockBatches
            .Where(b => b.TenantId == tenantId && b.StoreId == consumable.StoreId
                     && b.ItemId == consumable.ItemId && b.DeletedAt == null && b.IsActive)
            .SumAsync(b => (decimal?)b.QuantityAvailable, ct) ?? 0m;

        consumable.ConsumableStatus = available >= consumable.Quantity ? "StockAllocated" : "StockCheckPending";
        consumable.UpdatedAt = DateTime.UtcNow;
        consumable.UpdatedByUserId = userId;
        await _db.SaveChangesAsync(ct);
        return consumable;
    }

    public async Task<SurgeryConsumable> IssueInOTAsync(
        Guid tenantId, Guid userId, Guid consumableId, CancellationToken ct)
    {
        var consumable = await GetOrThrowAsync(tenantId, consumableId, ct);
        if (consumable.ConsumableStatus != "StockAllocated")
            throw new InvalidOperationException($"Expected status 'StockAllocated', found '{consumable.ConsumableStatus}'.");

        var batch = await _stock.DeductFefoAsync(
            tenantId, consumable.StoreId, consumable.ItemId, consumable.Quantity,
            userId, consumable.IolBillingMode == "PatientSpecific" ? "PATIENT_IOL_ISSUE" : "OT_ISSUE",
            consumable.SurgeryId?.ToString() ?? string.Empty,
            $"OT-{consumable.SurgeryId?.ToString("N")[..8] ?? "NOSURG"}",
            ct);

        consumable.StockBatchId = batch.Id;
        consumable.UnitRate = batch.PurchaseRate;
        consumable.Amount = Math.Round(consumable.Quantity * batch.PurchaseRate, 2);
        consumable.ConsumableStatus = "IssuedInOT";
        consumable.IssuedAt = DateTime.UtcNow;
        consumable.UpdatedAt = DateTime.UtcNow;
        consumable.UpdatedByUserId = userId;
        await _db.SaveChangesAsync(ct);
        return consumable;
    }

    public async Task<SurgeryConsumable> RaiseEscalationAsync(
        Guid tenantId, Guid userId, Guid consumableId, string reason, CancellationToken ct)
    {
        var consumable = await GetOrThrowAsync(tenantId, consumableId, ct);
        if (consumable.ConsumableStatus != "StockCheckPending")
            throw new InvalidOperationException($"Expected status 'StockCheckPending', found '{consumable.ConsumableStatus}'.");

        consumable.ConsumableStatus = "EscalationRaised";
        consumable.EscalationReason = reason;
        consumable.UpdatedAt = DateTime.UtcNow;
        consumable.UpdatedByUserId = userId;
        await _db.SaveChangesAsync(ct);
        return consumable;
    }

    public async Task<SurgeryConsumable> ResolveEscalationAsync(
        Guid tenantId, Guid userId, Guid consumableId, CancellationToken ct)
    {
        var consumable = await GetOrThrowAsync(tenantId, consumableId, ct);
        if (consumable.ConsumableStatus != "EscalationRaised")
            throw new InvalidOperationException($"Expected status 'EscalationRaised', found '{consumable.ConsumableStatus}'.");

        consumable.ConsumableStatus = "StockAllocated";
        consumable.UpdatedAt = DateTime.UtcNow;
        consumable.UpdatedByUserId = userId;
        await _db.SaveChangesAsync(ct);
        return consumable;
    }

    public async Task<SurgeryConsumable> PostReturnAsync(
        Guid tenantId, Guid userId, Guid consumableId, decimal returnedQty, CancellationToken ct)
    {
        var consumable = await GetOrThrowAsync(tenantId, consumableId, ct);
        if (consumable.ConsumableStatus != "IssuedInOT")
            throw new InvalidOperationException($"Expected status 'IssuedInOT', found '{consumable.ConsumableStatus}'.");
        if (returnedQty <= 0 || returnedQty > consumable.Quantity)
            throw new ArgumentException("Returned quantity must be > 0 and ≤ issued quantity.");

        // Reverse the returned portion in the stock batch
        if (consumable.StockBatchId.HasValue)
        {
            var batch = await _db.StockBatches.FindAsync([consumable.StockBatchId.Value], ct);
            if (batch != null)
            {
                batch.QuantityOut -= returnedQty;
                batch.QuantityAvailable += returnedQty;
                batch.UpdatedAt = DateTime.UtcNow;
            }
        }

        consumable.ReturnedQuantity = returnedQty;
        consumable.ReturnedAt = DateTime.UtcNow;
        consumable.ConsumableStatus = "ReturnPosted";
        consumable.UpdatedAt = DateTime.UtcNow;
        consumable.UpdatedByUserId = userId;
        await _db.SaveChangesAsync(ct);
        return consumable;
    }

    public async Task<SurgeryConsumable> CloseAsync(
        Guid tenantId, Guid userId, Guid consumableId, CancellationToken ct)
    {
        var consumable = await GetOrThrowAsync(tenantId, consumableId, ct);
        if (consumable.ConsumableStatus is not ("IssuedInOT" or "ReturnPosted"))
            throw new InvalidOperationException($"Cannot close from status '{consumable.ConsumableStatus}'.");

        consumable.ConsumableStatus = "Closed";
        consumable.ClosedAt = DateTime.UtcNow;
        consumable.UpdatedAt = DateTime.UtcNow;
        consumable.UpdatedByUserId = userId;
        await _db.SaveChangesAsync(ct);
        return consumable;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private async Task<SurgeryConsumable> GetOrThrowAsync(Guid tenantId, Guid consumableId, CancellationToken ct)
        => await _db.SurgeryConsumables
               .FirstOrDefaultAsync(sc => sc.TenantId == tenantId && sc.Id == consumableId && sc.DeletedAt == null, ct)
           ?? throw new KeyNotFoundException("Surgery consumable not found.");

    private async Task ReverseStockAsync(SurgeryConsumable consumable, CancellationToken ct)
    {
        if (!consumable.StockBatchId.HasValue) return;
        var batch = await _db.StockBatches.FindAsync([consumable.StockBatchId.Value], ct);
        if (batch is null) return;
        batch.QuantityOut -= consumable.Quantity - consumable.ReturnedQuantity;
        batch.QuantityAvailable += consumable.Quantity - consumable.ReturnedQuantity;
        batch.UpdatedAt = DateTime.UtcNow;
    }
}
