using System;
using System.Threading.Tasks;
using AuthService.Authorization;
using AuthService.Models.Branch;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class BranchesController : ControllerBase
    {
        private readonly IBranchService _branchService;
        private readonly ILogger<BranchesController> _logger;

        public BranchesController(IBranchService branchService, ILogger<BranchesController> logger)
        {
            _branchService = branchService;
            _logger = logger;
        }

        /// <summary>
        /// Get all branches with filters and pagination
        /// </summary>
        [HttpGet]
        [RequirePermission("branch.view")]
        public async Task<ActionResult<BranchListResponse>> GetAllBranches([FromQuery] BranchFilters filters)
        {
            try
            {
                // If TenantId is not provided in filters, get it from the authenticated user's claims
                if (!filters.TenantId.HasValue)
                {
                    var tenantIdClaim = User.FindFirst("tenant_id")?.Value;
                    if (!string.IsNullOrEmpty(tenantIdClaim) && Guid.TryParse(tenantIdClaim, out var tenantId))
                    {
                        filters.TenantId = tenantId;
                        _logger.LogInformation("Using TenantId {TenantId} from user claims", tenantId);
                    }
                    else
                    {
                        _logger.LogWarning("No TenantId found in filters or user claims");
                    }
                }
                
                var result = await _branchService.GetAllBranchesAsync(filters);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting branches");
                return StatusCode(500, new { message = "Error retrieving branches", error = ex.Message, stack = ex.StackTrace });
            }
        }

        /// <summary>
        /// Get branch by ID
        /// </summary>
        [HttpGet("{id:guid}")]
        [RequirePermission("branch.view")]
        public async Task<ActionResult<BranchDetailsDto>> GetBranchById(Guid id)
        {
            try
            {
                var branch = await _branchService.GetBranchByIdAsync(id);
                if (branch == null)
                {
                    return NotFound(new { message = "Branch not found" });
                }
                return Ok(branch);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting branch {BranchId}", id);
                return StatusCode(500, new { message = "Error retrieving branch", error = ex.Message });
            }
        }

        /// <summary>
        /// Get branch by unique code within tenant
        /// </summary>
        [HttpGet("code/{code}")]
        [RequirePermission("branch.view")]
        public async Task<ActionResult<BranchDetailsDto>> GetBranchByCode(string code, [FromQuery] Guid tenantId)
        {
            try
            {
                var branch = await _branchService.GetBranchByCodeAsync(tenantId, code);
                if (branch == null)
                {
                    return NotFound(new { message = "Branch not found" });
                }
                return Ok(branch);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting branch by code {Code}", code);
                return StatusCode(500, new { message = "Error retrieving branch", error = ex.Message });
            }
        }

        /// <summary>
        /// Create a new branch
        /// </summary>
        [HttpPost]
        [RequirePermission("branch.create")]
        public async Task<ActionResult<BranchOperationResult>> CreateBranch([FromBody] CreateBranchRequest request)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value ?? Guid.Empty.ToString());
                var result = await _branchService.CreateBranchAsync(request, userId);
                
                if (!result.Success)
                {
                    return BadRequest(result);
                }

                return CreatedAtAction(nameof(GetBranchById), new { id = result.BranchId }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating branch");
                return StatusCode(500, new { message = "Error creating branch", error = ex.Message });
            }
        }

        /// <summary>
        /// Update branch information
        /// </summary>
        [HttpPut("{id:guid}")]
        [RequirePermission("branch.update")]
        public async Task<ActionResult<BranchOperationResult>> UpdateBranch(Guid id, [FromBody] UpdateBranchRequest request)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value ?? Guid.Empty.ToString());
                var result = await _branchService.UpdateBranchAsync(id, request, userId);
                
                if (!result.Success)
                {
                    if (result.Message.Contains("not found"))
                        return NotFound(result);
                    return BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating branch {BranchId}", id);
                return StatusCode(500, new { message = "Error updating branch", error = ex.Message });
            }
        }

        /// <summary>
        /// Delete branch
        /// </summary>
        [HttpDelete("{id:guid}")]
        [RequirePermission("branch.delete")]
        public async Task<ActionResult<BranchOperationResult>> DeleteBranch(Guid id)
        {
            try
            {
                var result = await _branchService.DeleteBranchAsync(id);
                
                if (!result.Success)
                {
                    if (result.Message.Contains("not found"))
                        return NotFound(result);
                    return BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting branch {BranchId}", id);
                return StatusCode(500, new { message = "Error deleting branch", error = ex.Message });
            }
        }

        /// <summary>
        /// Update branch status
        /// </summary>
        [HttpPatch("{id:guid}/status")]
        [RequirePermission("branch.manage")]
        public async Task<ActionResult<BranchOperationResult>> UpdateBranchStatus(Guid id, [FromBody] UpdateBranchStatusRequest request)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value ?? Guid.Empty.ToString());
                var result = await _branchService.UpdateBranchStatusAsync(id, request.Status, userId);
                
                if (!result.Success)
                {
                    if (result.Message.Contains("not found"))
                        return NotFound(result);
                    return BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating branch status");
                return StatusCode(500, new { message = "Error updating branch status", error = ex.Message });
            }
        }

        /// <summary>
        /// Update operational hours
        /// </summary>
        [HttpPut("{id:guid}/operational-hours")]
        [RequirePermission("branch.manage")]
        public async Task<ActionResult<BranchOperationResult>> UpdateOperationalHours(Guid id, [FromBody] UpdateOperationalHoursRequest request)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value ?? Guid.Empty.ToString());
                var result = await _branchService.UpdateOperationalHoursAsync(id, request, userId);
                
                if (!result.Success)
                {
                    if (result.Message.Contains("not found"))
                        return NotFound(result);
                    return BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating operational hours");
                return StatusCode(500, new { message = "Error updating operational hours", error = ex.Message });
            }
        }

        /// <summary>
        /// Update operational status
        /// </summary>
        [HttpPut("{id:guid}/operational-status")]
        [RequirePermission("branch.manage")]
        public async Task<ActionResult<BranchOperationResult>> UpdateOperationalStatus(Guid id, [FromBody] UpdateOperationalStatusRequest request)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value ?? Guid.Empty.ToString());
                var result = await _branchService.UpdateOperationalStatusAsync(id, request.OperationalStatus, userId);
                
                if (!result.Success)
                {
                    if (result.Message.Contains("not found"))
                        return NotFound(result);
                    return BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating operational status");
                return StatusCode(500, new { message = "Error updating operational status", error = ex.Message });
            }
        }

        /// <summary>
        /// Get operational information
        /// </summary>
        [HttpGet("{id:guid}/operational")]
        [RequirePermission("branch.view")]
        public async Task<ActionResult<BranchOperationalInfoDto>> GetOperationalInfo(Guid id)
        {
            try
            {
                var info = await _branchService.GetOperationalInfoAsync(id);
                return Ok(info);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting operational info");
                return StatusCode(500, new { message = "Error retrieving operational info", error = ex.Message });
            }
        }

        /// <summary>
        /// Check if branch is currently operational
        /// </summary>
        [HttpGet("{id:guid}/is-operational")]
        [RequirePermission("branch.view")]
        public async Task<ActionResult> IsCurrentlyOperational(Guid id)
        {
            try
            {
                var isOperational = await _branchService.IsCurrentlyOperationalAsync(id);
                return Ok(new { isOperational });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking operational status");
                return StatusCode(500, new { message = "Error checking operational status", error = ex.Message });
            }
        }

        /// <summary>
        /// Get branches by region
        /// </summary>
        [HttpGet("region/{region}")]
        [RequirePermission("branch.view")]
        public async Task<ActionResult> GetByRegion(string region, [FromQuery] Guid tenantId)
        {
            try
            {
                var branches = await _branchService.GetByRegionAsync(tenantId, region);
                return Ok(branches);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting branches by region");
                return StatusCode(500, new { message = "Error retrieving branches", error = ex.Message });
            }
        }

        /// <summary>
        /// Get nearby branches by latitude/longitude
        /// </summary>
        [HttpGet("nearby")]
        [RequirePermission("branch.view")]
        public async Task<ActionResult> GetNearbyBranches([FromQuery] NearbyBranchesRequest request)
        {
            try
            {
                var branches = await _branchService.GetNearbyBranchesAsync(request);
                return Ok(branches);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting nearby branches");
                return StatusCode(500, new { message = "Error retrieving nearby branches", error = ex.Message });
            }
        }

        /// <summary>
        /// Get department count for branch
        /// </summary>
        [HttpGet("{id:guid}/departments/count")]
        [RequirePermission("branch.view")]
        public async Task<ActionResult> GetDepartmentCount(Guid id)
        {
            try
            {
                var count = await _branchService.GetDepartmentCountAsync(id);
                return Ok(new { count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting department count");
                return StatusCode(500, new { message = "Error getting count", error = ex.Message });
            }
        }

        /// <summary>
        /// Get staff count for branch
        /// </summary>
        [HttpGet("{id:guid}/staff/count")]
        [RequirePermission("branch.view")]
        public async Task<ActionResult> GetStaffCount(Guid id)
        {
            try
            {
                var count = await _branchService.GetStaffCountAsync(id);
                return Ok(new { count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting staff count");
                return StatusCode(500, new { message = "Error getting count", error = ex.Message });
            }
        }

        /// <summary>
        /// Get branch statistics
        /// </summary>
        [HttpGet("statistics")]
        [RequirePermission("branch.view")]
        public async Task<ActionResult<BranchStatistics>> GetStatistics([FromQuery] Guid? tenantId = null, [FromQuery] Guid? organizationId = null)
        {
            try
            {
                var statistics = await _branchService.GetStatisticsAsync(tenantId, organizationId);
                return Ok(statistics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting statistics");
                return StatusCode(500, new { message = "Error retrieving statistics", error = ex.Message });
            }
        }

        /// <summary>
        /// Search branches by name or code
        /// </summary>
        [HttpGet("search")]
        [RequirePermission("branch.view")]
        public async Task<ActionResult<BranchListResponse>> SearchBranches(
            [FromQuery] string query, 
            [FromQuery] Guid? tenantId = null, 
            [FromQuery] Guid? organizationId = null,
            [FromQuery] int pageNumber = 1, 
            [FromQuery] int pageSize = 50)
        {
            try
            {
                var result = await _branchService.SearchBranchesAsync(query, tenantId, organizationId, pageNumber, pageSize);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching branches");
                return StatusCode(500, new { message = "Error searching branches", error = ex.Message });
            }
        }
    }

    public class UpdateBranchStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }
}
