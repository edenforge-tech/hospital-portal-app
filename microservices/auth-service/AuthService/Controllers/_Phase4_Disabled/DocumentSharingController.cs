using AuthService.Models.DocumentSharing;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DocumentSharingController : ControllerBase
    {
        private readonly IDocumentSharingService _documentSharingService;
        private readonly ILogger<DocumentSharingController> _logger;

        public DocumentSharingController(
            IDocumentSharingService documentSharingService,
            ILogger<DocumentSharingController> logger)
        {
            _documentSharingService = documentSharingService;
            _logger = logger;
        }

        // Document Type Endpoints

        /// <summary>
        /// Get all document types with filtering and pagination
        /// </summary>
        [HttpGet("document-types")]
        [ProducesResponseType(typeof(DocumentTypeListResponse), 200)]
        public async Task<IActionResult> GetAllDocumentTypes([FromQuery] DocumentTypeFilters filters)
        {
            try
            {
                var response = await _documentSharingService.GetAllDocumentTypesAsync(filters);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving document types");
                return StatusCode(500, new { message = "Error retrieving document types", error = ex.Message });
            }
        }

        /// <summary>
        /// Get document type by ID
        /// </summary>
        [HttpGet("document-types/{id}")]
        [ProducesResponseType(typeof(DocumentTypeDetailsDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetDocumentTypeById(int id)
        {
            try
            {
                var documentType = await _documentSharingService.GetDocumentTypeByIdAsync(id);
                
                if (documentType == null)
                    return NotFound(new { message = "Document type not found" });

                return Ok(documentType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving document type {DocumentTypeId}", id);
                return StatusCode(500, new { message = "Error retrieving document type", error = ex.Message });
            }
        }

        /// <summary>
        /// Get document type by code
        /// </summary>
        [HttpGet("document-types/by-code/{typeCode}")]
        [ProducesResponseType(typeof(DocumentTypeDetailsDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetDocumentTypeByCode(string typeCode)
        {
            try
            {
                var documentType = await _documentSharingService.GetDocumentTypeByCodeAsync(typeCode);
                
                if (documentType == null)
                    return NotFound(new { message = "Document type not found" });

                return Ok(documentType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving document type by code {TypeCode}", typeCode);
                return StatusCode(500, new { message = "Error retrieving document type", error = ex.Message });
            }
        }

        /// <summary>
        /// Create a new document type
        /// </summary>
        [HttpPost("document-types")]
        [ProducesResponseType(typeof(DocumentTypeOperationResult), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> CreateDocumentType([FromBody] CreateDocumentTypeRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _documentSharingService.CreateDocumentTypeAsync(request);

                if (!result.Success)
                    return BadRequest(result);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating document type");
                return StatusCode(500, new { message = "Error creating document type", error = ex.Message });
            }
        }

        /// <summary>
        /// Update an existing document type
        /// </summary>
        [HttpPut("document-types/{id}")]
        [ProducesResponseType(typeof(DocumentTypeOperationResult), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> UpdateDocumentType(int id, [FromBody] UpdateDocumentTypeRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _documentSharingService.UpdateDocumentTypeAsync(id, request);

                if (!result.Success)
                {
                    if (result.Errors?.Contains("Not found") == true)
                        return NotFound(result);
                    return BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating document type {DocumentTypeId}", id);
                return StatusCode(500, new { message = "Error updating document type", error = ex.Message });
            }
        }

        /// <summary>
        /// Delete a document type (soft delete)
        /// </summary>
        [HttpDelete("document-types/{id}")]
        [ProducesResponseType(typeof(DocumentTypeOperationResult), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeleteDocumentType(int id)
        {
            try
            {
                var result = await _documentSharingService.DeleteDocumentTypeAsync(id);

                if (!result.Success)
                {
                    if (result.Errors?.Contains("Not found") == true)
                        return NotFound(result);
                    return BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting document type {DocumentTypeId}", id);
                return StatusCode(500, new { message = "Error deleting document type", error = ex.Message });
            }
        }

        /// <summary>
        /// Search document types
        /// </summary>
        [HttpGet("document-types/search")]
        [ProducesResponseType(typeof(List<DocumentTypeDto>), 200)]
        public async Task<IActionResult> SearchDocumentTypes([FromQuery] string searchTerm)
        {
            try
            {
                var results = await _documentSharingService.SearchDocumentTypesAsync(searchTerm);
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching document types");
                return StatusCode(500, new { message = "Error searching document types", error = ex.Message });
            }
        }

        // Access Rule Endpoints

        /// <summary>
        /// Get all access rules with filtering and pagination
        /// </summary>
        [HttpGet("access-rules")]
        [ProducesResponseType(typeof(DocumentAccessRuleListResponse), 200)]
        public async Task<IActionResult> GetAllAccessRules([FromQuery] DocumentAccessRuleFilters filters)
        {
            try
            {
                var response = await _documentSharingService.GetAllAccessRulesAsync(filters);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving access rules");
                return StatusCode(500, new { message = "Error retrieving access rules", error = ex.Message });
            }
        }

        /// <summary>
        /// Get access rule by ID
        /// </summary>
        [HttpGet("access-rules/{id}")]
        [ProducesResponseType(typeof(DocumentAccessRuleDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetAccessRuleById(int id)
        {
            try
            {
                var accessRule = await _documentSharingService.GetAccessRuleByIdAsync(id);
                
                if (accessRule == null)
                    return NotFound(new { message = "Access rule not found" });

                return Ok(accessRule);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving access rule {RuleId}", id);
                return StatusCode(500, new { message = "Error retrieving access rule", error = ex.Message });
            }
        }

        /// <summary>
        /// Get access rules by document type
        /// </summary>
        [HttpGet("access-rules/by-document-type/{documentTypeId}")]
        [ProducesResponseType(typeof(List<DocumentAccessRuleDto>), 200)]
        public async Task<IActionResult> GetAccessRulesByDocumentType(int documentTypeId)
        {
            try
            {
                var accessRules = await _documentSharingService.GetAccessRulesByDocumentTypeAsync(documentTypeId);
                return Ok(accessRules);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving access rules for document type {DocumentTypeId}", documentTypeId);
                return StatusCode(500, new { message = "Error retrieving access rules", error = ex.Message });
            }
        }

        /// <summary>
        /// Create a new access rule
        /// </summary>
        [HttpPost("access-rules")]
        [ProducesResponseType(typeof(DocumentAccessRuleOperationResult), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> CreateAccessRule([FromBody] CreateDocumentAccessRuleRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _documentSharingService.CreateAccessRuleAsync(request);

                if (!result.Success)
                    return BadRequest(result);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating access rule");
                return StatusCode(500, new { message = "Error creating access rule", error = ex.Message });
            }
        }

        /// <summary>
        /// Update an existing access rule
        /// </summary>
        [HttpPut("access-rules/{id}")]
        [ProducesResponseType(typeof(DocumentAccessRuleOperationResult), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> UpdateAccessRule(int id, [FromBody] UpdateDocumentAccessRuleRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _documentSharingService.UpdateAccessRuleAsync(id, request);

                if (!result.Success)
                {
                    if (result.Errors?.Contains("Not found") == true)
                        return NotFound(result);
                    return BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating access rule {RuleId}", id);
                return StatusCode(500, new { message = "Error updating access rule", error = ex.Message });
            }
        }

        /// <summary>
        /// Delete an access rule (soft delete)
        /// </summary>
        [HttpDelete("access-rules/{id}")]
        [ProducesResponseType(typeof(DocumentAccessRuleOperationResult), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeleteAccessRule(int id)
        {
            try
            {
                var result = await _documentSharingService.DeleteAccessRuleAsync(id);

                if (!result.Success)
                {
                    if (result.Errors?.Contains("Not found") == true)
                        return NotFound(result);
                    return BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting access rule {RuleId}", id);
                return StatusCode(500, new { message = "Error deleting access rule", error = ex.Message });
            }
        }

        /// <summary>
        /// Bulk create access rules
        /// </summary>
        [HttpPost("access-rules/bulk")]
        [ProducesResponseType(typeof(BulkOperationResult), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> BulkCreateAccessRules([FromBody] BulkCreateAccessRulesRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _documentSharingService.BulkCreateAccessRulesAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk create access rules");
                return StatusCode(500, new { message = "Error in bulk create access rules", error = ex.Message });
            }
        }

        // Access Control Endpoints

        /// <summary>
        /// Check document access for a user
        /// </summary>
        [HttpPost("access-rules/check-access")]
        [ProducesResponseType(typeof(DocumentAccessCheckResult), 200)]
        public async Task<IActionResult> CheckDocumentAccess([FromBody] DocumentAccessCheckRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _documentSharingService.CheckDocumentAccessAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking document access");
                return StatusCode(500, new { message = "Error checking document access", error = ex.Message });
            }
        }

        /// <summary>
        /// Get user permissions for a document type
        /// </summary>
        [HttpGet("access-rules/user-permissions/{userId}/{documentTypeId}")]
        [ProducesResponseType(typeof(List<string>), 200)]
        public async Task<IActionResult> GetUserPermissionsForDocumentType(int userId, int documentTypeId)
        {
            try
            {
                var permissions = await _documentSharingService.GetUserPermissionsForDocumentTypeAsync(userId, documentTypeId);
                return Ok(permissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user permissions");
                return StatusCode(500, new { message = "Error retrieving user permissions", error = ex.Message });
            }
        }

        // Statistics Endpoint

        /// <summary>
        /// Get document sharing statistics
        /// </summary>
        [HttpGet("statistics")]
        [ProducesResponseType(typeof(DocumentSharingStatistics), 200)]
        public async Task<IActionResult> GetStatistics()
        {
            try
            {
                var statistics = await _documentSharingService.GetStatisticsAsync();
                return Ok(statistics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving statistics");
                return StatusCode(500, new { message = "Error retrieving statistics", error = ex.Message });
            }
        }
    }
}
