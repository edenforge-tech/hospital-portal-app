using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AuthService.Models.Counselor;
using AuthService.Services;
using AuthService.Authorization;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using OTRescheduleRequest = AuthService.Models.Counselor.RescheduleRequest;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OTBookingController : ControllerBase
    {
        private readonly IOTBookingSystemService _otBookingService;
        private readonly ILogger<OTBookingController> _logger;

        public OTBookingController(IOTBookingSystemService otBookingService, ILogger<OTBookingController> logger)
        {
            _otBookingService = otBookingService;
            _logger = logger;
        }

        private Guid GetTenantId()
        {
            var tenantIdClaim = User.FindFirst("TenantId")?.Value 
                             ?? User.FindFirst("tenant_id")?.Value;
            
            if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var tenantId))
            {
                throw new UnauthorizedAccessException("Tenant ID not found in user claims");
            }
            
            return tenantId;
        }
        
        private Guid GetCurrentUserId() => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

        #region Theater Management

        [HttpGet("theaters")]
        [RequirePermission("ot.theaters.view")]
        public async Task<ActionResult<List<OTTheaterDto>>> GetAllTheaters(
            [FromQuery] Guid? branchId = null,
            [FromQuery] string? specialization = null)
        {
            var theaters = await _otBookingService.GetAllTheatersAsync(GetTenantId(), branchId, specialization);
            return Ok(theaters);
        }

        [HttpGet("theaters/{id}")]
        [RequirePermission("ot.theaters.view")]
        public async Task<ActionResult<OTTheaterDto>> GetTheaterById(Guid id)
        {
            var theater = await _otBookingService.GetTheaterByIdAsync(id, GetTenantId());
            if (theater == null) return NotFound(new { message = "Theater not found" });
            return Ok(theater);
        }

        [HttpGet("theaters/code/{code}")]
        [RequirePermission("ot.theaters.view")]
        public async Task<ActionResult<OTTheaterDto>> GetTheaterByCode(string code)
        {
            var theater = await _otBookingService.GetTheaterByCodeAsync(code, GetTenantId());
            if (theater == null) return NotFound(new { message = "Theater not found" });
            return Ok(theater);
        }

        [HttpPost("theaters")]
        [RequirePermission("ot.theaters.create")]
        public async Task<ActionResult<OTTheaterDto>> CreateTheater([FromBody] CreateTheaterRequest request)
        {
            try
            {
                var theater = await _otBookingService.CreateTheaterAsync(request, GetTenantId(), GetCurrentUserId());
                return CreatedAtAction(nameof(GetTheaterById), new { id = theater.Id }, theater);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("theaters/{id}")]
        [RequirePermission("ot.theaters.edit")]
        public async Task<ActionResult<OTTheaterDto>> UpdateTheater(Guid id, [FromBody] UpdateTheaterRequest request)
        {
            try
            {
                var theater = await _otBookingService.UpdateTheaterAsync(id, request, GetTenantId(), GetCurrentUserId());
                return Ok(theater);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Theater not found" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("theaters/{id}")]
        [RequirePermission("ot.theaters.delete")]
        public async Task<IActionResult> DeleteTheater(Guid id)
        {
            try
            {
                await _otBookingService.DeleteTheaterAsync(id, GetTenantId(), GetCurrentUserId());
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Theater not found" });
            }
        }

        #endregion

        #region Schedule Management

        [HttpGet("schedules")]
        [RequirePermission("ot.schedules.view")]
        public async Task<ActionResult<ScheduleListResponse>> GetSchedules(
            [FromQuery] ScheduleFilters filters,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 50)
        {
            var response = await _otBookingService.GetSchedulesAsync(filters, GetTenantId(), pageNumber, pageSize);
            return Ok(response);
        }

        [HttpGet("schedules/{id}")]
        [RequirePermission("ot.schedules.view")]
        public async Task<ActionResult<OTScheduleDto>> GetScheduleById(Guid id)
        {
            var schedule = await _otBookingService.GetScheduleByIdAsync(id, GetTenantId());
            if (schedule == null) return NotFound(new { message = "Schedule not found" });
            return Ok(schedule);
        }

        [HttpGet("schedules/number/{scheduleNumber}")]
        [RequirePermission("ot.schedules.view")]
        public async Task<ActionResult<OTScheduleDto>> GetScheduleByNumber(string scheduleNumber)
        {
            var schedule = await _otBookingService.GetScheduleByNumberAsync(scheduleNumber, GetTenantId());
            if (schedule == null) return NotFound(new { message = "Schedule not found" });
            return Ok(schedule);
        }

        [HttpGet("schedules/theater/{theaterId}/date/{date}")]
        [RequirePermission("ot.schedules.view")]
        public async Task<ActionResult<List<OTScheduleDto>>> GetSchedulesByDate(Guid theaterId, DateTime date)
        {
            var schedules = await _otBookingService.GetSchedulesByDateAsync(theaterId, date, GetTenantId());
            return Ok(schedules);
        }

        [HttpGet("schedules/surgeon/{surgeonId}")]
        [RequirePermission("ot.schedules.view")]
        public async Task<ActionResult<List<OTScheduleDto>>> GetSurgeonSchedule(
            Guid surgeonId,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            var schedules = await _otBookingService.GetSurgeonScheduleAsync(surgeonId, startDate, endDate, GetTenantId());
            return Ok(schedules);
        }

        [HttpPost("schedules")]
        [RequirePermission("ot.schedules.create")]
        public async Task<ActionResult<BookingResultDto>> CreateSchedule([FromBody] CreateScheduleRequest request)
        {
            try
            {
                var result = await _otBookingService.CreateScheduleAsync(request, GetTenantId(), GetCurrentUserId());
                if (!result.Success)
                    return BadRequest(result);

                return CreatedAtAction(nameof(GetScheduleById), new { id = result.ScheduleId }, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("schedules/{id}")]
        [RequirePermission("ot.schedules.edit")]
        public async Task<ActionResult<OTScheduleDto>> UpdateSchedule(Guid id, [FromBody] UpdateScheduleRequest request)
        {
            try
            {
                var schedule = await _otBookingService.UpdateScheduleAsync(id, request, GetTenantId(), GetCurrentUserId());
                return Ok(schedule);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Schedule not found" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("schedules/{id}/confirm")]
        [RequirePermission("ot.schedules.confirm")]
        public async Task<ActionResult<BookingResultDto>> ConfirmBooking(Guid id, [FromBody] ConfirmBookingRequest request)
        {
            try
            {
                var result = await _otBookingService.ConfirmBookingAsync(id, request, GetTenantId(), GetCurrentUserId());
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Schedule not found" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("schedules/{id}/start")]
        [RequirePermission("ot.schedules.execute")]
        public async Task<ActionResult<BookingResultDto>> StartSurgery(Guid id)
        {
            try
            {
                var result = await _otBookingService.StartSurgeryAsync(id, GetTenantId(), GetCurrentUserId());
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Schedule not found" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("schedules/{id}/complete")]
        [RequirePermission("ot.schedules.execute")]
        public async Task<ActionResult<BookingResultDto>> CompleteSurgery(Guid id, [FromBody] CompleteSurgeryRequest request)
        {
            try
            {
                var result = await _otBookingService.CompleteSurgeryAsync(id, request, GetTenantId(), GetCurrentUserId());
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Schedule not found" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("schedules/{id}/cancel")]
        [RequirePermission("ot.schedules.cancel")]
        public async Task<ActionResult<BookingResultDto>> CancelSchedule(Guid id, [FromBody] CancelScheduleRequest request)
        {
            try
            {
                var result = await _otBookingService.CancelScheduleAsync(id, request, GetTenantId(), GetCurrentUserId());
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Schedule not found" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("schedules/{id}/reschedule")]
        [RequirePermission("ot.schedules.reschedule")]
        public async Task<ActionResult<BookingResultDto>> RescheduleBooking(Guid id, [FromBody] OTRescheduleRequest request)
        {
            try
            {
                var result = await _otBookingService.RescheduleBookingAsync(id, request, GetTenantId(), GetCurrentUserId());
                if (!result.Success)
                    return BadRequest(result);

                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Schedule not found" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPatch("schedules/{id}/checklist")]
        [RequirePermission("ot.schedules.edit")]
        public async Task<ActionResult<UpdateChecklistResponse>> UpdateChecklist(Guid id, [FromBody] UpdateChecklistRequest request)
        {
            try
            {
                var result = await _otBookingService.UpdateChecklistAsync(id, request, GetTenantId(), GetCurrentUserId());
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Schedule not found" });
            }
        }

        [HttpPost("schedules/{id}/no-show")]
        [RequirePermission("ot.schedules.edit")]
        public async Task<ActionResult<BookingResultDto>> RecordNoShow(Guid id, [FromBody] NoShowRequest request)
        {
            try
            {
                var result = await _otBookingService.RecordNoShowAsync(id, request, GetTenantId(), GetCurrentUserId());
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Schedule not found" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        #endregion

        #region Stock / IOL Availability

        [HttpGet("schedules/{id}/stock-availability")]
        [RequirePermission("ot.schedules.view")]
        public async Task<ActionResult<StockAvailabilityDto>> GetStockAvailability(Guid id)
        {
            try
            {
                var result = await _otBookingService.GetStockAvailabilityAsync(id, GetTenantId());
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Schedule not found" });
            }
        }

        [HttpPatch("schedules/{id}/stock-confirm")]
        [RequirePermission("ot.schedules.edit")]
        public async Task<ActionResult<StockAvailabilityDto>> ConfirmStock(Guid id, [FromBody] ConfirmStockRequest request)
        {
            try
            {
                var result = await _otBookingService.ConfirmStockAsync(id, request, GetTenantId(), GetCurrentUserId());
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Schedule not found" });
            }
        }

        #endregion

        #region Availability Checking

        [HttpGet("availability/check")]
        [RequirePermission("ot.schedules.view")]
        public async Task<ActionResult<AvailabilityCheckDto>> CheckAvailability(
            [FromQuery] Guid theaterId,
            [FromQuery] DateTime date,
            [FromQuery] string startTime,
            [FromQuery] string endTime,
            [FromQuery] Guid? excludeScheduleId = null)
        {
            if (!TimeSpan.TryParse(startTime, out var start) || !TimeSpan.TryParse(endTime, out var end))
                return BadRequest(new { message = "Invalid time format. Use HH:mm:ss" });

            var result = await _otBookingService.CheckTheaterAvailabilityAsync(theaterId, date, start, end, GetTenantId(), excludeScheduleId);
            return Ok(result);
        }

        [HttpGet("availability/surgeon/{surgeonId}")]
        [RequirePermission("ot.schedules.view")]
        public async Task<ActionResult<AvailabilityCheckDto>> CheckSurgeonAvailability(
            Guid surgeonId,
            [FromQuery] DateTime date,
            [FromQuery] string startTime,
            [FromQuery] string endTime)
        {
            if (!TimeSpan.TryParse(startTime, out var start) || !TimeSpan.TryParse(endTime, out var end))
                return BadRequest(new { message = "Invalid time format. Use HH:mm:ss" });

            var result = await _otBookingService.CheckSurgeonAvailabilityAsync(surgeonId, date, start, end, GetTenantId());
            return Ok(result);
        }

        [HttpGet("availability/slots/{theaterId}/date/{date}")]
        [RequirePermission("ot.schedules.view")]
        public async Task<ActionResult<List<TimeSlotDto>>> GetAvailableSlots(Guid theaterId, DateTime date)
        {
            try
            {
                var slots = await _otBookingService.GetAvailableSlotsAsync(theaterId, date, GetTenantId());
                return Ok(slots);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Theater not found" });
            }
        }

        #endregion

        #region Validation

        [HttpPost("validation/validate")]
        [RequirePermission("ot.validation.perform")]
        public async Task<ActionResult<BookingValidationDto>> ValidateBooking([FromBody] ValidateBookingRequest request)
        {
            try
            {
                var validation = await _otBookingService.ValidateBookingAsync(request, GetTenantId(), GetCurrentUserId());
                return Ok(validation);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Schedule not found" });
            }
        }

        [HttpGet("validation/{scheduleId}")]
        [RequirePermission("ot.validation.view")]
        public async Task<ActionResult<BookingValidationDto>> GetValidationStatus(Guid scheduleId)
        {
            var validation = await _otBookingService.GetValidationStatusAsync(scheduleId, GetTenantId());
            if (validation == null) return NotFound(new { message = "Validation not found" });
            return Ok(validation);
        }

        #endregion

        #region Equipment Management

        [HttpGet("equipment/theater/{theaterId}")]
        [RequirePermission("ot.equipment.view")]
        public async Task<ActionResult<List<EquipmentAvailabilityDto>>> GetTheaterEquipment(Guid theaterId)
        {
            var equipment = await _otBookingService.GetTheaterEquipmentAsync(theaterId, GetTenantId());
            return Ok(equipment);
        }

        [HttpPut("equipment/{equipmentId}")]
        [RequirePermission("ot.equipment.edit")]
        public async Task<ActionResult<EquipmentAvailabilityDto>> UpdateEquipmentStatus(
            Guid equipmentId,
            [FromBody] UpdateEquipmentStatusRequest request)
        {
            try
            {
                var equipment = await _otBookingService.UpdateEquipmentStatusAsync(equipmentId, request, GetTenantId(), GetCurrentUserId());
                return Ok(equipment);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Equipment not found" });
            }
        }

        #endregion

        #region Collision Management

        [HttpGet("collisions")]
        [RequirePermission("ot.collisions.view")]
        public async Task<ActionResult<List<CollisionLogDto>>> GetCollisions(
            [FromQuery] Guid? theaterId = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] bool? resolved = null)
        {
            var collisions = await _otBookingService.GetCollisionsAsync(theaterId, startDate, endDate, resolved, GetTenantId());
            return Ok(collisions);
        }

        [HttpPost("collisions/{id}/resolve")]
        [RequirePermission("ot.collisions.resolve")]
        public async Task<ActionResult<CollisionLogDto>> ResolveCollision(Guid id, [FromBody] ResolveCollisionRequest request)
        {
            try
            {
                var collision = await _otBookingService.ResolveCollisionAsync(id, request, GetTenantId());
                return Ok(collision);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Collision log not found" });
            }
        }

        #endregion
    }
}
