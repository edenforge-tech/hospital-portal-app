using InventoryApi.Data;
using InventoryApi.Models.DTOs;
using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InventoryApi.Services;

public sealed class VendorBankAccountService : IVendorBankAccountService
{
    private readonly InventoryDbContext _db;
    private readonly ILogger<VendorBankAccountService> _log;

    public VendorBankAccountService(InventoryDbContext db, ILogger<VendorBankAccountService> log)
    {
        _db  = db;
        _log = log;
    }

    // ── List ──────────────────────────────────────────────────────────────────
    public async Task<List<VendorBankAccountDto>> ListAsync(
        Guid tenantId, Guid vendorId, CancellationToken ct = default)
    {
        return await _db.VendorBankAccounts
            .Where(a => a.TenantId == tenantId && a.VendorId == vendorId && a.DeletedAt == null)
            .OrderByDescending(a => a.IsPrimary)
            .ThenBy(a => a.CreatedAt)
            .Select(a => ToDto(a))
            .ToListAsync(ct);
    }

    // ── Create ────────────────────────────────────────────────────────────────
    public async Task<VendorBankAccountDto> CreateAsync(
        Guid tenantId, Guid vendorId, Guid userId,
        CreateVendorBankAccountRequest req, CancellationToken ct = default)
    {
        var isFirst = !await _db.VendorBankAccounts
            .AnyAsync(a => a.TenantId == tenantId && a.VendorId == vendorId && a.DeletedAt == null, ct);

        // If this is being marked primary, clear existing primary flag
        if (req.IsPrimary || isFirst)
        {
            await _db.VendorBankAccounts
                .Where(a => a.TenantId == tenantId && a.VendorId == vendorId && a.IsPrimary && a.DeletedAt == null)
                .ExecuteUpdateAsync(s => s.SetProperty(a => a.IsPrimary, false), ct);
        }

        var account = new VendorBankAccount
        {
            Id                  = Guid.NewGuid(),
            TenantId            = tenantId,
            VendorId            = vendorId,
            AccountHolderName   = req.AccountHolderName.Trim(),
            BankName            = req.BankName.Trim(),
            AccountNumber       = req.AccountNumber.Trim(),
            IfscCode            = req.IfscCode.Trim().ToUpperInvariant(),
            AccountType         = req.AccountType,
            IsPrimary           = req.IsPrimary || isFirst,
            Nickname            = req.Nickname?.Trim(),
            CreatedAt           = DateTime.UtcNow,
            UpdatedAt           = DateTime.UtcNow,
            CreatedByUserId     = userId,
            UpdatedByUserId     = userId,
            Status              = "active"
        };

        _db.VendorBankAccounts.Add(account);
        await _db.SaveChangesAsync(ct);
        _log.LogInformation("Created bank account {Id} for vendor {VendorId}", account.Id, vendorId);
        return ToDto(account);
    }

    // ── Soft Delete ───────────────────────────────────────────────────────────
    public async Task<bool> SoftDeleteAsync(
        Guid tenantId, Guid vendorId, Guid accountId, Guid userId, CancellationToken ct = default)
    {
        var account = await _db.VendorBankAccounts
            .FirstOrDefaultAsync(a => a.Id == accountId
                && a.TenantId == tenantId && a.VendorId == vendorId && a.DeletedAt == null, ct);

        if (account is null) return false;

        var totalActive = await _db.VendorBankAccounts
            .CountAsync(a => a.TenantId == tenantId && a.VendorId == vendorId && a.DeletedAt == null, ct);

        if (totalActive <= 1)
            throw new InvalidOperationException("Cannot remove the only bank account on file for this vendor.");

        account.DeletedAt        = DateTime.UtcNow;
        account.Status           = "deleted";
        account.UpdatedAt        = DateTime.UtcNow;
        account.UpdatedByUserId  = userId;

        // Reassign primary to the oldest remaining account
        if (account.IsPrimary)
        {
            account.IsPrimary = false;
            var next = await _db.VendorBankAccounts
                .Where(a => a.TenantId == tenantId && a.VendorId == vendorId
                         && a.DeletedAt == null && a.Id != accountId)
                .OrderBy(a => a.CreatedAt)
                .FirstOrDefaultAsync(ct);
            if (next is not null) next.IsPrimary = true;
        }

        await _db.SaveChangesAsync(ct);
        return true;
    }

    // ── Set Primary ───────────────────────────────────────────────────────────
    public async Task<VendorBankAccountDto> SetPrimaryAsync(
        Guid tenantId, Guid vendorId, Guid accountId, Guid userId, CancellationToken ct = default)
    {
        var account = await _db.VendorBankAccounts
            .FirstOrDefaultAsync(a => a.Id == accountId
                && a.TenantId == tenantId && a.VendorId == vendorId && a.DeletedAt == null, ct)
            ?? throw new InvalidOperationException("Bank account not found.");

        await _db.VendorBankAccounts
            .Where(a => a.TenantId == tenantId && a.VendorId == vendorId && a.IsPrimary && a.DeletedAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(a => a.IsPrimary, false), ct);

        account.IsPrimary        = true;
        account.UpdatedAt        = DateTime.UtcNow;
        account.UpdatedByUserId  = userId;
        await _db.SaveChangesAsync(ct);
        return ToDto(account);
    }

    // ── Private helpers ───────────────────────────────────────────────────────
    private static VendorBankAccountDto ToDto(VendorBankAccount a) => new(
        a.Id, a.VendorId,
        a.AccountHolderName,
        a.BankName,
        a.AccountNumber,
        Mask(a.AccountNumber),
        a.IfscCode,
        a.AccountType,
        a.IsPrimary,
        a.Nickname,
        a.CreatedAt
    );

    private static string Mask(string acct) =>
        acct.Length > 4 ? $"••••{acct[^4..]}" : "••••";
}
