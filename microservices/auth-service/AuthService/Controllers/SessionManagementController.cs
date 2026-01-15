using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/session-management")]
    public class SessionManagementController : ControllerBase
    {
        private readonly ISessionManagementService _sessionService;
        private readonly ILogger<SessionManagementController> _logger;

        public SessionManagementController(
            ISessionManagementService sessionService,
            ILogger<SessionManagementController> logger)
        {
            _sessionService = sessionService;
            _logger = logger;
        }

        /// <summary>
        /// Get all active sessions for current user
        /// </summary>
        [HttpGet("sessions")]
        public async Task<IActionResult> GetActiveSessions()
        {
            try
            {
                var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());
                var sessions = await _sessionService.GetActiveSessionsAsync(userId);
                return Ok(sessions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active sessions");
                return StatusCode(500, new { message = "Error retrieving sessions", error = ex.Message });
            }
        }

        /// <summary>
        /// Get specific session details
        /// </summary>
        [HttpGet("sessions/{sessionId:guid}")]
        public async Task<IActionResult> GetSession(Guid sessionId)
        {
            try
            {
                var session = await _sessionService.GetSessionByIdAsync(sessionId);
                if (session == null)
                    return NotFound(new { message = "Session not found" });

                return Ok(session);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting session {SessionId}", sessionId);
                return StatusCode(500, new { message = "Error retrieving session", error = ex.Message });
            }
        }

        /// <summary>
        /// Terminate a specific session
        /// </summary>
        [HttpPost("sessions/{sessionId:guid}/terminate")]
        public async Task<IActionResult> TerminateSession(Guid sessionId, [FromBody] TerminateSessionRequest? request)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());
                await _sessionService.TerminateSessionAsync(sessionId, request?.Reason ?? "User requested", userId);
                return Ok(new { message = "Session terminated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error terminating session {SessionId}", sessionId);
                return StatusCode(500, new { message = "Error terminating session", error = ex.Message });
            }
        }

        /// <summary>
        /// Terminate all sessions except current one
        /// </summary>
        [HttpPost("sessions/terminate-all-except-current")]
        public async Task<IActionResult> TerminateAllSessions([FromBody] TerminateAllSessionsRequest? request)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());
                var count = await _sessionService.TerminateAllSessionsAsync(userId, request?.ExceptSessionId);
                return Ok(new { message = $"{count} session(s) terminated successfully", count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error terminating all sessions");
                return StatusCode(500, new { message = "Error terminating sessions", error = ex.Message });
            }
        }

        /// <summary>
        /// Get active session count for the current user
        /// </summary>
        [HttpGet("sessions/active-count")]
        public async Task<IActionResult> GetActiveSessionCount()
        {
            try
            {
                var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());
                var sessions = await _sessionService.GetActiveSessionsAsync(userId);
                var activeCount = sessions.Count(s => s.IsActive);
                return Ok(new { activeCount, totalCount = sessions.Count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting session count");
                return StatusCode(500, new { message = "Error getting session count", error = ex.Message });
            }
        }

        /// <summary>
        /// Cleanup expired sessions (admin only - background job)
        /// </summary>
        [HttpPost("sessions/cleanup")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CleanupExpiredSessions()
        {
            try
            {
                var count = await _sessionService.CleanupExpiredSessionsAsync();
                return Ok(new { message = $"{count} expired session(s) cleaned up", count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning up expired sessions");
                return StatusCode(500, new { message = "Error cleaning up sessions", error = ex.Message });
            }
        }

        /// <summary>
        /// Mark a session as suspicious
        /// </summary>
        [HttpPost("sessions/{sessionId:guid}/mark-suspicious")]
        public async Task<IActionResult> MarkSessionSuspicious(Guid sessionId, [FromBody] MarkSuspiciousRequest request)
        {
            try
            {
                await _sessionService.MarkSessionSuspiciousAsync(sessionId, request.Reason);
                return Ok(new { message = "Session marked as suspicious successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking session as suspicious {SessionId}", sessionId);
                return StatusCode(500, new { message = "Error marking session as suspicious", error = ex.Message });
            }
        }

        /// <summary>
        /// Check for suspicious activity on a session
        /// </summary>
        [HttpPost("sessions/{sessionId:guid}/check-suspicious")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CheckSuspiciousActivity(Guid sessionId, [FromBody] CheckSuspiciousRequest request)
        {
            try
            {
                var isSuspicious = await _sessionService.DetectSuspiciousActivityAsync(sessionId, request.CurrentIP, request.CurrentLocation);
                return Ok(new { isSuspicious, message = isSuspicious ? "Suspicious activity detected" : "No suspicious activity" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking suspicious activity for session {SessionId}", sessionId);
                return StatusCode(500, new { message = "Error checking suspicious activity", error = ex.Message });
            }
        }
    }

    public class TerminateAllSessionsRequest
    {
        public Guid? ExceptSessionId { get; set; }
    }

    public class MarkSuspiciousRequest
    {
        public string Reason { get; set; } = "Marked as suspicious";
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
