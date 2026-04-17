using InventoryApi.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Functions.Timers;

/// <summary>
/// Runs nightly at 01:00 UTC (CRON: "0 0 1 * * *").
/// 1. Scans every store for items below reorder_level and creates Auto requisitions.
/// 2. Refreshes the mv_inv_stock_summary materialized view CONCURRENTLY.
/// 3. Collects batches expiring in ≤90 days (logged; downstream notification TBD).
/// </summary>
public sealed class AutoReorderTimerFunction
{
    private readonly IAutoReorderService _autoReorder;
    private readonly ILogger<AutoReorderTimerFunction> _log;

    public AutoReorderTimerFunction(IAutoReorderService autoReorder, ILogger<AutoReorderTimerFunction> log)
    {
        _autoReorder = autoReorder;
        _log         = log;
    }

    [Function("AutoReorderTimer")]
    public async Task Run(
        [TimerTrigger("0 0 1 * * *", UseMonitor = false)] TimerInfo timer,
        FunctionContext ctx,
        CancellationToken ct)
    {
        _log.LogInformation("AutoReorderTimer triggered at {Time}", DateTime.UtcNow);

        try
        {
            await _autoReorder.RunAllTenantsAsync(ct);
            _log.LogInformation("AutoReorderTimer completed successfully at {Time}", DateTime.UtcNow);
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "AutoReorderTimer failed at {Time}", DateTime.UtcNow);
            throw; // re-throw so Azure Functions marks the run as failed
        }
    }
}
