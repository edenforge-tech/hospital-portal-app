namespace InventoryApi.Models.Entities;

public class PurchaseReturnItem
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid ReturnId { get; set; }
    public Guid ItemId { get; set; }
    public Guid? StockBatchId { get; set; }
    public decimal ReturnQuantity { get; set; }
    public decimal FreeQuantity { get; set; } = 0;
    public decimal PurchaseRate { get; set; }
    public decimal Amount { get; set; }
    /// <summary>Damaged | Expired | Excess | QualityRejection | Other</summary>
    public string? ReturnCause { get; set; }
    /// <summary>Snapshot of batch number at time of return.</summary>
    public string? BatchNumber { get; set; }
    /// <summary>Snapshot of expiry date at time of return.</summary>
    public DateOnly? ExpiryDate { get; set; }

    // ── GST fields (inherited from source invoice/GRN line) ───────────────────
    public string? HsnCode { get; set; }
    /// <summary>Total GST rate (CGST+SGST or IGST %).</summary>
    public decimal GstPercent { get; set; } = 0;
    public decimal CgstPercent { get; set; } = 0;
    public decimal SgstPercent { get; set; } = 0;
    public decimal IgstPercent { get; set; } = 0;
    /// <summary>return_quantity × purchase_rate (before tax).</summary>
    public decimal TaxableAmount { get; set; } = 0;
    public decimal CgstAmount { get; set; } = 0;
    public decimal SgstAmount { get; set; } = 0;
    public decimal IgstAmount { get; set; } = 0;
    /// <summary>TaxableAmount + CgstAmount + SgstAmount + IgstAmount.</summary>
    public decimal NetAmount { get; set; } = 0;

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string Status { get; set; } = "active";

    // Navigation
    public PurchaseReturn? Return { get; set; }
    public ItemMaster? Item { get; set; }
    public StockBatch? StockBatch { get; set; }
}
