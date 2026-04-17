using InventoryApi.Data;
using InventoryApi.Models.DTOs;
using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Services;

public interface IRfqService
{
    Task<RfqHeader> CreateAsync(Guid tenantId, Guid userId, CreateRfqRequest req, CancellationToken ct);
    Task<PagedResult<RfqHeader>> ListAsync(Guid tenantId, Guid? branchId, string? status, int page, int pageSize, CancellationToken ct);
    Task<RfqHeader?> GetAsync(Guid tenantId, Guid rfqId, CancellationToken ct);
    Task<RfqHeader> PublishAsync(Guid tenantId, Guid userId, Guid rfqId, CancellationToken ct);
    Task<RfqHeader> CloseResponseWindowAsync(Guid tenantId, Guid userId, Guid rfqId, CancellationToken ct);
    Task<RfqHeader> StartEvaluationAsync(Guid tenantId, Guid userId, Guid rfqId, CancellationToken ct);
    Task<RfqHeader> AwardAsync(Guid tenantId, Guid userId, Guid rfqId, Guid vendorId, CancellationToken ct);
    Task<RfqHeader> CloseAsync(Guid tenantId, Guid userId, Guid rfqId, CancellationToken ct);
    Task<RfqHeader> CancelAsync(Guid tenantId, Guid userId, Guid rfqId, string reason, CancellationToken ct);
    Task<VendorQuote> SubmitQuoteAsync(Guid tenantId, Guid userId, Guid rfqId, SubmitQuoteRequest req, CancellationToken ct);
    Task<List<VendorQuote>> GetQuotesAsync(Guid tenantId, Guid rfqId, CancellationToken ct);
    Task<VendorQuote> RequestClarificationAsync(Guid tenantId, Guid userId, Guid rfqId, Guid quoteId, string notes, CancellationToken ct);
    Task<VendorQuote> RankQuotesAsync(Guid tenantId, Guid userId, Guid rfqId, List<RankQuoteEntry> rankings, CancellationToken ct);
    Task<VendorQuote> DisqualifyQuoteAsync(Guid tenantId, Guid userId, Guid rfqId, Guid quoteId, string reason, CancellationToken ct);
    Task<RfqHeader> RequestNegotiationAsync(Guid tenantId, Guid userId, Guid rfqId, string reason, CancellationToken ct);
    Task<RfqHeader> ResolveNegotiationAsync(Guid tenantId, Guid userId, Guid rfqId, string notes, CancellationToken ct);
    Task<RfqHeader> SubmitForApprovalAsync(Guid tenantId, Guid userId, Guid rfqId, Guid proposedVendorId, CancellationToken ct);
    Task<RfqHeader> RejectFromApprovalAsync(Guid tenantId, Guid userId, Guid rfqId, string reason, CancellationToken ct);
    Task<List<ProcurementTransitionLog>> GetHistoryAsync(Guid tenantId, Guid rfqId, CancellationToken ct);
}

public sealed class RfqService : IRfqService
{
    private readonly InventoryDbContext _db;
    private readonly IVendorAcknowledgmentService _acks;

    public RfqService(InventoryDbContext db, IVendorAcknowledgmentService acks)
    {
        _db   = db;
        _acks = acks;
    }

    private static DateTime? ToUtc(DateTime? dt) =>
        dt.HasValue ? DateTime.SpecifyKind(dt.Value, DateTimeKind.Utc) : null;

    public async Task<RfqHeader> CreateAsync(Guid tenantId, Guid userId, CreateRfqRequest req, CancellationToken ct)
    {
        var count = await _db.RfqHeaders.CountAsync(r => r.TenantId == tenantId, ct);
        var rfqNumber = $"RFQ/{DateTime.UtcNow:yyyyMMdd}/{count + 1:D4}";

        var rfq = new RfqHeader
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            BranchId = req.BranchId,
            RequisitionId = req.RequisitionId,
            RfqNumber = rfqNumber,
            Title = req.Title,
            RfqStatus = "Draft",
            ResponseDeadline = ToUtc(req.ResponseDeadline),
            Notes = req.Notes,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedByUserId = userId,
            UpdatedByUserId = userId,
        };
        _db.RfqHeaders.Add(rfq);

