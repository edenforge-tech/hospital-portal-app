using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AuthService.Models.Domain;

namespace AuthService.Models
{
    /// <summary>
    /// Treatment adherence tracking for chronic conditions
    /// </summary>
    [Table("treatment_adherence")]
    public class TreatmentAdherence
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
        [Column("condition")]
        [MaxLength(200)]
        public string Condition { get; set; } = null!; // POAG, DME, Diabetic Retinopathy, etc.

        [Required]
        [Column("treatment_plan")]
        [MaxLength(500)]
        public string TreatmentPlan { get; set; } = null!;

        [Required]
        [Column("start_date")]
        public DateTime StartDate { get; set; }

        [Column("end_date")]
        public DateTime? EndDate { get; set; }

        [Column("scheduled_appointments")]
        public int ScheduledAppointments { get; set; } = 0;

        [Column("completed_appointments")]
        public int CompletedAppointments { get; set; } = 0;

        [Column("missed_appointments")]
        public int MissedAppointments { get; set; } = 0;

        [Column("adherence_rate")]
        public decimal AdherenceRate { get; set; } = 0; // Percentage 0-100

        [Column("risk_level")]
        [MaxLength(20)]
        public string RiskLevel { get; set; } = "low"; // low, medium, high

        [Column("recommendations")]
        public string? Recommendations { get; set; } // JSON array of recommendations

        [Column("last_review_date")]
        public DateTime? LastReviewDate { get; set; }

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
