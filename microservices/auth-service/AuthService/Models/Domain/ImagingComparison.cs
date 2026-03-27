using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain;

[Table("imaging_comparisons")]
public class ImagingComparison
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("tenant_id")]
    public required Guid TenantId { get; set; }

    [Column("patient_id")]
    public required Guid PatientId { get; set; }

    [Column("baseline_image_id")]
    public required Guid BaselineImageId { get; set; }

    [Column("followup_image_id")]
    public required Guid FollowupImageId { get; set; }

    [Column("comparison_type")]
    [StringLength(50)]
    public string ComparisonType { get; set; } = "progression"; // progression, response_to_treatment, bilateral, pre_post_surgery

    [Column("time_interval_days")]
    public int? TimeIntervalDays { get; set; }

    [Column("findings")]
    public string? Findings { get; set; }

    [Column("change_percentage", TypeName = "numeric(5,2)")]
    public decimal? ChangePercentage { get; set; }

    [Column("clinical_significance")]
    [StringLength(50)]
    public string? ClinicalSignificance { get; set; } // improving, stable, worsening, significant_progression

    [Column("quantitative_metrics", TypeName = "jsonb")]
    public string? QuantitativeMetrics { get; set; } // JSON string for structured metrics

    [Column("reviewed_by_user_id")]
    public required Guid ReviewedByUserId { get; set; }

    [Column("reviewed_at")]
    public DateTime ReviewedAt { get; set; } = DateTime.UtcNow;

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

    [Column("status")]
    [StringLength(50)]
    public string Status { get; set; } = "active";

    // Navigation properties
    public virtual Patient? Patient { get; set; }
    public virtual ImagingImage? BaselineImage { get; set; }
    public virtual ImagingImage? FollowupImage { get; set; }
}
