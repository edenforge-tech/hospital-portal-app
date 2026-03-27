using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain
{
    [Table("patient_admissions")]
    public class PatientAdmission
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

        [Column("ot_schedule_id")]
        public Guid? OtScheduleId { get; set; }

        // Admission Details
        [Column("admission_number")]
        [MaxLength(100)]
        public string? AdmissionNumber { get; set; }

        [Required]
        [Column("admission_type")]
        [MaxLength(30)]
        public string AdmissionType { get; set; } = null!;

        [Required]
        [Column("admission_date")]
        public DateTime AdmissionDate { get; set; }

        [Column("admission_time")]
        public TimeSpan? AdmissionTime { get; set; }

        // Surgery Details
        [Column("surgery_type")]
        [MaxLength(100)]
        public string? SurgeryType { get; set; }

        [Column("surgery_date")]
        public DateTime? SurgeryDate { get; set; }

        [Column("eye_operated")]
        [MaxLength(10)]
        public string? EyeOperated { get; set; }

        // Bed Assignment (for IPD only)
        [Column("bed_id")]
        public Guid? BedId { get; set; }

        [Column("bed_assigned_at")]
        public DateTime? BedAssignedAt { get; set; }

        [Column("bed_released_at")]
        public DateTime? BedReleasedAt { get; set; }

        // Day-Care Details
        [Column("scheduled_discharge_time")]
        public TimeSpan? ScheduledDischargeTime { get; set; }

        // Status
        [Column("admission_status")]
        [MaxLength(30)]
        public string AdmissionStatus { get; set; } = "Scheduled";

        // Discharge Details
        [Column("actual_discharge_date")]
        public DateTime? ActualDischargeDate { get; set; }

        [Column("actual_discharge_time")]
        public TimeSpan? ActualDischargeTime { get; set; }

        [Column("discharge_summary_url")]
        public string? DischargeSummaryUrl { get; set; }

        [Column("discharge_instructions")]
        public string? DischargeInstructions { get; set; }

        [Column("discharged_by_user_id")]
        public Guid? DischargedByUserId { get; set; }

        // Accompanying Person
        [Column("attendant_name")]
        [MaxLength(200)]
        public string? AttendantName { get; set; }

        [Column("attendant_phone")]
        [MaxLength(20)]
        public string? AttendantPhone { get; set; }

        [Column("attendant_relation")]
        [MaxLength(50)]
        public string? AttendantRelation { get; set; }

        // Medical Team
        [Column("admitting_doctor_id")]
        public Guid? AdmittingDoctorId { get; set; }

        [Column("primary_nurse_id")]
        public Guid? PrimaryNurseId { get; set; }

        // Insurance/Payment
        [Column("admission_deposit_paid")]
        public decimal AdmissionDepositPaid { get; set; } = 0;

        [Column("final_bill_amount")]
        public decimal? FinalBillAmount { get; set; }

        [Column("final_settlement_status")]
        [MaxLength(30)]
        public string? FinalSettlementStatus { get; set; }

        // Cancellation
        [Column("cancelled_at")]
        public DateTime? CancelledAt { get; set; }

        [Column("cancelled_by_user_id")]
        public Guid? CancelledByUserId { get; set; }

        [Column("cancellation_reason")]
        public string? CancellationReason { get; set; }

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

    [Table("bed_reservations")]
    public class BedReservation
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

        // Admission Link
        [Required]
        [Column("admission_id")]
        public Guid AdmissionId { get; set; }

        [Required]
        [Column("patient_id")]
        public Guid PatientId { get; set; }

        // Bed Details
        [Required]
        [Column("bed_id")]
        public Guid BedId { get; set; }

        [Column("ward_id")]
        public Guid? WardId { get; set; }

        [Column("room_number")]
        [MaxLength(50)]
        public string? RoomNumber { get; set; }

        // Reservation Dates
        [Required]
        [Column("reservation_start_date")]
        public DateTime ReservationStartDate { get; set; }

        [Column("reservation_end_date")]
        public DateTime? ReservationEndDate { get; set; }

        // Status: Reserved, Confirmed, Occupied, Released, Cancelled
        [Column("reservation_status")]
        [MaxLength(20)]
        public string ReservationStatus { get; set; } = "Reserved";

        // Auto-release
        [Column("auto_release_after_hours")]
        public int AutoReleaseAfterHours { get; set; } = 24;

        [Column("auto_released_at")]
        public DateTime? AutoReleasedAt { get; set; }

        // Cancellation
        [Column("cancellation_reason")]
        public string? CancellationReason { get; set; }

        // Audit Fields
        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Required]
        [Column("created_by_user_id")]
        public Guid CreatedByUserId { get; set; }

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }
    }
}
