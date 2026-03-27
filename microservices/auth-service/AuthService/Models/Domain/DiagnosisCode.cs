using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain;

[Table("diagnosis_code")]
public class DiagnosisCode
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("tenant_id")]
    public required Guid TenantId { get; set; }

    [Column("code")]
    [StringLength(10)]
    public required string Code { get; set; }

    [Column("description")]
    public required string Description { get; set; }

    [Column("category")]
    [StringLength(100)]
    public required string Category { get; set; }

    [Column("laterality")]
    [StringLength(15)]
    public string? Laterality { get; set; } // OD, OS, OU, Unspecified

    [Column("billable")]
    public bool Billable { get; set; } = true;

    [Column("status")]
    [StringLength(50)]
    public string Status { get; set; } = "active";

    [Column("icd_version")]
    [StringLength(10)]
    public string IcdVersion { get; set; } = "ICD-10";

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
