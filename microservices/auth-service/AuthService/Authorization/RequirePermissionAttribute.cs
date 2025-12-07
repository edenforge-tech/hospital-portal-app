using Microsoft.AspNetCore.Authorization;

namespace AuthService.Authorization;

/// <summary>
/// Custom authorization attribute that requires a specific permission code.
/// This attribute integrates with ASP.NET Core's policy-based authorization system.
/// </summary>
/// <example>
/// [RequirePermission("tenant.view")]
/// [RequirePermission("user.create")]
/// </example>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
public class RequirePermissionAttribute : AuthorizeAttribute
{
    /// <summary>
    /// The permission code required to access the endpoint.
    /// Must match a permission code in the permission table.
    /// </summary>
    public string PermissionCode { get; }

    /// <summary>
    /// Creates a new permission requirement with the specified permission code.
    /// </summary>
    /// <param name="permissionCode">The permission code required (e.g., "tenant.view", "user.create")</param>
    public RequirePermissionAttribute(string permissionCode)
    {
        PermissionCode = permissionCode;
        // Set the policy name to the permission code
        // This will be resolved by our custom authorization policy provider
        Policy = $"Permission:{permissionCode}";
    }
}
