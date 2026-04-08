namespace IpManagementService.Models.Domain;

public class Ward
{
    public Guid    Id         { get; set; }
    public Guid    TenantId   { get; set; }
    public Guid    BranchId   { get; set; }
    public string  WardName   { get; set; } = string.Empty;
    public string  WardType   { get; set; } = string.Empty; // General|ICU|Surgical|Recovery|DayCare|Emergency
    public string? Floor      { get; set; }
    public int     TotalBeds  { get; set; }
    public bool    IsActive   { get; set; } = true;

    // Audit
    public DateTime  CreatedAt        { get; set; }
    public DateTime  UpdatedAt        { get; set; }
    public Guid?     CreatedByUserId  { get; set; }
    public Guid?     UpdatedByUserId  { get; set; }
    public DateTime? DeletedAt        { get; set; }
    public string    Status           { get; set; } = "active";
}
