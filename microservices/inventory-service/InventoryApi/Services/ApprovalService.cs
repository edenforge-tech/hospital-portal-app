using InventoryApi.Data;
using InventoryApi.Models.DTOs;
using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Services;

public interface IApprovalService
{
    Task<PurchaseInvoiceDto> CreateInvoiceAsync(Guid tenantId, Guid userId, CreateInvoiceRequest req, CancellationToken ct);
    Task<PurchaseInvoiceDto?> GetInvoiceAsync(Guid tenantId, Guid invoiceId, CancellationToken ct);
    Task<PagedResult<PurchaseInvoiceDto>> ListInvoicesAsync(Guid tenantId, Guid? vendorId, string? billingMode, int page, int pageSize, CancellationToken ct);
    Task SubmitInvoiceAsync(Guid tenantId, Guid invoiceId, Guid userId, CancellationToken ct);
    Task ApproveInvoiceAsync(Guid tenantId, Guid invoiceId, Guid userId, ApproveInvoiceRequest req, CancellationToken ct);
    Task CancelInvoiceAsync(Guid tenantId, Guid invoiceId, Guid userId, CancellationToken ct);
    Task<IReadOnlyList<GstSummaryByRateDto>> GetInvoiceGstSummaryAsync(Guid tenantId, Guid invoiceId, CancellationToken ct);
    Task<PurchaseInvoiceDto?> UpdateInvoiceAsync(Guid tenantId, Guid invoiceId, Guid userId, UpdateInvoiceRequest req, CancellationToken ct);
    Task<PurchaseInvoiceDto?> UpdateInvoiceItemsAsync(Guid tenantId, Guid invoiceId, Guid userId, UpdateInvoiceItemsRequest req, CancellationToken ct);
}

public sealed class ApprovalService : IApprovalService
{
    private readonly InventoryDbContext _db;
    private readonly ITaxService _tax;

    public ApprovalService(InventoryDbContext db, ITaxService tax)
    {
        _db  = db;
        _tax = tax;
    }

