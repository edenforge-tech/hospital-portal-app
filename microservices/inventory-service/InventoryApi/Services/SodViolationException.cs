namespace InventoryApi.Services;

/// <summary>
/// Thrown when a Bill Transfer action violates Segregation of Duties (SOD) rules
/// and no valid override is present.
/// Maps to HTTP 409 Conflict in function handlers.
/// </summary>
public sealed class SodViolationException : Exception
{
    public string RuleId { get; }

    public SodViolationException(string ruleId, string message)
        : base(message)
    {
        RuleId = ruleId;
    }
}
