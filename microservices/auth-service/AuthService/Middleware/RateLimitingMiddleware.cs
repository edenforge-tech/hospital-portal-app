using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

namespace AuthService.Middleware
{
    public static class RateLimitingMiddleware
    {
        public static IServiceCollection AddCustomRateLimiting(this IServiceCollection services, IConfiguration configuration)
        {
            // Global rate limiting
            var globalLimits = configuration.GetSection("RateLimiting:GlobalLimits").Get<RateLimitOptions>();
            services.AddRateLimiter(options =>
            {
                options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: context.User?.Identity?.Name ?? context.Request.Headers.Host.ToString(),
                        factory: _ => new FixedWindowRateLimiterOptions
                        {
                            AutoReplenishment = true,
                            PermitLimit = globalLimits.PermitLimit,
                            QueueLimit = globalLimits.QueueLimit,
                            Window = TimeSpan.Parse(globalLimits.Window)
                        }));

                // Login endpoint limits
                var loginLimits = configuration.GetSection("RateLimiting:EndpointLimits:Auth:Login").Get<RateLimitOptions>();
                options.AddPolicy("login", context =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                        factory: _ => new FixedWindowRateLimiterOptions
                        {
                            AutoReplenishment = true,
                            PermitLimit = loginLimits.PermitLimit,
                            QueueLimit = loginLimits.QueueLimit,
                            Window = TimeSpan.Parse(loginLimits.Window)
                        }));

                // Registration endpoint limits
                var registerLimits = configuration.GetSection("RateLimiting:EndpointLimits:Auth:Register").Get<RateLimitOptions>();
                options.AddPolicy("register", context =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                        factory: _ => new FixedWindowRateLimiterOptions
                        {
                            AutoReplenishment = true,
                            PermitLimit = registerLimits.PermitLimit,
                            QueueLimit = registerLimits.QueueLimit,
                            Window = TimeSpan.Parse(registerLimits.Window)
                        }));

                options.OnRejected = async (context, token) =>
                {
                    if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
                    {
                        context.HttpContext.Response.Headers.RetryAfter = ((int)retryAfter.TotalSeconds).ToString();
                    }

                    context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                    await context.HttpContext.Response.WriteAsJsonAsync(new
                    {
                        error = "Too many requests",
                        retryAfter = retryAfter.TotalSeconds
                    }, token);
                };
            });

            return services;
        }
    }

    public class RateLimitOptions
    {
        public int PermitLimit { get; set; }
        public string Window { get; set; }
        public int QueueLimit { get; set; }
    }
}