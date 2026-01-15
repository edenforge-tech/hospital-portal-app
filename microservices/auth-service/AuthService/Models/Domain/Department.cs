using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AuthService.Models.Identity;

namespace AuthService.Models.Domain;

#region New Domain Entities for Approval Workflow & Audit Logging

/// <summary>
/// Department Access Request entity for approval workflow
/// Maps to department_access_request table from migration 04
/// </summary>
[Table("department_access_request")]
public class DepartmentAccessRequest
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("request_number")]
    [MaxLength(50)]
    public string RequestNumber { get; set; } = string.Empty;

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("department_id")]
    public Guid DepartmentId { get; set; }

    [Column("tenant_id")]
    public Guid TenantId { get; set; }

    [Column("branch_id")]
    public Guid? BranchId { get; set; }

    [Column("request_type")]
    [MaxLength(20)]
    public string RequestType { get; set; } = "New";

    [Column("justification")]
    public string Justification { get; set; } = string.Empty;

    [Column("requested_access_type")]
    [MaxLength(20)]
    public string RequestedAccessType { get; set; } = "Secondary";

    [Column("requested_can_view")]
    public bool RequestedCanView { get; set; } = true;

    [Column("requested_can_create")]
    public bool RequestedCanCreate { get; set; } = false;

    [Column("requested_can_edit")]
    public bool RequestedCanEdit { get; set; } = false;

    [Column("requested_can_delete")]
    public bool RequestedCanDelete { get; set; } = false;

    [Column("requested_can_approve")]
    public bool RequestedCanApprove { get; set; } = false;

    [Column("requested_can_export")]
    public bool RequestedCanExport { get; set; } = false;

    [Column("requested_access_start_date")]
    public DateTime? RequestedAccessStartDate { get; set; }

    [Column("requested_access_end_date")]
    public DateTime? RequestedAccessEndDate { get; set; }

    [Column("status")]
    [MaxLength(20)]
    public string Status { get; set; } = "Pending";

    [Column("priority")]
    [MaxLength(20)]
    public string Priority { get; set; } = "Normal";

    [Column("reviewed_by")]
    public Guid? ReviewedBy { get; set; }

    [Column("reviewed_at")]
    public DateTime? ReviewedAt { get; set; }

    [Column("reviewer_role")]
    [MaxLength(100)]
    public string? ReviewerRole { get; set; }

    [Column("review_notes")]
    public string? ReviewNotes { get; set; }

    [Column("rejection_reason")]
    public string? RejectionReason { get; set; }

    [Column("auto_approved")]
    public bool AutoApproved { get; set; } = false;

    [Column("auto_approval_reason")]
    public string? AutoApprovalReason { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("created_by")]
    public Guid CreatedBy { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("updated_by")]
    public Guid? UpdatedBy { get; set; }

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    [Column("deleted_by")]
    public Guid? DeletedBy { get; set; }

    // Navigation properties
    [ForeignKey("UserId")]
    public virtual AppUser? User { get; set; }

    [ForeignKey("DepartmentId")]
    public virtual Department? Department { get; set; }

    [ForeignKey("ReviewedBy")]
    public virtual AppUser? ReviewedByUser { get; set; }
}

