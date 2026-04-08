using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using IpManagementService.Models.Dtos;
using IpManagementService.Services;

namespace IpManagementService.Functions;

public class WardFunctions
{
    private readonly WardService _wardSvc;
    private readonly JwtService  _jwt;

    private static readonly JsonSerializerOptions Json = new()
    {
        PropertyNamingPolicy   = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        WriteIndented          = false,
    };

    public WardFunctions(WardService wardSvc, JwtService jwt)
    {
        _wardSvc = wardSvc;
        _jwt     = jwt;
    }

    // GET /api/ip-management/wards?branchId=...
    [Function("ListWards")]
    public async Task<HttpResponseData> ListWards(
        [HttpTrigger(AuthorizationLevel.Function, "get", Route = "ip-management/wards")]
        HttpRequestData req)
    {
        try
        {
            var (userId, tenantId) = _jwt.ValidateAndExtract(req);
            var tenantValidated    = _jwt.ExtractTenantId(req, tenantId);
            var qs = ParseQs(req.Url.Query);

            if (!qs.TryGetValue("branchId", out var branchStr) || !Guid.TryParse(branchStr, out var branchId))
                return await BadRequest(req, "branchId is required.");

            var wards = await _wardSvc.ListAsync(tenantValidated, branchId);
            return await Ok(req, wards);
        }
        catch (UnauthorizedAccessException ex) { return await Unauthorized(req, ex.Message); }
        catch (Exception ex) { return await InternalError(req, ex.Message); }
    }

