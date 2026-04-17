namespace InventoryApi.Models.Entities;

public class PharmacyBill
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid StoreId { get; set; }
    public Guid? PatientId { get; set; }
    public string BillNumber { get; set; } = string.Empty;
    public DateTime BillDate { get; set; }
    public string? PatientName { get; set; }
    public string? PatientIpOpNo { get; set; }
    public Guid? PrescribedByDoctorId { get; set; }
    public decimal GrossAmount { get; set; }
    public decimal DiscountAmount { get; set; } = 0;
    public decimal GstAmount { get; set; } = 0;
    public decimal NetAmount { get; set; }
    /// <summary>Cash | Credit | Insurance | Wallet</summary>
    public string PaymentMode { get; set; } = "Cash";
    public decimal PaidAmount { get; set; } = 0;
    public decimal BalanceAmount { get; set; } = 0;
    /// <summary>Draft | StockValidated | Billed | PaidOrSettled | Cancelled | Returned</summary>
    public string BillStatus { get; set; } = "Draft";
    public string? Remarks { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string Status { get; set; } = "active";

    // Navigation
    public StoreMaster? Store { get; set; }
    public ICollection<PharmacyBillItem> Items { get; set; } = [];
}
