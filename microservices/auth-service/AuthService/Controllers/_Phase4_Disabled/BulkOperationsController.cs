using AuthService.Models.BulkOperations;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BulkOperationsController : ControllerBase
    {
        private readonly IBulkOperationsService _bulkOperationsService;
        private readonly ILogger<BulkOperationsController> _logger;

        public BulkOperationsController(
            IBulkOperationsService bulkOperationsService,
            ILogger<BulkOperationsController> logger)
        {
            _bulkOperationsService = bulkOperationsService;
            _logger = logger;
        }

        // User Bulk Operations

        /// <summary>
        /// Bulk create users
        /// </summary>
        [HttpPost("users/create")]
        [ProducesResponseType(typeof(BulkOperationResponse<BulkUserCreate>), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> BulkCreateUsers([FromBody] BulkCreateUsersRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _bulkOperationsService.BulkCreateUsersAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk create users");
                return StatusCode(500, new { message = "Error in bulk create users", error = ex.Message });
            }
        }

        /// <summary>
        /// Bulk update users
        /// </summary>
        [HttpPut("users/update")]
        [ProducesResponseType(typeof(BulkOperationResponse<object>), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> BulkUpdateUsers([FromBody] BulkUpdateUsersRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _bulkOperationsService.BulkUpdateUsersAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk update users");
                return StatusCode(500, new { message = "Error in bulk update users", error = ex.Message });
            }
        }

        /// <summary>
        /// Bulk delete users
        /// </summary>
        [HttpDelete("users/delete")]
        [ProducesResponseType(typeof(BulkOperationResponse<int>), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> BulkDeleteUsers([FromBody] BulkDeleteRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _bulkOperationsService.BulkDeleteUsersAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk delete users");
                return StatusCode(500, new { message = "Error in bulk delete users", error = ex.Message });
            }
        }

        // Role Assignment Operations

        /// <summary>
        /// Bulk assign roles to users
        /// </summary>
        [HttpPost("roles/assign")]
        [ProducesResponseType(typeof(BulkOperationResponse<object>), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> BulkAssignRoles([FromBody] BulkRoleAssignmentRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _bulkOperationsService.BulkAssignRolesAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk assign roles");
                return StatusCode(500, new { message = "Error in bulk assign roles", error = ex.Message });
            }
        }

        /// <summary>
        /// Bulk remove roles from users
        /// </summary>
        [HttpPost("roles/remove")]
        [ProducesResponseType(typeof(BulkOperationResponse<object>), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> BulkRemoveRoles([FromBody] BulkRoleAssignmentRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _bulkOperationsService.BulkRemoveRolesAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk remove roles");
                return StatusCode(500, new { message = "Error in bulk remove roles", error = ex.Message });
            }
        }

        // Permission Assignment Operations

        /// <summary>
        /// Bulk assign permissions to roles
        /// </summary>
        [HttpPost("permissions/assign")]
        [ProducesResponseType(typeof(BulkOperationResponse<object>), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> BulkAssignPermissions([FromBody] BulkPermissionAssignmentRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _bulkOperationsService.BulkAssignPermissionsAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk assign permissions");
                return StatusCode(500, new { message = "Error in bulk assign permissions", error = ex.Message });
            }
        }

        /// <summary>
        /// Bulk remove permissions from roles
        /// </summary>
        [HttpPost("permissions/remove")]
        [ProducesResponseType(typeof(BulkOperationResponse<object>), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> BulkRemovePermissions([FromBody] BulkPermissionAssignmentRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _bulkOperationsService.BulkRemovePermissionsAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk remove permissions");
                return StatusCode(500, new { message = "Error in bulk remove permissions", error = ex.Message });
            }
        }

        // Status Change Operations

        /// <summary>
        /// Bulk change status for entities
        /// </summary>
        [HttpPut("status/change")]
        [ProducesResponseType(typeof(BulkOperationResponse<object>), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> BulkChangeStatus([FromBody] BulkStatusChangeRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _bulkOperationsService.BulkChangeStatusAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk change status");
                return StatusCode(500, new { message = "Error in bulk change status", error = ex.Message });
            }
        }

        // Import/Export Operations

        /// <summary>
        /// Bulk import data from file
        /// </summary>
        [HttpPost("import")]
        [ProducesResponseType(typeof(BulkOperationResponse<object>), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> BulkImport([FromBody] BulkImportRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _bulkOperationsService.BulkImportAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk import");
                return StatusCode(500, new { message = "Error in bulk import", error = ex.Message });
            }
        }

        /// <summary>
        /// Bulk export data to file
        /// </summary>
        [HttpPost("export")]
        [ProducesResponseType(typeof(FileContentResult), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> BulkExport([FromBody] BulkExportRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _bulkOperationsService.BulkExportAsync(request);

                return File(result.Data, result.ContentType, result.FileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk export");
                return StatusCode(500, new { message = "Error in bulk export", error = ex.Message });
            }
        }

        // Validation

        /// <summary>
        /// Validate a bulk operation before execution
        /// </summary>
        [HttpPost("validate")]
        [ProducesResponseType(typeof(BulkValidationResult), 200)]
        public async Task<IActionResult> ValidateBulkOperation([FromBody] BulkOperationRequest<object> request)
        {
            try
            {
                var result = await _bulkOperationsService.ValidateBulkOperationAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating bulk operation");
                return StatusCode(500, new { message = "Error validating bulk operation", error = ex.Message });
            }
        }

        // Progress Tracking

        /// <summary>
        /// Get progress of a bulk operation job
        /// </summary>
        [HttpGet("jobs/{jobId}/progress")]
        [ProducesResponseType(typeof(BulkOperationProgress), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetOperationProgress(string jobId)
        {
            try
            {
                var progress = await _bulkOperationsService.GetOperationProgressAsync(jobId);
                
                if (progress == null)
                    return NotFound(new { message = "Job not found" });

                return Ok(progress);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving operation progress");
                return StatusCode(500, new { message = "Error retrieving operation progress", error = ex.Message });
            }
        }

        /// <summary>
        /// Get all active bulk operation jobs
        /// </summary>
        [HttpGet("jobs/active")]
        [ProducesResponseType(typeof(List<BulkOperationJob>), 200)]
        public async Task<IActionResult> GetActiveJobs()
        {
            try
            {
                var jobs = await _bulkOperationsService.GetActiveJobsAsync();
                return Ok(jobs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active jobs");
                return StatusCode(500, new { message = "Error retrieving active jobs", error = ex.Message });
            }
        }

        /// <summary>
        /// Get details of a specific job
        /// </summary>
        [HttpGet("jobs/{jobId}")]
        [ProducesResponseType(typeof(BulkOperationJob), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetJobDetails(string jobId)
        {
            try
            {
                var job = await _bulkOperationsService.GetJobDetailsAsync(jobId);
                
                if (job == null)
                    return NotFound(new { message = "Job not found" });

                return Ok(job);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving job details");
                return StatusCode(500, new { message = "Error retrieving job details", error = ex.Message });
            }
        }

        // Job Management

        /// <summary>
        /// Cancel a running bulk operation job
        /// </summary>
        [HttpPost("jobs/{jobId}/cancel")]
        [ProducesResponseType(200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> CancelJob(string jobId)
        {
            try
            {
                var cancelled = await _bulkOperationsService.CancelJobAsync(jobId);
                
                if (!cancelled)
                    return NotFound(new { message = "Job not found or cannot be cancelled" });

                return Ok(new { message = "Job cancelled successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling job");
                return StatusCode(500, new { message = "Error cancelling job", error = ex.Message });
            }
        }

        /// <summary>
        /// Get bulk operation job history
        /// </summary>
        [HttpGet("jobs/history")]
        [ProducesResponseType(typeof(List<BulkOperationJob>), 200)]
        public async Task<IActionResult> GetJobHistory([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            try
            {
                var jobs = await _bulkOperationsService.GetJobHistoryAsync(fromDate, toDate);
                return Ok(jobs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving job history");
                return StatusCode(500, new { message = "Error retrieving job history", error = ex.Message });
            }
        }

        // Generic Operations

        /// <summary>
        /// Execute a generic bulk operation
        /// </summary>
        [HttpPost("execute")]
        [ProducesResponseType(typeof(BulkOperationResponse<object>), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> ExecuteBulkOperation([FromBody] BulkOperationRequest<object> request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _bulkOperationsService.ExecuteBulkOperationAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing bulk operation");
                return StatusCode(500, new { message = "Error executing bulk operation", error = ex.Message });
            }
        }
    }
}
