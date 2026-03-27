using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using CounsellingApi.Services;

namespace CounsellingApi.Functions;

/// <summary>
/// GET /counselling/{id}
/// Returns the current snapshot of a counselling record.
/// Accepts either the record's own UUID or the auth-service session UUID (PatientId fallback).
/// Used by the counsellor's desk frontend to restore decision, package, schedule, and payment
/// details when the session page loads for a completed or in-progress session.
/// </summary>
public class GetById
{
    private readonly CounsellingService _service;

    public GetById(CounsellingService service)
    {
        _service = service;
    }

    [Function("GetById")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "get", Route = "counselling/{id}")]
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

            var record = await _service.GetById(guid);

            if (record == null)
            {
                var notFound = req.CreateResponse(HttpStatusCode.NotFound);
                await notFound.WriteAsJsonAsync(new { error = "Counselling record not found." });
                return notFound;
            }

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(record);
            return response;
        }
        catch (Exception ex)
        {
            var r = req.CreateResponse(HttpStatusCode.InternalServerError);
            await r.WriteAsJsonAsync(new { error = ex.Message });
            return r;
        }
    }
}
