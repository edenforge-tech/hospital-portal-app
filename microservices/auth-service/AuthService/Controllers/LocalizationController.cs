using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class LocalizationController : ControllerBase
    {
        private readonly ILocalizationService _localizationService;

        public LocalizationController(ILocalizationService localizationService)
        {
            _localizationService = localizationService;
        }

        /// <summary>
        /// Get effective localization settings for current user
        /// </summary>
        [HttpGet("settings")]
        public async Task<IActionResult> GetSettings()
        {
            var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());
            var settings = await _localizationService.GetEffectiveLocalizationAsync(userId);
            return Ok(new { settings });
        }

        /// <summary>
        /// Convert UTC time to user's timezone
        /// </summary>
        [HttpPost("convert-to-user-timezone")]
        public async Task<IActionResult> ConvertToUserTimezone([FromBody] ConvertTimezoneRequest request)
        {
            var userId = request.UserId ?? Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());
            var localTime = await _localizationService.ConvertToUserTimezoneAsync(request.UtcTime, userId);
            return Ok(new { localTime, utcTime = request.UtcTime });
        }

        /// <summary>
        /// Convert user's local time to UTC
        /// </summary>
        [HttpPost("convert-from-user-timezone")]
        public async Task<IActionResult> ConvertFromUserTimezone([FromBody] ConvertFromTimezoneRequest request)
        {
            var userId = request.UserId ?? Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());
            var utcTime = await _localizationService.ConvertFromUserTimezoneAsync(request.LocalTime, userId);
            return Ok(new { utcTime, localTime = request.LocalTime });
        }

        /// <summary>
        /// Format currency for user
        /// </summary>
        [HttpPost("format-currency")]
        public async Task<IActionResult> FormatCurrency([FromBody] FormatCurrencyRequest request)
        {
            var userId = request.UserId ?? Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());
            var formatted = await _localizationService.FormatCurrencyAsync(request.Amount, userId);
            return Ok(new { formatted, amount = request.Amount });
        }

        /// <summary>
        /// Format date for user
        /// </summary>
        [HttpPost("format-date")]
        public async Task<IActionResult> FormatDate([FromBody] FormatDateRequest request)
        {
            var userId = request.UserId ?? Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());
            var formatted = await _localizationService.FormatDateAsync(request.Date, userId);
            return Ok(new { formatted, date = request.Date });
        }

        /// <summary>
        /// Format time for user
        /// </summary>
        [HttpPost("format-time")]
        public async Task<IActionResult> FormatTime([FromBody] FormatTimeRequest request)
        {
            var userId = request.UserId ?? Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());
            var formatted = await _localizationService.FormatTimeAsync(request.Time, userId);
            return Ok(new { formatted, time = request.Time });
        }

        /// <summary>
        /// Format number for user
        /// </summary>
        [HttpPost("format-number")]
        public async Task<IActionResult> FormatNumber([FromBody] FormatNumberRequest request)
        {
            var userId = request.UserId ?? Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());
            var formatted = await _localizationService.FormatNumberAsync(request.Number, userId);
            return Ok(new { formatted, number = request.Number });
        }

        /// <summary>
        /// Get organization localization settings (admin only)
        /// </summary>
        [HttpGet("organization/{organizationId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetOrganizationSettings(Guid organizationId)
        {
            var settings = await _localizationService.GetOrganizationLocalizationAsync(organizationId);
            return Ok(new { settings });
        }

        /// <summary>
        /// Get branch localization settings
        /// </summary>
        [HttpGet("branch/{branchId}")]
        public async Task<IActionResult> GetBranchSettings(Guid branchId)
        {
            var settings = await _localizationService.GetBranchLocalizationAsync(branchId);
            return Ok(new { settings });
        }

        /// <summary>
        /// Get user's personal localization preferences
        /// </summary>
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserSettings(Guid userId)
        {
            var currentUserId = Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());
            var isAdmin = User.IsInRole("Admin");

            // Users can only view their own settings unless they're an admin
            if (userId != currentUserId && !isAdmin)
                return Forbid();

            var settings = await _localizationService.GetUserLocalizationAsync(userId);
            return Ok(new { settings });
        }
    }

    public class ConvertTimezoneRequest
    {
        public DateTime UtcTime { get; set; }
        public Guid? UserId { get; set; }
    }

    public class ConvertFromTimezoneRequest
    {
        public DateTime LocalTime { get; set; }
        public Guid? UserId { get; set; }
    }

    public class FormatCurrencyRequest
    {
        public decimal Amount { get; set; }
        public Guid? UserId { get; set; }
    }

    public class FormatDateRequest
    {
        public DateTime Date { get; set; }
        public Guid? UserId { get; set; }
    }

    public class FormatTimeRequest
    {
        public DateTime Time { get; set; }
        public Guid? UserId { get; set; }
    }

    public class FormatNumberRequest
    {
        public decimal Number { get; set; }
        public Guid? UserId { get; set; }
    }
}
