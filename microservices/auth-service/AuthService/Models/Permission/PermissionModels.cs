using System;
using System.Collections.Generic;

namespace AuthService.Models.Permission
{
    // ================================================================================
    // PERMISSION DTOs - Comprehensive Permission Management Models
    // ================================================================================

    /// <summary>
    /// Basic permission information for list views
    /// </summary>
    public class PermissionDto
    {
        public Guid Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Module { get; set; }
        public string Resource { get; set; }
        public string ResourceType { get; set; } // Alias for compatibility
        public string Action { get; set; } // Create, Read, Update, Delete, Approve, Execute
        public string Scope { get; set; } // Global, Organization, Department, Branch, Self
        public string DataClassification { get; set; } // Public, Internal, Confidential, Restricted
        public bool IsActive { get; set; }
        public bool IsSystemPermission { get; set; }
        public bool DepartmentSpecific { get; set; }
        public int TotalRoles { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>
    /// Detailed permission information with relationships
    /// </summary>
    public class PermissionDetailsDto
    {
        public Guid Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Module { get; set; }
        public string Resource { get; set; }
        public string ResourceType { get; set; } // Alias for compatibility
        public string Action { get; set; }
        public string Scope { get; set; }
        public string DataClassification { get; set; }
        public bool IsActive { get; set; }
        public bool IsSystemPermission { get; set; }
        public bool IsCustom { get; set; }
        public bool IsDeprecated { get; set; }
        public bool DepartmentSpecific { get; set; }
        
        // Relationships
        public List<PermissionRoleDto> Roles { get; set; }
        public int TotalRoles { get; set; }
        public int TotalUsers { get; set; } // Count of users who have this permission via roles
        
        // Dependencies
        public List<string> Dependencies { get; set; } // Other permissions this depends on
        public List<string> ConflictsWith { get; set; } // Permissions that conflict with this
        
        // Audit
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string UpdatedBy { get; set; }
    }

    /// <summary>
    /// Role information within a permission
    /// </summary>
    public class PermissionRoleDto
    {
        public Guid RoleId { get; set; }
        public string RoleName { get; set; }
        public string RoleCode { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime AssignedAt { get; set; }
        public DateTime? ValidFrom { get; set; }
        public DateTime? ValidUntil { get; set; }
        public string ConditionType { get; set; }
        public string Status { get; set; }
    }

    // ================================================================================
    // PERMISSION MATRIX DTOs
    // ================================================================================

    /// <summary>
    /// Permission matrix for visualization
    /// </summary>
    public class PermissionMatrixDto
    {
        public List<string> Resources { get; set; } // Rows: Users, Departments, etc.
        public List<string> Actions { get; set; } // Columns: Create, Read, Update, Delete, etc.
        public List<PermissionMatrixCellDto> Cells { get; set; }
        public Dictionary<string, ModulePermissionsDto> ModuleGroups { get; set; }
        public int TotalPermissions { get; set; }
        public int TotalPossibleCombinations { get; set; }
    }

    /// <summary>
    /// Individual cell in permission matrix
    /// </summary>
    public class PermissionMatrixCellDto
    {
        public string Resource { get; set; }
        public string Action { get; set; }
        public Guid? PermissionId { get; set; }
        public string PermissionCode { get; set; }
        public string PermissionName { get; set; }
        public bool Exists { get; set; }
        public bool IsSystemPermission { get; set; }
        public int AssignedToRoles { get; set; }
    }

    /// <summary>
    /// Module-grouped permissions for matrix view
    /// </summary>
    public class ModulePermissionsDto
    {
        public string Module { get; set; } // Alias
        public string ModuleName { get; set; }
        public List<PermissionDto> Permissions { get; set; }
        public int TotalPermissions { get; set; }
        public int ActivePermissions { get; set; }
    }

    /// <summary>
    /// Role permission matrix - shows all permissions for a role
    /// </summary>
    public class RolePermissionMatrixDto
    {
        public Guid RoleId { get; set; }
        public string RoleName { get; set; }
        public int ActivePermissions { get; set; } // Added
        public List<ModulePermissionsDto> ModulePermissions { get; set; }
        public int TotalPermissions { get; set; }
        public DateTime GeneratedAt { get; set; }
    }

    // ================================================================================
    // REQUEST DTOs - Permission Operations
    // ================================================================================

    /// <summary>
    /// Create new permission request
    /// </summary>
    public class CreatePermissionRequest
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Module { get; set; }
        public string Resource { get; set; }
        public string ResourceType { get; set; } // Alias for Resource
        public string Action { get; set; }
        public string Scope { get; set; } = "global";
        public string DataClassification { get; set; } = "internal";
        public bool DepartmentSpecific { get; set; } = false;
        public bool IsCustom { get; set; } = true;
        public List<string> Dependencies { get; set; }
        public List<string> ConflictsWith { get; set; }
    }

    /// <summary>
    /// Update permission request
    /// </summary>
    public class UpdatePermissionRequest
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string Scope { get; set; }
        public string DataClassification { get; set; }
        public bool? IsActive { get; set; }
        public bool? DepartmentSpecific { get; set; }
        public List<string> Dependencies { get; set; }
        public List<string> ConflictsWith { get; set; }
    }

