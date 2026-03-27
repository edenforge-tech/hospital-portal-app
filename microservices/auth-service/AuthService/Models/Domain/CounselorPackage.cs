using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain
{
    /// <summary>
    /// Surgery Package Template Master - Defines standard surgery packages offered by the hospital
    /// Table: surgery_package_templates
    /// </summary>
    [Table("surgery_package_templates")]
    public class SurgeryPackageTemplate
    {
        [Column("id")]
        public Guid Id { get; set; }
        
        [Column("tenant_id")]
        public Guid TenantId { get; set; }
        
        [Column("package_name")]
        public string PackageName { get; set; } = string.Empty;
        
        [Column("package_code")]
        public string? PackageCode { get; set; }
        
        [Column("package_category")]
        public string PackageCategory { get; set; } = string.Empty;
        
        [Column("description")]
        public string? Description { get; set; }
        
        [Column("base_price")]
        public decimal BasePrice { get; set; }
        
        [Column("currency")]
        public string Currency { get; set; } = "INR";
        
        [Column("max_discount_percent")]
        public decimal MaxDiscountPercent { get; set; } = 10.00m;
        
        [Column("requires_approval_for_custom")]
        public bool RequiresApprovalForCustom { get; set; } = true;
        
        [Column("applicable_surgery_types")]
        public string[]? ApplicableSurgeryTypes { get; set; }
        
        [Column("included_services")]
        public string[]? IncludedServices { get; set; }
        
        [Column("validity_days")]
        public int ValidityDays { get; set; } = 90;
        
        [Column("is_active")]
        public bool IsActive { get; set; } = true;
        
        [Column("status")]
        public string Status { get; set; } = "active";
        
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
        
        [Column("created_by_user_id")]
        public Guid? CreatedByUserId { get; set; }
        
        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }
        
        [Column("updated_by_user_id")]
        public Guid? UpdatedByUserId { get; set; }
        
        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }
    }

    /// <summary>
    /// Surgery Package Items Catalog - Reusable package components/line items
    /// Table: surgery_package_items_catalog
    /// </summary>
    [Table("surgery_package_items_catalog")]
    public class SurgeryPackageItemCatalog
    {
        [Column("id")]
        public Guid Id { get; set; }
        
        [Column("tenant_id")]
        public Guid TenantId { get; set; }
        
        [Column("item_name")]
        public string ItemName { get; set; } = string.Empty;
        
        [Column("item_code")]
        public string? ItemCode { get; set; }
        
        [Column("item_category")]
        public string ItemCategory { get; set; } = string.Empty;
        
        [Column("description")]
        public string? Description { get; set; }
        
        [Column("default_price")]
        public decimal DefaultPrice { get; set; }
        
        [Column("cost_price")]
        public decimal? CostPrice { get; set; }
        
        [Column("currency")]
        public string Currency { get; set; } = "INR";
        
        [Column("specifications", TypeName = "jsonb")]
        public string? Specifications { get; set; }
        
        [Column("unit_of_measure")]
        public string UnitOfMeasure { get; set; } = "Service";
        
        [Column("is_optional")]
        public bool IsOptional { get; set; } = false;
        
        [Column("requires_prescription")]
        public bool RequiresPrescription { get; set; } = false;
        
        [Column("requires_authorization")]
        public bool RequiresAuthorization { get; set; } = false;
        
        [Column("is_active")]
        public bool IsActive { get; set; } = true;
        
        [Column("status")]
        public string Status { get; set; } = "active";
        
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
        
        [Column("created_by_user_id")]
        public Guid? CreatedByUserId { get; set; }
        
        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }
        
        [Column("updated_by_user_id")]
        public Guid? UpdatedByUserId { get; set; }
        
        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }
    }

    /// <summary>
    /// Counselor Packages - Packages built by counselors for patients
    /// Table: counselor_packages
    /// </summary>
    [Table("counselor_packages")]
    public class CounselorPackage
    {
        [Column("id")]
        public Guid Id { get; set; }
        
        [Column("tenant_id")]
        public Guid TenantId { get; set; }
        
        [Column("branch_id")]
        public Guid? BranchId { get; set; }
        
        [Column("session_id")]
        public Guid SessionId { get; set; }
        
        [Column("source_type")]
        public string SourceType { get; set; } = string.Empty;
        
        [Column("template_id")]
        public Guid? TemplateId { get; set; }
        
        [Column("package_name")]
        public string PackageName { get; set; } = string.Empty;
        
        [Column("package_description")]
        public string? PackageDescription { get; set; }
        
        [Column("base_price")]
        public decimal BasePrice { get; set; }
        
        [Column("discount_percent")]
        public decimal DiscountPercent { get; set; } = 0;
        
        [Column("discount_amount")]
        public decimal DiscountAmount { get; set; } = 0;
        
        [Column("discount_reason")]
        public string? DiscountReason { get; set; }
        
        [Column("tax_percent")]
        public decimal TaxPercent { get; set; } = 0;
        
        [Column("tax_amount")]
        public decimal TaxAmount { get; set; } = 0;
        
        [Column("final_price")]
        public decimal FinalPrice { get; set; }
        
        [Column("discount_approval_status")]
        public string DiscountApprovalStatus { get; set; } = "NotRequired";
        
        [Column("approved_by_user_id")]
        public Guid? ApprovedByUserId { get; set; }
        
        [Column("approved_at")]
        public DateTime? ApprovedAt { get; set; }
        
        [Column("rejection_reason")]
        public string? RejectionReason { get; set; }
        
        [Column("valid_from")]
        public DateTime ValidFrom { get; set; }
        
        [Column("valid_until")]
        public DateTime? ValidUntil { get; set; }
        
        [Column("status")]
        public string Status { get; set; } = "draft";
        
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
        
        [Column("created_by_user_id")]
        public Guid CreatedByUserId { get; set; }
        
        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }
        
        [Column("updated_by_user_id")]
        public Guid? UpdatedByUserId { get; set; }
        
        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Navigation properties
        [ForeignKey("TemplateId")]
        public SurgeryPackageTemplate? Template { get; set; }
        
        public ICollection<CounselorPackageItem> Items { get; set; } = new List<CounselorPackageItem>();
    }

    /// <summary>
    /// Counselor Package Items - Line items in counselor packages
    /// Table: counselor_package_items
    /// </summary>
    [Table("counselor_package_items")]
    public class CounselorPackageItem
    {
        [Column("id")]
        public Guid Id { get; set; }
        
        [Column("tenant_id")]
        public Guid TenantId { get; set; }
        
        [Column("package_id")]
        public Guid PackageId { get; set; }
        
        [Column("catalog_item_id")]
        public Guid? CatalogItemId { get; set; }
        
        [Column("item_name")]
        public string ItemName { get; set; } = string.Empty;
        
        [Column("item_category")]
        public string? ItemCategory { get; set; }
        
        [Column("item_description")]
        public string? ItemDescription { get; set; }
        
        [Column("unit_price")]
        public decimal UnitPrice { get; set; }
        
        [Column("quantity")]
        public decimal Quantity { get; set; } = 1;
        
        [Column("total_price")]
        public decimal TotalPrice { get; set; }
        
        [Column("is_included")]
        public bool IsIncluded { get; set; } = true;
        
        [Column("is_mandatory")]
        public bool IsMandatory { get; set; } = false;
        
        [Column("display_order")]
        public int DisplayOrder { get; set; } = 0;
        
        [Column("status")]
        public string Status { get; set; } = "active";
        
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
        
        [Column("created_by_user_id")]
        public Guid? CreatedByUserId { get; set; }
        
        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }
        
        [Column("updated_by_user_id")]
        public Guid? UpdatedByUserId { get; set; }
        
        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Navigation properties
        [ForeignKey("PackageId")]
        public CounselorPackage Package { get; set; } = null!;
        
        [ForeignKey("CatalogItemId")]
        public SurgeryPackageItemCatalog? CatalogItem { get; set; }
    }

    /// <summary>
    /// Package Discount Approvals - Hierarchical approval workflow for package discounts with SLA tracking
    /// Table: package_discount_approvals
    /// </summary>
    [Table("package_discount_approvals")]
    public class PackageDiscountApproval
    {
        [Column("id")]
        public Guid Id { get; set; }
        
        [Column("tenant_id")]
        public Guid TenantId { get; set; }
        
        [Column("branch_id")]
        public Guid? BranchId { get; set; }
        
        [Column("package_id")]
        public Guid PackageId { get; set; }
        
        [Column("request_number")]
        public string? RequestNumber { get; set; }
        
        [Column("requested_by_user_id")]
        public Guid RequestedByUserId { get; set; }
        
        [Column("discount_percent")]
        public decimal DiscountPercent { get; set; }
        
        [Column("discount_amount")]
        public decimal DiscountAmount { get; set; }
        
        [Column("original_price")]
        public decimal OriginalPrice { get; set; }
        
        [Column("final_price")]
        public decimal FinalPrice { get; set; }
        
        [Column("justification")]
        public string Justification { get; set; } = string.Empty;
        
        [Column("approval_level")]
        public int ApprovalLevel { get; set; } = 1;
        
        [Column("assigned_to_user_id")]
        public Guid? AssignedToUserId { get; set; }
        
        [Column("assigned_to_role")]
        public string? AssignedToRole { get; set; }
        
        [Column("reviewed_by_user_id")]
        public Guid? ReviewedByUserId { get; set; }
        
        [Column("reviewed_at")]
        public DateTime? ReviewedAt { get; set; }
        
        [Column("review_notes")]
        public string? ReviewNotes { get; set; }
        
        [Column("status")]
        public string Status { get; set; } = "Pending";
        
        [Column("priority")]
        public string Priority { get; set; } = "Normal";
        
        [Column("sla_deadline")]
        public DateTime? SlaDeadline { get; set; }
        
        [Column("sla_breached")]
        public bool SlaBreached { get; set; } = false;
        
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
        
        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }
        
        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Navigation properties
        [ForeignKey("PackageId")]
        public CounselorPackage Package { get; set; } = null!;
    }
}
