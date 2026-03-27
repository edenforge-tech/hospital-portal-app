using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain;

[Table("patient_consents")]
public class PatientConsent
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
    [Column("consent_type")]
    [MaxLength(50)]
    public string ConsentType { get; set; } = "treatment"; // treatment, hipaa, photo, research, telehealth, data_sharing

    [Required]
    [Column("consent_name")]
    [MaxLength(300)]
    public string ConsentName { get; set; } = string.Empty;

    [Column("description")]
    [MaxLength(2000)]
    public string? Description { get; set; }

    [Column("is_granted")]
    public bool IsGranted { get; set; } = false;

    [Column("granted_at")]
    public DateTime? GrantedAt { get; set; }

    [Column("expires_at")]
    public DateTime? ExpiresAt { get; set; }

    [Column("revoked_at")]
    public DateTime? RevokedAt { get; set; }

    [Column("witness_name")]
    [MaxLength(200)]
    public string? WitnessName { get; set; }

    [Column("document_url")]
    [MaxLength(500)]
    public string? DocumentUrl { get; set; }

    [Column("signature_url")]
    [MaxLength(500)]
    public string? SignatureUrl { get; set; }

    [Column("ip_address")]
    [MaxLength(50)]
    public string? IpAddress { get; set; }

    [Column("notes")]
    [MaxLength(1000)]
    public string? Notes { get; set; }

    [Required]
    [Column("status")]
    [MaxLength(20)]
    public string Status { get; set; } = "active"; // active, expired, revoked

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
