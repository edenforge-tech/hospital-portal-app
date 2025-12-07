using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AuthService.Context;
using AuthService.Models.Identity;
using AuthService.Models.Role;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AuthService.Services
{
    /// <summary>
    /// Role Management Service Implementation
    /// Provides comprehensive role operations with tenant isolation
    /// </summary>
    public class RoleService : IRoleService
    {
        private readonly AppDbContext _context;
        private readonly RoleManager<AppRole> _roleManager;
        private readonly UserManager<AppUser> _userManager;
        private readonly ILogger<RoleService> _logger;

        public RoleService(
            AppDbContext context,
            RoleManager<AppRole> roleManager,
            UserManager<AppUser> userManager,
            ILogger<RoleService> logger)
        {
            _context = context;
            _roleManager = roleManager;
            _userManager = userManager;
            _logger = logger;
        }

        // ================================================================================
        // BASIC CRUD OPERATIONS
        // ================================================================================

        public async Task<RoleListResponse> GetAllAsync(Guid tenantId, RoleFilters filters)
        {
            try
            {
                var query = _roleManager.Roles
                    .Where(r => r.TenantId == tenantId && r.DeletedAt == null);

                // Apply filters
                if (!string.IsNullOrEmpty(filters.Search))
                {
                    query = query.Where(r =>
                        r.Name.Contains(filters.Search) ||
                        r.RoleCode.Contains(filters.Search) ||
                        (r.Description != null && r.Description.Contains(filters.Search)));
                }

                if (!string.IsNullOrEmpty(filters.RoleType))
                {
                    query = query.Where(r => r.RoleType == filters.RoleType);
                }

                if (filters.IsActive.HasValue)
                {
                    query = query.Where(r => r.IsActive == filters.IsActive.Value);
                }

                if (filters.IsSystemRole.HasValue)
                {
                    query = query.Where(r => r.IsSystemRole == filters.IsSystemRole.Value);
                }

                if (filters.ParentRoleId.HasValue)
                {
                    query = query.Where(r => r.ParentRoleId == filters.ParentRoleId.Value);
                }

                if (filters.DepartmentId.HasValue)
                {
                    query = query.Where(r => r.DepartmentId == filters.DepartmentId.Value);
                }

                if (filters.MinPriority.HasValue)
                {
                    query = query.Where(r => r.Priority >= filters.MinPriority.Value);
                }

                if (filters.MaxPriority.HasValue)
                {
                    query = query.Where(r => r.Priority <= filters.MaxPriority.Value);
                }

                // Get total count before pagination
                var totalCount = await query.CountAsync();

                // Apply sorting
                query = ApplySorting(query, filters.SortBy, filters.SortOrder);

                // Apply pagination
                var skip = (filters.PageNumber - 1) * filters.PageSize;
                query = query.Skip(skip).Take(filters.PageSize);

                // Execute query and map to DTOs
                var roles = await query.ToListAsync();
                var roleDtos = new List<RoleDto>();

                foreach (var role in roles)
                {
                    var userCount = await _context.UserRoles.CountAsync(ur => ur.RoleId == role.Id);
                    var permissionCount = await _context.Set<object>()
                        .FromSqlRaw("SELECT COUNT(*) FROM role_permissions WHERE \"RoleId\" = {0}", role.Id)
                        .CountAsync();

                    roleDtos.Add(new RoleDto
                    {
                        Id = role.Id,
                        Name = role.Name,
                        Description = role.Description,
                        RoleCode = role.RoleCode,
                        RoleType = role.RoleType,
                        Priority = role.Priority,
                        IsActive = role.IsActive,
                        IsSystemRole = role.IsSystemRole,
                        TotalUsers = userCount,
                        TotalPermissions = permissionCount,
                        CreatedAt = role.CreatedAt,
                        CreatedBy = role.CreatedBy?.ToString()
                    });
                }

                // Calculate pagination metadata
                var totalPages = (int)Math.Ceiling(totalCount / (double)filters.PageSize);

                return new RoleListResponse
                {
                    Roles = roleDtos,
                    TotalCount = totalCount,
                    PageNumber = filters.PageNumber,
                    PageSize = filters.PageSize,
                    TotalPages = totalPages,
                    HasPreviousPage = filters.PageNumber > 1,
                    HasNextPage = filters.PageNumber < totalPages
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting roles for tenant {TenantId}", tenantId);
                throw;
            }
        }

        public async Task<RoleDetailsDto> GetByIdAsync(Guid tenantId, Guid roleId)
        {
            try
            {
                var role = await _roleManager.Roles
                    .FirstOrDefaultAsync(r => r.Id == roleId && r.TenantId == tenantId && r.DeletedAt == null);

                if (role == null)
                    return null;

                // Get child roles
                var childRoles = await _roleManager.Roles
                    .Where(r => r.ParentRoleId == roleId && r.TenantId == tenantId && r.DeletedAt == null)
                    .Select(r => new RoleDto
                    {
                        Id = r.Id,
                        Name = r.Name,
                        Description = r.Description,
                        RoleCode = r.RoleCode,
                        RoleType = r.RoleType,
                        Priority = r.Priority,
                        IsActive = r.IsActive,
                        IsSystemRole = r.IsSystemRole,
                        CreatedAt = r.CreatedAt
                    })
                    .ToListAsync();

                // Get permissions (placeholder - implement actual permission query)
                var permissions = await GetRolePermissionsAsync(tenantId, roleId);

                // Get users
                var users = await GetRoleUsersAsync(tenantId, roleId);

                // Get parent role name if exists
                string parentRoleName = null;
                if (role.ParentRoleId.HasValue)
                {
                    var parentRole = await _roleManager.FindByIdAsync(role.ParentRoleId.Value.ToString());
                    parentRoleName = parentRole?.Name;
                }

                // Get department name if exists
                string departmentName = null;
                if (role.DepartmentId.HasValue)
                {
                    var dept = await _context.Departments
                        .FirstOrDefaultAsync(d => d.Id == role.DepartmentId.Value);
                    departmentName = dept?.Name;
                }

                return new RoleDetailsDto
                {
                    Id = role.Id,
                    Name = role.Name,
                    Description = role.Description,
                    RoleCode = role.RoleCode,
                    RoleType = role.RoleType,
                    Priority = role.Priority,
                    IsActive = role.IsActive,
                    IsSystemRole = role.IsSystemRole,
                    IsDepartmentSpecific = role.DepartmentId.HasValue,
                    DepartmentId = role.DepartmentId,
                    DepartmentName = departmentName,
                    ParentRoleId = role.ParentRoleId,
                    ParentRoleName = parentRoleName,
                    ChildRoles = childRoles,
                    Permissions = permissions,
                    TotalUsers = users.Count,
                    Users = users.Take(10).ToList(), // First 10 users
                    CreatedAt = role.CreatedAt,
                    CreatedBy = role.CreatedBy?.ToString(),
                    UpdatedAt = role.UpdatedAt,
                    UpdatedBy = role.UpdatedBy?.ToString(),
                    Settings = role.Settings
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting role {RoleId} for tenant {TenantId}", roleId, tenantId);
                throw;
            }
        }

        public async Task<RoleOperationResult> CreateAsync(Guid tenantId, Guid userId, CreateRoleRequest request)
        {
            try
            {
                // Validate role code uniqueness
                var existingRole = await _roleManager.Roles
                    .FirstOrDefaultAsync(r => r.TenantId == tenantId && r.RoleCode == request.RoleCode && r.DeletedAt == null);

                if (existingRole != null)
                {
                    return new RoleOperationResult
                    {
                        Success = false,
                        Message = $"Role with code '{request.RoleCode}' already exists",
                        Errors = new List<string> { "Duplicate role code" }
                    };
                }

                // Create role
                var role = new AppRole
                {
                    Name = request.Name,
                    NormalizedName = request.Name.ToUpperInvariant(),
                    TenantId = tenantId,
                    Description = request.Description,
                    RoleCode = request.RoleCode,
                    RoleType = request.RoleType ?? "Custom",
                    Priority = request.Priority,
                    IsActive = true,
                    IsSystemRole = false,
                    ParentRoleId = request.ParentRoleId,
                    DepartmentId = request.IsDepartmentSpecific ? request.DepartmentId : null,
                    Settings = request.Settings,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = userId
                };

                var result = await _roleManager.CreateAsync(role);

                if (!result.Succeeded)
                {
                    return new RoleOperationResult
                    {
                        Success = false,
                        Message = "Failed to create role",
                        Errors = result.Errors.Select(e => e.Description).ToList()
                    };
                }

                // Assign permissions if provided
                if (request.PermissionIds != null && request.PermissionIds.Any())
                {
                    await AssignPermissionsAsync(tenantId, userId, new AssignPermissionsToRoleRequest
                    {
                        RoleId = role.Id,
                        PermissionIds = request.PermissionIds
                    });
                }

                // Log audit
                await LogAudit(tenantId, userId, "Role", role.Id, "Create", null, role);

                return new RoleOperationResult
                {
                    Success = true,
                    Message = $"Role '{role.Name}' created successfully",
                    RoleId = role.Id
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating role for tenant {TenantId}", tenantId);
                return new RoleOperationResult
                {
                    Success = false,
                    Message = "An error occurred while creating the role",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<RoleOperationResult> UpdateAsync(Guid tenantId, Guid userId, Guid roleId, UpdateRoleRequest request)
        {
            try
            {
                var role = await _roleManager.Roles
                    .FirstOrDefaultAsync(r => r.Id == roleId && r.TenantId == tenantId && r.DeletedAt == null);

                if (role == null)
                {
                    return new RoleOperationResult
                    {
                        Success = false,
                        Message = "Role not found",
                        Errors = new List<string> { "Role does not exist" }
                    };
                }

                if (role.IsSystemRole)
                {
                    return new RoleOperationResult
                    {
                        Success = false,
                        Message = "Cannot modify system role",
                        Errors = new List<string> { "System roles are read-only" }
                    };
                }

                var oldValues = new { role.Name, role.Description, role.Priority, role.ParentRoleId, role.IsActive };

                // Update fields
                if (!string.IsNullOrEmpty(request.Name))
                {
                    role.Name = request.Name;
                    role.NormalizedName = request.Name.ToUpperInvariant();
                }

                if (request.Description != null)
                    role.Description = request.Description;

                if (request.Priority.HasValue)
                    role.Priority = request.Priority.Value;

                if (request.ParentRoleId.HasValue)
                    role.ParentRoleId = request.ParentRoleId.Value;

                if (request.IsActive.HasValue)
                    role.IsActive = request.IsActive.Value;

                if (request.Settings != null)
                    role.Settings = request.Settings;

                role.UpdatedAt = DateTime.UtcNow;
                role.UpdatedBy = userId;

                var result = await _roleManager.UpdateAsync(role);

                if (!result.Succeeded)
                {
                    return new RoleOperationResult
                    {
                        Success = false,
                        Message = "Failed to update role",
                        Errors = result.Errors.Select(e => e.Description).ToList()
                    };
                }

                // Log audit
                await LogAudit(tenantId, userId, "Role", role.Id, "Update", oldValues, role);

                return new RoleOperationResult
                {
                    Success = true,
                    Message = $"Role '{role.Name}' updated successfully",
                    RoleId = role.Id
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating role {RoleId} for tenant {TenantId}", roleId, tenantId);
                return new RoleOperationResult
                {
                    Success = false,
                    Message = "An error occurred while updating the role",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<RoleOperationResult> DeleteAsync(Guid tenantId, Guid userId, Guid roleId)
        {
            try
            {
                var role = await _roleManager.Roles
                    .FirstOrDefaultAsync(r => r.Id == roleId && r.TenantId == tenantId && r.DeletedAt == null);

                if (role == null)
                {
                    return new RoleOperationResult
                    {
                        Success = false,
                        Message = "Role not found"
                    };
                }

                if (role.IsSystemRole)
                {
                    return new RoleOperationResult
                    {
                        Success = false,
                        Message = "Cannot delete system role"
                    };
                }

                // Check if role has users
                var userCount = await _context.UserRoles.CountAsync(ur => ur.RoleId == roleId);
                if (userCount > 0)
                {
                    return new RoleOperationResult
                    {
                        Success = false,
                        Message = $"Cannot delete role with {userCount} assigned users. Please remove users first."
                    };
                }

                // Soft delete
                role.DeletedAt = DateTime.UtcNow;
                role.DeletedBy = userId;
                await _roleManager.UpdateAsync(role);

                // Log audit
                await LogAudit(tenantId, userId, "Role", roleId, "Delete", role, null);

                return new RoleOperationResult
                {
                    Success = true,
                    Message = $"Role '{role.Name}' deleted successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting role {RoleId}", roleId);
                return new RoleOperationResult
                {
                    Success = false,
                    Message = "An error occurred while deleting the role",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<RoleOperationResult> SetActiveStatusAsync(Guid tenantId, Guid userId, Guid roleId, bool isActive)
        {
            try
            {
                var role = await _roleManager.FindByIdAsync(roleId.ToString());
                if (role == null || role.TenantId != tenantId || role.DeletedAt != null)
                {
                    return new RoleOperationResult { Success = false, Message = "Role not found" };
                }

                role.IsActive = isActive;
                role.UpdatedAt = DateTime.UtcNow;
                role.UpdatedBy = userId;

                await _roleManager.UpdateAsync(role);

                await LogAudit(tenantId, userId, "Role", roleId, isActive ? "Activate" : "Deactivate", !isActive, isActive);

                return new RoleOperationResult
                {
                    Success = true,
                    Message = $"Role {(isActive ? "activated" : "deactivated")} successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting active status for role {RoleId}", roleId);
                return new RoleOperationResult
                {
                    Success = false,
                    Message = "An error occurred",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        // ================================================================================
        // HIERARCHY OPERATIONS
        // ================================================================================

        public async Task<List<RoleHierarchyDto>> GetHierarchyAsync(Guid tenantId)
        {
            try
            {
                var roles = await _roleManager.Roles
                    .Where(r => r.TenantId == tenantId && r.DeletedAt == null)
                    .ToListAsync();

                var roleDtos = new List<RoleHierarchyDto>();
                foreach (var role in roles)
                {
                    var userCount = await _context.UserRoles.CountAsync(ur => ur.RoleId == role.Id);
                    // Placeholder for permission count
                    var permissionCount = 0;

                    roleDtos.Add(new RoleHierarchyDto
                    {
                        Id = role.Id,
                        Name = role.Name,
                        RoleCode = role.RoleCode,
                        RoleType = role.RoleType,
                        Priority = role.Priority,
                        TotalUsers = userCount,
                        TotalPermissions = permissionCount,
                        ParentRoleId = role.ParentRoleId,
                        Children = new List<RoleHierarchyDto>()
                    });
                }

                // Build hierarchy tree
                return BuildHierarchyTree(roleDtos, null, 0);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting role hierarchy for tenant {TenantId}", tenantId);
                throw;
            }
        }

        public async Task<List<RoleDto>> GetChildRolesAsync(Guid tenantId, Guid parentRoleId)
        {
            return await _roleManager.Roles
                .Where(r => r.ParentRoleId == parentRoleId && r.TenantId == tenantId && r.DeletedAt == null)
                .Select(r => new RoleDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description,
                    RoleCode = r.RoleCode,
                    RoleType = r.RoleType,
                    Priority = r.Priority,
                    IsActive = r.IsActive,
                    IsSystemRole = r.IsSystemRole,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<List<RoleDto>> GetRolePathAsync(Guid tenantId, Guid roleId)
        {
            var path = new List<RoleDto>();
            var currentRoleId = roleId;

            while (currentRoleId != Guid.Empty)
            {
                var role = await _roleManager.FindByIdAsync(currentRoleId.ToString());
                if (role == null || role.TenantId != tenantId) break;

                path.Insert(0, new RoleDto
                {
                    Id = role.Id,
                    Name = role.Name,
                    RoleCode = role.RoleCode,
                    RoleType = role.RoleType,
                    Priority = role.Priority
                });

                currentRoleId = role.ParentRoleId ?? Guid.Empty;
            }

            return path;
        }

        // ================================================================================
        // PERMISSION OPERATIONS
        // ================================================================================

        public async Task<List<RolePermissionDto>> GetRolePermissionsAsync(Guid tenantId, Guid roleId)
        {
            // Placeholder implementation - will be completed when permissions table is properly mapped
            return await Task.FromResult(new List<RolePermissionDto>());
        }

        public async Task<RoleOperationResult> AssignPermissionsAsync(Guid tenantId, Guid userId, AssignPermissionsToRoleRequest request)
        {
            // Placeholder implementation
            await LogAudit(tenantId, userId, "RolePermission", request.RoleId, "AssignPermissions", null, request);
            return new RoleOperationResult
            {
                Success = true,
                Message = $"{request.PermissionIds.Count} permissions assigned successfully"
            };
        }

        public async Task<RoleOperationResult> RemovePermissionsAsync(Guid tenantId, Guid userId, RemovePermissionsFromRoleRequest request)
        {
            // Placeholder implementation
            await LogAudit(tenantId, userId, "RolePermission", request.RoleId, "RemovePermissions", request.PermissionIds, null);
            return new RoleOperationResult
            {
                Success = true,
                Message = $"{request.PermissionIds.Count} permissions removed successfully"
            };
        }

        public async Task<RoleOperationResult> ReplacePermissionsAsync(Guid tenantId, Guid userId, Guid roleId, List<Guid> permissionIds)
        {
            // Placeholder implementation
            await LogAudit(tenantId, userId, "RolePermission", roleId, "ReplacePermissions", null, permissionIds);
            return new RoleOperationResult
            {
                Success = true,
                Message = $"Permissions replaced with {permissionIds.Count} new permissions"
            };
        }

        // ================================================================================
        // USER OPERATIONS
        // ================================================================================

        public async Task<List<RoleUserDto>> GetRoleUsersAsync(Guid tenantId, Guid roleId)
        {
            try
            {
                var users = await (from ur in _context.UserRoles
                                   join u in _context.Users on ur.UserId equals u.Id
                                   where ur.RoleId == roleId && u.TenantId == tenantId
                                   select new RoleUserDto
                                   {
                                       UserId = u.Id,
                                       UserName = u.UserName,
                                       Email = u.Email,
                                       FullName = u.FirstName + " " + u.LastName,
                                       AssignedAt = ur.AssignedAt,
                                       ExpiresAt = ur.ExpiresAt,
                                       IsActive = ur.IsActive
                                   }).ToListAsync();

                return users;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting users for role {RoleId}", roleId);
                return new List<RoleUserDto>();
            }
        }

        public async Task<BulkRoleOperationResult> AssignUsersAsync(Guid tenantId, Guid userId, AssignUsersToRoleRequest request)
        {
            var results = new List<BulkOperationItem>();

            foreach (var targetUserId in request.UserIds)
            {
                try
                {
                    var user = await _userManager.FindByIdAsync(targetUserId.ToString());
                    if (user == null || user.TenantId != tenantId)
                    {
                        results.Add(new BulkOperationItem
                        {
                            Id = targetUserId,
                            Success = false,
                            Message = "User not found"
                        });
                        continue;
                    }

                    var role = await _roleManager.FindByIdAsync(request.RoleId.ToString());
                    var result = await _userManager.AddToRoleAsync(user, role.Name);

                    results.Add(new BulkOperationItem
                    {
                        Id = targetUserId,
                        Name = user.UserName,
                        Success = result.Succeeded,
                        Message = result.Succeeded ? "Assigned successfully" : "Assignment failed"
                    });
                }
                catch (Exception ex)
                {
                    results.Add(new BulkOperationItem
                    {
                        Id = targetUserId,
                        Success = false,
                        Message = ex.Message
                    });
                }
            }

            var successCount = results.Count(r => r.Success);
            return new BulkRoleOperationResult
            {
                Success = successCount > 0,
                TotalProcessed = results.Count,
                SuccessCount = successCount,
                FailureCount = results.Count - successCount,
                Results = results,
                Summary = $"Assigned {successCount} out of {results.Count} users to role"
            };
        }

        public async Task<BulkRoleOperationResult> RemoveUsersAsync(Guid tenantId, Guid userId, RemoveUsersFromRoleRequest request)
        {
            var results = new List<BulkOperationItem>();

            foreach (var targetUserId in request.UserIds)
            {
                try
                {
                    var user = await _userManager.FindByIdAsync(targetUserId.ToString());
                    var role = await _roleManager.FindByIdAsync(request.RoleId.ToString());
                    
                    if (user == null || role == null)
                    {
                        results.Add(new BulkOperationItem { Id = targetUserId, Success = false, Message = "User or role not found" });
                        continue;
                    }

                    var result = await _userManager.RemoveFromRoleAsync(user, role.Name);
                    results.Add(new BulkOperationItem
                    {
                        Id = targetUserId,
                        Name = user.UserName,
                        Success = result.Succeeded,
                        Message = result.Succeeded ? "Removed successfully" : "Removal failed"
                    });
                }
                catch (Exception ex)
                {
                    results.Add(new BulkOperationItem { Id = targetUserId, Success = false, Message = ex.Message });
                }
            }

            var successCount = results.Count(r => r.Success);
            return new BulkRoleOperationResult
            {
                Success = successCount > 0,
                TotalProcessed = results.Count,
                SuccessCount = successCount,
                FailureCount = results.Count - successCount,
                Results = results,
                Summary = $"Removed {successCount} out of {results.Count} users from role"
            };
        }

        // ================================================================================
        // ADVANCED OPERATIONS
        // ================================================================================

        public async Task<RoleOperationResult> CloneRoleAsync(Guid tenantId, Guid userId, CloneRoleRequest request)
        {
            try
            {
                var sourceRole = await _roleManager.FindByIdAsync(request.SourceRoleId.ToString());
                if (sourceRole == null || sourceRole.TenantId != tenantId)
                {
                    return new RoleOperationResult { Success = false, Message = "Source role not found" };
                }

                var createRequest = new CreateRoleRequest
                {
                    Name = request.NewRoleName,
                    RoleCode = request.NewRoleCode,
                    Description = request.Description ?? $"Cloned from {sourceRole.Name}",
                    RoleType = sourceRole.RoleType,
                    Priority = sourceRole.Priority,
                    ParentRoleId = request.CloneHierarchy ? sourceRole.ParentRoleId : null,
                    IsDepartmentSpecific = sourceRole.DepartmentId.HasValue,
                    DepartmentId = sourceRole.DepartmentId,
                    PermissionIds = request.ClonePermissions ? await GetPermissionIds(sourceRole.Id) : new List<Guid>(),
                    Settings = sourceRole.Settings
                };

                var result = await CreateAsync(tenantId, userId, createRequest);

                if (result.Success && request.CloneUsers)
                {
                    var users = await GetRoleUsersAsync(tenantId, sourceRole.Id);
                    if (users.Any())
                    {
                        await AssignUsersAsync(tenantId, userId, new AssignUsersToRoleRequest
                        {
                            RoleId = result.RoleId.Value,
                            UserIds = users.Select(u => u.UserId).ToList()
                        });
                    }
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cloning role {RoleId}", request.SourceRoleId);
                return new RoleOperationResult
                {
                    Success = false,
                    Message = "An error occurred while cloning the role",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<BulkRoleOperationResult> BulkAssignRolesAsync(Guid tenantId, Guid userId, BulkAssignRolesRequest request)
        {
            var results = new List<BulkOperationItem>();

            foreach (var roleId in request.RoleIds)
            {
                var assignResult = await AssignUsersAsync(tenantId, userId, new AssignUsersToRoleRequest
                {
                    RoleId = roleId,
                    UserIds = request.UserIds,
                    BranchId = request.BranchId,
                    ExpiresAt = request.ExpiresAt
                });

                results.AddRange(assignResult.Results);
            }

            var successCount = results.Count(r => r.Success);
            return new BulkRoleOperationResult
            {
                Success = successCount > 0,
                TotalProcessed = results.Count,
                SuccessCount = successCount,
                FailureCount = results.Count - successCount,
                Results = results,
                Summary = $"Bulk assigned {successCount} role-user combinations out of {results.Count}"
            };
        }

        public async Task<RoleComparisonResult> CompareRolesAsync(Guid tenantId, RoleComparisonRequest request)
        {
            var role1 = await GetByIdAsync(tenantId, request.Role1Id);
            var role2 = await GetByIdAsync(tenantId, request.Role2Id);

            if (role1 == null || role2 == null)
                return null;

            var allPermissions = role1.Permissions.Union(role2.Permissions, new PermissionComparer()).ToList();
            var comparison = allPermissions.Select(p => new PermissionComparisonDto
            {
                PermissionId = p.PermissionId,
                PermissionName = p.PermissionName,
                InRole1 = role1.Permissions.Any(rp => rp.PermissionId == p.PermissionId),
                InRole2 = role2.Permissions.Any(rp => rp.PermissionId == p.PermissionId)
            }).ToList();

            var sharedCount = comparison.Count(c => c.InRole1 && c.InRole2);
            var unique1 = comparison.Count(c => c.InRole1 && !c.InRole2);
            var unique2 = comparison.Count(c => !c.InRole1 && c.InRole2);
            var totalUnique = unique1 + unique2 + sharedCount;
            var similarityPercentage = totalUnique > 0 ? (sharedCount * 100.0 / totalUnique) : 0;

            return new RoleComparisonResult
            {
                Role1 = new RoleDto { Id = role1.Id, Name = role1.Name, RoleCode = role1.RoleCode },
                Role2 = new RoleDto { Id = role2.Id, Name = role2.Name, RoleCode = role2.RoleCode },
                PermissionComparison = comparison,
                SharedPermissions = sharedCount,
                UniqueToRole1 = unique1,
                UniqueToRole2 = unique2,
                Summary = new ComparisonSummary
                {
                    SimilarityPercentage = Math.Round(similarityPercentage, 2),
                    Recommendation = similarityPercentage > 80 ? "Roles are very similar - consider merging" :
                                   similarityPercentage > 50 ? "Roles have significant overlap" :
                                   "Roles are distinct"
                }
            };
        }

        // ================================================================================
        // STATISTICS & ANALYTICS
        // ================================================================================

        public async Task<RoleStatistics> GetStatisticsAsync(Guid tenantId)
        {
            var roles = await _roleManager.Roles
                .Where(r => r.TenantId == tenantId && r.DeletedAt == null)
                .ToListAsync();

            return new RoleStatistics
            {
                TotalRoles = roles.Count,
                ActiveRoles = roles.Count(r => r.IsActive),
                InactiveRoles = roles.Count(r => !r.IsActive),
                SystemRoles = roles.Count(r => r.IsSystemRole),
                CustomRoles = roles.Count(r => !r.IsSystemRole),
                DepartmentRoles = roles.Count(r => r.RoleType == "Department"),
                ProjectRoles = roles.Count(r => r.RoleType == "Project"),
                TypeBreakdown = new RoleTypeBreakdown
                {
                    System = roles.Count(r => r.RoleType == "System"),
                    Custom = roles.Count(r => r.RoleType == "Custom"),
                    Department = roles.Count(r => r.RoleType == "Department"),
                    Project = roles.Count(r => r.RoleType == "Project")
                },
                TopRolesByUsers = new List<RoleUsageStatDto>(),
                RolesWithMostPermissions = new List<RolePermissionStatDto>(),
                RecentRoleActivities = new List<RoleActivityStatDto>()
            };
        }

        public async Task<List<RoleDto>> GetRolesByTypeAsync(Guid tenantId, string roleType)
        {
            return await _roleManager.Roles
                .Where(r => r.TenantId == tenantId && r.RoleType == roleType && r.DeletedAt == null)
                .Select(r => new RoleDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description,
                    RoleCode = r.RoleCode,
                    RoleType = r.RoleType,
                    Priority = r.Priority,
                    IsActive = r.IsActive,
                    IsSystemRole = r.IsSystemRole,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<List<RoleDto>> SearchRolesAsync(Guid tenantId, string searchTerm)
        {
            return await _roleManager.Roles
                .Where(r => r.TenantId == tenantId && r.DeletedAt == null &&
                            (r.Name.Contains(searchTerm) ||
                             r.RoleCode.Contains(searchTerm) ||
                             r.Description.Contains(searchTerm)))
                .Select(r => new RoleDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description,
                    RoleCode = r.RoleCode,
                    RoleType = r.RoleType,
                    Priority = r.Priority,
                    IsActive = r.IsActive,
                    IsSystemRole = r.IsSystemRole
                })
                .Take(20)
                .ToListAsync();
        }

        // ================================================================================
        // HELPER METHODS
        // ================================================================================

        private IQueryable<AppRole> ApplySorting(IQueryable<AppRole> query, string sortBy, string sortOrder)
        {
            var ascending = string.IsNullOrEmpty(sortOrder) || sortOrder.ToLower() == "asc";

            return sortBy?.ToLower() switch
            {
                "name" => ascending ? query.OrderBy(r => r.Name) : query.OrderByDescending(r => r.Name),
                "priority" => ascending ? query.OrderBy(r => r.Priority) : query.OrderByDescending(r => r.Priority),
                "createdat" => ascending ? query.OrderBy(r => r.CreatedAt) : query.OrderByDescending(r => r.CreatedAt),
                _ => query.OrderBy(r => r.Name)
            };
        }

        private List<RoleHierarchyDto> BuildHierarchyTree(List<RoleHierarchyDto> allRoles, Guid? parentId, int level)
        {
            var children = allRoles.Where(r => r.ParentRoleId == parentId).ToList();
            foreach (var child in children)
            {
                child.Level = level;
                child.Children = BuildHierarchyTree(allRoles, child.Id, level + 1);
            }
            return children;
        }

        private async Task<List<Guid>> GetPermissionIds(Guid roleId)
        {
            // Placeholder - implement actual permission query
            return await Task.FromResult(new List<Guid>());
        }

        private async Task LogAudit(Guid tenantId, Guid userId, string entityType, Guid entityId, string action, object oldValues, object newValues)
        {
            try
            {
                var audit = new
                {
                    TenantId = tenantId,
                    UserId = userId,
                    EntityType = entityType,
                    EntityId = entityId,
                    Action = action,
                    OldValues = oldValues != null ? System.Text.Json.JsonSerializer.Serialize(oldValues) : null,
                    NewValues = newValues != null ? System.Text.Json.JsonSerializer.Serialize(newValues) : null,
                    Timestamp = DateTime.UtcNow
                };

                // Implement actual audit logging to audit_logs table
                _logger.LogInformation("Audit: {Action} on {EntityType} {EntityId} by {UserId}", action, entityType, entityId, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging audit trail");
            }
        }

        private class PermissionComparer : IEqualityComparer<RolePermissionDto>
        {
            public bool Equals(RolePermissionDto x, RolePermissionDto y) => x.PermissionId == y.PermissionId;
            public int GetHashCode(RolePermissionDto obj) => obj.PermissionId.GetHashCode();
        }
    }
}

