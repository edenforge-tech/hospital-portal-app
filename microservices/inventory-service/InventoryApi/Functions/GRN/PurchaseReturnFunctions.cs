using System.Net;
using System.Text.Json;
using InventoryApi.Data;
using InventoryApi.Models.DTOs;
using InventoryApi.Models.Entities;
using InventoryApi.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Functions.GRN;

public sealed class PurchaseReturnFunctions
{
    private readonly InventoryDbContext _db;
    private readonly IStockLedgerService _ledger;
    private readonly INotificationClient _notify;
    private readonly ILogger<PurchaseReturnFunctions> _log;

    public PurchaseReturnFunctions(InventoryDbContext db, IStockLedgerService ledger,
        INotificationClient notify, ILogger<PurchaseReturnFunctions> log)
    {
        _db     = db;
        _ledger = ledger;
        _notify = notify;
        _log    = log;
    }

    // â”€â”€ POST /purchase-returns â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    [Function("CreatePurchaseReturn")]
    public async Task<HttpResponseData> CreateReturn(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "purchase-returns")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var opts     = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            var body     = await JsonSerializer.DeserializeAsync<CreatePurchaseReturnRequest>(req.Body, opts, ct)
                           ?? throw new ArgumentException("Invalid request body.");

            // â”€â”€ Validate source-type constraints â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            var sourceType = body.SourceType ?? "Manual";
            if (sourceType == "Invoice" && !body.InvoiceId.HasValue)
                return await Error(req, HttpStatusCode.BadRequest, "InvoiceId is required for source type 'Invoice'.");
            if (sourceType == "GRN" && !body.GrnId.HasValue)
                return await Error(req, HttpStatusCode.BadRequest, "GrnId is required for source type 'GRN'.");

            // â”€â”€ Optionally load invoice for rate defaulting â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            // Load source document and build allowed-item set for integrity validation
            PurchaseInvoice? invoice = null;
            HashSet<Guid>?   allowedItemIds = null;

            if (body.InvoiceId.HasValue)
            {
                invoice = await _db.PurchaseInvoices
                    .Include(i => i.Items)
                    .Where(i => i.Id == body.InvoiceId.Value && i.TenantId == tenantId && i.DeletedAt == null)
                    .FirstOrDefaultAsync(ct);

                if (invoice == null)
                    return await Error(req, HttpStatusCode.BadRequest, "Invoice not found or does not belong to this tenant.");
                if (invoice.VendorId != body.VendorId)
                    return await Error(req, HttpStatusCode.BadRequest, "Invoice vendor does not match the specified vendor.");

                if (sourceType == "Invoice")
                    allowedItemIds = invoice.Items.Select(i => i.ItemId).ToHashSet();
            }

            if (sourceType == "GRN" && body.GrnId.HasValue)
            {
                var grn = await _db.GrnHeaders
                    .Include(g => g.GrnItems)
                    .Where(g => g.Id == body.GrnId.Value && g.TenantId == tenantId && g.DeletedAt == null)
                    .FirstOrDefaultAsync(ct);

                if (grn == null)
                    return await Error(req, HttpStatusCode.BadRequest, "GRN not found or does not belong to this tenant.");

                // Cross-check vendor via the GRN's linked invoice
                if (grn.InvoiceId != Guid.Empty)
                {
                    var grnInv = await _db.PurchaseInvoices
                        .Where(i => i.Id == grn.InvoiceId && i.TenantId == tenantId)
                        .Select(i => new { i.VendorId })
                        .FirstOrDefaultAsync(ct);
                    if (grnInv != null && grnInv.VendorId != body.VendorId)
                        return await Error(req, HttpStatusCode.BadRequest, "GRN's invoice vendor does not match the specified vendor.");

                    // Pre-load invoice for rate fall-back during line processing
                    if (invoice == null)
                        invoice = await _db.PurchaseInvoices
                            .Include(i => i.Items)
                            .Where(i => i.Id == grn.InvoiceId && i.TenantId == tenantId)
                            .FirstOrDefaultAsync(ct);
                }

                allowedItemIds = grn.GrnItems.Select(gi => gi.ItemId).ToHashSet();
            }

            // Reject any line items not present in the selected source document
            if (allowedItemIds != null)
            {
                var invalid = body.Items.Where(l => !allowedItemIds.Contains(l.ItemId)).ToList();
                if (invalid.Count > 0)
                    return await Error(req, HttpStatusCode.BadRequest,
                        "The following item(s) are not part of the selected source document: " +
                        string.Join(", ", invalid.Select(l => l.ItemId)));
            }

