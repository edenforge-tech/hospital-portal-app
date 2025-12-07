using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AuthService.Models.Branch;

namespace AuthService.Services
{
    /// <summary>
    /// Service interface for branch management with operational configuration
    /// </summary>
    public interface IBranchService
    {
        /// <summary>
        /// Get all branches with filters and pagination
        /// </summary>
        Task<BranchListResponse> GetAllBranchesAsync(BranchFilters filters);

        /// <summary>
        /// Get branch by ID
        /// </summary>
        Task<BranchDetailsDto?> GetBranchByIdAsync(Guid branchId);

        /// <summary>
        /// Get branch by unique code within tenant
        /// </summary>
        Task<BranchDetailsDto?> GetBranchByCodeAsync(Guid tenantId, string code);

        /// <summary>
        /// Create a new branch
        /// </summary>
        Task<BranchOperationResult> CreateBranchAsync(CreateBranchRequest request, Guid createdBy);

        /// <summary>
        /// Update branch information
        /// </summary>
        Task<BranchOperationResult> UpdateBranchAsync(Guid branchId, UpdateBranchRequest request, Guid updatedBy);

        /// <summary>
        /// Delete branch
        /// </summary>
        Task<BranchOperationResult> DeleteBranchAsync(Guid branchId);

        /// <summary>
        /// Update branch status
        /// </summary>
        Task<BranchOperationResult> UpdateBranchStatusAsync(Guid branchId, string status, Guid updatedBy);

        /// <summary>
        /// Update operational hours
        /// </summary>
        Task<BranchOperationResult> UpdateOperationalHoursAsync(Guid branchId, UpdateOperationalHoursRequest request, Guid updatedBy);

        /// <summary>
        /// Update operational status (operational, under_maintenance, closed, etc.)
        /// </summary>
        Task<BranchOperationResult> UpdateOperationalStatusAsync(Guid branchId, string operationalStatus, Guid updatedBy);

        /// <summary>
        /// Get operational information for a branch
        /// </summary>
        Task<BranchOperationalInfoDto> GetOperationalInfoAsync(Guid branchId);

        /// <summary>
        /// Check if branch is currently operational based on hours and status
        /// </summary>
        Task<bool> IsCurrentlyOperationalAsync(Guid branchId);

        /// <summary>
        /// Get branches by region
        /// </summary>
        Task<List<BranchDto>> GetByRegionAsync(Guid tenantId, string region);

        /// <summary>
        /// Get nearby branches by latitude/longitude
        /// </summary>
        Task<List<BranchLocationDto>> GetNearbyBranchesAsync(NearbyBranchesRequest request);

        /// <summary>
        /// Get department count for branch
        /// </summary>
        Task<int> GetDepartmentCountAsync(Guid branchId);

        /// <summary>
        /// Get staff count for branch
        /// </summary>
        Task<int> GetStaffCountAsync(Guid branchId);

        /// <summary>
        /// Get branch statistics
        /// </summary>
        Task<BranchStatistics> GetStatisticsAsync(Guid? tenantId = null, Guid? organizationId = null);

        /// <summary>
        /// Search branches by name or code
        /// </summary>
        Task<BranchListResponse> SearchBranchesAsync(string query, Guid? tenantId = null, Guid? organizationId = null, int pageNumber = 1, int pageSize = 50);

        /// <summary>
        /// Validate branch data
        /// </summary>
        Task<BranchValidationResult> ValidateBranchAsync(CreateBranchRequest request);
    }
}
