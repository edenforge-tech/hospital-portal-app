using AuthService.Authorization;
using AuthService.Models.Domain;
using AuthService.Models.Domain.Dtos;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExaminationsController : ControllerBase
{
    private readonly IExaminationService _examinationService;
    private readonly ILogger<ExaminationsController> _logger;

    public ExaminationsController(
        IExaminationService examinationService,
        ILogger<ExaminationsController> logger)
    {
        _examinationService = examinationService;
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