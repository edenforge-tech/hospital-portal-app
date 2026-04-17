using System.Net;
using System.Text.Json;
using InventoryApi.Models.DTOs;
using InventoryApi.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Functions.Items;

public sealed class ItemFunctions
{
    private readonly IItemService _items;
    private readonly ILogger<ItemFunctions> _log;

    private static readonly JsonSerializerOptions _json =
        new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public ItemFunctions(IItemService items, ILogger<ItemFunctions> log)
    {
        _items = items;
        _log   = log;
    }

    // ---------- GET inventory/items ----------
    [Function("ListItems")]
    public async Task<HttpResponseData> ListItems(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "items")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var qs       = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            int page     = int.TryParse(qs["page"], out var p) ? p : 1;
            int pageSize = int.TryParse(qs["pageSize"], out var ps) ? ps : 20;
            var search   = qs["search"];

            var result = await _items.ListAsync(tenantId, page, pageSize, search, ct);
            return await OkJson(req, result);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- GET inventory/items/barcode/{code} ----------
    [Function("GetItemByBarcode")]
    public async Task<HttpResponseData> GetByBarcode(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "items/barcode/{code}")]
        HttpRequestData req, FunctionContext ctx, string code, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var dto = await _items.GetByBarcodeAsync(tenantId, code, ct);
            if (dto is null) return req.CreateResponse(HttpStatusCode.NotFound);
            return await OkJson(req, dto);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- GET inventory/items/{id} ----------
    [Function("GetItem")]
    public async Task<HttpResponseData> GetItem(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "items/{id:guid}")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var dto = await _items.GetAsync(tenantId, id, ct);
            if (dto is null) return req.CreateResponse(HttpStatusCode.NotFound);
            return await OkJson(req, dto);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST inventory/items ----------
    [Function("CreateItem")]
    public async Task<HttpResponseData> CreateItem(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "items")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<CreateItemRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Invalid request body.");

            var dto = await _items.CreateAsync(tenantId, userId, body, ct);
            return await OkJson(req, dto, HttpStatusCode.Created);
        }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- PUT inventory/items/{id} ----------
    [Function("UpdateItem")]
    public async Task<HttpResponseData> UpdateItem(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "items/{id:guid}")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<CreateItemRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Invalid request body.");

            var dto = await _items.UpdateAsync(tenantId, id, userId, body, ct);
            if (dto is null) return req.CreateResponse(HttpStatusCode.NotFound);
            return await OkJson(req, dto);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- DELETE inventory/items/{id} ----------
    [Function("DeleteItem")]
    public async Task<HttpResponseData> DeleteItem(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "items/{id:guid}")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var deleted  = await _items.DeleteAsync(tenantId, id, userId, ct);
            return deleted
                ? req.CreateResponse(HttpStatusCode.NoContent)
                : req.CreateResponse(HttpStatusCode.NotFound);
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
