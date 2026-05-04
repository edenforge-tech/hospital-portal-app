using System.Net;
using System.Text.Json;
using InventoryApi.Helpers;
using InventoryApi.Models.DTOs;
using InventoryApi.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Functions.GRN;

public sealed class GrnFunctions
{
    private readonly IGrnService _grn;
    private readonly ILogger<GrnFunctions> _log;

    private static readonly JsonSerializerOptions _json =
        new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public GrnFunctions(IGrnService grn, ILogger<GrnFunctions> log)
    {
        _grn = grn;
        _log = log;
    }

    // ---------- GET inventory/grn ----------
    [Function("ListGrns")]
    public async Task<HttpResponseData> ListGrns(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "grn")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var qs       = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            int page     = int.TryParse(qs["page"], out var p) ? p : 1;
            int pageSize = int.TryParse(qs["pageSize"], out var ps) ? ps : 20;
            var status   = qs["status"];

            bool includeUngenerated = qs["includeUngenerated"] == "true";
            var result = await _grn.ListGrnsAsync(tenantId, status, page, pageSize, includeUngenerated, ct);
            return await OkJson(req, result);
        }
        catch (Exception ex) { return await BadRequest(req, GetFullMessage(ex)); }
    }

    // ---------- POST inventory/grn ----------
    [Function("CreateGrn")]
    public async Task<HttpResponseData> CreateGrn(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "grn")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanCreate);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<CreateGrnRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Invalid request body.");

            var dto = await _grn.CreateGrnAsync(tenantId, userId, body, ct);
            return await OkJson(req, dto, HttpStatusCode.Created);
        }
        catch (UnauthorizedAccessException) { return await Forbidden(req); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, GetFullMessage(ex)); }
    }

    // ---------- GET inventory/grn/{id} ----------
    [Function("GetGrn")]
    public async Task<HttpResponseData> GetGrn(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "grn/{id:guid}")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var dto = await _grn.GetGrnAsync(tenantId, id, ct);
            if (dto is null) return req.CreateResponse(HttpStatusCode.NotFound);
            return await OkJson(req, dto);
        }
        catch (Exception ex) { return await BadRequest(req, GetFullMessage(ex)); }
    }

    // ---------- POST inventory/grn/{id}/primary-approve ----------
    [Function("PrimaryApproveGrn")]
    public async Task<HttpResponseData> PrimaryApprove(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "grn/{id:guid}/primary-approve")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanApprove);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await TryDeserializeRemarks(req, ct);
            var dto = await _grn.PrimaryApproveAsync(tenantId, id, userId, body, ct);
            if (dto is null) return req.CreateResponse(HttpStatusCode.NotFound);
            return await OkJson(req, dto);
        }
        catch (UnauthorizedAccessException) { return await Forbidden(req); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, GetFullMessage(ex)); }
    }

    // ---------- POST inventory/grn/{id}/final-approve ----------
    [Function("FinalApproveGrn")]
    public async Task<HttpResponseData> FinalApprove(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "grn/{id:guid}/final-approve")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanApprove);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await TryDeserializeRemarks(req, ct);
            var dto = await _grn.FinalApproveAsync(tenantId, id, userId, body, ct);
            if (dto is null) return req.CreateResponse(HttpStatusCode.NotFound);
            return await OkJson(req, dto);
        }
        catch (UnauthorizedAccessException) { return await Forbidden(req); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, GetFullMessage(ex)); }
    }

    // ---------- POST inventory/grn/{id}/cancel ----------
    [Function("CancelGrn")]
    public async Task<HttpResponseData> CancelGrn(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "grn/{id:guid}/cancel")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanApprove);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var dto = await _grn.CancelAsync(tenantId, id, userId, ct);
            if (dto is null) return req.CreateResponse(HttpStatusCode.NotFound);
            return await OkJson(req, dto);
        }
        catch (UnauthorizedAccessException) { return await Forbidden(req); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, GetFullMessage(ex)); }
    }

    // ---------- POST inventory/grn/from-invoice/{invoiceId} ----------
    [Function("GenerateGrnFromInvoice")]
    public async Task<HttpResponseData> GenerateGrnFromInvoice(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "grn/from-invoice/{invoiceId:guid}")]
        HttpRequestData req, FunctionContext ctx, Guid invoiceId, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanCreate);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            using var ms = new MemoryStream();
            await req.Body.CopyToAsync(ms, ct);
            ms.Position = 0;
            DateTime grnDate = DateTime.UtcNow;
            string? remarks  = null;
            if (ms.Length > 0)
            {
                var doc = await JsonDocument.ParseAsync(ms, cancellationToken: ct);
                if (doc.RootElement.TryGetProperty("grnDate", out var d)) grnDate = d.GetDateTime();
                if (doc.RootElement.TryGetProperty("remarks", out var r)) remarks = r.GetString();
            }
            var dto = await _grn.GenerateGrnFromInvoiceAsync(tenantId, invoiceId, userId, grnDate, remarks, ct);
            return await OkJson(req, dto, HttpStatusCode.Created);
        }
        catch (UnauthorizedAccessException) { return await Forbidden(req); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, GetFullMessage(ex)); }
    }

    // ---------- POST inventory/grn/{id}/reject ----------
    [Function("RejectGrn")]
    public async Task<HttpResponseData> RejectGrn(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "grn/{id:guid}/reject")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanApprove);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await TryDeserializeRemarks(req, ct);
            var dto = await _grn.RejectAsync(tenantId, id, userId, body, ct);
            if (dto is null) return req.CreateResponse(HttpStatusCode.NotFound);
            return await OkJson(req, dto);
        }
        catch (UnauthorizedAccessException) { return await Forbidden(req); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, GetFullMessage(ex)); }
    }

    // ---------- helpers ----------
    private static Guid ParseGuid(HttpRequestData req, string header)
    {
        if (!req.Headers.TryGetValues(header, out var values))
            throw new ArgumentException($"Missing required header {header}.");
        return Guid.Parse(values.First());
    }

    /// <summary>Reads optional { "remarks": "..." } body; returns null if empty.</summary>
    private static async Task<string?> TryDeserializeRemarks(HttpRequestData req, CancellationToken ct)
    {
        try
        {
            using var ms = new MemoryStream();
            await req.Body.CopyToAsync(ms, ct);
            if (ms.Length == 0) return null;
            ms.Position = 0;
            var doc = await JsonDocument.ParseAsync(ms, cancellationToken: ct);
            return doc.RootElement.TryGetProperty("remarks", out var el) ? el.GetString() : null;
        }
        catch { return null; }
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

    /// <summary>Walks the inner exception chain and returns all messages joined.</summary>
    private static string GetFullMessage(Exception ex)
    {
        var sb = new System.Text.StringBuilder();
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
