using System;
using System.Collections.Generic;

namespace AuthService.Models.SystemSettings
{
    /// <summary>
    /// System configuration DTO for list views
    /// </summary>
    public class SystemConfigurationDto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public string ConfigKey { get; set; } = string.Empty;
        public string? ConfigValue { get; set; }
        public string? ConfigType { get; set; }
        public string? Description { get; set; }
        public bool IsSystemConfig { get; set; }
        public string Status { get; set; } = "active";
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    /// <summary>
    /// System configuration details
    /// </summary>
    public class SystemConfigurationDetailsDto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public string ConfigKey { get; set; } = string.Empty;
        public string? ConfigValue { get; set; }
        public string? ConfigType { get; set; }
        public string? Description { get; set; }
        public List<string>? EditableBy { get; set; }
        public bool IsSystemConfig { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedBy { get; set; }
    }

    /// <summary>
    /// Request to create system configuration
    /// </summary>
    public class CreateSystemConfigurationRequest
    {
        public Guid TenantId { get; set; }
        public string ConfigKey { get; set; } = string.Empty;
        public string? ConfigValue { get; set; }
        public string? ConfigType { get; set; } = "string";
        public string? Description { get; set; }
        public List<string>? EditableBy { get; set; }
        public bool IsSystemConfig { get; set; } = false;
        public string Status { get; set; } = "active";
    }

    /// <summary>
    /// Request to update system configuration
    /// </summary>
    public class UpdateSystemConfigurationRequest
    {
        public string? ConfigValue { get; set; }
        public string? ConfigType { get; set; }
        public string? Description { get; set; }
        public List<string>? EditableBy { get; set; }
        public string? Status { get; set; }
    }

    /// <summary>
    /// Bulk update configurations request
    /// </summary>
    public class BulkUpdateConfigurationsRequest
    {
        public List<ConfigurationUpdate> Configurations { get; set; } = new List<ConfigurationUpdate>();
    }

    /// <summary>
    /// Single configuration update
    /// </summary>
    public class ConfigurationUpdate
    {
        public string ConfigKey { get; set; } = string.Empty;
        public string? ConfigValue { get; set; }
    }

    /// <summary>
    /// Filters for system configurations
    /// </summary>
    public class SystemConfigurationFilters
    {
        public Guid? TenantId { get; set; }
        public string? Search { get; set; }
        public string? ConfigType { get; set; }
        public bool? IsSystemConfig { get; set; }
        public string? Status { get; set; }
        public string? SortBy { get; set; }
        public string? SortOrder { get; set; } = "asc";
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }

    /// <summary>
    /// Paginated system configuration list response
    /// </summary>
    public class SystemConfigurationListResponse
    {
        public List<SystemConfigurationDto> Configurations { get; set; } = new List<SystemConfigurationDto>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public Dictionary<string, int> TypeBreakdown { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> StatusBreakdown { get; set; } = new Dictionary<string, int>();
    }

    /// <summary>
    /// System configuration operation result
    /// </summary>
    public class SystemConfigurationOperationResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public Guid? ConfigurationId { get; set; }
        public SystemConfigurationDto? Data { get; set; }
        public List<string>? Errors { get; set; }
    }

    /// <summary>
    /// Configuration group for organizing settings
    /// </summary>
    public class ConfigurationGroup
    {
        public string GroupName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public List<SystemConfigurationDto> Configurations { get; set; } = new List<SystemConfigurationDto>();
    }

    /// <summary>
    /// Configuration category statistics
    /// </summary>
    public class ConfigurationStatistics
    {
        public int TotalConfigurations { get; set; }
        public int SystemConfigurations { get; set; }
        public int TenantConfigurations { get; set; }
        public Dictionary<string, int> ByType { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> ByStatus { get; set; } = new Dictionary<string, int>();
        public List<ConfigurationGroup> Groups { get; set; } = new List<ConfigurationGroup>();
    }

    /// <summary>
    /// Configuration validation result
    /// </summary>
    public class ConfigurationValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public List<string> Warnings { get; set; } = new List<string>();
    }

    /// <summary>
    /// Configuration export request
    /// </summary>
    public class ConfigurationExportRequest
    {
        public Guid? TenantId { get; set; }
        public List<string>? ConfigKeys { get; set; }
        public bool IncludeSystemConfigs { get; set; } = false;
        public string Format { get; set; } = "json"; // json, xml, csv
    }

    /// <summary>
    /// Configuration import request
    /// </summary>
    public class ConfigurationImportRequest
    {
        public Guid TenantId { get; set; }
        public string Format { get; set; } = "json";
        public string Data { get; set; } = string.Empty;
        public bool OverwriteExisting { get; set; } = false;
    }

    /// <summary>
    /// Configuration history entry
    /// </summary>
    public class ConfigurationHistoryDto
    {
        public Guid ConfigurationId { get; set; }
        public string ConfigKey { get; set; } = string.Empty;
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }
        public Guid? ChangedBy { get; set; }
        public string? ChangedByName { get; set; }
        public DateTime ChangedAt { get; set; }
        public string? ChangeReason { get; set; }
    }
}
