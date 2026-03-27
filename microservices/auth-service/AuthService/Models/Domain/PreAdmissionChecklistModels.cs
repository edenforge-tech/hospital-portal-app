using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain
{
    /// <summary>
    /// Dynamic checklist templates that replace the hardcoded 8-item list.
    /// Maps to: pre_admission_checklist_templates table (Migration 66)
    /// </summary>
    [Table("pre_admission_checklist_templates")]
    public class PreAdmissionChecklistTemplate
    {
        [Column("id")]
        public Guid Id { get; set; }

        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Column("template_name")]
        [MaxLength(200)]
        public string TemplateName { get; set; } = null!;

        [Column("description")]
        public string? Description { get; set; }

        [Column("patient_type")]
        [MaxLength(50)]
        public string? PatientType { get; set; }

        [Column("surgery_category")]
        [MaxLength(100)]
        public string? SurgeryCategory { get; set; }

        [Column("min_patient_age")]
        public int? MinPatientAge { get; set; }

        [Column("max_patient_age")]
        public int? MaxPatientAge { get; set; }

        [Column("applies_to_eye")]
        [MaxLength(10)]
        public string? AppliesToEye { get; set; }

        [Column("display_order")]
        public int DisplayOrder { get; set; } = 0;

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("created_by_user_id")]
        public Guid? CreatedByUserId { get; set; }

        [Column("updated_by_user_id")]
        public Guid? UpdatedByUserId { get; set; }

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "active";
    }

    /// <summary>
    /// Individual line items belonging to a checklist template.
    /// Maps to: pre_admission_checklist_items table (Migration 66)
    /// </summary>
    [Table("pre_admission_checklist_items")]
    public class PreAdmissionChecklistItem
    {
        [Column("id")]
        public Guid Id { get; set; }

        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Column("template_id")]
        public Guid TemplateId { get; set; }

        [Column("item_key")]
        [MaxLength(100)]
        public string ItemKey { get; set; } = null!;

        [Column("item_label")]
        [MaxLength(200)]
        public string ItemLabel { get; set; } = null!;

        [Column("description")]
        public string? Description { get; set; }

        [Column("department_owner")]
        [MaxLength(100)]
        public string? DepartmentOwner { get; set; }

        [Column("department_color")]
        [MaxLength(50)]
        public string? DepartmentColor { get; set; }

        [Column("is_mandatory")]
        public bool IsMandatory { get; set; } = true;

        [Column("is_blocking")]
        public bool IsBlocking { get; set; } = false;

        [Column("applies_if_age_below")]
        public int? AppliesIfAgeBelow { get; set; }

        [Column("requires_document")]
        public bool RequiresDocument { get; set; } = false;

        [Column("display_order")]
        public int DisplayOrder { get; set; } = 0;

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        // Workflow step columns (migration 73)
        [Column("workflow_step")]
        public int? WorkflowStep { get; set; }

        [Column("step_title")]
        [MaxLength(120)]
        public string? StepTitle { get; set; }

        [Column("step_widget_component")]
        [MaxLength(100)]
        public string? StepWidgetComponent { get; set; }

        [Column("requires_dept_notification")]
        public bool RequiresDeptNotification { get; set; } = false;

        [Column("notification_department")]
        [MaxLength(50)]
        public string? NotificationDepartment { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("created_by_user_id")]
        public Guid? CreatedByUserId { get; set; }

        [Column("updated_by_user_id")]
        public Guid? UpdatedByUserId { get; set; }

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "active";
    }

    /// <summary>
    /// Per-schedule completion tracking for each checklist item.
    /// Maps to: ot_admission_checklist_completions table (Migration 66)
    /// </summary>
    [Table("ot_admission_checklist_completions")]
    public class OtAdmissionChecklistCompletion
    {
        [Column("id")]
        public Guid Id { get; set; }

        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Column("schedule_id")]
        public Guid ScheduleId { get; set; }

        [Column("item_id")]
        public Guid ItemId { get; set; }

        [Column("template_id")]
        public Guid TemplateId { get; set; }

        [Column("is_complete")]
        public bool IsComplete { get; set; } = false;

        [Column("completed_by_user_id")]
        public Guid? CompletedByUserId { get; set; }

        [Column("completed_at")]
        public DateTime? CompletedAt { get; set; }

        [Column("completed_by_dept")]
        [MaxLength(100)]
        public string? CompletedByDept { get; set; }

        [Column("document_url")]
        public string? DocumentUrl { get; set; }

        [Column("notes")]
        public string? Notes { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("created_by_user_id")]
        public Guid? CreatedByUserId { get; set; }

        [Column("updated_by_user_id")]
        public Guid? UpdatedByUserId { get; set; }

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "active";
    }

    /// <summary>
    /// New insurance pre-authorization requests table (different from legacy InsurancePreAuthorization).
    /// Maps to: insurance_preauth_requests table (Migration 67)
    /// </summary>
    [Table("insurance_preauth_requests")]
    public class InsurancePreauthRequest
    {
        [Column("id")]
        public Guid Id { get; set; }

        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Column("session_id")]
        public Guid SessionId { get; set; }

        [Column("schedule_id")]
        public Guid? ScheduleId { get; set; }

        [Column("patient_id")]
        public Guid? PatientId { get; set; }

        [Column("insurance_provider")]
        [MaxLength(200)]
        public string InsuranceProvider { get; set; } = null!;

        [Column("tpa_name")]
        [MaxLength(200)]
        public string? TpaName { get; set; }

        [Column("policy_number")]
        [MaxLength(100)]
        public string PolicyNumber { get; set; } = null!;

        [Column("member_id")]
        [MaxLength(100)]
        public string? MemberId { get; set; }

        [Column("group_number")]
        [MaxLength(100)]
        public string? GroupNumber { get; set; }

        [Column("preauth_request_number")]
        [MaxLength(100)]
        public string? PreauthRequestNumber { get; set; }

        [Column("insurer_reference_number")]
        [MaxLength(100)]
        public string? InsurerReferenceNumber { get; set; }

        [Column("proposed_surgery_name")]
        [MaxLength(200)]
        public string? ProposedSurgeryName { get; set; }

        [Column("proposed_icd_code")]
        [MaxLength(20)]
        public string? ProposedIcdCode { get; set; }

        [Column("proposed_cpt_codes", TypeName = "jsonb")]
        public string? ProposedCptCodes { get; set; }

        [Column("estimated_cost")]
        public decimal? EstimatedCost { get; set; }

        [Column("requested_amount")]
        public decimal? RequestedAmount { get; set; }

        [Column("preauth_status")]
        [MaxLength(30)]
        public string PreauthStatus { get; set; } = "Draft";

        [Column("applied_at")]
        public DateTime? AppliedAt { get; set; }

        [Column("last_status_change_at")]
        public DateTime? LastStatusChangeAt { get; set; }

        [Column("responded_at")]
        public DateTime? RespondedAt { get; set; }

        [Column("expiry_date", TypeName = "date")]
        public DateTime? ExpiryDate { get; set; }

        [Column("approved_amount")]
        public decimal? ApprovedAmount { get; set; }

        [Column("approved_procedures", TypeName = "jsonb")]
        public string? ApprovedProcedures { get; set; }

        [Column("rejection_reason")]
        public string? RejectionReason { get; set; }

        [Column("rejection_code")]
        [MaxLength(50)]
        public string? RejectionCode { get; set; }

        [Column("pending_docs_list", TypeName = "jsonb")]
        public string? PendingDocsList { get; set; }

        [Column("documents_submitted", TypeName = "jsonb")]
        public string DocumentsSubmitted { get; set; } = "[]";

        [Column("insurer_contact_name")]
        [MaxLength(200)]
        public string? InsurerContactName { get; set; }

        [Column("insurer_contact_phone")]
        [MaxLength(20)]
        public string? InsurerContactPhone { get; set; }

        [Column("insurer_contact_email")]
        [MaxLength(200)]
        public string? InsurerContactEmail { get; set; }

        [Column("notes")]
        public string? Notes { get; set; }

        // Migration 73 — InitialApproved / FinalApproved split columns
        [Column("initial_approval_at")]
        public DateTime? InitialApprovalAt { get; set; }

        [Column("initial_approved_amount")]
        public decimal? InitialApprovedAmount { get; set; }

        [Column("initial_approved_by")]
        [MaxLength(200)]
        public string? InitialApprovedBy { get; set; }

        [Column("final_approval_at")]
        public DateTime? FinalApprovalAt { get; set; }

        [Column("final_approved_amount")]
        public decimal? FinalApprovedAmount { get; set; }

        [Column("final_approved_by")]
        [MaxLength(200)]
        public string? FinalApprovedBy { get; set; }

        [Column("discharge_hold")]
        public bool DischargeHold { get; set; } = false;

        [Column("schedule_override")]
        public bool? ScheduleOverride { get; set; }

        [Column("override_reason")]
        public string? OverrideReason { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("created_by_user_id")]
        public Guid? CreatedByUserId { get; set; }

        [Column("updated_by_user_id")]
        public Guid? UpdatedByUserId { get; set; }

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "active";
    }

    /// <summary>
    /// patient_upload_links — shareable scan upload tokens for Step 2.
    /// Migration 73, §4.
    /// </summary>
    [Table("patient_upload_links")]
    public class PatientUploadLink
    {
        [Column("id")]
        public Guid Id { get; set; }

        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Column("branch_id")]
        public Guid? BranchId { get; set; }

        [Column("schedule_id")]
        public Guid? ScheduleId { get; set; }

        [Column("session_id")]
        public Guid? SessionId { get; set; }

        [Column("patient_id")]
        public Guid PatientId { get; set; }

        [Column("link_token")]
        [MaxLength(200)]
        public string LinkToken { get; set; } = null!;

        [Column("link_url")]
        public string LinkUrl { get; set; } = null!;

        [Column("purpose")]
        [MaxLength(100)]
        public string Purpose { get; set; } = "pre_op_documents";

        [Column("description")]
        public string? Description { get; set; }

        [Column("expires_at")]
        public DateTime ExpiresAt { get; set; }

        [Column("used_at")]
        public DateTime? UsedAt { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("uploaded_files", TypeName = "jsonb")]
        public string UploadedFiles { get; set; } = "[]";

        [Column("file_count")]
        public int FileCount { get; set; } = 0;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("created_by_user_id")]
        public Guid? CreatedByUserId { get; set; }

        [Column("updated_by_user_id")]
        public Guid? UpdatedByUserId { get; set; }

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "active";
    }
}
