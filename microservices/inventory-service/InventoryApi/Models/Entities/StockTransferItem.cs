namespace InventoryApi.Models.Entities;

public class StockTransferItem
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid TransferId { get; set; }
    public Guid ItemId { get; set; }
    public Guid StockBatchId { get; set; }
    public decimal TransferQuantity { get; set; }
    public decimal UnitRate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string Status { get; set; } = "active";

    // Navigation
    public StockTransfer? Transfer { get; set; }
    public ItemMaster? Item { get; set; }
    public StockBatch? StockBatch { get; set; }
}
