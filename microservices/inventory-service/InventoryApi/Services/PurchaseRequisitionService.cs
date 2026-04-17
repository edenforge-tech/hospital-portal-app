using InventoryApi.Data;
using InventoryApi.Models.DTOs;
using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Services;

public interface IPurchaseRequisitionService
{
    Task<PurchaseRequisition> CreateAsync(Guid tenantId, Guid userId, CreateRequisitionRequest req, CancellationToken ct);
    Task<PagedResult<PurchaseRequisition>> ListAsync(Guid tenantId, int page, int pageSize, CancellationToken ct);
    Task<PurchaseRequisition?> GetAsync(Guid tenantId, Guid requisitionId, CancellationToken ct);
    Task<PurchaseRequisition?> SubmitAsync(Guid tenantId, Guid requisitionId, Guid userId, CancellationToken ct);
    Task<PurchaseRequisition?> ApproveAsync(Guid tenantId, Guid requisitionId, Guid userId, string? remarks, CancellationToken ct);
    Task<PurchaseRequisition?> RejectAsync(Guid tenantId, Guid requisitionId, Guid userId, string? remarks, CancellationToken ct);
    Task<EvaluatePolicyPathResult> EvaluatePolicyPathAsync(Guid tenantId, Guid requisitionId, CancellationToken ct);
    Task<RfqHeader> ConvertToRfqAsync(Guid tenantId, Guid userId, Guid requisitionId, ConvertToRfqRequest req, CancellationToken ct);
    Task<PurchaseOrder> ConvertToPOAsync(Guid tenantId, Guid userId, Guid requisitionId, ConvertToPORequest req, CancellationToken ct);
}

public sealed class PurchaseRequisitionService : IPurchaseRequisitionService
{
    private readonly InventoryDbContext _db;

    public PurchaseRequisitionService(InventoryDbContext db) => _db = db;

