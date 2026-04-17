namespace InventoryApi.Models.Entities;

/// <summary>
/// Tracks vendor confirmation of RFQ awards and Purchase Order receipts.
/// EntityType: "RfqAward" | "PurchaseOrder"
/// AckStatus:  "Pending" | "Acknowledged" | "Declined" | "Expired"
/// Channel:    "Email" | "WhatsApp" | "SMS" | "Call" | "Other"
/// </summary>
public class VendorAcknowledgment
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid VendorId { get; set; }

    /// <summary>"RfqAward" or "PurchaseOrder"</summary>
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }

    /// <summary>Pending | Acknowledged | Declined | Expired</summary>
    public string AckStatus { get; set; } = "Pending";

    /// <summary>Channel used for confirmation: Email | WhatsApp | SMS | Call | Other</summary>
    public string? Channel { get; set; }

    /// <summary>Who was contacted (email address, phone number, etc.)</summary>
    public string? ContactTarget { get; set; }

    public DateTime? AcknowledgedAt { get; set; }
    public Guid? AcknowledgedByUserId { get; set; }

    /// <summary>Optional notes: reference number, call summary, etc.</summary>
    public string? AckNotes { get; set; }

    /// <summary>Reason if vendor declined</summary>
    public string? DeclineReason { get; set; }

    /// <summary>When this acknowledgment request expires (72 h default for RFQ, 96 h for PO)</summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>Number of reminders sent so far</summary>
    public int RemindersSent { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string Status { get; set; } = "active";

    // Navigation
    public Vendor? Vendor { get; set; }
}
