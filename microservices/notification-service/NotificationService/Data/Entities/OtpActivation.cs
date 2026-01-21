using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NotificationService.Data.Entities;

[Table("otp_activations")]
public class OtpActivation
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

    [Required]
    [Column("otp_hash")]
    [MaxLength(255)]
    public string OtpHash { get; set; } = string.Empty;

    [Required]
    [Column("delivery_method")]
    [MaxLength(10)]
    public string DeliveryMethod { get; set; } = string.Empty; // 'email' or 'sms'

    [Required]
    [Column("recipient")]
    [MaxLength(255)]
    public string Recipient { get; set; } = string.Empty;

    [Required]
    [Column("purpose")]
    [MaxLength(50)]
    public string Purpose { get; set; } = "user_activation"; // 'user_activation', 'mfa_login'

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Required]
    [Column("expires_at")]
    public DateTime ExpiresAt { get; set; }

    [Column("verified_at")]
    public DateTime? VerifiedAt { get; set; }

    [Column("attempts")]
    public int Attempts { get; set; } = 0;

    [Column("max_attempts")]
    public int MaxAttempts { get; set; } = 5;

    [Required]
    [Column("status")]
    [MaxLength(20)]
    public string Status { get; set; } = "pending"; // 'pending', 'verified', 'expired', 'blocked'

    [Column("ip_address")]
    [MaxLength(50)]
    public string? IpAddress { get; set; }

    [Column("user_agent")]
    public string? UserAgent { get; set; }
}
