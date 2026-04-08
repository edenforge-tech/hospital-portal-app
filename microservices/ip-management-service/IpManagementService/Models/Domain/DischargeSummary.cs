namespace IpManagementService.Models.Domain;

public class DischargeSummary
{
    public Guid     Id                      { get; set; }
    public Guid     TenantId                { get; set; }
    public Guid     PatientJourneyId        { get; set; }

    public string?  ConditionAtDischarge    { get; set; } // Good|Stable|Fair|Guarded
    public string?  DiagnosisCodes          { get; set; } // JSONB string
    public string?  ProceduresPerformed     { get; set; } // JSONB string
    public string?  HospitalCourse          { get; set; }
    public string?  DischargeInstructions   { get; set; }
    public string?  MedicationsOnDischarge  { get; set; }
    public string?  FollowUpPlan            { get; set; }
    public string   FormatType              { get; set; } = "Short"; // Short|Detailed|Typed
    public string   SummaryStatus           { get; set; } = "Draft"; // Draft|Final
    public decimal? FinalBillAmount         { get; set; }
    public DateTime? FinalizedAt            { get; set; }
    public Guid?    FinalizedBy             { get; set; }

    // Audit
    public DateTime  CreatedAt              { get; set; }
    public DateTime  UpdatedAt              { get; set; }
    public Guid?     CreatedByUserId        { get; set; }
    public Guid?     UpdatedByUserId        { get; set; }
    public DateTime? DeletedAt              { get; set; }
    public string    Status                 { get; set; } = "active";
}
