using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain;

[Table("patient_notes")]
public class PatientNote
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Required]
    [Column("tenant_id")]
    public Guid TenantId { get; set; }

    [Required]
    [Column("patient_id")]
    public Guid PatientId { get; set; }

    [Column("visit_id")]
    public Guid? VisitId { get; set; }

    [Required]
    [Column("note_type")]
    [MaxLength(50)]
    public string NoteType { get; set; } = "general"; // general, clinical, progress, discharge, nursing, consult, procedure, follow_up

    [Required]
    [Column("title")]
    [MaxLength(300)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [Column("content")]
    [MaxLength(8000)]
    public string Content { get; set; } = string.Empty;

    [Column("is_flagged")]
    public bool IsFlagged { get; set; } = false;

    [Column("flag_reason")]
    [MaxLength(500)]
    public string? FlagReason { get; set; }

    [Column("priority")]
    [MaxLength(20)]
    public string Priority { get; set; } = "normal"; // low, normal, high, critical

    [Column("author_id")]
    public Guid? AuthorId { get; set; }

    [Column("author_name")]
    [MaxLength(200)]
    public string? AuthorName { get; set; }

    [Column("is_confidential")]
    public bool IsConfidential { get; set; } = false;

    [Required]
    [Column("status")]
    [MaxLength(20)]
    public string Status { get; set; } = "active"; // active, archived, draft

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

    [ForeignKey("PatientId")]
    public virtual Patient? Patient { get; set; }
}
