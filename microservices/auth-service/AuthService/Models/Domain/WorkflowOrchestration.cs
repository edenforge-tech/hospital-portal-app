using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain
{
    [Table("counseling_workflow_state")]
    public class CounselingWorkflowState
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

        // Session Link
        [Required]
        [Column("session_id")]
        public Guid SessionId { get; set; }

        [Required]
        [Column("patient_id")]
        public Guid PatientId { get; set; }

        // Current State (18 possible states)
        [Required]
        [Column("current_state")]
        [MaxLength(50)]
        public string CurrentState { get; set; } = "SessionStarted";

        // Stage Tracking (TEXT[] arrays)
        [Column("stages_completed")]
        public string[]? StagesCompleted { get; set; }

        [Column("stages_pending")]
        public string[]? StagesPending { get; set; }

        [Column("stages_blocked")]
        public string[]? StagesBlocked { get; set; }

        // Dependency Checking (JSONB)
        [Column("dependencies_check", TypeName = "jsonb")]
        public string? DependenciesCheck { get; set; }

        [Column("blocking_reasons", TypeName = "jsonb")]
        public string? BlockingReasons { get; set; }

        // Progress Tracking
        [Column("progress_percentage")]
        public int ProgressPercentage { get; set; } = 0;

        [Column("milestones_achieved")]
        public int MilestonesAchieved { get; set; } = 0;

        [Column("total_milestones")]
        public int TotalMilestones { get; set; } = 16;

        // Milestone Timestamps
        [Column("assessment_completed_at")]
        public DateTime? AssessmentCompletedAt { get; set; }

        [Column("package_built_at")]
        public DateTime? PackageBuiltAt { get; set; }

        [Column("documents_collected_at")]
        public DateTime? DocumentsCollectedAt { get; set; }

        [Column("tests_ordered_at")]
        public DateTime? TestsOrderedAt { get; set; }

        [Column("tests_completed_at")]
        public DateTime? TestsCompletedAt { get; set; }

        [Column("fitness_obtained_at")]
        public DateTime? FitnessObtainedAt { get; set; }

        [Column("ot_booked_at")]
        public DateTime? OtBookedAt { get; set; }

        [Column("payment_initiated_at")]
        public DateTime? PaymentInitiatedAt { get; set; }

        [Column("payment_completed_at")]
        public DateTime? PaymentCompletedAt { get; set; }

        [Column("insurance_processed_at")]
        public DateTime? InsuranceProcessedAt { get; set; }

        [Column("consents_signed_at")]
        public DateTime? ConsentsSignedAt { get; set; }

        [Column("admission_scheduled_at")]
        public DateTime? AdmissionScheduledAt { get; set; }

        [Column("ready_for_surgery_at")]
        public DateTime? ReadyForSurgeryAt { get; set; }

        [Column("session_completed_at")]
        public DateTime? SessionCompletedAt { get; set; }

        // Issues Tracking
        [Column("has_blocking_issues")]
        public bool HasBlockingIssues { get; set; } = false;

        [Column("blocking_issue_count")]
        public int BlockingIssueCount { get; set; } = 0;

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

    [Table("workflow_stage_transitions")]
    public class WorkflowStageTransition
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        // Workflow Link
        [Required]
        [Column("workflow_id")]
        public Guid WorkflowId { get; set; }

        [Required]
        [Column("session_id")]
        public Guid SessionId { get; set; }

        // Transition Details
        [Required]
        [Column("from_state")]
        [MaxLength(50)]
        public string FromState { get; set; } = null!;

        [Required]
        [Column("to_state")]
        [MaxLength(50)]
        public string ToState { get; set; } = null!;

        // Trigger
        [Column("triggered_by")]
        [MaxLength(50)]
        public string? TriggeredBy { get; set; } // UserAction, SystemEvent, Automation

        [Column("trigger_details")]
        public string? TriggerDetails { get; set; }

        // Notes
        [Column("transition_notes")]
        public string? TransitionNotes { get; set; }

        // Audit Fields
        [Required]
        [Column("transitioned_at")]
        public DateTime TransitionedAt { get; set; }

        [Column("transitioned_by_user_id")]
        public Guid? TransitionedByUserId { get; set; }
    }
}
