using System.Net;
using System.Text.Json;
using InventoryApi.Data;
using InventoryApi.Models.DTOs;
using InventoryApi.Models.Entities;
using InventoryApi.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Functions.GRN;

/// <summary>
/// POST /invoice-extraction/upload  — uploads PDF/image and runs OpenAI extraction.
/// POST /invoice-extraction/confirm — creates invoice + optional GRN from confirmed data.
///
/// The upload function uses an independent CancellationTokenSource (not linked to the
/// HTTP request lifetime) so the OpenAI call is not aborted by the Functions host
/// when approaching functionTimeout. The host timeout is set to 00:10:00; the
/// OpenAI client is configured with NetworkTimeout=4 min / maxRetries=0 so failures
/// surface as clean 502 responses rather than socket-abort 500s.
/// </summary>
public sealed class InvoiceExtractionFunctions
{
    private readonly IBlobStorageService             _blobs;
    private readonly IInvoiceExtractionService       _extractor;
    private readonly IApprovalService                _approval;
    private readonly IGrnService                     _grn;
    private readonly InventoryDbContext              _db;
    private readonly IConfiguration                  _config;
    private readonly ILogger<InvoiceExtractionFunctions> _log;

    private static readonly HashSet<string> _allowedMime =
        new(StringComparer.OrdinalIgnoreCase)
        { "image/jpeg", "image/png", "image/webp", "application/pdf" };

    private static readonly JsonSerializerOptions _json =
        new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public InvoiceExtractionFunctions(
        IBlobStorageService             blobs,
        IInvoiceExtractionService       extractor,
        IApprovalService                approval,
        IGrnService                     grn,
        InventoryDbContext              db,
        IConfiguration                  config,
        ILogger<InvoiceExtractionFunctions> log)
    {
        _blobs     = blobs;
        _extractor = extractor;
        _approval  = approval;
        _grn       = grn;
        _db        = db;
        _config    = config;
        _log       = log;
    }

    // ── POST /invoice-extraction/upload ──────────────────────────────────────
    [Function("UploadInvoiceForExtraction")]
    public async Task<HttpResponseData> Upload(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post",
            Route = "invoice-extraction/upload")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            if (_config["InvoiceExtraction:Enabled"] is "false")
                return await Error(req, HttpStatusCode.ServiceUnavailable,
                    "Invoice extraction is currently disabled.");

            var tenantId    = ParseGuid(req, "X-Tenant-Id");
            var contentType = GetHeader(req, "Content-Type")?.Split(';')[0].Trim()
                             ?? "application/octet-stream";
            var filename    = GetHeader(req, "X-Filename") is { } fn
                              ? Uri.UnescapeDataString(fn) : "invoice";

            if (!_allowedMime.Contains(contentType))
                return await Error(req, HttpStatusCode.BadRequest,
                    $"File type '{contentType}' is not supported. Allowed: JPEG, PNG, WebP, PDF.");

            // Buffer the request body into memory (fast — 2-3 MB max)
            using var buffer = new MemoryStream();
            await req.Body.CopyToAsync(buffer, ct);
            buffer.Position = 0;

            // Upload to blob storage so we have an audit URL
            var (docUrl, _, _) = await _blobs.UploadAsync(
                buffer, filename, contentType, tenantId, ct);

            // ── Key fix: do NOT pass the HTTP CancellationToken to OpenAI. ──
            // The Functions host cancels `ct` when approaching functionTimeout
            // (configured to 00:10:00). That cancellation causes a socket-abort
            // (Windows error 995) inside the OpenAI SDK, producing a misleading
            // 500. Instead, give the OpenAI call its own independent timeout.
            using var openAiCts = new CancellationTokenSource(TimeSpan.FromMinutes(8));

            buffer.Position = 0;
            var sessionId = Guid.NewGuid().ToString("N");
            var preview = await _extractor.ExtractAsync(
                buffer, filename, contentType, sessionId, docUrl,
                tenantId, openAiCts.Token);

