using InventoryApi.Data;
using InventoryApi.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Services;

public interface IGstSummaryService
{
    Task<IReadOnlyList<GstSummaryByRateDto>> GetByMonthAsync(Guid tenantId, Guid? storeId, int year, int month, CancellationToken ct);
    Task<IReadOnlyList<GstSummaryByRateDto>> GetGstr3bDataAsync(Guid tenantId, int year, int month, CancellationToken ct);
}

public sealed class GstSummaryService : IGstSummaryService
{
    private readonly InventoryDbContext _db;

    public GstSummaryService(InventoryDbContext db) => _db = db;

    public async Task<IReadOnlyList<GstSummaryByRateDto>> GetByMonthAsync(
        Guid tenantId, Guid? storeId, int year, int month, CancellationToken ct)
    {
        var from = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
        var to   = from.AddMonths(1);

        var q = _db.InvoiceGstSummaries
            .Include(g => g.Invoice)
            .Where(g => g.TenantId == tenantId
                     && g.DeletedAt == null
                     && g.Invoice!.InvoiceDate >= from
                     && g.Invoice!.InvoiceDate <  to);

        if (storeId.HasValue)
            q = q.Where(g => g.Invoice!.StoreId == storeId.Value);

        var rows = await q.ToListAsync(ct);

        return rows
            .GroupBy(r => r.GstRate)
            .Select(g => new GstSummaryByRateDto(
                from,
                g.Key,
                g.Sum(r => r.TaxableAmount),
                g.Sum(r => r.CgstAmount),
                g.Sum(r => r.SgstAmount),
                g.Sum(r => r.IgstAmount),
                g.Sum(r => r.TotalGstAmount)
            ))
            .OrderBy(r => r.GstRate)
            .ToList();
    }

    public async Task<IReadOnlyList<GstSummaryByRateDto>> GetGstr3bDataAsync(
        Guid tenantId, int year, int month, CancellationToken ct)
    {
        // GSTR-3B is the consolidated purchase GST summary (all stores) for a given month
        return await GetByMonthAsync(tenantId, storeId: null, year, month, ct);
    }
}
