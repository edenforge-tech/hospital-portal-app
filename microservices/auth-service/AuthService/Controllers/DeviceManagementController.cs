using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class DeviceManagementController : ControllerBase
    {
        private readonly IDeviceManagementService _deviceService;

        public DeviceManagementController(IDeviceManagementService deviceService)
        {
            _deviceService = deviceService;
        }

        /// <summary>
        /// Register a new device for the current user
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> RegisterDevice([FromBody] RegisterDeviceRequest request)
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

            return Ok(new { device });
        }

        /// <summary>
        /// Get all devices for the current user
        /// </summary>
        [HttpGet("my-devices")]
        public async Task<IActionResult> GetMyDevices()
        {
            var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());
            var devices = await _deviceService.GetUserDevicesAsync(userId);
            return Ok(new { devices });
        }

        /// <summary>
        /// Update device trust level (admin only)
        /// </summary>
        [HttpPut("{deviceId}/trust")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> TrustDevice(Guid deviceId, [FromBody] UpdateTrustRequest request)
        {
            var device = await _deviceService.TrustDeviceAsync(deviceId, request.TrustLevel);
            return Ok(new { device });
        }

        /// <summary>
        /// Block a device (admin only or own device)
        /// </summary>
        [HttpPost("{deviceId}/block")]
        public async Task<IActionResult> BlockDevice(Guid deviceId, [FromBody] BlockDeviceRequest request)
        {
            await _deviceService.BlockDeviceAsync(deviceId, request.Reason);
            return Ok(new { message = "Device blocked successfully" });
        }

        /// <summary>
        /// Unblock a device (admin only)
        /// </summary>
        [HttpPost("{deviceId}/unblock")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UnblockDevice(Guid deviceId)
        {
            await _deviceService.UnblockDeviceAsync(deviceId);
            return Ok(new { message = "Device unblocked successfully" });
        }

        /// <summary>
        /// Set a device as primary
        /// </summary>
        [HttpPost("{deviceId}/set-primary")]
        public async Task<IActionResult> SetPrimaryDevice(Guid deviceId)
        {
            var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());
            await _deviceService.SetPrimaryDeviceAsync(userId, deviceId);
            return Ok(new { message = "Primary device updated successfully" });
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
}
