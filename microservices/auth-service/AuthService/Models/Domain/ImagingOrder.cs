using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain;

[Table("imaging_orders")]
public class ImagingOrder
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("tenant_id")]
    public required Guid TenantId { get; set; }

    [Column("patient_id")]
    public required Guid PatientId { get; set; }

    [Column("examination_id")]
    public Guid? ExaminationId { get; set; }

    [Column("session_id")]
    public Guid? SessionId { get; set; }

    [Column("imaging_type")]
    [StringLength(100)]
    public required string ImagingType { get; set; }

    [Column("laterality")]
    [StringLength(20)]
    public string? Laterality { get; set; } // "Right", "Left", "Both"

    [Column("urgency")]
    [StringLength(20)]
    public string Urgency { get; set; } = "Routine"; // "Routine", "Urgent", "STAT"

    [Column("clinical_indication")]
    [StringLength(1000)]
    public string? ClinicalIndication { get; set; }

    [Column("ordering_doctor_id")]
    public required Guid OrderingDoctorId { get; set; }

    [Column("status")]
    [StringLength(50)]
    public string Status { get; set; } = "Pending"; // "Pending", "In-Progress", "Completed", "Reviewed", "Cancelled"

    [Column("ordered_at")]
    public DateTime OrderedAt { get; set; } = DateTime.UtcNow;

    [Column("completed_at")]
    public DateTime? CompletedAt { get; set; }

    [Column("reviewed_by_user_id")]
    public Guid? ReviewedByUserId { get; set; }

    [Column("reviewed_at")]
    public DateTime? ReviewedAt { get; set; }

    [Column("result_summary")]
    public string? ResultSummary { get; set; }

    [Column("dicom_study_id")]
    [StringLength(64)]
    public string? DicomStudyId { get; set; }

    [Column("image_storage_path")]
    [StringLength(500)]
    public string? ImageStoragePath { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("created_by_user_id")]
    public Guid? CreatedByUserId { get; set; }

    [Column("updated_by_user_id")]
    public Guid? UpdatedByUserId { get; set; }

    // Navigation properties
    public virtual Patient? Patient { get; set; }
    public virtual ClinicalExamination? Examination { get; set; }
}
