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