            // â”€â”€ Generate return number â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            var count  = await _db.PurchaseReturns.CountAsync(r => r.TenantId == tenantId, ct);
            var retNum = $"PR-RET/{DateTime.UtcNow:yyyyMMdd}/{count + 1:D4}";

            decimal total    = 0;
            var     retItems = new List<PurchaseReturnItem>();

            foreach (var line in body.Items)
            {
                decimal rate  = line.PurchaseRate;
                StockBatch? batch = null;

                // Load stock batch unconditionally when provided (needed for qty validation + rate)
                if (line.StockBatchId.HasValue)
                {
                    batch = await _db.StockBatches
                        .Where(b => b.Id == line.StockBatchId.Value && b.TenantId == tenantId)
                        .FirstOrDefaultAsync(ct);

                    if (batch == null)
                        return await Error(req, HttpStatusCode.BadRequest,
                            $"Stock batch '{line.StockBatchId}' not found.");

                    // Derive purchase rate from batch when not explicitly provided
                    if (rate <= 0) rate = batch.PurchaseRate;

                    // Validate that return quantity does not exceed available batch stock
                    if (line.ReturnQuantity > batch.QuantityAvailable)
                        return await Error(req, HttpStatusCode.BadRequest,
                            $"Return quantity ({line.ReturnQuantity}) for batch '{batch.BatchNumber ?? batch.Id.ToString()}' " +
                            $"exceeds available stock ({batch.QuantityAvailable}).");
                }

                // Fall back to rate from the linked invoice item
                PurchaseItem? invItem = null;
                if (invoice != null)
                    invItem = invoice.Items.FirstOrDefault(i => i.ItemId == line.ItemId);

                if (rate <= 0 && invItem != null) rate = invItem.PurchaseRate;

                // ── GST: use explicit values from request; else inherit from invoice item ──
                decimal gstPct  = line.GstPercent  > 0 ? line.GstPercent  : (invItem?.GstPercent  ?? 0);
                decimal cgstPct = line.CgstPercent > 0 ? line.CgstPercent : (invItem?.CgstPercent ?? 0);
                decimal sgstPct = line.SgstPercent > 0 ? line.SgstPercent : (invItem?.SgstPercent ?? 0);
                decimal igstPct = line.IgstPercent > 0 ? line.IgstPercent : (invItem?.IgstPercent ?? 0);
                string? hsnCode = string.IsNullOrWhiteSpace(line.HsnCode) ? invItem?.HsnCode : line.HsnCode;

                decimal taxableAmt = Math.Round(line.ReturnQuantity * rate, 2);
                decimal cgstAmt    = Math.Round(taxableAmt * cgstPct / 100, 2);
                decimal sgstAmt    = Math.Round(taxableAmt * sgstPct / 100, 2);
                decimal igstAmt    = Math.Round(taxableAmt * igstPct / 100, 2);
                decimal netAmt     = taxableAmt + cgstAmt + sgstAmt + igstAmt;

                total += netAmt;

                retItems.Add(new PurchaseReturnItem
                {
                    Id              = Guid.NewGuid(),
                    TenantId        = tenantId,
                    ItemId          = line.ItemId,
                    StockBatchId    = line.StockBatchId,
                    ReturnQuantity  = line.ReturnQuantity,
                    FreeQuantity    = line.FreeQuantity,
                    PurchaseRate    = rate,
                    Amount          = taxableAmt,
                    HsnCode         = hsnCode,
                    GstPercent      = gstPct,
                    CgstPercent     = cgstPct,
                    SgstPercent     = sgstPct,
                    IgstPercent     = igstPct,
                    TaxableAmount   = taxableAmt,
                    CgstAmount      = cgstAmt,
                    SgstAmount      = sgstAmt,
                    IgstAmount      = igstAmt,
                    NetAmount       = netAmt,
                    ReturnCause     = line.ReturnCause ?? body.ReturnReason,
                    BatchNumber     = line.BatchNumber,
                    ExpiryDate      = line.ExpiryDate,
                    CreatedAt       = DateTime.UtcNow,
                    UpdatedAt       = DateTime.UtcNow,
                    CreatedByUserId = userId,
                    UpdatedByUserId = userId,
                });
            }

            // ── Header GST totals ─────────────────────────────────────────────
            decimal hdrTaxable = retItems.Sum(i => i.TaxableAmount);
            decimal hdrCgst    = retItems.Sum(i => i.CgstAmount);
            decimal hdrSgst    = retItems.Sum(i => i.SgstAmount);
            decimal hdrIgst    = retItems.Sum(i => i.IgstAmount);
            decimal hdrNet     = hdrTaxable + hdrCgst + hdrSgst + hdrIgst;

