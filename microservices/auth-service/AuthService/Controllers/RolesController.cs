using AuthService.Authorization;
using AuthService.Context;
using AuthService.Models.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RolesController : ControllerBase
    {
        private readonly RoleManager<AppRole> _roleManager;
        private readonly AppDbContext _context;

        public RolesController(RoleManager<AppRole> roleManager, AppDbContext context)
        {
            _roleManager = roleManager;
            _context = context;
        }

        private bool TryGetTenantId(out Guid tenantId)
        {
            tenantId = Guid.Empty;
            if (!HttpContext.Items.TryGetValue("TenantId", out var t)) return false;
            if (t is Guid g) { tenantId = g; return true; }
            return false;
        }

        [HttpGet]
        [RequirePermission("role.view")]
        public async Task<IActionResult> GetAll()
        {
            if (!TryGetTenantId(out var tenantId)) return BadRequest(new { message = "TenantId missing" });

            var roles = await _roleManager.Roles
                .Where(r => r.TenantId == tenantId)
                .Select(r => new { id = r.Id, name = r.Name, description = r.Description })
                .ToListAsync();

            return Ok(roles);
        }

        [HttpGet("with-user-count")]
        [RequirePermission("role.view")]
        public async Task<IActionResult> GetRolesWithUserCount()
        {
            if (!TryGetTenantId(out var tenantId)) return BadRequest(new { message = "TenantId missing" });

            var roles = await _roleManager.Roles
                .Where(r => r.TenantId == tenantId && r.DeletedAt == null)
                .Select(r => new {
                    r.Id,
                    r.Name,
                    r.Description,
                    r.IsActive,
                    UserCount = _context.UserRoles.Count(ur => ur.RoleId == r.Id),
                    Users = _context.UserRoles
                        .Where(ur => ur.RoleId == r.Id)
                        .Join(_context.Users, ur => ur.UserId, u => u.Id, (ur, u) => new {
                            u.Id,
                            u.FirstName,
                            u.LastName,
                            u.Email
                        })
                        .Take(10)
                        .ToList()
                })
                .OrderBy(r => r.Name)
                .ToListAsync();

            return Ok(roles);
        }

        public class CreateRoleRequest
        {
            public required string Name { get; set; }
            public string? Description { get; set; }
        }

        [HttpPost]
        [RequirePermission("role.create")]
        public async Task<IActionResult> CreateRole([FromBody] CreateRoleRequest req)
        {
            if (!TryGetTenantId(out var tenantId)) 
                return BadRequest(new { message = "TenantId missing" });

            if (string.IsNullOrWhiteSpace(req.Name))
                return BadRequest(new { message = "Role name is required" });

            // Check for duplicate role name within tenant
            var existingRole = await _roleManager.Roles
                .FirstOrDefaultAsync(r => r.TenantId == tenantId && r.Name.ToLower() == req.Name.ToLower());
            
            if (existingRole != null)
                return BadRequest(new { message = "A role with this name already exists" });

            var newRole = new AppRole
            {
                Name = req.Name.Trim(),
                NormalizedName = req.Name.Trim().ToUpperInvariant(),
                TenantId = tenantId,
                Description = req.Description?.Trim(),
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var result = await _roleManager.CreateAsync(newRole);
            
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return BadRequest(new { message = $"Failed to create role: {errors}" });
            }

            return Ok(new { 
                id = newRole.Id, 
                name = newRole.Name,
                description = newRole.Description,
                message = "Role created successfully" 
            });
        }

        [HttpPut("{id}")]
        [RequirePermission("role.edit")]
        public async Task<IActionResult> UpdateRole(Guid id, [FromBody] CreateRoleRequest req)
        {
            if (!TryGetTenantId(out var tenantId)) 
                return BadRequest(new { message = "TenantId missing" });

            if (string.IsNullOrWhiteSpace(req.Name))
                return BadRequest(new { message = "Role name is required" });

            var role = await _roleManager.FindByIdAsync(id.ToString());
            if (role == null || role.TenantId != tenantId) 
                return NotFound(new { message = "Role not found" });

            // Check for duplicate role name (excluding current role)
            var existingRole = await _roleManager.Roles
                .FirstOrDefaultAsync(r => r.TenantId == tenantId && 
                                        r.Name.ToLower() == req.Name.ToLower() && 
                                        r.Id != id);
            
            if (existingRole != null)
                return BadRequest(new { message = "A role with this name already exists" });

            role.Name = req.Name.Trim();
            role.NormalizedName = req.Name.Trim().ToUpperInvariant();
            role.Description = req.Description?.Trim();
            role.UpdatedAt = DateTime.UtcNow;

            var result = await _roleManager.UpdateAsync(role);
            
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return BadRequest(new { message = $"Failed to update role: {errors}" });
            }

            return Ok(new { 
                id = role.Id, 
                name = role.Name,
                description = role.Description,
                message = "Role updated successfully" 
            });
        }

        [HttpDelete("{id}")]
        [RequirePermission("role.delete")]
        public async Task<IActionResult> DeleteRole(Guid id)
        {
            if (!TryGetTenantId(out var tenantId)) 
                return BadRequest(new { message = "TenantId missing" });

            var role = await _roleManager.FindByIdAsync(id.ToString());
            if (role == null || role.TenantId != tenantId) 
                return NotFound(new { message = "Role not found" });

            // Check if role is assigned to any users
            var userCount = await _context.UserRoles.CountAsync(ur => ur.RoleId == id);
            if (userCount > 0)
            {
                return BadRequest(new { 
                    message = $"Cannot delete role. It is currently assigned to {userCount} user(s). Please remove all users from this role before deleting." 
                });
            }

            // Soft delete
            role.DeletedAt = DateTime.UtcNow;
            role.IsActive = false;
            role.UpdatedAt = DateTime.UtcNow;

            var result = await _roleManager.UpdateAsync(role);
            
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return BadRequest(new { message = $"Failed to delete role: {errors}" });
            }

            return Ok(new { message = "Role deleted successfully" });
        }

        [HttpGet("{id}/permissions")]
        [RequirePermission("role.view")]
        public async Task<IActionResult> GetRolePermissions(Guid id)
        {
            if (!TryGetTenantId(out var tenantId)) return BadRequest(new { message = "TenantId missing" });

            var role = await _roleManager.FindByIdAsync(id.ToString());
            if (role == null || role.TenantId != tenantId) return NotFound();

            var permissions = await _context.Set<AuthService.Models.Domain.RolePermission>()
                .Where(rp => rp.RoleId == id)
                .Join(_context.Permissions, rp => rp.PermissionId, p => p.Id, (rp, p) => new {
                    p.Id,
                    p.Code,
                    p.Name,
                    p.Description,
                    p.Module,
                    p.ResourceType,
                    p.Action,
                    p.Scope,
                    p.IsActive,
                    p.IsSystemPermission
                })
                .ToListAsync();

            return Ok(permissions);
        }

        public class AssignPermissionsRequest
        {
            public required string[] PermissionIds { get; set; }
        }

        [HttpPost("{id}/permissions")]
        [RequirePermission("role.manage_permissions")]
        public async Task<IActionResult> AssignPermissions(Guid id, [FromBody] AssignPermissionsRequest req)
        {
            if (!TryGetTenantId(out var tenantId)) return BadRequest(new { message = "TenantId missing" });

            var role = await _roleManager.FindByIdAsync(id.ToString());
            if (role == null || role.TenantId != tenantId) return NotFound();

            // Remove existing permissions
            var existingPermissions = _context.Set<AuthService.Models.Domain.RolePermission>()
                .Where(rp => rp.RoleId == id);
            _context.Set<AuthService.Models.Domain.RolePermission>().RemoveRange(existingPermissions);

            // Add new permissions
            var newPermissions = req.PermissionIds.Select(pid => new AuthService.Models.Domain.RolePermission
            {
                RoleId = id,
                PermissionId = Guid.Parse(pid)
            });
            _context.Set<AuthService.Models.Domain.RolePermission>().AddRange(newPermissions);

            await _context.SaveChangesAsync();
            return Ok(new { message = "Permissions assigned successfully" });
        }

        [HttpDelete("{id}/permissions")]
        [RequirePermission("role.manage_permissions")]
        public async Task<IActionResult> RemovePermissions(Guid id, [FromBody] AssignPermissionsRequest req)
        {
            if (!TryGetTenantId(out var tenantId)) return BadRequest(new { message = "TenantId missing" });

            var role = await _roleManager.FindByIdAsync(id.ToString());
            if (role == null || role.TenantId != tenantId) return NotFound();

            var permissionsToRemove = _context.Set<AuthService.Models.Domain.RolePermission>()
                .Where(rp => rp.RoleId == id && req.PermissionIds.Contains(rp.PermissionId.ToString()));
            _context.Set<AuthService.Models.Domain.RolePermission>().RemoveRange(permissionsToRemove);

            await _context.SaveChangesAsync();
            return Ok(new { message = "Permissions removed successfully" });
        }

        public class CloneRoleRequest
        {
            public required string Name { get; set; }
            public string? Description { get; set; }
        }

        [HttpPost("{id}/clone")]
        [RequirePermission("role.create")]
        public async Task<IActionResult> CloneRole(Guid id, [FromBody] CloneRoleRequest req)
        {
            if (!TryGetTenantId(out var tenantId)) return BadRequest(new { message = "TenantId missing" });

            var sourceRole = await _roleManager.FindByIdAsync(id.ToString());
            if (sourceRole == null || sourceRole.TenantId != tenantId) return NotFound();

            var newRole = new AppRole
            {
                Name = req.Name,
                NormalizedName = req.Name.ToUpperInvariant(),
                TenantId = tenantId,
                Description = req.Description,
                IsActive = true
            };

            var result = await _roleManager.CreateAsync(newRole);
            if (!result.Succeeded) return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

            // Clone permissions
            var sourcePermissions = await _context.Set<AuthService.Models.Domain.RolePermission>()
                .Where(rp => rp.RoleId == id)
                .ToListAsync();

            var newPermissions = sourcePermissions.Select(rp => new AuthService.Models.Domain.RolePermission
            {
                RoleId = newRole.Id,
                PermissionId = rp.PermissionId
            });
            _context.Set<AuthService.Models.Domain.RolePermission>().AddRange(newPermissions);

            await _context.SaveChangesAsync();
            return Ok(new { id = newRole.Id, message = "Role cloned successfully" });
        }
    }
}
