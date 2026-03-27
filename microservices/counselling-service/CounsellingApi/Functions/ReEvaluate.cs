using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using CounsellingApi.Models;
using CounsellingApi.Services;

namespace CounsellingApi.Functions;

/// <summary>
/// POST /counselling/{id}/re-evaluate
/// Transitions a Done session back to Processed so the counsellor can change
/// the selected procedure. State: Done → Processed.
/// </summary>
public class ReEvaluate
{
    private readonly CounsellingService _service;

    public ReEvaluate(CounsellingService service)
    {
        _service = service;
    }

    [Function("ReEvaluate")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "counselling/{id}/re-evaluate")]
        HttpRequestData req,
        string id)
    {
        try
        {
            if (!Guid.TryParse(id, out var guid))
                return await BadRequest(req, "id must be a valid GUID.");

            var body = await req.ReadFromJsonAsync<ReEvaluateRequest>()
                ?? new ReEvaluateRequest();

            await _service.ReEvaluate(guid, body.PerformedBy);

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new { message = "Session re-opened for evaluation. Status: Processed." });
            return response;
        }
        catch (KeyNotFoundException ex)
        {
            var r = req.CreateResponse(HttpStatusCode.NotFound);
            await r.WriteAsJsonAsync(new { error = ex.Message });
            return r;
        }
        catch (InvalidOperationException ex)
        {
            return await BadRequest(req, ex.Message);
        }
        catch (Exception ex)
        {
            return await InternalError(req, ex.Message);
        }
    }

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
