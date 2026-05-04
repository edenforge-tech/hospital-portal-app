namespace InventoryApi.Models.Entities;

/// <summary>
/// Each installment payment, credit-note application, or adjustment
/// that reduces an InvoiceSettlement's balance.
/// AllocationTypes: Payment | CreditNote | Advance | Adjustment | Reversal
/// </summary>
public class SettlementPayment
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }

    public Guid SettlementId { get; set; }
    public Guid? PaymentId { get; set; }  // null for credit-note allocations

    public decimal AmountAllocated { get; set; }

    /// <summary>Payment | CreditNote | Advance | Adjustment | Reversal</summary>
    public string AllocationType { get; set; } = "Payment";

    public string? Reference { get; set; }   // UTR / cheque no / credit-note no
    public DateTime AppliedAt { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }

    // Navigation
    public InvoiceSettlement? Settlement { get; set; }
    public VendorPayment? Payment { get; set; }
}
