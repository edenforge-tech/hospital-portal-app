using AuthService.Context;
using AuthService.Models.Department;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;
using DepartmentEntity = AuthService.Models.Domain.Department;
using UserDepartment = AuthService.Models.Domain.UserDepartment;

namespace AuthService.Services;

public interface IDepartmentService
{
    Task<List<DepartmentDto>> GetAllAsync(Guid tenantId, DepartmentFilters? filters = null);
    Task<DepartmentDetails?> GetByIdAsync(Guid id, Guid tenantId);
    Task<DepartmentEntity> CreateAsync(DepartmentFormData data, Guid tenantId, Guid userId);
    Task<DepartmentEntity?> UpdateAsync(Guid id, DepartmentFormData data, Guid tenantId, Guid userId);
    Task<bool> DeleteAsync(Guid id, Guid tenantId, Guid userId);
    Task<List<DepartmentHierarchy>> GetHierarchyAsync(Guid tenantId);
    Task<List<DepartmentDto>> GetSubDepartmentsAsync(Guid parentId, Guid tenantId);
    Task<DepartmentDetails?> GetDetailsAsync(Guid id, Guid tenantId);
    Task<List<DepartmentStaff>> GetStaffAsync(Guid id, Guid tenantId);
    Task<DepartmentMetrics> GetMetricsAsync(Guid id, Guid tenantId);
    Task<List<string>> GetDepartmentTypesAsync();
}

public class DepartmentService : IDepartmentService
{
    private readonly AppDbContext _context;

    public DepartmentService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<DepartmentDto>> GetAllAsync(Guid tenantId, DepartmentFilters? filters = null)
    {
        var query = _context.Set<DepartmentEntity>()
            .Where(d => d.TenantId == tenantId && d.DeletedAt == null);

        // Apply filters
        if (filters != null)
        {
            if (!string.IsNullOrWhiteSpace(filters.Search))
            {
                query = query.Where(d =>
                    d.DepartmentName.Contains(filters.Search) ||
                    d.DepartmentCode.Contains(filters.Search) ||
                    (d.Description != null && d.Description.Contains(filters.Search)));
            }

            if (!string.IsNullOrWhiteSpace(filters.Status))
            {
                query = query.Where(d => d.Status == filters.Status);
            }

            if (!string.IsNullOrWhiteSpace(filters.Type))
            {
                query = query.Where(d => d.DepartmentType == filters.Type);
            }

            if (filters.ParentDepartmentId.HasValue)
            {
                query = query.Where(d => d.ParentDepartmentId == filters.ParentDepartmentId.Value);
            }

            if (filters.BranchId.HasValue)
            {
                query = query.Where(d => d.BranchId == filters.BranchId.Value);
            }
        }

        var departments = await query
            .Select(d => new DepartmentDto
            {
                Id = d.Id,
                DepartmentCode = d.DepartmentCode,
                DepartmentName = d.DepartmentName,
                DepartmentType = d.DepartmentType,
                Description = d.Description ?? string.Empty,
                Status = d.Status,
                ParentDepartmentId = d.ParentDepartmentId,
                ParentDepartmentName = d.ParentDepartment != null ? d.ParentDepartment.DepartmentName : null,
                DepartmentHeadId = d.DepartmentHeadId,
                DepartmentHeadName = d.DepartmentHeadId.HasValue
                    ? _context.Users.Where(u => u.Id == d.DepartmentHeadId.Value)
                        .Select(u => u.FirstName + " " + u.LastName).FirstOrDefault()
                    : null,
                StaffCount = 0, // TODO: Implement after user_department_access table exists
                SubDepartmentsCount = _context.Set<DepartmentEntity>()
                    .Count(sub => sub.ParentDepartmentId == d.Id && sub.DeletedAt == null),
                BranchId = d.BranchId,
                BranchName = d.Branch != null ? d.Branch.Name : null
            })
            .OrderBy(d => d.DepartmentName)
            .ToListAsync();

        return departments;
    }

