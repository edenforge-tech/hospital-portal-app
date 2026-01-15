using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers;

/// <summary>
/// Department Access Approval & Audit API
/// Implements Phase 1 Critical Features: Approval Workflow + Audit Logging
/// </summary>
[Authorize]
[ApiController]
[Route("api/department-access")]
public class DepartmentAccessApprovalController : ControllerBase
{
    private readonly IDepartmentAccessApprovalService _approvalService;
    private readonly IDepartmentAccessValidationService _validationService;
    private readonly IDepartmentAccessAuditService _auditService;
    private readonly ILogger<DepartmentAccessApprovalController> _logger;

    public DepartmentAccessApprovalController(
        IDepartmentAccessApprovalService approvalService,
        IDepartmentAccessValidationService validationService,
        IDepartmentAccessAuditService auditService,
        ILogger<DepartmentAccessApprovalController> logger)
    {
        _approvalService = approvalService;
        _validationService = validationService;
        _auditService = auditService;
        _logger = logger;
    }

    /// <summary>
    /// Request department access (may require approval based on rules)
    /// </summary>
    [HttpPost("request")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RequestAccess([FromBody] AccessRequestDto request)
    {
        try
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"]!;
            var userId = (Guid)HttpContext.Items["UserId"]!;
            
            request.TenantId = tenantId;
            var result = await _approvalService.RequestAccessAsync(request, userId);
            
            if (!result.Success)
            {
                return BadRequest(new { success = false, errors = result.Errors, message = string.Join(", ", result.Errors) });
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing access request");
            return StatusCode(500, new { success = false, message = "An error occurred while processing the request" });
        }
    }

    /// <summary>
    /// Get pending approval requests that the current user can approve
    /// </summary>
    [HttpGet("pending-approvals")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPendingApprovals()
    {
        try
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"]!;
            var userId = (Guid)HttpContext.Items["UserId"]!;
            
            var requests = await _approvalService.GetPendingApprovalsAsync(userId, tenantId);
            return Ok(requests);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving pending approvals");
            return StatusCode(500, new { message = "An error occurred while retrieving pending approvals" });
        }
    }

    /// <summary>
    /// Get current user's access requests (all statuses)
    /// </summary>
    [HttpGet("my-requests")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyRequests()
    {
        try
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"]!;
            var userId = (Guid)HttpContext.Items["UserId"]!;
            
            var requests = await _approvalService.GetUserRequestsAsync(userId, tenantId);
            return Ok(requests);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user requests");
            return StatusCode(500, new { message = "An error occurred while retrieving your requests" });
        }
    }

    /// <summary>
    /// Approve a pending access request
    /// </summary>
    [HttpPost("{requestId}/approve")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ApproveRequest(Guid requestId, [FromBody] ApprovalDto approval)
    {
        try
        {
            var userId = (Guid)HttpContext.Items["UserId"]!;
            var result = await _approvalService.ApproveRequestAsync(requestId, userId, approval.Notes ?? "");
            
            if (!result.Success)
            {
                return BadRequest(new { success = false, message = result.Message });
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving request {RequestId}", requestId);
            return StatusCode(500, new { success = false, message = "An error occurred while approving the request" });
        }
    }

    /// <summary>
    /// Reject a pending access request
    /// </summary>
    [HttpPost("{requestId}/reject")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RejectRequest(Guid requestId, [FromBody] RejectionDto rejection)
    {
        try
        {
            var userId = (Guid)HttpContext.Items["UserId"]!;
            var result = await _approvalService.RejectRequestAsync(requestId, userId, rejection.Reason);
            
            if (!result.Success)
            {
                return BadRequest(new { success = false, message = result.Message });
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting request {RequestId}", requestId);
            return StatusCode(500, new { success = false, message = "An error occurred while rejecting the request" });
        }
    }

    /// <summary>
    /// Cancel own pending access request
    /// </summary>
    [HttpPost("{requestId}/cancel")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CancelRequest(Guid requestId)
    {
        try
        {
            var userId = (Guid)HttpContext.Items["UserId"]!;
            var result = await _approvalService.CancelRequestAsync(requestId, userId);
            
            if (!result.Success)
            {
                return BadRequest(new { success = false, message = result.Message });
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling request {RequestId}", requestId);
            return StatusCode(500, new { success = false, message = "An error occurred while cancelling the request" });
        }
    }

    /// <summary>
    /// Get audit logs with filtering
    /// </summary>
    [HttpGet("audit-logs")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAuditLogs([FromQuery] AuditFilterDto filter)
    {
        try
        {
            filter.TenantId = (Guid)HttpContext.Items["TenantId"]!;
            var logs = await _auditService.GetAuditLogsAsync(filter);
            return Ok(logs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving audit logs");
            return StatusCode(500, new { message = "An error occurred while retrieving audit logs" });
        }
    }

    /// <summary>
    /// Get audit statistics for a date range
    /// </summary>
    [HttpGet("audit-statistics")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAuditStatistics([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        try
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"]!;
            var start = startDate ?? DateTime.UtcNow.AddDays(-30);
            var end = endDate ?? DateTime.UtcNow;
            
            var stats = await _auditService.GetStatisticsAsync(tenantId, start, end);
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating audit statistics");
            return StatusCode(500, new { message = "An error occurred while generating statistics" });
        }
    }

    /// <summary>
    /// Generate HIPAA/NABH compliance report
    /// </summary>
    [HttpGet("compliance-report")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetComplianceReport([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        try
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"]!;
            var start = startDate ?? DateTime.UtcNow.AddDays(-30);
            var end = endDate ?? DateTime.UtcNow;
            
            var report = await _auditService.GenerateComplianceReportAsync(tenantId, start, end);
            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating compliance report");
            return StatusCode(500, new { message = "An error occurred while generating the compliance report" });
        }
    }

    /// <summary>
    /// Validate if user can access a department (without creating request)
    /// </summary>
    [HttpPost("validate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ValidateAccess([FromBody] ValidationRequestDto request)
    {
        try
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"]!;
            var result = await _validationService.ValidateDepartmentAccessAsync(request.UserId, request.DepartmentId, tenantId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating department access");
            return StatusCode(500, new { message = "An error occurred during validation" });
        }
    }

    /// <summary>
    /// Get recommended permissions for a role accessing a specific department
    /// </summary>
    [HttpGet("recommended-permissions")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRecommendedPermissions([FromQuery] string userRole, [FromQuery] string departmentCode)
    {
        try
        {
            var permissions = await _validationService.GetRecommendedPermissionsAsync(userRole, departmentCode);
            return Ok(permissions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recommended permissions");
            return StatusCode(500, new { message = "An error occurred while getting recommended permissions" });
        }
    }
}

#region Request DTOs

public class ApprovalDto
{
    public string? Notes { get; set; }
}

public class RejectionDto
{
    public string Reason { get; set; } = string.Empty;
}

public class ValidationRequestDto
{
    public Guid UserId { get; set; }
    public Guid DepartmentId { get; set; }
}

#endregion
