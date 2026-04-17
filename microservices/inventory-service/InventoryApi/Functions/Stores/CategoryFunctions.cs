using System.Net;
using System.Text.Json;
using InventoryApi.Data;
using InventoryApi.Models.Entities;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Functions.Stores;

public sealed class CategoryFunctions
{
    private readonly InventoryDbContext _db;
    private readonly ILogger<CategoryFunctions> _log;

    private static readonly JsonSerializerOptions _json =
        new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public CategoryFunctions(InventoryDbContext db, ILogger<CategoryFunctions> log)
    {
        _db  = db;
        _log = log;
    }

    // ---------- GET inventory/categories ----------
    [Function("ListCategories")]
    public async Task<HttpResponseData> ListCategories(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "categories")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var cats = await _db.PurchaseCategories
                .Where(c => c.TenantId == tenantId && c.DeletedAt == null)
                .OrderBy(c => c.CategoryName)
                .Select(c => new { c.Id, c.CategoryName, c.CategoryType, c.Status })
                .ToListAsync(ct);
            return await OkJson(req, cats);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- GET inventory/categories/{id} ----------
    [Function("GetCategory")]
    public async Task<HttpResponseData> GetCategory(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "categories/{id:guid}")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var cat = await _db.PurchaseCategories
                .Where(c => c.Id == id && c.TenantId == tenantId && c.DeletedAt == null)
                .Select(c => new { c.Id, c.CategoryName, c.CategoryType, c.Status, c.CreatedAt })
                .FirstOrDefaultAsync(ct);
            if (cat is null) return req.CreateResponse(HttpStatusCode.NotFound);
            return await OkJson(req, cat);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST inventory/categories ----------
    [Function("CreateCategory")]
    public async Task<HttpResponseData> CreateCategory(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "categories")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<CreateCategoryRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Invalid request body.");

            var cat = new PurchaseCategory
            {
                Id              = Guid.NewGuid(),
                TenantId        = tenantId,
                CategoryName    = body.CategoryName,
                CategoryType    = body.CategoryType ?? "Drugs",
                Status          = "active",
                CreatedAt       = DateTime.UtcNow,
                UpdatedAt       = DateTime.UtcNow,
                CreatedByUserId = userId,
                UpdatedByUserId = userId
            };
            _db.PurchaseCategories.Add(cat);
            await _db.SaveChangesAsync(ct);

            return await OkJson(req, new { cat.Id, cat.CategoryName, cat.CategoryType }, HttpStatusCode.Created);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- PUT inventory/categories/{id} ----------
    [Function("UpdateCategory")]
    public async Task<HttpResponseData> UpdateCategory(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "categories/{id:guid}")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<CreateCategoryRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Invalid request body.");

            var cat = await _db.PurchaseCategories
                .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId && c.DeletedAt == null, ct);
            if (cat is null) return req.CreateResponse(HttpStatusCode.NotFound);

            cat.CategoryName    = body.CategoryName;
            cat.CategoryType    = body.CategoryType ?? cat.CategoryType;
            cat.UpdatedAt       = DateTime.UtcNow;
            cat.UpdatedByUserId = userId;

            await _db.SaveChangesAsync(ct);
            return await OkJson(req, new { cat.Id, cat.CategoryName, cat.CategoryType });
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

public record CreateCategoryRequest(string CategoryName, string? CategoryType);
