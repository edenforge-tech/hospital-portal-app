namespace InventoryApi.Models.Entities;

public class PharmacyBillItem
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid BillId { get; set; }
    public Guid ItemId { get; set; }
    public Guid? StockBatchId { get; set; }
    public decimal Quantity { get; set; }
    public decimal Mrp { get; set; }
    public decimal SellingRate { get; set; }
    public decimal DiscountPercent { get; set; } = 0;
    public decimal GstPercent { get; set; } = 0;
    public decimal TaxableAmount { get; set; }
    public decimal GstAmount { get; set; }
    public decimal NetAmount { get; set; }
    public string? Barcode { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string Status { get; set; } = "active";

    // Navigation
    public PharmacyBill? Bill { get; set; }
    public ItemMaster? Item { get; set; }
    public StockBatch? StockBatch { get; set; }
}
