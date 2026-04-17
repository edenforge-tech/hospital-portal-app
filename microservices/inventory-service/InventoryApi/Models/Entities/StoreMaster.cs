namespace InventoryApi.Models.Entities;

public class StoreMaster
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid? BranchId { get; set; }
    public string StoreName { get; set; } = string.Empty;
    /// <summary>Central | Pharmacy | OT</summary>
    public string StoreType { get; set; } = "Central";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string Status { get; set; } = "active";

    // Navigation
    public ICollection<StockBatch> StockBatches { get; set; } = [];
    public ICollection<StockLedger> StockLedgers { get; set; } = [];
}