        foreach (var line in req.Items)
        {
            _db.RfqItems.Add(new RfqItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                RfqId = rfq.Id,
                ItemId = line.ItemId,
                RequestedQty = line.RequestedQty,
                Unit = line.Unit,
                Specifications = line.Specifications,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedByUserId = userId,
                UpdatedByUserId = userId,
            });
        }

        foreach (var vendorId in req.VendorIds)
        {
            _db.RfqVendorInvites.Add(new RfqVendorInvite
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                RfqId = rfq.Id,
                VendorId = vendorId,
                InviteStatus = "Invited",
                InvitedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedByUserId = userId,
                UpdatedByUserId = userId,
            });
        }

        await _db.SaveChangesAsync(ct);
        await LogTransitionAsync(tenantId, "RfqHeader", rfq.Id, "", "Draft", null, userId, ct);
        return rfq;
    }

    public async Task<PagedResult<RfqHeader>> ListAsync(Guid tenantId, Guid? branchId, string? status, int page, int pageSize, CancellationToken ct)
    {
        var query = _db.RfqHeaders
            .Include(r => r.AwardedToVendor)
            .Where(r => r.TenantId == tenantId && r.DeletedAt == null);

        if (branchId.HasValue) query = query.Where(r => r.BranchId == branchId);
        if (!string.IsNullOrEmpty(status)) query = query.Where(r => r.RfqStatus == status);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<RfqHeader>(items, total, page, pageSize);
    }

    public async Task<RfqHeader?> GetAsync(Guid tenantId, Guid rfqId, CancellationToken ct)
        => await _db.RfqHeaders
            .Include(r => r.Items).ThenInclude(i => i.Item)
            .Include(r => r.VendorInvites).ThenInclude(v => v.Vendor)
            .Include(r => r.AwardedToVendor)
            .Include(r => r.VendorQuotes)
            .FirstOrDefaultAsync(r => r.TenantId == tenantId && r.Id == rfqId && r.DeletedAt == null, ct);

    public async Task<RfqHeader> PublishAsync(Guid tenantId, Guid userId, Guid rfqId, CancellationToken ct)
        => await TransitionAsync(tenantId, userId, rfqId, "Draft", "Published", null, ct, rfq =>
        {
            rfq.PublishedAt = DateTime.UtcNow;
        });

    public async Task<RfqHeader> CloseResponseWindowAsync(Guid tenantId, Guid userId, Guid rfqId, CancellationToken ct)
        => await TransitionAsync(tenantId, userId, rfqId, "Published", "ResponseWindowClosed", null, ct);

    public async Task<RfqHeader> StartEvaluationAsync(Guid tenantId, Guid userId, Guid rfqId, CancellationToken ct)
        => await TransitionAsync(tenantId, userId, rfqId, "ResponseWindowClosed", "EvaluationInProgress", null, ct);

    public async Task<RfqHeader> AwardAsync(Guid tenantId, Guid userId, Guid rfqId, Guid vendorId, CancellationToken ct)
    {
        var rfq = await TransitionAsync(tenantId, userId, rfqId, "PendingFinalApproval", "Awarded", null, ct, r =>
        {
            r.AwardedToVendorId = vendorId;
            r.AwardedAt = DateTime.UtcNow;
        });

        // Mark Won/Lost on vendor quotes
        var quotes = await _db.VendorQuotes
            .Where(q => q.TenantId == tenantId && q.RfqId == rfqId && q.DeletedAt == null)
            .ToListAsync(ct);
        foreach (var q in quotes)
        {
            q.QuoteStatus = q.VendorId == vendorId ? "Won" : "Lost";
            q.UpdatedAt = DateTime.UtcNow;
            q.UpdatedByUserId = userId;
        }
        await _db.SaveChangesAsync(ct);

        // Auto-create pending acknowledgment (72-hour default expiry)
        await _acks.CreatePendingAsync(tenantId, userId, vendorId, "RfqAward", rfqId, DateTime.UtcNow.AddHours(72), ct);

        return rfq;
    }

    public async Task<RfqHeader> CancelAsync(Guid tenantId, Guid userId, Guid rfqId, string reason, CancellationToken ct)
        => await TransitionAsync(tenantId, userId, rfqId, null, "Cancelled", reason, ct, rfq =>
        {
            rfq.CancellationReason = reason;
        });

    public async Task<RfqHeader> CloseAsync(Guid tenantId, Guid userId, Guid rfqId, CancellationToken ct)
        => await TransitionAsync(tenantId, userId, rfqId, "Awarded", "Closed", null, ct);

    public async Task<VendorQuote> SubmitQuoteAsync(Guid tenantId, Guid userId, Guid rfqId, SubmitQuoteRequest req, CancellationToken ct)
    {
        var rfq = await _db.RfqHeaders.FirstOrDefaultAsync(r => r.TenantId == tenantId && r.Id == rfqId && r.DeletedAt == null, ct)
            ?? throw new KeyNotFoundException("RFQ not found.");

        if (rfq.RfqStatus != "Published")
            throw new InvalidOperationException("Quotes can only be submitted for Published RFQs.");

        var count = await _db.VendorQuotes.CountAsync(q => q.TenantId == tenantId, ct);
        var quoteNumber = $"QUO/{DateTime.UtcNow:yyyyMMdd}/{count + 1:D4}";

        var quote = new VendorQuote
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            RfqId = rfqId,
            VendorId = req.VendorId,
            QuoteNumber = quoteNumber,
            QuoteStatus = "Submitted",
            TotalAmount = req.Items.Sum(i => i.TotalAmount),
            QuoteDate = DateTime.UtcNow,
            ValidUntil = req.ValidUntil,
            VendorNotes = req.VendorNotes,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedByUserId = userId,
            UpdatedByUserId = userId,
        };
        _db.VendorQuotes.Add(quote);

        foreach (var line in req.Items)
        {
            _db.VendorQuoteItems.Add(new VendorQuoteItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                QuoteId = quote.Id,
                ItemId = line.ItemId,
                QuotedQty = line.QuotedQty,
                UnitPrice = line.UnitPrice,
                GstPercent = line.GstPercent,
                TotalAmount = line.TotalAmount,
                Remarks = line.Remarks,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedByUserId = userId,
                UpdatedByUserId = userId,
            });
        }

        // Update invite status
        var invite = await _db.RfqVendorInvites
            .FirstOrDefaultAsync(i => i.RfqId == rfqId && i.VendorId == req.VendorId && i.DeletedAt == null, ct);
        if (invite != null)
        {
            invite.InviteStatus = "QuoteSubmitted";
            invite.RespondedAt = DateTime.UtcNow;
            invite.UpdatedAt = DateTime.UtcNow;
            invite.UpdatedByUserId = userId;
        }

        await _db.SaveChangesAsync(ct);
        return quote;
    }

    public async Task<List<VendorQuote>> GetQuotesAsync(Guid tenantId, Guid rfqId, CancellationToken ct)
        => await _db.VendorQuotes
            .Include(q => q.Vendor)
            .Include(q => q.Items).ThenInclude(i => i.Item)
            .Where(q => q.TenantId == tenantId && q.RfqId == rfqId && q.DeletedAt == null)
            .OrderBy(q => q.TotalAmount)
            .ToListAsync(ct);

    public async Task<VendorQuote> RequestClarificationAsync(
        Guid tenantId, Guid userId, Guid rfqId, Guid quoteId, string notes, CancellationToken ct)
    {
        var quote = await _db.VendorQuotes
            .FirstOrDefaultAsync(q => q.TenantId == tenantId && q.RfqId == rfqId && q.Id == quoteId && q.DeletedAt == null, ct)
            ?? throw new KeyNotFoundException("Quote not found.");

        if (quote.QuoteStatus is not ("Submitted" or "UnderReview" or "Revised"))
            throw new InvalidOperationException($"Cannot request clarification from status '{quote.QuoteStatus}'.");

        quote.QuoteStatus = "ClarificationRequested";
        quote.ClarificationNotes = notes;
        quote.ClarificationRequestedAt = DateTime.UtcNow;
        quote.UpdatedAt = DateTime.UtcNow;
        quote.UpdatedByUserId = userId;
        await _db.SaveChangesAsync(ct);
        return quote;
    }

    public async Task<VendorQuote> RankQuotesAsync(
        Guid tenantId, Guid userId, Guid rfqId, List<RankQuoteEntry> rankings, CancellationToken ct)
    {
        var quoteIds = rankings.Select(r => r.QuoteId).ToList();
        var quotes = await _db.VendorQuotes
            .Where(q => q.TenantId == tenantId && q.RfqId == rfqId && quoteIds.Contains(q.Id) && q.DeletedAt == null)
            .ToListAsync(ct);

        foreach (var entry in rankings)
        {
            var quote = quotes.FirstOrDefault(q => q.Id == entry.QuoteId)
                ?? throw new KeyNotFoundException($"Quote {entry.QuoteId} not found.");

            quote.RankPosition = entry.RankPosition;
            quote.QuoteStatus = "Ranked";
            if (entry.Score.HasValue) quote.EvaluationScore = entry.Score.Value;
            if (entry.Notes != null)  quote.EvaluationNotes = entry.Notes;
            quote.UpdatedAt = DateTime.UtcNow;
            quote.UpdatedByUserId = userId;
        }

        await _db.SaveChangesAsync(ct);
        return quotes.OrderBy(q => q.RankPosition).First();
    }

    public async Task<VendorQuote> DisqualifyQuoteAsync(
        Guid tenantId, Guid userId, Guid rfqId, Guid quoteId, string reason, CancellationToken ct)
    {
        var quote = await _db.VendorQuotes
            .FirstOrDefaultAsync(q => q.TenantId == tenantId && q.RfqId == rfqId && q.Id == quoteId && q.DeletedAt == null, ct)
            ?? throw new KeyNotFoundException("Quote not found.");

        quote.QuoteStatus = "Disqualified";
        quote.EvaluationNotes = reason;
        quote.UpdatedAt = DateTime.UtcNow;
        quote.UpdatedByUserId = userId;
        await _db.SaveChangesAsync(ct);
        return quote;
    }

    public async Task<RfqHeader> RequestNegotiationAsync(Guid tenantId, Guid userId, Guid rfqId, string reason, CancellationToken ct)
        => await TransitionAsync(tenantId, userId, rfqId, "EvaluationInProgress", "NegotiationRequired", reason, ct, rfq =>
        {
            rfq.Notes = (rfq.Notes ?? "") + $"\n[Negotiation {DateTime.UtcNow:g}]: {reason}";
        });

    public async Task<RfqHeader> ResolveNegotiationAsync(Guid tenantId, Guid userId, Guid rfqId, string notes, CancellationToken ct)
        => await TransitionAsync(tenantId, userId, rfqId, "NegotiationRequired", "EvaluationInProgress", notes, ct, rfq =>
        {
            rfq.Notes = (rfq.Notes ?? "") + $"\n[Resolved {DateTime.UtcNow:g}]: {notes}";
        });

    public async Task<RfqHeader> SubmitForApprovalAsync(Guid tenantId, Guid userId, Guid rfqId, Guid proposedVendorId, CancellationToken ct)
        => await TransitionAsync(tenantId, userId, rfqId, "EvaluationInProgress", "PendingFinalApproval", null, ct, rfq =>
        {
            rfq.AwardedToVendorId = proposedVendorId;
        });

    public async Task<RfqHeader> RejectFromApprovalAsync(Guid tenantId, Guid userId, Guid rfqId, string reason, CancellationToken ct)
        => await TransitionAsync(tenantId, userId, rfqId, "PendingFinalApproval", "EvaluationInProgress", reason, ct, rfq =>
        {
            rfq.AwardedToVendorId = null;
            rfq.Notes = (rfq.Notes ?? "") + $"\n[Rejected {DateTime.UtcNow:g}]: {reason}";
        });

    public async Task<List<ProcurementTransitionLog>> GetHistoryAsync(Guid tenantId, Guid rfqId, CancellationToken ct)
        => await _db.ProcurementTransitionLogs
            .Where(l => l.TenantId == tenantId && l.EntityType == "RfqHeader" && l.EntityId == rfqId)
            .OrderBy(l => l.TransitionedAt)
            .ToListAsync(ct);

    // ── Helpers ───────────────────────────────────────────────────────────────

    private async Task<RfqHeader> TransitionAsync(
        Guid tenantId, Guid userId, Guid rfqId,
        string? expectedFromStatus, string toStatus, string? reason,
        CancellationToken ct,
        Action<RfqHeader>? mutate = null)
    {
        var rfq = await _db.RfqHeaders
            .FirstOrDefaultAsync(r => r.TenantId == tenantId && r.Id == rfqId && r.DeletedAt == null, ct)
            ?? throw new KeyNotFoundException("RFQ not found.");

        if (expectedFromStatus != null && rfq.RfqStatus != expectedFromStatus)
            throw new InvalidOperationException($"Expected status '{expectedFromStatus}', found '{rfq.RfqStatus}'.");

        var from = rfq.RfqStatus;
        rfq.RfqStatus = toStatus;
        rfq.UpdatedAt = DateTime.UtcNow;
        rfq.UpdatedByUserId = userId;
        mutate?.Invoke(rfq);

        await _db.SaveChangesAsync(ct);
        await LogTransitionAsync(tenantId, "RfqHeader", rfqId, from, toStatus, reason, userId, ct);
        return rfq;
    }

    private async Task LogTransitionAsync(Guid tenantId, string entityType, Guid entityId, string from, string to, string? reason, Guid userId, CancellationToken ct)
    {
        _db.ProcurementTransitionLogs.Add(new ProcurementTransitionLog
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            EntityType = entityType,
            EntityId = entityId,
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
}
