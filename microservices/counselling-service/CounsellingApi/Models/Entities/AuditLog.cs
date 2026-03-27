namespace CounsellingApi.Models.Entities;

/// <summary>
/// Immutable audit trail entry mapping to <c>counselling_audit_log</c>.
/// One row is appended per state change or action on a counselling record (HIPAA requirement).
/// Rows are never updated or deleted.
/// </summary>
public class AuditLog
{
    public Guid Id { get; set; }
    public Guid CounsellingId { get; set; }

    /// <summary>Action name e.g. StartCounselling, Decision, Schedule, FieldChanged — maps to <c>action</c> column.</summary>
    public string ActionType { get; set; } = string.Empty;

    public string PerformedBy { get; set; } = string.Empty;
    public DateTime PerformedAt { get; set; }

    // ── Field-level audit (populated when ActionType = "FieldChanged") ────────
    /// <summary>The name of the field that changed (e.g. "paymentType", "counsellorNotes").</summary>
    public string? FieldName { get; set; }

    /// <summary>Previous value as a string snapshot.</summary>
    public string? OldValue { get; set; }

    /// <summary>New value as a string snapshot.</summary>
    public string? NewValue { get; set; }
}
