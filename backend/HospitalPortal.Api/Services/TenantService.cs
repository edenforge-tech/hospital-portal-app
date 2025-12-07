namespace HospitalPortal.Api.Services;

public class TenantService : ITenantService
{
    private int? _tenantId;
    private string? _tenantIdentifier;

    public int? GetTenantId() => _tenantId;

    public string? GetTenantIdentifier() => _tenantIdentifier;

    public void SetTenant(int tenantId, string tenantIdentifier)
    {
        _tenantId = tenantId;
        _tenantIdentifier = tenantIdentifier;
    }
}
