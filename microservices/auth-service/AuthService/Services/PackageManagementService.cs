using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using AuthService.Context;
using AuthService.Models.Counselor;
using AuthService.Models.Domain;

namespace AuthService.Services
{
    public class PackageManagementService : IPackageManagementService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<PackageManagementService> _logger;

        public PackageManagementService(AppDbContext context, ILogger<PackageManagementService> logger)
        {
            _context = context;
            _logger = logger;
        }

        // ============================================================================
        // SURGERY PACKAGE TEMPLATES
        // ============================================================================

        public async Task<List<SurgeryPackageTemplateDto>> GetAllTemplatesAsync(Guid tenantId, string? packageCategory = null, string? surgeryType = null, bool? isActive = null)
        {
            try
            {
                var query = _context.SurgeryPackageTemplates
                    .Where(t => t.TenantId == tenantId && t.DeletedAt == null);

                if (!string.IsNullOrEmpty(packageCategory))
                    query = query.Where(t => t.PackageCategory == packageCategory);

                if (!string.IsNullOrEmpty(surgeryType))
                    query = query.Where(t => t.ApplicableSurgeryTypes != null && t.ApplicableSurgeryTypes.Contains(surgeryType));

                if (isActive.HasValue)
                    query = query.Where(t => t.IsActive == isActive.Value);

                var templates = await query
                    .OrderBy(t => t.PackageCategory)
                    .ThenBy(t => t.PackageName)
                    .Select(t => new SurgeryPackageTemplateDto
                    {
                        Id = t.Id,
                        TenantId = t.TenantId,
                        PackageName = t.PackageName,
                        PackageCode = t.PackageCode,
                        PackageCategory = t.PackageCategory,
                        Description = t.Description,
                        BasePrice = t.BasePrice,
                        Currency = t.Currency,
                        MaxDiscountPercent = t.MaxDiscountPercent,
                        RequiresApprovalForCustom = t.RequiresApprovalForCustom,
                        ApplicableSurgeryTypes = t.ApplicableSurgeryTypes,
                        IncludedServices = t.IncludedServices,
                        ValidityDays = t.ValidityDays,
                        IsActive = t.IsActive,
                        CreatedAt = t.CreatedAt
                    })
                    .ToListAsync();

                _logger.LogInformation("Retrieved {Count} surgery package templates for tenant {TenantId}", templates.Count, tenantId);
                return templates;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving surgery package templates for tenant {TenantId}", tenantId);
                throw;
            }
        }

        public async Task<SurgeryPackageTemplateDto?> GetTemplateByIdAsync(Guid tenantId, Guid templateId)
        {
            try
            {
                var template = await _context.SurgeryPackageTemplates
                    .Where(t => t.Id == templateId && t.TenantId == tenantId && t.DeletedAt == null)
                    .Select(t => new SurgeryPackageTemplateDto
                    {
                        Id = t.Id,
                        TenantId = t.TenantId,
                        PackageName = t.PackageName,
                        PackageCode = t.PackageCode,
                        PackageCategory = t.PackageCategory,
                        Description = t.Description,
                        BasePrice = t.BasePrice,
                        Currency = t.Currency,
                        MaxDiscountPercent = t.MaxDiscountPercent,
                        RequiresApprovalForCustom = t.RequiresApprovalForCustom,
                        ApplicableSurgeryTypes = t.ApplicableSurgeryTypes,
                        IncludedServices = t.IncludedServices,
                        ValidityDays = t.ValidityDays,
                        IsActive = t.IsActive,
                        CreatedAt = t.CreatedAt
                    })
                    .FirstOrDefaultAsync();

                return template;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving surgery package template {TemplateId}", templateId);
                throw;
            }
        }

        public async Task<SurgeryPackageTemplateDto?> GetTemplateByCodeAsync(Guid tenantId, string packageCode)
        {
            try
            {
                var template = await _context.SurgeryPackageTemplates
                    .Where(t => t.PackageCode == packageCode && t.TenantId == tenantId && t.DeletedAt == null)
                    .Select(t => new SurgeryPackageTemplateDto
                    {
                        Id = t.Id,
                        TenantId = t.TenantId,
                        PackageName = t.PackageName,
                        PackageCode = t.PackageCode,
                        PackageCategory = t.PackageCategory,
                        Description = t.Description,
                        BasePrice = t.BasePrice,
                        Currency = t.Currency,
                        MaxDiscountPercent = t.MaxDiscountPercent,
                        RequiresApprovalForCustom = t.RequiresApprovalForCustom,
                        ApplicableSurgeryTypes = t.ApplicableSurgeryTypes,
                        IncludedServices = t.IncludedServices,
                        ValidityDays = t.ValidityDays,
                        IsActive = t.IsActive,
                        CreatedAt = t.CreatedAt
                    })
                    .FirstOrDefaultAsync();

                return template;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving template by code {PackageCode}", packageCode);
                throw;
            }
        }

