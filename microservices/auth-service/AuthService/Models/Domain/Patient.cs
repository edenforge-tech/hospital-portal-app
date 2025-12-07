using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models.Domain;

[Table("patients")]
public class Patient
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("tenant_id")]
    public required Guid TenantId { get; set; }

    [Column("medical_record_number")]
    [StringLength(50)]
    public required string MedicalRecordNumber { get; set; }

    [Column("first_name")]
    [StringLength(100)]
    public required string FirstName { get; set; }

    [Column("last_name")]
    [StringLength(100)]
    public required string LastName { get; set; }

    [Column("date_of_birth")]
    public required DateTime DateOfBirth { get; set; }

    [Column("gender")]
    [StringLength(20)]
    public required string Gender { get; set; }

    [Column("contact_number")]
    [StringLength(20)]
    public string? ContactNumber { get; set; }

    [Column("email")]
    [StringLength(255)]
    [EmailAddress]
    public string? Email { get; set; }

    [Column("address")]
    [StringLength(500)]
    public string? Address { get; set; }

    [Column("blood_group")]
    [StringLength(10)]
    public string? BloodGroup { get; set; }

    [Column("allergies")]
    public string? Allergies { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }
}