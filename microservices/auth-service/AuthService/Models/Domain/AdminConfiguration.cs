using System;
using System.Collections.Generic;

namespace AuthService.Models.Domain
{
    public class AdminConfiguration
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        
        // Configuration key-value
        public string? ConfigKey { get; set; }
        public string? ConfigValue { get; set; }
        public string? ConfigType { get; set; } // string, number, boolean, json, array
        
        // Metadata
        public string? ConfigCategory { get; set; } // system, security, billing, clinical, operational
        public string? Description { get; set; }
        public string? DisplayName { get; set; }
        
        // Access control
        public List<string>? EditableByRoles { get; set; } // Array of role codes that can edit
        public List<string>? VisibleToRoles { get; set; } // Array of role codes that can view
        public bool IsSystemConfig { get; set; } = false; // System configs cannot be deleted
        public bool IsSensitive { get; set; } = false; // Sensitive configs are masked in logs
        
        // Validation
        public string? ValidationRules { get; set; } // JSON schema for validation
        public List<string>? AllowedValues { get; set; } // For enum-type configs
        public decimal? MinValue { get; set; }
        public decimal? MaxValue { get; set; }
        
        // Change tracking
        public string? PreviousValue { get; set; }
        public string? ChangeReason { get; set; }
        public bool RequiresRestart { get; set; } = false;
        
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
