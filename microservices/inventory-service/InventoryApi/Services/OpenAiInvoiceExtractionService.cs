using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using InventoryApi.Data;
using InventoryApi.Models.DTOs;
using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using OpenAI;
using OpenAI.Chat;
using System.ClientModel.Primitives;

namespace InventoryApi.Services;

/// <summary>
/// Extracts invoice data using OpenAI Vision (GPT-4o-mini).
/// Converts the raw document to a base-64 image or reads each PDF page as an image
/// and sends it to the Chat Completions API with a structured-output schema prompt.
/// </summary>
public sealed class OpenAiInvoiceExtractionService : IInvoiceExtractionService
{
    // ── Confidence thresholds ────────────────────────────────────────────────
    private const double HighThreshold   = 0.90;
    private const double ReviewThreshold = 0.70;

    private readonly InventoryDbContext _db;
    private readonly IConfiguration    _config;
    private readonly ILogger<OpenAiInvoiceExtractionService> _log;

    public OpenAiInvoiceExtractionService(
        InventoryDbContext db,
        IConfiguration    config,
        ILogger<OpenAiInvoiceExtractionService> log)
    {
        _db     = db;
        _config = config;
        _log    = log;
    }

    public async Task<InvoiceExtractionPreview> ExtractAsync(
        Stream fileStream, string originalFilename, string contentType,
        string sessionId, string? documentUrl,
        Guid tenantId, CancellationToken ct = default)
    {
        var sw = System.Diagnostics.Stopwatch.StartNew();

        // ── 1. Buffer stream into raw bytes ───────────────────────────────────
        // Do NOT build a data: URI — .NET's Uri class has a ~65 KB limit which
        // a 2-3 MB invoice PDF will exceed. Use BinaryData so the OpenAI SDK
        // handles base64 encoding internally.
        using var ms = new MemoryStream();
        await fileStream.CopyToAsync(ms, ct);
        var fileBytes = ms.ToArray();

        // ── 2. Build prompt ──────────────────────────────────────────────────
        var systemPrompt = BuildSystemPrompt();
        var userPrompt   = "Extract all invoice data from this document and return a JSON object following the schema in the system prompt. Be as accurate as possible and assign confidence scores to each field.";

        // ── 3. Call OpenAI ───────────────────────────────────────────────────
        var apiKey = _config["OpenAI:ApiKey"]
                  ?? _config["OPENAI_API_KEY"]
                  ?? throw new InvalidOperationException("OpenAI API key not configured. Set OpenAI:ApiKey in local.settings.json.");

        // ── Model selection ──────────────────────────────────────────────────
        // gpt-4.1-mini supports both text and vision (image) inputs and is the
        // only model confirmed accessible on this project API key.
        var textModel   = _config["OpenAI:Model"]       ?? "gpt-4.1-mini";
        var visionModel = _config["OpenAI:VisionModel"] ?? textModel;

        var oaiOptions = new OpenAIClientOptions
        {
            // 4 minutes per attempt — generous enough for a large PDF with many line items.
            // maxRetries=0: fail cleanly once rather than retrying and compounding wait time.
            NetworkTimeout = TimeSpan.FromMinutes(4),
            RetryPolicy    = new ClientRetryPolicy(maxRetries: 0),
        };
        var oaiClient = new OpenAIClient(new System.ClientModel.ApiKeyCredential(apiKey), oaiOptions);

        bool isPdf = contentType == "application/pdf"
                  || originalFilename.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase);

        List<ChatMessageContentPart> userParts;
        string activeModel;

