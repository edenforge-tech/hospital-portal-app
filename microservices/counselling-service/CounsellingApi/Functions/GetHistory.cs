using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using CounsellingApi.Services;

namespace CounsellingApi.Functions;

/// <summary>
/// GET /counselling/{id}/history
/// Returns the full audit trail for a counselling session, newest entry first.
/// Used by the Session History modal in the counsellor's desk frontend.
/// </summary>
public class GetHistory
{
    private readonly CounsellingService _service;

    // Use the same camelCase options as GetList so the frontend mapper
    // receives lowercase property names (changeType, changedAt, etc.).
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy   = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        WriteIndented          = false,
    };

    public GetHistory(CounsellingService service)
    {
        _service = service;
    }

    [Function("GetHistory")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "get", Route = "counselling/{id}/history")]
        HttpRequestData req,
        string id)
    {
        try
        {
            if (!Guid.TryParse(id, out var guid))
            {
                var bad = req.CreateResponse(HttpStatusCode.BadRequest);
                await bad.WriteAsJsonAsync(new { error = "id must be a valid GUID." });
                return bad;
            }

            var history = await _service.GetHistory(guid);

            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json; charset=utf-8");
            await response.WriteStringAsync(JsonSerializer.Serialize(history, JsonOptions));
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
            var r = req.CreateResponse(HttpStatusCode.InternalServerError);
            await r.WriteAsJsonAsync(new { error = ex.Message });
            return r;
        }
    }
}
