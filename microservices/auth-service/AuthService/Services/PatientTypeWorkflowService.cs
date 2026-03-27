using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using AuthService.Context;
using AuthService.Models.Counselor;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AuthService.Services
{
    public class PatientTypeWorkflowService : IPatientTypeWorkflowService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<PatientTypeWorkflowService> _logger;

        public PatientTypeWorkflowService(AppDbContext context, ILogger<PatientTypeWorkflowService> logger)
        {
            _context = context;
            _logger = logger;
        }

        // ==================== PATIENT TYPE CONFIGURATIONS ====================

        public async Task<List<PatientTypeConfigurationDto>> GetAllConfigurationsAsync(Guid tenantId, bool? isActive = null)
        {
            try
            {
                var query = _context.PatientTypeConfigurations
                    .Where(c => c.TenantId == tenantId);

                if (isActive.HasValue)
                {
                    query = query.Where(c => c.IsActive == isActive.Value);
                }

                var configs = await query
                    .OrderBy(c => c.DisplayOrder)
                    .ThenBy(c => c.PatientType)
                    .ToListAsync();

                return configs.Select(c => new PatientTypeConfigurationDto
                {
                    Id = c.Id,
                    TenantId = c.TenantId,
                    PatientType = c.PatientType,
                    DisplayName = c.DisplayName,
                    Description = c.Description,
                    ConfigurationJson = c.ConfigurationJson,
                    IsActive = c.IsActive,
                    DisplayOrder = c.DisplayOrder,
                    CreatedAt = c.CreatedAt,
                    CreatedByUserId = c.CreatedByUserId,
                    UpdatedAt = c.UpdatedAt,
                    UpdatedByUserId = c.UpdatedByUserId
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving patient type configurations for tenant {TenantId}", tenantId);
                throw;
            }
        }

        public async Task<PatientTypeConfigurationDto?> GetConfigurationByIdAsync(Guid id, Guid tenantId)
        {
            try
            {
                var config = await _context.PatientTypeConfigurations
                    .Where(c => c.Id == id && c.TenantId == tenantId)
                    .FirstOrDefaultAsync();

                if (config == null) return null;

                return new PatientTypeConfigurationDto
                {
                    Id = config.Id,
                    TenantId = config.TenantId,
                    PatientType = config.PatientType,
                    DisplayName = config.DisplayName,
                    Description = config.Description,
                    ConfigurationJson = config.ConfigurationJson,
                    IsActive = config.IsActive,
                    DisplayOrder = config.DisplayOrder,
                    CreatedAt = config.CreatedAt,
                    CreatedByUserId = config.CreatedByUserId,
                    UpdatedAt = config.UpdatedAt,
                    UpdatedByUserId = config.UpdatedByUserId
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving patient type configuration {Id}", id);
                throw;
            }
        }

        public async Task<PatientTypeConfigurationDto?> GetConfigurationByTypeAsync(string patientType, Guid tenantId)
        {
            try
            {
                var config = await _context.PatientTypeConfigurations
                    .Where(c => c.PatientType == patientType && c.TenantId == tenantId)
                    .FirstOrDefaultAsync();

                if (config == null) return null;

                return new PatientTypeConfigurationDto
                {
                    Id = config.Id,
                    TenantId = config.TenantId,
                    PatientType = config.PatientType,
                    DisplayName = config.DisplayName,
                    Description = config.Description,
                    ConfigurationJson = config.ConfigurationJson,
                    IsActive = config.IsActive,
                    DisplayOrder = config.DisplayOrder,
                    CreatedAt = config.CreatedAt,
                    CreatedByUserId = config.CreatedByUserId,
                    UpdatedAt = config.UpdatedAt,
                    UpdatedByUserId = config.UpdatedByUserId
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving patient type configuration for type {PatientType}", patientType);
                throw;
            }
        }

        public async Task<PatientTypeConfigurationDto> CreateConfigurationAsync(CreatePatientTypeConfigRequest request, Guid tenantId, Guid userId)
        {
            try
            {
                // Check for duplicate patient type
                var exists = await _context.PatientTypeConfigurations
                    .AnyAsync(c => c.PatientType == request.PatientType && c.TenantId == tenantId);

                if (exists)
                {
                    throw new InvalidOperationException($"Patient type '{request.PatientType}' already exists");
                }

                // Validate JSON
                try
                {
                    JsonDocument.Parse(request.ConfigurationJson);
                }
                catch (JsonException)
                {
                    throw new InvalidOperationException("Invalid JSON in ConfigurationJson");
                }

                var config = new PatientTypeConfiguration
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    PatientType = request.PatientType,
                    DisplayName = request.DisplayName,
                    Description = request.Description,
                    ConfigurationJson = request.ConfigurationJson,
                    IsActive = request.IsActive,
                    DisplayOrder = request.DisplayOrder,
                    CreatedAt = DateTime.UtcNow,
                    CreatedByUserId = userId
                };

                _context.PatientTypeConfigurations.Add(config);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created patient type configuration {Id} for type {PatientType}", config.Id, config.PatientType);

                return new PatientTypeConfigurationDto
                {
                    Id = config.Id,
                    TenantId = config.TenantId,
                    PatientType = config.PatientType,
                    DisplayName = config.DisplayName,
                    Description = config.Description,
                    ConfigurationJson = config.ConfigurationJson,
                    IsActive = config.IsActive,
                    DisplayOrder = config.DisplayOrder,
                    CreatedAt = config.CreatedAt,
                    CreatedByUserId = config.CreatedByUserId
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating patient type configuration");
                throw;
            }
        }

        public async Task<PatientTypeConfigurationDto?> UpdateConfigurationAsync(Guid id, UpdatePatientTypeConfigRequest request, Guid tenantId, Guid userId)
        {
            try
            {
                var config = await _context.PatientTypeConfigurations
                    .Where(c => c.Id == id && c.TenantId == tenantId)
                    .FirstOrDefaultAsync();

                if (config == null) return null;

                // Update fields
                if (request.DisplayName != null) config.DisplayName = request.DisplayName;
                if (request.Description != null) config.Description = request.Description;
                
                if (request.ConfigurationJson != null)
                {
                    // Validate JSON
                    try
                    {
                        JsonDocument.Parse(request.ConfigurationJson);
                        config.ConfigurationJson = request.ConfigurationJson;
                    }
                    catch (JsonException)
                    {
                        throw new InvalidOperationException("Invalid JSON in ConfigurationJson");
                    }
                }

                if (request.IsActive.HasValue) config.IsActive = request.IsActive.Value;
                if (request.DisplayOrder.HasValue) config.DisplayOrder = request.DisplayOrder.Value;

                config.UpdatedAt = DateTime.UtcNow;
                config.UpdatedByUserId = userId;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Updated patient type configuration {Id}", id);

                return new PatientTypeConfigurationDto
                {
                    Id = config.Id,
                    TenantId = config.TenantId,
                    PatientType = config.PatientType,
                    DisplayName = config.DisplayName,
                    Description = config.Description,
                    ConfigurationJson = config.ConfigurationJson,
                    IsActive = config.IsActive,
                    DisplayOrder = config.DisplayOrder,
                    CreatedAt = config.CreatedAt,
                    CreatedByUserId = config.CreatedByUserId,
                    UpdatedAt = config.UpdatedAt,
                    UpdatedByUserId = config.UpdatedByUserId
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating patient type configuration {Id}", id);
                throw;
            }
        }

        public async Task<bool> DeleteConfigurationAsync(Guid id, Guid tenantId)
        {
            try
            {
                var config = await _context.PatientTypeConfigurations
                    .Where(c => c.Id == id && c.TenantId == tenantId)
                    .FirstOrDefaultAsync();

                if (config == null) return false;

                _context.PatientTypeConfigurations.Remove(config);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Deleted patient type configuration {Id}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting patient type configuration {Id}", id);
                throw;
            }
        }

        // ==================== DOCUMENT CHECKLIST ====================

        public async Task<ChecklistListResponse> GetSessionChecklistAsync(Guid sessionId, Guid tenantId)
        {
            try
            {
                var items = await _context.PatientTypeDocumentChecklist
                    .Where(d => d.SessionId == sessionId && d.TenantId == tenantId && d.DeletedAt == null)
                    .OrderBy(d => d.IsMandatory ? 0 : 1)
                    .ThenBy(d => d.DocumentName)
                    .ToListAsync();

                var itemDtos = items.Select(d => new DocumentChecklistDto
                {
                    Id = d.Id,
                    TenantId = d.TenantId,
                    SessionId = d.SessionId,
                    PatientType = d.PatientType,
                    DocumentName = d.DocumentName,
                    DocumentDescription = d.DocumentDescription,
                    IsMandatory = d.IsMandatory,
                    IsUploaded = d.IsUploaded,
                    UploadedFilePath = d.UploadedFilePath,
                    UploadedAt = d.UploadedAt,
                    UploadedByUserId = d.UploadedByUserId,
                    IsVerified = d.IsVerified,
                    VerifiedByUserId = d.VerifiedByUserId,
                    VerifiedAt = d.VerifiedAt,
                    VerificationNotes = d.VerificationNotes,
                    RejectionReason = d.RejectionReason,
                    Status = d.Status,
                    CreatedAt = d.CreatedAt,
                    UpdatedAt = d.UpdatedAt
                }).ToList();

                var summary = await GetChecklistStatusAsync(sessionId, tenantId);

                return new ChecklistListResponse
                {
                    Items = itemDtos,
                    Summary = summary
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving checklist for session {SessionId}", sessionId);
                throw;
            }
        }

        public async Task<DocumentChecklistDto?> GetChecklistItemByIdAsync(Guid id, Guid tenantId)
        {
            try
            {
                var item = await _context.PatientTypeDocumentChecklist
                    .Where(d => d.Id == id && d.TenantId == tenantId && d.DeletedAt == null)
                    .FirstOrDefaultAsync();

                if (item == null) return null;

                return new DocumentChecklistDto
                {
                    Id = item.Id,
                    TenantId = item.TenantId,
                    SessionId = item.SessionId,
                    PatientType = item.PatientType,
                    DocumentName = item.DocumentName,
                    DocumentDescription = item.DocumentDescription,
                    IsMandatory = item.IsMandatory,
                    IsUploaded = item.IsUploaded,
                    UploadedFilePath = item.UploadedFilePath,
                    UploadedAt = item.UploadedAt,
                    UploadedByUserId = item.UploadedByUserId,
                    IsVerified = item.IsVerified,
                    VerifiedByUserId = item.VerifiedByUserId,
                    VerifiedAt = item.VerifiedAt,
                    VerificationNotes = item.VerificationNotes,
                    RejectionReason = item.RejectionReason,
                    Status = item.Status,
                    CreatedAt = item.CreatedAt,
                    UpdatedAt = item.UpdatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving checklist item {Id}", id);
                throw;
            }
        }

        public async Task<GenerateChecklistResponse> GenerateChecklistFromConfigAsync(GenerateChecklistRequest request, Guid tenantId, Guid userId)
        {
            try
            {
                // Get configuration for patient type
                var config = await _context.PatientTypeConfigurations
                    .Where(c => c.PatientType == request.PatientType && c.TenantId == tenantId)
                    .FirstOrDefaultAsync();

                if (config == null)
                {
                    return new GenerateChecklistResponse
                    {
                        Success = false,
                        Message = $"Configuration not found for patient type '{request.PatientType}'",
                        DocumentsGenerated = 0,
                        Checklist = new List<DocumentChecklistDto>()
                    };
                }

                // Parse required documents from configuration JSON
                var configData = JsonDocument.Parse(config.ConfigurationJson);
                var requiredDocs = new List<string>();

                if (configData.RootElement.TryGetProperty("required_documents", out var docsArray))
                {
                    requiredDocs = docsArray.EnumerateArray()
                        .Select(d => d.GetString())
                        .Where(d => !string.IsNullOrEmpty(d))
                        .Select(d => d!)
                        .ToList();
                }

                // Check if checklist already exists
                var existingCount = await _context.PatientTypeDocumentChecklist
                    .Where(d => d.SessionId == request.SessionId && d.TenantId == tenantId && d.DeletedAt == null)
                    .CountAsync();

                if (existingCount > 0)
                {
                    return new GenerateChecklistResponse
                    {
                        Success = false,
                        Message = "Checklist already exists for this session. Use update endpoints to modify.",
                        DocumentsGenerated = 0,
                        Checklist = new List<DocumentChecklistDto>()
                    };
                }

                // Create checklist items
                var checklistItems = new List<PatientTypeDocumentChecklist>();
                foreach (var docName in requiredDocs)
                {
                    var item = new PatientTypeDocumentChecklist
                    {
                        Id = Guid.NewGuid(),
                        TenantId = tenantId,
                        SessionId = request.SessionId,
                        PatientType = request.PatientType,
                        DocumentName = docName,
                        IsMandatory = true,
                        Status = "Pending",
                        CreatedAt = DateTime.UtcNow
                    };
                    checklistItems.Add(item);
                }

                if (checklistItems.Any())
                {
                    _context.PatientTypeDocumentChecklist.AddRange(checklistItems);
                    await _context.SaveChangesAsync();

                    _logger.LogInformation("Generated {Count} checklist items for session {SessionId}, patient type {PatientType}",
                        checklistItems.Count, request.SessionId, request.PatientType);
                }

                var checklistDtos = checklistItems.Select(c => new DocumentChecklistDto
                {
                    Id = c.Id,
                    TenantId = c.TenantId,
                    SessionId = c.SessionId,
                    PatientType = c.PatientType,
                    DocumentName = c.DocumentName,
                    DocumentDescription = c.DocumentDescription,
                    IsMandatory = c.IsMandatory,
                    IsUploaded = c.IsUploaded,
                    Status = c.Status,
                    CreatedAt = c.CreatedAt
                }).ToList();

                return new GenerateChecklistResponse
                {
                    Success = true,
                    Message = $"Successfully generated {checklistItems.Count} checklist items",
                    DocumentsGenerated = checklistItems.Count,
                    Checklist = checklistDtos
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating checklist for session {SessionId}", request.SessionId);
                throw;
            }
        }

        public async Task<DocumentChecklistDto> CreateChecklistItemAsync(CreateDocumentChecklistRequest request, Guid tenantId, Guid userId)
        {
            try
            {
                var item = new PatientTypeDocumentChecklist
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    SessionId = request.SessionId,
                    PatientType = request.PatientType,
                    DocumentName = request.DocumentName,
                    DocumentDescription = request.DocumentDescription,
                    IsMandatory = request.IsMandatory,
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow
                };

                _context.PatientTypeDocumentChecklist.Add(item);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created checklist item {Id} for session {SessionId}", item.Id, item.SessionId);

                return new DocumentChecklistDto
                {
                    Id = item.Id,
                    TenantId = item.TenantId,
                    SessionId = item.SessionId,
                    PatientType = item.PatientType,
                    DocumentName = item.DocumentName,
                    DocumentDescription = item.DocumentDescription,
                    IsMandatory = item.IsMandatory,
                    IsUploaded = item.IsUploaded,
                    Status = item.Status,
                    CreatedAt = item.CreatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating checklist item");
                throw;
            }
        }

        public async Task<DocumentChecklistDto?> UpdateChecklistItemAsync(Guid id, UpdateDocumentChecklistRequest request, Guid tenantId, Guid userId)
        {
            try
            {
                var item = await _context.PatientTypeDocumentChecklist
                    .Where(d => d.Id == id && d.TenantId == tenantId && d.DeletedAt == null)
                    .FirstOrDefaultAsync();

                if (item == null) return null;

                if (request.DocumentName != null) item.DocumentName = request.DocumentName;
                if (request.DocumentDescription != null) item.DocumentDescription = request.DocumentDescription;
                if (request.IsMandatory.HasValue) item.IsMandatory = request.IsMandatory.Value;

                item.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Updated checklist item {Id}", id);

                return new DocumentChecklistDto
                {
                    Id = item.Id,
                    TenantId = item.TenantId,
                    SessionId = item.SessionId,
                    PatientType = item.PatientType,
                    DocumentName = item.DocumentName,
                    DocumentDescription = item.DocumentDescription,
                    IsMandatory = item.IsMandatory,
                    IsUploaded = item.IsUploaded,
                    UploadedFilePath = item.UploadedFilePath,
                    UploadedAt = item.UploadedAt,
                    UploadedByUserId = item.UploadedByUserId,
                    IsVerified = item.IsVerified,
                    VerifiedByUserId = item.VerifiedByUserId,
                    VerifiedAt = item.VerifiedAt,
                    VerificationNotes = item.VerificationNotes,
                    RejectionReason = item.RejectionReason,
                    Status = item.Status,
                    CreatedAt = item.CreatedAt,
                    UpdatedAt = item.UpdatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating checklist item {Id}", id);
                throw;
            }
        }

        public async Task<DocumentChecklistDto?> UploadDocumentAsync(Guid id, UploadDocumentRequest request, Guid tenantId, Guid userId)
        {
            try
            {
                var item = await _context.PatientTypeDocumentChecklist
                    .Where(d => d.Id == id && d.TenantId == tenantId && d.DeletedAt == null)
                    .FirstOrDefaultAsync();

                if (item == null) return null;

                item.IsUploaded = true;
                item.UploadedFilePath = request.FilePath;
                item.UploadedAt = DateTime.UtcNow;
                item.UploadedByUserId = userId;
                item.Status = "Uploaded";
                item.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Document uploaded for checklist item {Id}", id);

                return new DocumentChecklistDto
                {
                    Id = item.Id,
                    TenantId = item.TenantId,
                    SessionId = item.SessionId,
                    PatientType = item.PatientType,
                    DocumentName = item.DocumentName,
                    DocumentDescription = item.DocumentDescription,
                    IsMandatory = item.IsMandatory,
                    IsUploaded = item.IsUploaded,
                    UploadedFilePath = item.UploadedFilePath,
                    UploadedAt = item.UploadedAt,
                    UploadedByUserId = item.UploadedByUserId,
                    IsVerified = item.IsVerified,
                    Status = item.Status,
                    CreatedAt = item.CreatedAt,
                    UpdatedAt = item.UpdatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading document for checklist item {Id}", id);
                throw;
            }
        }

        public async Task<DocumentChecklistDto?> VerifyDocumentAsync(Guid id, VerifyDocumentChecklistRequest request, Guid tenantId, Guid userId)
        {
            try
            {
                var item = await _context.PatientTypeDocumentChecklist
                    .Where(d => d.Id == id && d.TenantId == tenantId && d.DeletedAt == null)
                    .FirstOrDefaultAsync();

                if (item == null) return null;

                item.IsVerified = request.IsVerified;
                item.VerifiedByUserId = userId;
                item.VerifiedAt = DateTime.UtcNow;
                item.VerificationNotes = request.VerificationNotes;
                item.Status = request.IsVerified ? "Verified" : "Rejected";
                
                if (!request.IsVerified)
                {
                    item.RejectionReason = request.RejectionReason;
                }

                item.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Document verified for checklist item {Id}: {Status}", id, item.Status);

                return new DocumentChecklistDto
                {
                    Id = item.Id,
                    TenantId = item.TenantId,
                    SessionId = item.SessionId,
                    PatientType = item.PatientType,
                    DocumentName = item.DocumentName,
                    DocumentDescription = item.DocumentDescription,
                    IsMandatory = item.IsMandatory,
                    IsUploaded = item.IsUploaded,
                    UploadedFilePath = item.UploadedFilePath,
                    UploadedAt = item.UploadedAt,
                    UploadedByUserId = item.UploadedByUserId,
                    IsVerified = item.IsVerified,
                    VerifiedByUserId = item.VerifiedByUserId,
                    VerifiedAt = item.VerifiedAt,
                    VerificationNotes = item.VerificationNotes,
                    RejectionReason = item.RejectionReason,
                    Status = item.Status,
                    CreatedAt = item.CreatedAt,
                    UpdatedAt = item.UpdatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying document for checklist item {Id}", id);
                throw;
            }
        }

        public async Task<bool> DeleteChecklistItemAsync(Guid id, Guid tenantId)
        {
            try
            {
                var item = await _context.PatientTypeDocumentChecklist
                    .Where(d => d.Id == id && d.TenantId == tenantId && d.DeletedAt == null)
                    .FirstOrDefaultAsync();

                if (item == null) return false;

                // Soft delete
                item.DeletedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Soft deleted checklist item {Id}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting checklist item {Id}", id);
                throw;
            }
        }

        // ==================== CHECKLIST STATUS ====================

        public async Task<ChecklistStatusSummary> GetChecklistStatusAsync(Guid sessionId, Guid tenantId)
        {
            try
            {
                var items = await _context.PatientTypeDocumentChecklist
                    .Where(d => d.SessionId == sessionId && d.TenantId == tenantId && d.DeletedAt == null)
                    .ToListAsync();

                var totalDocuments = items.Count;
                var mandatoryDocuments = items.Count(d => d.IsMandatory);
                var uploadedDocuments = items.Count(d => d.IsUploaded);
                var verifiedDocuments = items.Count(d => d.IsVerified);
                var rejectedDocuments = items.Count(d => d.Status == "Rejected");
                var pendingDocuments = items.Count(d => d.Status == "Pending");

                var missingMandatoryDocs = items
                    .Where(d => d.IsMandatory && !d.IsUploaded)
                    .Select(d => d.DocumentName)
                    .ToList();

                var allMandatoryUploaded = items.All(d => !d.IsMandatory || d.IsUploaded);
                var allMandatoryVerified = items.All(d => !d.IsMandatory || d.IsVerified);
                var readyForNextStep = allMandatoryVerified && rejectedDocuments == 0;

                var patientType = items.FirstOrDefault()?.PatientType ?? string.Empty;

                return new ChecklistStatusSummary
                {
                    SessionId = sessionId,
                    PatientType = patientType,
                    TotalDocuments = totalDocuments,
                    MandatoryDocuments = mandatoryDocuments,
                    UploadedDocuments = uploadedDocuments,
                    VerifiedDocuments = verifiedDocuments,
                    RejectedDocuments = rejectedDocuments,
                    PendingDocuments = pendingDocuments,
                    AllMandatoryUploaded = allMandatoryUploaded,
                    AllMandatoryVerified = allMandatoryVerified,
                    ReadyForNextStep = readyForNextStep,
                    MissingMandatoryDocs = missingMandatoryDocs
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating checklist status for session {SessionId}", sessionId);
                throw;
            }
        }
    }
}