        if (isPdf)
        {
            // ── Try text extraction first (fast, cheap) ────────────────────
            string pdfText = "";
            bool hasMeaningfulText = false;
            try
            {
                pdfText = ExtractPdfText(fileBytes);
                // Scanned PDFs: PdfPig returns only page-header placeholders with
                // no actual words. Require ≥10 real words before treating as text PDF.
                var wordCount = pdfText
                    .Replace("--- Page", " ").Replace("---", " ")
                    .Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;
                hasMeaningfulText = wordCount >= 10;
            }
            catch (Exception ex)
            {
                _log.LogWarning(ex,
                    "PdfPig failed for '{File}' — treating as scanned PDF and falling back to vision",
                    originalFilename);
            }

            if (hasMeaningfulText)
            {
                // ── Path A: Text-based PDF — send extracted text (no vision needed) ──
                const int maxPdfChars = 15_000;
                if (pdfText.Length > maxPdfChars)
                {
                    _log.LogWarning("PDF text truncated from {Full} to {Max} chars for session {SessionId}",
                        pdfText.Length, maxPdfChars, sessionId);
                    pdfText = pdfText[..maxPdfChars];
                }
                activeModel = textModel;
                _log.LogInformation(
                    "Session {SessionId}: text PDF path — {Words} words extracted, model {Model}",
                    sessionId,
                    pdfText.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length,
                    activeModel);
                userParts = [
                    ChatMessageContentPart.CreateTextPart(userPrompt),
                    ChatMessageContentPart.CreateTextPart($"Invoice document text:\n\n{pdfText}")
                ];
            }
            else
            {
                // ── Path B: Scanned PDF — render pages to PNG, send as vision images ──
                // OpenAI Chat Completions only accepts image/* MIME types (jpeg/png/gif/webp).
                // Raw PDF bytes must be rendered page-by-page to PNG first.
                activeModel = visionModel;
                // Use only the first page at low DPI + Low detail to keep request size small
                // and stay well within the function timeout for large scanned PDFs.
                var pageImages = RenderPdfPagesToPng(fileBytes, maxPages: 1).ToList();
                if (pageImages.Count == 0)
                    throw new InvalidOperationException("Could not render any pages from this PDF. The file may be corrupted or password-protected.");
                _log.LogInformation(
                    "Session {SessionId}: scanned PDF path — rendered {Pages} page(s) to PNG, vision model {Model}",
                    sessionId, pageImages.Count, activeModel);
                var parts = new List<ChatMessageContentPart> { ChatMessageContentPart.CreateTextPart(userPrompt) };
                foreach (var png in pageImages)
                    parts.Add(ChatMessageContentPart.CreateImagePart(
                        BinaryData.FromBytes(png), "image/png", ChatImageDetailLevel.Low));
                userParts = parts;
            }
        }
        else
        {
            // ── Path C: Image (JPEG / PNG / WebP / screenshot) ────────────────────
            activeModel = visionModel;
            _log.LogInformation(
                "Session {SessionId}: image path — using vision model {Model}",
                sessionId, activeModel);
            userParts = [
                ChatMessageContentPart.CreateTextPart(userPrompt),
                ChatMessageContentPart.CreateImagePart(
                    BinaryData.FromBytes(fileBytes),
                    contentType,
                    ChatImageDetailLevel.High)
            ];
        }

        var chatClient = oaiClient.GetChatClient(activeModel);

        var messages = new List<ChatMessage>
        {
            ChatMessage.CreateSystemMessage(systemPrompt),
            ChatMessage.CreateUserMessage(userParts.ToArray())
        };

        string rawJson;
        try
        {
            var completion = await chatClient.CompleteChatAsync(messages, new ChatCompletionOptions
            {
                MaxOutputTokenCount = 16384,
                Temperature         = 0f,
                // Enforce JSON-only output at the protocol level — prevents the model
                // from returning prose descriptions instead of the required JSON schema.
                // System prompt already contains the word "JSON" which satisfies the API requirement.
                ResponseFormat      = ChatResponseFormat.CreateJsonObjectFormat(),
            }, ct);
            rawJson = completion.Value.Content[0].Text.Trim();
            // Strip markdown fences (```json ... ``` or ``` ... ```)
            if (rawJson.StartsWith("```"))
            {
                var firstNewline = rawJson.IndexOf('\n');
                rawJson = firstNewline >= 0 ? rawJson[(firstNewline + 1)..].Trim() : rawJson;
            }
            if (rawJson.EndsWith("```"))
                rawJson = rawJson[..rawJson.LastIndexOf("```")].Trim();
            // Extract outermost JSON object even if the model prefixed/suffixed prose
            var jsonStart = rawJson.IndexOf('{');
            var jsonEnd   = rawJson.LastIndexOf('}');
            if (jsonStart >= 0 && jsonEnd > jsonStart)
                rawJson = rawJson[jsonStart..(jsonEnd + 1)];

            if (jsonStart < 0 || jsonEnd <= jsonStart)
            {
                _log.LogWarning(
                    "Model returned no JSON object for session {SessionId}. Response (first 500 chars): {Response}",
                    sessionId, rawJson.Length > 500 ? rawJson[..500] : rawJson);
                throw new InvalidOperationException(
                    "The AI model could not extract data from this document. Try a clearer scan or a different file.");
            }
        }
        catch (InvalidOperationException) { throw; }
        catch (Exception ex)
        {
            _log.LogError(ex, "OpenAI extraction failed for session {SessionId}", sessionId);
            throw new InvalidOperationException($"Extraction provider error: {ex.Message}", ex);
        }

