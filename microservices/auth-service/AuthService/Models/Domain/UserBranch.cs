using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AuthService.Models.Identity;

namespace AuthService.Models.Domain
{
    /// <summary>
    /// User-Branch access junction table for multi-branch staff assignments
    /// Allows users to work across multiple branches with configurable access levels
    /// </summary>
    [Table("user_branches")]
    public class UserBranch
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Required]
        [Column("user_id")]
        public Guid UserId { get; set; }

        [Required]
        [Column("branch_id")]
        public Guid BranchId { get; set; }

        /// <summary>
        /// Indicates if this is the user's default/primary branch
        /// Only one default branch per user (enforced by unique index)
        /// </summary>
        [Column("is_default")]
        public bool IsDefault { get; set; } = false;

        [Column("assigned_at")]
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

        [Column("assigned_by_user_id")]
        public Guid? AssignedByUserId { get; set; }

        [Column("effective_from")]
        public DateTime EffectiveFrom { get; set; } = DateTime.UtcNow;

        [Column("effective_until")]
        public DateTime? EffectiveUntil { get; set; }

        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "active"; // active, inactive, expired

        [Column("notes")]
        public string? Notes { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("created_by_user_id")]
        public Guid? CreatedByUserId { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_by_user_id")]
        public Guid? UpdatedByUserId { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual AppUser? User { get; set; }

        [ForeignKey("BranchId")]
        public virtual Branch? Branch { get; set; }
    }
}
