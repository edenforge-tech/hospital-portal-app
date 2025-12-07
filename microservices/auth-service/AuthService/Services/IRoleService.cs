using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AuthService.Models.Role;

namespace AuthService.Services
{
    /// <summary>
    /// Interface for Role Management Service
    /// Provides comprehensive role operations including CRUD, hierarchy, cloning, and bulk operations
    /// </summary>
    public interface IRoleService
    {
        // ================================================================================
        // BASIC CRUD OPERATIONS
        // ================================================================================

        /// <summary>
        /// Get all roles with filters and pagination
        /// </summary>
        Task<RoleListResponse> GetAllAsync(Guid tenantId, RoleFilters filters);

        /// <summary>
        /// Get role by ID with full details
        /// </summary>
        Task<RoleDetailsDto> GetByIdAsync(Guid tenantId, Guid roleId);

        /// <summary>
        /// Create new role
        /// </summary>
        Task<RoleOperationResult> CreateAsync(Guid tenantId, Guid userId, CreateRoleRequest request);

        /// <summary>
        /// Update existing role
        /// </summary>
        Task<RoleOperationResult> UpdateAsync(Guid tenantId, Guid userId, Guid roleId, UpdateRoleRequest request);

        /// <summary>
        /// Delete role (soft delete)
        /// </summary>
        Task<RoleOperationResult> DeleteAsync(Guid tenantId, Guid userId, Guid roleId);

        /// <summary>
        /// Activate/Deactivate role
        /// </summary>
        Task<RoleOperationResult> SetActiveStatusAsync(Guid tenantId, Guid userId, Guid roleId, bool isActive);

        // ================================================================================
        // HIERARCHY OPERATIONS
        // ================================================================================

        /// <summary>
        /// Get role hierarchy tree structure
        /// </summary>
        Task<List<RoleHierarchyDto>> GetHierarchyAsync(Guid tenantId);

        /// <summary>
        /// Get child roles of a parent role
        /// </summary>
        Task<List<RoleDto>> GetChildRolesAsync(Guid tenantId, Guid parentRoleId);

        /// <summary>
        /// Get role path from root to specified role
        /// </summary>
        Task<List<RoleDto>> GetRolePathAsync(Guid tenantId, Guid roleId);

        // ================================================================================
        // PERMISSION OPERATIONS
        // ================================================================================

        /// <summary>
        /// Get all permissions assigned to a role
        /// </summary>
        Task<List<RolePermissionDto>> GetRolePermissionsAsync(Guid tenantId, Guid roleId);

        /// <summary>
        /// Assign permissions to role
        /// </summary>
        Task<RoleOperationResult> AssignPermissionsAsync(Guid tenantId, Guid userId, AssignPermissionsToRoleRequest request);

        /// <summary>
        /// Remove permissions from role
        /// </summary>
        Task<RoleOperationResult> RemovePermissionsAsync(Guid tenantId, Guid userId, RemovePermissionsFromRoleRequest request);

        /// <summary>
        /// Replace all permissions in a role (removes old, adds new)
        /// </summary>
        Task<RoleOperationResult> ReplacePermissionsAsync(Guid tenantId, Guid userId, Guid roleId, List<Guid> permissionIds);

        // ================================================================================
        // USER OPERATIONS
        // ================================================================================

        /// <summary>
        /// Get all users assigned to a role
        /// </summary>
        Task<List<RoleUserDto>> GetRoleUsersAsync(Guid tenantId, Guid roleId);

        /// <summary>
        /// Assign users to role
        /// </summary>
        Task<BulkRoleOperationResult> AssignUsersAsync(Guid tenantId, Guid userId, AssignUsersToRoleRequest request);

        /// <summary>
        /// Remove users from role
        /// </summary>
        Task<BulkRoleOperationResult> RemoveUsersAsync(Guid tenantId, Guid userId, RemoveUsersFromRoleRequest request);

        // ================================================================================
        // ADVANCED OPERATIONS
        // ================================================================================

        /// <summary>
        /// Clone an existing role with optional permission and user copying
        /// </summary>
        Task<RoleOperationResult> CloneRoleAsync(Guid tenantId, Guid userId, CloneRoleRequest request);

        /// <summary>
        /// Bulk assign roles to multiple users
        /// </summary>
        Task<BulkRoleOperationResult> BulkAssignRolesAsync(Guid tenantId, Guid userId, BulkAssignRolesRequest request);

        /// <summary>
        /// Compare two roles and show permission differences
        /// </summary>
        Task<RoleComparisonResult> CompareRolesAsync(Guid tenantId, RoleComparisonRequest request);

        // ================================================================================
        // STATISTICS & ANALYTICS
        // ================================================================================

        /// <summary>
        /// Get role statistics and analytics
        /// </summary>
        Task<RoleStatistics> GetStatisticsAsync(Guid tenantId);

        /// <summary>
        /// Get roles by type
        /// </summary>
        Task<List<RoleDto>> GetRolesByTypeAsync(Guid tenantId, string roleType);

        /// <summary>
        /// Search roles by name, code, or description
        /// </summary>
        Task<List<RoleDto>> SearchRolesAsync(Guid tenantId, string searchTerm);
    }
}