        sw.Stop();
        _log.LogInformation("OpenAI extraction for session {SessionId} completed in {Ms} ms", sessionId, sw.ElapsedMilliseconds);

        // ── 4. Parse raw JSON response ───────────────────────────────────────
        // Sanitize first: fix literal newlines/tabs/CRs inside string values
        // (gpt-4.1-mini occasionally emits unescaped control chars in json_object mode)
        rawJson = SanitizeJsonControlChars(rawJson);
        JsonNode? root;
        try   { root = JsonNode.Parse(rawJson); }
        catch (Exception parseEx)
        {
            _log.LogError(parseEx,
                "JSON parse failed for session {SessionId}. Raw response (first 600 chars): {Raw}",
                sessionId, rawJson.Length > 600 ? rawJson[..600] : rawJson);
            throw new InvalidOperationException(
                $"Model response could not be parsed as JSON. Response starts: {(rawJson.Length > 200 ? rawJson[..200] : rawJson)}");
        }

        // ── 5. Resolve vendors / stores against master data ──────────────────
        var vendorName = TryString(root, "vendor_name");
        var gstin      = TryString(root, "vendor_gstin");
        var vendorCandidates = await ResolveVendorCandidatesAsync(tenantId, vendorName, gstin, ct);
        var resolvedVendorId = vendorCandidates.Count > 0 && vendorCandidates[0].Score >= (decimal)HighThreshold
            ? vendorCandidates[0].Id : (Guid?)null;

        var storeName  = TryString(root, "store_name");
        var storeCandidates  = await ResolveStoreCandidatesAsync(tenantId, storeName, ct);
        var resolvedStoreId  = storeCandidates.Count > 0 && storeCandidates[0].Score >= (decimal)HighThreshold
            ? storeCandidates[0].Id : (Guid?)null;

