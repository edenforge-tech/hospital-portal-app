using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AuthService.Models.Domain;
using AuthService.Models.Identity;

namespace AuthService.Models
{
    /// <summary>
    /// Follow-up appointment tracking for post-operative care, chronic disease management, and screening
    /// </summary>
    [Table("follow_up_appointments")]
    public class FollowUpAppointment
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

        [Required]
        [Column("follow_up_type")]
        [MaxLength(50)]
        public string FollowUpType { get; set; } = null!; // Post-Surgery, Chronic-Care, Treatment-Review, Screening, Emergency

        [Column("related_procedure")]
        [MaxLength(200)]
        public string? RelatedProcedure { get; set; }

        [Column("procedure_date")]
        public DateTime? ProcedureDate { get; set; }

        [Required]
        [Column("scheduled_date")]
        public DateTime ScheduledDate { get; set; }

        [Column("scheduled_time")]
        [MaxLength(10)]
        public string? ScheduledTime { get; set; }

        [Required]
        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "scheduled"; // scheduled, completed, missed, cancelled, overdue

        [Required]
        [Column("priority")]
        [MaxLength(20)]
        public string Priority { get; set; } = "routine"; // routine, important, urgent

        [Required]
        [Column("assigned_doctor_id")]
        public Guid AssignedDoctorId { get; set; }

        [Required]
        [Column("department_id")]
        public Guid DepartmentId { get; set; }

        [Column("notes")]
        public string? Notes { get; set; }

        [Column("reminders_sent")]
        public int RemindersSent { get; set; } = 0;

        [Column("last_reminder_date")]
        public DateTime? LastReminderDate { get; set; }

        [Column("completed_date")]
        public DateTime? CompletedDate { get; set; }

        [Column("outcome")]
        public string? Outcome { get; set; }

        // Standard audit fields
        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [Required]
        [Column("created_by_user_id")]
        public Guid CreatedByUserId { get; set; }

        [Column("updated_by_user_id")]
        public Guid? UpdatedByUserId { get; set; }

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Navigation properties
        [ForeignKey("TenantId")]
        public virtual Domain.Tenant? Tenant { get; set; }

        [ForeignKey("PatientId")]
        public virtual Domain.Patient? Patient { get; set; }

        [ForeignKey("AssignedDoctorId")]
        public virtual Identity.AppUser? AssignedDoctor { get; set; }

        [ForeignKey("DepartmentId")]
        public virtual Domain.Department? Department { get; set; }
    }
}