    // ── Create ────────────────────────────────────────────────────────────────
    public async Task<PurchaseInvoiceDto> CreateInvoiceAsync(
        Guid tenantId, Guid userId, CreateInvoiceRequest req, CancellationToken ct)
    {
        var invoice = new PurchaseInvoice
        {
            Id                       = Guid.NewGuid(),
            TenantId                 = tenantId,
            VendorId                 = req.VendorId,
            StoreId                  = req.StoreId,
            InvoiceNumber            = req.InvoiceNumber,
            InvoiceDate              = req.InvoiceDate,
            DeliveryChallNumber      = req.DeliveryChallNumber,
            DeliveryChallDate        = req.DeliveryChallDate,
            VendorOrderNumber        = req.VendorOrderNumber,
            VendorDeliveryNoteNumber = req.VendorDeliveryNoteNumber,
            VendorSapNumber          = req.VendorSapNumber,
            VendorBatchRef           = req.VendorBatchRef,
            BillingMode              = req.BillingMode,
            PatientName              = req.PatientName,
            PatientIpNo              = req.PatientIpNo,
            TcsPercent               = req.TcsPercent,
            Remarks                  = req.Remarks,
            InvoiceType              = req.InvoiceType,
            PaymentMode              = req.PaymentMode,
            CreditPeriod             = req.CreditPeriod,
            DueDate                  = req.DueDate,
            Reference                = req.Reference,
            PurchaseCategory         = req.PurchaseCategory,
            Irn                      = req.Irn,
            AckNo                    = req.AckNo,
            AckDate                  = req.AckDate,
            EWayBillNo               = req.EWayBillNo,
            EWayBillDate             = req.EWayBillDate,
            DateOfDelivery           = req.DateOfDelivery,
            IsReverseCharge          = req.IsReverseCharge,
            VendorGstinOnInvoice     = req.VendorGstinOnInvoice,
            ApprovalStatus           = "Draft",
            Status                   = "active",
            CreatedAt                = DateTime.UtcNow,
            UpdatedAt                = DateTime.UtcNow,
            CreatedByUserId          = userId,
            UpdatedByUserId          = userId
        };

        decimal gross = 0, discountTotal = 0, totalGst = 0;
        decimal cgstTotal = 0, sgstTotal = 0, igstTotal = 0;

        foreach (var line in req.Items)
        {
            // Determine if inter-state from explicit flag OR presence of non-zero IgstPercent
            bool interState = line.IsInterState || line.IgstPercent > 0;

            var lineGross    = Math.Round(line.PurchaseRate * line.OrderedQuantity, 2);
            var lineDiscount = line.IsFullDiscount
                ? lineGross
                : Math.Round(lineGross * line.DiscountPercent / 100m, 2);
            var taxable      = lineGross - lineDiscount;
            var split        = _tax.ComputeGst(taxable, line.GstPercent, interState);
            var lineNet      = taxable + split.TotalGst;

            gross        += lineGross;
            discountTotal += lineDiscount;
            totalGst     += split.TotalGst;
            cgstTotal    += split.CgstAmount;
            sgstTotal    += split.SgstAmount;
            igstTotal    += split.IgstAmount;

            invoice.Items.Add(new PurchaseItem
            {
                Id              = Guid.NewGuid(),
                TenantId        = tenantId,
                InvoiceId       = invoice.Id,
                ItemId          = line.ItemId,
                OrderedQuantity = line.OrderedQuantity,
                FreeQuantity    = line.FreeQuantity,
                BatchNumber     = line.BatchNumber,
                ExpiryDate      = line.ExpiryDate,
                Barcode         = line.Barcode,
                OriginalMrp     = line.OriginalMrp,
                Mrp             = line.Mrp,
                PurchaseRate    = line.PurchaseRate,
                DiscountPercent = line.DiscountPercent,
                DiscountAmount  = lineDiscount,
                IsFullDiscount  = line.IsFullDiscount,
                HsnCode         = line.HsnCode,
                GstPercent      = line.GstPercent,
                CgstPercent     = split.CgstPercent,
                SgstPercent     = split.SgstPercent,
                IgstPercent     = split.IgstPercent,
                GstAmount       = split.TotalGst,
                TaxableAmount   = taxable,
                NetAmount       = lineNet,
                PatientName     = line.PatientName,
                PatientIpNo     = line.PatientIpNo,
                SurgeryId       = line.SurgeryId,
                ItemRemarks     = line.ItemRemarks,
                // Traceability
                SerialNumber     = line.SerialNumber,
                ManufacturerName = line.ManufacturerName,
                CountryOfOrigin  = line.CountryOfOrigin,
                MfgDate          = line.MfgDate,
                ScheduleType     = line.ScheduleType,
                IsColdChain      = line.IsColdChain,
                BrandName        = line.BrandName,
                VendorSku        = line.VendorSku,
                IsInterState     = interState,
                ExtraFields      = line.ExtraFields,
                // Pricing / packaging
                SellingPrice     = line.SellingPrice,
                Packing          = line.Packing,
                UnitsPerPack     = line.UnitsPerPack,
                MrpOnPack        = line.MrpOnPack,
                TransferMrp      = line.TransferMrp,
                IsAssetItem      = line.IsAssetItem,
                TaxOnFree        = line.TaxOnFree,
                IsReplacement    = line.IsReplacement,
                CreatedAt       = DateTime.UtcNow,
                UpdatedAt       = DateTime.UtcNow,
                CreatedByUserId = userId,
                UpdatedByUserId = userId
            });
        }

        var taxableTotal = gross - discountTotal;
        var tcsAmt       = _tax.ComputeTcsAmount(taxableTotal + totalGst, req.TcsPercent);

        invoice.GrossAmount    = gross;
        invoice.DiscountAmount = discountTotal;
        invoice.TaxableAmount  = taxableTotal;
        invoice.CgstAmount     = cgstTotal;
        invoice.SgstAmount     = sgstTotal;
        invoice.IgstAmount     = igstTotal;
        invoice.TotalGst       = totalGst;
        invoice.TcsAmount      = tcsAmt;
        invoice.NetAmount      = taxableTotal + totalGst + tcsAmt;
        invoice.BalanceAmount  = invoice.NetAmount;

        // Per-GST-rate summary (gap #4 — Ganga Pharma multi-rate)
        bool anyInterState = req.Items.Any(l => l.IgstPercent > 0);
        var gstInputs = req.Items.Select(l =>
            new GstLineInput(
                Math.Round((l.PurchaseRate * l.OrderedQuantity) * (1 - l.DiscountPercent / 100m), 2),
                l.GstPercent));
        var summaries = _tax.SummariseByRate(gstInputs, anyInterState);

        foreach (var s in summaries)
        {
            invoice.GstSummaries.Add(new InvoiceGstSummary
            {
                Id              = Guid.NewGuid(),
                TenantId        = tenantId,
                InvoiceId       = invoice.Id,
                GstRate         = s.GstRate,
                TaxableAmount   = s.TaxableAmount,
                CgstAmount      = s.CgstAmount,
                SgstAmount      = s.SgstAmount,
                IgstAmount      = s.IgstAmount,
                TotalGstAmount  = s.TotalGst,
                CreatedAt       = DateTime.UtcNow,
                UpdatedAt       = DateTime.UtcNow,
                CreatedByUserId = userId
            });
        }

        _db.PurchaseInvoices.Add(invoice);
        await _db.SaveChangesAsync(ct);

        return await GetInvoiceAsync(tenantId, invoice.Id, ct)
               ?? throw new InvalidOperationException("Failed to reload invoice.");
    }

