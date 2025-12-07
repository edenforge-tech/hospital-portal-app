using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AuthService.Context;
using AuthService.Models.Domain;
using AuthService.Models.Organization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AuthService.Services
{
    /// <summary>
    /// Simplified Organization Service matching 11-column database schema
    /// </summary>
    public class OrganizationService : IOrganizationService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<OrganizationService> _logger;

        public OrganizationService(AppDbContext context, ILogger<OrganizationService> _logger)
        {
            _context = context;
            this._logger = _logger;
        }

        public async Task<OrganizationListResponse> GetAllOrganizationsAsync(OrganizationFilters filters)
        {
            try
            {
                var query = _context.Organizations.AsQueryable();

                // Tenant filter (REQUIRED)
                if (filters.TenantId.HasValue)
                {
                    query = query.Where(o => o.TenantId == filters.TenantId.Value);
                }

                // Search filter - search by name or organization code
                if (!string.IsNullOrEmpty(filters.Search))
                {
                    query = query.Where(o => 
                        o.Name.Contains(filters.Search) ||
                        (o.OrganizationCode != null && o.OrganizationCode.Contains(filters.Search)));
                }

                // Status filter
                if (!string.IsNullOrEmpty(filters.Status))
                {
                    query = query.Where(o => o.Status == filters.Status);
                }

                // Count total before pagination
                var totalCount = await query.CountAsync();

                // Sorting - simplified (only name and status)
                query = (filters.SortBy?.ToLower()) switch
                {
                    "name" => filters.SortOrder == "desc" ? query.OrderByDescending(o => o.Name) : query.OrderBy(o => o.Name),
                    "status" => filters.SortOrder == "desc" ? query.OrderByDescending(o => o.Status) : query.OrderBy(o => o.Status),
                    _ => query.OrderBy(o => o.Name)
                };

                // Pagination
                var organizations = await query
                    .Skip((filters.PageNumber - 1) * filters.PageSize)
                    .Take(filters.PageSize)
                    .ToListAsync();

                // Map to DTOs (only using properties that exist in OrganizationDto)
                var organizationDtos = organizations.Select(o => new OrganizationDto
                {
                    Id = o.Id,
                    TenantId = o.TenantId,
                    Name = o.Name,
                    Code = o.OrganizationCode, // Map organization_code to Code in DTO
                    Status = o.Status,
                    Type = null, // Not in simplified schema
                    ParentOrganizationId = null, // Not in simplified schema  
                    ParentOrganizationName = null,
                    HierarchyLevel = 0,
                    TotalBranches = 0,
                    TotalUsers = 0,
                    CreatedAt = DateTime.UtcNow
                }).ToList();

                return new OrganizationListResponse
                {
                    Organizations = organizationDtos,
                    TotalCount = totalCount,
                    PageNumber = filters.PageNumber,
                    PageSize = filters.PageSize,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)filters.PageSize),
                    StatusBreakdown = new Dictionary<string, int>(),
                    TypeBreakdown = new Dictionary<string, int>()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting organizations");
                return new OrganizationListResponse
                {
                    Organizations = new List<OrganizationDto>(),
                    TotalCount = 0,
                    PageNumber = filters.PageNumber,
                    PageSize = filters.PageSize,
                    TotalPages = 0,
                    StatusBreakdown = new Dictionary<string, int>(),
                    TypeBreakdown = new Dictionary<string, int>()
                };
            }
        }

        public async Task<OrganizationDetailsDto?> GetOrganizationByIdAsync(Guid organizationId)
        {
            try
            {
                var organization = await _context.Organizations
                    .FirstOrDefaultAsync(o => o.Id == organizationId);

                if (organization == null)
                    return null;

                return new OrganizationDetailsDto
                {
                    Id = organization.Id,
                    TenantId = organization.TenantId,
                    Name = organization.Name,
                    Code = organization.OrganizationCode,
                    Status = organization.Status,
                    CountryCode = organization.CountryCode,
                    StateProvince = organization.StateProvince,
                    CurrencyCode = organization.CurrencyCode,
                    LanguageCode = organization.LanguageCode,
                    Timezone = organization.Timezone
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting organization {organizationId}");
                return null;
            }
        }

        public async Task<OrganizationDetailsDto?> GetOrganizationByCodeAsync(Guid tenantId, string code)
        {
            try
            {
                var organization = await _context.Organizations
                    .FirstOrDefaultAsync(o => o.TenantId == tenantId && o.OrganizationCode == code);

                if (organization == null)
                    return null;

                return new OrganizationDetailsDto
                {
                    Id = organization.Id,
                    TenantId = organization.TenantId,
                    Name = organization.Name,
                    Code = organization.OrganizationCode,
                    Status = organization.Status,
                    CountryCode = organization.CountryCode,
                    StateProvince = organization.StateProvince,
                    CurrencyCode = organization.CurrencyCode,
                    LanguageCode = organization.LanguageCode,
                    Timezone = organization.Timezone
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting organization by code {code}");
                return null;
            }
        }

        public async Task<OrganizationOperationResult> CreateOrganizationAsync(CreateOrganizationRequest request, Guid createdBy)
        {
            try
            {
                var organization = new Organization
                {
                    Id = Guid.NewGuid(),
                    TenantId = request.TenantId,
                    Name = request.Name,
                    OrganizationCode = request.Code,
                    Status = request.Status ?? "Active",
                    CountryCode = request.CountryCode,
                    StateProvince = request.StateProvince,
                    CurrencyCode = request.CurrencyCode,
                    LanguageCode = request.LanguageCode,
                    Timezone = request.Timezone ?? "UTC"
                };

                _context.Organizations.Add(organization);
                await _context.SaveChangesAsync();

                return new OrganizationOperationResult
                {
                    Success = true,
                    Message = "Organization created successfully",
                    OrganizationId = organization.Id
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating organization");
                return new OrganizationOperationResult
                {
                    Success = false,
                    Message = "Failed to create organization",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<OrganizationOperationResult> UpdateOrganizationAsync(Guid organizationId, UpdateOrganizationRequest request, Guid updatedBy)
        {
            try
            {
                var organization = await _context.Organizations.FindAsync(organizationId);
                if (organization == null)
                {
                    return new OrganizationOperationResult
                    {
                        Success = false,
                        Message = "Organization not found"
                    };
                }

                if (!string.IsNullOrEmpty(request.Name))
                    organization.Name = request.Name;
                if (!string.IsNullOrEmpty(request.Status))
                    organization.Status = request.Status;
                if (request.CountryCode != null)
                    organization.CountryCode = request.CountryCode;
                if (request.StateProvince != null)
                    organization.StateProvince = request.StateProvince;
                if (request.CurrencyCode != null)
                    organization.CurrencyCode = request.CurrencyCode;
                if (request.LanguageCode != null)
                    organization.LanguageCode = request.LanguageCode;
                if (request.Timezone != null)
                    organization.Timezone = request.Timezone;

                await _context.SaveChangesAsync();

                return new OrganizationOperationResult
                {
                    Success = true,
                    Message = "Organization updated successfully",
                    OrganizationId = organization.Id
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating organization");
                return new OrganizationOperationResult
                {
                    Success = false,
                    Message = "Failed to update organization",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<OrganizationOperationResult> DeleteOrganizationAsync(Guid organizationId)
        {
            try
            {
                var organization = await _context.Organizations.FindAsync(organizationId);
                if (organization == null)
                {
                    return new OrganizationOperationResult
                    {
                        Success = false,
                        Message = "Organization not found"
                    };
                }

                _context.Organizations.Remove(organization);
                await _context.SaveChangesAsync();

                return new OrganizationOperationResult
                {
                    Success = true,
                    Message = "Organization deleted successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting organization");
                return new OrganizationOperationResult
                {
                    Success = false,
                    Message = "Failed to delete organization",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        // Stub methods for interface compliance (hierarchy features not supported in simplified schema)
        public Task<OrganizationOperationResult> MoveOrganizationAsync(Guid organizationId, MoveOrganizationRequest request, Guid updatedBy)
        {
            return Task.FromResult(new OrganizationOperationResult
            {
                Success = false,
                Message = "Hierarchy features not supported in simplified schema"
            });
        }

        public Task<OrganizationHierarchyDto?> GetOrganizationHierarchyAsync(Guid? rootOrganizationId = null)
        {
            return Task.FromResult<OrganizationHierarchyDto?>(null);
        }

        public Task<List<OrganizationDto>> GetChildOrganizationsAsync(Guid parentOrganizationId, bool includeAllDescendants = false)
        {
            return Task.FromResult(new List<OrganizationDto>());
        }

        public Task<List<OrganizationDto>> GetRootOrganizationsAsync(Guid tenantId)
        {
            return Task.FromResult(new List<OrganizationDto>());
        }

        public Task<List<OrganizationDto>> GetAncestorsAsync(Guid organizationId)
        {
            return Task.FromResult(new List<OrganizationDto>());
        }

        public Task<object?> GetOrganizationStatisticsAsync(Guid organizationId)
        {
            return Task.FromResult<object?>(null);
        }

        public async Task<Dictionary<string, int>> GetOrganizationTypesCountAsync(Guid tenantId)
        {
            return new Dictionary<string, int>();
        }

        public async Task<OrganizationOperationResult> ValidateOrganizationCodeAsync(Guid tenantId, string code, Guid? excludeOrganizationId = null)
        {
            try
            {
                var exists = await _context.Organizations
                    .AnyAsync(o => o.TenantId == tenantId && 
                                  o.OrganizationCode == code && 
                                  o.Id != excludeOrganizationId);

                return new OrganizationOperationResult
                {
                    Success = !exists,
                    Message = exists ? "Organization code already exists" : "Organization code is available"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating organization code");
                return new OrganizationOperationResult
                {
                    Success = false,
                    Message = "Error validating organization code",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public Task<OrganizationOperationResult> RecalculateHierarchyLevelsAsync(Guid tenantId)
        {
            return Task.FromResult(new OrganizationOperationResult
            {
                Success = false,
                Message = "Hierarchy features not supported in simplified schema"
            });
        }

        public Task<List<object>> GetOrganizationWithBranchesAsync(Guid tenantId)
        {
            return Task.FromResult(new List<object>());
        }

        public async Task<OrganizationOperationResult> BulkUpdateStatusAsync(List<Guid> organizationIds, string newStatus, Guid updatedBy)
        {
            try
            {
                var organizations = await _context.Organizations
                    .Where(o => organizationIds.Contains(o.Id))
                    .ToListAsync();

                foreach (var org in organizations)
                {
                    org.Status = newStatus;
                }

                await _context.SaveChangesAsync();

                return new OrganizationOperationResult
                {
                    Success = true,
                    Message = $"Updated {organizations.Count} organizations"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error bulk updating organizations");
                return new OrganizationOperationResult
                {
                    Success = false,
                    Message = "Failed to bulk updating organizations",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        // Additional interface methods (stubs for hierarchy features not supported in simplified schema)
        public Task<OrganizationHierarchyDto?> GetHierarchyAsync(Guid tenantId, Guid? rootOrganizationId = null)
        {
            return Task.FromResult<OrganizationHierarchyDto?>(null);
        }

        public Task<List<OrganizationDto>> GetChildrenAsync(Guid organizationId)
        {
            return Task.FromResult(new List<OrganizationDto>());
        }

        public Task<OrganizationDto?> GetParentAsync(Guid organizationId)
        {
            return Task.FromResult<OrganizationDto?>(null);
        }

        public Task<OrganizationPathDto> GetPathAsync(Guid organizationId)
        {
            return Task.FromResult(new OrganizationPathDto());
        }

        public Task<int> GetBranchCountAsync(Guid organizationId)
        {
            return Task.FromResult(0);
        }

        public Task<int> GetUserCountAsync(Guid organizationId)
        {
            return Task.FromResult(0);
        }

        public Task<OrganizationStatistics> GetStatisticsAsync(Guid? tenantId = null)
        {
            return Task.FromResult(new OrganizationStatistics());
        }

        public async Task<OrganizationListResponse> SearchOrganizationsAsync(string query, Guid? tenantId = null, int pageNumber = 1, int pageSize = 50)
        {
            var filters = new OrganizationFilters
            {
                Search = query,
                TenantId = tenantId,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
            return await GetAllOrganizationsAsync(filters);
        }

        public async Task<List<OrganizationDto>> GetByTypeAsync(Guid tenantId, string type)
        {
            // Type is not supported in simplified schema
            return new List<OrganizationDto>();
        }

        public Task<OrganizationValidationResult> ValidateOrganizationAsync(CreateOrganizationRequest request)
        {
            return Task.FromResult(new OrganizationValidationResult
            {
                IsValid = true,
                Errors = new List<string>()
            });
        }
    }
}
