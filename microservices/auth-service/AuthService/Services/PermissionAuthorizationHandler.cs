using AuthService.Context;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace AuthService.Services
{
    public class PermissionRequirement : IAuthorizationRequirement
    {
        public string PermissionCode { get; set; }

        public PermissionRequirement(string permissionCode)
        {
            PermissionCode = permissionCode;
        }
    }

    public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
    {
        private readonly AppDbContext _context;

        public PermissionAuthorizationHandler(AppDbContext context)
        {
            _context = context;
        }

        protected override async Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            PermissionRequirement requirement)
        {
            var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
            var tenantIdClaim = context.User.FindFirst("tenant_id"); // lowercase as per JwtService

            Console.WriteLine($"[PermissionHandler] Checking permission: {requirement.PermissionCode}");
            Console.WriteLine($"[PermissionHandler] UserId claim: {userIdClaim?.Value}");
            Console.WriteLine($"[PermissionHandler] TenantId claim: {tenantIdClaim?.Value}");

            if (userIdClaim == null || tenantIdClaim == null)
            {
                Console.WriteLine("[PermissionHandler] FAILED: Missing user or tenant claim");
                context.Fail();
                return;
            }

            // FIRST: Check JWT claims for permissions (supports demo mode)
            var permissionClaims = context.User.FindAll("permission"); // lowercase as per JwtService
            Console.WriteLine($"[PermissionHandler] Found {permissionClaims.Count()} permission claims");
            
            if (permissionClaims.Any())
            {
                var claimPermissions = permissionClaims.Select(c => c.Value).ToList();
                Console.WriteLine($"[PermissionHandler] Permissions from JWT: {string.Join(", ", claimPermissions)}");
                
                // Check for wildcard permission or specific permission
                if (claimPermissions.Contains("*") || claimPermissions.Contains(requirement.PermissionCode))
                {
                    Console.WriteLine($"[PermissionHandler] SUCCESS: Permission granted via JWT claim");
                    context.Succeed(requirement);
                    return;
                }
            }

            // FALLBACK: Check database for real users
            if (Guid.TryParse(userIdClaim.Value, out var userId) &&
                Guid.TryParse(tenantIdClaim.Value, out var tenantId))
            {
                Console.WriteLine("[PermissionHandler] Checking database...");
                var permissionService = new PermissionService(_context);
                var hasPermission = await permissionService.HasPermissionAsync(userId, requirement.PermissionCode, tenantId);

                if (hasPermission)
                {
                    Console.WriteLine($"[PermissionHandler] SUCCESS: Permission granted via database");
                    context.Succeed(requirement);
                }
                else
                {
                    Console.WriteLine($"[PermissionHandler] FAILED: Permission not found in database");
                }
            }

            await Task.CompletedTask;
        }
    }
}