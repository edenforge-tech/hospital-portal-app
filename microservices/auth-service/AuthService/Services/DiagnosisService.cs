using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Services;

public class DiagnosisService : IDiagnosisService
{
    private readonly AppDbContext _context;
    private readonly ILogger<DiagnosisService> _logger;

    public DiagnosisService(AppDbContext context, ILogger<DiagnosisService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<DiagnosisCode>> SearchDiagnosisCodesAsync(
        Guid tenantId,
        string? query = null,
        string? laterality = null,
        string? category = null,
        int limit = 50)
    {
        try
        {
            var diagnosisQuery = _context.DiagnosisCodes
                .Where(d => d.TenantId == tenantId &&
                           d.DeletedAt == null &&
                           d.Status == "active");

            // Apply text search filter
            if (!string.IsNullOrWhiteSpace(query))
            {
                var searchTerm = query.ToLower();
                diagnosisQuery = diagnosisQuery.Where(d =>
                    d.Code.ToLower().Contains(searchTerm) ||
                    d.Description.ToLower().Contains(searchTerm));
            }

            // Apply laterality filter
            if (!string.IsNullOrWhiteSpace(laterality))
            {
                diagnosisQuery = diagnosisQuery.Where(d => d.Laterality == laterality);
            }

            // Apply category filter
            if (!string.IsNullOrWhiteSpace(category))
            {
                diagnosisQuery = diagnosisQuery.Where(d => d.Category == category);
            }

            // Order by relevance and take limit
            var results = await diagnosisQuery
                .OrderBy(d => !string.IsNullOrWhiteSpace(query) && d.Code.ToLower().StartsWith(query.ToLower()) ? 0 : 1)
                .ThenBy(d => !string.IsNullOrWhiteSpace(query) && d.Description.ToLower().StartsWith(query.ToLower()) ? 0 : 1)
                .ThenBy(d => d.Code)
                .Take(limit)
                .ToListAsync();

            _logger.LogInformation("Found {Count} diagnosis codes for tenant {TenantId} with query '{Query}'",
                results.Count, tenantId, query);

            return results;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching diagnosis codes for tenant {TenantId}", tenantId);
            throw;
        }
    }

    public async Task<IEnumerable<DiagnosisCode>> SuggestDiagnosesAsync(
        Guid tenantId,
        decimal? iop = null,
        string? visualAcuity = null,
        string? symptoms = null,
        string? laterality = null)
    {
        try
        {
            var suggestions = new List<DiagnosisCode>();

            // Smart diagnosis logic based on clinical findings

            // High IOP (>21 mmHg) suggests glaucoma
            if (iop.HasValue && iop.Value > 21)
            {
                var glaucomaCodes = await _context.DiagnosisCodes
                    .Where(d => d.TenantId == tenantId &&
                               d.DeletedAt == null &&
                               d.Category == "Glaucoma" &&
                               (string.IsNullOrEmpty(laterality) || d.Laterality == laterality || d.Laterality == "Unspecified"))
                    .Take(5)
                    .ToListAsync();

                suggestions.AddRange(glaucomaCodes);
            }

            // Very high IOP (>30) suggests acute angle-closure
            if (iop.HasValue && iop.Value > 30)
            {
                var acuteGlaucoma = await _context.DiagnosisCodes
                    .Where(d => d.TenantId == tenantId &&
                               d.DeletedAt == null &&
                               d.Description.ToLower().Contains("acute angle-closure") &&
                               (string.IsNullOrEmpty(laterality) || d.Laterality == laterality))
                    .Take(3)
                    .ToListAsync();

                suggestions.AddRange(acuteGlaucoma);
            }

            // Poor visual acuity suggests various conditions
            if (!string.IsNullOrWhiteSpace(visualAcuity))
            {
                var va = visualAcuity.ToUpper();

                // HM (Hand Motion), CF (Counting Fingers), PL (Perception of Light) suggest severe pathology
                if (va.Contains("HM") || va.Contains("CF") || va.Contains("PL"))
                {
                    var severeCodes = await _context.DiagnosisCodes
                        .Where(d => d.TenantId == tenantId &&
                                   d.DeletedAt == null &&
                                   (d.Category == "Cataract" ||
                                    d.Category == "Glaucoma" ||
                                    d.Category == "Corneal Disorder" ||
                                    d.Description.ToLower().Contains("severe")) &&
                                   (string.IsNullOrEmpty(laterality) || d.Laterality == laterality || d.Laterality == "Unspecified"))
                        .Take(5)
                        .ToListAsync();

                    suggestions.AddRange(severeCodes);
                }

                // Near vision issues suggest presbyopia
                if (va.Contains("N") || symptoms?.ToLower().Contains("near vision") == true)
                {
                    var presbyopia = await _context.DiagnosisCodes
                        .Where(d => d.TenantId == tenantId &&
                                   d.DeletedAt == null &&
                                   d.Description.ToLower().Contains("presbyopia"))
                        .Take(1)
                        .ToListAsync();

                    suggestions.AddRange(presbyopia);
                }
            }

            // Symptom-based suggestions
            if (!string.IsNullOrWhiteSpace(symptoms))
            {
                var symptomLower = symptoms.ToLower();

                // Blurred vision
                if (symptomLower.Contains("blur") || symptomLower.Contains("cloudy"))
                {
                    var cataractCodes = await _context.DiagnosisCodes
                        .Where(d => d.TenantId == tenantId &&
                                   d.DeletedAt == null &&
                                   d.Category == "Cataract" &&
                                   (string.IsNullOrEmpty(laterality) || d.Laterality == laterality || d.Laterality == "Unspecified"))
                        .Take(3)
                        .ToListAsync();

                    suggestions.AddRange(cataractCodes);
                }

                // Red eye, discharge
                if (symptomLower.Contains("red") || symptomLower.Contains("discharge") || symptomLower.Contains("irritation"))
                {
                    var conjunctivitisCodes = await _context.DiagnosisCodes
                        .Where(d => d.TenantId == tenantId &&
                                   d.DeletedAt == null &&
                                   d.Category == "Conjunctivitis" &&
                                   (string.IsNullOrEmpty(laterality) || d.Laterality == laterality || d.Laterality == "Unspecified"))
                        .Take(3)
                        .ToListAsync();

                    suggestions.AddRange(conjunctivitisCodes);
                }

                // Dry eye symptoms
                if (symptomLower.Contains("dry") || symptomLower.Contains("gritty") || symptomLower.Contains("burning"))
                {
                    var dryEyeCodes = await _context.DiagnosisCodes
                        .Where(d => d.TenantId == tenantId &&
                                   d.DeletedAt == null &&
                                   d.Category == "Dry Eye" &&
                                   (string.IsNullOrEmpty(laterality) || d.Laterality == laterality || d.Laterality == "Unspecified"))
                        .Take(3)
                        .ToListAsync();

                    suggestions.AddRange(dryEyeCodes);
                }

                // Diabetic symptoms
                if (symptomLower.Contains("diabet") || symptomLower.Contains("blood sugar"))
                {
                    var diabeticCodes = await _context.DiagnosisCodes
                        .Where(d => d.TenantId == tenantId &&
                                   d.DeletedAt == null &&
                                   d.Category == "Diabetic Retinopathy")
                        .Take(3)
                        .ToListAsync();

                    suggestions.AddRange(diabeticCodes);
                }
            }

            // Remove duplicates and return top 10
            var distinctSuggestions = suggestions
                .GroupBy(d => d.Id)
                .Select(g => g.First())
                .Take(10)
                .ToList();

            _logger.LogInformation("Generated {Count} diagnosis suggestions for tenant {TenantId} based on clinical findings",
                distinctSuggestions.Count, tenantId);

            return distinctSuggestions;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error suggesting diagnoses for tenant {TenantId}", tenantId);
            throw;
        }
    }

    public async Task<DiagnosisCode?> GetDiagnosisCodeByIdAsync(Guid id)
    {
        try
        {
            return await _context.DiagnosisCodes
                .FirstOrDefaultAsync(d => d.Id == id && d.DeletedAt == null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting diagnosis code by ID {Id}", id);
            throw;
        }
    }

    public async Task<DiagnosisCode?> GetDiagnosisCodeByCodeAsync(Guid tenantId, string code)
    {
        try
        {
            return await _context.DiagnosisCodes
                .FirstOrDefaultAsync(d => d.TenantId == tenantId &&
                                         d.Code == code &&
                                         d.DeletedAt == null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting diagnosis code {Code} for tenant {TenantId}", code, tenantId);
            throw;
        }
    }

    public async Task<IEnumerable<PatientDiagnosis>> GetPatientDiagnosesAsync(Guid patientId)
    {
        try
        {
            return await _context.PatientDiagnoses
                .Include(pd => pd.DiagnosisCode)
                .Where(pd => pd.PatientId == patientId && pd.DeletedAt == null)
                .OrderByDescending(pd => pd.DiagnosedAt)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting diagnoses for patient {PatientId}", patientId);
            throw;
        }
    }

    public async Task<PatientDiagnosis> AddPatientDiagnosisAsync(PatientDiagnosis diagnosis)
    {
        try
        {
            if (diagnosis.Id == Guid.Empty)
            {
                diagnosis.Id = Guid.NewGuid();
            }

            diagnosis.CreatedAt = DateTime.UtcNow;
            diagnosis.UpdatedAt = DateTime.UtcNow;
            diagnosis.DiagnosedAt = DateTime.UtcNow;

            _context.PatientDiagnoses.Add(diagnosis);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Added diagnosis {DiagnosisCodeId} to patient {PatientId}",
                diagnosis.DiagnosisCodeId, diagnosis.PatientId);

            return diagnosis;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding diagnosis for patient {PatientId}", diagnosis.PatientId);
            throw;
        }
    }

    public async Task<IEnumerable<string>> GetDiagnosisCategoriesAsync(Guid tenantId)
    {
        try
        {
            return await _context.DiagnosisCodes
                .Where(d => d.TenantId == tenantId && d.DeletedAt == null)
                .Select(d => d.Category)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting diagnosis categories for tenant {TenantId}", tenantId);
            throw;
        }
    }
}
