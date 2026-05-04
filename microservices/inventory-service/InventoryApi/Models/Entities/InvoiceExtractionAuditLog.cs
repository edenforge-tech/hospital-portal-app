namespace InventoryApi.Models.Entities;

/// <summary>
/// Immutable audit record written when a user confirms (or abandons) an invoice extraction session.
/// Captures provider metadata, confidence summary, and field-level override counts for compliance.
/// Blob documents are purged after 90 days; this row is kept indefinitely for HIPAA audit trail.
/// </summary>
public class InvoiceExtractionAuditLog
{
    public Guid   Id            { get; set; }
    public Guid   TenantId      { get; set; }
    public Guid   UserId        { get; set; }
    public string SessionId     { get; set; } = string.Empty;

    // ── Outcome ───────────────────────────────────────────────────────────────
    /// <summary>Confirmed | Abandoned</summary>
    public string Outcome       { get; set; } = "Confirmed";

    // ── Document ──────────────────────────────────────────────────────────────
    public string  OriginalFilename { get; set; } = string.Empty;
    public string? DocumentUrl      { get; set; }
    /// <summary>Scheduled purge date (upload date + 90 days).</summary>
    public DateTime BlobPurgeAt    { get; set; }
    /// <summary>Set to true by the purge job once the blob is deleted.</summary>
    public bool    BlobPurged      { get; set; }

    // ── Provider ──────────────────────────────────────────────────────────────
    public string  ProviderModel   { get; set; } = string.Empty;
    public int     ProcessingMs    { get; set; }

    // ── Confidence summary ────────────────────────────────────────────────────
    public int     HighFieldCount   { get; set; }
    public int     ReviewFieldCount { get; set; }
    public int     LowFieldCount    { get; set; }
    public int     LineItemCount    { get; set; }

    // ── Override tracking ─────────────────────────────────────────────────────
    /// <summary>Number of fields the user changed from the extracted value before confirming.</summary>
    public int     FieldOverrideCount { get; set; }
    /// <summary>JSON array of field names overridden (e.g. ["VendorId","InvoiceNumber"]). Nullable for abandoned sessions.</summary>
    public string? OverriddenFieldsJson { get; set; }

    // ── Created invoice / GRN links ───────────────────────────────────────────
    public Guid?   CreatedInvoiceId { get; set; }
    public Guid?   CreatedGrnId     { get; set; }

    // ── Timestamps ────────────────────────────────────────────────────────────
    public DateTime CreatedAt { get; set; }
}
