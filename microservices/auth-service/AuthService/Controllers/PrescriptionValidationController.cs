using AuthService.DTOs.Prescription;
using AuthService.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AuthService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PrescriptionValidationController : ControllerBase
{
    private readonly IDrugInteractionService _drugInteractionService;
    private readonly ILogger<PrescriptionValidationController> _logger;

    public PrescriptionValidationController(
        IDrugInteractionService drugInteractionService,
        ILogger<PrescriptionValidationController> logger)
    {
        _drugInteractionService = drugInteractionService;
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

    /// <summary>
    /// Validate prescription before saving (comprehensive check)
    /// POST /api/prescriptionvalidation/validate
    /// </summary>
    [HttpPost("validate")]
    public async Task<ActionResult<PrescriptionValidationResult>> ValidatePrescription(
        [FromBody] ValidatePrescriptionRequest request)
    {
        try
        {
            var tenantId = GetTenantId();
            request.TenantId = tenantId;

            var result = await _drugInteractionService.ValidatePrescriptionAsync(request);

            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to validate prescription");
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating prescription");
            return StatusCode(500, new { message = "An error occurred while validating prescription" });
        }
    }

    /// <summary>
    /// Check drug-drug interactions only
    /// POST /api/prescriptionvalidation/interactions
    /// Body: ["Timolol", "Latanoprost", "Prednisolone"]
    /// </summary>
    [HttpPost("interactions")]
    public async Task<ActionResult<DrugInteractionResult>> CheckInteractions(
        [FromBody] List<string> medicationNames)
    {
        try
        {
            if (medicationNames == null || medicationNames.Count < 2)
            {
                return BadRequest(new { message = "At least 2 medications required for interaction check" });
            }

            var result = await _drugInteractionService.CheckInteractionsAsync(medicationNames);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking drug interactions");
            return StatusCode(500, new { message = "An error occurred while checking interactions" });
        }
    }

    /// <summary>
    /// Check patient allergies against medications
    /// POST /api/prescriptionvalidation/allergies/{patientId}
    /// Body: ["Timolol", "Latanoprost"]
    /// </summary>
    [HttpPost("allergies/{patientId}")]
    public async Task<ActionResult<DrugInteractionResult>> CheckAllergies(
        Guid patientId,
        [FromBody] List<string> medicationNames)
    {
        try
        {
            var tenantId = GetTenantId();

            if (medicationNames == null || !medicationNames.Any())
            {
                return BadRequest(new { message = "At least 1 medication required for allergy check" });
            }

            var result = await _drugInteractionService.CheckPatientAllergiesAsync(
                patientId,
                medicationNames,
                tenantId);

            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to check allergies");
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking patient allergies");
            return StatusCode(500, new { message = "An error occurred while checking allergies" });
        }
    }

    /// <summary>
    /// Get medication information
    /// GET /api/prescriptionvalidation/medication?name=Timolol
    /// </summary>
    [HttpGet("medication")]
    public async Task<ActionResult<OphthalMedicationDto>> GetMedicationInfo(
        [FromQuery] string name)
    {
        try
        {
            var tenantId = GetTenantId();

            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest(new { message = "Medication name is required" });
            }

            var medication = await _drugInteractionService.GetMedicationInfoAsync(tenantId, name);

            if (medication == null)
            {
                return NotFound(new { message = $"Medication '{name}' not found in database" });
            }

            return Ok(medication);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to get medication info");
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting medication info");
            return StatusCode(500, new { message = "An error occurred while retrieving medication information" });
        }
    }

    /// <summary>
    /// Get all drug interactions (admin only)
    /// GET /api/prescriptionvalidation/interactions/all
    /// </summary>
    [HttpGet("interactions/all")]
    [Authorize(Policy = "RequireAdministratorRole")]
    public async Task<ActionResult<List<DrugInteractionDto>>> GetAllInteractions()
    {
        try
        {
            var interactions = await _drugInteractionService.GetAllInteractionsAsync();
            return Ok(interactions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all drug interactions");
            return StatusCode(500, new { message = "An error occurred while retrieving drug interactions" });
        }
    }

    /// <summary>
    /// Get specific drug interaction details
    /// GET /api/prescriptionvalidation/interactions/details?drug1=Timolol&drug2=Asthma
    /// </summary>
    [HttpGet("interactions/details")]
    public async Task<ActionResult<DrugInteractionDto>> GetInteractionDetails(
        [FromQuery] string drug1,
        [FromQuery] string drug2)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(drug1) || string.IsNullOrWhiteSpace(drug2))
            {
                return BadRequest(new { message = "Both drug1 and drug2 are required" });
            }

            var interaction = await _drugInteractionService.GetInteractionDetailsAsync(drug1, drug2);

            if (interaction == null)
            {
                return NotFound(new { message = $"No interaction found between '{drug1}' and '{drug2}'" });
            }

            return Ok(interaction);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting interaction details");
            return StatusCode(500, new { message = "An error occurred while retrieving interaction details" });
        }
    }
}
