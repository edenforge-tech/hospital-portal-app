using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using AuthService.Context;
using AuthService.DTOs.Prescription;
using AuthService.Services.Interfaces;

namespace AuthService.Services
{
    public class DrugInteractionService : IDrugInteractionService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<DrugInteractionService> _logger;

        public DrugInteractionService(AppDbContext context, ILogger<DrugInteractionService> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Comprehensive prescription validation
        /// </summary>
        public async Task<PrescriptionValidationResult> ValidatePrescriptionAsync(ValidatePrescriptionRequest request)
        {
            var result = new PrescriptionValidationResult
            {
                IsValid = true,
                Errors = new List<ValidationError>(),
                Warnings = new List<ValidationWarning>(),
                Interactions = new List<DrugInteractionDto>()
            };

            try
            {
                var medicationNames = request.Medications.Select(m => m.MedicationName).ToList();

                // 1. Check patient allergies (Critical - blocks prescription)
                if (request.CheckAllergies)
                {
                    var allergyResult = await CheckPatientAllergiesAsync(request.PatientId, medicationNames, request.TenantId);
                    if (allergyResult.HasInteractions)
                    {
                        result.IsValid = false;
                        result.RequiresOverride = true;
                        foreach (var interaction in allergyResult.Interactions)
                        {
                            result.Errors.Add(new ValidationError
                            {
                                ErrorType = "allergy",
                                MedicationName = interaction.Drug1Name,
                                Message = interaction.Description,
                                Severity = "Critical",
                                ConflictsWith = interaction.Drug2Name.Replace("Patient Allergy: ", ""),
                                Recommendation = interaction.Management ?? "DO NOT PRESCRIBE - Choose alternative medication"
                            });
                        }
                    }
                }

                // 2. Check contraindications (Critical - blocks prescription)
                if (request.CheckContraindications)
                {
                    var contraindicationErrors = await CheckContraindicationsAsync(request.TenantId, medicationNames, request.PatientId);
                    if (contraindicationErrors.Any())
                    {
                        result.IsValid = false;
                        result.RequiresOverride = true;
                        result.Errors.AddRange(contraindicationErrors);
                    }
                }

                // 3. Check drug-drug interactions (Severity-based)
                if (request.CheckInteractions && medicationNames.Count > 1)
                {
                    var interactionResult = await CheckInteractionsAsync(medicationNames);
                    if (interactionResult.HasInteractions)
                    {
                        result.Interactions.AddRange(interactionResult.Interactions);
                        
                        foreach (var interaction in interactionResult.Interactions)
                        {
                            // Critical/Serious interactions = Errors (block prescription)
                            if (interaction.Severity.Equals("Critical", StringComparison.OrdinalIgnoreCase) ||
                                interaction.Severity.Equals("high", StringComparison.OrdinalIgnoreCase))
                            {
                                result.IsValid = false;
                                result.RequiresOverride = true;
                                result.Errors.Add(new ValidationError
                                {
                                    ErrorType = "critical_interaction",
                                    MedicationName = interaction.Drug1Name,
                                    Message = interaction.Description,
                                    Severity = interaction.Severity,
                                    ConflictsWith = interaction.Drug2Name,
                                    Recommendation = interaction.Management ?? "Consider alternative medication combination"
                                });
                            }
                            // Moderate/Minor interactions = Warnings (can override)
                            else
                            {
                                result.Warnings.Add(new ValidationWarning
                                {
                                    WarningType = "interaction",
                                    MedicationName = interaction.Drug1Name,
                                    Message = interaction.Description,
                                    Severity = interaction.Severity,
                                    ConflictsWith = interaction.Drug2Name,
                                    Recommendation = interaction.Management,
                                    CanOverride = true
                                });
                            }
                        }
                    }
                }

                // 4. Check for duplicate prescriptions (Warning only)
                if (request.CheckDuplicates)
                {
                    var duplicateWarnings = await CheckDuplicatePrescriptionsAsync(request.PatientId, medicationNames);
                    result.Warnings.AddRange(duplicateWarnings);
                }

                _logger.LogInformation(
                    "Prescription validation for patient {PatientId}: {Errors} errors, {Warnings} warnings, {Interactions} interactions",
                    request.PatientId, result.Errors.Count, result.Warnings.Count, result.Interactions.Count);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating prescription for patient {PatientId}", request.PatientId);
                result.IsValid = false;
                result.Errors.Add(new ValidationError
                {
                    ErrorType = "system_error",
                    MedicationName = "System",
                    Message = "An error occurred during validation. Please try again.",
                    Severity = "Critical",
                    ConflictsWith = "",
                    Recommendation = "Contact system administrator if error persists"
                });
                return result;
            }
        }

        /// <summary>
        /// Check medication contraindications from database
        /// </summary>
        public async Task<List<ValidationError>> CheckContraindicationsAsync(Guid tenantId, List<string> medicationNames, Guid patientId)
        {
            var errors = new List<ValidationError>();

            try
            {
                // Get patient info for conditions checking
                var patient = await _context.Patients
                    .FirstOrDefaultAsync(p => p.Id == patientId && p.TenantId == tenantId && p.DeletedAt == null);

                if (patient == null)
                    return errors;

                foreach (var medName in medicationNames)
                {
                    // Get medication info from database
                    var medication = await _context.OphthalMedications
                        .FirstOrDefaultAsync(m => 
                            m.TenantId == tenantId && 
                            m.GenericName.ToLower().Contains(medName.ToLower()) &&
                            m.DeletedAt == null);

                    if (medication == null || string.IsNullOrEmpty(medication.Contraindications))
                        continue;

                    var contraindications = medication.Contraindications.ToLower();

                    // Check common contraindications
                    if (contraindications.Contains("pregnancy") && patient.Gender?.ToLower() == "female")
                    {
                        errors.Add(new ValidationError
                        {
                            ErrorType = "contraindication",
                            MedicationName = medication.GenericName,
                            Message = $"{medication.GenericName} is contraindicated in pregnancy",
                            Severity = "Critical",
                            ConflictsWith = "Pregnancy",
                            Recommendation = "Verify pregnancy status. If pregnant, choose alternative medication."
                        });
                    }

                    if (contraindications.Contains("asthma") || contraindications.Contains("copd"))
                    {
                        errors.Add(new ValidationError
                        {
                            ErrorType = "contraindication",
                            MedicationName = medication.GenericName,
                            Message = $"{medication.GenericName} is contraindicated in patients with asthma/COPD",
                            Severity = "Critical",
                            ConflictsWith = "Respiratory condition",
                            Recommendation = "Verify respiratory status. Choose alternative if patient has asthma/COPD."
                        });
                    }

                    if (contraindications.Contains("heart block") || contraindications.Contains("cardiac"))
                    {
                        errors.Add(new ValidationError
                        {
                            ErrorType = "contraindication",
                            MedicationName = medication.GenericName,
                            Message = $"{medication.GenericName} is contraindicated in patients with cardiac conditions",
                            Severity = "Critical",
                            ConflictsWith = "Cardiac condition",
                            Recommendation = "Verify cardiac status. Choose alternative if patient has heart block or severe cardiac disease."
                        });
                    }
                }

                return errors;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking contraindications");
                return errors;
            }
        }

        /// <summary>
        /// Check for duplicate active prescriptions
        /// </summary>
        public async Task<List<ValidationWarning>> CheckDuplicatePrescriptionsAsync(Guid patientId, List<string> medicationNames)
        {
            var warnings = new List<ValidationWarning>();

            try
            {
                // Get patient's active prescriptions from last 30 days
                var activePrescriptions = await _context.Prescriptions
                    .Where(p => p.PatientId == patientId &&
                               p.Status == "active" &&
                               p.DeletedAt == null &&
                               p.PrescriptionDate >= DateTime.UtcNow.AddDays(-30))
                    .Include(p => p.Medications)
                    .ToListAsync();

                if (!activePrescriptions.Any())
                    return warnings;

                // Get all active medication names
                var activeMedicationNames = activePrescriptions
                    .SelectMany(p => p.Medications)
                    .Select(m => m.MedicationName.ToLower().Trim())
                    .Distinct()
                    .ToList();

                // Check for duplicates
                foreach (var newMed in medicationNames)
                {
                    var normalizedNewMed = newMed.ToLower().Trim();
                    if (activeMedicationNames.Any(activeMed => 
                        activeMed.Contains(normalizedNewMed) || normalizedNewMed.Contains(activeMed)))
                    {
                        warnings.Add(new ValidationWarning
                        {
                            WarningType = "duplicate",
                            MedicationName = newMed,
                            Message = $"Patient already has an active prescription for {newMed} (last 30 days)",
                            Severity = "Moderate",
                            ConflictsWith = "Existing prescription",
                            Recommendation = "Review existing prescription. Consider if new prescription is needed or should replace existing one.",
                            CanOverride = true
                        });
                    }
                }

                return warnings;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking duplicate prescriptions");
                return warnings;
            }
        }

        /// <summary>
        /// Get medication information
        /// </summary>
        public async Task<OphthalMedicationDto?> GetMedicationInfoAsync(Guid tenantId, string medicationName)
        {
            try
            {
                var medication = await _context.OphthalMedications
                    .FirstOrDefaultAsync(m => 
                        m.TenantId == tenantId &&
                        (m.GenericName.ToLower().Contains(medicationName.ToLower()) ||
                         (m.BrandNames != null && m.BrandNames.Any(b => b.ToLower().Contains(medicationName.ToLower())))) &&
                        m.DeletedAt == null);

                if (medication == null)
                    return null;

                return new OphthalMedicationDto
                {
                    Id = medication.Id,
                    GenericName = medication.GenericName,
                    BrandNames = medication.BrandNames,
                    DrugClass = medication.DrugClass,
                    Indications = medication.Indications,
                    Contraindications = medication.Contraindications,
                    Warnings = medication.Warnings,
                    PregnancyCategory = medication.PregnancyCategory,
                    Route = medication.Route
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting medication info for {MedicationName}", medicationName);
                return null;
            }
        }

        public async Task<DrugInteractionResult> CheckInteractionsAsync(List<string> medicationNames)
        {
            var result = new DrugInteractionResult
            {
                HasInteractions = false,
                Interactions = new List<DrugInteractionDto>()
            };

            if (medicationNames == null || medicationNames.Count < 2)
                return result;

            // Normalize medication names
            var normalizedNames = medicationNames.Select(n => n.ToLower().Trim()).ToList();

            // Check all pairs
            for (int i = 0; i < normalizedNames.Count; i++)
            {
                for (int j = i + 1; j < normalizedNames.Count; j++)
                {
                    var drug1 = normalizedNames[i];
                    var drug2 = normalizedNames[j];

                    // Check both directions (drug1-drug2 and drug2-drug1)
                    var interaction = await _context.DrugInteractions
                        .FirstOrDefaultAsync(di =>
                            (di.Drug1Name.ToLower() == drug1 && di.Drug2Name.ToLower() == drug2) ||
                            (di.Drug1Name.ToLower() == drug2 && di.Drug2Name.ToLower() == drug1));

                    if (interaction != null)
                    {
                        result.HasInteractions = true;
                        result.Interactions.Add(new DrugInteractionDto
                        {
                            Id = interaction.Id,
                            Drug1Name = interaction.Drug1Name,
                            Drug2Name = interaction.Drug2Name,
                            InteractionType = interaction.InteractionType,
                            Severity = interaction.Severity,
                            Description = interaction.Description,
                            ClinicalEffects = interaction.ClinicalEffects,
                            Mechanism = interaction.Mechanism,
                            Management = interaction.Management,
                            ReferenceSources = interaction.ReferenceSources
                        });
                    }
                }
            }

            // Sort by severity (high first)
            result.Interactions = result.Interactions
                .OrderByDescending(i => i.Severity == "high" ? 3 : i.Severity == "medium" ? 2 : 1)
                .ToList();

            return result;
        }

        public async Task<DrugInteractionResult> CheckPatientAllergiesAsync(Guid patientId, List<string> medicationNames, Guid tenantId)
        {
            var result = new DrugInteractionResult
            {
                HasInteractions = false,
                Interactions = new List<DrugInteractionDto>()
            };

            // Get patient with allergies
            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.Id == patientId && p.TenantId == tenantId && p.DeletedAt == null);

            if (patient == null || string.IsNullOrEmpty(patient.Allergies))
                return result;

            // Parse allergies (comma-separated)
            var allergies = patient.Allergies
                .Split(',')
                .Select(a => a.Trim().ToLower())
                .Where(a => !string.IsNullOrEmpty(a))
                .ToList();

            if (allergies.Count == 0)
                return result;

            // Check each medication against allergies
            var normalizedMedications = medicationNames.Select(m => m.ToLower().Trim()).ToList();

            foreach (var allergy in allergies)
            {
                foreach (var medication in normalizedMedications)
                {
                    // Simple contains check (could be enhanced with drug class matching)
                    if (medication.Contains(allergy) || allergy.Contains(medication))
                    {
                        result.HasInteractions = true;
                        result.Interactions.Add(new DrugInteractionDto
                        {
                            Id = Guid.NewGuid(),
                            Drug1Name = medication,
                            Drug2Name = $"Patient Allergy: {allergy}",
                            InteractionType = "allergy",
                            Severity = "high",
                            Description = $"Patient has documented allergy to {allergy}",
                            ClinicalEffects = "Potential allergic reaction",
                            Mechanism = "Known patient allergy",
                            Management = "DO NOT PRESCRIBE. Choose alternative medication.",
                            ReferenceSources = "Patient medical history"
                        });
                    }
                }
            }

            return result;
        }

        public async Task<DrugInteractionDto?> GetInteractionDetailsAsync(string drug1, string drug2)
        {
            var normalizedDrug1 = drug1.ToLower().Trim();
            var normalizedDrug2 = drug2.ToLower().Trim();

            var interaction = await _context.DrugInteractions
                .FirstOrDefaultAsync(di =>
                    (di.Drug1Name.ToLower() == normalizedDrug1 && di.Drug2Name.ToLower() == normalizedDrug2) ||
                    (di.Drug1Name.ToLower() == normalizedDrug2 && di.Drug2Name.ToLower() == normalizedDrug1));

            if (interaction == null)
                return null;

            return new DrugInteractionDto
            {
                Id = interaction.Id,
                Drug1Name = interaction.Drug1Name,
                Drug2Name = interaction.Drug2Name,
                InteractionType = interaction.InteractionType,
                Severity = interaction.Severity,
                Description = interaction.Description,
                ClinicalEffects = interaction.ClinicalEffects,
                Mechanism = interaction.Mechanism,
                Management = interaction.Management,
                ReferenceSources = interaction.ReferenceSources
            };
        }

        public async Task<List<DrugInteractionDto>> GetAllInteractionsAsync()
        {
            var interactions = await _context.DrugInteractions
                .OrderBy(di => di.Drug1Name)
                .ThenBy(di => di.Drug2Name)
                .ToListAsync();

            return interactions.Select(i => new DrugInteractionDto
            {
                Id = i.Id,
                Drug1Name = i.Drug1Name,
                Drug2Name = i.Drug2Name,
                InteractionType = i.InteractionType,
                Severity = i.Severity,
                Description = i.Description,
                ClinicalEffects = i.ClinicalEffects,
                Mechanism = i.Mechanism,
                Management = i.Management,
                ReferenceSources = i.ReferenceSources
            }).ToList();
        }
    }
}
