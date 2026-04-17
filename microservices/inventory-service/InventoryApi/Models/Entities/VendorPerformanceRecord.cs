namespace InventoryApi.Models.Entities;

/// <summary>
/// Records vendor on-time delivery and fulfillment performance per Purchase Order.
/// Created automatically when a PO is marked FullyReceived.
/// </summary>
public class VendorPerformanceRecord
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid VendorId { get; set; }
    public Guid PoId { get; set; }
    public Guid StoreId { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }
    public DateTime? ActualDeliveryDate { get; set; }
    /// <summary>True if actual delivery was on or before expected date.</summary>
    public bool OnTimeDelivery { get; set; }
    /// <summary>Null when on time; positive integer = days past expected date.</summary>
    public int? DaysLate { get; set; }
    public decimal TotalOrdered { get; set; }
    public decimal TotalReceived { get; set; }
    /// <summary>0–100 percentage: TotalReceived / TotalOrdered * 100</summary>
    public decimal FulfillmentRate { get; set; }
    /// <summary>Optional 1–5 star rating assigned manually or auto-computed.</summary>
    public decimal? Rating { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string Status { get; set; } = "active";

    // Navigation
    public Vendor? Vendor { get; set; }
    public PurchaseOrder? PurchaseOrder { get; set; }
}
