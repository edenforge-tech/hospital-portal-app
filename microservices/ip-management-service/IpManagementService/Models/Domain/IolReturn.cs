namespace IpManagementService.Models.Domain;

public class IolReturn
{
    public Guid     Id                  { get; set; }
    public Guid     TenantId            { get; set; }
    public Guid     PatientJourneyId    { get; set; }
    public string?  IolPower            { get; set; }
    public string?  IolBatch            { get; set; }
    public string?  IolBarcode          { get; set; }
    public string   Reason              { get; set; } = string.Empty;
    public DateTime? ReturnedAt         { get; set; }
    public Guid?    ReturnedByUserId    { get; set; }

    // Audit
    public DateTime  CreatedAt          { get; set; }
    public DateTime  UpdatedAt          { get; set; }
    public Guid?     CreatedByUserId    { get; set; }
    public Guid?     UpdatedByUserId    { get; set; }
    public DateTime? DeletedAt          { get; set; }
    public string    Status             { get; set; } = "active";
}