    /// <summary>
    /// Bulk create permissions request
    /// </summary>
    public class BulkCreatePermissionsRequest
    {
        public string Module { get; set; }
        public List<string> Resources { get; set; }
        public List<string> Actions { get; set; }
        public string Scope { get; set; } = "global";
        public string DataClassification { get; set; } = "internal";
        public bool DepartmentSpecific { get; set; } = false;
        public bool AutoGenerateCode { get; set; } = true;
        public string CodePattern { get; set; } = "{MODULE}.{RESOURCE}.{ACTION}";
    }

    /// <summary>
    /// Check user permission request
    /// </summary>
    public class CheckPermissionRequest
    {
        public Guid UserId { get; set; }
        public string PermissionCode { get; set; }
        public string Resource { get; set; }
        public Guid? ResourceId { get; set; }
        public Guid? DepartmentId { get; set; }
        public Guid? BranchId { get; set; }
    }

    /// <summary>
    /// Get user permissions request
    /// </summary>
    public class GetUserPermissionsRequest
    {
        public Guid UserId { get; set; }
        public string Module { get; set; }
        public string Resource { get; set; }
        public string ResourceType { get; set; } // Alias for Resource
        public bool IncludeInherited { get; set; } = true;
        public bool IncludeExpired { get; set; } = false;
    }

    // ================================================================================
    // FILTER DTOs - Permission Queries
    // ================================================================================

    /// <summary>
    /// Permission filters for search and list operations
    /// </summary>
    public class PermissionFilters
    {
        public string Search { get; set; } // Search in name, code, description
        public string Module { get; set; }
        public string Resource { get; set; }
        public string Action { get; set; }
        public string Scope { get; set; }
        public string DataClassification { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsSystemPermission { get; set; }
        public bool? DepartmentSpecific { get; set; }
        public bool? IsCustom { get; set; }
        public string SortBy { get; set; } = "module"; // module, resource, action, name
        public string SortOrder { get; set; } = "asc";
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }

    // ================================================================================
    // RESPONSE DTOs - Permission Operations
    // ================================================================================

    /// <summary>
    /// Paginated permission list response
    /// </summary>
    public class PermissionListResponse
    {
        public List<PermissionDto> Permissions { get; set; }
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public bool HasPreviousPage { get; set; }
        public bool HasNextPage { get; set; }
        public Dictionary<string, int> ModuleBreakdown { get; set; }
        public Dictionary<string, int> ScopeBreakdown { get; set; }
    }

    /// <summary>
    /// Permission operation result
    /// </summary>
    public class PermissionOperationResult
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public Guid? PermissionId { get; set; }
        public List<string> Errors { get; set; }
        public Dictionary<string, object> Data { get; set; }
    }

    /// <summary>
    /// Bulk permission operation result
    /// </summary>
    public class BulkPermissionOperationResult
    {
        public bool Success { get; set; }
        public int TotalProcessed { get; set; }
        public int SuccessCount { get; set; }
        public int FailureCount { get; set; }
        public List<BulkPermissionItem> Results { get; set; }
        public string Summary { get; set; }
    }

    /// <summary>
    /// Individual bulk operation item result
    /// </summary>
    public class BulkPermissionItem
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public bool Success { get; set; }
        public string Message { get; set; }
        public Guid? PermissionId { get; set; }
    }

    /// <summary>
    /// Permission check result
    /// </summary>
    public class PermissionCheckResult
    {
        public bool HasPermission { get; set; }
        public string PermissionCode { get; set; }
        public string Reason { get; set; }
        public List<string> GrantedBy { get; set; } // Role names that grant this permission
        public string Scope { get; set; }
        public Dictionary<string, object> Context { get; set; }
    }

    /// <summary>
    /// User permissions response
    /// </summary>
    public class UserPermissionsResponse
    {
        public Guid UserId { get; set; }
        public string UserName { get; set; }
        public List<UserPermissionDto> Permissions { get; set; }
        public Dictionary<string, List<UserPermissionDto>> ModulePermissions { get; set; }
        public int TotalPermissions { get; set; }
        public DateTime RetrievedAt { get; set; }
    }

