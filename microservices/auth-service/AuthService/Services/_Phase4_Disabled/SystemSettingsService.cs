using AuthService.Context;
using AuthService.Models.Domain;
using AuthService.Models.SystemSettings;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.Json;

namespace AuthService.Services
{
    public class SystemSettingsService : ISystemSettingsService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<SystemSettingsService> _logger;

        public SystemSettingsService(AppDbContext context, ILogger<SystemSettingsService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<SystemConfigurationListResponse> GetAllConfigurationsAsync(SystemConfigurationFilters filters)
        {
            try
            {
                var query = _context.SystemConfigurations.AsQueryable();

                // Apply filters
                if (!string.IsNullOrWhiteSpace(filters.Search))
                {
                    query = query.Where(sc => sc.ConfigKey.Contains(filters.Search) ||
                                             sc.DisplayName.Contains(filters.Search) ||
                                             sc.Description.Contains(filters.Search));
                }

                if (!string.IsNullOrWhiteSpace(filters.Category))
                {
                    query = query.Where(sc => sc.Category == filters.Category);
                }

                if (!string.IsNullOrWhiteSpace(filters.ConfigType))
                {
                    query = query.Where(sc => sc.ConfigType == filters.ConfigType);
                }

                if (filters.IsSystemConfig.HasValue)
                {
                    query = query.Where(sc => sc.IsSystemConfig == filters.IsSystemConfig.Value);
                }

                if (!string.IsNullOrWhiteSpace(filters.Status))
                {
                    query = query.Where(sc => sc.Status == filters.Status);
                }

                // Total count
                var totalCount = await query.CountAsync();

                // Pagination
                var configurations = await query
                    .OrderBy(sc => sc.Category)
                    .ThenBy(sc => sc.DisplayName)
                    .Skip((filters.PageNumber - 1) * filters.PageSize)
                    .Take(filters.PageSize)
                    .ToListAsync();

                // Map to DTOs
                var configurationDtos = configurations.Select(MapToDto).ToList();

                // Calculate breakdowns
                var allConfigs = await _context.SystemConfigurations.ToListAsync();
                var typeBreakdown = allConfigs.GroupBy(sc => sc.ConfigType)
                    .ToDictionary(g => g.Key, g => g.Count());
                var statusBreakdown = allConfigs.GroupBy(sc => sc.Status)
                    .ToDictionary(g => g.Key, g => g.Count());

                return new SystemConfigurationListResponse
                {
                    Items = configurationDtos,
                    TotalCount = totalCount,
                    PageNumber = filters.PageNumber,
                    PageSize = filters.PageSize,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)filters.PageSize),
                    TypeBreakdown = typeBreakdown,
                    StatusBreakdown = statusBreakdown
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving system configurations");
                throw;
            }
        }

        public async Task<SystemConfigurationDetailsDto?> GetConfigurationByIdAsync(int configurationId)
        {
            try
            {
                var configuration = await _context.SystemConfigurations
                    .FirstOrDefaultAsync(sc => sc.Id == configurationId);

                if (configuration == null)
                    return null;

                return MapToDetailsDto(configuration);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving configuration {ConfigurationId}", configurationId);
                throw;
            }
        }

        public async Task<SystemConfigurationDetailsDto?> GetConfigurationByKeyAsync(string configKey)
        {
            try
            {
                var configuration = await _context.SystemConfigurations
                    .FirstOrDefaultAsync(sc => sc.ConfigKey == configKey);

                if (configuration == null)
                    return null;

                return MapToDetailsDto(configuration);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving configuration by key {ConfigKey}", configKey);
                throw;
            }
        }

