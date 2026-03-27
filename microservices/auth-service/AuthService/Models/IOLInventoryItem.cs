using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AuthService.Models.Domain;

namespace AuthService.Models
{
    [Table("iol_inventory")]
    public class IOLInventoryItem
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Column("branch_id")]
        public Guid? BranchId { get; set; }

        // IOL Details
        [Required]
        [Column("model")]
        [MaxLength(200)]
        public string Model { get; set; } = null!;

        [Required]
        [Column("manufacturer")]
        [MaxLength(100)]
        public string Manufacturer { get; set; } = null!;

        [Required]
        [Column("sku")]
        [MaxLength(100)]
        public string Sku { get; set; } = null!;

        [Required]
        [Column("type")]
        [MaxLength(50)]
        public string Type { get; set; } = null!; // MONOFOCAL, MULTIFOCAL, TORIC, EDOF

        [Required]
        [Column("material")]
        [MaxLength(100)]
        public string Material { get; set; } = "Acrylic";

        // Optical Properties
        [Required]
        [Column("a_constant")]
        public decimal AConstant { get; set; }

        [Required]
        [Column("power_range_min")]
        public decimal PowerRangeMin { get; set; }

        [Required]
        [Column("power_range_max")]
        public decimal PowerRangeMax { get; set; }

        [Required]
        [Column("power_increment")]
        public decimal PowerIncrement { get; set; }

        [Required]
        [Column("optic_diameter")]
        public decimal OpticDiameter { get; set; }

        [Required]
        [Column("overall_diameter")]
        public decimal OverallDiameter { get; set; }

        // For Toric IOLs
        [Column("cylinder_power_range")]
        [MaxLength(50)]
        public string? CylinderPowerRange { get; set; }

        [Column("toricity")]
        [MaxLength(50)]
        public string? Toricity { get; set; }

        // Stock Management
        [Required]
        [Column("current_stock")]
        public int CurrentStock { get; set; }

        [Required]
        [Column("minimum_stock")]
        public int MinimumStock { get; set; }

        [Required]
        [Column("reorder_quantity")]
        public int ReorderQuantity { get; set; }

        [Column("location")]
        [MaxLength(100)]
        public string? Location { get; set; }

        // Pricing
        [Required]
        [Column("unit_price")]
        public decimal UnitPrice { get; set; }

        [Column("supplier_cost")]
        public decimal? SupplierCost { get; set; }

        // Supplier Info
        [Column("supplier_id")]
        public Guid? SupplierId { get; set; }

        [Column("supplier_name")]
        [MaxLength(200)]
        public string? SupplierName { get; set; }

        [Column("lead_time_days")]
        public int? LeadTimeDays { get; set; }

        // Usage Tracking
        [Column("total_used")]
        public int TotalUsed { get; set; } = 0;

        [Column("last_used_date")]
        public DateTime? LastUsedDate { get; set; }

        // Additional Info
        [Column("notes")]
        public string? Notes { get; set; }

        [Column("expiry_date")]
        public DateTime? ExpiryDate { get; set; }

        [Column("batch_number")]
        [MaxLength(100)]
        public string? BatchNumber { get; set; }

        // Audit Fields
        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("created_by_user_id")]
        public Guid? CreatedByUserId { get; set; }

        [Column("updated_by_user_id")]
        public Guid? UpdatedByUserId { get; set; }

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        [Required]
        [Column("status")]
        [MaxLength(50)]
        public string Status { get; set; } = "active";

        // Navigation Properties
        [ForeignKey("TenantId")]
        public virtual AuthService.Models.Domain.Tenant? Tenant { get; set; }

        [ForeignKey("BranchId")]
        public virtual AuthService.Models.Domain.Branch? Branch { get; set; }
    }

    [Table("iol_stock_adjustments")]
    public class IOLStockAdjustment
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Required]
        [Column("item_id")]
        public Guid ItemId { get; set; }

        [Required]
        [Column("quantity")]
        public int Quantity { get; set; }

        [Required]
        [Column("type")]
        [MaxLength(50)]
        public string Type { get; set; } = null!; // ADDITION, USAGE, RETURN, DAMAGE, ADJUSTMENT

        [Required]
        [Column("reason")]
        public string Reason { get; set; } = null!;

        [Column("patient_id")]
        public Guid? PatientId { get; set; }

        [Column("surgery_id")]
        public Guid? SurgeryId { get; set; }

        [Column("batch_number")]
        [MaxLength(100)]
        public string? BatchNumber { get; set; }

        [Column("expiry_date")]
        public DateTime? ExpiryDate { get; set; }

        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        [Column("created_by_user_id")]
        public Guid CreatedByUserId { get; set; }

        // Navigation Properties
        [ForeignKey("ItemId")]
        public virtual IOLInventoryItem? Item { get; set; }
    }
}
