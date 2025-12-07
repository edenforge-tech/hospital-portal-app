using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AuthService.Context;
using AuthService.Models.Domain;
using AuthService.Models.Branch;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AuthService.Services
{
    /// <summary>
    /// Service for comprehensive branch management with operational configuration
    /// </summary>
    public class BranchService : IBranchService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<BranchService> _logger;

        public BranchService(AppDbContext context, ILogger<BranchService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<BranchListResponse> GetAllBranchesAsync(BranchFilters filters)
        {
            try
            {
                _logger.LogInformation("GetAllBranchesAsync called with TenantId: {TenantId}", filters.TenantId);
                
                var query = _context.Branches.AsQueryable();

                // Tenant filter
                if (filters.TenantId.HasValue)
                {
                    _logger.LogInformation("Filtering by TenantId: {TenantId}", filters.TenantId.Value);
                    query = query.Where(b => b.TenantId == filters.TenantId.Value);
                }
                else
                {
                    _logger.LogWarning("No TenantId provided in filters!");
                }

                // Organization filter
                if (filters.OrganizationId.HasValue)
                {
                    query = query.Where(b => b.OrganizationId == filters.OrganizationId.Value);
                }

                // Search filter
                if (!string.IsNullOrEmpty(filters.Search))
                {
                    query = query.Where(b => 
                        b.Name.Contains(filters.Search) ||
                        (b.BranchCode != null && b.BranchCode.Contains(filters.Search)) ||
                        (b.City != null && b.City.Contains(filters.Search)));
                }

                // Region filter
                if (!string.IsNullOrEmpty(filters.Region))
                {
                    query = query.Where(b => b.Region == filters.Region);
                }

                // Status filter
                if (!string.IsNullOrEmpty(filters.Status))
                {
                    query = query.Where(b => b.Status == filters.Status);
                }

                // Operational status filter
                if (!string.IsNullOrEmpty(filters.OperationalStatus))
                {
                    query = query.Where(b => b.OperationalStatus == filters.OperationalStatus);
                }

                // Emergency support filter
                if (filters.EmergencySupport24x7.HasValue)
                {
                    query = query.Where(b => b.EmergencySupport24x7 == filters.EmergencySupport24x7.Value);
                }

                var totalCount = await query.CountAsync();
                _logger.LogInformation("Total branches found: {Count}", totalCount);

                // Sorting
                query = (filters.SortBy?.ToLower()) switch
                {
                    "name" => filters.SortOrder == "desc" ? query.OrderByDescending(b => b.Name) : query.OrderBy(b => b.Name),
                    "code" => filters.SortOrder == "desc" ? query.OrderByDescending(b => b.BranchCode) : query.OrderBy(b => b.BranchCode),
                    "region" => filters.SortOrder == "desc" ? query.OrderByDescending(b => b.Region) : query.OrderBy(b => b.Region),
                    "created" => filters.SortOrder == "desc" ? query.OrderByDescending(b => b.CreatedAt) : query.OrderBy(b => b.CreatedAt),
                    _ => query.OrderBy(b => b.Name)
                };

                // Pagination
                var branches = await query
                    // NOTE: Removed .Include(b => b.Organization) temporarily as FK relationship not configured
                    .Skip((filters.PageNumber - 1) * filters.PageSize)
                    .Take(filters.PageSize)
                    .ToListAsync();

                _logger.LogInformation("Retrieved {Count} branches after pagination", branches.Count);

                // Get organization names separately
                var organizationIds = branches.Select(b => b.OrganizationId).Distinct().ToList();
                Dictionary<Guid, string> organizations = new Dictionary<Guid, string>();
                
                try
                {
                    organizations = await _context.Organizations
                        .Where(o => organizationIds.Contains(o.Id))
                        .ToDictionaryAsync(o => o.Id, o => o.Name);
                }
                catch (Exception ex)
                {
                    // Log but continue - we'll just show empty organization names
                    Console.WriteLine($"Warning: Could not load organizations: {ex.Message}");
                }

                var branchDtos = branches.Select(b => new BranchDto
                {
                    Id = b.Id,
                    TenantId = b.TenantId,
                    OrganizationId = b.OrganizationId,
                    OrganizationName = organizations.ContainsKey(b.OrganizationId) ? organizations[b.OrganizationId] : "",
                    Name = b.Name,
                    Code = b.BranchCode,
                    Region = b.Region,
                    City = b.City,
                    Status = b.Status,
                    OperationalStatus = b.OperationalStatus,
                    TotalDepartments = b.TotalDepartments,
                    TotalStaff = b.TotalStaff,
                    CreatedAt = b.CreatedAt
                }).ToList();

                // Breakdowns
                var statusBreakdown = branches
                    .GroupBy(b => b.Status)
                    .ToDictionary(g => g.Key, g => g.Count());

                var operationalBreakdown = branches
                    .GroupBy(b => b.OperationalStatus)
                    .ToDictionary(g => g.Key, g => g.Count());

                var regionBreakdown = branches
                    .GroupBy(b => b.Region)
                    .ToDictionary(g => g.Key, g => g.Count());

                return new BranchListResponse
                {
                    Branches = branchDtos,
                    TotalCount = totalCount,
                    PageNumber = filters.PageNumber,
                    PageSize = filters.PageSize,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)filters.PageSize),
                    StatusBreakdown = statusBreakdown,
                    OperationalStatusBreakdown = operationalBreakdown,
                    RegionBreakdown = regionBreakdown
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting branches");
                throw;
            }
        }

        public async Task<BranchDetailsDto?> GetBranchByIdAsync(Guid branchId)
        {
            try
            {
                var branch = await _context.Branches
                    .Include(b => b.Organization)
                    .FirstOrDefaultAsync(b => b.Id == branchId);

                if (branch == null) return null;

                return MapToDetailsDto(branch);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting branch by ID: {BranchId}", branchId);
                throw;
            }
        }

        public async Task<BranchDetailsDto?> GetBranchByCodeAsync(Guid tenantId, string code)
        {
            try
            {
                var branch = await _context.Branches
                    .Include(b => b.Organization)
                    .FirstOrDefaultAsync(b => b.TenantId == tenantId && b.BranchCode == code);

                if (branch == null) return null;

                return MapToDetailsDto(branch);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting branch by code: {Code}", code);
                throw;
            }
        }

        public async Task<BranchOperationResult> CreateBranchAsync(CreateBranchRequest request, Guid createdBy)
        {
            try
            {
                // Validate
                var validation = await ValidateBranchAsync(request);
                if (!validation.IsValid)
                {
                    return new BranchOperationResult
                    {
                        Success = false,
                        Message = "Validation failed",
                        Errors = validation.Errors
                    };
                }

                var branch = new Models.Domain.Branch
                {
                    Id = Guid.NewGuid(),
                    TenantId = request.TenantId,
                    OrganizationId = request.OrganizationId,
                    Name = request.Name,
                    BranchCode = request.Code,
                    Description = request.Description,
                    Status = request.Status,
                    Region = request.Region,
                    Timezone = request.Timezone,
                    CurrencyCode = request.Currency,
                    LanguagePrimary = request.LanguagePrimary,
                    AddressLine1 = request.AddressLine1,
                    AddressLine2 = request.AddressLine2,
                    City = request.City,
                    StateProvince = request.StateProvince,
                    PostalCode = request.PostalCode,
                    CountryCode = request.CountryCode,
                    Latitude = request.Latitude.HasValue ? (decimal?)request.Latitude.Value : null,
                    Longitude = request.Longitude.HasValue ? (decimal?)request.Longitude.Value : null,
                    Phone = request.Phone,
                    Email = request.Email,
                    Fax = request.Fax,
                    OperationalHoursStart = request.OperationalHoursStart,
                    OperationalHoursEnd = request.OperationalHoursEnd,
                    EmergencySupport24x7 = request.EmergencySupport24x7,
                    OperationalStatus = request.OperationalStatus,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = createdBy
                };

                _context.Branches.Add(branch);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created branch {BranchId} by user {UserId}", branch.Id, createdBy);

                return new BranchOperationResult
                {
                    Success = true,
                    Message = "Branch created successfully",
                    BranchId = branch.Id,
                    Data = new BranchDto
                    {
                        Id = branch.Id,
                        TenantId = branch.TenantId,
                        OrganizationId = branch.OrganizationId,
                        Name = branch.Name,
                        Code = branch.BranchCode,
                        Region = branch.Region,
                        City = branch.City,
                        Status = branch.Status,
                        OperationalStatus = branch.OperationalStatus,
                        CreatedAt = branch.CreatedAt
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating branch");
                return new BranchOperationResult
                {
                    Success = false,
                    Message = "Error creating branch",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<BranchOperationResult> UpdateBranchAsync(Guid branchId, UpdateBranchRequest request, Guid updatedBy)
        {
            try
            {
                var branch = await _context.Branches.FindAsync(branchId);
                if (branch == null)
                {
                    return new BranchOperationResult
                    {
                        Success = false,
                        Message = "Branch not found"
                    };
                }

                // Update fields
                if (request.Name != null) branch.Name = request.Name;
                if (request.Description != null) branch.Description = request.Description;
                if (request.Status != null) branch.Status = request.Status;
                if (request.Region != null) branch.Region = request.Region;
                if (request.Timezone != null) branch.Timezone = request.Timezone;
                if (request.Currency != null) branch.CurrencyCode = request.Currency;
                if (request.LanguagePrimary != null) branch.LanguagePrimary = request.LanguagePrimary;
                if (request.AddressLine1 != null) branch.AddressLine1 = request.AddressLine1;
                if (request.AddressLine2 != null) branch.AddressLine2 = request.AddressLine2;
                if (request.City != null) branch.City = request.City;
                if (request.StateProvince != null) branch.StateProvince = request.StateProvince;
                if (request.PostalCode != null) branch.PostalCode = request.PostalCode;
                if (request.CountryCode != null) branch.CountryCode = request.CountryCode;
                if (request.Latitude.HasValue) branch.Latitude = (decimal?)request.Latitude.Value;
                if (request.Longitude.HasValue) branch.Longitude = (decimal?)request.Longitude.Value;
                if (request.Phone != null) branch.Phone = request.Phone;
                if (request.Email != null) branch.Email = request.Email;
                if (request.Fax != null) branch.Fax = request.Fax;
                if (request.OperationalHoursStart.HasValue) branch.OperationalHoursStart = request.OperationalHoursStart;
                if (request.OperationalHoursEnd.HasValue) branch.OperationalHoursEnd = request.OperationalHoursEnd;
                if (request.EmergencySupport24x7.HasValue) branch.EmergencySupport24x7 = request.EmergencySupport24x7.Value;
                if (request.OperationalStatus != null) branch.OperationalStatus = request.OperationalStatus;

                branch.UpdatedAt = DateTime.UtcNow;
                branch.UpdatedBy = updatedBy;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Updated branch {BranchId} by user {UserId}", branchId, updatedBy);

                return new BranchOperationResult
                {
                    Success = true,
                    Message = "Branch updated successfully",
                    BranchId = branchId
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating branch");
                return new BranchOperationResult
                {
                    Success = false,
                    Message = "Error updating branch",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<BranchOperationResult> DeleteBranchAsync(Guid branchId)
        {
            try
            {
                var branch = await _context.Branches.FindAsync(branchId);
                if (branch == null)
                {
                    return new BranchOperationResult
                    {
                        Success = false,
                        Message = "Branch not found"
                    };
                }

                // Check for departments
                var deptCount = await GetDepartmentCountAsync(branchId);
                if (deptCount > 0)
                {
                    return new BranchOperationResult
                    {
                        Success = false,
                        Message = "Cannot delete branch with existing departments",
                        Errors = new List<string> { $"Branch has {deptCount} departments" }
                    };
                }

                _context.Branches.Remove(branch);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Deleted branch {BranchId}", branchId);

                return new BranchOperationResult
                {
                    Success = true,
                    Message = "Branch deleted successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting branch");
                return new BranchOperationResult
                {
                    Success = false,
                    Message = "Error deleting branch",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<BranchOperationResult> UpdateBranchStatusAsync(Guid branchId, string status, Guid updatedBy)
        {
            try
            {
                var branch = await _context.Branches.FindAsync(branchId);
                if (branch == null)
                {
                    return new BranchOperationResult
                    {
                        Success = false,
                        Message = "Branch not found"
                    };
                }

                branch.Status = status;
                branch.UpdatedAt = DateTime.UtcNow;
                branch.UpdatedBy = updatedBy;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Updated branch {BranchId} status to {Status}", branchId, status);

                return new BranchOperationResult
                {
                    Success = true,
                    Message = "Branch status updated successfully",
                    BranchId = branchId
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating branch status");
                return new BranchOperationResult
                {
                    Success = false,
                    Message = "Error updating branch status",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<BranchOperationResult> UpdateOperationalHoursAsync(Guid branchId, UpdateOperationalHoursRequest request, Guid updatedBy)
        {
            try
            {
                var branch = await _context.Branches.FindAsync(branchId);
                if (branch == null)
                {
                    return new BranchOperationResult
                    {
                        Success = false,
                        Message = "Branch not found"
                    };
                }

                branch.OperationalHoursStart = request.OperationalHoursStart;
                branch.OperationalHoursEnd = request.OperationalHoursEnd;
                branch.EmergencySupport24x7 = request.EmergencySupport24x7;
                branch.UpdatedAt = DateTime.UtcNow;
                branch.UpdatedBy = updatedBy;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Updated operational hours for branch {BranchId}", branchId);

                return new BranchOperationResult
                {
                    Success = true,
                    Message = "Operational hours updated successfully",
                    BranchId = branchId
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating operational hours");
                return new BranchOperationResult
                {
                    Success = false,
                    Message = "Error updating operational hours",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<BranchOperationResult> UpdateOperationalStatusAsync(Guid branchId, string operationalStatus, Guid updatedBy)
        {
            try
            {
                var branch = await _context.Branches.FindAsync(branchId);
                if (branch == null)
                {
                    return new BranchOperationResult
                    {
                        Success = false,
                        Message = "Branch not found"
                    };
                }

                branch.OperationalStatus = operationalStatus;
                branch.UpdatedAt = DateTime.UtcNow;
                branch.UpdatedBy = updatedBy;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Updated operational status for branch {BranchId} to {Status}", branchId, operationalStatus);

                return new BranchOperationResult
                {
                    Success = true,
                    Message = "Operational status updated successfully",
                    BranchId = branchId
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating operational status");
                return new BranchOperationResult
                {
                    Success = false,
                    Message = "Error updating operational status",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<BranchOperationalInfoDto> GetOperationalInfoAsync(Guid branchId)
        {
            try
            {
                var branch = await _context.Branches.FindAsync(branchId);
                if (branch == null)
                {
                    throw new InvalidOperationException("Branch not found");
                }

                var isOperational = await IsCurrentlyOperationalAsync(branchId);

                return new BranchOperationalInfoDto
                {
                    BranchId = branch.Id,
                    BranchName = branch.Name,
                    OperationalHoursStart = branch.OperationalHoursStart,
                    OperationalHoursEnd = branch.OperationalHoursEnd,
                    EmergencySupport24x7 = branch.EmergencySupport24x7,
                    OperationalStatus = branch.OperationalStatus,
                    IsCurrentlyOperational = isOperational,
                    Timezone = branch.Timezone
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting operational info");
                throw;
            }
        }

        public async Task<bool> IsCurrentlyOperationalAsync(Guid branchId)
        {
            try
            {
                var branch = await _context.Branches.FindAsync(branchId);
                if (branch == null) return false;

                // If 24/7 emergency support, always operational
                if (branch.EmergencySupport24x7 == true) return true;

                // Check operational status
                if (branch.OperationalStatus != "operational") return false;

                // Check current time against operational hours
                if (branch.OperationalHoursStart.HasValue && branch.OperationalHoursEnd.HasValue)
                {
                    var now = DateTime.UtcNow.TimeOfDay;
                    return now >= branch.OperationalHoursStart && now <= branch.OperationalHoursEnd;
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking operational status");
                return false;
            }
        }

        public async Task<List<BranchDto>> GetByRegionAsync(Guid tenantId, string region)
        {
            try
            {
                var branches = await _context.Branches
                    .Include(b => b.Organization)
                    .Where(b => b.TenantId == tenantId && b.Region == region)
                    .ToListAsync();

                return branches.Select(b => new BranchDto
                {
                    Id = b.Id,
                    TenantId = b.TenantId,
                    OrganizationId = b.OrganizationId,
                    OrganizationName = b.Organization?.Name ?? "",
                    Name = b.Name,
                    Code = b.BranchCode,
                    Region = b.Region,
                    City = b.City,
                    Status = b.Status,
                    OperationalStatus = b.OperationalStatus,
                    TotalDepartments = b.TotalDepartments,
                    TotalStaff = b.TotalStaff,
                    CreatedAt = b.CreatedAt
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting branches by region");
                throw;
            }
        }

        public async Task<List<BranchLocationDto>> GetNearbyBranchesAsync(NearbyBranchesRequest request)
        {
            try
            {
                var branches = await _context.Branches
                    .Where(b => b.Latitude.HasValue && b.Longitude.HasValue)
                    .ToListAsync();

                var nearbyBranches = branches
                    .Select(b => new
                    {
                        Branch = b,
                        Distance = CalculateDistance(
                            (decimal)request.Latitude, (decimal)request.Longitude,
                            (decimal)b.Latitude!.Value, (decimal)b.Longitude!.Value)
                    })
                    .Where(x => x.Distance <= request.RadiusKm)
                    .OrderBy(x => x.Distance)
                    .Take(request.MaxResults)
                    .Select(x => new BranchLocationDto
                    {
                        BranchId = x.Branch.Id,
                        BranchName = x.Branch.Name,
                        AddressLine1 = x.Branch.AddressLine1,
                        AddressLine2 = x.Branch.AddressLine2,
                        City = x.Branch.City,
                        StateProvince = x.Branch.StateProvince,
                        PostalCode = x.Branch.PostalCode,
                        CountryCode = x.Branch.CountryCode,
                        Latitude = x.Branch.Latitude.HasValue ? (decimal?)x.Branch.Latitude.Value : null,
                        Longitude = x.Branch.Longitude.HasValue ? (decimal?)x.Branch.Longitude.Value : null,
                        DistanceKm = x.Distance
                    })
                    .ToList();

                return nearbyBranches;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting nearby branches");
                throw;
            }
        }

        public async Task<int> GetDepartmentCountAsync(Guid branchId)
        {
            try
            {
                return await _context.Departments.CountAsync(d => d.BranchId == branchId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting department count");
                return 0;
            }
        }

        public async Task<int> GetStaffCountAsync(Guid branchId)
        {
            try
            {
                // Will be implemented when staff/user-branch relationship is established
                return 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting staff count");
                return 0;
            }
        }

        public async Task<BranchStatistics> GetStatisticsAsync(Guid? tenantId = null, Guid? organizationId = null)
        {
            try
            {
                var query = _context.Branches.AsQueryable();
                
                if (tenantId.HasValue)
                {
                    query = query.Where(b => b.TenantId == tenantId.Value);
                }

                if (organizationId.HasValue)
                {
                    query = query.Where(b => b.OrganizationId == organizationId.Value);
                }

                var branches = await query.ToListAsync();
                var totalBranches = branches.Count;

                var statusBreakdown = branches
                    .GroupBy(b => b.Status)
                    .ToDictionary(g => g.Key, g => g.Count());

                var operationalBreakdown = branches
                    .GroupBy(b => b.OperationalStatus)
                    .ToDictionary(g => g.Key, g => g.Count());

                var regionBreakdown = branches
                    .GroupBy(b => b.Region)
                    .ToDictionary(g => g.Key, g => g.Count());

                var emergencyCount = branches.Count(b => b.EmergencySupport24x7 == true);

                var topByDepartments = branches
                    .OrderByDescending(b => b.TotalDepartments)
                    .Take(10)
                    .Select(b => new BranchUsageDto
                    {
                        BranchId = b.Id,
                        BranchName = b.Name,
                        Region = b.Region,
                        TotalDepartments = b.TotalDepartments,
                        TotalStaff = b.TotalStaff
                    })
                    .ToList();

                return new BranchStatistics
                {
                    TotalBranches = totalBranches,
                    StatusBreakdown = statusBreakdown,
                    OperationalStatusBreakdown = operationalBreakdown,
                    RegionBreakdown = regionBreakdown,
                    TotalDepartments = branches.Sum(b => b.TotalDepartments),
                    TotalStaff = branches.Sum(b => b.TotalStaff),
                    EmergencyBranchesCount = emergencyCount,
                    TopBranchesByDepartments = topByDepartments
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting statistics");
                throw;
            }
        }

        public async Task<BranchListResponse> SearchBranchesAsync(string query, Guid? tenantId = null, Guid? organizationId = null, int pageNumber = 1, int pageSize = 50)
        {
            try
            {
                var filters = new BranchFilters
                {
                    TenantId = tenantId,
                    OrganizationId = organizationId,
                    Search = query,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                };

                return await GetAllBranchesAsync(filters);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching branches");
                throw;
            }
        }

        public async Task<BranchValidationResult> ValidateBranchAsync(CreateBranchRequest request)
        {
            var result = new BranchValidationResult { IsValid = true };

            if (string.IsNullOrWhiteSpace(request.Name))
            {
                result.Errors.Add("Branch name is required");
            }

            if (string.IsNullOrWhiteSpace(request.Region))
            {
                result.Errors.Add("Region is required");
            }

            if (string.IsNullOrWhiteSpace(request.Timezone))
            {
                result.Errors.Add("Timezone is required");
            }

            // Check for duplicate code within tenant
            if (!string.IsNullOrWhiteSpace(request.Code))
            {
                var exists = await _context.Branches
                    .AnyAsync(b => b.TenantId == request.TenantId && b.BranchCode == request.Code);
                if (exists)
                {
                    result.Errors.Add("Branch code already exists within this tenant");
                }
            }

            // Check organization exists
            var orgExists = await _context.Organizations
                .AnyAsync(o => o.Id == request.OrganizationId && o.TenantId == request.TenantId);
            if (!orgExists)
            {
                result.Errors.Add("Organization not found or does not belong to this tenant");
            }

            result.IsValid = result.Errors.Count == 0;
            return result;
        }

        // Helper methods
        private BranchDetailsDto MapToDetailsDto(Models.Domain.Branch branch)
        {
            return new BranchDetailsDto
            {
                Id = branch.Id,
                TenantId = branch.TenantId,
                OrganizationId = branch.OrganizationId,
                OrganizationName = branch.Organization?.Name ?? "",
                Name = branch.Name,
                Code = branch.BranchCode,
                Description = branch.Description,
                Status = branch.Status,
                Region = branch.Region,
                Timezone = branch.Timezone,
                Currency = branch.CurrencyCode,
                LanguagePrimary = branch.LanguagePrimary,
                AddressLine1 = branch.AddressLine1,
                AddressLine2 = branch.AddressLine2,
                City = branch.City,
                StateProvince = branch.StateProvince,
                PostalCode = branch.PostalCode,
                CountryCode = branch.CountryCode,
                Latitude = branch.Latitude,
                Longitude = branch.Longitude,
                Phone = branch.Phone,
                Email = branch.Email,
                Fax = branch.Fax,
                OperationalHoursStart = branch.OperationalHoursStart,
                OperationalHoursEnd = branch.OperationalHoursEnd,
                EmergencySupport24x7 = branch.EmergencySupport24x7,
                TotalDepartments = branch.TotalDepartments,
                TotalStaff = branch.TotalStaff,
                OperationalStatus = branch.OperationalStatus,
                CreatedAt = branch.CreatedAt,
                CreatedBy = branch.CreatedBy,
                UpdatedAt = branch.UpdatedAt,
                UpdatedBy = branch.UpdatedBy
            };
        }

        private double CalculateDistance(decimal lat1, decimal lon1, decimal lat2, decimal lon2)
        {
            // Haversine formula for calculating distance between two coordinates
            const double R = 6371; // Earth's radius in km

            var dLat = ToRadians((double)(lat2 - lat1));
            var dLon = ToRadians((double)(lon2 - lon1));

            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians((double)lat1)) * Math.Cos(ToRadians((double)lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

            return R * c;
        }

        private double ToRadians(double degrees)
        {
            return degrees * Math.PI / 180;
        }
    }
}
