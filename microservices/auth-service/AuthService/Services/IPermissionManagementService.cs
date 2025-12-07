using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AuthService.Models.Permission;

namespace AuthService.Services
{
    /// <summary>
    /// Interface for Comprehensive Permission Management Service
    /// Provides advanced permission operations including CRUD, matrix generation, and analytics
    /// </summary>
    public interface IPermissionManagementService
    {
        // ================================================================================
        // BASIC CRUD OPERATIONS
        // ================================================================================

        /// <summary>
        /// Get all permissions with filters and pagination
        /// </summary>
        Task<PermissionListResponse> GetAllAsync(Guid tenantId, PermissionFilters filters);

        /// <summary>
        /// Get permission by ID with full details
        /// </summary>
        Task<PermissionDetailsDto> GetByIdAsync(Guid tenantId, Guid permissionId);

        /// <summary>
        /// Get permission by code
        /// </summary>
        Task<PermissionDetailsDto> GetByCodeAsync(Guid tenantId, string permissionCode);

        /// <summary>
        /// Create new permission
        /// </summary>
        Task<PermissionOperationResult> CreateAsync(Guid tenantId, Guid userId, CreatePermissionRequest request);

        /// <summary>
        /// Update existing permission
        /// </summary>
        Task<PermissionOperationResult> UpdateAsync(Guid tenantId, Guid userId, Guid permissionId, UpdatePermissionRequest request);

        /// <summary>
        /// Delete permission (soft delete)
        /// </summary>
        Task<PermissionOperationResult> DeleteAsync(Guid tenantId, Guid userId, Guid permissionId);

        /// <summary>
        /// Activate/Deactivate permission
        /// </summary>
        Task<PermissionOperationResult> SetActiveStatusAsync(Guid tenantId, Guid userId, Guid permissionId, bool isActive);

        // ================================================================================
        // BULK OPERATIONS
        // ================================================================================

        /// <summary>
        /// Bulk create permissions for a module
        /// Creates permissions for multiple resources and actions
        /// </summary>
        Task<BulkPermissionOperationResult> BulkCreateAsync(Guid tenantId, Guid userId, BulkCreatePermissionsRequest request);

        /// <summary>
        /// Bulk activate/deactivate permissions
        /// </summary>
        Task<BulkPermissionOperationResult> BulkSetActiveStatusAsync(Guid tenantId, Guid userId, List<Guid> permissionIds, bool isActive);

        // ================================================================================
        // PERMISSION MATRIX OPERATIONS
        // ================================================================================

        /// <summary>
        /// Get permission matrix for all permissions
        /// Shows resources (rows) vs actions (columns)
        /// </summary>
        Task<PermissionMatrixDto> GetPermissionMatrixAsync(Guid tenantId, string module = null);

        /// <summary>
        /// Get role permission matrix
        /// Shows all permissions assigned to a specific role
        /// </summary>
        Task<RolePermissionMatrixDto> GetRolePermissionMatrixAsync(Guid tenantId, Guid roleId);

        /// <summary>
        /// Get permissions grouped by module
        /// </summary>
        Task<Dictionary<string, ModulePermissionsDto>> GetPermissionsByModuleAsync(Guid tenantId);

        // ================================================================================
        // RESOURCE-BASED OPERATIONS
        // ================================================================================

        /// <summary>
        /// Get all permissions for a specific resource type
        /// </summary>
        Task<ResourcePermissionDto> GetResourcePermissionsAsync(Guid tenantId, string resourceType);

        /// <summary>
        /// Get available resource types and their permission templates
        /// </summary>
        Task<List<ResourcePermissionTemplateDto>> GetResourceTemplatesAsync(Guid tenantId);

        /// <summary>
        /// Get permissions by module
        /// </summary>
        Task<List<PermissionDto>> GetByModuleAsync(Guid tenantId, string module);

        /// <summary>
        /// Get permissions by resource
        /// </summary>
        Task<List<PermissionDto>> GetByResourceAsync(Guid tenantId, string resource);

        // ================================================================================
        // ACCESS CONTROL OPERATIONS
        // ================================================================================

        /// <summary>
        /// Check if user has a specific permission
        /// </summary>
        Task<PermissionCheckResult> CheckPermissionAsync(Guid tenantId, CheckPermissionRequest request);

        /// <summary>
        /// Get all permissions for a user (from all assigned roles)
        /// </summary>
        Task<UserPermissionsResponse> GetUserPermissionsAsync(Guid tenantId, GetUserPermissionsRequest request);

        /// <summary>
        /// Check if user has multiple permissions (batch check)
        /// </summary>
        Task<Dictionary<string, PermissionCheckResult>> CheckMultiplePermissionsAsync(Guid tenantId, Guid userId, List<string> permissionCodes);

        // ================================================================================
        // VALIDATION & CONFLICT DETECTION
        // ================================================================================

        /// <summary>
        /// Check for permission conflicts
        /// </summary>
        Task<PermissionConflictCheckDto> CheckConflictsAsync(Guid tenantId, Guid permissionId);

        /// <summary>
        /// Validate permission dependencies
        /// Ensures all dependent permissions are available
        /// </summary>
        Task<PermissionOperationResult> ValidateDependenciesAsync(Guid tenantId, Guid permissionId);

        // ================================================================================
        // STATISTICS & ANALYTICS
        // ================================================================================

        /// <summary>
        /// Get permission statistics and analytics
        /// </summary>
        Task<PermissionStatistics> GetStatisticsAsync(Guid tenantId);

        /// <summary>
        /// Search permissions by name, code, or description
        /// </summary>
        Task<List<PermissionDto>> SearchPermissionsAsync(Guid tenantId, string searchTerm);

        /// <summary>
        /// Get unused permissions (not assigned to any role)
        /// </summary>
        Task<List<PermissionDto>> GetUnusedPermissionsAsync(Guid tenantId);

        // ================================================================================
        // EXPORT OPERATIONS
        // ================================================================================

        /// <summary>
        /// Generate permission report
        /// </summary>
        Task<PermissionReportDto> GenerateReportAsync(Guid tenantId, PermissionFilters filters);

        /// <summary>
        /// Export permissions to specified format
        /// </summary>
        Task<byte[]> ExportPermissionsAsync(Guid tenantId, ExportPermissionsRequest request);
    }
}
