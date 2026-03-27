using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AuthService.Models.Counselor;

namespace AuthService.Services
{
    public interface IPackageManagementService
    {
        // ============================================================================
        // SURGERY PACKAGE TEMPLATES
        // ============================================================================
        Task<List<SurgeryPackageTemplateDto>> GetAllTemplatesAsync(Guid tenantId, string? packageCategory = null, string? surgeryType = null, bool? isActive = null);
        Task<SurgeryPackageTemplateDto?> GetTemplateByIdAsync(Guid tenantId, Guid templateId);
        Task<SurgeryPackageTemplateDto?> GetTemplateByCodeAsync(Guid tenantId, string packageCode);
        Task<SurgeryPackageTemplateDto> CreateTemplateAsync(CreateSurgeryPackageTemplateRequest request, Guid currentUserId);
        Task<SurgeryPackageTemplateDto> UpdateTemplateAsync(Guid tenantId, Guid templateId, UpdateSurgeryPackageTemplateRequest request, Guid currentUserId);
        Task<bool> DeleteTemplateAsync(Guid tenantId, Guid templateId, Guid currentUserId);

        // ============================================================================
        // PACKAGE CATALOG ITEMS
        // ============================================================================
        Task<List<PackageCatalogItemDto>> GetAllCatalogItemsAsync(Guid tenantId, string? itemCategory = null, bool? isActive = null);
        Task<PackageCatalogItemDto?> GetCatalogItemByIdAsync(Guid tenantId, Guid itemId);
        Task<PackageCatalogItemDto?> GetCatalogItemByCodeAsync(Guid tenantId, string itemCode);
        Task<PackageCatalogItemDto> CreateCatalogItemAsync(CreatePackageCatalogItemRequest request, Guid currentUserId);
        Task<PackageCatalogItemDto> UpdateCatalogItemAsync(Guid tenantId, Guid itemId, CreatePackageCatalogItemRequest request, Guid currentUserId);
        Task<bool> DeleteCatalogItemAsync(Guid tenantId, Guid itemId, Guid currentUserId);

        // ============================================================================
        // COUNSELOR PACKAGES
        // ============================================================================
        Task<PackageListResponse> GetAllPackagesAsync(PackageFilters filters);
        Task<CounselorPackageDetailsDto?> GetPackageByIdAsync(Guid tenantId, Guid packageId);
        Task<PackageOperationResult> CreatePackageAsync(CreateCounselorPackageRequest request, Guid currentUserId);
        Task<PackageOperationResult> CreatePackageFromTemplateAsync(Guid tenantId, Guid templateId, Guid sessionId, Guid currentUserId);
        Task<PackageOperationResult> UpdatePackageAsync(Guid tenantId, Guid packageId, UpdateCounselorPackageRequest request, Guid currentUserId);
        Task<PackageOperationResult> FinalizePackageAsync(Guid tenantId, Guid packageId, Guid currentUserId);
        Task<bool> DeletePackageAsync(Guid tenantId, Guid packageId, Guid currentUserId);
        Task<CounselorPackageDetailsDto> RecalculatePackageTotalsAsync(Guid tenantId, Guid packageId);

        // ============================================================================
        // DISCOUNT APPROVALS - Hierarchical Workflow
        // ============================================================================
        Task<DiscountApprovalListResponse> GetAllDiscountApprovalsAsync(Guid tenantId, string? status = null, Guid? assignedToUserId = null, int page = 1, int pageSize = 20);
        Task<PackageDiscountApprovalDto?> GetDiscountApprovalByIdAsync(Guid tenantId, Guid approvalId);
        Task<List<PackageDiscountApprovalDto>> GetPendingApprovalsForUserAsync(Guid tenantId, Guid userId);
        Task<List<PackageDiscountApprovalDto>> GetSlaBreachedApprovalsAsync(Guid tenantId);
        Task<PackageDiscountApprovalDto> RequestDiscountApprovalAsync(RequestDiscountApprovalRequest request, Guid currentUserId);
        Task<PackageDiscountApprovalDto> ReviewDiscountApprovalAsync(ReviewDiscountApprovalRequest request, Guid currentUserId);
        Task<bool> EscalateApprovalAsync(Guid tenantId, Guid approvalId, Guid currentUserId);
        Task<bool> CancelApprovalRequestAsync(Guid tenantId, Guid approvalId, Guid currentUserId);

        // ============================================================================
        // BUSINESS LOGIC & CALCULATIONS
        // ============================================================================
        Task<decimal> CalculatePackageTotalAsync(List<CreateCounselorPackageItemRequest> items, decimal discountPercent = 0, decimal taxPercent = 0);
        Task<int> DetermineApprovalLevelAsync(decimal discountPercent);
        Task<string> GenerateRequestNumberAsync(Guid tenantId);
    }
}
