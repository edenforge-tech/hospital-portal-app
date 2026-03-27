using System;
using System.Security.Claims;
using System.Threading.Tasks;
using AuthService.Authorization;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AdherenceController : ControllerBase
    {
        private readonly IAdherenceService _adherenceService;

        public AdherenceController(IAdherenceService adherenceService)
        {
            _adherenceService = adherenceService;
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null ? Guid.Parse(userIdClaim.Value) : Guid.Empty;
        }

        /// <summary>
        /// Get treatment adherence for specific patient
        /// </summary>
        [HttpGet("patients/{patientId}")]
        [RequirePermission("adherence.read")]
        public async Task<IActionResult> GetPatientAdherence(Guid patientId)
        {
            try
            {
                var adherence = await _adherenceService.GetPatientAdherenceAsync(patientId);
                if (adherence == null)
                    return NotFound(new { success = false, message = "Adherence data not found for this patient" });

                return Ok(new { success = true, data = adherence });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Get list of high-risk adherence patients
        /// </summary>
        [HttpGet("high-risk")]
        [RequirePermission("adherence.read")]
        public async Task<IActionResult> GetHighRiskPatients()
        {
            try
            {
                var highRiskPatients = await _adherenceService.GetHighRiskPatientsAsync();
                return Ok(new { success = true, data = highRiskPatients, count = highRiskPatients.Count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Update adherence metrics and generate recommendations
        /// </summary>
        [HttpPost("{adherenceId}/update")]
        [RequirePermission("adherence.update")]
        public async Task<IActionResult> UpdateAdherence(Guid adherenceId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var adherence = await _adherenceService.UpdateAdherenceAsync(adherenceId, userId);
                return Ok(new { success = true, data = adherence, message = "Adherence updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
