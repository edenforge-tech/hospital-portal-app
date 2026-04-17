namespace InventoryApi.Models.Entities;

public class ItemMaster
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid? CategoryId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string? GenericName { get; set; }
    public string? Brand { get; set; }
    public string? HsnCode { get; set; }
    public string Unit { get; set; } = "Nos";
    /// <summary>H | H1 | X | OTC | null for non-drugs</summary>
    public string? ScheduleType { get; set; }
    public bool RequiresColdStorage { get; set; } = false;
    public bool IsBarcodeTracked { get; set; } = false;
    /// <summary>IOL | Drug | Surgical | Equipment | Consumable</summary>
    public string ItemType { get; set; } = "Drug";
    public decimal ReorderLevel { get; set; } = 0;
    public decimal ReorderQuantity { get; set; } = 0;
    /// <summary>When true, auto-reorder will be skipped for this item.</summary>
    public bool ReorderSuppressed { get; set; } = false;
    public DateTime? ReorderSuppressedUntil { get; set; }
    public DateTime? LastReorderTriggeredAt { get; set; }
    public string? DefaultGstRate { get; set; }
    public Guid? LinkedInjectorItemId { get; set; }
    /// <summary>Track individual units by serial number.</summary>
    public bool IsSerialized { get; set; } = false;
    /// <summary>Item is a fixed asset (not consumable).</summary>
    public bool IsAssetItem { get; set; } = false;
    /// <summary>Medical Device Rules classification: Class A/B/C/D or null.</summary>
    public string? MdrClassification { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string Status { get; set; } = "active";

    // Navigation
    public PurchaseCategory? Category { get; set; }
    public ItemMaster? LinkedInjectorItem { get; set; }
    public ICollection<StockBatch> StockBatches { get; set; } = [];
    public ICollection<StockLedger> StockLedgers { get; set; } = [];
}
