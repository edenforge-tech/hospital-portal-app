namespace InventoryApi.Models.Entities;

/// <summary>
/// Structured reason codes for Bill Transfer reject / resubmit / SOD-override / cancel actions.
/// tenant_id IS NULL → global system code (visible to all tenants).
/// tenant_id set → tenant-specific custom code.
/// </summary>
public class BtReasonCatalog
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>NULL means global / system-seeded code visible to all tenants.</summary>
    public Guid? TenantId { get; set; }

    public string ReasonCode { get; set; } = null!;
    public string ReasonLabel { get; set; } = null!;

    /// <summary>Reject | Resubmit | Override | Cancel</summary>
    public string Category { get; set; } = null!;

    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
