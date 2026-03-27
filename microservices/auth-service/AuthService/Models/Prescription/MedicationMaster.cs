using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Prescription
{
    [Table("medication_master")]
    public class MedicationMaster
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("name")]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Column("generic_name")]
        [MaxLength(200)]
        public string? GenericName { get; set; }

        [Column("brand_names")]
        public string[]? BrandNames { get; set; }

        [Required]
        [Column("category")]
        [MaxLength(100)]
        public string Category { get; set; } = string.Empty;

        [Required]
        [Column("form")]
        [MaxLength(50)]
        public string Form { get; set; } = string.Empty;

        [Column("standard_dosages")]
        public string[]? StandardDosages { get; set; }

        [Required]
        [Column("route")]
        [MaxLength(50)]
        public string Route { get; set; } = string.Empty;

        [Column("contraindications")]
        public string? Contraindications { get; set; }

        [Column("side_effects")]
        public string? SideEffects { get; set; }

        [Column("pregnancy_category")]
        [MaxLength(10)]
        public string? PregnancyCategory { get; set; }

        [Column("requires_prescription")]
        public bool RequiresPrescription { get; set; } = true;

        [Column("is_controlled_substance")]
        public bool IsControlledSubstance { get; set; } = false;

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
