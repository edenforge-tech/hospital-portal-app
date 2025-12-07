using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using AuthService.Context;
using AuthService.Models;
using AuthService.Models.Permission;
using AuthService.Models.Domain;
using AuthService.Models.Identity;

namespace AuthService.Services
{
    /// <summary>
    /// Comprehensive Permission Management Service
    /// Provides advanced permission operations for enterprise RBAC
    /// </summary>
    public class PermissionManagementService : IPermissionManagementService
    {
        private readonly AppDbContext _context;
        private readonly IPermissionService _permissionService; // For basic operations
        private readonly ILogger<PermissionManagementService> _logger;

        public PermissionManagementService(
            AppDbContext context,
            IPermissionService permissionService,
            ILogger<PermissionManagementService> logger)
        {
            _context = context;
            _permissionService = permissionService;
            _logger = logger;
        }

        #region CRUD Operations

        public async Task<PermissionListResponse> GetAllAsync(Guid tenantId, PermissionFilters filters)
        {
            try
            {
                var query = _context.Permissions
                    .Where(p => p.TenantId == tenantId && p.DeletedAt == null);

                // Apply filters
                if (!string.IsNullOrWhiteSpace(filters.Search))
                {
                    var search = filters.Search.ToLower();
                    query = query.Where(p =>
                        p.Code.ToLower().Contains(search) ||
                        p.Name.ToLower().Contains(search) ||
                        p.Description.ToLower().Contains(search));
                }

                if (!string.IsNullOrWhiteSpace(filters.Module))
                    query = query.Where(p => p.Module == filters.Module);

                if (!string.IsNullOrWhiteSpace(filters.Resource))
                    query = query.Where(p => p.ResourceType == filters.Resource);

                if (!string.IsNullOrWhiteSpace(filters.Action))
                    query = query.Where(p => p.Action == filters.Action);

                if (!string.IsNullOrWhiteSpace(filters.Scope))
                    query = query.Where(p => p.Scope == filters.Scope);

                if (!string.IsNullOrWhiteSpace(filters.DataClassification))
                    query = query.Where(p => p.DataClassification == filters.DataClassification);

                if (filters.IsActive.HasValue)
                    query = query.Where(p => p.IsActive == filters.IsActive.Value);

                if (filters.IsSystemPermission.HasValue)
                    query = query.Where(p => p.IsSystemPermission == filters.IsSystemPermission.Value);

                if (filters.DepartmentSpecific.HasValue)
                    query = query.Where(p => p.DepartmentSpecific == filters.DepartmentSpecific.Value);

                if (filters.IsCustom.HasValue)
                    query = query.Where(p => p.IsCustom == filters.IsCustom.Value);

                // Get total count before pagination
                var totalCount = await query.CountAsync();

                // Apply sorting
                query = filters.SortBy?.ToLower() switch
                {
                    "code" => filters.SortOrder?.ToLower() == "desc" 
                        ? query.OrderByDescending(p => p.Code)
                        : query.OrderBy(p => p.Code),
                    "name" => filters.SortOrder?.ToLower() == "desc"
                        ? query.OrderByDescending(p => p.Name)
                        : query.OrderBy(p => p.Name),
                    "module" => filters.SortOrder?.ToLower() == "desc"
                        ? query.OrderByDescending(p => p.Module)
                        : query.OrderBy(p => p.Module),
                    "createdat" => filters.SortOrder?.ToLower() == "desc"
                        ? query.OrderByDescending(p => p.CreatedAt)
                        : query.OrderBy(p => p.CreatedAt),
                    _ => query.OrderBy(p => p.Module).ThenBy(p => p.Code)
                };

                // Apply pagination
                var pageNumber = filters.PageNumber > 0 ? filters.PageNumber : 1;
                var pageSize = filters.PageSize > 0 ? filters.PageSize : 50;
                var skip = (pageNumber - 1) * pageSize;

                var permissions = await query
                    .Skip(skip)
                    .Take(pageSize)
                    .ToListAsync();

                // Get role counts for each permission
                var permissionIds = permissions.Select(p => p.Id).ToList();
                var roleCounts = await _context.Set<RolePermission>()
                    .Where(rp => permissionIds.Contains(rp.PermissionId))
                    .GroupBy(rp => rp.PermissionId)
                    .Select(g => new { PermissionId = g.Key, Count = g.Count() })
                    .ToDictionaryAsync(x => x.PermissionId, x => x.Count);

                var permissionDtos = permissions.Select(p => new PermissionDto
                {
                    Id = p.Id,
                    Code = p.Code,
                    Name = p.Name,
                    Description = p.Description,
                    Module = p.Module,
                    Resource = p.ResourceType ?? p.ResourceName ?? "",
                    Action = p.Action,
                    Scope = p.Scope,
                    DataClassification = p.DataClassification,
                    IsActive = p.IsActive,
                    IsSystemPermission = p.IsSystemPermission ?? false,
                    DepartmentSpecific = p.DepartmentSpecific ?? false,
                    TotalRoles = roleCounts.GetValueOrDefault(p.Id, 0),
                    CreatedAt = p.CreatedAt
                }).ToList();

                // Calculate breakdowns
                var moduleBreakdown = permissionDtos
                    .GroupBy(p => p.Module)
                    .ToDictionary(g => g.Key, g => g.Count());

                var scopeBreakdown = permissionDtos
                    .GroupBy(p => p.Scope)
                    .ToDictionary(g => g.Key, g => g.Count());

                return new PermissionListResponse
                {
                    Permissions = permissionDtos,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                    ModuleBreakdown = moduleBreakdown,
                    ScopeBreakdown = scopeBreakdown
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting permissions for tenant {TenantId}", tenantId);
                throw;
            }
        }

        public async Task<PermissionDetailsDto> GetByIdAsync(Guid tenantId, Guid permissionId)
        {
            try
            {
                var permission = await _context.Permissions
                    .Where(p => p.Id == permissionId && p.TenantId == tenantId && p.DeletedAt == null)
                    .FirstOrDefaultAsync();

                if (permission == null)
                    return null;

                // Get roles assigned to this permission
                var roles = await _context.Set<RolePermission>()
                    .Where(rp => rp.PermissionId == permissionId)
                    .Join(_context.Roles,
                        rp => rp.RoleId,
                        r => r.Id,
                        (rp, r) => new { RolePermission = rp, Role = r })
                    .Where(x => x.Role.DeletedAt == null)
                    .Select(x => new PermissionRoleDto
                    {
                        RoleId = x.Role.Id,
                        RoleName = x.Role.Name,
                        AssignedAt = x.RolePermission.CreatedAt,
                        ValidFrom = x.RolePermission.ValidFrom,
                        ValidUntil = x.RolePermission.ValidUntil,
                        ConditionType = x.RolePermission.ConditionType,
                        IsActive = x.Role.IsActive
                    })
                    .ToListAsync();

                // Count total users (via roles)
                var totalUsers = await _context.Set<AppUserRole>()
                    .Where(ur => roles.Select(r => r.RoleId).Contains(ur.RoleId))
                    .Select(ur => ur.UserId)
                    .Distinct()
                    .CountAsync();

                return new PermissionDetailsDto
                {
                    Id = permission.Id,
                    Code = permission.Code,
                    Name = permission.Name,
                    Description = permission.Description,
                    Module = permission.Module,
                    ResourceType = permission.ResourceType,
                    Action = permission.Action,
                    Scope = permission.Scope,
                    DataClassification = permission.DataClassification,
                    IsActive = permission.IsActive,
                    IsSystemPermission = permission.IsSystemPermission ?? false,
                    DepartmentSpecific = permission.DepartmentSpecific ?? false,
                    Roles = roles,
                    TotalRoles = roles.Count,
                    TotalUsers = totalUsers,
                    Dependencies = permission.Dependencies != null ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(permission.Dependencies) ?? new List<string>() : new List<string>(),
                    ConflictsWith = permission.ConflictsWith != null ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(permission.ConflictsWith) ?? new List<string>() : new List<string>(),
                    CreatedBy = permission.CreatedBy?.ToString() ?? "",
                    UpdatedBy = permission.UpdatedBy?.ToString() ?? "",
                    CreatedAt = permission.CreatedAt,
                    UpdatedAt = permission.UpdatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting permission {PermissionId}", permissionId);
                throw;
            }
        }

        public async Task<PermissionDetailsDto> GetByCodeAsync(Guid tenantId, string permissionCode)
        {
            try
            {
                var permission = await _context.Permissions
                    .Where(p => p.Code == permissionCode && p.TenantId == tenantId && p.DeletedAt == null)
                    .FirstOrDefaultAsync();

                if (permission == null)
                    return null;

                return await GetByIdAsync(tenantId, permission.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting permission by code {Code}", permissionCode);
                throw;
            }
        }

        public async Task<PermissionOperationResult> CreateAsync(Guid tenantId, Guid userId, CreatePermissionRequest request)
        {
            try
            {
                // Check if permission code already exists
                var exists = await _context.Permissions
                    .AnyAsync(p => p.Code == request.Code && p.TenantId == tenantId && p.DeletedAt == null);

                if (exists)
                {
                    return new PermissionOperationResult
                    {
                        Success = false,
                        Message = $"Permission with code '{request.Code}' already exists"
                    };
                }

                var permission = new Permission
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    Code = request.Code,
                    Name = request.Name,
                    Description = request.Description,
                    Module = request.Module,
                    ResourceType = request.ResourceType,
                    Action = request.Action,
                    Scope = request.Scope ?? "Tenant",
                    DataClassification = request.DataClassification ?? "Internal",
                    IsActive = true,
                    IsSystemPermission = false,
                    DepartmentSpecific = request.DepartmentSpecific,
                    IsCustom = request.IsCustom,
                    Dependencies = request.Dependencies != null ? JsonSerializer.Serialize(request.Dependencies) : null,
                    ConflictsWith = request.ConflictsWith != null ? JsonSerializer.Serialize(request.ConflictsWith) : null,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = userId
                };

                _context.Permissions.Add(permission);
                await _context.SaveChangesAsync();

                await LogAudit(tenantId, userId, "CREATE", "Permission", permission.Id, $"Created permission: {permission.Code}");

                return new PermissionOperationResult
                {
                    Success = true,
                    Message = "Permission created successfully",
                    PermissionId = permission.Id
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating permission {Code}", request.Code);
                return new PermissionOperationResult
                {
                    Success = false,
                    Message = $"Failed to create permission: {ex.Message}"
                };
            }
        }

        public async Task<PermissionOperationResult> UpdateAsync(Guid tenantId, Guid userId, Guid permissionId, UpdatePermissionRequest request)
        {
            try
            {
                var permission = await _context.Permissions
                    .Where(p => p.Id == permissionId && p.TenantId == tenantId && p.DeletedAt == null)
                    .FirstOrDefaultAsync();

                if (permission == null)
                {
                    return new PermissionOperationResult
                    {
                        Success = false,
                        Message = "Permission not found"
                    };
                }

                if (permission.IsSystemPermission ?? false)
                {
                    return new PermissionOperationResult
                    {
                        Success = false,
                        Message = "Cannot modify system permission"
                    };
                }

                // Update fields
                if (!string.IsNullOrWhiteSpace(request.Name))
                    permission.Name = request.Name;

                if (request.Description != null)
                    permission.Description = request.Description;

                if (!string.IsNullOrWhiteSpace(request.Scope))
                    permission.Scope = request.Scope;

                if (!string.IsNullOrWhiteSpace(request.DataClassification))
                    permission.DataClassification = request.DataClassification;

                if (request.IsActive.HasValue)
                    permission.IsActive = request.IsActive.Value;

                if (request.DepartmentSpecific.HasValue)
                    permission.DepartmentSpecific = request.DepartmentSpecific.Value;

                if (request.Dependencies != null)
                    permission.Dependencies = JsonSerializer.Serialize(request.Dependencies);

                if (request.ConflictsWith != null)
                    permission.ConflictsWith = JsonSerializer.Serialize(request.ConflictsWith);

                permission.UpdatedAt = DateTime.UtcNow;
                permission.UpdatedBy = userId;

                await _context.SaveChangesAsync();

                await LogAudit(tenantId, userId, "UPDATE", "Permission", permission.Id, $"Updated permission: {permission.Code}");

                return new PermissionOperationResult
                {
                    Success = true,
                    Message = "Permission updated successfully",
                    PermissionId = permission.Id
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating permission {PermissionId}", permissionId);
                return new PermissionOperationResult
                {
                    Success = false,
                    Message = $"Failed to update permission: {ex.Message}"
                };
            }
        }

        public async Task<PermissionOperationResult> DeleteAsync(Guid tenantId, Guid userId, Guid permissionId)
        {
            try
            {
                var permission = await _context.Permissions
                    .Where(p => p.Id == permissionId && p.TenantId == tenantId && p.DeletedAt == null)
                    .FirstOrDefaultAsync();

                if (permission == null)
                {
                    return new PermissionOperationResult
                    {
                        Success = false,
                        Message = "Permission not found"
                    };
                }

                if (permission.IsSystemPermission ?? false)
                {
                    return new PermissionOperationResult
                    {
                        Success = false,
                        Message = "Cannot delete system permission"
                    };
                }

                // Soft delete
                permission.DeletedAt = DateTime.UtcNow;
                permission.DeletedBy = userId;
                await _context.SaveChangesAsync();

                await LogAudit(tenantId, userId, "DELETE", "Permission", permission.Id, $"Deleted permission: {permission.Code}");

                return new PermissionOperationResult
                {
                    Success = true,
                    Message = "Permission deleted successfully",
                    PermissionId = permission.Id
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting permission {PermissionId}", permissionId);
                return new PermissionOperationResult
                {
                    Success = false,
                    Message = $"Failed to delete permission: {ex.Message}"
                };
            }
        }

        public async Task<PermissionOperationResult> SetActiveStatusAsync(Guid tenantId, Guid userId, Guid permissionId, bool isActive)
        {
            try
            {
                var permission = await _context.Permissions
                    .Where(p => p.Id == permissionId && p.TenantId == tenantId && p.DeletedAt == null)
                    .FirstOrDefaultAsync();

                if (permission == null)
                {
                    return new PermissionOperationResult
                    {
                        Success = false,
                        Message = "Permission not found"
                    };
                }

                permission.IsActive = isActive;
                permission.UpdatedAt = DateTime.UtcNow;
                permission.UpdatedBy = userId;

                await _context.SaveChangesAsync();

                await LogAudit(tenantId, userId, "UPDATE", "Permission", permission.Id, 
                    $"{(isActive ? "Activated" : "Deactivated")} permission: {permission.Code}");

                return new PermissionOperationResult
                {
                    Success = true,
                    Message = $"Permission {(isActive ? "activated" : "deactivated")} successfully",
                    PermissionId = permission.Id
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting permission status {PermissionId}", permissionId);
                return new PermissionOperationResult
                {
                    Success = false,
                    Message = $"Failed to update permission status: {ex.Message}"
                };
            }
        }

        #endregion

        #region Bulk Operations

        public async Task<BulkPermissionOperationResult> BulkCreateAsync(Guid tenantId, Guid userId, BulkCreatePermissionsRequest request)
        {
            var results = new List<BulkPermissionItem>();
            var successCount = 0;
            var failureCount = 0;

            try
            {
                // Generate permission codes for all resource x action combinations
                foreach (var resource in request.Resources)
                {
                    foreach (var action in request.Actions)
                    {
                        try
                        {
                            var code = request.AutoGenerateCode
                                ? string.Format(request.CodePattern ?? "{0}.{1}.{2}", request.Module, resource, action).ToUpper()
                                : $"{request.Module}.{resource}.{action}".ToUpper();

                            var name = $"{action} {resource}";
                            var description = $"Permission to {action} {resource} in {request.Module} module";

                            var createRequest = new CreatePermissionRequest
                            {
                                Code = code,
                                Name = name,
                                Description = description,
                                Module = request.Module,
                                ResourceType = resource,
                                Action = action,
                                Scope = request.Scope,
                                DataClassification = request.DataClassification,
                                DepartmentSpecific = request.DepartmentSpecific
                            };

                            var result = await CreateAsync(tenantId, userId, createRequest);

                            results.Add(new BulkPermissionItem
                            {
                                Code = code,
                                Success = result.Success,
                                Message = result.Message,
                                PermissionId = result.PermissionId
                            });

                            if (result.Success)
                                successCount++;
                            else
                                failureCount++;
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error in bulk create for {Resource}.{Action}", resource, action);
                            results.Add(new BulkPermissionItem
                            {
                                Code = $"{resource}.{action}",
                                Success = false,
                                Message = ex.Message
                            });
                            failureCount++;
                        }
                    }
                }

                return new BulkPermissionOperationResult
                {
                    TotalProcessed = results.Count,
                    SuccessCount = successCount,
                    FailureCount = failureCount,
                    Results = results,
                    Summary = $"Created {successCount} permissions, {failureCount} failed"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk permission create");
                throw;
            }
        }

        public async Task<BulkPermissionOperationResult> BulkSetActiveStatusAsync(Guid tenantId, Guid userId, List<Guid> permissionIds, bool isActive)
        {
            var results = new List<BulkPermissionItem>();
            var successCount = 0;
            var failureCount = 0;

            try
            {
                foreach (var permissionId in permissionIds)
                {
                    var result = await SetActiveStatusAsync(tenantId, userId, permissionId, isActive);

                    results.Add(new BulkPermissionItem
                    {
                        PermissionId = permissionId,
                        Success = result.Success,
                        Message = result.Message
                    });

                    if (result.Success)
                        successCount++;
                    else
                        failureCount++;
                }

                return new BulkPermissionOperationResult
                {
                    TotalProcessed = permissionIds.Count,
                    SuccessCount = successCount,
                    FailureCount = failureCount,
                    Results = results,
                    Summary = $"{(isActive ? "Activated" : "Deactivated")} {successCount} permissions, {failureCount} failed"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk status update");
                throw;
            }
        }

        #endregion

        #region Permission Matrix

        public async Task<PermissionMatrixDto> GetPermissionMatrixAsync(Guid tenantId, string module = null)
        {
            try
            {
                var query = _context.Permissions
                    .Where(p => p.TenantId == tenantId && p.DeletedAt == null);

                if (!string.IsNullOrWhiteSpace(module))
                    query = query.Where(p => p.Module == module);

                var permissions = await query.ToListAsync();

                // Get unique resources and actions
                var resources = permissions.Select(p => p.ResourceType).Distinct().OrderBy(r => r).ToList();
                var actions = permissions.Select(p => p.Action).Distinct().OrderBy(a => a).ToList();

                // Build matrix cells
                var cells = new List<PermissionMatrixCellDto>();
                var permissionDict = permissions.ToDictionary(p => $"{p.ResourceType}|{p.Action}", p => p);

                foreach (var resource in resources)
                {
                    foreach (var action in actions)
                    {
                        var key = $"{resource}|{action}";
                        var permission = permissionDict.ContainsKey(key) ? permissionDict[key] : null;

                        var roleCount = 0;
                        if (permission != null)
                        {
                            roleCount = await _context.Set<RolePermission>()
                                .Where(rp => rp.PermissionId == permission.Id)
                                .CountAsync();
                        }

                        cells.Add(new PermissionMatrixCellDto
                        {
                            Resource = resource,
                            Action = action,
                            PermissionId = permission?.Id,
                            PermissionCode = permission?.Code,
                            PermissionName = permission?.Name,
                            Exists = permission != null,
                            AssignedToRoles = roleCount
                        });
                    }
                }

                // Group by module
                var moduleGroups = permissions
                    .GroupBy(p => p.Module)
                    .ToDictionary(
                        g => g.Key,
                        g => new ModulePermissionsDto
                        {
                            Module = g.Key,
                            TotalPermissions = g.Count(),
                            ActivePermissions = g.Count(p => p.IsActive)
                        });

                return new PermissionMatrixDto
                {
                    Resources = resources,
                    Actions = actions,
                    Cells = cells,
                    ModuleGroups = moduleGroups,
                    TotalPermissions = permissions.Count(),
                    TotalPossibleCombinations = resources.Count() * actions.Count()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating permission matrix");
                throw;
            }
        }

        public async Task<RolePermissionMatrixDto> GetRolePermissionMatrixAsync(Guid tenantId, Guid roleId)
        {
            try
            {
                var role = await _context.Roles
                    .Where(r => r.Id == roleId && r.TenantId == tenantId && r.DeletedAt == null)
                    .FirstOrDefaultAsync();

                if (role == null)
                    return null;

                // Get all permissions for this role
                var rolePermissions = await _context.Set<RolePermission>()
                    .Where(rp => rp.RoleId == roleId)
                    .Join(_context.Permissions,
                        rp => rp.PermissionId,
                        p => p.Id,
                        (rp, p) => p)
                    .Where(p => p.DeletedAt == null)
                    .ToListAsync();

                // Group by module
                var modulePermissions = rolePermissions
                    .GroupBy(p => p.Module)
                    .Select(g => new ModulePermissionsDto
                    {
                        Module = g.Key,
                        Permissions = g.Select(p => new PermissionDto
                        {
                            Id = p.Id,
                            Code = p.Code,
                            Name = p.Name,
                            Description = p.Description,
                            Module = p.Module,
                            ResourceType = p.ResourceType,
                            Action = p.Action,
                            Scope = p.Scope,
                            DataClassification = p.DataClassification,
                            IsActive = p.IsActive,
                            IsSystemPermission = p.IsSystemPermission ?? false,
                            DepartmentSpecific = p.DepartmentSpecific ?? false,
                            CreatedAt = p.CreatedAt
                        }).ToList(),
                        TotalPermissions = g.Count(),
                        ActivePermissions = g.Count(p => p.IsActive)
                    })
                    .ToList();

                return new RolePermissionMatrixDto
                {
                    RoleId = role.Id,
                    RoleName = role.Name,
                    ModulePermissions = modulePermissions,
                    TotalPermissions = rolePermissions.Count(),
                    ActivePermissions = rolePermissions.Count(p => p.IsActive)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating role permission matrix for role {RoleId}", roleId);
                throw;
            }
        }

        public async Task<Dictionary<string, ModulePermissionsDto>> GetPermissionsByModuleAsync(Guid tenantId)
        {
            try
            {
                var permissions = await _context.Permissions
                    .Where(p => p.TenantId == tenantId && p.DeletedAt == null)
                    .ToListAsync();

                var moduleGroups = permissions
                    .GroupBy(p => p.Module)
                    .ToDictionary(
                        g => g.Key,
                        g => new ModulePermissionsDto
                        {
                            Module = g.Key,
                            Permissions = g.Select(p => new PermissionDto
                            {
                                Id = p.Id,
                                Code = p.Code,
                                Name = p.Name,
                                Description = p.Description,
                                Module = p.Module,
                                ResourceType = p.ResourceType,
                                Action = p.Action,
                                Scope = p.Scope,
                                DataClassification = p.DataClassification,
                                IsActive = p.IsActive,
                                IsSystemPermission = p.IsSystemPermission ?? false,
                                DepartmentSpecific = p.DepartmentSpecific ?? false,
                                CreatedAt = p.CreatedAt
                            }).ToList(),
                            TotalPermissions = g.Count(),
                            ActivePermissions = g.Count(p => p.IsActive)
                        });

                return moduleGroups;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting permissions by module");
                throw;
            }
        }

        #endregion

        #region Resource-Based Operations

        public async Task<ResourcePermissionDto> GetResourcePermissionsAsync(Guid tenantId, string resourceType)
        {
            try
            {
                var permissions = await _context.Permissions
                    .Where(p => p.TenantId == tenantId && p.ResourceType == resourceType && p.DeletedAt == null)
                    .ToListAsync();

                var actions = permissions.Select(p => p.Action).Distinct().ToList();
                var scopes = permissions.Select(p => p.Scope).Distinct().ToList();

                var permissionDtos = permissions.Select(p => new PermissionDto
                {
                    Id = p.Id,
                    Code = p.Code,
                    Name = p.Name,
                    Description = p.Description,
                    Module = p.Module,
                    ResourceType = p.ResourceType,
                    Action = p.Action,
                    Scope = p.Scope,
                    DataClassification = p.DataClassification,
                    IsActive = p.IsActive,
                    IsSystemPermission = p.IsSystemPermission ?? false,
                    DepartmentSpecific = p.DepartmentSpecific ?? false,
                    CreatedAt = p.CreatedAt
                }).ToList();

                return new ResourcePermissionDto
                {
                    ResourceType = resourceType,
                    AvailableActions = actions,
                    AvailableScopes = scopes,
                    Permissions = permissionDtos
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting resource permissions for {ResourceType}", resourceType);
                throw;
            }
        }

        public async Task<List<ResourcePermissionTemplateDto>> GetResourceTemplatesAsync(Guid tenantId)
        {
            try
            {
                var templates = new List<ResourcePermissionTemplateDto>
                {
                    new ResourcePermissionTemplateDto
                    {
                        ResourceType = "Patient",
                        TemplateName = "Patient Management",
                        StandardActions = new List<string> { "CREATE", "READ", "UPDATE", "DELETE", "VIEW_PHI", "EXPORT" },
                        CustomActions = new List<string> { "ADMIT", "DISCHARGE", "TRANSFER", "MERGE" },
                        ActionDescriptions = new Dictionary<string, string>
                        {
                            { "CREATE", "Create new patient records" },
                            { "READ", "View patient basic information" },
                            { "UPDATE", "Modify patient records" },
                            { "DELETE", "Delete patient records (soft)" },
                            { "VIEW_PHI", "Access protected health information" },
                            { "EXPORT", "Export patient data" },
                            { "ADMIT", "Admit patient to hospital" },
                            { "DISCHARGE", "Discharge patient from hospital" }
                        }
                    },
                    new ResourcePermissionTemplateDto
                    {
                        ResourceType = "Appointment",
                        TemplateName = "Appointment Scheduling",
                        StandardActions = new List<string> { "CREATE", "READ", "UPDATE", "DELETE", "CANCEL", "RESCHEDULE" },
                        CustomActions = new List<string> { "CONFIRM", "CHECK_IN", "NO_SHOW" },
                        ActionDescriptions = new Dictionary<string, string>
                        {
                            { "CREATE", "Schedule new appointments" },
                            { "READ", "View appointment details" },
                            { "UPDATE", "Modify appointment details" },
                            { "DELETE", "Delete appointments" },
                            { "CANCEL", "Cancel scheduled appointments" },
                            { "RESCHEDULE", "Change appointment date/time" }
                        }
                    },
                    new ResourcePermissionTemplateDto
                    {
                        ResourceType = "Department",
                        TemplateName = "Department Management",
                        StandardActions = new List<string> { "CREATE", "READ", "UPDATE", "DELETE", "LIST" },
                        CustomActions = new List<string> { "MANAGE_STAFF", "VIEW_STATS", "CONFIGURE" },
                        ActionDescriptions = new Dictionary<string, string>
                        {
                            { "CREATE", "Create new departments" },
                            { "READ", "View department details" },
                            { "UPDATE", "Modify department information" },
                            { "DELETE", "Delete departments" },
                            { "MANAGE_STAFF", "Assign/remove staff from department" }
                        }
                    },
                    new ResourcePermissionTemplateDto
                    {
                        ResourceType = "User",
                        TemplateName = "User Management",
                        StandardActions = new List<string> { "CREATE", "READ", "UPDATE", "DELETE", "LIST" },
                        CustomActions = new List<string> { "RESET_PASSWORD", "ASSIGN_ROLES", "LOCK_UNLOCK", "VIEW_AUDIT" },
                        ActionDescriptions = new Dictionary<string, string>
                        {
                            { "CREATE", "Create new user accounts" },
                            { "READ", "View user details" },
                            { "UPDATE", "Modify user information" },
                            { "DELETE", "Delete user accounts" },
                            { "ASSIGN_ROLES", "Assign roles to users" }
                        }
                    }
                };

                return templates;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting resource templates");
                throw;
            }
        }

        public async Task<List<PermissionDto>> GetByModuleAsync(Guid tenantId, string module)
        {
            try
            {
                var permissions = await _context.Permissions
                    .Where(p => p.TenantId == tenantId && p.Module == module && p.DeletedAt == null)
                    .ToListAsync();

                return permissions.Select(p => new PermissionDto
                {
                    Id = p.Id,
                    Code = p.Code,
                    Name = p.Name,
                    Description = p.Description,
                    Module = p.Module,
                    ResourceType = p.ResourceType,
                    Action = p.Action,
                    Scope = p.Scope,
                    DataClassification = p.DataClassification,
                    IsActive = p.IsActive,
                    IsSystemPermission = p.IsSystemPermission ?? false,
                    DepartmentSpecific = p.DepartmentSpecific ?? false,
                    CreatedAt = p.CreatedAt
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting permissions by module {Module}", module);
                throw;
            }
        }

        public async Task<List<PermissionDto>> GetByResourceAsync(Guid tenantId, string resource)
        {
            try
            {
                var permissions = await _context.Permissions
                    .Where(p => p.TenantId == tenantId && p.ResourceType == resource && p.DeletedAt == null)
                    .ToListAsync();

                return permissions.Select(p => new PermissionDto
                {
                    Id = p.Id,
                    Code = p.Code,
                    Name = p.Name,
                    Description = p.Description,
                    Module = p.Module,
                    ResourceType = p.ResourceType,
                    Action = p.Action,
                    Scope = p.Scope,
                    DataClassification = p.DataClassification,
                    IsActive = p.IsActive,
                    IsSystemPermission = p.IsSystemPermission ?? false,
                    DepartmentSpecific = p.DepartmentSpecific ?? false,
                    CreatedAt = p.CreatedAt
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting permissions by resource {Resource}", resource);
                throw;
            }
        }

        #endregion

        #region Access Control (Delegates to IPermissionService)

        public async Task<PermissionCheckResult> CheckPermissionAsync(Guid tenantId, CheckPermissionRequest request)
        {
            try
            {
                var hasPermission = await _permissionService.HasPermissionAsync(
                    request.UserId, request.PermissionCode, tenantId);

                if (!hasPermission)
                {
                    return new PermissionCheckResult
                    {
                        HasPermission = false,
                        PermissionCode = request.PermissionCode,
                        Reason = "Permission not granted",
                        Scope = "None"
                    };
                }

                // Get granting roles
                // FIXED: Removed IsActive filters as these columns don't exist in database
                var grantingRoles = await _context.Set<AppUserRole>()
                    .Where(ur => ur.UserId == request.UserId)
                    .Join(_context.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => new { UserRole = ur, Role = r })
                    .Where(x => x.Role.DeletedAt == null)
                    .Join(_context.Set<RolePermission>(), x => x.Role.Id, rp => rp.RoleId, (x, rp) => new { x.Role, RolePermission = rp })
                    .Join(_context.Permissions, x => x.RolePermission.PermissionId, p => p.Id, (x, p) => new { x.Role, Permission = p })
                    .Where(x => x.Permission.Code == request.PermissionCode)
                    .Select(x => x.Role.Name)
                    .Distinct()
                    .ToListAsync();

                var permission = await _context.Permissions
                    .FirstOrDefaultAsync(p => p.Code == request.PermissionCode && p.TenantId == tenantId);

                return new PermissionCheckResult
                {
                    HasPermission = true,
                    PermissionCode = request.PermissionCode,
                    Reason = "Permission granted",
                    GrantedBy = grantingRoles,
                    Scope = permission?.Scope ?? "Unknown",
                    Context = request.DepartmentId.HasValue 
                        ? new Dictionary<string, object> { { "DepartmentId", request.DepartmentId.Value } }
                        : null
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking permission {Code} for user {UserId}", request.PermissionCode, request.UserId);
                throw;
            }
        }

        public async Task<UserPermissionsResponse> GetUserPermissionsAsync(Guid tenantId, GetUserPermissionsRequest request)
        {
            try
            {
                // Get basic permission codes
                var permissionCodes = await _permissionService.GetUserPermissionsAsync(request.UserId, tenantId);

                // Get detailed permissions
                var query = _context.Permissions
                    .Where(p => p.TenantId == tenantId && permissionCodes.Contains(p.Code) && p.DeletedAt == null);

                if (!string.IsNullOrWhiteSpace(request.Module))
                    query = query.Where(p => p.Module == request.Module);

                if (!string.IsNullOrWhiteSpace(request.ResourceType))
                    query = query.Where(p => p.ResourceType == request.ResourceType);

                var permissions = await query.ToListAsync();

                var permissionDtos = permissions.Select(p => new UserPermissionDto
                {
                    PermissionId = p.Id,
                    Code = p.Code,
                    Name = p.Name,
                    Module = p.Module,
                    ResourceType = p.ResourceType,
                    Action = p.Action,
                    Scope = p.Scope
                }).ToList();

                // Group by module
                var modulePermissions = permissionDtos
                    .GroupBy(p => p.Module)
                    .ToDictionary(g => g.Key, g => g.ToList());

                var user = await _context.Users.FindAsync(request.UserId);

                return new UserPermissionsResponse
                {
                    UserId = request.UserId,
                    UserName = user?.UserName ?? "Unknown",
                    Permissions = permissionDtos,
                    ModulePermissions = modulePermissions,
                    TotalPermissions = permissionDtos.Count(),
                    RetrievedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user permissions for {UserId}", request.UserId);
                throw;
            }
        }

        public async Task<Dictionary<string, PermissionCheckResult>> CheckMultiplePermissionsAsync(Guid tenantId, Guid userId, List<string> permissionCodes)
        {
            var results = new Dictionary<string, PermissionCheckResult>();

            foreach (var code in permissionCodes)
            {
                try
                {
                    var result = await CheckPermissionAsync(tenantId, new CheckPermissionRequest
                    {
                        UserId = userId,
                        PermissionCode = code
                    });

                    results[code] = result;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error checking permission {Code}", code);
                    results[code] = new PermissionCheckResult
                    {
                        HasPermission = false,
                        PermissionCode = code,
                        Reason = $"Error: {ex.Message}"
                    };
                }
            }

            return results;
        }

        #endregion

        #region Validation

        public async Task<PermissionConflictCheckDto> CheckConflictsAsync(Guid tenantId, Guid permissionId)
        {
            try
            {
                var permission = await _context.Permissions
                    .Where(p => p.Id == permissionId && p.TenantId == tenantId && p.DeletedAt == null)
                    .FirstOrDefaultAsync();

                if (permission == null || permission.ConflictsWith == null || !permission.ConflictsWith.Any())
                {
                    return new PermissionConflictCheckDto
                    {
                        PermissionId = permissionId,
                        Code = permission?.Code,
                        HasConflicts = false,
                        Conflicts = new List<PermissionConflictDto>()
                    };
                }

                var conflicts = new List<PermissionConflictDto>();

                // Check if user has both this permission and any conflicting ones via roles
                var conflictingPermissions = await _context.Permissions
                    .Where(p => p.TenantId == tenantId && permission.ConflictsWith.Contains(p.Code))
                    .ToListAsync();

                foreach (var conflicting in conflictingPermissions)
                {
                    conflicts.Add(new PermissionConflictDto
                    {
                        ConflictingPermissionId = conflicting.Id,
                        ConflictingPermissionCode = conflicting.Code,
                        ConflictingPermissionName = conflicting.Name,
                        Reason = $"Permission '{permission.Code}' conflicts with '{conflicting.Code}' - mutual exclusivity required",
                        Severity = "High"
                    });
                }

                return new PermissionConflictCheckDto
                {
                    PermissionId = permissionId,
                    Code = permission.Code,
                    HasConflicts = conflicts.Any(),
                    Conflicts = conflicts
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking conflicts for permission {PermissionId}", permissionId);
                throw;
            }
        }

        public async Task<PermissionOperationResult> ValidateDependenciesAsync(Guid tenantId, Guid permissionId)
        {
            try
            {
                var permission = await _context.Permissions
                    .Where(p => p.Id == permissionId && p.TenantId == tenantId && p.DeletedAt == null)
                    .FirstOrDefaultAsync();

                if (permission == null)
                {
                    return new PermissionOperationResult
                    {
                        Success = false,
                        Message = "Permission not found"
                    };
                }

                var dependencies = string.IsNullOrEmpty(permission.Dependencies) 
                    ? new List<string>() 
                    : JsonSerializer.Deserialize<List<string>>(permission.Dependencies) ?? new List<string>();

                if (!dependencies.Any())
                {
                    return new PermissionOperationResult
                    {
                        Success = true,
                        Message = "No dependencies to validate"
                    };
                }

                // Check if all dependency permissions exist
                var missingDependencies = new List<string>();
                foreach (var depCode in dependencies)
                {
                    var exists = await _context.Permissions
                        .AnyAsync(p => p.Code == depCode && p.TenantId == tenantId && p.DeletedAt == null);

                    if (!exists)
                        missingDependencies.Add(depCode);
                }

                if (missingDependencies.Any())
                {
                    return new PermissionOperationResult
                    {
                        Success = false,
                        Message = $"Missing dependencies: {string.Join(", ", missingDependencies)}",
                        Errors = missingDependencies
                    };
                }

                return new PermissionOperationResult
                {
                    Success = true,
                    Message = "All dependencies are valid"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating dependencies for permission {PermissionId}", permissionId);
                throw;
            }
        }

        #endregion

        #region Statistics

        public async Task<PermissionStatistics> GetStatisticsAsync(Guid tenantId)
        {
            try
            {
                var permissions = await _context.Permissions
                    .Where(p => p.TenantId == tenantId && p.DeletedAt == null)
                    .ToListAsync();

                // Get usage counts
                var usageCounts = await _context.Set<RolePermission>()
                    .GroupBy(rp => rp.PermissionId)
                    .Select(g => new { PermissionId = g.Key, Count = g.Count() })
                    .ToDictionaryAsync(x => x.PermissionId, x => x.Count);

                var permissionUsage = permissions.Select(p => new PermissionUsageStatDto
                {
                    PermissionId = p.Id,
                    Code = p.Code,
                    Name = p.Name,
                    Module = p.Module,
                    AssignedToRoles = usageCounts.GetValueOrDefault(p.Id, 0)
                }).ToList();

                var totalRoles = await _context.Roles.CountAsync(r => r.TenantId == tenantId && r.DeletedAt == null);
                permissionUsage.ForEach(p => p.UsagePercentage = totalRoles > 0 ? (p.AssignedToRoles * 100.0 / totalRoles) : 0);

                return new PermissionStatistics
                {
                    TotalPermissions = permissions.Count(),
                    ActivePermissions = permissions.Count(p => p.IsActive),
                    InactivePermissions = permissions.Count(p => !p.IsActive),
                    SystemPermissions = permissions.Count(p => p.IsSystemPermission ?? false),
                    CustomPermissions = permissions.Count(p => p.IsCustom ?? false),
                    ModuleBreakdown = permissions.GroupBy(p => p.Module).ToDictionary(g => g.Key, g => g.Count()),
                    ScopeBreakdown = permissions.GroupBy(p => p.Scope).ToDictionary(g => g.Key, g => g.Count()),
                    ActionBreakdown = permissions.GroupBy(p => p.Action).ToDictionary(g => g.Key, g => g.Count()),
                    ClassificationBreakdown = permissions.GroupBy(p => p.DataClassification).ToDictionary(g => g.Key, g => g.Count()),
                    MostUsedPermissions = permissionUsage.OrderByDescending(p => p.AssignedToRoles).Take(10).ToList(),
                    LeastUsedPermissions = permissionUsage.Where(p => p.AssignedToRoles > 0).OrderBy(p => p.AssignedToRoles).Take(10).ToList(),
                    UnusedPermissions = permissionUsage.Where(p => p.AssignedToRoles == 0).ToList()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting permission statistics");
                throw;
            }
        }

        public async Task<List<PermissionDto>> SearchPermissionsAsync(Guid tenantId, string searchTerm)
        {
            try
            {
                var search = searchTerm.ToLower();
                var permissions = await _context.Permissions
                    .Where(p => p.TenantId == tenantId && p.DeletedAt == null &&
                        (p.Code.ToLower().Contains(search) ||
                         p.Name.ToLower().Contains(search) ||
                         p.Description.ToLower().Contains(search) ||
                         p.Module.ToLower().Contains(search)))
                    .Take(50)
                    .ToListAsync();

                return permissions.Select(p => new PermissionDto
                {
                    Id = p.Id,
                    Code = p.Code,
                    Name = p.Name,
                    Description = p.Description,
                    Module = p.Module,
                    ResourceType = p.ResourceType,
                    Action = p.Action,
                    Scope = p.Scope,
                    DataClassification = p.DataClassification,
                    IsActive = p.IsActive,
                    IsSystemPermission = p.IsSystemPermission ?? false,
                    DepartmentSpecific = p.DepartmentSpecific ?? false,
                    CreatedAt = p.CreatedAt
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching permissions with term {SearchTerm}", searchTerm);
                throw;
            }
        }

        public async Task<List<PermissionDto>> GetUnusedPermissionsAsync(Guid tenantId)
        {
            try
            {
                var usedPermissionIds = await _context.Set<RolePermission>()
                    .Select(rp => rp.PermissionId)
                    .Distinct()
                    .ToListAsync();

                var unusedPermissions = await _context.Permissions
                    .Where(p => p.TenantId == tenantId && p.DeletedAt == null && !usedPermissionIds.Contains(p.Id))
                    .ToListAsync();

                return unusedPermissions.Select(p => new PermissionDto
                {
                    Id = p.Id,
                    Code = p.Code,
                    Name = p.Name,
                    Description = p.Description,
                    Module = p.Module,
                    ResourceType = p.ResourceType,
                    Action = p.Action,
                    Scope = p.Scope,
                    DataClassification = p.DataClassification,
                    IsActive = p.IsActive,
                    IsSystemPermission = p.IsSystemPermission ?? false,
                    DepartmentSpecific = p.DepartmentSpecific ?? false,
                    CreatedAt = p.CreatedAt
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting unused permissions");
                throw;
            }
        }

        #endregion

        #region Export

        public async Task<PermissionReportDto> GenerateReportAsync(Guid tenantId, PermissionFilters filters)
        {
            try
            {
                var listResponse = await GetAllAsync(tenantId, filters);
                var statistics = await GetStatisticsAsync(tenantId);

                var groupedByModule = listResponse.Permissions
                    .GroupBy(p => p.Module)
                    .ToDictionary(g => g.Key, g => g.ToList());

                return new PermissionReportDto
                {
                    ReportTitle = "Permission Management Report",
                    GeneratedAt = DateTime.UtcNow,
                    GeneratedBy = Guid.Empty.ToString(), // Should be passed from controller
                    Statistics = statistics,
                    Permissions = listResponse.Permissions,
                    GroupedByModule = groupedByModule
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating permission report");
                throw;
            }
        }

        public async Task<byte[]> ExportPermissionsAsync(Guid tenantId, ExportPermissionsRequest request)
        {
            try
            {
                var listResponse = await GetAllAsync(tenantId, request.Filters ?? new PermissionFilters());

                if (request.Format.ToLower() == "json")
                {
                    var json = System.Text.Json.JsonSerializer.Serialize(listResponse.Permissions, new System.Text.Json.JsonSerializerOptions
                    {
                        WriteIndented = true
                    });
                    return System.Text.Encoding.UTF8.GetBytes(json);
                }
                else if (request.Format.ToLower() == "csv")
                {
                    var csv = new System.Text.StringBuilder();
                    csv.AppendLine("Code,Name,Module,Resource,Action,Scope,DataClassification,IsActive,IsSystem,DepartmentSpecific");

                    foreach (var p in listResponse.Permissions)
                    {
                        csv.AppendLine($"\"{p.Code}\",\"{p.Name}\",\"{p.Module}\",\"{p.ResourceType}\",\"{p.Action}\",\"{p.Scope}\",\"{p.DataClassification}\",{p.IsActive},{p.IsSystemPermission},{p.DepartmentSpecific}");
                    }

                    return System.Text.Encoding.UTF8.GetBytes(csv.ToString());
                }

                throw new NotSupportedException($"Export format '{request.Format}' not supported");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting permissions");
                throw;
            }
        }

        #endregion

        #region Helper Methods

        private async Task LogAudit(Guid tenantId, Guid userId, string action, string entityType, Guid entityId, string description)
        {
            try
            {
                var auditLog = new AuthService.Models.Domain.AuditLog
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    UserId = userId,
                    Action = action,
                    EntityType = entityType,
                    EntityId = entityId,
                    Description = description,
                    Timestamp = DateTime.UtcNow,
                    IpAddress = "System"
                };

                _context.AuditLogs.Add(auditLog);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging audit for {Action} on {EntityType} {EntityId}", action, entityType, entityId);
            }
        }

        #endregion
    }
}
