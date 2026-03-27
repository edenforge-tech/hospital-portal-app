using AuthService.Data;
using AuthService.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AuthService.Services
{
    public interface IProbationService
    {
        Task<List<ProbationTracking>> GetProbationsByTenantAsync(Guid tenantId);
        Task<ProbationTracking?> GetProbationByIdAsync(Guid probationId, Guid tenantId);
        Task<ProbationTracking?> GetActiveProbationByEmployeeIdAsync(Guid employeeId, Guid tenantId);
        Task<ProbationTracking> CreateProbationAsync(ProbationTracking probation, Guid currentUserId);
        Task<ProbationTracking> UpdateProbationAsync(ProbationTracking probation, Guid currentUserId);
        Task DeleteProbationAsync(Guid probationId, Guid tenantId, Guid currentUserId);
        Task<ProbationTracking> ExtendProbationAsync(Guid probationId, Guid tenantId, int extensionMonths, string reason, Guid currentUserId);
        Task<ProbationTracking> ConfirmEmployeeAsync(Guid probationId, Guid tenantId, Guid confirmedByUserId, decimal? rating = null, string? notes = null);
        Task<ProbationTracking> ScheduleReviewAsync(Guid probationId, Guid tenantId, DateTime reviewDate, Guid reviewerId);
        Task<ProbationTracking> CompleteReviewAsync(Guid probationId, Guid tenantId, decimal rating, string? strengths = null, string? improvements = null, Guid reviewerId);
        Task<List<ProbationTracking>> GetUpcomingReviewsAsync(Guid tenantId, int daysAhead = 7);
        Task<int> GetProbationProgressPercentageAsync(Guid employeeId, Guid tenantId);
    }

    public class ProbationService : IProbationService
    {
        private readonly AppDbContext _context;

        public ProbationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ProbationTracking>> GetProbationsByTenantAsync(Guid tenantId)
        {
            return await _context.ProbationTrackings
                .Where(p => p.TenantId == tenantId && p.DeletedAt == null)
                .Include(p => p.Employee)
                    .ThenInclude(e => e.User)
                .Include(p => p.ReviewerUser)
                .OrderByDescending(p => p.ProbationStartDate)
                .ToListAsync();
        }

        public async Task<ProbationTracking?> GetProbationByIdAsync(Guid probationId, Guid tenantId)
        {
            return await _context.ProbationTrackings
                .Where(p => p.Id == probationId && p.TenantId == tenantId && p.DeletedAt == null)
                .Include(p => p.Employee)
                    .ThenInclude(e => e.User)
                .Include(p => p.ReviewerUser)
                .Include(p => p.ConfirmedByUser)
                .FirstOrDefaultAsync();
        }

        public async Task<ProbationTracking?> GetActiveProbationByEmployeeIdAsync(Guid employeeId, Guid tenantId)
        {
            return await _context.ProbationTrackings
                .Where(p => p.EmployeeId == employeeId 
                    && p.TenantId == tenantId 
                    && p.DeletedAt == null
                    && p.ConfirmationStatus == "in_progress")
                .OrderByDescending(p => p.ProbationStartDate)
                .FirstOrDefaultAsync();
        }

        public async Task<ProbationTracking> CreateProbationAsync(ProbationTracking probation, Guid currentUserId)
        {
            probation.Id = Guid.NewGuid();
            probation.CreatedAt = DateTime.UtcNow;
            probation.UpdatedAt = DateTime.UtcNow;
            probation.CreatedByUserId = currentUserId;
            probation.UpdatedByUserId = currentUserId;
            probation.Status = "active";
            probation.ConfirmationStatus = "in_progress";
            probation.OriginalEndDate = probation.ProbationEndDate;

            _context.ProbationTrackings.Add(probation);
            await _context.SaveChangesAsync();

            // Update employee probation end date
            var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Id == probation.EmployeeId);
            if (employee != null)
            {
                employee.ProbationEndDate = probation.ProbationEndDate;
                await _context.SaveChangesAsync();
            }

            return await GetProbationByIdAsync(probation.Id, probation.TenantId) ?? probation;
        }

        public async Task<ProbationTracking> UpdateProbationAsync(ProbationTracking probation, Guid currentUserId)
        {
            var existing = await _context.ProbationTrackings
                .FirstOrDefaultAsync(p => p.Id == probation.Id && p.TenantId == probation.TenantId && p.DeletedAt == null);

            if (existing == null)
                throw new InvalidOperationException("Probation record not found");

            existing.ProbationStartDate = probation.ProbationStartDate;
            existing.ProbationEndDate = probation.ProbationEndDate;
            existing.ReviewScheduledDate = probation.ReviewScheduledDate;
            existing.ReviewCompletedDate = probation.ReviewCompletedDate;
            existing.ReviewerUserId = probation.ReviewerUserId;
            existing.PerformanceRating = probation.PerformanceRating;
            existing.Strengths = probation.Strengths;
            existing.AreasForImprovement = probation.AreasForImprovement;
            existing.TrainingRecommendations = probation.TrainingRecommendations;
            existing.DecisionNotes = probation.DecisionNotes;
            existing.ManagerRecommendation = probation.ManagerRecommendation;
            existing.HrNotes = probation.HrNotes;
            existing.ReviewDocumentUrl = probation.ReviewDocumentUrl;
            existing.ConfirmationLetterUrl = probation.ConfirmationLetterUrl;
            existing.UpdatedAt = DateTime.UtcNow;
            existing.UpdatedByUserId = currentUserId;

            await _context.SaveChangesAsync();

            return await GetProbationByIdAsync(existing.Id, existing.TenantId) ?? existing;
        }

        public async Task DeleteProbationAsync(Guid probationId, Guid tenantId, Guid currentUserId)
        {
            var probation = await _context.ProbationTrackings
                .FirstOrDefaultAsync(p => p.Id == probationId && p.TenantId == tenantId && p.DeletedAt == null);

            if (probation == null)
                throw new InvalidOperationException("Probation record not found");

            probation.DeletedAt = DateTime.UtcNow;
            probation.DeletedBy = currentUserId;
            probation.Status = "deleted";

            await _context.SaveChangesAsync();
        }

        public async Task<ProbationTracking> ExtendProbationAsync(Guid probationId, Guid tenantId, int extensionMonths, string reason, Guid currentUserId)
        {
            var probation = await _context.ProbationTrackings
                .FirstOrDefaultAsync(p => p.Id == probationId && p.TenantId == tenantId && p.DeletedAt == null);

            if (probation == null)
                throw new InvalidOperationException("Probation record not found");

            var newEndDate = probation.ProbationEndDate.AddMonths(extensionMonths);
            
            probation.ExtensionDate = newEndDate;
            probation.ProbationEndDate = newEndDate;
            probation.ExtensionDurationMonths = extensionMonths;
            probation.ExtensionReason = reason;
            probation.ConfirmationStatus = "extended";
            probation.UpdatedAt = DateTime.UtcNow;
            probation.UpdatedByUserId = currentUserId;

            await _context.SaveChangesAsync();

            // Update employee probation end date
            var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Id == probation.EmployeeId);
            if (employee != null)
            {
                employee.ProbationEndDate = newEndDate;
                await _context.SaveChangesAsync();
            }

            return await GetProbationByIdAsync(probation.Id, probation.TenantId) ?? probation;
        }

        public async Task<ProbationTracking> ConfirmEmployeeAsync(Guid probationId, Guid tenantId, Guid confirmedByUserId, decimal? rating = null, string? notes = null)
        {
            var probation = await _context.ProbationTrackings
                .FirstOrDefaultAsync(p => p.Id == probationId && p.TenantId == tenantId && p.DeletedAt == null);

            if (probation == null)
                throw new InvalidOperationException("Probation record not found");

            probation.ConfirmationStatus = "confirmed";
            probation.ConfirmationDate = DateTime.UtcNow.Date;
            probation.ConfirmedByUserId = confirmedByUserId;
            probation.PerformanceRating = rating;
            probation.DecisionNotes = notes;
            probation.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Update employee confirmation date
            var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Id == probation.EmployeeId);
            if (employee != null)
            {
                employee.ConfirmationDate = DateTime.UtcNow.Date;
                employee.EmploymentStatus = "active"; // Change from probation to active
                await _context.SaveChangesAsync();
            }

            return await GetProbationByIdAsync(probation.Id, probation.TenantId) ?? probation;
        }

        public async Task<ProbationTracking> ScheduleReviewAsync(Guid probationId, Guid tenantId, DateTime reviewDate, Guid reviewerId)
        {
            var probation = await _context.ProbationTrackings
                .FirstOrDefaultAsync(p => p.Id == probationId && p.TenantId == tenantId && p.DeletedAt == null);

            if (probation == null)
                throw new InvalidOperationException("Probation record not found");

            probation.ReviewScheduledDate = reviewDate;
            probation.ReviewerUserId = reviewerId;
            probation.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetProbationByIdAsync(probation.Id, probation.TenantId) ?? probation;
        }

        public async Task<ProbationTracking> CompleteReviewAsync(Guid probationId, Guid tenantId, decimal rating, string? strengths = null, string? improvements = null, Guid reviewerId = default)
        {
            var probation = await _context.ProbationTrackings
                .FirstOrDefaultAsync(p => p.Id == probationId && p.TenantId == tenantId && p.DeletedAt == null);

            if (probation == null)
                throw new InvalidOperationException("Probation record not found");

            probation.ReviewCompletedDate = DateTime.UtcNow.Date;
            probation.PerformanceRating = rating;
            probation.Strengths = strengths;
            probation.AreasForImprovement = improvements;
            probation.ReviewerUserId = reviewerId;
            probation.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetProbationByIdAsync(probation.Id, probation.TenantId) ?? probation;
        }

        public async Task<List<ProbationTracking>> GetUpcomingReviewsAsync(Guid tenantId, int daysAhead = 7)
        {
            var today = DateTime.UtcNow.Date;
            var futureDate = today.AddDays(daysAhead);

            return await _context.ProbationTrackings
                .Where(p => p.TenantId == tenantId 
                    && p.DeletedAt == null 
                    && p.ReviewScheduledDate.HasValue
                    && p.ReviewScheduledDate.Value >= today
                    && p.ReviewScheduledDate.Value <= futureDate
                    && !p.ReviewCompletedDate.HasValue)
                .Include(p => p.Employee)
                    .ThenInclude(e => e.User)
                .Include(p => p.ReviewerUser)
                .OrderBy(p => p.ReviewScheduledDate)
                .ToListAsync();
        }

        public async Task<int> GetProbationProgressPercentageAsync(Guid employeeId, Guid tenantId)
        {
            var probation = await GetActiveProbationByEmployeeIdAsync(employeeId, tenantId);
            
            if (probation == null)
                return 0;

            var totalDays = (probation.ProbationEndDate - probation.ProbationStartDate).Days;
            var elapsedDays = (DateTime.UtcNow.Date - probation.ProbationStartDate).Days;

            if (totalDays <= 0)
                return 0;

            var progress = (int)Math.Round((decimal)elapsedDays / totalDays * 100);
            return Math.Max(0, Math.Min(100, progress));
        }
    }
}
