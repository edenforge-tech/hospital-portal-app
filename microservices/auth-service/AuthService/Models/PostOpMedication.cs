using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AuthService.Models.Domain;

namespace AuthService.Models
{
    /// <summary>
    /// Post-operative medication prescriptions with adherence tracking
    /// </summary>
    [Table("post_op_medications")]
    public class PostOpMedication
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Required]
        [Column("post_op_care_schedule_id")]
        public Guid PostOpCareScheduleId { get; set; }

        [Required]
        [Column("medication_name")]
        [MaxLength(200)]
        public string MedicationName { get; set; } = null!;

        [Required]
        [Column("dosage")]
        [MaxLength(100)]
        public string Dosage { get; set; } = null!;

        [Required]
        [Column("frequency")]
        [MaxLength(100)]
        public string Frequency { get; set; } = null!;

        [Required]
        [Column("start_date")]
        public DateTime StartDate { get; set; }

        [Required]
        [Column("end_date")]
        public DateTime EndDate { get; set; }

        [Column("adherence")]
        [MaxLength(20)]
        public string Adherence { get; set; } = "unknown"; // good, moderate, poor, unknown

        [Column("last_refill_date")]
        public DateTime? LastRefillDate { get; set; }

        [Column("notes")]
        public string? Notes { get; set; }

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

        [ForeignKey("PostOpCareScheduleId")]
        public virtual PostOpCareSchedule? PostOpCareSchedule { get; set; }
    }
}