    public async Task<DepartmentDetails?> GetByIdAsync(Guid id, Guid tenantId)
    {
        var department = await _context.Set<DepartmentEntity>()
            .Where(d => d.Id == id && d.TenantId == tenantId && d.DeletedAt == null)
            .Select(d => new DepartmentDetails
            {
                Id = d.Id,
                DepartmentCode = d.DepartmentCode,
                DepartmentName = d.DepartmentName,
                DepartmentType = d.DepartmentType,
                Description = d.Description ?? string.Empty,
                Status = d.Status,
                ParentDepartmentId = d.ParentDepartmentId,
                ParentDepartmentName = d.ParentDepartment != null ? d.ParentDepartment.DepartmentName : null,
                DepartmentHeadId = d.DepartmentHeadId,
                DepartmentHeadName = d.DepartmentHeadId.HasValue
                    ? _context.Users.Where(u => u.Id == d.DepartmentHeadId.Value)
                        .Select(u => u.FirstName + " " + u.LastName).FirstOrDefault()
                    : null,
                OperatingHours = d.OperatingHoursStart.HasValue && d.OperatingHoursEnd.HasValue
                    ? $"{d.OperatingHoursStart:hh\\:mm} - {d.OperatingHoursEnd:hh\\:mm}"
                    : null,
                DaysOfOperation = d.DaysOfOperation,
                Is24x7 = d.Is24x7,
                AnnualBudget = d.AnnualBudget,
                BudgetCurrency = d.BudgetCurrency,
                RequiresApproval = d.RequiresApproval,
                ApprovalLevel = d.ApprovalLevel,
                AutoApprovalThreshold = d.AutoApprovalThreshold,
                MaxConcurrentPatients = d.MaxConcurrentPatients,
                WaitingRoomCapacity = d.WaitingRoomCapacity,
                BranchId = d.BranchId,
                BranchName = d.Branch != null ? d.Branch.Name : null,
                CreatedAt = d.CreatedAt,
                CreatedByName = d.CreatedBy.HasValue
                    ? _context.Users.Where(u => u.Id == d.CreatedBy.Value)
                        .Select(u => u.FirstName + " " + u.LastName).FirstOrDefault()
                    : null
            })
            .FirstOrDefaultAsync();

        return department;
    }

    public async Task<DepartmentEntity> CreateAsync(DepartmentFormData data, Guid tenantId, Guid userId)
    {
        var department = new DepartmentEntity
        {
            Id = Guid.NewGuid(),
            DepartmentCode = data.DepartmentCode,
            DepartmentName = data.DepartmentName,
            DepartmentType = data.DepartmentType,
            Description = data.Description,
            Status = data.Status,
            ParentDepartmentId = data.ParentDepartmentId,
            DepartmentHeadId = data.DepartmentHeadId,
            OperatingHoursStart = data.OperatingHoursStart,
            OperatingHoursEnd = data.OperatingHoursEnd,
            DaysOfOperation = data.DaysOfOperation,
            Is24x7 = data.Is24x7,
            AnnualBudget = data.AnnualBudget,
            BudgetCurrency = data.BudgetCurrency,
            RequiresApproval = data.RequiresApproval,
            ApprovalLevel = data.ApprovalLevel,
            AutoApprovalThreshold = data.AutoApprovalThreshold,
            MaxConcurrentPatients = data.MaxConcurrentPatients,
            WaitingRoomCapacity = data.WaitingRoomCapacity,
            BranchId = data.BranchId,
            TenantId = tenantId,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId,
            UpdatedAt = DateTime.UtcNow,
            UpdatedBy = userId
        };

        _context.Set<DepartmentEntity>().Add(department);
        await _context.SaveChangesAsync();

        return department;
    }

    public async Task<DepartmentEntity?> UpdateAsync(Guid id, DepartmentFormData data, Guid tenantId, Guid userId)
    {
        var department = await _context.Set<DepartmentEntity>()
            .FirstOrDefaultAsync(d => d.Id == id && d.TenantId == tenantId && d.DeletedAt == null);

        if (department == null)
            return null;

        department.DepartmentCode = data.DepartmentCode;
        department.DepartmentName = data.DepartmentName;
        department.DepartmentType = data.DepartmentType;
        department.Description = data.Description;
        department.Status = data.Status;
        department.ParentDepartmentId = data.ParentDepartmentId;
        department.DepartmentHeadId = data.DepartmentHeadId;
        department.OperatingHoursStart = data.OperatingHoursStart;
        department.OperatingHoursEnd = data.OperatingHoursEnd;
        department.DaysOfOperation = data.DaysOfOperation;
        department.Is24x7 = data.Is24x7;
        department.AnnualBudget = data.AnnualBudget;
        department.BudgetCurrency = data.BudgetCurrency;
        department.RequiresApproval = data.RequiresApproval;
        department.ApprovalLevel = data.ApprovalLevel;
        department.AutoApprovalThreshold = data.AutoApprovalThreshold;
        department.MaxConcurrentPatients = data.MaxConcurrentPatients;
        department.WaitingRoomCapacity = data.WaitingRoomCapacity;
        department.BranchId = data.BranchId;
        department.UpdatedAt = DateTime.UtcNow;
        department.UpdatedBy = userId;

        await _context.SaveChangesAsync();

        return department;
    }

