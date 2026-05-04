using System.Net;
using System.Text.Json;
using InventoryApi.Data;
using InventoryApi.Helpers;
using InventoryApi.Models.DTOs;
using InventoryApi.Models.Entities;
using InventoryApi.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Functions.GRN;

public sealed class BillTransferFunctions
{
    private readonly IBillTransferService _svc;
    private readonly InventoryDbContext   _db;
    private readonly ILogger<BillTransferFunctions> _log;

    private static readonly JsonSerializerOptions _json =
        new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public BillTransferFunctions(IBillTransferService svc, InventoryDbContext db, ILogger<BillTransferFunctions> log)
    {
        _svc = svc;
        _db  = db;
        _log = log;
    }

    // ---------- GET inventory/bill-transfers ----------
    [Function("ListBillTransfers")]
    public async Task<HttpResponseData> ListBillTransfers(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "bill-transfers")]
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

    // ---------- GET inventory/bill-transfers/{id} ----------
    [Function("GetBillTransfer")]
    public async Task<HttpResponseData> GetBillTransfer(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "bill-transfers/{id:guid}")]
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

    // ---------- GET inventory/bill-transfers/changes ----------
    [Function("GetBillTransferChanges")]
    public async Task<HttpResponseData> GetChanges(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "bill-transfers/changes")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var qs       = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            var since    = qs["since"] is { } s && DateTime.TryParse(s, null,
                               System.Globalization.DateTimeStyles.RoundtripKind, out var dt)
                           ? dt
                           : DateTime.UtcNow.AddSeconds(-30);

            var items  = await _svc.GetChangedSinceAsync(tenantId, since, ct);
            var result = new BillTransferChangesDto(items, DateTime.UtcNow);
            return await OkJson(req, result);
        }
        catch (Exception ex) { return await BadRequest(req, GetFullMessage(ex)); }
    }

    // ---------- GET inventory/bill-transfers/{id}/event-log ----------
    [Function("GetBillTransferEventLog")]
    public async Task<HttpResponseData> GetEventLog(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "bill-transfers/{id:guid}/event-log")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var logs = await _svc.GetEventLogAsync(tenantId, id, ct);
            return await OkJson(req, logs);
        }
        catch (Exception ex) { return await BadRequest(req, GetFullMessage(ex)); }
    }

    // ---------- POST inventory/bill-transfers/from-grn/{grnId} ----------
    [Function("GenerateBillTransfer")]
    public async Task<HttpResponseData> GenerateBillTransfer(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "bill-transfers/from-grn/{grnId:guid}")]
        HttpRequestData req, FunctionContext ctx, Guid grnId, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanCreate);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var dto = await _svc.GenerateAsync(tenantId, grnId, userId, ct);
            return await OkJson(req, dto, HttpStatusCode.Created);
        }
        catch (UnauthorizedAccessException) { return await Forbidden(req); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, GetFullMessage(ex)); }
    }

    // ---------- POST inventory/bill-transfers/{id}/l1-approve ----------
    [Function("L1ApproveBillTransfer")]
    public async Task<HttpResponseData> L1Approve(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "bill-transfers/{id:guid}/l1-approve")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanApprove);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await TryDeserializeFullRequest(req, ct);

            // Idempotency check
            var idemKey = GetIdempotencyKey(req);
            if (idemKey is not null)
            {
                var cached = await CheckIdempotencyAsync(tenantId, "l1-approve", idemKey, ct);
                if (cached is not null) return await ReplayCached(req, cached);
            }

            var result = await _svc.L1ApproveAsync(tenantId, id, userId, body.Remarks,
                body.ExpectedVersion, body.OverrideReasonCode, body.OverrideReasonText, ct);
            if (result is null) return req.CreateResponse(HttpStatusCode.NotFound);

            if (idemKey is not null)
                await SaveIdempotencyAsync(tenantId, "l1-approve", idemKey, 200, result, ct);

            return await OkJson(req, result);
        }
        catch (UnauthorizedAccessException) { return await Forbidden(req); }
        catch (VersionConflictException ex) { return await VersionConflict(req, ex); }
        catch (SodViolationException ex)    { return await SodViolation(req, ex); }
        catch (InvalidOperationException ex){ return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex)                { return await BadRequest(req, GetFullMessage(ex)); }
    }

    // ---------- POST inventory/bill-transfers/{id}/l1-reject ----------
    [Function("L1RejectBillTransfer")]
    public async Task<HttpResponseData> L1Reject(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "bill-transfers/{id:guid}/l1-reject")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanApprove);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var (remarks, expectedVersion) = await TryDeserializeRequest(req, ct);
            var dto = await _svc.L1RejectAsync(tenantId, id, userId, remarks, expectedVersion, ct);
            if (dto is null) return req.CreateResponse(HttpStatusCode.NotFound);
            return await OkJson(req, dto);
        }
        catch (UnauthorizedAccessException) { return await Forbidden(req); }
        catch (VersionConflictException ex) { return await VersionConflict(req, ex); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, GetFullMessage(ex)); }
    }

    // ---------- POST inventory/bill-transfers/{id}/l2-approve ----------
    [Function("L2ApproveBillTransfer")]
    public async Task<HttpResponseData> L2Approve(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "bill-transfers/{id:guid}/l2-approve")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanApprove);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await TryDeserializeFullRequest(req, ct);

            var idemKey = GetIdempotencyKey(req);
            if (idemKey is not null)
            {
                var cached = await CheckIdempotencyAsync(tenantId, "l2-approve", idemKey, ct);
                if (cached is not null) return await ReplayCached(req, cached);
            }

            var result = await _svc.L2ApproveAsync(tenantId, id, userId, body.Remarks,
                body.ExpectedVersion, body.OverrideReasonCode, body.OverrideReasonText, ct);
            if (result is null) return req.CreateResponse(HttpStatusCode.NotFound);

            if (idemKey is not null)
                await SaveIdempotencyAsync(tenantId, "l2-approve", idemKey, 200, result, ct);

            return await OkJson(req, result);
        }
        catch (UnauthorizedAccessException) { return await Forbidden(req); }
        catch (VersionConflictException ex) { return await VersionConflict(req, ex); }
        catch (SodViolationException ex)    { return await SodViolation(req, ex); }
        catch (InvalidOperationException ex){ return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex)                { return await BadRequest(req, GetFullMessage(ex)); }
    }

    // ---------- POST inventory/bill-transfers/{id}/l2-reject ----------
    [Function("L2RejectBillTransfer")]
    public async Task<HttpResponseData> L2Reject(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "bill-transfers/{id:guid}/l2-reject")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanApprove);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var (remarks, expectedVersion) = await TryDeserializeRequest(req, ct);
            var dto = await _svc.L2RejectAsync(tenantId, id, userId, remarks, expectedVersion, ct);
            if (dto is null) return req.CreateResponse(HttpStatusCode.NotFound);
            return await OkJson(req, dto);
        }
        catch (UnauthorizedAccessException) { return await Forbidden(req); }
        catch (VersionConflictException ex) { return await VersionConflict(req, ex); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, GetFullMessage(ex)); }
    }

    // ---------- POST inventory/bill-transfers/{id}/resubmit ----------
    [Function("ResubmitBillTransfer")]
    public async Task<HttpResponseData> Resubmit(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "bill-transfers/{id:guid}/resubmit")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanCreate);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var (remarks, expectedVersion) = await TryDeserializeRequest(req, ct);
            var dto = await _svc.ResubmitAsync(tenantId, id, userId, remarks, expectedVersion, ct);
            if (dto is null) return req.CreateResponse(HttpStatusCode.NotFound);
            return await OkJson(req, dto);
        }
        catch (UnauthorizedAccessException) { return await Forbidden(req); }
        catch (VersionConflictException ex) { return await VersionConflict(req, ex); }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, GetFullMessage(ex)); }
    }

    // ---------- POST inventory/bill-transfers/{id}/cancel ----------
    [Function("CancelBillTransfer")]
    public async Task<HttpResponseData> Cancel(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "bill-transfers/{id:guid}/cancel")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanApprove);
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var (_, expectedVersion) = await TryDeserializeRequest(req, ct);
            var dto = await _svc.CancelAsync(tenantId, id, userId, expectedVersion, ct);
            if (dto is null) return req.CreateResponse(HttpStatusCode.NotFound);
            return await OkJson(req, dto);
        }
        catch (UnauthorizedAccessException) { return await Forbidden(req); }
        catch (VersionConflictException ex) { return await VersionConflict(req, ex); }
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

    private static string? GetIdempotencyKey(HttpRequestData req)
        => req.Headers.TryGetValues("Idempotency-Key", out var vals) ? vals.First() : null;

    /// <summary>Returns cached idempotency record if one exists for this key (not expired).</summary>
    private async Task<RequestIdempotency?> CheckIdempotencyAsync(
        Guid tenantId, string endpointKey, string idemKey, CancellationToken ct)
    {
        return await _db.RequestIdempotencies
            .AsNoTracking()
            .FirstOrDefaultAsync(
                r => r.TenantId == tenantId
                  && r.EndpointKey == endpointKey
                  && r.IdempotencyKey == idemKey
                  && r.ExpiresAt > DateTime.UtcNow, ct);
    }

    private async Task SaveIdempotencyAsync<T>(
        Guid tenantId, string endpointKey, string idemKey, int status, T body, CancellationToken ct)
    {
        try
        {
            var rec = new RequestIdempotency
            {
                TenantId      = tenantId,
                EndpointKey   = endpointKey,
                IdempotencyKey= idemKey,
                ResponseStatus= status,
                ResponseBody  = JsonSerializer.Serialize(body, _json)
            };
            _db.RequestIdempotencies.Add(rec);
            await _db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException) { /* duplicate – first request already saved it */ }
    }

    private static async Task<HttpResponseData> ReplayCached(HttpRequestData req, RequestIdempotency cached)
    {
        var res = req.CreateResponse((HttpStatusCode)cached.ResponseStatus);
        if (cached.ResponseBody is not null)
        {
            res.Headers.Add("Content-Type", "application/json; charset=utf-8");
            res.Headers.Add("X-Idempotent-Replayed", "true");
            await res.WriteStringAsync(cached.ResponseBody);
        }
        return res;
    }

    /// <summary>
    /// Deserializes full ApproveBillTransferRequest from body.
    /// All fields optional – missing body treated as empty request.
    /// </summary>
    private static async Task<ApproveBillTransferRequest> TryDeserializeFullRequest(HttpRequestData req, CancellationToken ct)
    {
        try
        {
            using var ms = new MemoryStream();
            await req.Body.CopyToAsync(ms, ct);
            if (ms.Length == 0) return new ApproveBillTransferRequest(null);
            ms.Position = 0;
            return JsonSerializer.Deserialize<ApproveBillTransferRequest>(ms, _json)
                   ?? new ApproveBillTransferRequest(null);
        }
        catch { return new ApproveBillTransferRequest(null); }
    }

    /// <summary>Legacy helper for endpoints that only need (remarks, expectedVersion).</summary>
    private static async Task<(string? Remarks, long? ExpectedVersion)> TryDeserializeRequest(HttpRequestData req, CancellationToken ct)
    {
        var r = await TryDeserializeFullRequest(req, ct);
        return (r.Remarks, r.ExpectedVersion);
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

    private static async Task<HttpResponseData> Forbidden(HttpRequestData req)
    {
        var res = req.CreateResponse(HttpStatusCode.Forbidden);
        await res.WriteStringAsync("Insufficient permissions.");
        return res;
    }

    private static async Task<HttpResponseData> Error(HttpRequestData req, HttpStatusCode code, string msg)
    {
        var res = req.CreateResponse(code);
        await res.WriteStringAsync(msg);
        return res;
    }

    private static async Task<HttpResponseData> VersionConflict(HttpRequestData req, VersionConflictException ex)
    {
        var res = req.CreateResponse(HttpStatusCode.Conflict);
        await res.WriteAsJsonAsync(new
        {
            error         = "version_conflict",
            message       = ex.Message,
            clientVersion = ex.ClientVersion,
            serverVersion = ex.ServerVersion
        });
        return res;
    }

    private static async Task<HttpResponseData> SodViolation(HttpRequestData req, SodViolationException ex)
    {
        var res = req.CreateResponse(HttpStatusCode.Conflict);
        await res.WriteAsJsonAsync(new
        {
            error   = "sod_violation",
            ruleId  = ex.RuleId,
            message = ex.Message
        });
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
