using Microsoft.AspNetCore.Identity;
using System;
using AuthService.Models.Domain;

namespace AuthService.Models.Identity
{
    public class AppRole : IdentityRole<Guid>
    {
        public Guid TenantId { get; set; }
        public string? Description { get; set; }
        public string? RoleCode { get; set; } // Unique code for the role
        public string? RoleType { get; set; } // System, Custom, Department, etc.
        public int RoleLevel { get; set; } // 1: SuperAdmin, 2: HospitalAdmin, etc.
        public int Priority { get; set; } = 0; // For sorting/ordering roles
        public Guid? ParentRoleId { get; set; } // For role hierarchy
        public Guid? DepartmentId { get; set; } // Department-specific role
        public string? Settings { get; set; } // JSON settings for the role
        public bool IsSystemRole { get; set; } = false;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? DeletedAt { get; set; } // Soft delete
        public Guid? CreatedBy { get; set; }
        public Guid? UpdatedBy { get; set; }
        public Guid? DeletedBy { get; set; }

        // Navigation properties
        public ICollection<AppUserRole> UserRoles { get; set; } = new List<AppUserRole>();
        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }
}