            return await OkJson(req, preview);
        }
        catch (ArgumentException ex)
        {
            return await Error(req, HttpStatusCode.BadRequest, ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            _log.LogError(ex, "Invoice extraction failed — OpenAI/config error");
            return await Error(req, HttpStatusCode.BadGateway,
                "Invoice data could not be extracted. " + ex.Message);
        }
        catch (OperationCanceledException) when (!ct.IsCancellationRequested)
        {
            // openAiCts timed out (8 min) — not the HTTP request being cancelled
            _log.LogWarning("Invoice extraction timed out after 8 minutes.");
            return await Error(req, HttpStatusCode.GatewayTimeout,
                "Invoice extraction timed out. The file may be too large or the AI service is busy. Please try again.");
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "Upload/extraction pipeline failed unexpectedly");
            return await Error(req, HttpStatusCode.InternalServerError,
                "An unexpected error occurred during invoice extraction. Please try again.");
        }
    }

    // ── POST /invoice-extraction/confirm ─────────────────────────────────────
    /// <summary>
    /// Creates the invoice (and optionally the GRN) using the user-confirmed data.
    /// The existing CreateInvoiceAsync + GenerateGrnFromInvoiceAsync services are
    /// called without modification – this endpoint is purely an orchestration wrapper.
    /// </summary>
    [Function("ConfirmInvoiceExtraction")]
    public async Task<HttpResponseData> Confirm(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post",
            Route = "invoice-extraction/confirm")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId   = ParseGuid(req, "X-User-Id");

            var body = await JsonSerializer.DeserializeAsync<ConfirmExtractionRequest>(
                req.Body, _json, ct)
                ?? throw new ArgumentException("Invalid request body.");

            // ── 1. Create invoice (existing logic, unchanged) ──────────────
            // Compute TCS percent from the extracted invoice-level TCS amount.
            // TCS is applied on the line-item subtotal (before GST, after discount).
            var lineSubtotal = body.Items.Sum(i =>
                i.OrderedQuantity * i.PurchaseRate * (1m - i.DiscountPercent / 100m));
            var tcsPercent = (lineSubtotal > 0 && body.TcsTotalAmount > 0)
                ? Math.Round(body.TcsTotalAmount / lineSubtotal * 100m, 4)
                : 0m;

            var createRequest = new CreateInvoiceRequest(
                VendorId:              body.VendorId,
                StoreId:               body.StoreId,
                InvoiceNumber:         body.InvoiceNumber,
                InvoiceDate:           body.InvoiceDate,
                DeliveryChallNumber:   null,
                DeliveryChallDate:     null,
                VendorOrderNumber:     null,
                VendorDeliveryNoteNumber: null,
                VendorSapNumber:       null,
                VendorBatchRef:        null,
                BillingMode:           "Bulk",
                PatientName:           null,
                PatientIpNo:           null,
                TcsPercent:            tcsPercent,
                Remarks:               body.Remarks,
                Items:                 body.Items.Select(i => new CreatePurchaseItemRequest(
                    ItemId:          i.ItemId,
                    OrderedQuantity: i.OrderedQuantity,
                    FreeQuantity:    i.FreeQuantity,
                    BatchNumber:     i.BatchNumber,
                    ExpiryDate:      i.ExpiryDate,
                    Barcode:         i.Barcode,
                    OriginalMrp:     i.Mrp,
                    Mrp:             i.Mrp,
                    PurchaseRate:    i.PurchaseRate,
                    DiscountPercent: i.DiscountPercent,
                    IsFullDiscount:  false,
                    HsnCode:         i.HsnCode,
                    GstPercent:      i.GstPercent,
                    CgstPercent:     i.CgstPercent,
                    SgstPercent:     i.SgstPercent,
                    IgstPercent:     i.IgstPercent,
                    PatientName:     null,
                    PatientIpNo:     null,
                    SurgeryId:       null,
                    ItemRemarks:     i.ItemRemarks,
                    SellingPrice:    i.SellingPrice,
                    Packing:         i.Packing,
                    UnitsPerPack:    i.UnitsPerPack,
                    MrpOnPack:       i.MrpOnPack,
                    TransferMrp:     i.TransferMrp,
                    IsAssetItem:     i.IsAssetItem,
                    TaxOnFree:       i.TaxOnFree,
                    IsReplacement:   i.IsReplacement,
                    SerialNumber:    i.SerialNumber,
                    ManufacturerName: i.ManufacturerName,
                    CountryOfOrigin: i.CountryOfOrigin,
                    MfgDate:         i.MfgDate,
                    ScheduleType:    i.ScheduleType,
                    IsColdChain:     i.IsColdChain,
                    BrandName:       i.BrandName,
                    VendorSku:       i.VendorSku,
                    IsInterState:    i.IsInterState,
                    ExtraFields:     i.ExtraFieldsJson
                )).ToList(),
                InvoiceType:          body.InvoiceType,
                PaymentMode:          body.PaymentMode,
                CreditPeriod:         body.CreditPeriod,
                DueDate:              body.DueDate,
                Reference:            body.Reference,
                PurchaseCategory:     body.PurchaseCategory,
                Irn:                  body.Irn,
                AckNo:                body.AckNo,
                AckDate:              body.AckDate,
                EWayBillNo:           body.EWayBillNo,
                EWayBillDate:         body.EWayBillDate,
                DateOfDelivery:       body.DateOfDelivery,
                IsReverseCharge:      body.IsReverseCharge,
                VendorGstinOnInvoice: body.VendorGstinOnInvoice
            );

            // ── 1 & 2. Idempotent invoice + GRN creation ─────────────────
            // If a previous attempt partially succeeded (invoice committed but GRN
            // failed, or the request was retried), reuse the existing records rather
            // than hitting the UNIQUE (tenant_id, invoice_number, vendor_id) constraint.
            var existingInvoice = await _db.PurchaseInvoices
                .FirstOrDefaultAsync(i => i.TenantId == tenantId
                                       && i.InvoiceNumber == createRequest.InvoiceNumber
                                       && i.VendorId == createRequest.VendorId
                                       && i.DeletedAt == null, ct);

            PurchaseInvoiceDto invoiceDto;
            GrnHeaderDto? grnDto = null;

            if (existingInvoice is not null)
            {
                // Invoice already exists — reload full DTO and skip creation
                invoiceDto = await _approval.GetInvoiceAsync(tenantId, existingInvoice.Id, ct)
                    ?? throw new InvalidOperationException("Invoice found but could not be reloaded.");

                if (body.GenerateGrn)
                {
                    var existingGrn = await _db.GrnHeaders
                        .FirstOrDefaultAsync(h => h.InvoiceId == existingInvoice.Id
                                               && h.TenantId == tenantId
                                               && h.DeletedAt == null, ct);
                    grnDto = existingGrn is not null
                        ? await _grn.GetGrnAsync(tenantId, existingGrn.Id, ct)
                        : await _grn.GenerateGrnFromInvoiceAsync(
                              tenantId, existingInvoice.Id, userId, body.GrnDate, null, ct);
                }
            }
            else
            {
                // Normal path: create invoice + optional GRN atomically
                await using var tx = await _db.Database.BeginTransactionAsync(ct);

                invoiceDto = await _approval.CreateInvoiceAsync(tenantId, userId, createRequest, ct);

                if (body.GenerateGrn)
                {
                    grnDto = await _grn.GenerateGrnFromInvoiceAsync(
                        tenantId, invoiceDto.Id, userId, body.GrnDate, null, ct);
                }

                await tx.CommitAsync(ct);
            }

            // ── 3. Write extraction audit log (──────────────────────────────
            try
            {
                var auditLog = new InvoiceExtractionAuditLog
                {
                    Id                   = Guid.NewGuid(),
                    TenantId             = tenantId,
                    UserId               = userId,
                    SessionId            = body.SessionId,
                    Outcome              = "Confirmed",
                    OriginalFilename     = body.OriginalFilename ?? string.Empty,
                    DocumentUrl          = body.DocumentUrl,
                    BlobPurgeAt          = DateTime.UtcNow.AddDays(90),
                    BlobPurged           = false,
                    ProviderModel        = body.ProviderModel ?? string.Empty,
                    ProcessingMs         = body.ProcessingMs,
                    HighFieldCount       = body.HighFieldCount,
                    ReviewFieldCount     = body.ReviewFieldCount,
                    LowFieldCount        = body.LowFieldCount,
                    LineItemCount        = body.Items.Count,
                    FieldOverrideCount   = body.FieldOverrideCount,
                    OverriddenFieldsJson = body.OverriddenFieldsJson,
                    CreatedInvoiceId     = invoiceDto.Id,
                    CreatedGrnId         = grnDto?.Id,
                    CreatedAt            = DateTime.UtcNow,
                };
                _db.InvoiceExtractionAuditLogs.Add(auditLog);
                await _db.SaveChangesAsync(ct);

                _log.LogInformation(
                    "Extraction audit log written for session {SessionId}: invoice {InvoiceId}, overrides {Overrides}",
                    body.SessionId, invoiceDto.Id, body.FieldOverrideCount);
            }
            catch (Exception auditEx)
            {
                // Audit failure must NOT block the main response
                _log.LogError(auditEx, "Failed to write extraction audit log for session {SessionId}", body.SessionId);
            }

            return await OkJson(req, new ConfirmExtractionResponse(invoiceDto, grnDto), HttpStatusCode.Created);
        }
        catch (ArgumentException ex)
        {
            return await Error(req, HttpStatusCode.BadRequest, ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return await Error(req, HttpStatusCode.Conflict, ex.Message);
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "Unexpected error during extraction confirm");
            return await Error(req, HttpStatusCode.InternalServerError, ex.GetBaseException().Message);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static Guid ParseGuid(HttpRequestData req, string header)
    {
        if (!req.Headers.TryGetValues(header, out var values))
            throw new ArgumentException($"Missing required header: {header}.");
        return Guid.Parse(values.First());
    }

    private static string? GetHeader(HttpRequestData req, string header)
        => req.Headers.TryGetValues(header, out var v) ? v.First() : null;

    private static async Task<HttpResponseData> OkJson<T>(
        HttpRequestData req, T data, HttpStatusCode code = HttpStatusCode.OK)
    {
        var res = req.CreateResponse(code);
        await res.WriteAsJsonAsync(data);
        return res;
    }

    private static async Task<HttpResponseData> Error(HttpRequestData req, HttpStatusCode code, string msg)
    {
        var res = req.CreateResponse(code);
        await res.WriteStringAsync(msg);
        return res;
    }
}
