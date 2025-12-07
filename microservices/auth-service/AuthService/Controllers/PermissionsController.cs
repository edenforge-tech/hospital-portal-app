using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AuthService.Authorization;
using AuthService.Models.Permission;
using AuthService.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AuthService.Controllers
{
    /// <summary>
    /// Permission Management API
    /// Provides comprehensive permission operations including CRUD, matrix views, and access control
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PermissionsController : ControllerBase
    {
        private readonly IPermissionManagementService _permissionService;

        public PermissionsController(IPermissionManagementService permissionService)
        {
            _permissionService = permissionService;
        }

        #region CRUD Operations

        /// <summary>
        /// Get all permissions with filtering and pagination
        /// </summary>
        [HttpGet]
        [RequirePermission("permission.view")]
        public async Task<ActionResult<PermissionListResponse>> GetAll([FromQuery] PermissionFilters filters)
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"];
            var result = await _permissionService.GetAllAsync(tenantId, filters);
            return Ok(result);
        }

        /// <summary>
        /// Get permission by ID with full details
        /// </summary>
        [HttpGet("{id}")]
        [RequirePermission("permission.view")]
        public async Task<ActionResult<PermissionDetailsDto>> GetById(Guid id)
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"];
            var permission = await _permissionService.GetByIdAsync(tenantId, id);

            if (permission == null)
                return NotFound(new { Message = "Permission not found" });

            return Ok(permission);
        }

        /// <summary>
        /// Get permission by code
        /// </summary>
        [HttpGet("code/{code}")]
        [RequirePermission("permission.view")]
        public async Task<ActionResult<PermissionDetailsDto>> GetByCode(string code)
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"];
            var permission = await _permissionService.GetByCodeAsync(tenantId, code);

            if (permission == null)
                return NotFound(new { Message = $"Permission '{code}' not found" });

            return Ok(permission);
        }

        /// <summary>
        /// Create a new permission
        /// </summary>
        [HttpPost]
        [RequirePermission("permission.create")]
        public async Task<ActionResult<PermissionOperationResult>> Create([FromBody] CreatePermissionRequest request)
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"];
            var userId = (Guid)HttpContext.Items["UserId"];

            var result = await _permissionService.CreateAsync(tenantId, userId, request);

            if (!result.Success)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetById), new { id = result.PermissionId }, result);
        }

        /// <summary>
        /// Update an existing permission
        /// </summary>
        [HttpPut("{id}")]
        [RequirePermission("permission.update")]
        public async Task<ActionResult<PermissionOperationResult>> Update(Guid id, [FromBody] UpdatePermissionRequest request)
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"];
            var userId = (Guid)HttpContext.Items["UserId"];

            var result = await _permissionService.UpdateAsync(tenantId, userId, id, request);

            if (!result.Success)
            {
                if (result.Message.Contains("not found"))
                    return NotFound(result);
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Delete a permission (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        [RequirePermission("permission.delete")]
        public async Task<ActionResult<PermissionOperationResult>> Delete(Guid id)
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"];
            var userId = (Guid)HttpContext.Items["UserId"];

            var result = await _permissionService.DeleteAsync(tenantId, userId, id);

            if (!result.Success)
            {
                if (result.Message.Contains("not found"))
                    return NotFound(result);
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Activate or deactivate a permission
        /// </summary>
        [HttpPatch("{id}/status")]
        [RequirePermission("permission.manage")]
        public async Task<ActionResult<PermissionOperationResult>> SetActiveStatus(Guid id, [FromBody] bool isActive)
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"];
            var userId = (Guid)HttpContext.Items["UserId"];

            var result = await _permissionService.SetActiveStatusAsync(tenantId, userId, id, isActive);

            if (!result.Success)
            {
                if (result.Message.Contains("not found"))
                    return NotFound(result);
                return BadRequest(result);
            }

            return Ok(result);
        }

        #endregion

        #region Bulk Operations

        /// <summary>
        /// Bulk create permissions (resources x actions)
        /// </summary>
        [HttpPost("bulk-create")]
        [RequirePermission("permission.create")]
        public async Task<ActionResult<BulkPermissionOperationResult>> BulkCreate([FromBody] BulkCreatePermissionsRequest request)
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"];
            var userId = (Guid)HttpContext.Items["UserId"];

            var result = await _permissionService.BulkCreateAsync(tenantId, userId, request);
            return Ok(result);
        }

        /// <summary>
        /// Bulk activate/deactivate permissions
        /// </summary>
        [HttpPatch("bulk-status")]
        [RequirePermission("permission.manage")]
        public async Task<ActionResult<BulkPermissionOperationResult>> BulkSetStatus([FromBody] BulkSetStatusRequest request)
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"];
            var userId = (Guid)HttpContext.Items["UserId"];

            var result = await _permissionService.BulkSetActiveStatusAsync(tenantId, userId, request.PermissionIds, request.IsActive);
            return Ok(result);
        }

        #endregion

        #region Permission Matrix

        /// <summary>
        /// Get permission matrix (resources x actions grid)
        /// </summary>
        [HttpGet("matrix")]
        [RequirePermission("permission.view")]
        public async Task<ActionResult<PermissionMatrixDto>> GetPermissionMatrix([FromQuery] string module = null)
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"];
            var matrix = await _permissionService.GetPermissionMatrixAsync(tenantId, module);
            return Ok(matrix);
        }

        /// <summary>
        /// Get role permission matrix (all permissions for a role organized by module)
        /// </summary>
        [HttpGet("role/{roleId}/matrix")]
        [RequirePermission("permission.view")]
        public async Task<ActionResult<RolePermissionMatrixDto>> GetRolePermissionMatrix(Guid roleId)
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"];
            var matrix = await _permissionService.GetRolePermissionMatrixAsync(tenantId, roleId);

            if (matrix == null)
                return NotFound(new { Message = "Role not found" });

            return Ok(matrix);
        }

        /// <summary>
        /// Get permissions grouped by module
        /// </summary>
        [HttpGet("by-module")]
        [RequirePermission("permission.view")]
        public async Task<ActionResult<Dictionary<string, ModulePermissionsDto>>> GetPermissionsByModule()
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"];
            var result = await _permissionService.GetPermissionsByModuleAsync(tenantId);
            return Ok(result);
        }

        /// <summary>
        /// Get permissions for a specific module
        /// </summary>
        [HttpGet("module/{module}")]
        [RequirePermission("permission.view")]
        public async Task<ActionResult<List<PermissionDto>>> GetByModule(string module)
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"];
            var permissions = await _permissionService.GetByModuleAsync(tenantId, module);
            return Ok(permissions);
        }

        #endregion

        #region Resource-Based Operations

        /// <summary>
        /// Get all permissions for a specific resource type
        /// </summary>
        [HttpGet("resource/{resourceType}")]
        [RequirePermission("permission.view")]
        public async Task<ActionResult<ResourcePermissionDto>> GetResourcePermissions(string resourceType)
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"];
            var result = await _permissionService.GetResourcePermissionsAsync(tenantId, resourceType);
            return Ok(result);
        }

        /// <summary>
        /// Get resource permission templates (standard CRUD actions)
        /// </summary>
        [HttpGet("templates")]
        [RequirePermission("permission.view")]
        public async Task<ActionResult<List<ResourcePermissionTemplateDto>>> GetResourceTemplates()
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"];
            var templates = await _permissionService.GetResourceTemplatesAsync(tenantId);
            return Ok(templates);
        }

        #endregion

        #region Access Control

        /// <summary>
        /// Check if user has a specific permission with detailed context
        /// </summary>
        [HttpPost("check")]
        [RequirePermission("permission.view")]
        public async Task<ActionResult<PermissionCheckResult>> CheckPermission([FromBody] CheckPermissionRequest request)
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"];
            var result = await _permissionService.CheckPermissionAsync(tenantId, request);
            return Ok(result);
        }

        /// <summary>
        /// Check multiple permissions for a user (batch check)
        /// </summary>
        [HttpPost("check-multiple")]
        [RequirePermission("permission.view")]
        public async Task<ActionResult<Dictionary<string, PermissionCheckResult>>> CheckMultiplePermissions([FromBody] CheckMultiplePermissionsRequest request)
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"];
            var results = await _permissionService.CheckMultiplePermissionsAsync(tenantId, request.UserId, request.PermissionCodes);
            return Ok(results);
        }

        /// <summary>
        /// Get all permissions for a user with detailed information
        /// </summary>
        [HttpPost("user/permissions")]
        [RequirePermission("permission.view")]
        public async Task<ActionResult<UserPermissionsResponse>> GetUserPermissions([FromBody] GetUserPermissionsRequest request)
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"];
            var result = await _permissionService.GetUserPermissionsAsync(tenantId, request);
            return Ok(result);
        }

        /// <summary>
        /// Get permissions for a user by user ID (simple version)
        /// </summary>
        [HttpGet("user/{userId}")]
        [RequirePermission("permission.view")]
        public async Task<ActionResult<UserPermissionsResponse>> GetUserPermissionsById(Guid userId)
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"];
            var request = new GetUserPermissionsRequest
            {
                UserId = userId,
                IncludeInherited = true,
                IncludeExpired = false
            };
            var result = await _permissionService.GetUserPermissionsAsync(tenantId, request);
            return Ok(result);
        }

        #endregion

        #region Validation

        /// <summary>
        /// Check for permission conflicts
        /// </summary>
        [HttpGet("{id}/conflicts")]
        [RequirePermission("permission.view")]
        public async Task<ActionResult<PermissionConflictCheckDto>> CheckConflicts(Guid id)
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"];
            var result = await _permissionService.CheckConflictsAsync(tenantId, id);
            return Ok(result);
        }

        /// <summary>
        /// Validate permission dependencies
        /// </summary>
        [HttpGet("{id}/validate-dependencies")]
        [RequirePermission("permission.view")]
        public async Task<ActionResult<PermissionOperationResult>> ValidateDependencies(Guid id)
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"];
            var result = await _permissionService.ValidateDependenciesAsync(tenantId, id);
            return Ok(result);
        }

        #endregion

        #region Statistics

        /// <summary>
        /// Get permission statistics and analytics
        /// </summary>
        [HttpGet("statistics")]
        [RequirePermission("permission.view")]
        public async Task<ActionResult<PermissionStatistics>> GetStatistics()
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"];
            var stats = await _permissionService.GetStatisticsAsync(tenantId);
            return Ok(stats);
        }

        /// <summary>
        /// Search permissions by term
        /// </summary>
        [HttpGet("search")]
        [RequirePermission("permission.view")]
        public async Task<ActionResult<List<PermissionDto>>> Search([FromQuery] string query)
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"];
            var results = await _permissionService.SearchPermissionsAsync(tenantId, query);
            return Ok(results);
        }

        /// <summary>
        /// Get unused permissions (not assigned to any role)
        /// </summary>
        [HttpGet("unused")]
        [RequirePermission("permission.view")]
        public async Task<ActionResult<List<PermissionDto>>> GetUnused()
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"];
            var unused = await _permissionService.GetUnusedPermissionsAsync(tenantId);
            return Ok(unused);
        }

        #endregion

        #region Export

        /// <summary>
        /// Generate comprehensive permission report
        /// </summary>
        [HttpGet("report")]
        [RequirePermission("permission.view")]
        public async Task<ActionResult<PermissionReportDto>> GenerateReport([FromQuery] PermissionFilters filters)
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"];
            var report = await _permissionService.GenerateReportAsync(tenantId, filters);
            report.GeneratedBy = ((Guid)HttpContext.Items["UserId"]).ToString();
            return Ok(report);
        }

        /// <summary>
        /// Export permissions to CSV/JSON/Excel
        /// </summary>
        [HttpPost("export")]
        [RequirePermission("permission.view")]
        public async Task<IActionResult> Export([FromBody] ExportPermissionsRequest request)
        {
            var tenantId = (Guid)HttpContext.Items["TenantId"];
            var data = await _permissionService.ExportPermissionsAsync(tenantId, request);

            var contentType = request.Format.ToLower() switch
            {
                "json" => "application/json",
                "csv" => "text/csv",
                "excel" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                _ => "application/octet-stream"
            };

            var fileName = $"permissions_{DateTime.UtcNow:yyyyMMdd_HHmmss}.{request.Format.ToLower()}";

            return File(data, contentType, fileName);
        }

        #endregion
    }

    #region Helper Request Models

    /// <summary>
    /// Request to bulk set permission status
    /// </summary>
    public class BulkSetStatusRequest
    {
        public List<Guid> PermissionIds { get; set; }
        public bool IsActive { get; set; }
    }

    /// <summary>
    /// Request to check multiple permissions at once
    /// </summary>
    public class CheckMultiplePermissionsRequest
    {
        public Guid UserId { get; set; }
        public List<string> PermissionCodes { get; set; }
    }

    #endregion
}
