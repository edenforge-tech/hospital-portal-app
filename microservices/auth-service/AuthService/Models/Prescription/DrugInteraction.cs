using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Prescription
{
    [Table("drug_interaction")]
    public class DrugInteraction
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("drug1_name")]
        [MaxLength(200)]
        public string Drug1Name { get; set; } = string.Empty;

        [Required]
        [Column("drug2_name")]
        [MaxLength(200)]
        public string Drug2Name { get; set; } = string.Empty;

        [Required]
        [Column("interaction_type")]
        [MaxLength(50)]
        public string InteractionType { get; set; } = string.Empty; // major, moderate, minor

        [Required]
        [Column("severity")]
        [MaxLength(50)]
        public string Severity { get; set; } = string.Empty; // high, medium, low

        [Required]
        [Column("description")]
        public string Description { get; set; } = string.Empty;

        [Column("clinical_effects")]
        public string? ClinicalEffects { get; set; }

        [Column("mechanism")]
        public string? Mechanism { get; set; }

        [Column("management")]
        public string? Management { get; set; }

        [Column("reference_sources")]
        public string? ReferenceSources { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
