using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using AuthService.Context;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Middleware
{
    public class TenantResolutionMiddleware
    {
        private readonly RequestDelegate _next;

        public TenantResolutionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, AppDbContext dbContext)
        {
            var tenantHeader = context.Request.Headers["X-Tenant-ID"].ToString();
            
            // For login endpoint, debug endpoints, and tenant list endpoint, tenant ID comes from the body or is not needed
            if (context.Request.Path.StartsWithSegments("/api/auth/login") ||
                context.Request.Path.StartsWithSegments("/api/auth/debug") ||
                context.Request.Path.StartsWithSegments("/api/tenants/debug/codes") ||
                (context.Request.Path.StartsWithSegments("/api/tenants") && context.Request.Method == "GET"))
            {
                await _next(context);
                return;
            }

            if (string.IsNullOrEmpty(tenantHeader))
            {
                context.Response.StatusCode = 400;
                await context.Response.WriteAsJsonAsync(new { message = "Tenant ID is required" });
                return;
            }

            if (!Guid.TryParse(tenantHeader, out var tenantId))
            {
                context.Response.StatusCode = 400;
                await context.Response.WriteAsJsonAsync(new { message = "Invalid tenant ID format" });
                return;
            }

            var tenant = await dbContext.Tenants
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == tenantId);

            if (tenant == null)
            {
                context.Response.StatusCode = 404;
                await context.Response.WriteAsJsonAsync(new { message = "Tenant not found" });
                return;
            }

            if (!tenant.IsActive)
            {
                context.Response.StatusCode = 403;
                await context.Response.WriteAsJsonAsync(new { message = "Tenant is inactive" });
                return;
            }

            // Store tenant information in the HttpContext for use in controllers
            context.Items["TenantId"] = tenantId;
            context.Items["Tenant"] = tenant;

            await _next(context);
        }
    }

    // Extension method for easy middleware registration
    public static class TenantResolutionMiddlewareExtensions
    {
        public static IApplicationBuilder UseTenantResolution(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<TenantResolutionMiddleware>();
        }
    }
}