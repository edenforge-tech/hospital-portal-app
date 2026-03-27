using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using CounsellingApi.Models;
using CounsellingApi.Services;

namespace CounsellingApi.Functions;

/// <summary>
/// POST /counselling/{id}/add-on-surgery
/// Transitions a Done session to AddOnSurgery — triggered when a price override
/// or package upgrade is applied after the original Done decision.
/// State: Done → AddOnSurgery.
/// </summary>
public class AddOnSurgeryFunction
{
    private readonly CounsellingService _service;

    public AddOnSurgeryFunction(CounsellingService service)
    {
        _service = service;
    }

    [Function("AddOnSurgery")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "counselling/{id}/add-on-surgery")]
        HttpRequestData req,
        string id)
    {
        try
        {
            if (!Guid.TryParse(id, out var guid))
                return await BadRequest(req, "id must be a valid GUID.");

            var body = await req.ReadFromJsonAsync<AddOnSurgeryRequest>()
                ?? new AddOnSurgeryRequest();

            await _service.AddOnSurgery(guid, body.Reason, body.PerformedBy);

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new { message = "Status updated to AddOnSurgery." });
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
