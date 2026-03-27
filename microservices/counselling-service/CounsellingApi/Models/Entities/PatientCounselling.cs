namespace CounsellingApi.Models.Entities;

/// <summary>
/// EF Core entity mapping to the <c>patient_counselling</c> table.
/// Tracks the full lifecycle of one patient's counselling session:
/// Pending → Processed → Done | RepeatCounselling → AddOnSurgery | RepeatCounselling.
/// </summary>
public class PatientCounselling
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid PatientId { get; set; }

    // ── State machine ───────────────────────────────────────────────────────
    /// <summary>Current state: Pending | Processed | Done | AddOnSurgery | RepeatCounselling</summary>
    public string Status { get; set; } = "Pending";
    public string? PreviousStatus { get; set; }

    // ── Optimistic lock ─────────────────────────────────────────────────────
    public bool IsLocked { get; set; }
    public string? LockedBy { get; set; }

    // ── Decision outcome ────────────────────────────────────────────────────
    /// <summary>Interested | NotInterested</summary>
    public string? DecisionType { get; set; }
    public DateTime? DecisionTimestamp { get; set; }

    // ── Scheduling ──────────────────────────────────────────────────────────
    public DateTime? ScheduledDate { get; set; }

    // ── Package selection ───────────────────────────────────────────────────
    public Guid? PackageId { get; set; }

    /// <summary>Arbitrary package payload — stored as <c>jsonb</c> in PostgreSQL.</summary>
    public string? PackageDetails { get; set; }

    // ── Payment classification ───────────────────────────────────────────────
    /// <summary>Unified payment/patient type: Cash | Insurance | CGHS | Free | Staff etc.</summary>
    public string? PaymentType { get; set; }

    /// <summary>Insurance/TPA company name — populated when PaymentType is Insurance, CoPay, or CGHS.</summary>
    public string? InsuranceCompany { get; set; }

    // ── Extended workflow tracking ────────────────────────────────────────────
    /// <summary>True when schedule is changed while status is Done (reschedule without restarting counselling).</summary>
    public bool IsRescheduled { get; set; }

    /// <summary>JSON array of investigation/imaging catalog IDs ordered for this session.</summary>
    public string? InvestigationIds { get; set; }

    /// <summary>True when the package was edited after initial selection (triggers AddOnSurgery flow).</summary>
    public bool IsPackageEdited { get; set; }

    // ── Add-On Surgery upgrade tracking ─────────────────────────────────────────
    /// <summary>Package details JSON blob before the add-on upgrade — snapshot taken on Done → AddOnSurgery.</summary>
    public string? PreviousPackageDetails { get; set; }

    /// <summary>Package amount before the add-on upgrade (extracted from the previous JSON blob).</summary>
    public decimal? PreviousPackageAmount { get; set; }

    /// <summary>Counsellor-supplied reason for the add-on / upgrade.</summary>
    public string? AddonReason { get; set; }

    /// <summary>Follow-up date (ISO 8601) — set for RepeatCounselling / NeedsTime decisions.</summary>
    public string? FollowUpDate { get; set; }

    /// <summary>Reason for repeat / not-interested decision.</summary>
    public string? FollowUpReason { get; set; }

    // ── HIPAA standard audit columns ────────────────────────────────────────
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string? CreatedByUserId { get; set; }
    public string? UpdatedByUserId { get; set; }

    /// <summary>Soft delete timestamp — NEVER hard-delete (HIPAA requirement).</summary>
    public DateTime? DeletedAt { get; set; }

    /// <summary>Row lifecycle: active | inactive | archived</summary>
    public string RecordStatus { get; set; } = "active";

    // ── Navigation ──────────────────────────────────────────────────────────
    public Patient Patient { get; set; } = null!;
}
