using System;
using System.Threading.Tasks;
using AuthService.Authorization;
using AuthService.Models.Organization;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class OrganizationsController : ControllerBase
    {
        private readonly IOrganizationService _organizationService;
        private readonly ILogger<OrganizationsController> _logger;

        public OrganizationsController(IOrganizationService organizationService, ILogger<OrganizationsController> logger)
        {
            _organizationService = organizationService;
            _logger = logger;
        }

        /// <summary>
        /// Get all organizations with filters and pagination
        /// </summary>
        [HttpGet]
        [RequirePermission("organization.view")]
        public async Task<ActionResult<OrganizationListResponse>> GetAllOrganizations([FromQuery] OrganizationFilters filters)
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

                var result = await _organizationService.GetAllOrganizationsAsync(filters);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting organizations");
                return StatusCode(500, new { message = "Error retrieving organizations", error = ex.Message });
            }
        }

        /// <summary>
        /// Get organization by ID
        /// </summary>
        [HttpGet("{id:guid}")]
        [RequirePermission("organization.view")]
        public async Task<ActionResult<OrganizationDetailsDto>> GetOrganizationById(Guid id)
        {
            try
            {
                var organization = await _organizationService.GetOrganizationByIdAsync(id);
                if (organization == null)
                {
                    return NotFound(new { message = "Organization not found" });
                }
                return Ok(organization);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting organization {OrganizationId}", id);
                return StatusCode(500, new { message = "Error retrieving organization", error = ex.Message });
            }
        }

        /// <summary>
        /// Get organization by unique code within tenant
        /// </summary>
        [HttpGet("code/{code}")]
        [RequirePermission("organization.view")]
        public async Task<ActionResult<OrganizationDetailsDto>> GetOrganizationByCode(string code, [FromQuery] Guid tenantId)
        {
            try
            {
                var organization = await _organizationService.GetOrganizationByCodeAsync(tenantId, code);
                if (organization == null)
                {
                    return NotFound(new { message = "Organization not found" });
                }
                return Ok(organization);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting organization by code {Code}", code);
                return StatusCode(500, new { message = "Error retrieving organization", error = ex.Message });
            }
        }

        /// <summary>
        /// Create a new organization
        /// </summary>
        [HttpPost]
        [RequirePermission("organization.create")]
        public async Task<ActionResult<OrganizationOperationResult>> CreateOrganization([FromBody] CreateOrganizationRequest request)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value ?? Guid.Empty.ToString());
                var result = await _organizationService.CreateOrganizationAsync(request, userId);
                
                if (!result.Success)
                {
                    return BadRequest(result);
                }

                return CreatedAtAction(nameof(GetOrganizationById), new { id = result.OrganizationId }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating organization");
                return StatusCode(500, new { message = "Error creating organization", error = ex.Message });
            }
        }

        /// <summary>
        /// Update organization information
        /// </summary>
        [HttpPut("{id:guid}")]
        [RequirePermission("organization.update")]
        public async Task<ActionResult<OrganizationOperationResult>> UpdateOrganization(Guid id, [FromBody] UpdateOrganizationRequest request)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value ?? Guid.Empty.ToString());
                var result = await _organizationService.UpdateOrganizationAsync(id, request, userId);
                
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
                _logger.LogError(ex, "Error updating organization {OrganizationId}", id);
                return StatusCode(500, new { message = "Error updating organization", error = ex.Message });
            }
        }

        /// <summary>
        /// Delete organization
        /// </summary>
        [HttpDelete("{id:guid}")]
        [RequirePermission("organization.delete")]
        public async Task<ActionResult<OrganizationOperationResult>> DeleteOrganization(Guid id)
        {
            try
            {
                var result = await _organizationService.DeleteOrganizationAsync(id);
                
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
                _logger.LogError(ex, "Error deleting organization {OrganizationId}", id);
                return StatusCode(500, new { message = "Error deleting organization", error = ex.Message });
            }
        }

        /// <summary>
        /// Move organization to different parent
        /// </summary>
        [HttpPatch("{id:guid}/move")]
        [RequirePermission("organization.manage")]
        public async Task<ActionResult<OrganizationOperationResult>> MoveOrganization(Guid id, [FromBody] MoveOrganizationRequest request)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value ?? Guid.Empty.ToString());
                var result = await _organizationService.MoveOrganizationAsync(id, request, userId);
                
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
                _logger.LogError(ex, "Error moving organization");
                return StatusCode(500, new { message = "Error moving organization", error = ex.Message });
            }
        }

        /// <summary>
        /// Get organization hierarchy tree
        /// </summary>
        [HttpGet("hierarchy")]
        [RequirePermission("organization.view")]
        public async Task<ActionResult<OrganizationHierarchyDto>> GetHierarchy([FromQuery] Guid tenantId, [FromQuery] Guid? rootOrganizationId = null)
        {
            try
            {
                var hierarchy = await _organizationService.GetHierarchyAsync(tenantId, rootOrganizationId);
                if (hierarchy == null)
                {
                    return NotFound(new { message = "No root organization found" });
                }
                return Ok(hierarchy);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting hierarchy");
                return StatusCode(500, new { message = "Error retrieving hierarchy", error = ex.Message });
            }
        }

        /// <summary>
        /// Get child organizations
        /// </summary>
        [HttpGet("{id:guid}/children")]
        [RequirePermission("organization.view")]
        public async Task<ActionResult> GetChildren(Guid id)
        {
            try
            {
                var children = await _organizationService.GetChildrenAsync(id);
                return Ok(children);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting children");
                return StatusCode(500, new { message = "Error retrieving children", error = ex.Message });
            }
        }

        /// <summary>
        /// Get parent organization
        /// </summary>
        [HttpGet("{id:guid}/parent")]
        [RequirePermission("organization.view")]
        public async Task<ActionResult> GetParent(Guid id)
        {
            try
            {
                var parent = await _organizationService.GetParentAsync(id);
                if (parent == null)
                {
                    return NotFound(new { message = "No parent organization found" });
                }
                return Ok(parent);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting parent");
                return StatusCode(500, new { message = "Error retrieving parent", error = ex.Message });
            }
        }

        /// <summary>
        /// Get ancestry path from root to organization
        /// </summary>
        [HttpGet("{id:guid}/path")]
        [RequirePermission("organization.view")]
        public async Task<ActionResult<OrganizationPathDto>> GetPath(Guid id)
        {
            try
            {
                var path = await _organizationService.GetPathAsync(id);
                return Ok(path);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting path");
                return StatusCode(500, new { message = "Error retrieving path", error = ex.Message });
            }
        }

        /// <summary>
        /// Get branch count for organization
        /// </summary>
        [HttpGet("{id:guid}/branches/count")]
        [RequirePermission("organization.view")]
        public async Task<ActionResult> GetBranchCount(Guid id)
        {
            try
            {
                var count = await _organizationService.GetBranchCountAsync(id);
                return Ok(new { count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting branch count");
                return StatusCode(500, new { message = "Error getting count", error = ex.Message });
            }
        }

        /// <summary>
        /// Get user count for organization
        /// </summary>
        [HttpGet("{id:guid}/users/count")]
        [RequirePermission("organization.view")]
        public async Task<ActionResult> GetUserCount(Guid id)
        {
            try
            {
                var count = await _organizationService.GetUserCountAsync(id);
                return Ok(new { count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user count");
                return StatusCode(500, new { message = "Error getting count", error = ex.Message });
            }
        }

        /// <summary>
        /// Get organization statistics
        /// </summary>
        [HttpGet("statistics")]
        [RequirePermission("organization.view")]
        public async Task<ActionResult<OrganizationStatistics>> GetStatistics([FromQuery] Guid? tenantId = null)
        {
            try
            {
                var statistics = await _organizationService.GetStatisticsAsync(tenantId);
                return Ok(statistics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting statistics");
                return StatusCode(500, new { message = "Error retrieving statistics", error = ex.Message });
            }
        }

        /// <summary>
        /// Search organizations by name or code
        /// </summary>
        [HttpGet("search")]
        [RequirePermission("organization.view")]
        public async Task<ActionResult<OrganizationListResponse>> SearchOrganizations(
            [FromQuery] string query, 
            [FromQuery] Guid? tenantId = null, 
            [FromQuery] int pageNumber = 1, 
            [FromQuery] int pageSize = 50)
        {
            try
            {
                var result = await _organizationService.SearchOrganizationsAsync(query, tenantId, pageNumber, pageSize);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching organizations");
                return StatusCode(500, new { message = "Error searching organizations", error = ex.Message });
            }
        }

        /// <summary>
        /// Get organizations by type
        /// </summary>
        [HttpGet("type/{type}")]
        [RequirePermission("organization.view")]
        public async Task<ActionResult> GetByType(string type, [FromQuery] Guid tenantId)
        {
            try
            {
                var organizations = await _organizationService.GetByTypeAsync(tenantId, type);
                return Ok(organizations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting organizations by type");
                return StatusCode(500, new { message = "Error retrieving organizations", error = ex.Message });
            }
        }
    }
}
