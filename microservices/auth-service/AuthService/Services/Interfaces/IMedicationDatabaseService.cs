using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AuthService.DTOs.Prescription;

namespace AuthService.Services.Interfaces
{
    public interface IMedicationDatabaseService
    {
        /// <summary>
        /// Search medications for autocomplete
        /// </summary>
        Task<List<MedicationSearchDto>> SearchMedicationsAsync(string query, string? category = null, int pageSize = 20);

        /// <summary>
        /// Get medication by ID
        /// </summary>
        Task<MedicationSearchDto?> GetMedicationByIdAsync(Guid id);

        /// <summary>
        /// Get medication by exact name
        /// </summary>
        Task<MedicationSearchDto?> GetMedicationByNameAsync(string name);

        /// <summary>
        /// Get medications by category
        /// </summary>
        Task<List<MedicationSearchDto>> GetMedicationsByCategoryAsync(string category);

        /// <summary>
        /// Get all distinct categories
        /// </summary>
        Task<List<string>> GetAllCategoriesAsync();

        /// <summary>
        /// Get standard dosages for a medication
        /// </summary>
        Task<List<string>> GetStandardDosagesAsync(string medicationName);

        /// <summary>
        /// Add new medication to database (admin only)
        /// </summary>
        Task<MedicationSearchDto> AddMedicationAsync(MedicationSearchDto medication);

        /// <summary>
        /// Update medication (admin only)
        /// </summary>
        Task<MedicationSearchDto> UpdateMedicationAsync(Guid id, MedicationSearchDto medication);

        /// <summary>
        /// Deactivate medication (admin only)
        /// </summary>
        Task<bool> DeactivateMedicationAsync(Guid id);
    }
}
