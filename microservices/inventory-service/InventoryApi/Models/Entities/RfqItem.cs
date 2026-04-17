namespace InventoryApi.Models.Entities;

public class RfqItem
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid RfqId { get; set; }
    public Guid ItemId { get; set; }
    public decimal RequestedQty { get; set; }
    public string Unit { get; set; } = string.Empty;
    public string? Specifications { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string Status { get; set; } = "active";

    // Navigation
    public RfqHeader? Rfq { get; set; }
    public ItemMaster? Item { get; set; }
}
