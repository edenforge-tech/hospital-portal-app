namespace InventoryApi.Models.Entities;

public class PurchaseItem
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid InvoiceId { get; set; }
    public Guid ItemId { get; set; }

    // Quantities
    public decimal OrderedQuantity { get; set; }
    public decimal ReceivedQuantity { get; set; }
    public decimal RejectedQuantity { get; set; } = 0;
    public decimal FreeQuantity { get; set; } = 0;

    // Batch / Expiry
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? Barcode { get; set; }

    // Pricing
    /// <summary>Original MRP on vendor invoice — gap #11 (Rudra Pharma O.MRP)</summary>
    public decimal OriginalMrp { get; set; } = 0;
    public decimal Mrp { get; set; } = 0;
    public decimal PurchaseRate { get; set; }
    public decimal DiscountPercent { get; set; } = 0;
    public decimal DiscountAmount { get; set; } = 0;
    /// <summary>100% discount linked injector — gap #6</summary>
    public bool IsFullDiscount { get; set; } = false;

    // GST
    public string? HsnCode { get; set; }
    public decimal GstPercent { get; set; } = 0;
    public decimal CgstPercent { get; set; } = 0;
    public decimal SgstPercent { get; set; } = 0;
    public decimal IgstPercent { get; set; } = 0;
    public decimal GstAmount { get; set; } = 0;
    public decimal TaxableAmount { get; set; } = 0;
    public decimal NetAmount { get; set; } = 0;

    // Patient-specific IOL linkage — gap #2
    public string? PatientName { get; set; }
    public string? PatientIpNo { get; set; }
    public Guid? SurgeryId { get; set; }

    public string? ItemRemarks { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string Status { get; set; } = "active";

    // Navigation
    public PurchaseInvoice? Invoice { get; set; }
    public ItemMaster? Item { get; set; }
}
