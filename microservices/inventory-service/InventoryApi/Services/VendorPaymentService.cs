using InventoryApi.Data;
using InventoryApi.Models.DTOs;
using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Services;

public interface IVendorPaymentService
{
    Task<VendorPayment> RecordPaymentAsync(Guid tenantId, Guid userId,
        Guid vendorId, Guid? invoiceId, string paymentRef, DateTime paymentDate,
        decimal amount, string paymentMode, string? chequeNumber, string? bankTxId,
        string? remarks, CancellationToken ct);
    Task<PagedResult<VendorPaymentDto>> ListPaymentsAsync(Guid tenantId, Guid vendorId, int page, int pageSize, CancellationToken ct);
}

public sealed class VendorPaymentService : IVendorPaymentService
{
    private readonly InventoryDbContext _db;

    public VendorPaymentService(InventoryDbContext db) => _db = db;

    public async Task<VendorPayment> RecordPaymentAsync(
        Guid tenantId, Guid userId,
        Guid vendorId, Guid? invoiceId, string paymentRef, DateTime paymentDate,
        decimal amount, string paymentMode, string? chequeNumber, string? bankTxId,
        string? remarks, CancellationToken ct)
    {
        var payment = new VendorPayment
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            VendorId = vendorId,
            InvoiceId = invoiceId,
            PaymentReference = paymentRef,
            PaymentDate = paymentDate.Date,
            Amount = amount,
            PaymentMode = paymentMode,
            ChequeNumber = chequeNumber,
            BankTransactionId = bankTxId,
            Remarks = remarks,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedByUserId = userId,
            UpdatedByUserId = userId
        };
        _db.VendorPayments.Add(payment);

        // Update invoice paid/balance amounts
        if (invoiceId.HasValue)
        {
            var invoice = await _db.PurchaseInvoices.FindAsync([invoiceId.Value], ct);
            if (invoice is not null)
            {
                invoice.PaidAmount += amount;
                invoice.BalanceAmount = Math.Max(0, invoice.NetAmount - invoice.PaidAmount);
                invoice.UpdatedAt = DateTime.UtcNow;
            }
        }

        // Update vendor outstanding balance
        var vendor = await _db.Vendors.FindAsync([vendorId], ct);
        if (vendor is not null)
        {
            vendor.OutstandingBalance = Math.Max(0, vendor.OutstandingBalance - amount);
            vendor.UpdatedAt = DateTime.UtcNow;
        }

        // Append to outstanding ledger
        var lastLedger = await _db.VendorOutstandingLedgers
            .Where(l => l.TenantId == tenantId && l.VendorId == vendorId)
            .OrderByDescending(l => l.CreatedAt)
            .FirstOrDefaultAsync(ct);

        _db.VendorOutstandingLedgers.Add(new VendorOutstandingLedger
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            VendorId = vendorId,
            PaymentId = payment.Id,
            InvoiceId = invoiceId,
            EntryType = "Payment",
            Debit = 0,
            Credit = amount,
            RunningBalance = (lastLedger?.RunningBalance ?? 0) - amount,
            ReferenceNumber = paymentRef,
            EntryDate = paymentDate.Date,
            Remarks = remarks,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedByUserId = userId
        });

        await _db.SaveChangesAsync(ct);
        return payment;
    }

    public async Task<PagedResult<VendorPaymentDto>> ListPaymentsAsync(
        Guid tenantId, Guid vendorId, int page, int pageSize, CancellationToken ct)
    {
        var q = _db.VendorPayments
            .Where(p => p.TenantId == tenantId && p.VendorId == vendorId && p.DeletedAt == null);

        var total = await q.CountAsync(ct);
        var items = await q
            .OrderByDescending(p => p.PaymentDate)
            .ThenByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(p => new VendorPaymentDto(
                p.Id, p.VendorId, p.InvoiceId,
                p.PaymentReference, p.PaymentDate,
                p.Amount, p.PaymentMode,
                p.ChequeNumber, p.BankTransactionId,
                p.Remarks, p.CreatedAt))
            .ToListAsync(ct);

        return new PagedResult<VendorPaymentDto>(items, total, page, pageSize);
    }
}
