using AuthService.Context;
using AuthService.Models.Domain;
using AuthService.Models.Identity;
using AuthService.Models.BulkOperations;
using AuthService.Models.DocumentSharing;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using CsvHelper;
using System.Globalization;

namespace AuthService.Services
{
    public interface IBulkOperationsService
    {
        Task<BulkOperationResult> ImportUsersFromCsvAsync(Stream csvStream, Guid tenantId, Guid currentUserId);
        Task<Stream> ExportUsersToCsvAsync(Guid tenantId, UserExportFilter? filter = null);
        Task<BulkOperationResult> BulkAssignRoleAsync(List<Guid> userIds, Guid roleId, Guid tenantId, Guid currentUserId);
        Task<BulkOperationResult> BulkChangeStatusAsync(List<Guid> userIds, string newStatus, Guid tenantId, Guid currentUserId);
        Task<BulkOperationResult> BulkDeleteUsersAsync(List<Guid> userIds, Guid tenantId, Guid currentUserId);
        Task<Stream> GetCsvTemplateAsync();
        Task<List<BulkOperationJob>> GetJobsAsync(Guid tenantId);
        Task<BulkOperationJob?> GetJobStatusAsync(Guid jobId, Guid tenantId);
    }

    public class BulkOperationsService : IBulkOperationsService
    {
        private readonly AppDbContext _context;

