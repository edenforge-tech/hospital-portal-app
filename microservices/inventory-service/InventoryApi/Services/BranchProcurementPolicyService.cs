using InventoryApi.Data;
using InventoryApi.Models.DTOs;
using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Services;

public interface IBranchProcurementPolicyService
{
    Task<BranchProcurementPolicy?> GetActiveAsync(Guid tenantId, Guid branchId, CancellationToken ct);
    Task<List<BranchProcurementPolicy>> ListByBranchAsync(Guid tenantId, Guid branchId, CancellationToken ct);
    Task<BranchProcurementPolicy> SaveDraftAsync(Guid tenantId, Guid userId, SavePolicyDraftRequest req, CancellationToken ct);
    Task<BranchProcurementPolicy> PublishAsync(Guid tenantId, Guid userId, Guid policyId, PublishPolicyRequest req, CancellationToken ct);
    Task<BranchProcurementPolicy> RollbackAsync(Guid tenantId, Guid userId, Guid policyId, Guid versionId, CancellationToken ct);
    Task<BranchProcurementPolicy> ArchiveAsync(Guid tenantId, Guid userId, Guid policyId, CancellationToken ct);
    Task<List<BranchProcurementPolicyVersion>> GetVersionHistoryAsync(Guid tenantId, Guid policyId, CancellationToken ct);
    Task<SimulatePolicyResult> SimulateAsync(Guid tenantId, Guid branchId, SimulatePolicyRequest req, CancellationToken ct);
}

public sealed class BranchProcurementPolicyService : IBranchProcurementPolicyService
{
    private readonly InventoryDbContext _db;

    public BranchProcurementPolicyService(InventoryDbContext db) => _db = db;

    public async Task<BranchProcurementPolicy?> GetActiveAsync(Guid tenantId, Guid branchId, CancellationToken ct)
        => await _db.BranchProcurementPolicies
            .Where(p => p.TenantId == tenantId && p.BranchId == branchId
                     && p.PolicyStatus == "Published" && p.DeletedAt == null)
            .OrderByDescending(p => p.PublishedAt)
            .FirstOrDefaultAsync(ct);

    public async Task<List<BranchProcurementPolicy>> ListByBranchAsync(Guid tenantId, Guid branchId, CancellationToken ct)
        => await _db.BranchProcurementPolicies
            .Where(p => p.TenantId == tenantId && p.BranchId == branchId && p.DeletedAt == null)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(ct);

    public async Task<BranchProcurementPolicy> SaveDraftAsync(Guid tenantId, Guid userId, SavePolicyDraftRequest req, CancellationToken ct)
    {
        BranchProcurementPolicy policy;

        if (req.PolicyId.HasValue)
        {
            policy = await _db.BranchProcurementPolicies
                .FirstOrDefaultAsync(p => p.TenantId == tenantId && p.Id == req.PolicyId && p.DeletedAt == null, ct)
                ?? throw new KeyNotFoundException("Policy not found.");

            if (policy.PolicyStatus == "Published")
                throw new InvalidOperationException("Cannot edit a published policy. Create a new draft instead.");
        }
        else
        {
            policy = new BranchProcurementPolicy
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                BranchId = req.BranchId,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = userId,
            };
            _db.BranchProcurementPolicies.Add(policy);
        }

        policy.PolicyName = req.PolicyName;
        policy.DirectPoLimit = req.DirectPoLimit;
        policy.RfqMandatoryFrom = req.RfqMandatoryFrom;
        policy.DualApprovalFrom = req.DualApprovalFrom;
        policy.MinVendorQuotes = req.MinVendorQuotes;
        policy.EmergencyBypassAllowed = req.EmergencyBypassAllowed;
        policy.EmergencyBypassExpiryHours = req.EmergencyBypassExpiryHours;
        policy.Notes = req.Notes;
        policy.PolicyStatus = "Draft";
        policy.UpdatedAt = DateTime.UtcNow;
        policy.UpdatedByUserId = userId;

