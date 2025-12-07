using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Services;

public class TenantService : ITenantService
{
    private readonly AppDbContext _context;
    private readonly ILogger<TenantService> _logger;

    public TenantService(AppDbContext context, ILogger<TenantService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Tenant?> GetTenantByIdAsync(Guid id)
    {
        return await _context.Tenants
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<Tenant> CreateTenantAsync(Tenant tenant)
    {
        if (tenant.Id == Guid.Empty)
        {
            tenant.Id = Guid.NewGuid();
        }

        _context.Tenants.Add(tenant);
        await _context.SaveChangesAsync();
        
        return tenant;
    }

    public async Task<IEnumerable<Tenant>> GetAllTenantsAsync()
    {
        return await _context.Tenants.ToListAsync();
    }

    public async Task<bool> DeleteTenantAsync(Guid id)
    {
        var tenant = await _context.Tenants.FindAsync(id);
        if (tenant == null)
        {
            return false;
        }

        _context.Tenants.Remove(tenant);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<Tenant?> UpdateTenantAsync(Tenant tenant)
    {
        var existingTenant = await _context.Tenants.FindAsync(tenant.Id);
        if (existingTenant == null)
        {
            return null;
        }

        _context.Entry(existingTenant).CurrentValues.SetValues(tenant);
        await _context.SaveChangesAsync();
        
        return existingTenant;
    }

    public async Task<Tenant?> GetTenantByCodeAsync(string code)
    {
        return await _context.Tenants.FirstOrDefaultAsync(t => t.TenantCode == code);
    }

    public async Task<Tenant?> GetTenantByDomainAsync(string domain)
    {
        return await _context.Tenants.FirstOrDefaultAsync(t => t.Name != null && t.Name.Contains(domain));
    }

    public async Task<bool> UpdateTenantStatusAsync(Guid tenantId, string status)
    {
        var tenant = await _context.Tenants.FindAsync(tenantId);
        if (tenant == null) return false;
        tenant.Status = status;
        tenant.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateSubscriptionAsync(Guid tenantId, string tier, int maxBranches, int maxUsers)
    {
        var tenant = await _context.Tenants.FindAsync(tenantId);
        if (tenant == null) return false;
        tenant.SubscriptionTier = tier;
        tenant.MaxBranches = maxBranches;
        tenant.MaxUsers = maxUsers;
        tenant.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateComplianceAsync(Guid tenantId, bool hipaa, bool nabh, bool gdpr, bool dpa)
    {
        var tenant = await _context.Tenants.FindAsync(tenantId);
        if (tenant == null) return false;
        tenant.HipaaCompliant = hipaa;
        tenant.NabhAccredited = nabh;
        tenant.GdprCompliant = gdpr;
        tenant.DpaCompliant = dpa;
        tenant.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<Tenant>> SearchTenantsAsync(string searchTerm)
    {
        return await _context.Tenants
            .Where(t => (t.Name != null && t.Name.Contains(searchTerm)) || 
                       (t.TenantCode != null && t.TenantCode.Contains(searchTerm)))
            .ToListAsync();
    }

    public async Task<object> GetUsageAsync(Guid tenantId)
    {
        return new { TenantId = tenantId, Message = "Usage data not implemented" };
    }

    public async Task<object> GetStatisticsAsync(Guid tenantId)
    {
        return new { TenantId = tenantId, Message = "Statistics not implemented" };
    }

    public async Task<object> CheckLimitsAsync(Guid tenantId)
    {
        return new { TenantId = tenantId, Message = "Limit checking not implemented" };
    }

    public async Task<int> GetOrganizationCountAsync(Guid tenantId)
    {
        return await _context.Organizations.CountAsync(o => o.TenantId == tenantId);
    }

    public async Task<int> GetBranchCountAsync(Guid tenantId)
    {
        return await _context.Branches.CountAsync(b => b.TenantId == tenantId);
    }

    public async Task<Dictionary<string, string>> GetAllTenantCodesForDebugAsync()
    {
        var tenants = await _context.Tenants.ToListAsync();
        return tenants.ToDictionary(t => t.Id.ToString(), t => t.TenantCode ?? "NO_CODE");
    }

    public async Task<List<object>> GetAllTenantsForLoginAsync()
    {
        var tenants = await _context.Tenants
            .Where(t => t.Status == "Active")
            .Select(t => new
            {
                id = t.Id.ToString(),
                name = t.Name,
                tenantCode = t.TenantCode
            })
            .ToListAsync();
        return tenants.Cast<object>().ToList();
    }
}