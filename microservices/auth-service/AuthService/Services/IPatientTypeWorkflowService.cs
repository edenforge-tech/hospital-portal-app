using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AuthService.Models.Counselor;

namespace AuthService.Services
{
    public interface IPatientTypeWorkflowService
    {
        // Patient Type Configurations
        Task<List<PatientTypeConfigurationDto>> GetAllConfigurationsAsync(Guid tenantId, bool? isActive = null);
        Task<PatientTypeConfigurationDto?> GetConfigurationByIdAsync(Guid id, Guid tenantId);
        Task<PatientTypeConfigurationDto?> GetConfigurationByTypeAsync(string patientType, Guid tenantId);
        Task<PatientTypeConfigurationDto> CreateConfigurationAsync(CreatePatientTypeConfigRequest request, Guid tenantId, Guid userId);
        Task<PatientTypeConfigurationDto?> UpdateConfigurationAsync(Guid id, UpdatePatientTypeConfigRequest request, Guid tenantId, Guid userId);
        Task<bool> DeleteConfigurationAsync(Guid id, Guid tenantId);

        // Document Checklist
        Task<ChecklistListResponse> GetSessionChecklistAsync(Guid sessionId, Guid tenantId);
        Task<DocumentChecklistDto?> GetChecklistItemByIdAsync(Guid id, Guid tenantId);
        Task<GenerateChecklistResponse> GenerateChecklistFromConfigAsync(GenerateChecklistRequest request, Guid tenantId, Guid userId);
        Task<DocumentChecklistDto> CreateChecklistItemAsync(CreateDocumentChecklistRequest request, Guid tenantId, Guid userId);
        Task<DocumentChecklistDto?> UpdateChecklistItemAsync(Guid id, UpdateDocumentChecklistRequest request, Guid tenantId, Guid userId);
        Task<DocumentChecklistDto?> UploadDocumentAsync(Guid id, UploadDocumentRequest request, Guid tenantId, Guid userId);
        Task<DocumentChecklistDto?> VerifyDocumentAsync(Guid id, VerifyDocumentChecklistRequest request, Guid tenantId, Guid userId);
        Task<bool> DeleteChecklistItemAsync(Guid id, Guid tenantId);

        // Checklist Status
        Task<ChecklistStatusSummary> GetChecklistStatusAsync(Guid sessionId, Guid tenantId);
    }
}