    /// <summary>
    /// User permission detail
    /// </summary>
    public class UserPermissionDto
    {
        public Guid PermissionId { get; set; }
        public string Code { get; set; } // Alias for PermissionCode
        public string Name { get; set; } // Alias for PermissionName
        public string PermissionCode { get; set; }
        public string PermissionName { get; set; }
        public string Module { get; set; }
        public string Resource { get; set; }
        public string ResourceType { get; set; } // Alias for compatibility
        public string Action { get; set; }
        public string Scope { get; set; }
        public string GrantedByRole { get; set; }
        public DateTime? ValidFrom { get; set; }
        public DateTime? ValidUntil { get; set; }
        public bool IsExpired { get; set; }
    }

    // ================================================================================
    // STATISTICS DTOs - Permission Analytics
    // ================================================================================

    /// <summary>
    /// Permission statistics and analytics
    /// </summary>
    public class PermissionStatistics
    {
        public int TotalPermissions { get; set; }
        public int ActivePermissions { get; set; }
        public int InactivePermissions { get; set; }
        public int SystemPermissions { get; set; }
        public int CustomPermissions { get; set; }
        public int DepartmentSpecificPermissions { get; set; }
        
        public Dictionary<string, int> ModuleBreakdown { get; set; }
        public Dictionary<string, int> ScopeBreakdown { get; set; }
        public Dictionary<string, int> ActionBreakdown { get; set; }
        public Dictionary<string, int> ClassificationBreakdown { get; set; } // Alias
        public Dictionary<string, int> DataClassificationBreakdown { get; set; }
        
        public List<PermissionUsageStatDto> MostUsedPermissions { get; set; }
        public List<PermissionUsageStatDto> LeastUsedPermissions { get; set; }
        public List<PermissionUsageStatDto> UnusedPermissions { get; set; }
    }

    /// <summary>
    /// Permission usage statistics
    /// </summary>
    public class PermissionUsageStatDto
    {
        public Guid PermissionId { get; set; }
        public string Code { get; set; } // Alias
        public string Name { get; set; } // Alias
        public string PermissionCode { get; set; }
        public string PermissionName { get; set; }
        public string Module { get; set; }
        public int AssignedToRoles { get; set; }
        public int TotalUsers { get; set; }
        public double UsagePercentage { get; set; }
    }

    // ================================================================================
    // RESOURCE PERMISSION DTOs
    // ================================================================================

    /// <summary>
    /// Resource-level permission definition
    /// </summary>
    public class ResourcePermissionDto
    {
        public string ResourceType { get; set; } // Users, Departments, Patients, Appointments, etc.
        public List<string> AvailableActions { get; set; }
        public List<string> AvailableScopes { get; set; }
        public List<PermissionDto> Permissions { get; set; }
        public int TotalPermissions { get; set; }
    }

    /// <summary>
    /// Resource permission template
    /// </summary>
    public class ResourcePermissionTemplateDto
    {
        public string ResourceType { get; set; }
        public string TemplateName { get; set; }
        public List<string> StandardActions { get; set; } // [Create, Read, Update, Delete, Approve]
        public List<string> CustomActions { get; set; }
        public Dictionary<string, string> ActionDescriptions { get; set; }
    }

    // ================================================================================
    // VALIDATION DTOs
    // ================================================================================

    /// <summary>
    /// Permission conflict check
    /// </summary>
    public class PermissionConflictCheckDto
    {
        public Guid PermissionId { get; set; }
        public string Code { get; set; } // Alias
        public string PermissionCode { get; set; }
        public bool HasConflicts { get; set; }
        public List<PermissionConflictDto> Conflicts { get; set; }
    }

    /// <summary>
    /// Permission conflict detail
    /// </summary>
    public class PermissionConflictDto
    {
        public Guid ConflictingPermissionId { get; set; }
        public string ConflictingPermissionCode { get; set; }
        public string ConflictingPermissionName { get; set; } // Added for compatibility
        public string Reason { get; set; } // Alias
        public string ConflictReason { get; set; }
        public string Severity { get; set; } // Low, Medium, High, Critical
    }

    // ================================================================================
    // EXPORT DTOs
    // ================================================================================

    /// <summary>
    /// Export permissions request
    /// </summary>
    public class ExportPermissionsRequest
    {
        public string Format { get; set; } = "csv"; // csv, json, excel
        public PermissionFilters Filters { get; set; }
        public bool IncludeRoleAssignments { get; set; } = true;
        public bool IncludeStatistics { get; set; } = false;
    }

    /// <summary>
    /// Permission report
    /// </summary>
    public class PermissionReportDto
    {
        public string ReportTitle { get; set; }
        public DateTime GeneratedAt { get; set; }
        public string GeneratedBy { get; set; }
        public PermissionStatistics Statistics { get; set; }
        public List<PermissionDto> Permissions { get; set; }
        public Dictionary<string, List<PermissionDto>> GroupedByModule { get; set; }
    }
}
