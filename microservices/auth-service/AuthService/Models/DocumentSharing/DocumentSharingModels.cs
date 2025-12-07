using System;
using System.Collections.Generic;

namespace AuthService.Models.DocumentSharing
{
    /// <summary>
    /// Document type DTO for list views
    /// </summary>
    public class DocumentTypeDto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public string TypeCode { get; set; } = string.Empty;
        public string TypeName { get; set; } = string.Empty;
        public string? SourceSystem { get; set; }
        public string? SourceDepartment { get; set; }
        public bool AutoShare { get; set; }
        public bool RequiresApproval { get; set; }
        public int RetentionDays { get; set; }
        public string Status { get; set; } = "active";
        public int ActiveRulesCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>
    /// Document type details with full information
    /// </summary>
    public class DocumentTypeDetailsDto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public string TypeCode { get; set; } = string.Empty;
        public string TypeName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? SourceSystem { get; set; }
        public string? SourceDepartment { get; set; }
        public Dictionary<string, object>? AccessibleTo { get; set; }
        public bool AutoShare { get; set; }
        public bool RequiresApproval { get; set; }
        public int RetentionDays { get; set; }
        public string Status { get; set; }
        public List<DocumentAccessRuleDto> AccessRules { get; set; } = new List<DocumentAccessRuleDto>();
        public DateTime CreatedAt { get; set; }
        public Guid? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedBy { get; set; }
    }

    /// <summary>
    /// Request to create document type
    /// </summary>
    public class CreateDocumentTypeRequest
    {
        public Guid TenantId { get; set; }
        public string TypeCode { get; set; } = string.Empty;
        public string TypeName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? SourceSystem { get; set; }
        public string? SourceDepartment { get; set; }
        public Dictionary<string, object>? AccessibleTo { get; set; }
        public bool AutoShare { get; set; } = true;
        public bool RequiresApproval { get; set; } = false;
        public int RetentionDays { get; set; } = 2555;
        public string Status { get; set; } = "active";
    }

    /// <summary>
    /// Request to update document type
    /// </summary>
    public class UpdateDocumentTypeRequest
    {
        public string? TypeName { get; set; }
        public string? Description { get; set; }
        public string? SourceSystem { get; set; }
        public string? SourceDepartment { get; set; }
        public Dictionary<string, object>? AccessibleTo { get; set; }
        public bool? AutoShare { get; set; }
        public bool? RequiresApproval { get; set; }
        public int? RetentionDays { get; set; }
        public string? Status { get; set; }
    }

    /// <summary>
    /// Document access rule DTO
    /// </summary>
    public class DocumentAccessRuleDto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid DocumentTypeId { get; set; }
        public string? DocumentTypeName { get; set; }
        public string? SourceDepartment { get; set; }
        public string? TargetRole { get; set; }
        public string? TargetDepartment { get; set; }
        public List<string> PermissionCodes { get; set; } = new List<string>();
        public string Scope { get; set; } = "department";
        public bool IsActive { get; set; }
        public int Priority { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>
    /// Request to create document access rule
    /// </summary>
    public class CreateDocumentAccessRuleRequest
    {
        public Guid TenantId { get; set; }
        public Guid DocumentTypeId { get; set; }
        public string? SourceDepartment { get; set; }
        public string? TargetRole { get; set; }
        public string? TargetDepartment { get; set; }
        public List<string> PermissionCodes { get; set; } = new List<string> { "read" };
        public string Scope { get; set; } = "department";
        public bool IsActive { get; set; } = true;
        public int Priority { get; set; } = 0;
    }

    /// <summary>
    /// Request to update document access rule
    /// </summary>
    public class UpdateDocumentAccessRuleRequest
    {
        public string? SourceDepartment { get; set; }
        public string? TargetRole { get; set; }
        public string? TargetDepartment { get; set; }
        public List<string>? PermissionCodes { get; set; }
        public string? Scope { get; set; }
        public bool? IsActive { get; set; }
        public int? Priority { get; set; }
    }

    /// <summary>
    /// Bulk create document access rules request
    /// </summary>
    public class BulkCreateAccessRulesRequest
    {
        public Guid DocumentTypeId { get; set; }
        public List<CreateDocumentAccessRuleRequest> Rules { get; set; } = new List<CreateDocumentAccessRuleRequest>();
    }

    /// <summary>
    /// Filters for document types
    /// </summary>
    public class DocumentTypeFilters
    {
        public Guid? TenantId { get; set; }
        public string? Search { get; set; }
        public string? SourceSystem { get; set; }
        public string? SourceDepartment { get; set; }
        public string? Status { get; set; }
        public bool? AutoShare { get; set; }
        public bool? RequiresApproval { get; set; }
        public string? SortBy { get; set; }
        public string? SortOrder { get; set; } = "asc";
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }

    /// <summary>
    /// Filters for document access rules
    /// </summary>
    public class DocumentAccessRuleFilters
    {
        public Guid? TenantId { get; set; }
        public Guid? DocumentTypeId { get; set; }
        public string? TargetRole { get; set; }
        public string? TargetDepartment { get; set; }
        public bool? IsActive { get; set; }
        public string? SortBy { get; set; }
        public string? SortOrder { get; set; } = "asc";
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }

    /// <summary>
    /// Paginated document type list response
    /// </summary>
    public class DocumentTypeListResponse
    {
        public List<DocumentTypeDto> DocumentTypes { get; set; } = new List<DocumentTypeDto>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public Dictionary<string, int> StatusBreakdown { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> SourceSystemBreakdown { get; set; } = new Dictionary<string, int>();
    }

    /// <summary>
    /// Paginated document access rule list response
    /// </summary>
    public class DocumentAccessRuleListResponse
    {
        public List<DocumentAccessRuleDto> AccessRules { get; set; } = new List<DocumentAccessRuleDto>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public Dictionary<string, int> ScopeBreakdown { get; set; } = new Dictionary<string, int>();
    }

    /// <summary>
    /// Document type operation result
    /// </summary>
    public class DocumentTypeOperationResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public Guid? DocumentTypeId { get; set; }
        public DocumentTypeDto? Data { get; set; }
        public List<string>? Errors { get; set; }
    }

    /// <summary>
    /// Document access rule operation result
    /// </summary>
    public class DocumentAccessRuleOperationResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public Guid? RuleId { get; set; }
        public DocumentAccessRuleDto? Data { get; set; }
        public List<string>? Errors { get; set; }
    }

    /// <summary>
    /// Bulk operation result
    /// </summary>
    public class BulkOperationResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int TotalRequested { get; set; }
        public int SuccessCount { get; set; }
        public int FailureCount { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public List<Guid> CreatedIds { get; set; } = new List<Guid>();
    }

    /// <summary>
    /// Document sharing statistics
    /// </summary>
    public class DocumentSharingStatistics
    {
        public int TotalDocumentTypes { get; set; }
        public int TotalAccessRules { get; set; }
        public int ActiveAccessRules { get; set; }
        public Dictionary<string, int> DocumentTypesBySystem { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> RulesByScope { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> RulesByTargetRole { get; set; } = new Dictionary<string, int>();
        public List<DocumentTypeDto> TopSharedDocumentTypes { get; set; } = new List<DocumentTypeDto>();
    }

    /// <summary>
    /// Document access check request
    /// </summary>
    public class DocumentAccessCheckRequest
    {
        public Guid UserId { get; set; }
        public Guid DocumentTypeId { get; set; }
        public string? Department { get; set; }
        public string? Role { get; set; }
        public List<string> RequestedPermissions { get; set; } = new List<string>();
    }

    /// <summary>
    /// Document access check result
    /// </summary>
    public class DocumentAccessCheckResult
    {
        public bool HasAccess { get; set; }
        public List<string> GrantedPermissions { get; set; } = new List<string>();
        public List<string> DeniedPermissions { get; set; } = new List<string>();
        public List<DocumentAccessRuleDto> AppliedRules { get; set; } = new List<DocumentAccessRuleDto>();
        public string? DenialReason { get; set; }
    }
}
