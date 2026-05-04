using InventoryApi.Data;
using InventoryApi.Models.DTOs;
using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Services;

public interface IBillTransferService
{
    Task<PagedResult<BillTransferDto>> ListAsync(Guid tenantId, string? status, int page, int pageSize, CancellationToken ct);
    Task<BillTransferDto?> GetAsync(Guid tenantId, Guid id, CancellationToken ct);
    Task<IReadOnlyList<BillTransferEventLogDto>> GetEventLogAsync(Guid tenantId, Guid id, CancellationToken ct);
    Task<IReadOnlyList<BillTransferDto>> GetChangedSinceAsync(Guid tenantId, DateTime since, CancellationToken ct);
    Task<BtComplianceReportDto> GetComplianceReportAsync(Guid tenantId, CancellationToken ct);
    Task<BillTransferDto> GenerateAsync(Guid tenantId, Guid grnId, Guid userId, CancellationToken ct);
    Task<BillTransferActionResultDto?> L1ApproveAsync(Guid tenantId, Guid id, Guid userId, string? remarks, long? expectedVersion, string? overrideReasonCode, string? overrideReasonText, CancellationToken ct);
    Task<BillTransferDto?> L1RejectAsync(Guid tenantId, Guid id, Guid userId, string? remarks, long? expectedVersion, CancellationToken ct);
    Task<BillTransferActionResultDto?> L2ApproveAsync(Guid tenantId, Guid id, Guid userId, string? remarks, long? expectedVersion, string? overrideReasonCode, string? overrideReasonText, CancellationToken ct);
    Task<BillTransferDto?> L2RejectAsync(Guid tenantId, Guid id, Guid userId, string? remarks, long? expectedVersion, CancellationToken ct);
    Task<BillTransferDto?> ResubmitAsync(Guid tenantId, Guid id, Guid userId, string? remarks, long? expectedVersion, CancellationToken ct);
    Task<BillTransferDto?> CancelAsync(Guid tenantId, Guid id, Guid userId, long? expectedVersion, CancellationToken ct);
}

public sealed class BillTransferService : IBillTransferService
{
    private readonly InventoryDbContext _db;
    private readonly IInvoiceSettlementService _settlements;
    private readonly IBillTransferPolicyService _policy;

    public BillTransferService(InventoryDbContext db, IInvoiceSettlementService settlements, IBillTransferPolicyService policy)
    {
        _db          = db;
        _settlements = settlements;
        _policy      = policy;
    }

