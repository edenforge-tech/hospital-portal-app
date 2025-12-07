using AuthService.Models.SystemSettings;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SystemSettingsController : ControllerBase
    {
        private readonly ISystemSettingsService _systemSettingsService;
        private readonly ILogger<SystemSettingsController> _logger;

        public SystemSettingsController(
            ISystemSettingsService systemSettingsService,
            ILogger<SystemSettingsController> logger)
        {
            _systemSettingsService = systemSettingsService;
            _logger = logger;
        }

        // Configuration CRUD Endpoints

        /// <summary>
        /// Get all system configurations with filtering and pagination
        /// </summary>
        [HttpGet("configurations")]
        [ProducesResponseType(typeof(SystemConfigurationListResponse), 200)]
        public async Task<IActionResult> GetAllConfigurations([FromQuery] SystemConfigurationFilters filters)
        {
            try
            {
                var response = await _systemSettingsService.GetAllConfigurationsAsync(filters);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving system configurations");
                return StatusCode(500, new { message = "Error retrieving system configurations", error = ex.Message });
            }
        }

        /// <summary>
        /// Get configuration by ID
        /// </summary>
        [HttpGet("configurations/{id}")]
        [ProducesResponseType(typeof(SystemConfigurationDetailsDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetConfigurationById(int id)
        {
            try
            {
                var configuration = await _systemSettingsService.GetConfigurationByIdAsync(id);
                
                if (configuration == null)
                    return NotFound(new { message = "Configuration not found" });

                return Ok(configuration);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving configuration {ConfigurationId}", id);
                return StatusCode(500, new { message = "Error retrieving configuration", error = ex.Message });
            }
        }

        /// <summary>
        /// Get configuration by key
        /// </summary>
        [HttpGet("configurations/by-key/{configKey}")]
        [ProducesResponseType(typeof(SystemConfigurationDetailsDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetConfigurationByKey(string configKey)
        {
            try
            {
                var configuration = await _systemSettingsService.GetConfigurationByKeyAsync(configKey);
                
                if (configuration == null)
                    return NotFound(new { message = "Configuration not found" });

                return Ok(configuration);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving configuration by key {ConfigKey}", configKey);
                return StatusCode(500, new { message = "Error retrieving configuration", error = ex.Message });
            }
        }

        /// <summary>
        /// Create a new configuration
        /// </summary>
        [HttpPost("configurations")]
        [ProducesResponseType(typeof(SystemConfigurationOperationResult), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> CreateConfiguration([FromBody] CreateSystemConfigurationRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _systemSettingsService.CreateConfigurationAsync(request);

                if (!result.Success)
                    return BadRequest(result);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating configuration");
                return StatusCode(500, new { message = "Error creating configuration", error = ex.Message });
            }
        }

        /// <summary>
        /// Update an existing configuration
        /// </summary>
        [HttpPut("configurations/{id}")]
        [ProducesResponseType(typeof(SystemConfigurationOperationResult), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> UpdateConfiguration(int id, [FromBody] UpdateSystemConfigurationRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _systemSettingsService.UpdateConfigurationAsync(id, request);

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
                _logger.LogError(ex, "Error updating configuration {ConfigurationId}", id);
                return StatusCode(500, new { message = "Error updating configuration", error = ex.Message });
            }
        }

        /// <summary>
        /// Delete a configuration (soft delete)
        /// </summary>
        [HttpDelete("configurations/{id}")]
        [ProducesResponseType(typeof(SystemConfigurationOperationResult), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeleteConfiguration(int id)
        {
            try
            {
                var result = await _systemSettingsService.DeleteConfigurationAsync(id);

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
                _logger.LogError(ex, "Error deleting configuration {ConfigurationId}", id);
                return StatusCode(500, new { message = "Error deleting configuration", error = ex.Message });
            }
        }

        // Bulk Operations

        /// <summary>
        /// Bulk update configurations
        /// </summary>
        [HttpPut("configurations/bulk")]
        [ProducesResponseType(typeof(SystemConfigurationOperationResult), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> BulkUpdateConfigurations([FromBody] BulkUpdateConfigurationsRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _systemSettingsService.BulkUpdateConfigurationsAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk update configurations");
                return StatusCode(500, new { message = "Error in bulk update configurations", error = ex.Message });
            }
        }

        // Grouping and Organization

        /// <summary>
        /// Get configurations by group/category
        /// </summary>
        [HttpGet("configurations/by-group")]
        [ProducesResponseType(typeof(List<ConfigurationGroup>), 200)]
        public async Task<IActionResult> GetConfigurationsByGroup([FromQuery] string? category = null)
        {
            try
            {
                var groups = await _systemSettingsService.GetConfigurationsByGroupAsync(category);
                return Ok(groups);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving configurations by group");
                return StatusCode(500, new { message = "Error retrieving configurations by group", error = ex.Message });
            }
        }

        /// <summary>
        /// Get configuration values for multiple keys
        /// </summary>
        [HttpPost("configurations/values")]
        [ProducesResponseType(typeof(Dictionary<string, object>), 200)]
        public async Task<IActionResult> GetConfigurationValues([FromBody] List<string> configKeys)
        {
            try
            {
                var values = await _systemSettingsService.GetConfigurationValuesAsync(configKeys);
                return Ok(values);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving configuration values");
                return StatusCode(500, new { message = "Error retrieving configuration values", error = ex.Message });
            }
        }

        // Import/Export

        /// <summary>
        /// Export configurations
        /// </summary>
        [HttpPost("configurations/export")]
        [ProducesResponseType(typeof(FileContentResult), 200)]
        public async Task<IActionResult> ExportConfigurations([FromBody] ConfigurationExportRequest request)
        {
            try
            {
                var data = await _systemSettingsService.ExportConfigurationsAsync(request);
                
                var contentType = request.Format.ToLower() switch
                {
                    "csv" => "text/csv",
                    "json" => "application/json",
                    "xml" => "application/xml",
                    _ => "application/octet-stream"
                };

                var fileName = $"configurations_export.{request.Format.ToLower()}";

                return File(data, contentType, fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting configurations");
                return StatusCode(500, new { message = "Error exporting configurations", error = ex.Message });
            }
        }

        /// <summary>
        /// Import configurations
        /// </summary>
        [HttpPost("configurations/import")]
        [ProducesResponseType(typeof(SystemConfigurationOperationResult), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> ImportConfigurations([FromBody] ConfigurationImportRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _systemSettingsService.ImportConfigurationsAsync(request);

                if (!result.Success)
                    return BadRequest(result);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error importing configurations");
                return StatusCode(500, new { message = "Error importing configurations", error = ex.Message });
            }
        }

        // Validation

        /// <summary>
        /// Validate a configuration value
        /// </summary>
        [HttpPost("configurations/validate")]
        [ProducesResponseType(typeof(ConfigurationValidationResult), 200)]
        public async Task<IActionResult> ValidateConfiguration([FromBody] ValidateConfigurationRequest request)
        {
            try
            {
                var result = await _systemSettingsService.ValidateConfigurationAsync(
                    request.ConfigKey, 
                    request.ConfigValue, 
                    request.ConfigType);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating configuration");
                return StatusCode(500, new { message = "Error validating configuration", error = ex.Message });
            }
        }

        // History

        /// <summary>
        /// Get configuration change history
        /// </summary>
        [HttpGet("configurations/{id}/history")]
        [ProducesResponseType(typeof(List<ConfigurationHistoryDto>), 200)]
        public async Task<IActionResult> GetConfigurationHistory(int id)
        {
            try
            {
                var history = await _systemSettingsService.GetConfigurationHistoryAsync(id);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving configuration history");
                return StatusCode(500, new { message = "Error retrieving configuration history", error = ex.Message });
            }
        }

        // Statistics

        /// <summary>
        /// Get configuration statistics
        /// </summary>
        [HttpGet("statistics")]
        [ProducesResponseType(typeof(ConfigurationStatistics), 200)]
        public async Task<IActionResult> GetStatistics()
        {
            try
            {
                var statistics = await _systemSettingsService.GetStatisticsAsync();
                return Ok(statistics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving statistics");
                return StatusCode(500, new { message = "Error retrieving statistics", error = ex.Message });
            }
        }
    }

    // Helper request model for validation endpoint
    public class ValidateConfigurationRequest
    {
        public string ConfigKey { get; set; } = string.Empty;
        public string ConfigValue { get; set; } = string.Empty;
        public string ConfigType { get; set; } = string.Empty;
    }
}
