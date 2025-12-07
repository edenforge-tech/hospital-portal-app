using AuthService.Context;
using AuthService.Models.User;
using AuthService.Models.Identity;
using AuthService.Models.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Services;

public interface IUserService
{
    Task<UserProfileDto?> GetProfileAsync(Guid userId, Guid tenantId);
    Task<bool> SuspendAsync(Guid userId, Guid tenantId, string reason, Guid actionBy);
    Task<bool> UnsuspendAsync(Guid userId, Guid tenantId, Guid actionBy);
    Task<bool> AssignDepartmentsAsync(Guid userId, Guid tenantId, List<DepartmentAssignment> departments, Guid actionBy);
    Task<MfaSettingsDto?> GetMfaSettingsAsync(Guid userId, Guid tenantId);
    Task<bool> UpdateMfaAsync(Guid userId, Guid tenantId, UpdateMfaRequest request, Guid actionBy);
    Task<bool> ResetMfaAsync(Guid userId, Guid tenantId, Guid actionBy);
    Task<List<UserActivityDto>> GetActivityAsync(Guid userId, Guid tenantId, int limit = 20);
}

public class UserService : IUserService
{
    private readonly AppDbContext _context;
    private readonly UserManager<AppUser> _userManager;

    public UserService(AppDbContext context, UserManager<AppUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task<UserProfileDto?> GetProfileAsync(Guid userId, Guid tenantId)
    {
        var user = await _userManager.Users
            .Where(u => u.Id == userId && u.TenantId == tenantId)
            .FirstOrDefaultAsync();

        if (user == null)
            return null;

        // Get departments
        var departments = await _context.Set<UserDepartment>()
            .Where(ud => ud.UserId == userId && ud.DeletedAt == null)
            .Join(_context.Set<Department>(),
                ud => ud.DepartmentId,
                d => d.Id,
                (ud, d) => new UserDepartmentDto
                {
                    DepartmentId = d.Id,
                    DepartmentName = d.DepartmentName,
                    IsPrimary = false, // IsPrimary removed from new schema
                    AccessLevel = ud.AccessType ?? "Full Access"
                })
            .ToListAsync();

        // Get roles
        var userRoles = await _userManager.GetRolesAsync(user);
        var roles = new List<UserRoleDto>();
        
        foreach (var roleName in userRoles)
        {
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == roleName);
            if (role != null)
            {
                roles.Add(new UserRoleDto
                {
                    RoleId = role.Id,
                    RoleName = role.Name ?? string.Empty,
                    Scope = role.RoleType // Assuming RoleType represents scope
                });
            }
        }

        // Get MFA status
        var mfa = await _context.Set<UserMfa>()
            .FirstOrDefaultAsync(m => m.UserId == userId);

        var profile = new UserProfileDto
        {
            Id = user.Id,
            UserName = user.UserName ?? string.Empty,
            Email = user.Email ?? string.Empty,
            FirstName = user.FirstName,
            LastName = user.LastName,
            PhoneNumber = user.PhoneNumber,
            UserType = user.UserType,
            UserStatus = user.UserStatus,
            Designation = user.Designation,
            Specialization = user.Specialization,
            LicenseNumber = user.LicenseNumber,
            ProfessionalRegistrationDate = user.ProfessionalRegistrationDate,
            OrganizationId = user.OrganizationId,
            OrganizationName = null, // TODO: Get from Organization table
            BranchId = user.BranchId,
            BranchName = null, // TODO: Get from Branch table
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt,
            MfaEnabled = mfa?.IsEnabled ?? false,
            Departments = departments,
            Roles = roles
        };

        return profile;
    }

    public async Task<bool> SuspendAsync(Guid userId, Guid tenantId, string reason, Guid actionBy)
    {
        var user = await _userManager.Users
            .FirstOrDefaultAsync(u => u.Id == userId && u.TenantId == tenantId);

        if (user == null)
            return false;

        user.UserStatus = "Suspended";
        user.UpdatedAt = DateTime.UtcNow;
        user.UpdatedBy = actionBy;

        var result = await _userManager.UpdateAsync(user);

        if (result.Succeeded)
        {
            // Log to audit
            var auditLog = new AuditLog
            {
                Id = Guid.NewGuid(),
                UserId = actionBy,
                Action = "SUSPEND_USER",
                EntityType = "User",
                EntityId = userId,
                Changes = $"User suspended. Reason: {reason}",
                Timestamp = DateTime.UtcNow,
                TenantId = tenantId
            };
            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();
        }

        return result.Succeeded;
    }

    public async Task<bool> UnsuspendAsync(Guid userId, Guid tenantId, Guid actionBy)
    {
        var user = await _userManager.Users
            .FirstOrDefaultAsync(u => u.Id == userId && u.TenantId == tenantId);

        if (user == null)
            return false;

        user.UserStatus = "Active";
        user.UpdatedAt = DateTime.UtcNow;
        user.UpdatedBy = actionBy;

        var result = await _userManager.UpdateAsync(user);

        if (result.Succeeded)
        {
            // Log to audit
            var auditLog = new AuditLog
            {
                Id = Guid.NewGuid(),
                UserId = actionBy,
                Action = "UNSUSPEND_USER",
                EntityType = "User",
                EntityId = userId,
                Changes = "User unsuspended",
                Timestamp = DateTime.UtcNow,
                TenantId = tenantId
            };
            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();
        }

        return result.Succeeded;
    }

