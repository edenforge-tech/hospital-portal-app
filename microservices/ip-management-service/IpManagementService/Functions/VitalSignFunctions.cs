using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using IpManagementService.Models.Dtos;
using IpManagementService.Services;

namespace IpManagementService.Functions;

/// <summary>
/// Routes:
///   GET  /api/ip-management/journeys/{id}/vitals
///   POST /api/ip-management/journeys/{id}/vitals
///   GET  /api/ip-management/journeys/{id}/nurse-records
///   POST /api/ip-management/journeys/{id}/nurse-records
/// </summary>
public class VitalSignFunctions
{
    private readonly VitalSignService _vitalSvc;
    private readonly JwtService       _jwt;

    private static readonly JsonSerializerOptions Json = new()
    {
        PropertyNamingPolicy   = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        WriteIndented          = false,
    };

    public VitalSignFunctions(VitalSignService vitalSvc, JwtService jwt)
    {
        _vitalSvc = vitalSvc;
        _jwt      = jwt;
    }

    // ── Vital Signs ────────────────────────────────────────────────────────────

    [Function("GetVitals")]
    public async Task<HttpResponseData> GetVitals(
        [HttpTrigger(AuthorizationLevel.Function, "get",
            Route = "ip-management/journeys/{id:guid}/vitals")]
        HttpRequestData req, Guid id)
    {
        try
        {
            var (_, tenantId) = _jwt.ValidateAndExtract(req);
            var tid  = _jwt.ExtractTenantId(req, tenantId);
            var data = await _vitalSvc.GetVitalsAsync(id, tid);
            return await Ok(req, data);
        }
        catch (UnauthorizedAccessException ex) { return await Unauthorized(req, ex.Message); }
        catch (Exception ex) { return await InternalError(req, ex.Message); }
    }

    [Function("AddVital")]
    public async Task<HttpResponseData> AddVital(
        [HttpTrigger(AuthorizationLevel.Function, "post",
            Route = "ip-management/journeys/{id:guid}/vitals")]
        HttpRequestData req, Guid id)
    {
        try
        {
            var (userId, tenantId) = _jwt.ValidateAndExtract(req);
            var tid  = _jwt.ExtractTenantId(req, tenantId);
            var body = await JsonSerializer.DeserializeAsync<AddVitalSignRequest>(req.Body, Json)
                       ?? throw new ArgumentException("Body required.");
            var result = await _vitalSvc.AddVitalAsync(id, tid, userId, body);
            return await Created(req, result);
        }
        catch (UnauthorizedAccessException ex) { return await Unauthorized(req, ex.Message); }
        catch (ArgumentException ex) { return await BadRequest(req, ex.Message); }
        catch (Exception ex) { return await InternalError(req, ex.Message); }
    }

    // ── Nurse Records ──────────────────────────────────────────────────────────

    [Function("GetNurseRecords")]
    public async Task<HttpResponseData> GetNurseRecords(
        [HttpTrigger(AuthorizationLevel.Function, "get",
            Route = "ip-management/journeys/{id:guid}/nurse-records")]
        HttpRequestData req, Guid id)
    {
        try
        {
            var (_, tenantId) = _jwt.ValidateAndExtract(req);
            var tid  = _jwt.ExtractTenantId(req, tenantId);
            var data = await _vitalSvc.GetNurseRecordsAsync(id, tid);
            return await Ok(req, data);
        }
        catch (UnauthorizedAccessException ex) { return await Unauthorized(req, ex.Message); }
        catch (Exception ex) { return await InternalError(req, ex.Message); }
    }

    [Function("AddNurseRecord")]
    public async Task<HttpResponseData> AddNurseRecord(
        [HttpTrigger(AuthorizationLevel.Function, "post",
            Route = "ip-management/journeys/{id:guid}/nurse-records")]
        HttpRequestData req, Guid id)
    {
        try
        {
            var (userId, tenantId) = _jwt.ValidateAndExtract(req);
            var tid  = _jwt.ExtractTenantId(req, tenantId);
            var body = await JsonSerializer.DeserializeAsync<AddNurseRecordRequest>(req.Body, Json)
                       ?? throw new ArgumentException("Body required.");
            var result = await _vitalSvc.AddNurseRecordAsync(id, tid, userId, body);
            return await Created(req, result);
        }
        catch (UnauthorizedAccessException ex) { return await Unauthorized(req, ex.Message); }
        catch (ArgumentException ex) { return await BadRequest(req, ex.Message); }
        catch (Exception ex) { return await InternalError(req, ex.Message); }
    }

