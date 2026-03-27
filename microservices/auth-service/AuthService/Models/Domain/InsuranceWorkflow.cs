using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain
{
    [Table("insurance_pre_authorizations")]
    public class InsurancePreAuthorization
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

        [Required]
        [Column("session_id")]
        public Guid SessionId { get; set; }

        [Required]
        [Column("patient_id")]
        public Guid PatientId { get; set; }

        [Column("pre_auth_number")]
        [MaxLength(100)]
        public string? PreAuthNumber { get; set; }

        [Column("insurance_type")]
        [MaxLength(50)]
        public string? InsuranceType { get; set; }

        [Column("insurance_provider")]
        [MaxLength(200)]
        public string? InsuranceProvider { get; set; }

        [Column("tpa_name")]
        [MaxLength(200)]
        public string? TPAName { get; set; }

        [Column("policy_number")]
        [MaxLength(100)]
        public string? PolicyNumber { get; set; }

        [Column("policy_holder_name")]
        [MaxLength(200)]
        public string? PolicyHolderName { get; set; }

        [Required]
        [Column("surgery_type")]
        [MaxLength(100)]
        public string SurgeryType { get; set; } = string.Empty;

        [Column("planned_procedure")]
        public string? PlannedProcedure { get; set; }

        [Column("diagnosis_code")]
        [MaxLength(50)]
        public string? DiagnosisCode { get; set; }

        [Column("procedure_code")]
        [MaxLength(50)]
        public string? ProcedureCode { get; set; }

        [Column("eye_operated")]
        [MaxLength(10)]
        public string? EyeOperated { get; set; }

        [Required]
        [Column("requested_amount")]
        public decimal RequestedAmount { get; set; }

        [Column("approved_amount")]
        public decimal? ApprovedAmount { get; set; }

        [Column("copay_amount")]
        public decimal CopayAmount { get; set; } = 0;

        [Column("deductible_amount")]
        public decimal DeductibleAmount { get; set; } = 0;

        [Column("patient_payable")]
        public decimal? PatientPayable { get; set; }

        [Column("package_id")]
        public Guid? PackageId { get; set; }

        [Column("itemized_breakdown", TypeName = "jsonb")]
        public string? ItemizedBreakdown { get; set; }

        [Column("status")]
        [MaxLength(50)]
        public string Status { get; set; } = "Draft";

        [Column("submitted_to_tpa_at")]
        public DateTime? SubmittedToTPAAt { get; set; }

        [Column("submitted_by_user_id")]
        public Guid? SubmittedByUserId { get; set; }

        [Column("expected_approval_date")]
        public DateTime? ExpectedApprovalDate { get; set; }

        [Column("actual_approval_date")]
        public DateTime? ActualApprovalDate { get; set; }

        [Column("tpa_approval_number")]
        [MaxLength(100)]
        public string? TPAApprovalNumber { get; set; }

        [Column("tpa_approval_letter_url")]
        public string? TPAApprovalLetterUrl { get; set; }

        [Column("tpa_response_notes")]
        public string? TPAResponseNotes { get; set; }

        [Column("tpa_denial_reason")]
        public string? TPADenialReason { get; set; }

        [Column("queries_raised", TypeName = "text[]")]
        public string[]? QueriesRaised { get; set; }

        [Column("query_responses", TypeName = "text[]")]
        public string[]? QueryResponses { get; set; }

        [Column("valid_from")]
        public DateTime? ValidFrom { get; set; }

        [Column("valid_until")]
        public DateTime? ValidUntil { get; set; }

        [Column("cancelled_at")]
        public DateTime? CancelledAt { get; set; }

        [Column("cancelled_by_user_id")]
        public Guid? CancelledByUserId { get; set; }

        [Column("cancellation_reason")]
        public string? CancellationReason { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        [Column("created_by_user_id")]
        public Guid CreatedByUserId { get; set; }

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [Column("updated_by_user_id")]
        public Guid? UpdatedByUserId { get; set; }

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        [ForeignKey("SessionId")]
        public virtual CounselingSession? CounselingSession { get; set; }

        [ForeignKey("PackageId")]
        public virtual CounselorPackage? Package { get; set; }
    }

    [Table("insurance_approval_workflow")]
    public class InsuranceApprovalWorkflow
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Required]
        [Column("pre_auth_id")]
        public Guid PreAuthId { get; set; }

        [Required]
        [Column("stage_name")]
        [MaxLength(50)]
        public string StageName { get; set; } = string.Empty;

        [Required]
        [Column("stage_sequence")]
        public int StageSequence { get; set; }

        [Column("approver_user_id")]
        public Guid? ApproverUserId { get; set; }

        [Column("approver_role")]
        [MaxLength(50)]
        public string? ApproverRole { get; set; }

        [Column("action_taken")]
        [MaxLength(30)]
        public string? ActionTaken { get; set; }

        [Column("action_timestamp")]
        public DateTime? ActionTimestamp { get; set; }

        [Column("comments")]
        public string? Comments { get; set; }

        [Column("documents_uploaded", TypeName = "text[]")]
        public string[]? DocumentsUploaded { get; set; }

        [Column("is_current_stage")]
        public bool IsCurrentStage { get; set; } = false;

        [Column("completed")]
        public bool Completed { get; set; } = false;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("PreAuthId")]
        public virtual InsurancePreAuthorization? PreAuthorization { get; set; }
    }

    [Table("insurance_documents")]
    public class InsuranceDocument
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Required]
        [Column("pre_auth_id")]
        public Guid PreAuthId { get; set; }

        [Required]
        [Column("document_type")]
        [MaxLength(50)]
        public string DocumentType { get; set; } = string.Empty;

        [Required]
        [Column("document_name")]
        [MaxLength(200)]
        public string DocumentName { get; set; } = string.Empty;

        [Required]
        [Column("file_url")]
        public string FileUrl { get; set; } = string.Empty;

        [Column("file_size_bytes")]
        public long? FileSizeBytes { get; set; }

        [Column("mime_type")]
        [MaxLength(100)]
        public string? MimeType { get; set; }

        [Column("uploaded_by_user_id")]
        public Guid? UploadedByUserId { get; set; }

        [Column("uploaded_at")]
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        [Column("verified_by_user_id")]
        public Guid? VerifiedByUserId { get; set; }

        [Column("verified_at")]
        public DateTime? VerifiedAt { get; set; }

        [Column("is_verified")]
        public bool IsVerified { get; set; } = false;

        [Column("notes")]
        public string? Notes { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        [ForeignKey("PreAuthId")]
        public virtual InsurancePreAuthorization? PreAuthorization { get; set; }
    }

    [Table("tpa_communication_log")]
    public class TPACommunicationLog
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Required]
        [Column("pre_auth_id")]
        public Guid PreAuthId { get; set; }

        [Required]
        [Column("communication_date")]
        public DateTime CommunicationDate { get; set; } = DateTime.UtcNow;

        [Column("communication_type")]
        [MaxLength(30)]
        public string? CommunicationType { get; set; }

        [Column("direction")]
        [MaxLength(20)]
        public string? Direction { get; set; }

        [Column("hospital_contact_user_id")]
        public Guid? HospitalContactUserId { get; set; }

        [Column("tpa_contact_name")]
        [MaxLength(200)]
        public string? TPAContactName { get; set; }

        [Column("tpa_contact_phone")]
        [MaxLength(20)]
        public string? TPAContactPhone { get; set; }

        [Column("tpa_contact_email")]
        [MaxLength(200)]
        public string? TPAContactEmail { get; set; }

        [Column("subject")]
        [MaxLength(300)]
        public string? Subject { get; set; }

        [Column("message")]
        public string? Message { get; set; }

        [Column("requires_response")]
        public bool RequiresResponse { get; set; } = false;

        [Column("response_received")]
        public bool ResponseReceived { get; set; } = false;

        [Column("response_date")]
        public DateTime? ResponseDate { get; set; }

        [Column("response_text")]
        public string? ResponseText { get; set; }

        [Column("attachments_urls", TypeName = "text[]")]
        public string[]? AttachmentsUrls { get; set; }

        [Column("follow_up_required")]
        public bool FollowUpRequired { get; set; } = false;

        [Column("follow_up_date")]
        public DateTime? FollowUpDate { get; set; }

        [Column("follow_up_completed")]
        public bool FollowUpCompleted { get; set; } = false;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("PreAuthId")]
        public virtual InsurancePreAuthorization? PreAuthorization { get; set; }
    }
}
