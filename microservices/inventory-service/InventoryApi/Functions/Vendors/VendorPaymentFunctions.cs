using System.Net;
using System.Text.Json;
using InventoryApi.Helpers;
using InventoryApi.Models.DTOs;
using InventoryApi.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Functions.Vendors;

public sealed class VendorPaymentFunctions
{
    private readonly IVendorPaymentService _payments;
    private readonly IReconciliationService _reconciliation;
    private readonly ILogger<VendorPaymentFunctions> _log;

    private static readonly JsonSerializerOptions _json =
        new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public VendorPaymentFunctions(
        IVendorPaymentService payments,
        IReconciliationService reconciliation,
        ILogger<VendorPaymentFunctions> log)
    {
        _payments       = payments;
        _reconciliation = reconciliation;
        _log            = log;
    }

    // ---------- GET inventory/vendors/{vendorId}/payments ----------
    [Function("ListVendorPayments")]
    public async Task<HttpResponseData> ListPayments(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "vendors/{vendorId:guid}/payments")]
        HttpRequestData req, FunctionContext ctx, Guid vendorId, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var qs       = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            int page     = int.TryParse(qs["page"],     out var p)  ? p  : 1;
            int pageSize = int.TryParse(qs["pageSize"], out var ps) ? ps : 20;
            var result   = await _payments.ListPaymentsAsync(tenantId, vendorId, page, pageSize, ct);
            return await OkJson(req, result);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST inventory/vendors/{vendorId}/payments ----------
    [Function("RecordVendorPayment")]
    public async Task<HttpResponseData> RecordPayment(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "vendors/{vendorId:guid}/payments")]
        HttpRequestData req, FunctionContext ctx, Guid vendorId, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanCreate);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<CreateVendorPaymentRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Invalid request body.");

            var payment = await _payments.RecordPaymentAsync(
                tenantId, userId,
                vendorId,
                body.InvoiceId,
                body.PaymentReference,
                body.PaymentDate,
                body.Amount,
                body.PaymentMode,
                body.ChequeNumber,
                body.BankTransactionId,
                body.Remarks,
                ct);

            var result = new
            {
                payment.Id,
                payment.VendorId,
                payment.PaymentReference,
                payment.Amount,
                payment.PaymentMode,
                payment.PaymentDate,
                payment.CreatedAt
            };
            return await OkJson(req, result, HttpStatusCode.Created);
        }
        catch (UnauthorizedAccessException) { return await Forbidden(req); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST inventory/vendor-payments/{id}/reverse ----------
    [Function("ReverseVendorPayment")]
    public async Task<HttpResponseData> ReversePayment(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "vendor-payments/{id:guid}/reverse")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanApprove);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");

            using var ms = new MemoryStream();
            await req.Body.CopyToAsync(ms, ct);
            ms.Position = 0;
            string reason = "No reason provided";
            if (ms.Length > 0)
            {
                var doc = await System.Text.Json.JsonDocument.ParseAsync(ms, cancellationToken: ct);
                if (doc.RootElement.TryGetProperty("reason", out var r)) reason = r.GetString() ?? reason;
            }

            await _payments.ReversePaymentAsync(tenantId, id, reason, userId, ct);
            return req.CreateResponse(HttpStatusCode.NoContent);
        }
        catch (UnauthorizedAccessException) { return await Forbidden(req); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- GET inventory/vendors/{vendorId}/outstanding ----------
    [Function("GetVendorOutstanding")]
    public async Task<HttpResponseData> GetOutstanding(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "vendors/{vendorId:guid}/outstanding")]
        HttpRequestData req, FunctionContext ctx, Guid vendorId, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var report   = await _reconciliation.GetVendorReportAsync(tenantId, vendorId, ct);
            return await OkJson(req, new
            {
                report.VendorId,
                report.VendorName,
                report.TotalInvoiced,
                report.TotalPaid,
                report.OutstandingBalance
            });
        }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.NotFound, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- GET inventory/vendors/{vendorId}/reconciliation ----------
    [Function("GetVendorReconciliation")]
    public async Task<HttpResponseData> GetReconciliation(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "vendors/{vendorId:guid}/reconciliation")]
        HttpRequestData req, FunctionContext ctx, Guid vendorId, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var report   = await _reconciliation.GetVendorReportAsync(tenantId, vendorId, ct);
            return await OkJson(req, report);
        }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.NotFound, ex.Message); }
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

    private static async Task<HttpResponseData> Forbidden(HttpRequestData req)
    {
        var res = req.CreateResponse(HttpStatusCode.Forbidden);
        await res.WriteStringAsync("Insufficient permissions.");
        return res;
    }
}
