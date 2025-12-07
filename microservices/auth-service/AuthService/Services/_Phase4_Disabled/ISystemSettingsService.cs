using AuthService.Models.SystemSettings;

namespace AuthService.Services
{
    public interface ISystemSettingsService
    {
        // Configuration CRUD
        Task<SystemConfigurationListResponse> GetAllConfigurationsAsync(SystemConfigurationFilters filters);
        Task<SystemConfigurationDetailsDto?> GetConfigurationByIdAsync(int configurationId);
        Task<SystemConfigurationDetailsDto?> GetConfigurationByKeyAsync(string configKey);
        Task<SystemConfigurationOperationResult> CreateConfigurationAsync(CreateSystemConfigurationRequest request);
        Task<SystemConfigurationOperationResult> UpdateConfigurationAsync(int configurationId, UpdateSystemConfigurationRequest request);
        Task<SystemConfigurationOperationResult> DeleteConfigurationAsync(int configurationId);

        // Bulk Operations
        Task<SystemConfigurationOperationResult> BulkUpdateConfigurationsAsync(BulkUpdateConfigurationsRequest request);

        // Grouping and Organization
        Task<List<ConfigurationGroup>> GetConfigurationsByGroupAsync(string? category = null);
        Task<Dictionary<string, object>> GetConfigurationValuesAsync(List<string> configKeys);

        // Import/Export
        Task<byte[]> ExportConfigurationsAsync(ConfigurationExportRequest request);
        Task<SystemConfigurationOperationResult> ImportConfigurationsAsync(ConfigurationImportRequest request);

        // Validation
        Task<ConfigurationValidationResult> ValidateConfigurationAsync(string configKey, string configValue, string configType);

        // History and Audit
        Task<List<ConfigurationHistoryDto>> GetConfigurationHistoryAsync(int configurationId);

        // Statistics
        Task<ConfigurationStatistics> GetStatisticsAsync();
    }
}
