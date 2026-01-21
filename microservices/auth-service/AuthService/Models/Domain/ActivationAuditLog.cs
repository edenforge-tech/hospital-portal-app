using System;

namespace AuthService.Models.Domain
{
    /// <summary>
    /// HIPAA-compliant audit trail for user activation process
    /// Logs every step of activation for compliance and security
    /// </summary>
    public class ActivationAuditLog
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid UserId { get; set; }
        
        // Activation step tracking
        public string ActivationStep { get; set; } = string.Empty; 
        // Values: "token_validated", "email_verified", "otp_entered", "password_set", 
        //         "professional_info_saved", "terms_accepted", "hipaa_accepted", 
        //         "mfa_setup_started", "mfa_completed", "activation_completed"
        
        public string Status { get; set; } = string.Empty; // "success", "failed", "in_progress"
        public string? ErrorMessage { get; set; }
        
        // Compliance fields - WHO, WHEN, WHERE, WHAT
        public string IpAddress { get; set; } = string.Empty;
        public string? UserAgent { get; set; }
        public string? DeviceInfo { get; set; } // Browser, OS, device type
        public string? GeolocationInfo { get; set; } // Optional: Country, City from IP
        
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }
        
        // Additional context
        public string? RequestData { get; set; } // JSON: activation request details (sanitized)
        public string? ResponseData { get; set; } // JSON: response details (sanitized)
        public int? ResponseTimeMs { get; set; } // Performance tracking
        
        // Compliance flags
        public bool SuspiciousActivity { get; set; } = false; // Multiple failures, unusual IP, etc.
        public string? ComplianceNotes { get; set; }
        
        // Standard audit fields
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
