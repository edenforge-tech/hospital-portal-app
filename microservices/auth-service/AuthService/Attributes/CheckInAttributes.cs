namespace AuthService.Attributes;

/// <summary>
/// Marks an endpoint as requiring check-in validation.
/// Use this attribute on controller actions that should enforce patient check-in.
/// </summary>
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false)]
public class RequireCheckInAttribute : Attribute
{
    /// <summary>
    /// If true, allows emergency override via X-Emergency-Override header.
    /// Default: true
    /// </summary>
    public bool AllowEmergencyOverride { get; set; } = true;

    /// <summary>
    /// If true, only validates for modifying operations (POST, PUT, PATCH).
    /// GET requests are always allowed.
    /// Default: true
    /// </summary>
    public bool OnlyForModifyingRequests { get; set; } = true;
}

/// <summary>
/// Marks an endpoint as exempt from check-in validation.
/// Use this attribute on controller actions that should bypass the check-in requirement.
/// </summary>
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false)]
public class SkipCheckInValidationAttribute : Attribute
{
}
