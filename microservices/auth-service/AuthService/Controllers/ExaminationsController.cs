using AuthService.Authorization;
using AuthService.Models.Domain;
using AuthService.Models.Domain.Dtos;
using AuthService.Services;
using AuthService.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExaminationsController : ControllerBase
{
    private readonly IExaminationService _examinationService;
    private readonly IOptometryService _optometryService;
    private readonly ILogger<ExaminationsController> _logger;

    public ExaminationsController(
        IExaminationService examinationService,
        IOptometryService optometryService,
        ILogger<ExaminationsController> logger)
    {
        _examinationService = examinationService;
        _optometryService = optometryService;
        _logger = logger;
    }

    [HttpGet]
    [RequirePermission("examination.view")]
    public async Task<ActionResult<List<ExaminationResponse>>> GetAllExaminations()
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        var examinations = await _examinationService.GetAllExaminationsAsync(Guid.Parse(tenantId));
        
        return Ok(examinations.Select(e => MapToResponse(e)));
    }

    [HttpGet("patient/{patientId}")]
    [RequirePermission("examination.view")]
    public async Task<ActionResult<List<ExaminationResponse>>> GetPatientExaminations(Guid patientId)
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        var examinations = await _examinationService.GetPatientExaminationsAsync(patientId, Guid.Parse(tenantId));
        
        return Ok(examinations.Select(e => MapToResponse(e)));
    }

    [HttpGet("{id}")]
    [RequirePermission("examination.view")]
    public async Task<ActionResult<ExaminationResponse>> GetExamination(Guid id)
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        var examination = await _examinationService.GetExaminationByIdAsync(id, Guid.Parse(tenantId));
        if (examination == null) return NotFound();

        return Ok(MapToResponse(examination));
    }

    [HttpPost]
    [RequirePermission("examination.create")]
    public async Task<ActionResult<ExaminationResponse>> CreateExamination([FromBody] CreateExaminationRequest request)
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var examination = new ClinicalExamination
        {
            TenantId = Guid.Parse(tenantId),
            PatientId = request.PatientId,
            ExaminationDate = DateTime.UtcNow, // Default to current time
            ChiefComplaint = request.ChiefComplaint,
            ExaminationNotes = request.ExaminationNotes,
            Diagnosis = request.Diagnosis,
            TreatmentPlan = request.TreatmentPlan,
            Prescription = request.Prescription,
            FollowUpDate = request.FollowUpDate,
            ExaminingDoctorId = Guid.Parse(userId)
        };

        var createdExamination = await _examinationService.CreateExaminationAsync(examination);
        return CreatedAtAction(nameof(GetExamination), new { id = createdExamination.Id }, MapToResponse(createdExamination));
    }

    [HttpPut("{id}")]
    [RequirePermission("examination.update")]
    public async Task<ActionResult<ExaminationResponse>> UpdateExamination(Guid id, [FromBody] UpdateExaminationRequest request)
    {
        if (id != request.Id) return BadRequest();

        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var examination = new ClinicalExamination
        {
            Id = request.Id,
            TenantId = Guid.Parse(tenantId),
            PatientId = request.PatientId,
            ExaminationDate = DateTime.UtcNow, // Default to current time if not provided
            ChiefComplaint = request.ChiefComplaint,
            ExaminationNotes = request.ExaminationNotes,
            Diagnosis = request.Diagnosis,
            TreatmentPlan = request.TreatmentPlan,
            Prescription = request.Prescription,
            FollowUpDate = request.FollowUpDate,
            ExaminingDoctorId = Guid.Parse(userId)
        };

        var updatedExamination = await _examinationService.UpdateExaminationAsync(examination);
        if (updatedExamination == null) return NotFound();

        return Ok(MapToResponse(updatedExamination));
    }

    [HttpDelete("{id}")]
    [RequirePermission("examination.delete")]
    public async Task<ActionResult> DeleteExamination(Guid id)
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        var result = await _examinationService.DeleteExaminationAsync(id, Guid.Parse(tenantId));
        if (!result) return NotFound();

        return NoContent();
    }

    /// <summary>
    /// Get latest optometry examination for a patient (auto-import feature)
    /// </summary>
    [HttpGet("optometry/latest")]
    [RequirePermission("examination.view")]
    public async Task<ActionResult<object>> GetLatestOptometryData([FromQuery] Guid patientId)
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized("Tenant ID not found");

        if (patientId == Guid.Empty)
        {
            return BadRequest("Patient ID is required");
        }

        try
        {
            _logger.LogInformation("Fetching latest optometry data for patient {PatientId}", patientId);

            var optometryData = await _optometryService.GetLatestOptometryDataAsync(patientId, Guid.Parse(tenantId));

            if (optometryData == null)
            {
                _logger.LogInformation("No optometry examination found for patient {PatientId}", patientId);
                return NotFound(new { message = "No optometry examination found for this patient" });
            }

            return Ok(optometryData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving latest optometry data for patient {PatientId}", patientId);
            return StatusCode(500, new { message = "Failed to retrieve optometry data", error = ex.Message });
        }
    }

    /// <summary>
    /// Finalize examination with digital signature and optional follow-up appointment
    /// </summary>
    /// <param name="id">Examination ID</param>
    /// <param name="request">Finalization request with PIN and optional follow-up details</param>
    /// <returns>Finalization response with digital signature</returns>
    [HttpPost("{id}/finalize")]
    [RequirePermission("examination.update")]
    public async Task<ActionResult<FinalizeExaminationResponse>> FinalizeExamination(
        Guid id, 
        [FromBody] FinalizeExaminationRequest request)
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized("Tenant ID not found");

        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized("User ID not found");

        try
        {
            _logger.LogInformation(
                "Finalizing examination {ExaminationId} by doctor {DoctorId}", 
                id, 
                userId);

            var (success, message, digitalSignature, followUpAppointmentId) = 
                await _examinationService.FinalizeExaminationAsync(
                    id,
                    Guid.Parse(userId),
                    Guid.Parse(tenantId),
                    request.Pin,
                    request.FollowUpDate,
                    request.FollowUpReason);

            if (!success)
            {
                _logger.LogWarning(
                    "Failed to finalize examination {ExaminationId}: {Message}", 
                    id, 
                    message);
                return BadRequest(new { message });
            }

            var response = new FinalizeExaminationResponse
            {
                Success = true,
                Message = message,
                DigitalSignature = digitalSignature!,
                SignedAt = DateTime.UtcNow,
                FollowUpAppointmentId = followUpAppointmentId
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error finalizing examination {ExaminationId}", id);
            return StatusCode(500, new { message = "Failed to finalize examination", error = ex.Message });
        }
    }

    private static ExaminationResponse MapToResponse(ClinicalExamination examination)
    {
        return new ExaminationResponse
        {
            Id = examination.Id,
            PatientId = examination.PatientId,
            PatientName = examination.Patient != null 
                ? $"{examination.Patient.FirstName} {examination.Patient.LastName}"
                : "Unknown Patient",
            ExaminationDate = examination.ExaminationDate,
            ChiefComplaint = examination.ChiefComplaint,
            ExaminationNotes = examination.ExaminationNotes,
            Diagnosis = examination.Diagnosis,
            TreatmentPlan = examination.TreatmentPlan,
            Prescription = examination.Prescription,
            FollowUpDate = examination.FollowUpDate,
            ExaminingDoctorName = examination.ExaminingDoctor != null
                ? $"Dr. {examination.ExaminingDoctor.FirstName} {examination.ExaminingDoctor.LastName}"
                : "Unknown Doctor",
            CreatedAt = examination.CreatedAt,
            UpdatedAt = examination.UpdatedAt
        };
    }
}