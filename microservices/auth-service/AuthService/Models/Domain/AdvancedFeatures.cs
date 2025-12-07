using System;
using System.Collections.Generic;

namespace AuthService.Models.Domain
{
    /// <summary>
    /// Document type domain entity for document classification and management
    /// </summary>
    public class DocumentType
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public string TypeCode { get; set; } = string.Empty;
        public string TypeName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? SourceSystem { get; set; }
        public string? SourceDepartment { get; set; }
        public Dictionary<string, object>? AccessibleTo { get; set; }
        public bool AutoShare { get; set; } = true;
        public bool RequiresApproval { get; set; } = false;
        public int RetentionDays { get; set; } = 2555; // ~7 years
        public string Status { get; set; } = "active";
        
        // Audit
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Guid? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedBy { get; set; }
        
        // Navigation properties
        public Tenant? Tenant { get; set; }
        public ICollection<DocumentAccessRule>? AccessRules { get; set; }
    }

    /// <summary>
    /// Document access rule domain entity for document sharing permissions
    /// </summary>
    public class DocumentAccessRule
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid DocumentTypeId { get; set; }
        public string? SourceDepartment { get; set; }
        public string? TargetRole { get; set; }
        public string? TargetDepartment { get; set; }
        public List<string> PermissionCodes { get; set; } = new List<string> { "read" };
        public string Scope { get; set; } = "department";
        public bool IsActive { get; set; } = true;
        public int Priority { get; set; } = 0;
        
        // Audit
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Guid? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedBy { get; set; }
        
        // Navigation properties
        public Tenant? Tenant { get; set; }
        public DocumentType? DocumentType { get; set; }
    }

    /// <summary>
    /// System configuration domain entity for key-value settings
    /// </summary>
    public class SystemConfiguration
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public string ConfigKey { get; set; } = string.Empty;
        public string? ConfigValue { get; set; }
        public string? ConfigType { get; set; } // string, int, bool, json
        public string? Description { get; set; }
        public List<string>? EditableBy { get; set; }
        public bool IsSystemConfig { get; set; } = false;
        public string Status { get; set; } = "active";
        
        // Audit
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Guid? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedBy { get; set; }
        
        // Navigation properties
        public Tenant? Tenant { get; set; }
    }
}
