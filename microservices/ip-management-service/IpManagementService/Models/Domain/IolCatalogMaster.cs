namespace IpManagementService.Models.Domain;

public class IolCatalogMaster
{
    public Guid     Id                  { get; set; }
    public Guid     TenantId            { get; set; }
    public string   ModelName           { get; set; } = string.Empty;
    public string   Brand               { get; set; } = string.Empty;
    public string   IolType             { get; set; } = string.Empty;
    public string?  Origin              { get; set; }
    public string?  LensCategory        { get; set; }
    public string?  Material            { get; set; }
    public decimal? PowerRangeMin       { get; set; }
    public decimal? PowerRangeMax       { get; set; }
    public decimal? PowerIncrement      { get; set; }
    public string?  DistanceRange       { get; set; }
    public decimal? AConstant           { get; set; }
    public decimal  DefaultPrice        { get; set; }
    public string?  ProductCode         { get; set; }
    public bool     IsActive            { get; set; } = true;
    public int      DisplayOrder        { get; set; }

    // Audit
    public DateTime  CreatedAt          { get; set; }
    public DateTime  UpdatedAt          { get; set; }
    public Guid?     CreatedByUserId    { get; set; }
    public Guid?     UpdatedByUserId    { get; set; }
    public DateTime? DeletedAt          { get; set; }
    public string    Status             { get; set; } = "active";
}