        // ── 6. Resolve line items ────────────────────────────────────────────
        var rawItems = root?["line_items"]?.AsArray() ?? new JsonArray();
        var lineItems = new List<ExtractedLineItem>();
        foreach (var item in rawItems)
        {
            var desc       = TryString(item, "description");
            var hsn        = TryString(item, "hsn_code");
            var candidates = await ResolveItemCandidatesAsync(tenantId, desc, hsn, ct);
            var resolvedId = candidates.Count > 0 && candidates[0].Score >= (decimal)HighThreshold
                ? candidates[0].Id : (Guid?)null;
            var resolvedName = resolvedId.HasValue ? candidates[0].Name : null;

            var gstPct  = TryDecimal(item, "gst_percent");
            var cgst    = TryDecimal(item, "cgst_percent");
            var sgst    = TryDecimal(item, "sgst_percent");
            var igst    = TryDecimal(item, "igst_percent");
            var interState = igst > 0 || (cgst == 0 && sgst == 0 && gstPct > 0);

            // Normalise split: if only total GST given, split evenly
            if (cgst == 0 && sgst == 0 && igst == 0 && gstPct > 0)
            {
                cgst = gstPct / 2;
                sgst = gstPct / 2;
            }

            lineItems.Add(new ExtractedLineItem(
                RawDescription:  MakeField(desc,     desc,     1.0),
                HsnCode:         MakeField(hsn,      hsn,      string.IsNullOrWhiteSpace(hsn) ? 0.5 : 0.9),
                ItemCandidates:  candidates,
                ResolvedItemId:  resolvedId,
                ResolvedItemName: resolvedName,
                OrderedQuantity: MakeDecimal(item, "quantity",         0.9),
                FreeQuantity:    MakeDecimal(item, "free_quantity",    0.7),
                BatchNumber:     MakeField(TryString(item, "batch_number"), TryString(item, "batch_number"), 0.8),
                ExpiryDate:      MakeDate(TryString(item, "expiry_date"), 0.8),
                PurchaseRate:    MakeDecimal(item, "purchase_rate",    0.9),
                Mrp:             MakeDecimal(item, "mrp",              0.85),
                DiscountPercent: MakeDecimal(item, "discount_percent", 0.8),
                SellingPrice:    MakeDecimal(item, "selling_price",    0.7),
                GstPercent:      MakeField(gstPct, gstPct.ToString("F2"), gstPct > 0 ? 0.9 : 0.6),
                CgstPercent:     MakeField(cgst,   cgst.ToString("F2"),   cgst > 0 ? 0.9 : 0.6),
                SgstPercent:     MakeField(sgst,   sgst.ToString("F2"),   sgst > 0 ? 0.9 : 0.6),
                IgstPercent:     MakeField(igst,   igst.ToString("F2"),   igst > 0 ? 0.9 : 0.6),
                IsInterState:    MakeField(interState, interState.ToString(), 0.85),
                // Traceability
                SerialNumbers:   MakeField(
                    item?["serial_numbers"]?.AsArray()
                        ?.Select(n => n?.GetValue<string>())
                        .Where(s => !string.IsNullOrWhiteSpace(s))
                        .Select(s => s!)
                        .ToArray() as string[],
                    null, 0.85),
                ManufacturerName: MakeField(TryString(item, "manufacturer_name"), TryString(item, "manufacturer_name"), 0.8),
                CountryOfOrigin:  MakeField(TryString(item, "country_of_origin"), TryString(item, "country_of_origin"), 0.75),
                MfgDate:          MakeDate(TryString(item, "mfg_date"), 0.75),
                ScheduleType:     MakeField(TryString(item, "schedule_type"), TryString(item, "schedule_type"), 0.8),
                IsColdChain:      MakeField(
                    item?["is_cold_chain"]?.GetValue<bool>() ?? false,
                    null, 0.8),
                BrandName:        MakeField(TryString(item, "brand_name"), TryString(item, "brand_name"), 0.8),
                VendorSku:        MakeField(TryString(item, "vendor_sku"), TryString(item, "vendor_sku"), 0.75),
                ExtraFieldsJson:  MakeField(
                    item?["extra_fields"] is JsonObject extraObj ? extraObj.ToJsonString() : null,
                    null, 0.75)
            ));
        }

        // ── 7. Build header ──────────────────────────────────────────────────
        var invoiceNo   = TryString(root, "invoice_number");
        var invDateStr  = TryString(root, "invoice_date");
        var paymentMode = TryString(root, "payment_mode");
        var invoiceType = NormaliseInvoiceType(TryString(root, "invoice_type"));
        var creditDays  = TryInt(root, "credit_period_days");

        var header = new ExtractedInvoiceHeader(
            InvoiceNumber:   MakeField(invoiceNo, invoiceNo, string.IsNullOrWhiteSpace(invoiceNo) ? 0.3 : 0.95),
            InvoiceDate:     MakeDate(invDateStr, 0.9),
            GrnDate:         MakeDate(invDateStr, 0.85),          // default GRN date = invoice date
            InvoiceType:     MakeField(invoiceType, invoiceType, string.IsNullOrWhiteSpace(invoiceType) ? 0.5 : 0.9),
            PaymentMode:     MakeField(paymentMode, paymentMode, string.IsNullOrWhiteSpace(paymentMode) ? 0.4 : 0.85),
            CreditPeriod:    MakeField(creditDays, creditDays?.ToString(), creditDays.HasValue ? 0.85 : 0.5),
            Reference:       MakeField(TryString(root, "reference"), TryString(root, "reference"), 0.8),
            Remarks:         MakeField(TryString(root, "remarks"),   TryString(root, "remarks"),   0.7),
            VendorName:      MakeField(vendorName, vendorName, string.IsNullOrWhiteSpace(vendorName) ? 0.3 : 0.9),
            VendorGstin:     MakeField(gstin,      gstin,      string.IsNullOrWhiteSpace(gstin)      ? 0.4 : 0.92),
            VendorContact:   MakeField(TryString(root, "vendor_contact"), TryString(root, "vendor_contact"), 0.7),
            VendorPhone:     MakeField(TryString(root, "vendor_phone"),   TryString(root, "vendor_phone"),   0.7),
            VendorEmail:     MakeField(TryString(root, "vendor_email"),   TryString(root, "vendor_email"),   0.65),
            VendorCandidates: vendorCandidates,
            ResolvedVendorId: resolvedVendorId,
            StoreName:       MakeField(storeName,   storeName,   string.IsNullOrWhiteSpace(storeName) ? 0.4 : 0.8),
            StoreCandidates: storeCandidates,
            ResolvedStoreId: resolvedStoreId,
            // e-Invoice & E-Way Bill
            Irn:                  MakeField(TryString(root, "irn"),             TryString(root, "irn"),             0.9),
            AckNo:                MakeField(TryString(root, "ack_no"),          TryString(root, "ack_no"),          0.9),
            AckDate:              MakeDate(TryString(root, "ack_date"),         0.85),
            EWayBillNo:           MakeField(TryString(root, "e_way_bill_no"),   TryString(root, "e_way_bill_no"),   0.85),
            EWayBillDate:         MakeDate(TryString(root, "e_way_bill_date"),  0.8),
            DateOfDelivery:       MakeDate(TryString(root, "date_of_delivery"), 0.8),
            IsReverseCharge:      MakeField(root?["is_reverse_charge"]?.GetValue<bool>() ?? false, null, 0.85),
            VendorGstinOnInvoice: MakeField(TryString(root, "vendor_gstin_on_invoice") ?? gstin, null, 0.9)
        );

