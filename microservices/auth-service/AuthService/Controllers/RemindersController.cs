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
    public class RemindersController : ControllerBase
    {
        private readonly IReminderService _reminderService;

        public RemindersController(IReminderService reminderService)
        {
            _reminderService = reminderService;
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null ? Guid.Parse(userIdClaim.Value) : Guid.Empty;
        }

        /// <summary>
        /// Get reminders with optional filters
        /// </summary>
        [HttpGet]
        [RequirePermission("reminder.read")]
        public async Task<IActionResult> GetReminders([FromQuery] ReminderFiltersDto filters)
        {
            try
            {
                var reminders = await _reminderService.GetRemindersAsync(filters);
                return Ok(new { success = true, data = reminders, count = reminders.Count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Create new reminder
        /// </summary>
        [HttpPost]
        [RequirePermission("reminder.create")]
        public async Task<IActionResult> CreateReminder([FromBody] CreateReminderDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var reminder = await _reminderService.CreateReminderAsync(dto, userId);
                return CreatedAtAction(nameof(GetReminders), new { }, new { success = true, data = reminder });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Send reminder via specified channels (SMS, Email, Phone)
        /// </summary>
        [HttpPost("{id}/send")]
        [RequirePermission("reminder.send")]
        public async Task<IActionResult> SendReminder(Guid id, [FromBody] SendPatientReminderRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var reminder = await _reminderService.SendReminderAsync(id, request.Channels, userId);
                return Ok(new { success = true, data = reminder, message = "Reminder sent successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Mark reminder as acknowledged by patient
        /// </summary>
        [HttpPut("{id}/acknowledge")]
        [AllowAnonymous] // Patients can acknowledge via public link
        public async Task<IActionResult> AcknowledgeReminder(Guid id)
        {
            try
            {
                var reminder = await _reminderService.AcknowledgeReminderAsync(id);
                return Ok(new { success = true, data = reminder, message = "Reminder acknowledged" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Process scheduled reminders (Background job endpoint)
        /// </summary>
        [HttpPost("process-scheduled")]
        [RequirePermission("reminder.admin")]
        public async Task<IActionResult> ProcessScheduledReminders()
        {
            try
            {
                var processed = await _reminderService.ProcessScheduledRemindersAsync();
                return Ok(new { success = true, processed, message = $"{processed} reminders processed successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }

    public class SendPatientReminderRequest
    {
        public System.Collections.Generic.List<string> Channels { get; set; } = new();
    }
}
