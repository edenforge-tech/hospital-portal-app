using AuthService.Context;
using AuthService.Models.Department;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Services;

/// <summary>
/// Service interface for Supervised Access management
/// </summary>
public interface ISupervisedAccessService
{
    Task<List<SupervisedUserDto>> GetAllSupervisedUsersAsync(Guid tenantId, SupervisedUserFilters? filters = null);
    Task<SupervisedUserDetails?> GetSupervisedUserByIdAsync(Guid id, Guid tenantId);
    Task<SupervisedUserDetails> CreateSupervisedUserAsync(SupervisedUserFormData formData, Guid tenantId, Guid creatorId);
    Task<SupervisedUserDetails> UpdateSupervisedUserAsync(Guid id, SupervisedUserFormData formData, Guid tenantId, Guid updaterId);
    Task<bool> DeleteSupervisedUserAsync(Guid id, Guid tenantId);
    Task<List<SupervisorCapacityDto>> GetSupervisorCapacitiesAsync(Guid tenantId);
    Task<SupervisedAccessStats> GetStatsAsync(Guid tenantId);
    Task<bool> RecalculateComplianceScoreAsync(Guid supervisedUserId, Guid tenantId);
}

/// <summary>
/// Service for managing supervised access (NABH compliance for junior doctors)
/// Implements supervision tracking features from /admin/supervised-access
/// </summary>
public class SupervisedAccessService : ISupervisedAccessService
{
    private readonly AppDbContext _context;
    private readonly ILogger<SupervisedAccessService> _logger;