        // ── 8. Totals ────────────────────────────────────────────────────────
        var totals = new ExtractedTotals(
            Subtotal:       MakeDecimalFromRoot(root, "total_subtotal",  0.88),
            TotalCgst:      MakeDecimalFromRoot(root, "total_cgst",      0.88),
            TotalSgst:      MakeDecimalFromRoot(root, "total_sgst",      0.88),
            TotalIgst:      MakeDecimalFromRoot(root, "total_igst",      0.88),
            TotalDiscount:  MakeDecimalFromRoot(root, "total_discount",  0.8),
            RoundingAmount: MakeDecimalFromRoot(root, "rounding_amount", 0.75),
            NetAmount:      MakeDecimalFromRoot(root, "net_amount",      0.92),
            TcsAmount:      MakeDecimalFromRoot(root, "tcs_amount",      0.85)
        );

        // ── 9. Duplicate check ───────────────────────────────────────────────
        bool hasDup = false;
        string? dupDetail = null;
        if (!string.IsNullOrWhiteSpace(invoiceNo) && resolvedVendorId.HasValue)
        {
            hasDup = await _db.PurchaseInvoices
                .AnyAsync(i => i.TenantId == tenantId
                            && i.VendorId == resolvedVendorId
                            && i.InvoiceNumber == invoiceNo
                            && i.DeletedAt == null, ct);
            if (hasDup) dupDetail = $"Invoice '{invoiceNo}' for this vendor already exists.";
        }

