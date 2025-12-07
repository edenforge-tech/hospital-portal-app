using AuthService.Context;
using AuthService.Models.Domain;
using AuthService.Models.DocumentSharing;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Services
{
    public class DocumentSharingService : IDocumentSharingService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<DocumentSharingService> _logger;

        public DocumentSharingService(AppDbContext context, ILogger<DocumentSharingService> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Document Type Operations
        public async Task<DocumentTypeListResponse> GetAllDocumentTypesAsync(DocumentTypeFilters filters)
        {
            try
            {
                var query = _context.DocumentTypes
                    .Include(dt => dt.AccessRules)
                    .AsQueryable();

                // Apply filters
                if (!string.IsNullOrWhiteSpace(filters.Search))
                {
                    query = query.Where(dt => dt.TypeName.Contains(filters.Search) ||
                                             dt.TypeCode.Contains(filters.Search) ||
                                             dt.Description.Contains(filters.Search));
                }

                if (!string.IsNullOrWhiteSpace(filters.SourceSystem))
                {
                    query = query.Where(dt => dt.SourceSystem == filters.SourceSystem);
                }

                if (!string.IsNullOrWhiteSpace(filters.Status))
                {
                    query = query.Where(dt => dt.Status == filters.Status);
                }

                if (filters.AutoShare.HasValue)
                {
                    query = query.Where(dt => dt.AutoShare == filters.AutoShare.Value);
                }

                if (filters.RequiresApproval.HasValue)
                {
                    query = query.Where(dt => dt.RequiresApproval == filters.RequiresApproval.Value);
                }

                // Total count
                var totalCount = await query.CountAsync();

                // Pagination
                var documentTypes = await query
                    .OrderBy(dt => dt.TypeName)
                    .Skip((filters.PageNumber - 1) * filters.PageSize)
                    .Take(filters.PageSize)
                    .ToListAsync();

                // Map to DTOs
                var documentTypeDtos = documentTypes.Select(dt => new DocumentTypeDto
                {
                    Id = dt.Id,
                    TenantId = dt.TenantId,
                    TypeCode = dt.TypeCode,
                    TypeName = dt.TypeName,
                    Description = dt.Description,
                    SourceSystem = dt.SourceSystem,
                    AutoShare = dt.AutoShare,
                    RequiresApproval = dt.RequiresApproval,
                    MaxFileSize = dt.MaxFileSize,
                    AllowedExtensions = dt.AllowedExtensions,
                    RetentionDays = dt.RetentionDays,
                    Status = dt.Status,
                    ActiveRulesCount = dt.AccessRules?.Count(ar => ar.IsActive) ?? 0,
                    CreatedAt = dt.CreatedAt,
                    UpdatedAt = dt.UpdatedAt
                }).ToList();

                // Calculate breakdowns
                var allTypes = await _context.DocumentTypes.ToListAsync();
                var statusBreakdown = allTypes.GroupBy(dt => dt.Status)
                    .ToDictionary(g => g.Key, g => g.Count());
                var sourceSystemBreakdown = allTypes.GroupBy(dt => dt.SourceSystem)
                    .ToDictionary(g => g.Key, g => g.Count());

                return new DocumentTypeListResponse
                {
                    Items = documentTypeDtos,
                    TotalCount = totalCount,
                    PageNumber = filters.PageNumber,
                    PageSize = filters.PageSize,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)filters.PageSize),
                    StatusBreakdown = statusBreakdown,
                    SourceSystemBreakdown = sourceSystemBreakdown
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving document types");
                throw;
            }
        }

        public async Task<DocumentTypeDetailsDto?> GetDocumentTypeByIdAsync(Guid documentTypeId)
        {
            try
            {
                var documentType = await _context.DocumentTypes
                    .Include(dt => dt.AccessRules)
                    .FirstOrDefaultAsync(dt => dt.Id == documentTypeId);

                if (documentType == null)
                    return null;

                return MapToDetailsDto(documentType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving document type {DocumentTypeId}", documentTypeId);
                throw;
            }
        }

        public async Task<DocumentTypeDetailsDto?> GetDocumentTypeByCodeAsync(Guid tenantId, string typeCode)
        {
            try
            {
                var documentType = await _context.DocumentTypes
                    .Include(dt => dt.AccessRules)
                    .FirstOrDefaultAsync(dt => dt.TypeCode == typeCode && dt.TenantId == tenantId);

                if (documentType == null)
                    return null;

                return MapToDetailsDto(documentType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving document type by code {TypeCode}", typeCode);
                throw;
            }
        }

        public async Task<DocumentTypeOperationResult> CreateDocumentTypeAsync(CreateDocumentTypeRequest request, Guid createdBy)
        {
            try
            {
                // Check for duplicate type code
                var existingType = await _context.DocumentTypes
                    .FirstOrDefaultAsync(dt => dt.TypeCode == request.TypeCode && dt.TenantId == request.TenantId);

                if (existingType != null)
                {
                    return new DocumentTypeOperationResult
                    {
                        Success = false,
                        Message = "A document type with this code already exists",
                        Errors = new List<string> { "Duplicate TypeCode" }
                    };
                }

                var documentType = new DocumentType
                {
                    TenantId = request.TenantId,
                    TypeCode = request.TypeCode,
                    TypeName = request.TypeName,
                    Description = request.Description,
                    SourceSystem = request.SourceSystem,
                    AutoShare = request.AutoShare,
                    RequiresApproval = request.RequiresApproval,
                    MaxFileSize = request.MaxFileSize,
                    AllowedExtensions = request.AllowedExtensions,
                    RetentionDays = request.RetentionDays,
                    AccessibleTo = request.AccessibleTo ?? new Dictionary<string, object>(),
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = createdBy
                };

                _context.DocumentTypes.Add(documentType);
                await _context.SaveChangesAsync();

                return new DocumentTypeOperationResult
                {
                    Success = true,
                    Message = "Document type created successfully",
                    DocumentTypeId = documentType.Id
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating document type");
                return new DocumentTypeOperationResult
                {
                    Success = false,
                    Message = "Error creating document type",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<DocumentTypeOperationResult> UpdateDocumentTypeAsync(Guid documentTypeId, UpdateDocumentTypeRequest request, Guid updatedBy)
        {
            try
            {
                var documentType = await _context.DocumentTypes.FindAsync(documentTypeId);
                if (documentType == null)
                {
                    return new DocumentTypeOperationResult
                    {
                        Success = false,
                        Message = "Document type not found",
                        Errors = new List<string> { "Not found" }
                    };
                }

                // Check for duplicate type code
                if (request.TypeCode != documentType.TypeCode)
                {
                    var existingType = await _context.DocumentTypes
                        .FirstOrDefaultAsync(dt => dt.TypeCode == request.TypeCode && 
                                                   dt.TenantId == documentType.TenantId && 
                                                   dt.Id != documentTypeId);

                    if (existingType != null)
                    {
                        return new DocumentTypeOperationResult
                        {
                            Success = false,
                            Message = "A document type with this code already exists",
                            Errors = new List<string> { "Duplicate TypeCode" }
                        };
                    }
                }

                // Update fields
                documentType.TypeCode = request.TypeCode;
                documentType.TypeName = request.TypeName;
                documentType.Description = request.Description;
                documentType.SourceSystem = request.SourceSystem;
                documentType.AutoShare = request.AutoShare;
                documentType.RequiresApproval = request.RequiresApproval;
                documentType.MaxFileSize = request.MaxFileSize;
                documentType.AllowedExtensions = request.AllowedExtensions;
                documentType.RetentionDays = request.RetentionDays;
                documentType.AccessibleTo = request.AccessibleTo ?? documentType.AccessibleTo;
                documentType.Status = request.Status;
                documentType.UpdatedAt = DateTime.UtcNow;
                documentType.UpdatedBy = updatedBy;

                await _context.SaveChangesAsync();

                return new DocumentTypeOperationResult
                {
                    Success = true,
                    Message = "Document type updated successfully",
                    DocumentTypeId = documentType.Id
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating document type {DocumentTypeId}", documentTypeId);
                return new DocumentTypeOperationResult
                {
                    Success = false,
                    Message = "Error updating document type",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<DocumentTypeOperationResult> DeleteDocumentTypeAsync(Guid documentTypeId)
        {
            try
            {
                var documentType = await _context.DocumentTypes
                    .Include(dt => dt.AccessRules)
                    .FirstOrDefaultAsync(dt => dt.Id == documentTypeId);

                if (documentType == null)
                {
                    return new DocumentTypeOperationResult
                    {
                        Success = false,
                        Message = "Document type not found",
                        Errors = new List<string> { "Not found" }
                    };
                }

                // Check if there are active access rules
                if (documentType.AccessRules != null && documentType.AccessRules.Any(ar => ar.IsActive))
                {
                    return new DocumentTypeOperationResult
                    {
                        Success = false,
                        Message = "Cannot delete document type with active access rules",
                        Errors = new List<string> { "Has active access rules" }
                    };
                }

                // Soft delete by setting status to Inactive
                documentType.Status = "Inactive";
                documentType.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return new DocumentTypeOperationResult
                {
                    Success = true,
                    Message = "Document type deleted successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting document type {DocumentTypeId}", documentTypeId);
                return new DocumentTypeOperationResult
                {
                    Success = false,
                    Message = "Error deleting document type",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        // Access Rule Operations
        public async Task<DocumentAccessRuleListResponse> GetAllAccessRulesAsync(DocumentAccessRuleFilters filters)
        {
            try
            {
                var query = _context.DocumentAccessRules
                    .Include(ar => ar.DocumentType)
                    .AsQueryable();

                // Apply filters
                if (filters.DocumentTypeId.HasValue)
                {
                    query = query.Where(ar => ar.DocumentTypeId == filters.DocumentTypeId.Value);
                }

                if (!string.IsNullOrWhiteSpace(filters.TargetRole))
                {
                    query = query.Where(ar => ar.TargetRole == filters.TargetRole);
                }

                if (filters.TargetDepartmentId.HasValue)
                {
                    query = query.Where(ar => ar.TargetDepartmentId == filters.TargetDepartmentId.Value);
                }

                if (!string.IsNullOrWhiteSpace(filters.Scope))
                {
                    query = query.Where(ar => ar.Scope == filters.Scope);
                }

                if (filters.IsActive.HasValue)
                {
                    query = query.Where(ar => ar.IsActive == filters.IsActive.Value);
                }

                // Total count
                var totalCount = await query.CountAsync();

                // Pagination
                var accessRules = await query
                    .OrderByDescending(ar => ar.Priority)
                    .ThenBy(ar => ar.CreatedAt)
                    .Skip((filters.PageNumber - 1) * filters.PageSize)
                    .Take(filters.PageSize)
                    .ToListAsync();

                // Map to DTOs
                var accessRuleDtos = accessRules.Select(ar => new DocumentAccessRuleDto
                {
                    Id = ar.Id,
                    DocumentTypeId = ar.DocumentTypeId,
                    DocumentTypeName = ar.DocumentType?.TypeName,
                    SourceDepartmentId = ar.SourceDepartmentId,
                    TargetRole = ar.TargetRole,
                    TargetDepartmentId = ar.TargetDepartmentId,
                    TargetBranchId = ar.TargetBranchId,
                    PermissionCodes = ar.PermissionCodes,
                    Scope = ar.Scope,
                    Priority = ar.Priority,
                    IsActive = ar.IsActive,
                    CreatedAt = ar.CreatedAt
                }).ToList();

                // Calculate scope breakdown
                var allRules = await _context.DocumentAccessRules.ToListAsync();
                var scopeBreakdown = allRules.GroupBy(ar => ar.Scope)
                    .ToDictionary(g => g.Key, g => g.Count());

                return new DocumentAccessRuleListResponse
                {
                    Items = accessRuleDtos,
                    TotalCount = totalCount,
                    PageNumber = filters.PageNumber,
                    PageSize = filters.PageSize,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)filters.PageSize),
                    ScopeBreakdown = scopeBreakdown
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving document access rules");
                throw;
            }
        }

        public async Task<DocumentAccessRuleDto?> GetAccessRuleByIdAsync(Guid ruleId)
        {
            try
            {
                var accessRule = await _context.DocumentAccessRules
                    .Include(ar => ar.DocumentType)
                    .FirstOrDefaultAsync(ar => ar.Id == ruleId);

                if (accessRule == null)
                    return null;

                return MapToAccessRuleDto(accessRule);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving access rule {RuleId}", ruleId);
                throw;
            }
        }

        public async Task<List<DocumentAccessRuleDto>> GetAccessRulesByDocumentTypeAsync(Guid documentTypeId)
        {
            try
            {
                var accessRules = await _context.DocumentAccessRules
                    .Include(ar => ar.DocumentType)
                    .Where(ar => ar.DocumentTypeId == documentTypeId)
                    .OrderByDescending(ar => ar.Priority)
                    .ToListAsync();

                return accessRules.Select(MapToAccessRuleDto).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving access rules for document type {DocumentTypeId}", documentTypeId);
                throw;
            }
        }

        public async Task<DocumentAccessRuleOperationResult> CreateAccessRuleAsync(CreateDocumentAccessRuleRequest request, Guid createdBy)
        {
            try
            {
                // Verify document type exists
                var documentType = await _context.DocumentTypes.FindAsync(request.DocumentTypeId);
                if (documentType == null)
                {
                    return new DocumentAccessRuleOperationResult
                    {
                        Success = false,
                        Message = "Document type not found",
                        Errors = new List<string> { "Document type does not exist" }
                    };
                }

                var accessRule = new DocumentAccessRule
                {
                    DocumentTypeId = request.DocumentTypeId,
                    SourceDepartmentId = request.SourceDepartmentId,
                    TargetRole = request.TargetRole,
                    TargetDepartmentId = request.TargetDepartmentId,
                    TargetBranchId = request.TargetBranchId,
                    PermissionCodes = request.PermissionCodes,
                    Scope = request.Scope,
                    Priority = request.Priority,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = createdBy
                };

                _context.DocumentAccessRules.Add(accessRule);
                await _context.SaveChangesAsync();

                return new DocumentAccessRuleOperationResult
                {
                    Success = true,
                    Message = "Access rule created successfully",
                    RuleId = accessRule.Id
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating access rule");
                return new DocumentAccessRuleOperationResult
                {
                    Success = false,
                    Message = "Error creating access rule",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<DocumentAccessRuleOperationResult> UpdateAccessRuleAsync(Guid ruleId, UpdateDocumentAccessRuleRequest request, Guid updatedBy)
        {
            try
            {
                var accessRule = await _context.DocumentAccessRules.FindAsync(ruleId);
                if (accessRule == null)
                {
                    return new DocumentAccessRuleOperationResult
                    {
                        Success = false,
                        Message = "Access rule not found",
                        Errors = new List<string> { "Not found" }
                    };
                }

                // Update fields
                accessRule.SourceDepartmentId = request.SourceDepartmentId;
                accessRule.TargetRole = request.TargetRole;
                accessRule.TargetDepartmentId = request.TargetDepartmentId;
                accessRule.TargetBranchId = request.TargetBranchId;
                accessRule.PermissionCodes = request.PermissionCodes;
                accessRule.Scope = request.Scope;
                accessRule.Priority = request.Priority;
                accessRule.IsActive = request.IsActive;
                accessRule.UpdatedAt = DateTime.UtcNow;
                accessRule.UpdatedBy = updatedBy;

                await _context.SaveChangesAsync();

                return new DocumentAccessRuleOperationResult
                {
                    Success = true,
                    Message = "Access rule updated successfully",
                    RuleId = accessRule.Id
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating access rule {RuleId}", ruleId);
                return new DocumentAccessRuleOperationResult
                {
                    Success = false,
                    Message = "Error updating access rule",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<DocumentAccessRuleOperationResult> DeleteAccessRuleAsync(Guid ruleId)
        {
            try
            {
                var accessRule = await _context.DocumentAccessRules.FindAsync(ruleId);
                if (accessRule == null)
                {
                    return new DocumentAccessRuleOperationResult
                    {
                        Success = false,
                        Message = "Access rule not found",
                        Errors = new List<string> { "Not found" }
                    };
                }

                // Soft delete by setting IsActive to false
                accessRule.IsActive = false;
                accessRule.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return new DocumentAccessRuleOperationResult
                {
                    Success = true,
                    Message = "Access rule deleted successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting access rule {RuleId}", ruleId);
                return new DocumentAccessRuleOperationResult
                {
                    Success = false,
                    Message = "Error deleting access rule",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<BulkOperationResult> BulkCreateAccessRulesAsync(BulkCreateAccessRulesRequest request, Guid createdBy)
        {
            try
            {
                var results = new List<DocumentAccessRuleOperationResult>();

                foreach (var ruleRequest in request.Rules)
                {
                    var result = await CreateAccessRuleAsync(ruleRequest, createdBy);
                    results.Add(result);
                }

                var successCount = results.Count(r => r.Success);
                var failureCount = results.Count(r => !r.Success);

                return new BulkOperationResult
                {
                    TotalItems = request.Rules.Count,
                    SuccessCount = successCount,
                    FailureCount = failureCount,
                    Errors = results.Where(r => !r.Success)
                                   .SelectMany(r => r.Errors ?? new List<string>())
                                   .ToList()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk create access rules");
                return new BulkOperationResult
                {
                    TotalItems = request.Rules.Count,
                    SuccessCount = 0,
                    FailureCount = request.Rules.Count,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        // Access Control
        public async Task<DocumentAccessCheckResult> CheckDocumentAccessAsync(DocumentAccessCheckRequest request)
        {
            try
            {
                var documentType = await _context.DocumentTypes
                    .Include(dt => dt.AccessRules)
                    .FirstOrDefaultAsync(dt => dt.Id == request.DocumentTypeId);

                if (documentType == null)
                {
                    return new DocumentAccessCheckResult
                    {
                        HasAccess = false,
                        Reason = "Document type not found"
                    };
                }

                // Get applicable rules
                var applicableRules = documentType.AccessRules?
                    .Where(ar => ar.IsActive)
                    .Where(ar => IsRuleApplicable(ar, request))
                    .OrderByDescending(ar => ar.Priority)
                    .ToList() ?? new List<DocumentAccessRule>();

                if (!applicableRules.Any())
                {
                    return new DocumentAccessCheckResult
                    {
                        HasAccess = false,
                        Reason = "No applicable access rules found"
                    };
                }

                // Aggregate permissions from all applicable rules
                var grantedPermissions = applicableRules
                    .SelectMany(ar => ar.PermissionCodes)
                    .Distinct()
                    .ToList();

                var hasAccess = request.RequiredPermissions.All(rp => grantedPermissions.Contains(rp));

                return new DocumentAccessCheckResult
                {
                    HasAccess = hasAccess,
                    GrantedPermissions = grantedPermissions,
                    DeniedPermissions = request.RequiredPermissions.Except(grantedPermissions).ToList(),
                    AppliedRules = applicableRules.Select(ar => ar.Id).ToList(),
                    Reason = hasAccess ? "Access granted" : "Missing required permissions"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking document access");
                return new DocumentAccessCheckResult
                {
                    HasAccess = false,
                    Reason = $"Error checking access: {ex.Message}"
                };
            }
        }

        public async Task<List<string>> GetUserPermissionsForDocumentTypeAsync(Guid userId, Guid documentTypeId)
        {
            try
            {
                // This would integrate with user service to get user's roles, department, branch
                // For now, return empty list as placeholder
                _logger.LogWarning("GetUserPermissionsForDocumentTypeAsync not fully implemented - requires user service integration");
                return new List<string>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user permissions");
                return new List<string>();
            }
        }

        // Statistics
        public async Task<DocumentSharingStatistics> GetStatisticsAsync(Guid? tenantId = null)
        {
            try
            {
                var query = _context.DocumentTypes.AsQueryable();
                var ruleQuery = _context.DocumentAccessRules.AsQueryable();
                
                if (tenantId.HasValue)
                {
                    query = query.Where(dt => dt.TenantId == tenantId.Value);
                }
                
                var totalDocumentTypes = await query.CountAsync();
                var activeDocumentTypes = await query.CountAsync(dt => dt.Status == "Active");
                var totalAccessRules = await ruleQuery.CountAsync();
                var activeAccessRules = await ruleQuery.CountAsync(ar => ar.IsActive);

                var typesBySource = await query
                    .GroupBy(dt => dt.SourceSystem)
                    .Select(g => new { Source = g.Key, Count = g.Count() })
                    .ToDictionaryAsync(x => x.Source, x => x.Count);

                var rulesByScope = await ruleQuery
                    .GroupBy(ar => ar.Scope)
                    .Select(g => new { Scope = g.Key, Count = g.Count() })
                    .ToDictionaryAsync(x => x.Scope, x => x.Count);

                return new DocumentSharingStatistics
                {
                    TotalDocumentTypes = totalDocumentTypes,
                    ActiveDocumentTypes = activeDocumentTypes,
                    TotalAccessRules = totalAccessRules,
                    ActiveAccessRules = activeAccessRules,
                    TypesBySourceSystem = typesBySource,
                    RulesByScope = rulesByScope
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving document sharing statistics");
                throw;
            }
        }

        public async Task<List<DocumentTypeDto>> SearchDocumentTypesAsync(string query, Guid? tenantId = null, int pageNumber = 1, int pageSize = 50)
        {
            try
            {
                var docQuery = _context.DocumentTypes
                    .Include(dt => dt.AccessRules)
                    .Where(dt => dt.TypeName.Contains(query) ||
                                dt.TypeCode.Contains(query) ||
                                dt.Description.Contains(query));
                
                if (tenantId.HasValue)
                {
                    docQuery = docQuery.Where(dt => dt.TenantId == tenantId.Value);
                }
                
                var documentTypes = await docQuery
                    .OrderBy(dt => dt.TypeName)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return documentTypes.Select(dt => new DocumentTypeDto
                {
                    Id = dt.Id,
                    TenantId = dt.TenantId,
                    TypeCode = dt.TypeCode,
                    TypeName = dt.TypeName,
                    Description = dt.Description,
                    SourceSystem = dt.SourceSystem,
                    AutoShare = dt.AutoShare,
                    RequiresApproval = dt.RequiresApproval,
                    MaxFileSize = dt.MaxFileSize,
                    AllowedExtensions = dt.AllowedExtensions,
                    RetentionDays = dt.RetentionDays,
                    Status = dt.Status,
                    ActiveRulesCount = dt.AccessRules?.Count(ar => ar.IsActive) ?? 0,
                    CreatedAt = dt.CreatedAt,
                    UpdatedAt = dt.UpdatedAt
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching document types");
                throw;
            }
        }

        // Helper Methods
        private DocumentTypeDetailsDto MapToDetailsDto(DocumentType documentType)
        {
            return new DocumentTypeDetailsDto
            {
                Id = documentType.Id,
                TenantId = documentType.TenantId,
                TypeCode = documentType.TypeCode,
                TypeName = documentType.TypeName,
                Description = documentType.Description,
                SourceSystem = documentType.SourceSystem,
                AutoShare = documentType.AutoShare,
                RequiresApproval = documentType.RequiresApproval,
                MaxFileSize = documentType.MaxFileSize,
                AllowedExtensions = documentType.AllowedExtensions,
                RetentionDays = documentType.RetentionDays,
                AccessibleTo = documentType.AccessibleTo,
                Status = documentType.Status,
                CreatedAt = documentType.CreatedAt,
                CreatedBy = documentType.CreatedBy,
                UpdatedAt = documentType.UpdatedAt,
                UpdatedBy = documentType.UpdatedBy,
                AccessRules = documentType.AccessRules?.Select(MapToAccessRuleDto).ToList() ?? new List<DocumentAccessRuleDto>()
            };
        }

        private DocumentAccessRuleDto MapToAccessRuleDto(DocumentAccessRule accessRule)
        {
            return new DocumentAccessRuleDto
            {
                Id = accessRule.Id,
                DocumentTypeId = accessRule.DocumentTypeId,
                DocumentTypeName = accessRule.DocumentType?.TypeName,
                SourceDepartmentId = accessRule.SourceDepartmentId,
                TargetRole = accessRule.TargetRole,
                TargetDepartmentId = accessRule.TargetDepartmentId,
                TargetBranchId = accessRule.TargetBranchId,
                PermissionCodes = accessRule.PermissionCodes,
                Scope = accessRule.Scope,
                Priority = accessRule.Priority,
                IsActive = accessRule.IsActive,
                CreatedAt = accessRule.CreatedAt
            };
        }

        private bool IsRuleApplicable(DocumentAccessRule rule, DocumentAccessCheckRequest request)
        {
            // Check role match
            if (!string.IsNullOrEmpty(rule.TargetRole) && rule.TargetRole != request.UserRole)
                return false;

            // Check department match
            if (rule.TargetDepartmentId.HasValue && rule.TargetDepartmentId.Value != request.UserDepartmentId)
                return false;

            // Check branch match
            if (rule.TargetBranchId.HasValue && rule.TargetBranchId.Value != request.UserBranchId)
                return false;

            // Check scope
            if (rule.Scope == "Department" && rule.SourceDepartmentId != request.SourceDepartmentId)
                return false;

            if (rule.Scope == "Branch" && rule.TargetBranchId != request.SourceBranchId)
                return false;

            return true;
        }
    }
}
