namespace InventoryApi.Models.Entities;

public class PurchaseOrder
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid BranchId { get; set; }
    public Guid? RequisitionId { get; set; }
    public Guid? RfqId { get; set; }
    /// <summary>RFQ | Direct | Emergency</summary>
    public string SourceType { get; set; } = "Direct";
    public string PoNumber { get; set; } = string.Empty;
    public Guid VendorId { get; set; }
    /// <summary>Draft | Submitted | L1Approved | L2Approved | Approved | Rejected | SentToVendor | PartiallyReceived | FullyReceived | Closed | Cancelled</summary>
    public string PoStatus { get; set; } = "Draft";
    public decimal TotalAmount { get; set; }
    public decimal GstAmount { get; set; }
    public decimal NetAmount { get; set; }
    public DateTime PoDate { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }
    public DateTime? SentToVendorAt { get; set; }
    public Guid? L1ApprovedByUserId { get; set; }
    public DateTime? L1ApprovedAt { get; set; }
    public Guid? L2ApprovedByUserId { get; set; }
    public DateTime? L2ApprovedAt { get; set; }
    public Guid? RejectedByUserId { get; set; }
    public DateTime? RejectedAt { get; set; }
    public string? RejectionReason { get; set; }
    public bool IsEmergency { get; set; }
    public DateTime? EmergencyBypassExpiry { get; set; }
    public DateTime? ActualDeliveryDate { get; set; }
    public DateTime? ReceivedAt { get; set; }
    public string? Terms { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string Status { get; set; } = "active";

    // Navigation
    public Vendor? Vendor { get; set; }
    public PurchaseRequisition? Requisition { get; set; }
    public RfqHeader? Rfq { get; set; }
    public ICollection<PurchaseOrderItem> Items { get; set; } = [];
}
