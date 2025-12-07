using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AuthService.Models.DocumentSharing;

namespace AuthService.Services
{
    /// <summary>
    /// Service interface for document sharing and access control management
    /// </summary>
    public interface IDocumentSharingService
    {
        // Document Type Management
        Task<DocumentTypeListResponse> GetAllDocumentTypesAsync(DocumentTypeFilters filters);
        Task<DocumentTypeDetailsDto?> GetDocumentTypeByIdAsync(Guid documentTypeId);
        Task<DocumentTypeDetailsDto?> GetDocumentTypeByCodeAsync(Guid tenantId, string typeCode);
        Task<DocumentTypeOperationResult> CreateDocumentTypeAsync(CreateDocumentTypeRequest request, Guid createdBy);
        Task<DocumentTypeOperationResult> UpdateDocumentTypeAsync(Guid documentTypeId, UpdateDocumentTypeRequest request, Guid updatedBy);
        Task<DocumentTypeOperationResult> DeleteDocumentTypeAsync(Guid documentTypeId);
        
        // Document Access Rule Management
        Task<DocumentAccessRuleListResponse> GetAllAccessRulesAsync(DocumentAccessRuleFilters filters);
        Task<DocumentAccessRuleDto?> GetAccessRuleByIdAsync(Guid ruleId);
        Task<List<DocumentAccessRuleDto>> GetAccessRulesByDocumentTypeAsync(Guid documentTypeId);
        Task<DocumentAccessRuleOperationResult> CreateAccessRuleAsync(CreateDocumentAccessRuleRequest request, Guid createdBy);
        Task<DocumentAccessRuleOperationResult> UpdateAccessRuleAsync(Guid ruleId, UpdateDocumentAccessRuleRequest request, Guid updatedBy);
        Task<DocumentAccessRuleOperationResult> DeleteAccessRuleAsync(Guid ruleId);
        Task<BulkOperationResult> BulkCreateAccessRulesAsync(BulkCreateAccessRulesRequest request, Guid createdBy);
        
        // Access Control
        Task<DocumentAccessCheckResult> CheckDocumentAccessAsync(DocumentAccessCheckRequest request);
        Task<List<string>> GetUserPermissionsForDocumentTypeAsync(Guid userId, Guid documentTypeId);
        
        // Statistics & Analytics
        Task<DocumentSharingStatistics> GetStatisticsAsync(Guid? tenantId = null);
        Task<List<DocumentTypeDto>> SearchDocumentTypesAsync(string query, Guid? tenantId = null, int pageNumber = 1, int pageSize = 50);
    }
}
