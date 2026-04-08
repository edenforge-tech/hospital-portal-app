namespace IpManagementService.Models.Domain;

public class IpIoType
{
    public Guid     Id           { get; set; }
    public string   Category     { get; set; } = null!;  // Intake | Output
    public string   Label        { get; set; } = null!;
    public string?  Unit         { get; set; }
    public int      DisplayOrder { get; set; }
    public string   Status       { get; set; } = "active";
    public DateTime CreatedAt    { get; set; }
}