    // POST /api/ip-management/wards
    [Function("CreateWard")]
    public async Task<HttpResponseData> CreateWard(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "ip-management/wards")]
        HttpRequestData req)
    {
        try
        {
            var (userId, tenantId) = _jwt.ValidateAndExtract(req);
            var tenantValidated    = _jwt.ExtractTenantId(req, tenantId);
            var qs    = ParseQs(req.Url.Query);
            if (!qs.TryGetValue("branchId", out var branchStr) || !Guid.TryParse(branchStr, out var branchId))
                return await BadRequest(req, "branchId is required.");

            var body = await JsonSerializer.DeserializeAsync<CreateWardRequest>(req.Body, Json)
                       ?? throw new ArgumentException("Request body is required.");

            var ward = await _wardSvc.CreateAsync(tenantValidated, branchId, userId, body);
            return await Created(req, ward);
        }
        catch (UnauthorizedAccessException ex) { return await Unauthorized(req, ex.Message); }
        catch (ArgumentException ex) { return await BadRequest(req, ex.Message); }
        catch (Exception ex) { return await InternalError(req, ex.Message); }
    }

    // PUT /api/ip-management/wards/{id}
    [Function("UpdateWard")]
    public async Task<HttpResponseData> UpdateWard(
        [HttpTrigger(AuthorizationLevel.Function, "put", Route = "ip-management/wards/{id:guid}")]
        HttpRequestData req, Guid id)
    {
        try
        {
            var (userId, tenantId) = _jwt.ValidateAndExtract(req);
            var tenantValidated    = _jwt.ExtractTenantId(req, tenantId);

            var body = await JsonSerializer.DeserializeAsync<UpdateWardRequest>(req.Body, Json)
                       ?? throw new ArgumentException("Request body is required.");

            var ward = await _wardSvc.UpdateAsync(id, tenantValidated, userId, body);
            if (ward is null) return await NotFound(req, "Ward not found.");
            return await Ok(req, ward);
        }
        catch (UnauthorizedAccessException ex) { return await Unauthorized(req, ex.Message); }
        catch (ArgumentException ex) { return await BadRequest(req, ex.Message); }
        catch (Exception ex) { return await InternalError(req, ex.Message); }
    }

    // GET /api/ip-management/wards/stats?branchId=...
    [Function("GetWardStats")]
    public async Task<HttpResponseData> GetWardStats(
        [HttpTrigger(AuthorizationLevel.Function, "get", Route = "ip-management/wards/stats")]
        HttpRequestData req)
    {
        try
        {
            var (_, tenantId) = _jwt.ValidateAndExtract(req);
            var tid = _jwt.ExtractTenantId(req, tenantId);
            var qs  = ParseQs(req.Url.Query);
            if (!qs.TryGetValue("branchId", out var branchStr) || !Guid.TryParse(branchStr, out var branchId))
                return await BadRequest(req, "branchId is required.");

            var stats = await _wardSvc.GetStatsAsync(tid, branchId);
            return await Ok(req, stats);
        }
        catch (UnauthorizedAccessException ex) { return await Unauthorized(req, ex.Message); }
        catch (Exception ex) { return await InternalError(req, ex.Message); }
    }

    // GET /api/ip-management/wards/{id}/beds
    [Function("GetWardBeds")]
    public async Task<HttpResponseData> GetWardBeds(
        [HttpTrigger(AuthorizationLevel.Function, "get", Route = "ip-management/wards/{id:guid}/beds")]
        HttpRequestData req, Guid id)
    {
        try
        {
            var (_, tenantId) = _jwt.ValidateAndExtract(req);
            var tid  = _jwt.ExtractTenantId(req, tenantId);
            var beds = await _wardSvc.GetBedsAsync(id, tid);
            return await Ok(req, beds);
        }
        catch (UnauthorizedAccessException ex) { return await Unauthorized(req, ex.Message); }
        catch (Exception ex) { return await InternalError(req, ex.Message); }
    }

    // DELETE /api/ip-management/wards/{id}
    [Function("DeleteWard")]
    public async Task<HttpResponseData> DeleteWard(
        [HttpTrigger(AuthorizationLevel.Function, "delete", Route = "ip-management/wards/{id:guid}")]
        HttpRequestData req, Guid id)
    {
        try
        {
            var (userId, tenantId) = _jwt.ValidateAndExtract(req);
            var tenantValidated    = _jwt.ExtractTenantId(req, tenantId);
            var deleted = await _wardSvc.DeleteAsync(id, tenantValidated, userId);
            if (!deleted) return await NotFound(req, "Ward not found.");
            return await Ok(req, new { message = "Ward deleted." });
        }
        catch (UnauthorizedAccessException ex) { return await Unauthorized(req, ex.Message); }
        catch (Exception ex) { return await InternalError(req, ex.Message); }
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private static Dictionary<string, string> ParseQs(string query)
    {
        var d = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        if (string.IsNullOrEmpty(query)) return d;
        foreach (var part in query.TrimStart('?').Split('&'))
        {
            var idx = part.IndexOf('=');
            if (idx > 0)
                d[Uri.UnescapeDataString(part[..idx])] = Uri.UnescapeDataString(part[(idx + 1)..]);
        }
        return d;
    }

    private async Task<HttpResponseData> Ok(HttpRequestData req, object payload)
    {
        var r = req.CreateResponse(HttpStatusCode.OK);
        r.Headers.Add("Content-Type", "application/json; charset=utf-8");
        await r.WriteStringAsync(JsonSerializer.Serialize(payload, Json));
        return r;
    }

    private async Task<HttpResponseData> Created(HttpRequestData req, object payload)
    {
        var r = req.CreateResponse(HttpStatusCode.Created);
        r.Headers.Add("Content-Type", "application/json; charset=utf-8");
        await r.WriteStringAsync(JsonSerializer.Serialize(payload, Json));
        return r;
    }

    private static async Task<HttpResponseData> BadRequest(HttpRequestData req, string message)
    {
        var r = req.CreateResponse(HttpStatusCode.BadRequest);
        await r.WriteAsJsonAsync(new { error = message });
        return r;
    }

    private static async Task<HttpResponseData> Unauthorized(HttpRequestData req, string message)
    {
        var r = req.CreateResponse(HttpStatusCode.Unauthorized);
        await r.WriteAsJsonAsync(new { error = message });
        return r;
    }

    private static async Task<HttpResponseData> NotFound(HttpRequestData req, string message)
    {
        var r = req.CreateResponse(HttpStatusCode.NotFound);
        await r.WriteAsJsonAsync(new { error = message });
        return r;
    }

    private static async Task<HttpResponseData> InternalError(HttpRequestData req, string message)
    {
        var r = req.CreateResponse(HttpStatusCode.InternalServerError);
        await r.WriteAsJsonAsync(new { error = message });
        return r;
    }
}
