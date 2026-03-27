using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Models.Domain
{
    /// <summary>
    /// Role templates for predefined role configurations
    /// Templates provide baseline configurations that can be used to create new roles
    /// </summary>
    public class RoleTemplate
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid TenantId { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string RoleType { get; set; } = string.Empty; // System, Custom, Department, Project

        [Required]
        [StringLength(50)]
        public string TemplateCategory { get; set; } = string.Empty; // Medical, Administrative, IT, Security

        public int Priority { get; set; } = 0;

        /// <summary>
        /// JSON string containing permission IDs and settings
        /// Format: { "permissions": [...], "settings": {...} }
        /// </summary>
        public string Configuration { get; set; } = "{}";

        /// <summary>
        /// JSON metadata for template customization
        /// </summary>
        public string Metadata { get; set; } = "{}";

        public bool IsActive { get; set; } = true;
        public bool IsSystemTemplate { get; set; } = false;

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
    }
}