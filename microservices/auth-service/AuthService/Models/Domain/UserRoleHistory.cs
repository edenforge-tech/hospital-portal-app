using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Models.Domain
{
    /// <summary>
    /// Tracks role assignment history for audit and analytics
    /// Records when roles are assigned/removed from users
    /// </summary>
    public class UserRoleHistory
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid TenantId { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid RoleId { get; set; }

        [Required]
        [StringLength(50)]
        public string Action { get; set; } = string.Empty; // "assigned", "removed", "expired", "revoked"

        [StringLength(500)]
        public string Reason { get; set; } = string.Empty;

        public DateTime ActionTimestamp { get; set; } = DateTime.UtcNow;

        public DateTime? EffectiveFrom { get; set; }
        public DateTime? EffectiveUntil { get; set; }

        [Required]
        public Guid AssignedByUserId { get; set; }

        /// <summary>
        /// Branch context if role assignment is branch-specific
        /// </summary>
        public Guid? BranchId { get; set; }

        /// <summary>
        /// JSON metadata for the assignment
        /// </summary>
        public string Metadata { get; set; } = "{}";

        // Standard audit columns  
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "active";
    }
}