using InventoryApi.Data;
using InventoryApi.Models.DTOs;
using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Services;

public interface IPurchaseOrderService
{
    Task<PurchaseOrder> CreateAsync(Guid tenantId, Guid userId, CreatePurchaseOrderRequest req, CancellationToken ct);
    Task<PurchaseOrder> UpdateAsync(Guid tenantId, Guid userId, Guid poId, UpdatePurchaseOrderRequest req, CancellationToken ct);
    Task<PagedResult<PurchaseOrder>> ListAsync(Guid tenantId, Guid? branchId, string? status, int page, int pageSize, CancellationToken ct);
    Task<PurchaseOrder?> GetAsync(Guid tenantId, Guid poId, CancellationToken ct);
    Task<PurchaseOrder> SubmitAsync(Guid tenantId, Guid userId, Guid poId, CancellationToken ct);
    Task<PurchaseOrder> ApproveL1Async(Guid tenantId, Guid userId, Guid poId, string? remarks, CancellationToken ct);
    Task<PurchaseOrder> ApproveL2Async(Guid tenantId, Guid userId, Guid poId, string? remarks, CancellationToken ct);
    Task<PurchaseOrder> RejectAsync(Guid tenantId, Guid userId, Guid poId, string reason, CancellationToken ct);
    Task<(PurchaseOrder Po, Guid? AckId, bool NotificationSent)> SendToVendorAsync(Guid tenantId, Guid userId, Guid poId, SendToVendorRequest? sendReq, CancellationToken ct);
    Task<PurchaseOrder> CancelAsync(Guid tenantId, Guid userId, Guid poId, string reason, CancellationToken ct);
    Task<PurchaseOrder> CloseAsync(Guid tenantId, Guid userId, Guid poId, CancellationToken ct);
    Task<PurchaseOrder> RecordReceiptAsync(Guid tenantId, Guid userId, Guid poId, RecordPoReceiptRequest req, CancellationToken ct);
    Task<PagedResult<VendorPerformanceSummaryDto>> GetVendorPerformanceAsync(Guid tenantId, Guid? vendorId, int page, int pageSize, CancellationToken ct);
    Task<List<ProcurementTransitionLog>> GetLogsAsync(Guid tenantId, Guid poId, CancellationToken ct);
    Task<GrnHeaderDto> GenerateGrnFromPoAsync(Guid tenantId, Guid userId, Guid poId, CancellationToken ct);
}

public sealed class PurchaseOrderService : IPurchaseOrderService
{
    private readonly InventoryDbContext _db;
    private readonly IBranchProcurementPolicyService _policyService;
    private readonly IVendorAcknowledgmentService _acks;
    private readonly INotificationClient _notify;
    private readonly IGrnService _grn;

    public PurchaseOrderService(InventoryDbContext db, IBranchProcurementPolicyService policyService, IVendorAcknowledgmentService acks, INotificationClient notify, IGrnService grn)
    {
        _db = db;
        _policyService = policyService;
        _acks = acks;
        _notify = notify;
        _grn = grn;
    }

