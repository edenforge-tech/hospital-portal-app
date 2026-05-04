using InventoryApi.Data;
using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Services;

public interface IBillTransferPolicyService
{
    /// <summary>Returns the effective policy for the tenant, using defaults when no row exists.</summary>
    Task<BillTransferPolicy> GetPolicyAsync(Guid tenantId, CancellationToken ct);

    Task<BillTransferPolicy> UpsertPolicyAsync(
        Guid tenantId,
        decimal lowValueThreshold,
        bool allowFlexOverride,
        bool requireOverrideReason,
        Guid updatedByUserId,
        CancellationToken ct);
}

public sealed class BillTransferPolicyService : IBillTransferPolicyService
{
    private readonly InventoryDbContext _db;

    // Hard default – same as DB column default
    private static readonly BillTransferPolicy _systemDefault = new()
    {
        TenantId                   = Guid.Empty,
        LowValueOverrideThreshold  = 50_000m,
        AllowLowValueFlexOverride  = true,
        RequireOverrideReason      = true
    };

    public BillTransferPolicyService(InventoryDbContext db) => _db = db;

    public async Task<BillTransferPolicy> GetPolicyAsync(Guid tenantId, CancellationToken ct)
    {
        var row = await _db.BillTransferPolicies
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.TenantId == tenantId, ct);

        if (row is not null) return row;

        // Return a transient default so callers never get null
        return new BillTransferPolicy
        {
            TenantId                   = tenantId,
            LowValueOverrideThreshold  = _systemDefault.LowValueOverrideThreshold,
            AllowLowValueFlexOverride  = _systemDefault.AllowLowValueFlexOverride,
            RequireOverrideReason      = _systemDefault.RequireOverrideReason
        };
    }

    public async Task<BillTransferPolicy> UpsertPolicyAsync(
        Guid tenantId,
        decimal lowValueThreshold,
        bool allowFlexOverride,
        bool requireOverrideReason,
        Guid updatedByUserId,
        CancellationToken ct)
    {
        var row = await _db.BillTransferPolicies
            .FirstOrDefaultAsync(p => p.TenantId == tenantId, ct);

        if (row is null)
        {
            row = new BillTransferPolicy { TenantId = tenantId };
            _db.BillTransferPolicies.Add(row);
        }

        row.LowValueOverrideThreshold = lowValueThreshold;
        row.AllowLowValueFlexOverride = allowFlexOverride;
        row.RequireOverrideReason     = requireOverrideReason;
        row.UpdatedByUserId           = updatedByUserId;
        row.UpdatedAt                 = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return row;
    }
}
