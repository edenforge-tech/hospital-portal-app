using System.Net;
using System.Text.Json;
using InventoryApi.Models.DTOs;
using InventoryApi.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Functions.GRN;

/// <summary>
/// Endpoints for Bill Transfer policy administration:
/// - GET/PUT  /bill-transfers/policy          — tenant-level approval policy
/// - GET      /bill-transfers/reason-catalog  — reason codes for reject/override/resubmit
/// - GET      /bill-transfers/compliance      — compliance metrics report
/// - GET      /bill-transfers/sla-status      — SLA status for pending BTs
/// </summary>
public sealed class BillTransferPolicyFunctions
{
    private readonly IBillTransferPolicyService      _policy;
    private readonly IBillTransferService            _svc;
    private readonly IBillTransferSlaService         _sla;
    private readonly Data.InventoryDbContext         _db;
    private readonly ILogger<BillTransferPolicyFunctions> _log;

    private static readonly JsonSerializerOptions _json =
        new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public BillTransferPolicyFunctions(
        IBillTransferPolicyService policy,
        IBillTransferService       svc,
        IBillTransferSlaService    sla,
        Data.InventoryDbContext    db,
        ILogger<BillTransferPolicyFunctions> log)
    {
        _policy = policy;
        _svc    = svc;
        _sla    = sla;
        _db     = db;
        _log    = log;
    }

    // ---------- GET inventory/bill-transfers/policy ----------
    [Function("GetBillTransferPolicy")]
    public async Task<HttpResponseData> GetPolicy(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "bill-transfers/policy")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var policy   = await _policy.GetPolicyAsync(tenantId, ct);
            return await OkJson(req, policy);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- PUT inventory/bill-transfers/policy ----------
    [Function("UpsertBillTransferPolicy")]
    public async Task<HttpResponseData> UpsertPolicy(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "bill-transfers/policy")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");

            using var ms = new System.IO.MemoryStream();
            await req.Body.CopyToAsync(ms, ct);
            ms.Position = 0;
            using var doc = await System.Text.Json.JsonDocument.ParseAsync(ms, cancellationToken: ct);
            var root = doc.RootElement;

            decimal threshold = root.TryGetProperty("lowValueOverrideThreshold", out var tv) && tv.TryGetDecimal(out var d) ? d : 50_000m;
            bool    flexOverride   = !root.TryGetProperty("allowLowValueFlexOverride", out var fv) || fv.GetBoolean();
            bool    requireReason  = !root.TryGetProperty("requireOverrideReason",     out var rv) || rv.GetBoolean();

            var updated = await _policy.UpsertPolicyAsync(tenantId, threshold, flexOverride, requireReason, userId, ct);
            return await OkJson(req, updated);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- GET inventory/bill-transfers/reason-catalog ----------
    [Function("GetBillTransferReasonCatalog")]
    public async Task<HttpResponseData> GetReasonCatalog(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "bill-transfers/reason-catalog")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var qs       = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            var category = qs["category"];    // optional filter

            var query = _db.BtReasonCatalog
                .Where(r => r.IsActive && (r.TenantId == null || r.TenantId == tenantId));

            if (!string.IsNullOrWhiteSpace(category))
                query = query.Where(r => r.Category == category);

            var items = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions
                .ToListAsync(query.OrderBy(r => r.SortOrder).ThenBy(r => r.ReasonLabel), ct);

            var dtos = items.Select(r => new BillTransferReasonCatalogDto(
                r.Id, r.ReasonCode, r.ReasonLabel, r.Category, r.SortOrder)).ToList();

            return await OkJson(req, dtos);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- GET inventory/bill-transfers/compliance ----------
    [Function("GetBillTransferComplianceReport")]
    public async Task<HttpResponseData> GetComplianceReport(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "bill-transfers/compliance")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var report   = await _svc.GetComplianceReportAsync(tenantId, ct);
            return await OkJson(req, report);
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

    private static async Task<HttpResponseData> OkJson<T>(
        HttpRequestData req, T data, HttpStatusCode code = HttpStatusCode.OK)
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
