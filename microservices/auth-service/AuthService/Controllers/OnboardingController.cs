using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using AuthService.Models.Onboarding;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class OnboardingController : ControllerBase
    {
        private readonly IOnboardingService _onboardingService;

        public OnboardingController(IOnboardingService onboardingService)
        {
            _onboardingService = onboardingService;
        }

        /// <summary>
        /// Create a new onboarding workflow
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<OnboardingWorkflowDto>> CreateWorkflow([FromBody] CreateOnboardingWorkflowRequest request)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")!.Value);
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

                var result = await _onboardingService.CreateWorkflowAsync(request, tenantId, userId);
                return CreatedAtAction(nameof(GetWorkflow), new { id = result.Id }, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating workflow", error = ex.Message });
            }
        }

        /// <summary>
        /// Get workflow by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<OnboardingWorkflowDto>> GetWorkflow(Guid id)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")!.Value);
                var result = await _onboardingService.GetWorkflowByIdAsync(id, tenantId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving workflow", error = ex.Message });
            }
        }

        /// <summary>
        /// Get workflow by user ID
        /// </summary>
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<OnboardingWorkflowDto>> GetWorkflowByUser(Guid userId)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")!.Value);
                var result = await _onboardingService.GetWorkflowByUserIdAsync(userId, tenantId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving workflow", error = ex.Message });
            }
        }

        /// <summary>
        /// Get all workflows (optionally filtered by status)
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<OnboardingWorkflowDto>>> GetAllWorkflows([FromQuery] OnboardingWorkflowStatus? status = null)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")!.Value);
                var result = await _onboardingService.GetAllWorkflowsAsync(tenantId, status);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving workflows", error = ex.Message });
            }
        }

        /// <summary>
        /// Update workflow progress
        /// </summary>
        [HttpPut("{id}/progress")]
        public async Task<ActionResult<OnboardingWorkflowDto>> UpdateProgress(Guid id, [FromBody] UpdateProgressRequest request)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")!.Value);
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

                var result = await _onboardingService.UpdateProgressAsync(id, request, tenantId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating progress", error = ex.Message });
            }
        }

        /// <summary>
        /// Cancel workflow
        /// </summary>
        [HttpPut("{id}/cancel")]
        public async Task<ActionResult<OnboardingWorkflowDto>> CancelWorkflow(Guid id)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")!.Value);
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

                var result = await _onboardingService.CancelWorkflowAsync(id, tenantId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error cancelling workflow", error = ex.Message });
            }
        }

        /// <summary>
        /// Get checklist items for a workflow
        /// </summary>
        [HttpGet("{id}/checklist")]
        public async Task<ActionResult<List<ChecklistItemDto>>> GetChecklistItems(Guid id)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")!.Value);
                var result = await _onboardingService.GetChecklistItemsAsync(id, tenantId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving checklist items", error = ex.Message });
            }
        }

        /// <summary>
        /// Complete a checklist item
        /// </summary>
        [HttpPut("{id}/checklist/{itemId}/complete")]
        public async Task<ActionResult<ChecklistItemDto>> CompleteChecklistItem(Guid id, Guid itemId, [FromBody] CompleteChecklistItemRequest request)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")!.Value);
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

                var result = await _onboardingService.CompleteChecklistItemAsync(id, itemId, request, tenantId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error completing checklist item", error = ex.Message });
            }
        }

        /// <summary>
        /// Skip a checklist item (only non-required items)
        /// </summary>
        [HttpPut("{id}/checklist/{itemId}/skip")]
        public async Task<ActionResult<ChecklistItemDto>> SkipChecklistItem(Guid id, Guid itemId)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")!.Value);
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

                var result = await _onboardingService.SkipChecklistItemAsync(id, itemId, tenantId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error skipping checklist item", error = ex.Message });
            }
        }

        /// <summary>
        /// Assign mentor to workflow
        /// </summary>
        [HttpPut("{id}/mentor")]
        public async Task<ActionResult<OnboardingWorkflowDto>> AssignMentor(Guid id, [FromBody] AssignMentorRequest request)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")!.Value);
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

                var result = await _onboardingService.AssignMentorAsync(id, request, tenantId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error assigning mentor", error = ex.Message });
            }
        }

        /// <summary>
        /// Grant progressive access (Day 1, Day 7, or Day 30)
        /// </summary>
        [HttpPut("{id}/access")]
        public async Task<ActionResult<OnboardingWorkflowDto>> GrantProgressiveAccess(Guid id, [FromBody] GrantAccessRequest request)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")!.Value);
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

                var result = await _onboardingService.GrantProgressiveAccessAsync(id, request, tenantId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error granting access", error = ex.Message });
            }
        }

        /// <summary>
        /// Get access progress for a workflow
        /// </summary>
        [HttpGet("{id}/access/progress")]
        public async Task<ActionResult<AccessLevelProgress>> GetAccessProgress(Guid id)
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")!.Value);
                var result = await _onboardingService.GetAccessProgressAsync(id, tenantId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving access progress", error = ex.Message });
            }
        }

        /// <summary>
        /// Get onboarding statistics
        /// </summary>
        [HttpGet("stats")]
        public async Task<ActionResult<OnboardingStatsDto>> GetStats()
        {
            try
            {
                var tenantId = Guid.Parse(User.FindFirst("TenantId")!.Value);
                var result = await _onboardingService.GetOnboardingStatsAsync(tenantId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving statistics", error = ex.Message });
            }
        }
    }
}
