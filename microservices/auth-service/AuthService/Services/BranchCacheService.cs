using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;
using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace AuthService.Services
{
    /// <summary>
    /// Caches branch lookups to improve performance when the same tenant ID is used repeatedly.
    /// Typically, within a single request, the same tenant will be queried multiple times across different services.
    /// </summary>
    public interface IBranchCacheService
    {
        Task<Branch?> GetDefaultBranchForTenantAsync(Guid tenantId);
        void ClearCache(Guid tenantId);
    }

    public class BranchCacheService : IBranchCacheService
    {
        private readonly AppDbContext _context;
        private readonly IMemoryCache _cache;
        private const int CacheExpirationMinutes = 15;

        public BranchCacheService(AppDbContext context, IMemoryCache cache)
        {
            _context = context;
            _cache = cache;
        }

        public async Task<Branch?> GetDefaultBranchForTenantAsync(Guid tenantId)
        {
            var cacheKey = $"Branch_{tenantId}";

            if (_cache.TryGetValue(cacheKey, out Branch? cachedBranch))
            {
                return cachedBranch;
            }

            var branch = await _context.Branches
                .FirstOrDefaultAsync(b => b.TenantId == tenantId);

            if (branch != null)
            {
                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetAbsoluteExpiration(TimeSpan.FromMinutes(CacheExpirationMinutes))
                    .SetSlidingExpiration(TimeSpan.FromMinutes(5));

                _cache.Set(cacheKey, branch, cacheOptions);
            }

            return branch;
        }

        public void ClearCache(Guid tenantId)
        {
            var cacheKey = $"Branch_{tenantId}";
            _cache.Remove(cacheKey);
        }
    }
}
