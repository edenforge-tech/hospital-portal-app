using System;
using System.Collections.Generic;

namespace AuthService.Models.Counselor
{
    // ==================== Payment Transaction DTOs ====================
    
    public class PaymentTransactionDto
    {
        public Guid Id { get; set; }
        public Guid SessionId { get; set; }
        public Guid PatientId { get; set; }
        public Guid? PackageId { get; set; }
        public string? TransactionNumber { get; set; }
        public DateTime TransactionDate { get; set; }
        public decimal TotalBillAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal NetPayableAmount { get; set; }
        public decimal AmountPaid { get; set; }
        public decimal? BalanceDue { get; set; }
        public string PaymentMethod { get; set; } = null!;
        public string? PaymentBreakdown { get; set; }
        public string PaymentStatus { get; set; } = "Pending";
        public string? ReceiptNumber { get; set; }
        public DateTime? ReceiptGeneratedAt { get; set; }
        public string? ReceiptUrl { get; set; }
        public bool Reconciled { get; set; }
        public DateTime CreatedAt { get; set; }
        
        // Display fields (populated from JOINs)
        public string? PatientName { get; set; }
        public string? PatientMrn { get; set; }
    }

    public class CreatePaymentRequest
    {
        public Guid SessionId { get; set; }
        public Guid PatientId { get; set; }
        public Guid? PackageId { get; set; }
        public decimal TotalBillAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public string PaymentMethod { get; set; } = null!; // Cash, Card, UPI, Cheque, etc.
        
        // Mixed Payment Details (for split payments)
        public List<MixedPaymentItem>? MixedPaymentBreakdown { get; set; }
        
        // Card Details (if payment_method = 'Card')
        public string? CardLastFour { get; set; }
        public string? CardType { get; set; }
        public string? CardApprovalCode { get; set; }
        
        // UPI Details (if payment_method = 'UPI')
        public string? UpiTransactionId { get; set; }
        public string? UpiVpa { get; set; }
        
        // Cheque Details (if payment_method = 'Cheque')
        public string? ChequeNumber { get; set; }
        public DateTime? ChequeDate { get; set; }
        public string? ChequeBankName { get; set; }
        
        // Bank Transfer Details
        public string? BankReferenceNumber { get; set; }
        public string? BankName { get; set; }
        public DateTime? TransferDate { get; set; }
        
        // Links
        public Guid? GovernmentSchemeClaimId { get; set; }
        public Guid? InsurancePreAuthId { get; set; }
    }

    public class MixedPaymentItem
    {
        public string Method { get; set; } = null!; // Cash, Card, UPI, etc.
        public decimal Amount { get; set; }
        public string? ReferenceNumber { get; set; }
    }

    public class ProcessPaymentRequest
    {
        public string PaymentStatus { get; set; } = null!; // Completed, Failed
        public decimal ActualAmountPaid { get; set; }
        
        // Razorpay response (for online payments)
        public string? RazorpayPaymentId { get; set; }
        public string? RazorpaySignature { get; set; }
        public string? GatewayResponse { get; set; }
    }

    public class RefundPaymentRequest
    {
        public decimal RefundAmount { get; set; }
        public string RefundReason { get; set; } = null!;
       public string? RefundReferenceNumber { get; set; }
    }

    // ==================== Payment Link DTOs ====================
    
    public class PaymentLinkDto
    {
        public Guid Id { get; set; }
        public Guid TransactionId { get; set; }
        public Guid SessionId { get; set; }
        public Guid PatientId { get; set; }
        public string? PaymentLinkId { get; set; }
        public string? ShortUrl { get; set; }
        public string? FullUrl { get; set; }
        public string? QrCodeUrl { get; set; }
        public decimal LinkAmount { get; set; }
        public string LinkStatus { get; set; } = "Active";
        public DateTime ExpiresAt { get; set; }
        public DateTime? PaidAt { get; set; }
        public string? SentVia { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreatePaymentLinkRequest
    {
        public Guid TransactionId { get; set; }
        public Guid SessionId { get; set; }
        public Guid PatientId { get; set; }
        public decimal LinkAmount { get; set; }
        public int ValidityHours { get; set; } = 48; // Default 48 hours
        
        // Delivery Details
        public string SentVia { get; set; } = "SMS"; // SMS, Email, WhatsApp, QRCode
        public string? RecipientPhone { get; set; }
        public string? RecipientEmail { get; set; }
    }

    public class PaymentLinkStatusResponse
    {
        public Guid LinkId { get; set; }
        public string Status { get; set; } = null!;
        public bool IsPaid { get; set; }
        public DateTime? PaidAt { get; set; }
        public bool IsExpired { get; set; }
    }

    // ==================== Government Scheme Claim DTOs ====================
    
    public class GovernmentSchemeClaimDto
    {
        public Guid Id { get; set; }
        public Guid SessionId { get; set; }
        public Guid PatientId { get; set; }
        public Guid? PackageId { get; set; }
        public string? ClaimNumber { get; set; }
        public string SchemeType { get; set; } = null!; // ESH, CGHS, Arograshree, SGHS
        public string? BeneficiaryId { get; set; }
        public string? BeneficiaryName { get; set; }
        public string? SurgeryType { get; set; }
        public decimal TotalBillAmount { get; set; }
        public decimal? SchemeCoveredAmount { get; set; }
        public decimal PatientCopayAmount { get; set; }
        public string ClaimStatus { get; set; } = "Draft";
        public string? AuthorityApprovalNumber { get; set; }
        public DateTime? AuthorityApprovalDate { get; set; }
        public decimal? ApprovedAmount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateGovernmentClaimRequest
    {
        public Guid SessionId { get; set; }
        public Guid PatientId { get; set; }
        public Guid? PackageId { get; set; }
        public string SchemeType { get; set; } = null!;
        public string? BeneficiaryId { get; set; }
        public string? BeneficiaryName { get; set; }
        public string? SurgeryType { get; set; }
        public string? ProcedureCode { get; set; }
        public decimal TotalBillAmount { get; set; }
        public decimal PatientCopayAmount { get; set; }
        public List<string>? RequiredDocuments { get; set; }
    }

    public class SubmitGovernmentClaimRequest
    {
        public string SubmissionReferenceNumber { get; set; } = null!;
        public List<string> SubmittedDocumentUrls { get; set; } = new();
    }

    public class ProcessClaimApprovalRequest
    {
        public string ClaimStatus { get; set; } = null!; // Approved, PartiallyApproved, Rejected
        public string? AuthorityApprovalNumber { get; set; }
        public DateTime? AuthorityApprovalDate { get; set; }
        public decimal? ApprovedAmount { get; set; }
        public string? RejectionReason { get; set; }
    }

    public class ClaimPaymentReceivedRequest
    {
        public DateTime PaymentReceivedDate { get; set; }
        public string PaymentReferenceNumber { get; set; } = null!;
        public string PaymentMode { get; set; } = null!;
    }

    // ==================== Response Models ====================
    
    public class PaymentListResponse
    {
        public int TotalRecords { get; set; }
        public List<PaymentTransactionDto> Payments { get; set; } = new();
    }

    public class PaymentSummary
    {
        public decimal TotalRevenue { get; set; }
        public decimal CashAmount { get; set; }
        public decimal CardAmount { get; set; }
        public decimal UpiAmount { get; set; }
        public decimal InsuranceAmount { get; set; }
        public decimal GovernmentSchemeAmount { get; set; }
        public int TotalTransactions { get; set; }
        public int PendingPayments { get; set; }
    }
}