        return new InvoiceExtractionPreview(
            SessionId:              sessionId,
            DocumentUrl:            documentUrl,
            OriginalFilename:       originalFilename,
            ProviderModel:          activeModel,
            ProcessingMs:           (int)sw.ElapsedMilliseconds,
            HasDuplicateWarning:    hasDup,
            DuplicateWarningDetail: dupDetail,
            Header:                 header,
            LineItems:              lineItems,
            Totals:                 totals
        );
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static string BuildSystemPrompt() => """
        You are an expert document-data-extraction assistant for pharmaceutical and medical supply invoices.
        Extract the following fields from the invoice image/PDF and return ONLY a valid JSON object with no markdown fences.

        Root-level fields:
          invoice_number        (string)
          invoice_date          (string ISO8601 or DD-MM-YYYY or MM/DD/YYYY – output as YYYY-MM-DD)
          invoice_type          (string: "Invoice" or "Packing Slip")
          payment_mode          (string: "Cash" | "Credit" | "Cheque" | "UPI" | "NEFT" | "RTGS" – best guess)
          credit_period_days    (integer or null)
          reference             (string – PO number / challan number if present)
          remarks               (string – any other relevant notes)
          vendor_name           (string)
          vendor_gstin          (string – GSTIN of seller, exactly as printed)
          vendor_contact        (string)
          vendor_phone          (string)
          vendor_email          (string)
          store_name            (string – destination store / delivery address if visible)
          total_subtotal        (number)
          total_cgst            (number)
          total_sgst            (number)
          total_igst            (number)
          total_discount        (number)
          rounding_amount       (number)
          net_amount            (number – grand total)
          tcs_amount            (number – Tax Collected at Source amount printed on invoice, else 0)
          irn                   (string – e-Invoice IRN hash if QR or printed, else null)
          ack_no                (string – e-Invoice acknowledgement number, else null)
          ack_date              (string YYYY-MM-DD – e-Invoice ack date, else null)
          e_way_bill_no         (string – E-Way Bill number if present, else null)
          e_way_bill_date       (string YYYY-MM-DD – EWB date if present, else null)
          date_of_delivery      (string YYYY-MM-DD – actual delivery date if shown, else null)
          is_reverse_charge     (boolean – true only if invoice explicitly states Reverse Charge)
          vendor_gstin_on_invoice (string – GSTIN of seller exactly as printed, same as vendor_gstin unless different)

        line_items (array of objects, one per product line):
          description           (string – full product name as printed)
          hsn_code              (string – 6 or 8 digit HSN/SAC code)
          quantity              (number – ordered/billed quantity)
          free_quantity         (number or 0)
          batch_number          (string)
          expiry_date           (string YYYY-MM-DD or null)
          mfg_date              (string YYYY-MM-DD or null – manufacturing date if shown)
          purchase_rate         (number – price per unit)
          mrp                   (number – maximum retail price per unit)
          selling_price         (number or 0)
          discount_percent      (number 0–100)
          gst_percent           (number – total GST rate, e.g. 12)
          cgst_percent          (number – e.g. 6)
          sgst_percent          (number – e.g. 6)
          igst_percent          (number – 0 for intra-state)
          serial_numbers        (array of strings – each serial/lot number found for this line; empty array if none)
          manufacturer_name     (string – manufacturer as printed, e.g. Carl Zeiss Meditec AG; null if not shown)
          country_of_origin     (string – country of manufacture if shown; null if not)
          schedule_type         (string – drug schedule code: OTC, G, H, H1, X; null if not pharma)
          is_cold_chain         (boolean – true if label says 2-8°C / cold chain / refrigerate)
          brand_name            (string – trade name / brand if different from description; null if same)
          vendor_sku            (string – vendor catalog/product code if shown; null if not)
          is_inter_state        (boolean – true when igst_percent > 0)
          extra_fields          (object – any other structured fields found: diopter, lens_model, coating, add_power, tip_size, job_no, MDR_class; null if none)

        IMPORTANT RULES:
        - If a line item has multiple serial numbers listed (e.g. Zeiss IOL with serial e.g. "SN: 12345, 67890"), put each in serial_numbers array — one entry per serial.
        - If an injector or cartridge is bundled in a product description (e.g. "Trifocal IOL with Injector" or "Preloaded Cartridge"), extract the IOL and the injector as SEPARATE line items.
        - For bundled injector line item: copy the parent line's hsn_code (or use 9018.90), set quantity = parent quantity, purchase_rate = 0, mrp = 0 (it's included), description = "Injector/Cartridge (bundled with [parent item name])".
        - extra_fields must be a JSON object (key-value pairs), not a string.
        """;

    private static string? TryString(JsonNode? node, string key)
        => node?[key]?.GetValue<string>()?.Trim()
           ?? node?[key]?.ToString()?.Trim();

    private static decimal TryDecimal(JsonNode? node, string key)
    {
        try { return (decimal)(node?[key]?.GetValue<double>() ?? 0); }
        catch { return 0m; }
    }

    private static int? TryInt(JsonNode? node, string key)
    {
        try { return node?[key]?.GetValue<int>(); }
        catch { return null; }
    }

    private static ExtractedField<T> MakeField<T>(T? value, string? sourceText, double confidence)
    {
        var band = confidence >= HighThreshold   ? ExtractionConfidence.High
                 : confidence >= ReviewThreshold ? ExtractionConfidence.Review
                                                 : ExtractionConfidence.Low;
        var mismatch = band == ExtractionConfidence.High ? null
                     : band == ExtractionConfidence.Review ? "Verify value matches document"
                     : "Could not reliably extract – please enter manually";
        return new ExtractedField<T>(value, sourceText, band, mismatch);
    }

    private static ExtractedField<decimal> MakeDecimal(JsonNode? node, string key, double confidence)
        => MakeField(TryDecimal(node, key), TryDecimal(node, key).ToString("F2"), confidence);

    private static ExtractedField<decimal> MakeDecimalFromRoot(JsonNode? root, string key, double confidence)
        => MakeDecimal(root, key, confidence);

