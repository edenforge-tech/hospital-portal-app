namespace NotificationService.Models.Requests;

public class PurchaseReturnEventRequest
{
    public string ToEmail           { get; set; } = string.Empty;
    public string VendorName        { get; set; } = string.Empty;
    public string ReturnNumber      { get; set; } = string.Empty;
    /// <summary>SentToVendor | CreditNoteReceived | Settled | Cancelled</summary>
    public string EventType         { get; set; } = string.Empty;
    public decimal NetAmount        { get; set; }
    public DateTime EventAt         { get; set; }
    public string? CreditNoteNumber { get; set; }
    public decimal? CreditNoteAmount { get; set; }
    public string? CancellationReason { get; set; }
}
