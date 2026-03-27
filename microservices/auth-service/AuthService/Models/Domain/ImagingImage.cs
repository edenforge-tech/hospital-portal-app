using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain;

[Table("imaging_images")]
public class ImagingImage
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("tenant_id")]
    public required Guid TenantId { get; set; }

    [Column("imaging_order_id")]
    public required Guid ImagingOrderId { get; set; }

    [Column("image_url")]
    [StringLength(1000)]
    public required string ImageUrl { get; set; }

    [Column("thumbnail_url")]
    [StringLength(1000)]
    public string? ThumbnailUrl { get; set; }

    [Column("file_name")]
    [StringLength(255)]
    public required string FileName { get; set; }

    [Column("file_size")]
    public long FileSize { get; set; }

    [Column("content_type")]
    [StringLength(100)]
    public required string ContentType { get; set; }

    [Column("width")]
    public int? Width { get; set; }

    [Column("height")]
    public int? Height { get; set; }

    [Column("modality")]
    [StringLength(50)]
    public required string Modality { get; set; } // fundus, oct, visual_field, scheimpflug, iol_calculation, ubm

    [Column("dicom_metadata", TypeName = "jsonb")]
    public string? DicomMetadata { get; set; } // JSON string for DICOM tags

    [Column("uploaded_by_user_id")]
    public required Guid UploadedByUserId { get; set; }

    [Column("uploaded_at")]
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

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
    public virtual ImagingOrder? ImagingOrder { get; set; }
    public virtual ICollection<ImagingAnnotation>? Annotations { get; set; }
}
