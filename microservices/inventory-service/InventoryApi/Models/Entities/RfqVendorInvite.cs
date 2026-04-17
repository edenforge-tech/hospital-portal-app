namespace InventoryApi.Models.Entities;

public class RfqVendorInvite
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid RfqId { get; set; }
    public Guid VendorId { get; set; }
    /// <summary>Invited | Viewed | QuoteSubmitted | Declined | NoResponse</summary>
    public string InviteStatus { get; set; } = "Invited";
    public DateTime InvitedAt { get; set; }
    public DateTime? ViewedAt { get; set; }
    public DateTime? RespondedAt { get; set; }
    public string? DeclineReason { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string Status { get; set; } = "active";

    // Navigation
    public RfqHeader? Rfq { get; set; }
    public Vendor? Vendor { get; set; }
}
