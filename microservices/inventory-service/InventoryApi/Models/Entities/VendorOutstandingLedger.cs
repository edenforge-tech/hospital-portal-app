namespace InventoryApi.Models.Entities;

/// <summary>Running outstanding balance per vendor — gap #8 (Rudra Pharma "Total Due Bills")</summary>
public class VendorOutstandingLedger
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid VendorId { get; set; }
    public Guid? InvoiceId { get; set; }
    public Guid? PaymentId { get; set; }
    /// <summary>Nullable — links CreditNote/CreditNoteReversal entries to a purchase return.</summary>
    public Guid? ReturnId { get; set; }
    /// <summary>Invoice | Payment | CreditNote | CreditNoteReversal | Adjustment</summary>
    public string EntryType { get; set; } = string.Empty;
    public decimal Debit { get; set; } = 0;  // amount owed (invoice)
    public decimal Credit { get; set; } = 0; // amount paid / credit note
    public decimal RunningBalance { get; set; }
    public string? ReferenceNumber { get; set; }
    public DateTime EntryDate { get; set; }
    public string? Remarks { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string Status { get; set; } = "active";

    // Navigation
    public Vendor? Vendor { get; set; }
    public PurchaseInvoice? Invoice { get; set; }
    public VendorPayment? Payment { get; set; }
}
