using System;
using System.Security.Claims;
using System.Threading.Tasks;
using AuthService.Models.Counselor;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers
{
    [Route("api/workflow")]
    [ApiController]
    [Authorize]
    public class WorkflowController : ControllerBase
    {
        private readonly IWorkflowOrchestrationService _workflowService;

        public WorkflowController(IWorkflowOrchestrationService workflowService)
        {
            _workflowService = workflowService;
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
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

        // ==================== Workflow State Management ====================

        [HttpGet("{sessionId}")]
        public async Task<IActionResult> GetWorkflowBySessionId(Guid sessionId)
        {
            var workflow = await _workflowService.GetWorkflowBySessionIdAsync(sessionId);
            return workflow != null ? Ok(workflow) : NotFound();
        }

        [HttpPost("initialize")]
        public async Task<IActionResult> InitializeWorkflow([FromBody] InitializeWorkflowRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var tenantId = GetTenantId();
                var workflow = await _workflowService.InitializeWorkflowAsync(request, tenantId, userId);
                return CreatedAtAction(nameof(GetWorkflowBySessionId), new { sessionId = workflow.SessionId }, workflow);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("{sessionId}/transition")]
        public async Task<IActionResult> UpdateWorkflowStage(Guid sessionId, [FromBody] UpdateWorkflowStageRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var workflow = await _workflowService.UpdateWorkflowStageAsync(sessionId, request, userId);
                return Ok(workflow);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("{sessionId}/dependencies")]
        public async Task<IActionResult> CheckDependencies(Guid sessionId)
        {
            var result = await _workflowService.CheckDependenciesAsync(sessionId);
            return Ok(result);
        }

        [HttpGet("{sessionId}/progress")]
        public async Task<IActionResult> GetWorkflowProgress(Guid sessionId)
        {
            try
            {
                var progress = await _workflowService.GetWorkflowProgressAsync(sessionId);
                return Ok(progress);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // ==================== Stage Transitions ====================

        [HttpGet("{sessionId}/transitions")]
        public async Task<IActionResult> GetStageTransitions(Guid sessionId)
        {
            var transitions = await _workflowService.GetStageTransitionsAsync(sessionId);
            return Ok(transitions);
        }

        // ==================== Blocking Issues ====================

        [HttpGet("{sessionId}/blocking-issues")]
        public async Task<IActionResult> GetBlockingIssues(Guid sessionId)
        {
            var issues = await _workflowService.GetBlockingIssuesAsync(sessionId);
            return Ok(issues);
        }

        [HttpPost("{sessionId}/resolve-issue/{stageName}")]
        public async Task<IActionResult> ResolveBlockingIssue(Guid sessionId, string stageName)
        {
            var userId = GetCurrentUserId();
            var result = await _workflowService.ResolveBlockingIssueAsync(sessionId, stageName, userId);
            return result ? Ok(new { message = "Issue resolved successfully" }) : NotFound();
        }
    }
}
