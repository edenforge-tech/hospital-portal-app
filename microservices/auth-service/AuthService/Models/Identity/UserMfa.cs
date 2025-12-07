using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Identity;

[Table("user_mfa")]
public class UserMfa
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Required]
    [Column("user_id")]
    public Guid UserId { get; set; }

    [Required]
    [Column("tenant_id")]
    public Guid TenantId { get; set; }

    [Column("is_enabled")]
    public bool IsEnabled { get; set; }

    [Column("mfa_method")]
    [MaxLength(50)]
    public string? MfaMethod { get; set; } // SMS, Email, Authenticator

    [Column("mfa_secret")]
    [MaxLength(255)]
    public string? MfaSecret { get; set; }

    [Column("enabled_at")]
    public DateTime? EnabledAt { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    // Navigation property
    [ForeignKey("UserId")]
    public virtual AppUser? User { get; set; }
}
