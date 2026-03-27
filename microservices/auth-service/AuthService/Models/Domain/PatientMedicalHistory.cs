using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain;

/// <summary>
/// Shared patient medical history allowing multiple sources (Optometrist, Counselor, Doctor, etc.)
/// Read-only for viewers of optometrist data; counselors may append their own entries.
/// </summary>
[Table("patient_medical_history")]
public class PatientMedicalHistory
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("tenant_id")]
    public Guid TenantId { get; set; }

    [Column("patient_id")]
    public Guid PatientId { get; set; }

    [Column("source")]
    [StringLength(50)]
    public string Source { get; set; } = "Counselor"; // "Optometrist", "Counselor", "Doctor", "Nurse"

    [Column("recorded_by_user_id")]
    public Guid? RecordedByUserId { get; set; }

    [Column("condition_name")]
    [StringLength(200)]
    public required string ConditionName { get; set; }

    [Column("condition_category")]
    [StringLength(100)]
    public string? ConditionCategory { get; set; } // e.g. "Systemic", "Ocular", "Allergy", "Medication"

    [Column("details")]
    public string? Details { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("recorded_at")]
    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    [Column("status")]
    [StringLength(30)]
    public string Status { get; set; } = "active";
}