/// <summary>
/// Department Access Audit Log entity for comprehensive audit trail
/// Maps to department_access_audit_log table from migration 04
/// </summary>
[Table("department_access_audit_log")]
public class DepartmentAccessAuditLog
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("audit_number")]
    [MaxLength(50)]
    public string AuditNumber { get; set; } = string.Empty;

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("department_id")]
    public Guid DepartmentId { get; set; }

    [Column("tenant_id")]
    public Guid TenantId { get; set; }

    [Column("branch_id")]
    public Guid? BranchId { get; set; }

    [Column("department_access_id")]
    public Guid? DepartmentAccessId { get; set; }

    [Column("action")]
    [MaxLength(50)]
    public string Action { get; set; } = string.Empty;

    [Column("action_category")]
    [MaxLength(30)]
    public string ActionCategory { get; set; } = string.Empty;

    [Column("previous_state", TypeName = "jsonb")]
    public string? PreviousState { get; set; }

    [Column("new_state", TypeName = "jsonb")]
    public string? NewState { get; set; }

    [Column("changes_summary")]
    public string? ChangesSummary { get; set; }

    [Column("justification")]
    public string? Justification { get; set; }

    [Column("approval_request_id")]
    public Guid? ApprovalRequestId { get; set; }

    [Column("performed_by")]
    public Guid PerformedBy { get; set; }

    [Column("performed_by_role")]
    [MaxLength(100)]
    public string? PerformedByRole { get; set; }

    [Column("performed_by_ip")]
    [MaxLength(45)]
    public string? PerformedByIp { get; set; }

    [Column("user_agent")]
    public string? UserAgent { get; set; }

    [Column("compliance_flags", TypeName = "jsonb")]
    public string? ComplianceFlags { get; set; }

    [Column("compliance_note")]
    public string? ComplianceNote { get; set; }

    [Column("security_classification")]
    [MaxLength(30)]
    public string? SecurityClassification { get; set; }

    [Column("is_emergency_access")]
    public bool IsEmergencyAccess { get; set; } = false;

    [Column("was_approved")]
    public bool? WasApproved { get; set; }

    [Column("approved_by")]
    public Guid? ApprovedBy { get; set; }

    [Column("approved_at")]
    public DateTime? ApprovedAt { get; set; }

    [Column("timestamp")]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    [Column("session_id")]
    [MaxLength(100)]
    public string? SessionId { get; set; }

    [Column("correlation_id")]
    [MaxLength(100)]
    public string? CorrelationId { get; set; }

    // Navigation properties
    [ForeignKey("UserId")]
    public virtual AppUser? User { get; set; }

    [ForeignKey("DepartmentId")]
    public virtual Department? Department { get; set; }

    [ForeignKey("PerformedBy")]
    public virtual AppUser? PerformedByUser { get; set; }
}

#endregion

[Table("department")]
public class Department
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Required]
    [Column("department_code")]
    [MaxLength(50)]
    public string DepartmentCode { get; set; } = string.Empty;

    [Required]
    [Column("department_name")]
    [MaxLength(200)]
    public string DepartmentName { get; set; } = string.Empty;

    // Alias for compatibility
    public string Name => DepartmentName;

    [Column("department_type")]
    [MaxLength(100)]
    public string DepartmentType { get; set; } = string.Empty;

    [Column("description")]
    public string? Description { get; set; }

    [Column("status")]
    [MaxLength(50)]
    public string Status { get; set; } = "Active";

    [Column("parent_department_id")]
    public Guid? ParentDepartmentId { get; set; }

    [Column("department_head_id")]
    public Guid? DepartmentHeadId { get; set; }

    [Column("operating_hours_start")]
    public TimeSpan? OperatingHoursStart { get; set; }

    [Column("operating_hours_end")]
    public TimeSpan? OperatingHoursEnd { get; set; }

    [Column("days_of_operation")]
    public string? DaysOfOperation { get; set; }

    [Column("is_24x7")]
    public bool Is24x7 { get; set; }

    [Column("annual_budget")]
    public decimal? AnnualBudget { get; set; }

    [Column("budget_currency")]
    [MaxLength(3)]
    public string? BudgetCurrency { get; set; }

    [Column("requires_approval")]
    public bool RequiresApproval { get; set; }

    [Column("approval_level")]
    public int? ApprovalLevel { get; set; }

    [Column("auto_approval_threshold")]
    public decimal? AutoApprovalThreshold { get; set; }

    [Column("max_concurrent_patients")]
    public int? MaxConcurrentPatients { get; set; }

    [Column("waiting_room_capacity")]
    public int? WaitingRoomCapacity { get; set; }

    [Required]
    [Column("tenant_id")]
    public Guid TenantId { get; set; }

    [Column("branch_id")]
    public Guid? BranchId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("created_by")]
    public Guid? CreatedBy { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("updated_by")]
    public Guid? UpdatedBy { get; set; }

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    [Column("deleted_by")]
    public Guid? DeletedBy { get; set; }

    [Column("change_reason")]
    public string? ChangeReason { get; set; }

    // ============================================================================
    // HIERARCHY FIELDS (Added per migration 03_restructure_departments_14_standards.sql)
    // ============================================================================
    [Column("is_standard_department")]
    public bool IsStandardDepartment { get; set; } = false;

    [Column("department_level")]
    public int DepartmentLevel { get; set; } = 1; // 1=standard, 2=sub-department

    [Column("display_order")]
    public int? DisplayOrder { get; set; }

    [Column("icon")]
    [MaxLength(100)]
    public string? Icon { get; set; }

    [Column("color")]
    [MaxLength(20)]
    public string? Color { get; set; }

    [Column("inherit_permissions")]
    public bool InheritPermissions { get; set; } = true;

    [Column("can_have_subdepartments")]
    public bool CanHaveSubdepartments { get; set; } = false;

    // Navigation properties
    [ForeignKey("ParentDepartmentId")]
    public virtual Department? ParentDepartment { get; set; }

    public virtual ICollection<Department> SubDepartments { get; set; } = new List<Department>();

    public virtual ICollection<UserDepartment> UserDepartmentAccesses { get; set; } = new List<UserDepartment>();

    [ForeignKey("TenantId")]
    public virtual Tenant? Tenant { get; set; }

    [ForeignKey("BranchId")]
    public virtual Branch? Branch { get; set; }
}

