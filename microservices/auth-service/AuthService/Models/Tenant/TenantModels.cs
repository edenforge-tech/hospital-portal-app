using System;
using System.Collections.Generic;

namespace AuthService.Models.Tenant
{
    /// <summary>
    /// Tenant DTO for list views
    /// </summary>
    public class TenantDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Domain { get; set; }
        public string Status { get; set; } = "Active"; // Active, Inactive, Suspended, Trial
        public string SubscriptionType { get; set; } = "Professional"; // Free, Professional, Enterprise, Custom
        public string? Tier { get; set; }
        public int MaxOrganizations { get; set; }
        public int MaxBranches { get; set; }
        public int MaxUsers { get; set; }
        public DateTime? SubscriptionExpiresAt { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public int TotalOrganizations { get; set; }
        public int TotalBranches { get; set; }
        public int TotalUsers { get; set; }
    }

    /// <summary>
    /// Tenant details with full information
    /// </summary>
    public class TenantDetailsDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? TenantCode { get; set; }
        public string? Domain { get; set; }
        public string Status { get; set; } = "Active";
        public bool IsActive { get; set; } = true; // Computed from Status
        public string SubscriptionType { get; set; } = "Professional";
        public string? Tier { get; set; }
        
        // Limits
        public int MaxOrganizations { get; set; }
        public int MaxBranches { get; set; }
        public int MaxUsers { get; set; }
        
        // Regional
        public string? PrimaryRegion { get; set; }
        public List<string>? RegionsSupported { get; set; }
        public string DefaultCurrency { get; set; } = "USD";
        public List<string>? SupportedCurrencies { get; set; }
        public string DefaultLanguage { get; set; } = "en";
        public List<string>? SupportedLanguages { get; set; }
        
        // Company Info
        public string? CompanyLogoUrl { get; set; }
        public string? CompanyWebsite { get; set; }
        public string? CompanyEmail { get; set; }
        public string? CompanyPhone { get; set; }
        
        // Compliance
        public bool HipaaCompliant { get; set; }
        public bool NabhAccredited { get; set; }
        public bool GdprCompliant { get; set; }
        public bool DpaCompliant { get; set; }
        
        // Subscription
        public DateTime? SubscriptionStartDate { get; set; }
        public DateTime? SubscriptionEndDate { get; set; }
        public DateTime? SubscriptionExpiresAt { get; set; }
        
        // Features
        public Dictionary<string, object>? FeaturesEnabled { get; set; }
        public Dictionary<string, object>? ContactInfo { get; set; }
        public Dictionary<string, object>? Settings { get; set; }
        
        // Usage
        public int TotalOrganizations { get; set; }
        public int TotalBranches { get; set; }
        public int TotalUsers { get; set; }
        public int TotalDepartments { get; set; }
        
