using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AuthService.Models.PatientType;

namespace AuthService.Services
{
    /// <summary>
    /// Service interface for patient type configurations
    /// </summary>
    public interface IPatientTypeConfigurationsService
    {
        /// <summary>
        /// Get all active patient type configurations for a tenant
        /// </summary>
        Task<List<PatientTypeConfigDto>> GetAllActiveAsync(Guid tenantId);

        /// <summary>
        /// Get configuration for a specific patient type
        /// </summary>
        Task<PatientTypeConfigDto?> GetByTypeAsync(Guid tenantId, string patientType);

        /// <summary>
        /// Check if patient type is valid
        /// </summary>
        Task<bool> IsValidPatientTypeAsync(string patientType);
    }
}
