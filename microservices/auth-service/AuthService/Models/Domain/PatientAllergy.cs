using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain;

[Table("patient_allergies")]
public class PatientAllergy
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
    [Column("allergen_name")]
    [MaxLength(200)]
    public string AllergenName { get; set; } = string.Empty;

    [Column("allergen_type")]
    [MaxLength(50)]
    public string AllergenType { get; set; } = "medication"; // medication, food, environmental, latex, other

    [Column("severity")]
    [MaxLength(20)]
    public string Severity { get; set; } = "moderate"; // mild, moderate, severe, life_threatening

    [Column("reaction")]
    [MaxLength(500)]
    public string? Reaction { get; set; }

    [Column("onset_date")]
    public DateTime? OnsetDate { get; set; }

    [Column("verified")]
    public bool Verified { get; set; } = false;

    [Column("verified_by")]
    [MaxLength(200)]
    public string? VerifiedBy { get; set; }

    [Column("notes")]
    [MaxLength(1000)]
    public string? Notes { get; set; }

    [Required]
    [Column("status")]
    [MaxLength(20)]
    public string Status { get; set; } = "active"; // active, inactive, resolved

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("created_by_user_id")]
    public Guid? CreatedByUserId { get; set; }

    [Column("updated_by_user_id")]
    public Guid? UpdatedByUserId { get; set; }

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    [ForeignKey("PatientId")]
    public virtual Patient? Patient { get; set; }
}
