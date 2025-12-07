using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AuthService.Models.Identity;

namespace AuthService.Models.Domain
{
    /// <summary>
    /// Device entity for device registration and trust management
    /// Supports multi-device access, device fingerprinting, and session control
    /// </summary>
    [Table("device")]
    public class Device
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Required]
        [Column("user_id")]
        public Guid UserId { get; set; }

        // Device Identification
        [Column("device_id")]
        [MaxLength(255)]
        public string DeviceId { get; set; } = string.Empty; // Fingerprint hash

        [Column("device_name")]
        [MaxLength(255)]
        public string? DeviceName { get; set; }

        [Column("device_type")]
        [MaxLength(50)]
        public string? DeviceType { get; set; } // Desktop, Mobile, Tablet

        [Column("os")]
        [MaxLength(100)]
        public string? OS { get; set; } // Windows, macOS, iOS, Android, Linux

        [Column("os_version")]
        [MaxLength(50)]
        public string? OSVersion { get; set; }

        [Column("browser")]
        [MaxLength(100)]
        public string? Browser { get; set; }

        [Column("browser_version")]
        [MaxLength(50)]
        public string? BrowserVersion { get; set; }

        // Network Information
        [Column("ip_address")]
        [MaxLength(45)]
        public string? IPAddress { get; set; } // IPv4 or IPv6

        [Column("location")]
        [MaxLength(255)]
        public string? Location { get; set; } // City, Country

        [Column("user_agent")]
        public string? UserAgent { get; set; }

        // Trust & Security
        [Column("trust_level")]
        [MaxLength(20)]
        public string TrustLevel { get; set; } = "Untrusted"; // Untrusted, Trusted, Verified

        [Column("is_blocked")]
        public bool IsBlocked { get; set; } = false;

        [Column("block_reason")]
        public string? BlockReason { get; set; }

        [Column("is_primary_device")]
        public bool IsPrimaryDevice { get; set; } = false;

        // Activity Tracking
        [Column("registered_at")]
        public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;

        [Column("last_seen_at")]
        public DateTime? LastSeenAt { get; set; }

        [Column("last_login_at")]
        public DateTime? LastLoginAt { get; set; }

        [Column("total_logins")]
        public int TotalLogins { get; set; } = 0;

        // Audit Fields
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "active";

        // Navigation Properties
        [ForeignKey("UserId")]
        public virtual AppUser? User { get; set; }

        [ForeignKey("TenantId")]
        public virtual Tenant? Tenant { get; set; }

        public virtual ICollection<UserSession>? Sessions { get; set; }
    }

    /// <summary>
    /// User Session entity for session management and tracking
    /// Supports concurrent sessions, device validation, and session termination
    /// </summary>
    [Table("user_session")]
    public class UserSession
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Required]
        [Column("user_id")]
        public Guid UserId { get; set; }

        [Column("device_id")]
        public Guid? DeviceId { get; set; }

        // Session Identification
        [Column("session_id")]
        [MaxLength(255)]
        public string SessionId { get; set; } = string.Empty;

        [Column("token_id")]
        [MaxLength(255)]
        public string? TokenId { get; set; } // JWT jti claim

        [Column("refresh_token")]
        [MaxLength(500)]
        public string? RefreshToken { get; set; }

        // Session Lifecycle
        [Column("login_time")]
        public DateTime LoginTime { get; set; } = DateTime.UtcNow;

        [Column("last_activity_time")]
        public DateTime LastActivityTime { get; set; } = DateTime.UtcNow;

        [Column("expires_at")]
        public DateTime ExpiresAt { get; set; }

        [Column("logout_time")]
        public DateTime? LogoutTime { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        // Session Context
        [Column("ip_address")]
        [MaxLength(45)]
        public string? IPAddress { get; set; }

        [Column("user_agent")]
        public string? UserAgent { get; set; }

        [Column("location")]
        [MaxLength(255)]
        public string? Location { get; set; }

        // Session Type
        [Column("session_type")]
        [MaxLength(50)]
        public string SessionType { get; set; } = "Web"; // Web, Mobile, API, Desktop

        [Column("login_method")]
        [MaxLength(50)]
        public string? LoginMethod { get; set; } // Password, MFA, SSO, Biometric

        // Security
        [Column("suspicious_activity")]
        public bool SuspiciousActivity { get; set; } = false;

        [Column("termination_reason")]
        [MaxLength(255)]
        public string? TerminationReason { get; set; }

        [Column("terminated_by")]
        public Guid? TerminatedBy { get; set; }

        // Audit Fields
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "active";

        // Navigation Properties
        [ForeignKey("UserId")]
        public virtual AppUser? User { get; set; }

        [ForeignKey("DeviceId")]
        public virtual Device? Device { get; set; }

        [ForeignKey("TenantId")]
        public virtual Tenant? Tenant { get; set; }

        [ForeignKey("TerminatedBy")]
        public virtual AppUser? Terminator { get; set; }
    }
}
