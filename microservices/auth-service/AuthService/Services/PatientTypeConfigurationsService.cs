using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using AuthService.Context;
using AuthService.Models.PatientType;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AuthService.Services
{
    /// <summary>
    /// Service for managing patient type configurations
    /// </summary>
    public class PatientTypeConfigurationsService : IPatientTypeConfigurationsService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<PatientTypeConfigurationsService> _logger;
        
        private readonly string[] VALID_PATIENT_TYPES = { 
            "Cash", "Insurance", "CoPay", "ESH", "CGHS", "Arograshree", "SGHS", "Camp" 
        };

        public PatientTypeConfigurationsService(
            AppDbContext context,
            ILogger<PatientTypeConfigurationsService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<PatientTypeConfigDto>> GetAllActiveAsync(Guid tenantId)
        {
            try
            {
                _logger.LogInformation("🔍 QUERYING patient_type_configurations for tenant: {TenantId}", tenantId);
                
                var configEntities = await _context.PatientTypeConfigurations
                    .Where(c => c.TenantId == tenantId && c.IsActive)
                    .OrderBy(c => c.DisplayOrder)
                    .ToListAsync();

                _logger.LogInformation("✅ Found {Count} patient type configurations for tenant {TenantId}", configEntities.Count, tenantId);

                var configs = configEntities.Select(c => new PatientTypeConfigDto
                {
                    Id = c.Id,
                    PatientType = c.PatientType,
                    DisplayName = c.DisplayName,
                    Description = c.Description,
                    Configuration = JsonDocument.Parse(c.ConfigurationJson ?? "{}").RootElement,
                    IsActive = c.IsActive,
                    DisplayOrder = c.DisplayOrder
                }).ToList();

                _logger.LogInformation("Retrieved {Count} active patient type configurations for tenant {TenantId}", configs.Count, tenantId);
                
                return configs;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving patient type configurations for tenant {TenantId}", tenantId);
                throw;
            }
        }

        public async Task<PatientTypeConfigDto?> GetByTypeAsync(Guid tenantId, string patientType)
        {
            try
            {
                var configEntity = await _context.PatientTypeConfigurations
                    .Where(c => c.TenantId == tenantId && c.PatientType == patientType)
                    .FirstOrDefaultAsync();

                if (configEntity == null)
                {
                    _logger.LogWarning("Patient type configuration not found for type {PatientType} in tenant {TenantId}", patientType, tenantId);
                    return null;
                }

                var config = new PatientTypeConfigDto
                {
                    Id = configEntity.Id,
                    PatientType = configEntity.PatientType,
                    DisplayName = configEntity.DisplayName,
                    Description = configEntity.Description,
                    Configuration = JsonDocument.Parse(configEntity.ConfigurationJson ?? "{}").RootElement,
                    IsActive = configEntity.IsActive,
                    DisplayOrder = configEntity.DisplayOrder
                };

                return config;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving configuration for patient type {PatientType} in tenant {TenantId}", patientType, tenantId);
                throw;
            }
        }

        public async Task<bool> IsValidPatientTypeAsync(string patientType)
        {
            // Check against predefined list (can be extended to check database)
            var isValid = VALID_PATIENT_TYPES.Contains(patientType);
            
            if (!isValid)
            {
                _logger.LogWarning("Invalid patient type: {PatientType}. Valid types: {ValidTypes}", 
                    patientType, string.Join(", ", VALID_PATIENT_TYPES));
            }
            
            return await Task.FromResult(isValid);
        }
    }
}
