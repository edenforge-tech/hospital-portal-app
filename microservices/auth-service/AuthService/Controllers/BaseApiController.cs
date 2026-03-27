using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers
{
    /// <summary>
    /// Base controller providing common functionality for all API controllers.
    /// Includes standardized methods for extracting user context from JWT tokens.
    /// </summary>
    [ApiController]
    [Authorize]
    public abstract class BaseApiController : ControllerBase
    {
        /// <summary>
        /// Extracts the current user's ID from JWT claims.
        /// </summary>
        /// <returns>User ID as Guid, or Guid.Empty if claim not found</returns>
        protected Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                           ?? User.FindFirst("user_id")?.Value;
            
            return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
        }

        /// <summary>
        /// Extracts the current user's tenant ID from JWT claims.
        /// </summary>
        /// <returns>Tenant ID as Guid</returns>
        /// <exception cref="InvalidOperationException">Thrown if TenantId claim is missing or invalid</exception>
        protected Guid GetTenantId()
        {
            var tenantIdClaim = User.FindFirst("TenantId")?.Value 
                             ?? User.FindFirst("tenant_id")?.Value;
            
            if (string.IsNullOrEmpty(tenantIdClaim))
            {
                throw new InvalidOperationException("TenantId claim not found in JWT token");
            }

            if (!Guid.TryParse(tenantIdClaim, out var tenantId))
            {
                throw new InvalidOperationException($"Invalid TenantId format: {tenantIdClaim}");
            }

            return tenantId;
        }

        /// <summary>
        /// Extracts the current user's email from JWT claims.
        /// </summary>
        /// <returns>User email, or null if claim not found</returns>
        protected string? GetCurrentUserEmail()
        {
            return User.FindFirst(ClaimTypes.Email)?.Value 
                ?? User.FindFirst("email")?.Value;
        }

        /// <summary>
        /// Extracts the current user's username from JWT claims.
        /// </summary>
        /// <returns>Username, or null if claim not found</returns>
        protected string? GetCurrentUsername()
        {
            return User.FindFirst(ClaimTypes.Name)?.Value 
                ?? User.FindFirst("username")?.Value;
        }

        /// <summary>
        /// Checks if the current user has a specific role.
        /// </summary>
        /// <param name="roleName">Role name to check</param>
        /// <returns>True if user has the role, false otherwise</returns>
        protected bool HasRole(string roleName)
        {
            return User.IsInRole(roleName);
        }

        /// <summary>
        /// Gets all roles for the current user.
        /// </summary>
        /// <returns>Array of role names</returns>
        protected string[] GetCurrentUserRoles()
        {
            return User.FindAll(ClaimTypes.Role)
                      .Select(c => c.Value)
                      .ToArray();
        }

        /// <summary>
        /// Creates a standardized error response.
        /// </summary>
        /// <param name="message">Error message</param>
        /// <param name="statusCode">HTTP status code</param>
        /// <returns>ObjectResult with error details</returns>
        protected ObjectResult ErrorResponse(string message, int statusCode = 400)
        {
            return StatusCode(statusCode, new { error = message });
        }

        /// <summary>
        /// Creates a standardized validation error response.
        /// </summary>
        /// <param name="errors">Dictionary of field names to error messages</param>
        /// <returns>BadRequestObjectResult with validation errors</returns>
        protected BadRequestObjectResult ValidationErrorResponse(Dictionary<string, string[]> errors)
        {
            return BadRequest(new { errors });
        }
    }
}
