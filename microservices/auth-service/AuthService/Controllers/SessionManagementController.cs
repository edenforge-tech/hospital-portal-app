using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SessionManagementController : ControllerBase
    {
        private readonly ISessionManagementService _sessionService;

        public SessionManagementController(ISessionManagementService sessionService)
        {
            _sessionService = sessionService;
        }

        /// <summary>
        /// Get all active sessions for current user
        /// </summary>
        [HttpGet("active")]
        public async Task<IActionResult> GetActiveSessions()
        {
            var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());
            var sessions = await _sessionService.GetActiveSessionsAsync(userId);
            return Ok(new { sessions });
        }

        /// <summary>
        /// Get specific session details
        /// </summary>
        [HttpGet("{sessionId}")]
        public async Task<IActionResult> GetSession(Guid sessionId)
        {
            var session = await _sessionService.GetSessionByIdAsync(sessionId);
            if (session == null)
                return NotFound(new { message = "Session not found" });

            return Ok(new { session });
        }

        /// <summary>
        /// Terminate a specific session
        /// </summary>
        [HttpDelete("{sessionId}")]
        public async Task<IActionResult> TerminateSession(Guid sessionId, [FromBody] TerminateSessionRequest? request)
        {
            var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());
            await _sessionService.TerminateSessionAsync(sessionId, request?.Reason ?? "User requested", userId);
            return Ok(new { message = "Session terminated successfully" });
        }

        /// <summary>
        /// Terminate all sessions except current one
        /// </summary>
        [HttpDelete("terminate-all")]
        public async Task<IActionResult> TerminateAllSessions([FromQuery] Guid? exceptSessionId)
        {
            var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());
            var count = await _sessionService.TerminateAllSessionsAsync(userId, exceptSessionId);
            return Ok(new { message = $"{count} session(s) terminated successfully", count });
        }

        /// <summary>
        /// Cleanup expired sessions (admin only - background job)
        /// </summary>
        [HttpPost("cleanup")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CleanupExpiredSessions()
        {
            var count = await _sessionService.CleanupExpiredSessionsAsync();
            return Ok(new { message = $"{count} expired session(s) cleaned up", count });
        }

        /// <summary>
        /// Check for suspicious activity on a session
        /// </summary>
        [HttpPost("{sessionId}/check-suspicious")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CheckSuspiciousActivity(Guid sessionId, [FromBody] CheckSuspiciousRequest request)
        {
            var isSuspicious = await _sessionService.DetectSuspiciousActivityAsync(sessionId, request.CurrentIP, request.CurrentLocation);
            return Ok(new { isSuspicious, message = isSuspicious ? "Suspicious activity detected" : "No suspicious activity" });
        }
    }

    public class TerminateSessionRequest
    {
        public string Reason { get; set; } = "User requested";
    }

    public class CheckSuspiciousRequest
    {
        public string CurrentIP { get; set; } = string.Empty;
        public string CurrentLocation { get; set; } = string.Empty;
    }
}
