using System.Net;
using InventoryApi.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Functions.Reports;

public sealed class GstSummaryFunctions
{
    private readonly IGstSummaryService _gst;
    private readonly ILogger<GstSummaryFunctions> _log;

    public GstSummaryFunctions(IGstSummaryService gst, ILogger<GstSummaryFunctions> log)
    {
        _gst = gst;
        _log = log;
    }

    // ---------- GET inventory/reports/gst-summary?year=2025&month=12&storeId= ----------
    [Function("GetGstSummary")]
    public async Task<HttpResponseData> GetGstSummary(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "reports/gst-summary")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var qs       = System.Web.HttpUtility.ParseQueryString(req.Url.Query);

            if (!int.TryParse(qs["year"], out var year) || !int.TryParse(qs["month"], out var month))
                return await BadRequest(req, "year and month query params are required.");

            Guid? storeId = Guid.TryParse(qs["storeId"], out var sid) ? sid : null;

            var result = await _gst.GetByMonthAsync(tenantId, storeId, year, month, ct);
            var res    = req.CreateResponse(HttpStatusCode.OK);
            await res.WriteAsJsonAsync(result);
            return res;
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- GET inventory/reports/gstr3b?year=2025&month=12 ----------
    [Function("ExportGstr3b")]
    public async Task<HttpResponseData> ExportGstr3b(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "reports/gstr3b")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var qs       = System.Web.HttpUtility.ParseQueryString(req.Url.Query);

            if (!int.TryParse(qs["year"], out var year) || !int.TryParse(qs["month"], out var month))
                return await BadRequest(req, "year and month query params are required.");

            var result = await _gst.GetGstr3bDataAsync(tenantId, year, month, ct);
            var res    = req.CreateResponse(HttpStatusCode.OK);
            await res.WriteAsJsonAsync(new { Year = year, Month = month, Summary = result });
            return res;
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- helpers ----------
    private static Guid ParseGuid(HttpRequestData req, string header)
    {
        if (!req.Headers.TryGetValues(header, out var values))
            throw new ArgumentException($"Missing required header {header}.");
        return Guid.Parse(values.First());
    }

    private static async Task<HttpResponseData> BadRequest(HttpRequestData req, string msg)
    {
        var res = req.CreateResponse(HttpStatusCode.BadRequest);
        await res.WriteStringAsync(msg);
        return res;
    }
}
