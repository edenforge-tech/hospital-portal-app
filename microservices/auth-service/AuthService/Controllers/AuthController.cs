using AuthService.Authorization;
using AuthService.Context;
using AuthService.Models;
using AuthService.Models.Domain;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using AuthService.Models.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly RoleManager<AppRole> _roleManager;
        private readonly IJwtService _jwtService;
        private readonly IPermissionService _permissionService;
        private readonly AppDbContext _context;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            IJwtService jwtService,
            IPermissionService permissionService,
            AppDbContext context,
            ILogger<AuthController> logger)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _jwtService = jwtService;
            _permissionService = permissionService;
            _context = context;
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
        {
            try
            {
                // Validate tenant
                if (!Guid.TryParse(request.TenantId, out var tenantId))
                {
                    return BadRequest(new { message = "Invalid tenant ID" });
                }

                // Find tenant in database
                var tenant = await _context.Tenants.FindAsync(tenantId);
                if (tenant == null || tenant.Status != "Active")
                {
                    return BadRequest(new { message = "Tenant not found or inactive" });
                }

                // Set tenant context for query filtering
                HttpContext.Items["TenantId"] = tenantId;

                // TEMPORARY: Re-enable demo mode for InMemory database
                if (request.Email?.ToLower() == "admin@hospital.com" || request.Email?.ToLower() == "admin@test.com")
                {
                    _logger.LogInformation("Demo login - Email: {Email}", request.Email);
                    
                    string expectedPassword = request.Email.ToLower() == "admin@hospital.com" ? "Admin@123456" : "Admin123!";
                    if (string.IsNullOrEmpty(request.Password) || request.Password != expectedPassword)
                    {
                        _logger.LogWarning("Demo login failed - use {ExpectedPassword}", expectedPassword);
                        return Unauthorized(new { success = false, message = "Invalid credentials" });
                    }

                    // Create mock user for demo
                    var mockUser = new AppUser
                    {
                        Id = Guid.NewGuid(),
                        Email = "admin@hospital.com",
                        UserName = "admin@hospital.com",
                        FirstName = "Admin",
                        LastName = "User",
                        TenantId = tenantId,
                        MustChangePasswordOnLogin = false,
                        UserStatus = "Active"
                    };

                    var mockRoles = new List<string> { "Admin", "SuperAdmin" };
                    var mockPermissions = new List<string> { "*" };

                    var demoAccessToken = _jwtService.GenerateToken(mockUser, mockRoles, mockPermissions);
                    var demoRefreshToken = _jwtService.GenerateRefreshToken();

                    _logger.LogInformation("Demo login successful for {Email}", request.Email);

                    return Ok(new
                    {
                        success = true,
                        user = new
                        {
                            id = mockUser.Id,
                            email = mockUser.Email,
                            firstName = mockUser.FirstName,
                            lastName = mockUser.LastName,
                            tenantId = mockUser.TenantId,
                            tenantName = tenant?.Name ?? "Apollo Hospitals",
                            mustChangePassword = false
                        },
                        roles = mockRoles,         // At root level for frontend
                        permissions = mockPermissions,  // At root level for frontend
                        accessToken = demoAccessToken,
                        refreshToken = demoRefreshToken,
                        expiresIn = 3600
                    });
                }

                // Find user by email (real database authentication)
                var user = await _userManager.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Email && u.TenantId == tenantId);

                if (user == null)
                {
                    await LogFailedLogin(request.Email, tenantId, "User not found");
                    return Unauthorized(new { message = "Invalid credentials" });
                }

                // Check if user is locked
                if (user.LockoutEnd > DateTime.UtcNow)
                {
                    return Unauthorized(new { message = "Account is locked. Please try again later." });
                }

                // Verify password
                var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);
                if (!isPasswordValid)
                {
                    user.AccessFailedCount++;
                    if (user.AccessFailedCount >= 5) // Lock after 5 failed attempts
                    {
                        user.LockoutEnd = DateTime.UtcNow.AddMinutes(15);
                    }
                    await _userManager.UpdateAsync(user);
                    await LogFailedLogin(request.Email, tenantId, "Invalid password");
                    return Unauthorized(new { message = "Invalid credentials" });
                }

                // Check if user is active
                if (user.UserStatus == "Inactive")
                {
                    await LogFailedLogin(request.Email, tenantId, "User inactive");
                    return Unauthorized(new { message = "User account is inactive" });
                }

                // Reset failed login attempts
                user.AccessFailedCount = 0;
                user.LastLoginAt = DateTime.UtcNow;

                // Check if password is expired
                if (user.PasswordExpiresAt < DateTime.UtcNow && user.PasswordExpiresAt != null)
                {
                    user.MustChangePasswordOnLogin = true;
                }

                await _userManager.UpdateAsync(user);

                // Get user roles and permissions
                var roles = await _userManager.GetRolesAsync(user);
                var permissions = await _permissionService.GetUserPermissionsAsync(user.Id, tenantId);

                // Generate JWT token
                var accessToken = _jwtService.GenerateToken(user, roles.ToList(), permissions);
                var refreshToken = _jwtService.GenerateRefreshToken();

                // Log successful login
                await LogAudit(user.Id, tenantId, "LOGIN", "User", user.Id.ToString(), "SUCCESS", null, null);

                return Ok(new LoginResponse
                {
                    Success = true,
                    Message = "Login successful",
                    AccessToken = accessToken,
                    RefreshToken = refreshToken,
                    ExpiresIn = 3600,
                    User = new UserDto
                    {
                        Id = user.Id,
                        UserName = user.UserName,
                        Email = user.Email,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        UserType = user.UserType,
                        TenantId = user.TenantId
                    },
                    Roles = roles.ToList(),
                    Permissions = permissions,
                    MustChangePassword = user.MustChangePasswordOnLogin
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Login error");
                return StatusCode(500, new { message = "An error occurred during login" });
            }
        }

        [HttpPost("change-password")]
        [Authorize] // Only requires authentication, no special permission needed
        public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userId, out var userGuid))
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(userGuid.ToString());
            if (user == null)
                return NotFound();

            // Verify current password
            var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.CurrentPassword);
            if (!isPasswordValid)
                return BadRequest(new { message = "Current password is incorrect" });

            // Update password
            var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
            if (!result.Succeeded)
                return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

            user.LastPasswordChangeAt = DateTime.UtcNow;
            user.MustChangePasswordOnLogin = false;
            user.PasswordExpiresAt = DateTime.UtcNow.AddDays(90); // 90-day expiry
            await _userManager.UpdateAsync(user);

            await LogAudit(user.Id, user.TenantId, "CHANGE_PASSWORD", "User", user.Id.ToString(), "SUCCESS", null, null);

            return Ok(new { message = "Password changed successfully" });
        }

        private async Task LogFailedLogin(string emailOrUsername, Guid tenantId, string reason)
        {
            var attempt = new FailedLoginAttempt
            {
                EmailOrUsername = emailOrUsername,
                TenantId = tenantId,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                AttemptedAt = DateTime.UtcNow,
                Reason = reason
            };
            _context.FailedLoginAttempts.Add(attempt);
            await _context.SaveChangesAsync();
        }

        private async Task LogAudit(Guid userId, Guid tenantId, string action, string resourceType, string resourceId, string status, object oldValues, object newValues)
        {
            var log = new AuditLog
            {
                TenantId = tenantId,
                UserId = userId,
                Action = action,
                ResourceType = resourceType,
                ResourceId = Guid.TryParse(resourceId, out var rid) ? rid : Guid.Empty,
                Status = status,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                UserAgent = Request.Headers.UserAgent.ToString(),
                CreatedAt = DateTime.UtcNow
            };
            _context.AuditLogs.Add(log);
            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// DEBUG: Create default admin user for testing (bypasses tenant requirement)
        /// </summary>
        [AllowAnonymous]
        [HttpPost("debug/create-admin")]
        public async Task<ActionResult> CreateDefaultAdmin([FromQuery] string? tenantId = null)
        {
            try
            {
                // Use default tenant if not provided
                if (string.IsNullOrEmpty(tenantId))
                {
                    tenantId = "11111111-1111-1111-1111-111111111111"; // Apollo
                }

                // Check if admin already exists
                var existingAdmin = await _userManager.FindByEmailAsync("admin@hospital.com");
                if (existingAdmin != null)
                {
                    return Ok(new { message = "Admin user already exists", email = "admin@hospital.com", password = "Admin@123456" });
                }

                // Create admin user for each tenant
                var user = new AppUser
                {
                    Id = Guid.NewGuid(),
                    UserName = "admin@hospital.com",
                    Email = "admin@hospital.com",
                    EmailConfirmed = true,
                    FirstName = "System",
                    LastName = "Administrator",
                    TenantId = Guid.Parse(tenantId), 
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var result = await _userManager.CreateAsync(user, "Admin@123456");
                
                if (!result.Succeeded)
                {
                    return BadRequest(new { message = "Failed to create admin user", errors = result.Errors });
                }

                _logger.LogInformation("Created admin user: {Email}", user.Email);

                return Ok(new { 
                    message = "Admin user created successfully", 
                    email = "admin@hospital.com",
                    password = "Admin@123456",
                    tenants = "All tenants (Apollo, Fortis, Max, Narayana, Sankara)"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating admin user");
                return StatusCode(500, new { message = "Error creating admin user", error = ex.Message });
            }
        }
    }

    public class ChangePasswordRequest
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}