    private static ExtractedField<DateTime?> MakeDate(string? raw, double confidence)
    {
        DateTime? parsed = null;
        string? mismatch = null;

        if (!string.IsNullOrWhiteSpace(raw))
        {
            // Try ISO first, then common regional formats
            string[] fmts = ["yyyy-MM-dd", "dd-MM-yyyy", "dd/MM/yyyy", "MM/dd/yyyy", "d-M-yyyy", "d/M/yyyy"];
            foreach (var fmt in fmts)
            {
                if (DateTime.TryParseExact(raw, fmt,
                        System.Globalization.CultureInfo.InvariantCulture,
                        System.Globalization.DateTimeStyles.None, out var dt))
                {
                    parsed = dt;
                    break;
                }
            }
            if (parsed == null)
            {
                if (DateTime.TryParse(raw, out var dt2)) parsed = dt2;
                else { confidence = 0.3; mismatch = "Date format unclear – please verify"; }
            }
            // Warn if date is in the future (> 1 day ahead)
            if (parsed.HasValue && parsed.Value > DateTime.UtcNow.AddDays(1))
                mismatch = "Date appears to be in the future – please verify";
        }
        else
        {
            confidence = 0.3;
            mismatch   = "Could not extract date – please enter manually";
        }

        var band = confidence >= HighThreshold   ? ExtractionConfidence.High
                 : confidence >= ReviewThreshold ? ExtractionConfidence.Review
                                                 : ExtractionConfidence.Low;
        return new ExtractedField<DateTime?>(parsed, raw, band, mismatch);
    }

    private static string? NormaliseInvoiceType(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return "Invoice";
        return raw.Contains("packing", StringComparison.OrdinalIgnoreCase) ? "Packing Slip" : "Invoice";
    }

    // ── Master-data candidate resolution ─────────────────────────────────────

    private async Task<IReadOnlyList<ExtractionCandidate>> ResolveVendorCandidatesAsync(
        Guid tenantId, string? name, string? gstin, CancellationToken ct)
    {
        var q = _db.Vendors.Where(v => v.TenantId == tenantId && v.DeletedAt == null);

        if (!string.IsNullOrWhiteSpace(gstin))
        {
            var byGstin = await q.Where(v => v.GstNumber == gstin).ToListAsync(ct);
            if (byGstin.Count > 0)
                return byGstin.Select(v => new ExtractionCandidate(v.Id, v.Name, 0.98m)).ToList();
        }

        if (string.IsNullOrWhiteSpace(name)) return [];

        var nameLower = name.ToLowerInvariant();
        var all = await q.Select(v => new { v.Id, v.Name }).ToListAsync(ct);
        return all
            .Select(v => new ExtractionCandidate(v.Id, v.Name, FuzzyScore(v.Name, nameLower)))
            .Where(c => c.Score >= 0.4m)
            .OrderByDescending(c => c.Score)
            .Take(5)
            .ToList();
    }

    private async Task<IReadOnlyList<ExtractionCandidate>> ResolveStoreCandidatesAsync(
        Guid tenantId, string? name, CancellationToken ct)
    {
        var all = await _db.Stores
            .Where(s => s.TenantId == tenantId && s.DeletedAt == null)
            .Select(s => new { s.Id, s.StoreName })
            .ToListAsync(ct);

        if (string.IsNullOrWhiteSpace(name)) return all.Select(s => new ExtractionCandidate(s.Id, s.StoreName, 0.5m)).Take(5).ToList();

        var nameLower = name.ToLowerInvariant();
        return all
            .Select(s => new ExtractionCandidate(s.Id, s.StoreName, FuzzyScore(s.StoreName, nameLower)))
            .Where(c => c.Score >= 0.4m)
            .OrderByDescending(c => c.Score)
            .Take(5)
            .ToList();
    }

