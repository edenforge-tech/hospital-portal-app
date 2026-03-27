using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using AuthService.Models.Identity;

namespace AuthService.Models.Domain;

/// <summary>
/// Billing rules configuration - defines free visit criteria
/// </summary>
[Table("billing_rules")]
public class BillingRule
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Required]
    [Column("tenant_id")]
    public Guid TenantId { get; set; }

    [Column("branch_id")]
    public Guid? BranchId { get; set; } // null = applies to all branches

    // Rule name
    [Required]
    [Column("name")]
    [StringLength(100)]
    public string Name { get; set; } = null!;

    // Visit type this rule applies to
    [Required]
    [Column("visit_type")]
    [StringLength(30)]
    public string VisitType { get; set; } = null!; // review, follow_up, post_op

    // Free visit criteria
    [Column("free_days")]
    public int FreeDays { get; set; } = 7; // Within X days from previous visit

    [Column("free_visits")]
    public int FreeVisits { get; set; } = 2; // Maximum free visits allowed

    // Condition: first_reached = whichever limit hits first
    [Column("condition")]
    [StringLength(30)]
    public string Condition { get; set; } = "first_reached"; // first_reached, days_only, visits_only

    // Default consultation fee when not free
    [Column("default_fee")]
    [Precision(10, 2)]
    public decimal DefaultFee { get; set; }

    // Whether this rule is active
    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    // Priority (lower = higher priority when multiple rules match)
    [Column("priority")]
    public int Priority { get; set; } = 100;

    // Description
    [Column("description")]
    [StringLength(500)]
    public string? Description { get; set; }

    // Standard audit fields
    [Required]
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Required]
    [Column("created_by_user_id")]
    public Guid CreatedByUserId { get; set; }

    [Column("updated_by_user_id")]
    public Guid? UpdatedByUserId { get; set; }

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    // Navigation properties
    [ForeignKey("TenantId")]
    public virtual Tenant? Tenant { get; set; }

    [ForeignKey("BranchId")]
    public virtual Branch? Branch { get; set; }

    [ForeignKey("CreatedByUserId")]
    public virtual AppUser? CreatedByUser { get; set; }

    [ForeignKey("UpdatedByUserId")]
    public virtual AppUser? UpdatedByUser { get; set; }
}
