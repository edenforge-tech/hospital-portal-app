using AuthService.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AuthService.Services
{
    public interface IIOLInventoryService
    {
        Task<(List<IOLInventoryItemDto> Data, int Total)> GetAllAsync(int page, int pageSize, string? search, string? type, string? manufacturer, bool? lowStock, Guid? branchId);
        Task<IOLInventoryItemDto?> GetByIdAsync(Guid id);
        Task<IOLStatisticsDto> GetStatisticsAsync(Guid? branchId);
        Task<IOLInventoryItemDto> CreateAsync(IOLInventoryItemDto dto, Guid userId);
        Task<IOLInventoryItemDto> UpdateAsync(Guid id, IOLInventoryItemDto dto, Guid userId);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> AdjustStockAsync(StockAdjustmentDto adjustment, Guid userId);
        Task<List<IOLInventoryItemDto>> GetLowStockAsync(Guid? branchId);
        Task<List<IOLInventoryItemDto>> SearchAsync(string query);
        Task<List<string>> GetManufacturersAsync();
    }
}