    public async Task<PurchaseOrder> CreateAsync(Guid tenantId, Guid userId, CreatePurchaseOrderRequest req, CancellationToken ct)
    {
        // Guard against duplicate POs for the same RFQ
        if (req.RfqId.HasValue)
        {
            var existingPo = await _db.PurchaseOrders
                .FirstOrDefaultAsync(p => p.TenantId == tenantId
                    && p.RfqId == req.RfqId.Value
                    && p.DeletedAt == null
                    && p.PoStatus != "Cancelled", ct);
            if (existingPo != null)
                throw new InvalidOperationException(
                    $"A purchase order already exists for this RFQ: {existingPo.PoNumber} (Status: {existingPo.PoStatus}). Cancel the existing PO before creating a new one.");
        }

        var count = await _db.PurchaseOrders.CountAsync(p => p.TenantId == tenantId, ct);
        var poNumber = $"PO/{DateTime.UtcNow:yyyyMMdd}/{count + 1:D4}";

        // Compute amounts
        decimal total = req.Items.Sum(i => i.TotalAmount);
        decimal gst = req.Items.Sum(i => i.TotalAmount * i.GstPercent / 100m);
        decimal net = total + gst;

        // Determine if dual approval is needed
        var policy = await _policyService.GetActiveAsync(tenantId, req.BranchId, ct);
        bool needsDual = policy != null && net >= policy.DualApprovalFrom;

        var po = new PurchaseOrder
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            BranchId = req.BranchId,
            RequisitionId = req.RequisitionId,
            RfqId = req.RfqId,
            SourceType = req.SourceType,
            PoNumber = poNumber,
            VendorId = req.VendorId,
            PoStatus = "Draft",
            TotalAmount = total,
            GstAmount = gst,
            NetAmount = net,
            PoDate = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc),
            ExpectedDeliveryDate = req.ExpectedDeliveryDate.HasValue ? DateTime.SpecifyKind(req.ExpectedDeliveryDate.Value, DateTimeKind.Utc) : null,
            IsEmergency = req.IsEmergency,
            EmergencyBypassExpiry = req.IsEmergency && policy?.EmergencyBypassAllowed == true
                ? DateTime.UtcNow.AddHours(policy.EmergencyBypassExpiryHours)
                : null,
            Terms = req.Terms,
            Notes = req.Notes,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedByUserId = userId,
            UpdatedByUserId = userId,
        };
        _db.PurchaseOrders.Add(po);

        foreach (var line in req.Items)
        {
            _db.PurchaseOrderItems.Add(new PurchaseOrderItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                PoId = po.Id,
                ItemId = line.ItemId,
                OrderedQty = line.OrderedQty,
                ReceivedQty = 0,
                UnitPrice = line.UnitPrice,
                GstPercent = line.GstPercent,
                TotalAmount = line.TotalAmount,
                Unit = line.Unit,
                RequiredBy = line.RequiredBy,
                Remarks = line.Remarks,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedByUserId = userId,
                UpdatedByUserId = userId,
            });
        }

        await _db.SaveChangesAsync(ct);
        await LogTransitionAsync(tenantId, po.Id, "", "Draft", null, userId, ct);
        return po;
    }

    public async Task<PurchaseOrder> UpdateAsync(Guid tenantId, Guid userId, Guid poId, UpdatePurchaseOrderRequest req, CancellationToken ct)
    {
        var po = await GetRequiredAsync(tenantId, poId, ct);
        if (po.PoStatus != "Draft")
            throw new InvalidOperationException($"Only Draft POs can be edited. Current status: {po.PoStatus}.");

        // Remove existing items and replace with new set
        var existingItems = await _db.PurchaseOrderItems
            .Where(i => i.PoId == poId)
            .ToListAsync(ct);
        _db.PurchaseOrderItems.RemoveRange(existingItems);

        decimal total = req.Items.Sum(i => i.TotalAmount);
        decimal gst   = req.Items.Sum(i => i.TotalAmount * i.GstPercent / 100m);
        decimal net   = total + gst;

        po.BranchId             = req.BranchId;
        po.VendorId             = req.VendorId;
        po.TotalAmount          = total;
        po.GstAmount            = gst;
        po.NetAmount            = net;
        po.ExpectedDeliveryDate = req.ExpectedDeliveryDate.HasValue
            ? DateTime.SpecifyKind(req.ExpectedDeliveryDate.Value, DateTimeKind.Utc) : null;
        po.IsEmergency          = req.IsEmergency;
        po.Terms                = req.Terms;
        po.Notes                = req.Notes;
        po.UpdatedAt            = DateTime.UtcNow;
        po.UpdatedByUserId      = userId;

        foreach (var line in req.Items)
        {
            _db.PurchaseOrderItems.Add(new PurchaseOrderItem
            {
                Id              = Guid.NewGuid(),
                TenantId        = tenantId,
                PoId            = poId,
                ItemId          = line.ItemId,
                OrderedQty      = line.OrderedQty,
                ReceivedQty     = 0,
                UnitPrice       = line.UnitPrice,
                GstPercent      = line.GstPercent,
                TotalAmount     = line.TotalAmount,
                Unit            = line.Unit,
                RequiredBy      = line.RequiredBy,
                Remarks         = line.Remarks,
                CreatedAt       = DateTime.UtcNow,
                UpdatedAt       = DateTime.UtcNow,
                CreatedByUserId = userId,
                UpdatedByUserId = userId,
            });
        }

        await _db.SaveChangesAsync(ct);
        return po;
    }

    public async Task<PagedResult<PurchaseOrder>> ListAsync(Guid tenantId, Guid? branchId, string? status, int page, int pageSize, CancellationToken ct)
    {
        var query = _db.PurchaseOrders
            .Include(p => p.Vendor)
            .Where(p => p.TenantId == tenantId && p.DeletedAt == null);

        if (branchId.HasValue) query = query.Where(p => p.BranchId == branchId);
        if (!string.IsNullOrEmpty(status)) query = query.Where(p => p.PoStatus == status);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<PurchaseOrder>(items, total, page, pageSize);
    }

    public async Task<PurchaseOrder?> GetAsync(Guid tenantId, Guid poId, CancellationToken ct)
        => await _db.PurchaseOrders
            .Include(p => p.Vendor)
            .Include(p => p.Items).ThenInclude(i => i.Item)
            .FirstOrDefaultAsync(p => p.TenantId == tenantId && p.Id == poId && p.DeletedAt == null, ct);

    public async Task<PurchaseOrder> SubmitAsync(Guid tenantId, Guid userId, Guid poId, CancellationToken ct)
        => await TransitionAsync(tenantId, userId, poId, "Draft", "Submitted", null, ct);

    public async Task<PurchaseOrder> ApproveL1Async(Guid tenantId, Guid userId, Guid poId, string? remarks, CancellationToken ct)
    {
        var po = await GetRequiredAsync(tenantId, poId, ct);
        if (po.PoStatus != "Submitted")
            throw new InvalidOperationException($"Expected status 'Submitted', found '{po.PoStatus}'.");

        // Determine if dual-approval is required
        var policy = await _policyService.GetActiveAsync(tenantId, po.BranchId, ct);
        bool needsDual = policy != null && po.NetAmount >= policy.DualApprovalFrom;

        var from = po.PoStatus;
        po.L1ApprovedByUserId = userId;
        po.L1ApprovedAt = DateTime.UtcNow;
        po.PoStatus = needsDual ? "L1Approved" : "Approved";
        po.UpdatedAt = DateTime.UtcNow;
        po.UpdatedByUserId = userId;

        await _db.SaveChangesAsync(ct);
        await LogTransitionAsync(tenantId, poId, from, po.PoStatus, remarks, userId, ct);
        return po;
    }

    public async Task<PurchaseOrder> ApproveL2Async(Guid tenantId, Guid userId, Guid poId, string? remarks, CancellationToken ct)
        => await TransitionAsync(tenantId, userId, poId, "L1Approved", "Approved", remarks, ct, po =>
        {
            po.L2ApprovedByUserId = userId;
            po.L2ApprovedAt = DateTime.UtcNow;
        });

    public async Task<PurchaseOrder> RejectAsync(Guid tenantId, Guid userId, Guid poId, string reason, CancellationToken ct)
        => await TransitionAsync(tenantId, userId, poId, null, "Rejected", reason, ct, po =>
        {
            po.RejectedByUserId = userId;
            po.RejectedAt = DateTime.UtcNow;
            po.RejectionReason = reason;
        });

    public async Task<(PurchaseOrder Po, Guid? AckId, bool NotificationSent)> SendToVendorAsync(
        Guid tenantId, Guid userId, Guid poId, SendToVendorRequest? sendReq, CancellationToken ct)
    {
        // Hybrid gate: if this PO was created from an RFQ, vendor must have acknowledged the award before we can send
        var po = await GetRequiredAsync(tenantId, poId, ct);
        if (po.RfqId is not null)
        {
            var ack = await _acks.GetByEntityAsync(tenantId, "RfqAward", po.RfqId.Value, ct);
            if (ack is null || ack.AckStatus != "Acknowledged")
            {
                var reason = ack is null
                    ? "No vendor acknowledgment found for this RFQ award. Record the vendor's confirmation first."
                    : $"Vendor acknowledgment is '{ack.AckStatus}'. Only 'Acknowledged' awards may be sent to vendor.";
                throw new InvalidOperationException(reason);
            }
        }

        var sentPo = await TransitionAsync(tenantId, userId, poId, "Approved", "SentToVendor", null, ct, p =>
        {
            p.SentToVendorAt = DateTime.UtcNow;
        });

        // Create a pending POSend acknowledgment record
        var pendingAck = await _acks.CreatePendingAsync(
            tenantId, userId, sentPo.VendorId, "POSend", sentPo.Id,
            DateTime.UtcNow.AddDays(7), ct);

        // Attempt notification (non-blocking, failures do not abort the PO transition)
        bool notified = false;
        if (!string.IsNullOrWhiteSpace(sendReq?.Channel) && !string.IsNullOrWhiteSpace(sendReq.ContactTarget))
        {
            try
            {
                await _notify.SendPoToVendorAsync(
                    sendReq.Channel,
                    sendReq.ContactTarget,
                    sentPo.VendorId.ToString(), // vendor name not loaded here; contact info known from request
                    sentPo.PoNumber,
                    sentPo.NetAmount,
                    sentPo.SentToVendorAt!.Value,
                    sendReq.Notes);
                notified = true;
            }
            catch { /* already logged inside the client */ }
        }

        return (sentPo, pendingAck.Id, notified);
    }

    public async Task<PurchaseOrder> CancelAsync(Guid tenantId, Guid userId, Guid poId, string reason, CancellationToken ct)
        => await TransitionAsync(tenantId, userId, poId, null, "Cancelled", reason, ct);

    public async Task<PurchaseOrder> CloseAsync(Guid tenantId, Guid userId, Guid poId, CancellationToken ct)
        => await TransitionAsync(tenantId, userId, poId, "FullyReceived", "Closed", null, ct);

    // ── Helpers ───────────────────────────────────────────────────────────────

    private async Task<PurchaseOrder> GetRequiredAsync(Guid tenantId, Guid poId, CancellationToken ct)
        => await _db.PurchaseOrders
            .FirstOrDefaultAsync(p => p.TenantId == tenantId && p.Id == poId && p.DeletedAt == null, ct)
            ?? throw new KeyNotFoundException("Purchase order not found.");

    private async Task<PurchaseOrder> TransitionAsync(
        Guid tenantId, Guid userId, Guid poId,
        string? expectedFromStatus, string toStatus, string? reason,
        CancellationToken ct,
        Action<PurchaseOrder>? mutate = null)
    {
        var po = await GetRequiredAsync(tenantId, poId, ct);

        if (expectedFromStatus != null && po.PoStatus != expectedFromStatus)
            throw new InvalidOperationException($"Expected status '{expectedFromStatus}', found '{po.PoStatus}'.");

        var from = po.PoStatus;
        po.PoStatus = toStatus;
        po.UpdatedAt = DateTime.UtcNow;
        po.UpdatedByUserId = userId;
        mutate?.Invoke(po);

        await _db.SaveChangesAsync(ct);
        await LogTransitionAsync(tenantId, poId, from, toStatus, reason, userId, ct);
        return po;
    }

    private async Task LogTransitionAsync(Guid tenantId, Guid poId, string from, string to, string? reason, Guid userId, CancellationToken ct)
    {
        _db.ProcurementTransitionLogs.Add(new ProcurementTransitionLog
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            EntityType = "PurchaseOrder",
            EntityId = poId,
            FromStatus = from,
            ToStatus = to,
            Reason = reason,
            ActorUserId = userId,
            TransitionedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            CreatedByUserId = userId,
        });
        await _db.SaveChangesAsync(ct);
    }

    // ── Week 3: Record PO Receipt (PartiallyReceived / FullyReceived) ─────────

    public async Task<PurchaseOrder> RecordReceiptAsync(
        Guid tenantId, Guid userId, Guid poId, RecordPoReceiptRequest req, CancellationToken ct)
    {
        var po = await _db.PurchaseOrders
            .Include(p => p.Items)
            .FirstOrDefaultAsync(p => p.TenantId == tenantId && p.Id == poId && p.DeletedAt == null, ct)
            ?? throw new KeyNotFoundException("Purchase order not found.");

        if (po.PoStatus is not ("SentToVendor" or "PartiallyReceived"))
            throw new InvalidOperationException(
                $"PO must be in SentToVendor or PartiallyReceived state to record receipt. Current: {po.PoStatus}");

        // Update ReceivedQty per item + create stock batches
        foreach (var line in req.Items)
        {
            var poItem = po.Items.FirstOrDefault(i => i.ItemId == line.ItemId)
                ?? throw new InvalidOperationException($"Item {line.ItemId} not found in this PO.");

            poItem.ReceivedQty += line.ReceivedQty;
            poItem.UpdatedAt = DateTime.UtcNow;
            poItem.UpdatedByUserId = userId;

            // Create stock batch for received quantity
            var batch = new StockBatch
            {
                Id              = Guid.NewGuid(),
                TenantId        = tenantId,
                StoreId         = req.StoreId,
                ItemId          = line.ItemId,
                BatchNumber     = line.BatchNumber ?? $"PO-{po.PoNumber}-{DateTime.UtcNow:yyyyMMdd}",
                ExpiryDate      = line.ExpiryDate,
                Barcode         = line.Barcode,
                Mrp             = line.Mrp ?? poItem.UnitPrice,
                PurchaseRate    = poItem.UnitPrice,
                QuantityIn      = line.ReceivedQty,
                QuantityAvailable = line.ReceivedQty,
                CreatedAt       = DateTime.UtcNow,
                UpdatedAt       = DateTime.UtcNow,
                CreatedByUserId = userId,
                UpdatedByUserId = userId,
            };
            _db.StockBatches.Add(batch);

            // Stock ledger entry
            var lastLedger = await _db.StockLedgers
                .Where(l => l.TenantId == tenantId && l.StoreId == req.StoreId && l.ItemId == line.ItemId)
                .OrderByDescending(l => l.CreatedAt)
                .FirstOrDefaultAsync(ct);

            var balance = (lastLedger?.BalanceQuantity ?? 0) + line.ReceivedQty;

            _db.StockLedgers.Add(new StockLedger
            {
                Id              = Guid.NewGuid(),
                TenantId        = tenantId,
                StoreId         = req.StoreId,
                ItemId          = line.ItemId,
                StockBatchId    = batch.Id,
                TransactionType = "PO_IN",
                ReferenceId     = po.Id.ToString(),
                ReferenceNumber = po.PoNumber,
                QuantityIn      = line.ReceivedQty,
                QuantityOut     = 0,
                BalanceQuantity = balance,
                UnitRate        = poItem.UnitPrice,
                TotalValue      = Math.Round(line.ReceivedQty * poItem.UnitPrice, 2),
                Remarks         = req.Notes,
                TransactionDate = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc),
                CreatedAt       = DateTime.UtcNow,
                UpdatedAt       = DateTime.UtcNow,
                CreatedByUserId = userId,
                UpdatedByUserId = userId,
            });
        }

        // Determine new PO status
        bool fullyReceived = po.Items.All(i => i.ReceivedQty >= i.OrderedQty);
        var fromStatus = po.PoStatus;
        po.PoStatus   = fullyReceived ? "FullyReceived" : "PartiallyReceived";
        po.UpdatedAt  = DateTime.UtcNow;
        po.UpdatedByUserId = userId;

        if (req.ActualDeliveryDate.HasValue)
            po.ActualDeliveryDate = req.ActualDeliveryDate;

        if (fullyReceived)
        {
            po.ReceivedAt = DateTime.UtcNow;
            po.ActualDeliveryDate ??= DateTime.UtcNow;

            // Record vendor performance
            var totalOrdered  = po.Items.Sum(i => i.OrderedQty);
            var totalReceived = po.Items.Sum(i => i.ReceivedQty);
            var fulfillment   = totalOrdered > 0 ? Math.Round(totalReceived / totalOrdered * 100m, 2) : 100m;
            var actual        = po.ActualDeliveryDate!.Value;
            var expected      = po.ExpectedDeliveryDate;
            bool onTime       = expected == null || actual.Date <= expected.Value.Date;
            int? daysLate     = onTime ? null : (int)(actual.Date - expected!.Value.Date).TotalDays;

            _db.VendorPerformanceRecords.Add(new VendorPerformanceRecord
            {
                Id                   = Guid.NewGuid(),
                TenantId             = tenantId,
                VendorId             = po.VendorId,
                PoId                 = po.Id,
                StoreId              = req.StoreId,
                ExpectedDeliveryDate = po.ExpectedDeliveryDate,
                ActualDeliveryDate   = po.ActualDeliveryDate,
                OnTimeDelivery       = onTime,
                DaysLate             = daysLate,
                TotalOrdered         = totalOrdered,
                TotalReceived        = totalReceived,
                FulfillmentRate      = fulfillment,
                Notes                = req.Notes,
                CreatedAt            = DateTime.UtcNow,
                UpdatedAt            = DateTime.UtcNow,
                CreatedByUserId      = userId,
                UpdatedByUserId      = userId,
            });
        }

        await _db.SaveChangesAsync(ct);
        await LogTransitionAsync(tenantId, poId, fromStatus, po.PoStatus, req.Notes, userId, ct);
        return po;
    }

    // ── Week 3: Vendor Performance Summary ────────────────────────────────────

    public async Task<PagedResult<VendorPerformanceSummaryDto>> GetVendorPerformanceAsync(
        Guid tenantId, Guid? vendorId, int page, int pageSize, CancellationToken ct)
    {
        var query = _db.VendorPerformanceRecords
            .Include(v => v.Vendor)
            .Where(v => v.TenantId == tenantId && v.DeletedAt == null);

        if (vendorId.HasValue) query = query.Where(v => v.VendorId == vendorId.Value);

        var grouped = await query
            .GroupBy(v => new { v.VendorId, Name = v.Vendor!.Name })
            .Select(g => new VendorPerformanceSummaryDto(
                g.Key.VendorId,
                g.Key.Name,
                g.Count(),
                Math.Round(g.Average(v => v.OnTimeDelivery ? 100m : 0m), 1),
                Math.Round(g.Average(v => v.FulfillmentRate), 1),
                g.Any(v => v.Rating.HasValue) ? Math.Round(g.Where(v => v.Rating.HasValue).Average(v => v.Rating!.Value), 1) : (decimal?)null
            ))
            .ToListAsync(ct);

        var total = grouped.Count;
        var items = grouped.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        return new PagedResult<VendorPerformanceSummaryDto>(items, total, page, pageSize);
    }

    public async Task<List<ProcurementTransitionLog>> GetLogsAsync(Guid tenantId, Guid poId, CancellationToken ct)
        => await _db.ProcurementTransitionLogs
            .Where(l => l.TenantId == tenantId && l.EntityId == poId
                     && l.EntityType == "PurchaseOrder" && l.DeletedAt == null)
            .OrderBy(l => l.TransitionedAt)
            .ToListAsync(ct);

    public async Task<GrnHeaderDto> GenerateGrnFromPoAsync(Guid tenantId, Guid userId, Guid poId, CancellationToken ct)
    {
        var po = await _db.PurchaseOrders
            .Include(p => p.Items)
            .FirstOrDefaultAsync(p => p.TenantId == tenantId && p.Id == poId && p.DeletedAt == null, ct)
            ?? throw new KeyNotFoundException("Purchase order not found.");

        if (po.Items.Count == 0)
            throw new InvalidOperationException("PO has no items.");

        // Create a Draft invoice from the PO
        var invoice = new PurchaseInvoice
        {
            Id              = Guid.NewGuid(),
            TenantId        = tenantId,
            VendorId        = po.VendorId,
            StoreId         = po.Items.First().Id != Guid.Empty
                                ? _db.PurchaseOrders.Local.FirstOrDefault(x => x.Id == poId)?.BranchId ?? Guid.Empty
                                : Guid.Empty,
            InvoiceNumber   = $"PO-{po.PoNumber}",
            InvoiceDate     = DateTime.UtcNow,
            ApprovalStatus  = "PrimaryApproved",
            GrossAmount     = po.TotalAmount,
            TaxableAmount   = po.TotalAmount,
            TotalGst        = po.GstAmount,
            NetAmount       = po.NetAmount,
            Status          = "active",
            CreatedAt       = DateTime.UtcNow,
            UpdatedAt       = DateTime.UtcNow,
            CreatedByUserId = userId,
            UpdatedByUserId = userId,
        };

        // Resolve StoreId from PO branch (use branch id as store fallback)
        invoice.StoreId = po.BranchId;

        foreach (var poItem in po.Items)
        {
            var taxable = Math.Round(poItem.OrderedQty * poItem.UnitPrice, 2);
            var cgstPct = poItem.GstPercent / 2;
            var cgstAmt = Math.Round(taxable * cgstPct / 100, 2);
            var sgstAmt = cgstAmt;
            var net     = taxable + cgstAmt + sgstAmt;

            invoice.Items.Add(new PurchaseItem
            {
                Id               = Guid.NewGuid(),
                TenantId         = tenantId,
                InvoiceId        = invoice.Id,
                ItemId           = poItem.ItemId,
                OrderedQuantity  = poItem.OrderedQty,
                ReceivedQuantity = poItem.OrderedQty,
                PurchaseRate     = poItem.UnitPrice,
                GstPercent       = poItem.GstPercent,
                CgstPercent      = cgstPct,
                SgstPercent      = cgstPct,
                TaxableAmount    = taxable,
                GstAmount        = cgstAmt + sgstAmt,
                NetAmount        = net,
                CreatedAt        = DateTime.UtcNow,
                UpdatedAt        = DateTime.UtcNow,
                CreatedByUserId  = userId,
                UpdatedByUserId  = userId,
            });
        }

        _db.PurchaseInvoices.Add(invoice);
        await _db.SaveChangesAsync(ct);

        return await _grn.GenerateGrnFromInvoiceAsync(tenantId, invoice.Id, userId, DateTime.UtcNow, $"Auto-generated from PO {po.PoNumber}", ct);
    }
}
