using System.Net;
using InventoryApi.Data;
using InventoryApi.Helpers;
using InventoryApi.Models.Entities;
using InventoryApi.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Functions.Vendors;

/// <summary>
/// POST /inventory/settlements/{settlementId}/payments/{paymentId}/proof
///
/// Accepts raw binary body (the file bytes).  Supply the original filename in the
/// X-Filename request header and a valid MIME type as the Content-Type header.
/// Allowed MIME types: image/jpeg, image/png, image/webp, application/pdf.
/// Maximum file size: 10 MB.
/// </summary>
public sealed class PaymentAttachmentFunctions
{
    private readonly InventoryDbContext  _db;
    private readonly IBlobStorageService _blobs;
    private readonly ILogger<PaymentAttachmentFunctions> _log;

    public PaymentAttachmentFunctions(
        InventoryDbContext  db,
        IBlobStorageService blobs,
        ILogger<PaymentAttachmentFunctions> log)
    {
        _db    = db;
        _blobs = blobs;
        _log   = log;
    }

    [Function("UploadPaymentProof")]
    public async Task<HttpResponseData> Upload(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post",
            Route = "settlements/{settlementId:guid}/payments/{paymentId:guid}/proof")]
        HttpRequestData req, FunctionContext ctx, Guid settlementId, Guid paymentId, CancellationToken ct)
    {
        try
        {
            RoleGuard.Require(req, RoleGuard.CanCreate);
            var tenantId    = ParseGuid(req, "X-Tenant-Id");
            var userId      = ParseGuid(req, "X-User-Id");
            var contentType = req.Headers.TryGetValues("Content-Type", out var ct2)
                              ? ct2.First().Split(';')[0].Trim() : "application/octet-stream";
            var filename    = req.Headers.TryGetValues("X-Filename", out var fn)
                              ? Uri.UnescapeDataString(fn.First()) : "attachment";

            // Upload to blob storage (validation happens inside the service)
            var (url, blobName, sizeKb) = await _blobs.UploadAsync(
                req.Body, filename, contentType, tenantId, ct);

            // Bind proof to the explicit settlement payment specified in the route
            var settlementPayment = await _db.SettlementPayments
                .FirstOrDefaultAsync(sp =>
                    sp.Id == paymentId &&
                    sp.SettlementId == settlementId &&
                    sp.TenantId == tenantId, ct);

            if (settlementPayment is null)
            {
                var notFound = req.CreateResponse(HttpStatusCode.NotFound);
                await notFound.WriteStringAsync("Settlement payment not found.");
                return notFound;
            }

            VendorPayment? payment = null;
            if (settlementPayment.PaymentId.HasValue)
                payment = await _db.VendorPayments.FindAsync(
                    new object[] { settlementPayment.PaymentId.Value }, ct);

            if (payment is not null)
            {
                payment.AttachmentUrl      = url;
                payment.AttachmentFilename = filename;
                payment.AttachmentSizeKb   = sizeKb;
                payment.UpdatedAt          = DateTime.UtcNow;
                payment.UpdatedByUserId    = userId;
                await _db.SaveChangesAsync(ct);
            }

            var result = new { url, filename, sizeKb };
            var res    = req.CreateResponse(HttpStatusCode.OK);
            await res.WriteAsJsonAsync(result);
            return res;
        }
        catch (UnauthorizedAccessException)
        {
            var res = req.CreateResponse(HttpStatusCode.Forbidden);
            await res.WriteStringAsync("Insufficient permissions.");
            return res;
        }
        catch (ArgumentException ex)
        {
            var res = req.CreateResponse(HttpStatusCode.BadRequest);
            await res.WriteStringAsync(ex.Message);
            return res;
        }
        catch (InvalidOperationException ex)
        {
            var res = req.CreateResponse(HttpStatusCode.BadRequest);
            await res.WriteStringAsync(ex.Message);
            return res;
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "Unexpected error uploading payment proof for settlement {Id}", settlementId);
            var res = req.CreateResponse(HttpStatusCode.InternalServerError);
            await res.WriteStringAsync("An unexpected error occurred.");
            return res;
        }
    }

    private static Guid ParseGuid(HttpRequestData req, string header)
    {
        if (!req.Headers.TryGetValues(header, out var values))
            throw new ArgumentException($"Missing required header {header}.");
        return Guid.Parse(values.First());
    }
}
