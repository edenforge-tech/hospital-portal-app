namespace CounsellingApi.Services;

/// <summary>
/// Validates that a counselling workflow state transition is permitted.
/// The state machine enforces the business rules for the counselling lifecycle.
/// </summary>
public class StateMachineService
{
    // Allowed forward transitions per state.
    // Note: Processed → RepeatCounselling is included to support the "NotInterested" decision path.
    private static readonly Dictionary<string, List<string>> Rules = new()
    {
        ["Pending"]            = new() { "Processed" },
        ["Processed"]          = new() { "Done", "RepeatCounselling" },
        ["Done"]               = new() { "Processed", "AddOnSurgery", "RepeatCounselling" },
        ["RepeatCounselling"]  = new() { "Processed" }
    };

    /// <summary>
    /// Asserts that transitioning from <paramref name="current"/> to <paramref name="next"/> is valid.
    /// Throws <see cref="InvalidOperationException"/> on an illegal transition.
    /// </summary>
    public void Validate(string current, string next)
    {
        if (!Rules.TryGetValue(current, out var allowed) || !allowed.Contains(next))
            throw new InvalidOperationException($"Invalid transition: {current} → {next}");
    }
}
