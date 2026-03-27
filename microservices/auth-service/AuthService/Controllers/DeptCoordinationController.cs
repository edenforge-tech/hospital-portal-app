using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using AuthService.Models.Counselor;
using AuthService.Services;

namespace AuthService.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/dept-coordination")]
    public class DeptCoordinationController : ControllerBase
    {
        private readonly IDeptCoordinationService _service;
        private readonly ILogger<DeptCoordinationController> _logger;

        public DeptCoordinationController(IDeptCoordinationService service, ILogger<DeptCoordinationController> logger)
        {
            _service = service;
            _logger = logger;
        }

        private Guid GetTenantId()
        {
            var claim = User.FindFirst("TenantId")?.Value;
            if (string.IsNullOrEmpty(claim) || !Guid.TryParse(claim, out var tenantId))
                throw new UnauthorizedAccessException("Tenant ID not found in token");
            return tenantId;
        }

        private Guid GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(claim) || !Guid.TryParse(claim, out var userId))
                throw new UnauthorizedAccessException("User ID not found in token");
            return userId;
        }

        private Guid? GetBranchId()
        {
            var header = Request.Headers["X-Branch-ID"].FirstOrDefault();
            return !string.IsNullOrEmpty(header) && Guid.TryParse(header, out var branchId)
                ? branchId
                : null;
        }

        /// <summary>Get all dept coordination requests for a schedule.</summary>
        [HttpGet]
        public async Task<IActionResult> GetRequests(
            [FromQuery] Guid? scheduleId = null,
            [FromQuery] Guid? sessionId = null)
        {
            try
            {
                var tenantId = GetTenantId();

                if (scheduleId.HasValue)
                {
                    var result = await _service.GetByScheduleIdAsync(scheduleId.Value, tenantId);
                    return Ok(result);
                }
                else if (sessionId.HasValue)
                {
                    var result = await _service.GetBySessionIdAsync(sessionId.Value, tenantId);
                    return Ok(result);
                }
                else
                {
                    return BadRequest(new { message = "Either scheduleId or sessionId is required" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving dept coordination requests");
                return StatusCode(500, new { message = "Error retrieving requests", error = ex.Message });
            }
        }

        /// <summary>Get status summary (one status per dept) for a schedule.</summary>
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary([FromQuery] Guid scheduleId)
        {
            try
            {
                var tenantId = GetTenantId();
                var result = await _service.GetDeptStatusSummaryAsync(scheduleId, tenantId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving dept coordination summary");
                return StatusCode(500, new { message = "Error retrieving summary", error = ex.Message });
            }
        }

        /// <summary>Get a single dept coordination request by ID.</summary>
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var result = await _service.GetByIdAsync(id, tenantId);
                if (result == null) return NotFound(new { message = "Request not found" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving dept coordination request {Id}", id);
                return StatusCode(500, new { message = "Error retrieving request", error = ex.Message });
            }
        }

        /// <summary>Create a new dept coordination request (counselor → dept).</summary>
        [HttpPost]
        public async Task<IActionResult> CreateRequest([FromBody] CreateDeptCoordinationRequestDto dto)
        {
            try
            {
                var tenantId = GetTenantId();
                var userId = GetCurrentUserId();
                var branchId = GetBranchId();

                var result = await _service.CreateRequestAsync(dto, userId, tenantId, branchId);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating dept coordination request");
                return StatusCode(500, new { message = "Error creating request", error = ex.Message });
            }
        }

        /// <summary>Respond to / update a dept coordination request (dept staff → counselor).</summary>
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> RespondToRequest(Guid id, [FromBody] UpdateDeptCoordinationRequestDto dto)
        {
            try
            {
                var tenantId = GetTenantId();
                var userId = GetCurrentUserId();

                var result = await _service.RespondToRequestAsync(id, dto, userId, tenantId);
                if (result == null) return NotFound(new { message = "Request not found" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error responding to dept coordination request {Id}", id);
                return StatusCode(500, new { message = "Error updating request", error = ex.Message });
            }
        }

        /// <summary>
        /// Auto-create dept coordination requests for ALL 9 departments when a booking is confirmed.
        /// Idempotent — existing requests for a dept are skipped.
        /// </summary>
        [HttpPost("auto-create-all")]
        public async Task<IActionResult> AutoCreateAll(
            [FromQuery] Guid scheduleId,
            [FromQuery] Guid patientId,
            [FromQuery] Guid? sessionId)
        {
            try
            {
                var tenantId = GetTenantId();
                var userId = GetCurrentUserId();
                var branchId = GetBranchId();

                var results = await _service.AutoCreateForScheduleAsync(
                    scheduleId, patientId, sessionId, tenantId, branchId, userId);

                return Ok(new { created = results.Count, requests = results });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error auto-creating dept coordination requests for schedule {ScheduleId}", scheduleId);
                return StatusCode(500, new { message = "Error auto-creating requests", error = ex.Message });
            }
        }

        /// <summary>
        /// Get step-grouped workflow status for a schedule (9 depts, 6 steps).
        /// Used by the Surgery Confirmed overview panel.
        /// </summary>
        [HttpGet("workflow-status")]
        public async Task<IActionResult> GetWorkflowStatus([FromQuery] Guid scheduleId)
        {
            try
            {
                var tenantId = GetTenantId();
                var result = await _service.GetWorkflowStatusAsync(scheduleId, tenantId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving workflow status for schedule {ScheduleId}", scheduleId);
                return StatusCode(500, new { message = "Error retrieving workflow status", error = ex.Message });
            }
        }
    }
}
