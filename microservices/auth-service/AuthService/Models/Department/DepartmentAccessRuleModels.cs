namespace AuthService.Models.Department;

/// <summary>
/// Department Access Rule - Configurable validation rules for department access requests
/// Used in Admin UI: /admin/department-rules
/// </summary>
public class DepartmentAccessRule
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid? BranchId { get; set; }
    
    // Department Information
    public Guid DepartmentId { get; set; }
    public string DepartmentCode { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    
    // Approval Workflow Settings
    public bool RequiresApproval { get; set; }
    public string? ApproverRoleIds { get; set; } // Comma-separated Role IDs
    public string? ApproverRoleNames { get; set; } // Display: "HOD, Admin"
    
    // Supervision Requirements (NABH Compliance)
    public bool RequiresSupervisor { get; set; }
    public string? SupervisorRoleIds { get; set; } // Comma-separated Role IDs
    public string? SupervisorRoleNames { get; set; } // Display: "Senior Doctor, Consultant"
    
    // Auto-Expiration Settings
    public bool EnableAutoExpiration { get; set; }
    public int? MaxAccessDurationDays { get; set; } // Max 90 days
    
    // Permission Restrictions
    public string? RestrictedPermissions { get; set; } // JSON: ["CanDelete", "CanApprove"]
    
    // Justification Requirements
    public bool RequiresJustification { get; set; }
    public int? MinJustificationLength { get; set; } // Minimum characters
    
    // Emergency Access
    public bool AllowEmergencyAccess { get; set; }
    public string? EmergencyRoleIds { get; set; } // Roles that can grant emergency access
    
    // Status
    public bool IsActive { get; set; }
    public string Status { get; set; } = "Active"; // Active, Inactive, Draft
    
    // Audit Trail
    public DateTime CreatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
}

/// <summary>
/// DTO for displaying department access rules in list view
/// </summary>
public class DepartmentAccessRuleDto
{
    public Guid Id { get; set; }
    public Guid DepartmentId { get; set; }
    public string DepartmentCode { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public string DepartmentType { get; set; } = string.Empty;
    public bool RequiresApproval { get; set; }
    public string? ApproverRoles { get; set; }
    public bool RequiresSupervisor { get; set; }
    public string? SupervisorRoles { get; set; }
    public bool EnableAutoExpiration { get; set; }
    public int? MaxAccessDurationDays { get; set; }
    public string? RestrictedPermissions { get; set; }
    public bool RequiresJustification { get; set; }
    public bool AllowEmergencyAccess { get; set; }
    public bool IsActive { get; set; }
    public string Status { get; set; } = "Active";
    public DateTime UpdatedAt { get; set; }
    public string? UpdatedByName { get; set; }
}

/// <summary>
/// DTO for creating/updating department access rules
/// </summary>
public class DepartmentAccessRuleFormData
{
    public Guid DepartmentId { get; set; }
    
    // Approval Workflow
    public bool RequiresApproval { get; set; }
    public List<Guid>? ApproverRoleIds { get; set; }
    
    // Supervision Requirements
    public bool RequiresSupervisor { get; set; }
    public List<Guid>? SupervisorRoleIds { get; set; }
    
    // Auto-Expiration
    public bool EnableAutoExpiration { get; set; }
    public int? MaxAccessDurationDays { get; set; }
    
    // Permission Restrictions
    public List<string>? RestrictedPermissions { get; set; }
    
    // Justification
    public bool RequiresJustification { get; set; }
    public int? MinJustificationLength { get; set; }
    
    // Emergency Access
    public bool AllowEmergencyAccess { get; set; }
    public List<Guid>? EmergencyRoleIds { get; set; }
    
    // Status
    public bool IsActive { get; set; }
}

/// <summary>
/// Detailed view of a single department access rule
/// </summary>
public class DepartmentAccessRuleDetails
{
    public Guid Id { get; set; }
    public Guid DepartmentId { get; set; }
    public string DepartmentCode { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public string DepartmentType { get; set; } = string.Empty;
    
    public bool RequiresApproval { get; set; }
    public List<RoleInfo>? ApproverRoles { get; set; }
    
    public bool RequiresSupervisor { get; set; }
    public List<RoleInfo>? SupervisorRoles { get; set; }
    
    public bool EnableAutoExpiration { get; set; }
    public int? MaxAccessDurationDays { get; set; }
    
    public List<string>? RestrictedPermissions { get; set; }
    
    public bool RequiresJustification { get; set; }
    public int? MinJustificationLength { get; set; }
    
    public bool AllowEmergencyAccess { get; set; }
    public List<RoleInfo>? EmergencyRoles { get; set; }
    
    public bool IsActive { get; set; }
    public string Status { get; set; } = "Active";
    
    public DateTime CreatedAt { get; set; }
    public string? CreatedByName { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string? UpdatedByName { get; set; }
}

/// <summary>
/// Role information for display
/// </summary>
public class RoleInfo
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

/// <summary>
/// Statistics for department access rules
/// </summary>
public class DepartmentAccessRuleStats
{
    public int TotalRules { get; set; }
    public int ActiveRules { get; set; }
    public int InactiveRules { get; set; }
    public int RulesRequiringApproval { get; set; }
    public int RulesRequiringSupervisor { get; set; }
    public int RulesWithAutoExpiration { get; set; }
    public Dictionary<string, int> RulesByDepartmentType { get; set; } = new();
}

/// <summary>
/// Filters for querying department access rules
/// </summary>
public class DepartmentAccessRuleFilters
{
    public string? Search { get; set; }
    public bool? IsActive { get; set; }
    public bool? RequiresApproval { get; set; }
    public bool? RequiresSupervisor { get; set; }
    public string? DepartmentType { get; set; }
}
