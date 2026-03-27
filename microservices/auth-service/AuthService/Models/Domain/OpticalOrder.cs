using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain;

[Table("optical_orders")]
public class OpticalOrder
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

    [Column("order_number")]
    [MaxLength(50)]
    public string? OrderNumber { get; set; }

    [Required]
    [Column("order_type")]
    [MaxLength(50)]
    public string OrderType { get; set; } = "eyeglasses"; // eyeglasses, contact_lenses, sunglasses, safety_glasses

    // Right Eye (OD)
    [Column("od_sphere")]
    public decimal? OdSphere { get; set; }

    [Column("od_cylinder")]
    public decimal? OdCylinder { get; set; }

    [Column("od_axis")]
    public int? OdAxis { get; set; }

    [Column("od_add")]
    public decimal? OdAdd { get; set; }

    [Column("od_prism")]
    [MaxLength(50)]
    public string? OdPrism { get; set; }

    [Column("od_va")]
    [MaxLength(20)]
    public string? OdVa { get; set; }

    // Left Eye (OS)
    [Column("os_sphere")]
    public decimal? OsSphere { get; set; }

    [Column("os_cylinder")]
    public decimal? OsCylinder { get; set; }

    [Column("os_axis")]
    public int? OsAxis { get; set; }

    [Column("os_add")]
    public decimal? OsAdd { get; set; }

    [Column("os_prism")]
    [MaxLength(50)]
    public string? OsPrism { get; set; }

    [Column("os_va")]
    [MaxLength(20)]
    public string? OsVa { get; set; }

    // Measurements
    [Column("pd")]
    public decimal? Pd { get; set; }

    [Column("pd_right")]
    public decimal? PdRight { get; set; }

    [Column("pd_left")]
    public decimal? PdLeft { get; set; }

    [Column("seg_height")]
    public decimal? SegHeight { get; set; }

    // Frame & Lens
    [Column("frame_type")]
    [MaxLength(100)]
    public string? FrameType { get; set; }

    [Column("frame_brand")]
    [MaxLength(200)]
    public string? FrameBrand { get; set; }

    [Column("frame_model")]
    [MaxLength(200)]
    public string? FrameModel { get; set; }

    [Column("frame_color")]
    [MaxLength(100)]
    public string? FrameColor { get; set; }

    [Column("lens_type")]
    [MaxLength(100)]
    public string? LensType { get; set; } // single_vision, bifocal, progressive, reading

    [Column("lens_material")]
    [MaxLength(100)]
    public string? LensMaterial { get; set; } // cr39, polycarbonate, trivex, hi_index_1.67, hi_index_1.74

    [Column("lens_coating")]
    [MaxLength(200)]
    public string? LensCoating { get; set; } // anti_reflective, blue_light, photochromic, scratch_resistant

    [Column("tint")]
    [MaxLength(100)]
    public string? Tint { get; set; }

    // Dates & Financial
    [Column("order_date")]
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;

    [Column("estimated_delivery")]
    public DateTime? EstimatedDelivery { get; set; }

    [Column("delivered_at")]
    public DateTime? DeliveredAt { get; set; }

    [Column("amount")]
    public decimal? Amount { get; set; }

    [Column("paid_amount")]
    public decimal? PaidAmount { get; set; }

    [Column("prescribed_by_name")]
    [MaxLength(200)]
    public string? PrescribedByName { get; set; }

    [Column("prescribed_by_id")]
    public Guid? PrescribedById { get; set; }

    [Column("notes")]
    [MaxLength(2000)]
    public string? Notes { get; set; }

    [Required]
    [Column("status")]
    [MaxLength(30)]
    public string Status { get; set; } = "ordered"; // ordered, in_production, ready, delivered, cancelled, returned

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
