using System.Net;
using InventoryApi.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Functions.Reports;

public sealed class ReconciliationFunctions
{
    private readonly IReconciliationService _reconciliation;
    private readonly ILogger<ReconciliationFunctions> _log;

    public ReconciliationFunctions(IReconciliationService reconciliation, ILogger<ReconciliationFunctions> log)
    {
        _reconciliation = reconciliation;
        _log            = log;
    }

    // ---------- GET inventory/reports/vendor-reconciliation/{vendorId} ----------
    [Function("GetVendorReconciliationReport")]
    public async Task<HttpResponseData> GetReconciliation(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "reports/vendor-reconciliation/{vendorId:guid}")]
        HttpRequestData req, FunctionContext ctx, Guid vendorId, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var report   = await _reconciliation.GetVendorReportAsync(tenantId, vendorId, ct);
            var res      = req.CreateResponse(HttpStatusCode.OK);
            await res.WriteAsJsonAsync(report);
            return res;
        }
        catch (InvalidOperationException ex)
        {
            var res = req.CreateResponse(HttpStatusCode.NotFound);
            await res.WriteStringAsync(ex.Message);
            return res;
        }
        catch (Exception ex)
        {
            var res = req.CreateResponse(HttpStatusCode.BadRequest);
            await res.WriteStringAsync(ex.Message);
            return res;
        }
    }

    // ---------- helpers ----------
    private static Guid ParseGuid(HttpRequestData req, string header)
    {
        if (!req.Headers.TryGetValues(header, out var values))
            throw new ArgumentException($"Missing required header {header}.");
        return Guid.Parse(values.First());
    }
}
