namespace InventoryApi.Models.Entities;

public class PurchaseRequisition
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid StoreId { get; set; }
    public string RequisitionNumber { get; set; } = string.Empty;
    public DateTime RequisitionDate { get; set; }
    public Guid? RequestedByUserId { get; set; }
    /// <summary>Manual | AutoReorder</summary>
    public string RequisitionType { get; set; } = "Manual";
    /// <summary>Draft | Submitted | Approved | ConvertedToRFQ | ConvertedToPO | Rejected | Cancelled</summary>
    public string RequisitionStatus { get; set; } = "Draft";
    /// <summary>Links auto-reorder requisitions to the active procurement policy at generation time.</summary>
    public Guid? PolicyId { get; set; }
    public string? Remarks { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string Status { get; set; } = "active";

    // Navigation
    public StoreMaster? Store { get; set; }
    public ICollection<PurchaseRequisitionItem> Items { get; set; } = [];
}
