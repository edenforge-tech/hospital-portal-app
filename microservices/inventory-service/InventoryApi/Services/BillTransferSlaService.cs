using InventoryApi.Data;
using InventoryApi.Models.Entities;
using InventoryApi.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Services;

public interface IBillTransferSlaService
{
    /// <summary>
    /// Evaluates all pending Bill Transfers against their SLA deadlines,
    /// updates sla_state, and creates escalation queue entries for newly breached / at-risk items.
    /// </summary>
    Task EvaluateAllAsync(CancellationToken ct);
}

public sealed class BillTransferSlaService : IBillTransferSlaService
{
    private readonly InventoryDbContext          _db;
    private readonly INotificationClient         _notify;
    private readonly ILogger<BillTransferSlaService> _log;

    public BillTransferSlaService(
        InventoryDbContext db,
        INotificationClient notify,
        ILogger<BillTransferSlaService> log)
    {
        _db     = db;
        _notify = notify;
        _log    = log;
    }

    public async Task EvaluateAllAsync(CancellationToken ct)
    {
        var now = DateTime.UtcNow;

        // Load all pending BTs that may need SLA evaluation
        var pending = await _db.BillTransfers
            .Where(b => b.DeletedAt == null
                     && b.Status != "FullyApproved"
                     && b.Status != "Cancelled"
                     && (b.L1DueAt != null || b.L2DueAt != null))
            .Include(b => b.Vendor)
            .ToListAsync(ct);

        int evaluated = 0;

        foreach (var bt in pending)
        {
            DateTime? dueAt = bt.Status is "Draft" or "Resubmitted"
                ? bt.L1DueAt
                : bt.Status == "L1Approved"
                    ? bt.L2DueAt
                    : null;

            if (dueAt is null) continue;

            var stage    = bt.Status is "Draft" or "Resubmitted" ? "L1" : "L2";
            var newState = ComputeSlaState(now, dueAt.Value);

            if (bt.SlaState == newState) continue;    // no change

            bt.SlaState  = newState;
            bt.UpdatedAt = now;
            evaluated++;

            var escalationStage = $"{stage}_{newState}";  // e.g. L1_AtRisk, L2_Breached

            // Upsert escalation queue row (one per stage, resolved only when BT transitions out)
            var existing = await _db.BtEscalationQueue
                .FirstOrDefaultAsync(e => e.BillTransferId == bt.Id
                                       && e.EscalationStage == escalationStage
                                       && e.ResolvedAt == null, ct);

            if (existing is null)
            {
                _db.BtEscalationQueue.Add(new BtEscalationQueue
                {
                    TenantId         = bt.TenantId,
                    BillTransferId   = bt.Id,
                    EscalationStage  = escalationStage,
                    CreatedAt        = now,
                    UpdatedAt        = now
                });

                // Fire notification
                try
                {
                    await _notify.SendBillTransferEventAsync(
                        tenantId:     bt.TenantId,
                        btId:         bt.Id,
                        eventType:    escalationStage,
                        vendorName:   bt.Vendor?.Name ?? "Unknown",
                        amount:       bt.InvoiceTotalAmount,
                        dueAt:        dueAt.Value,
                        ct:           ct);
                }
                catch (Exception ex)
                {
                    _log.LogWarning(ex, "Notification failed for BT {BtId} escalation {Stage}", bt.Id, escalationStage);
                }
            }
        }

        if (evaluated > 0)
        {
            await _db.SaveChangesAsync(ct);
            _log.LogInformation("SLA evaluator updated {Count} Bill Transfer(s).", evaluated);
        }
        else
        {
            _log.LogDebug("SLA evaluator: no changes detected for {Count} pending BTs.", pending.Count);
        }
    }

    /// <summary>Computes SLA state based on time remaining.</summary>
    private static string ComputeSlaState(DateTime now, DateTime dueAt)
    {
        var remaining = dueAt - now;
        if (remaining.TotalHours > 24)  return "OnTrack";
        if (remaining.TotalHours > 0)   return "AtRisk";
        return "Breached";
    }
}