    public async Task<bool> DeleteAsync(Guid id, Guid tenantId, Guid userId)
    {
        var department = await _context.Set<DepartmentEntity>()
            .FirstOrDefaultAsync(d => d.Id == id && d.TenantId == tenantId && d.DeletedAt == null);

        if (department == null)
            return false;

        // Soft delete
        department.DeletedAt = DateTime.UtcNow;
        department.DeletedBy = userId;

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<List<DepartmentHierarchy>> GetHierarchyAsync(Guid tenantId)
    {
        var departments = await _context.Set<DepartmentEntity>()
            .Where(d => d.TenantId == tenantId && d.DeletedAt == null)
            .Select(d => new
            {
                d.Id,
                d.DepartmentCode,
                d.DepartmentName,
                d.DepartmentType,
                d.Status,
                d.ParentDepartmentId,
                DepartmentHeadName = d.DepartmentHeadId.HasValue
                    ? _context.Users.Where(u => u.Id == d.DepartmentHeadId.Value)
                        .Select(u => u.FirstName + " " + u.LastName).FirstOrDefault()
                    : null,
                StaffCount = 0 // TODO: Implement after user_department_access table exists
            })
            .ToListAsync();

        // Build hierarchy
        var hierarchy = new List<DepartmentHierarchy>();
        
        // Get root departments (no parent)
        var rootDepartments = departments.Where(d => d.ParentDepartmentId == null).ToList();

        foreach (var root in rootDepartments)
        {
            var hierarchyNode = new DepartmentHierarchy
            {
                Id = root.Id,
                DepartmentCode = root.DepartmentCode,
                DepartmentName = root.DepartmentName,
                DepartmentType = root.DepartmentType,
                Status = root.Status,
                ParentDepartmentId = root.ParentDepartmentId,
                DepartmentHeadName = root.DepartmentHeadName,
                StaffCount = root.StaffCount,
                SubDepartments = BuildSubHierarchy(root.Id, departments)
            };
            hierarchy.Add(hierarchyNode);
        }

        return hierarchy;
    }

    private List<DepartmentHierarchy> BuildSubHierarchy(Guid parentId, IEnumerable<dynamic> allDepartments)
    {
        var subDepartments = new List<DepartmentHierarchy>();
        var children = allDepartments.Where(d => d.ParentDepartmentId == parentId).ToList();

        foreach (var child in children)
        {
            var hierarchyNode = new DepartmentHierarchy
            {
                Id = child.Id,
                DepartmentCode = child.DepartmentCode,
                DepartmentName = child.DepartmentName,
                DepartmentType = child.DepartmentType,
                Status = child.Status,
                ParentDepartmentId = child.ParentDepartmentId,
                DepartmentHeadName = child.DepartmentHeadName,
                StaffCount = child.StaffCount,
                SubDepartments = BuildSubHierarchy(child.Id, allDepartments)
            };
            subDepartments.Add(hierarchyNode);
        }

        return subDepartments;
    }

    public async Task<List<DepartmentDto>> GetSubDepartmentsAsync(Guid parentId, Guid tenantId)
    {
        return await GetAllAsync(tenantId, new DepartmentFilters { ParentDepartmentId = parentId });
    }

    public async Task<DepartmentDetails?> GetDetailsAsync(Guid id, Guid tenantId)
    {
        return await GetByIdAsync(id, tenantId);
    }

    public async Task<List<DepartmentStaff>> GetStaffAsync(Guid id, Guid tenantId)
    {
        // TODO: Implement after user_department_access table exists in PostgreSQL
        return await Task.FromResult(new List<DepartmentStaff>());
    }

    public async Task<DepartmentMetrics> GetMetricsAsync(Guid id, Guid tenantId)
    {
        // In a real implementation, these would come from actual data
        var activePatients = await _context.Set<Patient>()
            .CountAsync(p => p.TenantId == tenantId && p.DeletedAt == null);

        var totalAppointments = await _context.Appointments
            .CountAsync(a => a.TenantId == tenantId && a.DeletedAt == null);

        var metrics = new DepartmentMetrics
        {
            ActivePatients = activePatients,
            TotalAppointments = totalAppointments,
            AverageWaitTimeMinutes = 15.5m, // Mock value
            UtilizationRate = 78.5m // Mock value
        };

        return metrics;
    }

    public async Task<List<string>> GetDepartmentTypesAsync()
    {
        var types = new List<string>
        {
            "General Medicine",
            "Surgery",
            "Emergency",
            "Diagnostics",
            "Cardiology",
            "Orthopedics",
            "Pediatrics",
            "Obstetrics & Gynecology",
            "Neurology",
            "Oncology",
            "Radiology",
            "Laboratory",
            "Pharmacy",
            "Administration"
        };

        return await Task.FromResult(types);
    }
}

