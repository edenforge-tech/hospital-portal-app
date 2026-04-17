using Microsoft.Azure.Functions.Worker.Http;

namespace InventoryApi.Helpers;

/// <summary>
/// Lightweight header-based role enforcement for Azure Functions (no JWT middleware).
/// The frontend sends X-User-Roles as a comma-separated list of role names.
/// </summary>
public static class RoleGuard
{
    // ── Allowed role sets ─────────────────────────────────────────────────────

    /// <summary>Roles that may create / manage RFQs and Purchase Orders.</summary>
    public static readonly HashSet<string> CanCreate = new(StringComparer.OrdinalIgnoreCase)
    {
        "INVENTORY MANAGER",
        "INVENTORY STAFF",
        "PURCHASE MANAGER",
        "STORE KEEPER",
        "OPTICAL MANAGER",
        "PHARMACY TECHNICIAN",
        "SYSTEM ADMIN",
        "SUPER ADMIN",
        "SYSTEM ADMINISTRATOR",
        "SUPER ADMINISTRATOR",
        "ADMIN",
        "SUPERADMIN",
        "HOSPITAL OWNER",
    };

    /// <summary>Roles that may approve, rank, award or send procurement documents.</summary>
    public static readonly HashSet<string> CanApprove = new(StringComparer.OrdinalIgnoreCase)
    {
        "INVENTORY MANAGER",
        "PURCHASE MANAGER",
        "SYSTEM ADMIN",
        "SUPER ADMIN",
        "SYSTEM ADMINISTRATOR",
        "SUPER ADMINISTRATOR",
        "ADMIN",
        "SUPERADMIN",
        "HOSPITAL OWNER",
    };

    // ── Helpers ───────────────────────────────────────────────────────────────

    /// <summary>
    /// Returns the roles from the X-User-Roles header (comma-separated).
    /// Returns an empty array when the header is absent.
    /// </summary>
    public static string[] GetRoles(HttpRequestData req)
    {
        if (!req.Headers.TryGetValues("X-User-Roles", out var vals))
            return [];

        var raw = vals.FirstOrDefault() ?? string.Empty;
        return raw.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
    }

    /// <summary>
    /// Returns true when the caller holds at least one role in <paramref name="allowed"/>.
    /// When the header is absent we allow the call (backward-compatible with clients
    /// that haven't sent the header yet).
    /// </summary>
    public static bool HasAny(HttpRequestData req, HashSet<string> allowed)
    {
        var roles = GetRoles(req);
        if (roles.Length == 0) return true;   // header absent → don't block
        return roles.Any(r => allowed.Contains(r));
    }

    /// <summary>
    /// Throws <see cref="UnauthorizedAccessException"/> when the caller lacks every
    /// role in <paramref name="allowed"/> AND the header is present.
    /// </summary>
    public static void Require(HttpRequestData req, HashSet<string> allowed)
    {
        if (!HasAny(req, allowed))
            throw new UnauthorizedAccessException(
                $"This action requires one of: {string.Join(", ", allowed)}.");
    }
}