        await _db.SaveChangesAsync(ct);
        return policy;
    }

    public async Task<BranchProcurementPolicy> PublishAsync(Guid tenantId, Guid userId, Guid policyId, PublishPolicyRequest req, CancellationToken ct)
    {
        var policy = await _db.BranchProcurementPolicies
            .FirstOrDefaultAsync(p => p.TenantId == tenantId && p.Id == policyId && p.DeletedAt == null, ct)
            ?? throw new KeyNotFoundException("Policy not found.");

        if (policy.PolicyStatus != "Draft")
            throw new InvalidOperationException("Only a Draft policy can be published.");

        // Supersede existing published policy for this branch
        var existing = await _db.BranchProcurementPolicies
            .Where(p => p.TenantId == tenantId && p.BranchId == policy.BranchId
                     && p.PolicyStatus == "Published" && p.Id != policyId && p.DeletedAt == null)
            .ToListAsync(ct);

        foreach (var old in existing)
        {
            old.PolicyStatus = "Superseded";
            old.EffectiveTo = DateTime.UtcNow;
            old.UpdatedAt = DateTime.UtcNow;
            old.UpdatedByUserId = userId;
        }

        // Determine next version number
        var maxVersion = await _db.BranchProcurementPolicyVersions
            .Where(v => v.PolicyId == policyId && v.DeletedAt == null)
            .MaxAsync(v => (int?)v.VersionNumber, ct) ?? 0;

        var version = new BranchProcurementPolicyVersion
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PolicyId = policyId,
            VersionNumber = maxVersion + 1,
            DirectPoLimit = policy.DirectPoLimit,
            RfqMandatoryFrom = policy.RfqMandatoryFrom,
            DualApprovalFrom = policy.DualApprovalFrom,
            MinVendorQuotes = policy.MinVendorQuotes,
            EmergencyBypassAllowed = policy.EmergencyBypassAllowed,
            EmergencyBypassExpiryHours = policy.EmergencyBypassExpiryHours,
            ChangeNotes = req.ChangeNotes,
            CreatedAt = DateTime.UtcNow,
            CreatedByUserId = userId,
        };
        _db.BranchProcurementPolicyVersions.Add(version);

        policy.PolicyStatus = "Published";
        policy.PublishedAt = DateTime.UtcNow;
        policy.PublishedByUserId = userId;
        policy.EffectiveFrom = req.EffectiveFrom ?? DateTime.UtcNow;
        policy.EffectiveTo = req.EffectiveTo;
        policy.UpdatedAt = DateTime.UtcNow;
        policy.UpdatedByUserId = userId;

        await _db.SaveChangesAsync(ct);
        return policy;
    }

    public async Task<BranchProcurementPolicy> RollbackAsync(Guid tenantId, Guid userId, Guid policyId, Guid versionId, CancellationToken ct)
    {
        var version = await _db.BranchProcurementPolicyVersions
            .FirstOrDefaultAsync(v => v.TenantId == tenantId && v.Id == versionId && v.PolicyId == policyId && v.DeletedAt == null, ct)
            ?? throw new KeyNotFoundException("Version not found.");

        var draftReq = new SavePolicyDraftRequest
        {
            BranchId = (await _db.BranchProcurementPolicies.FirstAsync(p => p.Id == policyId, ct)).BranchId,
            PolicyName = $"Rollback to v{version.VersionNumber} – {DateTime.UtcNow:dd MMM yyyy}",
            DirectPoLimit = version.DirectPoLimit,
            RfqMandatoryFrom = version.RfqMandatoryFrom,
            DualApprovalFrom = version.DualApprovalFrom,
            MinVendorQuotes = version.MinVendorQuotes,
            EmergencyBypassAllowed = version.EmergencyBypassAllowed,
            EmergencyBypassExpiryHours = version.EmergencyBypassExpiryHours,
            Notes = $"Rolled back from version {version.VersionNumber}",
        };

        return await SaveDraftAsync(tenantId, userId, draftReq, ct);
    }

    public async Task<BranchProcurementPolicy> ArchiveAsync(Guid tenantId, Guid userId, Guid policyId, CancellationToken ct)
    {
        var policy = await _db.BranchProcurementPolicies
            .FirstOrDefaultAsync(p => p.TenantId == tenantId && p.Id == policyId && p.DeletedAt == null, ct)
            ?? throw new KeyNotFoundException("Policy not found.");

        if (policy.PolicyStatus == "Draft")
            throw new InvalidOperationException("Draft policies cannot be archived. Delete the draft instead.");
        if (policy.PolicyStatus == "Archived")
            throw new InvalidOperationException("Policy is already archived.");

        policy.PolicyStatus    = "Archived";
        policy.EffectiveTo     = DateTime.UtcNow;
        policy.UpdatedAt       = DateTime.UtcNow;
        policy.UpdatedByUserId = userId;

        await _db.SaveChangesAsync(ct);
        return policy;
    }

    public async Task<List<BranchProcurementPolicyVersion>> GetVersionHistoryAsync(Guid tenantId, Guid policyId, CancellationToken ct)
        => await _db.BranchProcurementPolicyVersions
            .Where(v => v.TenantId == tenantId && v.PolicyId == policyId && v.DeletedAt == null)
            .OrderByDescending(v => v.VersionNumber)
            .ToListAsync(ct);

    public async Task<SimulatePolicyResult> SimulateAsync(Guid tenantId, Guid branchId, SimulatePolicyRequest req, CancellationToken ct)
    {
        var policy = await GetActiveAsync(tenantId, branchId, ct);
        if (policy == null)
            return new SimulatePolicyResult(req.Amount, "NoPolicyFound", false, false, false, 0, null);

        bool needsRfq = req.Amount >= policy.RfqMandatoryFrom;
        bool canDirectPo = req.Amount < policy.DirectPoLimit;
        bool needsDualApproval = req.Amount >= policy.DualApprovalFrom;
        string recommendedPath = needsRfq ? "RFQ" : "DirectPO";

        return new SimulatePolicyResult(
            req.Amount,
            recommendedPath,
            needsRfq,
            canDirectPo,
            needsDualApproval,
            policy.MinVendorQuotes,
            policy.EmergencyBypassAllowed ? policy.EmergencyBypassExpiryHours : null
        );
    }
}
