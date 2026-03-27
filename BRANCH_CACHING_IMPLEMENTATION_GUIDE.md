# Branch Caching Implementation Guide

## Overview
This document describes the branch caching optimization for the Hospital Portal backend. The caching service reduces repeated database queries for branch lookups within the same tenant context.

## Problem Statement
Across Modules 3.6-3.10, every service method that creates an entity with `BranchId` performs this query:
```csharp
var branch = await _context.Branches.FirstOrDefaultAsync(b => b.TenantId == tenantId);
```

In a typical counseling session workflow:
- Patient creates 1 session → 1 branch lookup
- Counselor creates 3 packages → 3 branch lookups
- Counselor creates 2 insurance pre-auths → 2 branch lookups
- Counselor creates 1 payment → 1 branch lookup
- Counselor creates 1 consent → 1 branch lookup
- Counselor creates 1 admission → 1 branch lookup

**Total: 9 identical database queries for the same branch within minutes**

## Solution: BranchCacheService

### Service Implementation
Created `Services/BranchCacheService.cs` with:
- **In-memory caching** using IMemoryCache
- **15-minute absolute expiration** (branch data rarely changes)
- **5-minute sliding expiration** (keeps active tenant data fresh)
- **Cache invalidation** method for immediate updates

### Usage Pattern

#### Before (Every Service):
```csharp
public async Task<PaymentTransactionDto> CreatePaymentAsync(CreatePaymentRequest request, Guid tenantId, Guid userId)
{
    var branch = await _context.Branches.FirstOrDefaultAsync(b => b.TenantId == tenantId);
    if (branch == null)
        throw new InvalidOperationException("Branch not found for tenant");
    
    var payment = new PaymentTransaction
    {
        TenantId = tenantId,
        BranchId = branch.Id,
        ...
    };
}
```

#### After (With Caching):
```csharp
public async Task<PaymentTransactionDto> CreatePaymentAsync(CreatePaymentRequest request, Guid tenantId, Guid userId)
{
    var branch = await _branchCache.GetDefaultBranchForTenantAsync(tenantId);
    if (branch == null)
        throw new InvalidOperationException("Branch not found for tenant");
    
    var payment = new PaymentTransaction
    {
        TenantId = tenantId,
        BranchId = branch.Id,
        ...
    };
}
```

**Benefits**:
- First call: Database query (normal)
- Subsequent calls (within 15 min): Cached (no DB query)
- Reduces database load by ~90% for branch lookups

## Implementation Steps

### Step 1: Register Service in Program.cs
```csharp
// Add after other service registrations
builder.Services.AddMemoryCache();
builder.Services.AddScoped<IBranchCacheService, BranchCacheService>();
```

### Step 2: Update Service Constructors
For each service using branch lookups (all Module 3 services):

**Example - PaymentProcessingService.cs:**
```csharp
public class PaymentProcessingService : IPaymentProcessingService
{
    private readonly AppDbContext _context;
    private readonly IBranchCacheService _branchCache;

    public PaymentProcessingService(
        AppDbContext context,
        IBranchCacheService branchCache)  // ← ADD THIS
    {
        _context = context;
        _branchCache = branchCache;
    }
}
```

### Step 3: Replace Branch Lookups
Replace all instances of:
```csharp
var branch = await _context.Branches.FirstOrDefaultAsync(b => b.TenantId == tenantId);
```

With:
```csharp
var branch = await _branchCache.GetDefaultBranchForTenantAsync(tenantId);
```

## Services Requiring Updates

### Module 3.6 Insurance (InsuranceWorkflowService.cs)
- ✅ CreatePreAuthAsync
- ✅ CreateClaimAsync

### Module 3.7 Payments (PaymentProcessingService.cs)
- ✅ CreatePaymentAsync
- ✅ CreateGovernmentClaimAsync

### Module 3.8 Admissions (AdmissionManagementService.cs)
- ✅ CreateDayCareAdmissionAsync
- ✅ CreateIPDAdmissionAsync
- ✅ CreateEmergencyAdmissionAsync
- ✅ CreateBedReservationAsync

### Module 3.9 Consents (ConsentManagementService.cs)
- ✅ RenderConsentAsync

### Module 3.10 Workflow (WorkflowOrchestrationService.cs)
- ✅ InitializeWorkflowAsync

