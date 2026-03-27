using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain
{
    [Table("ot_theaters")]
    public class OTTheater
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
        [Column("theater_name")]
        [MaxLength(100)]
        public string TheaterName { get; set; } = string.Empty;

        [Column("theater_code")]
        [MaxLength(50)]
        public string? TheaterCode { get; set; }

        [Column("floor_number")]
        public int? FloorNumber { get; set; }

        [Column("location_description")]
        public string? LocationDescription { get; set; }

        [Column("specialization")]
        [MaxLength(100)]
        public string? Specialization { get; set; }

        [Column("surgery_types_supported", TypeName = "text[]")]
        public string[]? SurgeryTypesSupported { get; set; }

        [Column("equipment_list", TypeName = "jsonb")]
        public string? EquipmentList { get; set; }

        [Column("max_surgeries_per_day")]
        public int MaxSurgeriesPerDay { get; set; } = 8;

        [Column("standard_surgery_duration_minutes")]
        public int StandardSurgeryDurationMinutes { get; set; } = 45;

        [Column("cleaning_time_between_surgeries_minutes")]
        public int CleaningTimeBetweenSurgeriesMinutes { get; set; } = 30;

        [Column("operation_start_time")]
        public TimeSpan OperationStartTime { get; set; } = new TimeSpan(8, 0, 0);

        [Column("operation_end_time")]
        public TimeSpan OperationEndTime { get; set; } = new TimeSpan(18, 0, 0);

        [Column("operating_days", TypeName = "text[]")]
        public string[]? OperatingDays { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("is_operational")]
        public bool IsOperational { get; set; } = true;

        [Column("maintenance_mode")]
        public bool MaintenanceMode { get; set; } = false;

        [Column("maintenance_reason")]
        public string? MaintenanceReason { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("created_by_user_id")]
        public Guid? CreatedByUserId { get; set; }

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [Column("updated_by_user_id")]
        public Guid? UpdatedByUserId { get; set; }

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }
    }

    [Table("ot_schedules")]
    public class OTSchedule
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
        [Column("theater_id")]
        public Guid TheaterId { get; set; }

        [Column("session_id")]
        public Guid? SessionId { get; set; }

        [Column("booking_id")]
        public Guid? BookingId { get; set; }

        [Column("patient_id")]
        public Guid? PatientId { get; set; }

        [Column("schedule_number")]
        [MaxLength(50)]
        public string? ScheduleNumber { get; set; }

        [Required]
        [Column("scheduled_date")]
        public DateTime ScheduledDate { get; set; }

        [Required]
        [Column("start_time")]
        public TimeSpan StartTime { get; set; }

        [Required]
        [Column("end_time")]
        public TimeSpan EndTime { get; set; }

        [Required]
        [Column("duration_minutes")]
        public int DurationMinutes { get; set; }

        [Required]
        [Column("surgery_type")]
        [MaxLength(100)]
        public string SurgeryType { get; set; } = string.Empty;

        [Column("procedure_description")]
        public string? ProcedureDescription { get; set; }

        [Column("eye_operated")]
        [MaxLength(10)]
        public string? EyeOperated { get; set; }

        [Required]
        [Column("surgeon_id")]
        public Guid SurgeonId { get; set; }

        [Column("anesthesiologist_id")]
        public Guid? AnesthesiologistId { get; set; }

        [Column("ot_technician_id")]
        public Guid? OTTechnicianId { get; set; }

        [Column("nursing_staff_ids")]
        public Guid[]? NursingStaffIds { get; set; }

        [Column("equipment_reserved", TypeName = "jsonb")]
        public string? EquipmentReserved { get; set; }

        [Column("iol_reserved_id")]
        public Guid? IOLReservedId { get; set; }

        [Column("status")]
        [MaxLength(30)]
        public string Status { get; set; } = "Booked";

        [Column("booking_confirmed_by_user_id")]
        public Guid? BookingConfirmedByUserId { get; set; }

        [Column("confirmation_timestamp")]
        public DateTime? ConfirmationTimestamp { get; set; }

        [Column("cancelled_at")]
        public DateTime? CancelledAt { get; set; }

        [Column("cancelled_by_user_id")]
        public Guid? CancelledByUserId { get; set; }

        [Column("cancellation_reason")]
        public string? CancellationReason { get; set; }

        [Column("surgery_started_at")]
        public DateTime? SurgeryStartedAt { get; set; }

        [Column("surgery_completed_at")]
        public DateTime? SurgeryCompletedAt { get; set; }

        [Column("actual_duration_minutes")]
        public int? ActualDurationMinutes { get; set; }

        [Column("complications")]
        public string? Complications { get; set; }

        [Column("outcome")]
        [MaxLength(50)]
        public string? Outcome { get; set; }

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

        // Workflow summary columns (migration 73)
        [Column("workflow_steps_completed")]
        public int WorkflowStepsCompleted { get; set; } = 0;

        [Column("workflow_total_steps")]
        public int WorkflowTotalSteps { get; set; } = 6;

        [Column("workflow_on_hold")]
        public bool WorkflowOnHold { get; set; } = false;

        [Column("workflow_hold_reason")]
        public string? WorkflowHoldReason { get; set; }

        [Column("workflow_last_updated_at")]
        public DateTime? WorkflowLastUpdatedAt { get; set; }

        [ForeignKey("TheaterId")]
        public virtual OTTheater? Theater { get; set; }

        [ForeignKey("SessionId")]
        public virtual CounselingSession? CounselingSession { get; set; }
    }

    [Table("ot_booking_validations")]
    public class OTBookingValidation
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Required]
        [Column("schedule_id")]
        public Guid ScheduleId { get; set; }

        [Required]
        [Column("session_id")]
        public Guid SessionId { get; set; }

        [Required]
        [Column("validation_timestamp")]
        public DateTime ValidationTimestamp { get; set; } = DateTime.UtcNow;

        [Column("validated_by_user_id")]
        public Guid? ValidatedByUserId { get; set; }

        [Required]
        [Column("checks_passed", TypeName = "jsonb")]
        public string ChecksPassed { get; set; } = "{}";

        [Column("blocking_issues", TypeName = "text[]")]
        public string[]? BlockingIssues { get; set; }

        [Column("warning_issues", TypeName = "text[]")]
        public string[]? WarningIssues { get; set; }

        [Column("can_proceed")]
        public bool CanProceed { get; set; } = false;

        [Column("requires_attention")]
        public bool RequiresAttention { get; set; } = false;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ── Stock / IOL columns (added in migration 68) ──────────────────────

        [Column("stock_check_status")]
        [MaxLength(30)]
        public string? StockCheckStatus { get; set; } = "Pending";

        [Column("stock_confirmed_by")]
        public Guid? StockConfirmedBy { get; set; }

        [Column("stock_confirmed_at")]
        public DateTime? StockConfirmedAt { get; set; }

        [Column("iol_model")]
        [MaxLength(100)]
        public string? IolModel { get; set; }

        [Column("iol_power")]
        public decimal? IolPower { get; set; }

        [Column("iol_side")]
        [MaxLength(5)]
        public string? IolSide { get; set; }

        [Column("iol_master_id")]
        public Guid? IolMasterId { get; set; }

        [Column("stock_notes")]
        public string? StockNotes { get; set; }

        [Column("preop_instructions_given")]
        public bool PreopInstructionsGiven { get; set; } = false;

        [Column("preop_instructions_given_at")]
        public DateTime? PreopInstructionsGivenAt { get; set; }

        [Column("preop_instructions_given_by")]
        public Guid? PreopInstructionsGivenBy { get; set; }

        // ── Navigation properties ─────────────────────────────────────────────

        [ForeignKey("ScheduleId")]
        public virtual OTSchedule? Schedule { get; set; }

        [ForeignKey("SessionId")]
        public virtual CounselingSession? CounselingSession { get; set; }

        [ForeignKey("IolMasterId")]
        public virtual IolMaster? IolMaster { get; set; }
    }

    [Table("ot_equipment_availability")]
    public class OTEquipmentAvailability
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Required]
        [Column("theater_id")]
        public Guid TheaterId { get; set; }

        [Required]
        [Column("equipment_name")]
        [MaxLength(200)]
        public string EquipmentName { get; set; } = string.Empty;

        [Column("equipment_model")]
        [MaxLength(200)]
        public string? EquipmentModel { get; set; }

        [Column("equipment_serial_number")]
        [MaxLength(100)]
        public string? EquipmentSerialNumber { get; set; }

        [Column("is_functional")]
        public bool IsFunctional { get; set; } = true;

        [Column("current_status")]
        [MaxLength(30)]
        public string? CurrentStatus { get; set; }

        [Column("last_serviced_at")]
        public DateTime? LastServicedAt { get; set; }

        [Column("next_service_due")]
        public DateTime? NextServiceDue { get; set; }

        [Column("maintenance_schedule")]
        [MaxLength(50)]
        public string? MaintenanceSchedule { get; set; }

        [Column("service_provider")]
        [MaxLength(200)]
        public string? ServiceProvider { get; set; }

        [Column("total_usage_hours")]
        public decimal TotalUsageHours { get; set; } = 0;

        [Column("last_used_at")]
        public DateTime? LastUsedAt { get; set; }

        [Column("notes")]
        public string? Notes { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        [ForeignKey("TheaterId")]
        public virtual OTTheater? Theater { get; set; }
    }

    [Table("ot_collision_logs")]
    public class OTCollisionLog
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Required]
        [Column("theater_id")]
        public Guid TheaterId { get; set; }

        [Required]
        [Column("collision_date")]
        public DateTime CollisionDate { get; set; }

        [Required]
        [Column("collision_time")]
        public TimeSpan CollisionTime { get; set; }

        [Column("existing_schedule_id")]
        public Guid? ExistingScheduleId { get; set; }

        [Column("attempted_schedule_data", TypeName = "jsonb")]
        public string? AttemptedScheduleData { get; set; }

        [Column("collision_type")]
        [MaxLength(50)]
        public string? CollisionType { get; set; }

        [Column("detected_by_user_id")]
        public Guid? DetectedByUserId { get; set; }

        [Required]
        [Column("detected_at")]
        public DateTime DetectedAt { get; set; } = DateTime.UtcNow;

        [Column("resolved")]
        public bool Resolved { get; set; } = false;

        [Column("resolved_at")]
        public DateTime? ResolvedAt { get; set; }

        [Column("resolution_action")]
        [MaxLength(100)]
        public string? ResolutionAction { get; set; }

        [Column("resolution_notes")]
        public string? ResolutionNotes { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("TheaterId")]
        public virtual OTTheater? Theater { get; set; }

        [ForeignKey("ExistingScheduleId")]
        public virtual OTSchedule? ExistingSchedule { get; set; }
    }
}
