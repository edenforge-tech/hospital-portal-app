namespace InventoryApi.Models.Entities;

public class RfqHeader
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid BranchId { get; set; }
    public Guid? RequisitionId { get; set; }
    public string RfqNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    /// <summary>Draft | Published | ResponseWindowClosed | EvaluationInProgress | Awarded | Closed | Cancelled</summary>
    public string RfqStatus { get; set; } = "Draft";
    public DateTime? PublishedAt { get; set; }
    public DateTime? ResponseDeadline { get; set; }
    public DateTime? AwardedAt { get; set; }
    public Guid? AwardedToVendorId { get; set; }
    public string? CancellationReason { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string Status { get; set; } = "active";

    // Navigation
    public PurchaseRequisition? Requisition { get; set; }
    public Vendor? AwardedToVendor { get; set; }
    public ICollection<RfqItem> Items { get; set; } = [];
    public ICollection<RfqVendorInvite> VendorInvites { get; set; } = [];
    public ICollection<VendorQuote> VendorQuotes { get; set; } = [];
}