    // ── Update ─────────────────────────────────────────────────────────────────

    [Function("UpdateVital")]
    public async Task<HttpResponseData> UpdateVital(
        [HttpTrigger(AuthorizationLevel.Function, "patch",
            Route = "ip-management/journeys/{journeyId:guid}/vitals/{vitalId:guid}")]
        HttpRequestData req, Guid journeyId, Guid vitalId)
    {
        try
        {
            var (_, tenantId) = _jwt.ValidateAndExtract(req);
            var tid  = _jwt.ExtractTenantId(req, tenantId);
            var body = await JsonSerializer.DeserializeAsync<UpdateVitalSignRequest>(req.Body, Json)
                       ?? throw new ArgumentException("Body required.");
            var result = await _vitalSvc.UpdateVitalAsync(journeyId, vitalId, tid, body);
            return await Ok(req, result);
        }
        catch (UnauthorizedAccessException ex) { return await Unauthorized(req, ex.Message); }
        catch (KeyNotFoundException ex)         { return await NotFound(req, ex.Message); }
        catch (ArgumentException ex)            { return await BadRequest(req, ex.Message); }
        catch (Exception ex)                    { return await InternalError(req, ex.Message); }
    }

    [Function("UpdateNurseRecord")]
    public async Task<HttpResponseData> UpdateNurseRecord(
        [HttpTrigger(AuthorizationLevel.Function, "patch",
            Route = "ip-management/journeys/{journeyId:guid}/nurse-records/{recordId:guid}")]
        HttpRequestData req, Guid journeyId, Guid recordId)
    {
        try
        {
            var (_, tenantId) = _jwt.ValidateAndExtract(req);
            var tid  = _jwt.ExtractTenantId(req, tenantId);
            var body = await JsonSerializer.DeserializeAsync<UpdateNurseRecordRequest>(req.Body, Json)
                       ?? throw new ArgumentException("Body required.");
            var result = await _vitalSvc.UpdateNurseRecordAsync(journeyId, recordId, tid, body);
            return await Ok(req, result);
        }
        catch (UnauthorizedAccessException ex) { return await Unauthorized(req, ex.Message); }
        catch (KeyNotFoundException ex)         { return await NotFound(req, ex.Message); }
        catch (ArgumentException ex)            { return await BadRequest(req, ex.Message); }
        catch (Exception ex)                    { return await InternalError(req, ex.Message); }
    }

    // ── Master Data ────────────────────────────────────────────────────────────

    [Function("GetMasterMedications")]
    public async Task<HttpResponseData> GetMasterMedications(
        [HttpTrigger(AuthorizationLevel.Function, "get",
            Route = "ip-management/master/medications")]
        HttpRequestData req)
    {
        try
        {
            var (_, tenantId) = _jwt.ValidateAndExtract(req);
            var tid  = _jwt.ExtractTenantId(req, tenantId);
            var data = await _vitalSvc.GetOphthMedicationsAsync(tid);
            return await Ok(req, data);
        }
        catch (UnauthorizedAccessException ex) { return await Unauthorized(req, ex.Message); }
        catch (Exception ex) { return await InternalError(req, ex.Message); }
    }

    [Function("GetMasterIoTypes")]
    public async Task<HttpResponseData> GetMasterIoTypes(
        [HttpTrigger(AuthorizationLevel.Function, "get",
            Route = "ip-management/master/io-types")]
        HttpRequestData req)
    {
        try
        {
            _jwt.ValidateAndExtract(req);
            var data = await _vitalSvc.GetIoTypesAsync();
            return await Ok(req, data);
        }
        catch (UnauthorizedAccessException ex) { return await Unauthorized(req, ex.Message); }
        catch (Exception ex) { return await InternalError(req, ex.Message); }
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

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

    private static async Task<HttpResponseData> NotFound(HttpRequestData req, string message)
    {
        var r = req.CreateResponse(HttpStatusCode.NotFound);
        await r.WriteAsJsonAsync(new { error = message });
        return r;
    }

    private static async Task<HttpResponseData> Unauthorized(HttpRequestData req, string message)
    {
        var r = req.CreateResponse(HttpStatusCode.Unauthorized);
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
