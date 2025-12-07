using System;

namespace AuthService.Models.Domain
{
    public class Permission
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public string? Code { get; set; } // e.g., "CLINICAL_VIEW_PATIENT"
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Module { get; set; } // Clinical, Billing, etc.
        public string? Action { get; set; } // View, Create, Edit, Delete
        public string? ResourceType { get; set; } // Patient, Appointment, etc.
        public string? ResourceName { get; set; } // Human-readable resource name
        public string? Scope { get; set; } // Global, Tenant, Branch, Department, Own
        public string? DataClassification { get; set; } // Public, Internal, Confidential, Restricted
        public bool? IsSystemPermission { get; set; } = false; // System-defined permission
        public bool? DepartmentSpecific { get; set; } = false; // Department-specific permission
        public bool? IsCustom { get; set; } = false; // Custom permission
        public string? Dependencies { get; set; } // JSON array of dependent permission IDs
        public string? ConflictsWith { get; set; } // JSON array of conflicting permission IDs
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? DeletedAt { get; set; } // Soft delete
        public Guid? CreatedBy { get; set; }
        public Guid? UpdatedBy { get; set; }
        public Guid? DeletedBy { get; set; }

        // Navigation properties
        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }
}