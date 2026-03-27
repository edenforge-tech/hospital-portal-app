using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain
{
    [Table("payment_transactions")]
    public class PaymentTransaction
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Required]
        [Column("branch_id")]
        public Guid BranchId { get; set; }

        // Session & Patient Links
        [Required]
        [Column("session_id")]
        public Guid SessionId { get; set; }

        [Required]
        [Column("patient_id")]
        public Guid PatientId { get; set; }

        [Column("package_id")]
        public Guid? PackageId { get; set; }

        // Transaction Details
        [Column("transaction_number")]
        [MaxLength(100)]
        public string? TransactionNumber { get; set; }

        [Column("transaction_date")]
        public DateTime TransactionDate { get; set; }

        // Payment Breakdown
        [Required]
        [Column("total_bill_amount")]
        public decimal TotalBillAmount { get; set; }

        [Column("discount_amount")]
        public decimal DiscountAmount { get; set; }

        [Required]
        [Column("net_payable_amount")]
        public decimal NetPayableAmount { get; set; }

        [Column("amount_paid")]
        public decimal AmountPaid { get; set; }

        [Column("balance_due")]
        public decimal? BalanceDue { get; set; }

        // Payment Method: Cash, Card, UPI, Cheque, BankTransfer, OnlineGateway, GovernmentScheme, Insurance, Mixed
        [Required]
        [Column("payment_method")]
        [MaxLength(50)]
        public string PaymentMethod { get; set; } = null!;

        // Mixed Payment Breakdown (JSONB)
        [Column("payment_breakdown", TypeName = "jsonb")]
        public string? PaymentBreakdown { get; set; }

        // Online Payment Gateway (Razorpay)
        [Column("razorpay_order_id")]
        [MaxLength(100)]
        public string? RazorpayOrderId { get; set; }

        [Column("razorpay_payment_id")]
        [MaxLength(100)]
        public string? RazorpayPaymentId { get; set; }

        [Column("razorpay_signature")]
        [MaxLength(500)]
        public string? RazorpaySignature { get; set; }

        [Column("gateway_response", TypeName = "jsonb")]
        public string? GatewayResponse { get; set; }

        // Card Payment Details
        [Column("card_last_four")]
        [MaxLength(4)]
        public string? CardLastFour { get; set; }

        [Column("card_type")]
        [MaxLength(20)]
        public string? CardType { get; set; }

        [Column("card_approval_code")]
        [MaxLength(50)]
        public string? CardApprovalCode { get; set; }

        // UPI Details
        [Column("upi_transaction_id")]
        [MaxLength(100)]
        public string? UpiTransactionId { get; set; }

        [Column("upi_vpa")]
        [MaxLength(100)]
        public string? UpiVpa { get; set; }

        // Cheque Details
        [Column("cheque_number")]
        [MaxLength(50)]
        public string? ChequeNumber { get; set; }

        [Column("cheque_date")]
        public DateTime? ChequeDate { get; set; }

        [Column("cheque_bank_name")]
        [MaxLength(200)]
        public string? ChequeBankName { get; set; }

        [Column("cheque_clearance_status")]
        [MaxLength(30)]
        public string? ChequeClearanceStatus { get; set; }

        [Column("cheque_cleared_date")]
        public DateTime? ChequeClearedDate { get; set; }

        // Bank Transfer Details
        [Column("bank_reference_number")]
        [MaxLength(100)]
        public string? BankReferenceNumber { get; set; }

        [Column("bank_name")]
        [MaxLength(200)]
        public string? BankName { get; set; }

        [Column("transfer_date")]
        public DateTime? TransferDate { get; set; }

        // Government Scheme Link
        [Column("government_scheme_claim_id")]
        public Guid? GovernmentSchemeClaimId { get; set; }

        // Insurance Link
        [Column("insurance_pre_auth_id")]
        public Guid? InsurancePreAuthId { get; set; }

        // Status: Pending, Processing, Completed, PartiallyPaid, Failed, Refunded, Cancelled
        [Column("payment_status")]
        [MaxLength(30)]
        public string PaymentStatus { get; set; } = "Pending";

        // Receipt
        [Column("receipt_number")]
        [MaxLength(100)]
        public string? ReceiptNumber { get; set; }

        [Column("receipt_generated_at")]
        public DateTime? ReceiptGeneratedAt { get; set; }

        [Column("receipt_url")]
        public string? ReceiptUrl { get; set; }

        // Refund Handling
        [Column("refund_amount")]
        public decimal RefundAmount { get; set; }

        [Column("refund_date")]
        public DateTime? RefundDate { get; set; }

        [Column("refund_reason")]
        public string? RefundReason { get; set; }

        [Column("refund_reference_number")]
        [MaxLength(100)]
        public string? RefundReferenceNumber { get; set; }

        // Reconciliation
        [Column("reconciled")]
        public bool Reconciled { get; set; } = false;

        [Column("reconciled_at")]
        public DateTime? ReconciledAt { get; set; }

        [Column("reconciled_by_user_id")]
        public Guid? ReconciledByUserId { get; set; }

        // Audit Fields
        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Required]
        [Column("created_by_user_id")]
        public Guid CreatedByUserId { get; set; }

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [Column("updated_by_user_id")]
        public Guid? UpdatedByUserId { get; set; }

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }
    }

    [Table("payment_links")]
    public class PaymentLink
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        // Transaction Link
        [Required]
        [Column("transaction_id")]
        public Guid TransactionId { get; set; }

        [Required]
        [Column("session_id")]
        public Guid SessionId { get; set; }

        [Required]
        [Column("patient_id")]
        public Guid PatientId { get; set; }

        // Link Details
        [Column("payment_link_id")]
        [MaxLength(100)]
        public string? PaymentLinkId { get; set; }

        [Column("short_url")]
        public string? ShortUrl { get; set; }

        [Column("full_url")]
        public string? FullUrl { get; set; }

        [Column("qr_code_url")]
        public string? QrCodeUrl { get; set; }

        // Amount
        [Required]
        [Column("link_amount")]
        public decimal LinkAmount { get; set; }

        [Column("currency")]
        [MaxLength(3)]
        public string Currency { get; set; } = "INR";

        // Delivery: SMS, Email, WhatsApp, QRCode, Manual
        [Column("sent_via")]
        [MaxLength(20)]
        public string? SentVia { get; set; }

        [Column("recipient_phone")]
        [MaxLength(20)]
        public string? RecipientPhone { get; set; }

        [Column("recipient_email")]
        [MaxLength(200)]
        public string? RecipientEmail { get; set; }

        [Column("sent_at")]
        public DateTime? SentAt { get; set; }

        // Status: Active, Paid, Expired, Cancelled
        [Column("link_status")]
        [MaxLength(30)]
        public string LinkStatus { get; set; } = "Active";

        // Validity
        [Required]
        [Column("expires_at")]
        public DateTime ExpiresAt { get; set; }

        // Payment Tracking
        [Column("paid_at")]
        public DateTime? PaidAt { get; set; }

        [Column("payment_transaction_id")]
        public Guid? PaymentTransactionId { get; set; }

        // Reminders
        [Column("reminder_sent_count")]
        public int ReminderSentCount { get; set; } = 0;

        [Column("last_reminder_sent_at")]
        public DateTime? LastReminderSentAt { get; set; }

        // Audit Fields
        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("created_by_user_id")]
        public Guid? CreatedByUserId { get; set; }
    }

 [Table("government_scheme_claims")]
    public class GovernmentSchemeClaim
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Required]
        [Column("branch_id")]
        public Guid BranchId { get; set; }

        // Session & Patient Links
        [Required]
        [Column("session_id")]
        public Guid SessionId { get; set; }

        [Required]
        [Column("patient_id")]
        public Guid PatientId { get; set; }

        [Column("package_id")]
        public Guid? PackageId { get; set; }

        // Scheme Details
        [Column("claim_number")]
        [MaxLength(100)]
        public string? ClaimNumber { get; set; }

        // Scheme Type: ESH, CGHS, Arograshree, SGHS, Other
        [Required]
        [Column("scheme_type")]
        [MaxLength(50)]
        public string SchemeType { get; set; } = null!;

        [Column("beneficiary_id")]
        [MaxLength(100)]
        public string? BeneficiaryId { get; set; }

        [Column("beneficiary_name")]
        [MaxLength(200)]
        public string? BeneficiaryName { get; set; }

        // Surgery Details
        [Column("surgery_type")]
        [MaxLength(100)]
        public string? SurgeryType { get; set; }

        [Column("procedure_code")]
        [MaxLength(50)]
        public string? ProcedureCode { get; set; }

        // Financial
        [Required]
        [Column("total_bill_amount")]
        public decimal TotalBillAmount { get; set; }

        [Column("scheme_covered_amount")]
        public decimal? SchemeCoveredAmount { get; set; }

        [Column("patient_copay_amount")]
        public decimal PatientCopayAmount { get; set; } = 0;

        // Submission
        [Column("submitted_to_authority_at")]
        public DateTime? SubmittedToAuthorityAt { get; set; }

        [Column("submitted_by_user_id")]
        public Guid? SubmittedByUserId { get; set; }

        [Column("submission_reference_number")]
        [MaxLength(100)]
        public string? SubmissionReferenceNumber { get; set; }

        // Status: Draft, DocumentsPending, ReadyToSubmit, SubmittedToAuthority, UnderReview, QueryRaised, Approved, PartiallyApproved, Rejected, PaymentProcessing, PaymentReceived, Closed
        [Column("claim_status")]
        [MaxLength(50)]
        public string ClaimStatus { get; set; } = "Draft";

        // Authority Response
        [Column("authority_approval_number")]
        [MaxLength(100)]
        public string? AuthorityApprovalNumber { get; set; }

        [Column("authority_approval_date")]
        public DateTime? AuthorityApprovalDate { get; set; }

        [Column("approved_amount")]
        public decimal? ApprovedAmount { get; set; }

        [Column("rejection_reason")]
        public string? RejectionReason { get; set; }

        // Payment Receipt
        [Column("payment_received_date")]
        public DateTime? PaymentReceivedDate { get; set; }

        [Column("payment_reference_number")]
        [MaxLength(100)]
        public string? PaymentReferenceNumber { get; set; }

        [Column("payment_mode")]
        [MaxLength(50)]
        public string? PaymentMode { get; set; }

        // Documents (TEXT[] arrays)
        [Column("required_documents")]
        public string[]? RequiredDocuments { get; set; }

        [Column("submitted_documents_urls")]
        public string[]? SubmittedDocumentsUrls { get; set; }

        // Audit Fields
        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Required]
        [Column("created_by_user_id")]
        public Guid CreatedByUserId { get; set; }

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [Column("updated_by_user_id")]
        public Guid? UpdatedByUserId { get; set; }

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }
    }
}
