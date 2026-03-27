using System;
using System.Collections.Generic;

namespace AuthService.DTOs.Prescription;

/// <summary>
/// Result of prescription validation check
/// </summary>
public class PrescriptionValidationResult
{
    public bool IsValid { get; set; } = true;
    public List<ValidationError> Errors { get; set; } = new();
    public List<ValidationWarning> Warnings { get; set; } = new();
    public List<DrugInteractionDto> Interactions { get; set; } = new();
    public bool RequiresOverride { get; set; } = false;
    public string? OverrideReason { get; set; }
}

/// <summary>
/// Critical validation error that blocks prescription
/// </summary>
public class ValidationError
{
    public string ErrorType { get; set; } = string.Empty; // "contraindication", "allergy", "duplicate", "critical_interaction"
    public string MedicationName { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Severity { get; set; } = "Critical"; // Critical, High
    public string ConflictsWith { get; set; } = string.Empty; // Allergy name, condition, or other medication
    public string Recommendation { get; set; } = string.Empty;
}

/// <summary>
/// Non-critical warning that can be overridden
/// </summary>
public class ValidationWarning
{
    public string WarningType { get; set; } = string.Empty; // "interaction", "pregnancy", "monitoring", "duplicate"
    public string MedicationName { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Severity { get; set; } = "Moderate"; // Serious, Moderate, Minor
    public string? ConflictsWith { get; set; }
    public string? Recommendation { get; set; }
    public bool CanOverride { get; set; } = true;
}

/// <summary>
/// Request to validate a prescription before saving
/// </summary>
public class ValidatePrescriptionRequest
{
    public required Guid PatientId { get; set; }
    public required Guid TenantId { get; set; }
    public List<ValidatePrescriptionMedicationDto> Medications { get; set; } = new();
    public bool CheckAllergies { get; set; } = true;
    public bool CheckInteractions { get; set; } = true;
    public bool CheckContraindications { get; set; } = true;
    public bool CheckDuplicates { get; set; } = true;
}

/// <summary>
/// Medication details for validation (simpler than full PrescriptionMedicationDto)
/// </summary>
public class ValidatePrescriptionMedicationDto
{
    public string MedicationName { get; set; } = string.Empty;
    public string? GenericName { get; set; }
    public string EyeSpecificity { get; set; } = "OU"; // OD, OS, OU
    public string? Route { get; set; }
    public string? Dosage { get; set; }
    public string? Frequency { get; set; }
    public int? DurationDays { get; set; }
}
