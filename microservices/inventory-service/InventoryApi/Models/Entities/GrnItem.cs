namespace InventoryApi.Models.Entities;

public class GrnItem
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid GrnHeaderId { get; set; }
    public Guid PurchaseItemId { get; set; }
    public Guid ItemId { get; set; }
    public decimal AcceptedQuantity { get; set; }
    public decimal RejectedQuantity { get; set; } = 0;
    public string? RejectionReason { get; set; }
    /// <summary>Physical vs invoice match verification</summary>
    public bool IsVerified { get; set; } = false;
    public string? Barcode { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string Status { get; set; } = "active";

    // Navigation
    public GrnHeader? GrnHeader { get; set; }
    public PurchaseItem? PurchaseItem { get; set; }
    public ItemMaster? Item { get; set; }
}
