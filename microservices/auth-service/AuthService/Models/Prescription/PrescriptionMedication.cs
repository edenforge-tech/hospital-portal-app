using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Prescription
{
    [Table("prescription_medication")]
    public class PrescriptionMedication
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Required]
        [Column("prescription_id")]
        public Guid PrescriptionId { get; set; }

        [Required]
        [Column("medication_name")]
        [MaxLength(200)]
        public string MedicationName { get; set; } = string.Empty;

        [Column("generic_name")]
        [MaxLength(200)]
        public string? GenericName { get; set; }

        [Required]
        [Column("dosage")]
        [MaxLength(100)]
        public string Dosage { get; set; } = string.Empty;

        [Required]
        [Column("form")]
        [MaxLength(50)]
        public string Form { get; set; } = string.Empty; // tablet, capsule, syrup, eye drops, injection

        [Required]
        [Column("route")]
        [MaxLength(50)]
        public string Route { get; set; } = string.Empty; // oral, topical, ocular, intramuscular, intravenous

        [Required]
        [Column("frequency")]
        [MaxLength(100)]
        public string Frequency { get; set; } = string.Empty;

        [Required]
        [Column("duration_days")]
        public int DurationDays { get; set; }

        [Required]
        [Column("quantity")]
        public int Quantity { get; set; }

        [Column("instructions")]
        public string? Instructions { get; set; }

        [Required]
        [Column("start_date")]
        public DateTime StartDate { get; set; } = DateTime.UtcNow.Date;

        [Column("end_date")]
        public DateTime? EndDate { get; set; }

        [Column("refills_allowed")]
        public int RefillsAllowed { get; set; } = 0;

        [Column("refills_remaining")]
        public int RefillsRemaining { get; set; } = 0;

        [Column("is_critical")]
        public bool IsCritical { get; set; } = false;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Navigation properties
        public virtual Prescription? Prescription { get; set; }
    }
}
