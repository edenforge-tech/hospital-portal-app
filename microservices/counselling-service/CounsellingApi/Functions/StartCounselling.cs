using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using CounsellingApi.Models;
using CounsellingApi.Services;

namespace CounsellingApi.Functions;

public class StartCounselling
{
    private readonly CounsellingService _service;

    public StartCounselling(CounsellingService service)
    {
        _service = service;
    }

    [Function("StartCounselling")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "counselling/start/{patientId}")]
        HttpRequestData req,
        string patientId)
    {
        try
        {
            if (!Guid.TryParse(patientId, out var patientGuid))
                return await BadRequest(req, "patientId must be a valid GUID.");

            var body = await req.ReadFromJsonAsync<StartCounsellingRequest>()
                ?? new StartCounsellingRequest();

            var id = await _service.Start(patientGuid, body.TenantId, body.PerformedBy);

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new { id, message = "Counselling started." });
            return response;
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
