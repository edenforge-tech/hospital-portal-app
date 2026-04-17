using InventoryApi.Data;
using InventoryApi.Models.DTOs;
using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Services;

public interface IItemService
{
    Task<PagedResult<ItemDto>> ListAsync(Guid tenantId, int page, int pageSize, string? search, CancellationToken ct);
    Task<ItemDto?> GetAsync(Guid tenantId, Guid id, CancellationToken ct);
    Task<ItemDto?> GetByBarcodeAsync(Guid tenantId, string barcode, CancellationToken ct);
    Task<ItemDto> CreateAsync(Guid tenantId, Guid userId, CreateItemRequest req, CancellationToken ct);
    Task<ItemDto?> UpdateAsync(Guid tenantId, Guid id, Guid userId, CreateItemRequest req, CancellationToken ct);
    Task<bool> DeleteAsync(Guid tenantId, Guid id, Guid userId, CancellationToken ct);
}

public sealed class ItemService : IItemService
{
    private readonly InventoryDbContext _db;

    public ItemService(InventoryDbContext db) => _db = db;

    public async Task<PagedResult<ItemDto>> ListAsync(Guid tenantId, int page, int pageSize, string? search, CancellationToken ct)
    {
        var q = _db.Items.Where(i => i.TenantId == tenantId && i.DeletedAt == null);
        if (!string.IsNullOrWhiteSpace(search))
            q = q.Where(i => EF.Functions.ILike(i.ItemName, $"%{search}%") ||
                              (i.GenericName != null && EF.Functions.ILike(i.GenericName, $"%{search}%")));

        var total = await q.CountAsync(ct);
        var items = await q
            .OrderBy(i => i.ItemName)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(i => ToDto(i))
            .ToListAsync(ct);
        return new PagedResult<ItemDto>(items, total, page, pageSize);
    }

    public async Task<ItemDto?> GetAsync(Guid tenantId, Guid id, CancellationToken ct)
    {
        var item = await _db.Items.FirstOrDefaultAsync(
            x => x.Id == id && x.TenantId == tenantId && x.DeletedAt == null, ct);
        return item is null ? null : ToDto(item);
    }

    public async Task<ItemDto?> GetByBarcodeAsync(Guid tenantId, string barcode, CancellationToken ct)
    {
        // Look up via stock_batches barcode → item
        var batch = await _db.StockBatches
            .Include(b => b.Item)
            .FirstOrDefaultAsync(b => b.TenantId == tenantId && b.Barcode == barcode && b.DeletedAt == null, ct);
        return batch?.Item is null ? null : ToDto(batch.Item);
    }

    public async Task<ItemDto> CreateAsync(Guid tenantId, Guid userId, CreateItemRequest req, CancellationToken ct)
    {
        var item = new ItemMaster
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            CategoryId = req.CategoryId,
            ItemName = req.ItemName,
            GenericName = req.GenericName,
            Brand = req.Brand,
            HsnCode = req.HsnCode,
            Unit = req.Unit,
            ScheduleType = req.ScheduleType,
            RequiresColdStorage = req.RequiresColdStorage,
            IsBarcodeTracked = req.IsBarcodeTracked,
            ItemType = req.ItemType,
            ReorderLevel = req.ReorderLevel,
            ReorderQuantity = req.ReorderQuantity,
            DefaultGstRate = req.DefaultGstRate,
            LinkedInjectorItemId = req.LinkedInjectorItemId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedByUserId = userId,
            UpdatedByUserId = userId
        };
        _db.Items.Add(item);
        await _db.SaveChangesAsync(ct);
        return ToDto(item);
    }

    public async Task<ItemDto?> UpdateAsync(Guid tenantId, Guid id, Guid userId, CreateItemRequest req, CancellationToken ct)
    {
        var item = await _db.Items.FirstOrDefaultAsync(
            x => x.Id == id && x.TenantId == tenantId && x.DeletedAt == null, ct);
        if (item is null) return null;

        item.CategoryId = req.CategoryId;
        item.ItemName = req.ItemName;
        item.GenericName = req.GenericName;
        item.Brand = req.Brand;
        item.HsnCode = req.HsnCode;
        item.Unit = req.Unit;
        item.ScheduleType = req.ScheduleType;
        item.RequiresColdStorage = req.RequiresColdStorage;
        item.IsBarcodeTracked = req.IsBarcodeTracked;
        item.ItemType = req.ItemType;
        item.ReorderLevel = req.ReorderLevel;
        item.ReorderQuantity = req.ReorderQuantity;
        item.DefaultGstRate = req.DefaultGstRate;
        item.LinkedInjectorItemId = req.LinkedInjectorItemId;
        item.UpdatedAt = DateTime.UtcNow;
        item.UpdatedByUserId = userId;

        await _db.SaveChangesAsync(ct);
        return ToDto(item);
    }

    public async Task<bool> DeleteAsync(Guid tenantId, Guid id, Guid userId, CancellationToken ct)
    {
        var item = await _db.Items.FirstOrDefaultAsync(
            x => x.Id == id && x.TenantId == tenantId && x.DeletedAt == null, ct);
        if (item is null) return false;
        item.DeletedAt = DateTime.UtcNow;
        item.Status = "inactive";
        item.UpdatedByUserId = userId;
        await _db.SaveChangesAsync(ct);
        return true;
    }

    private static ItemDto ToDto(ItemMaster i) => new(
        i.Id, i.CategoryId, i.ItemName, i.GenericName, i.Brand,
        i.HsnCode, i.Unit, i.ScheduleType, i.RequiresColdStorage,
        i.IsBarcodeTracked, i.ItemType, i.ReorderLevel, i.ReorderQuantity,
        i.DefaultGstRate, i.LinkedInjectorItemId,
        i.IsSerialized, i.IsAssetItem, i.MdrClassification,
        i.Status);
}
