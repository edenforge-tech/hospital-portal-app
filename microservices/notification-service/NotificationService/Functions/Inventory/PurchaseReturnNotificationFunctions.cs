using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using NotificationService.Models.Requests;
using NotificationService.Services.Email;
using System.Net;
using System.Text.Json;

namespace NotificationService.Functions.Inventory;

public class PurchaseReturnNotificationFunctions
{
    private readonly IEmailService _emailService;
    private readonly ILogger<PurchaseReturnNotificationFunctions> _logger;

    private static readonly JsonSerializerOptions _json =
        new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public PurchaseReturnNotificationFunctions(
        IEmailService emailService,
        ILogger<PurchaseReturnNotificationFunctions> logger)
    {
        _emailService = emailService;
        _logger       = logger;
    }

    /// <summary>
    /// POST /api/notifications/purchase-return-event
    /// Called by the inventory service after each purchase-return state transition.
    /// </summary>
    [Function("SendPurchaseReturnNotification")]
    public async Task<HttpResponseData> SendPurchaseReturnEvent(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post",
            Route = "notifications/purchase-return-event")]
        HttpRequestData req,
        CancellationToken ct)
    {
        PurchaseReturnEventRequest? body;
        try
        {
            body = await JsonSerializer.DeserializeAsync<PurchaseReturnEventRequest>(
                req.Body, _json, ct);
        }
        catch
        {
            var badReq = req.CreateResponse(HttpStatusCode.BadRequest);
            await badReq.WriteStringAsync("Invalid request body.");
            return badReq;
        }

        if (body is null || string.IsNullOrWhiteSpace(body.ToEmail)
                         || string.IsNullOrWhiteSpace(body.ReturnNumber)
                         || string.IsNullOrWhiteSpace(body.EventType))
        {
            var badReq = req.CreateResponse(HttpStatusCode.BadRequest);
            await badReq.WriteStringAsync("toEmail, returnNumber and eventType are required.");
            return badReq;
        }

        _logger.LogInformation(
            "Purchase return notification: event={Event} return={Return} vendor={Vendor}",
            body.EventType, body.ReturnNumber, body.VendorName);

        var (success, messageId, error) = await _emailService.SendPurchaseReturnEventAsync(
            toEmail:            body.ToEmail,
            vendorName:         body.VendorName,
            returnNumber:       body.ReturnNumber,
            eventType:          body.EventType,
            netAmount:          body.NetAmount,
            eventAt:            body.EventAt == default ? DateTime.UtcNow : body.EventAt,
            creditNoteNumber:   body.CreditNoteNumber,
            creditNoteAmount:   body.CreditNoteAmount,
            cancellationReason: body.CancellationReason);

        if (!success)
        {
            _logger.LogWarning("Purchase return email failed: {Error}", error);
            var fail = req.CreateResponse(HttpStatusCode.InternalServerError);
            await fail.WriteStringAsync(error ?? "Email delivery failed.");
            return fail;
        }

        var ok = req.CreateResponse(HttpStatusCode.OK);
        await ok.WriteAsJsonAsync(new { messageId });
        return ok;
    }
}
