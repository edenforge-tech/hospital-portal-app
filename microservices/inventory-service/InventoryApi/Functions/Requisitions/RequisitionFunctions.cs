using System.Net;
using System.Text.Json;
using InventoryApi.Models.DTOs;
using InventoryApi.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Functions.Requisitions;

public sealed class RequisitionFunctions
{
    private readonly IPurchaseRequisitionService _requisitions;
    private readonly ILogger<RequisitionFunctions> _log;

    private static readonly JsonSerializerOptions _json =
        new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public RequisitionFunctions(IPurchaseRequisitionService requisitions, ILogger<RequisitionFunctions> log)
    {
        _requisitions = requisitions;
        _log          = log;
    }

    // ---------- POST inventory/requisitions ----------
    [Function("CreateRequisition")]
    public async Task<HttpResponseData> CreateRequisition(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "requisitions")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<CreateRequisitionRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Invalid request body.");

            var requisition = await _requisitions.CreateAsync(tenantId, userId, body, ct);
            var result = new
            {
                requisition.Id,
                requisition.RequisitionNumber,
                requisition.StoreId,
                requisition.RequisitionType,
                requisition.Status,
                requisition.CreatedAt
            };
            return await OkJson(req, result, HttpStatusCode.Created);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- GET inventory/requisitions ----------
    [Function("ListRequisitions")]
    public async Task<HttpResponseData> ListRequisitions(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "requisitions")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var qs       = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            int page     = int.TryParse(qs["page"], out var p) ? p : 1;
            int pageSize = int.TryParse(qs["pageSize"], out var ps) ? ps : 20;

            var result = await _requisitions.ListAsync(tenantId, page, pageSize, ct);
            var mapped = new
            {
                TotalCount = result.Total,
                result.Page,
                result.PageSize,
                Items = result.Items.Select(r => new
                {
                    r.Id,
                    r.RequisitionNumber,
                    r.StoreId,
                    r.RequisitionType,
                    r.Status,
                    r.CreatedAt,
                    ItemCount = r.Items.Count
                })
            };
            return await OkJson(req, mapped);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- GET inventory/requisitions/{id} ----------
    [Function("GetRequisition")]
    public async Task<HttpResponseData> GetRequisition(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "requisitions/{id:guid}")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var result   = await _requisitions.GetAsync(tenantId, id, ct);
            if (result is null) return req.CreateResponse(HttpStatusCode.NotFound);

            var mapped = new
            {
                result.Id,
                result.RequisitionNumber,
                result.StoreId,
                result.RequisitionType,
                Status = result.RequisitionStatus,
                result.Remarks,
                result.CreatedAt,
                result.UpdatedAt,
                Items = result.Items.Select(i => new
                {
                    i.Id,
                    i.ItemId,
                    ItemName = i.Item?.ItemName ?? string.Empty,
                    i.RequiredQuantity,
                    i.CurrentStock,
                    i.PreferredVendor,
                    i.Remarks
                })
            };
            return await OkJson(req, mapped);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST inventory/requisitions/{id}/submit ----------
    [Function("SubmitRequisition")]
    public async Task<HttpResponseData> SubmitRequisition(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "requisitions/{id:guid}/submit")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var result   = await _requisitions.SubmitAsync(tenantId, id, userId, ct);
            if (result is null) return req.CreateResponse(HttpStatusCode.NotFound);
            return await OkJson(req, new { result.Id, result.RequisitionNumber, result.RequisitionStatus });
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST inventory/requisitions/{id}/approve ----------
    [Function("ApproveRequisition")]
    public async Task<HttpResponseData> ApproveRequisition(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "requisitions/{id:guid}/approve")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var remarks  = await TryDeserializeRemarks(req, ct);
            var result   = await _requisitions.ApproveAsync(tenantId, id, userId, remarks, ct);
            if (result is null) return req.CreateResponse(HttpStatusCode.NotFound);
            return await OkJson(req, new { result.Id, result.RequisitionNumber, result.RequisitionStatus });
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST inventory/requisitions/{id}/reject ----------
    [Function("RejectRequisition")]
    public async Task<HttpResponseData> RejectRequisition(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "requisitions/{id:guid}/reject")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var remarks  = await TryDeserializeRemarks(req, ct);
            var result   = await _requisitions.RejectAsync(tenantId, id, userId, remarks, ct);
            if (result is null) return req.CreateResponse(HttpStatusCode.NotFound);
            return await OkJson(req, new { result.Id, result.RequisitionNumber, result.RequisitionStatus });
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- GET inventory/requisitions/{id}/evaluate-path ----------
    [Function("EvaluatePolicyPath")]
    public async Task<HttpResponseData> EvaluatePolicyPath(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "requisitions/{id:guid}/evaluate-path")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var result   = await _requisitions.EvaluatePolicyPathAsync(tenantId, id, ct);
            return await OkJson(req, result);
        }
        catch (KeyNotFoundException)      { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await BadRequest(req, ex.Message); }
        catch (Exception ex)              { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST inventory/requisitions/{id}/convert-to-rfq ----------
    [Function("ConvertRequisitionToRfq")]
    public async Task<HttpResponseData> ConvertToRfq(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "requisitions/{id:guid}/convert-to-rfq")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<ConvertToRfqRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Invalid request body.");
            var rfq = await _requisitions.ConvertToRfqAsync(tenantId, userId, id, body, ct);
            return await OkJson(req, new
            {
                rfq.Id,
                rfq.RfqNumber,
                rfq.Title,
                rfq.RfqStatus,
                rfq.ResponseDeadline,
                rfq.CreatedAt
            }, HttpStatusCode.Created);
        }
        catch (KeyNotFoundException)         { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await BadRequest(req, ex.Message); }
        catch (Exception ex)                 { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST inventory/requisitions/{id}/convert-to-po ----------
    [Function("ConvertRequisitionToPO")]
    public async Task<HttpResponseData> ConvertToPO(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "requisitions/{id:guid}/convert-to-po")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<ConvertToPORequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Invalid request body.");
            var po = await _requisitions.ConvertToPOAsync(tenantId, userId, id, body, ct);
            return await OkJson(req, new
            {
                po.Id,
                po.PoNumber,
                po.PoStatus,
                po.NetAmount,
                po.CreatedAt
            }, HttpStatusCode.Created);
        }
        catch (KeyNotFoundException)         { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await BadRequest(req, ex.Message); }
        catch (Exception ex)                 { return await BadRequest(req, ex.Message); }
    }

    // ---------- helpers ----------
    private static Guid ParseGuid(HttpRequestData req, string header)
    {
        if (!req.Headers.TryGetValues(header, out var values))
            throw new ArgumentException($"Missing required header {header}.");
        return Guid.Parse(values.First());
    }

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
}
