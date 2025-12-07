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
public class PatientsController : ControllerBase
{
    private readonly IPatientService _patientService;
    private readonly ILogger<PatientsController> _logger;

    public PatientsController(
        IPatientService patientService,
        ILogger<PatientsController> logger)
    {
        _patientService = patientService;
        _logger = logger;
    }

    [HttpGet]
    [RequirePermission("patient.view")]
    public async Task<ActionResult<List<PatientResponse>>> GetAllPatients()
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        var patients = await _patientService.GetAllPatientsAsync(Guid.Parse(tenantId));
        
        return Ok(patients.Select(p => MapToResponse(p)));
    }

    [HttpGet("{id}")]
    [RequirePermission("patient.view")]
    public async Task<ActionResult<PatientResponse>> GetPatient(Guid id)
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        var patient = await _patientService.GetPatientByIdAsync(id, Guid.Parse(tenantId));
        if (patient == null) return NotFound();

        return Ok(MapToResponse(patient));
    }

    [HttpPost]
    [RequirePermission("patient.create")]
    public async Task<ActionResult<PatientResponse>> CreatePatient([FromBody] CreatePatientRequest request)
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        var patient = new Patient
        {
            TenantId = Guid.Parse(tenantId),
            MedicalRecordNumber = GenerateMedicalRecordNumber(),
            FirstName = request.FirstName,
            LastName = request.LastName,
            DateOfBirth = request.DateOfBirth,
            Gender = request.Gender,
            ContactNumber = request.ContactNumber,
            Email = request.Email,
            Address = request.Address,
            BloodGroup = request.BloodGroup,
            Allergies = request.Allergies
        };

        var createdPatient = await _patientService.CreatePatientAsync(patient);
        return CreatedAtAction(nameof(GetPatient), new { id = createdPatient.Id }, MapToResponse(createdPatient));
    }

    [HttpPut("{id}")]
    [RequirePermission("patient.update")]
    public async Task<ActionResult<PatientResponse>> UpdatePatient(Guid id, [FromBody] UpdatePatientRequest request)
    {
        if (id != request.Id) return BadRequest();

        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        var patient = new Patient
        {
            Id = request.Id,
            TenantId = Guid.Parse(tenantId),
            MedicalRecordNumber = GenerateMedicalRecordNumber(),
            FirstName = request.FirstName,
            LastName = request.LastName,
            DateOfBirth = request.DateOfBirth,
            Gender = request.Gender,
            ContactNumber = request.ContactNumber,
            Email = request.Email,
            Address = request.Address,
            BloodGroup = request.BloodGroup,
            Allergies = request.Allergies
        };

        var updatedPatient = await _patientService.UpdatePatientAsync(patient);
        if (updatedPatient == null) return NotFound();

        return Ok(MapToResponse(updatedPatient));
    }

    [HttpDelete("{id}")]
    [RequirePermission("patient.delete")]
    public async Task<ActionResult> DeletePatient(Guid id)
    {
        var tenantId = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId)) return Unauthorized();

        var result = await _patientService.DeletePatientAsync(id, Guid.Parse(tenantId));
        if (!result) return NotFound();

        return NoContent();
    }

    private static PatientResponse MapToResponse(Patient patient)
    {
        return new PatientResponse
        {
            Id = patient.Id,
            MedicalRecordNumber = patient.MedicalRecordNumber,
            FirstName = patient.FirstName,
            LastName = patient.LastName,
            DateOfBirth = patient.DateOfBirth,
            Gender = patient.Gender,
            ContactNumber = patient.ContactNumber,
            Email = patient.Email,
            Address = patient.Address,
            BloodGroup = patient.BloodGroup,
            Allergies = patient.Allergies,
            CreatedAt = patient.CreatedAt,
            UpdatedAt = patient.UpdatedAt
        };
    }

    private static string GenerateMedicalRecordNumber()
    {
        // Format: MRN-YYYY-MM-XXXXX
        return $"MRN-{DateTime.UtcNow:yyyy-MM}-{Guid.NewGuid().ToString().Substring(0, 5).ToUpper()}";
    }
}