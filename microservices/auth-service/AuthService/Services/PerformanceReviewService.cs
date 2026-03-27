using AuthService.Context;
using AuthService.Models.PerformanceReview;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AuthService.Services
{
    public class PerformanceReviewService : IPerformanceReviewService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<PerformanceReviewService> _logger;

        // Weighted criteria percentages
        private readonly Dictionary<string, double> _criteriaWeights = new()
        {
            { "QualityOfWork", 0.15 },
            { "Productivity", 0.10 },
            { "TechnicalSkills", 0.10 },
            { "Communication", 0.08 },
            { "Teamwork", 0.08 },
            { "Initiative", 0.07 },
            { "ProblemSolving", 0.07 },
            { "Adaptability", 0.07 },
            { "AttendancePunctuality", 0.07 },
            { "Professionalism", 0.07 },
            { "LearningDevelopment", 0.06 },
            { "PolicyCompliance", 0.05 },
            { "CustomerService", 0.03 }
        };

        public PerformanceReviewService(AppDbContext context, ILogger<PerformanceReviewService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<PerformanceReviewDto> CreateReviewAsync(CreatePerformanceReviewRequest request, Guid tenantId, Guid currentUserId)
        {
            var review = new PerformanceReview
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                EmployeeId = request.EmployeeId,
                ReviewerId = request.ReviewerId,
                ReviewType = request.ReviewType,
                Status = ReviewStatus.Draft,
                ReviewPeriodStart = request.ReviewPeriodStart,
                ReviewPeriodEnd = request.ReviewPeriodEnd,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedByUserId = currentUserId,
                UpdatedByUserId = currentUserId,
                Status_Audit = "active"
            };

            _context.PerformanceReviews.Add(review);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created performance review {ReviewId} for employee {EmployeeId}", review.Id, request.EmployeeId);

            return await MapToDto(review);
        }

        public async Task<PerformanceReviewDto?> GetReviewByIdAsync(Guid reviewId, Guid tenantId)
        {
            var review = await _context.PerformanceReviews
                .FirstOrDefaultAsync(r => r.Id == reviewId && r.TenantId == tenantId && r.DeletedAt == null);

            if (review == null)
                return null;

            return await MapToDto(review);
        }

        public async Task<List<PerformanceReviewDto>> GetReviewsByEmployeeIdAsync(Guid employeeId, Guid tenantId)
        {
            var reviews = await _context.PerformanceReviews
                .Where(r => r.EmployeeId == employeeId && r.TenantId == tenantId && r.DeletedAt == null)
                .OrderByDescending(r => r.ReviewPeriodEnd)
                .ToListAsync();

            var dtos = new List<PerformanceReviewDto>();
            foreach (var review in reviews)
            {
                dtos.Add(await MapToDto(review));
            }

            return dtos;
        }

        public async Task<List<PerformanceReviewDto>> GetPendingReviewsAsync(Guid tenantId, Guid? reviewerId = null)
        {
            var query = _context.PerformanceReviews
                .Where(r => r.TenantId == tenantId && r.DeletedAt == null)
                .Where(r => r.Status == ReviewStatus.Draft ||
                           r.Status == ReviewStatus.PendingLevel1 ||
                           r.Status == ReviewStatus.PendingLevel2 ||
                           r.Status == ReviewStatus.PendingLevel3);

            if (reviewerId.HasValue)
            {
                query = query.Where(r => r.ReviewerId == reviewerId.Value ||
                                        r.Level1ApproverId == reviewerId.Value ||
                                        r.Level2ApproverId == reviewerId.Value ||
                                        r.Level3ApproverId == reviewerId.Value);
            }

            var reviews = await query.OrderBy(r => r.ReviewPeriodEnd).ToListAsync();

            var dtos = new List<PerformanceReviewDto>();
            foreach (var review in reviews)
            {
                dtos.Add(await MapToDto(review));
            }

            return dtos;
        }

        public async Task<PerformanceReviewDto> UpdateReviewScoresAsync(Guid reviewId, UpdateReviewScoresRequest request, Guid tenantId, Guid currentUserId)
        {
            var review = await _context.PerformanceReviews
                .FirstOrDefaultAsync(r => r.Id == reviewId && r.TenantId == tenantId && r.DeletedAt == null);

            if (review == null)
                throw new KeyNotFoundException($"Review {reviewId} not found");

            if (review.Status != ReviewStatus.Draft)
                throw new InvalidOperationException("Can only update scores for draft reviews");

            // Update all scores
            review.QualityOfWorkScore = request.QualityOfWorkScore;
            review.ProductivityScore = request.ProductivityScore;
            review.TechnicalSkillsScore = request.TechnicalSkillsScore;
            review.CommunicationScore = request.CommunicationScore;
            review.TeamworkScore = request.TeamworkScore;
            review.InitiativeScore = request.InitiativeScore;
            review.ProblemSolvingScore = request.ProblemSolvingScore;
            review.AdaptabilityScore = request.AdaptabilityScore;
            review.AttendancePunctualityScore = request.AttendancePunctualityScore;
            review.ProfessionalismScore = request.ProfessionalismScore;
            review.LearningDevelopmentScore = request.LearningDevelopmentScore;
            review.PolicyComplianceScore = request.PolicyComplianceScore;
            review.CustomerServiceScore = request.CustomerServiceScore;

            review.StrengthsComments = request.StrengthsComments;
            review.AreasForImprovementComments = request.AreasForImprovementComments;
            review.GoalsForNextPeriod = request.GoalsForNextPeriod;
            review.ReviewerComments = request.ReviewerComments;

            review.UpdatedAt = DateTime.UtcNow;
            review.UpdatedByUserId = currentUserId;

            // Recalculate weighted score
            review.WeightedScore = CalculateWeightedScore(review);

            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated scores for review {ReviewId}, weighted score: {WeightedScore}", reviewId, review.WeightedScore);

            return await MapToDto(review);
        }

        public async Task<double> CalculateWeightedScoreAsync(Guid reviewId, Guid tenantId)
        {
            var review = await _context.PerformanceReviews
                .FirstOrDefaultAsync(r => r.Id == reviewId && r.TenantId == tenantId && r.DeletedAt == null);

            if (review == null)
                throw new KeyNotFoundException($"Review {reviewId} not found");

            var weightedScore = CalculateWeightedScore(review);
            review.WeightedScore = weightedScore;
            review.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return weightedScore;
        }

        public async Task<PerformanceReviewDto> SubmitForApprovalAsync(Guid reviewId, SubmitForApprovalRequest request, Guid tenantId, Guid currentUserId)
        {
            var review = await _context.PerformanceReviews
                .FirstOrDefaultAsync(r => r.Id == reviewId && r.TenantId == tenantId && r.DeletedAt == null);

            if (review == null)
                throw new KeyNotFoundException($"Review {reviewId} not found");

            if (review.Status != ReviewStatus.Draft)
                throw new InvalidOperationException("Can only submit draft reviews");

            // Validate all scores are filled
            if (!review.QualityOfWorkScore.HasValue || !review.ProductivityScore.HasValue || !review.TechnicalSkillsScore.HasValue)
                throw new InvalidOperationException("All required scores must be filled before submission");

            review.Level1ApproverId = request.Level1ApproverId;
            review.Level2ApproverId = request.Level2ApproverId;
            review.Level3ApproverId = request.Level3ApproverId;

            review.Status = ReviewStatus.PendingLevel1;
            review.SubmittedAt = DateTime.UtcNow;
            review.UpdatedAt = DateTime.UtcNow;
            review.UpdatedByUserId = currentUserId;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Review {ReviewId} submitted for approval", reviewId);

            return await MapToDto(review);
        }

        public async Task<PerformanceReviewDto> ApproveReviewAsync(Guid reviewId, ApproveReviewRequest request, Guid tenantId, Guid currentUserId)
        {
            var review = await _context.PerformanceReviews
                .FirstOrDefaultAsync(r => r.Id == reviewId && r.TenantId == tenantId && r.DeletedAt == null);

            if (review == null)
                throw new KeyNotFoundException($"Review {reviewId} not found");

            var now = DateTime.UtcNow;

            switch (request.ApprovalLevel)
            {
                case 1:
                    if (review.Status != ReviewStatus.PendingLevel1)
                        throw new InvalidOperationException("Review is not pending Level 1 approval");

                    if (review.Level1ApproverId != currentUserId)
                        throw new UnauthorizedAccessException("You are not the Level 1 approver");

                    review.Level1ApprovedAt = now;
                    review.Level1Comments = request.Comments;

                    if (request.Approved)
                    {
                        review.Status = review.Level2ApproverId.HasValue ? ReviewStatus.PendingLevel2 : ReviewStatus.Approved;
                        if (!review.Level2ApproverId.HasValue)
                            review.ApprovedAt = now;
                    }
                    else
                    {
                        review.Status = ReviewStatus.Rejected;
                    }
                    break;

                case 2:
                    if (review.Status != ReviewStatus.PendingLevel2)
                        throw new InvalidOperationException("Review is not pending Level 2 approval");

                    if (review.Level2ApproverId != currentUserId)
                        throw new UnauthorizedAccessException("You are not the Level 2 approver");

                    review.Level2ApprovedAt = now;
                    review.Level2Comments = request.Comments;

                    if (request.Approved)
                    {
                        review.Status = review.Level3ApproverId.HasValue ? ReviewStatus.PendingLevel3 : ReviewStatus.Approved;
                        if (!review.Level3ApproverId.HasValue)
                            review.ApprovedAt = now;
                    }
                    else
                    {
                        review.Status = ReviewStatus.Rejected;
                    }
                    break;

                case 3:
                    if (review.Status != ReviewStatus.PendingLevel3)
                        throw new InvalidOperationException("Review is not pending Level 3 approval");

                    if (review.Level3ApproverId != currentUserId)
                        throw new UnauthorizedAccessException("You are not the Level 3 approver");

                    review.Level3ApprovedAt = now;
                    review.Level3Comments = request.Comments;

                    if (request.Approved)
                    {
                        review.Status = ReviewStatus.Approved;
                        review.ApprovedAt = now;
                    }
                    else
                    {
                        review.Status = ReviewStatus.Rejected;
                    }
                    break;

                default:
                    throw new ArgumentException("Invalid approval level. Must be 1, 2, or 3");
            }

            review.UpdatedAt = now;
            review.UpdatedByUserId = currentUserId;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Review {ReviewId} Level {Level} approval: {Approved}", reviewId, request.ApprovalLevel, request.Approved);

            return await MapToDto(review);
        }

        public async Task<PerformanceReviewDto> CompleteProbationAsync(Guid reviewId, CompleteProbationRequest request, Guid tenantId, Guid currentUserId)
        {
            var review = await _context.PerformanceReviews
                .FirstOrDefaultAsync(r => r.Id == reviewId && r.TenantId == tenantId && r.DeletedAt == null);

            if (review == null)
                throw new KeyNotFoundException($"Review {reviewId} not found");

            if (review.ReviewType != ReviewType.Probation)
                throw new InvalidOperationException("This is not a probation review");

            if (review.Status != ReviewStatus.Approved)
                throw new InvalidOperationException("Review must be approved before completing probation");

            review.ProbationDecision = request.Decision;
            review.ProbationExtensionDate = request.ExtensionDate;
            review.ProbationNotes = request.Notes;
            review.UpdatedAt = DateTime.UtcNow;
            review.UpdatedByUserId = currentUserId;

            // Update employee probation status
            var employee = await _context.Employees
                .FirstOrDefaultAsync(e => e.Id == review.EmployeeId && e.TenantId == tenantId);

            if (employee != null)
            {
                var probationTracking = await _context.ProbationTrackings
                    .FirstOrDefaultAsync(p => p.EmployeeId == employee.Id && p.TenantId == tenantId);

                if (probationTracking != null)
                {
                    switch (request.Decision)
                    {
                        case ProbationDecision.Confirmed:
                            probationTracking.ProbationStatus = "confirmed";
                            probationTracking.ConfirmationDate = DateTime.UtcNow.Date;
                            break;
                        case ProbationDecision.Extended:
                            probationTracking.ProbationStatus = "extended";
                            probationTracking.ProbationEndDate = request.ExtensionDate ?? probationTracking.ProbationEndDate;
                            break;
                        case ProbationDecision.Terminated:
                            probationTracking.ProbationStatus = "terminated";
                            probationTracking.ConfirmationDate = DateTime.UtcNow.Date;
                            break;
                    }

                    probationTracking.UpdatedAt = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Completed probation for review {ReviewId} with decision: {Decision}", reviewId, request.Decision);

            return await MapToDto(review);
        }

        public async Task<ReviewStatisticsDto> GetReviewStatisticsAsync(Guid tenantId)
        {
            var reviews = await _context.PerformanceReviews
                .Where(r => r.TenantId == tenantId && r.DeletedAt == null)
                .ToListAsync();

            var now = DateTime.UtcNow.Date;

            var stats = new ReviewStatisticsDto
            {
                TotalReviews = reviews.Count,
                PendingReviews = reviews.Count(r => r.Status == ReviewStatus.Draft ||
                                                    r.Status == ReviewStatus.PendingLevel1 ||
                                                    r.Status == ReviewStatus.PendingLevel2 ||
                                                    r.Status == ReviewStatus.PendingLevel3),
                CompletedReviews = reviews.Count(r => r.Status == ReviewStatus.Approved),
                OverdueReviews = reviews.Count(r => r.ReviewPeriodEnd < now && r.Status == ReviewStatus.Draft),
                AverageWeightedScore = reviews.Where(r => r.WeightedScore.HasValue)
                                              .Select(r => r.WeightedScore!.Value)
                                              .DefaultIfEmpty(0)
                                              .Average(),
                ReviewsByType = reviews.GroupBy(r => r.ReviewType)
                                      .ToDictionary(g => g.Key, g => g.Count()),
                ReviewsByStatus = reviews.GroupBy(r => r.Status)
                                        .ToDictionary(g => g.Key, g => g.Count())
            };

            var recentReviews = await _context.PerformanceReviews
                .Where(r => r.TenantId == tenantId && r.DeletedAt == null)
                .OrderByDescending(r => r.CreatedAt)
                .Take(10)
                .ToListAsync();

            foreach (var review in recentReviews)
            {
                stats.RecentReviews.Add(await MapToDto(review));
            }

            return stats;
        }

        public async Task<bool> DeleteReviewAsync(Guid reviewId, Guid tenantId, Guid currentUserId)
        {
            var review = await _context.PerformanceReviews
                .FirstOrDefaultAsync(r => r.Id == reviewId && r.TenantId == tenantId && r.DeletedAt == null);

            if (review == null)
                return false;

            if (review.Status == ReviewStatus.Approved)
                throw new InvalidOperationException("Cannot delete approved reviews");

            review.DeletedAt = DateTime.UtcNow;
            review.UpdatedAt = DateTime.UtcNow;
            review.UpdatedByUserId = currentUserId;
            review.Status_Audit = "deleted";

            await _context.SaveChangesAsync();

            _logger.LogInformation("Deleted review {ReviewId}", reviewId);

            return true;
        }

        // Private helpers
        private double CalculateWeightedScore(PerformanceReview review)
        {
            var scores = new Dictionary<string, int?>
            {
                { "QualityOfWork", review.QualityOfWorkScore },
                { "Productivity", review.ProductivityScore },
                { "TechnicalSkills", review.TechnicalSkillsScore },
                { "Communication", review.CommunicationScore },
                { "Teamwork", review.TeamworkScore },
                { "Initiative", review.InitiativeScore },
                { "ProblemSolving", review.ProblemSolvingScore },
                { "Adaptability", review.AdaptabilityScore },
                { "AttendancePunctuality", review.AttendancePunctualityScore },
                { "Professionalism", review.ProfessionalismScore },
                { "LearningDevelopment", review.LearningDevelopmentScore },
                { "PolicyCompliance", review.PolicyComplianceScore },
                { "CustomerService", review.CustomerServiceScore }
            };

            double totalWeightedScore = 0;
            double totalWeight = 0;

            foreach (var criterion in scores)
            {
                if (criterion.Value.HasValue && _criteriaWeights.ContainsKey(criterion.Key))
                {
                    totalWeightedScore += criterion.Value.Value * _criteriaWeights[criterion.Key];
                    totalWeight += _criteriaWeights[criterion.Key];
                }
            }

            return totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
        }

        private async Task<PerformanceReviewDto> MapToDto(PerformanceReview review)
        {
            var employee = await _context.Employees
                .Include(e => e.User)
                .FirstOrDefaultAsync(e => e.Id == review.EmployeeId);

            var reviewer = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == review.ReviewerId);

            var dto = new PerformanceReviewDto
            {
                Id = review.Id,
                EmployeeId = review.EmployeeId,
                EmployeeName = $"{employee?.User?.FirstName} {employee?.User?.LastName}",
                ReviewerId = review.ReviewerId,
                ReviewerName = $"{reviewer?.FirstName} {reviewer?.LastName}",
                ReviewType = review.ReviewType,
                Status = review.Status,
                ReviewPeriodStart = review.ReviewPeriodStart,
                ReviewPeriodEnd = review.ReviewPeriodEnd,
                WeightedScore = review.WeightedScore,
                Scores = new Dictionary<string, int?>
                {
                    { "QualityOfWork", review.QualityOfWorkScore },
                    { "Productivity", review.ProductivityScore },
                    { "TechnicalSkills", review.TechnicalSkillsScore },
                    { "Communication", review.CommunicationScore },
                    { "Teamwork", review.TeamworkScore },
                    { "Initiative", review.InitiativeScore },
                    { "ProblemSolving", review.ProblemSolvingScore },
                    { "Adaptability", review.AdaptabilityScore },
                    { "AttendancePunctuality", review.AttendancePunctualityScore },
                    { "Professionalism", review.ProfessionalismScore },
                    { "LearningDevelopment", review.LearningDevelopmentScore },
                    { "PolicyCompliance", review.PolicyComplianceScore },
                    { "CustomerService", review.CustomerServiceScore }
                },
                StrengthsComments = review.StrengthsComments,
                AreasForImprovementComments = review.AreasForImprovementComments,
                GoalsForNextPeriod = review.GoalsForNextPeriod,
                ReviewerComments = review.ReviewerComments,
                EmployeeComments = review.EmployeeComments,
                ProbationDecision = review.ProbationDecision,
                ProbationExtensionDate = review.ProbationExtensionDate,
                CreatedAt = review.CreatedAt,
                SubmittedAt = review.SubmittedAt,
                ApprovedAt = review.ApprovedAt
            };

            // Build approval chain
            if (review.Level1ApproverId.HasValue)
            {
                var level1Approver = await _context.Users.FirstOrDefaultAsync(u => u.Id == review.Level1ApproverId);
                dto.ApprovalChain.Add(new ApprovalStepDto
                {
                    Level = 1,
                    ApproverId = review.Level1ApproverId,
                    ApproverName = $"{level1Approver?.FirstName} {level1Approver?.LastName}",
                    ApprovedAt = review.Level1ApprovedAt,
                    Comments = review.Level1Comments,
                    Status = review.Level1ApprovedAt.HasValue ? "Approved" : "Pending"
                });
            }

            if (review.Level2ApproverId.HasValue)
            {
                var level2Approver = await _context.Users.FirstOrDefaultAsync(u => u.Id == review.Level2ApproverId);
                dto.ApprovalChain.Add(new ApprovalStepDto
                {
                    Level = 2,
                    ApproverId = review.Level2ApproverId,
                    ApproverName = $"{level2Approver?.FirstName} {level2Approver?.LastName}",
                    ApprovedAt = review.Level2ApprovedAt,
                    Comments = review.Level2Comments,
                    Status = review.Level2ApprovedAt.HasValue ? "Approved" : "Pending"
                });
            }

            if (review.Level3ApproverId.HasValue)
            {
                var level3Approver = await _context.Users.FirstOrDefaultAsync(u => u.Id == review.Level3ApproverId);
                dto.ApprovalChain.Add(new ApprovalStepDto
                {
                    Level = 3,
                    ApproverId = review.Level3ApproverId,
                    ApproverName = $"{level3Approver?.FirstName} {level3Approver?.LastName}",
                    ApprovedAt = review.Level3ApprovedAt,
                    Comments = review.Level3Comments,
                    Status = review.Level3ApprovedAt.HasValue ? "Approved" : "Pending"
                });
            }

            return dto;
        }
    }
}
