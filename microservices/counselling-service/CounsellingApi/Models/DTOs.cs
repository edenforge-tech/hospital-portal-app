namespace CounsellingApi.Models;

// ─── Inbound Request DTOs ────────────────────────────────────────────────────

public class StartCounsellingRequest
{
    public Guid TenantId { get; set; }
    public string PerformedBy { get; set; } = string.Empty;
}

public class SaveCounsellingRequest
{
    public Guid? PackageId { get; set; }
    public string? PackageDetails { get; set; }
    /// <summary>Unified payment/patient classification: Cash | Insurance | CGHS | Free | Staff etc.</summary>
    public string? PaymentType { get; set; }
    /// <summary>Insurance company — populated when PaymentType is Insurance, CoPay, or CGHS.</summary>
    public string? InsuranceCompany { get; set; }
    /// <summary>JSON array of investigation/imaging catalog IDs ordered for this session.</summary>
    public string? InvestigationIds { get; set; }
    /// <summary>True when the package was edited after initial selection.</summary>
    public bool? IsPackageEdited { get; set; }
    /// <summary>Field-level diffs to log to audit trail. Each entry = one changed field.</summary>
    public List<FieldChangedEntry>? FieldChanges { get; set; }
    public string PerformedBy { get; set; } = string.Empty;
}

/// <summary>Represents a single field change for the audit trail.</summary>
public class FieldChangedEntry
{
    public string FieldName { get; set; } = string.Empty;
    public string OldValue { get; set; } = string.Empty;
    public string NewValue { get; set; } = string.Empty;
}

public class DecisionRequest
{
    /// <summary>Accepted values: "Interested" | "NotInterested" | "NeedsTime"</summary>
    public string Decision { get; set; } = string.Empty;
    /// <summary>Required for NotInterested / NeedsTime decisions.</summary>
    public string? FollowUpDate { get; set; }
    /// <summary>Reason for follow-up / not-interested decision.</summary>
    public string? FollowUpReason { get; set; }
    public string PerformedBy { get; set; } = string.Empty;
}

/// <summary>Request body for Done → Processed (procedure re-evaluation).</summary>
public class ReEvaluateRequest
{
    public string PerformedBy { get; set; } = string.Empty;
}

/// <summary>Request body for Done → AddOnSurgery transition.</summary>
public class AddOnSurgeryRequest
{
    public string? Reason { get; set; }
    public string PerformedBy { get; set; } = string.Empty;
}

public class ScheduleRequest
{
    public DateTime ScheduledDate { get; set; }
    public string PerformedBy { get; set; } = string.Empty;
}

public class UpdatePackageRequest
{
    public Guid PackageId { get; set; }
    public string? PackageDetails { get; set; }
    public string PerformedBy { get; set; } = string.Empty;
}

public class LockRequest
{
    public string PerformedBy { get; set; } = string.Empty;
}

// ─── Query / Filter ──────────────────────────────────────────────────────────

public class GetListQuery
{
    public Guid? TenantId { get; set; }
    public Guid? PatientId { get; set; }
    public string? Status { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

// ─── Outbound Response DTOs ──────────────────────────────────────────────────

public class CounsellingRecordDto
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public Guid TenantId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? PreviousStatus { get; set; }
    public bool IsLocked { get; set; }
    public string? LockedBy { get; set; }
    public string? DecisionType { get; set; }
    public DateTime? DecisionTimestamp { get; set; }
    public DateTime? ScheduledDate { get; set; }
    public Guid? PackageId { get; set; }
    public string? PackageDetails { get; set; }
    public string? PaymentType { get; set; }
    public string? InsuranceCompany { get; set; }
    public bool IsRescheduled { get; set; }
    public string? InvestigationIds { get; set; }
    public bool IsPackageEdited { get; set; }
    public string? FollowUpDate { get; set; }
    public string? FollowUpReason { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int Total { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)Total / PageSize) : 0;
}

/// <summary>One audit trail entry returned by GET /counselling/{id}/history.</summary>
public class AuditLogDto
{
    public Guid Id { get; set; }
    /// <summary>Action type, e.g. StartCounselling, Decision, SaveCounselling, FieldChanged.</summary>
    public string ChangeType { get; set; } = string.Empty;
    /// <summary>Populated for FieldChanged entries — identifies which field changed.</summary>
    public string? FieldName { get; set; }
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    /// <summary>ISO 8601 UTC timestamp of when the change was made.</summary>
    public DateTime ChangedAt { get; set; }
    /// <summary>User ID of whoever made the change (from PerformedBy column).</summary>
    public string ChangedByUserId { get; set; } = string.Empty;
}

// ─── Price Override DTOs ────────────────────────────────────────────────────────────

public class CreatePriceOverrideRequest
{
    /// <summary>Global catalog service variant ID.</summary>
    public Guid VariantId { get; set; }

    /// <summary>Snapshot of the variant display name.</summary>
    public string VariantName { get; set; } = string.Empty;

    /// <summary>Catalog default price at the time of this request.</summary>
    public decimal BasePrice { get; set; }

    /// <summary>The new quoted price for this patient.</summary>
    public decimal OverriddenPrice { get; set; }

    /// <summary>PER_EYE | BOTH_EYES | FIXED</summary>
    public string PriceType { get; set; } = "FIXED";

    /// <summary>Mandatory justification.</summary>
    public string Reason { get; set; } = string.Empty;

    public string? Remarks { get; set; }

    /// <summary>SELF | STAFF</summary>
    public string RequestedByType { get; set; } = "SELF";

    public Guid? RequestedByUserId { get; set; }
    public string? RequestedByName { get; set; }

    /// <summary>Email or phone for the notification — only needed when RequestedByType = 'STAFF'.</summary>
    public string? RequestedByContact { get; set; }

    public string PerformedBy { get; set; } = string.Empty;
    public Guid TenantId { get; set; }
}

public class UpdatePriceOverrideRequest
{
    public decimal OverriddenPrice { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? Remarks { get; set; }
    public string PerformedBy { get; set; } = string.Empty;
}

public class PriceOverrideDto
{
    public Guid Id { get; set; }
    public Guid CounsellingId { get; set; }
    public Guid VariantId { get; set; }
    public string VariantName { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public decimal OverriddenPrice { get; set; }
    public string PriceType { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string? Remarks { get; set; }
    public string RequestedByType { get; set; } = string.Empty;
    public Guid? RequestedByUserId { get; set; }
    public string? RequestedByName { get; set; }
    public bool NotificationSent { get; set; }
    public DateTime CreatedAt { get; set; }
}
