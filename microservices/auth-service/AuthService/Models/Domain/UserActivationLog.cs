using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain
{
    /// <summary>
    /// Audit log for user activation events
    /// Tracks OTP generation, manual activation, auto-activation, etc.
    /// </summary>
    [Table("user_activation_log")]
    public class UserActivationLog
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
        [Column("activation_type")]
        [MaxLength(50)]
        public string ActivationType { get; set; } = string.Empty; // initial_otp, manual_activation, auto_activation, reactivation

        [Column("activated_at")]
        public DateTime ActivatedAt { get; set; }

        /// <summary>
        /// Admin who performed the activation (NULL for auto-activation)
        /// </summary>
        [Column("activated_by_user_id")]
        public Guid? ActivatedByUserId { get; set; }

        [Column("otp_sent_at")]
        public DateTime? OtpSentAt { get; set; }

        [Column("otp_used_at")]
        public DateTime? OtpUsedAt { get; set; }

        [Column("ip_address")]
        [MaxLength(45)]
        public string? IpAddress { get; set; }

        [Column("user_agent")]
        public string? UserAgent { get; set; }

        [Column("delivery_method")]
        [MaxLength(20)]
        public string? DeliveryMethod { get; set; } // email, sms

        [Column("credential_type")]
        [MaxLength(20)]
        public string? CredentialType { get; set; } // otp, auto_password

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("created_by_user_id")]
        public Guid? CreatedByUserId { get; set; }

        [Column("notes")]
        public string? Notes { get; set; }

        // Navigation properties
        [ForeignKey("TenantId")]
        public virtual Tenant? Tenant { get; set; }
    }
}
