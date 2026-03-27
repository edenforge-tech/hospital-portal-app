using AuthService.Context;
using AuthService.Models;
using AuthService.Models.Search;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Text.Json;
using System.Threading.Tasks;

namespace AuthService.Services
{
    public class SearchService : ISearchService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<SearchService> _logger;

        public SearchService(AppDbContext context, ILogger<SearchService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<SearchResultDto> ExecuteSearchAsync(ExecuteSearchRequest request, Guid tenantId, Guid userId)
        {
            var stopwatch = Stopwatch.StartNew();

            try
            {
                IQueryable<object> query = request.Scope switch
                {
                    SearchScope.User => _context.Users.Where(u => u.TenantId == tenantId).AsQueryable<object>(),
                    SearchScope.Role => _context.Roles.Where(r => r.TenantId == tenantId).AsQueryable<object>(),
                    SearchScope.Permission => _context.Permissions.Where(p => p.TenantId == tenantId).AsQueryable<object>(),
                    SearchScope.Department => _context.Departments.Where(d => d.TenantId == tenantId).AsQueryable<object>(),
                    SearchScope.Organization => _context.Organizations.Where(o => o.TenantId == tenantId).AsQueryable<object>(),
                    SearchScope.Branch => _context.Branches.Where(b => b.TenantId == tenantId).AsQueryable<object>(),
                    SearchScope.Patient => _context.Patients.Where(p => p.TenantId == tenantId).AsQueryable<object>(),
                    SearchScope.Appointment => _context.Appointments.Where(a => a.TenantId == tenantId).AsQueryable<object>(),
                    SearchScope.License => _context.ProfessionalLicenses.Where(l => l.TenantId == tenantId).AsQueryable<object>(),
                    SearchScope.Contract => _context.EmploymentContracts.Where(c => c.TenantId == tenantId).AsQueryable<object>(),
                    // Note: Leave, Shift, Attendance, Payroll entities not yet implemented - will be added in future phases
                    _ => throw new ArgumentException($"Unsupported search scope: {request.Scope}")
                };

                // Apply dynamic criteria using System.Linq.Dynamic.Core
                foreach (var criterion in request.Criteria)
                {
                    query = ApplyCriterion(query, criterion);
                }

                // Get total count before pagination
                var totalCount = await query.CountAsync();

                // Apply sorting
                if (!string.IsNullOrEmpty(request.SortBy))
                {
                    var sortDirection = request.SortDescending ? "DESC" : "ASC";
                    query = query.OrderBy($"{request.SortBy} {sortDirection}");
                }
                else
                {
                    // Default sorting by CreatedAt if exists
                    query = query.OrderBy("CreatedAt DESC");
                }

                // Apply pagination
                var results = await query
                    .Skip((request.PageNumber - 1) * request.PageSize)
                    .Take(request.PageSize)
                    .ToListAsync();

                stopwatch.Stop();

                return new SearchResultDto
                {
                    Results = results,
                    TotalCount = totalCount,
                    PageNumber = request.PageNumber,
                    PageSize = request.PageSize,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize),
                    Scope = request.Scope,
                    ExecutionTimeMs = stopwatch.Elapsed.TotalMilliseconds
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing search for scope {Scope}", request.Scope);
                throw;
            }
        }

        public async Task<SavedSearchDto> SaveSearchAsync(CreateSavedSearchRequest request, Guid tenantId, Guid userId)
        {
            var criteriaJson = JsonSerializer.Serialize(request.Criteria);

            var savedSearch = new SavedSearch
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                UserId = userId,
                SearchName = request.SearchName,
                Criteria = criteriaJson,
                Scope = request.Scope,
                IsGlobal = request.IsGlobal,
                IsFavorite = request.IsFavorite,
                ExecutionCount = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedByUserId = userId,
                UpdatedByUserId = userId
            };

            _context.SavedSearches.Add(savedSearch);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Saved search '{SearchName}' for user {UserId}", request.SearchName, userId);

            return await MapToDto(savedSearch);
        }

