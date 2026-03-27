using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AuthService.Models.Counselor;

namespace AuthService.Services
{
    public interface IConsentManagementService
    {
        // Consent Templates
        Task<List<ConsentTemplateDto>> GetAllTemplatesAsync();
        Task<ConsentTemplateDto?> GetTemplateByIdAsync(Guid id);
        Task<ConsentTemplateDto> CreateTemplateAsync(CreateConsentTemplateRequest request, Guid tenantId, Guid userId);
        Task<bool> DeleteTemplateAsync(Guid id);

        // Patient Consents
        Task<ConsentListResponse> GetAllConsentsAsync(int page, int pageSize, Guid? sessionId);
        Task<PatientConsentDto?> GetConsentByIdAsync(Guid id);
        Task<PatientConsentDto> RenderConsentAsync(RenderConsentRequest request, Guid tenantId, Guid userId);
        Task<PatientConsentDto> SignConsentAsync(Guid id, SignConsentRequest request, Guid userId);
        Task<PatientConsentDto> RevokeConsentAsync(Guid id, RevokeConsentRequest request, Guid userId);
        Task<string?> GenerateConsentPdfAsync(Guid id);
    }
}
