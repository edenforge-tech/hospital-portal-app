using AuthService.Context;
using AuthService.DTOs.Billing;
using AuthService.Models.Domain;
using AuthService.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Services;

public class ServiceCatalogService : IServiceCatalogService
{
    private readonly AppDbContext _context;

    public ServiceCatalogService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<FullCatalogResponse> GetFullCatalogAsync()
    {
        // Load category/service/variant tree WITHOUT the filtered price include to avoid
        // EF Core runtime issues when composing HasQueryFilter + filtered ThenInclude.
        var categories = await _context.ServiceCategories
            .Where(c => c.IsActive)
            .Include(c => c.Services.Where(s => s.IsActive))
                .ThenInclude(s => s.Variants.Where(v => v.IsActive))
            .OrderBy(c => c.DisplayOrder)
            .ToListAsync();

        // Collect all active variant IDs and load global prices in a single separate query.
        var variantIds = categories
            .SelectMany(c => c.Services)
            .SelectMany(s => s.Variants)
            .Select(v => v.Id)
            .ToList();

        var priceMap = (await _context.VariantPrices
            .Where(p => variantIds.Contains(p.VariantId)
                     && p.BranchId == null
                     && p.EffectiveTo == null
                     && p.IsActive
                     && p.DeletedAt == null)
            .ToListAsync())
            .GroupBy(p => p.VariantId)
            .ToDictionary(
                g => g.Key,
                g => g.OrderByDescending(p => p.EffectiveFrom).First().Amount);

        return new FullCatalogResponse
        {
            Categories = categories.Select(c => new ServiceCategoryDto
            {
                Id = c.Id,
                Code = c.Code,
                Name = c.Name,
                DisplayOrder = c.DisplayOrder,
                IsActive = c.IsActive,
                Services = c.Services.Select(s => new CatalogServiceDto
                {
                    Id = s.Id,
                    Code = s.ServiceCode ?? string.Empty,
                    Name = s.ServiceName,
                    IsActive = s.IsActive,
                    Variants = s.Variants
                        .OrderBy(v => v.DisplayOrder)
                        .Select(v => new ServiceVariantDto
                        {
                            Id = v.Id,
                            Code = v.VariantCode ?? string.Empty,
                            Name = v.VariantName,
                            Price = priceMap.GetValueOrDefault(v.Id, 0),
                            PriceType = v.PriceType,
                            HasIolOptions = v.HasIolOptions,
                            DisplayOrder = v.DisplayOrder,
                            IsActive = v.IsActive,
                            SubOptions = v.SubOptions
                        }).ToList()
                }).ToList()
            }).ToList()
        };
    }

    public async Task<List<ServiceCategoryDto>> GetCategoriesAsync()
    {
        var categories = await _context.ServiceCategories
            .Where(c => c.IsActive)
            .OrderBy(c => c.DisplayOrder)
            .ToListAsync();

        return categories.Select(c => new ServiceCategoryDto
        {
            Id = c.Id,
            Code = c.Code,
            Name = c.Name,
            DisplayOrder = c.DisplayOrder,
            IsActive = c.IsActive
        }).ToList();
    }

    public async Task<List<IolMasterDto>> GetVariantIolOptionsAsync(Guid variantId)
    {
        // Load mappings + IolMaster without filtered price include (same EF Core safety pattern).
        var mappings = await _context.VariantIolMappings
            .Include(m => m.IolMaster)
            .Where(m => m.VariantId == variantId && m.IolMaster.IsActive)
            .ToListAsync();

        var iolIds = mappings.Select(m => m.IolMasterId).ToList();

        var iolPriceMap = (await _context.IolPrices
            .Where(p => iolIds.Contains(p.IolMasterId)
                     && p.BranchId == null
                     && p.EffectiveTo == null
                     && p.IsActive
                     && p.DeletedAt == null)
            .ToListAsync())
            .GroupBy(p => p.IolMasterId)
            .ToDictionary(
                g => g.Key,
                g => g.OrderByDescending(p => p.EffectiveFrom).First().Amount);

        return mappings.Select(m => new IolMasterDto
        {
            Id = m.IolMaster.Id,
            ModelName = m.IolMaster.ModelName,
            BrandManufacturer = m.IolMaster.BrandManufacturer,
            IolType = m.IolMaster.IolType,
            Origin = m.IolMaster.Origin,
            Price = iolPriceMap.GetValueOrDefault(m.IolMaster.Id, 0),
            IsDefault = m.IsDefault
        }).ToList();
    }