    // ── Get ───────────────────────────────────────────────────────────────────
    public async Task<PurchaseInvoiceDto?> GetInvoiceAsync(Guid tenantId, Guid invoiceId, CancellationToken ct)
    {
        var inv = await _db.PurchaseInvoices
            .Include(i => i.Vendor)
            .Include(i => i.Store)
            .Include(i => i.Items).ThenInclude(pi => pi.Item)
            .FirstOrDefaultAsync(i => i.Id == invoiceId && i.TenantId == tenantId && i.DeletedAt == null, ct);

        return inv is null ? null : MapToDto(inv);
    }

    // ── List ──────────────────────────────────────────────────────────────────
    public async Task<PagedResult<PurchaseInvoiceDto>> ListInvoicesAsync(
        Guid tenantId, Guid? vendorId, string? billingMode, int page, int pageSize, CancellationToken ct)
    {
        var query = _db.PurchaseInvoices
            .Include(i => i.Vendor).Include(i => i.Store).Include(i => i.Items).ThenInclude(pi => pi.Item)
            .Where(i => i.TenantId == tenantId && i.DeletedAt == null);

        if (vendorId.HasValue) query = query.Where(i => i.VendorId == vendorId.Value);
        if (!string.IsNullOrWhiteSpace(billingMode)) query = query.Where(i => i.BillingMode == billingMode);

        var total = await query.CountAsync(ct);
        var items = await query.OrderByDescending(i => i.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);

        return new PagedResult<PurchaseInvoiceDto>(items.Select(MapToDto).ToList(), total, page, pageSize);
    }

    // ── Submit (Draft → PrimaryApproved) ─────────────────────────────────────
    public async Task SubmitInvoiceAsync(Guid tenantId, Guid invoiceId, Guid userId, CancellationToken ct)
    {
        var invoice = await LoadOrThrow(tenantId, invoiceId, ct);
        if (invoice.ApprovalStatus != "Draft")
            throw new InvalidOperationException($"Invoice is in status '{invoice.ApprovalStatus}', expected Draft.");

        invoice.ApprovalStatus    = "PrimaryApproved";
        invoice.PrimaryApprovedBy = userId;
        invoice.PrimaryApprovedAt = DateTime.UtcNow;
        invoice.UpdatedAt         = DateTime.UtcNow;
        invoice.UpdatedByUserId   = userId;

        AddLog(tenantId, invoice.Id, userId, "PrimaryApproval", null);
        await _db.SaveChangesAsync(ct);
    }

