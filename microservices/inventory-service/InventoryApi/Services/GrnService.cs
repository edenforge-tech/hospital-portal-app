using InventoryApi.Data;
using InventoryApi.Models.DTOs;
using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Services;

public interface IGrnService
{
    Task<PagedResult<GrnHeaderDto>> ListGrnsAsync(Guid tenantId, string? status, int page, int pageSize, bool includeUngenerated, CancellationToken ct);
    Task<GrnHeaderDto> CreateGrnAsync(Guid tenantId, Guid userId, CreateGrnRequest req, CancellationToken ct);
    Task<GrnHeaderDto?> GetGrnAsync(Guid tenantId, Guid grnId, CancellationToken ct);
    Task<GrnHeaderDto?> PrimaryApproveAsync(Guid tenantId, Guid grnId, Guid userId, string? remarks, CancellationToken ct);
    Task<GrnHeaderDto?> FinalApproveAsync(Guid tenantId, Guid grnId, Guid userId, string? remarks, CancellationToken ct);
    Task<GrnHeaderDto?> RejectAsync(Guid tenantId, Guid grnId, Guid userId, string? remarks, CancellationToken ct);
    Task<GrnHeaderDto?> CancelAsync(Guid tenantId, Guid grnId, Guid userId, CancellationToken ct);
    Task<GrnHeaderDto> GenerateGrnFromInvoiceAsync(Guid tenantId, Guid invoiceId, Guid userId, DateTime grnDate, string? remarks, CancellationToken ct);
}

public sealed class GrnService : IGrnService
{
    private readonly InventoryDbContext _db;
    private readonly IStockService _stock;
    private readonly IGrnPartialAcceptanceService _partial;

    public GrnService(InventoryDbContext db, IStockService stock, IGrnPartialAcceptanceService partial)
    {
        _db = db;
        _stock = stock;
        _partial = partial;
    }

    public async Task<GrnHeaderDto> CreateGrnAsync(Guid tenantId, Guid userId, CreateGrnRequest req, CancellationToken ct)
    {
        // 1. Validate invoice exists and is in PrimaryApproved state
        var invoice = await _db.PurchaseInvoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == req.InvoiceId && i.TenantId == tenantId && i.DeletedAt == null, ct)
            ?? throw new InvalidOperationException("Invoice not found.");

        if (invoice.ApprovalStatus != "PrimaryApproved")
            throw new InvalidOperationException($"Cannot create GRN for invoice in '{invoice.ApprovalStatus}' state. Expected PrimaryApproved.");

        // 2. Generate sequential GRN number
        var financialYear = GetFinancialYear(req.GrnDate);
        var sequence     = await NextGrnSequenceAsync(tenantId, req.StoreId, financialYear, ct);
        var tenantCode   = await GetTenantCodeAsync(tenantId, ct);
        var grnNumber    = $"{tenantCode}/GRN/{financialYear}/{sequence:D6}";

