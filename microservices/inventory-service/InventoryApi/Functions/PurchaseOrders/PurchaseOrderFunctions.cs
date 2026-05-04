using System.Net;
using System.Text.Json;
using InventoryApi.Helpers;
using InventoryApi.Models.DTOs;
using InventoryApi.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Functions.PurchaseOrders;

public sealed class PurchaseOrderFunctions
{
    private readonly IPurchaseOrderService _pos;
    private readonly ILogger<PurchaseOrderFunctions> _log;

    private static readonly JsonSerializerOptions _json =
        new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public PurchaseOrderFunctions(IPurchaseOrderService pos, ILogger<PurchaseOrderFunctions> log)
    {
        _pos = pos;
        _log = log;
    }

    // ---------- POST /purchase-orders ----------
    [Function("CreatePurchaseOrder")]
    public async Task<HttpResponseData> Create(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "purchase-orders")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<CreatePurchaseOrderRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Invalid request body.");

            var po = await _pos.CreateAsync(tenantId, userId, body, ct);
            return await OkJson(req, new { po.Id, po.PoNumber, po.PoStatus, po.NetAmount, po.CreatedAt }, HttpStatusCode.Created);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- PUT /purchase-orders/{id} ----------
    [Function("UpdatePurchaseOrder")]
    public async Task<HttpResponseData> Update(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "purchase-orders/{id:guid}")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<UpdatePurchaseOrderRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Invalid request body.");

