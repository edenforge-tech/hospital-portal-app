namespace AuthService.Models.User;

public class UserProfileDto
{
    public Guid Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string UserType { get; set; } = string.Empty;
    public string UserStatus { get; set; } = string.Empty;
    public string? Designation { get; set; }
    public string? Specialization { get; set; }
    public string? LicenseNumber { get; set; }
    public DateTime? ProfessionalRegistrationDate { get; set; }
    public Guid? OrganizationId { get; set; }
    public string? OrganizationName { get; set; }
    public Guid? BranchId { get; set; }
    public string? BranchName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public bool MfaEnabled { get; set; }
    public List<UserDepartmentDto> Departments { get; set; } = new();
    public List<UserRoleDto> Roles { get; set; } = new();
}

public class UserDepartmentDto
{
    public Guid DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
    public string AccessLevel { get; set; } = "Full";
}

public class UserRoleDto
{
    public Guid RoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public string? Scope { get; set; }
}

public class DepartmentAssignment
{
    public Guid DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
    public string AccessLevel { get; set; } = "Full"; // Full, Read-only, Approval-only
}

public class MfaSettingsDto
{
    public bool Enabled { get; set; }
    public string? Method { get; set; } // SMS, Email, Authenticator
    public bool IsConfigured { get; set; }
    public DateTime? EnabledAt { get; set; }
}

public class UpdateMfaRequest
{
    public bool Enabled { get; set; }
    public string? Method { get; set; }
}

public class UserActivityDto
{
    public Guid Id { get; set; }
    public string Action { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string? IpAddress { get; set; }
    public string? EntityType { get; set; }
    public Guid? EntityId { get; set; }
}

public class SuspendUserRequest
{
    public string Reason { get; set; } = string.Empty;
}
