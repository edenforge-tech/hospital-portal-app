using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AuthService.Models.Identity;

namespace AuthService.Models.Domain
{
    /// <summary>
    /// Branch-specific pricing overrides for hybrid pricing model
    /// Supports polymorphic item references (IOL, Surgery, DiagnosticTest, Service, Medication, Package)
    /// Pricing strategies: Fixed, PercentageDiscount, PercentageMarkup, CostPlus
    /// </summary>
    [Table("branch_pricing_overrides")]
    public class BranchPricingOverride
    {
        // ============================================================================
        // CORE IDENTIFICATION
        // ============================================================================
        [Key]
        public Guid Id { get; set; }
        
        [Required]
        public Guid TenantId { get; set; }
        
        [Required]
        public Guid BranchId { get; set; }
        
        // ============================================================================
        // POLYMORPHIC ITEM REFERENCE
        // ============================================================================
        [Required]
        [MaxLength(50)]
        public string ItemType { get; set; } = string.Empty; // IOL, Surgery, DiagnosticTest, Service, Medication, Package
        
        [Required]
        public Guid ItemId { get; set; } // References different tables based on ItemType
        
        // ============================================================================
        // PRICING OVERRIDE
        // ============================================================================
        [Column(TypeName = "decimal(15,2)")]
        public decimal? OverridePrice { get; set; } // Null means use default price
        
        [Column(TypeName = "decimal(5,2)")]
        public decimal? DiscountPercentage { get; set; }
        
        [MaxLength(50)]
        public string PricingStrategy { get; set; } = "Fixed"; // Fixed, PercentageDiscount, PercentageMarkup, CostPlus
        
        // ============================================================================
        // EFFECTIVE DATE RANGE
        // ============================================================================
        public DateTime? EffectiveFrom { get; set; }
        
        public DateTime? EffectiveTo { get; set; }
        
        // ============================================================================
        // APPROVAL & AUDIT
        // ============================================================================
        public string? Reason { get; set; }
        
        public Guid? ApprovedByUserId { get; set; }
        
        public DateTime? ApprovedAt { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        // ============================================================================
        // AUDIT FIELDS
        // ============================================================================
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public Guid? CreatedByUserId { get; set; }
        
        public Guid? UpdatedByUserId { get; set; }
        
        public DateTime? DeletedAt { get; set; }
        
        [MaxLength(50)]
        public string Status { get; set; } = "active";
        
        // ============================================================================
        // NAVIGATION PROPERTIES
        // ============================================================================
        [ForeignKey("TenantId")]
        public virtual Tenant? Tenant { get; set; }
        
        [ForeignKey("BranchId")]
        public virtual Branch? Branch { get; set; }
        
        [ForeignKey("ApprovedByUserId")]
        public virtual AppUser? ApprovedBy { get; set; }
    }
}
