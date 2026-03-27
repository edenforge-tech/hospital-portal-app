using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AuthService.Models.Domain;

namespace AuthService.Models
{
    /// <summary>
    /// Patient reminder queue for appointments, medications, and tests
    /// </summary>
    [Table("patient_reminders")]
    public class PatientReminder
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
        [Column("reminder_type")]
        [MaxLength(50)]
        public string ReminderType { get; set; } = null!; // appointment, medication, test, follow-up, screening

        [Required]
        [Column("message")]
        public string Message { get; set; } = null!;

        [Required]
        [Column("scheduled_date")]
        public DateTime ScheduledDate { get; set; }

        [Required]
        [Column("channels")]
        public string Channels { get; set; } = null!; // JSON array: ["sms", "email", "phone"]

        [Required]
        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "pending"; // pending, sent, failed, acknowledged

        [Column("sent_date")]
        public DateTime? SentDate { get; set; }

        [Column("acknowledged")]
        public bool Acknowledged { get; set; } = false;

        [Column("acknowledged_date")]
        public DateTime? AcknowledgedDate { get; set; }

        [Column("failure_reason")]
        public string? FailureReason { get; set; }

        [Column("retry_count")]
        public int RetryCount { get; set; } = 0;

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
    }
}