    // ── Approve / Reject ──────────────────────────────────────────────────────
    public async Task ApproveInvoiceAsync(
        Guid tenantId, Guid invoiceId, Guid userId, ApproveInvoiceRequest req, CancellationToken ct)
    {
        var invoice = await LoadOrThrow(tenantId, invoiceId, ct);

        switch (req.Action)
        {
            case "FinalApproval":
                if (invoice.ApprovalStatus != "PrimaryApproved")
                    throw new InvalidOperationException("Invoice must be in PrimaryApproved status for final approval.");
                invoice.ApprovalStatus  = "Approved";
                invoice.FinalApprovedBy = userId;
                invoice.FinalApprovedAt = DateTime.UtcNow;
                break;

            case "Rejection":
                if (invoice.ApprovalStatus is not ("Draft" or "PrimaryApproved"))
                    throw new InvalidOperationException("Invoice cannot be rejected in its current status.");
                invoice.ApprovalStatus = "Rejected";
                break;

            default:
                throw new ArgumentException($"Unknown action '{req.Action}'. Valid: FinalApproval, Rejection.");
        }

        invoice.UpdatedAt       = DateTime.UtcNow;
        invoice.UpdatedByUserId = userId;
        AddLog(tenantId, invoice.Id, userId, req.Action, req.Remarks);
        await _db.SaveChangesAsync(ct);
    }

