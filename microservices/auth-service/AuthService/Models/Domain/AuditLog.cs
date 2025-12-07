using System;

namespace AuthService.Models.Domain
{
    /// <summary>
    /// Immutable Audit Log entity with blockchain-like integrity
    /// Enhanced with hash chain for tamper detection and HIPAA compliance
    /// </summary>
    public class AuditLog
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid? UserId { get; set; }
        public string? UserName { get; set; } // Username of the actor
        public string Action { get; set; } = string.Empty; // Required: action performed (e.g., "CREATE", "UPDATE", "DELETE")
        public string ResourceType { get; set; } = string.Empty; // Required: type of resource (e.g., "Patient", "Appointment")
        public Guid? ResourceId { get; set; }
        public string? EntityType { get; set; } // Alias/additional field for entity type
        public Guid? EntityId { get; set; } // Alias/additional field for entity ID
        public string? Description { get; set; } // Human-readable description
        public string? OldValues { get; set; }
        public string? NewValues { get; set; }
        public string? Changes { get; set; } // Consolidated changes (JSON)
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
        public string? Status { get; set; }
        public string? Reason { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow; // Alias for CreatedAt

        // ============================================================================
        // IMMUTABILITY & INTEGRITY FEATURES (Blockchain-like)
        // ============================================================================
        
        /// <summary>
        /// SHA256 hash of current record's content
        /// Calculated from: Id + TenantId + UserId + Action + ResourceType + ResourceId + Timestamp
        /// </summary>
        public string? EventHash { get; set; }

        /// <summary>
        /// Hash of the previous audit log entry (blockchain chain)
        /// Enables detection of deleted or modified audit records
        /// </summary>
        public string? PreviousEventHash { get; set; }

        /// <summary>
        /// Sequence number for ordering verification
        /// </summary>
        public long? SequenceNumber { get; set; }

        /// <summary>
        /// Data classification for the audited event
        /// Values: Public, Internal, Confidential, Restricted, PHI (Protected Health Information)
        /// </summary>
        public string? DataClassification { get; set; } = "Internal";

        /// <summary>
        /// Risk level assessment of the audited action
        /// Values: Low, Medium, High, Critical
        /// </summary>
        public string? RiskLevel { get; set; } = "Low";

        /// <summary>
        /// Compliance flags (JSON array)
        /// e.g., ["HIPAA", "GDPR", "SOC2", "PCI-DSS"]
        /// </summary>
        public string? ComplianceFlags { get; set; }

        /// <summary>
        /// Indicates if this audit record was created automatically or manually
        /// </summary>
        public bool IsSystemGenerated { get; set; } = true;

        /// <summary>
        /// Session ID at the time of the event
        /// </summary>
        public string? SessionId { get; set; }

        /// <summary>
        /// Indicates if this record is immutable (cannot be updated/deleted)
        /// </summary>
        public bool IsImmutable { get; set; } = true;

        /// <summary>
        /// Retention period in days (for compliance)
        /// HIPAA requires 6-7 years (2190-2555 days)
        /// </summary>
        public int RetentionDays { get; set; } = 2555; // ~7 years

        /// <summary>
        /// Date when this audit record can be archived/deleted
        /// </summary>
        public DateTime? RetentionExpiry { get; set; }
    }
}