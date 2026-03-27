using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AuthService.Models.Domain;

namespace AuthService.Models
{
    /// <summary>
    /// Medication adherence tracking for chronic medications
    /// </summary>
    [Table("medication_adherence")]
    public class MedicationAdherence
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Required]
        [Column("treatment_adherence_id")]
        public Guid TreatmentAdherenceId { get; set; }

        [Required]
        [Column("medication_name")]
        [MaxLength(200)]
        public string MedicationName { get; set; } = null!;

        [Required]
        [Column("prescribed_dosage")]
        [MaxLength(100)]
        public string PrescribedDosage { get; set; } = null!;

        [Column("adherence_percentage")]
        public decimal AdherencePercentage { get; set; } = 0; // 0-100%

        [Column("missed_doses")]
        public int MissedDoses { get; set; } = 0;

        [Column("last_taken_date")]
        public DateTime? LastTakenDate { get; set; }

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

        [ForeignKey("TreatmentAdherenceId")]
        public virtual TreatmentAdherence? TreatmentAdherence { get; set; }
    }
}
