namespace InventoryApi.Models.Entities;

/// <summary>
/// Tracks the full vendor payment reconciliation after a Bill Transfer
/// reaches ReadyForSettlement. Supports partial payments, credit-note netting,
/// TCS deduction, and terminal states (Settled, WrittenOff, Cancelled).
/// Status flow: Pending → PartiallySettled → Settled
///              Pending | PartiallySettled → OnHold ↔ resume
///              Overdue | OnHold → WrittenOff
///              Pending | PartiallySettled → Cancelled
/// </summary>
public class InvoiceSettlement
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }

    public Guid BillTransferId { get; set; }
    public Guid VendorId { get; set; }

    // Financial reconciliation (snapshot at creation; updated when credit notes applied)
    public decimal GrossAmount { get; set; }
    public decimal DebitNoteAdjustment { get; set; }   // sum of PurchaseReturn.NetReturnAmount
    public decimal TcsAmount { get; set; }
    public decimal NetPayableAmount { get; set; }       // GrossAmount - DebitNoteAdjustment - TcsAmount

    // Payment tracking
    public decimal AmountPaid { get; set; }
    public decimal BalanceRemaining { get; set; }

    /// <summary>
    /// Pending | PartiallySettled | Settled | Overdue | OnHold | Cancelled | WrittenOff
    /// </summary>
    public string Status { get; set; } = "Pending";

    public DateTime? DueDate { get; set; }
    public DateTime? SettledAt { get; set; }
    public string? OnHoldReason { get; set; }
    public string? CancellationReason { get; set; }
    public string? WriteOffReason { get; set; }

    // Optimistic concurrency (DB-103)
    public long VersionNo { get; set; } = 1;

    // Standard audit
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string StatusMeta { get; set; } = "active";

    // Navigation
    public BillTransfer? BillTransfer { get; set; }
    public Vendor? Vendor { get; set; }
    public ICollection<SettlementPayment> Payments { get; set; } = [];
}
