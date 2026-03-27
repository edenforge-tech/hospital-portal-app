using System;
using System.ComponentModel.DataAnnotations;
using AuthService.Models.Identity;

namespace AuthService.Models.Domain
{
    /// <summary>
    /// Tracks role hierarchy relationships and inheritance rules
    /// Enables parent-child role relationships with permission inheritance
    /// </summary>
    public class RoleHierarchy
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid TenantId { get; set; }

        [Required]
        public Guid ParentRoleId { get; set; }

        [Required]
        public Guid ChildRoleId { get; set; }

        /// <summary>
        /// Hierarchy level (0 = root, 1 = direct child, etc.)
        /// </summary>
        public int Level { get; set; } = 1;

        /// <summary>
        /// Path from root to this role (e.g., "root/admin/dept_admin")
        /// </summary>
        [StringLength(500)]
        public string Path { get; set; } = string.Empty;

        /// <summary>
        /// Permission inheritance settings
        /// Options: "inherit_all", "inherit_selective", "no_inheritance"
        /// </summary>
        [Required]
        [StringLength(50)]
        public string InheritanceType { get; set; } = "inherit_all";

        /// <summary>
        /// JSON configuration for inheritance rules
        /// Format: { "inherited_permissions": [...], "excluded_permissions": [...] }
        /// </summary>
        public string InheritanceConfig { get; set; } = "{}";

        public bool IsActive { get; set; } = true;

        // Standard audit columns
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? DeletedAt { get; set; }
        
        public Guid? CreatedByUserId { get; set; }
        public Guid? UpdatedByUserId { get; set; }
        public Guid? DeletedBy { get; set; }

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "active";

        // Navigation properties
        public virtual AppRole ParentRole { get; set; } = null!;
        public virtual AppRole ChildRole { get; set; } = null!;
    }
}