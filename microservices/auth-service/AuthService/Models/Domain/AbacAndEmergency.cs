using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AuthService.Models.Identity;

namespace AuthService.Models.Domain
{
    /// <summary>
    /// Access Policy entity for Attribute-Based Access Control (ABAC)
    /// Enables dynamic, context-aware access control beyond simple RBAC
    /// </summary>
    [Table("access_policy")]
    public class AccessPolicy
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        // Policy Identification
        [Column("policy_name")]
        [MaxLength(255)]
        public string PolicyName { get; set; } = string.Empty;

        [Column("policy_code")]
        [MaxLength(100)]
        public string? PolicyCode { get; set; }

        [Column("description")]
        public string? Description { get; set; }

        // Policy Type
        [Column("policy_type")]
        [MaxLength(50)]
        public string PolicyType { get; set; } = "ContextBased"; 
        // Types: TimeBased, LocationBased, ContextBased, RiskBased, AttributeBased

        // Policy Rules (JSON)
        [Column("conditions", TypeName = "jsonb")]
        public string? Conditions { get; set; } // JSON: { "attribute": "value", "operator": "equals" }

        [Column("actions", TypeName = "jsonb")]
        public string? Actions { get; set; } // JSON: ["read", "write", "delete"]

        [Column("resources", TypeName = "jsonb")]
        public string? Resources { get; set; } // JSON: ["patient/*", "appointment/*"]

        // Policy Decision
        [Column("effect")]
        [MaxLength(20)]
        public string Effect { get; set; } = "Allow"; // Allow, Deny

        [Column("priority")]
        public int Priority { get; set; } = 100; // Higher number = higher priority

        // Scope
        [Column("applies_to_roles", TypeName = "jsonb")]
        public string? AppliesToRoles { get; set; } // JSON: ["doctor", "nurse"]

        [Column("applies_to_departments", TypeName = "jsonb")]
        public string? AppliesToDepartments { get; set; } // JSON: ["cardiology", "icu"]

        [Column("applies_to_users", TypeName = "jsonb")]
        public string? AppliesToUsers { get; set; } // JSON: [uuid array]

        // Time Constraints
        [Column("effective_from")]
        public DateTime? EffectiveFrom { get; set; }

        [Column("effective_until")]
        public DateTime? EffectiveUntil { get; set; }

        [Column("time_of_day_start")]
        public TimeSpan? TimeOfDayStart { get; set; } // For business hours policies

        [Column("time_of_day_end")]
        public TimeSpan? TimeOfDayEnd { get; set; }

        [Column("days_of_week")]
        [MaxLength(50)]
        public string? DaysOfWeek { get; set; } // "Mon,Tue,Wed,Thu,Fri"

