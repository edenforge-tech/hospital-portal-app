using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models
{
    /// <summary>
    /// Filter preset entity for saving user-defined filter views
    /// Phase 4.2 - Advanced Filters & Saved Views
    /// </summary>
    [Table("filter_preset")]
    public class FilterPreset
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("user_id")]
        public Guid UserId { get; set; }

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Column("filters", TypeName = "jsonb")]
        public string Filters { get; set; } = "{}"; // JSONB stored as string

        [Required]
        [MaxLength(50)]
        [Column("entity_type")]
        public string EntityType { get; set; } = string.Empty; // counseling_session, follow_up, queue, etc.

        [Column("is_default")]
        public bool IsDefault { get; set; } = false;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("created_by_user_id")]
        public Guid? CreatedByUserId { get; set; }

        [Column("updated_by_user_id")]
        public Guid? UpdatedByUserId { get; set; }

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        [MaxLength(20)]
        [Column("status")]
        public string Status { get; set; } = "active"; // active, inactive, archived

        // Navigation properties omitted for simplicity - relationships enforced at DB level
    }

    /// <summary>
    /// DTO for creating/updating filter presets
    /// </summary>
    public class FilterPresetDto
    {
        public Guid? Id { get; set; }
        public Guid UserId { get; set; }
        public Guid TenantId { get; set; }
        public string Name { get; set; } = string.Empty;
        public object Filters { get; set; } = new { }; // Dynamic filter object
        public string EntityType { get; set; } = string.Empty;
        public bool IsDefault { get; set; } = false;
        public string Status { get; set; } = "active";
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    /// <summary>
    /// Request model for creating a new filter preset
    /// </summary>
    public class CreateFilterPresetRequest
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public object Filters { get; set; } = new { };

        [Required]
        [MaxLength(50)]
        public string EntityType { get; set; } = string.Empty;

        public bool IsDefault { get; set; } = false;
    }

    /// <summary>
    /// Request model for updating a filter preset
    /// </summary>
    public class UpdateFilterPresetRequest
    {
        [MaxLength(100)]
        public string? Name { get; set; }

        public object? Filters { get; set; }

        public bool? IsDefault { get; set; }

        [MaxLength(20)]
        public string? Status { get; set; }
    }
}
