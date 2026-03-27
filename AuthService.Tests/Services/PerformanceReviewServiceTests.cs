using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using AuthService.Data;
using AuthService.Services;
using AuthService.Models.PerformanceReview;
using AuthService.Models.Employee;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace AuthService.Tests.Services
{
    public class PerformanceReviewServiceTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly PerformanceReviewService _service;
        private readonly string _testTenantId;

        public PerformanceReviewServiceTests()
        {
            // Setup in-memory database
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);
            _service = new PerformanceReviewService(_context);
            _testTenantId = Guid.NewGuid().ToString();
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task CreateReviewAsync_ValidRequest_CreatesReviewInDraftStatus()
        {
            // Arrange
            var request = new CreatePerformanceReviewRequest
            {
                EmployeeId = Guid.NewGuid().ToString(),
                ReviewerId = Guid.NewGuid().ToString(),
                ReviewPeriodStart = DateTime.UtcNow.AddMonths(-6),
                ReviewPeriodEnd = DateTime.UtcNow,
                ReviewType = ReviewType.Annual
            };

            // Act
            var result = await _service.CreateReviewAsync(request, _testTenantId);

            // Assert
            result.Should().NotBeNull();
            result.Status.Should().Be(ReviewStatus.Draft);
            result.EmployeeId.Should().Be(request.EmployeeId);
            result.ReviewType.Should().Be(ReviewType.Annual);
        }

        [Fact]
        public async Task CalculateWeightedScore_AllCriteriaProvided_ReturnsCorrectWeightedAverage()
        {
            // Arrange
            var review = new PerformanceReview
            {
                Id = Guid.NewGuid().ToString(),
                TenantId = _testTenantId,
                EmployeeId = Guid.NewGuid().ToString(),
                ReviewerId = Guid.NewGuid().ToString(),
                ReviewPeriodStart = DateTime.UtcNow.AddMonths(-6),
                ReviewPeriodEnd = DateTime.UtcNow,
                ReviewType = ReviewType.Annual,
                Status = ReviewStatus.Draft,
                // All scores set to 4 (out of 5)
                QualityOfWorkScore = 4,
                ProductivityScore = 4,
                TechnicalSkillsScore = 4,
                CommunicationScore = 4,
                TeamworkScore = 4,
                InitiativeScore = 4,
                ProblemSolvingScore = 4,
                AdaptabilityScore = 4,
                AttendancePunctualityScore = 4,
                ProfessionalismScore = 4,
                LearningDevelopmentScore = 4,
                PolicyComplianceScore = 4,
                CustomerServiceScore = 4
            };

            _context.PerformanceReviews.Add(review);
            await _context.SaveChangesAsync();

            // Act
            var weightedScore = await _service.CalculateWeightedScoreAsync(review.Id, _testTenantId);

            // Assert
            // Expected: 4.0 (all scores are 4, weighted average should be 4)
            weightedScore.Should().BeApproximately(4.0, 0.01);
        }

        [Fact]
        public async Task CalculateWeightedScore_MixedScores_ReturnsCorrectWeightedAverage()
        {
            // Arrange
            var review = new PerformanceReview
            {
                Id = Guid.NewGuid().ToString(),
                TenantId = _testTenantId,
                EmployeeId = Guid.NewGuid().ToString(),
                ReviewerId = Guid.NewGuid().ToString(),
                ReviewPeriodStart = DateTime.UtcNow.AddMonths(-6),
                ReviewPeriodEnd = DateTime.UtcNow,
                ReviewType = ReviewType.Annual,
                Status = ReviewStatus.Draft,
                // Quality (15%) = 5, Productivity (10%) = 3, rest = 4
                QualityOfWorkScore = 5,
                ProductivityScore = 3,
                TechnicalSkillsScore = 4,
                CommunicationScore = 4,
                TeamworkScore = 4,
                InitiativeScore = 4,
                ProblemSolvingScore = 4,
                AdaptabilityScore = 4,
                AttendancePunctualityScore = 4,
                ProfessionalismScore = 4,
                LearningDevelopmentScore = 4,
                PolicyComplianceScore = 4,
                CustomerServiceScore = 4
            };

            _context.PerformanceReviews.Add(review);
            await _context.SaveChangesAsync();

            // Act
            var weightedScore = await _service.CalculateWeightedScoreAsync(review.Id, _testTenantId);

            // Assert
            // Expected calculation:
            // Quality: 5 * 0.15 = 0.75
            // Productivity: 3 * 0.10 = 0.30
            // Others (85% total): ~3.4 (simplified)
            // Total should be around 4.05
            weightedScore.Should().BeGreaterThan(4.0);
            weightedScore.Should().BeLessThan(4.2);
        }

        [Fact]
        public async Task UpdateReviewScoresAsync_ValidScores_UpdatesAndRecalculatesWeightedScore()
        {
            // Arrange
            var review = await CreateTestReview(ReviewStatus.Draft);
            var updateRequest = new UpdateReviewScoresRequest
            {
                QualityOfWorkScore = 5,
                ProductivityScore = 4,
                TechnicalSkillsScore = 4,
                CommunicationScore = 5,
                TeamworkScore = 4,
                InitiativeScore = 3,
                ProblemSolvingScore = 4,
                AdaptabilityScore = 4,
                AttendancePunctualityScore = 5,
                ProfessionalismScore = 4,
                LearningDevelopmentScore = 4,
                PolicyComplianceScore = 5,
                CustomerServiceScore = 4
            };

            // Act
            var result = await _service.UpdateReviewScoresAsync(review.Id, updateRequest, _testTenantId);

            // Assert
            result.Should().NotBeNull();
            result.QualityOfWorkScore.Should().Be(5);
            result.ProductivityScore.Should().Be(4);
            result.WeightedScore.Should().BeGreaterThan(0);
        }

        [Fact]
        public async Task SubmitForApprovalAsync_AllScoresFilled_ChangesStatusToPendingLevel1()
        {
            // Arrange
            var review = await CreateTestReview(ReviewStatus.Draft);
            await SetAllScores(review.Id);

            var submitRequest = new SubmitForApprovalRequest
            {
                Level1ApproverId = Guid.NewGuid().ToString(),
                Level2ApproverId = Guid.NewGuid().ToString(),
                Level3ApproverId = Guid.NewGuid().ToString()
            };

            // Act
            var result = await _service.SubmitForApprovalAsync(review.Id, submitRequest, _testTenantId);

            // Assert
            result.Should().NotBeNull();
            result.Status.Should().Be(ReviewStatus.PendingLevel1);
            result.Level1ApproverId.Should().Be(submitRequest.Level1ApproverId);
        }

        [Fact]
        public async Task SubmitForApprovalAsync_MissingScores_ThrowsInvalidOperationException()
        {
            // Arrange
            var review = await CreateTestReview(ReviewStatus.Draft);
            // Don't set all scores

            var submitRequest = new SubmitForApprovalRequest
            {
                Level1ApproverId = Guid.NewGuid().ToString(),
                Level2ApproverId = Guid.NewGuid().ToString(),
                Level3ApproverId = Guid.NewGuid().ToString()
            };

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(
                () => _service.SubmitForApprovalAsync(review.Id, submitRequest, _testTenantId)
            );
        }

        [Fact]
        public async Task ApproveReviewAsync_Level1Approval_ChangesStatusToPendingLevel2()
        {
            // Arrange
            var level1ApproverId = Guid.NewGuid().ToString();
            var review = await CreateTestReview(ReviewStatus.PendingLevel1, level1ApproverId);

            var approveRequest = new ApproveReviewRequest
            {
                Level = 1,
                Approved = true,
                Comments = "Good performance"
            };

            // Act
            var result = await _service.ApproveReviewAsync(review.Id, approveRequest, level1ApproverId, _testTenantId);

            // Assert
            result.Should().NotBeNull();
            result.Status.Should().Be(ReviewStatus.PendingLevel2);
            result.Level1Comments.Should().Be("Good performance");
            result.Level1ApprovedAt.Should().NotBeNull();
        }

        [Fact]
        public async Task ApproveReviewAsync_Level1Rejection_ChangesStatusToRejected()
        {
            // Arrange
            var level1ApproverId = Guid.NewGuid().ToString();
            var review = await CreateTestReview(ReviewStatus.PendingLevel1, level1ApproverId);

            var approveRequest = new ApproveReviewRequest
            {
                Level = 1,
                Approved = false,
                Comments = "Needs improvement"
            };

            // Act
            var result = await _service.ApproveReviewAsync(review.Id, approveRequest, level1ApproverId, _testTenantId);

            // Assert
            result.Should().NotBeNull();
            result.Status.Should().Be(ReviewStatus.Rejected);
            result.Level1Comments.Should().Be("Needs improvement");
        }

        [Fact]
        public async Task ApproveReviewAsync_WrongApprover_ThrowsUnauthorizedAccessException()
        {
            // Arrange
            var level1ApproverId = Guid.NewGuid().ToString();
            var wrongApproverId = Guid.NewGuid().ToString();
            var review = await CreateTestReview(ReviewStatus.PendingLevel1, level1ApproverId);

            var approveRequest = new ApproveReviewRequest
            {
                Level = 1,
                Approved = true,
                Comments = "Good"
            };

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedAccessException>(
                () => _service.ApproveReviewAsync(review.Id, approveRequest, wrongApproverId, _testTenantId)
            );
        }

        [Fact]
        public async Task ApproveReviewAsync_Level3Approval_ChangesStatusToApproved()
        {
            // Arrange
            var level3ApproverId = Guid.NewGuid().ToString();
            var review = await CreateTestReview(ReviewStatus.PendingLevel3, null, null, level3ApproverId);

            var approveRequest = new ApproveReviewRequest
            {
                Level = 3,
                Approved = true,
                Comments = "Final approval granted"
            };

            // Act
            var result = await _service.ApproveReviewAsync(review.Id, approveRequest, level3ApproverId, _testTenantId);

            // Assert
            result.Should().NotBeNull();
            result.Status.Should().Be(ReviewStatus.Approved);
            result.Level3Comments.Should().Be("Final approval granted");
            result.ApprovedAt.Should().NotBeNull();
        }

        [Fact]
        public async Task CompleteProbationAsync_ConfirmedDecision_UpdatesProbationTracking()
        {
            // Arrange
            var employeeId = Guid.NewGuid().ToString();
            var review = await CreateTestReview(ReviewStatus.Approved, reviewType: ReviewType.Probation, employeeId: employeeId);

            var probationTracking = new ProbationTracking
            {
                Id = Guid.NewGuid().ToString(),
                TenantId = _testTenantId,
                EmployeeId = employeeId,
                ProbationStartDate = DateTime.UtcNow.AddMonths(-3),
                ProbationEndDate = DateTime.UtcNow,
                ProbationStatus = "InProgress"
            };
            _context.ProbationTrackings.Add(probationTracking);
            await _context.SaveChangesAsync();

            var completeProbationRequest = new CompleteProbationRequest
            {
                Decision = ProbationDecision.Confirmed,
                Notes = "Employee confirmed after successful probation"
            };

            // Act
            var result = await _service.CompleteProbationAsync(review.Id, completeProbationRequest, _testTenantId);

            // Assert
            result.Should().NotBeNull();
            result.ProbationDecision.Should().Be(ProbationDecision.Confirmed);
            
            var updatedTracking = await _context.ProbationTrackings.FindAsync(probationTracking.Id);
            updatedTracking.ConfirmationDate.Should().NotBeNull();
            updatedTracking.ProbationStatus.Should().Be("Confirmed");
        }

        [Fact]
        public async Task CompleteProbationAsync_ExtendedDecision_UpdatesProbationEndDate()
        {
            // Arrange
            var employeeId = Guid.NewGuid().ToString();
            var review = await CreateTestReview(ReviewStatus.Approved, reviewType: ReviewType.Probation, employeeId: employeeId);

            var probationTracking = new ProbationTracking
            {
                Id = Guid.NewGuid().ToString(),
                TenantId = _testTenantId,
                EmployeeId = employeeId,
                ProbationStartDate = DateTime.UtcNow.AddMonths(-3),
                ProbationEndDate = DateTime.UtcNow,
                ProbationStatus = "InProgress"
            };
            _context.ProbationTrackings.Add(probationTracking);
            await _context.SaveChangesAsync();

            var newEndDate = DateTime.UtcNow.AddMonths(2);
            var completeProbationRequest = new CompleteProbationRequest
            {
                Decision = ProbationDecision.Extended,
                ExtensionDate = newEndDate,
                Notes = "Probation extended for 2 months"
            };

            // Act
            var result = await _service.CompleteProbationAsync(review.Id, completeProbationRequest, _testTenantId);

            // Assert
            result.Should().NotBeNull();
            result.ProbationDecision.Should().Be(ProbationDecision.Extended);
            result.ProbationExtensionDate.Should().Be(newEndDate);
            
            var updatedTracking = await _context.ProbationTrackings.FindAsync(probationTracking.Id);
            updatedTracking.ProbationEndDate.Should().Be(newEndDate);
            updatedTracking.ProbationStatus.Should().Be("Extended");
        }

        // Helper methods
        private async Task<PerformanceReview> CreateTestReview(
            ReviewStatus status,
            string level1ApproverId = null,
            string level2ApproverId = null,
            string level3ApproverId = null,
            ReviewType reviewType = ReviewType.Annual,
            string employeeId = null)
        {
            var review = new PerformanceReview
            {
                Id = Guid.NewGuid().ToString(),
                TenantId = _testTenantId,
                EmployeeId = employeeId ?? Guid.NewGuid().ToString(),
                ReviewerId = Guid.NewGuid().ToString(),
                ReviewPeriodStart = DateTime.UtcNow.AddMonths(-6),
                ReviewPeriodEnd = DateTime.UtcNow,
                ReviewType = reviewType,
                Status = status,
                Level1ApproverId = level1ApproverId,
                Level2ApproverId = level2ApproverId,
                Level3ApproverId = level3ApproverId
            };

            _context.PerformanceReviews.Add(review);
            await _context.SaveChangesAsync();
            return review;
        }

        private async Task SetAllScores(string reviewId)
        {
            var review = await _context.PerformanceReviews.FindAsync(reviewId);
            review.QualityOfWorkScore = 4;
            review.ProductivityScore = 4;
            review.TechnicalSkillsScore = 4;
            review.CommunicationScore = 4;
            review.TeamworkScore = 4;
            review.InitiativeScore = 4;
            review.ProblemSolvingScore = 4;
            review.AdaptabilityScore = 4;
            review.AttendancePunctualityScore = 4;
            review.ProfessionalismScore = 4;
            review.LearningDevelopmentScore = 4;
            review.PolicyComplianceScore = 4;
            review.CustomerServiceScore = 4;
            await _context.SaveChangesAsync();
        }
    }
}