    // ── List ─────────────────────────────────────────────────────────────────
    public async Task<PagedResult<BillTransferDto>> ListAsync(
        Guid tenantId, string? status, int page, int pageSize, CancellationToken ct)
    {
        bool wantNotGenerated = status is null or "NotGenerated";
        bool wantGenerated    = status is null || status != "NotGenerated";

        // ── Approved GRNs with no BT yet → show as "NotGenerated" ────────────
        var ngDtos = new List<BillTransferDto>();
        if (wantNotGenerated)
        {
            var existingGrnIds = _db.BillTransfers
                .Where(b => b.TenantId == tenantId && b.DeletedAt == null)
                .Select(b => b.GrnId);

            var grns = await _db.GrnHeaders
                .Include(g => g.Invoice!).ThenInclude(i => i!.Vendor)
                .Include(g => g.Invoice!).ThenInclude(i => i!.Items)
                .Include(g => g.GrnItems).ThenInclude(gi => gi.PurchaseItem)
                .Where(g => g.TenantId == tenantId
                         && g.DeletedAt == null
                         && g.GrnStatus == "Approved"
                         && !existingGrnIds.Contains(g.Id))
                .OrderByDescending(g => g.GrnDate)
                .ToListAsync(ct);

            // Deduplicate: seed re-runs or re-imports can create multiple GRN rows
            // for the same invoice. Keep only the most-recent one per InvoiceId.
            ngDtos = grns
                .DistinctBy(g => g.InvoiceId)
                .Select(GrnToNotGeneratedDto)
                .ToList();
        }

        // ── Existing bill-transfers ───────────────────────────────────────────
        var btDtos  = new List<BillTransferDto>();
        int btTotal = 0;
        if (wantGenerated)
        {
            var q = _db.BillTransfers
                .Include(b => b.Vendor)
                .Include(b => b.Grn).ThenInclude(g => g!.GrnItems).ThenInclude(gi => gi.PurchaseItem)
                .Include(b => b.Invoice).ThenInclude(i => i!.Items)
                .Where(b => b.TenantId == tenantId && b.DeletedAt == null);

            if (!string.IsNullOrWhiteSpace(status))
                q = q.Where(b => b.Status == status);

            btTotal = await q.CountAsync(ct);
            var btItems = await q
                .OrderByDescending(b => b.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            btDtos = btItems.Select(ToDto).ToList();
        }

        return new PagedResult<BillTransferDto>(
            ngDtos.Concat(btDtos).ToList(),
            ngDtos.Count + btTotal,
            page,
            pageSize);
    }

    // ── Get ──────────────────────────────────────────────────────────────────
    public async Task<BillTransferDto?> GetAsync(Guid tenantId, Guid id, CancellationToken ct)
    {
        var bt = await FetchAsync(tenantId, id, ct);
        return bt is null ? null : ToDto(bt);
    }

    // ── Event Log ────────────────────────────────────────────────────────────
    public async Task<IReadOnlyList<BillTransferEventLogDto>> GetEventLogAsync(Guid tenantId, Guid id, CancellationToken ct)
    {
        var logs = await _db.BillTransferEventLogs
            .AsNoTracking()
            .Where(e => e.TenantId == tenantId && e.BillTransferId == id)
            .OrderBy(e => e.CreatedAt)
            .ToListAsync(ct);

        return logs.Select(e => new BillTransferEventLogDto(
            EventId:         e.EventId,
            BillTransferId:  e.BillTransferId,
            FromStatus:      e.FromStatus,
            ToStatus:        e.ToStatus,
            Action:          e.Action,
            ActorUserId:     e.ActorUserId,
            ActorRole:       e.ActorRole,
            ReasonCode:      e.ReasonCode,
            ReasonText:      e.ReasonText,
            OverrideApplied: e.OverrideApplied,
            CreatedAt:       e.CreatedAt
        )).ToList();
    }

    // ── Generate ─────────────────────────────────────────────────────────────
    public async Task<BillTransferDto> GenerateAsync(Guid tenantId, Guid grnId, Guid userId, CancellationToken ct)
    {
        // A bill-transfer must not already exist for this GRN
        if (await _db.BillTransfers.AnyAsync(b => b.GrnId == grnId && b.TenantId == tenantId && b.DeletedAt == null, ct))
            throw new InvalidOperationException("A Bill Transfer already exists for this GRN.");

        var grn = await _db.GrnHeaders
            .Include(g => g.Invoice).ThenInclude(i => i!.Items)
            .Include(g => g.GrnItems).ThenInclude(gi => gi.PurchaseItem)
            .FirstOrDefaultAsync(g => g.Id == grnId && g.TenantId == tenantId && g.DeletedAt == null, ct)
            ?? throw new InvalidOperationException("GRN not found.");

        if (grn.GrnStatus != "Approved")
            throw new InvalidOperationException($"Cannot create Bill Transfer for GRN in '{grn.GrnStatus}' state. Expected Approved (FinalApproved).");

        if (grn.Invoice is null)
            throw new InvalidOperationException("GRN has no linked invoice.");

        var invoice = grn.Invoice;

        // Compute amounts from live items so the BT snapshot is accurate.
        var (snapTaxable, snapCgst, snapSgst, snapIgst) = ComputeItemTotals(
            grn.GrnItems.Count > 0 ? grn.GrnItems : null,
            invoice.Items?.Where(pi => pi.DeletedAt == null).ToList());
        decimal snapNet = snapTaxable + snapCgst + snapSgst + snapIgst;
        if (snapNet == 0) { snapNet = invoice.NetAmount; snapCgst = invoice.CgstAmount; snapSgst = invoice.SgstAmount; snapIgst = invoice.IgstAmount; }

        var bt = new BillTransfer
        {
            Id                = Guid.NewGuid(),
            TenantId          = tenantId,
            GrnId             = grnId,
            InvoiceId         = invoice.Id,
            VendorId          = invoice.VendorId,
            GrnTotalAmount    = snapNet,
            InvoiceTotalAmount= snapNet,
            CgstAmount        = snapCgst,
            SgstAmount        = snapSgst,
            IgstAmount        = snapIgst,
            TcsAmount         = invoice.TcsAmount,
            Status            = "Draft",
            VersionNo         = 1,
            L1DueAt           = DateTime.UtcNow.AddHours(48),
            SlaState          = "OnTrack",
            Attachments       = [],
            CreatedAt         = DateTime.UtcNow,
            UpdatedAt         = DateTime.UtcNow,
            CreatedByUserId   = userId,
            UpdatedByUserId   = userId
        };

        _db.BillTransfers.Add(bt);

        _db.BillTransferEventLogs.Add(new BillTransferEventLog
        {
            EventId        = Guid.NewGuid(),
            TenantId       = tenantId,
            BillTransferId = bt.Id,
            FromStatus     = null,
            ToStatus       = "Draft",
            Action         = "Generate",
            ActorUserId    = userId,
            CreatedAt      = DateTime.UtcNow
        });

        await _db.SaveChangesAsync(ct);

        return await GetAsync(tenantId, bt.Id, ct)
               ?? throw new InvalidOperationException("Bill Transfer not found after creation.");
    }

    // ── L1 Approve ───────────────────────────────────────────────────────────
    public async Task<BillTransferActionResultDto?> L1ApproveAsync(
        Guid tenantId, Guid id, Guid userId, string? remarks, long? expectedVersion,
        string? overrideReasonCode, string? overrideReasonText, CancellationToken ct)
    {
        var bt = await FetchAsync(tenantId, id, ct);
        if (bt is null) return null;

        GuardVersion(bt, expectedVersion);

        if (bt.Status is not ("Draft" or "Resubmitted"))
            throw new InvalidOperationException($"Cannot L1-approve a Bill Transfer in '{bt.Status}' state.");

        // ── SOD check: L1 approver must not be the maker ────────────────────
        var sodDecision = await EnforceSodAsync(
            tenantId, bt, userId,
            makerViolation: bt.CreatedByUserId.HasValue && bt.CreatedByUserId.Value == userId,
            ruleId: "SOD-L1-MAKER",
            ruleMessage: "L1 approver cannot be the same person who created this Bill Transfer.",
            overrideReasonCode, overrideReasonText, ct);

        var fromStatus = bt.Status;
        bt.Status          = "L1Approved";
        bt.L1ApprovedBy    = userId;
        bt.L1ApprovedAt    = DateTime.UtcNow;
        bt.L2DueAt         = DateTime.UtcNow.AddHours(48);   // SLA for L2 starts now
        bt.L1Remarks       = remarks;
        bt.UpdatedAt       = DateTime.UtcNow;
        bt.UpdatedByUserId = userId;

        AppendEvent(bt, fromStatus, "L1Approved", "L1Approve", userId, remarks,
            overrideApplied: sodDecision.OverrideApplied,
            reasonCode: overrideReasonCode);
        await _db.SaveChangesAsync(ct);
        return new BillTransferActionResultDto(ToDto(bt), sodDecision);
    }

    // ── L1 Reject ────────────────────────────────────────────────────────────
    public async Task<BillTransferDto?> L1RejectAsync(Guid tenantId, Guid id, Guid userId, string? remarks, long? expectedVersion, CancellationToken ct)
    {
        var bt = await FetchAsync(tenantId, id, ct);
        if (bt is null) return null;

        GuardVersion(bt, expectedVersion);

        if (bt.Status is not ("Draft" or "Resubmitted"))
            throw new InvalidOperationException($"Cannot L1-reject a Bill Transfer in '{bt.Status}' state.");

        var fromStatus = bt.Status;
        bt.Status          = "L1Rejected";
        bt.L1Remarks       = remarks;
        bt.UpdatedAt       = DateTime.UtcNow;
        bt.UpdatedByUserId = userId;

        AppendEvent(bt, fromStatus, "L1Rejected", "L1Reject", userId, remarks);
        await _db.SaveChangesAsync(ct);
        return ToDto(bt);
    }

    // ── L2 Approve ───────────────────────────────────────────────────────────
    public async Task<BillTransferActionResultDto?> L2ApproveAsync(
        Guid tenantId, Guid id, Guid userId, string? remarks, long? expectedVersion,
        string? overrideReasonCode, string? overrideReasonText, CancellationToken ct)
    {
        var bt = await FetchAsync(tenantId, id, ct);
        if (bt is null) return null;

        GuardVersion(bt, expectedVersion);

        if (bt.Status != "L1Approved")
            throw new InvalidOperationException($"Cannot L2-approve a Bill Transfer in '{bt.Status}' state. Expected L1Approved.");

        // ── SOD check: L2 approver must not be maker or L1 approver ────────
        bool l2Violation = (bt.CreatedByUserId.HasValue && bt.CreatedByUserId.Value == userId)
                        || (bt.L1ApprovedBy.HasValue   && bt.L1ApprovedBy.Value   == userId);
        var sodDecision = await EnforceSodAsync(
            tenantId, bt, userId,
            makerViolation: l2Violation,
            ruleId: "SOD-L2-MAKER-OR-L1",
            ruleMessage: "L2 approver cannot be the maker or the L1 approver of this Bill Transfer.",
            overrideReasonCode, overrideReasonText, ct);

        var fromStatus = bt.Status;
        bt.Status          = "FullyApproved";
        bt.L2ApprovedBy    = userId;
        bt.L2ApprovedAt    = DateTime.UtcNow;
        bt.L2Remarks       = remarks;
        bt.UpdatedAt       = DateTime.UtcNow;
        bt.UpdatedByUserId = userId;

        AppendEvent(bt, fromStatus, "FullyApproved", "L2Approve", userId, remarks,
            overrideApplied: sodDecision.OverrideApplied,
            reasonCode: overrideReasonCode);
        await _db.SaveChangesAsync(ct);

        // Automatically generate the linked settlement
        await _settlements.CreateFromBillTransferAsync(tenantId, bt.Id, userId, ct);

        var updated = await GetAsync(tenantId, id, ct);
        return updated is null ? null : new BillTransferActionResultDto(updated, sodDecision);
    }

    // ── L2 Reject ────────────────────────────────────────────────────────────
    public async Task<BillTransferDto?> L2RejectAsync(Guid tenantId, Guid id, Guid userId, string? remarks, long? expectedVersion, CancellationToken ct)
    {
        var bt = await FetchAsync(tenantId, id, ct);
        if (bt is null) return null;

        GuardVersion(bt, expectedVersion);

        if (bt.Status != "L1Approved")
            throw new InvalidOperationException($"Cannot L2-reject a Bill Transfer in '{bt.Status}' state. Expected L1Approved.");

        var fromStatus = bt.Status;
        bt.Status          = "L2Rejected";
        bt.L2Remarks       = remarks;
        bt.UpdatedAt       = DateTime.UtcNow;
        bt.UpdatedByUserId = userId;

        AppendEvent(bt, fromStatus, "L2Rejected", "L2Reject", userId, remarks);
        await _db.SaveChangesAsync(ct);
        return ToDto(bt);
    }

    // ── Resubmit ─────────────────────────────────────────────────────────────
    public async Task<BillTransferDto?> ResubmitAsync(Guid tenantId, Guid id, Guid userId, string? remarks, long? expectedVersion, CancellationToken ct)
    {
        var bt = await FetchAsync(tenantId, id, ct);
        if (bt is null) return null;

        GuardVersion(bt, expectedVersion);

        if (bt.Status is not ("L1Rejected" or "L2Rejected"))
            throw new InvalidOperationException($"Cannot resubmit a Bill Transfer in '{bt.Status}' state.");

        var fromStatus = bt.Status;
        bt.Status          = "Resubmitted";
        bt.Remarks         = remarks;
        bt.UpdatedAt       = DateTime.UtcNow;
        bt.UpdatedByUserId = userId;

        AppendEvent(bt, fromStatus, "Resubmitted", "Resubmit", userId, remarks);
        await _db.SaveChangesAsync(ct);
        return ToDto(bt);
    }

    // ── Cancel ───────────────────────────────────────────────────────────────
    public async Task<BillTransferDto?> CancelAsync(Guid tenantId, Guid id, Guid userId, long? expectedVersion, CancellationToken ct)
    {
        var bt = await FetchAsync(tenantId, id, ct);
        if (bt is null) return null;

        GuardVersion(bt, expectedVersion);

        if (bt.Status is "FullyApproved" or "Cancelled")
            throw new InvalidOperationException($"Cannot cancel a Bill Transfer in '{bt.Status}' state.");

        var fromStatus = bt.Status;
        bt.Status          = "Cancelled";
        bt.DeletedAt       = DateTime.UtcNow;
        bt.UpdatedAt       = DateTime.UtcNow;
        bt.UpdatedByUserId = userId;

        AppendEvent(bt, fromStatus, "Cancelled", "Cancel", userId, null);
        await _db.SaveChangesAsync(ct);
        return ToDto(bt);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    private Task<BillTransfer?> FetchAsync(Guid tenantId, Guid id, CancellationToken ct) =>
        _db.BillTransfers
            .Include(b => b.Vendor)
            .Include(b => b.Grn).ThenInclude(g => g!.GrnItems).ThenInclude(gi => gi.PurchaseItem)
            .Include(b => b.Invoice).ThenInclude(i => i!.Items)
            .FirstOrDefaultAsync(b => b.Id == id && b.TenantId == tenantId && b.DeletedAt == null, ct);

    /// <summary>Throws VersionConflictException if the client's version doesn't match the DB row.</summary>
    private static void GuardVersion(BillTransfer bt, long? expectedVersion)
    {
        if (expectedVersion.HasValue && bt.VersionNo != expectedVersion.Value)
            throw new VersionConflictException(bt.Id, expectedVersion.Value, bt.VersionNo);
    }

    /// <summary>Appends an event log entry to the current EF change tracker (saved in the same SaveChangesAsync call).</summary>
    private void AppendEvent(BillTransfer bt, string fromStatus, string toStatus, string action, Guid actorUserId,
        string? reasonText, bool overrideApplied = false, string? reasonCode = null)
    {
        _db.BillTransferEventLogs.Add(new BillTransferEventLog
        {
            EventId         = Guid.NewGuid(),
            TenantId        = bt.TenantId,
            BillTransferId  = bt.Id,
            FromStatus      = fromStatus,
            ToStatus        = toStatus,
            Action          = action,
            ActorUserId     = actorUserId,
            ReasonCode      = reasonCode,
            ReasonText      = reasonText,
            OverrideApplied = overrideApplied,
            CreatedAt       = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Enforces SOD rules. If violated and override is allowed (low-value flex), records the override.
    /// Throws SodViolationException if violation cannot be overridden.
    /// </summary>
    private async Task<SodDecisionDto> EnforceSodAsync(
        Guid tenantId, BillTransfer bt, Guid userId,
        bool makerViolation, string ruleId, string ruleMessage,
        string? overrideReasonCode, string? overrideReasonText,
        CancellationToken ct)
    {
        var rules = new List<string>();

        if (!makerViolation)
        {
            rules.Add($"{ruleId}: PASS (no conflict)");
            return new SodDecisionDto(StrictApplied: true, OverrideApplied: false, ThresholdUsed: 0, RuleEvaluations: rules);
        }

        rules.Add($"{ruleId}: VIOLATION – {ruleMessage}");

        var policy = await _policy.GetPolicyAsync(tenantId, ct);

        // Use live-computed net so threshold comparison is accurate even for stale stored records.
        var (liveTax, liveCgst, liveSgst, liveIgst) = ComputeItemTotals(
            bt.Grn?.GrnItems,
            bt.Invoice?.Items?.Where(pi => pi.DeletedAt == null).ToList());
        decimal liveNet = liveTax + liveCgst + liveSgst + liveIgst;
        decimal effectiveAmount = liveNet > 0 ? liveNet : bt.InvoiceTotalAmount;

        bool isLowValue      = effectiveAmount <= policy.LowValueOverrideThreshold;
        bool overrideAllowed = policy.AllowLowValueFlexOverride && isLowValue;

        if (!overrideAllowed)
            throw new SodViolationException(ruleId, ruleMessage);

        if (policy.RequireOverrideReason && string.IsNullOrWhiteSpace(overrideReasonText))
            throw new SodViolationException(
                ruleId,
                $"An override reason is required for low-value SOD flex override (threshold: {policy.LowValueOverrideThreshold:C}).");

        rules.Add($"LOW_VALUE_OVERRIDE: APPLIED – invoice {effectiveAmount:C} ≤ threshold {policy.LowValueOverrideThreshold:C}");

        return new SodDecisionDto(
            StrictApplied:   false,
            OverrideApplied: true,
            ThresholdUsed:   policy.LowValueOverrideThreshold,
            RuleEvaluations: rules);
    }

    /// <summary>Compute taxable base and GST components from live GRN items (preferred) or invoice items.</summary>
    private static (decimal taxable, decimal cgst, decimal sgst, decimal igst)
        ComputeItemTotals(IEnumerable<GrnItem>? grnItems, IList<PurchaseItem>? invItems)
    {
        var grnList = grnItems?.ToList();
        if (grnList?.Count > 0)
        {
            decimal t = 0, c = 0, s = 0, g = 0;
            foreach (var gi in grnList)
            {
                var pi   = gi.PurchaseItem;
                decimal rate = pi?.PurchaseRate ?? 0;
                decimal qty  = gi.AcceptedQuantity;
                decimal base_ = rate * qty * (1 - (pi?.DiscountPercent ?? 0) / 100m);
                t += base_;
                c += base_ * (pi?.CgstPercent ?? 0) / 100m;
                s += base_ * (pi?.SgstPercent ?? 0) / 100m;
                g += base_ * (pi?.IgstPercent ?? 0) / 100m;
            }
            return (t, c, s, g);
        }
        if (invItems?.Count > 0)
        {
            decimal t = 0, c = 0, s = 0, g = 0;
            foreach (var pi in invItems)
            {
                decimal base_ = pi.PurchaseRate * pi.OrderedQuantity * (1 - pi.DiscountPercent / 100m);
                t += base_;
                c += base_ * pi.CgstPercent / 100m;
                s += base_ * pi.SgstPercent / 100m;
                g += base_ * pi.IgstPercent / 100m;
            }
            return (t, c, s, g);
        }
        return (0, 0, 0, 0);
    }

    private static BillTransferDto ToDto(BillTransfer b)
    {
        var (taxable, cgst, sgst, igst) = ComputeItemTotals(
            b.Grn?.GrnItems,
            b.Invoice?.Items?.Where(pi => pi.DeletedAt == null).ToList());
        decimal net = taxable + cgst + sgst + igst;

        return new BillTransferDto(
            Id:                 b.Id,
            TenantId:           b.TenantId,
            GrnId:              b.GrnId,
            InvoiceId:          b.InvoiceId,
            VendorId:           b.VendorId,
            VendorName:         b.Vendor?.Name,
            GrnNumber:          b.Grn?.GrnNumber,
            InvoiceNumber:      b.Invoice?.InvoiceNumber,
            InvoiceDate:        b.Invoice?.InvoiceDate,
            GrnDate:            b.Grn?.GrnDate,
            GrnTotalAmount:     net  > 0 ? net  : b.GrnTotalAmount,
            InvoiceTotalAmount: net  > 0 ? net  : b.InvoiceTotalAmount,
            CgstAmount:         net  > 0 ? cgst : b.CgstAmount,
            SgstAmount:         net  > 0 ? sgst : b.SgstAmount,
            IgstAmount:         net  > 0 ? igst : b.IgstAmount,
            TcsAmount:          b.TcsAmount,
            Status:             b.Status,
            L1ApprovedBy:       b.L1ApprovedBy,
            L1ApprovedAt:       b.L1ApprovedAt,
            L1Remarks:          b.L1Remarks,
            L2ApprovedBy:       b.L2ApprovedBy,
            L2ApprovedAt:       b.L2ApprovedAt,
            L2Remarks:          b.L2Remarks,
            Remarks:            b.Remarks,
            Attachments:        b.Attachments ?? [],
            CreatedAt:          b.CreatedAt,
            UpdatedAt:          b.UpdatedAt,
            VersionNo:          b.VersionNo,
            L1DueAt:            b.L1DueAt,
            L2DueAt:            b.L2DueAt,
            SlaState:           b.SlaState,
            CreatedByUserId:    b.CreatedByUserId?.ToString()
        );
    }

    private static BillTransferDto GrnToNotGeneratedDto(GrnHeader g)
    {
        var (taxable, cgst, sgst, igst) = ComputeItemTotals(
            g.GrnItems.Count > 0 ? g.GrnItems : null,
            g.Invoice?.Items?.Where(pi => pi.DeletedAt == null).ToList());
        decimal net = taxable + cgst + sgst + igst;

        return new BillTransferDto(
            Id:                 Guid.Empty,
            TenantId:           g.TenantId,
            GrnId:              g.Id,
            InvoiceId:          g.InvoiceId,
            VendorId:           g.Invoice?.VendorId ?? Guid.Empty,
            VendorName:         g.Invoice?.Vendor?.Name,
            GrnNumber:          g.GrnNumber,
            InvoiceNumber:      g.Invoice?.InvoiceNumber,
            InvoiceDate:        g.Invoice?.InvoiceDate,
            GrnDate:            g.GrnDate,
            GrnTotalAmount:     net > 0 ? net  : (g.Invoice?.NetAmount  ?? 0),
            InvoiceTotalAmount: net > 0 ? net  : (g.Invoice?.NetAmount  ?? 0),
            CgstAmount:         net > 0 ? cgst : (g.Invoice?.CgstAmount ?? 0),
            SgstAmount:         net > 0 ? sgst : (g.Invoice?.SgstAmount ?? 0),
            IgstAmount:         net > 0 ? igst : (g.Invoice?.IgstAmount ?? 0),
            TcsAmount:          g.Invoice?.TcsAmount ?? 0,
            Status:             "NotGenerated",
            L1ApprovedBy:       null,
            L1ApprovedAt:       null,
            L1Remarks:          null,
            L2ApprovedBy:       null,
            L2ApprovedAt:       null,
            L2Remarks:          null,
            Remarks:            null,
            Attachments:        [],
            CreatedAt:          g.GrnDate,
            UpdatedAt:          g.UpdatedAt,
            VersionNo:          0,
            L1DueAt:            null,
            L2DueAt:            null,
            SlaState:           "OnTrack",
            CreatedByUserId:    null
        );
    }

    // ── GetChangedSinceAsync ──────────────────────────────────────────────────
    public async Task<IReadOnlyList<BillTransferDto>> GetChangedSinceAsync(
        Guid tenantId, DateTime since, CancellationToken ct)
    {
        var items = await _db.BillTransfers
            .Include(b => b.Vendor)
            .Include(b => b.Grn).ThenInclude(g => g!.GrnItems).ThenInclude(gi => gi.PurchaseItem)
            .Include(b => b.Invoice).ThenInclude(i => i!.Items)
            .Where(b => b.TenantId == tenantId
                     && b.DeletedAt == null
                     && b.UpdatedAt > since)
            .OrderByDescending(b => b.UpdatedAt)
            .Take(200)
            .ToListAsync(ct);

        return items.Select(ToDto).ToList();
    }

    // ── GetComplianceReportAsync ──────────────────────────────────────────────
    public async Task<BtComplianceReportDto> GetComplianceReportAsync(Guid tenantId, CancellationToken ct)
    {
        var logs = await _db.BillTransferEventLogs
            .AsNoTracking()
            .Where(e => e.TenantId == tenantId
                     && (e.Action == "L1Approve" || e.Action == "L2Approve"))
            .ToListAsync(ct);

        int total    = await _db.BillTransfers.CountAsync(b => b.TenantId == tenantId && b.DeletedAt == null, ct);
        int overrides  = logs.Count(e => e.OverrideApplied);
        int strict     = logs.Count(e => !e.OverrideApplied);
        int slaBreached = await _db.BillTransfers.CountAsync(
            b => b.TenantId == tenantId && b.DeletedAt == null && b.SlaState == "Breached", ct);

        // Mean cycle time: from creation → L2 approval for FullyApproved BTs
        var approved = await _db.BillTransfers
            .AsNoTracking()
            .Where(b => b.TenantId == tenantId && b.Status == "FullyApproved"
                     && b.L2ApprovedAt.HasValue && b.DeletedAt == null)
            .Select(b => new { b.CreatedAt, b.L2ApprovedAt })
            .ToListAsync(ct);

        double meanHours = approved.Count > 0
            ? approved.Average(b => (b.L2ApprovedAt!.Value - b.CreatedAt).TotalHours)
            : 0;

        return new BtComplianceReportDto(
            TotalBillTransfers:       total,
            StrictApprovals:          strict,
            OverrideApprovals:        overrides,
            OverridePct:              (strict + overrides) > 0
                                          ? Math.Round(overrides * 100.0 / (strict + overrides), 1)
                                          : 0,
            SlaBreached:              slaBreached,
            MeanApprovalCycleHours:   Math.Round(meanHours, 1),
            GeneratedAt:              DateTime.UtcNow
        );
    }
}
