namespace IpManagementService.Models.Domain;

public class NurseRecord
{
    public Guid      Id                 { get; set; }
    public Guid      TenantId           { get; set; }
    public Guid      JourneyId          { get; set; }

    public DateTime  RecordedAt         { get; set; }
    public string?   ShiftType          { get; set; }   // Morning|Afternoon|Night
    public string?   NursingNotes       { get; set; }
    public string?   MedicationsGiven   { get; set; }
    public string?   IntakeOutputNotes  { get; set; }
    public int?      PainScore          { get; set; }   // 0-10
    public string?   AlertnessLevel     { get; set; }   // Alert|Drowsy|Confused|Unconscious

    public Guid      RecordedByUserId   { get; set; }
    public DateTime  CreatedAt          { get; set; }
    public DateTime  UpdatedAt          { get; set; }
    public DateTime? DeletedAt          { get; set; }
    public string    Status             { get; set; } = "active";
}
