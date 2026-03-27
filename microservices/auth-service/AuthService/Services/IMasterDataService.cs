using AuthService.Models.Domain;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AuthService.Services
{
    public interface IMasterDataService
    {
        // Insurance Providers
        Task<List<InsuranceProvider>> GetInsuranceProvidersAsync(Guid tenantId);
        Task<InsuranceProvider?> GetInsuranceProviderByIdAsync(Guid id);
        
        // TPA Providers
        Task<List<TpaProvider>> GetTpaProvidersAsync(Guid tenantId);
        Task<TpaProvider?> GetTpaProviderByIdAsync(Guid id);
        
        // Surgery Types: Removed — replaced by ServiceVariant via ServiceCatalogService
        
        // Anesthesia Types
        Task<List<AnesthesiaType>> GetAnesthesiaTypesAsync(Guid tenantId);
        Task<AnesthesiaType?> GetAnesthesiaTypeByIdAsync(Guid id);
        
        // Government Schemes
        Task<List<GovernmentScheme>> GetGovernmentSchemesAsync(Guid tenantId);
        Task<GovernmentScheme?> GetGovernmentSchemeByIdAsync(Guid id);
        
        // IOL catalog and surgery-types-with-pricing removed — replaced by ServiceCatalogService
        
        /// <summary>
        /// Calculate total package cost including surgery + IOL + consultation
        /// </summary>
        Task<PackageCostCalculation> CalculatePackageCostAsync(
            Guid tenantId,
            Guid branchId,
            Guid surgeryTypeId,
            Guid? iolCatalogId = null,
            Guid? doctorId = null);
        
        /// <summary>
        /// Get effective price for an item considering branch-specific overrides
        /// </summary>
        Task<decimal> GetEffectivePriceAsync(
            Guid branchId, 
            string itemType, 
            Guid itemId, 
            decimal defaultPrice);
        
        /// <summary>
        /// Get consultation fee with priority: Doctor > Specialty > Department > Default
        /// </summary>
        Task<decimal?> GetConsultationFeeAsync(
            Guid tenantId,
            Guid branchId,
            Guid? doctorId = null,
            Guid? departmentId = null,
            string? specialty = null,
            bool isEmergency = false,
            bool isFollowUp = false);
        
        /// <summary>
        /// Get all active consultation charges for a branch
        /// </summary>
        Task<List<ConsultationCharge>> GetConsultationChargesAsync(Guid tenantId, Guid branchId);
    }
    
    /// <summary>
    /// Package cost calculation result with breakdown
    /// </summary>
    public class PackageCostCalculation
    {
        public decimal SurgeryCost { get; set; }
        public decimal IolCost { get; set; }
        public decimal ConsultationFee { get; set; }
        public decimal TotalCost { get; set; }
        public string CurrencyCode { get; set; } = "INR";
        
        // Breakdown details
        public string? SurgeryName { get; set; }
        public string? IolModelName { get; set; }
        public string? DoctorName { get; set; }
        public bool HasBranchOverride { get; set; }
        public string? PricingNotes { get; set; }
        
        // Package template matching (Phase 3 Enhancement - Feb 25, 2026)
        public bool HasMatchingPackage { get; set; }
        public Guid? MatchedPackageId { get; set; }
        public string? MatchedPackageName { get; set; }
        public decimal? MatchedPackagePrice { get; set; }
        public decimal? SavingsAmount { get; set; }
        public decimal? SavingsPercentage { get; set; }
    }
}