    private async Task<IReadOnlyList<ExtractionCandidate>> ResolveItemCandidatesAsync(
        Guid tenantId, string? description, string? hsnCode, CancellationToken ct)
    {
        var q = _db.Items.Where(i => i.TenantId == tenantId && i.DeletedAt == null);

        if (string.IsNullOrWhiteSpace(description)) return [];

        var descLower = description.ToLowerInvariant();
        var all = await q.Select(i => new { i.Id, i.ItemName, i.HsnCode }).ToListAsync(ct);

        return all
            .Select(i =>
            {
                var score = FuzzyScore(i.ItemName, descLower);
                // Boost score when HSN also matches, but never let HSN alone auto-resolve
                if (!string.IsNullOrWhiteSpace(hsnCode) && i.HsnCode == hsnCode)
                    score = Math.Min(1.0m, score + 0.15m);
                return new ExtractionCandidate(i.Id, i.ItemName, score);
            })
            .Where(c => c.Score >= 0.4m)
            .OrderByDescending(c => c.Score)
            .Take(8)
            .ToList();
    }

    /// <summary>
    /// Lightweight overlap-based fuzzy score: 0.0–1.0.
    /// Not Levenshtein – sufficient for vendor/item lookup without extra packages.
    /// </summary>
    private static decimal FuzzyScore(string candidate, string queryLower)
    {
        if (string.IsNullOrWhiteSpace(candidate)) return 0m;
        var cLower = candidate.ToLowerInvariant();

        if (cLower == queryLower) return 1.0m;
        if (cLower.Contains(queryLower) || queryLower.Contains(cLower)) return 0.85m;

        var qWords = queryLower.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var cWords = cLower.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var matched = qWords.Count(qw => cWords.Any(cw => cw.Contains(qw) || qw.Contains(cw)));
        if (qWords.Length == 0) return 0m;
        return (decimal)matched / qWords.Length * 0.8m;
    }

    /// <summary>
    /// Renders each page of a PDF to a PNG-encoded byte array using pdfium (via PDFtoImage).
    /// Used for scanned/image-only PDFs where PdfPig cannot extract text.
    /// A fresh MemoryStream is created per page to avoid stream-position issues inside a generator.
    /// </summary>
    /// <summary>
    /// Escapes bare control characters (\n \r \t etc.) that appear inside JSON string
    /// values. gpt-4.1-mini in json_object mode sometimes emits unescaped newlines inside
    /// strings, which makes the response invalid JSON even though the structure is correct.
    /// </summary>
    private static string SanitizeJsonControlChars(string raw)
    {
        if (string.IsNullOrEmpty(raw)) return raw;
        var sb       = new System.Text.StringBuilder(raw.Length);
        bool inStr   = false;
        bool escaped = false;
        foreach (char c in raw)
        {
            if (escaped)  { sb.Append(c); escaped = false; continue; }
            if (c == '\\') { escaped = true;  sb.Append(c); continue; }
            if (c == '"')  { inStr = !inStr;  sb.Append(c); continue; }
            if (inStr)
            {
                switch (c)
                {
                    case '\n': sb.Append("\\n");  continue;
                    case '\r': sb.Append("\\r");  continue;
                    case '\t': sb.Append("\\t");  continue;
                    case '\b': sb.Append("\\b");  continue;
                    case '\f': sb.Append("\\f");  continue;
                }
            }
            sb.Append(c);
        }
        return sb.ToString();
    }

    private static IEnumerable<byte[]> RenderPdfPagesToPng(byte[] pdfBytes, int maxPages = 5)
    {
        var renderOpts = new PDFtoImage.RenderOptions { Dpi = 72 };

        // Get total page count (stream is disposed after this call)
        int total;
        using (var countMs = new MemoryStream(pdfBytes))
            total = PDFtoImage.Conversion.GetPageCount(countMs);

        int pagesToRender = Math.Min(total, maxPages);
        for (int i = 0; i < pagesToRender; i++)
        {
            // Fresh stream per page — MemoryStream wraps an existing byte[] so this is allocation-cheap
            using var pageMs = new MemoryStream(pdfBytes);
            using var bitmap = PDFtoImage.Conversion.ToImage(pageMs, page: i, options: renderOpts);
            using var encoded = bitmap.Encode(SkiaSharp.SKEncodedImageFormat.Png, 90);
            yield return encoded.ToArray();
        }
    }

    private static string ExtractPdfText(byte[] pdfBytes)
    {
        using var doc = UglyToad.PdfPig.PdfDocument.Open(pdfBytes);
        var sb = new StringBuilder();
        foreach (var page in doc.GetPages())
        {
            sb.AppendLine($"--- Page {page.Number} ---");
            sb.AppendLine(string.Join(" ", page.GetWords().Select(w => w.Text)));
            sb.AppendLine();
        }
        return sb.ToString();
    }
}
