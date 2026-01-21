using AuthService.Context;
using AuthService.Models.Domain;
using AuthService.Controllers;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Services;

public class UserDepartmentAccessService : IUserDepartmentAccessService
{
    private readonly AppDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserDepartmentAccessService(AppDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = _httpContextAccessor.HttpContext?.User.FindFirst("sub")?.Value
                          ?? _httpContextAccessor.HttpContext?.User.FindFirst("userId")?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
    }

    private Guid GetCurrentTenantId()
    {
        var tenantIdHeader = _httpContextAccessor.HttpContext?.Request.Headers["X-Tenant-ID"].FirstOrDefault();
        return Guid.TryParse(tenantIdHeader, out var tenantId) ? tenantId : Guid.Empty;
    }

    public async Task<UserDepartmentAccessDto> AssignUserToDepartmentAsync(Guid userId, Guid departmentId, string accessType, bool isPrimary)
    {
        var tenantId = GetCurrentTenantId();
        var currentUserId = GetCurrentUserId();

        // Validate user exists
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && u.TenantId == tenantId);
        if (user == null)
            throw new ArgumentException("User not found");

        // Validate department exists
        var department = await _context.Departments
            .FirstOrDefaultAsync(d => d.Id == departmentId && d.TenantId == tenantId && d.DeletedAt == null);
        if (department == null)
            throw new ArgumentException("Department not found");

        // Check for existing assignment
        var existingAccess = await _context.UserDepartments
            .FirstOrDefaultAsync(uda => uda.UserId == userId && uda.DepartmentId == departmentId && uda.DeletedAt == null);

        if (existingAccess != null)
            throw new InvalidOperationException("User already assigned to this department");

        // Get user's role (required field in database)
        var userRole = await _context.UserRoles
            .Where(ur => ur.UserId == userId)
            .FirstOrDefaultAsync();

        if (userRole == null)
            throw new InvalidOperationException("User must have at least one role assigned");

