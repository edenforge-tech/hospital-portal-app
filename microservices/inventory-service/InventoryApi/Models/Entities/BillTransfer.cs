namespace InventoryApi.Models.Entities;

/// <summary>
/// Represents the post-GRN finance approval packet forwarded through
/// L1 (Accounts) and L2 (Finance) before payment is authorised.
/// Status flow: Generated → AccountsApproved → FinanceApproved → ReadyForSettlement
/// Rejection paths: → RejectedByAccounts | RejectedByFinance → (Resubmit) → Generated
/// Terminal: Cancelled
/// </summary>
public class BillTransfer
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }

    public Guid GrnId { get; set; }
    public Guid InvoiceId { get; set; }
    public Guid VendorId { get; set; }

    // Amounts snapshot (3-way match: PO ↔ GRN ↔ Invoice)
    public decimal GrnTotalAmount { get; set; }
    public decimal InvoiceTotalAmount { get; set; }
    public decimal CgstAmount { get; set; }
    public decimal SgstAmount { get; set; }
    public decimal IgstAmount { get; set; }
    public decimal TcsAmount { get; set; }

    /// <summary>
    /// Generated | AccountsApproved | FinanceApproved | ReadyForSettlement
    /// | RejectedByAccounts | RejectedByFinance | Cancelled
    /// </summary>
    public string Status { get; set; } = "Generated";

    // L1 – Accounts
    public Guid? L1ApprovedBy { get; set; }
    public DateTime? L1ApprovedAt { get; set; }
    public string? L1Remarks { get; set; }

    // L2 – Finance
    public Guid? L2ApprovedBy { get; set; }
    public DateTime? L2ApprovedAt { get; set; }
    public string? L2Remarks { get; set; }

    public string? Remarks { get; set; }
    public string[] Attachments { get; set; } = [];

    // Optimistic concurrency (DB-103)
    public long VersionNo { get; set; } = 1;

    // SLA (DB-401)
    public DateTime? L1DueAt { get; set; }
    public DateTime? L2DueAt { get; set; }
    /// <summary>OnTrack | AtRisk | Breached</summary>
    public string SlaState { get; set; } = "OnTrack";

    // Standard audit
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string StatusMeta { get; set; } = "active";

    // Navigation
    public GrnHeader? Grn { get; set; }
    public PurchaseInvoice? Invoice { get; set; }
    public Vendor? Vendor { get; set; }
    public InvoiceSettlement? Settlement { get; set; }
}
