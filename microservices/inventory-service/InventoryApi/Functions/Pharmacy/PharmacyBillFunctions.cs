using System.Net;
using System.Text.Json;
using InventoryApi.Models.DTOs;
using InventoryApi.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Functions.Pharmacy;

public sealed class PharmacyBillFunctions
{
    private readonly IPharmacyBillService _bills;
    private readonly ILogger<PharmacyBillFunctions> _log;

    private static readonly JsonSerializerOptions _json =
        new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public PharmacyBillFunctions(IPharmacyBillService bills, ILogger<PharmacyBillFunctions> log)
    {
        _bills = bills;
        _log   = log;
    }

    // ---------- GET inventory/pharmacy/bills ----------
    [Function("ListPharmacyBills")]
    public async Task<HttpResponseData> ListBills(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "pharmacy/bills")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var qs       = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            int page     = int.TryParse(qs["page"], out var p) ? p : 1;
            int pageSize = int.TryParse(qs["pageSize"], out var ps) ? ps : 20;
            Guid? storeId = Guid.TryParse(qs["storeId"], out var sid) ? sid : null;

            var result = await _bills.ListBillsAsync(tenantId, storeId, page, pageSize, ct);
            return await OkJson(req, result);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST inventory/pharmacy/bills ----------
    [Function("CreatePharmacyBill")]
    public async Task<HttpResponseData> CreateBill(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "pharmacy/bills")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<CreatePharmacyBillRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Invalid request body.");

            var bill = await _bills.CreateBillAsync(tenantId, userId, body, ct);
            var result = new
            {
                bill.Id,
                bill.BillNumber,
                bill.PatientId,
                TotalAmount = bill.NetAmount,
                bill.BillStatus,
                bill.CreatedAt
            };
            return await OkJson(req, result, HttpStatusCode.Created);
        }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- GET inventory/pharmacy/bills/{id} ----------
    [Function("GetPharmacyBill")]
    public async Task<HttpResponseData> GetBill(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "pharmacy/bills/{id:guid}")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var bill     = await _bills.GetBillAsync(tenantId, id, ct);
            if (bill is null) return req.CreateResponse(HttpStatusCode.NotFound);

            var result = new
            {
                bill.Id,
                bill.BillNumber,
                bill.PatientId,
                bill.PatientName,
                TotalAmount = bill.GrossAmount,
                bill.DiscountAmount,
                bill.NetAmount,
                bill.PaymentMode,
                bill.BillStatus,
                bill.CreatedAt,
                Items = bill.Items.Select(i => new
                {
                    i.Id,
                    i.ItemId,
                    i.StockBatchId,
                    i.Quantity,
                    i.Mrp,
                    i.DiscountPercent,
                    i.NetAmount
                })
            };
            return await OkJson(req, result);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST inventory/pharmacy/bills/{id}/confirm ----------
    [Function("ConfirmPharmacyBill")]
    public async Task<HttpResponseData> ConfirmBill(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "pharmacy/bills/{id:guid}/confirm")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var bill     = await _bills.ConfirmBillAsync(tenantId, id, userId, ct);
            return await OkJson(req, new { bill.Id, bill.BillNumber, bill.BillStatus, bill.NetAmount });
        }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST inventory/pharmacy/bills/{id}/record-payment ----------
    [Function("RecordPharmacyBillPayment")]
    public async Task<HttpResponseData> RecordPayment(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "pharmacy/bills/{id:guid}/record-payment")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<RecordPaymentRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Amount and paymentMode are required.");

            var bill = await _bills.RecordPaymentAsync(tenantId, id, userId, body.Amount, body.PaymentMode, ct);
            return await OkJson(req, new { bill.Id, bill.BillStatus, bill.PaidAmount, bill.BalanceAmount });
        }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST inventory/pharmacy/bills/{id}/cancel ----------
    [Function("CancelPharmacyBill")]
    public async Task<HttpResponseData> CancelBill(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "pharmacy/bills/{id:guid}/cancel")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var cancelled = await _bills.CancelBillAsync(tenantId, id, userId, ct);
            return cancelled
                ? req.CreateResponse(HttpStatusCode.NoContent)
                : req.CreateResponse(HttpStatusCode.NotFound);
        }
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
