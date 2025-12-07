using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers;

[Authorize]
[ApiController]
[Route("api/users/{userId}/department-access")]
public class UserDepartmentAccessController : ControllerBase
{
    private readonly IUserDepartmentAccessService _service;
    private readonly ILogger<UserDepartmentAccessController> _logger;

    public UserDepartmentAccessController(
        IUserDepartmentAccessService service,
        ILogger<UserDepartmentAccessController> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// Get all department access assignments for a specific user
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<UserDepartmentAccessDto>>> GetUserDepartmentAccess(Guid userId)
    {
        try
        {
            // Get all departments for this user
            var departments = await _service.GetUserDepartmentsAsync(userId);

            // Convert to UserDepartmentAccessDto format
            var assignments = departments.Select(d => new UserDepartmentAccessDto
            {
                UserId = userId,
                DepartmentId = d.DepartmentId,
                DepartmentName = d.DepartmentName,
                AccessType = d.AccessType,
                IsPrimary = d.IsPrimary,
                GrantedAt = d.GrantedAt,
                Status = d.Status
            }).ToList();

            return Ok(assignments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving department access for user {UserId}", userId);
            return StatusCode(500, "An error occurred while retrieving user department access");
        }
    }

    /// <summary>
    /// Create a new department access assignment for a user
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserDepartmentAccessDto>> CreateDepartmentAccess(
        Guid userId,
        [FromBody] CreateDepartmentAccessRequest request)
    {
        try
        {
            var result = await _service.AssignUserToDepartmentAsync(
                userId,
                request.DepartmentId,
                request.AccessLevel,
                request.IsPrimary
            );

            return CreatedAtAction(
                nameof(GetUserDepartmentAccess),
                new { userId = userId },
                result
            );
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating department access for user {UserId}", userId);
            return StatusCode(500, "An error occurred while creating department access");
        }
    }

    /// <summary>
    /// Update a specific department access assignment for a user
    /// </summary>
    [HttpPut("{assignmentId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateDepartmentAccess(
        Guid userId,
        Guid assignmentId,
        [FromBody] UpdateDepartmentAccessRequest request)
    {
        try
        {
            // First verify the assignment exists and belongs to the user
            var userDepartments = await _service.GetUserDepartmentsAsync(userId);
            var assignment = userDepartments.FirstOrDefault(d => d.DepartmentId == assignmentId);

            if (assignment == null)
            {
                return NotFound("Department access assignment not found for this user");
            }

            // Update access level if provided
            if (!string.IsNullOrEmpty(request.AccessLevel))
            {
                await _service.UpdateAccessLevelAsync(userId, assignmentId, request.AccessLevel);
            }

            // Update primary status if provided
            if (request.IsPrimary.HasValue)
            {
                if (request.IsPrimary.Value)
                {
                    await _service.SetPrimaryDepartmentAsync(userId, assignmentId);
                }
                else
                {
                    // If setting to non-primary, we need to handle this differently
                    // For now, we'll just update the access level
                }
            }

            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating department access for user {UserId}, assignment {AssignmentId}",
                userId, assignmentId);
            return StatusCode(500, "An error occurred while updating department access");
        }
    }

    /// <summary>
    /// Remove a specific department access assignment for a user
    /// </summary>
    [HttpDelete("{assignmentId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteDepartmentAccess(Guid userId, Guid assignmentId)
    {
        try
        {
            // First verify the assignment exists and belongs to the user
            var userDepartments = await _service.GetUserDepartmentsAsync(userId);
            var assignment = userDepartments.FirstOrDefault(d => d.DepartmentId == assignmentId);

            if (assignment == null)
            {
                return NotFound("Department access assignment not found for this user");
            }

            await _service.RevokeAccessAsync(userId, assignmentId);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting department access for user {UserId}, assignment {AssignmentId}",
                userId, assignmentId);
            return StatusCode(500, "An error occurred while deleting department access");
        }
    }

    /// <summary>
    /// Bulk assign multiple departments to a user
    /// </summary>
    [HttpPost("bulk")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<List<UserDepartmentAccessDto>>> BulkAssignDepartments(
        Guid userId,
        [FromBody] List<CreateDepartmentAccessRequest> assignments)
    {
        try
        {
            var bulkAssignments = assignments.Select(a => new BulkAssignmentDto
            {
                UserId = userId,
                DepartmentId = a.DepartmentId,
                AccessType = a.AccessLevel,
                IsPrimary = a.IsPrimary
            }).ToList();

            var results = await _service.BulkAssignAsync(bulkAssignments);
            return Ok(new
            {
                TotalRequested = assignments.Count,
                SuccessfulAssignments = results.Count,
                FailedAssignments = assignments.Count - results.Count,
                Results = results
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during bulk assignment for user {UserId}", userId);
            return StatusCode(500, "An error occurred during bulk assignment");
        }
    }

    /// <summary>
    /// Get access matrix for all users (admin endpoint)
    /// </summary>
    [HttpGet("matrix")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<AccessMatrixDto>> GetAccessMatrix(Guid? departmentId = null)
    {
        try
        {
            var matrix = await _service.GetAccessMatrixAsync(departmentId);
            return Ok(matrix);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving access matrix");
            return StatusCode(500, "An error occurred while retrieving access matrix");
        }
    }
}

// Request DTOs
public class CreateDepartmentAccessRequest
{
    public Guid DepartmentId { get; set; }
    public string AccessLevel { get; set; } = "full";
    public bool IsPrimary { get; set; }
}

public class UpdateDepartmentAccessRequest
{
    public string? AccessLevel { get; set; }
    public bool? IsPrimary { get; set; }
}
