using AuthService.Context;
using AuthService.DTOs;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SurgeryController : ControllerBase
    {
        private readonly ISurgeryService _surgeryService;
        private readonly AppDbContext _context;
        private readonly ILogger<SurgeryController> _logger;

        public SurgeryController(ISurgeryService surgeryService, AppDbContext context, ILogger<SurgeryController> logger)
        {
            _surgeryService = surgeryService;
            _context = context;
            _logger = logger;
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return userIdClaim != null ? Guid.Parse(userIdClaim) : Guid.Empty;
        }

        private Guid GetTenantId()
        {
            var tenantIdClaim = User.FindFirst("TenantId")?.Value;
            return tenantIdClaim != null ? Guid.Parse(tenantIdClaim) : Guid.Empty;
        }

        private Guid GetBranchId()
        {
            var branchIdClaim = User.FindFirst("BranchId")?.Value;
            return branchIdClaim != null ? Guid.Parse(branchIdClaim) : Guid.Empty;
        }

        /// <summary>
        /// Create a surgery recommendation for a patient
        /// </summary>
        /// <remarks>
        /// Creates a comprehensive surgery recommendation including:
        /// - Surgery type and procedure selection
        /// - Package selection (Standard/Premium/Custom)
        /// - IOL power calculation (for cataract surgeries)
        /// - Pre-operative checklist generation
        /// - Counselor referral notification
        /// </remarks>
        [HttpPost("recommend")]
        public async Task<IActionResult> CreateRecommendation([FromBody] SurgeryRecommendationDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var tenantId = GetTenantId();
                var branchId = GetBranchId();

                if (userId == Guid.Empty || tenantId == Guid.Empty)
                {
                    return Unauthorized(new { message = "Invalid user or tenant context" });
                }

                var result = await _surgeryService.CreateSurgeryRecommendationAsync(dto, userId, tenantId, branchId);

                _logger.LogInformation(
                    "Surgery recommendation created: {SurgeryId} for patient {PatientId} by doctor {DoctorId}",
                    result.Id, dto.PatientId, userId);

                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating surgery recommendation for patient {PatientId}", dto.PatientId);
                return StatusCode(500, new { message = "Error creating surgery recommendation", error = ex.Message });
            }
        }

        /// <summary>
        /// Calculate IOL power using multiple formulas
        /// </summary>
        /// <remarks>
        /// Calculates IOL power using:
        /// - SRK/T
        /// - Barrett Universal II (recommended)
        /// - Haigis
        /// - Holladay 1
        /// - Hoffer Q (for short eyes)
        /// 
        /// Returns calculated powers for each formula with warnings for extreme axial lengths.
        /// </remarks>
        [HttpPost("calculate-iol")]
        public async Task<IActionResult> CalculateIOLPower([FromBody] IOLCalculationDto dto)
        {
            try
            {
                var result = await _surgeryService.CalculateIOLPowerAsync(dto);

                _logger.LogInformation(
                    "IOL power calculated for patient {PatientId}, eye {Eye}, AL: {AxialLength}mm",
                    dto.PatientId, dto.Eye, dto.AxialLength);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating IOL power for patient {PatientId}", dto.PatientId);
                return StatusCode(500, new { message = "Error calculating IOL power", error = ex.Message });
            }
        }

        /// <summary>
        /// Generate pre-operative checklist based on surgery type and patient factors
        /// </summary>
        /// <remarks>
        /// Generates a comprehensive checklist including:
        /// - Standard investigations for surgery type
        /// - Patient-specific additions (age, diabetes, hypertension, anticoagulants)
        /// - Custom items provided by doctor
        /// 
        /// Checklist items are automatically added to patient's investigation orders.
        /// </remarks>
        [HttpPost("generate-preop-checklist")]
        public async Task<IActionResult> GeneratePreOpChecklist([FromBody] PreOpChecklistDto dto)
        {
            try
            {
                var checklist = await _surgeryService.GeneratePreOpChecklistAsync(dto);

                _logger.LogInformation(
                    "Pre-op checklist generated for {SurgeryType} surgery with {ItemCount} items",
                    dto.SurgeryType, checklist.Count);

                return Ok(new { checklist, totalItems = checklist.Count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating pre-op checklist for {SurgeryType}", dto.SurgeryType);
                return StatusCode(500, new { message = "Error generating pre-op checklist", error = ex.Message });
            }
        }

        /// <summary>
        /// Refer surgery request to counselor
        /// </summary>
        /// <remarks>
        /// Creates a referral to the counselor for:
        /// - Package discussion and pricing
        /// - Payment options and insurance coordination
        /// - Surgery scheduling
        /// - Pre-operative education
        /// 
        /// Priority referrals are flagged for immediate attention.
        /// </remarks>
        [HttpPost("refer-to-counselor")]
        public async Task<IActionResult> ReferToCounselor([FromBody] CounselorReferralDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _surgeryService.ReferToCounselorAsync(dto, userId);

                if (!result)
                {
                    return NotFound(new { message = "Surgery request not found" });
                }

                _logger.LogInformation(
                    "Surgery request {SurgeryRequestId} referred to counselor by user {UserId}",
                    dto.SurgeryRequestId, userId);

                return Ok(new { message = "Successfully referred to counselor", isPriority = dto.IsPriorityReferral });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error referring surgery request {SurgeryRequestId} to counselor", dto.SurgeryRequestId);
                return StatusCode(500, new { message = "Error referring to counselor", error = ex.Message });
            }
        }

        /// <summary>
        /// Get surgery request by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var request = await _surgeryService.GetByIdAsync(id);

                if (request == null)
                {
                    return NotFound(new { message = "Surgery request not found" });
                }

                return Ok(request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving surgery request {SurgeryRequestId}", id);
                return StatusCode(500, new { message = "Error retrieving surgery request", error = ex.Message });
            }
        }

        /// <summary>
        /// Get all surgery requests for a patient
        /// </summary>
        [HttpGet("patient/{patientId}")]
        public async Task<IActionResult> GetByPatient(Guid patientId)
        {
            try
            {
                var requests = await _surgeryService.GetByPatientAsync(patientId);
                return Ok(new { data = requests, total = requests.Count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving surgery requests for patient {PatientId}", patientId);
                return StatusCode(500, new { message = "Error retrieving surgery requests", error = ex.Message });
            }
        }

        /// <summary>
        /// Update surgery request status
        /// </summary>
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _surgeryService.UpdateStatusAsync(id, dto.Status, userId);

                if (!result)
                {
                    return NotFound(new { message = "Surgery request not found" });
                }

                _logger.LogInformation(
                    "Surgery request {SurgeryRequestId} status updated to {Status} by user {UserId}",
                    id, dto.Status, userId);

                return Ok(new { message = "Status updated successfully", status = dto.Status });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating status for surgery request {SurgeryRequestId}", id);
                return StatusCode(500, new { message = "Error updating status", error = ex.Message });
            }
        }

        // ── GET /api/surgery/ga-availability ─────────────────────────────────
        // Returns whether a GA-trained anesthesiologist is available for a given
        // branch + date, and lists all booked OT schedules that day.
        // Step 4 (AnaesthesiaType widget) calls this to decide if GA is feasible.

        [HttpGet("ga-availability")]
        public async Task<IActionResult> GetGaAvailability(
            [FromQuery] Guid branchId,
            [FromQuery] string date)
        {
            try
            {
                var tenantId = GetTenantId();

                if (!DateOnly.TryParse(date, out var surgeryDate))
                    return BadRequest(new { message = "Invalid date format. Use YYYY-MM-DD." });

                var from = surgeryDate.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
                var to   = surgeryDate.ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc);

                // Count all confirmed/booked OT schedules for that branch/date
                var totalSchedulesOnDate = await _context.OTSchedules
                    .Where(s => s.TenantId == tenantId
                             && s.BranchId == branchId
                             && s.ScheduledDate >= from
                             && s.ScheduledDate <= to
                             && s.DeletedAt == null
                             && (s.Status == "Confirmed" || s.Status == "Booked" || s.Status == "InProgress"))
                    .CountAsync();

                // Heuristic: assume GA is available if there are fewer than 8 concurrent GA cases
                // In a real setup, query an anesthesiologist availability table.
                // Using 8 as the ceiling for a single-OT eye hospital.
                const int gaCapacityPerDay = 8;
                var gaAvailable = totalSchedulesOnDate < gaCapacityPerDay;

                return Ok(new
                {
                    branchId,
                    date = surgeryDate.ToString("yyyy-MM-dd"),
                    gaAvailable,
                    totalSchedulesOnDate,
                    gaCapacityPerDay,
                    note = gaAvailable
                        ? "GA available for this date"
                        : "GA capacity reached — consider rescheduling or Topical alternative",
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking GA availability for branch {BranchId}", branchId);
                return StatusCode(500, new { message = "Error checking GA availability", error = ex.Message });
            }
        }
    }

    /// <summary>
    /// DTO for status update
    /// </summary>
    public class UpdateStatusDto
    {
        public string Status { get; set; } = string.Empty; // pending, approved, scheduled, completed, cancelled
    }
}
