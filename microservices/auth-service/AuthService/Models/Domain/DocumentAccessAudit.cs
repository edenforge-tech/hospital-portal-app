using System;
using System.Net;

namespace AuthService.Models.Domain
{
    public class DocumentAccessAudit
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        
        // Access details
        public Guid UserId { get; set; }
        public string? UserEmail { get; set; }
        public string? UserRole { get; set; }
        
        // Document details
        public Guid DocumentId { get; set; }
        public string? DocumentType { get; set; }
        public string? DocumentTitle { get; set; }
        public Guid? PatientId { get; set; }
        
        // Action tracking
        public string? Action { get; set; } // read, update, delete, download, share, unshare, print, export
        public string? ActionResult { get; set; } // success, denied, error
        
        // Authorization details
        public bool AccessGranted { get; set; }
        public string? DenialReason { get; set; }
        public string? PermissionUsed { get; set; } // Which permission was checked
        
        // Request metadata
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
        public string? RequestPath { get; set; }
        public string? RequestMethod { get; set; }
        
        // Performance tracking
        public int? ResponseTimeMs { get; set; }
        
        // Timestamp (immutable - no updates)
        public DateTime AccessedAt { get; set; } = DateTime.UtcNow;
    }
}
