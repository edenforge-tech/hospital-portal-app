using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AuthService.Models.Organization;

namespace AuthService.Services
{
    /// <summary>
    /// Service interface for organization management with hierarchy support
    /// </summary>
    public interface IOrganizationService
    {
        /// <summary>
        /// Get all organizations with filters and pagination
        /// </summary>
        Task<OrganizationListResponse> GetAllOrganizationsAsync(OrganizationFilters filters);

        /// <summary>
        /// Get organization by ID
        /// </summary>
        Task<OrganizationDetailsDto?> GetOrganizationByIdAsync(Guid organizationId);

        /// <summary>
        /// Get organization by unique code within tenant
        /// </summary>
        Task<OrganizationDetailsDto?> GetOrganizationByCodeAsync(Guid tenantId, string code);

        /// <summary>
        /// Create a new organization
        /// </summary>
        Task<OrganizationOperationResult> CreateOrganizationAsync(CreateOrganizationRequest request, Guid createdBy);

        /// <summary>
        /// Update organization information
        /// </summary>
        Task<OrganizationOperationResult> UpdateOrganizationAsync(Guid organizationId, UpdateOrganizationRequest request, Guid updatedBy);

        /// <summary>
        /// Delete organization (soft delete if has children, hard delete otherwise)
        /// </summary>
        Task<OrganizationOperationResult> DeleteOrganizationAsync(Guid organizationId);

        /// <summary>
        /// Move organization to a different parent
        /// </summary>
        Task<OrganizationOperationResult> MoveOrganizationAsync(Guid organizationId, MoveOrganizationRequest request, Guid updatedBy);

        /// <summary>
        /// Get organization hierarchy tree (from root or specific node)
        /// </summary>
        Task<OrganizationHierarchyDto?> GetHierarchyAsync(Guid tenantId, Guid? rootOrganizationId = null);

        /// <summary>
        /// Get child organizations for a parent
        /// </summary>
        Task<List<OrganizationDto>> GetChildrenAsync(Guid organizationId);

        /// <summary>
        /// Get parent organization
        /// </summary>
        Task<OrganizationDto?> GetParentAsync(Guid organizationId);

        /// <summary>
        /// Get ancestry path from root to organization
        /// </summary>
        Task<OrganizationPathDto> GetPathAsync(Guid organizationId);

        /// <summary>
        /// Get branch count for organization
        /// </summary>
        Task<int> GetBranchCountAsync(Guid organizationId);

        /// <summary>
        /// Get user count for organization
        /// </summary>
        Task<int> GetUserCountAsync(Guid organizationId);

        /// <summary>
        /// Get organization statistics
        /// </summary>
        Task<OrganizationStatistics> GetStatisticsAsync(Guid? tenantId = null);

        /// <summary>
        /// Search organizations by name or code
        /// </summary>
        Task<OrganizationListResponse> SearchOrganizationsAsync(string query, Guid? tenantId = null, int pageNumber = 1, int pageSize = 50);

        /// <summary>
        /// Get organizations by type
        /// </summary>
        Task<List<OrganizationDto>> GetByTypeAsync(Guid tenantId, string type);

        /// <summary>
        /// Validate organization data
        /// </summary>
        Task<OrganizationValidationResult> ValidateOrganizationAsync(CreateOrganizationRequest request);
    }
}