        public async Task<List<SavedSearchDto>> GetUserSavedSearchesAsync(Guid userId, Guid tenantId, SearchScope? scope = null)
        {
            var query = _context.SavedSearches
                .Where(s => s.TenantId == tenantId && s.DeletedAt == null)
                .Where(s => s.UserId == userId || s.IsGlobal);

            if (scope.HasValue)
            {
                query = query.Where(s => s.Scope == scope.Value);
            }

            var searches = await query
                .OrderByDescending(s => s.IsFavorite)
                .ThenByDescending(s => s.LastExecutedAt)
                .ThenByDescending(s => s.CreatedAt)
                .ToListAsync();

            var dtos = new List<SavedSearchDto>();
            foreach (var search in searches)
            {
                dtos.Add(await MapToDto(search));
            }

            return dtos;
        }

        public async Task<List<SearchPresetDto>> GetSearchPresetsAsync(SearchScope? scope = null)
        {
            var presets = new List<SearchPresetDto>
            {
                // User presets
                new SearchPresetDto
                {
                    PresetId = "active-users",
                    Name = "Active Users",
                    Description = "All users with active status",
                    Scope = SearchScope.User,
                    Category = "Users",
                    Criteria = new List<SearchCriterion>
                    {
                        new SearchCriterion { Field = "Status", Operator = SearchOperator.Equals, Value = "Active" }
                    }
                },
                new SearchPresetDto
                {
                    PresetId = "inactive-users",
                    Name = "Inactive Users",
                    Description = "All users with inactive status",
                    Scope = SearchScope.User,
                    Category = "Users",
                    Criteria = new List<SearchCriterion>
                    {
                        new SearchCriterion { Field = "Status", Operator = SearchOperator.Equals, Value = "Inactive" }
                    }
                },
                new SearchPresetDto
                {
                    PresetId = "users-created-this-month",
                    Name = "Users Created This Month",
                    Description = "Users created in the current month",
                    Scope = SearchScope.User,
                    Category = "Users",
                    Criteria = new List<SearchCriterion>
                    {
                        new SearchCriterion { Field = "CreatedAt", Operator = SearchOperator.GreaterThanOrEqual, Value = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1) }
                    }
                },

                // Role presets
                new SearchPresetDto
                {
                    PresetId = "custom-roles",
                    Name = "Custom Roles",
                    Description = "Roles that are not system default",
                    Scope = SearchScope.Role,
                    Category = "Roles",
                    Criteria = new List<SearchCriterion>
                    {
                        new SearchCriterion { Field = "IsSystemDefault", Operator = SearchOperator.Equals, Value = false }
                    }
                },

                // Appointment presets
                new SearchPresetDto
                {
                    PresetId = "pending-appointments",
                    Name = "Pending Appointments",
                    Description = "Appointments with pending status",
                    Scope = SearchScope.Appointment,
                    Category = "Appointments",
                    Criteria = new List<SearchCriterion>
                    {
                        new SearchCriterion { Field = "Status", Operator = SearchOperator.Equals, Value = "Pending" }
                    }
                },
                new SearchPresetDto
                {
                    PresetId = "todays-appointments",
                    Name = "Today's Appointments",
                    Description = "All appointments scheduled for today",
                    Scope = SearchScope.Appointment,
                    Category = "Appointments",
                    Criteria = new List<SearchCriterion>
                    {
                        new SearchCriterion { Field = "AppointmentDate", Operator = SearchOperator.Equals, Value = DateTime.UtcNow.Date }
                    }
                },
                new SearchPresetDto
                {
                    PresetId = "upcoming-appointments",
                    Name = "Upcoming Appointments (Next 7 Days)",
                    Description = "Appointments in the next week",
                    Scope = SearchScope.Appointment,
                    Category = "Appointments",
                    Criteria = new List<SearchCriterion>
                    {
                        new SearchCriterion { Field = "AppointmentDate", Operator = SearchOperator.Between, Value = DateTime.UtcNow.Date, ValueSecondary = DateTime.UtcNow.Date.AddDays(7) }
                    }
                },

                // License presets
                new SearchPresetDto
                {
                    PresetId = "expiring-licenses",
                    Name = "Expiring Licenses (Next 30 Days)",
                    Description = "Licenses expiring in the next month",
                    Scope = SearchScope.License,
                    Category = "Licenses",
                    Criteria = new List<SearchCriterion>
                    {
                        new SearchCriterion { Field = "ExpiryDate", Operator = SearchOperator.Between, Value = DateTime.UtcNow.Date, ValueSecondary = DateTime.UtcNow.Date.AddDays(30) }
                    }
                },
                new SearchPresetDto
                {
                    PresetId = "expired-licenses",
                    Name = "Expired Licenses",
                    Description = "Licenses that have already expired",
                    Scope = SearchScope.License,
                    Category = "Licenses",
                    Criteria = new List<SearchCriterion>
                    {
                        new SearchCriterion { Field = "ExpiryDate", Operator = SearchOperator.LessThan, Value = DateTime.UtcNow.Date }
                    }
                },

                // Contract presets
                new SearchPresetDto
                {
                    PresetId = "expiring-contracts",
                    Name = "Expiring Contracts (Next 60 Days)",
                    Description = "Contracts expiring in the next 2 months",
                    Scope = SearchScope.Contract,
                    Category = "Contracts",
                    Criteria = new List<SearchCriterion>
                    {
                        new SearchCriterion { Field = "EndDate", Operator = SearchOperator.Between, Value = DateTime.UtcNow.Date, ValueSecondary = DateTime.UtcNow.Date.AddDays(60) }
                    }
                },
                new SearchPresetDto
                {
                    PresetId = "active-contracts",
                    Name = "Active Contracts",
                    Description = "Contracts currently active",
                    Scope = SearchScope.Contract,
                    Category = "Contracts",
                    Criteria = new List<SearchCriterion>
                    {
                        new SearchCriterion { Field = "Status", Operator = SearchOperator.Equals, Value = "Active" }
                    }
                },

                // Leave presets
                new SearchPresetDto
                {
                    PresetId = "pending-leave-requests",
                    Name = "Pending Leave Requests",
                    Description = "Leave requests awaiting approval",
                    Scope = SearchScope.Leave,
                    Category = "Leave",
                    Criteria = new List<SearchCriterion>
                    {
                        new SearchCriterion { Field = "Status", Operator = SearchOperator.Equals, Value = "Pending" }
                    }
                },
                new SearchPresetDto
                {
                    PresetId = "approved-leave-this-month",
                    Name = "Approved Leave This Month",
                    Description = "Leave approved for the current month",
                    Scope = SearchScope.Leave,
                    Category = "Leave",
                    Criteria = new List<SearchCriterion>
                    {
                        new SearchCriterion { Field = "Status", Operator = SearchOperator.Equals, Value = "Approved" },
                        new SearchCriterion { Field = "StartDate", Operator = SearchOperator.GreaterThanOrEqual, Value = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1) }
                    }
                },

