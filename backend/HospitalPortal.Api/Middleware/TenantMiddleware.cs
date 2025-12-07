using HospitalPortal.Api.Data;
using HospitalPortal.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace HospitalPortal.Api.Middleware;

public class TenantMiddleware
{
    private readonly RequestDelegate _next;

    public TenantMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ITenantService tenantService, ApplicationDbContext dbContext)
    {
        // Try to get tenant identifier from header
        if (context.Request.Headers.TryGetValue("X-Tenant-ID", out var tenantIdentifier))
        {
            var tenant = await dbContext.Tenants
                .Where(t => t.TenantIdentifier == tenantIdentifier.ToString() && t.IsActive)
                .FirstOrDefaultAsync();

            if (tenant != null)
            {
                tenantService.SetTenant(tenant.Id, tenant.TenantIdentifier);
                dbContext.SetTenantId(tenant.Id);
            }
        }

        await _next(context);
    }
}
