using System.Net;
using System.Text.Json;
using InventoryApi.Data;
using InventoryApi.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Functions.Reorder;

/// <summary>
/// Auto-reorder management endpoints.
/// Wraps the nightly AutoReorderService timer with HTTP controls +
/// provides history, status and per-item configuration API.
///
/// Routes:
///   POST /inventory/reorder/trigger           — manual run for calling tenant
///   GET  /inventory/reorder/history           — list auto-generated requisitions
///   GET  /inventory/reorder/config            — paginated reorder config for items
///   PATCH /inventory/reorder/config/{itemId}  — update thresholds for one item
/// </summary>
public sealed class ReorderFunctions
{
    private readonly IAutoReorderService _reorder;
    private readonly InventoryDbContext _db;
    private readonly ILogger<ReorderFunctions> _log;

    public ReorderFunctions(
        IAutoReorderService reorder,
        InventoryDbContext db,
        ILogger<ReorderFunctions> log)
    {
        _reorder = reorder;
        _db = db;
        _log = log;
    }

    // ---------- POST inventory/reorder/trigger ----------
    /// <summary>
    /// Manually kick off the auto-reorder check for the calling tenant.
    /// Creates purchase requisitions for any items below reorder level, exactly
    /// as the nightly timer does but limited to the X-Tenant-Id tenant.
    /// </summary>
    [Function("TriggerReorder")]
    public async Task<HttpResponseData> TriggerReorder(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "reorder/trigger")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId = ParseGuid(req, "X-User-Id");

            _log.LogInformation("Manual reorder trigger by user {UserId} for tenant {TenantId}",
                userId, tenantId);

            await _reorder.RunAsync(tenantId, ct);

