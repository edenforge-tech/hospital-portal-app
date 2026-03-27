using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using AuthService.Authorization;
using AuthService.DTOs.FollowUp;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/post-op-care")]
    [Authorize]
    public class PostOpCareController : ControllerBase
    {
        private readonly IPostOpCareService _postOpCareService;
        private readonly ISmsService _smsService;

        public PostOpCareController(IPostOpCareService postOpCareService, ISmsService smsService)
        {
            _postOpCareService = postOpCareService;
            _smsService = smsService;
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null ? Guid.Parse(userIdClaim.Value) : Guid.Empty;
        }

        private bool TryGetTenantId(out Guid tenantId)
        {
            var claim = User.FindFirst("tenant_id") ?? User.FindFirst("TenantId");
            if (claim != null && Guid.TryParse(claim.Value, out tenantId)) return true;
            tenantId = Guid.Empty;
            return false;
        }

        /// <summary>
        /// Get all active post-operative care patients
        /// </summary>
        [HttpGet("active")]
        [RequirePermission("postopcare.read")]
        public async Task<IActionResult> GetActivePostOpPatients()
        {
            try
            {
                var patients = await _postOpCareService.GetActivePostOpPatientsAsync();
                return Ok(new { success = true, data = patients, count = patients.Count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Get post-op care schedule for specific patient
        /// </summary>
        [HttpGet("patient/{patientId}")]
        [RequirePermission("postopcare.read")]
        public async Task<IActionResult> GetPostOpCareByPatient(Guid patientId)
        {
            try
            {
                var postOpCare = await _postOpCareService.GetPostOpCareByPatientIdAsync(patientId);
                if (postOpCare == null)
                    return NotFound(new { success = false, message = "Post-op care schedule not found for this patient" });

                return Ok(new { success = true, data = postOpCare });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Create post-operative care schedule
        /// </summary>
        [HttpPost]
        [RequirePermission("postopcare.create")]
        public async Task<IActionResult> CreatePostOpCareSchedule([FromBody] CreatePostOpCareRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var postOpCare = await _postOpCareService.CreatePostOpCareScheduleAsync(
                    request.PatientId,
                    request.SurgeryType,
                    request.SurgeryDate,
                    request.SurgeryEye,
                    request.SurgeonId,
                    userId
                );
                return CreatedAtAction(nameof(GetPostOpCareByPatient), new { patientId = request.PatientId }, 
                    new { success = true, data = postOpCare });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Complete a post-op visit
        /// </summary>
        [HttpPost("visits/{visitId}/complete")]
        [RequirePermission("postopcare.update")]
        public async Task<IActionResult> CompleteVisit(Guid visitId, [FromBody] CompleteVisitDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var visit = await _postOpCareService.CompleteVisitAsync(visitId, dto, userId);
                return Ok(new { success = true, data = visit, message = "Visit completed successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Update medication adherence
        /// </summary>
        [HttpPut("medications/{medicationId}/adherence")]
        [RequirePermission("postopcare.update")]
        public async Task<IActionResult> UpdateMedicationAdherence(Guid medicationId, [FromBody] UpdateMedicationAdherenceRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                await _postOpCareService.UpdateMedicationAdherenceAsync(medicationId, request.Adherence, userId);
                return Ok(new { success = true, message = "Medication adherence updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Counselor read-only view: completed surgeries with linked post-op care data.
        /// GET /api/post-op-care/counselor-view?branchId=&days=30
        /// </summary>
        [HttpGet("counselor-view")]
        [RequirePermission("postopcare.read")]
        public async Task<IActionResult> GetCounselorView([FromQuery] Guid? branchId, [FromQuery] int days = 30)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { success = false, message = "TenantId missing" });
            try
            {
                var result = await _postOpCareService.GetCounselorViewAsync(tenantId, branchId, days);
                return Ok(new { success = true, data = result, count = result.Count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Send post-op instructions to patient via SMS.
        /// POST /api/post-op-care/{postOpScheduleId}/send-instructions
        /// </summary>
        [HttpPost("{postOpScheduleId}/send-instructions")]
        [RequirePermission("postopcare.read")]
        public async Task<IActionResult> SendInstructions(Guid postOpScheduleId, [FromBody] SendPostOpInstructionsRequest request)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { success = false, message = "TenantId missing" });
            try
            {
                string message;
                if (!string.IsNullOrWhiteSpace(request.CustomMessage))
                    message = request.CustomMessage;
                else
                    message = await _postOpCareService.BuildInstructionsMessageAsync(postOpScheduleId, tenantId);

                // Phone number must be supplied by client (from counselor view dto)
                if (string.IsNullOrWhiteSpace(request.PatientPhone))
                    return BadRequest(new { success = false, message = "patientPhone is required" });

                var sent = await _smsService.SendSmsAsync(request.PatientPhone, message);
                if (!sent)
                    return StatusCode(502, new { success = false, message = "SMS gateway returned failure" });

                return Ok(new { success = true, message = "Instructions sent successfully", preview = message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }

    public class CreatePostOpCareRequest
    {
        public Guid PatientId { get; set; }
        public string SurgeryType { get; set; } = null!;
        public DateTime SurgeryDate { get; set; }
        public string SurgeryEye { get; set; } = null!;
        public Guid SurgeonId { get; set; }
    }

    public class UpdateMedicationAdherenceRequest
    {
        public string Adherence { get; set; } = null!;
    }
}
