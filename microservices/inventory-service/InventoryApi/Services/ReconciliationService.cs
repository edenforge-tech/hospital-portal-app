using InventoryApi.Data;
using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Services;

/// <summary>
/// Reconciles vendor invoices vs payments.
/// Called from the VendorFunctions HTTP endpoint for the reconciliation report.
/// </summary>
public interface IReconciliationService
{
    Task<VendorReconciliationReport> GetVendorReportAsync(Guid tenantId, Guid vendorId, CancellationToken ct);
}

public record VendorReconciliationReport(
    Guid VendorId,
    string VendorName,
    decimal TotalInvoiced,
    decimal TotalPaid,
    decimal OutstandingBalance,
    List<ReconciliationLine> Lines
);

public record ReconciliationLine(
    string EntryType,
    string ReferenceNumber,
    DateTime EntryDate,
    decimal Debit,
    decimal Credit,
    decimal RunningBalance,
    string? Remarks
);

public sealed class ReconciliationService : IReconciliationService
{
    private readonly InventoryDbContext _db;

    public ReconciliationService(InventoryDbContext db) => _db = db;

    public async Task<VendorReconciliationReport> GetVendorReportAsync(Guid tenantId, Guid vendorId, CancellationToken ct)
    {
        var vendor = await _db.Vendors.FirstOrDefaultAsync(
            v => v.Id == vendorId && v.TenantId == tenantId && v.DeletedAt == null, ct)
            ?? throw new InvalidOperationException("Vendor not found.");

        var ledger = await _db.VendorOutstandingLedgers
            .Where(l => l.TenantId == tenantId && l.VendorId == vendorId && l.DeletedAt == null)
            .OrderBy(l => l.EntryDate).ThenBy(l => l.CreatedAt)
            .ToListAsync(ct);

        var lines = ledger.Select(l => new ReconciliationLine(
            l.EntryType,
            l.ReferenceNumber ?? "-",
            l.EntryDate,
            l.Debit,
            l.Credit,
            l.RunningBalance,
            l.Remarks
        )).ToList();

        var totalInvoiced = ledger.Where(l => l.EntryType == "Invoice").Sum(l => l.Debit);
        var totalPaid     = ledger.Where(l => l.EntryType == "Payment").Sum(l => l.Credit);

        return new VendorReconciliationReport(
            vendorId, vendor.Name, totalInvoiced, totalPaid,
            vendor.OutstandingBalance, lines);
    }
}
