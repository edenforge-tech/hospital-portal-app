using System.Net;
using System.Text.Json;
using InventoryApi.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Functions.Reports;

public sealed class InventoryDashboardFunctions
{
    private readonly IInventoryDashboardService _dashboard;
    private readonly IPurchaseOrderService _pos;
    private readonly ILogger<InventoryDashboardFunctions> _log;

    private static readonly JsonSerializerOptions _json =
        new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public InventoryDashboardFunctions(
        IInventoryDashboardService dashboard,
        IPurchaseOrderService pos,
        ILogger<InventoryDashboardFunctions> log)
    {
        _dashboard = dashboard;
        _pos = pos;
        _log = log;
    }

    // ── GET /inventory/dashboard ─────────────────────────────────────────────
    [Function("GetInventoryDashboard")]
    public async Task<HttpResponseData> GetDashboard(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "inventory/dashboard")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var summary  = await _dashboard.GetSummaryAsync(tenantId, ct);
            return await OkJson(req, summary);
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "GetInventoryDashboard failed");
            return await BadRequest(req, ex.Message);
        }
    }

    // ── GET /inventory/vendor-performance ────────────────────────────────────
    [Function("GetVendorPerformance")]
    public async Task<HttpResponseData> GetVendorPerformance(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "inventory/vendor-performance")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var qs       = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            Guid? vendorId = Guid.TryParse(qs["vendorId"], out var v) ? v : null;
            int page     = int.TryParse(qs["page"], out var p) ? p : 1;
            int pageSize = int.TryParse(qs["pageSize"], out var ps) ? ps : 20;

            var result = await _pos.GetVendorPerformanceAsync(tenantId, vendorId, page, pageSize, ct);
            return await OkJson(req, new
            {
                TotalCount = result.Total,
                result.Page,
                result.PageSize,
                Items = result.Items
            });
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "GetVendorPerformance failed");
            return await BadRequest(req, ex.Message);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static Guid ParseGuid(HttpRequestData req, string header)
    {
        var val = req.Headers.TryGetValues(header, out var vals) ? vals.FirstOrDefault() : null;
        return Guid.TryParse(val, out var g) ? g : throw new ArgumentException($"Missing or invalid header: {header}");
    }

    private static async Task<HttpResponseData> OkJson<T>(HttpRequestData req, T data, HttpStatusCode code = HttpStatusCode.OK)
    {
        var res = req.CreateResponse(code);
        await res.WriteAsJsonAsync(data);
        return res;
    }

    private static async Task<HttpResponseData> BadRequest(HttpRequestData req, string msg)
    {
        var res = req.CreateResponse(HttpStatusCode.BadRequest);
        await res.WriteStringAsync(msg);
        return res;
    }
}
