using AuthService.Context;
using AuthService.Models;
using AuthService.Models.Domain;
using AuthService.Models.Training;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AuthService.Services
{
    public class TrainingManagementService : ITrainingManagementService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<TrainingManagementService> _logger;

        public TrainingManagementService(AppDbContext context, ILogger<TrainingManagementService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<TrainingAssignmentDto> AssignTrainingAsync(AssignTrainingRequest request, Guid tenantId, Guid currentUserId)
        {
            // Check if user already has this training assigned
            var existingAssignment = await _context.TrainingAssignments
                .FirstOrDefaultAsync(ta => ta.UserId == request.UserId && 
                                          ta.CourseId == request.CourseId && 
                                          ta.TenantId == tenantId && 
                                          ta.DeletedAt == null &&
                                          (ta.TrainingStatus == TrainingStatus.NotStarted || ta.TrainingStatus == TrainingStatus.InProgress));

            if (existingAssignment != null)
                throw new InvalidOperationException("User already has this training assigned and not completed");

            var assignment = new TrainingAssignment
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                UserId = request.UserId,
                CourseId = request.CourseId,
                AssignedDate = DateTime.UtcNow,
                DueDate = request.DueDate,
                TrainingStatus = TrainingStatus.NotStarted,
                Notes = request.Notes,
                AssignedByUserId = currentUserId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedByUserId = currentUserId,
                UpdatedByUserId = currentUserId,
                Status = "active"
            };

            _context.TrainingAssignments.Add(assignment);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Assigned training {CourseId} to user {UserId}", request.CourseId, request.UserId);

            return await MapToDto(assignment);
        }

        public async Task<TrainingAssignmentDto> RecordCompletionAsync(Guid assignmentId, RecordCompletionRequest request, Guid tenantId, Guid currentUserId)
        {
            var assignment = await _context.TrainingAssignments
                .FirstOrDefaultAsync(ta => ta.Id == assignmentId && ta.TenantId == tenantId && ta.DeletedAt == null);

            if (assignment == null)
                throw new KeyNotFoundException($"Training assignment {assignmentId} not found");

            if (assignment.TrainingStatus == TrainingStatus.Completed)
                throw new InvalidOperationException("Training already marked as completed");

            assignment.TrainingStatus = TrainingStatus.Completed;
            assignment.CompletionDate = request.CompletionDate;
            assignment.CompletionCertificateUrl = request.CertificateUrl;

            // Calculate expiry date based on course validity period
            var course = await _context.TrainingCourses
                .FirstOrDefaultAsync(c => c.Id == assignment.CourseId && c.TenantId == tenantId);

            if (course != null && course.ValidityPeriodDays > 0)
            {
                assignment.ExpiryDate = request.CompletionDate.AddDays(course.ValidityPeriodDays);
            }

            assignment.UpdatedAt = DateTime.UtcNow;
            assignment.UpdatedByUserId = currentUserId;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Recorded completion for training assignment {AssignmentId}", assignmentId);

            return await MapToDto(assignment);
        }

        public async Task<ComplianceReportDto> GetUserComplianceReportAsync(Guid userId, Guid tenantId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && u.TenantId == tenantId);
            var assignments = await _context.TrainingAssignments
                .Where(ta => ta.UserId == userId && ta.TenantId == tenantId && ta.DeletedAt == null)
                .ToListAsync();

            var credentials = await _context.UserCredentials
                .Where(uc => uc.UserId == userId && uc.TenantId == tenantId && uc.DeletedAt == null)
                .ToListAsync();

            var today = DateTime.UtcNow.Date;

            var mandatoryAssignments = new List<TrainingAssignment>();
            foreach (var assignment in assignments)
            {
                var course = await _context.TrainingCourses.FirstOrDefaultAsync(c => c.Id == assignment.CourseId);
                if (course?.IsMandatory == true)
                {
                    mandatoryAssignments.Add(assignment);
                }
            }

            var completedMandatory = mandatoryAssignments.Count(a => a.TrainingStatus == TrainingStatus.Completed);
            var overdueTrainings = assignments.Where(a => a.DueDate.HasValue && a.DueDate.Value < today && a.TrainingStatus != TrainingStatus.Completed).ToList();

            var expiringCredentials = credentials.Where(c => c.ExpiryDate.HasValue && 
                                                            c.ExpiryDate.Value >= today && 
                                                            c.ExpiryDate.Value <= today.AddDays(30) &&
                                                            c.CredentialStatus == CredentialStatus.Valid).ToList();

            var expiredCredentials = credentials.Where(c => c.ExpiryDate.HasValue && 
                                                           c.ExpiryDate.Value < today &&
                                                           c.CredentialStatus != CredentialStatus.Expired).ToList();

            var compliancePercentage = mandatoryAssignments.Count > 0 
                ? (completedMandatory * 100.0 / mandatoryAssignments.Count) 
                : 100.0;

            var report = new ComplianceReportDto
            {
                UserId = userId,
                UserName = $"{user?.FirstName} {user?.LastName}",
                TotalAssignments = assignments.Count,
                CompletedTrainings = assignments.Count(a => a.TrainingStatus == TrainingStatus.Completed),
                OverdueTrainings = overdueTrainings.Count,
                ExpiringCredentialsCount = expiringCredentials.Count,
                ExpiredCredentials = expiredCredentials.Count,
                CompliancePercentage = compliancePercentage,
                IsCompliant = compliancePercentage >= 100 && expiredCredentials.Count == 0 && overdueTrainings.Count == 0
            };

            foreach (var assignment in overdueTrainings)
            {
                report.OverdueAssignments.Add(await MapToDto(assignment));
            }

            foreach (var credential in expiringCredentials)
            {
                report.ExpiringCredentials.Add(MapCredentialToDto(credential));
            }

            return report;
        }

        public async Task<List<ComplianceReportDto>> GetTenantComplianceReportAsync(Guid tenantId)
        {
            var users = await _context.Users.Where(u => u.TenantId == tenantId && u.DeletedAt == null).ToListAsync();

            var reports = new List<ComplianceReportDto>();
            foreach (var user in users)
            {
                var report = await GetUserComplianceReportAsync(user.Id, tenantId);
                reports.Add(report);
            }

            return reports.OrderBy(r => r.IsCompliant).ThenBy(r => r.CompliancePercentage).ToList();
        }

        public async Task<List<UserCredentialDto>> GetExpiringCredentialsAsync(Guid tenantId, int daysAhead = 30)
        {
            var today = DateTime.UtcNow.Date;
            var futureDate = today.AddDays(daysAhead);

            var credentials = await _context.UserCredentials
                .Where(uc => uc.TenantId == tenantId && 
                            uc.DeletedAt == null && 
                            uc.ExpiryDate.HasValue &&
                            uc.ExpiryDate.Value >= today &&
                            uc.ExpiryDate.Value <= futureDate &&
                            uc.CredentialStatus == CredentialStatus.Valid)
                .OrderBy(uc => uc.ExpiryDate)
                .ToListAsync();

            return credentials.Select(MapCredentialToDto).ToList();
        }

        public async Task AutoSuspendExpiredCredentialsAsync(Guid tenantId)
        {
            var today = DateTime.UtcNow.Date;

            var expiredCredentials = await _context.UserCredentials
                .Where(uc => uc.TenantId == tenantId && 
                            uc.DeletedAt == null && 
                            uc.ExpiryDate.HasValue &&
                            uc.ExpiryDate.Value < today &&
                            uc.CredentialStatus == CredentialStatus.Valid &&
                            uc.IsRequired)
                .ToListAsync();

            foreach (var credential in expiredCredentials)
            {
                credential.CredentialStatus = CredentialStatus.Expired;
                credential.UpdatedAt = DateTime.UtcNow;

                _logger.LogWarning("Expired required credential {CredentialId} for user {UserId}", 
                    credential.Id, credential.UserId);

                // Create system alert
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == credential.UserId);
                var alert = new SystemAlert
                {
                    Id = Guid.NewGuid(),
                    AlertType = "credential_expiry",
                    Severity = "critical",
                    Title = "Required Credential Expired",
                    Description = $"User {user?.FirstName} {user?.LastName} has an expired required credential: {credential.CredentialName}. Immediate action required.",
                    Count = 1,
                    IsDismissed = false,
                    CreatedAt = DateTime.UtcNow
                };

                _context.SystemAlerts.Add(alert);
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Auto-suspended {Count} expired required credentials in tenant {TenantId}", 
                expiredCredentials.Count, tenantId);
        }

        public async Task<List<TrainingAssignmentDto>> GetUserAssignmentsAsync(Guid userId, Guid tenantId)
        {
            var assignments = await _context.TrainingAssignments
                .Where(ta => ta.UserId == userId && ta.TenantId == tenantId && ta.DeletedAt == null)
                .OrderByDescending(ta => ta.AssignedDate)
                .ToListAsync();

            var dtos = new List<TrainingAssignmentDto>();
            foreach (var assignment in assignments)
            {
                dtos.Add(await MapToDto(assignment));
            }

            return dtos;
        }

        public async Task<TrainingStatisticsDto> GetTrainingStatisticsAsync(Guid tenantId)
        {
            var users = await _context.Users.Where(u => u.TenantId == tenantId && u.DeletedAt == null).ToListAsync();
            var assignments = await _context.TrainingAssignments
                .Where(ta => ta.TenantId == tenantId && ta.DeletedAt == null)
                .ToListAsync();

            var today = DateTime.UtcNow.Date;

            var complianceReports = new List<ComplianceReportDto>();
            foreach (var user in users)
            {
                var report = await GetUserComplianceReportAsync(user.Id, tenantId);
                complianceReports.Add(report);
            }

            var credentials = await _context.UserCredentials
                .Where(uc => uc.TenantId == tenantId && uc.DeletedAt == null)
                .ToListAsync();

            var expiringCount = credentials.Count(c => c.ExpiryDate.HasValue && 
                                                      c.ExpiryDate.Value >= today && 
                                                      c.ExpiryDate.Value <= today.AddDays(30) &&
                                                      c.CredentialStatus == CredentialStatus.Valid);

            return new TrainingStatisticsDto
            {
                TotalUsers = users.Count,
                CompliantUsers = complianceReports.Count(r => r.IsCompliant),
                NonCompliantUsers = complianceReports.Count(r => !r.IsCompliant),
                TotalAssignments = assignments.Count,
                CompletedAssignments = assignments.Count(a => a.TrainingStatus == TrainingStatus.Completed),
                OverdueAssignments = assignments.Count(a => a.DueDate.HasValue && a.DueDate.Value < today && a.TrainingStatus != TrainingStatus.Completed),
                ExpiringCredentials = expiringCount,
                OverallComplianceRate = users.Count > 0 
                    ? (complianceReports.Count(r => r.IsCompliant) * 100.0 / users.Count) 
                    : 100.0,
                AssignmentsByStatus = assignments.GroupBy(a => a.TrainingStatus)
                                                .ToDictionary(g => g.Key, g => g.Count())
            };
        }

        // Private helpers
        private async Task<TrainingAssignmentDto> MapToDto(TrainingAssignment assignment)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == assignment.UserId);
            var course = await _context.TrainingCourses.FirstOrDefaultAsync(c => c.Id == assignment.CourseId);

            var today = DateTime.UtcNow.Date;

            return new TrainingAssignmentDto
            {
                Id = assignment.Id,
                UserId = assignment.UserId,
                UserName = $"{user?.FirstName} {user?.LastName}",
                CourseId = assignment.CourseId,
                CourseName = course?.CourseName ?? "Unknown Course",
                IsMandatory = course?.IsMandatory ?? false,
                AssignedDate = assignment.AssignedDate,
                DueDate = assignment.DueDate,
                TrainingStatus = assignment.TrainingStatus,
                CompletionDate = assignment.CompletionDate,
                ExpiryDate = assignment.ExpiryDate,
                IsOverdue = assignment.DueDate.HasValue && assignment.DueDate.Value < today && assignment.TrainingStatus != TrainingStatus.Completed,
                DaysUntilDue = assignment.DueDate.HasValue ? (int)(assignment.DueDate.Value - today).TotalDays : null,
                DaysUntilExpiry = assignment.ExpiryDate.HasValue ? (int)(assignment.ExpiryDate.Value - today).TotalDays : null
            };
        }

        private UserCredentialDto MapCredentialToDto(UserCredential credential)
        {
            var today = DateTime.UtcNow.Date;

            return new UserCredentialDto
            {
                Id = credential.Id,
                UserId = credential.UserId,
                CredentialName = credential.CredentialName,
                CredentialType = credential.CredentialType,
                IssuingAuthority = credential.IssuingAuthority,
                IssuedDate = credential.IssuedDate,
                ExpiryDate = credential.ExpiryDate,
                CredentialStatus = credential.CredentialStatus,
                IsRequired = credential.IsRequired,
                DaysUntilExpiry = credential.ExpiryDate.HasValue ? (int)(credential.ExpiryDate.Value - today).TotalDays : null
            };
        }
    }
}
