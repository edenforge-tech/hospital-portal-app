using AuthService.Models.Domain;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AuthService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DiagnosesController : ControllerBase
{
    private readonly IDiagnosisService _diagnosisService;
    private readonly ILogger<DiagnosesController> _logger;

    public DiagnosesController(
        IDiagnosisService diagnosisService,
        ILogger<DiagnosesController> logger)
    {
        _diagnosisService = diagnosisService;
        _logger = logger;
    }

    private Guid GetTenantId()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var tenantId))
        {
            throw new UnauthorizedAccessException("Tenant ID not found in token");
        }
        return tenantId;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("User ID not found in token");
        }
        return userId;
    }

    /// <summary>
    /// Search for diagnosis codes
    /// GET /api/diagnoses/search?query=glaucoma&laterality=OD&category=Glaucoma&limit=20
    /// </summary>
    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<DiagnosisCode>>> SearchDiagnosisCodes(
        [FromQuery] string? query = null,
        [FromQuery] string? laterality = null,
        [FromQuery] string? category = null,
        [FromQuery] int limit = 50)
    {
        try
        {
            var tenantId = GetTenantId();

            if (limit <= 0 || limit > 100)
            {
                return BadRequest(new { message = "Limit must be between 1 and 100" });
            }

            var results = await _diagnosisService.SearchDiagnosisCodesAsync(
                tenantId,
                query,
                laterality,
                category,
                limit);

            return Ok(results);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to search diagnosis codes");
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching diagnosis codes");
            return StatusCode(500, new { message = "An error occurred while searching diagnosis codes" });
        }
    }

    /// <summary>
    /// Get smart diagnosis suggestions based on clinical findings
    /// POST /api/diagnoses/suggest
    /// Body: { "iop": 38, "visualAcuity": "HM", "symptoms": "severe pain", "laterality": "OD" }
    /// </summary>
    [HttpPost("suggest")]
    public async Task<ActionResult<IEnumerable<DiagnosisCode>>> SuggestDiagnoses(
        [FromBody] DiagnosisSuggestionRequest request)
    {
        try
        {
            var tenantId = GetTenantId();

            var suggestions = await _diagnosisService.SuggestDiagnosesAsync(
                tenantId,
                request.Iop,
                request.VisualAcuity,
                request.Symptoms,
                request.Laterality);

            return Ok(suggestions);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to suggest diagnoses");
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error suggesting diagnoses");
            return StatusCode(500, new { message = "An error occurred while suggesting diagnoses" });
        }
    }

    /// <summary>
    /// Get diagnosis code by ID
    /// GET /api/diagnoses/{id}
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<DiagnosisCode>> GetDiagnosisCodeById(Guid id)
    {
        try
        {
            var diagnosisCode = await _diagnosisService.GetDiagnosisCodeByIdAsync(id);

            if (diagnosisCode == null)
            {
                return NotFound(new { message = "Diagnosis code not found" });
            }

            // Verify tenant access
            var tenantId = GetTenantId();
            if (diagnosisCode.TenantId != tenantId)
            {
                return Forbid();
            }

            return Ok(diagnosisCode);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to get diagnosis code");
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting diagnosis code by ID {Id}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the diagnosis code" });
        }
    }

    /// <summary>
    /// Get diagnosis code by code string
    /// GET /api/diagnoses/code/H40.111
    /// </summary>
    [HttpGet("code/{code}")]
    public async Task<ActionResult<DiagnosisCode>> GetDiagnosisCodeByCode(string code)
    {
        try
        {
            var tenantId = GetTenantId();
            var diagnosisCode = await _diagnosisService.GetDiagnosisCodeByCodeAsync(tenantId, code);

            if (diagnosisCode == null)
            {
                return NotFound(new { message = $"Diagnosis code '{code}' not found" });
            }

            return Ok(diagnosisCode);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to get diagnosis code by code");
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting diagnosis code by code {Code}", code);
            return StatusCode(500, new { message = "An error occurred while retrieving the diagnosis code" });
        }
    }

    /// <summary>
    /// Get all diagnoses for a patient
    /// GET /api/diagnoses/patient/{patientId}
    /// </summary>
    [HttpGet("patient/{patientId}")]
    public async Task<ActionResult<IEnumerable<PatientDiagnosis>>> GetPatientDiagnoses(Guid patientId)
    {
        try
        {
            var diagnoses = await _diagnosisService.GetPatientDiagnosesAsync(patientId);
            return Ok(diagnoses);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting diagnoses for patient {PatientId}", patientId);
            return StatusCode(500, new { message = "An error occurred while retrieving patient diagnoses" });
        }
    }

    /// <summary>
    /// Add a diagnosis to a patient
    /// POST /api/diagnoses/patient
    /// Body: { "patientId": "...", "diagnosisCodeId": "...", "diagnosisType": "primary", "eyeSpecificity": "OD", ... }
    /// </summary>
    [HttpPost("patient")]
    public async Task<ActionResult<PatientDiagnosis>> AddPatientDiagnosis(
        [FromBody] AddPatientDiagnosisRequest request)
    {
        try
        {
            var tenantId = GetTenantId();
            var userId = GetUserId();

            // Verify diagnosis code exists and belongs to tenant
            var diagnosisCode = await _diagnosisService.GetDiagnosisCodeByIdAsync(request.DiagnosisCodeId);
            if (diagnosisCode == null)
            {
                return NotFound(new { message = "Diagnosis code not found" });
            }
            if (diagnosisCode.TenantId != tenantId)
            {
                return Forbid();
            }

            var diagnosis = new PatientDiagnosis
            {
                TenantId = tenantId,
                PatientId = request.PatientId,
                DiagnosisCodeId = request.DiagnosisCodeId,
                VisitId = request.VisitId,
                ExaminationId = request.ExaminationId,
                DiagnosisType = request.DiagnosisType ?? "primary",
                EyeSpecificity = request.EyeSpecificity,
                ClinicalNotes = request.ClinicalNotes,
                DiagnosedByUserId = userId,
                CreatedByUserId = userId,
                UpdatedByUserId = userId
            };

            var savedDiagnosis = await _diagnosisService.AddPatientDiagnosisAsync(diagnosis);

            // Load DiagnosisCode for response
            savedDiagnosis.DiagnosisCode = diagnosisCode;

            return CreatedAtAction(
                nameof(GetPatientDiagnoses),
                new { patientId = savedDiagnosis.PatientId },
                savedDiagnosis);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to add patient diagnosis");
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding diagnosis for patient {PatientId}", request.PatientId);
            return StatusCode(500, new { message = "An error occurred while adding the diagnosis" });
        }
    }

    /// <summary>
    /// Get diagnosis categories
    /// GET /api/diagnoses/categories
    /// </summary>
    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<string>>> GetCategories()
    {
        try
        {
            var tenantId = GetTenantId();
            var categories = await _diagnosisService.GetDiagnosisCategoriesAsync(tenantId);
            return Ok(categories);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to get diagnosis categories");
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting diagnosis categories");
            return StatusCode(500, new { message = "An error occurred while retrieving diagnosis categories" });
        }
    }
}

// DTOs for request models
public class DiagnosisSuggestionRequest
{
    public decimal? Iop { get; set; }
    public string? VisualAcuity { get; set; }
    public string? Symptoms { get; set; }
    public string? Laterality { get; set; }
}

public class AddPatientDiagnosisRequest
{
    public required Guid PatientId { get; set; }
    public required Guid DiagnosisCodeId { get; set; }
    public Guid? VisitId { get; set; }
    public Guid? ExaminationId { get; set; }
    public string? DiagnosisType { get; set; } = "primary"; // primary, secondary, rule-out
    public string? EyeSpecificity { get; set; } // OD, OS, OU, Unspecified
    public string? ClinicalNotes { get; set; }
}
