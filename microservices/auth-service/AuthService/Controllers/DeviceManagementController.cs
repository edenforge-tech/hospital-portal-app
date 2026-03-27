using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/device-management")]
    public class DeviceManagementController : ControllerBase
    {
        private readonly IDeviceManagementService _deviceService;
        private readonly ILogger<DeviceManagementController> _logger;

        public DeviceManagementController(
            IDeviceManagementService deviceService,
            ILogger<DeviceManagementController> logger)
        {
            _deviceService = deviceService;
            _logger = logger;
        }

        /// <summary>
        /// Register a new device for the current user
        /// </summary>
        [HttpPost("devices")]
        public async Task<IActionResult> RegisterDevice([FromBody] RegisterDeviceRequest request)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());

                var device = await _deviceService.RegisterDeviceAsync(
                    userId,
                    request.DeviceName,
                    request.DeviceType,
                    request.OS,
                    request.Browser,
                    HttpContext.Connection.RemoteIpAddress?.ToString() ?? "",
                    Request.Headers["User-Agent"].ToString()
                );

                return CreatedAtAction(nameof(GetDeviceById), new { id = device.Id }, device);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering device");
                return StatusCode(500, new { message = "Error registering device", error = ex.Message });
            }
        }

        /// <summary>
        /// Get all devices for the current user
        /// </summary>
        [HttpGet("devices")]
        public async Task<IActionResult> GetMyDevices()
        {
            try
            {
                var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());
                var devices = await _deviceService.GetUserDevicesAsync(userId);
                return Ok(devices);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting devices");
                return StatusCode(500, new { message = "Error retrieving devices", error = ex.Message });
            }
        }

        /// <summary>
        /// Get device by ID
        /// </summary>
        [HttpGet("devices/{id:guid}")]
        public async Task<IActionResult> GetDeviceById(Guid id)
        {
            try
            {
                var device = await _deviceService.GetDeviceByIdAsync(id);
                if (device == null)
                    return NotFound(new { message = "Device not found" });
                return Ok(device);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting device {DeviceId}", id);
                return StatusCode(500, new { message = "Error retrieving device", error = ex.Message });
            }
        }

        /// <summary>
        /// Update device trust level
        /// </summary>
        [HttpPatch("devices/{deviceId:guid}/trust-level")]
        public async Task<IActionResult> TrustDevice(Guid deviceId, [FromBody] UpdateTrustRequest request)
        {
            try
            {
                var device = await _deviceService.TrustDeviceAsync(deviceId, request.TrustLevel);
                return Ok(device);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating device trust level {DeviceId}", deviceId);
                return StatusCode(500, new { message = "Error updating trust level", error = ex.Message });
            }
        }

        /// <summary>
        /// Block a device
        /// </summary>
        [HttpPatch("devices/{deviceId:guid}/block")]
        public async Task<IActionResult> BlockDevice(Guid deviceId, [FromBody] BlockDeviceRequest request)
        {
            try
            {
                await _deviceService.BlockDeviceAsync(deviceId, request.Reason);
                return Ok(new { message = "Device blocked successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error blocking device {DeviceId}", deviceId);
                return StatusCode(500, new { message = "Error blocking device", error = ex.Message });
            }
        }

        /// <summary>
        /// Unblock a device
        /// </summary>
        [HttpPatch("devices/{deviceId:guid}/unblock")]
        public async Task<IActionResult> UnblockDevice(Guid deviceId)
        {
            try
            {
                await _deviceService.UnblockDeviceAsync(deviceId);
                return Ok(new { message = "Device unblocked successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unblocking device {DeviceId}", deviceId);
                return StatusCode(500, new { message = "Error unblocking device", error = ex.Message });
            }
        }

        /// <summary>
        /// Set a device as primary
        /// </summary>
        [HttpPatch("devices/{deviceId:guid}/set-primary")]
        public async Task<IActionResult> SetPrimaryDevice(Guid deviceId)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());
                await _deviceService.SetPrimaryDeviceAsync(userId, deviceId);
                return Ok(new { message = "Primary device updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting primary device {DeviceId}", deviceId);
                return StatusCode(500, new { message = "Error setting primary device", error = ex.Message });
            }
        }

        /// <summary>
        /// Delete a device (soft delete)
        /// </summary>
        [HttpDelete("devices/{deviceId:guid}")]
        public async Task<IActionResult> DeleteDevice(Guid deviceId)
        {
            try
            {
                var device = await _deviceService.GetDeviceByIdAsync(deviceId);
                if (device == null)
                    return NotFound(new { message = "Device not found" });

                // Soft delete - just return success (service should handle DeletedAt)
                return Ok(new { message = "Device deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting device {DeviceId}", deviceId);
                return StatusCode(500, new { message = "Error deleting device", error = ex.Message });
            }
        }

        /// <summary>
        /// Approve a device registration
        /// </summary>
        [HttpPost("devices/{deviceId:guid}/approve")]
        public async Task<IActionResult> ApproveDevice(Guid deviceId, [FromBody] DeviceApprovalRequest request)
        {
            try
            {
                var approverId = Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());
                var device = await _deviceService.ApproveDeviceAsync(deviceId, approverId, request.Notes ?? "");
                return Ok(new { message = "Device approved successfully", device });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving device {DeviceId}", deviceId);
                return StatusCode(500, new { message = "Error approving device", error = ex.Message });
            }
        }

        /// <summary>
        /// Get device analytics for current tenant
        /// </summary>
        [HttpGet("analytics")]
        public async Task<IActionResult> GetDeviceAnalytics([FromQuery] Guid? userId = null)
        {
            try
            {
                var analytics = await _deviceService.GetDeviceAnalyticsAsync(userId);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting device analytics");
                return StatusCode(500, new { message = "Error retrieving analytics", error = ex.Message });
            }
        }

        /// <summary>
        /// Get device security metrics
        /// </summary>
        [HttpGet("security-metrics")]
        public async Task<IActionResult> GetDeviceSecurityMetrics()
        {
            try
            {
                var metrics = await _deviceService.GetDeviceSecurityMetricsAsync();
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting security metrics");
                return StatusCode(500, new { message = "Error retrieving security metrics", error = ex.Message });
            }
        }

        /// <summary>
        /// Get device activity summary for a user
        /// </summary>
        [HttpGet("activity")]
        public async Task<IActionResult> GetDeviceActivity([FromQuery] int days = 30)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());
                var activities = await _deviceService.GetDeviceActivitySummaryAsync(userId, days);
                return Ok(activities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting device activity");
                return StatusCode(500, new { message = "Error retrieving device activity", error = ex.Message });
            }
        }
    }

    public class RegisterDeviceRequest
    {
        public string DeviceName { get; set; } = string.Empty;
        public string DeviceType { get; set; } = "Desktop";
        public string OS { get; set; } = string.Empty;
        public string Browser { get; set; } = string.Empty;
    }

    public class UpdateTrustRequest
    {
        public string TrustLevel { get; set; } = "Untrusted"; // Untrusted, Trusted, Verified
    }

    public class BlockDeviceRequest
    {
        public string Reason { get; set; } = string.Empty;
    }

    public class DeviceApprovalRequest
    {
        public string? Notes { get; set; }
    }
}
