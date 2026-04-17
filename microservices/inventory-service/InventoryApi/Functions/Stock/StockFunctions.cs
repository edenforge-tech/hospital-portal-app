using System.Net;
using System.Text.Json;
using InventoryApi.Models.DTOs;
using InventoryApi.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Functions.Stock;

public sealed class StockFunctions
{
    private readonly IStockLedgerService _ledger;
    private readonly IExpiryAlertService _expiry;
    private readonly ILogger<StockFunctions> _log;

    public StockFunctions(IStockLedgerService ledger, IExpiryAlertService expiry,
        ILogger<StockFunctions> log)
    {
        _ledger = ledger;
        _expiry = expiry;
        _log    = log;
    }

    // ---------- GET inventory/stock/summary ----------
    [Function("GetStockSummary")]
    public async Task<HttpResponseData> GetSummary(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "stock/summary")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var qs       = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            Guid? storeId = Guid.TryParse(qs["storeId"], out var sid) ? sid : null;
            var result   = await _ledger.GetSummaryAsync(tenantId, storeId, ct);
            return await OkJson(req, result);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- GET inventory/stock/batches ----------
    [Function("GetStockBatches")]
    public async Task<HttpResponseData> GetBatches(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "stock/batches")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var qs       = System.Web.HttpUtility.ParseQueryString(req.Url.Query);

            if (!Guid.TryParse(qs["storeId"], out var storeId))
                return await BadRequest(req, "storeId query param is required.");
            if (!Guid.TryParse(qs["itemId"], out var itemId))
                return await BadRequest(req, "itemId query param is required.");

            var result = await _ledger.GetBatchesAsync(tenantId, storeId, itemId, ct);
            return await OkJson(req, result);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- GET inventory/stock/below-reorder ----------
    [Function("GetBelowReorder")]
    public async Task<HttpResponseData> GetBelowReorder(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "stock/below-reorder")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var result   = await _ledger.GetBelowReorderAsync(tenantId, ct);
            return await OkJson(req, result);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- GET inventory/stock/expiring ----------
    [Function("GetExpiringBatches")]
    public async Task<HttpResponseData> GetExpiring(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "stock/expiring")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var qs       = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            int days     = int.TryParse(qs["daysAhead"], out var d) ? d : 90;
            var batches  = await _expiry.GetExpiringBatchesAsync(tenantId, days, ct);

            var result = batches.Select(b => new
            {
                b.Id,
                b.ItemId,
                ItemName         = b.Item?.ItemName,
                b.StoreId,
                StoreName        = b.Store?.StoreName,
                b.BatchNumber,
                ExpiryDate        = b.ExpiryDate,
                QuantityAvailable = b.QuantityAvailable,
                b.RequiresColdStorage
            });
            return await OkJson(req, result);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- GET inventory/stock/cold-chain-alerts ----------
    [Function("GetColdChainAlerts")]
    public async Task<HttpResponseData> GetColdChainAlerts(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "stock/cold-chain-alerts")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var result   = await _ledger.GetColdChainAlertsAsync(tenantId, ct);
            return await OkJson(req, result);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- GET inventory/stock/ledger ----------
    [Function("GetStockLedger")]
    public async Task<HttpResponseData> GetLedger(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "stock/ledger")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var qs       = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            Guid? storeId = Guid.TryParse(qs["storeId"], out var sid) ? sid : null;
            Guid? itemId  = Guid.TryParse(qs["itemId"],  out var iid) ? iid : null;
            DateTime? from = DateTime.TryParse(qs["from"], out var f) ? f : null;
            DateTime? to   = DateTime.TryParse(qs["to"],   out var t) ? t : null;
            int page      = int.TryParse(qs["page"],     out var p)  ? p  : 1;
            int pageSize  = int.TryParse(qs["pageSize"], out var ps) ? ps : 50;

            var result = await _ledger.GetLedgerAsync(tenantId, storeId, itemId, from, to, page, pageSize, ct);
            return await OkJson(req, result);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST inventory/stock/adjustments ----------
    [Function("CreateStockAdjustment")]
    public async Task<HttpResponseData> CreateAdjustment(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "stock/adjustments")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<CreateStockAdjustmentRequest>(
                               req.Body, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }, ct)
                           ?? throw new ArgumentException("Invalid request body.");
            var entry = await _ledger.CreateAdjustmentAsync(tenantId, userId, body, ct);
            var result = new
            {
                entry.Id,
                entry.StoreId,
                entry.ItemId,
                entry.TransactionType,
                entry.QuantityIn,
                entry.QuantityOut,
                entry.BalanceQuantity,
                entry.UnitRate,
                entry.TotalValue,
                entry.Remarks,
                entry.TransactionDate,
                entry.CreatedAt
            };
            return await OkJson(req, result, HttpStatusCode.Created);
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
}
