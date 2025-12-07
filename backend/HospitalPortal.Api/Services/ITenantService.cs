namespace HospitalPortal.Api.Services;

public interface ITenantService
{
    int? GetTenantId();
    string? GetTenantIdentifier();
    void SetTenant(int tenantId, string tenantIdentifier);
}
