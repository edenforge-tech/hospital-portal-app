using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using AuthService.Authorization;
using AuthService.Models.Counselor;
using AuthService.Services;

namespace AuthService.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PackageManagementController : ControllerBase
    {
        private readonly IPackageManagementService _packageService;
        private readonly ILogger<PackageManagementController> _logger;

        public PackageManagementController(
            IPackageManagementService packageService,
            ILogger<PackageManagementController> logger)
        {
            _packageService = packageService;
            _logger = logger;
        }

        private Guid GetTenantId()
        {
            var tenantIdClaim = User.FindFirst("TenantId")?.Value;
            if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var tenantId))
            {
                throw new UnauthorizedAccessException("Tenant ID not found in token");
            }
            return tenantId;
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("User ID not found in token");
            }
            return userId;
        }

        // ============================================================================
        // SURGERY PACKAGE TEMPLATES
        // ============================================================================

        [HttpGet("templates")]
        [RequirePermission("package_templates.read")]
        public async Task<IActionResult> GetAllTemplates([FromQuery] string? packageCategory = null, [FromQuery] string? surgeryType = null, [FromQuery] bool? isActive = null)
        {
            try
            {
                var tenantId = GetTenantId();
                var templates = await _packageService.GetAllTemplatesAsync(tenantId, packageCategory, surgeryType, isActive);
                return Ok(templates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving surgery package templates");
                return StatusCode(500, new { message = "Error retrieving templates", error = ex.Message });
            }
        }

        [HttpGet("templates/{id}")]
        [RequirePermission("package_templates.read")]
        public async Task<IActionResult> GetTemplateById(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var template = await _packageService.GetTemplateByIdAsync(tenantId, id);
                
                if (template == null)
                    return NotFound(new { message = "Template not found" });
                
                return Ok(template);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving template {TemplateId}", id);
                return StatusCode(500, new { message = "Error retrieving template", error = ex.Message });
            }
        }

        [HttpPost("templates")]
        [RequirePermission("package_templates.create")]
        public async Task<IActionResult> CreateTemplate([FromBody] CreateSurgeryPackageTemplateRequest request)
        {
            try
            {
                var tenantId = GetTenantId();
                var currentUserId = GetCurrentUserId();
                
                request.TenantId = tenantId;
                
                var template = await _packageService.CreateTemplateAsync(request, currentUserId);
                return CreatedAtAction(nameof(GetTemplateById), new { id = template.Id }, template);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating template");
                return StatusCode(500, new { message = "Error creating template", error = ex.Message });
            }
        }

        [HttpPut("templates/{id}")]
        [RequirePermission("package_templates.update")]
        public async Task<IActionResult> UpdateTemplate(Guid id, [FromBody] UpdateSurgeryPackageTemplateRequest request)
        {
            try
            {
                var tenantId = GetTenantId();
                var currentUserId = GetCurrentUserId();
                
                var template = await _packageService.UpdateTemplateAsync(tenantId, id, request, currentUserId);
                return Ok(template);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating template {TemplateId}", id);
                return StatusCode(500, new { message = "Error updating template", error = ex.Message });
            }
        }

        [HttpDelete("templates/{id}")]
        [RequirePermission("package_templates.delete")]
        public async Task<IActionResult> DeleteTemplate(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var currentUserId = GetCurrentUserId();
                
                var result = await _packageService.DeleteTemplateAsync(tenantId, id, currentUserId);
                
                if (!result)
                    return NotFound(new { message = "Template not found" });
                
                return Ok(new { message = "Template deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting template {TemplateId}", id);
                return StatusCode(500, new { message = "Error deleting template", error = ex.Message });
            }
        }

        // ============================================================================
        // PACKAGE CATALOG ITEMS
        // ============================================================================

        [HttpGet("catalog-items")]
        [RequirePermission("package_catalog.read")]
        public async Task<IActionResult> GetAllCatalogItems([FromQuery] string? category = null, [FromQuery] bool? isActive = null)
        {
            try
            {
                var tenantId = GetTenantId();
                var items = await _packageService.GetAllCatalogItemsAsync(tenantId, category, isActive);
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving catalog items");
                return StatusCode(500, new { message = "Error retrieving catalog items", error = ex.Message });
            }
        }

        [HttpGet("catalog-items/{id}")]
        [RequirePermission("package_catalog.read")]
        public async Task<IActionResult> GetCatalogItemById(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var item = await _packageService.GetCatalogItemByIdAsync(tenantId, id);
                
                if (item == null)
                    return NotFound(new { message = "Catalog item not found" });
                
                return Ok(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving catalog item {ItemId}", id);
                return StatusCode(500, new { message = "Error retrieving catalog item", error = ex.Message });
            }
        }

        [HttpPost("catalog-items")]
        [RequirePermission("package_catalog.create")]
        public async Task<IActionResult> CreateCatalogItem([FromBody] CreatePackageCatalogItemRequest request)
        {
            try
            {
                var tenantId = GetTenantId();
                var currentUserId = GetCurrentUserId();
                
                request.TenantId = tenantId;
                
                var item = await _packageService.CreateCatalogItemAsync(request, currentUserId);
                return CreatedAtAction(nameof(GetCatalogItemById), new { id = item.Id }, item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating catalog item");
                return StatusCode(500, new { message = "Error creating catalog item", error = ex.Message });
            }
        }

        [HttpPut("catalog-items/{id}")]
        [RequirePermission("package_catalog.update")]
        public async Task<IActionResult> UpdateCatalogItem(Guid id, [FromBody] CreatePackageCatalogItemRequest request)
        {
            try
            {
                var tenantId = GetTenantId();
                var currentUserId = GetCurrentUserId();
                
                var item = await _packageService.UpdateCatalogItemAsync(tenantId, id, request, currentUserId);
                return Ok(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating catalog item {ItemId}", id);
                return StatusCode(500, new { message = "Error updating catalog item", error = ex.Message });
            }
        }

        [HttpDelete("catalog-items/{id}")]
        [RequirePermission("package_catalog.delete")]
        public async Task<IActionResult> DeleteCatalogItem(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var currentUserId = GetCurrentUserId();
                
                var result = await _packageService.DeleteCatalogItemAsync(tenantId, id, currentUserId);
                
                if (!result)
                    return NotFound(new { message = "Catalog item not found" });
                
                return Ok(new { message = "Catalog item deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting catalog item {ItemId}", id);
                return StatusCode(500, new { message = "Error deleting catalog item", error = ex.Message });
            }
        }

        // ============================================================================
        // COUNSELOR PACKAGES
        // ============================================================================

        [HttpGet("packages")]
        [RequirePermission("counselor_packages.read")]
        public async Task<IActionResult> GetAllPackages([FromQuery] PackageFilters filters)
        {
            try
            {
                var tenantId = GetTenantId();
                filters.TenantId = tenantId;
                
                var response = await _packageService.GetAllPackagesAsync(filters);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving packages");
                return StatusCode(500, new { message = "Error retrieving packages", error = ex.Message });
            }
        }

        [HttpGet("packages/{id}")]
        [RequirePermission("counselor_packages.read")]
        public async Task<IActionResult> GetPackageById(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var package = await _packageService.GetPackageByIdAsync(tenantId, id);
                
                if (package == null)
                    return NotFound(new { message = "Package not found" });
                
                return Ok(package);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving package {PackageId}", id);
                return StatusCode(500, new { message = "Error retrieving package", error = ex.Message });
            }
        }

        // Removed GetPackageByNumber - use GetPackageById instead

        [HttpPost("packages")]
        [RequirePermission("counselor_packages.create")]
        public async Task<IActionResult> CreatePackage([FromBody] CreateCounselorPackageRequest request)
        {
            try
            {
                var tenantId = GetTenantId();
                var currentUserId = GetCurrentUserId();
                
                request.TenantId = tenantId;
                
                var result = await _packageService.CreatePackageAsync(request, currentUserId);
                
                if (!result.Success)
                    return BadRequest(new { message = result.Message });
                
                return CreatedAtAction(nameof(GetPackageById), new { id = result.PackageId }, result.Package);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating package");
                return StatusCode(500, new { message = "Error creating package", error = ex.Message });
            }
        }

        [HttpPut("packages/{id}")]
        [RequirePermission("counselor_packages.update")]
        public async Task<IActionResult> UpdatePackage(Guid id, [FromBody] UpdateCounselorPackageRequest request)
        {
            try
            {
                var tenantId = GetTenantId();
                var currentUserId = GetCurrentUserId();
                
                var result = await _packageService.UpdatePackageAsync(tenantId, id, request, currentUserId);
                
                if (!result.Success)
                    return BadRequest(new { message = result.Message });
                
                return Ok(result.Package);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating package {PackageId}", id);
                return StatusCode(500, new { message = "Error updating package", error = ex.Message });
            }
        }

        [HttpPost("packages/{id}/finalize")]
        [RequirePermission("counselor_packages.finalize")]
        public async Task<IActionResult> FinalizePackage(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var currentUserId = GetCurrentUserId();
                
                var result = await _packageService.FinalizePackageAsync(tenantId, id, currentUserId);
                
                if (!result.Success)
                    return BadRequest(new { message = result.Message });
                
                return Ok(result.Package);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error finalizing package {PackageId}", id);
                return StatusCode(500, new { message = "Error finalizing package", error = ex.Message });
            }
        }

        [HttpDelete("packages/{id}")]
        [RequirePermission("counselor_packages.delete")]
        public async Task<IActionResult> DeletePackage(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var currentUserId = GetCurrentUserId();
                
                var result = await _packageService.DeletePackageAsync(tenantId, id, currentUserId);
                
                if (!result)
                    return NotFound(new { message = "Package not found" });
                
                return Ok(new { message = "Package deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting package {PackageId}", id);
                return StatusCode(500, new { message = "Error deleting package", error = ex.Message });
            }
        }

        [HttpPost("packages/{id}/recalculate")]
        [RequirePermission("counselor_packages.update")]
        public async Task<IActionResult> RecalculatePackageTotals(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var package = await _packageService.RecalculatePackageTotalsAsync(tenantId, id);
                return Ok(package);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recalculating package totals {PackageId}", id);
                return StatusCode(500, new { message = "Error recalculating totals", error = ex.Message });
            }
        }

        // ============================================================================
        // DISCOUNT APPROVALS
        // ============================================================================

        [HttpGet("discount-approvals")]
        [RequirePermission("discount_approvals.read")]
        public async Task<IActionResult> GetAllDiscountApprovals([FromQuery] string? status = null, [FromQuery] Guid? assignedToUserId = null, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                var tenantId = GetTenantId();
                var response = await _packageService.GetAllDiscountApprovalsAsync(tenantId, status, assignedToUserId, page, pageSize);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving discount approvals");
                return StatusCode(500, new { message = "Error retrieving discount approvals", error = ex.Message });
            }
        }

        [HttpGet("discount-approvals/{id}")]
        [RequirePermission("discount_approvals.read")]
        public async Task<IActionResult> GetDiscountApprovalById(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var approval = await _packageService.GetDiscountApprovalByIdAsync(tenantId, id);
                
                if (approval == null)
                    return NotFound(new { message = "Discount approval not found" });
                
                return Ok(approval);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving discount approval {ApprovalId}", id);
                return StatusCode(500, new { message = "Error retrieving discount approval", error = ex.Message });
            }
        }

        [HttpPost("discount-approvals/request")]
        [RequirePermission("discount_approvals.request")]
        public async Task<IActionResult> RequestDiscountApproval([FromBody] RequestDiscountApprovalRequest request)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var approval = await _packageService.RequestDiscountApprovalAsync(request, currentUserId);
                return CreatedAtAction(nameof(GetDiscountApprovalById), new { id = approval.Id }, approval);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error requesting discount approval");
                return StatusCode(500, new { message = "Error requesting discount approval", error = ex.Message });
            }
        }

        [HttpPost("discount-approvals/review")]
        [RequirePermission("discount_approvals.review")]
        public async Task<IActionResult> ReviewDiscount([FromBody] ReviewDiscountApprovalRequest request)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var approval = await _packageService.ReviewDiscountApprovalAsync(request, currentUserId);
                return Ok(approval);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reviewing discount approval");
                return StatusCode(500, new { message = "Error reviewing discount approval", error = ex.Message });
            }
        }

        [HttpPost("discount-approvals/{id}/escalate")]
        [RequirePermission("discount_approvals.escalate")]
        public async Task<IActionResult> EscalateApproval(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var currentUserId = GetCurrentUserId();
                var success = await _packageService.EscalateApprovalAsync(tenantId, id, currentUserId);
                
                if (!success)
                    return NotFound(new { message = "Approval not found or cannot be escalated" });
                
                return Ok(new { message = "Approval escalated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error escalating approval {ApprovalId}", id);
                return StatusCode(500, new { message = "Error escalating approval", error = ex.Message });
            }
        }

        [HttpPost("discount-approvals/{id}/cancel")]
        [RequirePermission("discount_approvals.cancel")]
        public async Task<IActionResult> CancelApproval(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var currentUserId = GetCurrentUserId();
                var success = await _packageService.CancelApprovalRequestAsync(tenantId, id, currentUserId);
                
                if (!success)
                    return NotFound(new { message = "Approval not found" });
                
                return Ok(new { message = "Approval cancelled successfully" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling approval {ApprovalId}", id);
                return StatusCode(500, new { message = "Error cancelling approval", error = ex.Message });
            }
        }

        [HttpGet("discount-approvals/pending-for-me")]
        [RequirePermission("discount_approvals.read")]
        public async Task<IActionResult> GetMyPendingApprovals()
        {
            try
            {
                var tenantId = GetTenantId();
                var currentUserId = GetCurrentUserId();
                var approvals = await _packageService.GetPendingApprovalsForUserAsync(tenantId, currentUserId);
                return Ok(approvals);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving pending approvals for current user");
                return StatusCode(500, new { message = "Error retrieving pending approvals", error = ex.Message });
            }
        }

        [HttpGet("discount-approvals/sla-breached")]
        [RequirePermission("discount_approvals.read")]
        public async Task<IActionResult> GetSlaBreachedApprovals()
        {
            try
            {
                var tenantId = GetTenantId();
                var approvals = await _packageService.GetSlaBreachedApprovalsAsync(tenantId);
                return Ok(approvals);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving SLA breached approvals");
                return StatusCode(500, new { message = "Error retrieving SLA breached approvals", error = ex.Message });
            }
        }

        // ============================================================================
        // UTILITY ENDPOINTS
        // ============================================================================

        [HttpPost("packages/calculate-total")]
        [RequirePermission("counselor_packages.create")]
        public async Task<IActionResult> CalculatePackageTotal([FromBody] List<CreateCounselorPackageItemRequest> items, [FromQuery] decimal discountPercentage = 0)
        {
            try
            {
                var total = await _packageService.CalculatePackageTotalAsync(items, discountPercentage);
                return Ok(new { total });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating package total");
                return StatusCode(500, new { message = "Error calculating total", error = ex.Message });
            }
        }
    }
}
