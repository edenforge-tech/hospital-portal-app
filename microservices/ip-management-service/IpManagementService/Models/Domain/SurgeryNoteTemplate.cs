namespace IpManagementService.Models.Domain;

public class SurgeryNoteTemplate
{
    public Guid     Id          { get; set; }
    public Guid     TenantId    { get; set; }
    public string   FieldLabel  { get; set; } = string.Empty;
    public string   FieldType   { get; set; } = "text"; // text|textarea|select|checkbox|number
    public int      FieldOrder  { get; set; }
    public bool     IsRequired  { get; set; }
    public string?  Options     { get; set; } // JSONB: [{label, value}]
    public bool     IsActive    { get; set; } = true;
    public DateTime CreatedAt   { get; set; }
    public DateTime UpdatedAt   { get; set; }
    public DateTime? DeletedAt  { get; set; }
}
