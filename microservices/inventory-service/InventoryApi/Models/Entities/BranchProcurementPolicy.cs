namespace InventoryApi.Models.Entities;

public class BranchProcurementPolicy
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid BranchId { get; set; }
    /// <summary>Human-readable label e.g. "Main Hospital – Apr 2026"</summary>
    public string PolicyName { get; set; } = string.Empty;
    /// <summary>Draft | Published | Superseded</summary>
    public string PolicyStatus { get; set; } = "Draft";
    /// <summary>INR – max amount allowed for a direct PO without RFQ</summary>
    public decimal DirectPoLimit { get; set; }
    /// <summary>INR – requisitions above this must go through RFQ</summary>
    public decimal RfqMandatoryFrom { get; set; }
    /// <summary>INR – POs above this require dual-level approval</summary>
    public decimal DualApprovalFrom { get; set; }
    /// <summary>Minimum vendor quotes required in an RFQ</summary>
    public int MinVendorQuotes { get; set; } = 3;
    /// <summary>Whether emergency bypass is allowed</summary>
    public bool EmergencyBypassAllowed { get; set; } = true;
    /// <summary>Hours before an emergency bypass automatically expires</summary>
    public int EmergencyBypassExpiryHours { get; set; } = 24;
    public DateTime? PublishedAt { get; set; }
    public Guid? PublishedByUserId { get; set; }
    public DateTime? EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string Status { get; set; } = "active";

    // Navigation
    public ICollection<BranchProcurementPolicyVersion> Versions { get; set; } = [];
}
