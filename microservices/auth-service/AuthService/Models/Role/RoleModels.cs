using System;
using System.Collections.Generic;

namespace AuthService.Models.Role
{
    // ================================================================================
    // ROLE DTOs - Comprehensive Role Management Models
    // ================================================================================

    /// <summary>
    /// Basic role information for list views
    /// </summary>
    public class RoleDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string RoleCode { get; set; }
        public string RoleType { get; set; } // System, Custom, Department, Project
        public int Priority { get; set; }
        public bool IsActive { get; set; }
        public bool IsSystemRole { get; set; }
        public int TotalUsers { get; set; }
        public int TotalPermissions { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; }
    }

    /// <summary>
    /// Detailed role information with relationships
    /// </summary>
    public class RoleDetailsDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string RoleCode { get; set; }
        public string RoleType { get; set; }
        public int Priority { get; set; }
        public bool IsActive { get; set; }
        public bool IsSystemRole { get; set; }
        public bool IsDepartmentSpecific { get; set; }
        public Guid? DepartmentId { get; set; }
        public string DepartmentName { get; set; }
        
        // Hierarchy
        public Guid? ParentRoleId { get; set; }
        public string ParentRoleName { get; set; }
        public List<RoleDto> ChildRoles { get; set; }
        
        // Permissions
        public List<RolePermissionDto> Permissions { get; set; }
        
        // Users
        public int TotalUsers { get; set; }
        public List<RoleUserDto> Users { get; set; }
        
        // Audit
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string UpdatedBy { get; set; }
        
        // Metadata
        public Dictionary<string, object> Metadata { get; set; }
        public string Settings { get; set; } // JSON string
    }

    /// <summary>
    /// Permission information within a role
    /// </summary>
    public class RolePermissionDto
    {
        public Guid PermissionId { get; set; }
        public string PermissionCode { get; set; }
        public string PermissionName { get; set; }
        public string Module { get; set; }
        public string Resource { get; set; }
        public string Action { get; set; } // Create, Read, Update, Delete, Approve
        public string Scope { get; set; } // Global, Organization, Department, Self
        public DateTime AssignedAt { get; set; }
        public DateTime? ValidFrom { get; set; }
        public DateTime? ValidUntil { get; set; }
        public string Status { get; set; }
    }

    /// <summary>
    /// User information within a role
    /// </summary>
    public class RoleUserDto
    {
        public Guid UserId { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
        public string Department { get; set; }
        public DateTime AssignedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public bool IsActive { get; set; }
    }

    /// <summary>
    /// Role hierarchy tree structure
    /// </summary>
    public class RoleHierarchyDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string RoleCode { get; set; }
        public string RoleType { get; set; }
        public int Priority { get; set; }
        public int TotalUsers { get; set; }
        public int TotalPermissions { get; set; }
        public Guid? ParentRoleId { get; set; }
        public int Level { get; set; }
        public List<RoleHierarchyDto> Children { get; set; }
    }

    // ================================================================================
    // REQUEST DTOs - Role Operations
    // ================================================================================

    /// <summary>
    /// Create new role request
    /// </summary>
    public class CreateRoleRequest
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string RoleCode { get; set; }
        public string RoleType { get; set; } // System, Custom, Department, Project
        public int Priority { get; set; }
        public Guid? ParentRoleId { get; set; }
        public bool IsDepartmentSpecific { get; set; }
        public Guid? DepartmentId { get; set; }
        public List<Guid> PermissionIds { get; set; }
        public Dictionary<string, object> Metadata { get; set; }
        public string Settings { get; set; }
    }

    /// <summary>
    /// Update role request
    /// </summary>
    public class UpdateRoleRequest
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public int? Priority { get; set; }
        public Guid? ParentRoleId { get; set; }
        public bool? IsActive { get; set; }
        public Dictionary<string, object> Metadata { get; set; }
        public string Settings { get; set; }
    }

    /// <summary>
    /// Clone role request
    /// </summary>
    public class CloneRoleRequest
    {
        public Guid SourceRoleId { get; set; }
        public string NewRoleName { get; set; }
        public string NewRoleCode { get; set; }
        public string Description { get; set; }
        public bool ClonePermissions { get; set; } // Default true
        public bool CloneUsers { get; set; } // Default false
        public bool CloneHierarchy { get; set; } // Default false
        public Dictionary<string, object> Metadata { get; set; }
    }

    /// <summary>
    /// Bulk assign roles to users request
    /// </summary>
    public class BulkAssignRolesRequest
    {
        public List<Guid> UserIds { get; set; }
        public List<Guid> RoleIds { get; set; }
        public Guid? BranchId { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public string Reason { get; set; }
    }

    /// <summary>
    /// Assign permissions to role request
    /// </summary>
    public class AssignPermissionsToRoleRequest
    {
        public Guid RoleId { get; set; }
        public List<Guid> PermissionIds { get; set; }
        public DateTime? ValidFrom { get; set; }
        public DateTime? ValidUntil { get; set; }
        public string ConditionType { get; set; } // TimeBasedAccess, LocationBased, DeviceBased
        public string ConditionValue { get; set; } // JSON string
    }

    /// <summary>
    /// Remove permissions from role request
    /// </summary>
    public class RemovePermissionsFromRoleRequest
    {
        public Guid RoleId { get; set; }
        public List<Guid> PermissionIds { get; set; }
    }

    /// <summary>
    /// Assign users to role request
    /// </summary>
    public class AssignUsersToRoleRequest
    {
        public Guid RoleId { get; set; }
        public List<Guid> UserIds { get; set; }
        public Guid? BranchId { get; set; }
        public DateTime? ExpiresAt { get; set; }
    }

    /// <summary>
    /// Remove users from role request
    /// </summary>
    public class RemoveUsersFromRoleRequest
    {
        public Guid RoleId { get; set; }
        public List<Guid> UserIds { get; set; }
    }

    // ================================================================================
    // FILTER DTOs - Role Queries
    // ================================================================================

    /// <summary>
    /// Role filters for search and list operations
    /// </summary>
    public class RoleFilters
    {
        public string Search { get; set; } // Search in name, code, description
        public string RoleType { get; set; } // System, Custom, Department, Project
        public bool? IsActive { get; set; }
        public bool? IsSystemRole { get; set; }
        public Guid? ParentRoleId { get; set; }
        public Guid? DepartmentId { get; set; }
        public int? MinPriority { get; set; }
        public int? MaxPriority { get; set; }
        public string SortBy { get; set; } // name, priority, createdAt, totalUsers
        public string SortOrder { get; set; } // asc, desc
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    // ================================================================================
    // RESPONSE DTOs - Role Operations
    // ================================================================================

    /// <summary>
    /// Paginated role list response
    /// </summary>
    public class RoleListResponse
    {
        public List<RoleDto> Roles { get; set; }
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public bool HasPreviousPage { get; set; }
        public bool HasNextPage { get; set; }
    }

    /// <summary>
    /// Role operation result
    /// </summary>
    public class RoleOperationResult
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public Guid? RoleId { get; set; }
        public List<string> Errors { get; set; }
        public Dictionary<string, object> Data { get; set; }
    }

    /// <summary>
    /// Bulk operation result
    /// </summary>
    public class BulkRoleOperationResult
    {
        public bool Success { get; set; }
        public int TotalProcessed { get; set; }
        public int SuccessCount { get; set; }
        public int FailureCount { get; set; }
        public List<BulkOperationItem> Results { get; set; }
        public string Summary { get; set; }
    }

    /// <summary>
    /// Individual bulk operation item result
    /// </summary>
    public class BulkOperationItem
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public bool Success { get; set; }
        public string Message { get; set; }
        public List<string> Errors { get; set; }
    }

    // ================================================================================
    // STATISTICS DTOs - Role Analytics
    // ================================================================================

    /// <summary>
    /// Role statistics and analytics
    /// </summary>
    public class RoleStatistics
    {
        public int TotalRoles { get; set; }
        public int ActiveRoles { get; set; }
        public int InactiveRoles { get; set; }
        public int SystemRoles { get; set; }
        public int CustomRoles { get; set; }
        public int DepartmentRoles { get; set; }
        public int ProjectRoles { get; set; }
        
        public RoleTypeBreakdown TypeBreakdown { get; set; }
        public List<RoleUsageStatDto> TopRolesByUsers { get; set; }
        public List<RolePermissionStatDto> RolesWithMostPermissions { get; set; }
        public List<RoleActivityStatDto> RecentRoleActivities { get; set; }
    }

    public class RoleTypeBreakdown
    {
        public int System { get; set; }
        public int Custom { get; set; }
        public int Department { get; set; }
        public int Project { get; set; }
    }

    public class RoleUsageStatDto
    {
        public Guid RoleId { get; set; }
        public string RoleName { get; set; }
        public int UserCount { get; set; }
        public double UsagePercentage { get; set; }
    }

    public class RolePermissionStatDto
    {
        public Guid RoleId { get; set; }
        public string RoleName { get; set; }
        public int PermissionCount { get; set; }
    }

    public class RoleActivityStatDto
    {
        public string ActivityType { get; set; } // Created, Modified, Assigned, Deleted
        public string RoleName { get; set; }
        public string UserName { get; set; }
        public DateTime Timestamp { get; set; }
    }

    // ================================================================================
    // COMPARISON DTOs - Role Comparison
    // ================================================================================

    /// <summary>
    /// Role comparison request
    /// </summary>
    public class RoleComparisonRequest
    {
        public Guid Role1Id { get; set; }
        public Guid Role2Id { get; set; }
    }

    /// <summary>
    /// Role comparison result
    /// </summary>
    public class RoleComparisonResult
    {
        public RoleDto Role1 { get; set; }
        public RoleDto Role2 { get; set; }
        
        public List<PermissionComparisonDto> PermissionComparison { get; set; }
        public int SharedPermissions { get; set; }
        public int UniqueToRole1 { get; set; }
        public int UniqueToRole2 { get; set; }
        
        public ComparisonSummary Summary { get; set; }
    }

    public class PermissionComparisonDto
    {
        public Guid PermissionId { get; set; }
        public string PermissionName { get; set; }
        public bool InRole1 { get; set; }
        public bool InRole2 { get; set; }
    }

    public class ComparisonSummary
    {
        public double SimilarityPercentage { get; set; }
        public string Recommendation { get; set; }
    }
}
