using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain
{
    /// <summary>
    /// Represents a surgery entry in the OT finalization pipeline.
    /// State machine: NotConfirmed → Confirmed → Finalised → OTPrepared (locked).
    /// Created automatically when a counselling session transitions to Done + Schedule.
    /// </summary>
    [Table("ot_finalize_schedule")]
    public class OtFinalizeSchedule
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Column("branch_id")]
        public Guid? BranchId { get; set; }

        // ── Patient (denormalized for display performance) ───────────────────

        [Required]
        [Column("patient_id")]
        public Guid PatientId { get; set; }

        [Column("uhid")]
        [MaxLength(100)]
        public string? Uhid { get; set; }

        [Required]
        [Column("patient_name")]
        [MaxLength(200)]
        public string PatientName { get; set; } = string.Empty;

        [Required]
        [Column("surgery_name")]
        [MaxLength(300)]
        public string SurgeryName { get; set; } = string.Empty;

        /// <summary>Eye: RE | LE | BE</summary>
        [Column("eye")]
        [MaxLength(10)]
        public string? Eye { get; set; }

        [Column("patient_type")]
        [MaxLength(100)]
        public string? PatientType { get; set; }

        [Column("payment_mode")]
        [MaxLength(100)]
        public string? PaymentMode { get; set; }

        // ── Team ─────────────────────────────────────────────────────────────

        /// <summary>FK to AspNetUsers — surgeon assigned to this case.</summary>
        [Column("doctor_id")]
        public Guid? DoctorId { get; set; }

        [Column("doctor_name")]
        [MaxLength(200)]
        public string? DoctorName { get; set; }

        /// <summary>FK to ot_theaters.</summary>
        [Column("theatre_id")]
        public Guid? TheatreId { get; set; }

        [Column("theatre_name")]
        [MaxLength(100)]
        public string? TheatreName { get; set; }

        // ── Timing ───────────────────────────────────────────────────────────

        [Column("start_time")]
        public DateTime? StartTime { get; set; }

        [Column("end_time")]
        public DateTime? EndTime { get; set; }

        /// <summary>Patient reporting time (prior to surgery start).</summary>
        [Column("reporting_time")]
        public TimeSpan? ReportingTime { get; set; }

        // ── Anesthesia + IOL ─────────────────────────────────────────────────

        [Column("anesthesia_type")]
        [MaxLength(100)]
        public string? AnesthesiaType { get; set; }

        [Column("anesthetist_name")]
        [MaxLength(200)]
        public string? AnesthetistName { get; set; }

        [Column("iol_power")]
        [MaxLength(50)]
        public string? IolPower { get; set; }

        // ── Notes / Cancellation ─────────────────────────────────────────────

        [Column("remarks")]
        public string? Remarks { get; set; }

        [Column("cancel_reason")]
        public string? CancelReason { get; set; }

        // ── Package snapshot ─────────────────────────────────────────────────

        [Column("package_name")]
        [MaxLength(300)]
        public string? PackageName { get; set; }

        [Column("package_rate")]
        public decimal? PackageRate { get; set; }

        // ── State machine ────────────────────────────────────────────────────

        /// <summary>
        /// NotConfirmed | Confirmed | Finalised | OTPrepared | Cancelled | SurgeryDone
        /// </summary>
        [Required]
        [Column("status")]
        [MaxLength(50)]
        public string Status { get; set; } = OtFinalizeStatus.NotConfirmed;

        // ── OT Prepare data ──────────────────────────────────────────────────

        [Column("sequence_no")]
        public int? SequenceNo { get; set; }

        [Column("is_locked")]
        public bool IsLocked { get; set; } = false;

        [Column("prepared_at")]
        public DateTime? PreparedAt { get; set; }

        [Column("prepared_by")]
        [MaxLength(200)]
        public string? PreparedBy { get; set; }

        // ── Optimistic versioning ────────────────────────────────────────────

        /// <summary>Incremented on every update to detect stale edits.</summary>
        [Column("version")]
        public int Version { get; set; } = 1;

        // ── Counselling link ─────────────────────────────────────────────────

        /// <summary>Reference back to the counselling session that originated this record.</summary>
        [Column("counselling_session_id")]
        public Guid? CounsellingSessionId { get; set; }

        // ── Standard audit columns (HIPAA) ───────────────────────────────────

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("created_by_user_id")]
        public Guid? CreatedByUserId { get; set; }

        [Column("updated_by_user_id")]
        public Guid? UpdatedByUserId { get; set; }

        /// <summary>Soft delete — NEVER hard-delete (HIPAA audit requirement).</summary>
        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }
    }

    /// <summary>
    /// Immutable audit trail for every state change in OT finalize schedule.
    /// </summary>
    [Table("ot_finalize_audit_log")]
    public class OtFinalizeAuditLog
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column("schedule_id")]
        public Guid ScheduleId { get; set; }

        /// <summary>
        /// Action type: Upsert | EditSlot | Confirm | Finalise | Cancel | Reopen | Prepare | BackSync
        /// </summary>
        [Required]
        [Column("action")]
        [MaxLength(50)]
        public string Action { get; set; } = string.Empty;

        [Column("old_status")]
        [MaxLength(50)]
        public string? OldStatus { get; set; }

        [Column("new_status")]
        [MaxLength(50)]
        public string? NewStatus { get; set; }

        /// <summary>JSON snapshot before the change.</summary>
        [Column("old_value", TypeName = "jsonb")]
        public string? OldValue { get; set; }

        /// <summary>JSON snapshot after the change.</summary>
        [Column("new_value", TypeName = "jsonb")]
        public string? NewValue { get; set; }

        [Column("changed_by")]
        [MaxLength(200)]
        public string? ChangedBy { get; set; }

        [Column("changed_by_id")]
        public Guid? ChangedById { get; set; }

        [Column("changed_at")]
        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>String constants for OtFinalizeSchedule.Status — avoids magic strings.</summary>
    public static class OtFinalizeStatus
    {
        public const string NotConfirmed = "NotConfirmed";
        public const string Confirmed    = "Confirmed";
        public const string Finalised    = "Finalised";
        public const string OTPrepared   = "OTPrepared";
        public const string Cancelled    = "Cancelled";
        public const string SurgeryDone  = "SurgeryDone";

        /// <summary>States that accept edits (not locked, not terminal).</summary>
        public static readonly string[] EditableStates = { NotConfirmed, Confirmed, Finalised };

        /// <summary>States where an OT record is still "active" (occupies the patient UPSERT slot).</summary>
        public static readonly string[] ActiveStates = { NotConfirmed, Confirmed, Finalised, OTPrepared };
    }
}
