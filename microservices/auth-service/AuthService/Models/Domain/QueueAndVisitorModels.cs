using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain
{
    [Table("queue_item")]
    public class QueueItem
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

        [Column("department_id")]
        public Guid? DepartmentId { get; set; }

        [Required]
        [Column("patient_id")]
        public Guid PatientId { get; set; }

        [Column("appointment_id")]
        public Guid? AppointmentId { get; set; }

        [Column("visit_id")]
        public Guid? VisitId { get; set; }

        [Required]
        [Column("token_number")]
        [MaxLength(50)]
        public string TokenNumber { get; set; } = string.Empty;

        [Required]
        [Column("queue_type")]
        [MaxLength(50)]
        public string QueueType { get; set; } = "Doctor"; // Optometry, Doctor, Billing, Pharmacy

        [Required]
        [Column("status")]
        [MaxLength(50)]
        public string Status { get; set; } = "waiting"; // waiting, called, in-progress, completed, absent

        [Required]
        [Column("priority")]
        [MaxLength(50)]
        public string Priority { get; set; } = "normal"; // normal, emergency, follow-up

        [Required]
        [Column("checked_in_at")]
        public DateTime CheckedInAt { get; set; }

        [Column("called_at")]
        public DateTime? CalledAt { get; set; }

        [Column("completed_at")]
        public DateTime? CompletedAt { get; set; }

        [Column("doctor_name")]
        [MaxLength(200)]
        public string? DoctorName { get; set; }

        [Column("room_number")]
        [MaxLength(50)]
        public string? RoomNumber { get; set; }

        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Required]
        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }

        [Column("created_by_user_id")]
        public Guid? CreatedByUserId { get; set; }

        [Column("updated_by_user_id")]
        public Guid? UpdatedByUserId { get; set; }

        // Navigation properties
        [ForeignKey("TenantId")]
        public virtual Tenant? Tenant { get; set; }

        [ForeignKey("BranchId")]
        public virtual Branch? Branch { get; set; }

        [ForeignKey("DepartmentId")]
        public virtual Department? Department { get; set; }

        [ForeignKey("PatientId")]
        public virtual Patient? Patient { get; set; }

        [ForeignKey("AppointmentId")]
        public virtual Appointment? Appointment { get; set; }

        [ForeignKey("VisitId")]
        public virtual Visit? Visit { get; set; }
    }

    [Table("visitor_log")]
    public class VisitorLog
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
        [Column("visitor_name")]
        [MaxLength(200)]
        public string VisitorName { get; set; } = string.Empty;

        [Required]
        [Column("mobile_number")]
        [MaxLength(20)]
        public string MobileNumber { get; set; } = string.Empty;

        [Column("patient_id")]
        public Guid? PatientId { get; set; }

        [Column("patient_name")]
        [MaxLength(200)]
        public string? PatientName { get; set; }

        [Column("patient_room_number")]
        [MaxLength(50)]
        public string? PatientRoomNumber { get; set; }

        [Required]
        [Column("purpose")]
        [MaxLength(500)]
        public string Purpose { get; set; } = string.Empty;

        [Column("pass_number")]
        [MaxLength(50)]
        public string? PassNumber { get; set; }

        [Required]
        [Column("check_in_time")]
        public DateTime CheckInTime { get; set; }

        [Column("check_out_time")]
        public DateTime? CheckOutTime { get; set; }

        [Required]
        [Column("status")]
        [MaxLength(50)]
        public string Status { get; set; } = "active"; // active, checked-out

        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Required]
        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }

        [Column("created_by_user_id")]
        public Guid? CreatedByUserId { get; set; }

        [Column("updated_by_user_id")]
        public Guid? UpdatedByUserId { get; set; }

        // Navigation properties
        [ForeignKey("TenantId")]
        public virtual Tenant? Tenant { get; set; }

        [ForeignKey("BranchId")]
        public virtual Branch? Branch { get; set; }

        [ForeignKey("PatientId")]
        public virtual Patient? Patient { get; set; }
    }

    [Table("surgery_request")]
    public class SurgeryRequest
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
        [Column("surgeon_id")]
        public Guid SurgeonId { get; set; }

        [Required]
        [Column("patient_name")]
        [MaxLength(200)]
        public string PatientName { get; set; } = string.Empty;

        [Required]
        [Column("patient_mobile")]
        [MaxLength(20)]
        public string PatientMobile { get; set; } = string.Empty;

        [Required]
        [Column("procedure_type")]
        [MaxLength(200)]
        public string ProcedureType { get; set; } = string.Empty;

        [Required]
        [Column("request_type")]
        [MaxLength(50)]
        public string RequestType { get; set; } = "quick-note"; // quick-note, direct-support

        [Column("urgency")]
        [MaxLength(50)]
        public string Urgency { get; set; } = "routine"; // routine, urgent, emergency

        [Column("preferred_date")]
        public DateTime? PreferredDate { get; set; }

        [Column("preferred_time")]
        [MaxLength(20)]
        public string? PreferredTime { get; set; }

        [Column("notes")]
        [MaxLength(2000)]
        public string? Notes { get; set; }

        [Column("special_instructions")]
        [MaxLength(2000)]
        public string? SpecialInstructions { get; set; }

        [Required]
        [Column("status")]
        [MaxLength(50)]
        public string Status { get; set; } = "pending"; // pending, approved, rejected, completed

        [Column("surgeon_response")]
        [MaxLength(2000)]
        public string? SurgeonResponse { get; set; }

        [Column("scheduled_date")]
        public DateTime? ScheduledDate { get; set; }

        [Required]
        [Column("request_date")]
        public DateTime RequestDate { get; set; }

        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Required]
        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }

        [Column("created_by_user_id")]
        public Guid? CreatedByUserId { get; set; }

        [Column("updated_by_user_id")]
        public Guid? UpdatedByUserId { get; set; }

        // Navigation properties
        [ForeignKey("TenantId")]
        public virtual Tenant? Tenant { get; set; }

        [ForeignKey("BranchId")]
        public virtual Branch? Branch { get; set; }
    }
}
