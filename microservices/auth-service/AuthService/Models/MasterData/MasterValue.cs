using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace AuthService.Models.MasterData
{
    /// <summary>
    /// Central master data value - single table for all 53 entity types across 12 groups.
    /// Maps to master.master_value (PostgreSQL schema: master).
    /// </summary>
    public class MasterValue
    {
        public Guid Id { get; set; }

        [Required]
        public Guid TenantId { get; set; }

        [Required]
        [MaxLength(100)]
        public string GroupKey { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string EntityType { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Label { get; set; } = string.Empty;

        public string? Description { get; set; }

        /// <summary>
        /// Flexible JSONB column for extra fields (e.g. {"rate": 5} for GST, {"days": 30} for payment terms)
        /// </summary>
        public string Metadata { get; set; } = "{}";

        public int SortOrder { get; set; } = 0;
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// System-locked values (e.g. blood groups, gender) cannot be deleted by tenant admins.
        /// </summary>
        public bool IsSystemLocked { get; set; } = false;

        // Disable audit columns (set when IsActive is set to false)
        public DateTime? DisabledAt { get; set; }
        public Guid? DisabledByUserId { get; set; }
        public string? DisabledReason { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public Guid? CreatedByUserId { get; set; }
        public Guid? UpdatedByUserId { get; set; }
        public DateTime? DeletedAt { get; set; }
    }

    /// <summary>
    /// Registry of all 53 entity types and their group membership.
    /// Maps to master.entity_type_registry.
    /// </summary>
    public class EntityTypeRegistry
    {
        [Key]
        [MaxLength(150)]
        public string EntityType { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string GroupKey { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string DisplayName { get; set; } = string.Empty;

        public string? Description { get; set; }

        [MaxLength(100)]
        public string? TabLabel { get; set; }

        public bool AllowCustomFields { get; set; } = false;
        public int SortOrder { get; set; } = 0;
    }
}
