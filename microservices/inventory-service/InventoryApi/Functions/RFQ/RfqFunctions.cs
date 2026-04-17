using System.Net;
using System.Text.Json;
using InventoryApi.Data;
using InventoryApi.Helpers;
using InventoryApi.Models.DTOs;
using InventoryApi.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Functions.RFQ;

public sealed class RfqFunctions
{
    private readonly IRfqService _rfqs;
    private readonly InventoryDbContext _db;
    private readonly ILogger<RfqFunctions> _log;

    private static readonly JsonSerializerOptions _json =
        new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public RfqFunctions(IRfqService rfqs, InventoryDbContext db, ILogger<RfqFunctions> log)
    {
        _rfqs = rfqs;
        _db   = db;
        _log  = log;
    }

    // ---------- POST /rfqs ----------
    [Function("CreateRfq")]
    public async Task<HttpResponseData> Create(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "rfqs")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanCreate);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<CreateRfqRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Invalid request body.");

            var rfq = await _rfqs.CreateAsync(tenantId, userId, body, ct);
            return await OkJson(req, new { rfq.Id, rfq.RfqNumber, rfq.RfqStatus, rfq.CreatedAt }, HttpStatusCode.Created);
        }
        catch (UnauthorizedAccessException ex) { return await Forbidden(req, ex.Message); }
        catch (Exception ex)
        {
            var msg = ex.InnerException?.InnerException?.Message ?? ex.InnerException?.Message ?? ex.Message;
            _log.LogError(ex, "CreateRfq failed: {Message}", msg);
            return await BadRequest(req, msg);
        }
    }

    // ---------- GET /rfqs ----------
    [Function("ListRfqs")]
    public async Task<HttpResponseData> List(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "rfqs")]
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

            var result = await _rfqs.ListAsync(tenantId, branchId, status, page, pageSize, ct);

            // Bulk-enrich with acknowledgment and PO state (no N+1)
            var rfqIds = result.Items.Select(r => r.Id).ToList();

            var ackMap = rfqIds.Count > 0
                ? await _db.VendorAcknowledgments
                    .Where(a => a.TenantId == tenantId
                        && a.EntityType == "RfqAward"
                        && rfqIds.Contains(a.EntityId)
                        && a.DeletedAt == null)
                    .GroupBy(a => a.EntityId)
                    .Select(g => new { EntityId = g.Key, AckStatus = g.OrderByDescending(a => a.CreatedAt).First().AckStatus })
                    .ToDictionaryAsync(x => x.EntityId, x => x.AckStatus, ct)
                : new Dictionary<Guid, string>();

            var poMap = rfqIds.Count > 0
                ? await _db.PurchaseOrders
                    .Where(p => p.TenantId == tenantId
                        && p.RfqId != null
                        && rfqIds.Contains(p.RfqId.Value)
                        && p.DeletedAt == null
                        && p.PoStatus != "Cancelled")
                    .GroupBy(p => p.RfqId!.Value)
                    .Select(g => g.OrderByDescending(p => p.CreatedAt).First())
                    .ToDictionaryAsync(p => p.RfqId!.Value, p => new PoSnapshot(p.Id, p.PoNumber, p.PoStatus), ct)
                : new Dictionary<Guid, PoSnapshot>();

            return await OkJson(req, new
            {
                TotalCount = result.Total,
                result.Page,
                result.PageSize,
                Items = result.Items.Select(r => new
                {
                    r.Id,
                    r.RfqNumber,
                    r.Title,
                    r.RfqStatus,
                    r.BranchId,
                    r.ResponseDeadline,
                    r.CreatedAt,
                    r.AwardedToVendorId,
                    AwardedToVendorName = r.AwardedToVendor == null ? null : r.AwardedToVendor.Name,
                    r.CancellationReason,
                    AwardAcknowledgmentStatus = ackMap.TryGetValue(r.Id, out var ack) ? ack : null,
                    LinkedPurchaseOrderId     = poMap.TryGetValue(r.Id, out var po) ? (Guid?)po.Id : null,
                    LinkedPurchaseOrderNumber = po?.PoNumber,
                    LinkedPurchaseOrderStatus = po?.PoStatus
                })
            });
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- GET /rfqs/{id} ----------
    [Function("GetRfq")]
    public async Task<HttpResponseData> Get(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "rfqs/{id:guid}")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var rfq = await _rfqs.GetAsync(tenantId, id, ct);
            if (rfq is null) return req.CreateResponse(HttpStatusCode.NotFound);
            return await OkJson(req, new
            {
                rfq.Id, rfq.TenantId, rfq.BranchId, rfq.RequisitionId,
                rfq.RfqNumber, rfq.Title, rfq.RfqStatus,
                rfq.PublishedAt, rfq.ResponseDeadline, rfq.AwardedAt,
                rfq.AwardedToVendorId,
                AwardedToVendorName = rfq.AwardedToVendor == null ? null : rfq.AwardedToVendor.Name,
                rfq.CancellationReason, rfq.Notes,
                rfq.CreatedAt, rfq.UpdatedAt,
                Items = rfq.Items.Select(i => new
                {
                    i.Id, i.ItemId, i.RequestedQty, i.Unit, i.Specifications,
                    Item = i.Item == null ? null : new { i.Item.Id, i.Item.ItemName, i.Item.Unit }
                }),
                VendorInvites = rfq.VendorInvites.Select(v => new
                {
                    v.Id, v.VendorId, v.InviteStatus, v.InvitedAt, v.ViewedAt, v.RespondedAt,
                    Vendor = v.Vendor == null ? null : new { v.Vendor.Id, v.Vendor.Name }
                }),
                VendorQuotes = rfq.VendorQuotes.Select(q => new
                {
                    q.Id, q.VendorId, q.QuoteNumber, q.QuoteStatus, q.TotalAmount
                })
            });
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST /rfqs/{id}/publish ----------
    [Function("PublishRfq")]
    public async Task<HttpResponseData> Publish(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "rfqs/{id:guid}/publish")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var rfq = await _rfqs.PublishAsync(tenantId, userId, id, ct);
            return await OkJson(req, new { rfq.Id, rfq.RfqNumber, rfq.RfqStatus, rfq.PublishedAt });
        }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST /rfqs/{id}/close-response-window ----------
    [Function("CloseRfqResponseWindow")]
    public async Task<HttpResponseData> CloseResponseWindow(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "rfqs/{id:guid}/close-response-window")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanApprove);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var rfq = await _rfqs.CloseResponseWindowAsync(tenantId, userId, id, ct);
            return await OkJson(req, new { rfq.Id, rfq.RfqStatus });
        }
        catch (UnauthorizedAccessException ex) { return await Forbidden(req, ex.Message); }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST /rfqs/{id}/start-evaluation ----------
    [Function("StartRfqEvaluation")]
    public async Task<HttpResponseData> StartEvaluation(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "rfqs/{id:guid}/start-evaluation")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var rfq = await _rfqs.StartEvaluationAsync(tenantId, userId, id, ct);
            return await OkJson(req, new { rfq.Id, rfq.RfqStatus });
        }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST /rfqs/{id}/award ----------
    [Function("AwardRfq")]
    public async Task<HttpResponseData> Award(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "rfqs/{id:guid}/award")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanApprove);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<AwardRfqRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Invalid request body.");

            var rfq = await _rfqs.AwardAsync(tenantId, userId, id, body.VendorId, ct);
            return await OkJson(req, new { rfq.Id, rfq.RfqStatus, rfq.AwardedToVendorId, rfq.AwardedAt });
        }
        catch (UnauthorizedAccessException ex) { return await Forbidden(req, ex.Message); }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST /rfqs/{id}/cancel ----------
    [Function("CancelRfq")]
    public async Task<HttpResponseData> Cancel(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "rfqs/{id:guid}/cancel")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<CancelRfqRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Reason is required.");

            var rfq = await _rfqs.CancelAsync(tenantId, userId, id, body.Reason, ct);
            return await OkJson(req, new { rfq.Id, rfq.RfqStatus });
        }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST /rfqs/{id}/close ----------
    [Function("CloseRfq")]
    public async Task<HttpResponseData> Close(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "rfqs/{id:guid}/close")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var rfq = await _rfqs.CloseAsync(tenantId, userId, id, ct);
            return await OkJson(req, new { rfq.Id, rfq.RfqStatus });
        }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- GET /rfqs/{id}/quotes ----------
    [Function("GetRfqQuotes")]
    public async Task<HttpResponseData> GetQuotes(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "rfqs/{id:guid}/quotes")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var quotes = await _rfqs.GetQuotesAsync(tenantId, id, ct);
            return await OkJson(req, quotes);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST /rfqs/{id}/quotes ----------
    [Function("SubmitVendorQuote")]
    public async Task<HttpResponseData> SubmitQuote(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "rfqs/{id:guid}/quotes")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<SubmitQuoteRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Invalid request body.");

            var quote = await _rfqs.SubmitQuoteAsync(tenantId, userId, id, body, ct);
            return await OkJson(req, new { quote.Id, quote.QuoteNumber, quote.QuoteStatus, quote.TotalAmount }, HttpStatusCode.Created);
        }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST /rfqs/{id}/quotes/{quoteId}/request-clarification ----------
    [Function("RequestQuoteClarification")]
    public async Task<HttpResponseData> RequestClarification(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "rfqs/{id:guid}/quotes/{quoteId:guid}/request-clarification")]
        HttpRequestData req, FunctionContext ctx, Guid id, Guid quoteId, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<RequestClarificationRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Notes are required.");

            var quote = await _rfqs.RequestClarificationAsync(tenantId, userId, id, quoteId, body.Notes, ct);
            return await OkJson(req, new { quote.Id, quote.QuoteStatus, quote.ClarificationRequestedAt });
        }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST /rfqs/{id}/quotes/rank ----------
    [Function("RankRfqQuotes")]
    public async Task<HttpResponseData> RankQuotes(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "rfqs/{id:guid}/quotes/rank")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanApprove);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<RankQuotesRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Rankings are required.");

            var top = await _rfqs.RankQuotesAsync(tenantId, userId, id, body.Rankings, ct);
            return await OkJson(req, new { top.Id, top.RankPosition, top.QuoteStatus });
        }
        catch (UnauthorizedAccessException ex) { return await Forbidden(req, ex.Message); }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST /rfqs/{id}/quotes/{quoteId}/disqualify ----------
    [Function("DisqualifyRfqQuote")]
    public async Task<HttpResponseData> DisqualifyQuote(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "rfqs/{id:guid}/quotes/{quoteId:guid}/disqualify")]
        HttpRequestData req, FunctionContext ctx, Guid id, Guid quoteId, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanApprove);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<DisqualifyQuoteRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Reason is required.");

            var quote = await _rfqs.DisqualifyQuoteAsync(tenantId, userId, id, quoteId, body.Reason, ct);
            return await OkJson(req, new { quote.Id, quote.QuoteStatus });
        }
        catch (UnauthorizedAccessException ex) { return await Forbidden(req, ex.Message); }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST /rfqs/{id}/request-negotiation ----------
    [Function("RequestRfqNegotiation")]
    public async Task<HttpResponseData> RequestNegotiation(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "rfqs/{id:guid}/request-negotiation")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanApprove);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<ReasonRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Reason is required.");

            var rfq = await _rfqs.RequestNegotiationAsync(tenantId, userId, id, body.Reason, ct);
            return await OkJson(req, new { rfq.Id, rfq.RfqStatus });
        }
        catch (UnauthorizedAccessException ex) { return await Forbidden(req, ex.Message); }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST /rfqs/{id}/resolve-negotiation ----------
    [Function("ResolveRfqNegotiation")]
    public async Task<HttpResponseData> ResolveNegotiation(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "rfqs/{id:guid}/resolve-negotiation")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<ReasonRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Notes are required.");

            var rfq = await _rfqs.ResolveNegotiationAsync(tenantId, userId, id, body.Reason, ct);
            return await OkJson(req, new { rfq.Id, rfq.RfqStatus });
        }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST /rfqs/{id}/submit-for-approval ----------
    [Function("SubmitRfqForApproval")]
    public async Task<HttpResponseData> SubmitForApproval(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "rfqs/{id:guid}/submit-for-approval")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId         = ParseGuid(req, "X-Tenant-Id");
            var userId           = ParseGuid(req, "X-User-Id");
            var body             = await JsonSerializer.DeserializeAsync<SubmitForApprovalRequest>(req.Body, _json, ct)
                                   ?? throw new ArgumentException("ProposedVendorId is required.");

            var rfq = await _rfqs.SubmitForApprovalAsync(tenantId, userId, id, body.ProposedVendorId, ct);
            return await OkJson(req, new { rfq.Id, rfq.RfqStatus, rfq.AwardedToVendorId });
        }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST /rfqs/{id}/reject-approval ----------
    [Function("RejectRfqApproval")]
    public async Task<HttpResponseData> RejectApproval(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "rfqs/{id:guid}/reject-approval")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanApprove);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<ReasonRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Reason is required.");

            var rfq = await _rfqs.RejectFromApprovalAsync(tenantId, userId, id, body.Reason, ct);
            return await OkJson(req, new { rfq.Id, rfq.RfqStatus });
        }
        catch (UnauthorizedAccessException ex) { return await Forbidden(req, ex.Message); }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- GET /rfqs/{id}/history ----------
    [Function("GetRfqHistory")]
    public async Task<HttpResponseData> GetHistory(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "rfqs/{id:guid}/history")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var logs     = await _rfqs.GetHistoryAsync(tenantId, id, ct);
            return await OkJson(req, logs.Select(l => new
            {
                l.Id,
                l.FromStatus,
                l.ToStatus,
                l.Reason,
                l.ActorUserId,
                l.TransitionedAt
            }));
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static Guid ParseGuid(HttpRequestData req, string header)
    {
        var val = req.Headers.TryGetValues(header, out var vals) ? vals.FirstOrDefault() : null;
        return Guid.TryParse(val, out var g) ? g : throw new ArgumentException($"Missing or invalid header: {header}");
    }

    private static async Task<HttpResponseData> OkJson<T>(HttpRequestData req, T data, HttpStatusCode code = HttpStatusCode.OK)
    {
        var res = req.CreateResponse(code);
        await res.WriteAsJsonAsync(data);
        return res;
    }

    private static async Task<HttpResponseData> Forbidden(HttpRequestData req, string msg)
    {
        var res = req.CreateResponse(HttpStatusCode.Forbidden);
        await res.WriteStringAsync(msg);
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

/// <summary>Lightweight snapshot of a PO used in the RFQ list enrichment.</summary>
internal sealed record PoSnapshot(Guid Id, string PoNumber, string PoStatus);