        // 3. Create header
        var header = new GrnHeader
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            InvoiceId = req.InvoiceId,
            StoreId = req.StoreId,
            GrnNumber = grnNumber,
            GrnDate = req.GrnDate,
            GrnStatus = "Draft",
            Remarks = req.Remarks,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedByUserId = userId,
            UpdatedByUserId = userId
        };
        _db.GrnHeaders.Add(header);

        // 4. Create GRN items, update invoice received/rejected quantities
        foreach (var lineReq in req.Items)
        {
            var grnItem = new GrnItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                GrnHeaderId = header.Id,
                PurchaseItemId = lineReq.PurchaseItemId,
                ItemId = lineReq.ItemId,
                AcceptedQuantity = lineReq.AcceptedQuantity,
                RejectedQuantity = lineReq.RejectedQuantity,
                RejectionReason = lineReq.RejectionReason,
                Barcode = lineReq.Barcode,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedByUserId = userId
            };
            _db.GrnItems.Add(grnItem);

            // Update purchase item quantities
            var purchaseItem = invoice.Items.FirstOrDefault(i => i.Id == lineReq.PurchaseItemId);
            if (purchaseItem is not null)
            {
                purchaseItem.ReceivedQuantity = lineReq.AcceptedQuantity;
                purchaseItem.RejectedQuantity = lineReq.RejectedQuantity;
                purchaseItem.UpdatedAt = DateTime.UtcNow;
            }
        }

        // Update invoice GRN link
        invoice.GrnNumber = grnNumber;
        invoice.GrnDate = req.GrnDate;
        invoice.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return await GetGrnAsync(tenantId, header.Id, ct) ?? throw new InvalidOperationException("GRN not found after creation.");
    }

    public async Task<GrnHeaderDto?> GetGrnAsync(Guid tenantId, Guid grnId, CancellationToken ct)
    {
        var header = await _db.GrnHeaders
            .Include(h => h.GrnItems).ThenInclude(gi => gi.Item)
            .Include(h => h.GrnItems).ThenInclude(gi => gi.PurchaseItem)
            .Include(h => h.Invoice).ThenInclude(i => i!.Vendor)
            .Include(h => h.Invoice).ThenInclude(i => i!.Items).ThenInclude(pi => pi.Item)
            .Include(h => h.Store)
            .FirstOrDefaultAsync(h => h.Id == grnId && h.TenantId == tenantId && h.DeletedAt == null, ct);
        return header is null ? null : ToDto(header);
    }

    public async Task<GrnHeaderDto?> PrimaryApproveAsync(Guid tenantId, Guid grnId, Guid userId, string? remarks, CancellationToken ct)
    {
        var header = await GetEditableGrnAsync(tenantId, grnId, "Draft", ct);
        if (header is null) return null;

        header.GrnStatus = "PrimaryApproved";
        header.InspectedBy = userId;
        header.InspectedAt = DateTime.UtcNow;
        header.Remarks = remarks ?? header.Remarks;
        header.UpdatedAt = DateTime.UtcNow;
        header.UpdatedByUserId = userId;

        // Promote invoice to PrimaryApproved as well
        var invoice = await _db.PurchaseInvoices.FindAsync([header.InvoiceId], ct);
        if (invoice is not null)
        {
            invoice.ApprovalStatus = "PrimaryApproved";
            invoice.PrimaryApprovedBy = userId;
            invoice.PrimaryApprovedAt = DateTime.UtcNow;
        }

        AddApprovalLog(tenantId, header.InvoiceId, userId, "PrimaryApproval", remarks);
        await _db.SaveChangesAsync(ct);
        return await GetGrnAsync(tenantId, grnId, ct);
    }

    public async Task<GrnHeaderDto?> FinalApproveAsync(Guid tenantId, Guid grnId, Guid userId, string? remarks, CancellationToken ct)
    {
        var header = await _db.GrnHeaders
            .Include(h => h.GrnItems)
            .Include(h => h.Invoice).ThenInclude(i => i!.Items)
            .FirstOrDefaultAsync(h => h.Id == grnId && h.TenantId == tenantId && h.DeletedAt == null, ct);

        if (header is null || header.GrnStatus != "PrimaryApproved") return null;

        header.GrnStatus = "Approved";
        header.UpdatedAt = DateTime.UtcNow;
        header.UpdatedByUserId = userId;

        // Final approve the invoice
        if (header.Invoice is not null)
        {
            header.Invoice.ApprovalStatus = "Approved";
            header.Invoice.FinalApprovedBy = userId;
            header.Invoice.FinalApprovedAt = DateTime.UtcNow;
            header.Invoice.UpdatedAt = DateTime.UtcNow;
        }

        AddApprovalLog(tenantId, header.InvoiceId, userId, "FinalApproval", remarks);

        // Post stock movements
        await _stock.PostGrnStockAsync(tenantId, header, userId, ct);

        // Handle partial acceptance (create return for rejected items)
        if (header.GrnItems.Any(gi => gi.RejectedQuantity > 0))
            await _partial.CreateReturnForRejectedAsync(tenantId, header, userId, ct);

        await _db.SaveChangesAsync(ct);
        return await GetGrnAsync(tenantId, grnId, ct);
    }

    public async Task<GrnHeaderDto?> RejectAsync(Guid tenantId, Guid grnId, Guid userId, string? remarks, CancellationToken ct)
    {
        var header = await GetEditableGrnAsync(tenantId, grnId, null, ct);
        if (header is null) return null;

        header.GrnStatus = "Rejected";
        header.Remarks = remarks;
        header.UpdatedAt = DateTime.UtcNow;
        header.UpdatedByUserId = userId;

        var invoice = await _db.PurchaseInvoices.FindAsync([header.InvoiceId], ct);
        if (invoice is not null)
        {
            invoice.ApprovalStatus = "Rejected";
            invoice.UpdatedAt = DateTime.UtcNow;
        }

        AddApprovalLog(tenantId, header.InvoiceId, userId, "Rejection", remarks);
        await _db.SaveChangesAsync(ct);
        return await GetGrnAsync(tenantId, grnId, ct);
    }

    public async Task<PagedResult<GrnHeaderDto>> ListGrnsAsync(
        Guid tenantId, string? status, int page, int pageSize, bool includeUngenerated, CancellationToken ct)
    {
        // Base GRN query
        var grnQuery = _db.GrnHeaders
            .Include(h => h.GrnItems).ThenInclude(gi => gi.PurchaseItem)
            .Include(h => h.Invoice).ThenInclude(i => i!.Vendor)
            .Include(h => h.Store)
            .Where(h => h.TenantId == tenantId && h.DeletedAt == null);

        if (!string.IsNullOrEmpty(status) && status != "GRNNotGenerated")
            grnQuery = grnQuery.Where(h => h.GrnStatus == status);

        var grnDtos = await grnQuery
            .OrderByDescending(h => h.GrnDate)
            .ToListAsync(ct);

        var results = grnDtos.Select(ToDto).ToList();

        // A6: Append invoices that have no GRN yet
        if (includeUngenerated && string.IsNullOrEmpty(status) || status == "GRNNotGenerated")
        {
            var existingInvoiceIds = grnDtos.Select(h => h.InvoiceId).ToHashSet();
            var ungeneratedInvoices = await _db.PurchaseInvoices
                .Include(i => i.Vendor)
                .Include(i => i.Items).ThenInclude(pi => pi.Item)
                .Where(i => i.TenantId == tenantId
                         && i.DeletedAt == null
                         && !existingInvoiceIds.Contains(i.Id)
                         && (i.ApprovalStatus == "Draft" || i.ApprovalStatus == "PrimaryApproved" || i.ApprovalStatus == "Approved"))
                .OrderByDescending(i => i.InvoiceDate)
                .ToListAsync(ct);

            results.AddRange(ungeneratedInvoices.Select(InvoiceToGrnNotGeneratedDto));
        }

        var total = results.Count;
        var paged = results.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        return new PagedResult<GrnHeaderDto>(paged, total, page, pageSize);
    }

    public async Task<GrnHeaderDto?> CancelAsync(Guid tenantId, Guid grnId, Guid userId, CancellationToken ct)
    {
        var header = await _db.GrnHeaders.FirstOrDefaultAsync(
            h => h.Id == grnId && h.TenantId == tenantId && h.DeletedAt == null, ct);
        if (header is null) return null;

        header.GrnStatus = "Cancelled";
        header.UpdatedAt = DateTime.UtcNow;
        header.UpdatedByUserId = userId;
        await _db.SaveChangesAsync(ct);
        return await GetGrnAsync(tenantId, grnId, ct);
    }

    public async Task<GrnHeaderDto> GenerateGrnFromInvoiceAsync(
        Guid tenantId, Guid invoiceId, Guid userId, DateTime grnDate, string? remarks, CancellationToken ct)
    {
        // Idempotency: if a GRN already exists for this invoice, return it instead of
        // creating a duplicate (guards against double-clicks and retries).
        var existingGrn = await _db.GrnHeaders
            .FirstOrDefaultAsync(h => h.InvoiceId == invoiceId && h.TenantId == tenantId && h.DeletedAt == null, ct);
        if (existingGrn is not null)
            return await GetGrnAsync(tenantId, existingGrn.Id, ct)
                   ?? throw new InvalidOperationException("GRN not found.");

        var invoice = await _db.PurchaseInvoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == invoiceId && i.TenantId == tenantId && i.DeletedAt == null, ct)
            ?? throw new InvalidOperationException("Invoice not found.");

        // Generate sequential GRN number (no PrimaryApproved check — GRN is generated at Draft stage)
        var financialYear = GetFinancialYear(grnDate);
        var sequence      = await NextGrnSequenceAsync(tenantId, invoice.StoreId, financialYear, ct);
        var tenantCode    = await GetTenantCodeAsync(tenantId, ct);
        var grnNumber     = $"{tenantCode}/GRN/{financialYear}/{sequence:D6}";

        var header = new GrnHeader
        {
            Id              = Guid.NewGuid(),
            TenantId        = tenantId,
            InvoiceId       = invoiceId,
            StoreId         = invoice.StoreId,
            GrnNumber       = grnNumber,
            GrnDate         = grnDate,
            GrnStatus       = "Draft",
            Remarks         = remarks,
            CreatedAt       = DateTime.UtcNow,
            UpdatedAt       = DateTime.UtcNow,
            CreatedByUserId = userId,
            UpdatedByUserId = userId
        };
        _db.GrnHeaders.Add(header);

        foreach (var item in invoice.Items)
        {
            _db.GrnItems.Add(new GrnItem
            {
                Id               = Guid.NewGuid(),
                TenantId         = tenantId,
                GrnHeaderId      = header.Id,
                PurchaseItemId   = item.Id,
                ItemId           = item.ItemId,
                AcceptedQuantity = item.OrderedQuantity,
                RejectedQuantity = 0,
                Barcode          = item.Barcode,
                CreatedAt        = DateTime.UtcNow,
                UpdatedAt        = DateTime.UtcNow,
                CreatedByUserId  = userId
            });
            item.ReceivedQuantity = item.OrderedQuantity;
            item.UpdatedAt        = DateTime.UtcNow;
        }

        invoice.GrnNumber = grnNumber;
        invoice.GrnDate   = grnDate;
        invoice.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return await GetGrnAsync(tenantId, header.Id, ct)
               ?? throw new InvalidOperationException("GRN not found after creation.");
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private async Task<GrnHeader?> GetEditableGrnAsync(Guid tenantId, Guid grnId, string? requiredStatus, CancellationToken ct)
    {
        var header = await _db.GrnHeaders.FirstOrDefaultAsync(
            h => h.Id == grnId && h.TenantId == tenantId && h.DeletedAt == null, ct);

        if (header is null) return null;
        if (requiredStatus is not null && header.GrnStatus != requiredStatus) return null;
        return header;
    }

    private async Task<string> GetTenantCodeAsync(Guid tenantId, CancellationToken ct)
    {
        var conn = _db.Database.GetDbConnection();
        bool needsOpen = conn.State != System.Data.ConnectionState.Open;
        if (needsOpen) await conn.OpenAsync(ct);
        try
        {
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT tenant_code FROM tenant WHERE id = $1 LIMIT 1";
            var p = cmd.CreateParameter(); p.Value = tenantId; cmd.Parameters.Add(p);
            var result = await cmd.ExecuteScalarAsync(ct);
            return result is string s && !string.IsNullOrWhiteSpace(s)
                ? s.ToUpper()
                : tenantId.ToString("N")[..6].ToUpper();
        }
        finally
        {
            if (needsOpen) await conn.CloseAsync();
        }
    }

    private async Task<int> NextGrnSequenceAsync(Guid tenantId, Guid storeId, string fy, CancellationToken ct)
    {
        // Use raw SQL to call the atomic PostgreSQL function
        var conn = _db.Database.GetDbConnection();
        bool needsOpen = conn.State != System.Data.ConnectionState.Open;
        if (needsOpen) await conn.OpenAsync(ct);
        try
        {
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT inv_next_grn_sequence($1, $2, $3)";
            var p1 = cmd.CreateParameter(); p1.Value = tenantId; cmd.Parameters.Add(p1);
            var p2 = cmd.CreateParameter(); p2.Value = storeId;  cmd.Parameters.Add(p2);
            var p3 = cmd.CreateParameter(); p3.Value = fy;       cmd.Parameters.Add(p3);
            var result = await cmd.ExecuteScalarAsync(ct);
            return Convert.ToInt32(result);
        }
        finally
        {
            if (needsOpen) await conn.CloseAsync();
        }
    }

    private void AddApprovalLog(Guid tenantId, Guid invoiceId, Guid userId, string action, string? remarks)
    {
        _db.ApprovalLogs.Add(new ApprovalLog
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            InvoiceId = invoiceId,
            UserId = userId,
            Action = action,
            Remarks = remarks,
            ActionAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedByUserId = userId
        });
    }

    private static string GetFinancialYear(DateTime date)
    {
        int start = date.Month >= 4 ? date.Year : date.Year - 1;
        return $"{start}-{(start + 1) % 100:D2}";
    }

    private static GrnHeaderDto ToDto(GrnHeader h)
    {
        var inv   = h.Invoice;
        var items = h.GrnItems.Count > 0
            ? h.GrnItems.Select(ToItemDto).ToList()
            : h.Invoice?.Items
                  ?.Where(pi => pi.DeletedAt == null)
                  .Select(InvoicePurchaseItemToGrnItemDto)
                  .ToList() ?? [];

        // Derive totals from live item data — stored inv.NetAmount can be stale.
        decimal taxable = items.Sum(i => i.PurchaseCost);
        decimal gst     = items.Sum(i => i.CgstAmount + i.SgstAmount + i.IgstAmount);
        decimal total   = taxable + gst;

        return new GrnHeaderDto(
            Id:               h.Id,
            InvoiceId:        h.InvoiceId,
            InvoiceNumber:    inv?.InvoiceNumber ?? string.Empty,
            StoreId:          h.StoreId,
            GrnNumber:        h.GrnNumber,
            GrnDate:          h.GrnDate,
            GrnStatus:        h.GrnStatus,
            Remarks:          h.Remarks,
            Items:            items,
            VendorId:         inv?.VendorId ?? Guid.Empty,
            VendorName:       inv?.Vendor?.Name ?? string.Empty,
            InvoiceDate:      inv?.InvoiceDate ?? h.GrnDate,
            DueDate:          inv?.DueDate,
            NetAmount:        total > 0 ? total : (inv?.NetAmount ?? 0),
            TotalAmount:      total > 0 ? total : (inv?.NetAmount ?? 0),
            PurchaseCategory: inv?.PurchaseCategory,
            PaymentMode:      inv?.PaymentMode,
            StoreName:        h.Store?.StoreName,
            ApprovalStatus:   inv?.ApprovalStatus
        );
    }

    private static GrnItemDto ToItemDto(GrnItem gi)
    {
        var pi = gi.PurchaseItem;
        decimal cgst   = pi is null ? 0 : pi.CgstPercent;
        decimal sgst   = pi is null ? 0 : pi.SgstPercent;
        decimal igst   = pi is null ? 0 : pi.IgstPercent;
        decimal rate   = pi?.PurchaseRate ?? 0;
        decimal qty    = gi.AcceptedQuantity;
        decimal taxBase = rate * qty;
        return new GrnItemDto(
            Id:               gi.Id,
            PurchaseItemId:   gi.PurchaseItemId,
            ItemId:           gi.ItemId,
            ItemName:         gi.Item?.ItemName ?? pi?.Item?.ItemName ?? string.Empty,
            AcceptedQuantity: gi.AcceptedQuantity,
            RejectedQuantity: gi.RejectedQuantity,
            RejectionReason:  gi.RejectionReason,
            IsVerified:       gi.IsVerified,
            Barcode:          gi.Barcode,
            OrderedQuantity:  pi?.OrderedQuantity ?? gi.AcceptedQuantity,
            BatchNumber:      pi?.BatchNumber,
            ExpiryDate:       pi?.ExpiryDate,
            PurchaseRate:     rate,
            Mrp:              pi?.Mrp ?? 0,
            CgstPercent:      cgst,
            SgstPercent:      sgst,
            IgstPercent:      igst,
            CgstAmount:       taxBase * cgst / 100,
            SgstAmount:       taxBase * sgst / 100,
            IgstAmount:       taxBase * igst / 100,
            Packing:          0,
            FreeQuantity:     pi?.FreeQuantity ?? 0,
            PurchaseCost:     rate * qty * (1 - (pi?.DiscountPercent ?? 0) / 100)
        );
    }

    /// <summary>Maps an invoice with no GRN to a GrnHeaderDto with GrnStatus = GRNNotGenerated.</summary>
    private static GrnHeaderDto InvoiceToGrnNotGeneratedDto(PurchaseInvoice inv)
    {
        var items = inv.Items.Select(InvoicePurchaseItemToGrnItemDto).ToList();

        // Derive totals from live item data — stored inv.NetAmount can be stale.
        decimal taxable = items.Sum(i => i.PurchaseCost);
        decimal gst     = items.Sum(i => i.CgstAmount + i.SgstAmount + i.IgstAmount);
        decimal total   = taxable + gst;

        return new GrnHeaderDto(
            Id:               inv.Id,
            InvoiceId:        inv.Id,
            InvoiceNumber:    inv.InvoiceNumber,
            StoreId:          inv.StoreId,
            GrnNumber:        null,
            GrnDate:          inv.InvoiceDate,
            GrnStatus:        "GRNNotGenerated",
            Remarks:          null,
            Items:            items,
            VendorId:         inv.VendorId,
            VendorName:       inv.Vendor?.Name ?? string.Empty,
            InvoiceDate:      inv.InvoiceDate,
            DueDate:          inv.DueDate,
            NetAmount:        total > 0 ? total : inv.NetAmount,
            TotalAmount:      total > 0 ? total : inv.NetAmount,
            PurchaseCategory: inv.PurchaseCategory,
            PaymentMode:      inv.PaymentMode,
            ApprovalStatus:   inv.ApprovalStatus
        );
    }

    /// <summary>Maps a PurchaseItem (from an invoice without a GRN) to a GrnItemDto for display purposes.</summary>
    private static GrnItemDto InvoicePurchaseItemToGrnItemDto(PurchaseItem pi)
    {
        decimal cgst    = pi.CgstPercent;
        decimal sgst    = pi.SgstPercent;
        decimal igst    = pi.IgstPercent;
        decimal rate    = pi.PurchaseRate;
        decimal qty     = pi.OrderedQuantity;
        decimal taxBase = rate * qty * (1 - pi.DiscountPercent / 100);
        return new GrnItemDto(
            Id:               pi.Id,
            PurchaseItemId:   pi.Id,
            ItemId:           pi.ItemId,
            ItemName:         pi.Item?.ItemName ?? string.Empty,
            AcceptedQuantity: pi.ReceivedQuantity > 0 ? pi.ReceivedQuantity : pi.OrderedQuantity,
            RejectedQuantity: pi.RejectedQuantity,
            RejectionReason:  null,
            IsVerified:       false,
            Barcode:          pi.Barcode,
            OrderedQuantity:  pi.OrderedQuantity,
            BatchNumber:      pi.BatchNumber,
            ExpiryDate:       pi.ExpiryDate,
            PurchaseRate:     rate,
            Mrp:              pi.Mrp,
            CgstPercent:      cgst,
            SgstPercent:      sgst,
            IgstPercent:      igst,
            CgstAmount:       taxBase * cgst / 100,
            SgstAmount:       taxBase * sgst / 100,
            IgstAmount:       taxBase * igst / 100,
            Packing:          0,
            FreeQuantity:     pi.FreeQuantity,
            PurchaseCost:     rate * qty * (1 - pi.DiscountPercent / 100)
        );
    }
}