    public async Task<List<BranchVariantPricingDto>> GetBranchPricingAsync(Guid branchId)
    {
        var pricings = await _context.VariantPrices
            .Where(p => p.BranchId == branchId && p.IsActive && p.EffectiveTo == null)
            .ToListAsync();

        return pricings.Select(p => new BranchVariantPricingDto
        {
            VariantId = p.VariantId,
            Amount = p.Amount,
            EffectiveFrom = p.EffectiveFrom,
            EffectiveTo = p.EffectiveTo,
            IsActive = p.IsActive
        }).ToList();
    }
}

public class BillItemService : IBillItemService
{
    private readonly AppDbContext _context;
    private readonly ILogger<BillItemService> _logger;

    public BillItemService(AppDbContext context, ILogger<BillItemService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<BillItemDto>> GetBillItemsAsync(Guid billId, Guid tenantId)
    {
        var items = await _context.Set<OpdBillItem>()
            .Where(i => i.OpdBillId == billId && i.TenantId == tenantId && i.DeletedAt == null)
            .OrderBy(i => i.CreatedAt)
            .ToListAsync();

        return items.Select(MapToDto).ToList();
    }

    public async Task<BillItemDto?> GetBillItemByIdAsync(Guid id, Guid tenantId)
    {
        var item = await _context.Set<OpdBillItem>()
            .FirstOrDefaultAsync(i => i.Id == id && i.TenantId == tenantId && i.DeletedAt == null);

        return item != null ? MapToDto(item) : null;
    }

    public async Task<BillItemDto> AddBillItemAsync(AddBillItemRequest request, Guid tenantId, Guid userId)
    {
        // Day 5: Check if bill is locked before adding items
        var bill = await _context.OpdBills
            .Where(b => b.Id == request.OpdBillId && b.TenantId == tenantId && b.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (bill == null)
        {
            throw new InvalidOperationException("Bill not found.");
        }

        if (bill.IsLocked)
        {
            throw new InvalidOperationException($"Cannot add items to locked bill {bill.BillNumber}. Bill must be unlocked by an administrator.");
        }

        // Get service variant from catalog
        ServiceVariant? variant = null;
        if (request.ServiceVariantId.HasValue)
        {
            variant = await _context.ServiceVariants
                .Include(v => v.CatalogService)
                    .ThenInclude(s => s.Category)
                .FirstOrDefaultAsync(v => v.Id == request.ServiceVariantId.Value && v.IsActive);
        }
        else if (!string.IsNullOrEmpty(request.ServiceCode))
        {
            variant = await _context.ServiceVariants
                .Include(v => v.CatalogService)
                    .ThenInclude(s => s.Category)
                .FirstOrDefaultAsync(v => v.VariantCode == request.ServiceCode && v.IsActive);
        }

        if (variant == null)
        {
            throw new InvalidOperationException("Service not found in catalog.");
        }

        // Resolve the global tariff price for this variant from the normalised price table
        var globalPrice = await _context.VariantPrices
            .Where(p => p.VariantId == variant.Id
                     && p.BranchId == null
                     && p.EffectiveTo == null
                     && p.IsActive)
            .OrderByDescending(p => p.EffectiveFrom)
            .Select(p => p.Amount)
            .FirstOrDefaultAsync();

        var unitPrice = request.UnitPriceOverride ?? globalPrice;
        var subtotal = unitPrice * request.Quantity;
        var discountAmount = subtotal * (request.DiscountPercentage / 100);
        var taxableAmount = subtotal - discountAmount;
        var taxAmount = 0m; // No tax in V2 catalog
        var totalAmount = taxableAmount + taxAmount;

        var item = new OpdBillItem
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            OpdBillId = request.OpdBillId,
            ServiceVariantId = variant.Id,
            ServiceCode = variant.VariantCode ?? string.Empty,
            ServiceName = variant.VariantName,
            ServiceCategory = variant.CatalogService?.Category?.Code ?? string.Empty,
            Description = null,
            Quantity = request.Quantity,
            UnitPrice = unitPrice,
            Subtotal = subtotal,
            DiscountAmount = discountAmount,
            DiscountPercentage = request.DiscountPercentage,
            DiscountReason = request.DiscountReason,
            TaxAmount = taxAmount,
            TaxPercentage = 0,
            TotalAmount = totalAmount,
            Status = "pending",
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow,
            CreatedByUserId = userId
        };

        _context.Set<OpdBillItem>().Add(item);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Bill item added: {ServiceCode} to bill {BillId}", variant.VariantCode, request.OpdBillId);

        return MapToDto(item);
    }

    public async Task<BillItemDto> UpdateBillItemAsync(Guid id, UpdateBillItemRequest request, Guid tenantId, Guid userId)
    {
        var item = await _context.Set<OpdBillItem>()
            .Include(i => i.ServiceVariant)
            .Include(i => i.OpdBill)
            .FirstOrDefaultAsync(i => i.Id == id && i.TenantId == tenantId && i.DeletedAt == null);

        if (item == null)
        {
            throw new InvalidOperationException("Bill item not found.");
        }

        // Day 5: Check if bill is locked before updating items
        if (item.OpdBill?.IsLocked == true)
        {
            throw new InvalidOperationException($"Cannot update items on locked bill {item.OpdBill.BillNumber}. Bill must be unlocked by an administrator.");
        }

        // Recalculate amounts
        var unitPrice = request.UnitPriceOverride ?? item.UnitPrice;
        var subtotal = unitPrice * request.Quantity;
        var discountAmount = subtotal * (request.DiscountPercentage / 100);
        var taxableAmount = subtotal - discountAmount;
        var taxAmount = 0m; // No tax in V2 catalog
        var totalAmount = taxableAmount + taxAmount;

        item.Quantity = request.Quantity;
        item.UnitPrice = unitPrice;
        item.Subtotal = subtotal;
        item.DiscountAmount = discountAmount;
        item.DiscountPercentage = request.DiscountPercentage;
        item.DiscountReason = request.DiscountReason;
        item.TaxAmount = taxAmount;
        item.TotalAmount = totalAmount;
        item.Status = request.Status;
        item.Notes = request.Notes;
        item.UpdatedAt = DateTime.UtcNow;
        item.UpdatedByUserId = userId;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Bill item updated: {ItemId}", id);

        return MapToDto(item);
    }

    public async Task<bool> DeleteBillItemAsync(Guid id, Guid tenantId)
    {
        var item = await _context.Set<OpdBillItem>()
            .Include(i => i.OpdBill)
            .FirstOrDefaultAsync(i => i.Id == id && i.TenantId == tenantId && i.DeletedAt == null);

        if (item == null) return false;

        // Day 5: Check if bill is locked before deleting items
        if (item.OpdBill?.IsLocked == true)
        {
            throw new InvalidOperationException($"Cannot delete items from locked bill {item.OpdBill.BillNumber}. Bill must be unlocked by an administrator.");
        }

        item.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Bill item deleted: {ItemId}", id);

        return true;
    }

    public async Task<BillSummaryDto> GetBillSummaryAsync(Guid billId, Guid tenantId)
    {
        var bill = await _context.Set<OpdBill>()
            .FirstOrDefaultAsync(b => b.Id == billId && b.TenantId == tenantId);

        if (bill == null)
        {
            throw new InvalidOperationException("Bill not found.");
        }

        var items = await GetBillItemsAsync(billId, tenantId);

        return new BillSummaryDto
        {
            BillId = billId,
            BillNumber = bill.BillNumber,
            TotalItems = items.Count,
            Subtotal = items.Sum(i => i.Subtotal),
            TotalDiscount = items.Sum(i => i.DiscountAmount),
            TotalTax = items.Sum(i => i.TaxAmount),
            NetAmount = items.Sum(i => i.TotalAmount),
            Items = items
        };
    }

    public async Task<BillSummaryDto> RecalculateBillAsync(Guid billId, Guid tenantId)
    {
        var summary = await GetBillSummaryAsync(billId, tenantId);

        // Update the main bill totals
        var bill = await _context.Set<OpdBill>()
            .FirstOrDefaultAsync(b => b.Id == billId && b.TenantId == tenantId);

        if (bill != null)
        {
            bill.GrossAmount = summary.Subtotal;
            bill.DiscountAmount = summary.TotalDiscount;
            bill.TaxAmount = summary.TotalTax;
            bill.NetAmount = summary.NetAmount;
            bill.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Bill recalculated: {BillId} - Net Amount: {NetAmount}", billId, summary.NetAmount);
        }

        return summary;
    }

    private static BillItemDto MapToDto(OpdBillItem item)
    {
        return new BillItemDto
        {
            Id = item.Id,
            OpdBillId = item.OpdBillId,
            ServiceVariantId = item.ServiceVariantId,
            Quantity = item.Quantity,
            UnitPrice = item.UnitPrice,
            Subtotal = item.Subtotal,
            DiscountAmount = item.DiscountAmount,
            DiscountPercentage = item.DiscountPercentage,
            DiscountReason = item.DiscountReason,
            TaxAmount = item.TaxAmount,
            TaxPercentage = item.TaxPercentage,
            TotalAmount = item.TotalAmount,
            PerformedByUserId = item.PerformedByUserId,
            PerformedAt = item.PerformedAt,
            Status = item.Status,
            Notes = item.Notes
        };
    }
}
