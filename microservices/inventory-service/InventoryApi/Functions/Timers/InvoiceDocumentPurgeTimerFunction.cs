using InventoryApi.Data;
using InventoryApi.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Functions.Timers;

/// <summary>
/// Daily job that:
///   1. Deletes invoice document blobs whose 90-day retention window has expired.
///   2. Marks the corresponding audit log row with blob_purged = true so the
///      audit metadata is preserved indefinitely for HIPAA compliance.
///
/// Runs at 02:30 UTC every day: "0 30 2 * * *"
/// </summary>
public sealed class InvoiceDocumentPurgeTimerFunction
{
    private readonly InventoryDbContext        _db;
    private readonly IBlobStorageService       _blobs;
    private readonly ILogger<InvoiceDocumentPurgeTimerFunction> _log;

    public InvoiceDocumentPurgeTimerFunction(
        InventoryDbContext        db,
        IBlobStorageService       blobs,
        ILogger<InvoiceDocumentPurgeTimerFunction> log)
    {
        _db    = db;
        _blobs = blobs;
        _log   = log;
    }

    [Function("InvoiceDocumentPurgeSweeper")]
    public async Task Run(
        [TimerTrigger("0 30 2 * * *", UseMonitor = false)] TimerInfo timer,
        CancellationToken ct)
    {
        _log.LogInformation("Invoice document purge sweeper starting at {Time}", DateTime.UtcNow);

        var cutoff = DateTime.UtcNow;

        // Fetch rows whose purge date has passed and blob has not yet been deleted.
        var due = await _db.InvoiceExtractionAuditLogs
            .Where(r => !r.BlobPurged && r.BlobPurgeAt <= cutoff && r.DocumentUrl != null)
            .OrderBy(r => r.BlobPurgeAt)
            .Take(500)                    // cap batch size to avoid long-running job
            .ToListAsync(ct);

        if (due.Count == 0)
        {
            _log.LogInformation("Invoice document purge: nothing due for deletion.");
            return;
        }

        int purged = 0, failed = 0;

        foreach (var row in due)
        {
            if (ct.IsCancellationRequested) break;
            try
            {
                if (!string.IsNullOrWhiteSpace(row.DocumentUrl))
                    await _blobs.DeleteAsync(row.DocumentUrl, ct);

                row.BlobPurged  = true;
                row.DocumentUrl = null;   // clear URL — blob no longer exists
                purged++;
            }
            catch (Exception ex)
            {
                _log.LogWarning(ex,
                    "Failed to purge invoice blob for session {SessionId} (url: {Url})",
                    row.SessionId, row.DocumentUrl);
                failed++;
            }
        }

        await _db.SaveChangesAsync(ct);

        _log.LogInformation(
            "Invoice document purge complete: {Purged} purged, {Failed} failed.",
            purged, failed);
    }
}
