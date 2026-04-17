namespace InventoryApi.Models.Entities;

public class StockTransfer
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid FromStoreId { get; set; }
    public Guid ToStoreId { get; set; }
    public string TransferNumber { get; set; } = string.Empty;
    public DateTime TransferDate { get; set; }
    /// <summary>Pending | Approved | InTransit | Completed | Cancelled</summary>
    public string TransferStatus { get; set; } = "Pending";
    public string? Remarks { get; set; }
    public Guid? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public Guid? DispatchedBy { get; set; }
    public DateTime? DispatchedAt { get; set; }
    public Guid? ReceivedBy { get; set; }
    public DateTime? ReceivedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string Status { get; set; } = "active";

    // Navigation
    public StoreMaster? FromStore { get; set; }
    public StoreMaster? ToStore { get; set; }
    public ICollection<StockTransferItem> Items { get; set; } = [];
}
