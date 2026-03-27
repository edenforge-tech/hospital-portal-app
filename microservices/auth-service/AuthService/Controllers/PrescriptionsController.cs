using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AuthService.Services.Interfaces;
using AuthService.DTOs.Prescription;
using AuthService.Authorization;
using System.Security.Claims;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PrescriptionsController : ControllerBase
    {
        private readonly IPrescriptionService _prescriptionService;
        private readonly IDrugInteractionService _drugInteractionService;
        private readonly ILogger<PrescriptionsController> _logger;

        public PrescriptionsController(
            IPrescriptionService prescriptionService,
            IDrugInteractionService drugInteractionService,
            ILogger<PrescriptionsController> logger)
        {
            _prescriptionService = prescriptionService;
            _drugInteractionService = drugInteractionService;
            _logger = logger;
        }

        /// <summary>
        /// Create a new prescription with medications
        /// </summary>
        [HttpPost]
        [RequirePermission("prescription.create")]
        [ProducesResponseType(typeof(PrescriptionDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> CreatePrescription([FromBody] CreatePrescriptionRequest request)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException("User ID not found"));
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException("Tenant ID not found"));

                var prescription = await _prescriptionService.CreatePrescriptionAsync(request, userId, tenantId);

                _logger.LogInformation("Prescription created: {PrescriptionId} for patient {PatientId} by doctor {DoctorId}",
                    prescription.Id, prescription.PatientId, prescription.DoctorId);

                return CreatedAtAction(nameof(GetPrescription), new { id = prescription.Id }, prescription);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Invalid prescription creation attempt: {Message}", ex.Message);
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating prescription");
                return StatusCode(500, new { error = "An error occurred while creating the prescription" });
            }
        }

        /// <summary>
        /// Get prescription by ID
        /// </summary>
        [HttpGet("{id}")]
        [RequirePermission("prescription.read")]
        [ProducesResponseType(typeof(PrescriptionDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetPrescription(Guid id)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException("Tenant ID not found"));

                var prescription = await _prescriptionService.GetPrescriptionByIdAsync(id, tenantId);

                if (prescription == null)
                    return NotFound(new { error = "Prescription not found" });

                return Ok(prescription);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving prescription {PrescriptionId}", id);
                return StatusCode(500, new { error = "An error occurred while retrieving the prescription" });
            }
        }

        /// <summary>
        /// Get all prescriptions for a patient
        /// </summary>
        [HttpGet("patient/{patientId}")]
        [RequirePermission("prescription.read")]
        [ProducesResponseType(typeof(List<PrescriptionDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPatientPrescriptions(Guid patientId, [FromQuery] string? status = null)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException("Tenant ID not found"));

                var prescriptions = await _prescriptionService.GetPrescriptionsByPatientAsync(patientId, tenantId, status);

                return Ok(prescriptions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving prescriptions for patient {PatientId}", patientId);
                return StatusCode(500, new { error = "An error occurred while retrieving prescriptions" });
            }
        }

        /// <summary>
        /// Get all prescriptions created by a doctor
        /// </summary>
        [HttpGet("doctor/{doctorId}")]
        [RequirePermission("prescription.read")]
        [ProducesResponseType(typeof(List<PrescriptionDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetDoctorPrescriptions(
            Guid doctorId,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException("Tenant ID not found"));

                var prescriptions = await _prescriptionService.GetPrescriptionsByDoctorAsync(doctorId, tenantId, fromDate, toDate);

                return Ok(prescriptions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving prescriptions for doctor {DoctorId}", doctorId);
                return StatusCode(500, new { error = "An error occurred while retrieving prescriptions" });
            }
        }

        /// <summary>
        /// Update prescription details
        /// </summary>
        [HttpPut("{id}")]
        [RequirePermission("prescription.update")]
        [ProducesResponseType(typeof(PrescriptionDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdatePrescription(Guid id, [FromBody] UpdatePrescriptionRequest request)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException("Tenant ID not found"));

                var prescription = await _prescriptionService.UpdatePrescriptionAsync(id, request, tenantId);

                _logger.LogInformation("Prescription updated: {PrescriptionId}", id);

                return Ok(prescription);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Invalid prescription update attempt for {PrescriptionId}: {Message}", id, ex.Message);
                
                if (ex.Message.Contains("not found"))
                    return NotFound(new { error = ex.Message });
                
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating prescription {PrescriptionId}", id);
                return StatusCode(500, new { error = "An error occurred while updating the prescription" });
            }
        }

        /// <summary>
        /// Mark prescription as dispensed
        /// </summary>
        [HttpPost("{id}/dispense")]
        [RequirePermission("prescription.dispense")]
        [ProducesResponseType(typeof(PrescriptionDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DispensePrescription(Guid id, [FromBody] DispensePrescriptionRequest request)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException("User ID not found"));
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException("Tenant ID not found"));

                var prescription = await _prescriptionService.DispensePrescriptionAsync(id, request, userId, tenantId);

                _logger.LogInformation("Prescription dispensed: {PrescriptionId} by user {UserId} at pharmacy {PharmacyId}",
                    id, userId, request.PharmacyId);

                return Ok(prescription);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Invalid dispense attempt for prescription {PrescriptionId}: {Message}", id, ex.Message);
                
                if (ex.Message.Contains("not found"))
                    return NotFound(new { error = ex.Message });
                
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error dispensing prescription {PrescriptionId}", id);
                return StatusCode(500, new { error = "An error occurred while dispensing the prescription" });
            }
        }

        /// <summary>
        /// Cancel a prescription
        /// </summary>
        [HttpPost("{id}/cancel")]
        [RequirePermission("prescription.update")]
        [ProducesResponseType(typeof(PrescriptionDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> CancelPrescription(Guid id, [FromBody] CancelPrescriptionRequest request)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException("Tenant ID not found"));

                var prescription = await _prescriptionService.CancelPrescriptionAsync(id, request.Reason, tenantId);

                _logger.LogInformation("Prescription cancelled: {PrescriptionId}, Reason: {Reason}", id, request.Reason);

                return Ok(prescription);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Invalid cancel attempt for prescription {PrescriptionId}: {Message}", id, ex.Message);
                
                if (ex.Message.Contains("not found"))
                    return NotFound(new { error = ex.Message });
                
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling prescription {PrescriptionId}", id);
                return StatusCode(500, new { error = "An error occurred while cancelling the prescription" });
            }
        }

        /// <summary>
        /// Mark prescription as printed
        /// </summary>
        [HttpPost("{id}/print")]
        [RequirePermission("prescription.print")]
        [ProducesResponseType(typeof(PrescriptionDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> PrintPrescription(Guid id)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException("Tenant ID not found"));

                var prescription = await _prescriptionService.PrintPrescriptionAsync(id, tenantId);

                _logger.LogInformation("Prescription printed: {PrescriptionId}", id);

                return Ok(prescription);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Prescription {PrescriptionId} not found for printing", id);
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error printing prescription {PrescriptionId}", id);
                return StatusCode(500, new { error = "An error occurred while printing the prescription" });
            }
        }

        /// <summary>
        /// Delete prescription (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        [RequirePermission("prescription.delete")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeletePrescription(Guid id)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException("Tenant ID not found"));

                var result = await _prescriptionService.DeletePrescriptionAsync(id, tenantId);

                if (!result)
                    return NotFound(new { error = "Prescription not found" });

                _logger.LogInformation("Prescription deleted: {PrescriptionId}", id);

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting prescription {PrescriptionId}", id);
                return StatusCode(500, new { error = "An error occurred while deleting the prescription" });
            }
        }

        /// <summary>
        /// Check drug interactions for a list of medications
        /// </summary>
        [HttpPost("check-interactions")]
        [RequirePermission("druginteraction.check")]
        [ProducesResponseType(typeof(DrugInteractionResult), StatusCodes.Status200OK)]
        public async Task<IActionResult> CheckDrugInteractions([FromBody] DrugInteractionCheckRequest request)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException("Tenant ID not found"));

                // Check drug-drug interactions
                var interactionResult = await _drugInteractionService.CheckInteractionsAsync(request.MedicationNames);

                // Check patient allergies if patient ID provided
                if (request.PatientId.HasValue && request.PatientId.Value != Guid.Empty)
                {
                    var allergyResult = await _drugInteractionService.CheckPatientAllergiesAsync(
                        request.PatientId.Value, 
                        request.MedicationNames, 
                        tenantId);

                    // Merge results
                    if (allergyResult.HasInteractions)
                    {
                        interactionResult.HasInteractions = true;
                        interactionResult.Interactions.AddRange(allergyResult.Interactions);
                    }
                }

                return Ok(interactionResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking drug interactions");
                return StatusCode(500, new { error = "An error occurred while checking drug interactions" });
            }
        }
    }

    // Request DTOs for controller-specific operations
    public class CancelPrescriptionRequest
    {
        public string Reason { get; set; } = string.Empty;
    }
}
