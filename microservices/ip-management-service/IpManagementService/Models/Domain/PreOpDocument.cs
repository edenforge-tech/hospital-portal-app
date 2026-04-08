namespace IpManagementService.Models.Domain;

/// <summary>
/// Represents a file uploaded as part of a pre-op clearance.
/// Stored in Azure Blob; FileUrl is the blob URL.
/// </summary>
public class PreOpDocument
{
    public Guid     Id                    { get; set; }
    public Guid     TenantId              { get; set; }
    public Guid     ClearanceId           { get; set; }

    /// <summary>
    /// Document type: ConsentForm|LabReport|ImagingReport|InsuranceCard|
    /// GovernmentCard|FitnessCertificate|IdentityProof|Other
    /// </summary>
    public string   DocumentType          { get; set; } = string.Empty;

    public string   FileName              { get; set; } = string.Empty;
    public string   FileUrl               { get; set; } = string.Empty;
    public string?  ContentType           { get; set; }
    public long?    FileSizeBytes         { get; set; }

    public bool     IsVerified            { get; set; } = false;
    public Guid?    VerifiedByUserId      { get; set; }
    public DateTime? VerifiedAt           { get; set; }

    public string?  Notes                 { get; set; }

    public Guid?    UploadedByUserId      { get; set; }
    public Guid?    CreatedByUserId       { get; set; }
    public Guid?    UpdatedByUserId       { get; set; }
    public DateTime CreatedAt             { get; set; }
    public DateTime UpdatedAt             { get; set; }
    public DateTime? DeletedAt            { get; set; }
    public string   Status                { get; set; } = "active";
}
