using AuthService.Models.Training;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace AuthService.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TrainingController : ControllerBase
    {
        private readonly ITrainingManagementService _service;
        private readonly ILogger<TrainingController> _logger;

        public TrainingController(ITrainingManagementService service, ILogger<TrainingController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpPost("assign")]
        public async Task<ActionResult<TrainingAssignmentDto>> AssignTraining([FromBody] AssignTrainingRequest request)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException());
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());

                var result = await _service.AssignTrainingAsync(request, tenantId, userId);
                return CreatedAtAction(nameof(GetUserAssignments), new { userId = request.UserId }, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning training");
                return StatusCode(500, new { error = "An error occurred while assigning training" });
            }
        }

        [HttpPost("{assignmentId}/complete")]
        public async Task<ActionResult<TrainingAssignmentDto>> RecordCompletion(Guid assignmentId, [FromBody] RecordCompletionRequest request)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException());
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());

                var result = await _service.RecordCompletionAsync(assignmentId, request, tenantId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recording training completion");
                return StatusCode(500, new { error = "An error occurred while recording completion" });
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult> GetUserAssignments(Guid userId)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException());
                var assignments = await _service.GetUserAssignmentsAsync(userId, tenantId);
                return Ok(assignments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user assignments");
                return StatusCode(500, new { error = "An error occurred while retrieving assignments" });
            }
        }

        [HttpGet("compliance/user/{userId}")]
        public async Task<ActionResult<ComplianceReportDto>> GetUserCompliance(Guid userId)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException());
                var report = await _service.GetUserComplianceReportAsync(userId, tenantId);
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user compliance report");
                return StatusCode(500, new { error = "An error occurred while retrieving compliance report" });
            }
        }

        [HttpGet("compliance/tenant")]
        public async Task<ActionResult> GetTenantCompliance()
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException());
                var reports = await _service.GetTenantComplianceReportAsync(tenantId);
                return Ok(reports);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tenant compliance report");
                return StatusCode(500, new { error = "An error occurred while retrieving tenant compliance" });
            }
        }

        [HttpGet("credentials/expiring")]
        public async Task<ActionResult> GetExpiringCredentials([FromQuery] int daysAhead = 30)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException());
                var credentials = await _service.GetExpiringCredentialsAsync(tenantId, daysAhead);
                return Ok(credentials);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving expiring credentials");
                return StatusCode(500, new { error = "An error occurred while retrieving expiring credentials" });
            }
        }

        [HttpPost("credentials/auto-suspend")]
        public async Task<ActionResult> AutoSuspendExpiredCredentials()
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException());
                await _service.AutoSuspendExpiredCredentialsAsync(tenantId);
                return Ok(new { message = "Expired credentials processed successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error auto-suspending expired credentials");
                return StatusCode(500, new { error = "An error occurred while processing expired credentials" });
            }
        }

        [HttpGet("statistics")]
        public async Task<ActionResult<TrainingStatisticsDto>> GetStatistics()
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")?.Value ?? throw new UnauthorizedAccessException());
                var stats = await _service.GetTrainingStatisticsAsync(tenantId);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving training statistics");
                return StatusCode(500, new { error = "An error occurred while retrieving statistics" });
            }
        }
    }
}
