namespace IpManagementService.Models.Domain;

public class VitalSign
{
    public Guid      Id                      { get; set; }
    public Guid      TenantId                { get; set; }
    public Guid      JourneyId               { get; set; }

    public DateTime  RecordedAt              { get; set; }
    public decimal?  Temperature             { get; set; }
    public int?      BloodPressureSystolic   { get; set; }
    public int?      BloodPressureDiastolic  { get; set; }
    public int?      PulseRate               { get; set; }
    public int?      RespiratoryRate         { get; set; }
    public decimal?  OxygenSaturation        { get; set; }
    public decimal?  Weight                  { get; set; }
    public decimal?  Height                  { get; set; }
    public string?   Notes                   { get; set; }
    public string?   Context                 { get; set; }

    public Guid      RecordedByUserId        { get; set; }
    public DateTime  CreatedAt               { get; set; }
    public DateTime  UpdatedAt               { get; set; }
    public DateTime? DeletedAt               { get; set; }
    public string    Status                  { get; set; } = "active";
}
