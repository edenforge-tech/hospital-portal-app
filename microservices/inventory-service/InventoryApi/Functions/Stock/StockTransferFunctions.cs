using System.Net;
using System.Text.Json;
using InventoryApi.Models.DTOs;
using InventoryApi.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Functions.Stock;

public sealed class StockTransferFunctions
{
    private readonly IStockTransferService _transfers;
    private readonly ILogger<StockTransferFunctions> _log;

    private static readonly JsonSerializerOptions _json =
        new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public StockTransferFunctions(IStockTransferService transfers, ILogger<StockTransferFunctions> log)
    {
        _transfers = transfers;
        _log       = log;
    }

    // ---------- GET inventory/transfers ----------
    [Function("ListTransfers")]
    public async Task<HttpResponseData> ListTransfers(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "transfers")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var qs       = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            int page     = int.TryParse(qs["page"], out var p) ? p : 1;
            int pageSize = int.TryParse(qs["pageSize"], out var ps) ? ps : 20;
            Guid? fromStoreId = Guid.TryParse(qs["fromStoreId"], out var fid) ? fid : null;

            var result = await _transfers.ListTransfersAsync(tenantId, fromStoreId, page, pageSize, ct);
            return await OkJson(req, result);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST inventory/transfers ----------
    [Function("CreateTransfer")]
    public async Task<HttpResponseData> CreateTransfer(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "transfers")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<StockTransferRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Invalid request body.");

            var transfer = await _transfers.CreateTransferAsync(tenantId, userId, body, ct);
            var result   = new { transfer.Id, transfer.TransferNumber, transfer.TransferStatus, transfer.CreatedAt };
            return await OkJson(req, result, HttpStatusCode.Created);
        }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST inventory/transfers/{id}/approve ----------
    [Function("ApproveTransfer")]
    public async Task<HttpResponseData> ApproveTransfer(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "transfers/{id:guid}/approve")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var transfer = await _transfers.ApproveTransferAsync(tenantId, id, userId, ct);
            if (transfer is null) return req.CreateResponse(HttpStatusCode.NotFound);
            var result   = new { transfer.Id, transfer.TransferNumber, transfer.TransferStatus, transfer.UpdatedAt };
            return await OkJson(req, result);
        }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST inventory/transfers/{id}/dispatch ----------
    [Function("DispatchTransfer")]
    public async Task<HttpResponseData> DispatchTransfer(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "transfers/{id:guid}/dispatch")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var transfer = await _transfers.DispatchTransferAsync(tenantId, id, userId, ct);
            if (transfer is null) return req.CreateResponse(HttpStatusCode.NotFound);
            var result   = new { transfer.Id, transfer.TransferNumber, transfer.TransferStatus, transfer.DispatchedAt };
            return await OkJson(req, result);
        }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST inventory/transfers/{id}/receive ----------
    [Function("ReceiveTransfer")]
    public async Task<HttpResponseData> ReceiveTransfer(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "transfers/{id:guid}/receive")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var transfer = await _transfers.ReceiveTransferAsync(tenantId, id, userId, ct);
            if (transfer is null) return req.CreateResponse(HttpStatusCode.NotFound);
            var result   = new { transfer.Id, transfer.TransferNumber, transfer.TransferStatus, transfer.ReceivedAt };
            return await OkJson(req, result);
        }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- DELETE inventory/transfers/{id} (cancel) ----------
    [Function("CancelTransfer")]
    public async Task<HttpResponseData> CancelTransfer(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "transfers/{id:guid}")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            string? reason = null;
            try
            {
                var body = await JsonSerializer.DeserializeAsync<CancelTransferRequest>(req.Body, _json, ct);
                reason = body?.Reason;
            }
            catch { /* optional body */ }

            var transfer = await _transfers.CancelTransferAsync(tenantId, id, userId, reason, ct);
            if (transfer is null) return req.CreateResponse(HttpStatusCode.NotFound);
            return req.CreateResponse(HttpStatusCode.NoContent);
        }
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
