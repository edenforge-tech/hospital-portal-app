using System.Net;
using System.Text.Json;
using InventoryApi.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Functions.Acknowledgments;

/// <summary>
/// Endpoints for recording and querying vendor acknowledgments of
/// RFQ awards and Purchase Orders.
/// </summary>
public sealed class VendorAcknowledgmentFunctions
{
    private readonly IVendorAcknowledgmentService _acks;
    private readonly ILogger<VendorAcknowledgmentFunctions> _log;

    private static readonly JsonSerializerOptions _json =
        new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public VendorAcknowledgmentFunctions(IVendorAcknowledgmentService acks, ILogger<VendorAcknowledgmentFunctions> log)
    {
        _acks = acks;
        _log  = log;
    }

    // ── GET /vendor-acknowledgments?entityType=RfqAward&entityId={guid} ─────
    [Function("GetVendorAcknowledgment")]
    public async Task<HttpResponseData> GetByEntity(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "vendor-acknowledgments")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId   = ParseGuid(req, "X-Tenant-Id");
            var qs         = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            var entityType = qs["entityType"] ?? throw new ArgumentException("entityType query param required.");
            var entityId   = Guid.TryParse(qs["entityId"], out var eid) ? eid : throw new ArgumentException("entityId query param required.");

            var ack = await _acks.GetByEntityAsync(tenantId, entityType, entityId, ct);
            if (ack is null) return req.CreateResponse(HttpStatusCode.NotFound);

            return await OkJson(req, ProjectAck(ack));
        }
        catch (ArgumentException ex) { return await BadRequest(req, ex.Message); }
        catch (Exception ex) { _log.LogError(ex, "GetVendorAcknowledgment error"); return await BadRequest(req, ex.Message); }
    }

    // ── GET /vendor-acknowledgments/pending ──────────────────────────────────
    [Function("ListPendingAcknowledgments")]
    public async Task<HttpResponseData> ListPending(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "vendor-acknowledgments/pending")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var list     = await _acks.ListPendingAsync(tenantId, ct);
            return await OkJson(req, list.Select(ProjectAck));
        }
        catch (Exception ex) { _log.LogError(ex, "ListPendingAcknowledgments error"); return await BadRequest(req, ex.Message); }
    }

    // ── POST /vendor-acknowledgments ─────────────────────────────────────────
    // Body: { vendorId, entityType, entityId, expiresInHours? }
    [Function("CreateVendorAcknowledgment")]
    public async Task<HttpResponseData> Create(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "vendor-acknowledgments")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId  = ParseGuid(req, "X-Tenant-Id");
            var actorId   = ParseGuid(req, "X-User-Id");
            var body      = await JsonSerializer.DeserializeAsync<CreateAckRequest>(req.Body, _json, ct)
                            ?? throw new ArgumentException("Invalid request body.");

            var expiresAt = DateTime.UtcNow.AddHours(body.ExpiresInHours ?? 72);
            var ack       = await _acks.CreatePendingAsync(tenantId, actorId,
                                body.VendorId, body.EntityType, body.EntityId, expiresAt, ct);

            return await OkJson(req, ProjectAck(ack), HttpStatusCode.Created);
        }
        catch (ArgumentException ex) { return await BadRequest(req, ex.Message); }
        catch (Exception ex) { _log.LogError(ex, "CreateVendorAcknowledgment error"); return await BadRequest(req, ex.Message); }
    }

    // ── POST /vendor-acknowledgments/{id}/confirm ────────────────────────────
    // Body: { status, channel, contactTarget?, ackNotes?, declineReason? }
    [Function("RecordVendorConfirmation")]
    public async Task<HttpResponseData> RecordConfirmation(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "vendor-acknowledgments/{id:guid}/confirm")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var actorId  = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<ConfirmAckRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Invalid request body.");

            var ack = await _acks.RecordConfirmationAsync(
                tenantId, actorId, id,
                body.Status, body.Channel, body.ContactTarget,
                body.AckNotes, body.DeclineReason, ct);

            return await OkJson(req, ProjectAck(ack));
        }
        catch (ArgumentException ex) { return await BadRequest(req, ex.Message); }
        catch (KeyNotFoundException)  { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { _log.LogError(ex, "RecordVendorConfirmation error"); return await BadRequest(req, ex.Message); }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private static object ProjectAck(InventoryApi.Models.Entities.VendorAcknowledgment a) => new
    {
        a.Id, a.TenantId, a.VendorId,
        VendorName    = a.Vendor?.Name,
        a.EntityType, a.EntityId,
        a.AckStatus, a.Channel, a.ContactTarget,
        a.AcknowledgedAt, a.AcknowledgedByUserId,
        a.AckNotes, a.DeclineReason,
        a.ExpiresAt, a.RemindersSent,
        a.CreatedAt, a.UpdatedAt,
    };

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

    private record CreateAckRequest(Guid VendorId, string EntityType, Guid EntityId, double? ExpiresInHours);
    private record ConfirmAckRequest(string Status, string Channel, string? ContactTarget, string? AckNotes, string? DeclineReason);
}
