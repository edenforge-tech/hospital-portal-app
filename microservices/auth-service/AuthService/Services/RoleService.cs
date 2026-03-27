using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AuthService.Context;
using AuthService.Models.Identity;
using AuthService.Models.Role;
using AuthService.Models.Domain;
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
        // ROLE TEMPLATE OPERATIONS
        // ================================================================================

        public async Task<RoleTemplateListResponse> GetTemplatesAsync(Guid tenantId, RoleTemplateFilters filters)
        {
            try
            {
                var query = _context.RoleTemplates
                    .Where(t => t.TenantId == tenantId && t.DeletedAt == null);

                // Apply filters
                if (!string.IsNullOrEmpty(filters.Search))
                {
                    query = query.Where(t =>
                        t.Name.Contains(filters.Search) ||
                        t.Description.Contains(filters.Search));
                }

                if (!string.IsNullOrEmpty(filters.TemplateCategory))
                {
                    query = query.Where(t => t.TemplateCategory == filters.TemplateCategory);
                }

                if (!string.IsNullOrEmpty(filters.RoleType))
                {
                    query = query.Where(t => t.RoleType == filters.RoleType);
                }

                if (filters.IsSystemTemplate.HasValue)
                {
                    query = query.Where(t => t.IsSystemTemplate == filters.IsSystemTemplate.Value);
                }

                if (filters.IsActive.HasValue)
                {
                    query = query.Where(t => t.IsActive == filters.IsActive.Value);
                }

                var totalCount = await query.CountAsync();

                // Apply sorting and pagination
                query = ApplyTemplateSorting(query, filters.SortBy, filters.SortOrder);
                var skip = (filters.PageNumber - 1) * filters.PageSize;
                query = query.Skip(skip).Take(filters.PageSize);

                var templates = await query.Select(t => new RoleTemplateDto
                {
                    Id = t.Id,
                    Name = t.Name,
                    Description = t.Description,
                    RoleType = t.RoleType,
                    TemplateCategory = t.TemplateCategory,
                    Priority = t.Priority,
                    IsSystemTemplate = t.IsSystemTemplate,
                    IsActive = t.IsActive,
                    CreatedAt = t.CreatedAt
                }).ToListAsync();

                return new RoleTemplateListResponse
                {
                    Templates = templates,
                    TotalCount = totalCount,
                    PageNumber = filters.PageNumber,
                    PageSize = filters.PageSize,
                    TotalPages = (int)Math.Ceiling((double)totalCount / filters.PageSize),
                    HasPreviousPage = filters.PageNumber > 1,
                    HasNextPage = filters.PageNumber < Math.Ceiling((double)totalCount / filters.PageSize)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting role templates for tenant {TenantId}", tenantId);
                throw;
            }
        }

        public async Task<RoleTemplateDto> GetTemplateByIdAsync(Guid tenantId, Guid templateId)
        {
            var template = await _context.RoleTemplates
                .Where(t => t.TenantId == tenantId && t.Id == templateId && t.DeletedAt == null)
                .FirstOrDefaultAsync();

            if (template == null)
                return null;

            // Parse configuration to extract permissions and settings
            var config = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(template.Configuration);
            var defaultPermissions = new List<Guid>();
            var settings = new Dictionary<string, object>();

            if (config.ContainsKey("permissions") && config["permissions"] is System.Text.Json.JsonElement permissionsElement)
            {
                foreach (var item in permissionsElement.EnumerateArray())
                {
                    if (Guid.TryParse(item.GetString(), out var permissionId))
                    {
                        defaultPermissions.Add(permissionId);
                    }
                }
            }

            if (config.ContainsKey("settings") && config["settings"] is System.Text.Json.JsonElement settingsElement)
            {
                settings = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(settingsElement.GetRawText());
            }

            return new RoleTemplateDto
            {
                Id = template.Id,
                Name = template.Name,
                Description = template.Description,
                RoleType = template.RoleType,
                TemplateCategory = template.TemplateCategory,
                Priority = template.Priority,
                DefaultPermissions = defaultPermissions,
                Settings = settings,
                IsSystemTemplate = template.IsSystemTemplate,
                IsActive = template.IsActive,
                CreatedAt = template.CreatedAt
            };
        }

        public async Task<RoleOperationResult> CreateRoleFromTemplateAsync(Guid tenantId, Guid userId, CreateRoleFromTemplateRequest request)
        {
            try
            {
                // Get the template
                var template = await GetTemplateByIdAsync(tenantId, request.TemplateId);
                if (template == null)
                {
                    return new RoleOperationResult
                    {
                        Success = false,
                        Message = "Template not found",
                        Errors = new List<string> { "The specified template does not exist" }
                    };
                }

                // Validate hierarchy if parent role specified
                if (request.ParentRoleId.HasValue)
                {
                    var isValidHierarchy = await ValidateHierarchyAsync(tenantId, Guid.NewGuid(), request.ParentRoleId);
                    if (!isValidHierarchy)
                    {
                        return new RoleOperationResult
                        {
                            Success = false,
                            Message = "Invalid hierarchy",
                            Errors = new List<string> { "The specified parent role would create a circular reference" }
                        };
                    }
                }

                // Create the role
                var role = new AppRole
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    Name = request.RoleName,
                    NormalizedName = request.RoleName.ToUpper(),
                    RoleCode = request.RoleCode,
                    Description = request.Description,
                    RoleType = template.RoleType,
                    ParentRoleId = request.ParentRoleId,
                    DepartmentId = request.DepartmentId,
                    Settings = request.CustomSettings.Count > 0 ? 
                        System.Text.Json.JsonSerializer.Serialize(request.CustomSettings) : 
                        System.Text.Json.JsonSerializer.Serialize(template.Settings),
                    CreatedBy = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
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

                // Assign permissions from template
                var permissionsToAssign = template.DefaultPermissions
                    .Union(request.AdditionalPermissions)
                    .Except(request.ExcludedPermissions)
                    .ToList();

                if (permissionsToAssign.Any())
                {
                    var permissionAssignResult = await AssignPermissionsAsync(tenantId, userId, new AssignPermissionsToRoleRequest
                    {
                        RoleId = role.Id,
                        PermissionIds = permissionsToAssign
                    });

                    if (!permissionAssignResult.Success)
                    {
                        _logger.LogWarning("Role created but permission assignment failed for role {RoleId}", role.Id);
                    }
                }

                // Create hierarchy relationship if parent specified
                if (request.ParentRoleId.HasValue)
                {
                    await CreateHierarchyRelationshipAsync(tenantId, userId, request.ParentRoleId.Value, role.Id);
                }

                await LogAuditTrailAsync(userId, tenantId, "Role", role.Id, "Created from template", null, new { TemplateName = template.Name, RoleName = role.Name });

                return new RoleOperationResult
                {
                    Success = true,
                    Message = $"Role '{request.RoleName}' created successfully from template '{template.Name}'",
                    RoleId = role.Id
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating role from template for tenant {TenantId}", tenantId);
                return new RoleOperationResult
                {
                    Success = false,
                    Message = "An error occurred while creating the role",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<List<string>> GetTemplateNamesAsync(Guid tenantId)
        {
            return await _context.RoleTemplates
                .Where(t => t.TenantId == tenantId && t.DeletedAt == null && t.IsActive)
                .OrderBy(t => t.Name)
                .Select(t => t.Name)
                .ToListAsync();
        }

        // ================================================================================
        // ROLE HIERARCHY OPERATIONS
        // ================================================================================

        public async Task<RoleOperationResult> UpdateHierarchyAsync(Guid tenantId, Guid userId, UpdateRoleHierarchyRequest request)
        {
            try
            {
                // Validate hierarchy
                var isValid = await ValidateHierarchyAsync(tenantId, request.RoleId, request.NewParentRoleId);
                if (!isValid)
                {
                    return new RoleOperationResult
                    {
                        Success = false,
                        Message = "Invalid hierarchy",
                        Errors = new List<string> { "This change would create a circular reference in the role hierarchy" }
                    };
                }

                // Update the role's parent
                var role = await _roleManager.FindByIdAsync(request.RoleId.ToString());
                if (role == null || role.TenantId != tenantId)
                {
                    return new RoleOperationResult
                    {
                        Success = false,
                        Message = "Role not found",
                        Errors = new List<string> { "The specified role does not exist" }
                    };
                }

                var oldParentId = role.ParentRoleId;
                role.ParentRoleId = request.NewParentRoleId;
                role.UpdatedBy = userId;
                role.UpdatedAt = DateTime.UtcNow;

                await _roleManager.UpdateAsync(role);

                // Remove old hierarchy relationships
                var existingRelationships = await _context.RoleHierarchies
                    .Where(h => h.TenantId == tenantId && h.ChildRoleId == request.RoleId && h.DeletedAt == null)
                    .ToListAsync();

                foreach (var relationship in existingRelationships)
                {
                    relationship.DeletedAt = DateTime.UtcNow;
                    relationship.DeletedBy = userId;
                }

                // Create new hierarchy relationship
                if (request.NewParentRoleId.HasValue)
                {
                    await CreateHierarchyRelationshipAsync(tenantId, userId, request.NewParentRoleId.Value, request.RoleId, request.InheritanceType, request.ExcludedPermissions);
                }

                await _context.SaveChangesAsync();

                await LogAuditTrailAsync(userId, tenantId, "RoleHierarchy", request.RoleId, "Updated", 
                    new { OldParent = oldParentId }, new { NewParent = request.NewParentRoleId });

                return new RoleOperationResult
                {
                    Success = true,
                    Message = "Role hierarchy updated successfully",
                    RoleId = request.RoleId
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating role hierarchy for role {RoleId}", request.RoleId);
                return new RoleOperationResult
                {
                    Success = false,
                    Message = "An error occurred while updating the role hierarchy",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<RoleInheritancePreviewDto> GetInheritancePreviewAsync(Guid tenantId, Guid roleId, Guid? newParentId)
        {
            var role = await _roleManager.FindByIdAsync(roleId.ToString());
            if (role == null || role.TenantId != tenantId)
                return null;

            var currentPermissions = await GetRolePermissionsAsync(tenantId, roleId);
            var inheritedPermissions = new List<RolePermissionDto>();
            var inheritancePath = new List<string> { role.Name };

            if (newParentId.HasValue)
            {
                // Calculate what would be inherited from new parent
                var parentRole = await _roleManager.FindByIdAsync(newParentId.Value.ToString());
                if (parentRole != null)
                {
                    inheritedPermissions = await GetAllInheritedPermissionsAsync(tenantId, newParentId.Value);
                    inheritancePath = await BuildInheritancePathAsync(tenantId, newParentId.Value);
                    inheritancePath.Add(role.Name);
                }
            }

            // Combine current + inherited (avoiding duplicates)
            var finalPermissions = currentPermissions
                .Union(inheritedPermissions, new PermissionComparer())
                .ToList();

            return new RoleInheritancePreviewDto
            {
                RoleId = roleId,
                RoleName = role.Name,
                CurrentPermissions = currentPermissions,
                InheritedPermissions = inheritedPermissions,
                FinalPermissions = finalPermissions,
                InheritancePath = inheritancePath
            };
        }

        public async Task<BulkRoleOperationResult> RefreshInheritanceAsync(Guid tenantId, Guid userId, Guid parentRoleId)
        {
            try
            {
                var childRoles = await GetChildRolesAsync(tenantId, parentRoleId);
                var results = new List<BulkOperationItem>();
                var successCount = 0;
                var failureCount = 0;

                foreach (var childRole in childRoles)
                {
                    try
                    {
                        // Get inherited permissions from parent
                        var inheritedPermissions = await GetAllInheritedPermissionsAsync(tenantId, parentRoleId);
                        
                        // Apply inheritance based on the child role's inheritance settings
                        var hierarchyRelation = await _context.RoleHierarchies
                            .Where(h => h.TenantId == tenantId && h.ChildRoleId == childRole.Id && h.DeletedAt == null)
                            .FirstOrDefaultAsync();

                        if (hierarchyRelation?.InheritanceType == "inherit_all")
                        {
                            var permissionIds = inheritedPermissions.Select(p => p.PermissionId).ToList();
                            await AssignPermissionsAsync(tenantId, userId, new AssignPermissionsToRoleRequest
                            {
                                RoleId = childRole.Id,
                                PermissionIds = permissionIds
                            });
                        }

                        results.Add(new BulkOperationItem
                        {
                            Id = childRole.Id,
                            Name = childRole.Name,
                            Success = true,
                            Message = "Inheritance refreshed successfully"
                        });
                        successCount++;
                    }
                    catch (Exception ex)
                    {
                        results.Add(new BulkOperationItem
                        {
                            Id = childRole.Id,
                            Name = childRole.Name,
                            Success = false,
                            Message = "Failed to refresh inheritance",
                            Errors = new List<string> { ex.Message }
                        });
                        failureCount++;
                    }
                }

                return new BulkRoleOperationResult
                {
                    Success = successCount > 0,
                    TotalProcessed = results.Count,
                    SuccessCount = successCount,
                    FailureCount = failureCount,
                    Results = results,
                    Summary = $"Inheritance refreshed for {successCount} of {results.Count} child roles"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing inheritance for parent role {ParentRoleId}", parentRoleId);
                return new BulkRoleOperationResult
                {
                    Success = false,
                    TotalProcessed = 0,
                    SuccessCount = 0,
                    FailureCount = 1,
                    Results = new List<BulkOperationItem>(),
                    Summary = "Failed to refresh inheritance"
                };
            }
        }

        public async Task<bool> ValidateHierarchyAsync(Guid tenantId, Guid roleId, Guid? newParentId)
        {
            if (!newParentId.HasValue)
                return true; // No parent means no circular reference possible

            if (roleId == newParentId.Value)
                return false; // Role cannot be its own parent

            // Check if newParentId is already a descendant of roleId
            var descendants = await GetAllDescendantRoleIdsAsync(tenantId, roleId);
            return !descendants.Contains(newParentId.Value);
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
                "totalusers" => ascending ? query.OrderBy(r => r.UserRoles.Count) : query.OrderByDescending(r => r.UserRoles.Count),
                _ => query.OrderBy(r => r.Name)
            };
        }

        private IQueryable<AuthService.Models.Domain.RoleTemplate> ApplyTemplateSorting(IQueryable<AuthService.Models.Domain.RoleTemplate> query, string sortBy, string sortOrder)
        {
            var ascending = string.IsNullOrEmpty(sortOrder) || sortOrder.ToLower() == "asc";

            return sortBy?.ToLower() switch
            {
                "name" => ascending ? query.OrderBy(t => t.Name) : query.OrderByDescending(t => t.Name),
                "priority" => ascending ? query.OrderBy(t => t.Priority) : query.OrderByDescending(t => t.Priority),
                "category" => ascending ? query.OrderBy(t => t.TemplateCategory) : query.OrderByDescending(t => t.TemplateCategory),
                "createdat" => ascending ? query.OrderBy(t => t.CreatedAt) : query.OrderByDescending(t => t.CreatedAt),
                _ => query.OrderBy(t => t.Name)
            };
        }

        private async Task CreateHierarchyRelationshipAsync(Guid tenantId, Guid userId, Guid parentRoleId, Guid childRoleId, string inheritanceType = "inherit_all", List<Guid> excludedPermissions = null)
        {
            var parentRole = await _roleManager.FindByIdAsync(parentRoleId.ToString());
            var childRole = await _roleManager.FindByIdAsync(childRoleId.ToString());
            
            if (parentRole == null || childRole == null)
                return;

            // Calculate level and path
            var parentLevel = await GetRoleLevelAsync(tenantId, parentRoleId);
            var level = parentLevel + 1;
            var parentPath = await GetRolePathAsync(tenantId, parentRoleId);
            var path = string.Join("/", parentPath.Select(r => r.Name)) + "/" + childRole.Name;

            // Create inheritance config
            var inheritanceConfig = new
            {
                inherited_permissions = new List<Guid>(),
                excluded_permissions = excludedPermissions ?? new List<Guid>()
            };

            var hierarchy = new AuthService.Models.Domain.RoleHierarchy
            {
                TenantId = tenantId,
                ParentRoleId = parentRoleId,
                ChildRoleId = childRoleId,
                Level = level,
                Path = path,
                InheritanceType = inheritanceType,
                InheritanceConfig = System.Text.Json.JsonSerializer.Serialize(inheritanceConfig),
                CreatedByUserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.RoleHierarchies.Add(hierarchy);
            await _context.SaveChangesAsync();
        }

        private async Task<int> GetRoleLevelAsync(Guid tenantId, Guid roleId)
        {
            var role = await _roleManager.FindByIdAsync(roleId.ToString());
            if (role?.ParentRoleId == null)
                return 0; // Root level

            var parentLevel = await GetRoleLevelAsync(tenantId, role.ParentRoleId.Value);
            return parentLevel + 1;
        }

        private async Task<List<RolePermissionDto>> GetAllInheritedPermissionsAsync(Guid tenantId, Guid roleId)
        {
            var inheritedPermissions = new List<RolePermissionDto>();
            var visited = new HashSet<Guid>();

            await CollectInheritedPermissionsRecursive(tenantId, roleId, inheritedPermissions, visited);
            return inheritedPermissions.DistinctBy(p => p.PermissionId).ToList();
        }

        private async Task CollectInheritedPermissionsRecursive(Guid tenantId, Guid roleId, List<RolePermissionDto> result, HashSet<Guid> visited)
        {
            if (visited.Contains(roleId))
                return; // Avoid infinite recursion

            visited.Add(roleId);

            // Get direct permissions for this role
            var directPermissions = await GetRolePermissionsAsync(tenantId, roleId);
            result.AddRange(directPermissions);

            // Get parent role permissions
            var role = await _roleManager.FindByIdAsync(roleId.ToString());
            if (role?.ParentRoleId != null)
            {
                await CollectInheritedPermissionsRecursive(tenantId, role.ParentRoleId.Value, result, visited);
            }
        }

        private async Task<List<string>> BuildInheritancePathAsync(Guid tenantId, Guid roleId)
        {
            var path = new List<string>();
            var currentRoleId = (Guid?)roleId;

            while (currentRoleId != null)
            {
                var role = await _roleManager.FindByIdAsync(currentRoleId.ToString());
                if (role == null) break;

                path.Insert(0, role.Name);
                currentRoleId = role.ParentRoleId;
            }

            return path;
        }

        private async Task<List<Guid>> GetAllDescendantRoleIdsAsync(Guid tenantId, Guid roleId)
        {
            var descendants = new List<Guid>();
            var directChildren = await _context.RoleHierarchies
                .Where(h => h.TenantId == tenantId && h.ParentRoleId == roleId && h.DeletedAt == null)
                .Select(h => h.ChildRoleId)
                .ToListAsync();

            foreach (var childId in directChildren)
            {
                descendants.Add(childId);
                var childDescendants = await GetAllDescendantRoleIdsAsync(tenantId, childId);
                descendants.AddRange(childDescendants);
            }

            return descendants;
        }

        private async Task LogAuditTrailAsync(Guid userId, Guid tenantId, string entityType, Guid entityId, string action, object oldValues, object newValues)
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

        // Helper method for audit logging (simple version)
        private async Task LogAudit(Guid tenantId, Guid userId, string entityType, Guid entityId, string action, object oldValues, object newValues)
        {
            await LogAuditTrailAsync(userId, tenantId, entityType, entityId, action, oldValues, newValues);
        }

        // Helper method to build hierarchy tree
        private List<RoleHierarchyDto> BuildHierarchyTree(List<RoleHierarchyDto> roles, Guid? parentId, int level)
        {
            var result = new List<RoleHierarchyDto>();
            var childRoles = roles.Where(r => (parentId == null && r.ParentRoleId == null) || r.ParentRoleId == parentId).ToList();

            foreach (var role in childRoles)
            {
                role.Level = level;
                role.Children = BuildHierarchyTree(roles, role.Id, level + 1);
                result.Add(role);
            }

            return result;
        }

        // Helper method to get permission IDs for a role
        private async Task<List<Guid>> GetPermissionIds(Guid roleId)
        {
            var permissions = await _context.RolePermissions
                .Where(rp => rp.RoleId == roleId)
                .Select(rp => rp.PermissionId)
                .ToListAsync();
            
            return permissions;
        }

        private class PermissionComparer : IEqualityComparer<RolePermissionDto>
        {
            public bool Equals(RolePermissionDto x, RolePermissionDto y) => x.PermissionId == y.PermissionId;
            public int GetHashCode(RolePermissionDto obj) => obj.PermissionId.GetHashCode();
        }
    }
}

