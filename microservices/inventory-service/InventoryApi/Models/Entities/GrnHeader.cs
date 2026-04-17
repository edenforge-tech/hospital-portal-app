namespace InventoryApi.Models.Entities;

public class GrnHeader
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid InvoiceId { get; set; }
    public Guid StoreId { get; set; }
    public string GrnNumber { get; set; } = string.Empty;
    public DateTime GrnDate { get; set; }
    /// <summary>Draft | PrimaryApproved | Approved | PartiallyAccepted | Rejected</summary>
    public string GrnStatus { get; set; } = "Draft";
    public string? Remarks { get; set; }
    public Guid? InspectedBy { get; set; }
    public DateTime? InspectedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string Status { get; set; } = "active";

    // Navigation
    public PurchaseInvoice? Invoice { get; set; }
    public StoreMaster? Store { get; set; }
    public ICollection<GrnItem> GrnItems { get; set; } = [];
}
