namespace InventoryApi.Models.Entities;

public class VendorQuoteItem
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid QuoteId { get; set; }
    public Guid ItemId { get; set; }
    public decimal QuotedQty { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal GstPercent { get; set; }
    public decimal TotalAmount { get; set; }
    public string? Remarks { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string Status { get; set; } = "active";

    // Navigation
    public VendorQuote? Quote { get; set; }
    public ItemMaster? Item { get; set; }
}
