namespace InventoryApi.Models.Entities;

public class PurchaseRequisitionItem
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid RequisitionId { get; set; }
    public Guid ItemId { get; set; }
    public decimal RequiredQuantity { get; set; }
    public decimal CurrentStock { get; set; }
    public string? PreferredVendor { get; set; }
    public string? Remarks { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string Status { get; set; } = "active";

    // Navigation
    public PurchaseRequisition? Requisition { get; set; }
    public ItemMaster? Item { get; set; }
}
