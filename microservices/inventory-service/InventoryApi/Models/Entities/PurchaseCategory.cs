namespace InventoryApi.Models.Entities;

public class PurchaseCategory
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    /// <summary>Drugs | Surgical | Equipment | Consumables | Optical</summary>
    public string CategoryType { get; set; } = "Drugs";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string Status { get; set; } = "active";

    // Navigation
    public ICollection<ItemMaster> Items { get; set; } = [];
}
