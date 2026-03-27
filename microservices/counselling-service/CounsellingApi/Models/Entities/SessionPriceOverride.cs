using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CounsellingApi.Models.Entities;

/// <summary>
/// Auditable record of every price deviation from the catalog default
/// during a counselling session.
/// 
/// Rules:
///   - One row per override event (full history, never updated or replaced).
///   - requested_by_type = 'SELF'  → counsellor decided independently.
///   - requested_by_type = 'STAFF' → another staff member requested this price;
///     they receive an SMS + email notification when the session is finalised.
/// </summary>
[Table("session_price_overrides")]
public class SessionPriceOverride
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("tenant_id")]
    public Guid TenantId { get; set; }

    [Column("counselling_id")]
    public Guid CounsellingId { get; set; }

    [Column("variant_id")]
    public Guid VariantId { get; set; }

    /// <summary>Snapshot of the variant name at the time the override was recorded.</summary>
    [Column("variant_name")]
    [MaxLength(200)]
    public string VariantName { get; set; } = string.Empty;

    /// <summary>The catalog's global tariff price at the time of the override.</summary>
    [Column("base_price")]
    public decimal BasePrice { get; set; }

    /// <summary>The price the counsellor is quoting for this specific patient.</summary>
    [Column("overridden_price")]
    public decimal OverriddenPrice { get; set; }

    /// <summary>PER_EYE | BOTH_EYES | FIXED — mirrors the variant's price_type.</summary>
    [Column("price_type")]
    [MaxLength(20)]
    public string PriceType { get; set; } = "FIXED";

    /// <summary>Mandatory reason for the price change (e.g., "Charity case", "Corporate deal").</summary>
    [Column("reason")]
    public string Reason { get; set; } = string.Empty;

    [Column("remarks")]
    public string? Remarks { get; set; }

    /// <summary>SELF | STAFF</summary>
    [Column("requested_by_type")]
    [MaxLength(10)]
    public string RequestedByType { get; set; } = "SELF";

    /// <summary>Populated when RequestedByType = 'STAFF'.</summary>
    [Column("requested_by_user_id")]
    public Guid? RequestedByUserId { get; set; }

    [Column("requested_by_name")]
    [MaxLength(255)]
    public string? RequestedByName { get; set; }

    /// <summary>Email or phone used for the finalization notification — snapshot at override time.</summary>
    [Column("requested_by_contact")]
    [MaxLength(255)]
    public string? RequestedByContact { get; set; }

    [Column("notification_sent")]
    public bool NotificationSent { get; set; } = false;

    [Column("notification_sent_at")]
    public DateTime? NotificationSentAt { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("created_by_user_id")]
    [MaxLength(255)]
    public string? CreatedByUserId { get; set; }

    [Column("updated_by_user_id")]
    [MaxLength(255)]
    public string? UpdatedByUserId { get; set; }

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    [Column("record_status")]
    [MaxLength(50)]
    public string RecordStatus { get; set; } = "active";
}
