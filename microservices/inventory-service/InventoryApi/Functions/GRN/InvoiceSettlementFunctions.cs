using System.Net;
using System.Text.Json;
using InventoryApi.Helpers;
using InventoryApi.Models.DTOs;
using InventoryApi.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Functions.GRN;

public sealed class InvoiceSettlementFunctions
{
    private readonly IInvoiceSettlementService _svc;
    private readonly ILogger<InvoiceSettlementFunctions> _log;

    private static readonly JsonSerializerOptions _json =
        new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public InvoiceSettlementFunctions(IInvoiceSettlementService svc, ILogger<InvoiceSettlementFunctions> log)
    {
        _svc = svc;
        _log = log;
    }

    // ---------- GET inventory/settlements ----------
    [Function("ListInvoiceSettlements")]
    public async Task<HttpResponseData> ListSettlements(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "settlements")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var qs       = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            int page     = int.TryParse(qs["page"],     out var p)  ? p  : 1;
            int pageSize = int.TryParse(qs["pageSize"], out var ps) ? ps : 20;
            var status   = qs["status"];

            var result = await _svc.ListAsync(tenantId, status, page, pageSize, ct);
            return await OkJson(req, result);
        }
        catch (Exception ex) { return await BadRequest(req, GetFullMessage(ex)); }
    }

    // ---------- GET inventory/settlements/{id} ----------
    [Function("GetInvoiceSettlement")]
    public async Task<HttpResponseData> GetSettlement(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "settlements/{id:guid}")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var dto = await _svc.GetAsync(tenantId, id, ct);
            if (dto is null) return req.CreateResponse(HttpStatusCode.NotFound);
            return await OkJson(req, dto);
        }
        catch (Exception ex) { return await BadRequest(req, GetFullMessage(ex)); }
    }

    // ---------- POST inventory/settlements/{id}/record-payment ----------
    [Function("RecordSettlementPayment")]
    public async Task<HttpResponseData> RecordPayment(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "settlements/{id:guid}/record-payment")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanCreate);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body = await JsonSerializer.DeserializeAsync<RecordSettlementPaymentRequest>(req.Body, _json, ct)
                       ?? throw new ArgumentException("Invalid request body.");

            var dto = await _svc.RecordPaymentAsync(tenantId, id, userId, body, ct);
            if (dto is null) return req.CreateResponse(HttpStatusCode.NotFound);
            return await OkJson(req, dto);
        }
        catch (UnauthorizedAccessException) { return await Forbidden(req); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (ArgumentException ex)         { return await BadRequest(req, ex.Message); }
        catch (Exception ex)                 { return await BadRequest(req, GetFullMessage(ex)); }
    }

    // ---------- POST inventory/settlements/{id}/apply-credit-note ----------
    [Function("ApplyCreditNote")]
    public async Task<HttpResponseData> ApplyCreditNote(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "settlements/{id:guid}/apply-credit-note")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanApprove);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body = await JsonSerializer.DeserializeAsync<ApplyCreditNoteRequest>(req.Body, _json, ct)
                       ?? throw new ArgumentException("Invalid request body.");

            var dto = await _svc.ApplyCreditNoteAsync(tenantId, id, userId, body, ct);
            if (dto is null) return req.CreateResponse(HttpStatusCode.NotFound);
            return await OkJson(req, dto);
        }
        catch (UnauthorizedAccessException) { return await Forbidden(req); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, GetFullMessage(ex)); }
    }

    // ---------- POST inventory/settlements/{id}/hold ----------
    [Function("HoldSettlement")]
    public async Task<HttpResponseData> Hold(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "settlements/{id:guid}/hold")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanApprove);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body = await JsonSerializer.DeserializeAsync<HoldSettlementRequest>(req.Body, _json, ct)
                       ?? throw new ArgumentException("Hold reason is required.");

            var dto = await _svc.HoldAsync(tenantId, id, userId, body.Reason, ct);
            if (dto is null) return req.CreateResponse(HttpStatusCode.NotFound);
            return await OkJson(req, dto);
        }
        catch (UnauthorizedAccessException) { return await Forbidden(req); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, GetFullMessage(ex)); }
    }

    // ---------- POST inventory/settlements/{id}/resume ----------
    [Function("ResumeSettlement")]
    public async Task<HttpResponseData> Resume(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "settlements/{id:guid}/resume")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanApprove);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var dto = await _svc.ResumeAsync(tenantId, id, userId, ct);
            if (dto is null) return req.CreateResponse(HttpStatusCode.NotFound);
            return await OkJson(req, dto);
        }
        catch (UnauthorizedAccessException) { return await Forbidden(req); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, GetFullMessage(ex)); }
    }

    // ---------- POST inventory/settlements/{id}/cancel ----------
    [Function("CancelSettlement")]
    public async Task<HttpResponseData> Cancel(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "settlements/{id:guid}/cancel")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanApprove);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body = await JsonSerializer.DeserializeAsync<CancelSettlementRequest>(req.Body, _json, ct)
                       ?? throw new ArgumentException("Cancellation reason is required.");

            var dto = await _svc.CancelAsync(tenantId, id, userId, body.Reason, ct);
            if (dto is null) return req.CreateResponse(HttpStatusCode.NotFound);
            return await OkJson(req, dto);
        }
        catch (UnauthorizedAccessException) { return await Forbidden(req); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, GetFullMessage(ex)); }
    }

    // ---------- POST inventory/settlements/{id}/write-off ----------
    [Function("WriteOffSettlement")]
    public async Task<HttpResponseData> WriteOff(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "settlements/{id:guid}/write-off")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanApprove);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body = await JsonSerializer.DeserializeAsync<WriteOffSettlementRequest>(req.Body, _json, ct)
                       ?? throw new ArgumentException("Write-off reason is required.");

            var dto = await _svc.WriteOffAsync(tenantId, id, userId, body.Reason, ct);
            if (dto is null) return req.CreateResponse(HttpStatusCode.NotFound);
            return await OkJson(req, dto);
        }
        catch (UnauthorizedAccessException) { return await Forbidden(req); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, GetFullMessage(ex)); }
    }

    // ---------- GET inventory/settlements/{id}/event-logs ----------
    [Function("GetSettlementEventLogs")]
    public async Task<HttpResponseData> GetEventLogs(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "settlements/{id:guid}/event-logs")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var logs = await _svc.GetEventLogsAsync(tenantId, id, ct);
            return await OkJson(req, logs);
        }
        catch (Exception ex) { return await BadRequest(req, GetFullMessage(ex)); }
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

    private static async Task<HttpResponseData> Forbidden(HttpRequestData req)
    {
        var res = req.CreateResponse(HttpStatusCode.Forbidden);
        await res.WriteStringAsync("Insufficient permissions.");
        return res;
    }

    private static string GetFullMessage(Exception ex)
    {
        var sb      = new System.Text.StringBuilder();
        var current = ex;
        while (current != null)
        {
            if (sb.Length > 0) sb.Append(" | InnerException: ");
            sb.Append(current.Message);
            current = current.InnerException;
        }
        return sb.ToString();
    }
}