        public BulkOperationsService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<BulkOperationResult> ImportUsersFromCsvAsync(Stream csvStream, Guid tenantId, Guid currentUserId)
        {
            var result = new BulkOperationResult
            {
                JobId = Guid.NewGuid(),
                TotalRecords = 0,
                SuccessCount = 0,
                ErrorCount = 0,
                Errors = new List<string>()
            };

            try
            {
                using (var reader = new StreamReader(csvStream))
                using (var csv = new CsvReader(reader, CultureInfo.InvariantCulture))
                {
                    var records = csv.GetRecords<UserImportRecord>().ToList();
                    result.TotalRecords = records.Count;

                    foreach (var record in records)
                    {
                        try
                        {
                            // Validate required fields
                            if (string.IsNullOrWhiteSpace(record.Email) || 
                                string.IsNullOrWhiteSpace(record.FirstName) || 
                                string.IsNullOrWhiteSpace(record.LastName))
                            {
                                result.Errors.Add($"Row {records.IndexOf(record) + 1}: Missing required fields");
                                result.ErrorCount++;
                                continue;
                            }

                            // Check if user already exists
                            var existingUser = await _context.Users
                                .FirstOrDefaultAsync(u => u.Email == record.Email && u.TenantId == tenantId);

                            if (existingUser != null)
                            {
                                result.Errors.Add($"Row {records.IndexOf(record) + 1}: User with email {record.Email} already exists");
                                result.ErrorCount++;
                                continue;
                            }

                            // Create new user
                            var user = new AppUser
                            {
                                Id = Guid.NewGuid(),
                                TenantId = tenantId,
                                UserName = record.Email,
                                NormalizedUserName = record.Email.ToUpper(),
                                Email = record.Email,
                                NormalizedEmail = record.Email.ToUpper(),
                                EmailConfirmed = true,
                                FirstName = record.FirstName,
                                LastName = record.LastName,
                                PhoneNumber = record.PhoneNumber,
                                UserType = record.UserType ?? "Staff",
                                UserStatus = "active",
                                LicenseNumber = record.LicenseNumber,
                                CreatedAt = DateTime.UtcNow,
                                // Note: Password should be set via UserManager in real implementation
                                PasswordHash = "TempHashNeedsReset" // Require password change on first login
                            };

                            _context.Users.Add(user);
                            await _context.SaveChangesAsync();

                            // Create employee record if hire date is provided
                            if (record.HireDate.HasValue)
                            {
                                var employee = new Employee
                                {
                                    Id = Guid.NewGuid(),
                                    TenantId = tenantId,
                                    UserId = user.Id,
                                    HireDate = record.HireDate.Value,
                                    JobTitle = record.JobTitle,
                                    EmploymentStatus = "active",
                                    CreatedAt = DateTime.UtcNow,
                                    UpdatedAt = DateTime.UtcNow,
                                    CreatedByUserId = currentUserId,
                                    UpdatedByUserId = currentUserId
                                };

                                _context.Employees.Add(employee);
                                await _context.SaveChangesAsync();
                            }

                            result.SuccessCount++;
                        }
                        catch (Exception ex)
                        {
                            result.Errors.Add($"Row {records.IndexOf(record) + 1}: {ex.Message}");
                            result.ErrorCount++;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                result.Errors.Add($"Fatal error: {ex.Message}");
            }

            return result;
        }

        public async Task<Stream> ExportUsersToCsvAsync(Guid tenantId, UserExportFilter? filter = null)
        {
            var query = _context.Users
                .Where(u => u.TenantId == tenantId && u.DeletedAt == null)
                .AsQueryable();

            // Apply filters
            if (filter != null)
            {
                if (!string.IsNullOrEmpty(filter.UserType))
                    query = query.Where(u => u.UserType == filter.UserType);
                
                if (!string.IsNullOrEmpty(filter.UserStatus))
                    query = query.Where(u => u.UserStatus == filter.UserStatus);
                
                if (filter.CreatedAfter.HasValue)
                    query = query.Where(u => u.CreatedAt >= filter.CreatedAfter.Value);
                
                if (filter.CreatedBefore.HasValue)
                    query = query.Where(u => u.CreatedAt <= filter.CreatedBefore.Value);
            }

            var users = await query
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .OrderBy(u => u.Email)
                .ToListAsync();

            var memoryStream = new MemoryStream();
            var writer = new StreamWriter(memoryStream, Encoding.UTF8);
            var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);

            await csv.WriteRecordsAsync(users.Select(u => new UserExportRecord
            {
                Id = u.Id,
                Email = u.Email ?? string.Empty,
                FirstName = u.FirstName,
                LastName = u.LastName,
                PhoneNumber = u.PhoneNumber,
                UserType = u.UserType,
                UserStatus = u.UserStatus,
                LicenseNumber = u.LicenseNumber,
                CreatedAt = u.CreatedAt,
                LastLoginAt = u.LastLoginAt
            }));

            await writer.FlushAsync();
            memoryStream.Position = 0;

            return memoryStream;
        }

        public async Task<BulkOperationResult> BulkAssignRoleAsync(List<Guid> userIds, Guid roleId, Guid tenantId, Guid currentUserId)
        {
            var result = new BulkOperationResult
            {
                JobId = Guid.NewGuid(),
                TotalRecords = userIds.Count,
                SuccessCount = 0,
                ErrorCount = 0,
                Errors = new List<string>()
            };

            var role = await _context.Roles.FirstOrDefaultAsync(r => r.Id == roleId);
            if (role == null)
            {
                result.Errors.Add("Role not found");
                result.ErrorCount = userIds.Count;
                return result;
            }

            foreach (var userId in userIds)
            {
                try
                {
                    var user = await _context.Users
                        .FirstOrDefaultAsync(u => u.Id == userId && u.TenantId == tenantId && u.DeletedAt == null);

                    if (user == null)
                    {
                        result.Errors.Add($"User {userId} not found");
                        result.ErrorCount++;
                        continue;
                    }

                    // Check if user already has this role
                    var existingRole = await _context.UserRoles
                        .FirstOrDefaultAsync(ur => ur.UserId == userId && ur.RoleId == roleId);

                    if (existingRole != null)
                    {
                        result.Errors.Add($"User {user.Email} already has role {role.Name}");
                        result.ErrorCount++;
                        continue;
                    }

                    // Add role
                    var userRole = new AppUserRole
                    {
                        UserId = userId,
                        RoleId = roleId
                    };

                    _context.UserRoles.Add(userRole);
                    await _context.SaveChangesAsync();

                    result.SuccessCount++;
                }
                catch (Exception ex)
                {
                    result.Errors.Add($"User {userId}: {ex.Message}");
                    result.ErrorCount++;
                }
            }

            return result;
        }

        public async Task<BulkOperationResult> BulkChangeStatusAsync(List<Guid> userIds, string newStatus, Guid tenantId, Guid currentUserId)
        {
            var result = new BulkOperationResult
            {
                JobId = Guid.NewGuid(),
                TotalRecords = userIds.Count,
                SuccessCount = 0,
                ErrorCount = 0,
                Errors = new List<string>()
            };

            foreach (var userId in userIds)
            {
                try
                {
                    var user = await _context.Users
                        .FirstOrDefaultAsync(u => u.Id == userId && u.TenantId == tenantId && u.DeletedAt == null);

                    if (user == null)
                    {
                        result.Errors.Add($"User {userId} not found");
                        result.ErrorCount++;
                        continue;
                    }

                    user.UserStatus = newStatus;
                    user.UpdatedAt = DateTime.UtcNow;

                    await _context.SaveChangesAsync();
                    result.SuccessCount++;
                }
                catch (Exception ex)
                {
                    result.Errors.Add($"User {userId}: {ex.Message}");
                    result.ErrorCount++;
                }
            }

            return result;
        }

        public async Task<BulkOperationResult> BulkDeleteUsersAsync(List<Guid> userIds, Guid tenantId, Guid currentUserId)
        {
            var result = new BulkOperationResult
            {
                JobId = Guid.NewGuid(),
                TotalRecords = userIds.Count,
                SuccessCount = 0,
                ErrorCount = 0,
                Errors = new List<string>()
            };

            foreach (var userId in userIds)
            {
                try
                {
                    var user = await _context.Users
                        .FirstOrDefaultAsync(u => u.Id == userId && u.TenantId == tenantId && u.DeletedAt == null);

                    if (user == null)
                    {
                        result.Errors.Add($"User {userId} not found");
                        result.ErrorCount++;
                        continue;
                    }

                    // Soft delete
                    user.DeletedAt = DateTime.UtcNow;
                    user.UpdatedBy = currentUserId; // Note: AppUser doesn't have DeletedBy, using UpdatedBy
                    user.UserStatus = "deleted";

                    await _context.SaveChangesAsync();
                    result.SuccessCount++;
                }
                catch (Exception ex)
                {
                    result.Errors.Add($"User {userId}: {ex.Message}");
                    result.ErrorCount++;
                }
            }

            return result;
        }

        public async Task<Stream> GetCsvTemplateAsync()
        {
            var template = new List<UserImportRecord>
            {
                new UserImportRecord
                {
                    Email = "doctor@example.com",
                    FirstName = "John",
                    LastName = "Doe",
                    PhoneNumber = "+1-555-0001",
                    UserType = "Staff",
                    LicenseNumber = "MD-12345",
                    JobTitle = "Ophthalmologist",
                    HireDate = DateTime.UtcNow.Date
                }
            };

            var memoryStream = new MemoryStream();
            var writer = new StreamWriter(memoryStream, Encoding.UTF8);
            var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);

            await csv.WriteRecordsAsync(template);
            await writer.FlushAsync();
            memoryStream.Position = 0;

            return memoryStream;
        }

        public async Task<List<BulkOperationJob>> GetJobsAsync(Guid tenantId)
        {
            // This would fetch from a jobs table in real implementation
            // For now, returning empty list
            return new List<BulkOperationJob>();
        }

        public async Task<BulkOperationJob?> GetJobStatusAsync(Guid jobId, Guid tenantId)
        {
            // This would fetch job status from database
            // For now, returning null
            return null;
        }
    }

    // DTOs for bulk operations
    public class BulkOperationResult
    {
        public Guid JobId { get; set; }
        public int TotalRecords { get; set; }
        public int SuccessCount { get; set; }
        public int ErrorCount { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
    }

    public class UserImportRecord
    {
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? UserType { get; set; }
        public string? LicenseNumber { get; set; }
        public string? JobTitle { get; set; }
        public DateTime? HireDate { get; set; }
    }

    public class UserExportRecord
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? UserType { get; set; }
        public string? UserStatus { get; set; }
        public string? LicenseNumber { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
    }

    public class UserExportFilter
    {
        public string? UserType { get; set; }
        public string? UserStatus { get; set; }
        public DateTime? CreatedAfter { get; set; }
        public DateTime? CreatedBefore { get; set; }
    }

    public class BulkOperationJob
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public string OperationType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int TotalRecords { get; set; }
        public int ProcessedRecords { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
}
