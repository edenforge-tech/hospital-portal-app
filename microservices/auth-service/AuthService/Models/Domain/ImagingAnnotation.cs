using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain;

[Table("imaging_annotations")]
public class ImagingAnnotation
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("tenant_id")]
    public required Guid TenantId { get; set; }

    [Column("imaging_image_id")]
    public required Guid ImagingImageId { get; set; }

    [Column("annotation_type")]
    [StringLength(50)]
    public required string AnnotationType { get; set; } // length, angle, roi_rectangle, roi_ellipse, freehand, arrow, text

    [Column("tool_name")]
    [StringLength(100)]
    public string? ToolName { get; set; }

    [Column("coordinates", TypeName = "jsonb")]
    public required string Coordinates { get; set; } // JSON string for shape data

    [Column("measurement_value", TypeName = "numeric(12,3)")]
    public decimal? MeasurementValue { get; set; }

    [Column("measurement_unit")]
    [StringLength(20)]
    public string? MeasurementUnit { get; set; } // µm, mm, degrees, pixels

    [Column("text_content")]
    public string? TextContent { get; set; }

    [Column("color")]
    [StringLength(7)]
    public string Color { get; set; } = "#00FF00";

    [Column("line_width")]
    public int LineWidth { get; set; } = 2;

    [Column("font_size")]
    public int FontSize { get; set; } = 14;

    [Column("annotation_metadata", TypeName = "jsonb")]
    public string? AnnotationMetadata { get; set; } // JSON string for additional data

    [Column("created_by_user_id")]
    public required Guid CreatedByUserId { get; set; }

    [Column("updated_by_user_id")]
    public Guid? UpdatedByUserId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    [Column("status")]
    [StringLength(50)]
    public string Status { get; set; } = "active";

    // Navigation properties
    public virtual ImagingImage? ImagingImage { get; set; }
}