            var ret = new PurchaseReturn
            {
                Id               = Guid.NewGuid(),
                TenantId         = tenantId,
                SourceType       = sourceType,
                InvoiceId        = body.InvoiceId,
                GrnId            = body.GrnId,
                VendorId         = body.VendorId,
                PurchaseCategory = body.PurchaseCategory,
                ReturnNumber     = retNum,
                ReturnDate       = body.ReturnDate.Date,
                ReturnReason     = body.ReturnReason,
                TotalAmount      = total,
                TaxableAmount    = hdrTaxable,
                CgstAmount       = hdrCgst,
                SgstAmount       = hdrSgst,
                IgstAmount       = hdrIgst,
                NetReturnAmount  = hdrNet,
                Remarks          = body.Remarks,
                PaymentMode      = body.PaymentMode,
                Reference        = body.Reference,
                SettlementStatus = "Pending",
                CreatedAt        = DateTime.UtcNow,
                UpdatedAt        = DateTime.UtcNow,
                CreatedByUserId  = userId,
                UpdatedByUserId  = userId,
            };
            _db.PurchaseReturns.Add(ret);

            foreach (var item in retItems)
            {
                item.ReturnId = ret.Id;
                _db.PurchaseReturnItems.Add(item);
            }

            await _db.SaveChangesAsync(ct);

            // ── Deduct stock for returned items ───────────────────────────────
            await _ledger.RecordReturnToVendorAsync(tenantId, userId, retItems, retNum, ret.Id, ct);

            var result = new { ret.Id, ret.ReturnNumber, ret.TotalAmount, ret.NetReturnAmount, ret.SettlementStatus, ret.CreatedAt };
            return await OkJson(req, result, HttpStatusCode.Created);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // â”€â”€ GET /purchase-returns â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    [Function("ListPurchaseReturns")]
    public async Task<HttpResponseData> ListReturns(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "purchase-returns")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var qs       = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            int page     = int.TryParse(qs["page"],     out var p)  ? p  : 1;
            int pageSize = int.TryParse(qs["pageSize"], out var ps) ? ps : 20;

            var status           = qs["status"];
            var sourceType       = qs["sourceType"];
            var purchaseCategory = qs["purchaseCategory"];
            var search           = qs["search"];
            var vendorId         = Guid.TryParse(qs["vendorId"], out var vid) ? (Guid?)vid : null;
            var fromDate         = DateOnly.TryParse(qs["fromDate"], out var fd) ? (DateOnly?)fd : null;
            var toDate           = DateOnly.TryParse(qs["toDate"],   out var td) ? (DateOnly?)td : null;

            var q = _db.PurchaseReturns
                .Include(r => r.Vendor)
                .Where(r => r.TenantId == tenantId && r.DeletedAt == null);