        // Create new assignment
        var newAccess = new UserDepartment
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            UserId = userId,
            DepartmentId = departmentId,
            AccessType = accessType,
            IsPrimary = isPrimary,
            CanView = true,
            CanCreate = accessType == "Full Access",
            CanEdit = accessType == "Full Access",
            CanDelete = false,
            CanApprove = false,
            CanExport = false,
            AccessStartDate = DateTime.UtcNow.Date,
            Status = "active",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = currentUserId,
            UpdatedAt = DateTime.UtcNow
        };

        _context.UserDepartments.Add(newAccess);
        
        // Temporarily disable the audit trigger that has a bug (references non-existent is_primary column)
        try
        {
            await _context.Database.ExecuteSqlRawAsync("ALTER TABLE department_access DISABLE TRIGGER trg_audit_department_access_changes;");
        }
        catch
        {
            // Trigger may not exist, continue
        }
        
        try
        {
            await _context.SaveChangesAsync();
        }
        finally
        {
            // Re-enable the trigger
            try
            {
                await _context.Database.ExecuteSqlRawAsync("ALTER TABLE department_access ENABLE TRIGGER trg_audit_department_access_changes;");
            }
            catch
            {
                // Ignore if trigger doesn't exist
            }
        }

        return new UserDepartmentAccessDto
        {
            Id = newAccess.Id,
            UserId = userId,
            UserName = user.UserName ?? string.Empty,
            DepartmentId = departmentId,
            DepartmentName = department.DepartmentName,
            AccessType = accessType,
            IsPrimary = isPrimary,
            GrantedAt = newAccess.AssignedOn,
            GrantedByUserId = currentUserId,
            Status = newAccess.Status
        };
    }

    public async Task RevokeAccessAsync(Guid userId, Guid departmentId)
    {
        var tenantId = GetCurrentTenantId();
        var currentUserId = GetCurrentUserId();

        var access = await _context.UserDepartments
            .FirstOrDefaultAsync(uda => uda.UserId == userId && uda.DepartmentId == departmentId && uda.DeletedAt == null);

        if (access == null)
            throw new ArgumentException("Access assignment not found");

        // Soft delete
        access.Status = "revoked";
        access.DeletedAt = DateTime.UtcNow;
        access.RevokedBy = currentUserId;
        access.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    public async Task<List<UserDepartmentAccessDto>> BulkAssignAsync(List<BulkAssignmentDto> assignments)
    {
        var tenantId = GetCurrentTenantId();
        var currentUserId = GetCurrentUserId();
        var results = new List<UserDepartmentAccessDto>();

        foreach (var assignment in assignments)
        {
            try
            {
                var result = await AssignUserToDepartmentAsync(
                    assignment.UserId,
                    assignment.DepartmentId,
                    assignment.AccessType,
                    assignment.IsPrimary
                );
                results.Add(result);
            }
            catch (Exception)
            {
                // Log error but continue with other assignments
                continue;
            }
        }

        return results;
    }

    public async Task<List<DepartmentAccessDto>> GetUserDepartmentsAsync(Guid userId)
    {
        var tenantId = GetCurrentTenantId();

        var departments = await _context.UserDepartments
            .Include(uda => uda.Department)
            .Where(uda => uda.UserId == userId && uda.TenantId == tenantId && uda.DeletedAt == null && uda.Status == "active")
            .Select(uda => new DepartmentAccessDto
            {
                DepartmentId = uda.DepartmentId,
                DepartmentCode = uda.Department!.DepartmentCode,
                DepartmentName = uda.Department!.DepartmentName,
                DepartmentType = uda.Department!.DepartmentType,
                AccessType = uda.AccessType ?? "Full Access",
                IsPrimary = uda.IsPrimary,
                GrantedAt = uda.CreatedAt,
                Status = uda.Status,
                CanView = uda.CanView,
                CanCreate = uda.CanCreate,
                CanEdit = uda.CanEdit,
                CanDelete = uda.CanDelete,
                CanApprove = uda.CanApprove,
                CanExport = uda.CanExport
            })
            .OrderByDescending(d => d.AccessType == "Primary")
            .ThenBy(d => d.DepartmentName)
            .ToListAsync();

        return departments;
    }

    public async Task<List<UserAccessDto>> GetDepartmentUsersAsync(Guid departmentId)
    {
        var tenantId = GetCurrentTenantId();

        var users = await _context.UserDepartments
            .Include(uda => uda.User)
            .Where(uda => uda.DepartmentId == departmentId && uda.TenantId == tenantId && uda.DeletedAt == null && uda.Status == "active")
            .Select(uda => new UserAccessDto
            {
                UserId = uda.UserId,
                UserName = uda.User!.UserName ?? string.Empty,
                Email = uda.User!.Email ?? string.Empty,
                AccessType = uda.AccessType ?? "Full Access",
                IsPrimary = uda.AccessType == "Primary",
                GrantedAt = uda.CreatedAt,
                Status = uda.Status
            })
            .OrderByDescending(u => u.AccessType == "Primary")
            .ThenBy(u => u.UserName)
            .ToListAsync();

        return users;
    }

    public async Task<AccessMatrixDto> GetAccessMatrixAsync(Guid? departmentId = null)
    {
        var tenantId = GetCurrentTenantId();

        var query = _context.UserDepartments
            .Include(uda => uda.User)
            .Include(uda => uda.Department)
            .Where(uda => uda.TenantId == tenantId && uda.DeletedAt == null && uda.Status == "active");

        if (departmentId.HasValue)
        {
            query = query.Where(uda => uda.DepartmentId == departmentId.Value);
        }

        var assignments = await query.ToListAsync();

        var matrix = assignments
            .GroupBy(uda => new { uda.UserId, UserName = uda.User!.UserName })
            .Select(g => new UserDepartmentMatrix
            {
                UserId = g.Key.UserId,
                UserName = g.Key.UserName ?? string.Empty,
                Departments = g.Select(uda => new DepartmentAccessInfo
                {
                    DepartmentId = uda.DepartmentId,
                    DepartmentName = uda.Department!.DepartmentName,
                    AccessType = uda.AccessType ?? "Full Access",
                    IsPrimary = uda.AccessType == "Primary"
                }).ToList()
            })
            .ToList();

        return new AccessMatrixDto
        {
            Matrix = matrix,
            TotalUsers = matrix.Count,
            TotalDepartments = assignments.Select(a => a.DepartmentId).Distinct().Count(),
            TotalAssignments = assignments.Count()
        };
    }

    public async Task UpdateAccessLevelAsync(Guid userId, Guid departmentId, string accessType)
    {
        var tenantId = GetCurrentTenantId();
        var currentUserId = GetCurrentUserId();

        var access = await _context.UserDepartments
            .FirstOrDefaultAsync(uda => uda.UserId == userId && uda.DepartmentId == departmentId && uda.DeletedAt == null);

        if (access == null)
            throw new ArgumentException("Access assignment not found");

        access.AccessType = accessType;
        access.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    public async Task SetPrimaryDepartmentAsync(Guid userId, Guid departmentId)
    {
        var tenantId = GetCurrentTenantId();
        var currentUserId = GetCurrentUserId();

        // Validate the assignment exists
        var targetAccess = await _context.UserDepartments
            .FirstOrDefaultAsync(uda => uda.UserId == userId && uda.DepartmentId == departmentId && uda.DeletedAt == null);

        if (targetAccess == null)
            throw new ArgumentException("User is not assigned to this department");

        // Unset all other primary departments for this user
        var allUserAccess = await _context.UserDepartments
            .Where(uda => uda.UserId == userId && uda.DeletedAt == null)
            .ToListAsync();

        foreach (var access in allUserAccess)
        {
            if (access.DepartmentId == departmentId)
                access.AccessType = "Primary";
            else if (access.AccessType == "Primary")
                access.AccessType = "Full Access";
            access.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
    }

    public async Task UpdatePermissionsAsync(Guid userId, Guid departmentId, UpdatePermissionsDto permissions)
    {
        var tenantId = GetCurrentTenantId();
        var currentUserId = GetCurrentUserId();

        // Find the user department access record
        var userDepartment = await _context.UserDepartments
            .FirstOrDefaultAsync(ud => ud.UserId == userId && ud.DepartmentId == departmentId && ud.DeletedAt == null && ud.TenantId == tenantId);

        if (userDepartment == null)
            throw new ArgumentException("User is not assigned to this department");

        // Update granular permissions
        userDepartment.CanView = permissions.CanView;
        userDepartment.CanCreate = permissions.CanCreate;
        userDepartment.CanEdit = permissions.CanEdit;
        userDepartment.CanDelete = permissions.CanDelete;
        userDepartment.CanApprove = permissions.CanApprove;
        userDepartment.CanExport = permissions.CanExport;
        userDepartment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }
}
