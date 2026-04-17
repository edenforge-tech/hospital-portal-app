using InventoryApi.Data;
using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Services;

/// <summary>Finds batches expiring within alertThresholdDays and logs them.</summary>
public interface IExpiryAlertService
{
    Task<IReadOnlyList<StockBatch>> GetExpiringBatchesAsync(Guid tenantId, int daysAhead, CancellationToken ct);
}

public sealed class ExpiryAlertService : IExpiryAlertService
{
    private readonly InventoryDbContext _db;
    private readonly ILogger<ExpiryAlertService> _logger;

    public ExpiryAlertService(InventoryDbContext db, ILogger<ExpiryAlertService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<IReadOnlyList<StockBatch>> GetExpiringBatchesAsync(Guid tenantId, int daysAhead, CancellationToken ct)
    {
        var threshold = DateTime.UtcNow.Date.AddDays(daysAhead);
        var batches = await _db.StockBatches
            .Include(b => b.Item)
            .Include(b => b.Store)
            .Where(b => b.TenantId == tenantId
                     && b.DeletedAt == null
                     && b.QuantityAvailable > 0
                     && b.ExpiryDate.HasValue
                     && b.ExpiryDate.Value <= threshold)
            .OrderBy(b => b.ExpiryDate)
            .ToListAsync(ct);

        _logger.LogInformation(
            "ExpiryAlert: {Count} batches expiring within {Days} days for tenant {TenantId}",
            batches.Count, daysAhead, tenantId);

        return batches;
    }
}
