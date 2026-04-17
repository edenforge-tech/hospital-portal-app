using InventoryApi.Data;
using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Services;

/// <summary>
/// Nightly auto-reorder: find items below reorder_level and create
/// purchase requisitions (type = AutoReorder) for each store.
/// Called by the Azure Functions timer trigger.
/// </summary>
public interface IAutoReorderService
{
    Task RunAsync(Guid tenantId, CancellationToken ct);
    Task RunAllTenantsAsync(CancellationToken ct);
    Task SuppressItemAsync(Guid tenantId, Guid itemId, DateTime? suppressUntil, CancellationToken ct);
    Task EnableItemAsync(Guid tenantId, Guid itemId, CancellationToken ct);
}

public sealed class AutoReorderService : IAutoReorderService
{
    private readonly InventoryDbContext _db;
    private readonly IBranchProcurementPolicyService _policyService;
    private readonly ILogger<AutoReorderService> _logger;

    public AutoReorderService(
        InventoryDbContext db,
        IBranchProcurementPolicyService policyService,
        ILogger<AutoReorderService> logger)
    {
        _db = db;
        _policyService = policyService;
        _logger = logger;
    }

    public async Task RunAllTenantsAsync(CancellationToken ct)
    {
        // Get distinct tenant IDs from stores (inventory service doesn't hold the tenants table directly)
        var tenantIds = await _db.Stores
            .Where(s => s.DeletedAt == null && s.IsActive)
            .Select(s => s.TenantId)
            .Distinct()
            .ToListAsync(ct);

        foreach (var tenantId in tenantIds)
        {
            try { await RunAsync(tenantId, ct); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Auto-reorder failed for tenant {TenantId}", tenantId);
            }
        }

        // Refresh materialized stock summary view
        await _db.Database.ExecuteSqlRawAsync(
            "REFRESH MATERIALIZED VIEW CONCURRENTLY mv_inv_stock_summary", ct);
    }

    public async Task RunAsync(Guid tenantId, CancellationToken ct)
    {
        var stores = await _db.Stores
            .Where(s => s.TenantId == tenantId && s.DeletedAt == null && s.IsActive)
            .ToListAsync(ct);

        foreach (var store in stores)
        {
            var itemsBelow = await GetItemsBelowReorderAsync(tenantId, store.Id, ct);
            if (!itemsBelow.Any()) continue;

            var reqNumber = $"AR/{store.Id.ToString("N")[..6].ToUpper()}/{DateTime.UtcNow:yyyyMMddHHmm}";

            // Check if an active procurement policy exists for this store's branch
            Guid? policyId = null;
            if (store.BranchId.HasValue)
            {
                var policy = await _policyService.GetActiveAsync(tenantId, store.BranchId.Value, CancellationToken.None);
                policyId = policy?.Id;
            }

            var requisition = new PurchaseRequisition
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                StoreId = store.Id,
                RequisitionNumber = reqNumber,
                RequisitionDate = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc),
                RequisitionType = "AutoReorder",
                RequisitionStatus = "Pending",
                PolicyId = policyId,
                Remarks = $"Auto-generated on {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _db.PurchaseRequisitions.Add(requisition);

            foreach (var (item, currentStock) in itemsBelow)
            {
                _db.PurchaseRequisitionItems.Add(new PurchaseRequisitionItem
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    RequisitionId = requisition.Id,
                    ItemId = item.Id,
                    RequiredQuantity = item.ReorderQuantity,
                    CurrentStock = currentStock,
                    Remarks = $"Below reorder level ({item.ReorderLevel}). Current: {currentStock}",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
            }

            _logger.LogInformation(
                "AutoReorder: created {Req} for store {Store} with {Count} items",
                reqNumber, store.StoreName, itemsBelow.Count);
        }

        await _db.SaveChangesAsync(ct);
    }

    private async Task<List<(ItemMaster, decimal)>> GetItemsBelowReorderAsync(
        Guid tenantId, Guid storeId, CancellationToken ct)
    {
        var stockByItem = await _db.StockBatches
            .Where(b => b.TenantId == tenantId && b.StoreId == storeId
                     && b.DeletedAt == null && b.IsActive)
            .GroupBy(b => b.ItemId)
            .Select(g => new { ItemId = g.Key, Total = g.Sum(b => b.QuantityAvailable) })
            .ToListAsync(ct);

        var result = new List<(ItemMaster, decimal)>();

        foreach (var stock in stockByItem)
        {
            var item = await _db.Items.FindAsync([stock.ItemId], ct);
            if (item is null || item.ReorderLevel <= 0) continue;

            // Skip suppressed items (permanent or until-date not yet expired)
            if (item.ReorderSuppressed &&
                (item.ReorderSuppressedUntil is null || item.ReorderSuppressedUntil > DateTime.UtcNow))
                continue;

            if (stock.Total <= item.ReorderLevel)
            {
                item.LastReorderTriggeredAt = DateTime.UtcNow;
                result.Add((item, stock.Total));
            }
        }

        return result;
    }

    public async Task SuppressItemAsync(Guid tenantId, Guid itemId, DateTime? suppressUntil, CancellationToken ct)
    {
        var item = await _db.Items.FirstOrDefaultAsync(i => i.TenantId == tenantId && i.Id == itemId && i.DeletedAt == null, ct)
            ?? throw new KeyNotFoundException("Item not found.");

        item.ReorderSuppressed = true;
        item.ReorderSuppressedUntil = suppressUntil;
        item.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
    }

    public async Task EnableItemAsync(Guid tenantId, Guid itemId, CancellationToken ct)
    {
        var item = await _db.Items.FirstOrDefaultAsync(i => i.TenantId == tenantId && i.Id == itemId && i.DeletedAt == null, ct)
            ?? throw new KeyNotFoundException("Item not found.");

        item.ReorderSuppressed = false;
        item.ReorderSuppressedUntil = null;
        item.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
    }
}
