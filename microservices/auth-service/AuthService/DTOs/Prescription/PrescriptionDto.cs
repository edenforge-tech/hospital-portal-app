using System;
using System.Collections.Generic;

namespace AuthService.DTOs.Prescription
{
    public class PrescriptionDto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid PatientId { get; set; }
        public string? PatientName { get; set; }
        public Guid DoctorId { get; set; }
        public string? DoctorName { get; set; }
        public DateTime PrescriptionDate { get; set; }
        public string Diagnosis { get; set; } = string.Empty;
        public string? Instructions { get; set; }
        public int? DurationDays { get; set; }
        public DateTime? FollowUpDate { get; set; }
        public string Status { get; set; } = "active";
        public Guid? PharmacyId { get; set; }
        public string? PharmacyName { get; set; }
        public string? PharmacyContact { get; set; }
        public DateTime? DispensedDate { get; set; }
        public DateTime? DispensedAt { get; set; }
        public Guid? DispensedByUserId { get; set; }
        public string? DispensedByUserName { get; set; }
        public string? Notes { get; set; }
        public bool IsPrinted { get; set; }
        public DateTime? PrintedAt { get; set; }
        public List<PrescriptionMedicationDto> Medications { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class PrescriptionMedicationDto
    {
        public Guid Id { get; set; }
        public Guid PrescriptionId { get; set; }
        public string MedicationName { get; set; } = string.Empty;
        public string? GenericName { get; set; }
        public string Dosage { get; set; } = string.Empty;
        public string Form { get; set; } = string.Empty;
        public string Route { get; set; } = string.Empty;
        public string Frequency { get; set; } = string.Empty;
        public int DurationDays { get; set; }
        public int Quantity { get; set; }
        public string? Instructions { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int RefillsAllowed { get; set; }
        public int RefillsRemaining { get; set; }
        public bool IsCritical { get; set; }
    }

    public class CreatePrescriptionRequest
    {
        public Guid PatientId { get; set; }
        public string Diagnosis { get; set; } = string.Empty;
        public string? Instructions { get; set; }
        public int? DurationDays { get; set; }
        public DateTime? FollowUpDate { get; set; }
        public string? Notes { get; set; }
        public List<CreatePrescriptionMedicationRequest> Medications { get; set; } = new();
    }

    public class CreatePrescriptionMedicationRequest
    {
        public string MedicationName { get; set; } = string.Empty;
        public string? GenericName { get; set; }
        public string Dosage { get; set; } = string.Empty;
        public string Form { get; set; } = string.Empty;
        public string Route { get; set; } = string.Empty;
        public string Frequency { get; set; } = string.Empty;
        public int DurationDays { get; set; }
        public int Quantity { get; set; }
        public string? Instructions { get; set; }
        public DateTime? StartDate { get; set; }
        public int RefillsAllowed { get; set; } = 0;
        public bool IsCritical { get; set; } = false;
    }

    public class UpdatePrescriptionRequest
    {
        public string? Diagnosis { get; set; }
        public string? Instructions { get; set; }
        public int? DurationDays { get; set; }
        public DateTime? FollowUpDate { get; set; }
        public string? Notes { get; set; }
        public string? Status { get; set; }
    }

    public class DispensePrescriptionRequest
    {
        public Guid PharmacyId { get; set; }
        public string PharmacyName { get; set; } = string.Empty;
        public string? PharmacyContact { get; set; }
        public DateTime? DispensedDate { get; set; }
    }

    public class DrugInteractionCheckRequest
    {
        public Guid? PatientId { get; set; }
        public List<string> MedicationNames { get; set; } = new();
    }

    public class DrugInteractionResult
    {
        public bool HasInteractions { get; set; }
        public List<DrugInteractionDto> Interactions { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
    }

    public class DrugInteractionDto
    {
        public Guid Id { get; set; }
        public string Drug1Name { get; set; } = string.Empty;
        public string Drug2Name { get; set; } = string.Empty;
        public string InteractionType { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? ClinicalEffects { get; set; }
        public string? Mechanism { get; set; }
        public string? Management { get; set; }
        public string? ReferenceSources { get; set; }
    }

    public class MedicationSearchDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? GenericName { get; set; }
        public List<string>? BrandNames { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Form { get; set; } = string.Empty;
        public List<string>? StandardDosages { get; set; }
        public string Route { get; set; } = string.Empty;
        public string? Contraindications { get; set; }
        public string? SideEffects { get; set; }
        public string? PregnancyCategory { get; set; }
        public bool RequiresPrescription { get; set; }
        public bool IsControlledSubstance { get; set; }
    }
}
