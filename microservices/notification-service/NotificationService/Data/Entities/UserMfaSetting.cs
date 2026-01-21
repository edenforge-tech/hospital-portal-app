using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NotificationService.Data.Entities;

[Table("user_mfa_settings")]
public class UserMfaSetting
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [Column("user_id")]
    public Guid UserId { get; set; }

    [Required]
    [Column("tenant_id")]
    public Guid TenantId { get; set; }

    [Column("is_mfa_enabled")]
    public bool IsMfaEnabled { get; set; } = false;

    [Column("primary_method")]
    [MaxLength(20)]
    public string? PrimaryMethod { get; set; } // 'totp', 'sms', 'email'

    [Column("totp_secret_encrypted")]
    public string? TotpSecretEncrypted { get; set; }

    [Column("totp_enabled")]
    public bool TotpEnabled { get; set; } = false;

    [Column("sms_enabled")]
    public bool SmsEnabled { get; set; } = false;

    [Column("email_enabled")]
    public bool EmailEnabled { get; set; } = false;

    [Column("backup_codes", TypeName = "jsonb")]
    public string? BackupCodes { get; set; } // JSON array of {hash, used, used_at}

    [Column("backup_codes_generated_at")]
    public DateTime? BackupCodesGeneratedAt { get; set; }

    [Column("enrolled_at")]
    public DateTime? EnrolledAt { get; set; }

    [Column("last_verified_at")]
    public DateTime? LastVerifiedAt { get; set; }

    [Column("grace_period_ends_at")]
    public DateTime? GracePeriodEndsAt { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
