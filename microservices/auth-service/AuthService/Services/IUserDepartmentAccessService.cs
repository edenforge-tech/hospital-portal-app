using AuthService.Models;

namespace AuthService.Services;

public interface IUserDepartmentAccessService
{
    // Assignment Operations
    Task<UserDepartmentAccessDto> AssignUserToDepartmentAsync(Guid userId, Guid departmentId, string accessType, bool isPrimary);
    Task RevokeAccessAsync(Guid userId, Guid departmentId);
    Task<List<UserDepartmentAccessDto>> BulkAssignAsync(List<BulkAssignmentDto> assignments);
    
    // Query Operations
    Task<List<DepartmentAccessDto>> GetUserDepartmentsAsync(Guid userId);
    Task<List<UserAccessDto>> GetDepartmentUsersAsync(Guid departmentId);
    Task<AccessMatrixDto> GetAccessMatrixAsync(Guid? departmentId = null);
    
    // Update Operations
    Task UpdateAccessLevelAsync(Guid userId, Guid departmentId, string accessType);
    Task SetPrimaryDepartmentAsync(Guid userId, Guid departmentId);
    Task UpdatePermissionsAsync(Guid userId, Guid departmentId, UpdatePermissionsDto permissions);
}

// DTOs
public class UserDepartmentAccessDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public Guid DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string AccessType { get; set; } = "Full Access";
    public bool IsPrimary { get; set; }
    public DateTime? GrantedAt { get; set; }
    public Guid? GrantedByUserId { get; set; }
    public string? GrantedByUserName { get; set; }
    public DateTime? RevokedAt { get; set; }
    public Guid? RevokedByUserId { get; set; }
    public DateTime? EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
    public string Status { get; set; } = "Active";
    
    // Granular Permissions
    public bool CanView { get; set; }
    public bool CanCreate { get; set; }
    public bool CanEdit { get; set; }
    public bool CanDelete { get; set; }
    public bool CanApprove { get; set; }
    public bool CanExport { get; set; }
}

public class DepartmentAccessDto
{
    public Guid DepartmentId { get; set; }
    public string DepartmentCode { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public string DepartmentType { get; set; } = string.Empty;
    public string AccessType { get; set; } = "Full Access";
    public bool IsPrimary { get; set; }
    public DateTime? GrantedAt { get; set; }
    public string Status { get; set; } = "Active";
    
    // Granular Permissions
    public bool CanView { get; set; }
    public bool CanCreate { get; set; }
    public bool CanEdit { get; set; }
    public bool CanDelete { get; set; }
    public bool CanApprove { get; set; }
    public bool CanExport { get; set; }
}

public class UserAccessDto
{
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string AccessType { get; set; } = "Full Access";
    public bool IsPrimary { get; set; }
    public DateTime? GrantedAt { get; set; }
    public string Status { get; set; } = "Active";
}

public class BulkAssignmentDto
{
    public Guid UserId { get; set; }
    public Guid DepartmentId { get; set; }
    public string AccessType { get; set; } = "Full Access";
    public bool IsPrimary { get; set; }
}

public class AccessMatrixDto
{
    public List<UserDepartmentMatrix> Matrix { get; set; } = new();
    public int TotalUsers { get; set; }
    public int TotalDepartments { get; set; }
    public int TotalAssignments { get; set; }
}

public class UserDepartmentMatrix
{
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public List<DepartmentAccessInfo> Departments { get; set; } = new();
}

public class DepartmentAccessInfo
{
    public Guid DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string AccessType { get; set; } = "Full Access";
    public bool IsPrimary { get; set; }
}

public class UpdatePermissionsDto
{
    public bool CanView { get; set; }
    public bool CanCreate { get; set; }
    public bool CanEdit { get; set; }
    public bool CanDelete { get; set; }
    public bool CanApprove { get; set; }
    public bool CanExport { get; set; }
}
