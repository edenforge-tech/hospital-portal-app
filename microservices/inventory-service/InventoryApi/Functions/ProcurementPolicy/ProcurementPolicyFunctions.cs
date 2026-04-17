using System.Net;
using System.Text.Json;
using InventoryApi.Models.DTOs;
using InventoryApi.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Functions.ProcurementPolicy;

public sealed class ProcurementPolicyFunctions
{
    private readonly IBranchProcurementPolicyService _policies;
    private readonly ILogger<ProcurementPolicyFunctions> _log;

    private static readonly JsonSerializerOptions _json =
        new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public ProcurementPolicyFunctions(IBranchProcurementPolicyService policies, ILogger<ProcurementPolicyFunctions> log)
    {
        _policies = policies;
        _log      = log;
    }

    // ---------- GET /procurement/policies?branchId= ----------
    [Function("ListProcurementPolicies")]
    public async Task<HttpResponseData> ListPolicies(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "procurement/policies")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var qs       = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            var branchId = Guid.TryParse(qs["branchId"], out var b) ? b : throw new ArgumentException("branchId is required.");

            var policies = await _policies.ListByBranchAsync(tenantId, branchId, ct);
            return await OkJson(req, policies);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- GET /procurement/policies/active?branchId= ----------
    [Function("GetActiveProcurementPolicy")]
    public async Task<HttpResponseData> GetActivePolicy(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "procurement/policies/active")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var qs       = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            var branchId = Guid.TryParse(qs["branchId"], out var b) ? b : throw new ArgumentException("branchId is required.");

            var policy = await _policies.GetActiveAsync(tenantId, branchId, ct);
            if (policy is null) return req.CreateResponse(HttpStatusCode.NotFound);
            return await OkJson(req, policy);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST /procurement/policies/draft ----------
    [Function("SaveProcurementPolicyDraft")]
    public async Task<HttpResponseData> SaveDraft(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "procurement/policies/draft")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<SavePolicyDraftRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Invalid request body.");

            var policy = await _policies.SaveDraftAsync(tenantId, userId, body, ct);
            return await OkJson(req, policy, HttpStatusCode.Created);
        }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST /procurement/policies/{id}/publish ----------
    [Function("PublishProcurementPolicy")]
    public async Task<HttpResponseData> PublishPolicy(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "procurement/policies/{id:guid}/publish")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await TryDeserialize<PublishPolicyRequest>(req, ct) ?? new PublishPolicyRequest();

            var policy = await _policies.PublishAsync(tenantId, userId, id, body, ct);
            return await OkJson(req, policy);
        }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- GET /procurement/policies/{id}/versions ----------
    [Function("GetProcurementPolicyVersions")]
    public async Task<HttpResponseData> GetVersions(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "procurement/policies/{id:guid}/versions")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var versions = await _policies.GetVersionHistoryAsync(tenantId, id, ct);
            return await OkJson(req, versions);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST /procurement/policies/{id}/rollback/{versionId} ----------
    [Function("RollbackProcurementPolicy")]
    public async Task<HttpResponseData> Rollback(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "procurement/policies/{id:guid}/rollback/{versionId:guid}")]
        HttpRequestData req, FunctionContext ctx, Guid id, Guid versionId, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var policy   = await _policies.RollbackAsync(tenantId, userId, id, versionId, ct);
            return await OkJson(req, policy);
        }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST /procurement/policies/{id}/archive ----------
    [Function("ArchiveProcurementPolicy")]
    public async Task<HttpResponseData> ArchivePolicy(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "procurement/policies/{id:guid}/archive")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var policy   = await _policies.ArchiveAsync(tenantId, userId, id, ct);
            return await OkJson(req, new { policy.Id, policy.PolicyName, policy.PolicyStatus, policy.EffectiveTo });
        }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST /procurement/policies/simulate ----------
    [Function("SimulateProcurementPolicy")]
    public async Task<HttpResponseData> Simulate(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "procurement/policies/simulate")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var body     = await JsonSerializer.DeserializeAsync<SimulatePolicyRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Invalid request body.");

            var result = await _policies.SimulateAsync(tenantId, body.BranchId, body, ct);
            return await OkJson(req, result);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static Guid ParseGuid(HttpRequestData req, string header)
    {
        var val = req.Headers.TryGetValues(header, out var vals) ? vals.FirstOrDefault() : null;
        return Guid.TryParse(val, out var g) ? g : throw new ArgumentException($"Missing or invalid header: {header}");
    }

    private static async Task<T?> TryDeserialize<T>(HttpRequestData req, CancellationToken ct)
    {
        try { return await JsonSerializer.DeserializeAsync<T>(req.Body, _json, ct); }
        catch { return default; }
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

    private static async Task<HttpResponseData> Error(HttpRequestData req, HttpStatusCode code, string msg)
    {
        var res = req.CreateResponse(code);
        await res.WriteStringAsync(msg);
        return res;
    }
}
