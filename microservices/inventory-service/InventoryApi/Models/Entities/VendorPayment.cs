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

    // ── NEFT / RTGS ────────────────────────────────────────────────────────
    /// <summary>UTR number assigned by the bank (NEFT/RTGS).</summary>
    public string? UtrNumber { get; set; }
    /// <summary>Vendor's bank name (NEFT/RTGS/Cheque).</summary>
    public string? BankName { get; set; }
    /// <summary>Vendor's bank account number (NEFT/RTGS).</summary>
    public string? AccountNumber { get; set; }
    /// <summary>Vendor's bank IFSC code (NEFT/RTGS).</summary>
    public string? IfscCode { get; set; }

    // ── Cheque ─────────────────────────────────────────────────────────────
    public string? ChequeNumber { get; set; }
    /// <summary>Date printed on the cheque (may differ from payment date).</summary>
    public DateTime? ChequeDate { get; set; }
    /// <summary>Expected clearance date (T+2/T+3 working days).</summary>
    public DateTime? ExpectedClearanceDate { get; set; }

    // ── UPI ────────────────────────────────────────────────────────────────
    /// <summary>Vendor Virtual Payment Address e.g. vendor@hdfc.</summary>
    public string? UpiId { get; set; }
    /// <summary>UPI app: GPay | PhonePe | Paytm | BHIM | Bank App | Other.</summary>
    public string? UpiApp { get; set; }

    // ── Cash ───────────────────────────────────────────────────────────────
    public string? CashReceiptNumber { get; set; }
    /// <summary>Person who handled the cash.</summary>
    public string? CashReceivedBy { get; set; }

    // ── Legacy / shared ────────────────────────────────────────────────────
    public string? BankTransactionId { get; set; }
    public string? Remarks { get; set; }

    // ── Payment proof attachment ───────────────────────────────────────────
    public string? AttachmentUrl      { get; set; }
    public string? AttachmentFilename { get; set; }
    public int?    AttachmentSizeKb   { get; set; }

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
