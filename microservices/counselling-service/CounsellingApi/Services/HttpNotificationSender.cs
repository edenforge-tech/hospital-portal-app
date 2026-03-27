using System.Text;
using System.Text.Json;
using CounsellingApi.Models.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CounsellingApi.Services;

/// <summary>
/// HTTP implementation of <see cref="INotificationSender"/> that posts to the
/// notification microservice (port 7071).
/// Configured via "NotificationService:BaseUrl" in local.settings.json / app settings.
/// </summary>
public class HttpNotificationSender : INotificationSender
{
    private readonly HttpClient _http;
    private readonly ILogger<HttpNotificationSender> _logger;

    public HttpNotificationSender(IHttpClientFactory factory, ILogger<HttpNotificationSender> logger)
    {
        _http   = factory.CreateClient("notifications");
        _logger = logger;
    }

    public async Task SendFinalizationNotice(PatientCounselling session, SessionPriceOverride priceOverride)
    {
        if (string.IsNullOrWhiteSpace(priceOverride.RequestedByContact))
        {
            _logger.LogWarning(
                "Price override {OverrideId} has no contact — skipping notification.", priceOverride.Id);
            return;
        }

        var message = BuildMessage(session, priceOverride);

        var payload = new
        {
            to      = priceOverride.RequestedByContact,
            message,
            channel = priceOverride.RequestedByContact.Contains('@') ? "email" : "sms"
        };

        try
        {
            var json    = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _http.PostAsync("/api/notify", content);

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync();
                _logger.LogWarning(
                    "Notification service returned {Status} for override {OverrideId}: {Body}",
                    (int)response.StatusCode, priceOverride.Id, body);
            }
        }
        catch (Exception ex)
        {
            // Non-fatal: log and continue. Notification failures must not block session finalization.
            _logger.LogError(ex,
                "Failed to send finalization notification for override {OverrideId}.", priceOverride.Id);
        }
    }

    private static string BuildMessage(PatientCounselling session, SessionPriceOverride priceOverride)
    {
        var patientName  = session.Patient != null
            ? $"{session.Patient.FirstName} {session.Patient.LastName}".Trim()
            : "the patient";
        var finalisedOn  = DateTime.UtcNow.ToString("dd MMM yyyy, HH:mm") + " UTC";

        return $"Patient {patientName} has been referred for {priceOverride.VariantName}. " +
               $"Price confirmed: ₹{priceOverride.OverriddenPrice:N0} (originally ₹{priceOverride.BasePrice:N0}). " +
               $"Remarks: {priceOverride.Remarks ?? "—"}. Finalised on: {finalisedOn}.";
    }
}
