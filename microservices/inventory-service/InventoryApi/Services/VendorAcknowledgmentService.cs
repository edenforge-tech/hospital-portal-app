using InventoryApi.Data;
using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Services;

public class VendorAcknowledgmentService : IVendorAcknowledgmentService
{
    private readonly InventoryDbContext _db;

    public VendorAcknowledgmentService(InventoryDbContext db) => _db = db;

    public async Task<VendorAcknowledgment> CreatePendingAsync(
        Guid tenantId, Guid actorUserId,
        Guid vendorId, string entityType, Guid entityId,
        DateTime expiresAt, CancellationToken ct)
    {
        // Idempotent: return existing active pending if already created for same entity
        var existing = await _db.VendorAcknowledgments
            .FirstOrDefaultAsync(a =>
                a.TenantId == tenantId &&
                a.EntityType == entityType &&
                a.EntityId == entityId &&
                a.AckStatus == "Pending" &&
                a.DeletedAt == null, ct);

        if (existing is not null) return existing;

        var ack = new VendorAcknowledgment
        {
            Id                = Guid.NewGuid(),
            TenantId          = tenantId,
            VendorId          = vendorId,
            EntityType        = entityType,
            EntityId          = entityId,
            AckStatus         = "Pending",
            ExpiresAt         = expiresAt,
            RemindersSent     = 0,
            CreatedAt         = DateTime.UtcNow,
            UpdatedAt         = DateTime.UtcNow,
            CreatedByUserId   = actorUserId,
            UpdatedByUserId   = actorUserId,
            Status            = "active",
        };

        _db.VendorAcknowledgments.Add(ack);
        await _db.SaveChangesAsync(ct);
        return ack;
    }

    public async Task<VendorAcknowledgment> RecordConfirmationAsync(
        Guid tenantId, Guid actorUserId, Guid ackId,
        string status, string channel, string? contactTarget,
        string? ackNotes, string? declineReason, CancellationToken ct)
    {
        if (status is not ("Acknowledged" or "Declined"))
            throw new ArgumentException("status must be 'Acknowledged' or 'Declined'.", nameof(status));

        var ack = await _db.VendorAcknowledgments
            .FirstOrDefaultAsync(a => a.TenantId == tenantId && a.Id == ackId && a.DeletedAt == null, ct)
            ?? throw new KeyNotFoundException($"Acknowledgment {ackId} not found.");

        if (ack.AckStatus is "Acknowledged" or "Declined")
            throw new InvalidOperationException($"Acknowledgment is already {ack.AckStatus}.");

        ack.AckStatus              = status;
        ack.Channel                = channel;
        ack.ContactTarget          = contactTarget;
        ack.AckNotes               = ackNotes;
        ack.DeclineReason          = declineReason;
        ack.AcknowledgedAt         = DateTime.UtcNow;
        ack.AcknowledgedByUserId   = actorUserId;
        ack.UpdatedAt              = DateTime.UtcNow;
        ack.UpdatedByUserId        = actorUserId;

        await _db.SaveChangesAsync(ct);
        return ack;
    }

    public Task<VendorAcknowledgment?> GetAsync(Guid tenantId, Guid ackId, CancellationToken ct)
        => _db.VendorAcknowledgments
               .Include(a => a.Vendor)
               .FirstOrDefaultAsync(a => a.TenantId == tenantId && a.Id == ackId && a.DeletedAt == null, ct);

    public Task<VendorAcknowledgment?> GetByEntityAsync(Guid tenantId, string entityType, Guid entityId, CancellationToken ct)
        => _db.VendorAcknowledgments
               .Where(a => a.TenantId == tenantId && a.EntityType == entityType && a.EntityId == entityId && a.DeletedAt == null)
               .OrderByDescending(a => a.CreatedAt)
               .FirstOrDefaultAsync(ct);

    public Task<List<VendorAcknowledgment>> ListPendingAsync(Guid tenantId, CancellationToken ct)
        => _db.VendorAcknowledgments
               .Include(a => a.Vendor)
               .Where(a => a.TenantId == tenantId && a.AckStatus == "Pending" && a.DeletedAt == null)
               .OrderBy(a => a.ExpiresAt)
               .ToListAsync(ct);
}
