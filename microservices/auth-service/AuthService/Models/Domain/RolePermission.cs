using System;
using AuthService.Models.Identity;

namespace AuthService.Models.Domain
{
    public class RolePermission
    {
        public Guid Id { get; set; }
        public Guid RoleId { get; set; }
        public Guid PermissionId { get; set; }
        public DateTime? ValidFrom { get; set; } // Temporal permission validity
        public DateTime? ValidUntil { get; set; } // Temporal permission expiry
        public string? ConditionType { get; set; } // Time-based, Location-based, etc.
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public AppRole Role { get; set; }
        public Permission Permission { get; set; }
    }
}