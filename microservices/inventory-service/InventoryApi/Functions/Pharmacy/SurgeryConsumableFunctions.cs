using System.Net;
using System.Text.Json;
using InventoryApi.Models.DTOs;
using InventoryApi.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Functions.Pharmacy;

public sealed class SurgeryConsumableFunctions
{
    private readonly ISurgeryConsumableService _surgery;
    private readonly ILogger<SurgeryConsumableFunctions> _log;

    private static readonly JsonSerializerOptions _json =
        new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public SurgeryConsumableFunctions(ISurgeryConsumableService surgery, ILogger<SurgeryConsumableFunctions> log)
    {
        _surgery = surgery;
        _log     = log;
    }

    // ---------- GET inventory/surgery/consumables ----------
    [Function("ListSurgeryConsumables")]
    public async Task<HttpResponseData> ListConsumables(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "surgery/consumables")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var qs       = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            int page     = int.TryParse(qs["page"], out var p) ? p : 1;
            int pageSize = int.TryParse(qs["pageSize"], out var ps) ? ps : 20;
            Guid? storeId = Guid.TryParse(qs["storeId"], out var sid) ? sid : null;

            var result = await _surgery.ListConsumablesAsync(tenantId, storeId, page, pageSize, ct);
            return await OkJson(req, result);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST inventory/surgery/consumables ----------
    [Function("IssueSurgeryConsumables")]
    public async Task<HttpResponseData> Issue(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "surgery/consumables")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<IssueSurgeryConsumableRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Invalid request body.");

            await _surgery.IssueSurgeryConsumablesAsync(tenantId, userId, body, ct);
            return req.CreateResponse(HttpStatusCode.NoContent);
        }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST inventory/surgery/consumables/{id}/cancel ----------
    [Function("CancelSurgeryConsumable")]
    public async Task<HttpResponseData> Cancel(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "surgery/consumables/{id:guid}/cancel")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var cancelled = await _surgery.CancelConsumableAsync(tenantId, id, userId, ct);
            return cancelled
                ? req.CreateResponse(HttpStatusCode.NoContent)
                : req.CreateResponse(HttpStatusCode.NotFound);
        }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST inventory/surgery/consumables/plan ----------
    [Function("PlanSurgeryConsumables")]
    public async Task<HttpResponseData> Plan(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "surgery/consumables/plan")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body = await JsonSerializer.DeserializeAsync<PlanConsumableRequest>(req.Body, _json, ct)
                       ?? throw new ArgumentException("Invalid request body.");
            var result = await _surgery.PlanAsync(tenantId, userId, body, ct);
            return await OkJson(req, result, HttpStatusCode.Created);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST inventory/surgery/consumables/{id}/check-stock ----------
    [Function("CheckSurgeryConsumableStock")]
    public async Task<HttpResponseData> CheckStock(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "surgery/consumables/{id:guid}/check-stock")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var result = await _surgery.CheckStockAsync(tenantId, userId, id, ct);
            return await OkJson(req, result);
        }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST inventory/surgery/consumables/{id}/issue ----------
    [Function("IssueInOTConsumable")]
    public async Task<HttpResponseData> IssueInOT(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "surgery/consumables/{id:guid}/issue")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var result = await _surgery.IssueInOTAsync(tenantId, userId, id, ct);
            return await OkJson(req, result);
        }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST inventory/surgery/consumables/{id}/escalate ----------
    [Function("RaiseSurgeryConsumableEscalation")]
    public async Task<HttpResponseData> Escalate(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "surgery/consumables/{id:guid}/escalate")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body = await JsonSerializer.DeserializeAsync<RaiseEscalationRequest>(req.Body, _json, ct)
                       ?? throw new ArgumentException("Invalid request body.");
            var result = await _surgery.RaiseEscalationAsync(tenantId, userId, id, body.Reason, ct);
            return await OkJson(req, result);
        }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST inventory/surgery/consumables/{id}/resolve-escalation ----------
    [Function("ResolveSurgeryConsumableEscalation")]
    public async Task<HttpResponseData> ResolveEscalation(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "surgery/consumables/{id:guid}/resolve-escalation")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var result = await _surgery.ResolveEscalationAsync(tenantId, userId, id, ct);
            return await OkJson(req, result);
        }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST inventory/surgery/consumables/{id}/return ----------
    [Function("PostSurgeryConsumableReturn")]
    public async Task<HttpResponseData> PostReturn(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "surgery/consumables/{id:guid}/return")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body = await JsonSerializer.DeserializeAsync<PostConsumableReturnRequest>(req.Body, _json, ct)
                       ?? throw new ArgumentException("Invalid request body.");
            var result = await _surgery.PostReturnAsync(tenantId, userId, id, body.ReturnedQuantity, ct);
            return await OkJson(req, result);
        }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (ArgumentException ex) { return await BadRequest(req, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST inventory/surgery/consumables/{id}/close ----------
    [Function("CloseSurgeryConsumable")]
    public async Task<HttpResponseData> Close(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "surgery/consumables/{id:guid}/close")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var result = await _surgery.CloseAsync(tenantId, userId, id, ct);
            return await OkJson(req, result);
        }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
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

    private static async Task<HttpResponseData> Error(HttpRequestData req, HttpStatusCode code, string msg)
    {
        var res = req.CreateResponse(code);
        await res.WriteStringAsync(msg);
        return res;
    }
}
