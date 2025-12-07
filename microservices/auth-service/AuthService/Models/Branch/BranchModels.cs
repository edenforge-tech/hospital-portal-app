using System;
using System.Collections.Generic;

namespace AuthService.Models.Branch
{
    /// <summary>
    /// Branch DTO for list views
    /// </summary>
    public class BranchDto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid OrganizationId { get; set; }
        public string OrganizationName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
        public string? Region { get; set; }
        public string? City { get; set; }
        public string Status { get; set; } = "active";
        public string? OperationalStatus { get; set; }
        public int TotalDepartments { get; set; }
        public int TotalStaff { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>
    /// Branch details with full information
    /// </summary>
    public class BranchDetailsDto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid OrganizationId { get; set; }
        public string OrganizationName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
        public string? Description { get; set; }
        public string Status { get; set; } = "active";
        
        // Regional
        public string? Region { get; set; }
        public string? Timezone { get; set; }
        public string? Currency { get; set; }
        public string? LanguagePrimary { get; set; }
        
        // Address
        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? City { get; set; }
        public string? StateProvince { get; set; }
        public string? PostalCode { get; set; }
        public string? CountryCode { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        
        // Contact
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Fax { get; set; }
        
        // Operational
        public TimeSpan? OperationalHoursStart { get; set; }
        public TimeSpan? OperationalHoursEnd { get; set; }
        public bool EmergencySupport24x7 { get; set; }
        public int TotalDepartments { get; set; }
        public int TotalStaff { get; set; }
        public string? OperationalStatus { get; set; }
        
        // Settings
        public Dictionary<string, object>? BranchSettings { get; set; }
        public string? CurrencyCode { get; set; }
        
        // Audit
        public DateTime CreatedAt { get; set; }
        public Guid? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedBy { get; set; }
    }

    /// <summary>
    /// Request to create a new branch
    /// </summary>
    public class CreateBranchRequest
    {
        public Guid TenantId { get; set; }
        public Guid OrganizationId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
        public string? Description { get; set; }
        public string Status { get; set; } = "active";
        
        // Regional
        public string Region { get; set; } = string.Empty;
        public string Timezone { get; set; } = string.Empty;
        public string Currency { get; set; } = "USD";
        public string LanguagePrimary { get; set; } = "en";
        
        // Address
        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? City { get; set; }
        public string? StateProvince { get; set; }
        public string? PostalCode { get; set; }
        public string? CountryCode { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        
        // Contact
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Fax { get; set; }
        
        // Operational
        public TimeSpan? OperationalHoursStart { get; set; }
        public TimeSpan? OperationalHoursEnd { get; set; }
        public bool EmergencySupport24x7 { get; set; } = true;
        public string OperationalStatus { get; set; } = "operational";
        
        // Settings
        public Dictionary<string, object>? BranchSettings { get; set; }
        public string? CurrencyCode { get; set; }
    }

    /// <summary>
    /// Request to update branch
    /// </summary>
    public class UpdateBranchRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; }
        
        // Regional
        public string? Region { get; set; }
        public string? Timezone { get; set; }
        public string? Currency { get; set; }
        public string? LanguagePrimary { get; set; }
        
        // Address
        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? City { get; set; }
        public string? StateProvince { get; set; }
        public string? PostalCode { get; set; }
        public string? CountryCode { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        
        // Contact
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Fax { get; set; }
        
        // Operational
        public TimeSpan? OperationalHoursStart { get; set; }
        public TimeSpan? OperationalHoursEnd { get; set; }
        public bool? EmergencySupport24x7 { get; set; }
        public string? OperationalStatus { get; set; }
        
        // Settings
        public Dictionary<string, object>? BranchSettings { get; set; }
        public string? CurrencyCode { get; set; }
    }

    /// <summary>
    /// Request to update operational hours
    /// </summary>
    public class UpdateOperationalHoursRequest
    {
        public TimeSpan OperationalHoursStart { get; set; }
        public TimeSpan OperationalHoursEnd { get; set; }
        public bool EmergencySupport24x7 { get; set; }
    }

    /// <summary>
    /// Request to update operational status
    /// </summary>
    public class UpdateOperationalStatusRequest
    {
        public string OperationalStatus { get; set; } = string.Empty;
    }

    /// <summary>
    /// Filters for branch list
    /// </summary>
    public class BranchFilters
    {
        public Guid? TenantId { get; set; }
        public Guid? OrganizationId { get; set; }
        public string? Search { get; set; }
        public string? Region { get; set; }
        public string? Status { get; set; }
        public string? OperationalStatus { get; set; }
        public bool? EmergencySupport24x7 { get; set; }
        public string? SortBy { get; set; }
        public string? SortOrder { get; set; } = "asc";
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }

    /// <summary>
    /// Paginated branch list response
    /// </summary>
    public class BranchListResponse
    {
        public List<BranchDto> Branches { get; set; } = new List<BranchDto>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public Dictionary<string, int> StatusBreakdown { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> OperationalStatusBreakdown { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> RegionBreakdown { get; set; } = new Dictionary<string, int>();
    }

    /// <summary>
    /// Branch operation result
    /// </summary>
    public class BranchOperationResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public Guid? BranchId { get; set; }
        public BranchDto? Data { get; set; }
        public List<string>? Errors { get; set; }
    }

    /// <summary>
    /// Branch statistics
    /// </summary>
    public class BranchStatistics
    {
        public int TotalBranches { get; set; }
        public Dictionary<string, int> StatusBreakdown { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> OperationalStatusBreakdown { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> RegionBreakdown { get; set; } = new Dictionary<string, int>();
        public int TotalDepartments { get; set; }
        public int TotalStaff { get; set; }
        public int EmergencyBranchesCount { get; set; }
        public List<BranchUsageDto> TopBranchesByDepartments { get; set; } = new List<BranchUsageDto>();
        public List<BranchUsageDto> TopBranchesByStaff { get; set; } = new List<BranchUsageDto>();
    }

    /// <summary>
    /// Branch usage statistics
    /// </summary>
    public class BranchUsageDto
    {
        public Guid BranchId { get; set; }
        public string BranchName { get; set; } = string.Empty;
        public string? Region { get; set; }
        public int TotalDepartments { get; set; }
        public int TotalStaff { get; set; }
    }

    /// <summary>
    /// Branch location details
    /// </summary>
    public class BranchLocationDto
    {
        public Guid BranchId { get; set; }
        public string BranchName { get; set; } = string.Empty;
        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? City { get; set; }
        public string? StateProvince { get; set; }
        public string? PostalCode { get; set; }
        public string? CountryCode { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public double? DistanceKm { get; set; }
    }

    /// <summary>
    /// Branch operational info
    /// </summary>
    public class BranchOperationalInfoDto
    {
        public Guid BranchId { get; set; }
        public string BranchName { get; set; } = string.Empty;
        public TimeSpan? OperationalHoursStart { get; set; }
        public TimeSpan? OperationalHoursEnd { get; set; }
        public bool EmergencySupport24x7 { get; set; }
        public string OperationalStatus { get; set; } = string.Empty;
        public bool IsCurrentlyOperational { get; set; }
        public string? Timezone { get; set; }
    }

    /// <summary>
    /// Branch contact info
    /// </summary>
    public class BranchContactDto
    {
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Fax { get; set; }
        public string? EmergencyPhone { get; set; }
    }

    /// <summary>
    /// Branch validation result
    /// </summary>
    public class BranchValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public List<string> Warnings { get; set; } = new List<string>();
        public bool OrganizationLimitReached { get; set; }
    }

    /// <summary>
    /// Nearby branches request
    /// </summary>
    public class NearbyBranchesRequest
    {
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public double RadiusKm { get; set; } = 50;
        public int MaxResults { get; set; } = 10;
    }
}
