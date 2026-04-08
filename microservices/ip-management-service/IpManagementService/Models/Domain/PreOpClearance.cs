namespace IpManagementService.Models.Domain;

/// <summary>
/// Represents the pre_op_clearance table.
/// One record per patient_journey; created on first checklist save.
/// </summary>
public class PreOpClearance
{
    public Guid     Id                    { get; set; }
    public Guid     TenantId              { get; set; }
    public Guid     JourneyId             { get; set; }

    /// <summary>Snapshot of payment mode at clearance time (Cash/Insurance/CGHS/ESI/Camp).</summary>
    public string?  PaymentModeSnapshot   { get; set; }

    /// <summary>Soft reference to counseling insurance_preauth_requests row, if any.</summary>
    public Guid?    InsurancePreauthId    { get; set; }

    /// <summary>Overall pre-op status: NotStarted|InProgress|ClearedForAdmission|OnHold|Deferred|Rejected</summary>
    public string   OverallStatus         { get; set; } = "NotStarted";

    /// <summary>Set to true only when a doctor/admin explicitly approves all blocking items.</summary>
    public bool     OverallClearance      { get; set; } = false;

    /// <summary>True if the clearance was intentionally deferred (e.g., patient rescheduled).</summary>
    public bool     IsDeferred            { get; set; } = false;

    public string?  DeferredReason        { get; set; }

    public DateTime? ClearedAt            { get; set; }
    public Guid?    ClearedByUserId       { get; set; }

    public string?  ClearanceNotes        { get; set; }

    public Guid?    CreatedByUserId       { get; set; }
    public Guid?    UpdatedByUserId       { get; set; }
    public DateTime CreatedAt             { get; set; }
    public DateTime UpdatedAt             { get; set; }
    public DateTime? DeletedAt            { get; set; }
    public string   Status                { get; set; } = "active";
}
