namespace InventoryApi.Models.Entities;

/// <summary>
/// Immutable audit record for every Bill Transfer state transition.
/// Insert-only – update/delete are blocked by DB rules.
/// </summary>
public class BillTransferEventLog
{
    public Guid EventId { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public Guid BillTransferId { get; set; }

    public string? FromStatus { get; set; }
    public string ToStatus { get; set; } = null!;
    public string Action { get; set; } = null!;

    public Guid ActorUserId { get; set; }
    public string? ActorRole { get; set; }

    public string? ReasonCode { get; set; }
    public string? ReasonText { get; set; }

    public bool OverrideApplied { get; set; }
    public string? CorrelationId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public BillTransfer? BillTransfer { get; set; }
}
