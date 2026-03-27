using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using AuthService.Authorization;
using AuthService.Models.Counselor;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PatientTypeWorkflowController : ControllerBase
    {
        private readonly IPatientTypeWorkflowService _service;
        private readonly ILogger<PatientTypeWorkflowController> _logger;

        public PatientTypeWorkflowController(IPatientTypeWorkflowService service, ILogger<PatientTypeWorkflowController> logger)
        {
            _service = service;
            _logger = logger;
        }

        private Guid GetTenantId()
        {
            var tenantIdClaim = User.FindFirst("TenantId")?.Value;
            return Guid.TryParse(tenantIdClaim, out var tenantId) ? tenantId : Guid.Empty;
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
        }

        // ==================== PATIENT TYPE CONFIGURATIONS ====================

        /// <summary>
        /// Get all patient type configurations
        /// </summary>
        [HttpGet("configurations")]
        [RequirePermission("patient_type_config.read")]
        public async Task<IActionResult> GetAllConfigurations([FromQuery] bool? isActive = null)
        {
            try
            {
                var tenantId = GetTenantId();
                var configs = await _service.GetAllConfigurationsAsync(tenantId, isActive);
                return Ok(configs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving patient type configurations");
                return StatusCode(500, new { message = "Error retrieving patient type configurations", error = ex.Message });
            }
        }

        /// <summary>
        /// Get patient type configuration by ID
        /// </summary>
        [HttpGet("configurations/{id}")]
        [RequirePermission("patient_type_config.read")]
        public async Task<IActionResult> GetConfigurationById(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var config = await _service.GetConfigurationByIdAsync(id, tenantId);
                
                if (config == null)
                    return NotFound(new { message = "Configuration not found" });

                return Ok(config);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving configuration {Id}", id);
                return StatusCode(500, new { message = "Error retrieving configuration", error = ex.Message });
            }
        }

        /// <summary>
        /// Get patient type configuration by patient type
        /// </summary>
        [HttpGet("configurations/by-type/{patientType}")]
        [RequirePermission("patient_type_config.read")]
        public async Task<IActionResult> GetConfigurationByType(string patientType)
        {
            try
            {
                var tenantId = GetTenantId();
                var config = await _service.GetConfigurationByTypeAsync(patientType, tenantId);
                
                if (config == null)
                    return NotFound(new { message = $"Configuration not found for patient type '{patientType}'" });

                return Ok(config);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving configuration for type {PatientType}", patientType);
                return StatusCode(500, new { message = "Error retrieving configuration", error = ex.Message });
            }
        }

        /// <summary>
        /// Create new patient type configuration
        /// </summary>
        [HttpPost("configurations")]
        [RequirePermission("patient_type_config.create")]
        public async Task<IActionResult> CreateConfiguration([FromBody] CreatePatientTypeConfigRequest request)
        {
            try
            {
                var tenantId = GetTenantId();
                var userId = GetCurrentUserId();
                var config = await _service.CreateConfigurationAsync(request, tenantId, userId);
                return CreatedAtAction(nameof(GetConfigurationById), new { id = config.Id }, config);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating patient type configuration");
                return StatusCode(500, new { message = "Error creating configuration", error = ex.Message });
            }
        }

        /// <summary>
        /// Update patient type configuration
        /// </summary>
        [HttpPut("configurations/{id}")]
        [RequirePermission("patient_type_config.update")]
        public async Task<IActionResult> UpdateConfiguration(Guid id, [FromBody] UpdatePatientTypeConfigRequest request)
        {
            try
            {
                var tenantId = GetTenantId();
                var userId = GetCurrentUserId();
                var config = await _service.UpdateConfigurationAsync(id, request, tenantId, userId);
                
                if (config == null)
                    return NotFound(new { message = "Configuration not found" });

                return Ok(config);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating configuration {Id}", id);
                return StatusCode(500, new { message = "Error updating configuration", error = ex.Message });
            }
        }

        /// <summary>
        /// Delete patient type configuration
        /// </summary>
        [HttpDelete("configurations/{id}")]
        [RequirePermission("patient_type_config.delete")]
        public async Task<IActionResult> DeleteConfiguration(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var deleted = await _service.DeleteConfigurationAsync(id, tenantId);
                
                if (!deleted)
                    return NotFound(new { message = "Configuration not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting configuration {Id}", id);
                return StatusCode(500, new { message = "Error deleting configuration", error = ex.Message });
            }
        }

        // ==================== DOCUMENT CHECKLIST ====================

        /// <summary>
        /// Get document checklist for a counseling session
        /// </summary>
        [HttpGet("checklist/session/{sessionId}")]
        [RequirePermission("document_checklist.read")]
        public async Task<IActionResult> GetSessionChecklist(Guid sessionId)
        {
            try
            {
                var tenantId = GetTenantId();
                var response = await _service.GetSessionChecklistAsync(sessionId, tenantId);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving checklist for session {SessionId}", sessionId);
                return StatusCode(500, new { message = "Error retrieving checklist", error = ex.Message });
            }
        }

        /// <summary>
        /// Get checklist item by ID
        /// </summary>
        [HttpGet("checklist/{id}")]
        [RequirePermission("document_checklist.read")]
        public async Task<IActionResult> GetChecklistItemById(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var item = await _service.GetChecklistItemByIdAsync(id, tenantId);
                
                if (item == null)
                    return NotFound(new { message = "Checklist item not found" });

                return Ok(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving checklist item {Id}", id);
                return StatusCode(500, new { message = "Error retrieving checklist item", error = ex.Message });
            }
        }

        /// <summary>
        /// Generate checklist from patient type configuration
        /// </summary>
        [HttpPost("checklist/generate")]
        [RequirePermission("document_checklist.create")]
        public async Task<IActionResult> GenerateChecklist([FromBody] GenerateChecklistRequest request)
        {
            try
            {
                var tenantId = GetTenantId();
                var userId = GetCurrentUserId();
                var response = await _service.GenerateChecklistFromConfigAsync(request, tenantId, userId);
                
                if (!response.Success)
                    return BadRequest(response);

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating checklist");
                return StatusCode(500, new { message = "Error generating checklist", error = ex.Message });
            }
        }

        /// <summary>
        /// Create new checklist item
        /// </summary>
        [HttpPost("checklist")]
        [RequirePermission("document_checklist.create")]
        public async Task<IActionResult> CreateChecklistItem([FromBody] CreateDocumentChecklistRequest request)
        {
            try
            {
                var tenantId = GetTenantId();
                var userId = GetCurrentUserId();
                var item = await _service.CreateChecklistItemAsync(request, tenantId, userId);
                return CreatedAtAction(nameof(GetChecklistItemById), new { id = item.Id }, item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating checklist item");
                return StatusCode(500, new { message = "Error creating checklist item", error = ex.Message });
            }
        }

        /// <summary>
        /// Update checklist item
        /// </summary>
        [HttpPut("checklist/{id}")]
        [RequirePermission("document_checklist.update")]
        public async Task<IActionResult> UpdateChecklistItem(Guid id, [FromBody] UpdateDocumentChecklistRequest request)
        {
            try
            {
                var tenantId = GetTenantId();
                var userId = GetCurrentUserId();
                var item = await _service.UpdateChecklistItemAsync(id, request, tenantId, userId);
                
                if (item == null)
                    return NotFound(new { message = "Checklist item not found" });

                return Ok(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating checklist item {Id}", id);
                return StatusCode(500, new { message = "Error updating checklist item", error = ex.Message });
            }
        }

        /// <summary>
        /// Upload document for checklist item
        /// </summary>
        [HttpPost("checklist/{id}/upload")]
        [RequirePermission("document_checklist.upload")]
        public async Task<IActionResult> UploadDocument(Guid id, [FromBody] UploadDocumentRequest request)
        {
            try
            {
                var tenantId = GetTenantId();
                var userId = GetCurrentUserId();
                var item = await _service.UploadDocumentAsync(id, request, tenantId, userId);
                
                if (item == null)
                    return NotFound(new { message = "Checklist item not found" });

                return Ok(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading document for checklist item {Id}", id);
                return StatusCode(500, new { message = "Error uploading document", error = ex.Message });
            }
        }

        /// <summary>
        /// Verify document for checklist item
        /// </summary>
        [HttpPost("checklist/{id}/verify")]
        [RequirePermission("document_checklist.verify")]
        public async Task<IActionResult> VerifyDocument(Guid id, [FromBody] VerifyDocumentChecklistRequest request)
        {
            try
            {
                var tenantId = GetTenantId();
                var userId = GetCurrentUserId();
                var item = await _service.VerifyDocumentAsync(id, request, tenantId, userId);
                
                if (item == null)
                    return NotFound(new { message = "Checklist item not found" });

                return Ok(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying document for checklist item {Id}", id);
                return StatusCode(500, new { message = "Error verifying document", error = ex.Message });
            }
        }

        /// <summary>
        /// Delete checklist item (soft delete)
        /// </summary>
        [HttpDelete("checklist/{id}")]
        [RequirePermission("document_checklist.delete")]
        public async Task<IActionResult> DeleteChecklistItem(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var deleted = await _service.DeleteChecklistItemAsync(id, tenantId);
                
                if (!deleted)
                    return NotFound(new { message = "Checklist item not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting checklist item {Id}", id);
                return StatusCode(500, new { message = "Error deleting checklist item", error = ex.Message });
            }
        }

        // ==================== CHECKLIST STATUS ====================

        /// <summary>
        /// Get checklist status summary for a session
        /// </summary>
        [HttpGet("checklist/session/{sessionId}/status")]
        [RequirePermission("document_checklist.read")]
        public async Task<IActionResult> GetChecklistStatus(Guid sessionId)
        {
            try
            {
                var tenantId = GetTenantId();
                var summary = await _service.GetChecklistStatusAsync(sessionId, tenantId);
                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving checklist status for session {SessionId}", sessionId);
                return StatusCode(500, new { message = "Error retrieving checklist status", error = ex.Message });
            }
        }
    }
}
