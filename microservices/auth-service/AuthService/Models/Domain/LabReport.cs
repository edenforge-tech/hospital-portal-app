using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain;

[Table("lab_reports")]
public class LabReport
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
    [Column("test_name")]
    [MaxLength(300)]
    public string TestName { get; set; } = string.Empty;

    [Column("test_code")]
    [MaxLength(50)]
    public string? TestCode { get; set; }

    [Column("test_category")]
    [MaxLength(100)]
    public string? TestCategory { get; set; } // hematology, biochemistry, microbiology, pathology, ophthalmology

    [Column("ordered_by_name")]
    [MaxLength(200)]
    public string? OrderedByName { get; set; }

    [Column("ordered_by_id")]
    public Guid? OrderedById { get; set; }

    [Column("ordered_at")]
    public DateTime? OrderedAt { get; set; }

    [Column("sample_collected_at")]
    public DateTime? SampleCollectedAt { get; set; }

    [Column("completed_at")]
    public DateTime? CompletedAt { get; set; }

    [Column("result_value")]
    [MaxLength(200)]
    public string? ResultValue { get; set; }

    [Column("result_unit")]
    [MaxLength(50)]
    public string? ResultUnit { get; set; }

    [Column("reference_range")]
    [MaxLength(200)]
    public string? ReferenceRange { get; set; }

    [Column("interpretation")]
    [MaxLength(20)]
    public string? Interpretation { get; set; } // normal, abnormal, critical, high, low

    [Column("lab_name")]
    [MaxLength(200)]
    public string? LabName { get; set; }

    [Column("technician_name")]
    [MaxLength(200)]
    public string? TechnicianName { get; set; }

    [Column("verified_by_name")]
    [MaxLength(200)]
    public string? VerifiedByName { get; set; }

    [Column("specimen_type")]
    [MaxLength(100)]
    public string? SpecimenType { get; set; } // blood, urine, tissue, swab

    [Column("priority")]
    [MaxLength(20)]
    public string Priority { get; set; } = "routine"; // routine, urgent, stat

    [Column("notes")]
    [MaxLength(2000)]
    public string? Notes { get; set; }

    [Column("report_url")]
    [MaxLength(500)]
    public string? ReportUrl { get; set; }

    [Required]
    [Column("status")]
    [MaxLength(30)]
    public string Status { get; set; } = "ordered"; // ordered, sample_collected, in_progress, completed, cancelled, on_hold

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
