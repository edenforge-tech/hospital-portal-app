using AuthService.Context;
using AuthService.Models.Department;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace AuthService.Services;

/// <summary>
/// Service interface for Department Access Rules management
/// </summary>
public interface IDepartmentAccessRuleService
{
    Task<List<DepartmentAccessRuleDto>> GetAllRulesAsync(Guid tenantId, DepartmentAccessRuleFilters? filters = null);
    Task<DepartmentAccessRuleDetails?> GetRuleByIdAsync(Guid ruleId, Guid tenantId);
    Task<DepartmentAccessRuleDetails?> GetRuleByDepartmentIdAsync(Guid departmentId, Guid tenantId);
    Task<DepartmentAccessRuleDetails> CreateRuleAsync(DepartmentAccessRuleFormData formData, Guid tenantId, Guid userId);
    Task<DepartmentAccessRuleDetails> UpdateRuleAsync(Guid ruleId, DepartmentAccessRuleFormData formData, Guid tenantId, Guid userId);
    Task<bool> DeleteRuleAsync(Guid ruleId, Guid tenantId);
    Task<DepartmentAccessRuleStats> GetRuleStatsAsync(Guid tenantId);
}

/// <summary>
/// Service for managing department access rules (approval workflow, supervision, expiration)
/// Implements admin configuration features from /admin/department-rules
/// </summary>
public class DepartmentAccessRuleService : IDepartmentAccessRuleService
{
    private readonly AppDbContext _context;
    private readonly ILogger<DepartmentAccessRuleService> _logger;

