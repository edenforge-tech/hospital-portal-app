using System.Net;
using System.Text.Json;
using InventoryApi.Models.DTOs;
using InventoryApi.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Functions.Vendors;

public sealed class VendorFunctions
{
    private readonly IVendorService _vendors;
    private readonly ILogger<VendorFunctions> _log;

    private static readonly JsonSerializerOptions _json =
        new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public VendorFunctions(IVendorService vendors, ILogger<VendorFunctions> log)
    {
        _vendors = vendors;
        _log     = log;
    }

    // ---------- GET inventory/vendors ----------
    [Function("ListVendors")]
    public async Task<HttpResponseData> ListVendors(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "vendors")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId    = ParseGuid(req, "X-Tenant-Id");
            var qs          = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            int page        = int.TryParse(qs["page"], out var p) ? p : 1;
            int pageSize    = int.TryParse(qs["pageSize"], out var ps) ? ps : 20;
            string? category   = qs["category"];
            bool? isPreferred  = qs["isPreferred"] is { } ip ? bool.TryParse(ip, out var b) && b ? true : (bool?)false : null;
            var result      = await _vendors.ListAsync(tenantId, page, pageSize, category, isPreferred, ct);
            return await OkJson(req, result);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- POST inventory/vendors ----------
    [Function("CreateVendor")]
    public async Task<HttpResponseData> CreateVendor(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "vendors")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<CreateVendorRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Invalid request body.");
            var dto = await _vendors.CreateAsync(tenantId, userId, body, ct);
            return await OkJson(req, dto, HttpStatusCode.Created);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- GET inventory/vendors/{id} ----------
    [Function("GetVendor")]
    public async Task<HttpResponseData> GetVendor(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "vendors/{id:guid}")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var dto = await _vendors.GetAsync(tenantId, id, ct);
            if (dto is null) return req.CreateResponse(HttpStatusCode.NotFound);
            return await OkJson(req, dto);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- PUT inventory/vendors/{id} ----------
    [Function("UpdateVendor")]
    public async Task<HttpResponseData> UpdateVendor(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "vendors/{id:guid}")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<CreateVendorRequest>(req.Body, _json, ct)
                           ?? throw new ArgumentException("Invalid request body.");
            var dto = await _vendors.UpdateAsync(tenantId, id, userId, body, ct);
            if (dto is null) return req.CreateResponse(HttpStatusCode.NotFound);
            return await OkJson(req, dto);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ---------- DELETE inventory/vendors/{id} ----------
    [Function("DeleteVendor")]
    public async Task<HttpResponseData> DeleteVendor(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "vendors/{id:guid}")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var deleted  = await _vendors.DeleteAsync(tenantId, id, userId, ct);
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
}