        // Audit
        public DateTime CreatedAt { get; set; }
        public Guid? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedBy { get; set; }
    }

    /// <summary>
    /// Request to create a new tenant
    /// </summary>
    public class CreateTenantRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? TenantCode { get; set; }
        public string? Domain { get; set; }
        public string Status { get; set; } = "Active";
        public string SubscriptionType { get; set; } = "Professional";
        public string? Tier { get; set; }
        
        // Limits
        public int MaxOrganizations { get; set; } = 10;
        public int MaxBranches { get; set; } = 10;
        public int MaxUsers { get; set; } = 1000;
        
        // Regional
        public string? PrimaryRegion { get; set; }
        public List<string>? RegionsSupported { get; set; }
        public string DefaultCurrency { get; set; } = "USD";
        public List<string>? SupportedCurrencies { get; set; }
        public string DefaultLanguage { get; set; } = "en";
        public List<string>? SupportedLanguages { get; set; }
        
        // Company Info
        public string? CompanyLogoUrl { get; set; }
        public string? CompanyWebsite { get; set; }
        public string? CompanyEmail { get; set; }
        public string? CompanyPhone { get; set; }
        
        // Compliance
        public bool HipaaCompliant { get; set; }
        public bool NabhAccredited { get; set; }
        public bool GdprCompliant { get; set; }
        public bool DpaCompliant { get; set; }
        
        // Subscription
        public DateTime? SubscriptionStartDate { get; set; }
        public DateTime? SubscriptionEndDate { get; set; }
        
        // Features
        public Dictionary<string, object>? FeaturesEnabled { get; set; }
        public Dictionary<string, object>? ContactInfo { get; set; }
        public Dictionary<string, object>? Settings { get; set; }
    }

    /// <summary>
    /// Request to update tenant
    /// </summary>
    public class UpdateTenantRequest
    {
        public string? Name { get; set; }
        public string? Domain { get; set; }
        public string? Status { get; set; }
        public string? SubscriptionType { get; set; }
        public string? Tier { get; set; }
        
        // Limits
        public int? MaxOrganizations { get; set; }
        public int? MaxBranches { get; set; }
        public int? MaxUsers { get; set; }
        
        // Regional
        public string? PrimaryRegion { get; set; }
        public List<string>? RegionsSupported { get; set; }
        public string? DefaultCurrency { get; set; }
        public List<string>? SupportedCurrencies { get; set; }
        public string? DefaultLanguage { get; set; }
        public List<string>? SupportedLanguages { get; set; }
        
        // Company Info
        public string? CompanyLogoUrl { get; set; }
        public string? CompanyWebsite { get; set; }
        public string? CompanyEmail { get; set; }
        public string? CompanyPhone { get; set; }
        
        // Address (flat fields matching frontend)
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? Country { get; set; }
        public string? ZipCode { get; set; }
        
        // Compliance
        public bool? HipaaCompliant { get; set; }
        public bool? NabhAccredited { get; set; }
        public bool? GdprCompliant { get; set; }
        public bool? DpaCompliant { get; set; }
        
        // Subscription
        public DateTime? SubscriptionStartDate { get; set; }
        public DateTime? SubscriptionEndDate { get; set; }
        
        // Features
        public Dictionary<string, object>? FeaturesEnabled { get; set; }
        public Dictionary<string, object>? ContactInfo { get; set; }
        public Dictionary<string, object>? Settings { get; set; }
    }

    /// <summary>
    /// Filters for tenant list
    /// </summary>
    public class TenantFilters
    {
        public string? Search { get; set; }
        public string? Status { get; set; }
        public string? SubscriptionType { get; set; }
        public string? Tier { get; set; }
        public bool? HipaaCompliant { get; set; }
        public bool? NabhAccredited { get; set; }
        public DateTime? SubscriptionExpiringBefore { get; set; }
        public string? SortBy { get; set; }
        public string? SortOrder { get; set; } = "asc";
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }

    /// <summary>
    /// Paginated tenant list response
    /// </summary>
    public class TenantListResponse
    {
        public List<TenantDto> Tenants { get; set; } = new List<TenantDto>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public Dictionary<string, int> StatusBreakdown { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> SubscriptionTypeBreakdown { get; set; } = new Dictionary<string, int>();
    }

    /// <summary>
    /// Tenant operation result
    /// </summary>
    public class TenantOperationResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public Guid? TenantId { get; set; }
        public TenantDto? Data { get; set; }
        public List<string>? Errors { get; set; }
    }

    /// <summary>
    /// Tenant statistics
    /// </summary>
    public class TenantStatistics
    {
        public int TotalTenants { get; set; }
        public int ActiveTenants { get; set; }
        public int InactiveTenants { get; set; }
        public int TrialTenants { get; set; }
        public int SuspendedTenants { get; set; }
        
        public Dictionary<string, int> SubscriptionTypeBreakdown { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> TierBreakdown { get; set; } = new Dictionary<string, int>();
        
        public int TotalOrganizations { get; set; }
        public int TotalBranches { get; set; }
        public int TotalUsers { get; set; }
        
        public int HipaaCompliantCount { get; set; }
        public int NabhAccreditedCount { get; set; }
        public int GdprCompliantCount { get; set; }
        
        public List<TenantUsageDto> TopTenantsByUsers { get; set; } = new List<TenantUsageDto>();
        public List<TenantDto> ExpiringSubscriptions { get; set; } = new List<TenantDto>();
    }

    /// <summary>
    /// Tenant usage statistics
    /// </summary>
    public class TenantUsageDto
    {
        public Guid TenantId { get; set; }
        public string TenantName { get; set; } = string.Empty;
        public int TotalOrganizations { get; set; }
        public int TotalBranches { get; set; }
        public int TotalUsers { get; set; }
        public int MaxUsers { get; set; }
        public double UsagePercentage { get; set; }
    }

    /// <summary>
    /// Request to update subscription
    /// </summary>
    public class UpdateSubscriptionRequest
    {
        public string SubscriptionType { get; set; } = string.Empty;
        public string? Tier { get; set; }
        public DateTime? SubscriptionStartDate { get; set; }
        public DateTime? SubscriptionEndDate { get; set; }
        public int? MaxOrganizations { get; set; }
        public int? MaxBranches { get; set; }
        public int? MaxUsers { get; set; }
        public Dictionary<string, object>? FeaturesEnabled { get; set; }
    }

    /// <summary>
    /// Request to update compliance settings
    /// </summary>
    public class UpdateComplianceRequest
    {
        public bool? HipaaCompliant { get; set; }
        public bool? NabhAccredited { get; set; }
        public bool? GdprCompliant { get; set; }
        public bool? DpaCompliant { get; set; }
    }

    /// <summary>
    /// Tenant validation result
    /// </summary>
    public class TenantValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public List<string> Warnings { get; set; } = new List<string>();
        public TenantLimitsCheckDto LimitsCheck { get; set; } = new TenantLimitsCheckDto();
    }

    /// <summary>
    /// Tenant limits check
    /// </summary>
    public class TenantLimitsCheckDto
    {
        public bool OrganizationsLimitReached { get; set; }
        public bool BranchesLimitReached { get; set; }
        public bool UsersLimitReached { get; set; }
        public int CurrentOrganizations { get; set; }
        public int MaxOrganizations { get; set; }
        public int CurrentBranches { get; set; }
        public int MaxBranches { get; set; }
        public int CurrentUsers { get; set; }
        public int MaxUsers { get; set; }
    }
}
