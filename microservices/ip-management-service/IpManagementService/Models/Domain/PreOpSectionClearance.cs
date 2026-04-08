namespace IpManagementService.Models.Domain;

/// <summary>
/// Represents the preop_section_clearance table.
/// Tracks per-section (category) request/response/confirm workflow
/// between the ward team and the responsible department.
///
/// Workflow states:
///   NotRequested → Requested → RespondedClear / RespondedConcerns → WardConfirmed
///
/// For the Anaesthesia category, both internal doctors (STD_DOCTOR dept code)
/// and external / visiting anaesthesiologists are supported:
///   - Internal: dept user responds via the system (is_external_responder = false)
///   - External: ward nurse logs the response manually (is_external_responder = true +
///               external_responder_name / external_responder_contact populated)
/// </summary>
public class PreOpSectionClearance
{
    public Guid      Id                       { get; set; }
    public Guid      TenantId                 { get; set; }

    /// <summary>FK → pre_op_clearance.id</summary>
    public Guid      ClearanceId              { get; set; }

    /// <summary>Matches PreOpSectionItem.Category (e.g. "Consent", "Investigations", "Anaesthesia").</summary>
    public string    SectionCategory          { get; set; } = string.Empty;

    /// <summary>
    /// Dept code of the team responsible for this section.
    /// Seeded values: STD_COUNSELOR | STD_LABORATORY | STD_BILLING |
    ///                STD_DOCTOR | STD_NURSE | STD_ADMIN
    /// Anaesthesia also uses STD_DOCTOR — internal doctors receive it in their queue.
    /// </summary>
    public string    ResponsibleDepartmentCode { get; set; } = string.Empty;

    /// <summary>NotRequested | Requested | RespondedClear | RespondedConcerns | WardConfirmed</summary>
    public string    Status                   { get; set; } = "NotRequested";

    // ── Request ───────────────────────────────────────────────────────────
    public Guid?     RequestedByUserId        { get; set; }
    public DateTime? RequestedAt              { get; set; }

    // ── Dept Response ─────────────────────────────────────────────────────
    public Guid?     RespondedByUserId        { get; set; }
    public DateTime? RespondedAt              { get; set; }
    public string?   ResponseNotes            { get; set; }

    /// <summary>True when the response was logged manually by ward staff on behalf of an external person.</summary>
    public bool      IsExternalResponder      { get; set; } = false;
    public string?   ExternalResponderName    { get; set; }
    public string?   ExternalResponderContact { get; set; }

    // ── Ward Confirmation ─────────────────────────────────────────────────
    public Guid?     ConfirmedByUserId        { get; set; }
    public DateTime? ConfirmedAt              { get; set; }
    public string?   ConfirmationNotes        { get; set; }
    // ── Extended states ───────────────────────────────────────────────────────
    /// <summary>Low | Normal | High | Urgent</summary>
    public string    Urgency                  { get; set; } = "Normal";
    public string?   RejectionReason          { get; set; }
    // ── Standard HIPAA columns ────────────────────────────────────────────
    public Guid?     CreatedByUserId          { get; set; }
    public Guid?     UpdatedByUserId          { get; set; }
    public DateTime  CreatedAt                { get; set; }
    public DateTime  UpdatedAt                { get; set; }
    public DateTime? DeletedAt                { get; set; }
    public string    ActiveStatus             { get; set; } = "active";
}
