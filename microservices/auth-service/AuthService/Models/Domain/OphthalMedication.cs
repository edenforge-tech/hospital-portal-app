using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain;

[Table("ophth_medication")]
public class OphthalMedication
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("tenant_id")]
    public required Guid TenantId { get; set; }

    [Column("generic_name")]
    [StringLength(255)]
    public required string GenericName { get; set; }

    [Column("brand_names")]
    public string[]? BrandNames { get; set; }

    [Column("drug_class")]
    [StringLength(100)]
    public required string DrugClass { get; set; }

    [Column("indications")]
    public required string Indications { get; set; }

    [Column("contraindications")]
    public string? Contraindications { get; set; }

    [Column("warnings")]
    public string? Warnings { get; set; }

    [Column("pregnancy_category")]
    [StringLength(10)]
    public string? PregnancyCategory { get; set; }

    [Column("route")]
    [StringLength(50)]
    public string? Route { get; set; } // Topical, Oral, Injectable, IV, Subconjunctival, Intravitreal

    [Column("common_side_effects")]
    public string[]? CommonSideEffects { get; set; }

    [Column("serious_side_effects")]
    public string[]? SeriousSideEffects { get; set; }

    [Column("monitoring_requirements")]
    public string? MonitoringRequirements { get; set; }

    [Column("status")]
    [StringLength(50)]
    public string Status { get; set; } = "active";

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

    // Navigation properties
    [ForeignKey("TenantId")]
    public Tenant? Tenant { get; set; }
}
