namespace InventoryApi.Models.Entities;

/// <summary>
/// Immutable audit trail for every settlement state transition.
/// One row per event — never updated, only inserted.
/// Mirrors the pattern used by BillTransferEventLog.
/// </summary>
public class SettlementEventLog
{
    public Guid     Id              { get; set; }
    public Guid     TenantId        { get; set; }
    public Guid     SettlementId    { get; set; }

    /// <summary>Previous status before the transition.</summary>
    public string   FromStatus      { get; set; } = string.Empty;

    /// <summary>Status after the transition.</summary>
    public string   ToStatus        { get; set; } = string.Empty;

    /// <summary>
    /// EventType mirrors the action: Created | PaymentRecorded | CreditNoteApplied |
    /// HoldPlaced | HoldResumed | Cancelled | WrittenOff | MarkedOverdue | FullySettled
    /// </summary>
    public string   EventType       { get; set; } = string.Empty;

    /// <summary>Optional free-text reason or reference (hold reason, write-off reason, UTR, etc.).</summary>
    public string?  Reason          { get; set; }

    /// <summary>Amount involved in the event (payment amount, credit note amount). Null for state-only changes.</summary>
    public decimal? Amount          { get; set; }

    /// <summary>System/background actor uses null; human actor provides UserId.</summary>
    public Guid?    ActorUserId     { get; set; }

    /// <summary>"system" | "user" — for UX labelling in the timeline.</summary>
    public string   ActorType       { get; set; } = "user";

    public DateTime OccurredAt      { get; set; }

    // Navigation
    public InvoiceSettlement? Settlement { get; set; }
}