            return await OkJson(req, new
            {
                success = true,
                message = "Auto-reorder completed. Check /reorder/history for generated requisitions.",
                triggeredAt = DateTime.UtcNow,
                triggeredByUserId = userId,
            });
        }
        catch (Exception ex) { return await Error(req, ex.Message); }
    }

    // ---------- GET inventory/reorder/history ----------
    /// <summary>
    /// Returns a paginated list of purchase requisitions created by the
    /// auto-reorder service (RequisitionType = "AutoReorder").
    /// Supports filtering by status and ordering by date descending.
    /// </summary>
    [Function("GetReorderHistory")]
    public async Task<HttpResponseData> GetReorderHistory(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "reorder/history")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var qs = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            var status = qs["status"];
            int page = int.TryParse(qs["page"], out var p) ? Math.Max(1, p) : 1;
            int pageSize = int.TryParse(qs["pageSize"], out var ps) ? Math.Clamp(ps, 1, 100) : 20;

            var q = _db.PurchaseRequisitions
                .Include(r => r.Store)
                .Include(r => r.Items).ThenInclude(i => i.Item)
                .Where(r => r.TenantId == tenantId
                         && r.RequisitionType == "AutoReorder"
                         && r.DeletedAt == null);

            if (!string.IsNullOrWhiteSpace(status))
                q = q.Where(r => r.RequisitionStatus == status);

            var total = await q.CountAsync(ct);
            var rows = await q
                .OrderByDescending(r => r.RequisitionDate)
                .ThenByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => (object)new
                {
                    r.Id,
                    r.RequisitionNumber,
                    r.RequisitionDate,
                    r.RequisitionStatus,
                    r.Remarks,
                    r.CreatedAt,
                    StoreName = r.Store != null ? r.Store.StoreName : null,
                    ItemCount = r.Items.Count(i => i.DeletedAt == null),
                    Items = r.Items
                        .Where(i => i.DeletedAt == null)
                        .Select(i => new
                        {
                            i.Id,
                            ItemName = i.Item != null ? i.Item.ItemName : null,
                            i.RequiredQuantity,
                            i.CurrentStock,
                            i.Remarks,
                        }),
                })
                .ToListAsync(ct);

            return await OkJson(req, new { items = rows, total, page, pageSize });
        }
        catch (Exception ex) { return await Error(req, ex.Message); }
    }

    // ---------- GET inventory/reorder/config ----------
    /// <summary>
    /// Returns the reorder configuration (ReorderLevel + ReorderQuantity)
    /// for all active items in the tenant. Supports search and
    /// optional "belowReorder" filter to show only at-risk items.
    /// </summary>
    [Function("GetReorderConfig")]
    public async Task<HttpResponseData> GetReorderConfig(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "reorder/config")]
        HttpRequestData req, FunctionContext ctx, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var qs = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            var search = qs["search"];
            bool belowReorderOnly = qs["belowReorder"] == "true";
            int page = int.TryParse(qs["page"], out var p) ? Math.Max(1, p) : 1;
            int pageSize = int.TryParse(qs["pageSize"], out var ps) ? Math.Clamp(ps, 1, 200) : 50;

            var q = _db.Items
                .Where(i => i.TenantId == tenantId && i.DeletedAt == null);

            if (!string.IsNullOrWhiteSpace(search))
                q = q.Where(i => i.ItemName.Contains(search) || (i.GenericName != null && i.GenericName.Contains(search)));

            // Current stock per item (aggregated from active batches)
            var total = await q.CountAsync(ct);
            var items = await q
                .OrderBy(i => i.ItemName)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(i => new
                {
                    i.Id,
                    i.ItemName,
                    i.GenericName,
                    i.ItemType,
                    i.Unit,
                    i.ReorderLevel,
                    i.ReorderQuantity,
                    CurrentStock = _db.StockBatches
                        .Where(b => b.ItemId == i.Id && b.DeletedAt == null && b.IsActive)
                        .Sum(b => (decimal?)b.QuantityAvailable) ?? 0m,
                })
                .ToListAsync(ct);

            // Apply belowReorder filter after projection (can't translate to SQL easily with computed stock)
            if (belowReorderOnly)
                items = items.Where(i => i.CurrentStock <= i.ReorderLevel && i.ReorderLevel > 0).ToList();

            var result = items.Select(i => new
            {
                i.Id,
                i.ItemName,
                i.GenericName,
                i.ItemType,
                i.Unit,
                i.ReorderLevel,
                i.ReorderQuantity,
                i.CurrentStock,
                BelowReorder = i.CurrentStock <= i.ReorderLevel && i.ReorderLevel > 0,
                StockCoveragePercent = i.ReorderLevel > 0
                    ? Math.Round((double)(i.CurrentStock / i.ReorderLevel) * 100, 1)
                    : (double?)null,
            });

            return await OkJson(req, new { items = result, total, page, pageSize });
        }
        catch (Exception ex) { return await Error(req, ex.Message); }
    }

    // ---------- PATCH inventory/reorder/config/{itemId} ----------
    /// <summary>
    /// Update the reorder thresholds (ReorderLevel and/or ReorderQuantity)
    /// for a specific item. Partial update — only supplied fields are changed.
    /// </summary>
    [Function("UpdateReorderConfig")]
    public async Task<HttpResponseData> UpdateReorderConfig(
        [HttpTrigger(AuthorizationLevel.Anonymous, "patch", Route = "reorder/config/{itemId:guid}")]
        HttpRequestData req, FunctionContext ctx, Guid itemId, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            var userId = ParseGuid(req, "X-User-Id");

            var item = await _db.Items
                .FirstOrDefaultAsync(i => i.Id == itemId && i.TenantId == tenantId && i.DeletedAt == null, ct);

            if (item is null)
                return req.CreateResponse(HttpStatusCode.NotFound);

            using var doc = await JsonDocument.ParseAsync(req.Body, cancellationToken: ct);
            var root = doc.RootElement;

            if (root.TryGetProperty("reorderLevel", out var rl) && rl.TryGetDecimal(out var reorderLevel))
                item.ReorderLevel = reorderLevel >= 0 ? reorderLevel
                    : throw new ArgumentException("reorderLevel must be ≥ 0");

            if (root.TryGetProperty("reorderQuantity", out var rq) && rq.TryGetDecimal(out var reorderQty))
                item.ReorderQuantity = reorderQty >= 0 ? reorderQty
                    : throw new ArgumentException("reorderQuantity must be ≥ 0");

            item.UpdatedAt = DateTime.UtcNow;
            item.UpdatedByUserId = userId;
            await _db.SaveChangesAsync(ct);

            return await OkJson(req, new
            {
                item.Id,
                item.ItemName,
                item.ReorderLevel,
                item.ReorderQuantity,
                item.UpdatedAt,
            });
        }
        catch (ArgumentException ex) { return await BadRequest(req, ex.Message); }
        catch (Exception ex) { return await Error(req, ex.Message); }
    }

    // ---------- POST inventory/reorder/config/{itemId}/suppress ----------
    [Function("SuppressReorderItem")]
    public async Task<HttpResponseData> SuppressItem(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "reorder/config/{itemId:guid}/suppress")]
        HttpRequestData req, FunctionContext ctx, Guid itemId, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            using var doc = await JsonDocument.ParseAsync(req.Body, cancellationToken: ct);
            DateTime? until = null;
            if (doc.RootElement.TryGetProperty("suppressUntil", out var su) &&
                su.TryGetDateTime(out var dt))
                until = DateTime.SpecifyKind(dt, DateTimeKind.Utc);

            await _reorder.SuppressItemAsync(tenantId, itemId, until, ct);
            return await OkJson(req, new { itemId, reorderSuppressed = true, suppressUntil = until });
        }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (Exception ex) { return await Error(req, ex.Message); }
    }

    // ---------- POST inventory/reorder/config/{itemId}/enable ----------
    [Function("EnableReorderItem")]
    public async Task<HttpResponseData> EnableItem(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "reorder/config/{itemId:guid}/enable")]
        HttpRequestData req, FunctionContext ctx, Guid itemId, CancellationToken ct)
    {
        try
        {
            var tenantId = ParseGuid(req, "X-Tenant-Id");
            await _reorder.EnableItemAsync(tenantId, itemId, ct);
            return await OkJson(req, new { itemId, reorderSuppressed = false });
        }
        catch (KeyNotFoundException) { return req.CreateResponse(HttpStatusCode.NotFound); }
        catch (Exception ex) { return await Error(req, ex.Message); }
    }

    // ---------- helpers ----------
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
        await res.WriteAsJsonAsync(new { error = msg });
        return res;
    }

    private static async Task<HttpResponseData> Error(HttpRequestData req, string msg)
    {
        var res = req.CreateResponse(HttpStatusCode.InternalServerError);
        await res.WriteAsJsonAsync(new { error = msg });
        return res;
    }
}
