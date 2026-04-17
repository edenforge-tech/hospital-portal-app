namespace InventoryApi.Services;

/// <summary>
/// Sends fire-and-forget purchase-return lifecycle notifications to the notification service.
/// </summary>
public interface INotificationClient
{
    /// <summary>
    /// Posts a purchase-return event to the notification service.
    /// Never throws — failures are logged and swallowed so they do not block the main workflow.
    /// </summary>
    Task SendPurchaseReturnEventAsync(
        string  toEmail,
        string  vendorName,
        string  returnNumber,
        string  eventType,
        decimal netAmount,
        DateTime eventAt,
        string?  creditNoteNumber   = null,
        decimal? creditNoteAmount   = null,
        string?  cancellationReason = null);

    /// <summary>Notifies a vendor that they have been awarded an RFQ.</summary>
    Task SendRfqAwardNotificationAsync(
        string   toEmail,
        string   vendorName,
        string   rfqNumber,
        DateTime awardedAt,
        string?  portalUrl = null);

    /// <summary>Notifies a vendor via the chosen channel that a PO has been sent to them.</summary>
    Task SendPoToVendorAsync(
        string   channel,
        string   contactTarget,
        string   vendorName,
        string   poNumber,
        decimal  netAmount,
        DateTime sentAt,
        string?  notes = null);
}
