using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AuthService.Models.Identity;

namespace AuthService.Models.Domain
{
    /// <summary>
    /// User-Branch access junction table for multi-branch staff assignments
    /// </summary>
    [Table("user_branch_access")]
    public class UserBranch
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Required]
        [Column("user_id")]
        public Guid UserId { get; set; }

        [Required]
        [Column("branch_id")]
        public Guid BranchId { get; set; }

        [Column("is_primary")]
        public bool IsPrimary { get; set; } = false;

        [Column("access_level")]
        [MaxLength(50)]
        public string AccessLevel { get; set; } = "Full";

        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "active";

        [Column("valid_from")]
        public DateTime? ValidFrom { get; set; }

        [Column("valid_until")]
        public DateTime? ValidUntil { get; set; }

        [Column("assigned_on")]
        public DateTime AssignedOn { get; set; } = DateTime.UtcNow;

        [Column("assigned_by")]
        public Guid? AssignedBy { get; set; }

        // Audit fields
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("created_by")]
        public Guid? CreatedBy { get; set; }

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [Column("updated_by")]
        public Guid? UpdatedBy { get; set; }

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual AppUser? User { get; set; }

        [ForeignKey("BranchId")]
        public virtual Branch? Branch { get; set; }
    }
}