                // Attendance presets
                new SearchPresetDto
                {
                    PresetId = "late-arrivals-this-week",
                    Name = "Late Arrivals This Week",
                    Description = "Employees who arrived late this week",
                    Scope = SearchScope.Attendance,
                    Category = "Attendance",
                    Criteria = new List<SearchCriterion>
                    {
                        new SearchCriterion { Field = "IsLate", Operator = SearchOperator.Equals, Value = true },
                        new SearchCriterion { Field = "Date", Operator = SearchOperator.GreaterThanOrEqual, Value = DateTime.UtcNow.Date.AddDays(-(int)DateTime.UtcNow.DayOfWeek) }
                    }
                },
                new SearchPresetDto
                {
                    PresetId = "absences-today",
                    Name = "Absences Today",
                    Description = "Employees absent today",
                    Scope = SearchScope.Attendance,
                    Category = "Attendance",
                    Criteria = new List<SearchCriterion>
                    {
                        new SearchCriterion { Field = "Status", Operator = SearchOperator.Equals, Value = "Absent" },
                        new SearchCriterion { Field = "Date", Operator = SearchOperator.Equals, Value = DateTime.UtcNow.Date }
                    }
                },

                // Department presets
                new SearchPresetDto
                {
                    PresetId = "active-departments",
                    Name = "Active Departments",
                    Description = "All active departments",
                    Scope = SearchScope.Department,
                    Category = "Departments",
                    Criteria = new List<SearchCriterion>
                    {
                        new SearchCriterion { Field = "Status", Operator = SearchOperator.Equals, Value = "Active" }
                    }
                },

