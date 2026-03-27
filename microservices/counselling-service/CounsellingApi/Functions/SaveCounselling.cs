using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using CounsellingApi.Models;
using CounsellingApi.Services;

namespace CounsellingApi.Functions;

public class SaveCounselling
{
    private readonly CounsellingService _service;

    public SaveCounselling(CounsellingService service)
    {
        _service = service;
    }

    [Function("SaveCounselling")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "put", Route = "counselling/{id}/save")]
        HttpRequestData req,
        string id)
    {
        try
        {
            if (!Guid.TryParse(id, out var guid))
                return await BadRequest(req, "id must be a valid GUID.");

            var body = await req.ReadFromJsonAsync<SaveCounsellingRequest>()
                ?? throw new ArgumentException("Request body is required.");

            await _service.Save(guid, body);

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new { message = "Saved." });
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
