using AuthService.DTOs;

namespace AuthService.Services
{
    /// <summary>
    /// Service interface for surgery recommendation and management
    /// </summary>
    public interface ISurgeryService
    {
        /// <summary>
        /// Create a surgery recommendation for a patient
        /// </summary>
        Task<SurgeryRequestResponseDto> CreateSurgeryRecommendationAsync(SurgeryRecommendationDto dto, Guid doctorId, Guid tenantId, Guid branchId);

        /// <summary>
        /// Calculate IOL power using multiple formulas
        /// </summary>
        Task<IOLCalculationResultDto> CalculateIOLPowerAsync(IOLCalculationDto dto);

        /// <summary>
        /// Generate pre-operative checklist based on surgery type and patient factors
        /// </summary>
        Task<List<string>> GeneratePreOpChecklistAsync(PreOpChecklistDto dto);

        /// <summary>
        /// Refer surgery request to counselor
        /// </summary>
        Task<bool> ReferToCounselorAsync(CounselorReferralDto dto, Guid userId);

        /// <summary>
        /// Get surgery requests by patient
        /// </summary>
        Task<List<SurgeryRequestResponseDto>> GetByPatientAsync(Guid patientId);

        /// <summary>
        /// Get surgery request by ID
        /// </summary>
        Task<SurgeryRequestResponseDto?> GetByIdAsync(Guid id);

        /// <summary>
        /// Update surgery request status
        /// </summary>
        Task<bool> UpdateStatusAsync(Guid id, string status, Guid userId);
    }
}
