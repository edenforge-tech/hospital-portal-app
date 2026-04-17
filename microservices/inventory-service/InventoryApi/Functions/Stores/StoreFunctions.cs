using System.Net;
using System.Text.Json;
using InventoryApi.Data;
using InventoryApi.Models.Entities;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Functions.Stores;

public sealed class StoreFunctions
{
    private readonly InventoryDbContext _db;
    private readonly ILogger<StoreFunctions> _log;

    private static readonly JsonSerializerOptions _json =
        new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public StoreFunctions(InventoryDbContext db, ILogger<StoreFunctions> log)
    {
        _db  = db;
        _log = log;
    }

    // ---------- GET inventory/stores ----------
    [Function("ListStores")]
    public async Task<HttpResponseData> ListStores(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "stores")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var stores = await _db.Stores
                .Where(s => s.TenantId == tenantId && s.DeletedAt == null)
                .OrderBy(s => s.StoreName)
                .Select(s => new { s.Id, s.StoreName, s.StoreType, s.IsActive, s.BranchId })
                .ToListAsync(ct);
            return await OkJson(req, stores);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- GET inventory/stores/{id} ----------
    [Function("GetStore")]
    public async Task<HttpResponseData> GetStore(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "stores/{id:guid}")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var store = await _db.Stores
                .Where(s => s.Id == id && s.TenantId == tenantId && s.DeletedAt == null)
                .Select(s => new { s.Id, s.StoreName, s.StoreType, s.IsActive, s.BranchId, s.CreatedAt })
                .FirstOrDefaultAsync(ct);
            if (store is null) return req.CreateResponse(HttpStatusCode.NotFound);
            return await OkJson(req, store);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST inventory/stores ----------
    [Function("CreateStore")]
    public async Task<HttpResponseData> CreateStore(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "stores")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<CreateStoreRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Invalid request body.");

            var store = new StoreMaster
            {
                Id                = Guid.NewGuid(),
                TenantId          = tenantId,
                BranchId          = body.BranchId,
                StoreName         = body.StoreName,
                StoreType         = body.StoreType ?? "Central",
                IsActive          = true,
                Status            = "active",
                CreatedAt         = DateTime.UtcNow,
                UpdatedAt         = DateTime.UtcNow,
                CreatedByUserId   = userId,
                UpdatedByUserId   = userId
            };
            _db.Stores.Add(store);
            await _db.SaveChangesAsync(ct);

            return await OkJson(req,
                new { store.Id, store.StoreName, store.StoreType, store.IsActive },
                HttpStatusCode.Created);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- PUT inventory/stores/{id} ----------
    [Function("UpdateStore")]
    public async Task<HttpResponseData> UpdateStore(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "stores/{id:guid}")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<CreateStoreRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Invalid request body.");

            var store = await _db.Stores
                .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId && s.DeletedAt == null, ct);
            if (store is null) return req.CreateResponse(HttpStatusCode.NotFound);

            store.StoreName       = body.StoreName;
            store.StoreType       = body.StoreType ?? store.StoreType;
            store.BranchId        = body.BranchId;
            store.UpdatedAt       = DateTime.UtcNow;
            store.UpdatedByUserId = userId;

            await _db.SaveChangesAsync(ct);
            return await OkJson(req, new { store.Id, store.StoreName, store.StoreType, store.IsActive });
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
}

public record CreateStoreRequest(string StoreName, string? StoreType, Guid? BranchId);