        // Status & Activation
        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("is_system_policy")]
        public bool IsSystemPolicy { get; set; } = false;

        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "active";

        // Audit Fields
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("created_by_user_id")]
        public Guid? CreatedBy { get; set; }

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [Column("updated_by_user_id")]
        public Guid? UpdatedBy { get; set; }

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Evaluation Statistics
        [Column("evaluation_count")]
        public int EvaluationCount { get; set; } = 0;

        [Column("last_evaluated_at")]
        public DateTime? LastEvaluatedAt { get; set; }

        // Navigation Properties
        [ForeignKey("TenantId")]
        public virtual Tenant? Tenant { get; set; }

        [ForeignKey("CreatedBy")]
        public virtual AppUser? Creator { get; set; }

        [ForeignKey("UpdatedBy")]
        public virtual AppUser? Updater { get; set; }
    }

    /// <summary>
    /// Emergency Access entity for "break-the-glass" functionality
    /// Allows temporary elevated access in critical situations with full audit trail
    /// </summary>
    [Table("emergency_access")]
    public class EmergencyAccess
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Required]
        [Column("user_id")]
        public Guid UserId { get; set; }

        // Emergency Access Details
        [Column("access_code")]
        [MaxLength(50)]
        public string? AccessCode { get; set; } // Unique code for tracking

        [Required]
        [Column("reason")]
        public string Reason { get; set; } = string.Empty; // REQUIRED - justification

        [Column("emergency_type")]
        [MaxLength(100)]
        public string? EmergencyType { get; set; } // "Patient Critical", "System Failure", etc.

        [Column("patient_id")]
        public Guid? PatientId { get; set; } // If patient-specific

        // Permissions Granted (JSON)
        [Column("granted_permissions", TypeName = "jsonb")]
        public string? GrantedPermissions { get; set; } // JSON: ["patient.view", "patient.edit"]

        [Column("scope")]
        [MaxLength(50)]
        public string Scope { get; set; } = "Limited"; // Limited, Full, Specific

        // Time Constraints
        [Column("start_time")]
        public DateTime StartTime { get; set; } = DateTime.UtcNow;

        [Column("end_time")]
        public DateTime EndTime { get; set; } // Default: 1-4 hours from start

        [Column("duration_minutes")]
        public int DurationMinutes { get; set; } = 60; // Default 1 hour

        [Column("auto_revoke_enabled")]
        public bool AutoRevokeEnabled { get; set; } = true;

        // Approval Workflow
        [Column("requires_approval")]
        public bool RequiresApproval { get; set; } = true;

        [Column("approved_by")]
        public Guid? ApprovedBy { get; set; }

        [Column("approved_at")]
        public DateTime? ApprovedAt { get; set; }

        [Column("approval_notes")]
        public string? ApprovalNotes { get; set; }

        [Column("rejected_by")]
        public Guid? RejectedBy { get; set; }

        [Column("rejected_at")]
        public DateTime? RejectedAt { get; set; }

        [Column("rejection_reason")]
        public string? RejectionReason { get; set; }

        // Revocation
        [Column("revoked_at")]
        public DateTime? RevokedAt { get; set; }

        [Column("revoked_by")]
        public Guid? RevokedBy { get; set; }

        [Column("revocation_reason")]
        public string? RevocationReason { get; set; }

        // Status
        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "pending"; // pending, approved, active, expired, revoked, rejected

        [Column("is_active")]
        public bool IsActive { get; set; } = false;

        // Audit Trail (JSON)
        [Column("audit_trail", TypeName = "jsonb")]
        public string? AuditTrail { get; set; } // JSON: array of audit events

        [Column("actions_performed", TypeName = "jsonb")]
        public string? ActionsPerformed { get; set; } // JSON: all actions taken during emergency access

        // Notifications
        [Column("notification_sent")]
        public bool NotificationSent { get; set; } = false;

        [Column("notified_users", TypeName = "jsonb")]
        public string? NotifiedUsers { get; set; } // JSON: array of user IDs notified

        // Post-Access Review
        [Column("requires_review")]
        public bool RequiresReview { get; set; } = true;

        [Column("reviewed_by")]
        public Guid? ReviewedBy { get; set; }

        [Column("reviewed_at")]
        public DateTime? ReviewedAt { get; set; }

        [Column("review_notes")]
        public string? ReviewNotes { get; set; }

        [Column("review_status")]
        [MaxLength(20)]
        public string? ReviewStatus { get; set; } // approved, flagged, investigation_required

        // Risk Assessment
        [Column("risk_level")]
        [MaxLength(20)]
        public string RiskLevel { get; set; } = "High"; // High, Critical, Medium

        [Column("suspicious_activity")]
        public bool SuspiciousActivity { get; set; } = false;

        // Audit Fields
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        // Navigation Properties
        [ForeignKey("UserId")]
        public virtual AppUser? User { get; set; }

        [ForeignKey("TenantId")]
        public virtual Tenant? Tenant { get; set; }

        [ForeignKey("ApprovedBy")]
        public virtual AppUser? Approver { get; set; }

        [ForeignKey("RevokedBy")]
        public virtual AppUser? Revoker { get; set; }

        [ForeignKey("ReviewedBy")]
        public virtual AppUser? Reviewer { get; set; }

        [ForeignKey("RejectedBy")]
        public virtual AppUser? Rejecter { get; set; }
    }
}
