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

                // Get branch counts for each organization
                var organizationIds = organizations.Select(o => o.Id).ToList();
                
                var branchCounts = await _context.Branches
                    .Where(b => organizationIds.Contains(b.OrganizationId) && b.DeletedAt == null)
                    .GroupBy(b => b.OrganizationId)
                    .Select(g => new { OrganizationId = g.Key, Count = g.Count() })
                    .ToDictionaryAsync(x => x.OrganizationId, x => x.Count);

                // Get user counts for each organization (via branches -> departments -> user_departments)
                var userCounts = await (from b in _context.Branches
                                       where organizationIds.Contains(b.OrganizationId) && b.DeletedAt == null
                                       join d in _context.Departments on b.Id equals d.BranchId
                                       where d.DeletedAt == null
                                       join ud in _context.UserDepartments on d.Id equals ud.DepartmentId
                                       where ud.DeletedAt == null
                                       join u in _context.Users on ud.UserId equals u.Id
                                       where u.LockoutEnd == null || u.LockoutEnd < DateTime.UtcNow
                                       group u by b.OrganizationId into g
                                       select new { OrganizationId = g.Key, Count = g.Select(u => u.Id).Distinct().Count() })
                                       .ToDictionaryAsync(x => x.OrganizationId, x => x.Count);

                // Map to DTOs
                var organizationDtos = organizations.Select(o => new OrganizationDto
                {
                    Id = o.Id,
                    TenantId = o.TenantId,
                    Name = o.Name,
                    Code = o.OrganizationCode,
                    Status = o.Status,
                    Type = null, // Not in database schema
                    ParentOrganizationId = null, // Not in database schema
                    ParentOrganizationName = null,
                    HierarchyLevel = 0,
                    TotalBranches = branchCounts.ContainsKey(o.Id) ? branchCounts[o.Id] : 0,
                    TotalUsers = userCounts.ContainsKey(o.Id) ? userCounts[o.Id] : 0,
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

                // Count child organizations
                var childOrganizationsCount = await _context.Organizations
                    .CountAsync(o => o.TenantId == organization.TenantId && o.Id != organization.Id);

                // Count total branches
                var totalBranches = await _context.Branches
                    .CountAsync(b => b.OrganizationId == organization.Id && b.DeletedAt == null);

                return new OrganizationDetailsDto
                {
                    // Basic Information
                    Id = organization.Id,
                    TenantId = organization.TenantId,
                    Name = organization.Name,
                    Code = organization.OrganizationCode,
                    Type = organization.OrganizationName, // Maps organization_name column to Type
                    Description = null, // Not in database schema
                    Status = organization.Status,
                    
                    // Hierarchy
                    ParentOrganizationId = null, // Not implemented in current schema
                    ParentOrganizationName = null,
                    HierarchyLevel = 0,
                    ChildOrganizationsCount = childOrganizationsCount,
                    
                    // Address
                    AddressLine1 = organization.Address, // Maps address column to AddressLine1
                    AddressLine2 = null, // Not in database schema
                    City = organization.City,
                    StateProvince = organization.StateProvince,
                    PostalCode = organization.PostalCode,
                    CountryCode = organization.CountryCode,
                    
                    // Contact
                    Phone = organization.Phone,
                    Email = organization.Email,
                    Website = organization.Website,
                    PrimaryContactName = organization.PrimaryContactName,
                    PrimaryContactEmail = organization.PrimaryContactEmail,
                    PrimaryContactPhone = organization.PrimaryContactPhone,
                    PrimaryContactAddress = null,
                    
                    // Configuration
                    Timezone = organization.Timezone,
                    LanguageCode = organization.LanguageCode,
                    CurrencyCode = organization.CurrencyCode,
                    
                    // Operations
                    TotalBranches = totalBranches,
                    TotalUsers = 0, // Calculated separately in GetAllOrganizationsAsync
                    OperationalSince = organization.OperationalSince,
                    RegistrationNumber = organization.LicenseNumber, // Maps license_number to RegistrationNumber
                    
                    // Settings & Branding - Not populated for now
                    Settings = null,
                    BrandingConfig = null,
                    
                    // Audit - Not tracked in current schema
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = null,
                    UpdatedAt = null,
                    UpdatedBy = null
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

                // Count child organizations
                var childOrganizationsCount = await _context.Organizations
                    .CountAsync(o => o.TenantId == organization.TenantId && o.Id != organization.Id);

                // Count total branches
                var totalBranches = await _context.Branches
                    .CountAsync(b => b.OrganizationId == organization.Id && b.DeletedAt == null);

                return new OrganizationDetailsDto
                {
                    // Basic Information
                    Id = organization.Id,
                    TenantId = organization.TenantId,
                    Name = organization.Name,
                    Code = organization.OrganizationCode,
                    Type = organization.OrganizationName, // Maps organization_name column to Type
                    Description = organization.Description,
                    Status = organization.Status,
                    
                    // Hierarchy
                    ParentOrganizationId = null, // Not implemented in current schema
                    ParentOrganizationName = null,
                    HierarchyLevel = 0,
                    ChildOrganizationsCount = childOrganizationsCount,
                    
                    // Address
                    AddressLine1 = organization.Address, // Maps address column to AddressLine1
                    AddressLine2 = null, // Not in database schema
                    City = organization.City,
                    StateProvince = organization.StateProvince,
                    PostalCode = organization.PostalCode,
                    CountryCode = organization.CountryCode,
                    
                    // Contact
                    Phone = organization.Phone,
                    Email = organization.Email,
                    Website = organization.Website,
                    PrimaryContactName = organization.PrimaryContactName,
                    PrimaryContactEmail = organization.PrimaryContactEmail,
                    PrimaryContactPhone = organization.PrimaryContactPhone,
                    PrimaryContactAddress = null,
                    
                    // Configuration
                    Timezone = organization.Timezone,
                    LanguageCode = organization.LanguageCode,
                    CurrencyCode = organization.CurrencyCode,
                    
                    // Operations
                    TotalBranches = totalBranches,
                    TotalUsers = 0, // Calculated separately in GetAllOrganizationsAsync
                    OperationalSince = organization.OperationalSince,
                    RegistrationNumber = organization.LicenseNumber, // Maps license_number to RegistrationNumber
                    
                    // Settings & Branding - Not populated for now
                    Settings = null,
                    BrandingConfig = null,
                    
                    // Audit - Not tracked in current schema
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = null,
                    UpdatedAt = null,
                    UpdatedBy = null
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

                // Basic Info
                if (!string.IsNullOrEmpty(request.Name))
                    organization.Name = request.Name;
                if (request.Type != null)
                    organization.OrganizationName = request.Type;
                if (request.Description != null)
                    organization.Description = request.Description;
                if (!string.IsNullOrEmpty(request.Status))
                    organization.Status = request.Status;
                
                // Address
                if (request.AddressLine1 != null)
                    organization.Address = request.AddressLine1;
                if (request.City != null)
                    organization.City = request.City;
                if (request.StateProvince != null)
                    organization.StateProvince = request.StateProvince;
                if (request.PostalCode != null)
                    organization.PostalCode = request.PostalCode;
                if (request.CountryCode != null)
                    organization.CountryCode = request.CountryCode;
                
                // Contact
                if (request.Phone != null)
                    organization.Phone = request.Phone;
                if (request.Email != null)
                    organization.Email = request.Email;
                if (request.Website != null)
                    organization.Website = request.Website;
                if (request.PrimaryContactName != null)
                    organization.PrimaryContactName = request.PrimaryContactName;
                if (request.PrimaryContactEmail != null)
                    organization.PrimaryContactEmail = request.PrimaryContactEmail;
                if (request.PrimaryContactPhone != null)
                    organization.PrimaryContactPhone = request.PrimaryContactPhone;
                
                // Configuration
                if (request.Timezone != null)
                    organization.Timezone = request.Timezone;
                if (request.LanguageCode != null)
                    organization.LanguageCode = request.LanguageCode;
                if (request.CurrencyCode != null)
                    organization.CurrencyCode = request.CurrencyCode;
                
                // Operations
                if (request.OperationalSince != null)
                {
                    organization.OperationalSince = request.OperationalSince.Value.Kind == DateTimeKind.Utc 
                        ? request.OperationalSince 
                        : DateTime.SpecifyKind(request.OperationalSince.Value, DateTimeKind.Utc);
                }
                if (request.RegistrationNumber != null)
                    organization.LicenseNumber = request.RegistrationNumber;

                // UpdatedAt and UpdatedBy fields don't exist in Organization entity
                
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
