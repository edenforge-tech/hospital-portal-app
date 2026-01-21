using AuthService.Models.Department;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers;

/// <summary>
/// Supervised Access Management API - NABH Compliance
/// Manages junior doctor supervision, capacity tracking, and compliance scoring
/// Used by Admin UI: /admin/supervised-access
/// </summary>
[Authorize]
[ApiController]
[Route("api/admin/supervised-access")]
public class SupervisedAccessController : ControllerBase
{
    private readonly ISupervisedAccessService _supervisedAccessService;
    private readonly ILogger<SupervisedAccessController> _logger;

    public SupervisedAccessController(
        ISupervisedAccessService supervisedAccessService,
        ILogger<SupervisedAccessController> logger)
    {
        _supervisedAccessService = supervisedAccessService;
        _logger = logger;
    }

    /// <summary>
    /// Get all supervised users with optional filters
    /// </summary>
    [HttpGet("users")]
    [ProducesResponseType(typeof(List<SupervisedUserDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllSupervisedUsers(
        [FromQuery] string? search = null,
        [FromQuery] Guid? supervisorId = null,
        [FromQuery] string? oversightLevel = null,
        [FromQuery] bool? requiresCoSignature = null,
        [FromQuery] string? status = null,
        [FromQuery] int? minComplianceScore = null)
    {
        try
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"]!;

            var filters = new SupervisedUserFilters
            {
                Search = search,
                SupervisorId = supervisorId,
                OversightLevel = oversightLevel,
                RequiresCoSignature = requiresCoSignature,
                Status = status,
                MinComplianceScore = minComplianceScore
            };

            var users = await _supervisedAccessService.GetAllSupervisedUsersAsync(tenantId, filters);
            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving supervised users");
            return StatusCode(500, new { message = "An error occurred while retrieving supervised users" });
        }
    }

    /// <summary>
    /// Get supervised user details by ID
    /// </summary>
    [HttpGet("users/{id:guid}")]
    [ProducesResponseType(typeof(SupervisedUserDetails), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSupervisedUserById(Guid id)
    {
        try
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"]!;
            var user = await _supervisedAccessService.GetSupervisedUserByIdAsync(id, tenantId);

            if (user == null)
            {
                return NotFound(new { message = "Supervised user not found" });
            }

            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving supervised user {Id}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the supervised user" });
        }
    }

    /// <summary>
    /// Create a new supervised user assignment
    /// </summary>
    [HttpPost("users")]
    [ProducesResponseType(typeof(SupervisedUserDetails), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateSupervisedUser([FromBody] SupervisedUserFormData formData)
    {
        try
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"]!;
            var userId = (Guid)HttpContext.Items["UserId"]!;

            var user = await _supervisedAccessService.CreateSupervisedUserAsync(formData, tenantId, userId);
            return CreatedAtAction(nameof(GetSupervisedUserById), new { id = user.Id }, user);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating supervised user");
            return StatusCode(500, new { message = "An error occurred while creating the supervised user" });
        }
    }

    /// <summary>
    /// Update an existing supervised user assignment
    /// </summary>
    [HttpPut("users/{id:guid}")]
    [ProducesResponseType(typeof(SupervisedUserDetails), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateSupervisedUser(Guid id, [FromBody] SupervisedUserFormData formData)
    {
        try
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"]!;
            var userId = (Guid)HttpContext.Items["UserId"]!;

            var user = await _supervisedAccessService.UpdateSupervisedUserAsync(id, formData, tenantId, userId);
            return Ok(user);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating supervised user {Id}", id);
            return StatusCode(500, new { message = "An error occurred while updating the supervised user" });
        }
    }

    /// <summary>
    /// Delete a supervised user assignment (soft delete)
    /// </summary>
    [HttpDelete("users/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteSupervisedUser(Guid id)
    {
        try
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"]!;
            var deleted = await _supervisedAccessService.DeleteSupervisedUserAsync(id, tenantId);

            if (!deleted)
            {
                return NotFound(new { message = "Supervised user not found" });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting supervised user {Id}", id);
            return StatusCode(500, new { message = "An error occurred while deleting the supervised user" });
        }
    }

    /// <summary>
    /// Get supervisor capacity information for all supervisors
    /// </summary>
    [HttpGet("supervisors/capacity")]
    [ProducesResponseType(typeof(List<SupervisorCapacityDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSupervisorCapacities()
    {
        try
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"]!;
            var capacities = await _supervisedAccessService.GetSupervisorCapacitiesAsync(tenantId);
            return Ok(capacities);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving supervisor capacities");
            return StatusCode(500, new { message = "An error occurred while retrieving supervisor capacities" });
        }
    }

    /// <summary>
    /// Get statistics for supervised access tracking
    /// </summary>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(SupervisedAccessStats), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStats()
    {
        try
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"]!;
            var stats = await _supervisedAccessService.GetStatsAsync(tenantId);
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving supervised access statistics");
            return StatusCode(500, new { message = "An error occurred while retrieving statistics" });
        }
    }

    /// <summary>
    /// Recalculate compliance score for a supervised user
    /// </summary>
    [HttpPost("users/{id:guid}/recalculate-compliance")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RecalculateComplianceScore(Guid id)
    {
        try
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"]!;
            var success = await _supervisedAccessService.RecalculateComplianceScoreAsync(id, tenantId);

            if (!success)
            {
                return NotFound(new { message = "Supervised user not found" });
            }

            return Ok(new { message = "Compliance score recalculated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error recalculating compliance score for {Id}", id);
            return StatusCode(500, new { message = "An error occurred while recalculating compliance score" });
        }
    }
}