    public SupervisedAccessService(
        AppDbContext context,
        ILogger<SupervisedAccessService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<SupervisedUserDto>> GetAllSupervisedUsersAsync(
        Guid tenantId, 
        SupervisedUserFilters? filters = null)
    {
        try
        {
            var query = _context.Set<SupervisedUser>()
                .Where(su => su.TenantId == tenantId && su.DeletedAt == null)
                .AsQueryable();

            // Apply filters
            if (filters != null)
            {
                if (!string.IsNullOrWhiteSpace(filters.Search))
                {
                    var searchLower = filters.Search.ToLower();
                    query = query.Where(su =>
                        su.FirstName.ToLower().Contains(searchLower) ||
                        su.LastName.ToLower().Contains(searchLower) ||
                        su.Email.ToLower().Contains(searchLower) ||
                        su.UserName.ToLower().Contains(searchLower));
                }

                if (filters.SupervisorId.HasValue)
                {
                    query = query.Where(su => su.AssignedSupervisorId == filters.SupervisorId.Value);
                }

                if (!string.IsNullOrWhiteSpace(filters.OversightLevel))
                {
                    query = query.Where(su => su.OversightLevel == filters.OversightLevel);
                }

                if (filters.RequiresCoSignature.HasValue)
                {
                    query = query.Where(su => su.RequiresCoSignature == filters.RequiresCoSignature.Value);
                }

                if (!string.IsNullOrWhiteSpace(filters.Status))
                {
                    query = query.Where(su => su.Status == filters.Status);
                }

                if (filters.MinComplianceScore.HasValue)
                {
                    query = query.Where(su => su.ComplianceScore >= filters.MinComplianceScore.Value);
                }
            }

            var supervisedUsers = await query
                .OrderByDescending(su => su.UpdatedAt)
                .Select(su => new SupervisedUserDto
                {
                    Id = su.Id,
                    UserId = su.UserId,
                    UserName = su.UserName,
                    FullName = su.FirstName + " " + su.LastName,
                    Email = su.Email,
                    Qualification = su.Qualification,
                    YearsOfExperience = su.YearsOfExperience,
                    AssignedSupervisorId = su.AssignedSupervisorId,
                    SupervisorName = su.SupervisorName,
                    OversightLevel = su.OversightLevel,
                    RequiresCoSignature = su.RequiresCoSignature,
                    ComplianceScore = su.ComplianceScore,
                    PendingApprovals = su.PendingApprovals,
                    Status = su.Status,
                    SupervisionStartDate = su.SupervisionStartDate,
                    SupervisionEndDate = su.SupervisionEndDate
                })
                .ToListAsync();

            return supervisedUsers;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving supervised users for tenant {TenantId}", tenantId);
            throw;
        }
    }

    public async Task<SupervisedUserDetails?> GetSupervisedUserByIdAsync(Guid id, Guid tenantId)
    {
        try
        {
            var supervisedUser = await _context.Set<SupervisedUser>()
                .Where(su => su.Id == id && su.TenantId == tenantId && su.DeletedAt == null)
                .FirstOrDefaultAsync();

            if (supervisedUser == null)
                return null;

            // Get supervisor details
            string? supervisorEmail = null;
            string? supervisorSpecialty = null;
            if (supervisedUser.AssignedSupervisorId.HasValue)
            {
                var supervisor = await _context.Users
                    .Where(u => u.Id == supervisedUser.AssignedSupervisorId.Value)
                    .FirstOrDefaultAsync();

                supervisorEmail = supervisor?.Email;
                
                // Get specialty from user attributes if available
                var specialtyAttr = await _context.Set<UserAttribute>()
                    .Where(ua => ua.UserId == supervisedUser.AssignedSupervisorId.Value 
                        && ua.AttributeKey == "Specialty")
                    .FirstOrDefaultAsync();
                supervisorSpecialty = specialtyAttr?.AttributeValue;
            }

            return new SupervisedUserDetails
            {
                Id = supervisedUser.Id,
                UserId = supervisedUser.UserId,
                UserName = supervisedUser.UserName,
                FirstName = supervisedUser.FirstName,
                LastName = supervisedUser.LastName,
                Email = supervisedUser.Email,
                Qualification = supervisedUser.Qualification,
                YearsOfExperience = supervisedUser.YearsOfExperience,
                AssignedSupervisorId = supervisedUser.AssignedSupervisorId,
                SupervisorName = supervisedUser.SupervisorName,
                SupervisorEmail = supervisorEmail,
                SupervisorSpecialty = supervisorSpecialty,
                OversightLevel = supervisedUser.OversightLevel,
                RequiresCoSignature = supervisedUser.RequiresCoSignature,
                SupervisionStartDate = supervisedUser.SupervisionStartDate,
                SupervisionEndDate = supervisedUser.SupervisionEndDate,
                ComplianceScore = supervisedUser.ComplianceScore,
                LastComplianceCheck = supervisedUser.LastComplianceCheck,
                ComplianceNotes = supervisedUser.ComplianceNotes,
                TotalActivities = supervisedUser.TotalActivities,
                SupervisedActivities = supervisedUser.SupervisedActivities,
                PendingApprovals = supervisedUser.PendingApprovals,
                LastActivityDate = supervisedUser.LastActivityDate,
                Status = supervisedUser.Status,
                CreatedAt = supervisedUser.CreatedAt,
                UpdatedAt = supervisedUser.UpdatedAt
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving supervised user {Id}", id);
            throw;
        }
    }

    public async Task<SupervisedUserDetails> CreateSupervisedUserAsync(
        SupervisedUserFormData formData, 
        Guid tenantId, 
        Guid creatorId)
    {
        try
        {
            // Validate user exists
            var user = await _context.Users
                .Where(u => u.Id == formData.UserId && u.TenantId == tenantId)
                .FirstOrDefaultAsync();

            if (user == null)
                throw new ArgumentException("User not found");

            // Check if already supervised
            var existing = await _context.Set<SupervisedUser>()
                .AnyAsync(su => su.UserId == formData.UserId && su.TenantId == tenantId && su.DeletedAt == null);

            if (existing)
                throw new InvalidOperationException("User is already under supervision");

            // Validate supervisor if assigned
            string? supervisorName = null;
            if (formData.AssignedSupervisorId.HasValue)
            {
                var supervisor = await _context.Users
                    .Where(u => u.Id == formData.AssignedSupervisorId.Value && u.TenantId == tenantId)
                    .FirstOrDefaultAsync();

                if (supervisor == null)
                    throw new ArgumentException("Supervisor not found");

                supervisorName = $"{supervisor.FirstName} {supervisor.LastName}";

                // Check supervisor capacity
                await ValidateSupervisorCapacityAsync(formData.AssignedSupervisorId.Value, tenantId);

                // Update supervisor assignment
                await UpdateSupervisorAssignmentAsync(formData.AssignedSupervisorId.Value, tenantId, 1);
            }

            // Get user qualification
            var qualificationAttr = await _context.Set<UserAttribute>()
                .Where(ua => ua.UserId == formData.UserId && ua.AttributeKey == "Qualification")
                .FirstOrDefaultAsync();

            var experienceAttr = await _context.Set<UserAttribute>()
                .Where(ua => ua.UserId == formData.UserId && ua.AttributeKey == "YearsOfExperience")
                .FirstOrDefaultAsync();

            int? yearsOfExp = null;
            if (experienceAttr != null && int.TryParse(experienceAttr.AttributeValue, out var exp))
            {
                yearsOfExp = exp;
            }

            // Get user's primary branch (first branch if multiple)
            var userBranch = await _context.UserBranches
                .Where(ub => ub.UserId == formData.UserId)
                .FirstOrDefaultAsync();

            var supervisedUser = new SupervisedUser
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                BranchId = userBranch?.BranchId,
                UserId = formData.UserId,
                UserName = user.UserName ?? "",
                FirstName = user.FirstName ?? "",
                LastName = user.LastName ?? "",
                Email = user.Email ?? "",
                Qualification = qualificationAttr?.AttributeValue,
                YearsOfExperience = yearsOfExp,
                AssignedSupervisorId = formData.AssignedSupervisorId,
                SupervisorName = supervisorName,
                OversightLevel = formData.OversightLevel,
                RequiresCoSignature = formData.RequiresCoSignature,
                SupervisionStartDate = formData.SupervisionStartDate ?? DateTime.UtcNow,
                SupervisionEndDate = formData.SupervisionEndDate,
                ComplianceScore = 100, // Start with perfect score
                LastComplianceCheck = DateTime.UtcNow,
                ComplianceNotes = formData.ComplianceNotes,
                TotalActivities = 0,
                SupervisedActivities = 0,
                PendingApprovals = 0,
                Status = "Active",
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = creatorId,
                UpdatedAt = DateTime.UtcNow,
                UpdatedByUserId = creatorId
            };

            _context.Set<SupervisedUser>().Add(supervisedUser);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Supervised user created: {Id} for user {UserId} by {CreatorId}",
                supervisedUser.Id, formData.UserId, creatorId);

            return (await GetSupervisedUserByIdAsync(supervisedUser.Id, tenantId))!;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating supervised user for user {UserId}", formData.UserId);
            throw;
        }
    }

