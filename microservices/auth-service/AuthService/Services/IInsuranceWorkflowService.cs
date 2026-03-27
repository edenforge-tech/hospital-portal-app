using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AuthService.Models.Counselor;

namespace AuthService.Services
{
    public interface IInsuranceWorkflowService
    {
        // Pre-Authorization Management
        Task<PreAuthListResponse> GetAllPreAuthsAsync(Guid tenantId, Guid? sessionId = null, string? status = null, int pageNumber = 1, int pageSize = 50);
        Task<InsurancePreAuthDto?> GetPreAuthByIdAsync(Guid preAuthId, Guid tenantId);
        Task<InsurancePreAuthDto?> GetPreAuthByNumberAsync(string preAuthNumber, Guid tenantId);
        Task<InsurancePreAuthDto> CreatePreAuthAsync(CreatePreAuthRequest request, Guid tenantId, Guid createdByUserId);
        Task<InsurancePreAuthDto> UpdatePreAuthAsync(Guid preAuthId, UpdatePreAuthRequest request, Guid tenantId, Guid updatedByUserId);
        Task<InsurancePreAuthDto> SubmitToTPAAsync(Guid preAuthId, SubmitToTPARequest request, Guid tenantId, Guid submittedByUserId);
        Task<InsurancePreAuthDto> ProcessTPAResponseAsync(Guid preAuthId, TPAResponseRequest request, Guid tenantId, Guid processedByUserId);
        Task DeletePreAuthAsync(Guid preAuthId, Guid tenantId, Guid deletedByUserId);

        // Approval Workflow
        Task<List<ApprovalWorkflowDto>> GetWorkflowStagesAsync(Guid preAuthId, Guid tenantId);
        Task<ApprovalWorkflowDto> ProcessApprovalStageAsync(Guid workflowId, ProcessApprovalRequest request, Guid tenantId, Guid approverUserId);

        // Insurance Documents
        Task<List<InsuranceDocumentDto>> GetPreAuthDocumentsAsync(Guid preAuthId, Guid tenantId);
        Task<InsuranceDocumentDto> UploadDocumentAsync(UploadInsuranceDocumentRequest request, Guid tenantId, Guid uploadedByUserId);
        Task<InsuranceDocumentDto> VerifyDocumentAsync(Guid documentId, Guid tenantId, Guid verifiedByUserId);
        Task DeleteDocumentAsync(Guid documentId, Guid tenantId);

        // TPA Communication
        Task<List<TPACommunicationDto>> GetTPACommunicationsAsync(Guid preAuthId, Guid tenantId);
        Task<TPACommunicationDto> LogCommunicationAsync(LogTPACommunicationRequest request, Guid tenantId, Guid loggedByUserId);
        Task<TPACommunicationDto> RecordResponseAsync(Guid communicationId, string responseText, Guid tenantId);
    }
}
