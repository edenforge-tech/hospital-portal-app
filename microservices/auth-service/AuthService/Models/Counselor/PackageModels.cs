using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Models.Counselor
{
    // ============================================================================
    // SURGERY PACKAGE TEMPLATES - DTOs matching database schema
    // ============================================================================

    public class SurgeryPackageTemplateDto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public string PackageName { get; set; } = string.Empty;
        public string? PackageCode { get; set; }
        public string PackageCategory { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal BasePrice { get; set; }
        public string Currency { get; set; } = "INR";
        public decimal MaxDiscountPercent { get; set; }
        public bool RequiresApprovalForCustom { get; set; }
        public string[]? ApplicableSurgeryTypes { get; set; }
        public string[]? IncludedServices { get; set; }
        public int ValidityDays { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateSurgeryPackageTemplateRequest
    {
        [Required]
        public Guid TenantId { get; set; }
        
        [Required]
        [StringLength(200)]
        public string PackageName { get; set; } = string.Empty;
        
        [StringLength(50)]
        public string? PackageCode { get; set; }
        
        [Required]
        [StringLength(50)]
        public string PackageCategory { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        [Required]
        [Range(0, 10000000)]
        public decimal BasePrice { get; set; }
        
        public string Currency { get; set; } = "INR";
        
        [Range(0, 100)]
        public decimal MaxDiscountPercent { get; set; } = 10.00m;
        
        public bool RequiresApprovalForCustom { get; set; } = true;
        
        public string[]? ApplicableSurgeryTypes { get; set; }
        
        public string[]? IncludedServices { get; set; }
        
        [Range(1, 365)]
        public int ValidityDays { get; set; } = 90;
    }

    public class UpdateSurgeryPackageTemplateRequest
    {
        public string? PackageName { get; set; }
        public string? Description { get; set; }
        public decimal? BasePrice { get; set; }
        public decimal? MaxDiscountPercent { get; set; }
        public string[]? ApplicableSurgeryTypes { get; set; }
        public string[]? IncludedServices { get; set; }
        public int? ValidityDays { get; set; }
        public bool? IsActive { get; set; }
    }

    // ============================================================================
    // PACKAGE CATALOG ITEMS - DTOs matching database schema
    // ============================================================================

    public class PackageCatalogItemDto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public string? ItemCode { get; set; }
        public string ItemCategory { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal DefaultPrice { get; set; }
        public decimal? CostPrice { get; set; }
        public string Currency { get; set; } = "INR";
        public string? Specifications { get; set; }
        public string UnitOfMeasure { get; set; } = "Service";
        public bool IsOptional { get; set; }
        public bool RequiresPrescription { get; set; }
        public bool RequiresAuthorization { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreatePackageCatalogItemRequest
    {
        [Required]
        public Guid TenantId { get; set; }
        
        [Required]
        [StringLength(200)]
        public string ItemName { get; set; } = string.Empty;
        
        [StringLength(50)]
        public string? ItemCode { get; set; }
        
        [Required]
        [StringLength(50)]
        public string ItemCategory { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        [Required]
        [Range(0, 10000000)]
        public decimal DefaultPrice { get; set; }
        
        [Range(0, 10000000)]
        public decimal? CostPrice { get; set; }
        
        public string Currency { get; set; } = "INR";
        
        public string? Specifications { get; set; }
        
        [StringLength(50)]
        public string UnitOfMeasure { get; set; } = "Service";
        
        public bool IsOptional { get; set; } = false;
        
        public bool RequiresPrescription { get; set; } = false;
        
        public bool RequiresAuthorization { get; set; } = false;
    }

    // ============================================================================
    // COUNSELOR PACKAGES - DTOs matching database schema
    // ============================================================================

    public class CounselorPackageDto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid? BranchId { get; set; }
        public Guid SessionId { get; set; }
        public string SourceType { get; set; } = string.Empty;
        public Guid? TemplateId { get; set; }
        public string PackageName { get; set; } = string.Empty;
        public string? PackageDescription { get; set; }
        public decimal BasePrice { get; set; }
        public decimal DiscountPercent { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TaxPercent { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal FinalPrice { get; set; }
        public string DiscountApprovalStatus { get; set; } = "NotRequired";
        public string Status { get; set; } = "draft";
        public DateTime ValidFrom { get; set; }
        public DateTime? ValidUntil { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedByUserName { get; set; } = string.Empty;
    }

    public class CounselorPackageDetailsDto : CounselorPackageDto
    {
        public List<CounselorPackageItemDto> Items { get; set; } = new();
        public string? DiscountReason { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public string? ApprovedByUserName { get; set; }
        public string? RejectionReason { get; set; }
    }

    public class CounselorPackageItemDto
    {
        public Guid Id { get; set; }
        public Guid PackageId { get; set; }
        public Guid? CatalogItemId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public string? ItemCategory { get; set; }
        public string? ItemDescription { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Quantity { get; set; }
        public decimal TotalPrice { get; set; }
        public bool IsIncluded { get; set; }
        public bool IsMandatory { get; set; }
        public int DisplayOrder { get; set; }
    }

    public class CreateCounselorPackageRequest
    {
        [Required]
        public Guid TenantId { get; set; }
        
        public Guid? BranchId { get; set; }
        
        [Required]
        public Guid SessionId { get; set; }
        
        [Required]
        [StringLength(20)]
        public string SourceType { get; set; } = "Custom";
        
        public Guid? TemplateId { get; set; }
        
        [Required]
        [StringLength(200)]
        public string PackageName { get; set; } = string.Empty;
        
        public string? PackageDescription { get; set; }
        
        [Range(0, 100)]
        public decimal DiscountPercent { get; set; } = 0;
        
        public string? DiscountReason { get; set; }
        
        [Range(0, 100)]
        public decimal TaxPercent { get; set; } = 0;
        
        public int? ValidityDays { get; set; }
        
        [Required]
        public List<CreateCounselorPackageItemRequest> Items { get; set; } = new();
    }

    public class CreateCounselorPackageItemRequest
    {
        public Guid? CatalogItemId { get; set; }
        
        [Required]
        [StringLength(200)]
        public string ItemName { get; set; } = string.Empty;
        
        [StringLength(50)]
        public string? ItemCategory { get; set; }
        
        public string? ItemDescription { get; set; }
        
        [Required]
        [Range(0, 10000000)]
        public decimal UnitPrice { get; set; }
        
        [Range(0.01, 1000)]
        public decimal Quantity { get; set; } = 1;
        
        public bool IsIncluded { get; set; } = true;
        
        public bool IsMandatory { get; set; } = false;
        
        public int DisplayOrder { get; set; } = 0;
    }

    public class UpdateCounselorPackageRequest
    {
        public string? PackageName { get; set; }
        public string? PackageDescription { get; set; }
        public decimal? DiscountPercent { get; set; }
        public string? DiscountReason { get; set; }
        public decimal? TaxPercent { get; set; }
        public List<CreateCounselorPackageItemRequest>? Items { get; set; }
    }

    // ============================================================================
    // DISCOUNT APPROVALS - Hierarchical approval with SLA tracking
    // ============================================================================

    public class PackageDiscountApprovalDto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid? BranchId { get; set; }
        public Guid PackageId { get; set; }
        public string? RequestNumber { get; set; }
        public Guid RequestedByUserId { get; set; }
        public string RequestedByUserName { get; set; } = string.Empty;
        public decimal DiscountPercent { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal OriginalPrice { get; set; }
        public decimal FinalPrice { get; set; }
        public string Justification { get; set; } = string.Empty;
        public int ApprovalLevel { get; set; }
        public Guid? AssignedToUserId { get; set; }
        public string? AssignedToUserName { get; set; }
        public string? AssignedToRole { get; set; }
        public Guid? ReviewedByUserId { get; set; }
        public string? ReviewedByUserName { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? ReviewNotes { get; set; }
        public string Status { get; set; } = "Pending";
        public string Priority { get; set; } = "Normal";
        public DateTime? SlaDeadline { get; set; }
        public bool SlaBreached { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class RequestDiscountApprovalRequest
    {
        [Required]
        public Guid PackageId { get; set; }
        
        [Required]
        [Range(0, 100)]
        public decimal DiscountPercent { get; set; }
        
        [Required]
        [StringLength(1000)]
        public string Justification { get; set; } = string.Empty;
        
        [StringLength(20)]
        public string Priority { get; set; } = "Normal";
    }

    public class ReviewDiscountApprovalRequest
    {
        [Required]
        public Guid ApprovalId { get; set; }
        
        [Required]
        [StringLength(10)]
        public string Decision { get; set; } = string.Empty; // "Approved" or "Rejected"
        
        [StringLength(1000)]
        public string? ReviewNotes { get; set; }
    }

    // ============================================================================
    // FILTERS & RESPONSES
    // ============================================================================

    public class PackageFilters
    {
        public Guid? TenantId { get; set; }
        public Guid? BranchId { get; set; }
        public Guid? SessionId { get; set; }
        public string? SourceType { get; set; }
        public string? DiscountApprovalStatus { get; set; }
        public string? Status { get; set; }
        public DateTime? CreatedFrom { get; set; }
        public DateTime? CreatedTo { get; set; }
        public string? Search { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string SortBy { get; set; } = "CreatedAt";
        public string SortOrder { get; set; } = "desc";
    }

    public class PackageListResponse
    {
        public List<CounselorPackageDto> Packages { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class DiscountApprovalListResponse
    {
        public List<PackageDiscountApprovalDto> Approvals { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class PackageOperationResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public Guid? PackageId { get; set; }
        public CounselorPackageDetailsDto? Package { get; set; }
    }

    public class TemplateFilters
    {
        public Guid? TenantId { get; set; }
        public string? PackageCategory { get; set; }
        public string? SurgeryType { get; set; }
        public bool? IsActive { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public class CatalogItemFilters
    {
        public Guid? TenantId { get; set; }
        public string? ItemCategory { get; set; }
        public bool? IsActive { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}
