using InventoryApi.Data;
using InventoryApi.Models.DTOs;
using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Services;

public interface IVendorService
{
    Task<PagedResult<VendorDto>> ListAsync(Guid tenantId, int page, int pageSize, CancellationToken ct);
    Task<VendorDto?> GetAsync(Guid tenantId, Guid id, CancellationToken ct);
    Task<VendorDto> CreateAsync(Guid tenantId, Guid userId, CreateVendorRequest req, CancellationToken ct);
    Task<VendorDto?> UpdateAsync(Guid tenantId, Guid id, Guid userId, CreateVendorRequest req, CancellationToken ct);
    Task<bool> DeleteAsync(Guid tenantId, Guid id, Guid userId, CancellationToken ct);
}

public sealed class VendorService : IVendorService
{
    private readonly InventoryDbContext _db;

    public VendorService(InventoryDbContext db) => _db = db;

    public async Task<PagedResult<VendorDto>> ListAsync(Guid tenantId, int page, int pageSize, CancellationToken ct)
    {
        var q = _db.Vendors.Where(v => v.TenantId == tenantId && v.DeletedAt == null);
        var total = await q.CountAsync(ct);
        var items = await q
            .OrderBy(v => v.Name)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(v => ToDto(v))
            .ToListAsync(ct);
        return new PagedResult<VendorDto>(items, total, page, pageSize);
    }

    public async Task<VendorDto?> GetAsync(Guid tenantId, Guid id, CancellationToken ct)
    {
        var v = await _db.Vendors.FirstOrDefaultAsync(
            x => x.Id == id && x.TenantId == tenantId && x.DeletedAt == null, ct);
        return v is null ? null : ToDto(v);
    }

    public async Task<VendorDto> CreateAsync(Guid tenantId, Guid userId, CreateVendorRequest req, CancellationToken ct)
    {
        var vendor = new Vendor
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = req.Name,
            ContactPerson = req.ContactPerson,
            Phone = req.Phone,
            Email = req.Email,
            Address = req.Address,
            GstNumber = req.GstNumber,
            PanNumber = req.PanNumber,
            DrugLicenseNumber = req.DrugLicenseNumber,
            DrugLicenseExpiry = req.DrugLicenseExpiry,
            ApmcRegistration = req.ApmcRegistration,
            FoodLicenseNumber = req.FoodLicenseNumber,
            ImportExportCode = req.ImportExportCode,
            BankName = req.BankName,
            BankAccountNumber = req.BankAccountNumber,
            BankIfscCode = req.BankIfscCode,
            CreditDays = req.CreditDays,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedByUserId = userId,
            UpdatedByUserId = userId
        };
        _db.Vendors.Add(vendor);
        await _db.SaveChangesAsync(ct);
        return ToDto(vendor);
    }

    public async Task<VendorDto?> UpdateAsync(Guid tenantId, Guid id, Guid userId, CreateVendorRequest req, CancellationToken ct)
    {
        var vendor = await _db.Vendors.FirstOrDefaultAsync(
            x => x.Id == id && x.TenantId == tenantId && x.DeletedAt == null, ct);
        if (vendor is null) return null;

        vendor.Name = req.Name;
        vendor.ContactPerson = req.ContactPerson;
        vendor.Phone = req.Phone;
        vendor.Email = req.Email;
        vendor.Address = req.Address;
        vendor.GstNumber = req.GstNumber;
        vendor.PanNumber = req.PanNumber;
        vendor.DrugLicenseNumber = req.DrugLicenseNumber;
        vendor.DrugLicenseExpiry = req.DrugLicenseExpiry;
        vendor.ApmcRegistration = req.ApmcRegistration;
        vendor.FoodLicenseNumber = req.FoodLicenseNumber;
        vendor.ImportExportCode = req.ImportExportCode;
        vendor.BankName = req.BankName;
        vendor.BankAccountNumber = req.BankAccountNumber;
        vendor.BankIfscCode = req.BankIfscCode;
        vendor.CreditDays = req.CreditDays;
        vendor.UpdatedAt = DateTime.UtcNow;
        vendor.UpdatedByUserId = userId;

        await _db.SaveChangesAsync(ct);
        return ToDto(vendor);
    }

    public async Task<bool> DeleteAsync(Guid tenantId, Guid id, Guid userId, CancellationToken ct)
    {
        var vendor = await _db.Vendors.FirstOrDefaultAsync(
            x => x.Id == id && x.TenantId == tenantId && x.DeletedAt == null, ct);
        if (vendor is null) return false;
        vendor.DeletedAt = DateTime.UtcNow;
        vendor.Status = "inactive";
        vendor.UpdatedByUserId = userId;
        await _db.SaveChangesAsync(ct);
        return true;
    }

    private static VendorDto ToDto(Vendor v) => new(
        v.Id, v.Name, v.ContactPerson, v.Phone, v.Email,
        v.GstNumber, v.PanNumber, v.DrugLicenseNumber,
        v.DrugLicense20B, v.DrugLicense21B, v.CinNumber, v.SwiftCode,
        v.LatePaymentInterestRate, v.IsColdChainVendor,
        v.DrugLicenseExpiry, v.ApmcRegistration, v.FoodLicenseNumber,
        v.ImportExportCode, v.CreditDays, v.OutstandingBalance, v.Status);
}
