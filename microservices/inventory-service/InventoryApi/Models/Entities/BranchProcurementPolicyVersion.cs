namespace InventoryApi.Models.Entities;

/// <summary>
/// Immutable snapshot of a policy at point-in-time. Created every time a Draft is published.
/// </summary>
public class BranchProcurementPolicyVersion
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid PolicyId { get; set; }
    public int VersionNumber { get; set; }
    public decimal DirectPoLimit { get; set; }
    public decimal RfqMandatoryFrom { get; set; }
    public decimal DualApprovalFrom { get; set; }
    public int MinVendorQuotes { get; set; }
    public bool EmergencyBypassAllowed { get; set; }
    public int EmergencyBypassExpiryHours { get; set; }
    public string? ChangeNotes { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string Status { get; set; } = "active";

    // Navigation
    public BranchProcurementPolicy? Policy { get; set; }
}
