using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using CounsellingApi.Models;
using CounsellingApi.Services;

namespace CounsellingApi.Functions;

/// <summary>
/// Exposes two endpoints for managing per-session price overrides:
///   POST   /api/counselling/{id}/price-overrides  — record a new override
///   GET    /api/counselling/{id}/price-overrides  — list all overrides for the session
/// </summary>
public class PriceOverrides
{
    private readonly CounsellingService _service;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy   = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        WriteIndented          = false,
    };

    public PriceOverrides(CounsellingService service)
    {
        _service = service;
    }

    // ── POST /api/counselling/{id}/price-overrides ────────────────────────

    [Function("AddPriceOverride")]
    public async Task<HttpResponseData> Add(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "counselling/{id}/price-overrides")]
        HttpRequestData req,
        string id)
    {
        try
        {
            if (!Guid.TryParse(id, out var guid))
                return await BadRequest(req, "id must be a valid GUID.");

            var body = await req.ReadFromJsonAsync<CreatePriceOverrideRequest>()
                ?? throw new ArgumentException("Request body is required.");

            if (string.IsNullOrWhiteSpace(body.Reason))
                return await BadRequest(req, "reason is required.");

            if (body.OverriddenPrice <= 0)
                return await BadRequest(req, "overriddenPrice must be a positive value.");

            if (body.RequestedByType is not ("SELF" or "STAFF"))
                return await BadRequest(req, "requestedByType must be 'SELF' or 'STAFF'.");

            await _service.AddPriceOverride(guid, body);

            var response = req.CreateResponse(HttpStatusCode.Created);
            await response.WriteAsJsonAsync(new { message = "Price override recorded." });
            return response;
        }
        catch (KeyNotFoundException ex)
        {
            var r = req.CreateResponse(HttpStatusCode.NotFound);
            await r.WriteAsJsonAsync(new { error = ex.Message });
            return r;
        }
        catch (ArgumentException ex)
        {
            return await BadRequest(req, ex.Message);
        }
        catch (Exception ex)
        {
            return await InternalError(req, ex.Message);
        }
    }

    // ── DELETE /api/counselling/{sessionId}/price-overrides/{overrideId} ──

    [Function("DeletePriceOverride")]
    public async Task<HttpResponseData> Delete(
        [HttpTrigger(AuthorizationLevel.Function, "delete", Route = "counselling/{sessionId}/price-overrides/{overrideId}")]
        HttpRequestData req,
        string sessionId,
        string overrideId)
    {
        try
        {
            if (!Guid.TryParse(overrideId, out var guid))
                return await BadRequest(req, "overrideId must be a valid GUID.");

            var performedBy = req.Query["performedBy"] ?? "counsellor";
            var deleted = await _service.SoftDeletePriceOverride(guid, performedBy);

            if (!deleted)
            {
                var nr = req.CreateResponse(HttpStatusCode.NotFound);
                await nr.WriteAsJsonAsync(new { error = "Override not found or already removed." });
                return nr;
            }

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new { message = "Override removed." });
            return response;
        }
        catch (Exception ex)
        {
            return await InternalError(req, ex.Message);
        }
    }

    // ── PATCH /api/counselling/{sessionId}/price-overrides/{overrideId} ───

    [Function("UpdatePriceOverride")]
    public async Task<HttpResponseData> Update(
        [HttpTrigger(AuthorizationLevel.Function, "patch", Route = "counselling/{sessionId}/price-overrides/{overrideId}")]
        HttpRequestData req,
        string sessionId,
        string overrideId)
    {
        try
        {
            if (!Guid.TryParse(overrideId, out var guid))
                return await BadRequest(req, "overrideId must be a valid GUID.");

            var body = await req.ReadFromJsonAsync<UpdatePriceOverrideRequest>()
                ?? throw new ArgumentException("Request body is required.");

            var updated = await _service.UpdatePriceOverride(guid, body);
            if (updated == null)
            {
                var nr = req.CreateResponse(HttpStatusCode.NotFound);
                await nr.WriteAsJsonAsync(new { error = "Override not found or already removed." });
                return nr;
            }

            var dto = new PriceOverrideDto
            {
                Id              = updated.Id,
                CounsellingId   = updated.CounsellingId,
                VariantId       = updated.VariantId,
                VariantName     = updated.VariantName,
                BasePrice       = updated.BasePrice,
                OverriddenPrice = updated.OverriddenPrice,
                PriceType       = updated.PriceType,
                Reason          = updated.Reason,
                Remarks         = updated.Remarks,
                RequestedByType = updated.RequestedByType,
                NotificationSent = updated.NotificationSent,
                CreatedAt       = updated.CreatedAt,
            };

            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json; charset=utf-8");
            await response.WriteStringAsync(JsonSerializer.Serialize(dto, JsonOptions));
            return response;
        }
        catch (ArgumentException ex)
        {
            return await BadRequest(req, ex.Message);
        }
        catch (Exception ex)
        {
            return await InternalError(req, ex.Message);
        }
    }

    // ── GET /api/counselling/{id}/price-overrides ─────────────────────────

    [Function("GetPriceOverrides")]
    public async Task<HttpResponseData> GetList(
        [HttpTrigger(AuthorizationLevel.Function, "get", Route = "counselling/{id}/price-overrides")]
        HttpRequestData req,
        string id)
    {
        try
        {
            if (!Guid.TryParse(id, out var guid))
                return await BadRequest(req, "id must be a valid GUID.");

            var overrides = await _service.GetPriceOverrides(guid);

            var dtos = overrides.Select(o => new PriceOverrideDto
            {
                Id               = o.Id,
                CounsellingId    = o.CounsellingId,
                VariantId        = o.VariantId,
                VariantName      = o.VariantName,
                BasePrice        = o.BasePrice,
                OverriddenPrice  = o.OverriddenPrice,
                PriceType        = o.PriceType,
                Reason           = o.Reason,
                Remarks          = o.Remarks,
                RequestedByType  = o.RequestedByType,
                RequestedByUserId = o.RequestedByUserId,
                RequestedByName  = o.RequestedByName,
                NotificationSent = o.NotificationSent,
                CreatedAt        = o.CreatedAt
            }).ToList();

            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json; charset=utf-8");
            await response.WriteStringAsync(JsonSerializer.Serialize(dtos, JsonOptions));
            return response;
        }
        catch (KeyNotFoundException ex)
        {
            var r = req.CreateResponse(HttpStatusCode.NotFound);
            await r.WriteAsJsonAsync(new { error = ex.Message });
            return r;
        }
        catch (Exception ex)
        {
            return await InternalError(req, ex.Message);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private static async Task<HttpResponseData> BadRequest(HttpRequestData req, string message)
    {
        var r = req.CreateResponse(HttpStatusCode.BadRequest);
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
