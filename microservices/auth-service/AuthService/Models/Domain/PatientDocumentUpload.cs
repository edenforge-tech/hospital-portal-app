using System;
using System.Collections.Generic;

namespace AuthService.Models.Domain
{
    public class PatientDocumentUpload
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid PatientId { get; set; }
        
        // Document metadata
        public string? DocumentType { get; set; } // insurance_card, lab_report, prescription, etc.
        public string? DocumentTitle { get; set; }
        public string? FileUrl { get; set; }
        public long? FileSize { get; set; } // in bytes
        public string? MimeType { get; set; }
        
        // Upload tracking
        public Guid UploadedBy { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        
        // Access control (ABAC support)
        public List<string>? SharedToDepartments { get; set; } // Array of department names/codes
        public List<string>? SharedToRoles { get; set; } // Array of role names/codes
        public bool IsPublic { get; set; } = false; // Visible to all staff in same tenant
        
        // Data classification (HIPAA)
        public string? DataClassification { get; set; } = "sensitive"; // public, internal, sensitive, confidential
        public int? RetentionDays { get; set; } = 2555; // 7 years for HIPAA compliance
        
        // Standard audit columns
        public string Status { get; set; } = "active";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Guid? CreatedByUserId { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedByUserId { get; set; }
        public DateTime? DeletedAt { get; set; }
        public Guid? DeletedByUserId { get; set; }
    }
}
