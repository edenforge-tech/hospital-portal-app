using InventoryApi.Models.DTOs;

namespace InventoryApi.Services;

public interface IVendorBankAccountService
{
    Task<List<VendorBankAccountDto>> ListAsync(
        Guid tenantId, Guid vendorId, CancellationToken ct = default);

    Task<VendorBankAccountDto> CreateAsync(
        Guid tenantId, Guid vendorId, Guid userId,
        CreateVendorBankAccountRequest req, CancellationToken ct = default);

    /// <summary>Returns false if the account was not found or does not belong to the vendor.</summary>
    Task<bool> SoftDeleteAsync(
        Guid tenantId, Guid vendorId, Guid accountId, Guid userId, CancellationToken ct = default);

    Task<VendorBankAccountDto> SetPrimaryAsync(
        Guid tenantId, Guid vendorId, Guid accountId, Guid userId, CancellationToken ct = default);
}
