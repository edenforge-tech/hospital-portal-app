using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain
{
    /// <summary>
    /// Audit log for password reset requests
    /// Tracks both admin-triggered and user self-service resets
    /// </summary>
    [Table("password_reset_requests")]
    public class PasswordResetRequest
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Required]
        [Column("user_id")]
        public Guid UserId { get; set; }

        [Required]
        [Column("reset_token_hash")]
        [MaxLength(500)]
        public string ResetTokenHash { get; set; } = string.Empty;

        [Column("requested_at")]
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Admin who initiated the reset (NULL for user self-service)
        /// </summary>
        [Column("requested_by_user_id")]
        public Guid? RequestedByUserId { get; set; }

        [Column("expires_at")]
        public DateTime ExpiresAt { get; set; }

        [Column("used_at")]
        public DateTime? UsedAt { get; set; }

        [Column("ip_address")]
        [MaxLength(45)] // IPv6 max length
        public string? IpAddress { get; set; }

        [Column("user_agent")]
        public string? UserAgent { get; set; }

        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "pending"; // pending, used, expired, revoked

        // Navigation properties
        [ForeignKey("TenantId")]
        public virtual Tenant? Tenant { get; set; }
    }
}
