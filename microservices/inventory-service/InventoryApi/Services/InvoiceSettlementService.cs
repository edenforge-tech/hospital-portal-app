using InventoryApi.Data;
using InventoryApi.Models.DTOs;
using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Services;

public interface IInvoiceSettlementService
{
    Task<PagedResult<InvoiceSettlementDto>> ListAsync(Guid tenantId, string? status, int page, int pageSize, CancellationToken ct);
    Task<InvoiceSettlementDto?> GetAsync(Guid tenantId, Guid id, CancellationToken ct);
    Task<InvoiceSettlement> CreateFromBillTransferAsync(Guid tenantId, Guid billTransferId, Guid userId, CancellationToken ct);
    Task<InvoiceSettlementDto?> RecordPaymentAsync(Guid tenantId, Guid id, Guid userId, RecordSettlementPaymentRequest req, CancellationToken ct);
    Task<InvoiceSettlementDto?> ApplyCreditNoteAsync(Guid tenantId, Guid id, Guid userId, ApplyCreditNoteRequest req, CancellationToken ct);
    Task<InvoiceSettlementDto?> HoldAsync(Guid tenantId, Guid id, Guid userId, string reason, CancellationToken ct);
    Task<InvoiceSettlementDto?> ResumeAsync(Guid tenantId, Guid id, Guid userId, CancellationToken ct);
    Task<InvoiceSettlementDto?> CancelAsync(Guid tenantId, Guid id, Guid userId, string reason, CancellationToken ct);
    Task<InvoiceSettlementDto?> WriteOffAsync(Guid tenantId, Guid id, Guid userId, string reason, CancellationToken ct);

    /// <summary>
    /// Called nightly by SettlementOverdueTimerFunction.
    /// Transitions all Pending / PartiallyPaid settlements whose DueDate &lt; UTC now to Overdue.
    /// Returns the number of rows updated.
    /// </summary>
    Task<int> MarkOverdueAsync(CancellationToken ct);

    /// <summary>Ordered immutable audit trail for a settlement.</summary>
    Task<List<SettlementEventLogDto>> GetEventLogsAsync(Guid tenantId, Guid settlementId, CancellationToken ct);
}

public sealed class InvoiceSettlementService : IInvoiceSettlementService
{
    private readonly InventoryDbContext _db;

    public InvoiceSettlementService(InventoryDbContext db) => _db = db;

