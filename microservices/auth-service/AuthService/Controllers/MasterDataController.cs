using AuthService.Authorization;
using AuthService.Models.Domain;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace AuthService.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class MasterDataController : ControllerBase
    {
        private readonly IMasterDataService _masterDataService;
        private readonly IInventoryAvailabilityService _inventoryService;
        private readonly ILogger<MasterDataController> _logger;

        public MasterDataController(
            IMasterDataService masterDataService,
            IInventoryAvailabilityService inventoryService,
            ILogger<MasterDataController> logger)
        {
            _masterDataService = masterDataService;
            _inventoryService = inventoryService;
            _logger = logger;
        }

        /// <summary>
        /// Get all insurance providers for the current tenant
        /// </summary>
        [HttpGet("insurance-providers")]
        [RequirePermission("masterdata.view")]
        public async Task<IActionResult> GetInsuranceProviders()
        {
            try
            {
                var tenantId = GetTenantIdFromClaims();
                if (tenantId == Guid.Empty)
                {
                    return BadRequest(new { message = "Tenant ID not found" });
                }

                var providers = await _masterDataService.GetInsuranceProvidersAsync(tenantId);
                return Ok(providers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting insurance providers");
                return StatusCode(500, new { message = "Error retrieving insurance providers", error = ex.Message });
            }
        }

        /// <summary>
        /// Get insurance provider by ID
        /// </summary>
        [HttpGet("insurance-providers/{id:guid}")]
        [RequirePermission("masterdata.view")]
        public async Task<IActionResult> GetInsuranceProviderById(Guid id)
        {
            try
            {
                var provider = await _masterDataService.GetInsuranceProviderByIdAsync(id);
                if (provider == null)
                {
                    return NotFound(new { message = "Insurance provider not found" });
                }
                return Ok(provider);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting insurance provider {Id}", id);
                return StatusCode(500, new { message = "Error retrieving insurance provider", error = ex.Message });
            }
        }

        /// <summary>
        /// Get all TPA providers for the current tenant
        /// </summary>
        [HttpGet("tpa-providers")]
        [RequirePermission("masterdata.view")]
        public async Task<IActionResult> GetTpaProviders()
        {
            try
            {
                var tenantId = GetTenantIdFromClaims();
                if (tenantId == Guid.Empty)
                {
                    return BadRequest(new { message = "Tenant ID not found" });
                }

                var providers = await _masterDataService.GetTpaProvidersAsync(tenantId);
                return Ok(providers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting TPA providers");
                return StatusCode(500, new { message = "Error retrieving TPA providers", error = ex.Message });
            }
        }

        /// <summary>
        /// Get TPA provider by ID
        /// </summary>
        [HttpGet("tpa-providers/{id:guid}")]
        [RequirePermission("masterdata.view")]
        public async Task<IActionResult> GetTpaProviderById(Guid id)
        {
            try
            {
                var provider = await _masterDataService.GetTpaProviderByIdAsync(id);
                if (provider == null)
                {
                    return NotFound(new { message = "TPA provider not found" });
                }
                return Ok(provider);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting TPA provider {Id}", id);
                return StatusCode(500, new { message = "Error retrieving TPA provider", error = ex.Message });
            }
        }

        /// <summary>
        /// Get all anesthesia types for the current tenant
        /// </summary>
        [HttpGet("anesthesia-types")]
        [RequirePermission("masterdata.view")]
        public async Task<IActionResult> GetAnesthesiaTypes()
        {
            try
            {
                var tenantId = GetTenantIdFromClaims();
                if (tenantId == Guid.Empty)
                {
                    return BadRequest(new { message = "Tenant ID not found" });
                }

                var anesthesiaTypes = await _masterDataService.GetAnesthesiaTypesAsync(tenantId);
                return Ok(anesthesiaTypes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting anesthesia types");
                return StatusCode(500, new { message = "Error retrieving anesthesia types", error = ex.Message });
            }
        }

        /// <summary>
        /// Get anesthesia type by ID
        /// </summary>
        [HttpGet("anesthesia-types/{id:guid}")]
        [RequirePermission("masterdata.view")]
        public async Task<IActionResult> GetAnesthesiaTypeById(Guid id)
        {
            try
            {
                var anesthesiaType = await _masterDataService.GetAnesthesiaTypeByIdAsync(id);
                if (anesthesiaType == null)
                {
                    return NotFound(new { message = "Anesthesia type not found" });
                }
                return Ok(anesthesiaType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting anesthesia type {Id}", id);
                return StatusCode(500, new { message = "Error retrieving anesthesia type", error = ex.Message });
            }
        }

        /// <summary>
        /// Get all government schemes for the current tenant
        /// </summary>
        [HttpGet("government-schemes")]
        [RequirePermission("masterdata.view")]
        public async Task<IActionResult> GetGovernmentSchemes()
        {
            try
            {
                var tenantId = GetTenantIdFromClaims();
                if (tenantId == Guid.Empty)
                {
                    return BadRequest(new { message = "Tenant ID not found" });
                }

                var schemes = await _masterDataService.GetGovernmentSchemesAsync(tenantId);
                return Ok(schemes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting government schemes");
                return StatusCode(500, new { message = "Error retrieving government schemes", error = ex.Message });
            }
        }

        /// <summary>
        /// Get government scheme by ID
        /// </summary>
        [HttpGet("government-schemes/{id:guid}")]
        [RequirePermission("masterdata.view")]
        public async Task<IActionResult> GetGovernmentSchemeById(Guid id)
        {
            try
            {
                var scheme = await _masterDataService.GetGovernmentSchemeByIdAsync(id);
                if (scheme == null)
                {
                    return NotFound(new { message = "Government scheme not found" });
                }
                return Ok(scheme);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting government scheme {Id}", id);
                return StatusCode(500, new { message = "Error retrieving government scheme", error = ex.Message });
            }
        }

        // IOL catalog and surgery-types endpoints removed — replaced by /api/servicecatalog/* endpoints

        /// <summary>
        /// Calculate total package cost including surgery + IOL + consultation
        /// </summary>
        /// <param name="request">Package cost calculation request</param>
        [HttpPost("calculate-package-cost")]
        [RequirePermission("masterdata.view")]
        public async Task<IActionResult> CalculatePackageCost([FromBody] PackageCostRequest request)
        {
            try
            {
                var tenantId = GetTenantIdFromClaims();
                if (tenantId == Guid.Empty)
                {
                    return BadRequest(new { message = "Tenant ID not found" });
                }

                if (request.BranchId == Guid.Empty || request.SurgeryTypeId == Guid.Empty)
                {
                    return BadRequest(new { message = "BranchId and SurgeryTypeId are required" });
                }

                var calculation = await _masterDataService.CalculatePackageCostAsync(
                    tenantId,
                    request.BranchId,
                    request.SurgeryTypeId,
                    request.IolCatalogId,
                    request.DoctorId);

                return Ok(calculation);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError(ex, "Invalid operation calculating package cost");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating package cost");
                return StatusCode(500, new { message = "Error calculating package cost", error = ex.Message });
            }
        }

        /// <summary>
        /// Get consultation fee with priority-based lookup
        /// </summary>
        /// <param name="branchId">Branch ID (required)</param>
        /// <param name="doctorId">Optional: Doctor ID for doctor-specific charges</param>
        /// <param name="departmentId">Optional: Department ID for department-wide charges</param>
        /// <param name="specialty">Optional: Specialty for specialty-based charges</param>
        /// <param name="isEmergency">Is this an emergency consultation?</param>
        /// <param name="isFollowUp">Is this a follow-up consultation?</param>
        [HttpGet("consultation-fee")]
        [RequirePermission("masterdata.view")]
        public async Task<IActionResult> GetConsultationFee(
            [FromQuery] Guid branchId,
            [FromQuery] Guid? doctorId = null,
            [FromQuery] Guid? departmentId = null,
            [FromQuery] string? specialty = null,
            [FromQuery] bool isEmergency = false,
            [FromQuery] bool isFollowUp = false)
        {
            try
            {
                var tenantId = GetTenantIdFromClaims();
                if (tenantId == Guid.Empty)
                {
                    return BadRequest(new { message = "Tenant ID not found" });
                }

                if (branchId == Guid.Empty)
                {
                    return BadRequest(new { message = "BranchId is required" });
                }

                var fee = await _masterDataService.GetConsultationFeeAsync(
                    tenantId, branchId, doctorId, departmentId, specialty, isEmergency, isFollowUp);

                if (fee == null)
                {
                    return NotFound(new { message = "No consultation charges configured for the specified criteria" });
                }

                return Ok(new 
                { 
                    consultationFee = fee,
                    currencyCode = "INR",
                    isEmergency,
                    isFollowUp,
                    appliedFor = new { doctorId, departmentId, specialty }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting consultation fee");
                return StatusCode(500, new { message = "Error retrieving consultation fee", error = ex.Message });
            }
        }

        /// <summary>
        /// Get all consultation charges for a branch
        /// </summary>
        [HttpGet("consultation-charges")]
        [RequirePermission("masterdata.view")]
        public async Task<IActionResult> GetConsultationCharges([FromQuery] Guid branchId)
        {
            try
            {
                var tenantId = GetTenantIdFromClaims();
                if (tenantId == Guid.Empty)
                {
                    return BadRequest(new { message = "Tenant ID not found" });
                }

                if (branchId == Guid.Empty)
                {
                    return BadRequest(new { message = "BranchId is required" });
                }

                var charges = await _masterDataService.GetConsultationChargesAsync(tenantId, branchId);
                return Ok(new 
                { 
                    data = charges,
                    count = charges.Count,
                    branchId
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting consultation charges");
                return StatusCode(500, new { message = "Error retrieving consultation charges", error = ex.Message });
            }
        }

        /// <summary>
        /// Get IOL availability at a specific branch (Phase 3 Enhancement)
        /// </summary>
        /// <param name="iolCatalogId">IOL Catalog ID</param>
        /// <param name="branchId">Branch ID (optional, uses current user's branch if not specified)</param>
        [HttpGet("iol-availability/{iolCatalogId:guid}")]
        [RequirePermission("counselor.sessions.view")]
        public async Task<IActionResult> GetIolAvailability(Guid iolCatalogId, [FromQuery] Guid? branchId = null)
        {
            try
            {
                var tenantId = GetTenantIdFromClaims();
                if (tenantId == Guid.Empty)
                {
                    return BadRequest(new { message = "Tenant ID not found" });
                }

                // Use provided branchId or get from user claims
                var effectiveBranchId = branchId ?? GetBranchIdFromClaims();
                if (effectiveBranchId == Guid.Empty)
                {
                    return BadRequest(new { message = "Branch ID not found" });
                }

                var availability = await _inventoryService.GetIolAvailabilityAsync(tenantId, effectiveBranchId, iolCatalogId);
                return Ok(availability);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting IOL availability for {IolId}", iolCatalogId);
                return StatusCode(500, new { message = "Error retrieving IOL availability", error = ex.Message });
            }
        }

        /// <summary>
        /// Get IOL availability across all branches (Phase 3 Enhancement)
        /// </summary>
        /// <param name="iolCatalogId">IOL Catalog ID</param>
        [HttpGet("iol-availability-across-branches/{iolCatalogId:guid}")]
        [RequirePermission("counselor.sessions.view")]
        public async Task<IActionResult> GetIolAvailabilityAcrossBranches(Guid iolCatalogId)
        {
            try
            {
                var tenantId = GetTenantIdFromClaims();
                if (tenantId == Guid.Empty)
                {
                    return BadRequest(new { message = "Tenant ID not found" });
                }

                var availabilityList = await _inventoryService.GetIolAvailabilityAcrossBranchesAsync(tenantId, iolCatalogId);
                
                // Mark current user's branch
                var currentBranchId = GetBranchIdFromClaims();
                foreach (var item in availabilityList)
                {
                    item.IsCurrentBranch = item.BranchId == currentBranchId;
                }

                return Ok(new 
                { 
                    data = availabilityList,
                    count = availabilityList.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting IOL availability across branches for {IolId}", iolCatalogId);
                return StatusCode(500, new { message = "Error retrieving IOL availability", error = ex.Message });
            }
        }

        private Guid GetBranchIdFromClaims()
        {
            var branchIdClaim = User.FindFirst("branch_id")?.Value;
            if (!string.IsNullOrEmpty(branchIdClaim) && Guid.TryParse(branchIdClaim, out var branchId))
            {
                return branchId;
            }
            return Guid.Empty;
        }

        private Guid GetTenantIdFromClaims()
        {
            var tenantIdClaim = User.FindFirst("tenant_id")?.Value;
            if (!string.IsNullOrEmpty(tenantIdClaim) && Guid.TryParse(tenantIdClaim, out var tenantId))
            {
                return tenantId;
            }
            return Guid.Empty;
        }
    }

    /// <summary>
    /// Request model for package cost calculation
    /// </summary>
    public class PackageCostRequest
    {
        public Guid BranchId { get; set; }
        public Guid SurgeryTypeId { get; set; }
        public Guid? IolCatalogId { get; set; }
        public Guid? DoctorId { get; set; }
    }
}
