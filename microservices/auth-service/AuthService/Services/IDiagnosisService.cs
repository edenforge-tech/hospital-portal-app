using AuthService.Models.Domain;

namespace AuthService.Services;

public interface IDiagnosisService
{
    /// <summary>
    /// Search for diagnosis codes by text query with optional filters
    /// </summary>
    Task<IEnumerable<DiagnosisCode>> SearchDiagnosisCodesAsync(
        Guid tenantId, 
        string? query = null, 
        string? laterality = null, 
        string? category = null, 
        int limit = 50);

    /// <summary>
    /// Suggest diagnoses based on clinical findings (smart diagnosis suggester)
    /// </summary>
    Task<IEnumerable<DiagnosisCode>> SuggestDiagnosesAsync(
        Guid tenantId,
        decimal? iop = null,
        string? visualAcuity = null,
        string? symptoms = null,
        string? laterality = null);

    /// <summary>
    /// Get diagnosis code by ID
    /// </summary>
    Task<DiagnosisCode?> GetDiagnosisCodeByIdAsync(Guid id);

    /// <summary>
    /// Get diagnosis code by code string (e.g., "H40.111")
    /// </summary>
    Task<DiagnosisCode?> GetDiagnosisCodeByCodeAsync(Guid tenantId, string code);

    /// <summary>
    /// Get all diagnoses for a patient
    /// </summary>
    Task<IEnumerable<PatientDiagnosis>> GetPatientDiagnosesAsync(Guid patientId);

    /// <summary>
    /// Add a diagnosis to a patient
    /// </summary>
    Task<PatientDiagnosis> AddPatientDiagnosisAsync(PatientDiagnosis diagnosis);

    /// <summary>
    /// Get diagnosis categories
    /// </summary>
    Task<IEnumerable<string>> GetDiagnosisCategoriesAsync(Guid tenantId);
}