            if (!string.IsNullOrWhiteSpace(status))           q = q.Where(r => r.SettlementStatus == status);
            if (!string.IsNullOrWhiteSpace(sourceType))       q = q.Where(r => r.SourceType == sourceType);
            if (!string.IsNullOrWhiteSpace(purchaseCategory)) q = q.Where(r => r.PurchaseCategory == purchaseCategory);
            if (vendorId.HasValue)                            q = q.Where(r => r.VendorId == vendorId.Value);
            if (fromDate.HasValue)                            q = q.Where(r => r.ReturnDate >= fromDate.Value.ToDateTime(TimeOnly.MinValue));
            if (toDate.HasValue)                              q = q.Where(r => r.ReturnDate <= toDate.Value.ToDateTime(TimeOnly.MaxValue));
            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.ToLower();
                q = q.Where(r => r.ReturnNumber.ToLower().Contains(s)
                              || (r.Vendor != null && r.Vendor.Name.ToLower().Contains(s)));
            }

            var total = await q.CountAsync(ct);
            var items = await q
                .OrderByDescending(r => r.ReturnDate)
                .Skip((page - 1) * pageSize).Take(pageSize)
                .Select(r => new
                {
                    r.Id,
                    r.ReturnNumber,
                    r.SourceType,
                    r.InvoiceId,
                    r.GrnId,
                    r.VendorId,
                    VendorName        = r.Vendor != null ? r.Vendor.Name : string.Empty,
                    VendorContact     = r.Vendor != null ? r.Vendor.ContactPerson : null,
                    VendorPhone       = r.Vendor != null ? r.Vendor.Phone : null,
                    r.PurchaseCategory,
                    r.ReturnDate,
                    r.ReturnReason,
                    r.TotalAmount,
                    r.TaxableAmount,
                    r.CgstAmount,
                    r.SgstAmount,
                    r.IgstAmount,
                    r.NetReturnAmount,
                    r.ItcReversalAmount,
                    r.CancellationReason,
                    r.SettlementStatus,
                    r.CreditNoteNumber,
                    r.CreditNoteAmount,
                    r.CreditNoteDate,
                    r.PaymentMode,
                    r.Reference,
                    r.Remarks,
                    r.SentToVendorAt,
                    r.SettledAt,
                    r.CreatedAt,
                })
                .ToListAsync(ct);

            return await OkJson(req, new { Total = total, Page = page, PageSize = pageSize, Items = items });
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // â”€â”€ GET /purchase-returns/{id} â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    [Function("GetPurchaseReturn")]
    public async Task<HttpResponseData> GetReturn(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "purchase-returns/{id:guid}")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var ret = await _db.PurchaseReturns
                .Include(r => r.Vendor)
                .Include(r => r.ReturnItems).ThenInclude(ri => ri.Item)
                .Where(r => r.Id == id && r.TenantId == tenantId && r.DeletedAt == null)
                .Select(r => new
                {
                    r.Id,
                    r.ReturnNumber,
                    r.SourceType,
                    r.InvoiceId,
                    r.GrnId,
                    r.VendorId,
                    VendorName        = r.Vendor != null ? r.Vendor.Name : string.Empty,
                    VendorContact     = r.Vendor != null ? r.Vendor.ContactPerson : null,
                    VendorPhone       = r.Vendor != null ? r.Vendor.Phone : null,
                    VendorAddress     = r.Vendor != null ? r.Vendor.Address : null,
                    r.PurchaseCategory,
                    r.ReturnDate,
                    r.ReturnReason,
                    r.TotalAmount,
                    r.TaxableAmount,
                    r.CgstAmount,
                    r.SgstAmount,
                    r.IgstAmount,
                    r.NetReturnAmount,
                    r.ItcReversalAmount,
                    r.CancellationReason,
                    r.SettlementStatus,
                    r.CreditNoteNumber,
                    r.CreditNoteAmount,
                    r.CreditNoteDate,
                    r.PaymentMode,
                    r.Reference,
                    r.Remarks,
                    r.SentToVendorAt,
                    r.SettledAt,
                    r.CreatedAt,
                    Items = r.ReturnItems.Where(ri => ri.DeletedAt == null).Select(ri => new
                    {
                        ri.Id,
                        ri.ItemId,
                        ItemName      = ri.Item != null ? ri.Item.ItemName : string.Empty,
                        ri.StockBatchId,
                        ri.ReturnQuantity,
                        ri.FreeQuantity,
                        ri.PurchaseRate,
                        ri.Amount,
                        ri.HsnCode,
                        ri.GstPercent,
                        ri.CgstPercent,
                        ri.SgstPercent,
                        ri.IgstPercent,
                        ri.TaxableAmount,
                        ri.CgstAmount,
                        ri.SgstAmount,
                        ri.IgstAmount,
                        ri.NetAmount,
                        ri.ReturnCause,
                        ri.BatchNumber,
                        ri.ExpiryDate,
                    })
                })
                .FirstOrDefaultAsync(ct);

            if (ret is null) return req.CreateResponse(HttpStatusCode.NotFound);
            return await OkJson(req, ret);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // â”€â”€ POST /purchase-returns/{id}/send-to-vendor â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    [Function("SendPurchaseReturnToVendor")]
    public async Task<HttpResponseData> SendToVendor(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "purchase-returns/{id:guid}/send-to-vendor")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");

            var ret = await _db.PurchaseReturns
                .FirstOrDefaultAsync(r => r.Id == id && r.TenantId == tenantId && r.DeletedAt == null, ct);

            if (ret is null) return req.CreateResponse(HttpStatusCode.NotFound);
            if (ret.SettlementStatus == "Settled" || ret.SettlementStatus == "Cancelled")
                return await Error(req, HttpStatusCode.Conflict, $"Cannot send a return that is already {ret.SettlementStatus}.");

            ret.SettlementStatus = "SentToVendor";
            ret.SentToVendorAt   = DateTime.UtcNow;
            ret.UpdatedAt        = DateTime.UtcNow;
            ret.UpdatedByUserId  = userId;

            await _db.SaveChangesAsync(ct);

            // ── Fire-and-forget notification ─────────────────────────────────
            var vendor = await _db.Vendors
                .Where(v => v.Id == ret.VendorId && v.TenantId == tenantId)
                .Select(v => new { v.Name, v.Email })
                .FirstOrDefaultAsync(ct);

            if (!string.IsNullOrWhiteSpace(vendor?.Email))
                _ = _notify.SendPurchaseReturnEventAsync(
                    toEmail:      vendor.Email,
                    vendorName:   vendor.Name,
                    returnNumber: ret.ReturnNumber,
                    eventType:    "SentToVendor",
                    netAmount:    ret.NetReturnAmount,
                    eventAt:      ret.SentToVendorAt ?? DateTime.UtcNow);

            return await OkJson(req, new { ret.Id, ret.ReturnNumber, ret.SettlementStatus, ret.SentToVendorAt });
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // â”€â”€ POST /purchase-returns/{id}/record-credit-note â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    [Function("RecordPurchaseReturnCreditNote")]
    public async Task<HttpResponseData> RecordCreditNote(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "purchase-returns/{id:guid}/record-credit-note")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var opts     = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            var body     = await JsonSerializer.DeserializeAsync<RecordCreditNoteRequest>(req.Body, opts, ct)
                           ?? throw new ArgumentException("Invalid request body.");

            var ret = await _db.PurchaseReturns
                .FirstOrDefaultAsync(r => r.Id == id && r.TenantId == tenantId && r.DeletedAt == null, ct);

            if (ret is null) return req.CreateResponse(HttpStatusCode.NotFound);
            if (ret.SettlementStatus == "Settled" || ret.SettlementStatus == "Cancelled")
                return await Error(req, HttpStatusCode.Conflict, $"Return is already {ret.SettlementStatus}.");

            ret.CreditNoteNumber = body.CreditNoteNumber;
            ret.CreditNoteAmount = body.CreditNoteAmount;
            ret.CreditNoteDate   = body.CreditNoteDate;
            ret.SettlementStatus = "CreditNoteReceived";
            ret.UpdatedAt        = DateTime.UtcNow;
            ret.UpdatedByUserId  = userId;

            // ── ITC reversal amount = proportional GST on credit note ────────
            decimal totalGst = ret.CgstAmount + ret.SgstAmount + ret.IgstAmount;
            if (ret.NetReturnAmount > 0 && totalGst > 0)
                ret.ItcReversalAmount = Math.Round((body.CreditNoteAmount / ret.NetReturnAmount) * totalGst, 2);

            await _db.SaveChangesAsync(ct);

            // ── Vendor outstanding ledger: credit entry ───────────────────────
            var vendor = await _db.Vendors
                .FirstOrDefaultAsync(v => v.Id == ret.VendorId && v.TenantId == tenantId, ct);

            var lastLedger = await _db.VendorOutstandingLedgers
                .Where(l => l.VendorId == ret.VendorId && l.TenantId == tenantId && l.DeletedAt == null)
                .OrderByDescending(l => l.CreatedAt)
                .FirstOrDefaultAsync(ct);

            decimal runningBalance = (lastLedger?.RunningBalance ?? 0) - body.CreditNoteAmount;

            _db.VendorOutstandingLedgers.Add(new VendorOutstandingLedger
            {
                Id             = Guid.NewGuid(),
                TenantId       = tenantId,
                VendorId       = ret.VendorId,
                ReturnId       = ret.Id,
                EntryType      = "CreditNote",
                Debit          = 0,
                Credit         = body.CreditNoteAmount,
                RunningBalance = runningBalance,
                ReferenceNumber = body.CreditNoteNumber,
                EntryDate      = body.CreditNoteDate.ToDateTime(TimeOnly.MinValue),
                Remarks        = $"Credit note against return {ret.ReturnNumber}",
                Status         = "active",
                CreatedAt      = DateTime.UtcNow,
                UpdatedAt      = DateTime.UtcNow,
                CreatedByUserId = userId,
                UpdatedByUserId = userId,
            });

            if (vendor != null)
            {
                vendor.OutstandingBalance = Math.Max(0, vendor.OutstandingBalance - body.CreditNoteAmount);
                vendor.UpdatedAt          = DateTime.UtcNow;
                vendor.UpdatedByUserId    = userId;
            }

            await _db.SaveChangesAsync(ct);

            // ── Fire-and-forget notification ─────────────────────────────────
            var vendorCn = await _db.Vendors
                .Where(v => v.Id == ret.VendorId && v.TenantId == tenantId)
                .Select(v => new { v.Name, v.Email })
                .FirstOrDefaultAsync(ct);

            if (!string.IsNullOrWhiteSpace(vendorCn?.Email))
                _ = _notify.SendPurchaseReturnEventAsync(
                    toEmail:           vendorCn.Email,
                    vendorName:        vendorCn.Name,
                    returnNumber:      ret.ReturnNumber,
                    eventType:         "CreditNoteReceived",
                    netAmount:         ret.NetReturnAmount,
                    eventAt:           DateTime.UtcNow,
                    creditNoteNumber:  ret.CreditNoteNumber,
                    creditNoteAmount:  ret.CreditNoteAmount);

            return await OkJson(req, new { ret.Id, ret.ReturnNumber, ret.SettlementStatus, ret.CreditNoteNumber, ret.CreditNoteAmount, ret.CreditNoteDate, ret.ItcReversalAmount });
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // â”€â”€ POST /purchase-returns/{id}/settle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    [Function("SettlePurchaseReturn")]
    public async Task<HttpResponseData> Settle(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "purchase-returns/{id:guid}/settle")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");

            var ret = await _db.PurchaseReturns
                .FirstOrDefaultAsync(r => r.Id == id && r.TenantId == tenantId && r.DeletedAt == null, ct);

            if (ret is null)                        return req.CreateResponse(HttpStatusCode.NotFound);
            if (ret.SettlementStatus == "Settled")  return await Error(req, HttpStatusCode.Conflict, "Return is already settled.");
            if (ret.SettlementStatus == "Cancelled") return await Error(req, HttpStatusCode.Conflict, "Cannot settle a cancelled return.");

            ret.SettlementStatus = "Settled";
            ret.SettledAt        = DateTime.UtcNow;
            ret.UpdatedAt        = DateTime.UtcNow;
            ret.UpdatedByUserId  = userId;

            // ── Apply credit note against invoice balance ─────────────────────
            if (ret.InvoiceId.HasValue && ret.CreditNoteAmount > 0)
            {
                var invoice = await _db.PurchaseInvoices
                    .FirstOrDefaultAsync(i => i.Id == ret.InvoiceId.Value && i.TenantId == tenantId, ct);
                if (invoice != null)
                {
                    invoice.BalanceAmount   = Math.Max(0, invoice.BalanceAmount - (ret.CreditNoteAmount ?? 0));
                    invoice.UpdatedAt       = DateTime.UtcNow;
                    invoice.UpdatedByUserId = userId;
                }
            }

            await _db.SaveChangesAsync(ct);

            // ── Fire-and-forget notification ─────────────────────────────────
            var vendorSettle = await _db.Vendors
                .Where(v => v.Id == ret.VendorId && v.TenantId == tenantId)
                .Select(v => new { v.Name, v.Email })
                .FirstOrDefaultAsync(ct);

            if (!string.IsNullOrWhiteSpace(vendorSettle?.Email))
                _ = _notify.SendPurchaseReturnEventAsync(
                    toEmail:      vendorSettle.Email,
                    vendorName:   vendorSettle.Name,
                    returnNumber: ret.ReturnNumber,
                    eventType:    "Settled",
                    netAmount:    ret.NetReturnAmount,
                    eventAt:      ret.SettledAt ?? DateTime.UtcNow);

            return await OkJson(req, new { ret.Id, ret.ReturnNumber, ret.SettlementStatus, ret.SettledAt });
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // â”€â”€ DELETE /purchase-returns/{id} (cancel / soft-delete) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    [Function("CancelPurchaseReturn")]
    public async Task<HttpResponseData> Cancel(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "purchase-returns/{id:guid}")]
        HttpRequestData req, FunctionContext ctx, Guid id, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");
            var opts     = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

            // Parse optional body for cancellation reason
            string? cancellationReason = null;
            try
            {
                var cancelBody = await JsonSerializer.DeserializeAsync<CancelReturnRequest>(req.Body, opts, ct);
                cancellationReason = cancelBody?.CancellationReason?.Trim();
            }
            catch { /* Body may be empty for status != CreditNoteReceived */ }

            var ret = await _db.PurchaseReturns
                .Include(r => r.ReturnItems)
                .FirstOrDefaultAsync(r => r.Id == id && r.TenantId == tenantId && r.DeletedAt == null, ct);

            if (ret is null) return req.CreateResponse(HttpStatusCode.NotFound);
            if (ret.SettlementStatus == "Settled")
                return await Error(req, HttpStatusCode.Conflict, "Cannot cancel a settled return.");

            // Mandatory reason when cancelling after a credit note was received
            if (ret.SettlementStatus == "CreditNoteReceived" && string.IsNullOrWhiteSpace(cancellationReason))
                return await Error(req, HttpStatusCode.BadRequest,
                    "CancellationReason is required when cancelling a return that has a credit note (CreditNoteReceived status).");

            // ── Reverse vendor ledger if a credit note was applied ────────────
            if (ret.SettlementStatus == "CreditNoteReceived" && ret.CreditNoteAmount > 0)
            {
                var lastLedger = await _db.VendorOutstandingLedgers
                    .Where(l => l.VendorId == ret.VendorId && l.TenantId == tenantId && l.DeletedAt == null)
                    .OrderByDescending(l => l.CreatedAt)
                    .FirstOrDefaultAsync(ct);

                decimal cnAmount       = ret.CreditNoteAmount ?? 0;
                decimal runningBalance = (lastLedger?.RunningBalance ?? 0) + cnAmount;

                _db.VendorOutstandingLedgers.Add(new VendorOutstandingLedger
                {
                    Id              = Guid.NewGuid(),
                    TenantId        = tenantId,
                    VendorId        = ret.VendorId,
                    ReturnId        = ret.Id,
                    EntryType       = "CreditNoteReversal",
                    Debit           = cnAmount,
                    Credit          = 0,
                    RunningBalance  = runningBalance,
                    ReferenceNumber = ret.CreditNoteNumber,
                    EntryDate       = DateTime.UtcNow,
                    Remarks         = $"Reversal of credit note for cancelled return {ret.ReturnNumber}. Reason: {cancellationReason}",
                    Status          = "active",
                    CreatedAt       = DateTime.UtcNow,
                    UpdatedAt       = DateTime.UtcNow,
                    CreatedByUserId = userId,
                    UpdatedByUserId = userId,
                });

                var vendor = await _db.Vendors
                    .FirstOrDefaultAsync(v => v.Id == ret.VendorId && v.TenantId == tenantId, ct);
                if (vendor != null)
                {
                    vendor.OutstandingBalance += cnAmount;
                    vendor.UpdatedAt           = DateTime.UtcNow;
                    vendor.UpdatedByUserId     = userId;
                }
            }

            ret.SettlementStatus    = "Cancelled";
            ret.CancellationReason  = cancellationReason;
            ret.DeletedAt           = DateTime.UtcNow;
            ret.UpdatedAt           = DateTime.UtcNow;
            ret.UpdatedByUserId     = userId;

            await _db.SaveChangesAsync(ct);

            // ── Reverse stock deductions ──────────────────────────────────────
            if (ret.ReturnItems.Count > 0)
                await _ledger.ReverseReturnToVendorAsync(tenantId, userId, ret.ReturnItems, ret.ReturnNumber, ret.Id, ct);

            // ── Fire-and-forget notification ──────────────────────────────────
            var vendorCancel = await _db.Vendors
                .Where(v => v.Id == ret.VendorId && v.TenantId == tenantId)
                .Select(v => new { v.Name, v.Email })
                .FirstOrDefaultAsync(ct);

            if (!string.IsNullOrWhiteSpace(vendorCancel?.Email))
                _ = _notify.SendPurchaseReturnEventAsync(
                    toEmail:            vendorCancel.Email,
                    vendorName:         vendorCancel.Name,
                    returnNumber:       ret.ReturnNumber,
                    eventType:          "Cancelled",
                    netAmount:          ret.NetReturnAmount,
                    eventAt:            DateTime.UtcNow,
                    cancellationReason: cancellationReason);

            return req.CreateResponse(HttpStatusCode.NoContent);
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    // GET /purchase-returns/returnable-items?sourceType=Invoice&invoiceId={id}
    // GET /purchase-returns/returnable-items?sourceType=GRN&grnId={id}
    // Returns source items with remaining returnable quantity (total - already returned)
    [Function("GetReturnableItems")]
    public async Task<HttpResponseData> GetReturnableItems(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "purchase-returns/returnable-items")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId   = ParseGuid(req, "X-Tenant-Id");
            var qs         = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            var sourceType = qs["sourceType"] ?? "Invoice";

            if (sourceType == "Invoice")
            {
                if (!Guid.TryParse(qs["invoiceId"], out var invoiceId))
                    return await Error(req, HttpStatusCode.BadRequest, "invoiceId query parameter is required.");

                var invoice = await _db.PurchaseInvoices
                    .Include(i => i.Items).ThenInclude(pi => pi.Item)
                    .Where(i => i.Id == invoiceId && i.TenantId == tenantId && i.DeletedAt == null)
                    .FirstOrDefaultAsync(ct);

                if (invoice == null) return req.CreateResponse(HttpStatusCode.NotFound);

                var returned = await _db.PurchaseReturnItems
                    .Where(ri => ri.TenantId == tenantId
                              && ri.DeletedAt == null
                              && ri.Return!.InvoiceId == invoiceId
                              && ri.Return.SettlementStatus != "Cancelled")
                    .GroupBy(ri => ri.ItemId)
                    .Select(g => new { ItemId = g.Key, ReturnedQty = g.Sum(ri => ri.ReturnQuantity) })
                    .ToDictionaryAsync(x => x.ItemId, x => x.ReturnedQty, ct);

                var result = invoice.Items.Select(pi => new
                {
                    pi.ItemId,
                    ItemName      = pi.Item != null ? pi.Item.ItemName : pi.ItemId.ToString(),
                    pi.PurchaseRate,
                    pi.BatchNumber,
                    pi.ExpiryDate,
                    SourceQty     = pi.ReceivedQuantity,
                    ReturnedQty   = returned.GetValueOrDefault(pi.ItemId, 0m),
                    ReturnableQty = pi.ReceivedQuantity - returned.GetValueOrDefault(pi.ItemId, 0m),
                }).ToList();

                return await OkJson(req, result);
            }
            else if (sourceType == "GRN")
            {
                if (!Guid.TryParse(qs["grnId"], out var grnId))
                    return await Error(req, HttpStatusCode.BadRequest, "grnId query parameter is required.");

                var grn = await _db.GrnHeaders
                    .Include(g => g.GrnItems).ThenInclude(gi => gi.Item)
                    .Include(g => g.Invoice).ThenInclude(inv => inv!.Items)
                    .Where(g => g.Id == grnId && g.TenantId == tenantId && g.DeletedAt == null)
                    .FirstOrDefaultAsync(ct);

                if (grn == null) return req.CreateResponse(HttpStatusCode.NotFound);

                var returned = await _db.PurchaseReturnItems
                    .Where(ri => ri.TenantId == tenantId
                              && ri.DeletedAt == null
                              && ri.Return!.GrnId == grnId
                              && ri.Return.SettlementStatus != "Cancelled")
                    .GroupBy(ri => ri.ItemId)
                    .Select(g => new { ItemId = g.Key, ReturnedQty = g.Sum(ri => ri.ReturnQuantity) })
                    .ToDictionaryAsync(x => x.ItemId, x => x.ReturnedQty, ct);

                var result = grn.GrnItems.Select(gi =>
                {
                    var invItem = grn.Invoice?.Items.FirstOrDefault(pi => pi.Id == gi.PurchaseItemId);
                    return new
                    {
                        gi.ItemId,
                        ItemName      = gi.Item != null ? gi.Item.ItemName : gi.ItemId.ToString(),
                        PurchaseRate  = invItem != null ? invItem.PurchaseRate : 0m,
                        BatchNumber   = invItem?.BatchNumber,
                        ExpiryDate    = invItem?.ExpiryDate,
                        SourceQty     = gi.AcceptedQuantity,
                        ReturnedQty   = returned.GetValueOrDefault(gi.ItemId, 0m),
                        ReturnableQty = gi.AcceptedQuantity - returned.GetValueOrDefault(gi.ItemId, 0m),
                    };
                }).ToList();

                return await OkJson(req, result);
            }
            else
            {
                return await Error(req, HttpStatusCode.BadRequest, "sourceType must be 'Invoice' or 'GRN'.");
            }
        }
        catch (Exception ex) { return await BadRequest(req, ex.Message); }
    }

    private static Guid ParseGuid(HttpRequestData req, string header)
    {
        if (!req.Headers.TryGetValues(header, out var values))
            throw new ArgumentException($"Missing required header {header}.");
        return Guid.Parse(values.First());
    }

    private static async Task<HttpResponseData> OkJson<T>(
        HttpRequestData req, T data, HttpStatusCode code = HttpStatusCode.OK)
    {
        var res = req.CreateResponse(code);
        await res.WriteAsJsonAsync(data);
        return res;
    }

    private static async Task<HttpResponseData> BadRequest(HttpRequestData req, string msg)
    {
        var res = req.CreateResponse(HttpStatusCode.BadRequest);
        await res.WriteStringAsync(msg);
        return res;
    }

    private static async Task<HttpResponseData> Error(HttpRequestData req, HttpStatusCode code, string msg)
    {
        var res = req.CreateResponse(code);
        await res.WriteStringAsync(msg);
        return res;
    }
}

