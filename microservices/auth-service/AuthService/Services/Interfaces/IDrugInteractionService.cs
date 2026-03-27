using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AuthService.DTOs.Prescription;

namespace AuthService.Services.Interfaces
{
    public interface IDrugInteractionService
    {
        /// <summary>
        /// Comprehensive prescription validation (allergies, interactions, contraindications, duplicates)
        /// </summary>
        Task<PrescriptionValidationResult> ValidatePrescriptionAsync(ValidatePrescriptionRequest request);

        /// <summary>
        /// Check for drug-drug interactions
        /// </summary>
        Task<DrugInteractionResult> CheckInteractionsAsync(List<string> medicationNames);

        /// <summary>
        /// Check patient allergies against medications
        /// </summary>
        Task<DrugInteractionResult> CheckPatientAllergiesAsync(Guid patientId, List<string> medicationNames, Guid tenantId);

        /// <summary>
        /// Check contraindications for specific medications
        /// </summary>
        Task<List<ValidationError>> CheckContraindicationsAsync(Guid tenantId, List<string> medicationNames, Guid patientId);

        /// <summary>
        /// Check for duplicate prescriptions
        /// </summary>
        Task<List<ValidationWarning>> CheckDuplicatePrescriptionsAsync(Guid patientId, List<string> medicationNames);

        /// <summary>
        /// Get medication information including contraindications
        /// </summary>
        Task<OphthalMedicationDto?> GetMedicationInfoAsync(Guid tenantId, string medicationName);

        /// <summary>
        /// Get interaction details for specific drug pair
        /// </summary>
        Task<DrugInteractionDto?> GetInteractionDetailsAsync(string drug1, string drug2);

        /// <summary>
        /// Get all drug interactions (admin only)
        /// </summary>
        Task<List<DrugInteractionDto>> GetAllInteractionsAsync();
    }

    public class OphthalMedicationDto
    {
        public Guid Id { get; set; }
        public string GenericName { get; set; } = string.Empty;
        public string[]? BrandNames { get; set; }
        public string DrugClass { get; set; } = string.Empty;
        public string Indications { get; set; } = string.Empty;
        public string? Contraindications { get; set; }
        public string? Warnings { get; set; }
        public string? PregnancyCategory { get; set; }
        public string? Route { get; set; }
    }
}
