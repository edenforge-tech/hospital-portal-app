using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Models.Domain.Dtos;

public class CreatePatientRequest
{
    [Required]
    [StringLength(100)]
    public string FirstName { get; set; } = null!;

    [Required]
    [StringLength(100)]
    public string LastName { get; set; } = null!;

    [Required]
    public DateTime DateOfBirth { get; set; }

    [Required]
    [StringLength(20)]
    public string Gender { get; set; } = null!;

    [StringLength(20)]
    public string? ContactNumber { get; set; }

    [EmailAddress]
    [StringLength(255)]
    public string? Email { get; set; }

    [StringLength(500)]
    public string? Address { get; set; }

    [StringLength(10)]
    public string? BloodGroup { get; set; }

    public string? Allergies { get; set; }
}

public class UpdatePatientRequest : CreatePatientRequest
{
    [Required]
    public Guid Id { get; set; }
}

public class PatientResponse
{
    public Guid Id { get; set; }
    public string MedicalRecordNumber { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public DateTime DateOfBirth { get; set; }
    public string Gender { get; set; } = null!;
    public string? ContactNumber { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? BloodGroup { get; set; }
    public string? Allergies { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}