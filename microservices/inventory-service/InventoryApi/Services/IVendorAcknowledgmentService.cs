using InventoryApi.Models.Entities;

namespace InventoryApi.Services;

public interface IVendorAcknowledgmentService
{
    /// <summary>Create a pending acknowledgment after an RFQ is awarded or a PO is sent to vendor.</summary>
    Task<VendorAcknowledgment> CreatePendingAsync(
        Guid tenantId, Guid actorUserId,
        Guid vendorId, string entityType, Guid entityId,
        DateTime expiresAt, CancellationToken ct);

    /// <summary>Record a manual internal confirmation (Email/WhatsApp/SMS/Call/Other).</summary>
    Task<VendorAcknowledgment> RecordConfirmationAsync(
        Guid tenantId, Guid actorUserId, Guid ackId,
        string status, string channel, string? contactTarget,
        string? ackNotes, string? declineReason, CancellationToken ct);

    Task<VendorAcknowledgment?> GetAsync(Guid tenantId, Guid ackId, CancellationToken ct);
    Task<VendorAcknowledgment?> GetByEntityAsync(Guid tenantId, string entityType, Guid entityId, CancellationToken ct);
    Task<List<VendorAcknowledgment>> ListPendingAsync(Guid tenantId, CancellationToken ct);
}
