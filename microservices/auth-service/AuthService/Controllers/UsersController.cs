using AuthService.Authorization;
using AuthService.Context;
using AuthService.Models.Identity;
using AuthService.Models.Domain;
using AuthService.Models.User;
using AuthService.Services;
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
    public class UsersController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly RoleManager<AppRole> _roleManager;
        private readonly AppDbContext _context;
        private readonly IUserService _userService;

        public UsersController(
            UserManager<AppUser> userManager, 
            RoleManager<AppRole> roleManager, 
            AppDbContext context,
            IUserService userService)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _context = context;
            _userService = userService;
        }

        private bool TryGetTenantId(out Guid tenantId)
        {
            tenantId = Guid.Empty;
            if (!HttpContext.Items.TryGetValue("TenantId", out var t)) return false;
            if (t is Guid g) { tenantId = g; return true; }
            return false;
        }

        [HttpGet]
        [RequirePermission("user.view")]
        public async Task<IActionResult> GetAll()
        {
            if (!TryGetTenantId(out var tenantId)) return BadRequest(new { message = "TenantId missing" });

            var users = await _userManager.Users
                .Where(u => u.TenantId == tenantId)
                .Select(u => new {
                    id = u.Id,
                    userName = u.UserName,
                    email = u.Email,
                    firstName = u.FirstName,
                    lastName = u.LastName,
                    userType = u.UserType,
                    userStatus = u.UserStatus
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("with-details")]
        [RequirePermission("user.view")]
        public async Task<IActionResult> GetUsersWithDetails()
        {
            if (!TryGetTenantId(out var tenantId)) return BadRequest(new { message = "TenantId missing" });

            var users = await _userManager.Users
                .Where(u => u.TenantId == tenantId && u.DeletedAt == null)
                .Select(u => new {
                    id = u.Id,
                    userName = u.UserName,
                    email = u.Email,
                    firstName = u.FirstName,
                    lastName = u.LastName,
                    userType = u.UserType,
                    status = u.UserStatus,
                    roles = _context.UserRoles
                        .Where(ur => ur.UserId == u.Id)
                        .Join(_context.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.Name)
                        .ToList(),
                    departments = _context.UserDepartments
                        .Where(ud => ud.UserId == u.Id && ud.DeletedAt == null)
                        .Join(_context.Departments, ud => ud.DepartmentId, d => d.Id, (ud, d) => new {
                            id = d.Id,
                            name = d.DepartmentName,
                            isPrimary = ud.AccessType == "Primary"
                        })
                        .ToList(),
                    primaryDepartment = _context.UserDepartments
                        .Where(ud => ud.UserId == u.Id && ud.AccessType == "Primary" && ud.DeletedAt == null)
                        .Join(_context.Departments, ud => ud.DepartmentId, d => d.Id, (ud, d) => d.DepartmentName)
                        .FirstOrDefault(),
                    branch = _context.UserBranches
                        .Where(ub => ub.UserId == u.Id && ub.IsPrimary && ub.DeletedAt == null)
                        .Join(_context.Branches, ub => ub.BranchId, b => b.Id, (ub, b) => b.Name)
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("{id}")]
        [RequirePermission("user.view")]
        public async Task<IActionResult> GetById(Guid id)
        {
            if (!TryGetTenantId(out var tenantId)) return BadRequest(new { message = "TenantId missing" });

            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == id && u.TenantId == tenantId);
            if (user == null) return NotFound(new { message = "User not found" });

            // Get user roles
            var userRoles = await _userManager.GetRolesAsync(user);

            return Ok(new {
                id = user.Id,
                userName = user.UserName,
                email = user.Email,
                firstName = user.FirstName,
                lastName = user.LastName,
                fullName = $"{user.FirstName} {user.LastName}".Trim(),
                userType = user.UserType,
                userStatus = user.UserStatus,
                roles = userRoles.Select(r => new { name = r }).ToList()
            });
        }

        public class CreateUserRequest
        {
            public string UserName { get; set; }
            public string Email { get; set; }
            public string FirstName { get; set; }
            public string LastName { get; set; }
            public string Password { get; set; }
            public string UserType { get; set; }
        }

        [HttpPost]
        [RequirePermission("user.create")]
        public async Task<IActionResult> Create([FromBody] CreateUserRequest req)
        {
            if (!TryGetTenantId(out var tenantId)) return BadRequest(new { message = "TenantId missing" });

            var user = new AppUser
            {
                UserName = req.UserName,
                Email = req.Email,
                FirstName = req.FirstName,
                LastName = req.LastName,
                TenantId = tenantId,
                UserType = req.UserType ?? "Staff",
                UserStatus = "Active",
                EmailConfirmed = true
            };

            var password = string.IsNullOrEmpty(req.Password) ? Guid.NewGuid().ToString("N").Substring(0, 12) : req.Password;

            var result = await _userManager.CreateAsync(user, password);
            if (!result.Succeeded)
            {
                return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
            }

            return CreatedAtAction(nameof(GetById), new { id = user.Id }, new { id = user.Id });
        }

        [HttpPut("{id}")]
        [RequirePermission("user.update")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateUserRequest req)
        {
            if (!TryGetTenantId(out var tenantId)) return BadRequest(new { message = "TenantId missing" });

            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == id && u.TenantId == tenantId);
            if (user == null) return NotFound();

            user.FirstName = req.FirstName;
            user.LastName = req.LastName;
            user.UserName = req.UserName;
            user.Email = req.Email;
            user.UserType = req.UserType ?? user.UserType;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
            }

            return NoContent();
        }

        [HttpPost("{id}/deactivate")]
        [RequirePermission("user.delete")]
        public async Task<IActionResult> Deactivate(Guid id)
        {
            if (!TryGetTenantId(out var tenantId)) return BadRequest(new { message = "TenantId missing" });

            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == id && u.TenantId == tenantId);
            if (user == null) return NotFound();

            user.UserStatus = "Inactive";
            await _userManager.UpdateAsync(user);

            return Ok(new { message = "User deactivated" });
        }

        public class AssignRoleRequest
        {
            public Guid RoleId { get; set; }
            public Guid? BranchId { get; set; }
        }

        [HttpPost("{userId}/roles")]
        [RequirePermission("role.assign")]
        public async Task<IActionResult> AssignRole(Guid userId, [FromBody] AssignRoleRequest req)
        {
            if (!TryGetTenantId(out var tenantId)) return BadRequest(new { message = "TenantId missing" });

            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == userId && u.TenantId == tenantId);
            if (user == null) return NotFound(new { message = "User not found" });

            var role = await _roleManager.FindByIdAsync(req.RoleId.ToString());
            if (role == null || role.TenantId != tenantId) return NotFound(new { message = "Role not found" });

            // Check if role assignment already exists (use AsNoTracking to avoid EF tracking conflicts)
            var exists = await _context.Set<AppUserRole>()
                .AsNoTracking()
                .AnyAsync(ur => ur.UserId == userId && ur.RoleId == req.RoleId && ur.BranchId == (req.BranchId ?? Guid.Empty));
            
            if (exists)
            {
                return Ok(new { message = "Role already assigned" });
            }

            // Add AppUserRole record with additional properties for branch/scoped assignment
            // Note: AppUserRole extends IdentityUserRole, so this creates the AspNetUserRoles entry
            var userRole = new AppUserRole
            {
                UserId = userId,
                RoleId = req.RoleId,
                BranchId = req.BranchId ?? Guid.Empty,
                AssignedAt = DateTime.UtcNow,
                IsActive = true
            };
            
            _context.Set<AppUserRole>().Add(userRole);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Role assigned" });
        }

        /// <summary>
        /// Assign departments to a user
        /// POST /api/users/{userId}/departments
        /// </summary>
        [HttpPost("{userId}/departments")]
        [RequirePermission("user.edit")]
        public async Task<IActionResult> AssignDepartments(Guid userId, [FromBody] List<DepartmentAssignment> departments)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "TenantId missing" });

            // Get current user ID for audit
            var currentUserIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("user_id")?.Value;
            if (!Guid.TryParse(currentUserIdClaim, out var currentUserId))
                return Unauthorized(new { message = "Current user ID not found" });

            // Verify user exists
            var user = await _userManager.Users
                .FirstOrDefaultAsync(u => u.Id == userId && u.TenantId == tenantId);
            
            if (user == null)
                return NotFound(new { message = "User not found" });

            // Assign departments
            var success = await _userService.AssignDepartmentsAsync(userId, tenantId, departments, currentUserId);

            if (!success)
                return BadRequest(new { message = "Failed to assign departments" });

            return Ok(new { 
                message = "Departments assigned successfully",
                count = departments.Count,
                departments = departments.Select(d => new { 
                    d.DepartmentId, 
                    d.DepartmentName, 
                    d.IsPrimary, 
                    d.AccessLevel 
                })
            });
        }

        /// <summary>
        /// Get user's department assignments
        /// GET /api/users/{userId}/departments
        /// </summary>
        [HttpGet("{userId}/departments")]
        [RequirePermission("user.view")]
        public async Task<IActionResult> GetUserDepartments(Guid userId)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "TenantId missing" });

            var departments = await _context.Set<UserDepartment>()
                .Where(ud => ud.UserId == userId && ud.TenantId == tenantId && ud.DeletedAt == null)
                .Join(_context.Set<Department>(),
                    ud => ud.DepartmentId,
                    d => d.Id,
                    (ud, d) => new
                    {
                        departmentId = d.Id,
                        departmentName = d.DepartmentName,
                        departmentType = d.DepartmentType,
                        isPrimary = ud.AccessType == "Primary",
                        accessLevel = ud.AccessType ?? "Full Access",
                        status = ud.Status,
                        assignedOn = ud.CreatedAt,
                        validFrom = ud.AccessStartDate,
                        validUntil = ud.AccessEndDate
                    })
                .ToListAsync();

            return Ok(new { 
                userId,
                count = departments.Count,
                departments
            });
        }
    }
}
