using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using CounsellingApi.Models;
using CounsellingApi.Models.Entities;
using CounsellingApi.Repositories;

namespace CounsellingApi.Functions;

public class GetList
{
    private readonly ICounsellingRepository _repo;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy        = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition      = JsonIgnoreCondition.WhenWritingNull,
        WriteIndented               = false,
        // Guard against Patient ↔ PatientCounselling circular reference in navigation graph.
        ReferenceHandler            = ReferenceHandler.IgnoreCycles
    };

    public GetList(ICounsellingRepository repo)
    {
        _repo = repo;
    }

    [Function("GetList")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "get", Route = "counselling")]
        HttpRequestData req)
    {
        try
        {
            var query = ParseQuery(req.Url.Query);
            var (items, total) = await _repo.GetList(query);

            var result = new PagedResult<PatientCounselling>
            {
                Items    = items,
                Total    = total,
                Page     = query.Page,
                PageSize = query.PageSize
            };

            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json; charset=utf-8");
            await response.WriteStringAsync(JsonSerializer.Serialize(result, JsonOptions));
            return response;
        }
        catch (Exception ex)
        {
            var r = req.CreateResponse(HttpStatusCode.InternalServerError);
            await r.WriteAsJsonAsync(new { error = ex.Message });
            return r;
        }
    }

    // Parses query-string parameters without requiring System.Web or ASP.NET Core.
    private static GetListQuery ParseQuery(string rawQuery)
    {
        var lookup = rawQuery
            .TrimStart('?')
            .Split('&', StringSplitOptions.RemoveEmptyEntries)
            .Select(p => p.Split('=', 2))
            .Where(p => p.Length == 2)
            .ToDictionary(
                p => Uri.UnescapeDataString(p[0]).ToLowerInvariant(),
                p => Uri.UnescapeDataString(p[1]),
                StringComparer.OrdinalIgnoreCase);

        return new GetListQuery
        {
            TenantId  = lookup.TryGetValue("tenantid", out var tid) && Guid.TryParse(tid, out var tg)   ? tg  : null,
            PatientId = lookup.TryGetValue("patientid", out var pid) && Guid.TryParse(pid, out var pg)  ? pg  : null,
            Status    = lookup.TryGetValue("status",    out var st)  ? st                               : null,
            Page      = lookup.TryGetValue("page",      out var pg2) && int.TryParse(pg2, out var p)    ? Math.Max(1, p)  : 1,
            PageSize  = lookup.TryGetValue("pagesize",  out var ps)  && int.TryParse(ps,  out var s)    ? Math.Clamp(s, 1, 100) : 20
        };
    }
}