    // â”€â”€ List â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    public async Task<PagedResult<InvoiceSettlementDto>> ListAsync(
        Guid tenantId, string? status, int page, int pageSize, CancellationToken ct)
    {
        var q = _db.InvoiceSettlements
            .Include(s => s.Vendor)
            .Include(s => s.BillTransfer).ThenInclude(b => b!.Grn)
            .Include(s => s.BillTransfer).ThenInclude(b => b!.Invoice)
            .Include(s => s.Payments).ThenInclude(p => p.Payment)
            .Where(s => s.TenantId == tenantId && s.DeletedAt == null);

        if (!string.IsNullOrWhiteSpace(status))
            q = q.Where(s => s.Status == status);

        var total = await q.CountAsync(ct);
        var items = await q
            .OrderByDescending(s => s.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<InvoiceSettlementDto>(items.Select(ToDto).ToList(), total, page, pageSize);
    }

    // â”€â”€ Get â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    public async Task<InvoiceSettlementDto?> GetAsync(Guid tenantId, Guid id, CancellationToken ct)
    {
        var s = await FetchAsync(tenantId, id, ct);
        return s is null ? null : ToDto(s);
    }

    // â”€â”€ Create from BillTransfer (called by BillTransferService on L2 approve) â”€â”€
    public async Task<InvoiceSettlement> CreateFromBillTransferAsync(
        Guid tenantId, Guid billTransferId, Guid userId, CancellationToken ct)
    {
        var bt = await _db.BillTransfers
            .Include(b => b.Invoice)
            .FirstOrDefaultAsync(b => b.Id == billTransferId && b.TenantId == tenantId, ct)
            ?? throw new InvalidOperationException("Bill Transfer not found.");

        // Compute credit-note adjustment from settled purchase returns linked to this invoice
        var creditNoteAdj = await _db.PurchaseReturns
            .Where(r => r.TenantId == tenantId
                     && r.InvoiceId == bt.InvoiceId
                     && r.DeletedAt == null
                     && r.SettlementStatus == "CreditNoteReceived")
            .SumAsync(r => (decimal?)r.CreditNoteAmount ?? 0m, ct);

        var gross = bt.InvoiceTotalAmount;
        var tcs   = bt.TcsAmount;
        // Net = Gross âˆ’ CreditNoteAdjustment âˆ’ TCS
        //   (TCS is deducted because the vendor already collected it from the hospital as buyer)
        var net   = gross - creditNoteAdj - tcs;

        var settlement = new InvoiceSettlement
        {
            Id                    = Guid.NewGuid(),
            TenantId              = tenantId,
            BillTransferId        = billTransferId,
            VendorId              = bt.VendorId,
            GrossAmount           = gross,
            DebitNoteAdjustment   = creditNoteAdj,   // field name legacy; semantically = CreditNoteAdjustment
            TcsAmount             = tcs,
            NetPayableAmount      = net,
            AmountPaid            = 0,
            BalanceRemaining      = net,
            Status                = "Pending",
            DueDate               = DateTime.UtcNow.AddDays(30),
            CreatedAt             = DateTime.UtcNow,
            UpdatedAt             = DateTime.UtcNow,
            CreatedByUserId       = userId,
            UpdatedByUserId       = userId
        };

        _db.InvoiceSettlements.Add(settlement);
        AppendEvent(settlement.Id, tenantId, "â€”", "Pending", "Created", null, null, userId, "user");
        await _db.SaveChangesAsync(ct);
        return settlement;
    }

    // â”€â”€ Record Payment â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    public async Task<InvoiceSettlementDto?> RecordPaymentAsync(
        Guid tenantId, Guid id, Guid userId, RecordSettlementPaymentRequest req, CancellationToken ct)
    {
        var s = await FetchAsync(tenantId, id, ct);
        if (s is null) return null;

        if (s.Status is not ("Pending" or "PartiallyPaid" or "Overdue"))
            throw new InvalidOperationException($"Cannot record a payment for a settlement in '{s.Status}' state.");

        if (req.Amount <= 0)
            throw new ArgumentException("Payment amount must be greater than zero.");

        if (req.Amount > s.BalanceRemaining)
            throw new InvalidOperationException(
                $"Payment amount ({req.Amount:F2}) exceeds balance remaining ({s.BalanceRemaining:F2}).");

        var prevStatus = s.Status;

        // Create a VendorPayment record
        var payment = new VendorPayment
        {
            Id                = Guid.NewGuid(),
            TenantId          = tenantId,
            VendorId          = s.VendorId,
            InvoiceId         = s.BillTransfer?.InvoiceId,
            PaymentReference  = req.TransactionReference,
            PaymentDate       = req.PaymentDate,
            Amount            = req.Amount,
            PaymentMode           = req.PaymentMethod,
            UtrNumber             = req.UtrNumber,
            BankName              = req.BankName,
            AccountNumber         = req.AccountNumber,
            IfscCode              = req.IfscCode,
            ChequeDate            = req.ChequeDate,
            ExpectedClearanceDate = req.ExpectedClearanceDate,
            UpiId                 = req.UpiId,
            UpiApp                = req.UpiApp,
            CashReceiptNumber     = req.CashReceiptNumber,
            CashReceivedBy        = req.CashReceivedBy,
            Remarks               = req.Remarks,
            // Attachment is linked separately via the upload endpoint
            CreatedAt             = DateTime.UtcNow,
            UpdatedAt         = DateTime.UtcNow,
            CreatedByUserId   = userId,
            UpdatedByUserId   = userId,
            Status            = "active"
        };
        _db.VendorPayments.Add(payment);

        // Link via SettlementPayment
        var alloc = new SettlementPayment
        {
            Id                = Guid.NewGuid(),
            TenantId          = tenantId,
            SettlementId      = s.Id,
            PaymentId         = payment.Id,
            AmountAllocated   = req.Amount,
            AllocationType    = "Payment",
            Reference         = req.TransactionReference,
            AppliedAt         = req.PaymentDate,
            CreatedAt         = DateTime.UtcNow,
            UpdatedAt         = DateTime.UtcNow,
            CreatedByUserId   = userId,
            UpdatedByUserId   = userId
        };
        _db.SettlementPayments.Add(alloc);

        s.AmountPaid       += req.Amount;
        s.BalanceRemaining -= req.Amount;
        s.UpdatedAt         = DateTime.UtcNow;
        s.UpdatedByUserId   = userId;

        string newStatus;
        if (s.BalanceRemaining <= 0)
        {
            newStatus    = "FullySettled";
            s.Status     = newStatus;
            s.SettledAt  = DateTime.UtcNow;
        }
        else
        {
            newStatus = "PartiallyPaid";
            s.Status  = newStatus;
        }

        AppendEvent(s.Id, tenantId, prevStatus, newStatus, "PaymentRecorded",
            $"{req.PaymentMethod}: {req.TransactionReference}", req.Amount, userId, "user");

        await _db.SaveChangesAsync(ct);
        return await GetAsync(tenantId, id, ct);
    }

    // â”€â”€ Apply Credit Note â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    public async Task<InvoiceSettlementDto?> ApplyCreditNoteAsync(
        Guid tenantId, Guid id, Guid userId, ApplyCreditNoteRequest req, CancellationToken ct)
    {
        var s = await FetchAsync(tenantId, id, ct);
        if (s is null) return null;

        if (s.Status is not ("Pending" or "PartiallyPaid" or "Overdue"))
            throw new InvalidOperationException($"Cannot apply a credit note for a settlement in '{s.Status}' state.");

        var ret = await _db.PurchaseReturns
            .FirstOrDefaultAsync(r => r.Id == req.PurchaseReturnId
                                   && r.TenantId == tenantId
                                   && r.DeletedAt == null, ct)
            ?? throw new InvalidOperationException("Purchase Return not found.");

        if (ret.SettlementStatus != "CreditNoteReceived")
            throw new InvalidOperationException("Credit note has not been received for this return.");

        var creditAmount = ret.CreditNoteAmount ?? ret.NetReturnAmount;
        if (creditAmount <= 0)
            throw new InvalidOperationException("Credit note amount must be greater than zero.");

        var effective  = Math.Min(creditAmount, s.BalanceRemaining);
        var prevStatus = s.Status;

        var alloc = new SettlementPayment
        {
            Id                = Guid.NewGuid(),
            TenantId          = tenantId,
            SettlementId      = s.Id,
            PaymentId         = null,
            AmountAllocated   = effective,
            AllocationType    = "CreditNote",
            Reference         = ret.Id.ToString(),
            AppliedAt         = DateTime.UtcNow,
            CreatedAt         = DateTime.UtcNow,
            UpdatedAt         = DateTime.UtcNow,
            CreatedByUserId   = userId,
            UpdatedByUserId   = userId
        };
        _db.SettlementPayments.Add(alloc);

        // Update the settlement's adjustment and recalculate
        s.DebitNoteAdjustment += effective;
        s.NetPayableAmount     = s.GrossAmount - s.DebitNoteAdjustment - s.TcsAmount;
        s.AmountPaid          += effective;
        s.BalanceRemaining    -= effective;
        s.UpdatedAt            = DateTime.UtcNow;
        s.UpdatedByUserId      = userId;

        string newStatus;
        if (s.BalanceRemaining <= 0)
        {
            newStatus   = "FullySettled";
            s.Status    = newStatus;
            s.SettledAt = DateTime.UtcNow;
        }
        else if (s.AmountPaid > 0)
        {
            newStatus = "PartiallyPaid";
            s.Status  = newStatus;
        }
        else
        {
            newStatus = s.Status;
        }

        // Mark return as settled
        ret.SettlementStatus = "Settled";
        ret.UpdatedAt        = DateTime.UtcNow;

        AppendEvent(s.Id, tenantId, prevStatus, newStatus, "CreditNoteApplied",
            $"Return {ret.Id}", effective, userId, "user");

        await _db.SaveChangesAsync(ct);
        return await GetAsync(tenantId, id, ct);
    }

    // â”€â”€ Hold â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    public async Task<InvoiceSettlementDto?> HoldAsync(
        Guid tenantId, Guid id, Guid userId, string reason, CancellationToken ct)
    {
        var s = await FetchAsync(tenantId, id, ct);
        if (s is null) return null;

        if (s.Status is not ("Pending" or "PartiallyPaid" or "Overdue"))
            throw new InvalidOperationException($"Cannot hold a settlement in '{s.Status}' state.");

        var prevStatus    = s.Status;
        s.Status          = "OnHold";
        s.OnHoldReason    = reason;
        s.UpdatedAt       = DateTime.UtcNow;
        s.UpdatedByUserId = userId;

        AppendEvent(s.Id, tenantId, prevStatus, "OnHold", "HoldPlaced", reason, null, userId, "user");
        await _db.SaveChangesAsync(ct);
        return ToDto(s);
    }

    // â”€â”€ Resume â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    public async Task<InvoiceSettlementDto?> ResumeAsync(
        Guid tenantId, Guid id, Guid userId, CancellationToken ct)
    {
        var s = await FetchAsync(tenantId, id, ct);
        if (s is null) return null;

        if (s.Status != "OnHold")
            throw new InvalidOperationException("Only OnHold settlements can be resumed.");

        var newStatus     = s.AmountPaid > 0 ? "PartiallyPaid" : "Pending";
        s.Status          = newStatus;
        s.OnHoldReason    = null;
        s.UpdatedAt       = DateTime.UtcNow;
        s.UpdatedByUserId = userId;

        AppendEvent(s.Id, tenantId, "OnHold", newStatus, "HoldResumed", null, null, userId, "user");
        await _db.SaveChangesAsync(ct);
        return ToDto(s);
    }

    // â”€â”€ Cancel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    public async Task<InvoiceSettlementDto?> CancelAsync(
        Guid tenantId, Guid id, Guid userId, string reason, CancellationToken ct)
    {
        var s = await FetchAsync(tenantId, id, ct);
        if (s is null) return null;

        if (s.Status is "FullySettled" or "Cancelled" or "WrittenOff")
            throw new InvalidOperationException($"Cannot cancel a settlement in '{s.Status}' state.");

        if (s.AmountPaid > 0)
            throw new InvalidOperationException("Cannot cancel a settlement that has payments applied. Use WriteOff instead.");

        var prevStatus         = s.Status;
        s.Status               = "Cancelled";
        s.CancellationReason   = reason;
        s.DeletedAt            = DateTime.UtcNow;
        s.UpdatedAt            = DateTime.UtcNow;
        s.UpdatedByUserId      = userId;

        AppendEvent(s.Id, tenantId, prevStatus, "Cancelled", "Cancelled", reason, null, userId, "user");
        await _db.SaveChangesAsync(ct);
        return ToDto(s);
    }

    // â”€â”€ Write-Off â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    public async Task<InvoiceSettlementDto?> WriteOffAsync(
        Guid tenantId, Guid id, Guid userId, string reason, CancellationToken ct)
    {
        var s = await FetchAsync(tenantId, id, ct);
        if (s is null) return null;

        if (s.Status is not ("Overdue" or "OnHold" or "PartiallyPaid"))
            throw new InvalidOperationException($"Cannot write-off a settlement in '{s.Status}' state.");

        var prevStatus    = s.Status;
        s.Status          = "WrittenOff";
        s.WriteOffReason  = reason;
        s.SettledAt       = DateTime.UtcNow;
        s.UpdatedAt       = DateTime.UtcNow;
        s.UpdatedByUserId = userId;

        AppendEvent(s.Id, tenantId, prevStatus, "WrittenOff", "WrittenOff", reason, s.BalanceRemaining, userId, "user");
        await _db.SaveChangesAsync(ct);
        return ToDto(s);
    }

    // â”€â”€ Mark Overdue (timer job) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    public async Task<int> MarkOverdueAsync(CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var candidates = await _db.InvoiceSettlements
            .Where(s => s.DeletedAt == null
                     && (s.Status == "Pending" || s.Status == "PartiallyPaid")
                     && s.DueDate != null
                     && s.DueDate < now)
            .ToListAsync(ct);

        foreach (var s in candidates)
        {
            var prevStatus = s.Status;
            s.Status    = "Overdue";
            s.UpdatedAt = now;
            AppendEvent(s.Id, s.TenantId, prevStatus, "Overdue", "MarkedOverdue",
                $"DueDate {s.DueDate:yyyy-MM-dd} passed", null, null, "system");
        }

        if (candidates.Count > 0)
            await _db.SaveChangesAsync(ct);

        return candidates.Count;
    }

    // â”€â”€ Event Logs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    public async Task<List<SettlementEventLogDto>> GetEventLogsAsync(
        Guid tenantId, Guid settlementId, CancellationToken ct)
    {
        var logs = await _db.SettlementEventLogs
            .Where(e => e.TenantId == tenantId && e.SettlementId == settlementId)
            .OrderBy(e => e.OccurredAt)
            .ToListAsync(ct);

        return logs.Select(e => new SettlementEventLogDto(
            Id:           e.Id,
            FromStatus:   e.FromStatus,
            ToStatus:     e.ToStatus,
            EventType:    e.EventType,
            Reason:       e.Reason,
            Amount:       e.Amount,
            ActorUserId:  e.ActorUserId,
            ActorType:    e.ActorType,
            OccurredAt:   e.OccurredAt
        )).ToList();
    }

    // â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    private Task<InvoiceSettlement?> FetchAsync(Guid tenantId, Guid id, CancellationToken ct) =>
        _db.InvoiceSettlements
            .Include(s => s.Vendor)
            .Include(s => s.BillTransfer).ThenInclude(b => b!.Grn)
            .Include(s => s.BillTransfer).ThenInclude(b => b!.Invoice)
            .Include(s => s.Payments).ThenInclude(p => p.Payment)
            .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId && s.DeletedAt == null, ct);

    private void AppendEvent(
        Guid settlementId, Guid tenantId,
        string fromStatus, string toStatus,
        string eventType, string? reason, decimal? amount,
        Guid? actorUserId, string actorType)
    {
        _db.SettlementEventLogs.Add(new SettlementEventLog
        {
            Id           = Guid.NewGuid(),
            TenantId     = tenantId,
            SettlementId = settlementId,
            FromStatus   = fromStatus,
            ToStatus     = toStatus,
            EventType    = eventType,
            Reason       = reason,
            Amount       = amount,
            ActorUserId  = actorUserId,
            ActorType    = actorType,
            OccurredAt   = DateTime.UtcNow,
        });
    }

    private static InvoiceSettlementDto ToDto(InvoiceSettlement s) => new(
        Id:                   s.Id,
        TenantId:             s.TenantId,
        BillTransferId:       s.BillTransferId,
        VendorId:             s.VendorId,
        VendorName:           s.Vendor?.Name,
        GrnNumber:            s.BillTransfer?.Grn?.GrnNumber,
        InvoiceNumber:        s.BillTransfer?.Invoice?.InvoiceNumber,
        GrossAmount:          s.GrossAmount,
        DebitNoteAdjustment:  s.DebitNoteAdjustment,
        TcsAmount:            s.TcsAmount,
        NetPayableAmount:     s.NetPayableAmount,
        AmountPaid:           s.AmountPaid,
        BalanceRemaining:     s.BalanceRemaining,
        Status:               s.Status,
        DueDate:              s.DueDate,
        SettledAt:            s.SettledAt,
        OnHoldReason:         s.OnHoldReason,
        CancellationReason:   s.CancellationReason,
        WriteOffReason:       s.WriteOffReason,
        CreatedAt:            s.CreatedAt,
        UpdatedAt:            s.UpdatedAt,
        Payments:             s.Payments?
            .Where(p => p.DeletedAt == null)
            .OrderBy(p => p.AppliedAt)
            .Select(p => new SettlementPaymentDto(
                Id:                     p.Id,
                PaymentId:              p.PaymentId,
                AmountAllocated:        p.AmountAllocated,
                AllocationType:         p.AllocationType,
                Reference:              p.Reference,
                AppliedAt:              p.AppliedAt,
                PaymentMethod:          p.Payment?.PaymentMode,
                UtrNumber:              p.Payment?.UtrNumber,
                BankName:               p.Payment?.BankName,
                AccountNumber:          p.Payment?.AccountNumber,
                IfscCode:               p.Payment?.IfscCode,
                ChequeNumber:           p.Payment?.ChequeNumber,
                ChequeDate:             p.Payment?.ChequeDate,
                ExpectedClearanceDate:  p.Payment?.ExpectedClearanceDate,
                UpiId:                  p.Payment?.UpiId,
                UpiApp:                 p.Payment?.UpiApp,
                CashReceiptNumber:      p.Payment?.CashReceiptNumber,
                CashReceivedBy:         p.Payment?.CashReceivedBy,
                Remarks:                p.Payment?.Remarks,
                AttachmentUrl:          p.Payment?.AttachmentUrl,
                AttachmentFilename:     p.Payment?.AttachmentFilename,
                AttachmentSizeKb:       p.Payment?.AttachmentSizeKb))
            .ToList() ?? []
    );
}
