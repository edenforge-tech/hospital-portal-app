using Microsoft.EntityFrameworkCore;
using IpManagementService.Data;
using IpManagementService.Models.Dtos;

namespace IpManagementService.Services;

public interface IIolCatalogService
{
    Task<List<IolCatalogItemDto>> ListAsync(Guid tenantId);
}

public class IolCatalogService : IIolCatalogService
{
    private readonly IpManagementDbContext _db;

    public IolCatalogService(IpManagementDbContext db)
    {
        _db = db;
    }

    public async Task<List<IolCatalogItemDto>> ListAsync(Guid tenantId)
    {
        return await _db.IolCatalogMaster
            .Where(x => x.TenantId == tenantId && x.IsActive && x.DeletedAt == null)
            .OrderBy(x => x.DisplayOrder)
            .ThenBy(x => x.ModelName)
            .Select(x => new IolCatalogItemDto(
                x.Id, x.ModelName, x.Brand, x.IolType, x.Origin, x.LensCategory,
                x.PowerRangeMin, x.PowerRangeMax, x.PowerIncrement, x.AConstant,
                x.DefaultPrice, x.ProductCode))
            .ToListAsync();
    }
}
