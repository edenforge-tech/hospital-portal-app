using System.Net;
using System.Text.Json;
using InventoryApi.Models.DTOs;
using InventoryApi.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Functions.Vendors;

public sealed class VendorBankAccountFunctions
{
    private readonly IVendorBankAccountService _accounts;
    private readonly ILogger<VendorBankAccountFunctions> _log;

    private static readonly JsonSerializerOptions _json =
        new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public VendorBankAccountFunctions(
        IVendorBankAccountService accounts,
        ILogger<VendorBankAccountFunctions> log)
    {
        _accounts = accounts;
        _log      = log;
    }

    // GET /inventory/vendors/{vendorId}/bank-accounts
    [Function("ListVendorBankAccounts")]
    public async Task<HttpResponseData> List(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get",
            Route = "vendors/{vendorId:guid}/bank-accounts")]
        HttpRequestData req, FunctionContext ctx, Guid vendorId, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var items    = await _accounts.ListAsync(tenantId, vendorId, ct);
            return await OkJson(req, items);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // POST /inventory/vendors/{vendorId}/bank-accounts
    [Function("CreateVendorBankAccount")]
    public async Task<HttpResponseData> Create(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post",
            Route = "vendors/{vendorId:guid}/bank-accounts")]
        HttpRequestData req, FunctionContext ctx, Guid vendorId, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var body     = await JsonSerializer.DeserializeAsync<CreateVendorBankAccountRequest>(
                               req.Body, _json, ct)
                           ?? throw new ArgumentException("Invalid request body.");
            var dto = await _accounts.CreateAsync(tenantId, vendorId, userId, body, ct);
            return await OkJson(req, dto, HttpStatusCode.Created);
        }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // DELETE /inventory/vendors/{vendorId}/bank-accounts/{accountId}
    [Function("DeleteVendorBankAccount")]
    public async Task<HttpResponseData> Delete(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete",
            Route = "vendors/{vendorId:guid}/bank-accounts/{accountId:guid}")]
        HttpRequestData req, FunctionContext ctx, Guid vendorId, Guid accountId, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var removed  = await _accounts.SoftDeleteAsync(tenantId, vendorId, accountId, userId, ct);
            if (!removed) return await Error(req, HttpStatusCode.NotFound, "Bank account not found.");
            var res = req.CreateResponse(HttpStatusCode.NoContent);
            return res;
        }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.Conflict, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // PATCH /inventory/vendors/{vendorId}/bank-accounts/{accountId}/set-primary
    [Function("SetPrimaryVendorBankAccount")]
    public async Task<HttpResponseData> SetPrimary(
        [HttpTrigger(AuthorizationLevel.Anonymous, "patch",
            Route = "vendors/{vendorId:guid}/bank-accounts/{accountId:guid}/set-primary")]
        HttpRequestData req, FunctionContext ctx, Guid vendorId, Guid accountId, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var dto      = await _accounts.SetPrimaryAsync(tenantId, vendorId, accountId, userId, ct);
            return await OkJson(req, dto);
        }
        catch (InvalidOperationException ex) { return await Error(req, HttpStatusCode.NotFound, ex.Message); }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // ── helpers ───────────────────────────────────────────────────────────────
    private static Guid ParseGuid(HttpRequestData req, string header)
    {
        if (!req.Headers.TryGetValues(header, out var values))
            throw new ArgumentException($"Missing required header {header}.");
        return Guid.Parse(values.First());
    }

    private static async Task<HttpResponseData> OkJson<T>(
        HttpRequestData req, T data, HttpStatusCode code = HttpStatusCode.OK)
    {
        var res = req.CreateResponse(code);
        await res.WriteAsJsonAsync(data);
        return res;
    }

    private static async Task<HttpResponseData> BadRequest(HttpRequestData req, string msg)
    {
        var res = req.CreateResponse(HttpStatusCode.BadRequest);
        await res.WriteStringAsync(msg);
        return res;
    }

    private static async Task<HttpResponseData> Error(HttpRequestData req, HttpStatusCode code, string msg)
    {
        var res = req.CreateResponse(code);
        await res.WriteStringAsync(msg);
        return res;
    }
}