    public DepartmentAccessRuleService(
        AppDbContext context,
        ILogger<DepartmentAccessRuleService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<DepartmentAccessRuleDto>> GetAllRulesAsync(Guid tenantId, DepartmentAccessRuleFilters? filters = null)
    {
        try
        {
            var query = _context.Set<DepartmentAccessRule>()
                .Where(r => r.TenantId == tenantId && r.DeletedAt == null)
                .AsQueryable();

            // Apply filters
            if (filters != null)
            {
                if (!string.IsNullOrWhiteSpace(filters.Search))
                {
                    var searchLower = filters.Search.ToLower();
                    query = query.Where(r =>
                        r.DepartmentCode.ToLower().Contains(searchLower) ||
                        r.DepartmentName.ToLower().Contains(searchLower));
                }

                if (filters.IsActive.HasValue)
                {
                    query = query.Where(r => r.IsActive == filters.IsActive.Value);
                }

                if (filters.RequiresApproval.HasValue)
                {
                    query = query.Where(r => r.RequiresApproval == filters.RequiresApproval.Value);
                }

                if (filters.RequiresSupervisor.HasValue)
                {
                    query = query.Where(r => r.RequiresSupervisor == filters.RequiresSupervisor.Value);
                }

                if (!string.IsNullOrWhiteSpace(filters.DepartmentType))
                {
                    // Join with departments to filter by type
                    var deptQuery = _context.Departments
                        .Where(d => d.TenantId == tenantId && d.DepartmentType == filters.DepartmentType)
                        .Select(d => d.Id);
                    query = query.Where(r => deptQuery.Contains(r.DepartmentId));
                }
            }

            var rules = await query
                .OrderByDescending(r => r.UpdatedAt)
                .Select(r => new DepartmentAccessRuleDto
                {
                    Id = r.Id,
                    DepartmentId = r.DepartmentId,
                    DepartmentCode = r.DepartmentCode,
                    DepartmentName = r.DepartmentName,
                    DepartmentType = _context.Departments
                        .Where(d => d.Id == r.DepartmentId)
                        .Select(d => d.DepartmentType)
                        .FirstOrDefault() ?? "",
                    RequiresApproval = r.RequiresApproval,
                    ApproverRoles = r.ApproverRoleNames,
                    RequiresSupervisor = r.RequiresSupervisor,
                    SupervisorRoles = r.SupervisorRoleNames,
                    EnableAutoExpiration = r.EnableAutoExpiration,
                    MaxAccessDurationDays = r.MaxAccessDurationDays,
                    RestrictedPermissions = r.RestrictedPermissions,
                    RequiresJustification = r.RequiresJustification,
                    AllowEmergencyAccess = r.AllowEmergencyAccess,
                    IsActive = r.IsActive,
                    Status = r.Status,
                    UpdatedAt = r.UpdatedAt,
                    UpdatedByName = _context.Users
                        .Where(u => u.Id == r.UpdatedByUserId)
                        .Select(u => u.FirstName + " " + u.LastName)
                        .FirstOrDefault()
                })
                .ToListAsync();

            return rules;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving department access rules for tenant {TenantId}", tenantId);
            throw;
        }
    }

    public async Task<DepartmentAccessRuleDetails?> GetRuleByIdAsync(Guid ruleId, Guid tenantId)
    {
        try
        {
            var rule = await _context.Set<DepartmentAccessRule>()
                .Where(r => r.Id == ruleId && r.TenantId == tenantId && r.DeletedAt == null)
                .FirstOrDefaultAsync();

            if (rule == null)
                return null;

            return await MapToDetailsAsync(rule);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving rule {RuleId}", ruleId);
            throw;
        }
    }

    public async Task<DepartmentAccessRuleDetails?> GetRuleByDepartmentIdAsync(Guid departmentId, Guid tenantId)
    {
        try
        {
            var rule = await _context.Set<DepartmentAccessRule>()
                .Where(r => r.DepartmentId == departmentId && r.TenantId == tenantId && r.DeletedAt == null)
                .FirstOrDefaultAsync();

            if (rule == null)
                return null;

            return await MapToDetailsAsync(rule);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving rule for department {DepartmentId}", departmentId);
            throw;
        }
    }

    public async Task<DepartmentAccessRuleDetails> CreateRuleAsync(
        DepartmentAccessRuleFormData formData, 
        Guid tenantId, 
        Guid userId)
    {
        try
        {
            // Validate department exists
            var department = await _context.Departments
                .Where(d => d.Id == formData.DepartmentId && d.TenantId == tenantId && d.DeletedAt == null)
                .FirstOrDefaultAsync();

            if (department == null)
                throw new ArgumentException("Department not found");

            // Check if rule already exists for this department
            var existingRule = await _context.Set<DepartmentAccessRule>()
                .AnyAsync(r => r.DepartmentId == formData.DepartmentId && r.TenantId == tenantId && r.DeletedAt == null);

            if (existingRule)
                throw new InvalidOperationException("A rule already exists for this department");

            // Get role names for display
            var approverRoleNames = await GetRoleNamesAsync(formData.ApproverRoleIds);
            var supervisorRoleNames = await GetRoleNamesAsync(formData.SupervisorRoleIds);
            var emergencyRoleNames = await GetRoleNamesAsync(formData.EmergencyRoleIds);

            var rule = new DepartmentAccessRule
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                BranchId = department.BranchId,
                DepartmentId = formData.DepartmentId,
                DepartmentCode = department.DepartmentCode,
                DepartmentName = department.DepartmentName,
                RequiresApproval = formData.RequiresApproval,
                ApproverRoleIds = formData.ApproverRoleIds != null ? string.Join(",", formData.ApproverRoleIds) : null,
                ApproverRoleNames = approverRoleNames,
                RequiresSupervisor = formData.RequiresSupervisor,
                SupervisorRoleIds = formData.SupervisorRoleIds != null ? string.Join(",", formData.SupervisorRoleIds) : null,
                SupervisorRoleNames = supervisorRoleNames,
                EnableAutoExpiration = formData.EnableAutoExpiration,
                MaxAccessDurationDays = formData.MaxAccessDurationDays,
                RestrictedPermissions = formData.RestrictedPermissions != null 
                    ? JsonSerializer.Serialize(formData.RestrictedPermissions) 
                    : null,
                RequiresJustification = formData.RequiresJustification,
                MinJustificationLength = formData.MinJustificationLength,
                AllowEmergencyAccess = formData.AllowEmergencyAccess,
                EmergencyRoleIds = formData.EmergencyRoleIds != null ? string.Join(",", formData.EmergencyRoleIds) : null,
                IsActive = formData.IsActive,
                Status = formData.IsActive ? "Active" : "Inactive",
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = userId,
                UpdatedAt = DateTime.UtcNow,
                UpdatedByUserId = userId
            };

            _context.Set<DepartmentAccessRule>().Add(rule);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Department access rule created: {RuleId} for department {DepartmentId} by user {UserId}",
                rule.Id, formData.DepartmentId, userId);

            return (await MapToDetailsAsync(rule))!;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating department access rule for department {DepartmentId}", formData.DepartmentId);
            throw;
        }
    }

    public async Task<DepartmentAccessRuleDetails> UpdateRuleAsync(
        Guid ruleId, 
        DepartmentAccessRuleFormData formData, 
        Guid tenantId, 
        Guid userId)
    {
        try
        {
            var rule = await _context.Set<DepartmentAccessRule>()
                .Where(r => r.Id == ruleId && r.TenantId == tenantId && r.DeletedAt == null)
                .FirstOrDefaultAsync();

            if (rule == null)
                throw new ArgumentException("Rule not found");

            // Get role names for display
            var approverRoleNames = await GetRoleNamesAsync(formData.ApproverRoleIds);
            var supervisorRoleNames = await GetRoleNamesAsync(formData.SupervisorRoleIds);
            var emergencyRoleNames = await GetRoleNamesAsync(formData.EmergencyRoleIds);

            // Update properties
            rule.RequiresApproval = formData.RequiresApproval;
            rule.ApproverRoleIds = formData.ApproverRoleIds != null ? string.Join(",", formData.ApproverRoleIds) : null;
            rule.ApproverRoleNames = approverRoleNames;
            rule.RequiresSupervisor = formData.RequiresSupervisor;
            rule.SupervisorRoleIds = formData.SupervisorRoleIds != null ? string.Join(",", formData.SupervisorRoleIds) : null;
            rule.SupervisorRoleNames = supervisorRoleNames;
            rule.EnableAutoExpiration = formData.EnableAutoExpiration;
            rule.MaxAccessDurationDays = formData.MaxAccessDurationDays;
            rule.RestrictedPermissions = formData.RestrictedPermissions != null 
                ? JsonSerializer.Serialize(formData.RestrictedPermissions) 
                : null;
            rule.RequiresJustification = formData.RequiresJustification;
            rule.MinJustificationLength = formData.MinJustificationLength;
            rule.AllowEmergencyAccess = formData.AllowEmergencyAccess;
            rule.EmergencyRoleIds = formData.EmergencyRoleIds != null ? string.Join(",", formData.EmergencyRoleIds) : null;
            rule.IsActive = formData.IsActive;
            rule.Status = formData.IsActive ? "Active" : "Inactive";
            rule.UpdatedAt = DateTime.UtcNow;
            rule.UpdatedByUserId = userId;

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Department access rule updated: {RuleId} by user {UserId}",
                ruleId, userId);

            return (await MapToDetailsAsync(rule))!;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating department access rule {RuleId}", ruleId);
            throw;
        }
    }

    public async Task<bool> DeleteRuleAsync(Guid ruleId, Guid tenantId)
    {
        try
        {
            var rule = await _context.Set<DepartmentAccessRule>()
                .Where(r => r.Id == ruleId && r.TenantId == tenantId && r.DeletedAt == null)
                .FirstOrDefaultAsync();

            if (rule == null)
                return false;

            // Soft delete
            rule.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Department access rule deleted: {RuleId}", ruleId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting department access rule {RuleId}", ruleId);
            throw;
        }
    }

    public async Task<DepartmentAccessRuleStats> GetRuleStatsAsync(Guid tenantId)
    {
        try
        {
            var rules = await _context.Set<DepartmentAccessRule>()
                .Where(r => r.TenantId == tenantId && r.DeletedAt == null)
                .ToListAsync();

            var departments = await _context.Departments
                .Where(d => d.TenantId == tenantId && d.DeletedAt == null)
                .ToListAsync();

            var stats = new DepartmentAccessRuleStats
            {
                TotalRules = rules.Count,
                ActiveRules = rules.Count(r => r.IsActive),
                InactiveRules = rules.Count(r => !r.IsActive),
                RulesRequiringApproval = rules.Count(r => r.RequiresApproval),
                RulesRequiringSupervisor = rules.Count(r => r.RequiresSupervisor),
                RulesWithAutoExpiration = rules.Count(r => r.EnableAutoExpiration)
            };

            // Group by department type
            var rulesByType = rules
                .Join(departments,
                    r => r.DepartmentId,
                    d => d.Id,
                    (r, d) => d.DepartmentType)
                .GroupBy(t => t)
                .ToDictionary(g => g.Key, g => g.Count());

            stats.RulesByDepartmentType = rulesByType;

            return stats;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating rule stats for tenant {TenantId}", tenantId);
            throw;
        }
    }

    // Helper methods
    private async Task<string?> GetRoleNamesAsync(List<Guid>? roleIds)
    {
        if (roleIds == null || !roleIds.Any())
            return null;

        var roles = await _context.Roles
            .Where(r => roleIds.Contains(r.Id))
            .Select(r => r.Name)
            .ToListAsync();

        return string.Join(", ", roles);
    }

    private async Task<DepartmentAccessRuleDetails> MapToDetailsAsync(DepartmentAccessRule rule)
    {
        var department = await _context.Departments
            .Where(d => d.Id == rule.DepartmentId)
            .FirstOrDefaultAsync();

        var approverRoles = await GetRoleInfoListAsync(rule.ApproverRoleIds);
        var supervisorRoles = await GetRoleInfoListAsync(rule.SupervisorRoleIds);
        var emergencyRoles = await GetRoleInfoListAsync(rule.EmergencyRoleIds);

        var createdByName = await _context.Users
            .Where(u => u.Id == rule.CreatedByUserId)
            .Select(u => u.FirstName + " " + u.LastName)
            .FirstOrDefaultAsync();

        var updatedByName = await _context.Users
            .Where(u => u.Id == rule.UpdatedByUserId)
            .Select(u => u.FirstName + " " + u.LastName)
            .FirstOrDefaultAsync();

        List<string>? restrictedPermissions = null;
        if (!string.IsNullOrWhiteSpace(rule.RestrictedPermissions))
        {
            try
            {
                restrictedPermissions = JsonSerializer.Deserialize<List<string>>(rule.RestrictedPermissions);
            }
            catch
            {
                // Handle deserialization errors gracefully
                restrictedPermissions = new List<string>();
            }
        }

        return new DepartmentAccessRuleDetails
        {
            Id = rule.Id,
            DepartmentId = rule.DepartmentId,
            DepartmentCode = rule.DepartmentCode,
            DepartmentName = rule.DepartmentName,
            DepartmentType = department?.DepartmentType ?? "",
            RequiresApproval = rule.RequiresApproval,
            ApproverRoles = approverRoles,
            RequiresSupervisor = rule.RequiresSupervisor,
            SupervisorRoles = supervisorRoles,
            EnableAutoExpiration = rule.EnableAutoExpiration,
            MaxAccessDurationDays = rule.MaxAccessDurationDays,
            RestrictedPermissions = restrictedPermissions,
            RequiresJustification = rule.RequiresJustification,
            MinJustificationLength = rule.MinJustificationLength,
            AllowEmergencyAccess = rule.AllowEmergencyAccess,
            EmergencyRoles = emergencyRoles,
            IsActive = rule.IsActive,
            Status = rule.Status,
            CreatedAt = rule.CreatedAt,
            CreatedByName = createdByName,
            UpdatedAt = rule.UpdatedAt,
            UpdatedByName = updatedByName
        };
    }

    private async Task<List<RoleInfo>?> GetRoleInfoListAsync(string? roleIdsString)
    {
        if (string.IsNullOrWhiteSpace(roleIdsString))
            return null;

        var roleIds = roleIdsString
            .Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(id => Guid.TryParse(id.Trim(), out var guid) ? guid : (Guid?)null)
            .Where(id => id.HasValue)
            .Select(id => id!.Value)
            .ToList();

        if (!roleIds.Any())
            return null;

        var roles = await _context.Roles
            .Where(r => roleIds.Contains(r.Id))
            .Select(r => new RoleInfo
            {
                Id = r.Id,
                Name = r.Name ?? "",
                Description = r.Description
            })
            .ToListAsync();

        return roles.Any() ? roles : null;
    }
}
