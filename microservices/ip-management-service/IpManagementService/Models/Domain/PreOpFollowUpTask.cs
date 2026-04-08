namespace IpManagementService.Models.Domain;

/// <summary>
/// Represents the pre_op_follow_up_tasks table.
/// Created automatically when a pre-op clearance is approved via emergency bypass
/// for high-risk sections (Anaesthesia, Consent, Financial) that were not cleared.
/// Used for bypass accountability tracking (HIPAA audit trail).
/// </summary>
public class PreOpFollowUpTask
{
    public Guid      Id                   { get; set; }
    public Guid      TenantId             { get; set; }
    public Guid      ClearanceId          { get; set; }
    public Guid      PatientJourneyId     { get; set; }

    public string    SectionCategory      { get; set; } = string.Empty;
    public string    ItemKey              { get; set; } = string.Empty;
    public string    ItemLabel            { get; set; } = string.Empty;
    public string?   BypassReason         { get; set; }

    public string    Urgency              { get; set; } = "Normal";
    public DateTime? DueBy                { get; set; }

    /// <summary>Pending | InProgress | Completed | Cancelled</summary>
    public string    TaskStatus           { get; set; } = "Pending";

    public Guid?     CompletedByUserId    { get; set; }
    public DateTime? CompletedAt          { get; set; }
    public string?   CompletionNotes      { get; set; }

    public Guid?     CreatedByUserId      { get; set; }
    public Guid?     UpdatedByUserId      { get; set; }
    public DateTime  CreatedAt            { get; set; } = DateTime.UtcNow;
    public DateTime  UpdatedAt            { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt            { get; set; }
    public string    Status               { get; set; } = "active";
}