    public async Task<SupervisedUserDetails> UpdateSupervisedUserAsync(
        Guid id, 
        SupervisedUserFormData formData, 
        Guid tenantId, 
        Guid updaterId)
    {
        try
        {
            var supervisedUser = await _context.Set<SupervisedUser>()
                .Where(su => su.Id == id && su.TenantId == tenantId && su.DeletedAt == null)
                .FirstOrDefaultAsync();

            if (supervisedUser == null)
                throw new ArgumentException("Supervised user not found");

            // Handle supervisor change
            if (supervisedUser.AssignedSupervisorId != formData.AssignedSupervisorId)
            {
                // Decrease old supervisor count
                if (supervisedUser.AssignedSupervisorId.HasValue)
                {
                    await UpdateSupervisorAssignmentAsync(supervisedUser.AssignedSupervisorId.Value, tenantId, -1);
                }

                // Increase new supervisor count and validate capacity
                if (formData.AssignedSupervisorId.HasValue)
                {
                    await ValidateSupervisorCapacityAsync(formData.AssignedSupervisorId.Value, tenantId);
                    await UpdateSupervisorAssignmentAsync(formData.AssignedSupervisorId.Value, tenantId, 1);

                    var supervisor = await _context.Users
                        .Where(u => u.Id == formData.AssignedSupervisorId.Value)
                        .FirstOrDefaultAsync();
                    supervisedUser.SupervisorName = supervisor != null 
                        ? $"{supervisor.FirstName} {supervisor.LastName}" 
                        : null;
                }
                else
                {
                    supervisedUser.SupervisorName = null;
                }
            }

            // Update properties
            supervisedUser.AssignedSupervisorId = formData.AssignedSupervisorId;
            supervisedUser.OversightLevel = formData.OversightLevel;
            supervisedUser.RequiresCoSignature = formData.RequiresCoSignature;
            supervisedUser.SupervisionStartDate = formData.SupervisionStartDate;
            supervisedUser.SupervisionEndDate = formData.SupervisionEndDate;
            supervisedUser.ComplianceNotes = formData.ComplianceNotes;
            supervisedUser.UpdatedAt = DateTime.UtcNow;
            supervisedUser.UpdatedByUserId = updaterId;

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Supervised user updated: {Id} by {UpdaterId}",
                id, updaterId);

            return (await GetSupervisedUserByIdAsync(id, tenantId))!;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating supervised user {Id}", id);
            throw;
        }
    }

    public async Task<bool> DeleteSupervisedUserAsync(Guid id, Guid tenantId)
    {
        try
        {
            var supervisedUser = await _context.Set<SupervisedUser>()
                .Where(su => su.Id == id && su.TenantId == tenantId && su.DeletedAt == null)
                .FirstOrDefaultAsync();

            if (supervisedUser == null)
                return false;

            // Decrease supervisor count
            if (supervisedUser.AssignedSupervisorId.HasValue)
            {
                await UpdateSupervisorAssignmentAsync(supervisedUser.AssignedSupervisorId.Value, tenantId, -1);
            }

            // Soft delete
            supervisedUser.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Supervised user deleted: {Id}", id);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting supervised user {Id}", id);
            throw;
        }
    }

    public async Task<List<SupervisorCapacityDto>> GetSupervisorCapacitiesAsync(Guid tenantId)
    {
        try
        {
            var assignments = await _context.Set<SupervisorAssignment>()
                .Where(sa => sa.TenantId == tenantId)
                .ToListAsync();

            var result = new List<SupervisorCapacityDto>();

            foreach (var assignment in assignments)
            {
                var currentSupervisees = await _context.Set<SupervisedUser>()
                    .Where(su => su.AssignedSupervisorId == assignment.SupervisorUserId 
                        && su.TenantId == tenantId 
                        && su.DeletedAt == null 
                        && su.Status == "Active")
                    .Select(su => new SupervisedUserDto
                    {
                        Id = su.Id,
                        UserId = su.UserId,
                        UserName = su.UserName,
                        FullName = su.FirstName + " " + su.LastName,
                        Email = su.Email,
                        Qualification = su.Qualification,
                        ComplianceScore = su.ComplianceScore,
                        OversightLevel = su.OversightLevel,
                        Status = su.Status
                    })
                    .ToListAsync();

                var avgCompliance = currentSupervisees.Any() 
                    ? (decimal)currentSupervisees.Average(s => s.ComplianceScore) 
                    : 0;

                result.Add(new SupervisorCapacityDto
                {
                    SupervisorUserId = assignment.SupervisorUserId,
                    SupervisorName = assignment.SupervisorName,
                    Specialty = assignment.Specialty,
                    MaxSupervisees = assignment.MaxSupervisees,
                    CurrentSupervisees = currentSupervisees.Count,
                    AvailableSlots = assignment.MaxSupervisees - currentSupervisees.Count,
                    UtilizationPercentage = assignment.MaxSupervisees > 0 
                        ? (decimal)currentSupervisees.Count / assignment.MaxSupervisees * 100 
                        : 0,
                    AverageComplianceScore = avgCompliance,
                    IsActive = assignment.IsActive,
                    Status = assignment.Status,
                    CurrentSupervisedUsers = currentSupervisees
                });
            }

            return result.OrderByDescending(r => r.UtilizationPercentage).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving supervisor capacities for tenant {TenantId}", tenantId);
            throw;
        }
    }

    public async Task<SupervisedAccessStats> GetStatsAsync(Guid tenantId)
    {
        try
        {
            var supervisedUsers = await _context.Set<SupervisedUser>()
                .Where(su => su.TenantId == tenantId && su.DeletedAt == null)
                .ToListAsync();

            var supervisors = await _context.Set<SupervisorAssignment>()
                .Where(sa => sa.TenantId == tenantId)
                .ToListAsync();

            var stats = new SupervisedAccessStats
            {
                TotalSupervisedUsers = supervisedUsers.Count,
                ActiveSupervisedUsers = supervisedUsers.Count(su => su.Status == "Active"),
                TotalSupervisors = supervisors.Count,
                ActiveSupervisors = supervisors.Count(sa => sa.IsActive),
                TotalPendingApprovals = supervisedUsers.Sum(su => su.PendingApprovals),
                AverageComplianceScore = supervisedUsers.Any() 
                    ? (decimal)supervisedUsers.Average(su => su.ComplianceScore) 
                    : 0,
                UsersRequiringCoSignature = supervisedUsers.Count(su => su.RequiresCoSignature),
                UsersByOversightLevel = supervisedUsers
                    .GroupBy(su => su.OversightLevel)
                    .ToDictionary(g => g.Key, g => g.Count()),
                UsersByQualification = supervisedUsers
                    .Where(su => !string.IsNullOrEmpty(su.Qualification))
                    .GroupBy(su => su.Qualification!)
                    .ToDictionary(g => g.Key, g => g.Count())
            };

            return stats;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating supervised access stats for tenant {TenantId}", tenantId);
            throw;
        }
    }

    public async Task<bool> RecalculateComplianceScoreAsync(Guid supervisedUserId, Guid tenantId)
    {
        try
        {
            var supervisedUser = await _context.Set<SupervisedUser>()
                .Where(su => su.Id == supervisedUserId && su.TenantId == tenantId && su.DeletedAt == null)
                .FirstOrDefaultAsync();

            if (supervisedUser == null)
                return false;

            // Calculate compliance score based on activities
            // Formula: (SupervisedActivities / TotalActivities) * 100
            int complianceScore = 100;
            if (supervisedUser.TotalActivities > 0)
            {
                complianceScore = (int)((decimal)supervisedUser.SupervisedActivities / supervisedUser.TotalActivities * 100);
            }

            supervisedUser.ComplianceScore = complianceScore;
            supervisedUser.LastComplianceCheck = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Compliance score recalculated for supervised user {Id}: {Score}%",
                supervisedUserId, complianceScore);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error recalculating compliance score for {Id}", supervisedUserId);
            throw;
        }
    }

    // Helper methods
    private async Task ValidateSupervisorCapacityAsync(Guid supervisorId, Guid tenantId)
    {
        var assignment = await _context.Set<SupervisorAssignment>()
            .Where(sa => sa.SupervisorUserId == supervisorId && sa.TenantId == tenantId)
            .FirstOrDefaultAsync();

        if (assignment == null)
        {
            // Create default assignment
            var supervisor = await _context.Users.FindAsync(supervisorId);
            if (supervisor == null)
                throw new ArgumentException("Supervisor not found");

            assignment = new SupervisorAssignment
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                SupervisorUserId = supervisorId,
                SupervisorName = $"{supervisor.FirstName} {supervisor.LastName}",
                MaxSupervisees = 5,
                CurrentSupervisees = 0,
                AvailableSlots = 5,
                IsActive = true,
                Status = "Active",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Set<SupervisorAssignment>().Add(assignment);
            await _context.SaveChangesAsync();
        }

        if (assignment.CurrentSupervisees >= assignment.MaxSupervisees)
        {
            throw new InvalidOperationException($"Supervisor {assignment.SupervisorName} is at full capacity ({assignment.MaxSupervisees} supervisees)");
        }
    }

    private async Task UpdateSupervisorAssignmentAsync(Guid supervisorId, Guid tenantId, int delta)
    {
        var assignment = await _context.Set<SupervisorAssignment>()
            .Where(sa => sa.SupervisorUserId == supervisorId && sa.TenantId == tenantId)
            .FirstOrDefaultAsync();

        if (assignment != null)
        {
            assignment.CurrentSupervisees = Math.Max(0, assignment.CurrentSupervisees + delta);
            assignment.AvailableSlots = assignment.MaxSupervisees - assignment.CurrentSupervisees;
            assignment.UpdatedAt = DateTime.UtcNow;

            // Update status based on capacity
            if (assignment.CurrentSupervisees >= assignment.MaxSupervisees)
            {
                assignment.Status = "Full Capacity";
            }
            else if (assignment.IsActive)
            {
                assignment.Status = "Active";
            }

            await _context.SaveChangesAsync();
        }
    }
}
