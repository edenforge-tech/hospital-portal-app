using InventoryApi.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Functions.Timers;

/// <summary>
/// Daily job that marks settlements as Overdue when DueDate has passed
/// and the settlement is still in Pending or PartiallyPaid state.
/// Runs at 01:00 UTC every day: "0 0 1 * * *"
/// </summary>
public sealed class SettlementOverdueTimerFunction
{
    private readonly IInvoiceSettlementService         _svc;
    private readonly ILogger<SettlementOverdueTimerFunction> _log;

    public SettlementOverdueTimerFunction(
        IInvoiceSettlementService svc,
        ILogger<SettlementOverdueTimerFunction> log)
    {
        _svc = svc;
        _log = log;
    }

    [Function("SettlementOverdueSweeper")]
    public async Task Run(
        [TimerTrigger("0 0 1 * * *", UseMonitor = false)] TimerInfo timer,
        CancellationToken ct)
    {
        _log.LogInformation("Settlement overdue sweeper starting at {Time}", DateTime.UtcNow);
        var marked = await _svc.MarkOverdueAsync(ct);
        _log.LogInformation("Settlement overdue sweeper completed: {Count} settlement(s) marked Overdue.", marked);
    }
}
