using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AuthService.Authorization;
using AuthService.Context;
using AuthService.Models.Domain;
using AuthService.Models.PatientType;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AuthService.Controllers
{
    /// <summary>
    /// API endpoints for patient type configurations
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/patient-type-configurations")]
    public class PatientTypeConfigurationsController : ControllerBase
    {
        private readonly IPatientTypeConfigurationsService _service;
        private readonly AppDbContext _context;
        private readonly ILogger<PatientTypeConfigurationsController> _logger;

        public PatientTypeConfigurationsController(
            IPatientTypeConfigurationsService service,
            AppDbContext context,
            ILogger<PatientTypeConfigurationsController> logger)
        {
            _service = service;
            _context = context;
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

        /// <summary>
        /// Get all active patient type configurations
        /// </summary>
        /// <returns>List of patient type configurations</returns>
        [HttpGet]
        [ProducesResponseType(typeof(List<PatientTypeConfigDto>), 200)]
        public async Task<IActionResult> GetAllConfigurations()
        {
            try
            {
                var tenantId = GetTenantId();
                var configs = await _service.GetAllActiveAsync(tenantId);
                
                _logger.LogInformation("Retrieved {Count} patient type configurations for tenant {TenantId}", configs.Count, tenantId);
                
                return Ok(configs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving patient type configurations");
                return StatusCode(500, new { message = "Error retrieving patient type configurations", error = ex.Message });
            }
        }

        /// <summary>
        /// Get configuration for a specific patient type
        /// </summary>
        /// <param name="patientType">Patient type (Cash, Insurance, CGHS, etc.)</param>
        /// <returns>Patient type configuration</returns>
        [HttpGet("{patientType}")]
        [ProducesResponseType(typeof(PatientTypeConfigDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetConfigurationByType(string patientType)
        {
            try
            {
                var tenantId = GetTenantId();
                var config = await _service.GetByTypeAsync(tenantId, patientType);
                
                if (config == null)
                {
                    return NotFound(new { message = $"Configuration not found for patient type: {patientType}" });
                }
                
                _logger.LogInformation("Retrieved configuration for patient type {PatientType} in tenant {TenantId}", patientType, tenantId);
                
                return Ok(config);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving configuration for patient type {PatientType}", patientType);
                return StatusCode(500, new { message = "Error retrieving patient type configuration", error = ex.Message });
            }
        }

        /// <summary>
        /// Validate if a patient type is valid
        /// </summary>
        /// <param name="patientType">Patient type to validate</param>
        /// <returns>Validation result</returns>
        [HttpGet("validate/{patientType}")]
        [ProducesResponseType(typeof(object), 200)]
        public async Task<IActionResult> ValidatePatientType(string patientType)
        {
            try
            {
                var isValid = await _service.IsValidPatientTypeAsync(patientType);
                
                return Ok(new { 
                    patientType, 
                    isValid, 
                    message = isValid ? "Valid patient type" : "Invalid patient type" 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating patient type {PatientType}", patientType);
                return StatusCode(500, new { message = "Error validating patient type", error = ex.Message });
            }
        }

        /// <summary>
        /// TEMPORARY: Seed patient type configurations for current tenant
        /// </summary>
        [HttpPost("seed/{tenantId}")]
        [AllowAnonymous]
        [ProducesResponseType(200)]
        public async Task<IActionResult> SeedPatientTypes(Guid tenantId)
        {
            try
            {
                _logger.LogInformation("🌱 Seeding patient type configurations for tenant {TenantId}", tenantId);

                // Define the 8 patient types
                var patientTypesData = new Dictionary<string, (string DisplayName, string Description, string ConfigJson, int Order)>
                {
                    ["Cash"] = ("Cash Patient", "Direct payment by patient", 
                        "{\"requires_advance_payment\": true, \"advance_percentage\": 50, \"required_documents\": [\"ID Proof\", \"Address Proof\"], \"skip_insurance\": true, \"billing_mode\": \"direct\"}", 1),
                    ["Insurance"] = ("Insurance Patient", "Insurance company cashless treatment", 
                        "{\"requires_pre_authorization\": true, \"max_pre_auth_wait_hours\": 72, \"required_documents\": [\"Insurance Card\", \"Policy Document\", \"ID Proof\", \"Employer Letter\"], \"skip_advance_if_approved\": true, \"billing_mode\": \"cashless\"}", 2),
                    ["CoPay"] = ("Co-Pay Patient", "Insurance with patient co-payment", 
                        "{\"requires_pre_authorization\": true, \"patient_pays_percentage\": 20, \"required_documents\": [\"Insurance Card\", \"ID Proof\"], \"copay_due_at\": \"admission\", \"billing_mode\": \"split\"}", 3),
                    ["ESH"] = ("ESH (Employee State Health)", "ESH government scheme", 
                        "{\"requires_claim_form\": true, \"claim_forms\": [\"ESH Form 1\", \"ESH Form 2\"], \"required_documents\": [\"ESH Card\", \"Employee ID\", \"Salary Slip\"], \"zero_advance_payment\": true, \"billing_mode\": \"direct_billing\"}", 4),
                    ["CGHS"] = ("CGHS (Central Govt Health Scheme)", "CGHS government scheme", 
                        "{\"requires_pre_approval\": true, \"approval_authority\": \"CGHS Wellness Center\", \"required_documents\": [\"CGHS Card\", \"Referral from CGHS Dispensary\"], \"zero_advance_payment\": true, \"billing_mode\": \"reimbursement\"}", 5),
                    ["Arograshree"] = ("Arograshree (Karnataka State Scheme)", "Karnataka state health scheme for BPL families", 
                        "{\"requires_pre_approval\": true, \"approval_authority\": \"District Health Officer\", \"income_certificate_required\": true, \"required_documents\": [\"Income Certificate\", \"Ration Card\", \"ID Proof\"], \"zero_advance_payment\": true, \"billing_mode\": \"government_reimbursement\"}", 6),
                    ["SGHS"] = ("SGHS (State Govt Health Scheme)", "State government employee health scheme", 
                        "{\"requires_departmental_approval\": true, \"required_documents\": [\"SGHS Card\", \"Employee ID\"], \"zero_advance_payment\": true, \"billing_mode\": \"direct_billing\"}", 7),
                    ["Camp"] = ("Camp Patient (Sponsored)", "Free surgery camp sponsored by NGO/CSR", 
                        "{\"zero_cost_surgery\": true, \"sponsor\": \"NGO/CSR\", \"required_documents\": [\"Camp Registration Form\", \"Income Certificate\"], \"zero_advance_payment\": true, \"billing_mode\": \"sponsored\"}", 8)
                };

                // WORKAROUND: Due to global unique constraint on patient_type (not tenant-scoped),
                // we need to find existing records regardless of tenant and reassign them
                var allExisting = await _context.PatientTypeConfigurations
                    .ToListAsync();
                
                _logger.LogInformation("Found {Count} total patient type configurations in database", allExisting.Count);

                var existingByType = allExisting.ToDictionary(e => e.PatientType, e => e);
                var reassignedCount = 0;
                var updatedCount = 0;

                // Update ALL existing records to use the requested tenant
                foreach (var (patientType, data) in patientTypesData)
                {
                    if (existingByType.ContainsKey(patientType))
                    {
                        var record = existingByType[patientType];
                        
                        // Check if it belongs to a different tenant
                        if (record.TenantId != tenantId)
                        {
                            _logger.LogInformation("Reassigning {PatientType} from tenant {OldTenant} to {NewTenant}", 
                                patientType, record.TenantId, tenantId);
                            record.TenantId = tenantId;
                            reassignedCount++;
                        }
                        
                        // Update configuration
                        record.DisplayName = data.DisplayName;
                        record.Description = data.Description;
                        record.ConfigurationJson = data.ConfigJson;
                        record.DisplayOrder = data.Order;
                        record.IsActive = true;
                        record.UpdatedAt = DateTime.UtcNow;
                        updatedCount++;
                    }
                    else
                    {
                        // This shouldn't happen if constraint is working, but just in case
                        _logger.LogWarning("Patient type {PatientType} not found in database - cannot create due to constraint", patientType);
                    }
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("✅ Seeded patient types: Updated={Updated}, Reassigned={Reassigned}", 
                    updatedCount, reassignedCount);

                return Ok(new { 
                    message = $"Successfully seeded {patientTypesData.Count} patient type configurations",
                    tenantId = tenantId,
                    updated = updatedCount,
                    reassigned = reassignedCount,
                    patientTypes = patientTypesData.Keys.ToList()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error seeding patient type configurations");
                
                var innerError = ex.InnerException?.Message ?? ex.Message;
                return StatusCode(500, new { 
                    message = "Error seeding patient types", 
                    error = ex.Message,
                    innerError = innerError
                });
            }
        }
        
        /// <summary>
        /// DIAGNOSTIC: Check count of patient type configurations  
        /// </summary>
        [HttpGet("diagnostic/count/{tenantId}")]
        [AllowAnonymous]
        [ProducesResponseType(200)]
        public async Task<IActionResult> GetConfigCount(Guid tenantId)
        {
            try
            {
                var count = await _context.PatientTypeConfigurations
                    .Where(c => c.TenantId == tenantId && c.IsActive)
                    .CountAsync();
                    
                var all = await _context.PatientTypeConfigurations
                    .Where(c => c.TenantId == tenantId)
                    .Select(c => new { c.PatientType, c.DisplayName, c.IsActive })
                    .ToListAsync();
                
                return Ok(new {
                    tenantId,
                    activeCount = count,
                    totalCount = all.Count,
                    configurations = all
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error checking config count", error = ex.Message });
            }
        }
    }
}
