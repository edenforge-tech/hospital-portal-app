namespace CounsellingApi.Models.Entities;

/// <summary>
/// Read-only projection of the existing <c>patients</c> table, owned and migrated by auth-service.
/// This entity is mapped via <see cref="Data.ApplicationDbContext"/> with
/// <c>ExcludeFromMigrations()</c> — CounsellingApi never creates or alters this table.
/// Only the columns relevant to counselling workflows are projected here.
/// </summary>
public class Patient
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }

    /// <summary>UHID — maps to <c>health_id</c> column.</summary>
    public string? HealthId { get; set; }

    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Gender { get; set; }
    public string? ContactNumber { get; set; }
    public string Status { get; set; } = "Active";
    public DateTime CreatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }

    // Navigation: counselling records for this patient
    public ICollection<PatientCounselling> CounsellingRecords { get; set; } = new List<PatientCounselling>();
}
