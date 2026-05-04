namespace InventoryApi.Models.Entities;

/// <summary>
/// Tenant-level configuration for Bill Transfer governance.
/// Rows are backfilled for all existing tenants with INR 50,000 default threshold.
/// </summary>
public class BillTransferPolicy
{
    public Guid TenantId { get; set; }

    /// <summary>Transactions at or below this amount may use low-value flex override. Default 50,000 INR.</summary>
    public decimal LowValueOverrideThreshold { get; set; } = 50_000m;

    /// <summary>Master switch: enable the low-value same-approver flexibility.</summary>
    public bool AllowLowValueFlexOverride { get; set; } = true;

    /// <summary>When override used, override reason is mandatory.</summary>
    public bool RequireOverrideReason { get; set; } = true;

    public Guid? UpdatedByUserId { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
