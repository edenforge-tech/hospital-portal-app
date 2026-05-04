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
    Task ReversePaymentAsync(Guid tenantId, Guid paymentId, string reason, Guid reversedByUserId, CancellationToken ct);
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
        // Prevent duplicate payment references within the same tenant
        var isDuplicate = await _db.VendorPayments.AnyAsync(
            p => p.TenantId == tenantId &&
                 p.PaymentReference == paymentRef &&
                 p.DeletedAt == null, ct);
        if (isDuplicate)
            throw new InvalidOperationException(
                $"Payment reference '{paymentRef}' already exists for this tenant.");

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
                p.Remarks, p.CreatedAt,
                // NEFT / RTGS
                p.UtrNumber, p.BankName, p.AccountNumber, p.IfscCode,
                // Cheque
                p.ChequeNumber, p.ChequeDate, p.ExpectedClearanceDate,
                // UPI
                p.UpiId, p.UpiApp,
                // Cash
                p.CashReceiptNumber, p.CashReceivedBy,
                // Legacy
                p.BankTransactionId,
                // Attachment
                p.AttachmentUrl, p.AttachmentFilename, p.AttachmentSizeKb,
                // Reversal metadata
                p.DeletedAt, p.UpdatedByUserId,
                // Settlement link
                (Guid?)null))
            .ToListAsync(ct);

        return new PagedResult<VendorPaymentDto>(items, total, page, pageSize);
    }

    public async Task ReversePaymentAsync(
        Guid tenantId, Guid paymentId, string reason, Guid reversedByUserId, CancellationToken ct)
    {
        var payment = await _db.VendorPayments
            .FirstOrDefaultAsync(p => p.Id == paymentId && p.TenantId == tenantId && p.DeletedAt == null, ct)
            ?? throw new InvalidOperationException("Payment not found or already reversed.");

        var now = DateTime.UtcNow;

        // Soft-delete the original payment, appending reversal reason
        payment.DeletedAt       = now;
        payment.UpdatedAt       = now;
        payment.UpdatedByUserId = reversedByUserId;
        payment.Remarks         = string.IsNullOrWhiteSpace(payment.Remarks)
            ? $"[REVERSED] {reason}"
            : $"{payment.Remarks} | [REVERSED] {reason}";

        // Reverse the invoice balance if linked
        if (payment.InvoiceId.HasValue)
        {
            var invoice = await _db.PurchaseInvoices.FindAsync([payment.InvoiceId.Value], ct);
            if (invoice is not null)
            {
                invoice.PaidAmount    = Math.Max(0, invoice.PaidAmount - payment.Amount);
                invoice.BalanceAmount = invoice.NetAmount - invoice.PaidAmount;
                invoice.UpdatedAt     = now;
            }
        }

        // Reverse vendor outstanding balance
        var vendor = await _db.Vendors.FindAsync([payment.VendorId], ct);
        if (vendor is not null)
        {
            vendor.OutstandingBalance += payment.Amount;
            vendor.UpdatedAt           = now;
        }

        // Append reversal ledger entry
        var lastLedger = await _db.VendorOutstandingLedgers
            .Where(l => l.TenantId == tenantId && l.VendorId == payment.VendorId)
            .OrderByDescending(l => l.CreatedAt)
            .FirstOrDefaultAsync(ct);

        _db.VendorOutstandingLedgers.Add(new VendorOutstandingLedger
        {
            Id               = Guid.NewGuid(),
            TenantId         = tenantId,
            VendorId         = payment.VendorId,
            PaymentId        = payment.Id,
            InvoiceId        = payment.InvoiceId,
            EntryType        = "PaymentReversal",
            Debit            = payment.Amount,
            Credit           = 0,
            RunningBalance   = (lastLedger?.RunningBalance ?? 0) + payment.Amount,
            ReferenceNumber  = payment.PaymentReference,
            EntryDate        = now.Date,
            Remarks          = reason,
            CreatedAt        = now,
            UpdatedAt        = now,
            CreatedByUserId  = reversedByUserId
        });

        await _db.SaveChangesAsync(ct);
    }
}
