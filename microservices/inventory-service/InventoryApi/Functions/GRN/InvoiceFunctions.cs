using System.Net;
using System.Text.Json;
using InventoryApi.Helpers;
using InventoryApi.Models.DTOs;
using InventoryApi.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Functions.GRN;

public sealed class InvoiceFunctions
{
    private readonly IApprovalService _approval;
    private readonly ITaxService _tax;
    private readonly ILogger<InvoiceFunctions> _log;

    private static readonly JsonSerializerOptions _json =
        new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public InvoiceFunctions(IApprovalService approval, ITaxService tax,
        ILogger<InvoiceFunctions> log)
    {
        _approval = approval;
        _tax      = tax;
        _log      = log;
    }

    // ---------- POST inventory/invoices ----------
    [Function("CreateInvoice")]
    public async Task<HttpResponseData> CreateInvoice(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "invoices")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanCreate);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<CreateInvoiceRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Invalid request body.");

            var dto = await _approval.CreateInvoiceAsync(tenantId, userId, body, ct);
            return await OkJson(req, dto, HttpStatusCode.Created);
        }
        catch (UnauthorizedAccessException)
        {
            return await Forbidden(req);
        }
        catch (Exception ex)
        {
            return await BadRequest(req, ex.Message);
        }
    }

    // ---------- GET inventory/invoices/{id} ----------
    [Function("GetInvoice")]
    public async Task<HttpResponseData> GetInvoice(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "invoices/{id:guid}")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var dto = await _approval.GetInvoiceAsync(tenantId, id, ct);
            if (dto is null) return req.CreateResponse(HttpStatusCode.NotFound);
            return await OkJson(req, dto);
        }
        catch (Exception ex)
        {
            return await BadRequest(req, ex.Message);
        }
    }

    // ---------- GET inventory/invoices ----------
    [Function("ListInvoices")]
    public async Task<HttpResponseData> ListInvoices(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "invoices")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId    = ParseGuid(req, "X-Tenant-Id");
            var qs          = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            int page        = int.TryParse(qs["page"], out var p) ? p : 1;
            int pageSize    = int.TryParse(qs["pageSize"], out var ps) ? ps : 20;
            var vendorId    = Guid.TryParse(qs["vendorId"], out var vid) ? (Guid?)vid : null;
            var billingMode = qs["billingMode"];   // "Bulk" | "PatientSpecific" | null

            var result = await _approval.ListInvoicesAsync(tenantId, vendorId, billingMode, page, pageSize, ct);
            return await OkJson(req, result);
        }
        catch (Exception ex)
        {
            return await BadRequest(req, ex.Message);
        }
    }

    // ---------- POST inventory/invoices/{id}/submit ----------
    [Function("SubmitInvoice")]
    public async Task<HttpResponseData> SubmitInvoice(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "invoices/{id:guid}/submit")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanCreate);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            await _approval.SubmitInvoiceAsync(tenantId, id, userId, ct);
            return req.CreateResponse(HttpStatusCode.NoContent);
        }
        catch (UnauthorizedAccessException)
        {
            return await Forbidden(req);
        }
        catch (InvalidOperationException ex)
        {
            return await Error(req, HttpStatusCode.Conflict, ex.Message);
        }
        catch (Exception ex)
        {
            return await BadRequest(req, ex.Message);
        }
    }

    // ---------- POST inventory/invoices/{id}/approve ----------
    [Function("ApproveInvoice")]
    public async Task<HttpResponseData> ApproveInvoice(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "invoices/{id:guid}/approve")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanApprove);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<ApproveInvoiceRequest>(req.Body, _json, ct)
                           ?? new ApproveInvoiceRequest("FinalApproval", null);
            await _approval.ApproveInvoiceAsync(tenantId, id, userId, body, ct);
            return req.CreateResponse(HttpStatusCode.NoContent);
        }
        catch (UnauthorizedAccessException)
        {
            return await Forbidden(req);
        }
        catch (InvalidOperationException ex)
        {
            return await Error(req, HttpStatusCode.Conflict, ex.Message);
        }
        catch (Exception ex)
        {
            return await BadRequest(req, ex.Message);
        }
    }

    // ---------- POST inventory/invoices/{id}/cancel ----------
    [Function("CancelInvoice")]
    public async Task<HttpResponseData> CancelInvoice(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "invoices/{id:guid}/cancel")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanApprove);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            await _approval.CancelInvoiceAsync(tenantId, id, userId, ct);
            return req.CreateResponse(HttpStatusCode.NoContent);
        }
        catch (UnauthorizedAccessException)
        {
            return await Forbidden(req);
        }
        catch (InvalidOperationException ex)
        {
            return await Error(req, HttpStatusCode.Conflict, ex.Message);
        }
        catch (Exception ex)
        {
            return await BadRequest(req, ex.Message);
        }
    }

    // ---------- GET inventory/invoices/{id}/gst-summary ----------
    [Function("GetInvoiceGstSummary")]
    public async Task<HttpResponseData> GetInvoiceGstSummary(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "invoices/{id:guid}/gst-summary")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var result = await _approval.GetInvoiceGstSummaryAsync(tenantId, id, ct);
            return await OkJson(req, result);
        }
        catch (Exception ex)
        {
            return await BadRequest(req, ex.Message);
        }
    }

    // ---------- PATCH inventory/invoices/{id} ----------
    [Function("UpdateInvoice")]
    public async Task<HttpResponseData> UpdateInvoice(
        [HttpTrigger(AuthorizationLevel.Anonymous, "patch", Route = "invoices/{id:guid}")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanCreate);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await req.ReadFromJsonAsync<UpdateInvoiceRequest>(ct)
                           ?? throw new ArgumentException("Empty request body.");
            var result = await _approval.UpdateInvoiceAsync(tenantId, id, userId, body, ct);
            return result is null
                ? req.CreateResponse(HttpStatusCode.NotFound)
                : await OkJson(req, result);
        }
        catch (UnauthorizedAccessException)
        {
            return await Forbidden(req);
        }
        catch (Exception ex)
        {
            return await BadRequest(req, ex.Message);
        }
    }

    // ---------- PATCH inventory/invoices/{id}/items ----------
    [Function("UpdateInvoiceItems")]
    public async Task<HttpResponseData> UpdateInvoiceItems(
        [HttpTrigger(AuthorizationLevel.Anonymous, "patch", Route = "invoices/{id:guid}/items")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanCreate);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await req.ReadFromJsonAsync<UpdateInvoiceItemsRequest>(ct)
                           ?? throw new ArgumentException("Empty request body.");
            var result = await _approval.UpdateInvoiceItemsAsync(tenantId, id, userId, body, ct);
            return result is null
                ? req.CreateResponse(HttpStatusCode.NotFound)
                : await OkJson(req, result);
        }
        catch (UnauthorizedAccessException)
        {
            return await Forbidden(req);
        }
        catch (InvalidOperationException ex)
        {
            return await Error(req, HttpStatusCode.Conflict, ex.Message);
        }
        catch (Exception ex)
        {
            return await BadRequest(req, ex.Message);
        }
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
}
