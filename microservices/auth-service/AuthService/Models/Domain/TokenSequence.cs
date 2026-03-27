using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AuthService.Models.Identity;

namespace AuthService.Models.Domain;

/// <summary>
/// Token sequence tracking per branch per day
/// </summary>
[Table("token_sequences")]
public class TokenSequence
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Required]
    [Column("tenant_id")]
    public Guid TenantId { get; set; }

    [Required]
    [Column("branch_id")]
    public Guid BranchId { get; set; }

    // Date for this sequence (tokens reset daily)
    [Required]
    [Column("sequence_date")]
    public DateTime SequenceDate { get; set; }

    // Current sequence number
    [Required]
    [Column("current_sequence")]
    public int CurrentSequence { get; set; } = 0;

    // Branch code prefix (e.g., HYD, BLR, CHE)
    [Required]
    [Column("branch_prefix")]
    [StringLength(10)]
    public string BranchPrefix { get; set; } = null!;

    // Standard audit fields
    [Required]
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    [ForeignKey("TenantId")]
    public virtual Tenant? Tenant { get; set; }

    [ForeignKey("BranchId")]
    public virtual Branch? Branch { get; set; }
}