        public async Task<SystemConfigurationOperationResult> CreateConfigurationAsync(CreateSystemConfigurationRequest request)
        {
            try
            {
                // Check for duplicate key
                var existingConfig = await _context.SystemConfigurations
                    .FirstOrDefaultAsync(sc => sc.ConfigKey == request.ConfigKey && sc.TenantId == request.TenantId);

                if (existingConfig != null)
                {
                    return new SystemConfigurationOperationResult
                    {
                        Success = false,
                        Message = "A configuration with this key already exists",
                        Errors = new List<string> { "Duplicate ConfigKey" }
                    };
                }

                // Validate configuration value
                var validationResult = await ValidateConfigurationAsync(request.ConfigKey, request.ConfigValue, request.ConfigType);
                if (!validationResult.IsValid)
                {
                    return new SystemConfigurationOperationResult
                    {
                        Success = false,
                        Message = "Configuration validation failed",
                        Errors = validationResult.Errors
                    };
                }

                var configuration = new SystemConfiguration
                {
                    TenantId = request.TenantId,
                    ConfigKey = request.ConfigKey,
                    ConfigValue = request.ConfigValue,
                    DisplayName = request.DisplayName,
                    Description = request.Description,
                    ConfigType = request.ConfigType,
                    Category = request.Category,
                    IsSystemConfig = request.IsSystemConfig,
                    EditableBy = request.EditableBy ?? new List<string>(),
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = request.CreatedBy
                };

                _context.SystemConfigurations.Add(configuration);
                await _context.SaveChangesAsync();

                return new SystemConfigurationOperationResult
                {
                    Success = true,
                    Message = "Configuration created successfully",
                    ConfigurationId = configuration.Id
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating configuration");
                return new SystemConfigurationOperationResult
                {
                    Success = false,
                    Message = "Error creating configuration",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<SystemConfigurationOperationResult> UpdateConfigurationAsync(int configurationId, UpdateSystemConfigurationRequest request)
        {
            try
            {
                var configuration = await _context.SystemConfigurations.FindAsync(configurationId);
                if (configuration == null)
                {
                    return new SystemConfigurationOperationResult
                    {
                        Success = false,
                        Message = "Configuration not found",
                        Errors = new List<string> { "Not found" }
                    };
                }

                // Check if system config and protected
                if (configuration.IsSystemConfig && !request.AllowSystemConfigUpdate)
                {
                    return new SystemConfigurationOperationResult
                    {
                        Success = false,
                        Message = "System configurations cannot be modified",
                        Errors = new List<string> { "Protected system configuration" }
                    };
                }

                // Validate configuration value
                var validationResult = await ValidateConfigurationAsync(configuration.ConfigKey, request.ConfigValue, request.ConfigType);
                if (!validationResult.IsValid)
                {
                    return new SystemConfigurationOperationResult
                    {
                        Success = false,
                        Message = "Configuration validation failed",
                        Errors = validationResult.Errors
                    };
                }

                // Update fields
                configuration.ConfigValue = request.ConfigValue;
                configuration.DisplayName = request.DisplayName;
                configuration.Description = request.Description;
                configuration.ConfigType = request.ConfigType;
                configuration.Category = request.Category;
                configuration.EditableBy = request.EditableBy ?? configuration.EditableBy;
                configuration.Status = request.Status;
                configuration.UpdatedAt = DateTime.UtcNow;
                configuration.UpdatedBy = request.UpdatedBy;

                await _context.SaveChangesAsync();

                return new SystemConfigurationOperationResult
                {
                    Success = true,
                    Message = "Configuration updated successfully",
                    ConfigurationId = configuration.Id
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating configuration {ConfigurationId}", configurationId);
                return new SystemConfigurationOperationResult
                {
                    Success = false,
                    Message = "Error updating configuration",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<SystemConfigurationOperationResult> DeleteConfigurationAsync(int configurationId)
        {
            try
            {
                var configuration = await _context.SystemConfigurations.FindAsync(configurationId);
                if (configuration == null)
                {
                    return new SystemConfigurationOperationResult
                    {
                        Success = false,
                        Message = "Configuration not found",
                        Errors = new List<string> { "Not found" }
                    };
                }

                // Cannot delete system configurations
                if (configuration.IsSystemConfig)
                {
                    return new SystemConfigurationOperationResult
                    {
                        Success = false,
                        Message = "System configurations cannot be deleted",
                        Errors = new List<string> { "Protected system configuration" }
                    };
                }

                // Soft delete
                configuration.Status = "Inactive";
                configuration.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return new SystemConfigurationOperationResult
                {
                    Success = true,
                    Message = "Configuration deleted successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting configuration {ConfigurationId}", configurationId);
                return new SystemConfigurationOperationResult
                {
                    Success = false,
                    Message = "Error deleting configuration",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<SystemConfigurationOperationResult> BulkUpdateConfigurationsAsync(BulkUpdateConfigurationsRequest request)
        {
            try
            {
                var errors = new List<string>();
                var successCount = 0;

                foreach (var update in request.Configurations)
                {
                    var configuration = await _context.SystemConfigurations
                        .FirstOrDefaultAsync(sc => sc.ConfigKey == update.ConfigKey);

                    if (configuration == null)
                    {
                        errors.Add($"Configuration not found: {update.ConfigKey}");
                        continue;
                    }

                    // Validate
                    var validationResult = await ValidateConfigurationAsync(update.ConfigKey, update.ConfigValue, configuration.ConfigType);
                    if (!validationResult.IsValid)
                    {
                        errors.AddRange(validationResult.Errors);
                        continue;
                    }

                    configuration.ConfigValue = update.ConfigValue;
                    configuration.UpdatedAt = DateTime.UtcNow;
                    configuration.UpdatedBy = request.UpdatedBy;
                    successCount++;
                }

                await _context.SaveChangesAsync();

                return new SystemConfigurationOperationResult
                {
                    Success = errors.Count == 0,
                    Message = $"Updated {successCount} of {request.Configurations.Count} configurations",
                    Errors = errors
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk update configurations");
                return new SystemConfigurationOperationResult
                {
                    Success = false,
                    Message = "Error in bulk update",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<List<ConfigurationGroup>> GetConfigurationsByGroupAsync(string? category = null)
        {
            try
            {
                var query = _context.SystemConfigurations
                    .Where(sc => sc.Status == "Active");

                if (!string.IsNullOrWhiteSpace(category))
                {
                    query = query.Where(sc => sc.Category == category);
                }

                var configurations = await query.ToListAsync();

                var groups = configurations
                    .GroupBy(sc => sc.Category)
                    .Select(g => new ConfigurationGroup
                    {
                        Category = g.Key,
                        Configurations = g.Select(MapToDto).ToList()
                    })
                    .ToList();

                return groups;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving configurations by group");
                throw;
            }
        }

        public async Task<Dictionary<string, object>> GetConfigurationValuesAsync(List<string> configKeys)
        {
            try
            {
                var configurations = await _context.SystemConfigurations
                    .Where(sc => configKeys.Contains(sc.ConfigKey))
                    .ToListAsync();

                var result = new Dictionary<string, object>();

                foreach (var config in configurations)
                {
                    var typedValue = ConvertConfigValue(config.ConfigValue, config.ConfigType);
                    result[config.ConfigKey] = typedValue;
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving configuration values");
                throw;
            }
        }

        public async Task<byte[]> ExportConfigurationsAsync(ConfigurationExportRequest request)
        {
            try
            {
                var query = _context.SystemConfigurations.AsQueryable();

                if (request.ConfigurationIds != null && request.ConfigurationIds.Any())
                {
                    query = query.Where(sc => request.ConfigurationIds.Contains(sc.Id));
                }

                if (!string.IsNullOrWhiteSpace(request.Category))
                {
                    query = query.Where(sc => sc.Category == request.Category);
                }

                if (!request.IncludeSystemConfigs)
                {
                    query = query.Where(sc => !sc.IsSystemConfig);
                }

                var configurations = await query.ToListAsync();

                return request.Format.ToLower() switch
                {
                    "json" => ExportToJson(configurations),
                    "csv" => ExportToCsv(configurations),
                    "xml" => ExportToXml(configurations),
                    _ => ExportToJson(configurations)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting configurations");
                throw;
            }
        }

        public async Task<SystemConfigurationOperationResult> ImportConfigurationsAsync(ConfigurationImportRequest request)
        {
            try
            {
                // Parse file based on format
                var configurations = request.Format.ToLower() switch
                {
                    "json" => ParseJsonImport(request.FileContent),
                    "csv" => ParseCsvImport(request.FileContent),
                    "xml" => ParseXmlImport(request.FileContent),
                    _ => throw new InvalidOperationException("Unsupported format")
                };

                var errors = new List<string>();
                var successCount = 0;

                foreach (var config in configurations)
                {
                    var existing = await _context.SystemConfigurations
                        .FirstOrDefaultAsync(sc => sc.ConfigKey == config.ConfigKey && sc.TenantId == config.TenantId);

                    if (existing != null)
                    {
                        if (request.OverwriteExisting)
                        {
                            existing.ConfigValue = config.ConfigValue;
                            existing.DisplayName = config.DisplayName;
                            existing.Description = config.Description;
                            existing.UpdatedAt = DateTime.UtcNow;
                            existing.UpdatedBy = request.ImportedBy;
                            successCount++;
                        }
                        else
                        {
                            errors.Add($"Configuration already exists: {config.ConfigKey}");
                        }
                    }
                    else
                    {
                        _context.SystemConfigurations.Add(config);
                        successCount++;
                    }
                }

                await _context.SaveChangesAsync();

                return new SystemConfigurationOperationResult
                {
                    Success = errors.Count == 0,
                    Message = $"Imported {successCount} configurations",
                    Errors = errors
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error importing configurations");
                return new SystemConfigurationOperationResult
                {
                    Success = false,
                    Message = "Error importing configurations",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<ConfigurationValidationResult> ValidateConfigurationAsync(string configKey, string configValue, string configType)
        {
            try
            {
                var errors = new List<string>();
                var warnings = new List<string>();

                // Type validation
                try
                {
                    ConvertConfigValue(configValue, configType);
                }
                catch (Exception ex)
                {
                    errors.Add($"Invalid value for type {configType}: {ex.Message}");
                }

                // Key-specific validation
                if (configKey.Contains("Email") && configType == "String")
                {
                    if (!configValue.Contains("@"))
                    {
                        errors.Add("Email configuration must contain @ symbol");
                    }
                }

                if (configKey.Contains("Port") && configType == "Integer")
                {
                    var port = int.Parse(configValue);
                    if (port < 1 || port > 65535)
                    {
                        errors.Add("Port must be between 1 and 65535");
                    }
                }

                if (configKey.Contains("Url") && configType == "String")
                {
                    if (!Uri.TryCreate(configValue, UriKind.Absolute, out _))
                    {
                        warnings.Add("URL format may be invalid");
                    }
                }

                return new ConfigurationValidationResult
                {
                    IsValid = errors.Count == 0,
                    Errors = errors,
                    Warnings = warnings
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating configuration");
                return new ConfigurationValidationResult
                {
                    IsValid = false,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<List<ConfigurationHistoryDto>> GetConfigurationHistoryAsync(int configurationId)
        {
            try
            {
                // This would require a separate audit/history table
                // For now, return empty list
                _logger.LogWarning("Configuration history tracking not yet implemented");
                return new List<ConfigurationHistoryDto>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving configuration history");
                throw;
            }
        }

        public async Task<ConfigurationStatistics> GetStatisticsAsync()
        {
            try
            {
                var totalConfigurations = await _context.SystemConfigurations.CountAsync();
                var activeConfigurations = await _context.SystemConfigurations.CountAsync(sc => sc.Status == "Active");
                var systemConfigurations = await _context.SystemConfigurations.CountAsync(sc => sc.IsSystemConfig);

                var configurationsByCategory = await _context.SystemConfigurations
                    .GroupBy(sc => sc.Category)
                    .Select(g => new { Category = g.Key, Count = g.Count() })
                    .ToDictionaryAsync(x => x.Category, x => x.Count);

                var configurationsByType = await _context.SystemConfigurations
                    .GroupBy(sc => sc.ConfigType)
                    .Select(g => new { Type = g.Key, Count = g.Count() })
                    .ToDictionaryAsync(x => x.Type, x => x.Count);

                return new ConfigurationStatistics
                {
                    TotalConfigurations = totalConfigurations,
                    ActiveConfigurations = activeConfigurations,
                    SystemConfigurations = systemConfigurations,
                    UserConfigurations = totalConfigurations - systemConfigurations,
                    ConfigurationsByCategory = configurationsByCategory,
                    ConfigurationsByType = configurationsByType
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving configuration statistics");
                throw;
            }
        }

        // Helper Methods
        private SystemConfigurationDto MapToDto(SystemConfiguration configuration)
        {
            return new SystemConfigurationDto
            {
                Id = configuration.Id,
                TenantId = configuration.TenantId,
                ConfigKey = configuration.ConfigKey,
                ConfigValue = configuration.ConfigValue,
                DisplayName = configuration.DisplayName,
                Description = configuration.Description,
                ConfigType = configuration.ConfigType,
                Category = configuration.Category,
                IsSystemConfig = configuration.IsSystemConfig,
                Status = configuration.Status,
                UpdatedAt = configuration.UpdatedAt
            };
        }

        private SystemConfigurationDetailsDto MapToDetailsDto(SystemConfiguration configuration)
        {
            return new SystemConfigurationDetailsDto
            {
                Id = configuration.Id,
                TenantId = configuration.TenantId,
                ConfigKey = configuration.ConfigKey,
                ConfigValue = configuration.ConfigValue,
                DisplayName = configuration.DisplayName,
                Description = configuration.Description,
                ConfigType = configuration.ConfigType,
                Category = configuration.Category,
                IsSystemConfig = configuration.IsSystemConfig,
                EditableBy = configuration.EditableBy,
                Status = configuration.Status,
                CreatedAt = configuration.CreatedAt,
                CreatedBy = configuration.CreatedBy,
                UpdatedAt = configuration.UpdatedAt,
                UpdatedBy = configuration.UpdatedBy
            };
        }

        private object ConvertConfigValue(string value, string type)
        {
            return type.ToLower() switch
            {
                "string" => value,
                "integer" => int.Parse(value),
                "boolean" => bool.Parse(value),
                "decimal" => decimal.Parse(value),
                "json" => JsonSerializer.Deserialize<object>(value) ?? value,
                _ => value
            };
        }

        private byte[] ExportToJson(List<SystemConfiguration> configurations)
        {
            var json = JsonSerializer.Serialize(configurations, new JsonSerializerOptions { WriteIndented = true });
            return Encoding.UTF8.GetBytes(json);
        }

        private byte[] ExportToCsv(List<SystemConfiguration> configurations)
        {
            var csv = new StringBuilder();
            csv.AppendLine("ConfigKey,ConfigValue,DisplayName,Description,ConfigType,Category,Status");

            foreach (var config in configurations)
            {
                csv.AppendLine($"{config.ConfigKey},{config.ConfigValue},{config.DisplayName},{config.Description},{config.ConfigType},{config.Category},{config.Status}");
            }

            return Encoding.UTF8.GetBytes(csv.ToString());
        }

        private byte[] ExportToXml(List<SystemConfiguration> configurations)
        {
            // Simplified XML export
            var xml = new StringBuilder();
            xml.AppendLine("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
            xml.AppendLine("<Configurations>");

            foreach (var config in configurations)
            {
                xml.AppendLine($"  <Configuration>");
                xml.AppendLine($"    <ConfigKey>{config.ConfigKey}</ConfigKey>");
                xml.AppendLine($"    <ConfigValue>{config.ConfigValue}</ConfigValue>");
                xml.AppendLine($"    <DisplayName>{config.DisplayName}</DisplayName>");
                xml.AppendLine($"    <Description>{config.Description}</Description>");
                xml.AppendLine($"    <ConfigType>{config.ConfigType}</ConfigType>");
                xml.AppendLine($"    <Category>{config.Category}</Category>");
                xml.AppendLine($"    <Status>{config.Status}</Status>");
                xml.AppendLine($"  </Configuration>");
            }

            xml.AppendLine("</Configurations>");
            return Encoding.UTF8.GetBytes(xml.ToString());
        }

        private List<SystemConfiguration> ParseJsonImport(byte[] fileContent)
        {
            var json = Encoding.UTF8.GetString(fileContent);
            return JsonSerializer.Deserialize<List<SystemConfiguration>>(json) ?? new List<SystemConfiguration>();
        }

        private List<SystemConfiguration> ParseCsvImport(byte[] fileContent)
        {
            // Simplified CSV parsing
            var csv = Encoding.UTF8.GetString(fileContent);
            var lines = csv.Split('\n');
            var configurations = new List<SystemConfiguration>();

            for (int i = 1; i < lines.Length; i++)
            {
                if (string.IsNullOrWhiteSpace(lines[i])) continue;

                var fields = lines[i].Split(',');
                if (fields.Length >= 7)
                {
                    configurations.Add(new SystemConfiguration
                    {
                        ConfigKey = fields[0].Trim(),
                        ConfigValue = fields[1].Trim(),
                        DisplayName = fields[2].Trim(),
                        Description = fields[3].Trim(),
                        ConfigType = fields[4].Trim(),
                        Category = fields[5].Trim(),
                        Status = fields[6].Trim(),
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            return configurations;
        }

        private List<SystemConfiguration> ParseXmlImport(byte[] fileContent)
        {
            // Simplified XML parsing - would need proper XML parser in production
            _logger.LogWarning("XML import not fully implemented");
            return new List<SystemConfiguration>();
        }
    }
}