    public async Task<PurchaseRequisition> CreateAsync(Guid tenantId, Guid userId, CreateRequisitionRequest req, CancellationToken ct)
    {
        var count = await _db.PurchaseRequisitions.CountAsync(r => r.TenantId == tenantId, ct);
        var reqNumber = $"PR/{DateTime.UtcNow:yyyyMMdd}/{count + 1:D4}";

        var requisition = new PurchaseRequisition
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            StoreId = req.StoreId,
            RequisitionNumber = reqNumber,
            RequisitionDate = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc),
            RequestedByUserId = userId,
            RequisitionType = req.RequisitionType,
            RequisitionStatus = "Draft",
            Remarks = req.Remarks,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedByUserId = userId,
            UpdatedByUserId = userId
        };
        _db.PurchaseRequisitions.Add(requisition);

        foreach (var lineReq in req.Items)
        {
            var currentStock = await _db.StockBatches
                .Where(b => b.TenantId == tenantId && b.StoreId == req.StoreId
                         && b.ItemId == lineReq.ItemId && b.DeletedAt == null)
                .SumAsync(b => b.QuantityAvailable, ct);

            _db.PurchaseRequisitionItems.Add(new PurchaseRequisitionItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                RequisitionId = requisition.Id,
                ItemId = lineReq.ItemId,
                RequiredQuantity = lineReq.RequiredQuantity,
                CurrentStock = currentStock,
                PreferredVendor = lineReq.PreferredVendor,
                Remarks = lineReq.Remarks,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedByUserId = userId
            });
        }

        await _db.SaveChangesAsync(ct);
        return requisition;
    }

    public async Task<PagedResult<PurchaseRequisition>> ListAsync(Guid tenantId, int page, int pageSize, CancellationToken ct)
    {
        var q = _db.PurchaseRequisitions
            .Where(r => r.TenantId == tenantId && r.DeletedAt == null);
        var total = await q.CountAsync(ct);
        var items = await q
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .ToListAsync(ct);
        return new PagedResult<PurchaseRequisition>(items, total, page, pageSize);
    }

    public async Task<PurchaseRequisition?> SubmitAsync(
        Guid tenantId, Guid requisitionId, Guid userId, CancellationToken ct)
    {
        var req = await _db.PurchaseRequisitions
            .FirstOrDefaultAsync(r => r.Id == requisitionId && r.TenantId == tenantId && r.DeletedAt == null, ct);
        if (req is null || req.RequisitionStatus != "Draft") return null;

        req.RequisitionStatus = "Submitted";
        req.UpdatedAt = DateTime.UtcNow;
        req.UpdatedByUserId = userId;

        await _db.SaveChangesAsync(ct);
        return req;
    }

    public async Task<PurchaseRequisition?> ApproveAsync(
        Guid tenantId, Guid requisitionId, Guid userId, string? remarks, CancellationToken ct)
    {
        var req = await _db.PurchaseRequisitions
            .FirstOrDefaultAsync(r => r.Id == requisitionId && r.TenantId == tenantId && r.DeletedAt == null, ct);
        if (req is null || req.RequisitionStatus != "Submitted") return null;

        req.RequisitionStatus = "Approved";
        req.Remarks = remarks ?? req.Remarks;
        req.UpdatedAt = DateTime.UtcNow;
        req.UpdatedByUserId = userId;

        await _db.SaveChangesAsync(ct);
        return req;
    }

    public async Task<PurchaseRequisition?> GetAsync(
        Guid tenantId, Guid requisitionId, CancellationToken ct)
    {
        return await _db.PurchaseRequisitions
            .Include(r => r.Items).ThenInclude(i => i.Item)
            .FirstOrDefaultAsync(r => r.Id == requisitionId && r.TenantId == tenantId && r.DeletedAt == null, ct);
    }

    public async Task<PurchaseRequisition?> RejectAsync(
        Guid tenantId, Guid requisitionId, Guid userId, string? remarks, CancellationToken ct)
    {
        var req = await _db.PurchaseRequisitions
            .FirstOrDefaultAsync(r => r.Id == requisitionId && r.TenantId == tenantId && r.DeletedAt == null, ct);
        if (req is null || req.RequisitionStatus != "Submitted") return null;

        req.RequisitionStatus = "Rejected";
        req.Remarks = remarks ?? req.Remarks;
        req.UpdatedAt = DateTime.UtcNow;
        req.UpdatedByUserId = userId;

        await _db.SaveChangesAsync(ct);
        return req;
    }

    // ── Week 2: Policy-path evaluation ────────────────────────────────────────

    public async Task<EvaluatePolicyPathResult> EvaluatePolicyPathAsync(
        Guid tenantId, Guid requisitionId, CancellationToken ct)
    {
        var requisition = await _db.PurchaseRequisitions
            .Include(r => r.Items).ThenInclude(i => i.Item)
            .FirstOrDefaultAsync(r => r.Id == requisitionId && r.TenantId == tenantId && r.DeletedAt == null, ct)
            ?? throw new KeyNotFoundException("Requisition not found.");

        if (requisition.RequisitionStatus != "Approved")
            throw new InvalidOperationException("Only Approved requisitions can be evaluated.");

        // Estimate total value: sum of (RequiredQuantity × item last purchase price if available)
        // We use a conservative estimate of 0 when no price is available; the caller can override.
        decimal estimatedValue = 0m;
        foreach (var item in requisition.Items)
        {
            var lastPoItem = await _db.PurchaseOrderItems
                .Where(poi => poi.TenantId == tenantId && poi.ItemId == item.ItemId && poi.DeletedAt == null)
                .OrderByDescending(poi => poi.CreatedAt)
                .Select(poi => (decimal?)poi.UnitPrice)
                .FirstOrDefaultAsync(ct);
            estimatedValue += item.RequiredQuantity * (lastPoItem ?? 0m);
        }

        // Fetch active branch policy for the store's branch
        var store = await _db.Stores
            .FirstOrDefaultAsync(s => s.Id == requisition.StoreId && s.TenantId == tenantId, ct);

        BranchProcurementPolicy? policy = null;
        if (store?.BranchId is not null)
        {
            policy = await _db.BranchProcurementPolicies
                .FirstOrDefaultAsync(p => p.TenantId == tenantId
                    && p.BranchId == store.BranchId
                    && p.PolicyStatus == "Published"
                    && p.DeletedAt == null, ct);
        }

        string recommendedPath;
        string reason;
        bool requiresDualApproval = false;

        if (policy is null)
        {
            recommendedPath = "DirectPO";
            reason = "No active procurement policy found for this branch. Defaulting to Direct PO.";
        }
        else if (estimatedValue <= 0m)
        {
            recommendedPath = "DirectPO";
            reason = "No historical price data available. Estimated value is ₹0 — Direct PO recommended. Update unit prices on PO for accuracy.";
        }
        else if (estimatedValue <= policy.DirectPoLimit)
        {
            recommendedPath = "DirectPO";
            reason = $"Estimated value ₹{estimatedValue:N2} is within the Direct PO limit of ₹{policy.DirectPoLimit:N2}.";
        }
        else
        {
            recommendedPath = "RFQ";
            reason = $"Estimated value ₹{estimatedValue:N2} exceeds Direct PO limit of ₹{policy.DirectPoLimit:N2}. RFQ with minimum {policy.MinVendorQuotes} vendor quotes required.";
        }

        if (policy is not null && estimatedValue >= policy.DualApprovalFrom)
        {
            requiresDualApproval = true;
            reason += $" Dual approval required (threshold ₹{policy.DualApprovalFrom:N2}).";
        }

        return new EvaluatePolicyPathResult(
            RequisitionId:     requisitionId,
            RecommendedPath:   recommendedPath,
            EstimatedValue:    estimatedValue,
            DirectPoLimit:     policy?.DirectPoLimit,
            RfqMandatoryFrom:  policy?.RfqMandatoryFrom,
            DualApprovalFrom:  policy?.DualApprovalFrom,
            MinVendorQuotes:   policy?.MinVendorQuotes,
            RequiresDualApproval: requiresDualApproval,
            Reason:            reason,
            PolicyId:          policy?.Id,
            PolicyName:        policy?.PolicyName
        );
    }

    // ── Week 2: Convert Approved Requisition → RFQ ────────────────────────────

    public async Task<RfqHeader> ConvertToRfqAsync(
        Guid tenantId, Guid userId, Guid requisitionId, ConvertToRfqRequest req, CancellationToken ct)
    {
        var requisition = await _db.PurchaseRequisitions
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == requisitionId && r.TenantId == tenantId && r.DeletedAt == null, ct)
            ?? throw new KeyNotFoundException("Requisition not found.");

        if (requisition.RequisitionStatus != "Approved")
            throw new InvalidOperationException("Only Approved requisitions can be converted to RFQ.");

        var count   = await _db.RfqHeaders.CountAsync(r => r.TenantId == tenantId, ct);
        var rfqNumber = $"RFQ/{DateTime.UtcNow:yyyyMMdd}/{count + 1:D4}";

        var rfq = new RfqHeader
        {
            Id               = Guid.NewGuid(),
            TenantId         = tenantId,
            RequisitionId    = requisitionId,
            RfqNumber        = rfqNumber,
            Title            = req.Title ?? $"RFQ for {requisition.RequisitionNumber}",
            BranchId         = req.BranchId,
            RfqStatus        = "Draft",
            ResponseDeadline = req.ResponseDeadline.HasValue ? DateTime.SpecifyKind(req.ResponseDeadline.Value, DateTimeKind.Utc) : DateTime.UtcNow.AddDays(7),
            CreatedAt        = DateTime.UtcNow,
            UpdatedAt        = DateTime.UtcNow,
            CreatedByUserId  = userId,
            UpdatedByUserId  = userId,
        };
        _db.RfqHeaders.Add(rfq);

        foreach (var item in requisition.Items)
        {
            _db.RfqItems.Add(new RfqItem
            {
                Id           = Guid.NewGuid(),
                TenantId     = tenantId,
                RfqId        = rfq.Id,
                ItemId       = item.ItemId,
                RequestedQty = item.RequiredQuantity,
                Unit         = item.Item?.Unit ?? "Nos",
                CreatedAt    = DateTime.UtcNow,
                UpdatedAt    = DateTime.UtcNow,
                CreatedByUserId = userId,
            });
        }

        foreach (var vendorId in req.VendorIds ?? [])
        {
            _db.RfqVendorInvites.Add(new RfqVendorInvite
            {
                Id        = Guid.NewGuid(),
                TenantId  = tenantId,
                RfqId     = rfq.Id,
                VendorId  = vendorId,
                InviteStatus = "Invited",
                InvitedAt    = DateTime.UtcNow,
                CreatedAt    = DateTime.UtcNow,
                UpdatedAt    = DateTime.UtcNow,
                CreatedByUserId = userId,
            });
        }

        // Mark requisition as ConvertedToRFQ
        requisition.RequisitionStatus = "ConvertedToRFQ";
        requisition.UpdatedAt         = DateTime.UtcNow;
        requisition.UpdatedByUserId   = userId;

        await _db.SaveChangesAsync(ct);
        return rfq;
    }

    // ── Week 2: Convert Approved Requisition → Direct PO ────────────────────

    public async Task<PurchaseOrder> ConvertToPOAsync(
        Guid tenantId, Guid userId, Guid requisitionId, ConvertToPORequest req, CancellationToken ct)
    {
        var requisition = await _db.PurchaseRequisitions
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == requisitionId && r.TenantId == tenantId && r.DeletedAt == null, ct)
            ?? throw new KeyNotFoundException("Requisition not found.");

        if (requisition.RequisitionStatus != "Approved")
            throw new InvalidOperationException("Only Approved requisitions can be converted to a Purchase Order.");

        var count    = await _db.PurchaseOrders.CountAsync(p => p.TenantId == tenantId, ct);
        var poNumber = $"PO/{DateTime.UtcNow:yyyyMMdd}/{count + 1:D4}";

        decimal totalAmount = 0m;
        var itemRequests = req.Items ?? [];

        // Build line items and compute totals
        var poItems = new List<PurchaseOrderItem>();
        foreach (var reqItem in requisition.Items)
        {
            var overrideItem = itemRequests.FirstOrDefault(x => x.ItemId == reqItem.ItemId);
            var unitPrice    = overrideItem?.UnitPrice ?? 0m;
            var gstPct       = overrideItem?.GstPercent ?? 0m;
            var qty          = overrideItem?.OrderedQty ?? reqItem.RequiredQuantity;
            var lineTotal    = unitPrice * qty * (1 + gstPct / 100m);
            totalAmount     += lineTotal;

            poItems.Add(new PurchaseOrderItem
            {
                Id          = Guid.NewGuid(),
                TenantId    = tenantId,
                ItemId      = reqItem.ItemId,
                OrderedQty  = qty,
                ReceivedQty = 0,
                UnitPrice   = unitPrice,
                GstPercent  = gstPct,
                TotalAmount = lineTotal,
                Unit        = overrideItem?.Unit ?? "Nos",
                CreatedAt   = DateTime.UtcNow,
                UpdatedAt   = DateTime.UtcNow,
                CreatedByUserId = userId,
            });
        }

        var gstAmount = poItems.Sum(i => i.UnitPrice * i.OrderedQty * (i.GstPercent / 100m));
        var netAmount = totalAmount;

        var po = new PurchaseOrder
        {
            Id              = Guid.NewGuid(),
            TenantId        = tenantId,
            BranchId        = req.BranchId,
            RequisitionId   = requisitionId,
            SourceType      = req.IsEmergency ? "Emergency" : "Direct",
            PoNumber        = poNumber,
            VendorId        = req.VendorId,
            PoStatus        = "Draft",
            TotalAmount     = totalAmount - gstAmount,
            GstAmount       = gstAmount,
            NetAmount       = netAmount,
            PoDate          = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc),
            ExpectedDeliveryDate = req.ExpectedDeliveryDate.HasValue
                ? DateTime.SpecifyKind(req.ExpectedDeliveryDate.Value.Date, DateTimeKind.Utc)
                : null,
            IsEmergency     = req.IsEmergency,
            Notes           = req.Notes,
            Terms           = req.Terms,
            CreatedAt       = DateTime.UtcNow,
            UpdatedAt       = DateTime.UtcNow,
            CreatedByUserId = userId,
            UpdatedByUserId = userId,
        };
        _db.PurchaseOrders.Add(po);

        foreach (var item in poItems)
        {
            item.PoId = po.Id;
            _db.PurchaseOrderItems.Add(item);
        }

        // Mark requisition as ConvertedToPO
        requisition.RequisitionStatus = "ConvertedToPO";
        requisition.UpdatedAt         = DateTime.UtcNow;
        requisition.UpdatedByUserId   = userId;

        await _db.SaveChangesAsync(ct);
        return po;
    }
}

