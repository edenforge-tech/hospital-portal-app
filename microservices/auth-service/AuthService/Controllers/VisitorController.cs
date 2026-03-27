using AuthService.Authorization;
using AuthService.Models.Domain;
using AuthService.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class VisitorController : ControllerBase
    {
        private readonly IVisitorService _visitorService;
        private readonly ILogger<VisitorController> _logger;

        public VisitorController(IVisitorService visitorService, ILogger<VisitorController> logger)
        {
            _visitorService = visitorService;
            _logger = logger;
        }

        /// <summary>
        /// Get all active visitors for a branch
        /// </summary>
        [HttpGet("active")]
        [RequirePermission("visitor_management.view")]
        public async Task<IActionResult> GetActiveVisitors([FromQuery] Guid branchId)
        {
            try
            {
                var visitors = await _visitorService.GetActiveVisitorsAsync(branchId);
                return Ok(new
                {
                    success = true,
                    data = visitors.Select(v => new
                    {
                        v.Id,
                        v.VisitorName,
                        v.MobileNumber,
                        v.PatientName,
                        RoomNumber = v.PatientRoomNumber,
                        v.Purpose,
                        v.PassNumber,
                        CheckInTime = v.CheckInTime.ToString("yyyy-MM-dd HH:mm:ss"),
                        Duration = (DateTime.UtcNow - v.CheckInTime).TotalMinutes,
                        v.Status
                    }).ToList(),
                    count = visitors.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching active visitors for branch {BranchId}", branchId);
                return StatusCode(500, new { success = false, message = "Error fetching active visitors" });
            }
        }

        /// <summary>
        /// Check in a new visitor
        /// </summary>
        [HttpPost("check-in")]
        [RequirePermission("visitor_management.create")]
        public async Task<IActionResult> CheckInVisitor([FromBody] VisitorLog visitorLog)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(visitorLog.VisitorName))
                    return BadRequest(new { success = false, message = "Visitor name is required" });

                if (string.IsNullOrWhiteSpace(visitorLog.MobileNumber))
                    return BadRequest(new { success = false, message = "Mobile number is required" });

                var result = await _visitorService.CheckInVisitorAsync(visitorLog);
                
                return Ok(new
                {
                    success = true,
                    message = "Visitor checked in successfully",
                    data = new
                    {
                        result.Id,
                        result.VisitorName,
                        result.MobileNumber,
                        result.PatientName,
                        RoomNumber = result.PatientRoomNumber,
                        result.Purpose,
                        result.PassNumber,
                        CheckInTime = result.CheckInTime.ToString("yyyy-MM-dd HH:mm:ss")
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking in visitor");
                return StatusCode(500, new { success = false, message = "Error checking in visitor" });
            }
        }

        /// <summary>
        /// Check out a visitor
        /// </summary>
        [HttpPost("{id}/check-out")]
        [RequirePermission("visitor_management.update")]
        public async Task<IActionResult> CheckOutVisitor(Guid id)
        {
            try
            {
                var result = await _visitorService.CheckOutVisitorAsync(id);
                if (result == null)
                    return NotFound(new { success = false, message = "Visitor not found or already checked out" });

                return Ok(new
                {
                    success = true,
                    message = "Visitor checked out successfully",
                    data = new
                    {
                        result.Id,
                        result.VisitorName,
                        result.PassNumber,
                        CheckInTime = result.CheckInTime.ToString("yyyy-MM-dd HH:mm:ss"),
                        CheckOutTime = result.CheckOutTime?.ToString("yyyy-MM-dd HH:mm:ss"),
                        Duration = result.CheckOutTime.HasValue 
                            ? (result.CheckOutTime.Value - result.CheckInTime).TotalMinutes 
                            : 0
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking out visitor {VisitorId}", id);
                return StatusCode(500, new { success = false, message = "Error checking out visitor" });
            }
        }
    }
}
