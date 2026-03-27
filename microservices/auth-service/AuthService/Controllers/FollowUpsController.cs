using System;
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
    [Route("api/[controller]")]
    [Authorize]
    public class FollowUpsController : ControllerBase
    {
        private readonly IFollowUpService _followUpService;

        public FollowUpsController(IFollowUpService followUpService)
        {
            _followUpService = followUpService;
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null ? Guid.Parse(userIdClaim.Value) : Guid.Empty;
        }

        /// <summary>
        /// Get follow-up appointments with optional filters
        /// </summary>
        [HttpGet]
        [RequirePermission("followup.read")]
        public async Task<IActionResult> GetFollowUps([FromQuery] FollowUpFiltersDto filters)
        {
            try
            {
                var followUps = await _followUpService.GetFollowUpsAsync(filters);
                return Ok(new { success = true, data = followUps, count = followUps.Count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Get single follow-up appointment by ID
        /// </summary>
        [HttpGet("{id}")]
        [RequirePermission("followup.read")]
        public async Task<IActionResult> GetFollowUpById(Guid id)
        {
            try
            {
                var followUp = await _followUpService.GetFollowUpByIdAsync(id);
                if (followUp == null)
                    return NotFound(new { success = false, message = "Follow-up not found" });

                return Ok(new { success = true, data = followUp });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Create new follow-up appointment
        /// </summary>
        [HttpPost]
        [RequirePermission("followup.create")]
        public async Task<IActionResult> CreateFollowUp([FromBody] CreateFollowUpDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var followUp = await _followUpService.CreateFollowUpAsync(dto, userId);
                return CreatedAtAction(nameof(GetFollowUpById), new { id = followUp.Id }, new { success = true, data = followUp });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Update follow-up appointment
        /// </summary>
        [HttpPut("{id}")]
        [RequirePermission("followup.update")]
        public async Task<IActionResult> UpdateFollowUp(Guid id, [FromBody] UpdateFollowUpDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var followUp = await _followUpService.UpdateFollowUpAsync(id, dto, userId);
                return Ok(new { success = true, data = followUp, message = "Follow-up updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Mark follow-up appointment as completed
        /// </summary>
        [HttpPost("{id}/complete")]
        [RequirePermission("followup.update")]
        public async Task<IActionResult> CompleteFollowUp(Guid id, [FromBody] CompleteFollowUpRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var followUp = await _followUpService.CompleteFollowUpAsync(id, request.Outcome ?? "", userId);
                return Ok(new { success = true, data = followUp, message = "Follow-up completed successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Reschedule follow-up appointment
        /// </summary>
        [HttpPost("{id}/reschedule")]
        [RequirePermission("followup.update")]
        public async Task<IActionResult> RescheduleFollowUp(Guid id, [FromBody] RescheduleRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var followUp = await _followUpService.RescheduleFollowUpAsync(id, request.NewDate, request.NewTime, userId);
                return Ok(new { success = true, data = followUp, message = "Follow-up rescheduled successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Delete (soft delete) follow-up appointment
        /// </summary>
        [HttpDelete("{id}")]
        [RequirePermission("followup.delete")]
        public async Task<IActionResult> DeleteFollowUp(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var success = await _followUpService.DeleteFollowUpAsync(id, userId);
                if (!success)
                    return NotFound(new { success = false, message = "Follow-up not found" });

                return Ok(new { success = true, message = "Follow-up deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }

    public class CompleteFollowUpRequest
    {
        public string? Outcome { get; set; }
    }

    public class RescheduleRequest
    {
        public DateTime NewDate { get; set; }
        public string? NewTime { get; set; }
    }
}
