using AuthService.Authorization.Policies;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class EmergencyAccessController : ControllerBase
    {
        private readonly IEmergencyAccessService _emergencyService;

        public EmergencyAccessController(IEmergencyAccessService emergencyService)
        {
            _emergencyService = emergencyService;
        }

        /// <summary>
        /// Request emergency access
        /// </summary>
        [HttpPost("request")]
        public async Task<IActionResult> RequestEmergencyAccess([FromBody] EmergencyAccessRequest request)
        {
            var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());

            var emergencyAccess = await _emergencyService.RequestEmergencyAccessAsync(
                userId,
                request.Reason,
                request.EmergencyType,
                request.PatientId,
                request.DurationMinutes,
                request.GrantedPermissions
            );

            return Ok(new { emergencyAccess });
        }

        /// <summary>
        /// Get active emergency access for current user
        /// </summary>
        [HttpGet("active")]
        public async Task<IActionResult> GetActiveEmergencyAccess()
        {
            var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());
            var activeAccess = await _emergencyService.GetActiveEmergencyAccessAsync(userId);
            return Ok(new { activeAccess });
        }

        /// <summary>
        /// Get pending emergency access approvals (supervisor/admin only)
        /// </summary>
        [HttpGet("pending")]
        [Authorize(Roles = "Admin,Supervisor")]
        public async Task<IActionResult> GetPendingApprovals()
        {
            var approverId = Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());
            var pendingApprovals = await _emergencyService.GetPendingApprovalsAsync(approverId);
            return Ok(new { pendingApprovals });
        }

        /// <summary>
        /// Approve emergency access request (supervisor/admin only)
        /// </summary>
        [HttpPost("{requestId}/approve")]
        [Authorize(Roles = "Admin,Supervisor")]
        public async Task<IActionResult> ApproveEmergencyAccess(Guid requestId, [FromBody] ApprovalRequest request)
        {
            var approverId = Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());
            var emergencyAccess = await _emergencyService.ApproveEmergencyAccessAsync(requestId, approverId, request.Notes);
            return Ok(new { emergencyAccess, message = "Emergency access approved" });
        }

        /// <summary>
        /// Reject emergency access request (supervisor/admin only)
        /// </summary>
        [HttpPost("{requestId}/reject")]
        [Authorize(Roles = "Admin,Supervisor")]
        public async Task<IActionResult> RejectEmergencyAccess(Guid requestId, [FromBody] RejectionRequest request)
        {
            var rejectorId = Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());
            var emergencyAccess = await _emergencyService.RejectEmergencyAccessAsync(requestId, rejectorId, request.Reason);
            return Ok(new { emergencyAccess, message = "Emergency access rejected" });
        }

        /// <summary>
        /// Revoke active emergency access (admin only)
        /// </summary>
        [HttpPost("{requestId}/revoke")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RevokeEmergencyAccess(Guid requestId, [FromBody] RevocationRequest request)
        {
            var revokerId = Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());
            await _emergencyService.RevokeEmergencyAccessAsync(requestId, revokerId, request.Reason);
            return Ok(new { message = "Emergency access revoked" });
        }

        /// <summary>
        /// Review emergency access after usage (supervisor/compliance officer)
        /// </summary>
        [HttpPost("{accessId}/review")]
        [Authorize(Roles = "Admin,Supervisor,ComplianceOfficer")]
        public async Task<IActionResult> ReviewEmergencyAccess(Guid accessId, [FromBody] ReviewRequest request)
        {
            var reviewerId = Guid.Parse(User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException());
            var emergencyAccess = await _emergencyService.ReviewEmergencyAccessAsync(accessId, reviewerId, request.Status, request.Notes);
            return Ok(new { emergencyAccess, message = "Emergency access reviewed" });
        }

        /// <summary>
        /// Auto-revoke expired emergency access (background job - admin only)
        /// </summary>
        [HttpPost("auto-revoke")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AutoRevokeExpired()
        {
            var count = await _emergencyService.AutoRevokeExpiredAsync();
            return Ok(new { message = $"{count} expired emergency access(es) auto-revoked", count });
        }
    }

    public class EmergencyAccessRequest
    {
        public string Reason { get; set; } = string.Empty;
        public string EmergencyType { get; set; } = "Medical";
        public Guid? PatientId { get; set; }
        public int DurationMinutes { get; set; } = 60;
        public List<string> GrantedPermissions { get; set; } = new();
    }

    public class ApprovalRequest
    {
        public string Notes { get; set; } = string.Empty;
    }

    public class RejectionRequest
    {
        public string Reason { get; set; } = string.Empty;
    }

    public class RevocationRequest
    {
        public string Reason { get; set; } = string.Empty;
    }

    public class ReviewRequest
    {
        public string Status { get; set; } = "approved"; // approved, flagged, investigation
        public string Notes { get; set; } = string.Empty;
    }
}
