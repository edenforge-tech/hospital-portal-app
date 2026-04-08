namespace IpManagementService.Models.Domain;

public class IntraOpNotePreset
{
    public Guid      Id              { get; set; }
    public Guid?     TenantId        { get; set; }   // null = global system preset
    public string    FieldName       { get; set; } = string.Empty; // procedure|findings|complications|anesthesia_notes
    public string    OptionLabel     { get; set; } = string.Empty;
    public int       DisplayOrder    { get; set; }
    public bool      IsSystemDefault { get; set; } = true;
    public DateTime  CreatedAt       { get; set; }
    public DateTime  UpdatedAt       { get; set; }
    public DateTime? DeletedAt       { get; set; }
    public string    Status          { get; set; } = "active";
}
