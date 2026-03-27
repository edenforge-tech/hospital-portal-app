using CounsellingApi.Data;
using CounsellingApi.Models.Entities;

namespace CounsellingApi.Services;

/// <summary>
/// Writes immutable audit trail entries to <c>counselling_audit_log</c> via EF Core.
/// Every state change and action performed by the system is recorded here (HIPAA requirement).
/// </summary>
public class AuditService
{
    private readonly ApplicationDbContext _context;

    public AuditService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Log(Guid counsellingId, string action, string performedBy)
    {
        _context.AuditLogs.Add(new AuditLog
        {
            Id            = Guid.NewGuid(),
            CounsellingId = counsellingId,
            ActionType    = action,
            PerformedBy   = performedBy,
            PerformedAt   = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Logs a single field-level change to the audit trail (HIPAA requirement).
    /// ActionType is set to "FieldChanged" with FieldName, OldValue, NewValue populated.
    /// </summary>
    public async Task LogFieldChange(Guid counsellingId, string fieldName, string oldValue, string newValue, string performedBy)
    {
        _context.AuditLogs.Add(new AuditLog
        {
            Id            = Guid.NewGuid(),
            CounsellingId = counsellingId,
            ActionType    = "FieldChanged",
            FieldName     = fieldName,
            OldValue      = oldValue,
            NewValue      = newValue,
            PerformedBy   = performedBy,
            PerformedAt   = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Logs multiple field changes in a single DB round-trip (HIPAA batch audit).
    /// Prefer this over looping LogFieldChange() when saving multiple fields at once.
    /// </summary>
    public async Task LogFieldChangeBatch(
        Guid counsellingId,
        IEnumerable<(string FieldName, string OldValue, string NewValue)> changes,
        string performedBy)
    {
        var now = DateTime.UtcNow;
        foreach (var (fn, ov, nv) in changes)
        {
            _context.AuditLogs.Add(new AuditLog
            {
                Id            = Guid.NewGuid(),
                CounsellingId = counsellingId,
                ActionType    = "FieldChanged",
                FieldName     = fn,
                OldValue      = ov,
                NewValue      = nv,
                PerformedBy   = performedBy,
                PerformedAt   = now
            });
        }
        if (_context.ChangeTracker.HasChanges())
            await _context.SaveChangesAsync();
    }
}
