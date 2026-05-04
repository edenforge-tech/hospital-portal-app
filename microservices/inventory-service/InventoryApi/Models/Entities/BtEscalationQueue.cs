namespace InventoryApi.Models.Entities;

/// <summary>
/// Records SLA breach / at-risk events for Bill Transfers awaiting approval.
/// One active row per (bill_transfer_id, escalation_stage) — resolved_at closes it.
/// </summary>
public class BtEscalationQueue
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public Guid BillTransferId { get; set; }

    /// <summary>L1_AtRisk | L1_Breached | L2_AtRisk | L2_Breached</summary>
    public string EscalationStage { get; set; } = null!;

    public DateTime? NotifiedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public BillTransfer? BillTransfer { get; set; }
}