                // Patient presets
                new SearchPresetDto
                {
                    PresetId = "new-patients-this-month",
                    Name = "New Patients This Month",
                    Description = "Patients registered in the current month",
                    Scope = SearchScope.Patient,
                    Category = "Patients",
                    Criteria = new List<SearchCriterion>
                    {
                        new SearchCriterion { Field = "CreatedAt", Operator = SearchOperator.GreaterThanOrEqual, Value = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1) }
                    }
                },
                new SearchPresetDto
                {
                    PresetId = "critical-patients",
                    Name = "Critical Patients",
                    Description = "Patients with critical status",
                    Scope = SearchScope.Patient,
                    Category = "Patients",
                    Criteria = new List<SearchCriterion>
                    {
                        new SearchCriterion { Field = "Status", Operator = SearchOperator.Equals, Value = "Critical" }
                    }
                },

                // Branch presets
                new SearchPresetDto
                {
                    PresetId = "branches-at-capacity",
                    Name = "Branches at Capacity",
                    Description = "Branches with occupancy >= 90%",
                    Scope = SearchScope.Branch,
                    Category = "Branches",
                    Criteria = new List<SearchCriterion>
                    {
                        new SearchCriterion { Field = "OccupancyPercentage", Operator = SearchOperator.GreaterThanOrEqual, Value = 90 }
                    }
                },

                // Payroll presets
                new SearchPresetDto
                {
                    PresetId = "pending-payrolls",
                    Name = "Pending Payrolls",
                    Description = "Payroll entries awaiting processing",
                    Scope = SearchScope.Payroll,
                    Category = "Payroll",
                    Criteria = new List<SearchCriterion>
                    {
                        new SearchCriterion { Field = "Status", Operator = SearchOperator.Equals, Value = "Pending" }
                    }
                },
                new SearchPresetDto
                {
                    PresetId = "processed-payrolls-this-month",
                    Name = "Processed Payrolls This Month",
                    Description = "Payroll entries processed this month",
                    Scope = SearchScope.Payroll,
                    Category = "Payroll",
                    Criteria = new List<SearchCriterion>
                    {
                        new SearchCriterion { Field = "Status", Operator = SearchOperator.Equals, Value = "Processed" },
                        new SearchCriterion { Field = "ProcessedDate", Operator = SearchOperator.GreaterThanOrEqual, Value = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1) }
                    }
                }
            };

            if (scope.HasValue)
            {
                return presets.Where(p => p.Scope == scope.Value).ToList();
            }

            return await Task.FromResult(presets);
        }

        public async Task<bool> DeleteSavedSearchAsync(Guid searchId, Guid userId, Guid tenantId)
        {
            var search = await _context.SavedSearches
                .FirstOrDefaultAsync(s => s.Id == searchId && s.TenantId == tenantId && s.DeletedAt == null);

            if (search == null)
            {
                return false;
            }

            // Only owner or global search creator can delete
            if (search.UserId != userId && !search.IsGlobal)
            {
                throw new UnauthorizedAccessException("You can only delete your own searches");
            }

            search.DeletedAt = DateTime.UtcNow;
            search.UpdatedByUserId = userId;
            search.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Deleted saved search {SearchId} by user {UserId}", searchId, userId);

            return true;
        }

        public async Task<SavedSearchDto?> GetSavedSearchByIdAsync(Guid searchId, Guid userId, Guid tenantId)
        {
            var search = await _context.SavedSearches
                .FirstOrDefaultAsync(s => s.Id == searchId && s.TenantId == tenantId && s.DeletedAt == null);

            if (search == null)
            {
                return null;
            }

            // Check access - user must be owner or search must be global
            if (search.UserId != userId && !search.IsGlobal)
            {
                throw new UnauthorizedAccessException("You do not have access to this search");
            }

            return await MapToDto(search);
        }

        public async Task<bool> UpdateFavoriteStatusAsync(Guid searchId, bool isFavorite, Guid userId, Guid tenantId)
        {
            var search = await _context.SavedSearches
                .FirstOrDefaultAsync(s => s.Id == searchId && s.TenantId == tenantId && s.DeletedAt == null);

            if (search == null)
            {
                return false;
            }

            search.IsFavorite = isFavorite;
            search.UpdatedAt = DateTime.UtcNow;
            search.UpdatedByUserId = userId;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated favorite status for search {SearchId} to {IsFavorite}", searchId, isFavorite);

            return true;
        }

        public async Task<SearchResultDto> ExecuteSavedSearchAsync(Guid searchId, int pageNumber, int pageSize, Guid userId, Guid tenantId)
        {
            var search = await _context.SavedSearches
                .FirstOrDefaultAsync(s => s.Id == searchId && s.TenantId == tenantId && s.DeletedAt == null);

            if (search == null)
            {
                throw new KeyNotFoundException($"Saved search {searchId} not found");
            }

            // Check access
            if (search.UserId != userId && !search.IsGlobal)
            {
                throw new UnauthorizedAccessException("You do not have access to this search");
            }

            // Deserialize criteria
            var criteria = JsonSerializer.Deserialize<List<SearchCriterion>>(search.Criteria) ?? new List<SearchCriterion>();

            var request = new ExecuteSearchRequest
            {
                Scope = search.Scope,
                Criteria = criteria,
                PageNumber = pageNumber,
                PageSize = pageSize
            };

            // Update execution stats
            search.ExecutionCount++;
            search.LastExecutedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return await ExecuteSearchAsync(request, tenantId, userId);
        }

        // Private helper methods
        private IQueryable<object> ApplyCriterion(IQueryable<object> query, SearchCriterion criterion)
        {
            try
            {
                return criterion.Operator switch
                {
                    SearchOperator.Equals => query.Where($"{criterion.Field} == @0", criterion.Value),
                    SearchOperator.Contains => query.Where($"{criterion.Field}.Contains(@0)", criterion.Value),
                    SearchOperator.StartsWith => query.Where($"{criterion.Field}.StartsWith(@0)", criterion.Value),
                    SearchOperator.EndsWith => query.Where($"{criterion.Field}.EndsWith(@0)", criterion.Value),
                    SearchOperator.GreaterThan => query.Where($"{criterion.Field} > @0", criterion.Value),
                    SearchOperator.LessThan => query.Where($"{criterion.Field} < @0", criterion.Value),
                    SearchOperator.GreaterThanOrEqual => query.Where($"{criterion.Field} >= @0", criterion.Value),
                    SearchOperator.LessThanOrEqual => query.Where($"{criterion.Field} <= @0", criterion.Value),
                    SearchOperator.IsNull => query.Where($"{criterion.Field} == null"),
                    SearchOperator.IsNotNull => query.Where($"{criterion.Field} != null"),
                    SearchOperator.Between => query.Where($"{criterion.Field} >= @0 && {criterion.Field} <= @1", criterion.Value, criterion.ValueSecondary),
                    SearchOperator.In => query.Where($"@0.Contains({criterion.Field})", criterion.Value),
                    SearchOperator.NotIn => query.Where($"!@0.Contains({criterion.Field})", criterion.Value),
                    _ => throw new ArgumentException($"Unsupported operator: {criterion.Operator}")
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error applying criterion {Field} {Operator}", criterion.Field, criterion.Operator);
                throw new ArgumentException($"Invalid search criterion for field '{criterion.Field}': {ex.Message}", ex);
            }
        }

        private async Task<SavedSearchDto> MapToDto(SavedSearch search)
        {
            var criteria = JsonSerializer.Deserialize<List<SearchCriterion>>(search.Criteria) ?? new List<SearchCriterion>();

            var createdByUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == search.CreatedByUserId);

            return new SavedSearchDto
            {
                Id = search.Id,
                SearchName = search.SearchName,
                Scope = search.Scope,
                Criteria = criteria,
                IsGlobal = search.IsGlobal,
                IsFavorite = search.IsFavorite,
                ExecutionCount = search.ExecutionCount,
                LastExecutedAt = search.LastExecutedAt,
                CreatedAt = search.CreatedAt,
                CreatedByUserName = createdByUser?.FirstName + " " + createdByUser?.LastName ?? "Unknown"
            };
        }
    }
}
