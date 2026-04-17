using System.Net.Http.Json;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Services;

public sealed class HttpNotificationClient : INotificationClient
{
    private readonly IHttpClientFactory _factory;
    private readonly ILogger<HttpNotificationClient> _log;

    public HttpNotificationClient(IHttpClientFactory factory, ILogger<HttpNotificationClient> log)
    {
        _factory = factory;
        _log     = log;
    }

    public async Task SendPurchaseReturnEventAsync(
        string   toEmail,
        string   vendorName,
        string   returnNumber,
        string   eventType,
        decimal  netAmount,
        DateTime eventAt,
        string?  creditNoteNumber   = null,
        decimal? creditNoteAmount   = null,
        string?  cancellationReason = null)
    {
        try
        {
            var client = _factory.CreateClient("notifications");
            var payload = new
            {
                toEmail,
                vendorName,
                returnNumber,
                eventType,
                netAmount,
                eventAt,
                creditNoteNumber,
                creditNoteAmount,
                cancellationReason,
            };

            var response = await client.PostAsJsonAsync("api/notifications/purchase-return-event", payload);

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync();
                _log.LogWarning(
                    "Purchase return notification delivery failed [{Status}] for return {Return}: {Body}",
                    (int)response.StatusCode, returnNumber, body);
            }
        }
        catch (Exception ex)
        {
            // Notification failures must never block the primary workflow.
            _log.LogWarning(ex,
                "Purchase return notification error for return {Return} (event={Event}). Continuing.",
                returnNumber, eventType);
        }
    }

    public async Task SendPoToVendorAsync(
        string   channel,
        string   contactTarget,
        string   vendorName,
        string   poNumber,
        decimal  netAmount,
        DateTime sentAt,
        string?  notes = null)
    {
        try
        {
            var client = _factory.CreateClient("notifications");
            var payload = new { channel, contactTarget, vendorName, poNumber, netAmount, sentAt, notes };
            var response = await client.PostAsJsonAsync("api/notifications/po-to-vendor", payload);
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync();
                _log.LogWarning("PO-to-vendor notification failed [{Status}] for PO {Po}: {Body}",
                    (int)response.StatusCode, poNumber, body);
            }
        }
        catch (Exception ex)
        {
            _log.LogWarning(ex, "PO-to-vendor notification error for PO {Po}. Continuing.", poNumber);
        }
    }

    public async Task SendRfqAwardNotificationAsync(
        string   toEmail,
        string   vendorName,
        string   rfqNumber,
        DateTime awardedAt,
        string?  portalUrl = null)
    {
        try
        {
            var client  = _factory.CreateClient("notifications");
            var payload = new { toEmail, vendorName, rfqNumber, awardedAt, portalUrl };
            var response = await client.PostAsJsonAsync("api/notifications/rfq-award", payload);

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync();
                _log.LogWarning(
                    "RFQ award notification delivery failed [{Status}] for RFQ {Rfq} to {Email}: {Body}",
                    (int)response.StatusCode, rfqNumber, toEmail, body);
            }
        }
        catch (Exception ex)
        {
            _log.LogWarning(ex,
                "RFQ award notification error for RFQ {Rfq} to {Email}. Continuing.",
                rfqNumber, toEmail);
        }
    }
}
