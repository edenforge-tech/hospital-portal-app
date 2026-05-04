namespace InventoryApi.Models.Entities;

public class PurchaseInvoice
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid VendorId { get; set; }
    public Guid StoreId { get; set; }

    // Invoice identifiers
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; }

    // Delivery Challan (separate from invoice — gap #3)
    public string? DeliveryChallNumber { get; set; }
    public DateTime? DeliveryChallDate { get; set; }

    // Vendor cross-reference numbers (gap #10 — Carl Zeiss style)
    public string? VendorOrderNumber { get; set; }
    public string? VendorDeliveryNoteNumber { get; set; }
    public string? VendorSapNumber { get; set; }
    public string? VendorBatchRef { get; set; }

    // GRN linkage
    public string? GrnNumber { get; set; }
    public DateTime? GrnDate { get; set; }

    // Financial totals
    public decimal GrossAmount { get; set; }
    public decimal DiscountAmount { get; set; } = 0;
    public decimal TaxableAmount { get; set; }
    public decimal CgstAmount { get; set; } = 0;
    public decimal SgstAmount { get; set; } = 0;
    public decimal IgstAmount { get; set; } = 0;
    public decimal TotalGst { get; set; } = 0;
    /// <summary>Tax Collected at Source — gap #1</summary>
    public decimal TcsPercent { get; set; } = 0;
    public decimal TcsAmount { get; set; } = 0;
    public decimal NetAmount { get; set; }
    public decimal PaidAmount { get; set; } = 0;
    public decimal BalanceAmount { get; set; } = 0;

    /// <summary>Bulk | PatientSpecific — IOL billing mode</summary>
    public string BillingMode { get; set; } = "Bulk";
    public string? PatientName { get; set; }
    public string? PatientIpNo { get; set; }

    /// <summary>Draft | PrimaryApproved | Approved | Rejected | Cancelled</summary>
    public string ApprovalStatus { get; set; } = "Draft";
    public Guid? PrimaryApprovedBy { get; set; }
    public DateTime? PrimaryApprovedAt { get; set; }
    public Guid? FinalApprovedBy { get; set; }
    public DateTime? FinalApprovedAt { get; set; }

    public string? Remarks { get; set; }
    public string? InvoiceType { get; set; }
    public string? PaymentMode { get; set; }
    public int?    CreditPeriod { get; set; }
    public DateTime? DueDate { get; set; }
    public string? Reference { get; set; }
    public string? PurchaseCategory { get; set; }

    // e-Invoice / IRN
    public string? Irn { get; set; }
    public string? AckNo { get; set; }
    public DateTime? AckDate { get; set; }

    // E-Way Bill
    public string? EWayBillNo { get; set; }
    public DateTime? EWayBillDate { get; set; }

    // Delivery & compliance
    public DateTime? DateOfDelivery { get; set; }
    public bool IsReverseCharge { get; set; } = false;
    public string? VendorGstinOnInvoice { get; set; }  // as printed on physical invoice

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string Status { get; set; } = "active";

    // Navigation
    public Vendor? Vendor { get; set; }
    public StoreMaster? Store { get; set; }
    public ICollection<PurchaseItem> Items { get; set; } = [];
    public ICollection<InvoiceGstSummary> GstSummaries { get; set; } = [];
    public ICollection<GrnHeader> GrnHeaders { get; set; } = [];
    public ICollection<ApprovalLog> ApprovalLogs { get; set; } = [];
}