            var po = await _pos.UpdateAsync(tenantId, userId, id, body, ct);
            return await OkJson(req, new { po.Id, po.PoNumber, po.PoStatus, po.NetAmount, po.UpdatedAt });
        }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- GET /purchase-orders ----------
    [Function("ListPurchaseOrders")]
    public async Task<HttpResponseData> List(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "purchase-orders")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var qs       = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            Guid? branchId = Guid.TryParse(qs["branchId"], out var b) ? b : null;
            string? status = qs["status"];
            int page     = int.TryParse(qs["page"], out var p) ? p : 1;
            int pageSize = int.TryParse(qs["pageSize"], out var ps) ? ps : 20;

            var result = await _pos.ListAsync(tenantId, branchId, status, page, pageSize, ct);
            return await OkJson(req, new
            {
                TotalCount = result.Total,
                result.Page,
                result.PageSize,
                Items = result.Items.Select(po => new
                {
                    po.Id,
                    po.PoNumber,
                    po.PoStatus,
                    po.SourceType,
                    po.VendorId,
                    VendorName = po.Vendor?.Name,
                    po.NetAmount,
                    po.PoDate,
                    po.IsEmergency,
                    po.CreatedAt
                })
            });
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- GET /purchase-orders/{id} ----------
    [Function("GetPurchaseOrder")]
    public async Task<HttpResponseData> Get(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "purchase-orders/{id:guid}")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var po = await _pos.GetAsync(tenantId, id, ct);
            if (po is null) return req.CreateResponse(HttpStatusCode.NotFound);

            var logs = await _pos.GetLogsAsync(tenantId, id, ct);

            return await OkJson(req, new
            {
                po.Id,
                po.PoNumber,
                po.PoStatus,
                po.SourceType,
                po.VendorId,
                VendorName = po.Vendor?.Name,
                po.BranchId,
                po.RequisitionId,
                po.RfqId,
                po.TotalAmount,
                po.GstAmount,
                po.NetAmount,
                po.PoDate,
                po.ExpectedDeliveryDate,
                po.ActualDeliveryDate,
                po.SentToVendorAt,
                po.ReceivedAt,
                po.IsEmergency,
                po.EmergencyBypassExpiry,
                po.L1ApprovedByUserId,
                po.L1ApprovedAt,
                po.L2ApprovedByUserId,
                po.L2ApprovedAt,
                po.RejectedByUserId,
                po.RejectedAt,
                po.RejectionReason,
                po.Terms,
                po.Notes,
                po.CreatedAt,
                po.UpdatedAt,
                Items = po.Items.Select(i => new
                {
                    i.Id,
                    i.ItemId,
                    ItemName = i.Item?.ItemName,
                    i.OrderedQty,
                    i.ReceivedQty,
                    i.UnitPrice,
                    i.GstPercent,
                    i.TotalAmount,
                    i.Unit,
                    i.RequiredBy,
                    i.Remarks,
                }).ToList(),
                TransitionLogs = logs.Select(l => new
                {
                    l.FromStatus,
                    l.ToStatus,
                    l.Reason,
                    l.ActorUserId,
                    l.TransitionedAt,
                }).ToList(),
            });
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST /purchase-orders/{id}/submit ----------
    [Function("SubmitPurchaseOrder")]
    public async Task<HttpResponseData> Submit(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "purchase-orders/{id:guid}/submit")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var po = await _pos.SubmitAsync(tenantId, userId, id, ct);
            return await OkJson(req, new { po.Id, po.PoNumber, po.PoStatus });
        }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST /purchase-orders/{id}/approve-l1 ----------
    [Function("ApprovePurchaseOrderL1")]
    public async Task<HttpResponseData> ApproveL1(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "purchase-orders/{id:guid}/approve-l1")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanApprove);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await TryDeserialize<ApprovePurchaseOrderRequest>(req, ct);
            var po = await _pos.ApproveL1Async(tenantId, userId, id, body?.Remarks, ct);
            return await OkJson(req, new { po.Id, po.PoNumber, po.PoStatus, po.L1ApprovedAt });
        }
        catch (UnauthorizedAccessException ex) { return await Forbidden(req, ex.Message); }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST /purchase-orders/{id}/approve-l2 ----------
    [Function("ApprovePurchaseOrderL2")]
    public async Task<HttpResponseData> ApproveL2(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "purchase-orders/{id:guid}/approve-l2")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanApprove);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await TryDeserialize<ApprovePurchaseOrderRequest>(req, ct);
            var po = await _pos.ApproveL2Async(tenantId, userId, id, body?.Remarks, ct);
            return await OkJson(req, new { po.Id, po.PoNumber, po.PoStatus, po.L2ApprovedAt });
        }
        catch (UnauthorizedAccessException ex) { return await Forbidden(req, ex.Message); }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST /purchase-orders/{id}/reject ----------
    [Function("RejectPurchaseOrder")]
    public async Task<HttpResponseData> Reject(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "purchase-orders/{id:guid}/reject")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<RejectPurchaseOrderRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Reason is required.");

            var po = await _pos.RejectAsync(tenantId, userId, id, body.Reason, ct);
            return await OkJson(req, new { po.Id, po.PoNumber, po.PoStatus, po.RejectedAt });
        }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST /purchase-orders/{id}/send-to-vendor ----------
    [Function("SendPurchaseOrderToVendor")]
    public async Task<HttpResponseData> SendToVendor(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "purchase-orders/{id:guid}/send-to-vendor")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanApprove);
            var tenantId  = ParseGuid(req, "X-Tenant-Id");
            var userId    = ParseGuid(req, "X-User-Id");
            var sendReq   = await TryDeserialize<SendToVendorRequest>(req, ct);
            var (po, ackId, notified) = await _pos.SendToVendorAsync(tenantId, userId, id, sendReq, ct);
            return await OkJson(req, new {
                po.Id, po.PoNumber, po.PoStatus, po.SentToVendorAt,
                AckId            = ackId,
                NotificationSent = notified,
            });
        }
        catch (UnauthorizedAccessException ex) { return await Forbidden(req, ex.Message); }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST /purchase-orders/{id}/cancel ----------
    [Function("CancelPurchaseOrder")]
    public async Task<HttpResponseData> Cancel(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "purchase-orders/{id:guid}/cancel")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<CancelPurchaseOrderRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Reason is required.");

            var po = await _pos.CancelAsync(tenantId, userId, id, body.Reason, ct);
            return await OkJson(req, new { po.Id, po.PoNumber, po.PoStatus });
        }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST /purchase-orders/{id}/close ----------
    [Function("ClosePurchaseOrder")]
    public async Task<HttpResponseData> Close(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "purchase-orders/{id:guid}/close")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var po = await _pos.CloseAsync(tenantId, userId, id, ct);
            return await OkJson(req, new { po.Id, po.PoNumber, po.PoStatus });
        }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST /purchase-orders/{id}/receive ----------
    [Function("RecordPurchaseOrderReceipt")]
    public async Task<HttpResponseData> RecordReceipt(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "purchase-orders/{id:guid}/receive")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<RecordPoReceiptRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Invalid request body.");

            var po = await _pos.RecordReceiptAsync(tenantId, userId, id, body, ct);
            return await OkJson(req, new
            {
                po.Id,
                po.PoNumber,
                po.PoStatus,
                po.ReceivedAt,
                po.ActualDeliveryDate
            });
        }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST /purchase-orders/{id}/generate-grn ----------
    [Function("GenerateGrnFromPurchaseOrder")]
    public async Task<HttpResponseData> GenerateGrnFromPo(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "purchase-orders/{id:guid}/generate-grn")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var grn = await _pos.GenerateGrnFromPoAsync(tenantId, userId, id, ct);
            return await OkJson(req, grn, HttpStatusCode.Created);
        }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static Guid ParseGuid(HttpRequestData req, string header)
    {
        var val = req.Headers.TryGetValues(header, out var vals) ? vals.FirstOrDefault() : null;
        return Guid.TryParse(val, out var g) ? g : throw new ArgumentException($"Missing or invalid header: {header}");
    }

    private static async Task<HttpResponseData> Forbidden(HttpRequestData req, string msg)
    {
        var res = req.CreateResponse(HttpStatusCode.Forbidden);
        await res.WriteStringAsync(msg);
        return res;
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
