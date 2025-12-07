using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace AuthService.Authorization;

/// <summary>
/// Custom authorization policy provider that dynamically creates policies
/// for permission-based authorization. This allows us to use permission codes
/// directly in [RequirePermission] attributes without pre-registering policies.
/// </summary>
public class PermissionAuthorizationPolicyProvider : IAuthorizationPolicyProvider
{
    private readonly DefaultAuthorizationPolicyProvider _fallbackPolicyProvider;
    private const string PermissionPolicyPrefix = "Permission:";

    public PermissionAuthorizationPolicyProvider(IOptions<AuthorizationOptions> options)
    {
        _fallbackPolicyProvider = new DefaultAuthorizationPolicyProvider(options);
    }

    /// <summary>
    /// Gets the default authorization policy (e.g., for [Authorize] with no policy name).
    /// </summary>
    public Task<AuthorizationPolicy> GetDefaultPolicyAsync()
    {
        return _fallbackPolicyProvider.GetDefaultPolicyAsync();
    }

    /// <summary>
    /// Gets the fallback policy when no authorization is specified.
    /// </summary>
    public Task<AuthorizationPolicy?> GetFallbackPolicyAsync()
    {
        return _fallbackPolicyProvider.GetFallbackPolicyAsync();
    }

    /// <summary>
    /// Gets or creates an authorization policy based on the policy name.
    /// If the policy name starts with "Permission:", it creates a permission-based policy.
    /// Otherwise, it falls back to the default policy provider.
    /// </summary>
    /// <param name="policyName">The policy name (e.g., "Permission:tenant.view")</param>
    public Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
    {
        // Check if this is a permission-based policy
        if (policyName.StartsWith(PermissionPolicyPrefix, StringComparison.OrdinalIgnoreCase))
        {
            // Extract the permission code from the policy name
            var permissionCode = policyName.Substring(PermissionPolicyPrefix.Length);

            // Build a policy that requires authentication and the specific permission
            // Use the existing PermissionRequirement from Services namespace
            var policy = new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .AddRequirements(new PermissionRequirement(permissionCode))
                .Build();

            return Task.FromResult<AuthorizationPolicy?>(policy);
        }

        // Fall back to default policy provider for non-permission policies
        return _fallbackPolicyProvider.GetPolicyAsync(policyName);
    }
}
