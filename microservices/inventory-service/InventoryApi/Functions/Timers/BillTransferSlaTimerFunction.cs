using InventoryApi.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Functions.Timers;

/// <summary>
/// Hourly SLA evaluator for Bill Transfers.
/// Checks all pending BTs and updates sla_state to OnTrack / AtRisk / Breached.
/// Creates escalation queue entries and fires notifications on first breach/at-risk.
/// </summary>
public sealed class BillTransferSlaTimerFunction
{
    private readonly IBillTransferSlaService         _sla;
    private readonly ILogger<BillTransferSlaTimerFunction> _log;

    public BillTransferSlaTimerFunction(IBillTransferSlaService sla, ILogger<BillTransferSlaTimerFunction> log)
    {
        _sla = sla;
        _log = log;
    }

    // Runs every hour at 0 minutes
    [Function("BillTransferSlaEvaluator")]
    public async Task Run(
        [TimerTrigger("0 0 * * * *", UseMonitor = false)] TimerInfo timer,
        CancellationToken ct)
    {
        _log.LogInformation("BillTransfer SLA evaluator starting at {Time}", DateTime.UtcNow);
        await _sla.EvaluateAllAsync(ct);
        _log.LogInformation("BillTransfer SLA evaluator completed.");
    }
}