    public async Task CancelInvoiceAsync(Guid tenantId, Guid invoiceId, Guid userId, CancellationToken ct)
    {
        var invoice = await LoadOrThrow(tenantId, invoiceId, ct);
        if (invoice.ApprovalStatus == "Cancelled")
            throw new InvalidOperationException("Invoice is already cancelled.");
        invoice.ApprovalStatus  = "Cancelled";
        invoice.UpdatedAt       = DateTime.UtcNow;
        invoice.UpdatedByUserId = userId;
        AddLog(tenantId, invoice.Id, userId, "Cancel", null);
        await _db.SaveChangesAsync(ct);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private async Task<PurchaseInvoice> LoadOrThrow(Guid tenantId, Guid invoiceId, CancellationToken ct)
    {
        return await _db.PurchaseInvoices
            .FirstOrDefaultAsync(i => i.Id == invoiceId && i.TenantId == tenantId && i.DeletedAt == null, ct)
            ?? throw new InvalidOperationException("Invoice not found.");
    }

    private void AddLog(Guid tenantId, Guid invoiceId, Guid userId, string action, string? remarks)
    {
        _db.ApprovalLogs.Add(new ApprovalLog
        {
            Id              = Guid.NewGuid(),
            TenantId        = tenantId,
            InvoiceId       = invoiceId,
            UserId          = userId,
            Action          = action,
            ActionAt        = DateTime.UtcNow,
            Remarks         = remarks,
            CreatedAt       = DateTime.UtcNow,
            UpdatedAt       = DateTime.UtcNow,
            CreatedByUserId = userId
        });
    }

    private static PurchaseInvoiceDto MapToDto(PurchaseInvoice inv) => new(
        inv.Id,
        inv.VendorId,
        inv.Vendor?.Name ?? string.Empty,
        inv.StoreId,
        inv.Store?.StoreName ?? string.Empty,
        inv.InvoiceNumber,
        inv.InvoiceDate,
        inv.DeliveryChallNumber,
        inv.DeliveryChallDate,
        inv.VendorOrderNumber,
        inv.VendorSapNumber,
        inv.BillingMode,
        inv.PatientName,
        inv.PatientIpNo,
        inv.GrossAmount,
        inv.DiscountAmount,
        inv.TaxableAmount,
        inv.TotalGst,
        inv.TcsPercent,
        inv.TcsAmount,
        inv.NetAmount,
        inv.PaidAmount,
        inv.BalanceAmount,
        inv.ApprovalStatus,
        inv.CreatedAt,
        inv.Items.Select(MapItemToDto).ToList(),
        GrnNumber:        inv.GrnNumber,
        InvoiceType:      inv.InvoiceType,
        PaymentMode:      inv.PaymentMode,
        CreditPeriod:     inv.CreditPeriod,
        DueDate:          inv.DueDate,
        Reference:        inv.Reference,
        PurchaseCategory: inv.PurchaseCategory,
        Irn:                  inv.Irn,
        AckNo:                inv.AckNo,
        AckDate:              inv.AckDate,
        EWayBillNo:           inv.EWayBillNo,
        EWayBillDate:         inv.EWayBillDate,
        DateOfDelivery:       inv.DateOfDelivery,
        IsReverseCharge:      inv.IsReverseCharge,
        VendorGstinOnInvoice: inv.VendorGstinOnInvoice
    );

    private static PurchaseItemDto MapItemToDto(PurchaseItem pi) => new(
        pi.Id,
        pi.ItemId,
        pi.Item?.ItemName ?? string.Empty,
        pi.OrderedQuantity,
        pi.ReceivedQuantity,
        pi.RejectedQuantity,
        pi.FreeQuantity,
        pi.BatchNumber,
        pi.ExpiryDate,
        pi.Barcode,
        pi.OriginalMrp,
        pi.Mrp,
        pi.PurchaseRate,
        pi.DiscountPercent,
        pi.IsFullDiscount,
        pi.HsnCode,
        pi.GstPercent,
        pi.CgstPercent,
        pi.SgstPercent,
        pi.IgstPercent,
        pi.NetAmount,
        pi.PatientName,
        pi.PatientIpNo,
        pi.ItemRemarks,
        Packing:         pi.Packing,
        UnitsPerPack:    pi.UnitsPerPack,
        SellingPrice:    pi.SellingPrice,
        MrpOnPack:       pi.MrpOnPack,
        TransferMrp:     pi.TransferMrp,
        IsAssetItem:     pi.IsAssetItem,
        TaxOnFree:       pi.TaxOnFree,
        IsReplacement:   pi.IsReplacement,
        SerialNumber:    pi.SerialNumber,
        ManufacturerName: pi.ManufacturerName,
        CountryOfOrigin: pi.CountryOfOrigin,
        MfgDate:         pi.MfgDate,
        ScheduleType:    pi.ScheduleType,
        IsColdChain:     pi.IsColdChain,
        BrandName:       pi.BrandName,
        VendorSku:       pi.VendorSku,
        IsInterState:    pi.IsInterState,
        ExtraFieldsJson: pi.ExtraFields
    );

    public async Task<IReadOnlyList<GstSummaryByRateDto>> GetInvoiceGstSummaryAsync(
        Guid tenantId, Guid invoiceId, CancellationToken ct)
    {
        var rows = await _db.InvoiceGstSummaries
            .Where(g => g.TenantId == tenantId && g.InvoiceId == invoiceId && g.DeletedAt == null)
            .ToListAsync(ct);

        // Get the invoice date for the DTO
        var inv = await _db.PurchaseInvoices
            .Where(i => i.Id == invoiceId && i.TenantId == tenantId)
            .Select(i => new { i.InvoiceDate })
            .FirstOrDefaultAsync(ct);

        var month = inv?.InvoiceDate ?? DateTime.UtcNow;

        return rows
            .GroupBy(r => r.GstRate)
            .Select(g => new GstSummaryByRateDto(
                new DateTime(month.Year, month.Month, 1, 0, 0, 0, DateTimeKind.Utc),
                g.Key,
                g.Sum(r => r.TaxableAmount),
                g.Sum(r => r.CgstAmount),
                g.Sum(r => r.SgstAmount),
                g.Sum(r => r.IgstAmount),
                g.Sum(r => r.TotalGstAmount)
            ))
            .OrderBy(r => r.GstRate)
            .ToList();
    }

    public async Task<PurchaseInvoiceDto?> UpdateInvoiceAsync(
        Guid tenantId, Guid invoiceId, Guid userId, UpdateInvoiceRequest req, CancellationToken ct)
    {
        var inv = await _db.PurchaseInvoices
            .Include(i => i.Items)
            .Include(i => i.Vendor)
            .Include(i => i.Store)
            .FirstOrDefaultAsync(i => i.Id == invoiceId && i.TenantId == tenantId && i.DeletedAt == null, ct);
        if (inv is null) return null;

        // Snapshot lock: block edits once a GRN exists and is not cancelled
        var hasActiveGrn = await _db.GrnHeaders.AnyAsync(
            g => g.InvoiceId == invoiceId &&
                 g.TenantId == tenantId &&
                 g.DeletedAt == null &&
                 g.GrnStatus != "Cancelled", ct);
        if (hasActiveGrn)
            throw new InvalidOperationException(
                "Invoice is locked: a GRN has already been created. Cancel the GRN first to edit the invoice.");

        if (req.InvoiceNumber      is not null) inv.InvoiceNumber    = req.InvoiceNumber;
        if (req.InvoiceDate        is not null) inv.InvoiceDate      = req.InvoiceDate.Value;
        if (req.InvoiceType        is not null) inv.InvoiceType      = req.InvoiceType;
        if (req.PaymentMode        is not null) inv.PaymentMode      = req.PaymentMode;
        if (req.CreditPeriod       is not null) inv.CreditPeriod     = req.CreditPeriod;
        if (req.DueDate            is not null) inv.DueDate          = req.DueDate;
        if (req.Reference          is not null) inv.Reference        = req.Reference;
        if (req.PurchaseCategory   is not null) inv.PurchaseCategory = req.PurchaseCategory;
        inv.UpdatedAt       = DateTime.UtcNow;
        inv.UpdatedByUserId = userId;

        await _db.SaveChangesAsync(ct);
        return MapToDto(inv);
    }

    public async Task<PurchaseInvoiceDto?> UpdateInvoiceItemsAsync(
        Guid tenantId, Guid invoiceId, Guid userId, UpdateInvoiceItemsRequest req, CancellationToken ct)
    {
        var inv = await _db.PurchaseInvoices
            .Include(i => i.Items)
            .Include(i => i.Vendor)
            .Include(i => i.Store)
            .FirstOrDefaultAsync(i => i.Id == invoiceId && i.TenantId == tenantId && i.DeletedAt == null, ct);
        if (inv is null) return null;

        if (inv.ApprovalStatus is "Approved" or "Cancelled" or "Rejected")
            throw new InvalidOperationException(
                $"Cannot edit items on an invoice with status '{inv.ApprovalStatus}'.");

        // Snapshot lock: block item edits once a GRN exists and is not cancelled
        var hasActiveGrn = await _db.GrnHeaders.AnyAsync(
            g => g.InvoiceId == invoiceId &&
                 g.TenantId == tenantId &&
                 g.DeletedAt == null &&
                 g.GrnStatus != "Cancelled", ct);
        if (hasActiveGrn)
            throw new InvalidOperationException(
                "Invoice is locked: a GRN has already been created. Cancel the GRN first to edit items.");


        var updatedIds = new HashSet<Guid>();

        foreach (var line in req.Items)
        {
            bool interState = line.IgstPercent > 0;
            var lineGross    = Math.Round(line.PurchaseRate * line.OrderedQuantity, 2);
            var lineDiscount = line.IsFullDiscount
                ? lineGross
                : Math.Round(lineGross * line.DiscountPercent / 100m, 2);
            var taxable = lineGross - lineDiscount;
            var split   = _tax.ComputeGst(taxable, line.GstPercent, interState);
            var lineNet = taxable + split.TotalGst;

            if (line.Id.HasValue)
            {
                var existing = inv.Items.FirstOrDefault(i => i.Id == line.Id.Value);
                if (existing is not null)
                {
                    existing.ItemId          = line.ItemId;
                    existing.OrderedQuantity = line.OrderedQuantity;
                    existing.ReceivedQuantity= line.ReceivedQuantity;
                    existing.FreeQuantity    = line.FreeQuantity;
                    existing.BatchNumber     = line.BatchNumber;
                    existing.ExpiryDate      = line.ExpiryDate;
                    existing.Barcode         = line.Barcode;
                    existing.OriginalMrp     = line.OriginalMrp;
                    existing.Mrp             = line.Mrp;
                    existing.PurchaseRate    = line.PurchaseRate;
                    existing.DiscountPercent = line.DiscountPercent;
                    existing.DiscountAmount  = lineDiscount;
                    existing.IsFullDiscount  = line.IsFullDiscount;
                    existing.HsnCode         = line.HsnCode;
                    existing.GstPercent      = line.GstPercent;
                    existing.CgstPercent     = split.CgstPercent;
                    existing.SgstPercent     = split.SgstPercent;
                    existing.IgstPercent     = split.IgstPercent;
                    existing.GstAmount       = split.TotalGst;
                    existing.TaxableAmount   = taxable;
                    existing.NetAmount       = lineNet;
                    existing.ItemRemarks     = line.ItemRemarks;
                    existing.UpdatedAt       = DateTime.UtcNow;
                    existing.UpdatedByUserId = userId;
                    updatedIds.Add(existing.Id);
                    continue;
                }
            }

            // New item
            var newItem = new PurchaseItem
            {
                Id               = Guid.NewGuid(),
                TenantId         = tenantId,
                InvoiceId        = inv.Id,
                ItemId           = line.ItemId,
                OrderedQuantity  = line.OrderedQuantity,
                ReceivedQuantity = line.ReceivedQuantity,
                FreeQuantity     = line.FreeQuantity,
                BatchNumber      = line.BatchNumber,
                ExpiryDate       = line.ExpiryDate,
                Barcode          = line.Barcode,
                OriginalMrp      = line.OriginalMrp,
                Mrp              = line.Mrp,
                PurchaseRate     = line.PurchaseRate,
                DiscountPercent  = line.DiscountPercent,
                DiscountAmount   = lineDiscount,
                IsFullDiscount   = line.IsFullDiscount,
                HsnCode          = line.HsnCode,
                GstPercent       = line.GstPercent,
                CgstPercent      = split.CgstPercent,
                SgstPercent      = split.SgstPercent,
                IgstPercent      = split.IgstPercent,
                GstAmount        = split.TotalGst,
                TaxableAmount    = taxable,
                NetAmount        = lineNet,
                ItemRemarks      = line.ItemRemarks,
                CreatedAt        = DateTime.UtcNow,
                UpdatedAt        = DateTime.UtcNow,
                CreatedByUserId  = userId,
                UpdatedByUserId  = userId
            };
            inv.Items.Add(newItem);
            updatedIds.Add(newItem.Id);
        }

        // Soft-delete items removed from the list
        foreach (var removed in inv.Items.Where(i => !updatedIds.Contains(i.Id) && i.DeletedAt == null))
        {
            removed.DeletedAt = DateTime.UtcNow;
            removed.UpdatedAt = DateTime.UtcNow;
        }

        // Recalculate invoice totals from surviving items
        var liveItems = inv.Items.Where(i => i.DeletedAt == null).ToList();
        decimal gross = 0, discountTotal = 0, totalGst = 0, cgstTotal = 0, sgstTotal = 0, igstTotal = 0;
        foreach (var pi in liveItems)
        {
            gross         += pi.PurchaseRate * pi.OrderedQuantity;
            discountTotal += pi.DiscountAmount;
            totalGst      += pi.GstAmount;
            cgstTotal     += pi.CgstPercent > 0 ? pi.GstAmount / 2 : 0;
            sgstTotal     += pi.SgstPercent > 0 ? pi.GstAmount / 2 : 0;
            igstTotal     += pi.IgstPercent > 0 ? pi.GstAmount   : 0;
        }
        var taxableTotal  = gross - discountTotal;
        var tcsAmt        = _tax.ComputeTcsAmount(taxableTotal + totalGst, inv.TcsPercent);
        inv.GrossAmount   = gross;
        inv.DiscountAmount= discountTotal;
        inv.TaxableAmount = taxableTotal;
        inv.CgstAmount    = cgstTotal;
        inv.SgstAmount    = sgstTotal;
        inv.IgstAmount    = igstTotal;
        inv.TotalGst      = totalGst;
        inv.TcsAmount     = tcsAmt;
        inv.NetAmount     = taxableTotal + totalGst + tcsAmt;
        inv.BalanceAmount = inv.NetAmount - inv.PaidAmount;
        inv.UpdatedAt     = DateTime.UtcNow;
        inv.UpdatedByUserId = userId;

        await _db.SaveChangesAsync(ct);
        return await GetInvoiceAsync(tenantId, invoiceId, ct);
    }
}