    public async Task<bool> AssignDepartmentsAsync(Guid userId, Guid tenantId, List<DepartmentAssignment> departments, Guid actionBy)
    {
        // Remove existing assignments
        var existingAssignments = await _context.Set<UserDepartment>()
            .Where(ud => ud.UserId == userId && ud.TenantId == tenantId)
            .ToListAsync();

        foreach (var assignment in existingAssignments)
        {
            assignment.DeletedAt = DateTime.UtcNow;
            assignment.RevokedBy = actionBy;
        }

        // Add new assignments
        foreach (var dept in departments)
        {
            var newAssignment = new UserDepartment
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                DepartmentId = dept.DepartmentId,
                AccessType = dept.AccessLevel ?? "Full Access",
                CanView = true,
                CanCreate = false,
                CanEdit = false,
                CanDelete = false,
                CanApprove = false,
                CanExport = false,
                TenantId = tenantId,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = actionBy
            };
            _context.Set<UserDepartment>().Add(newAssignment);
        }

        await _context.SaveChangesAsync();

        // Log to audit
        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            UserId = actionBy,
            Action = "ASSIGN_DEPARTMENTS",
            EntityType = "User",
            EntityId = userId,
            Changes = $"Assigned {departments.Count} department(s)",
            Timestamp = DateTime.UtcNow,
            TenantId = tenantId
        };
        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<MfaSettingsDto?> GetMfaSettingsAsync(Guid userId, Guid tenantId)
    {
        var user = await _userManager.Users
            .FirstOrDefaultAsync(u => u.Id == userId && u.TenantId == tenantId);

        if (user == null)
            return null;

        var mfa = await _context.Set<UserMfa>()
            .FirstOrDefaultAsync(m => m.UserId == userId);

        if (mfa == null)
        {
            return new MfaSettingsDto
            {
                Enabled = false,
                IsConfigured = false
            };
        }

        return new MfaSettingsDto
        {
            Enabled = mfa.IsEnabled,
            Method = mfa.MfaMethod,
            IsConfigured = !string.IsNullOrEmpty(mfa.MfaSecret),
            EnabledAt = mfa.EnabledAt
        };
    }

    public async Task<bool> UpdateMfaAsync(Guid userId, Guid tenantId, UpdateMfaRequest request, Guid actionBy)
    {
        var user = await _userManager.Users
            .FirstOrDefaultAsync(u => u.Id == userId && u.TenantId == tenantId);

        if (user == null)
            return false;

        var mfa = await _context.Set<UserMfa>()
            .FirstOrDefaultAsync(m => m.UserId == userId);

        if (mfa == null)
        {
            mfa = new UserMfa
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                TenantId = tenantId,
                MfaSecret = GenerateMfaSecret(),
                CreatedAt = DateTime.UtcNow
            };
            _context.Set<UserMfa>().Add(mfa);
        }

        mfa.IsEnabled = request.Enabled;
        mfa.MfaMethod = request.Method;
        mfa.EnabledAt = request.Enabled ? DateTime.UtcNow : null;
        mfa.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Log to audit
        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            UserId = actionBy,
            Action = request.Enabled ? "ENABLE_MFA" : "DISABLE_MFA",
            EntityType = "User",
            EntityId = userId,
            Changes = $"MFA {(request.Enabled ? "enabled" : "disabled")} with method: {request.Method}",
            Timestamp = DateTime.UtcNow,
            TenantId = tenantId
        };
        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ResetMfaAsync(Guid userId, Guid tenantId, Guid actionBy)
    {
        var mfa = await _context.Set<UserMfa>()
            .FirstOrDefaultAsync(m => m.UserId == userId && m.TenantId == tenantId);

        if (mfa == null)
            return false;

        mfa.IsEnabled = false;
        mfa.MfaSecret = string.Empty;
        mfa.EnabledAt = null;
        mfa.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Log to audit
        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            UserId = actionBy,
            Action = "RESET_MFA",
            EntityType = "User",
            EntityId = userId,
            Changes = "MFA settings reset",
            Timestamp = DateTime.UtcNow,
            TenantId = tenantId
        };
        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<List<UserActivityDto>> GetActivityAsync(Guid userId, Guid tenantId, int limit = 20)
    {
        var activities = await _context.AuditLogs
            .Where(a => a.UserId == userId && a.TenantId == tenantId)
            .OrderByDescending(a => a.Timestamp)
            .Take(limit)
            .Select(a => new UserActivityDto
            {
                Id = a.Id,
                Action = a.Action,
                Description = a.Changes ?? a.Action,
                Timestamp = a.Timestamp,
                IpAddress = a.IpAddress,
                EntityType = a.EntityType,
                EntityId = a.EntityId
            })
            .ToListAsync();

        return activities;
    }

    private string GenerateMfaSecret()
    {
        // Generate a random base32 secret for MFA (32 characters)
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, 32)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }
}