**Total: 11 methods across 5 services**

## Cache Invalidation

### When to Clear Cache
Clear the cache when branch data changes:

**BranchesController.cs:**
```csharp
[HttpPut("{id}")]
public async Task<IActionResult> UpdateBranch(Guid id, [FromBody] UpdateBranchRequest request)
{
    var branch = await _branchService.UpdateBranchAsync(id, request, userId);
    
    // Clear cache after update
    _branchCache.ClearCache(branch.TenantId);
    
    return Ok(branch);
}

[HttpDelete("{id}")]
public async Task<IActionResult> DeleteBranch(Guid id)
{
    var deleted = await _branchService.DeleteBranchAsync(id);
    
    // Clear cache after deletion
    _branchCache.ClearCache(deleted.TenantId);
    
    return NoContent();
}
```

## Performance Impact

### Estimated Improvements
- **Database queries reduced**: 90% for branch lookups
- **Response time improvement**: 5-10ms per cached lookup
- **Single session workflow**: 8 fewer DB queries (after first lookup)
- **100 concurrent users**: ~800 fewer queries/minute

### Memory Usage
- **Per cache entry**: ~200 bytes (Branch object)
- **100 active tenants**: ~20KB total
- **Negligible impact** compared to benefits

## Testing

### Test 1: Cache Hit
```powershell
# First call - should hit database
Measure-Command { Invoke-RestMethod -Uri "http://localhost:5073/api/payments" -Headers $headers }
# ~50ms

# Second call - should hit cache
Measure-Command { Invoke-RestMethod -Uri "http://localhost:5073/api/payments" -Headers $headers }
# ~40ms (10ms faster)
```

### Test 2: Cache Invalidation
```powershell
# Update branch
Invoke-RestMethod -Uri "http://localhost:5073/api/branches/$branchId" -Method Put -Headers $headers -Body $updateJson

# Next call should hit database again (cache cleared)
```

## Rollout Strategy

### Phase 1: Enable Caching (This PR)
1. ✅ Create BranchCacheService
2. ✅ Register in Program.cs
3. ⏳ Update all service constructors
4. ⏳ Replace all branch lookups

### Phase 2: Monitor Performance
1. Add logging to track cache hits/misses
2. Monitor database query reduction
3. Verify no stale data issues

### Phase 3: Expand Caching
Consider caching other frequently accessed data:
- Patients (by ID)
- Insurance providers (by code)
- Consent templates (by ID)
- User profiles (by ID)

## Alternative Approaches Considered

### 1. Request-Scoped Caching
**Pros**: No stale data concerns
**Cons**: Only helps if multiple services called in single request

### 2. Redis Distributed Cache
**Pros**: Shared across instances, larger capacity
**Cons**: Overkill for branch data, added complexity, network latency

### 3. Database-Level Caching
**Pros**: Transparent, no code changes
**Cons**: Less control, harder to monitor

**Decision**: In-memory caching provides best balance of performance gains and simplicity.

## Monitoring & Metrics

### Key Metrics to Track
- Cache hit ratio (target: >80%)
- Average lookup time (cached vs uncached)
- Memory usage
- Cache expiration frequency

### Example Logging
```csharp
public async Task<Branch?> GetDefaultBranchForTenantAsync(Guid tenantId)
{
    var cacheKey = $"Branch_{tenantId}";

    if (_cache.TryGetValue(cacheKey, out Branch? cachedBranch))
    {
        _logger.LogDebug("Branch cache HIT for tenant {TenantId}", tenantId);
        return cachedBranch;
    }

    _logger.LogDebug("Branch cache MISS for tenant {TenantId}", tenantId);
    var branch = await _context.Branches.FirstOrDefaultAsync(b => b.TenantId == tenantId);
    
    // ... rest of method
}
```

## Conclusion

Branch caching is a **low-risk, high-reward optimization** that:
- Reduces database load significantly
- Improves response times
- Requires minimal code changes
- Has negligible memory footprint

Proceed with rollout to all Module 3 services.

---

**Status**: ✅ Service created, 📋 Awaiting implementation in services
**Priority**: 🟡 Medium (optimization, not critical)
**Estimated Time**: 30-45 minutes for complete rollout
**Risk Level**: 🟢 Low
