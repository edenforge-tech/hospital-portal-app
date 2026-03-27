using AuthService.Data;
using AuthService.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AuthService.Services
{
    public interface IEmploymentService
    {
        Task<List<Employee>> GetEmployeesByTenantAsync(Guid tenantId);
        Task<Employee?> GetEmployeeByIdAsync(Guid employeeId, Guid tenantId);
        Task<Employee?> GetEmployeeByUserIdAsync(Guid userId, Guid tenantId);
        Task<Employee> CreateEmployeeAsync(Employee employee, Guid currentUserId);
        Task<Employee> UpdateEmployeeAsync(Employee employee, Guid currentUserId);
        Task DeleteEmployeeAsync(Guid employeeId, Guid tenantId, Guid currentUserId);
        Task<Employee> UpdateEmploymentStatusAsync(Guid employeeId, string newStatus, Guid tenantId, Guid currentUserId);
        Task<List<Employee>> GetEmployeesByDepartmentAsync(Guid departmentId, Guid tenantId);
        Task<List<Employee>> GetEmployeesByBranchAsync(Guid branchId, Guid tenantId);
        Task<List<Employee>> GetEmployeesByManagerAsync(Guid managerId, Guid tenantId);
        Task<List<Employee>> GetEmployeesOnProbationAsync(Guid tenantId);
        Task<List<Employee>> GetEmployeesWithExpiringContractsAsync(Guid tenantId, int daysAhead = 90);
    }

    public class EmploymentService : IEmploymentService
    {
        private readonly AppDbContext _context;

        public EmploymentService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Employee>> GetEmployeesByTenantAsync(Guid tenantId)
        {
            return await _context.Employees
                .Where(e => e.TenantId == tenantId && e.DeletedAt == null)
                .Include(e => e.User)
                .Include(e => e.Department)
                .Include(e => e.Branch)
                .Include(e => e.EmploymentType)
                .OrderBy(e => e.EmployeeNumber)
                .ToListAsync();
        }

        public async Task<Employee?> GetEmployeeByIdAsync(Guid employeeId, Guid tenantId)
        {
            return await _context.Employees
                .Where(e => e.Id == employeeId && e.TenantId == tenantId && e.DeletedAt == null)
                .Include(e => e.User)
                .Include(e => e.Department)
                .Include(e => e.Branch)
                .Include(e => e.EmploymentType)
                .Include(e => e.Manager)
                .FirstOrDefaultAsync();
        }

        public async Task<Employee?> GetEmployeeByUserIdAsync(Guid userId, Guid tenantId)
        {
            return await _context.Employees
                .Where(e => e.UserId == userId && e.TenantId == tenantId && e.DeletedAt == null)
                .Include(e => e.User)
                .Include(e => e.Department)
                .Include(e => e.Branch)
                .Include(e => e.EmploymentType)
                .FirstOrDefaultAsync();
        }

        public async Task<Employee> CreateEmployeeAsync(Employee employee, Guid currentUserId)
        {
            employee.Id = Guid.NewGuid();
            employee.CreatedAt = DateTime.UtcNow;
            employee.UpdatedAt = DateTime.UtcNow;
            employee.CreatedByUserId = currentUserId;
            employee.UpdatedByUserId = currentUserId;
            employee.Status = "active";
            employee.EmploymentStatus = "active";

            // Generate employee number if not provided
            if (string.IsNullOrEmpty(employee.EmployeeNumber))
            {
                var lastEmployee = await _context.Employees
                    .Where(e => e.TenantId == employee.TenantId)
                    .OrderByDescending(e => e.EmployeeNumber)
                    .FirstOrDefaultAsync();

                int nextNumber = 1;
                if (lastEmployee != null && !string.IsNullOrEmpty(lastEmployee.EmployeeNumber))
                {
                    var numberPart = lastEmployee.EmployeeNumber.Replace("EMP-", "");
                    if (int.TryParse(numberPart, out int currentNumber))
                    {
                        nextNumber = currentNumber + 1;
                    }
                }
                employee.EmployeeNumber = $"EMP-{nextNumber:D4}";
            }

            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();

            return await GetEmployeeByIdAsync(employee.Id, employee.TenantId) ?? employee;
        }

        public async Task<Employee> UpdateEmployeeAsync(Employee employee, Guid currentUserId)
        {
            var existing = await _context.Employees
                .FirstOrDefaultAsync(e => e.Id == employee.Id && e.TenantId == employee.TenantId && e.DeletedAt == null);

            if (existing == null)
                throw new InvalidOperationException("Employee not found");

            // Update fields
            existing.EmployeeNumber = employee.EmployeeNumber;
            existing.HireDate = employee.HireDate;
            existing.EmploymentTypeId = employee.EmploymentTypeId;
            existing.EmploymentStatus = employee.EmploymentStatus;
            existing.JobTitle = employee.JobTitle;
            existing.DepartmentId = employee.DepartmentId;
            existing.BranchId = employee.BranchId;
            existing.ManagerId = employee.ManagerId;
            existing.ProbationEndDate = employee.ProbationEndDate;
            existing.ConfirmationDate = employee.ConfirmationDate;
            existing.ContractEndDate = employee.ContractEndDate;
            existing.ResignationDate = employee.ResignationDate;
            existing.TerminationDate = employee.TerminationDate;
            existing.LastWorkingDate = employee.LastWorkingDate;
            existing.EmergencyContactName = employee.EmergencyContactName;
            existing.EmergencyContactRelationship = employee.EmergencyContactRelationship;
            existing.EmergencyContactPhone = employee.EmergencyContactPhone;
            existing.EmergencyContactEmail = employee.EmergencyContactEmail;
            existing.EmergencyContactAddress = employee.EmergencyContactAddress;
            existing.SalaryGrade = employee.SalaryGrade;
            existing.BaseSalary = employee.BaseSalary;
            existing.Currency = employee.Currency;
            existing.BenefitsPackage = employee.BenefitsPackage;
            existing.PayrollFrequency = employee.PayrollFrequency;
            existing.WorkSchedule = employee.WorkSchedule;
            existing.WeeklyHours = employee.WeeklyHours;
            existing.ShiftPattern = employee.ShiftPattern;
            existing.UpdatedAt = DateTime.UtcNow;
            existing.UpdatedByUserId = currentUserId;

            await _context.SaveChangesAsync();

            return await GetEmployeeByIdAsync(existing.Id, existing.TenantId) ?? existing;
        }

        public async Task DeleteEmployeeAsync(Guid employeeId, Guid tenantId, Guid currentUserId)
        {
            var employee = await _context.Employees
                .FirstOrDefaultAsync(e => e.Id == employeeId && e.TenantId == tenantId && e.DeletedAt == null);

            if (employee == null)
                throw new InvalidOperationException("Employee not found");

            // Soft delete
            employee.DeletedAt = DateTime.UtcNow;
            employee.DeletedBy = currentUserId;
            employee.Status = "deleted";

            await _context.SaveChangesAsync();
        }

        public async Task<Employee> UpdateEmploymentStatusAsync(Guid employeeId, string newStatus, Guid tenantId, Guid currentUserId)
        {
            var employee = await _context.Employees
                .FirstOrDefaultAsync(e => e.Id == employeeId && e.TenantId == tenantId && e.DeletedAt == null);

            if (employee == null)
                throw new InvalidOperationException("Employee not found");

            employee.EmploymentStatus = newStatus;
            employee.UpdatedAt = DateTime.UtcNow;
            employee.UpdatedByUserId = currentUserId;

            // Update related dates based on status
            switch (newStatus.ToLower())
            {
                case "on_leave":
                    // Could set leave start date here
                    break;
                case "terminated":
                    if (employee.TerminationDate == null)
                        employee.TerminationDate = DateTime.UtcNow.Date;
                    break;
                case "resigned":
                    if (employee.ResignationDate == null)
                        employee.ResignationDate = DateTime.UtcNow.Date;
                    break;
            }

            await _context.SaveChangesAsync();

            return await GetEmployeeByIdAsync(employee.Id, employee.TenantId) ?? employee;
        }

        public async Task<List<Employee>> GetEmployeesByDepartmentAsync(Guid departmentId, Guid tenantId)
        {
            return await _context.Employees
                .Where(e => e.DepartmentId == departmentId && e.TenantId == tenantId && e.DeletedAt == null)
                .Include(e => e.User)
                .Include(e => e.EmploymentType)
                .OrderBy(e => e.EmployeeNumber)
                .ToListAsync();
        }

        public async Task<List<Employee>> GetEmployeesByBranchAsync(Guid branchId, Guid tenantId)
        {
            return await _context.Employees
                .Where(e => e.BranchId == branchId && e.TenantId == tenantId && e.DeletedAt == null)
                .Include(e => e.User)
                .Include(e => e.Department)
                .Include(e => e.EmploymentType)
                .OrderBy(e => e.EmployeeNumber)
                .ToListAsync();
        }

        public async Task<List<Employee>> GetEmployeesByManagerAsync(Guid managerId, Guid tenantId)
        {
            return await _context.Employees
                .Where(e => e.ManagerId == managerId && e.TenantId == tenantId && e.DeletedAt == null)
                .Include(e => e.User)
                .Include(e => e.Department)
                .Include(e => e.EmploymentType)
                .OrderBy(e => e.EmployeeNumber)
                .ToListAsync();
        }

        public async Task<List<Employee>> GetEmployeesOnProbationAsync(Guid tenantId)
        {
            var today = DateTime.UtcNow.Date;
            return await _context.Employees
                .Where(e => e.TenantId == tenantId 
                    && e.DeletedAt == null 
                    && e.ProbationEndDate != null 
                    && e.ProbationEndDate >= today
                    && (e.ConfirmationDate == null || e.ConfirmationDate > today))
                .Include(e => e.User)
                .Include(e => e.Department)
                .Include(e => e.EmploymentType)
                .OrderBy(e => e.ProbationEndDate)
                .ToListAsync();
        }

        public async Task<List<Employee>> GetEmployeesWithExpiringContractsAsync(Guid tenantId, int daysAhead = 90)
        {
            var today = DateTime.UtcNow.Date;
            var futureDate = today.AddDays(daysAhead);

            return await _context.Employees
                .Where(e => e.TenantId == tenantId 
                    && e.DeletedAt == null 
                    && e.ContractEndDate != null 
                    && e.ContractEndDate >= today 
                    && e.ContractEndDate <= futureDate)
                .Include(e => e.User)
                .Include(e => e.Department)
                .Include(e => e.EmploymentType)
                .OrderBy(e => e.ContractEndDate)
                .ToListAsync();
        }
    }
}
