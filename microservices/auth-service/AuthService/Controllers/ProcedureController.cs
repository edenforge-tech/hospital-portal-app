using AuthService.Authorization;
using AuthService.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProcedureController : ControllerBase
    {
        private readonly IProcedureService _procedureService;
        private readonly ILogger<ProcedureController> _logger;

        public ProcedureController(IProcedureService procedureService, ILogger<ProcedureController> logger)
        {
            _procedureService = procedureService;
            _logger = logger;
        }

        /// <summary>
        /// Search procedure pricing catalog
        /// </summary>
        [HttpGet("pricing")]
        [RequirePermission("procedures.view")]
        public async Task<IActionResult> SearchProcedurePricing([FromQuery] string? search)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirstValue("TenantId") ?? throw new Exception("Tenant ID not found"));
                var procedures = await _procedureService.SearchProcedurePricingAsync(tenantId, search);

                return Ok(new
                {
                    success = true,
                    data = procedures,
                    count = procedures.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching procedure pricing");
                return StatusCode(500, new { success = false, message = "Error searching procedure pricing" });
            }
        }

        /// <summary>
        /// Get OT availability for a specific date and surgeon
        /// </summary>
        [HttpGet("ot/availability")]
        [RequirePermission("appointments.view")]
        public async Task<IActionResult> GetOTAvailability(
            [FromQuery] Guid branchId,
            [FromQuery] Guid? surgeonId,
            [FromQuery] DateTime? date)
        {
            try
            {
                var availability = await _procedureService.GetOTAvailabilityAsync(branchId, surgeonId, date);

                return Ok(new
                {
                    success = true,
                    date = (date?.Date ?? DateTime.UtcNow.Date).ToString("yyyy-MM-dd"),
                    data = availability
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching OT availability");
                return StatusCode(500, new { success = false, message = "Error fetching OT availability" });
            }
        }

        /// <summary>
        /// Send quick note to counselor for surgery scheduling
        /// </summary>
        [HttpPost("surgery/quick-note")]
        [RequirePermission("appointments.create")]
        public async Task<IActionResult> CreateQuickNote([FromBody] QuickNoteRequest request)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirstValue("TenantId") ?? throw new Exception("Tenant ID not found"));
                var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new Exception("User ID not found"));

                if (string.IsNullOrWhiteSpace(request.PatientName))
                    return BadRequest(new { success = false, message = "Patient name is required" });

                if (string.IsNullOrWhiteSpace(request.PatientMobile))
                    return BadRequest(new { success = false, message = "Patient mobile is required" });

                var result = await _procedureService.CreateQuickNoteAsync(
                    tenantId,
                    request.BranchId,
                    request.PatientName,
                    request.PatientMobile,
                    request.ProcedureType ?? "General Surgery",
                    request.Notes ?? "",
                    userId
                );

                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating quick note");
                return StatusCode(500, new { success = false, message = "Error creating quick note" });
            }
        }

        /// <summary>
        /// Send direct request to surgeon for surgery appointment
        /// </summary>
        [HttpPost("surgery/direct-request")]
        [RequirePermission("appointments.create")]
        public async Task<IActionResult> CreateDirectRequest([FromBody] DirectRequestRequest request)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirstValue("TenantId") ?? throw new Exception("Tenant ID not found"));
                var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new Exception("User ID not found"));

                if (string.IsNullOrWhiteSpace(request.PatientName))
                    return BadRequest(new { success = false, message = "Patient name is required" });

                if (string.IsNullOrWhiteSpace(request.PatientMobile))
                    return BadRequest(new { success = false, message = "Patient mobile is required" });

                if (request.SurgeonId == Guid.Empty)
                    return BadRequest(new { success = false, message = "Surgeon selection is required" });

                var result = await _procedureService.CreateDirectRequestAsync(
                    tenantId,
                    request.BranchId,
                    request.SurgeonId,
                    request.PatientName,
                    request.PatientMobile,
                    request.ProcedureType ?? "General Surgery",
                    request.Urgency ?? "routine",
                    request.PreferredDate,
                    userId
                );

                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating direct request");
                return StatusCode(500, new { success = false, message = "Error creating direct request" });
            }
        }
    }

    public class QuickNoteRequest
    {
        public Guid BranchId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string PatientMobile { get; set; } = string.Empty;
        public string? ProcedureType { get; set; }
        public string? Notes { get; set; }
    }

    public class DirectRequestRequest
    {
        public Guid BranchId { get; set; }
        public Guid SurgeonId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string PatientMobile { get; set; } = string.Empty;
        public string? ProcedureType { get; set; }
        public string? Urgency { get; set; }
        public DateTime? PreferredDate { get; set; }
    }
}
