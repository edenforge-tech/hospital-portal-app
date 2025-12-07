using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AuthService.Models.Identity;

namespace AuthService.Models.Domain;

[Table("clinical_examinations")]
public class ClinicalExamination
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("tenant_id")]
    public required Guid TenantId { get; set; }

    [Column("patient_id")]
    public required Guid PatientId { get; set; }

    [Column("examination_date")]
    public required DateTime ExaminationDate { get; set; }

    [Column("chief_complaint")]
    [StringLength(500)]
    public required string ChiefComplaint { get; set; }

    [Column("examination_notes")]
    public string? ExaminationNotes { get; set; }

    [Column("diagnosis")]
    [StringLength(500)]
    public string? Diagnosis { get; set; }

    [Column("treatment_plan")]
    public string? TreatmentPlan { get; set; }

    [Column("prescription")]
    public string? Prescription { get; set; }

    [Column("follow_up_date")]
    public DateTime? FollowUpDate { get; set; }

    [Column("examining_doctor_id")]
    public required Guid ExaminingDoctorId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Patient? Patient { get; set; }
    public virtual AppUser? ExaminingDoctor { get; set; }
}