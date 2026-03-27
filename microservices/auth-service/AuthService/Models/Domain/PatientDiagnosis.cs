using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain;

[Table("patient_diagnosis")]
public class PatientDiagnosis
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("tenant_id")]
    public required Guid TenantId { get; set; }

    [Column("patient_id")]
    public required Guid PatientId { get; set; }

    [Column("diagnosis_code_id")]
    public required Guid DiagnosisCodeId { get; set; }

    [Column("visit_id")]
    public Guid? VisitId { get; set; }

    [Column("examination_id")]
    public Guid? ExaminationId { get; set; }

    [Column("diagnosis_type")]
    [StringLength(20)]
    public string? DiagnosisType { get; set; } // primary, secondary, rule-out

    [Column("eye_specificity")]
    [StringLength(15)]
    public string? EyeSpecificity { get; set; } // OD, OS, OU, Unspecified

    [Column("diagnosed_at")]
    public DateTime DiagnosedAt { get; set; } = DateTime.UtcNow;

    [Column("diagnosed_by_user_id")]
    public required Guid DiagnosedByUserId { get; set; }

    [Column("clinical_notes")]
    public string? ClinicalNotes { get; set; }

    [Column("status")]
    [StringLength(50)]
    public string Status { get; set; } = "active";

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

    // Navigation properties
    [ForeignKey("TenantId")]
    public Tenant? Tenant { get; set; }

    [ForeignKey("PatientId")]
    public Patient? Patient { get; set; }

    [ForeignKey("DiagnosisCodeId")]
    public DiagnosisCode? DiagnosisCode { get; set; }
}
