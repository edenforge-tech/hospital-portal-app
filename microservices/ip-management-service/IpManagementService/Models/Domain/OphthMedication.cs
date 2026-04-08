namespace IpManagementService.Models.Domain;

/// <summary>
/// Read-only projection of the ophth_medication table (owned by auth-service).
/// Used in master data endpoints to provide medication suggestions for nurse records.
/// </summary>
public class OphthMedication
{
    public Guid      Id          { get; set; }
    public Guid      TenantId    { get; set; }
    public string    GenericName { get; set; } = null!;
    public string?   DrugClass   { get; set; }
    public string?   Route       { get; set; }
    public string    Status      { get; set; } = "active";
    public DateTime  CreatedAt   { get; set; }
    public DateTime? DeletedAt   { get; set; }
}
