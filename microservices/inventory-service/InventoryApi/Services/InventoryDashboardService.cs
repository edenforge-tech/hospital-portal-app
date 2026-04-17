using InventoryApi.Data;
using InventoryApi.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Services;

public interface IInventoryDashboardService
{
    Task<InventoryDashboardSummary> GetSummaryAsync(Guid tenantId, CancellationToken ct);
}

public sealed class InventoryDashboardService : IInventoryDashboardService
{
    private readonly InventoryDbContext _db;

    public InventoryDashboardService(InventoryDbContext db) => _db = db;

    public async Task<InventoryDashboardSummary> GetSummaryAsync(Guid tenantId, CancellationToken ct)
    {
        // Run counts in parallel
        var pendingRequisitionsTask = _db.PurchaseRequisitions
            .CountAsync(r => r.TenantId == tenantId && r.RequisitionStatus == "Pending" && r.DeletedAt == null, ct);

        var openRfqsTask = _db.RfqHeaders
            .CountAsync(r => r.TenantId == tenantId && r.RfqStatus != "Awarded" && r.RfqStatus != "Cancelled"
                          && r.DeletedAt == null, ct);

        var pendingPoTask = _db.PurchaseOrders
            .CountAsync(p => p.TenantId == tenantId
                          && p.PoStatus != "FullyReceived" && p.PoStatus != "Closed"
                          && p.PoStatus != "Cancelled" && p.PoStatus != "Rejected"
                          && p.DeletedAt == null, ct);

        // Low stock: items where total available < reorder level
        var lowStockTask = _db.Items
            .Where(i => i.TenantId == tenantId && i.DeletedAt == null && i.ReorderLevel > 0)
            .Select(i => new
            {
                i.Id,
                i.ReorderLevel,
                Available = _db.StockBatches
                    .Where(b => b.TenantId == tenantId && b.ItemId == i.Id && b.DeletedAt == null && b.IsActive)
                    .Sum(b => (decimal?)b.QuantityAvailable) ?? 0m
            })
            .CountAsync(x => x.Available < x.ReorderLevel, ct);

        // This month PO spend (fully received or closed POs)
        var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var thisMonthSpendTask = _db.PurchaseOrders
            .Where(p => p.TenantId == tenantId && p.DeletedAt == null
                     && (p.PoStatus == "FullyReceived" || p.PoStatus == "Closed")
                     && p.ReceivedAt >= monthStart)
            .SumAsync(p => (decimal?)p.NetAmount, ct);

        // On-time delivery rate (last 90 days)
        var since90 = DateTime.UtcNow.AddDays(-90);
        var vendorPerfTask = _db.VendorPerformanceRecords
            .Where(v => v.TenantId == tenantId && v.DeletedAt == null && v.CreatedAt >= since90)
            .Select(v => (int?)(v.OnTimeDelivery ? 1 : 0))
            .ToListAsync(ct);

        await Task.WhenAll(pendingRequisitionsTask, openRfqsTask, pendingPoTask,
                           lowStockTask, thisMonthSpendTask, vendorPerfTask);

        var perfList = vendorPerfTask.Result;
        decimal onTimeRate = perfList.Count > 0
            ? Math.Round(perfList.Sum(x => (decimal)x!.Value) / perfList.Count * 100m, 1)
            : 100m;

        return new InventoryDashboardSummary(
            PendingRequisitions: pendingRequisitionsTask.Result,
            OpenRfqs:            openRfqsTask.Result,
            PendingPoCount:      pendingPoTask.Result,
            LowStockCount:       lowStockTask.Result,
            ThisMonthPoSpend:    thisMonthSpendTask.Result ?? 0m,
            OnTimeDeliveryRate:  onTimeRate
        );
    }
}
