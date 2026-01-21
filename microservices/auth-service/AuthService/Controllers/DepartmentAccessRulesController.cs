using AuthService.Models.Department;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers;

/// <summary>
/// Department Access Rules Configuration API
/// Manages approval workflows, supervision requirements, auto-expiration, and access restrictions
/// Used by Admin UI: /admin/department-rules
/// </summary>
[Authorize]
[ApiController]
[Route("api/admin/department-rules")]
public class DepartmentAccessRulesController : ControllerBase
{
    private readonly IDepartmentAccessRuleService _ruleService;
    private readonly ILogger<DepartmentAccessRulesController> _logger;

    public DepartmentAccessRulesController(
        IDepartmentAccessRuleService ruleService,
        ILogger<DepartmentAccessRulesController> logger)
    {
        _ruleService = ruleService;
        _logger = logger;
    }

    /// <summary>
    /// Get all department access rules with optional filters
    /// </summary>
    /// <param name="search">Search by department code or name</param>
    /// <param name="isActive">Filter by active/inactive status</param>
    /// <param name="requiresApproval">Filter by approval requirement</param>
    /// <param name="requiresSupervisor">Filter by supervisor requirement</param>
    /// <param name="departmentType">Filter by department type (Clinical, Diagnostic, etc.)</param>
    [HttpGet]
    [ProducesResponseType(typeof(List<DepartmentAccessRuleDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllRules(
        [FromQuery] string? search = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] bool? requiresApproval = null,
        [FromQuery] bool? requiresSupervisor = null,
        [FromQuery] string? departmentType = null)
    {
        try
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"]!;

            var filters = new DepartmentAccessRuleFilters
            {
                Search = search,
                IsActive = isActive,
                RequiresApproval = requiresApproval,
                RequiresSupervisor = requiresSupervisor,
                DepartmentType = departmentType
            };

            var rules = await _ruleService.GetAllRulesAsync(tenantId, filters);
            return Ok(rules);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving department access rules");
            return StatusCode(500, new { message = "An error occurred while retrieving department access rules" });
        }
    }

    /// <summary>
    /// Get department access rule by ID
    /// </summary>
    [HttpGet("{ruleId:guid}")]
    [ProducesResponseType(typeof(DepartmentAccessRuleDetails), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetRuleById(Guid ruleId)
    {
        try
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"]!;
            var rule = await _ruleService.GetRuleByIdAsync(ruleId, tenantId);

            if (rule == null)
            {
                return NotFound(new { message = "Department access rule not found" });
            }

            return Ok(rule);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving rule {RuleId}", ruleId);
            return StatusCode(500, new { message = "An error occurred while retrieving the rule" });
        }
    }

    /// <summary>
    /// Get department access rule by department ID
    /// </summary>
    [HttpGet("by-department/{departmentId:guid}")]
    [ProducesResponseType(typeof(DepartmentAccessRuleDetails), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetRuleByDepartmentId(Guid departmentId)
    {
        try
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"]!;
            var rule = await _ruleService.GetRuleByDepartmentIdAsync(departmentId, tenantId);

            if (rule == null)
            {
                return NotFound(new { message = "No rule found for this department" });
            }

            return Ok(rule);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving rule for department {DepartmentId}", departmentId);
            return StatusCode(500, new { message = "An error occurred while retrieving the rule" });
        }
    }

    /// <summary>
    /// Create a new department access rule
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(DepartmentAccessRuleDetails), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateRule([FromBody] DepartmentAccessRuleFormData formData)
    {
        try
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"]!;
            var userId = (Guid)HttpContext.Items["UserId"]!;

            // Validate max access duration
            if (formData.EnableAutoExpiration && formData.MaxAccessDurationDays.HasValue)
            {
                if (formData.MaxAccessDurationDays < 1 || formData.MaxAccessDurationDays > 90)
                {
                    return BadRequest(new { message = "Max access duration must be between 1 and 90 days" });
                }
            }

            var rule = await _ruleService.CreateRuleAsync(formData, tenantId, userId);
            return CreatedAtAction(nameof(GetRuleById), new { ruleId = rule.Id }, rule);
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
            _logger.LogError(ex, "Error creating department access rule");
            return StatusCode(500, new { message = "An error occurred while creating the rule" });
        }
    }

    /// <summary>
    /// Update an existing department access rule
    /// </summary>
    [HttpPut("{ruleId:guid}")]
    [ProducesResponseType(typeof(DepartmentAccessRuleDetails), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateRule(Guid ruleId, [FromBody] DepartmentAccessRuleFormData formData)
    {
        try
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"]!;
            var userId = (Guid)HttpContext.Items["UserId"]!;

            // Validate max access duration
            if (formData.EnableAutoExpiration && formData.MaxAccessDurationDays.HasValue)
            {
                if (formData.MaxAccessDurationDays < 1 || formData.MaxAccessDurationDays > 90)
                {
                    return BadRequest(new { message = "Max access duration must be between 1 and 90 days" });
                }
            }

            var rule = await _ruleService.UpdateRuleAsync(ruleId, formData, tenantId, userId);
            return Ok(rule);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating rule {RuleId}", ruleId);
            return StatusCode(500, new { message = "An error occurred while updating the rule" });
        }
    }

    /// <summary>
    /// Delete a department access rule (soft delete)
    /// </summary>
    [HttpDelete("{ruleId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteRule(Guid ruleId)
    {
        try
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"]!;
            var deleted = await _ruleService.DeleteRuleAsync(ruleId, tenantId);

            if (!deleted)
            {
                return NotFound(new { message = "Department access rule not found" });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting rule {RuleId}", ruleId);
            return StatusCode(500, new { message = "An error occurred while deleting the rule" });
        }
    }

    /// <summary>
    /// Get statistics for department access rules
    /// </summary>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(DepartmentAccessRuleStats), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRuleStats()
    {
        try
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"]!;
            var stats = await _ruleService.GetRuleStatsAsync(tenantId);
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving rule statistics");
            return StatusCode(500, new { message = "An error occurred while retrieving statistics" });
        }
    }
}
