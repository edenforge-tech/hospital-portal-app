using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain
{
    [Table("emergency_override_log")]
    public class EmergencyOverrideLog
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Required]
        [Column("patient_id")]
        public Guid PatientId { get; set; }

        [Column("appointment_id")]
        public Guid? AppointmentId { get; set; }

        [Column("visit_id")]
        public Guid? VisitId { get; set; }

        [Required]
        [Column("override_type")]
        [MaxLength(50)]
        public string OverrideType { get; set; } = "PAYMENT_VALIDATION";

        [Required]
        [Column("approved_by_user_id")]
        public Guid ApprovedByUserId { get; set; }

        [Required]
        [Column("approver_name")]
        [MaxLength(200)]
        public string ApproverName { get; set; } = string.Empty;

        [Required]
        [Column("reason")]
        public string Reason { get; set; } = string.Empty;

        [Required]
        [Column("overridden_at")]
        public DateTime OverriddenAt { get; set; }

        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Required]
        [Column("created_by_user_id")]
        public Guid CreatedByUserId { get; set; }

        // Navigation properties
        [ForeignKey("TenantId")]
        public Tenant? Tenant { get; set; }

        [ForeignKey("PatientId")]
        public Patient? Patient { get; set; }

        [ForeignKey("AppointmentId")]
        public Appointment? Appointment { get; set; }

        [ForeignKey("VisitId")]
        public Visit? Visit { get; set; }
    }
}
