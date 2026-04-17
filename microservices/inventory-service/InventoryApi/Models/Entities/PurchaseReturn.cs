namespace InventoryApi.Models.Entities;

public class PurchaseReturn
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    /// <summary>Nullable — not required for Manual or GRN-linked returns.</summary>
    public Guid? InvoiceId { get; set; }
    public Guid VendorId { get; set; }
    /// <summary>Invoice | GRN | Manual</summary>
    public string SourceType { get; set; } = "Manual";
    public Guid? GrnId { get; set; }
    public string? PurchaseCategory { get; set; }
    public string ReturnNumber { get; set; } = string.Empty;
    public DateTime ReturnDate { get; set; }
    /// <summary>QualityRejection | Expired | Excess | Damaged | Other</summary>
    public string ReturnReason { get; set; } = "QualityRejection";
    public decimal TotalAmount { get; set; }
    public string? Remarks { get; set; }
    /// <summary>Draft | Pending | SentToVendor | CreditNoteReceived | Settled | Cancelled</summary>
    public string SettlementStatus { get; set; } = "Pending";
    public string? CreditNoteNumber { get; set; }
    public decimal? CreditNoteAmount { get; set; }
    public DateOnly? CreditNoteDate { get; set; }
    public string? PaymentMode { get; set; }
    public string? Reference { get; set; }
    public DateTime? SentToVendorAt { get; set; }
    public DateTime? SettledAt { get; set; }

    // ── GST summary (sum of all line values) ──────────────────────────────────
    public decimal TaxableAmount { get; set; } = 0;
    public decimal CgstAmount { get; set; } = 0;
    public decimal SgstAmount { get; set; } = 0;
    public decimal IgstAmount { get; set; } = 0;
    public decimal TcsPercent { get; set; } = 0;
    public decimal TcsAmount { get; set; } = 0;
    /// <summary>TaxableAmount + total GST + TcsAmount.</summary>
    public decimal NetReturnAmount { get; set; } = 0;
    /// <summary>ITC to be reversed when credit note is received (proportional GST on CN).</summary>
    public decimal ItcReversalAmount { get; set; } = 0;
    /// <summary>Required when cancelling after CreditNoteReceived status.</summary>
    public string? CancellationReason { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string Status { get; set; } = "active";

    // Navigation
    public PurchaseInvoice? Invoice { get; set; }
    public Vendor? Vendor { get; set; }
    public ICollection<PurchaseReturnItem> ReturnItems { get; set; } = [];
}