/// <summary>
/// User Department Access entity matching department_access table
/// from migration 03_restructure_departments_14_standards.sql
/// </summary>
[Table("department_access")]
public class UserDepartment
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Required]
    [Column("tenant_id")]
    public Guid TenantId { get; set; }

    [Column("branch_id")]
    public Guid? BranchId { get; set; }

    [Required]
    [Column("user_id")]
    public Guid UserId { get; set; }

    [Required]
    [Column("department_id")]
    public Guid DepartmentId { get; set; }

    // Access Type: 'Primary' or 'Secondary' (per migration 03)
    [Column("access_type")]
    [MaxLength(20)]
    public string AccessType { get; set; } = "Secondary";

    // Computed property - true when AccessType is 'Primary'
    [NotMapped]
    public bool IsPrimary
    {
        get => AccessType == "Primary";
        set => AccessType = value ? "Primary" : "Secondary";
    }

    // Granular Permissions
    [Column("can_view")]
    public bool CanView { get; set; } = true;

    [Column("can_create")]
    public bool CanCreate { get; set; } = false;

    [Column("can_edit")]
    public bool CanEdit { get; set; } = false;

    [Column("can_delete")]
    public bool CanDelete { get; set; } = false;

    [Column("can_approve")]
    public bool CanApprove { get; set; } = false;

    [Column("can_export")]
    public bool CanExport { get; set; } = false;

    // Time-bound Access
    [Column("access_start_date")]
    public DateTime? AccessStartDate { get; set; }

    [Column("access_end_date")]
    public DateTime? AccessEndDate { get; set; }

    // Approval Workflow
    [Column("approved_by")]
    public Guid? ApprovedBy { get; set; }

    [Column("approved_at")]
    public DateTime? ApprovedAt { get; set; }

    [Column("approval_notes")]
    public string? ApprovalNotes { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("status")]
    [MaxLength(20)]
    public string Status { get; set; } = "active";

    // Audit Fields
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("created_by")]
    public Guid? CreatedBy { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("updated_by")]
    public Guid? UpdatedBy { get; set; }

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    [Column("deleted_by")]
    public Guid? RevokedBy { get; set; }

    // Compatibility with old schema
    [NotMapped]
    public DateTime AssignedOn => CreatedAt;

    [NotMapped]
    public Guid? AssignedBy => CreatedBy;

    [NotMapped]
    public string AccessLevel => AccessType; // Alias

    // Navigation properties
    [ForeignKey("UserId")]
    public virtual AppUser? User { get; set; }

    [ForeignKey("DepartmentId")]
    public virtual Department? Department { get; set; }

    [ForeignKey("TenantId")]
    public virtual Tenant? Tenant { get; set; }

    [ForeignKey("BranchId")]
    public virtual Branch? Branch { get; set; }

    [ForeignKey("ApprovedBy")]
    public virtual AppUser? Approver { get; set; }

    [ForeignKey("CreatedBy")]
    public virtual AppUser? Creator { get; set; }
}
