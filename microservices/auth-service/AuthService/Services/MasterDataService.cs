using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AuthService.Services
{
    public class MasterDataService : IMasterDataService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<MasterDataService> _logger;

        public MasterDataService(AppDbContext context, ILogger<MasterDataService> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Insurance Providers
        public async Task<List<InsuranceProvider>> GetInsuranceProvidersAsync(Guid tenantId)
        {
            try
            {
                _logger.LogInformation("Getting insurance providers for tenant {TenantId}", tenantId);
                
                return await _context.InsuranceProviders
                    .Where(p => p.TenantId == tenantId && p.DeletedAt == null && p.IsActive)
                    .OrderBy(p => p.DisplayOrder)
                    .ThenBy(p => p.ProviderName)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting insurance providers for tenant {TenantId}", tenantId);
                throw;
            }
        }

        public async Task<InsuranceProvider?> GetInsuranceProviderByIdAsync(Guid id)
        {
            try
            {
                return await _context.InsuranceProviders
                    .FirstOrDefaultAsync(p => p.Id == id && p.DeletedAt == null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting insurance provider {Id}", id);
                throw;
            }
        }

        // TPA Providers
        public async Task<List<TpaProvider>> GetTpaProvidersAsync(Guid tenantId)
        {
            try
            {
                _logger.LogInformation("Getting TPA providers for tenant {TenantId}", tenantId);
                
                return await _context.TpaProviders
                    .Where(p => p.TenantId == tenantId && p.DeletedAt == null && p.IsActive)
                    .OrderBy(p => p.DisplayOrder)
                    .ThenBy(p => p.TpaName)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting TPA providers for tenant {TenantId}", tenantId);
                throw;
            }
        }

        public async Task<TpaProvider?> GetTpaProviderByIdAsync(Guid id)
        {
            try
            {
                return await _context.TpaProviders
                    .FirstOrDefaultAsync(p => p.Id == id && p.DeletedAt == null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting TPA provider {Id}", id);
                throw;
            }
        }

        // Surgery Types: Removed — replaced by ServiceVariant via ServiceCatalogService

        // Anesthesia Types
        public async Task<List<AnesthesiaType>> GetAnesthesiaTypesAsync(Guid tenantId)
        {
            try
            {
                _logger.LogInformation("Getting anesthesia types for tenant {TenantId}", tenantId);
                
                return await _context.AnesthesiaTypes
                    .Where(a => a.TenantId == tenantId && a.DeletedAt == null && a.IsActive)
                    .OrderBy(a => a.DisplayOrder)
                    .ThenBy(a => a.AnesthesiaName)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting anesthesia types for tenant {TenantId}", tenantId);
                throw;
            }
        }

        public async Task<AnesthesiaType?> GetAnesthesiaTypeByIdAsync(Guid id)
        {
            try
            {
                return await _context.AnesthesiaTypes
                    .FirstOrDefaultAsync(a => a.Id == id && a.DeletedAt == null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting anesthesia type {Id}", id);
                throw;
            }
        }

        // Government Schemes
        public async Task<List<GovernmentScheme>> GetGovernmentSchemesAsync(Guid tenantId)
        {
            try
            {
                _logger.LogInformation("Getting government schemes for tenant {TenantId}", tenantId);
                
                return await _context.GovernmentSchemes
                    .Where(g => g.TenantId == tenantId && g.DeletedAt == null && g.IsActive)
                    .OrderBy(g => g.DisplayOrder)
                    .ThenBy(g => g.SchemeName)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting government schemes for tenant {TenantId}", tenantId);
                throw;
            }
        }

        public async Task<GovernmentScheme?> GetGovernmentSchemeByIdAsync(Guid id)
        {
            try
            {
                return await _context.GovernmentSchemes
                    .FirstOrDefaultAsync(g => g.Id == id && g.DeletedAt == null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting government scheme {Id}", id);
                throw;
            }
        }
        
        // IOL catalog and surgery-type methods removed — replaced by ServiceCatalogService
        
        public async Task<PackageCostCalculation> CalculatePackageCostAsync(
            Guid tenantId,
            Guid branchId,
            Guid surgeryTypeId,
            Guid? iolCatalogId = null,
            Guid? doctorId = null)
        {
            try
            {
                _logger.LogInformation("Calculating package cost for tenant {TenantId}, branch {BranchId}, surgery {SurgeryId}, IOL {IolId}, doctor {DoctorId}", 
                    tenantId, branchId, surgeryTypeId, iolCatalogId, doctorId);
                
                var result = new PackageCostCalculation();
                
                // Get surgery variant
                var surgery = await _context.ServiceVariants
                    .Include(v => v.CatalogService)
                        .ThenInclude(s => s.Category)
                    .FirstOrDefaultAsync(v => v.Id == surgeryTypeId && v.IsActive);
                
                if (surgery == null)
                {
                    throw new InvalidOperationException($"Surgery variant {surgeryTypeId} not found");
                }
                
                result.SurgeryName = surgery.VariantName;
                // Look up global price from variant_prices (DefaultPrice removed during normalisation)
                var surgeryDefaultPrice = await _context.VariantPrices
                    .Where(p => p.VariantId == surgeryTypeId
                             && p.BranchId == null
                             && p.EffectiveTo == null
                             && p.IsActive
                             && p.DeletedAt == null)
                    .OrderByDescending(p => p.EffectiveFrom)
                    .Select(p => p.Amount)
                    .FirstOrDefaultAsync();
                result.SurgeryCost = await GetEffectivePriceAsync(branchId, "Surgery", surgeryTypeId, surgeryDefaultPrice);
                
                // Get IOL cost if applicable
                if (iolCatalogId.HasValue && surgery.HasIolOptions)
                {
                    var iol = await _context.IolMasters
                        .FirstOrDefaultAsync(i => i.Id == iolCatalogId.Value && i.IsActive);
                    
                    if (iol != null)
                    {
                        result.IolModelName = iol.ModelName;
                        var iolDefaultPrice = await _context.IolPrices
                            .Where(p => p.IolMasterId == iolCatalogId.Value
                                     && p.BranchId == null
                                     && p.EffectiveTo == null
                                     && p.IsActive
                                     && p.DeletedAt == null)
                            .OrderByDescending(p => p.EffectiveFrom)
                            .Select(p => p.Amount)
                            .FirstOrDefaultAsync();
                        result.IolCost = await GetEffectivePriceAsync(branchId, "IOL", iolCatalogId.Value, iolDefaultPrice);
                    }
                }
                
                // Get consultation fee
                var consultationFee = await GetConsultationFeeAsync(tenantId, branchId, doctorId, null, null, false, false);
                result.ConsultationFee = consultationFee ?? 0;
                
                // Check if doctor exists for name
                if (doctorId.HasValue)
                {
                    var doctor = await _context.Users
                        .FirstOrDefaultAsync(u => u.Id == doctorId.Value);
                    if (doctor != null)
                    {
                        result.DoctorName = $"{doctor.FirstName} {doctor.LastName}";
                    }
                }
                
                // Calculate total
                result.TotalCost = result.SurgeryCost + result.IolCost + result.ConsultationFee;
                
                // Check if branch overrides were applied
                var hasOverride = await _context.BranchPricingOverrides
                    .AnyAsync(o => o.BranchId == branchId && 
                                   o.TenantId == tenantId && 
                                   o.IsActive && 
                                   o.DeletedAt == null &&
                                   ((o.ItemType == "Surgery" && o.ItemId == surgeryTypeId) ||
                                    (o.ItemType == "IOL" && iolCatalogId.HasValue && o.ItemId == iolCatalogId.Value)));
                
                result.HasBranchOverride = hasOverride;
                if (hasOverride)
                {
                    result.PricingNotes = "Branch-specific pricing applied";
                }
                
                // ============================================================================
                // PACKAGE TEMPLATE MATCHING (Phase 3 Enhancement - Feb 25, 2026)
                // ============================================================================
                // Try to find matching package template based on surgery + IOL combination
                var categoryCode = surgery.CatalogService?.Category?.Code;
                if (categoryCode != null)
                {
                    var matchingPackage = await _context.SurgeryPackageTemplates
                        .Where(p => p.TenantId == tenantId &&
                                   p.IsActive &&
                                   p.DeletedAt == null &&
                                   p.PackageCategory == categoryCode)
                        .OrderBy(p => p.BasePrice)
                        .FirstOrDefaultAsync();
                    
                    if (matchingPackage != null)
                    {
                        result.HasMatchingPackage = true;
                        result.MatchedPackageId = matchingPackage.Id;
                        result.MatchedPackageName = matchingPackage.PackageName;
                        result.MatchedPackagePrice = matchingPackage.BasePrice;
                        
                        // Calculate savings
                        if (result.TotalCost > matchingPackage.BasePrice)
                        {
                            result.SavingsAmount = result.TotalCost - matchingPackage.BasePrice;
                            result.SavingsPercentage = Math.Round((result.SavingsAmount.Value / result.TotalCost) * 100, 2);
                            result.PricingNotes = hasOverride 
                                ? $"Branch-specific pricing applied. Save ₹{result.SavingsAmount:N0} with '{matchingPackage.PackageName}' package"
                                : $"Save ₹{result.SavingsAmount:N0} with '{matchingPackage.PackageName}' package";
                        }
                        else
                        {
                            result.SavingsAmount = 0;
                            result.SavingsPercentage = 0;
                            result.PricingNotes = hasOverride
                                ? "Branch-specific pricing applied. Custom build is better value"
                                : "Custom build is competitive with package pricing";
                        }
                    }
                }
                
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating package cost for surgery {SurgeryId}", surgeryTypeId);
                throw;
            }
        }
        
        public async Task<decimal> GetEffectivePriceAsync(
            Guid branchId, 
            string itemType, 
            Guid itemId, 
            decimal defaultPrice)
        {
            try
            {
                var now = DateTime.UtcNow;
                
                // Check for active branch-specific pricing override
                var priceOverride = await _context.BranchPricingOverrides
                    .Where(o => o.BranchId == branchId &&
                               o.ItemType == itemType &&
                               o.ItemId == itemId &&
                               o.IsActive &&
                               o.DeletedAt == null &&
                               (o.EffectiveFrom == null || o.EffectiveFrom <= now) &&
                               (o.EffectiveTo == null || o.EffectiveTo >= now))
                    .OrderByDescending(o => o.EffectiveFrom)
                    .FirstOrDefaultAsync();
                
                if (priceOverride == null)
                {
                    return defaultPrice;
                }
                
                // Apply pricing strategy
                return priceOverride.PricingStrategy switch
                {
                    "Fixed" => priceOverride.OverridePrice ?? defaultPrice,
                    "PercentageDiscount" => defaultPrice * (1 - (priceOverride.DiscountPercentage ?? 0) / 100),
                    "PercentageMarkup" => defaultPrice * (1 + (priceOverride.DiscountPercentage ?? 0) / 100),
                    "CostPlus" => (priceOverride.OverridePrice ?? defaultPrice) + defaultPrice,
                    _ => defaultPrice
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting effective price for {ItemType} {ItemId}", itemType, itemId);
                return defaultPrice; // Return default price on error
            }
        }
        
        public async Task<decimal?> GetConsultationFeeAsync(
            Guid tenantId,
            Guid branchId,
            Guid? doctorId = null,
            Guid? departmentId = null,
            string? specialty = null,
            bool isEmergency = false,
            bool isFollowUp = false)
        {
            try
            {
                _logger.LogInformation("Getting consultation fee for tenant {TenantId}, branch {BranchId}, doctor {DoctorId}, dept {DeptId}, specialty {Specialty}", 
                    tenantId, branchId, doctorId, departmentId, specialty);
                
                var now = DateTime.UtcNow;
                
                // Priority 1: Doctor-specific charge
                if (doctorId.HasValue)
                {
                    var doctorCharge = await _context.ConsultationCharges
                        .Where(c => c.TenantId == tenantId &&
                                   c.BranchId == branchId &&
                                   c.ChargeType == "DoctorSpecific" &&
                                   c.DoctorId == doctorId.Value &&
                                   c.IsActive &&
                                   c.DeletedAt == null &&
                                   (c.EffectiveFrom == null || c.EffectiveFrom <= now) &&
                                   (c.EffectiveTo == null || c.EffectiveTo >= now))
                        .OrderByDescending(c => c.EffectiveFrom)
                        .FirstOrDefaultAsync();
                    
                    if (doctorCharge != null)
                    {
                        return GetFeeByType(doctorCharge, isEmergency, isFollowUp);
                    }
                }
                
                // Priority 2: Specialty-based charge
                if (!string.IsNullOrEmpty(specialty))
                {
                    var specialtyCharge = await _context.ConsultationCharges
                        .Where(c => c.TenantId == tenantId &&
                                   c.BranchId == branchId &&
                                   c.ChargeType == "SpecialtyBased" &&
                                   c.Specialty == specialty &&
                                   c.IsActive &&
                                   c.DeletedAt == null &&
                                   (c.EffectiveFrom == null || c.EffectiveFrom <= now) &&
                                   (c.EffectiveTo == null || c.EffectiveTo >= now))
                        .OrderByDescending(c => c.EffectiveFrom)
                        .FirstOrDefaultAsync();
                    
                    if (specialtyCharge != null)
                    {
                        return GetFeeByType(specialtyCharge, isEmergency, isFollowUp);
                    }
                }
                
                // Priority 3: Department-wide charge
                if (departmentId.HasValue)
                {
                    var deptCharge = await _context.ConsultationCharges
                        .Where(c => c.TenantId == tenantId &&
                                   c.BranchId == branchId &&
                                   c.ChargeType == "DepartmentWide" &&
                                   c.DepartmentId == departmentId.Value &&
                                   c.IsActive &&
                                   c.DeletedAt == null &&
                                   (c.EffectiveFrom == null || c.EffectiveFrom <= now) &&
                                   (c.EffectiveTo == null || c.EffectiveTo >= now))
                        .OrderByDescending(c => c.EffectiveFrom)
                        .FirstOrDefaultAsync();
                    
                    if (deptCharge != null)
                    {
                        return GetFeeByType(deptCharge, isEmergency, isFollowUp);
                    }
                }
                
                // Priority 4: Default charge
                var defaultCharge = await _context.ConsultationCharges
                    .Where(c => c.TenantId == tenantId &&
                               c.BranchId == branchId &&
                               c.ChargeType == "Default" &&
                               c.IsActive &&
                               c.DeletedAt == null &&
                               (c.EffectiveFrom == null || c.EffectiveFrom <= now) &&
                               (c.EffectiveTo == null || c.EffectiveTo >= now))
                    .OrderByDescending(c => c.EffectiveFrom)
                    .FirstOrDefaultAsync();
                
                if (defaultCharge != null)
                {
                    return GetFeeByType(defaultCharge, isEmergency, isFollowUp);
                }
                
                return null; // No consultation charges configured
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting consultation fee for tenant {TenantId}, branch {BranchId}", tenantId, branchId);
                return null;
            }
        }
        
        public async Task<List<ConsultationCharge>> GetConsultationChargesAsync(Guid tenantId, Guid branchId)
        {
            try
            {
                _logger.LogInformation("Getting consultation charges for tenant {TenantId}, branch {BranchId}", tenantId, branchId);
                
                return await _context.ConsultationCharges
                    .Where(c => c.TenantId == tenantId && c.BranchId == branchId && c.DeletedAt == null && c.IsActive)
                    .OrderBy(c => c.ChargeType)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting consultation charges for tenant {TenantId}, branch {BranchId}", tenantId, branchId);
                throw;
            }
        }
        
        /// <summary>
        /// Helper method to get the appropriate fee based on consultation type
        /// </summary>
        private decimal GetFeeByType(ConsultationCharge charge, bool isEmergency, bool isFollowUp)
        {
            if (isEmergency && charge.EmergencyConsultationFee.HasValue)
            {
                return charge.EmergencyConsultationFee.Value;
            }
            
            if (isFollowUp && charge.FollowUpFee.HasValue)
            {
                return charge.FollowUpFee.Value;
            }
            
            return charge.ConsultationFee;
        }
    }
}
