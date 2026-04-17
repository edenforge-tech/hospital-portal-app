namespace InventoryApi.Models.Entities;

/// <summary>
/// Audit trail for all state transitions across procurement documents (Requisition, RFQ, PO).
/// </summary>
public class ProcurementTransitionLog
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    /// <summary>PurchaseRequisition | RfqHeader | PurchaseOrder</summary>
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public string FromStatus { get; set; } = string.Empty;
    public string ToStatus { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public Guid? ActorUserId { get; set; }
    public DateTime TransitionedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string Status { get; set; } = "active";
}