        public async Task<SurgeryPackageTemplateDto> CreateTemplateAsync(CreateSurgeryPackageTemplateRequest request, Guid currentUserId)
        {
            try
            {
                var template = new SurgeryPackageTemplate
                {
                    Id = Guid.NewGuid(),
                    TenantId = request.TenantId,
                    PackageName = request.PackageName,
                    PackageCode = request.PackageCode,
                    PackageCategory = request.PackageCategory,
                    Description = request.Description,
                    BasePrice = request.BasePrice,
                    Currency = request.Currency,
                    MaxDiscountPercent = request.MaxDiscountPercent,
                    RequiresApprovalForCustom = request.RequiresApprovalForCustom,
                    ApplicableSurgeryTypes = request.ApplicableSurgeryTypes,
                    IncludedServices = request.IncludedServices,
                    ValidityDays = request.ValidityDays,
                    IsActive = true,
                    Status = "active",
                    CreatedAt = DateTime.UtcNow,
                    CreatedByUserId = currentUserId,
                    UpdatedAt = DateTime.UtcNow,
                    UpdatedByUserId = currentUserId
                };

                _context.SurgeryPackageTemplates.Add(template);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created surgery package template {TemplateId} for tenant {TenantId}", template.Id, template.TenantId);

                return new SurgeryPackageTemplateDto
                {
                    Id = template.Id,
                    TenantId = template.TenantId,
                    PackageName = template.PackageName,
                    PackageCode = template.PackageCode,
                    PackageCategory = template.PackageCategory,
                    Description = template.Description,
                    BasePrice = template.BasePrice,
                    Currency = template.Currency,
                    MaxDiscountPercent = template.MaxDiscountPercent,
                    RequiresApprovalForCustom = template.RequiresApprovalForCustom,
                    ApplicableSurgeryTypes = template.ApplicableSurgeryTypes,
                    IncludedServices = template.IncludedServices,
                    ValidityDays = template.ValidityDays,
                    IsActive = template.IsActive,
                    CreatedAt = template.CreatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating surgery package template");
                throw;
            }
        }

        public async Task<SurgeryPackageTemplateDto> UpdateTemplateAsync(Guid tenantId, Guid templateId, UpdateSurgeryPackageTemplateRequest request, Guid currentUserId)
        {
            try
            {
                var template = await _context.SurgeryPackageTemplates
                    .FirstOrDefaultAsync(t => t.Id == templateId && t.TenantId == tenantId && t.DeletedAt == null);

                if (template == null)
                    throw new Exception($"Template {templateId} not found");

                if (request.PackageName != null) template.PackageName = request.PackageName;
                if (request.Description != null) template.Description = request.Description;
                if (request.BasePrice.HasValue) template.BasePrice = request.BasePrice.Value;
                if (request.MaxDiscountPercent.HasValue) template.MaxDiscountPercent = request.MaxDiscountPercent.Value;
                if (request.ApplicableSurgeryTypes != null) template.ApplicableSurgeryTypes = request.ApplicableSurgeryTypes;
                if (request.IncludedServices != null) template.IncludedServices = request.IncludedServices;
                if (request.ValidityDays.HasValue) template.ValidityDays = request.ValidityDays.Value;
                if (request.IsActive.HasValue) template.IsActive = request.IsActive.Value;

                template.UpdatedAt = DateTime.UtcNow;
                template.UpdatedByUserId = currentUserId;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Updated surgery package template {TemplateId}", templateId);

                return new SurgeryPackageTemplateDto
                {
                    Id = template.Id,
                    TenantId = template.TenantId,
                    PackageName = template.PackageName,
                    PackageCode = template.PackageCode,
                    PackageCategory = template.PackageCategory,
                    Description = template.Description,
                    BasePrice = template.BasePrice,
                    Currency = template.Currency,
                    MaxDiscountPercent = template.MaxDiscountPercent,
                    RequiresApprovalForCustom = template.RequiresApprovalForCustom,
                    ApplicableSurgeryTypes = template.ApplicableSurgeryTypes,
                    IncludedServices = template.IncludedServices,
                    ValidityDays = template.ValidityDays,
                    IsActive = template.IsActive,
                    CreatedAt = template.CreatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating surgery package template {TemplateId}", templateId);
                throw;
            }
        }

        public async Task<bool> DeleteTemplateAsync(Guid tenantId, Guid templateId, Guid currentUserId)
        {
            try
            {
                var template = await _context.SurgeryPackageTemplates
                    .FirstOrDefaultAsync(t => t.Id == templateId && t.TenantId == tenantId && t.DeletedAt == null);

                if (template == null)
                    return false;

                template.DeletedAt = DateTime.UtcNow;
                template.UpdatedAt = DateTime.UtcNow;
                template.UpdatedByUserId = currentUserId;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Soft deleted surgery package template {TemplateId}", templateId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting surgery package template {TemplateId}", templateId);
                throw;
            }
        }

        // ============================================================================
        // PACKAGE CATALOG ITEMS
        // ============================================================================

        public async Task<List<PackageCatalogItemDto>> GetAllCatalogItemsAsync(Guid tenantId, string? itemCategory = null, bool? isActive = null)
        {
            try
            {
                var query = _context.SurgeryPackageItemCatalogs
                    .Where(i => i.TenantId == tenantId && i.DeletedAt == null);

                if (!string.IsNullOrEmpty(itemCategory))
                    query = query.Where(i => i.ItemCategory == itemCategory);

                if (isActive.HasValue)
                    query = query.Where(i => i.IsActive == isActive.Value);

                var items = await query
                    .OrderBy(i => i.ItemCategory)
                    .ThenBy(i => i.ItemName)
                    .Select(i => new PackageCatalogItemDto
                    {
                        Id = i.Id,
                        TenantId = i.TenantId,
                        ItemName = i.ItemName,
                        ItemCode = i.ItemCode,
                        ItemCategory = i.ItemCategory,
                        Description = i.Description,
                        DefaultPrice = i.DefaultPrice,
                        CostPrice = i.CostPrice,
                        Currency = i.Currency,
                        Specifications = i.Specifications,
                        UnitOfMeasure = i.UnitOfMeasure,
                        IsOptional = i.IsOptional,
                        RequiresPrescription = i.RequiresPrescription,
                        RequiresAuthorization = i.RequiresAuthorization,
                        IsActive = i.IsActive,
                        CreatedAt = i.CreatedAt
                    })
                    .ToListAsync();

                _logger.LogInformation("Retrieved {Count} catalog items for tenant {TenantId}", items.Count, tenantId);
                return items;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving catalog items for tenant {TenantId}", tenantId);
                throw;
            }
        }

        public async Task<PackageCatalogItemDto?> GetCatalogItemByIdAsync(Guid tenantId, Guid itemId)
        {
            try
            {
                var item = await _context.SurgeryPackageItemCatalogs
                    .Where(i => i.Id == itemId && i.TenantId == tenantId && i.DeletedAt == null)
                    .Select(i => new PackageCatalogItemDto
                    {
                        Id = i.Id,
                        TenantId = i.TenantId,
                        ItemName = i.ItemName,
                        ItemCode = i.ItemCode,
                        ItemCategory = i.ItemCategory,
                        Description = i.Description,
                        DefaultPrice = i.DefaultPrice,
                        CostPrice = i.CostPrice,
                        Currency = i.Currency,
                        Specifications = i.Specifications,
                        UnitOfMeasure = i.UnitOfMeasure,
                        IsOptional = i.IsOptional,
                        RequiresPrescription = i.RequiresPrescription,
                        RequiresAuthorization = i.RequiresAuthorization,
                        IsActive = i.IsActive,
                        CreatedAt = i.CreatedAt
                    })
                    .FirstOrDefaultAsync();

                return item;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving catalog item {ItemId}", itemId);
                throw;
            }
        }

        public async Task<PackageCatalogItemDto?> GetCatalogItemByCodeAsync(Guid tenantId, string itemCode)
        {
            try
            {
                var item = await _context.SurgeryPackageItemCatalogs
                    .Where(i => i.ItemCode == itemCode && i.TenantId == tenantId && i.DeletedAt == null)
                    .Select(i => new PackageCatalogItemDto
                    {
                        Id = i.Id,
                        TenantId = i.TenantId,
                        ItemName = i.ItemName,
                        ItemCode = i.ItemCode,
                        ItemCategory = i.ItemCategory,
                        Description = i.Description,
                        DefaultPrice = i.DefaultPrice,
                        CostPrice = i.CostPrice,
                        Currency = i.Currency,
                        Specifications = i.Specifications,
                        UnitOfMeasure = i.UnitOfMeasure,
                        IsOptional = i.IsOptional,
                        RequiresPrescription = i.RequiresPrescription,
                        RequiresAuthorization = i.RequiresAuthorization,
                        IsActive = i.IsActive,
                        CreatedAt = i.CreatedAt
                    })
                    .FirstOrDefaultAsync();

                return item;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving catalog item by code {ItemCode}", itemCode);
                throw;
            }
        }

        public async Task<PackageCatalogItemDto> CreateCatalogItemAsync(CreatePackageCatalogItemRequest request, Guid currentUserId)
        {
            try
            {
                var item = new SurgeryPackageItemCatalog
                {
                    Id = Guid.NewGuid(),
                    TenantId = request.TenantId,
                    ItemName = request.ItemName,
                    ItemCode = request.ItemCode,
                    ItemCategory = request.ItemCategory,
                    Description = request.Description,
                    DefaultPrice = request.DefaultPrice,
                    CostPrice = request.CostPrice,
                    Currency = request.Currency,
                    Specifications = request.Specifications,
                    UnitOfMeasure = request.UnitOfMeasure,
                    IsOptional = request.IsOptional,
                    RequiresPrescription = request.RequiresPrescription,
                    RequiresAuthorization = request.RequiresAuthorization,
                    IsActive = true,
                    Status = "active",
                    CreatedAt = DateTime.UtcNow,
                    CreatedByUserId = currentUserId,
                    UpdatedAt = DateTime.UtcNow,
                    UpdatedByUserId = currentUserId
                };

                _context.SurgeryPackageItemCatalogs.Add(item);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created catalog item {ItemId} for tenant {TenantId}", item.Id, item.TenantId);

                return new PackageCatalogItemDto
                {
                    Id = item.Id,
                    TenantId = item.TenantId,
                    ItemName = item.ItemName,
                    ItemCode = item.ItemCode,
                    ItemCategory = item.ItemCategory,
                    Description = item.Description,
                    DefaultPrice = item.DefaultPrice,
                    CostPrice = item.CostPrice,
                    Currency = item.Currency,
                    Specifications = item.Specifications,
                    UnitOfMeasure = item.UnitOfMeasure,
                    IsOptional = item.IsOptional,
                    RequiresPrescription = item.RequiresPrescription,
                    RequiresAuthorization = item.RequiresAuthorization,
                    IsActive = item.IsActive,
                    CreatedAt = item.CreatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating catalog item");
                throw;
            }
        }

        public async Task<PackageCatalogItemDto> UpdateCatalogItemAsync(Guid tenantId, Guid itemId, CreatePackageCatalogItemRequest request, Guid currentUserId)
        {
            try
            {
                var item = await _context.SurgeryPackageItemCatalogs
                    .FirstOrDefaultAsync(i => i.Id == itemId && i.TenantId == tenantId && i.DeletedAt == null);

                if (item == null)
                    throw new Exception($"Catalog item {itemId} not found");

                item.ItemName = request.ItemName;
                item.ItemCode = request.ItemCode;
                item.ItemCategory = request.ItemCategory;
                item.Description = request.Description;
                item.DefaultPrice = request.DefaultPrice;
                item.CostPrice = request.CostPrice;
                item.Specifications = request.Specifications;
                item.UnitOfMeasure = request.UnitOfMeasure;
                item.IsOptional = request.IsOptional;
                item.RequiresPrescription = request.RequiresPrescription;
                item.RequiresAuthorization = request.RequiresAuthorization;
                item.UpdatedAt = DateTime.UtcNow;
                item.UpdatedByUserId = currentUserId;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Updated catalog item {ItemId}", itemId);

                return new PackageCatalogItemDto
                {
                    Id = item.Id,
                    TenantId = item.TenantId,
                    ItemName = item.ItemName,
                    ItemCode = item.ItemCode,
                    ItemCategory = item.ItemCategory,
                    Description = item.Description,
                    DefaultPrice = item.DefaultPrice,
                    CostPrice = item.CostPrice,
                    Currency = item.Currency,
                    Specifications = item.Specifications,
                    UnitOfMeasure = item.UnitOfMeasure,
                    IsOptional = item.IsOptional,
                    RequiresPrescription = item.RequiresPrescription,
                    RequiresAuthorization = item.RequiresAuthorization,
                    IsActive = item.IsActive,
                    CreatedAt = item.CreatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating catalog item {ItemId}", itemId);
                throw;
            }
        }

        public async Task<bool> DeleteCatalogItemAsync(Guid tenantId, Guid itemId, Guid currentUserId)
        {
            try
            {
                var item = await _context.SurgeryPackageItemCatalogs
                    .FirstOrDefaultAsync(i => i.Id == itemId && i.TenantId == tenantId && i.DeletedAt == null);

                if (item == null)
                    return false;

                item.DeletedAt = DateTime.UtcNow;
                item.UpdatedAt = DateTime.UtcNow;
                item.UpdatedByUserId = currentUserId;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Soft deleted catalog item {ItemId}", itemId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting catalog item {ItemId}", itemId);
                throw;
            }
        }

        // ============================================================================
        // COUNSELOR PACKAGES (Continued in next message due to length)
        // ============================================================================

        public async Task<PackageListResponse> GetAllPackagesAsync(PackageFilters filters)
        {
            try
            {
                var query = _context.CounselorPackages
                    .Where(p => p.DeletedAt == null);

                if (filters.TenantId.HasValue)
                    query = query.Where(p => p.TenantId == filters.TenantId.Value);

                if (filters.BranchId.HasValue)
                    query = query.Where(p => p.BranchId == filters.BranchId.Value);

                if (filters.SessionId.HasValue)
                    query = query.Where(p => p.SessionId == filters.SessionId.Value);

                if (!string.IsNullOrEmpty(filters.SourceType))
                    query = query.Where(p => p.SourceType == filters.SourceType);

                if (!string.IsNullOrEmpty(filters.DiscountApprovalStatus))
                    query = query.Where(p => p.DiscountApprovalStatus == filters.DiscountApprovalStatus);

                if (!string.IsNullOrEmpty(filters.Status))
                    query = query.Where(p => p.Status == filters.Status);

                if (filters.CreatedFrom.HasValue)
                    query = query.Where(p => p.CreatedAt >= filters.CreatedFrom.Value);

                if (filters.CreatedTo.HasValue)
                    query = query.Where(p => p.CreatedAt <= filters.CreatedTo.Value);

                if (!string.IsNullOrEmpty(filters.Search))
                {
                    query = query.Where(p => p.PackageName.Contains(filters.Search));
                }

                var totalCount = await query.CountAsync();

                var packages = await query
                    .OrderByDescending(p => p.CreatedAt)
                    .Skip((filters.Page - 1) * filters.PageSize)
                    .Take(filters.PageSize)
                    .Select(p => new CounselorPackageDto
                    {
                        Id = p.Id,
                        TenantId = p.TenantId,
                        BranchId = p.BranchId,
                        SessionId = p.SessionId,
                        SourceType = p.SourceType,
                        TemplateId = p.TemplateId,
                        PackageName = p.PackageName,
                        PackageDescription = p.PackageDescription,
                        BasePrice = p.BasePrice,
                        DiscountPercent = p.DiscountPercent,
                        DiscountAmount = p.DiscountAmount,
                        TaxPercent = p.TaxPercent,
                        TaxAmount = p.TaxAmount,
                        FinalPrice = p.FinalPrice,
                        DiscountApprovalStatus = p.DiscountApprovalStatus,
                        Status = p.Status,
                        ValidFrom = p.ValidFrom,
                        ValidUntil = p.ValidUntil,
                        CreatedAt = p.CreatedAt
                    })
                    .ToListAsync();

                var totalPages = (int)Math.Ceiling((double)totalCount / filters.PageSize);

                _logger.LogInformation("Retrieved {Count} packages (page {Page}/{TotalPages})", packages.Count, filters.Page, totalPages);

                return new PackageListResponse
                {
                    Packages = packages,
                    TotalCount = totalCount,
                    Page = filters.Page,
                    PageSize = filters.PageSize,
                    TotalPages = totalPages
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving packages");
                throw;
            }
        }

        public async Task<CounselorPackageDetailsDto?> GetPackageByIdAsync(Guid tenantId, Guid packageId)
        {
            try
            {
                var package = await _context.CounselorPackages
                    .Where(p => p.Id == packageId && p.TenantId == tenantId && p.DeletedAt == null)
                    .Select(p => new CounselorPackageDetailsDto
                    {
                        Id = p.Id,
                        TenantId = p.TenantId,
                        BranchId = p.BranchId,
                        SessionId = p.SessionId,
                        SourceType = p.SourceType,
                        TemplateId = p.TemplateId,
                        PackageName = p.PackageName,
                        PackageDescription = p.PackageDescription,
                        BasePrice = p.BasePrice,
                        DiscountPercent = p.DiscountPercent,
                        DiscountAmount = p.DiscountAmount,
                        DiscountReason = p.DiscountReason,
                        TaxPercent = p.TaxPercent,
                        TaxAmount = p.TaxAmount,
                        FinalPrice = p.FinalPrice,
                        DiscountApprovalStatus = p.DiscountApprovalStatus,
                        Status = p.Status,
                        ValidFrom = p.ValidFrom,
                        ValidUntil = p.ValidUntil,
                        ApprovedAt = p.ApprovedAt,
                        RejectionReason = p.RejectionReason,
                        CreatedAt = p.CreatedAt
                    })
                    .FirstOrDefaultAsync();

                if (package != null)
                {
                    // Load package items
                    package.Items = await _context.CounselorPackageItems
                        .Where(i => i.PackageId == packageId && i.DeletedAt == null)
                        .Select(i => new CounselorPackageItemDto
                        {
                            Id = i.Id,
                            PackageId = i.PackageId,
                            CatalogItemId = i.CatalogItemId,
                            ItemName = i.ItemName,
                            ItemCategory = i.ItemCategory,
                            ItemDescription = i.ItemDescription,
                            UnitPrice = i.UnitPrice,
                            Quantity = i.Quantity,
                            TotalPrice = i.TotalPrice,
                            IsIncluded = i.IsIncluded,
                            IsMandatory = i.IsMandatory,
                            DisplayOrder = i.DisplayOrder
                        })
                        .OrderBy(i => i.DisplayOrder)
                        .ToListAsync();
                }

                return package;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving package {PackageId}", packageId);
                throw;
            }
        }

        // Implementation continued in next part...
        public async Task<PackageOperationResult> CreatePackageAsync(CreateCounselorPackageRequest request, Guid currentUserId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Calculate totals
                var basePrice = 0m;
                var taxAmount = 0m;

                var package = new CounselorPackage
                {
                    Id = Guid.NewGuid(),
                    TenantId = request.TenantId,
                    BranchId = request.BranchId,
                    SessionId = request.SessionId,
                    SourceType = request.SourceType,
                    TemplateId = request.TemplateId,
                    PackageName = request.PackageName,
                    PackageDescription = request.PackageDescription,
                    DiscountPercent = request.DiscountPercent,
                    DiscountReason = request.DiscountReason,
                    TaxPercent = request.TaxPercent,
                    ValidFrom = DateTime.UtcNow,
                    ValidUntil = request.ValidityDays.HasValue ? DateTime.UtcNow.AddDays(request.ValidityDays.Value) : null,
                    Status = "draft",
                    CreatedAt = DateTime.UtcNow,
                    CreatedByUserId = currentUserId,
                    UpdatedAt = DateTime.UtcNow,
                    UpdatedByUserId = currentUserId
                };

                _context.CounselorPackages.Add(package);

                // Create package items
                foreach (var itemRequest in request.Items)
                {
                    var itemTotalPrice = itemRequest.UnitPrice * itemRequest.Quantity;

                    var item = new CounselorPackageItem
                    {
                        Id = Guid.NewGuid(),
                        TenantId = request.TenantId,
                        PackageId = package.Id,
                        CatalogItemId = itemRequest.CatalogItemId,
                        ItemName = itemRequest.ItemName,
                        ItemCategory = itemRequest.ItemCategory,
                        ItemDescription = itemRequest.ItemDescription,
                        UnitPrice = itemRequest.UnitPrice,
                        Quantity = itemRequest.Quantity,
                        TotalPrice = itemTotalPrice,
                        IsIncluded = itemRequest.IsIncluded,
                        IsMandatory = itemRequest.IsMandatory,
                        DisplayOrder = itemRequest.DisplayOrder,
                        Status = "active",
                        CreatedAt = DateTime.UtcNow,
                        CreatedByUserId = currentUserId,
                        UpdatedAt = DateTime.UtcNow,
                        UpdatedByUserId = currentUserId
                    };

                    _context.CounselorPackageItems.Add(item);
                    basePrice += itemTotalPrice;
                }

                var discountAmount = basePrice * (request.DiscountPercent / 100);
                var priceAfterDiscount = basePrice - discountAmount;
                taxAmount = priceAfterDiscount * (request.TaxPercent / 100);
                var finalPrice = priceAfterDiscount + taxAmount;

                package.BasePrice = basePrice;
                package.DiscountAmount = discountAmount;
                package.TaxAmount = taxAmount;
                package.FinalPrice = finalPrice;

                // Determine approval status
                if (request.DiscountPercent == 0)
                {
                    package.DiscountApprovalStatus = "NotRequired";
                }
                else if (request.DiscountPercent <= 10)
                {
                    package.DiscountApprovalStatus = "AutoApproved";
                    package.ApprovedAt = DateTime.UtcNow;
                    package.ApprovedByUserId = currentUserId;
                }
                else
                {
                    package.DiscountApprovalStatus = "PendingApproval";
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Created counselor package {PackageId}", package.Id);

                var createdPackage = await GetPackageByIdAsync(request.TenantId, package.Id);

                return new PackageOperationResult
                {
                    Success = true,
                    Message = "Package created successfully",
                    PackageId = package.Id,
                    Package = createdPackage
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error creating counselor package");
                return new PackageOperationResult
                {
                    Success = false,
                    Message = $"Error creating package: {ex.Message}"
                };
            }
        }

        // See next part for additional methods...
        public async Task<PackageOperationResult> CreatePackageFromTemplateAsync(Guid tenantId, Guid templateId, Guid sessionId, Guid currentUserId)
        {
            try
            {
                var template = await _context.SurgeryPackageTemplates
                    .FirstOrDefaultAsync(t => t.Id == templateId && t.TenantId == tenantId && t.DeletedAt == null);

                if (template == null)
                {
                    return new PackageOperationResult
                    {
                        Success = false,
                        Message = "Template not found"
                    };
                }

                var request = new CreateCounselorPackageRequest
                {
                    TenantId = tenantId,
                    SessionId = sessionId,
                    SourceType = "FromTemplate",
                    TemplateId = templateId,
                    PackageName = template.PackageName,
                    PackageDescription = template.Description,
                    DiscountPercent = 0,
                    TaxPercent = 0,
                    ValidityDays = template.ValidityDays,
                    Items = new List<CreateCounselorPackageItemRequest>()
                };

                // In real implementation, would load template items from a junction table
                // For now, just create the package with template reference
                return await CreatePackageAsync(request, currentUserId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating package from template {TemplateId}", templateId);
                return new PackageOperationResult
                {
                    Success = false,
                    Message = $"Error creating package from template: {ex.Message}"
                };
            }
        }

        public async Task<PackageOperationResult> UpdatePackageAsync(Guid tenantId, Guid packageId, UpdateCounselorPackageRequest request, Guid currentUserId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var package = await _context.CounselorPackages
                    .FirstOrDefaultAsync(p => p.Id == packageId && p.TenantId == tenantId && p.DeletedAt == null);

                if (package == null)
                {
                    return new PackageOperationResult
                    {
                        Success = false,
                        Message = "Package not found"
                    };
                }

                if (package.Status != "draft")
                {
                    return new PackageOperationResult
                    {
                        Success = false,
                        Message = "Only draft packages can be updated"
                    };
                }

                if (request.PackageName != null) package.PackageName = request.PackageName;
                if (request.PackageDescription != null) package.PackageDescription = request.PackageDescription;
                if (request.DiscountPercent.HasValue) package.DiscountPercent = request.DiscountPercent.Value;
                if (request.DiscountReason != null) package.DiscountReason = request.DiscountReason;
                if (request.TaxPercent.HasValue) package.TaxPercent = request.TaxPercent.Value;

                if (request.Items != null)
                {
                    // Delete existing items
                    var existingItems = await _context.CounselorPackageItems
                        .Where(i => i.PackageId == packageId && i.DeletedAt == null)
                        .ToListAsync();

                    foreach (var item in existingItems)
                    {
                        item.DeletedAt = DateTime.UtcNow;
                    }

                    // Add new items
                    var basePrice = 0m;
                    foreach (var itemRequest in request.Items)
                    {
                        var itemTotalPrice = itemRequest.UnitPrice * itemRequest.Quantity;

                        var item = new CounselorPackageItem
                        {
                            Id = Guid.NewGuid(),
                            TenantId = tenantId,
                            PackageId = packageId,
                            CatalogItemId = itemRequest.CatalogItemId,
                            ItemName = itemRequest.ItemName,
                            ItemCategory = itemRequest.ItemCategory,
                            ItemDescription = itemRequest.ItemDescription,
                            UnitPrice = itemRequest.UnitPrice,
                            Quantity = itemRequest.Quantity,
                            TotalPrice = itemTotalPrice,
                            IsIncluded = itemRequest.IsIncluded,
                            IsMandatory = itemRequest.IsMandatory,
                            DisplayOrder = itemRequest.DisplayOrder,
                            Status = "active",
                            CreatedAt = DateTime.UtcNow,
                            CreatedByUserId = currentUserId,
                            UpdatedAt = DateTime.UtcNow,
                            UpdatedByUserId = currentUserId
                        };

                        _context.CounselorPackageItems.Add(item);
                        basePrice += itemTotalPrice;
                    }

                    // Recalculate totals
                    var discountAmount = basePrice * (package.DiscountPercent / 100);
                    var priceAfterDiscount = basePrice - discountAmount;
                    var taxAmount = priceAfterDiscount * (package.TaxPercent / 100);
                    var finalPrice = priceAfterDiscount + taxAmount;

                    package.BasePrice = basePrice;
                    package.DiscountAmount = discountAmount;
                    package.TaxAmount = taxAmount;
                    package.FinalPrice = finalPrice;
                }

                package.UpdatedAt = DateTime.UtcNow;
                package.UpdatedByUserId = currentUserId;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Updated counselor package {PackageId}", packageId);

                var updatedPackage = await GetPackageByIdAsync(tenantId, packageId);

                return new PackageOperationResult
                {
                    Success = true,
                    Message = "Package updated successfully",
                    PackageId = packageId,
                    Package = updatedPackage
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error updating counselor package {PackageId}", packageId);
                return new PackageOperationResult
                {
                    Success = false,
                    Message = $"Error updating package: {ex.Message}"
                };
            }
        }

        public async Task<PackageOperationResult> FinalizePackageAsync(Guid tenantId, Guid packageId, Guid currentUserId)
        {
            try
            {
                var package = await _context.CounselorPackages
                    .FirstOrDefaultAsync(p => p.Id == packageId && p.TenantId == tenantId && p.DeletedAt == null);

                if (package == null)
                {
                    return new PackageOperationResult
                    {
                        Success = false,
                        Message = "Package not found"
                    };
                }

                if (package.Status != "draft")
                {
                    return new PackageOperationResult
                    {
                        Success = false,
                        Message = "Package is already finalized"
                    };
                }

                // Check if discount approval is needed but not approved
                if (package.DiscountPercent > 10 && package.DiscountApprovalStatus != "Approved")
                {
                    return new PackageOperationResult
                    {
                        Success = false,
                        Message = "Discount approval required before finalizing"
                    };
                }

                package.Status = "finalized";
                package.UpdatedAt = DateTime.UtcNow;
                package.UpdatedByUserId = currentUserId;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Finalized counselor package {PackageId}", packageId);

                var finalizedPackage = await GetPackageByIdAsync(tenantId, packageId);

                return new PackageOperationResult
                {
                    Success = true,
                    Message = "Package finalized successfully",
                    PackageId = packageId,
                    Package = finalizedPackage
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error finalizing counselor package {PackageId}", packageId);
                return new PackageOperationResult
                {
                    Success = false,
                    Message = $"Error finalizing package: {ex.Message}"
                };
            }
        }

        public async Task<bool> DeletePackageAsync(Guid tenantId, Guid packageId, Guid currentUserId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var package = await _context.CounselorPackages
                    .FirstOrDefaultAsync(p => p.Id == packageId && p.TenantId == tenantId && p.DeletedAt == null);

                if (package == null)
                    return false;

                if (package.Status != "draft")
                    throw new Exception("Only draft packages can be deleted");

                // Soft delete package items
                var items = await _context.CounselorPackageItems
                    .Where(i => i.PackageId == packageId && i.DeletedAt == null)
                    .ToListAsync();

                foreach (var item in items)
                {
                    item.DeletedAt = DateTime.UtcNow;
                    item.UpdatedAt = DateTime.UtcNow;
                }

                // Soft delete package
                package.DeletedAt = DateTime.UtcNow;
                package.UpdatedAt = DateTime.UtcNow;
                package.UpdatedByUserId = currentUserId;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Soft deleted counselor package {PackageId}", packageId);
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error deleting counselor package {PackageId}", packageId);
                throw;
            }
        }

        public async Task<CounselorPackageDetailsDto> RecalculatePackageTotalsAsync(Guid tenantId, Guid packageId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var package = await _context.CounselorPackages
                    .FirstOrDefaultAsync(p => p.Id == packageId && p.TenantId == tenantId && p.DeletedAt == null);

                if (package == null)
                    throw new Exception("Package not found");

                var items = await _context.CounselorPackageItems
                    .Where(i => i.PackageId == packageId && i.DeletedAt == null)
                    .ToListAsync();

                var basePrice = items.Sum(i => i.TotalPrice);
                var discountAmount = basePrice * (package.DiscountPercent / 100);
                var priceAfterDiscount = basePrice - discountAmount;
                var taxAmount = priceAfterDiscount * (package.TaxPercent / 100);
                var finalPrice = priceAfterDiscount + taxAmount;

                package.BasePrice = basePrice;
                package.DiscountAmount = discountAmount;
                package.TaxAmount = taxAmount;
                package.FinalPrice = finalPrice;
                package.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Recalculated totals for package {PackageId}", packageId);

                var recalculatedPackage = await GetPackageByIdAsync(tenantId, packageId);
                return recalculatedPackage!;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error recalculating package totals for {PackageId}", packageId);
                throw;
            }
        }

        // ============================================================================
        // DISCOUNT APPROVALS - Hierarchical Workflow (Partial implementation)
        // ============================================================================

        public async Task<DiscountApprovalListResponse> GetAllDiscountApprovalsAsync(Guid tenantId, string? status = null, Guid? assignedToUserId = null, int page = 1, int pageSize = 20)
        {
            try
            {
                var query = _context.PackageDiscountApprovals
                    .Where(a => a.TenantId == tenantId && a.DeletedAt == null);

                if (!string.IsNullOrEmpty(status))
                    query = query.Where(a => a.Status == status);

                if (assignedToUserId.HasValue)
                    query = query.Where(a => a.AssignedToUserId == assignedToUserId.Value);

                var totalCount = await query.CountAsync();

                var approvals = await query
                    .OrderByDescending(a => a.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(a => new PackageDiscountApprovalDto
                    {
                        Id = a.Id,
                        TenantId = a.TenantId,
                        BranchId = a.BranchId,
                        PackageId = a.PackageId,
                        RequestNumber = a.RequestNumber,
                        RequestedByUserId = a.RequestedByUserId,
                        DiscountPercent = a.DiscountPercent,
                        DiscountAmount = a.DiscountAmount,
                        OriginalPrice = a.OriginalPrice,
                        FinalPrice = a.FinalPrice,
                        Justification = a.Justification,
                        ApprovalLevel = a.ApprovalLevel,
                        AssignedToUserId = a.AssignedToUserId,
                        AssignedToRole = a.AssignedToRole,
                        ReviewedByUserId = a.ReviewedByUserId,
                        ReviewedAt = a.ReviewedAt,
                        ReviewNotes = a.ReviewNotes,
                        Status = a.Status,
                        Priority = a.Priority,
                        SlaDeadline = a.SlaDeadline,
                        SlaBreached = a.SlaBreached,
                        CreatedAt = a.CreatedAt
                    })
                    .ToListAsync();

                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

                _logger.LogInformation("Retrieved {Count} discount approvals for tenant {TenantId}", approvals.Count, tenantId);

                return new DiscountApprovalListResponse
                {
                    Approvals = approvals,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = totalPages
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving discount approvals for tenant {TenantId}", tenantId);
                throw;
            }
        }

        public async Task<PackageDiscountApprovalDto?> GetDiscountApprovalByIdAsync(Guid tenantId, Guid approvalId)
        {
            try
            {
                var approval = await _context.PackageDiscountApprovals
                    .Where(a => a.Id == approvalId && a.TenantId == tenantId && a.DeletedAt == null)
                    .Select(a => new PackageDiscountApprovalDto
                    {
                        Id = a.Id,
                        TenantId = a.TenantId,
                        BranchId = a.BranchId,
                        PackageId = a.PackageId,
                        RequestNumber = a.RequestNumber,
                        RequestedByUserId = a.RequestedByUserId,
                        DiscountPercent = a.DiscountPercent,
                        DiscountAmount = a.DiscountAmount,
                        OriginalPrice = a.OriginalPrice,
                        FinalPrice = a.FinalPrice,
                        Justification = a.Justification,
                        ApprovalLevel = a.ApprovalLevel,
                        AssignedToUserId = a.AssignedToUserId,
                        AssignedToRole = a.AssignedToRole,
                        ReviewedByUserId = a.ReviewedByUserId,
                        ReviewedAt = a.ReviewedAt,
                        ReviewNotes = a.ReviewNotes,
                        Status = a.Status,
                        Priority = a.Priority,
                        SlaDeadline = a.SlaDeadline,
                        SlaBreached = a.SlaBreached,
                        CreatedAt = a.CreatedAt
                    })
                    .FirstOrDefaultAsync();

                return approval;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving discount approval {ApprovalId}", approvalId);
                throw;
            }
        }

        public async Task<List<PackageDiscountApprovalDto>> GetPendingApprovalsForUserAsync(Guid tenantId, Guid userId)
        {
            try
            {
                var approvals = await _context.PackageDiscountApprovals
                    .Where(a => a.TenantId == tenantId && a.AssignedToUserId == userId && a.Status == "Pending" && a.DeletedAt == null)
                    .OrderBy(a => a.SlaDeadline)
                    .Select(a => new PackageDiscountApprovalDto
                    {
                        Id = a.Id,
                        TenantId = a.TenantId,
                        BranchId = a.BranchId,
                        PackageId = a.PackageId,
                        RequestNumber = a.RequestNumber,
                        RequestedByUserId = a.RequestedByUserId,
                        DiscountPercent = a.DiscountPercent,
                        DiscountAmount = a.DiscountAmount,
                        OriginalPrice = a.OriginalPrice,
                        FinalPrice = a.FinalPrice,
                        Justification = a.Justification,
                        ApprovalLevel = a.ApprovalLevel,
                        AssignedToUserId = a.AssignedToUserId,
                        AssignedToRole = a.AssignedToRole,
                        Status = a.Status,
                        Priority = a.Priority,
                        SlaDeadline = a.SlaDeadline,
                        SlaBreached = a.SlaBreached,
                        CreatedAt = a.CreatedAt
                    })
                    .ToListAsync();

                return approvals;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving pending approvals for user {UserId}", userId);
                throw;
            }
        }

        public async Task<List<PackageDiscountApprovalDto>> GetSlaBreachedApprovalsAsync(Guid tenantId)
        {
            try
            {
                var approvals = await _context.PackageDiscountApprovals
                    .Where(a => a.TenantId == tenantId && a.SlaBreached == true && a.Status == "Pending" && a.DeletedAt == null)
                    .OrderBy(a => a.CreatedAt)
                    .Select(a => new PackageDiscountApprovalDto
                    {
                        Id = a.Id,
                        TenantId = a.TenantId,
                        PackageId = a.PackageId,
                        RequestNumber = a.RequestNumber,
                        DiscountPercent = a.DiscountPercent,
                        FinalPrice = a.FinalPrice,
                        Priority = a.Priority,
                        SlaDeadline = a.SlaDeadline,
                        SlaBreached = a.SlaBreached,
                        CreatedAt = a.CreatedAt
                    })
                    .ToListAsync();

                return approvals;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving SLA breached approvals");
                throw;
            }
        }

        public async Task<PackageDiscountApprovalDto> RequestDiscountApprovalAsync(RequestDiscountApprovalRequest request, Guid currentUserId)
        {
            try
            {
                var package = await _context.CounselorPackages
                    .FirstOrDefaultAsync(p => p.Id == request.PackageId && p.DeletedAt == null);

                if (package == null)
                    throw new Exception("Package not found");

                var approvalLevel = await DetermineApprovalLevelAsync(request.DiscountPercent);
                var requestNumber = await GenerateRequestNumberAsync(package.TenantId);

                // Calculate SLA deadline (2 hours for Normal, 1 hour for High, 30 min for Urgent)
                var slaHours = request.Priority switch
                {
                    "Urgent" => 0.5,
                    "High" => 1,
                    _ => 2
                };

                var approval = new PackageDiscountApproval
                {
                    Id = Guid.NewGuid(),
                    TenantId = package.TenantId,
                    BranchId = package.BranchId,
                    PackageId = request.PackageId,
                    RequestNumber = requestNumber,
                    RequestedByUserId = currentUserId,
                    DiscountPercent = request.DiscountPercent,
                    DiscountAmount = package.FinalPrice * (request.DiscountPercent / 100),
                    OriginalPrice = package.FinalPrice,
                    FinalPrice = package.FinalPrice - (package.FinalPrice * (request.DiscountPercent / 100)),
                    Justification = request.Justification,
                    ApprovalLevel = approvalLevel,
                    AssignedToRole = approvalLevel == 1 ? "Manager" : approvalLevel == 2 ? "HOD" : "Finance",
                    Status = "Pending",
                    Priority = request.Priority,
                    SlaDeadline = DateTime.UtcNow.AddHours(slaHours),
                    SlaBreached = false,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.PackageDiscountApprovals.Add(approval);

                // Update package approval status
                package.DiscountApprovalStatus = "PendingApproval";
                package.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Created discount approval request {RequestNumber} for package {PackageId}", requestNumber, request.PackageId);

                return new PackageDiscountApprovalDto
                {
                    Id = approval.Id,
                    TenantId = approval.TenantId,
                    BranchId = approval.BranchId,
                    PackageId = approval.PackageId,
                    RequestNumber = approval.RequestNumber,
                    RequestedByUserId = approval.RequestedByUserId,
                    DiscountPercent = approval.DiscountPercent,
                    DiscountAmount = approval.DiscountAmount,
                    OriginalPrice = approval.OriginalPrice,
                    FinalPrice = approval.FinalPrice,
                    Justification = approval.Justification,
                    ApprovalLevel = approval.ApprovalLevel,
                    AssignedToRole = approval.AssignedToRole,
                    Status = approval.Status,
                    Priority = approval.Priority,
                    SlaDeadline = approval.SlaDeadline,
                    SlaBreached = approval.SlaBreached,
                    CreatedAt = approval.CreatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating discount approval request for package {PackageId}", request.PackageId);
                throw;
            }
        }

        public async Task<PackageDiscountApprovalDto> ReviewDiscountApprovalAsync(ReviewDiscountApprovalRequest request, Guid currentUserId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var approval = await _context.PackageDiscountApprovals
                    .Include(a => a.Package)
                    .FirstOrDefaultAsync(a => a.Id == request.ApprovalId && a.DeletedAt == null);

                if (approval == null)
                    throw new Exception("Approval request not found");

                if (approval.Status != "Pending")
                    throw new Exception("Approval request is not pending");

                approval.Status = request.Decision;
                approval.ReviewedByUserId = currentUserId;
                approval.ReviewedAt = DateTime.UtcNow;
                approval.ReviewNotes = request.ReviewNotes;
                approval.UpdatedAt = DateTime.UtcNow;

                // Update package approval status
                if (request.Decision == "Approved")
                {
                    approval.Package.DiscountApprovalStatus = "Approved";
                    approval.Package.ApprovedAt = DateTime.UtcNow;
                    approval.Package.ApprovedByUserId = currentUserId;
                    
                    // Apply the approved discount
                    approval.Package.DiscountAmount = approval.DiscountAmount;
                    approval.Package.FinalPrice = approval.FinalPrice;
                }
                else if (request.Decision == "Rejected")
                {
                    approval.Package.DiscountApprovalStatus = "Rejected";
                    approval.Package.RejectionReason = request.ReviewNotes;
                }

                approval.Package.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Reviewed discount request {RequestNumber} - Decision: {Decision}", approval.RequestNumber, request.Decision);

                return new PackageDiscountApprovalDto
                {
                    Id = approval.Id,
                    TenantId = approval.TenantId,
                    PackageId = approval.PackageId,
                    RequestNumber = approval.RequestNumber,
                    Status = approval.Status,
                    ReviewedByUserId = approval.ReviewedByUserId,
                    ReviewedAt = approval.ReviewedAt,
                    ReviewNotes = approval.ReviewNotes
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error reviewing discount request {ApprovalId}", request.ApprovalId);
                throw;
            }
        }

        public async Task<bool> EscalateApprovalAsync(Guid tenantId, Guid approvalId, Guid currentUserId)
        {
            try
            {
                var approval = await _context.PackageDiscountApprovals
                    .FirstOrDefaultAsync(a => a.Id == approvalId && a.TenantId == tenantId && a.DeletedAt == null);

                if (approval == null || approval.Status != "Pending")
                    return false;

                if (approval.ApprovalLevel < 3)
                {
                    approval.ApprovalLevel++;
                    approval.AssignedToRole = approval.ApprovalLevel == 2 ? "HOD" : "Finance";
                    approval.AssignedToUserId = null;
                    approval.UpdatedAt = DateTime.UtcNow;

                    await _context.SaveChangesAsync();

                    _logger.LogInformation("Escalated approval {RequestNumber} to level {Level}", approval.RequestNumber, approval.ApprovalLevel);
                    return true;
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error escalating approval {ApprovalId}", approvalId);
                throw;
            }
        }

        public async Task<bool> CancelApprovalRequestAsync(Guid tenantId, Guid approvalId, Guid currentUserId)
        {
            try
            {
                var approval = await _context.PackageDiscountApprovals
                    .Include(a => a.Package)
                    .FirstOrDefaultAsync(a => a.Id == approvalId && a.TenantId == tenantId && a.DeletedAt == null);

                if (approval == null)
                    return false;

                if (approval.RequestedByUserId != currentUserId)
                    throw new UnauthorizedAccessException("Only the requester can cancel an approval request");

                approval.Status = "Cancelled";
                approval.UpdatedAt = DateTime.UtcNow;

                // Reset package approval status
                approval.Package.DiscountApprovalStatus = "NotRequired";
                approval.Package.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Cancelled approval request {RequestNumber}", approval.RequestNumber);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling approval request {ApprovalId}", approvalId);
                throw;
            }
        }

        // ============================================================================
        // BUSINESS LOGIC & CALCULATIONS
        // ============================================================================

        public async Task<decimal> CalculatePackageTotalAsync(List<CreateCounselorPackageItemRequest> items, decimal discountPercent = 0, decimal taxPercent = 0)
        {
            await Task.CompletedTask;

            var basePrice = items.Sum(i => i.UnitPrice * i.Quantity);
            var discountAmount = basePrice * (discountPercent / 100);
            var priceAfterDiscount = basePrice - discountAmount;
            var taxAmount = priceAfterDiscount * (taxPercent / 100);
            var finalPrice = priceAfterDiscount + taxAmount;

            return finalPrice;
        }

        public async Task<int> DetermineApprovalLevelAsync(decimal discountPercent)
        {
            await Task.CompletedTask;

            // 10-20%: Manager (Level 1)
            // 20-30%: HOD (Level 2)
            // >30%: Finance (Level 3)
            if (discountPercent <= 20) return 1;
            if (discountPercent <= 30) return 2;
            return 3;
        }

        public async Task<string> GenerateRequestNumberAsync(Guid tenantId)
        {
            var today = DateTime.UtcNow.Date;
            var countToday = await _context.PackageDiscountApprovals
                .Where(a => a.TenantId == tenantId && a.CreatedAt >= today && a.CreatedAt < today.AddDays(1))
                .CountAsync();

            var datePrefix = today.ToString("yyyyMMdd");
            return $"DA-{datePrefix}-{(countToday + 1):D4}";
        }
    }
}
