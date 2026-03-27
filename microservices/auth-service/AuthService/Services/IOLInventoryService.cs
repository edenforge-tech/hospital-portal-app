using AuthService.Context;
using AuthService.DTOs;
using AuthService.Models;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Services
{
    public class IOLInventoryService : IIOLInventoryService
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public IOLInventoryService(AppDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        private Guid GetCurrentTenantId()
        {
            var tenantIdClaim = _httpContextAccessor.HttpContext?.User.FindFirst("TenantId")?.Value;
            return tenantIdClaim != null ? Guid.Parse(tenantIdClaim) : Guid.Empty;
        }

        public async Task<(List<IOLInventoryItemDto> Data, int Total)> GetAllAsync(int page, int pageSize, string? search, string? type, string? manufacturer, bool? lowStock, Guid? branchId)
        {
            var tenantId = GetCurrentTenantId();
            var query = _context.Set<IOLInventoryItem>()
                .Where(i => i.TenantId == tenantId && i.DeletedAt == null);

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(i => i.Model.Contains(search) || i.Manufacturer.Contains(search) || i.Sku.Contains(search));
            }

            if (!string.IsNullOrEmpty(type))
            {
                query = query.Where(i => i.Type == type);
            }

            if (!string.IsNullOrEmpty(manufacturer))
            {
                query = query.Where(i => i.Manufacturer == manufacturer);
            }

            if (lowStock == true)
            {
                query = query.Where(i => i.CurrentStock <= i.MinimumStock);
            }

            if (branchId.HasValue)
            {
                query = query.Where(i => i.BranchId == branchId.Value);
            }

            var total = await query.CountAsync();
            var items = await query
                .OrderBy(i => i.Model)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(i => MapToDto(i))
                .ToListAsync();

            return (items, total);
        }

        public async Task<IOLInventoryItemDto?> GetByIdAsync(Guid id)
        {
            var tenantId = GetCurrentTenantId();
            var item = await _context.Set<IOLInventoryItem>()
                .FirstOrDefaultAsync(i => i.Id == id && i.TenantId == tenantId && i.DeletedAt == null);

            return item != null ? MapToDto(item) : null;
        }

        public async Task<IOLStatisticsDto> GetStatisticsAsync(Guid? branchId)
        {
            var tenantId = GetCurrentTenantId();
            var query = _context.Set<IOLInventoryItem>()
                .Where(i => i.TenantId == tenantId && i.DeletedAt == null);

            if (branchId.HasValue)
            {
                query = query.Where(i => i.BranchId == branchId.Value);
            }

            var totalItems = await query.CountAsync();
            var totalStock = await query.SumAsync(i => i.CurrentStock);
            var lowStockCount = await query.Where(i => i.CurrentStock <= i.MinimumStock).CountAsync();
            var totalValue = await query.SumAsync(i => i.CurrentStock * i.UnitPrice);
            var monofocalCount = await query.Where(i => i.Type == "MONOFOCAL").CountAsync();
            var multifocalCount = await query.Where(i => i.Type == "MULTIFOCAL").CountAsync();
            var toricCount = await query.Where(i => i.Type == "TORIC").CountAsync();
            var edofCount = await query.Where(i => i.Type == "EDOF").CountAsync();

            var monthAgo = DateTime.UtcNow.AddMonths(-1);
            var monthlyUsage = await _context.Set<IOLStockAdjustment>()
                .Where(a => a.TenantId == tenantId && a.Type == "USAGE" && a.CreatedAt >= monthAgo)
                .SumAsync(a => Math.Abs(a.Quantity));

            var topUsed = await _context.Set<IOLStockAdjustment>()
                .Where(a => a.TenantId == tenantId && a.Type == "USAGE")
                .GroupBy(a => a.Item!.Model)
                .Select(g => new TopUsedModel { Model = g.Key, Count = g.Sum(a => Math.Abs(a.Quantity)) })
                .OrderByDescending(t => t.Count)
                .Take(5)
                .ToListAsync();

            return new IOLStatisticsDto
            {
                TotalItems = totalItems,
                TotalStock = totalStock,
                LowStockCount = lowStockCount,
                TotalValue = totalValue,
                MonofocalCount = monofocalCount,
                MultifocalCount = multifocalCount,
                ToricCount = toricCount,
                EdofCount = edofCount,
                MonthlyUsage = monthlyUsage,
                TopUsedModels = topUsed
            };
        }

        public async Task<IOLInventoryItemDto> CreateAsync(IOLInventoryItemDto dto, Guid userId)
        {
            var tenantId = GetCurrentTenantId();
            var item = new IOLInventoryItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                BranchId = dto.BranchId,
                Model = dto.Model,
                Manufacturer = dto.Manufacturer,
                Sku = dto.Sku,
                Type = dto.Type,
                Material = dto.Material,
                AConstant = dto.AConstant,
                PowerRangeMin = dto.PowerRangeMin,
                PowerRangeMax = dto.PowerRangeMax,
                PowerIncrement = dto.PowerIncrement,
                OpticDiameter = dto.OpticDiameter,
                OverallDiameter = dto.OverallDiameter,
                CylinderPowerRange = dto.CylinderPowerRange,
                Toricity = dto.Toricity,
                CurrentStock = dto.CurrentStock,
                MinimumStock = dto.MinimumStock,
                ReorderQuantity = dto.ReorderQuantity,
                Location = dto.Location,
                UnitPrice = dto.UnitPrice,
                SupplierCost = dto.SupplierCost,
                SupplierId = dto.SupplierId,
                SupplierName = dto.SupplierName,
                LeadTimeDays = dto.LeadTimeDays,
                Notes = dto.Notes,
                ExpiryDate = dto.ExpiryDate,
                BatchNumber = dto.BatchNumber,
                CreatedByUserId = userId,
                UpdatedByUserId = userId,
                Status = "active"
            };

            _context.Set<IOLInventoryItem>().Add(item);
            await _context.SaveChangesAsync();

            return MapToDto(item);
        }

        public async Task<IOLInventoryItemDto> UpdateAsync(Guid id, IOLInventoryItemDto dto, Guid userId)
        {
            var tenantId = GetCurrentTenantId();
            var item = await _context.Set<IOLInventoryItem>()
                .FirstOrDefaultAsync(i => i.Id == id && i.TenantId == tenantId && i.DeletedAt == null);

            if (item == null)
                throw new Exception("IOL inventory item not found");

            item.Model = dto.Model;
            item.Manufacturer = dto.Manufacturer;
            item.Sku = dto.Sku;
            item.Type = dto.Type;
            item.Material = dto.Material;
            item.AConstant = dto.AConstant;
            item.PowerRangeMin = dto.PowerRangeMin;
            item.PowerRangeMax = dto.PowerRangeMax;
            item.PowerIncrement = dto.PowerIncrement;
            item.OpticDiameter = dto.OpticDiameter;
            item.OverallDiameter = dto.OverallDiameter;
            item.CylinderPowerRange = dto.CylinderPowerRange;
            item.Toricity = dto.Toricity;
            item.MinimumStock = dto.MinimumStock;
            item.ReorderQuantity = dto.ReorderQuantity;
            item.Location = dto.Location;
            item.UnitPrice = dto.UnitPrice;
            item.SupplierCost = dto.SupplierCost;
            item.SupplierName = dto.SupplierName;
            item.LeadTimeDays = dto.LeadTimeDays;
            item.Notes = dto.Notes;
            item.UpdatedAt = DateTime.UtcNow;
            item.UpdatedByUserId = userId;

            await _context.SaveChangesAsync();
            return MapToDto(item);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var tenantId = GetCurrentTenantId();
            var item = await _context.Set<IOLInventoryItem>()
                .FirstOrDefaultAsync(i => i.Id == id && i.TenantId == tenantId);

            if (item == null)
                return false;

            item.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> AdjustStockAsync(StockAdjustmentDto adjustment, Guid userId)
        {
            var tenantId = GetCurrentTenantId();
            var item = await _context.Set<IOLInventoryItem>()
                .FirstOrDefaultAsync(i => i.Id == adjustment.ItemId && i.TenantId == tenantId && i.DeletedAt == null);

            if (item == null)
                return false;

            // Update current stock
            item.CurrentStock += adjustment.Quantity;
            if (item.CurrentStock < 0)
                throw new Exception("Insufficient stock");

            // Track usage
            if (adjustment.Type == "USAGE")
            {
                item.TotalUsed += Math.Abs(adjustment.Quantity);
                item.LastUsedDate = DateTime.UtcNow;
            }

            item.UpdatedAt = DateTime.UtcNow;
            item.UpdatedByUserId = userId;

            // Create adjustment record
            var adjustmentRecord = new IOLStockAdjustment
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                ItemId = adjustment.ItemId,
                Quantity = adjustment.Quantity,
                Type = adjustment.Type,
                Reason = adjustment.Reason,
                PatientId = adjustment.PatientId,
                SurgeryId = adjustment.SurgeryId,
                BatchNumber = adjustment.BatchNumber,
                ExpiryDate = adjustment.ExpiryDate,
                CreatedByUserId = userId
            };

            _context.Set<IOLStockAdjustment>().Add(adjustmentRecord);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<IOLInventoryItemDto>> GetLowStockAsync(Guid? branchId)
        {
            var tenantId = GetCurrentTenantId();
            var query = _context.Set<IOLInventoryItem>()
                .Where(i => i.TenantId == tenantId && i.DeletedAt == null && i.CurrentStock <= i.MinimumStock);

            if (branchId.HasValue)
            {
                query = query.Where(i => i.BranchId == branchId.Value);
            }

            var items = await query
                .OrderBy(i => i.CurrentStock)
                .Select(i => MapToDto(i))
                .ToListAsync();

            return items;
        }

        public async Task<List<IOLInventoryItemDto>> SearchAsync(string query)
        {
            var tenantId = GetCurrentTenantId();
            var items = await _context.Set<IOLInventoryItem>()
                .Where(i => i.TenantId == tenantId && i.DeletedAt == null &&
                    (i.Model.Contains(query) || i.Manufacturer.Contains(query) || i.Sku.Contains(query)))
                .OrderBy(i => i.Model)
                .Take(50)
                .Select(i => MapToDto(i))
                .ToListAsync();

            return items;
        }

        public async Task<List<string>> GetManufacturersAsync()
        {
            var tenantId = GetCurrentTenantId();
            var manufacturers = await _context.Set<IOLInventoryItem>()
                .Where(i => i.TenantId == tenantId && i.DeletedAt == null)
                .Select(i => i.Manufacturer)
                .Distinct()
                .OrderBy(m => m)
                .ToListAsync();

            return manufacturers;
        }

        private IOLInventoryItemDto MapToDto(IOLInventoryItem item)
        {
            return new IOLInventoryItemDto
            {
                Id = item.Id,
                BranchId = item.BranchId,
                Model = item.Model,
                Manufacturer = item.Manufacturer,
                Sku = item.Sku,
                Type = item.Type,
                Material = item.Material,
                AConstant = item.AConstant,
                PowerRangeMin = item.PowerRangeMin,
                PowerRangeMax = item.PowerRangeMax,
                PowerIncrement = item.PowerIncrement,
                OpticDiameter = item.OpticDiameter,
                OverallDiameter = item.OverallDiameter,
                CylinderPowerRange = item.CylinderPowerRange,
                Toricity = item.Toricity,
                CurrentStock = item.CurrentStock,
                MinimumStock = item.MinimumStock,
                ReorderQuantity = item.ReorderQuantity,
                Location = item.Location,
                UnitPrice = item.UnitPrice,
                SupplierCost = item.SupplierCost,
                SupplierId = item.SupplierId,
                SupplierName = item.SupplierName,
                LeadTimeDays = item.LeadTimeDays,
                TotalUsed = item.TotalUsed,
                LastUsedDate = item.LastUsedDate,
                Notes = item.Notes,
                ExpiryDate = item.ExpiryDate,
                BatchNumber = item.BatchNumber,
                CreatedAt = item.CreatedAt,
                UpdatedAt = item.UpdatedAt,
                Status = item.Status
            };
        }
    }
}
