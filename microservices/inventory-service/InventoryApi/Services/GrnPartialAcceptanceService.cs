using InventoryApi.Data;
using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Services;

/// <summary>
/// Handles partial GRN acceptance — when GRN items have rejected quantities,
/// automatically creates a PurchaseReturn for the rejected goods.
/// </summary>
public interface IGrnPartialAcceptanceService
{
    Task CreateReturnForRejectedAsync(Guid tenantId, GrnHeader grn, Guid userId, CancellationToken ct);
}

public sealed class GrnPartialAcceptanceService : IGrnPartialAcceptanceService
{
    private readonly InventoryDbContext _db;

    public GrnPartialAcceptanceService(InventoryDbContext db) => _db = db;

    public async Task CreateReturnForRejectedAsync(Guid tenantId, GrnHeader grn, Guid userId, CancellationToken ct)
    {
        var invoice = await _db.PurchaseInvoices
            .Include(i => i.Items)
            .FirstAsync(i => i.Id == grn.InvoiceId, ct);

        var rejectedItems = grn.GrnItems.Where(gi => gi.RejectedQuantity > 0).ToList();
        if (!rejectedItems.Any()) return;

        var returnNumber = $"PR/{grn.GrnNumber}";
        decimal totalReturnAmount = 0;

        var purchaseReturn = new PurchaseReturn
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            InvoiceId = grn.InvoiceId,
            VendorId = invoice.VendorId,
            ReturnNumber = returnNumber,
            ReturnDate = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc),
            ReturnReason = "QualityRejection",
            Remarks = $"Auto-generated from GRN {grn.GrnNumber}",
            SettlementStatus = "Pending",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedByUserId = userId
        };

        _db.PurchaseReturns.Add(purchaseReturn);

        foreach (var grnItem in rejectedItems)
        {
            var purchaseItem = invoice.Items.FirstOrDefault(pi => pi.Id == grnItem.PurchaseItemId);
            var rate = purchaseItem?.PurchaseRate ?? 0;
            var amount = Math.Round(grnItem.RejectedQuantity * rate, 2);
            totalReturnAmount += amount;

            _db.PurchaseReturnItems.Add(new PurchaseReturnItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                ReturnId = purchaseReturn.Id,
                ItemId = grnItem.ItemId,
                ReturnQuantity = grnItem.RejectedQuantity,
                PurchaseRate = rate,
                Amount = amount,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedByUserId = userId
            });
        }

        purchaseReturn.TotalAmount = totalReturnAmount;

        // Also update the GRN status to PartiallyAccepted if any accepted quantities
        if (grn.GrnItems.Any(gi => gi.AcceptedQuantity > 0))
            grn.GrnStatus = "PartiallyAccepted";
    }
}
