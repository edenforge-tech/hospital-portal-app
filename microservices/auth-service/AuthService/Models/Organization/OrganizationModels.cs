using System;
using System.Collections.Generic;

namespace AuthService.Models.Organization
{
    /// <summary>
    /// Organization DTO for list views
    /// </summary>
    public class OrganizationDto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
        public string? Type { get; set; }
        public string Status { get; set; } = "active";
        public Guid? ParentOrganizationId { get; set; }
        public string? ParentOrganizationName { get; set; }
        public int HierarchyLevel { get; set; }
        public int TotalBranches { get; set; }
        public int TotalUsers { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>
    /// Organization details with full information
    /// </summary>
    public class OrganizationDetailsDto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
        public string? Type { get; set; }
        public string? Description { get; set; }
        public string Status { get; set; } = "active";
        
        // Hierarchy
        public Guid? ParentOrganizationId { get; set; }
        public string? ParentOrganizationName { get; set; }
        public int HierarchyLevel { get; set; }
        public int ChildOrganizationsCount { get; set; }
        
        // Address
        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? City { get; set; }
        public string? StateProvince { get; set; }
        public string? PostalCode { get; set; }
        public string? CountryCode { get; set; }
        
        // Contact
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Website { get; set; }
        public string? PrimaryContactName { get; set; }
        public string? PrimaryContactEmail { get; set; }
        public string? PrimaryContactPhone { get; set; }
        public string? PrimaryContactAddress { get; set; }
        
        // Configuration
        public string? Timezone { get; set; }
        public string? LanguageCode { get; set; }
        public string? CurrencyCode { get; set; }
        
        // Operations
        public int TotalBranches { get; set; }
        public int TotalUsers { get; set; }
        public DateTime? OperationalSince { get; set; }
        public string? RegistrationNumber { get; set; }
        
        // Settings
        public Dictionary<string, object>? Settings { get; set; }
        public Dictionary<string, object>? BrandingConfig { get; set; }
        
        // Audit
        public DateTime CreatedAt { get; set; }
        public Guid? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedBy { get; set; }
    }

    /// <summary>
    /// Organization hierarchy tree node
    /// </summary>
    public class OrganizationHierarchyDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
        public string? Type { get; set; }
        public int HierarchyLevel { get; set; }
        public int TotalBranches { get; set; }
        public int TotalUsers { get; set; }
        public List<OrganizationHierarchyDto> Children { get; set; } = new List<OrganizationHierarchyDto>();
    }

    /// <summary>
    /// Request to create a new organization
    /// </summary>
    public class CreateOrganizationRequest
    {
        public Guid TenantId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
        public string? Type { get; set; }
        public string? Description { get; set; }
        public string Status { get; set; } = "active";
        
        // Hierarchy
        public Guid? ParentOrganizationId { get; set; }
        
        // Address
        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? City { get; set; }
        public string? StateProvince { get; set; }
        public string? PostalCode { get; set; }
        public string? CountryCode { get; set; }
        
        // Contact
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Website { get; set; }
        public string? PrimaryContactName { get; set; }
        public string? PrimaryContactEmail { get; set; }
        public string? PrimaryContactPhone { get; set; }
        public string? PrimaryContactAddress { get; set; }
        
        // Configuration
        public string? Timezone { get; set; }
        public string? LanguageCode { get; set; }
        public string? CurrencyCode { get; set; }
        
        // Operations
        public DateTime? OperationalSince { get; set; }
        public string? RegistrationNumber { get; set; }
        
        // Settings
        public Dictionary<string, object>? Settings { get; set; }
        public Dictionary<string, object>? BrandingConfig { get; set; }
    }

    /// <summary>
    /// Request to update organization
    /// </summary>
    public class UpdateOrganizationRequest
    {
        public string? Name { get; set; }
        public string? Type { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; }
        
        // Address
        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? City { get; set; }
        public string? StateProvince { get; set; }
        public string? PostalCode { get; set; }
        public string? CountryCode { get; set; }
        
        // Contact
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Website { get; set; }
        public string? PrimaryContactName { get; set; }
        public string? PrimaryContactEmail { get; set; }
        public string? PrimaryContactPhone { get; set; }
        public string? PrimaryContactAddress { get; set; }
        
        // Configuration
        public string? Timezone { get; set; }
        public string? LanguageCode { get; set; }
        public string? CurrencyCode { get; set; }
        
        // Operations
        public DateTime? OperationalSince { get; set; }
        public string? RegistrationNumber { get; set; }
        
        // Settings
        public Dictionary<string, object>? Settings { get; set; }
        public Dictionary<string, object>? BrandingConfig { get; set; }
    }

    /// <summary>
    /// Request to move organization to different parent
    /// </summary>
    public class MoveOrganizationRequest
    {
        public Guid? NewParentOrganizationId { get; set; }
    }

    /// <summary>
    /// Filters for organization list
    /// </summary>
    public class OrganizationFilters
    {
        public Guid? TenantId { get; set; }
        public string? Search { get; set; }
        public string? Type { get; set; }
        public string? Status { get; set; }
        public Guid? ParentOrganizationId { get; set; }
        public bool? RootOrganizationsOnly { get; set; }
        public string? SortBy { get; set; }
        public string? SortOrder { get; set; } = "asc";
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }

    /// <summary>
    /// Paginated organization list response
    /// </summary>
    public class OrganizationListResponse
    {
        public List<OrganizationDto> Organizations { get; set; } = new List<OrganizationDto>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public Dictionary<string, int> StatusBreakdown { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> TypeBreakdown { get; set; } = new Dictionary<string, int>();
    }

    /// <summary>
    /// Organization operation result
    /// </summary>
    public class OrganizationOperationResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public Guid? OrganizationId { get; set; }
        public OrganizationDto? Data { get; set; }
        public List<string>? Errors { get; set; }
    }

    /// <summary>
    /// Organization statistics
    /// </summary>
    public class OrganizationStatistics
    {
        public int TotalOrganizations { get; set; }
        public int RootOrganizations { get; set; }
        public int ChildOrganizations { get; set; }
        public int MaxHierarchyLevel { get; set; }
        public Dictionary<string, int> StatusBreakdown { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> TypeBreakdown { get; set; } = new Dictionary<string, int>();
        public int TotalBranches { get; set; }
        public int TotalUsers { get; set; }
        public List<OrganizationUsageDto> TopOrganizationsByBranches { get; set; } = new List<OrganizationUsageDto>();
        public List<OrganizationUsageDto> TopOrganizationsByUsers { get; set; } = new List<OrganizationUsageDto>();
    }

    /// <summary>
    /// Organization usage statistics
    /// </summary>
    public class OrganizationUsageDto
    {
        public Guid OrganizationId { get; set; }
        public string OrganizationName { get; set; } = string.Empty;
        public int TotalBranches { get; set; }
        public int TotalUsers { get; set; }
        public int ChildOrganizationsCount { get; set; }
    }

    /// <summary>
    /// Organization ancestry path
    /// </summary>
    public class OrganizationPathDto
    {
        public List<OrganizationPathNodeDto> Path { get; set; } = new List<OrganizationPathNodeDto>();
    }

    /// <summary>
    /// Organization path node
    /// </summary>
    public class OrganizationPathNodeDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
        public int HierarchyLevel { get; set; }
    }

    /// <summary>
    /// Organization validation result
    /// </summary>
    public class OrganizationValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public List<string> Warnings { get; set; } = new List<string>();
        public bool CircularReferenceDetected { get; set; }
    }
}
