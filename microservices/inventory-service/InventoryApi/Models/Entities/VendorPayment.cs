namespace InventoryApi.Models.Entities;

public class VendorPayment
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid VendorId { get; set; }
    public Guid? InvoiceId { get; set; }
    public string PaymentReference { get; set; } = string.Empty;
    public DateTime PaymentDate { get; set; }
    public decimal Amount { get; set; }
    /// <summary>Cash | Cheque | NEFT | RTGS | UPI</summary>
    public string PaymentMode { get; set; } = "NEFT";
    public string? ChequeNumber { get; set; }
    public string? BankTransactionId { get; set; }
    public string? Remarks { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string Status { get; set; } = "active";

    // Navigation
    public Vendor? Vendor { get; set; }
    public PurchaseInvoice? Invoice { get; set; }
}
