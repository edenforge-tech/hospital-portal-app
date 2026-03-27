using Xunit;
using FluentAssertions;
using System.Net;
using System.Threading.Tasks;
using System.Net.Http;
using AuthService.IntegrationTests.Helpers;

namespace AuthService.IntegrationTests.Endpoints
{
    public class PerformanceReviewEndpointsTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;
        private readonly IntegrationTestHelper _helper;

        public PerformanceReviewEndpointsTests(CustomWebApplicationFactory factory)
        {
            _client = factory.CreateClient();
            _helper = new IntegrationTestHelper(_client);
        }

        [Fact]
        public async Task CreateReview_WithValidData_Returns201Created()
        {
            // Arrange
            await _helper.AuthenticateAsync();
            
            var reviewRequest = new
            {
                EmployeeId = "employee-123",
                ReviewerId = "reviewer-456",
                ReviewPeriodStart = "2025-07-01",
                ReviewPeriodEnd = "2025-12-31",
                ReviewType = "Annual"
            };

            // Act
            var response = await _helper.PostAsync("/api/PerformanceReview", reviewRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Created);
            response.Headers.Location.Should().NotBeNull();
        }

        [Fact]
        public async Task CreateReview_WithoutAuthentication_Returns401Unauthorized()
        {
            // Arrange
            _helper.ClearAuthHeaders();
            
            var reviewRequest = new
            {
                EmployeeId = "employee-123",
                ReviewerId = "reviewer-456",
                ReviewPeriodStart = "2025-07-01",
                ReviewPeriodEnd = "2025-12-31",
                ReviewType = "Annual"
            };

            // Act
            var response = await _helper.PostAsync("/api/PerformanceReview", reviewRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task GetReview_WithValidId_Returns200OK()
        {
            // Arrange
            await _helper.AuthenticateAsync();
            
            // Create a review first
            var createRequest = new
            {
                EmployeeId = "employee-123",
                ReviewerId = "reviewer-456",
                ReviewPeriodStart = "2025-07-01",
                ReviewPeriodEnd = "2025-12-31",
                ReviewType = "Annual"
            };
            
            var createResponse = await _helper.PostAsync("/api/PerformanceReview", createRequest);
            var location = createResponse.Headers.Location;

            // Act
            var response = await _helper.GetAsync(location.ToString());

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var content = await response.Content.ReadAsStringAsync();
            content.Should().Contain("employee-123");
        }

        [Fact]
        public async Task GetReview_WithInvalidId_Returns404NotFound()
        {
            // Arrange
            await _helper.AuthenticateAsync();
            var invalidId = "00000000-0000-0000-0000-000000000000";

            // Act
            var response = await _helper.GetAsync($"/api/PerformanceReview/{invalidId}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task UpdateScores_WithValidScores_Returns200OK()
        {
            // Arrange
            await _helper.AuthenticateAsync();
            
            // Create a review first
            var createRequest = new
            {
                EmployeeId = "employee-123",
                ReviewerId = "reviewer-456",
                ReviewPeriodStart = "2025-07-01",
                ReviewPeriodEnd = "2025-12-31",
                ReviewType = "Annual"
            };
            
            var createResponse = await _helper.PostAsync("/api/PerformanceReview", createRequest);
            var location = createResponse.Headers.Location;
            var reviewId = location.Segments[^1];

            var updateScoresRequest = new
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
            var response = await _helper.PutAsync($"/api/PerformanceReview/{reviewId}/scores", updateScoresRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task SubmitForApproval_WithAllScoresFilled_Returns200OK()
        {
            // Arrange
            await _helper.AuthenticateAsync();
            
            // Create review
            var createRequest = new
            {
                EmployeeId = "employee-123",
                ReviewerId = "reviewer-456",
                ReviewPeriodStart = "2025-07-01",
                ReviewPeriodEnd = "2025-12-31",
                ReviewType = "Annual"
            };
            
            var createResponse = await _helper.PostAsync("/api/PerformanceReview", createRequest);
            var location = createResponse.Headers.Location;
            var reviewId = location.Segments[^1];

            // Update scores
            var updateScoresRequest = new
            {
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
            await _helper.PutAsync($"/api/PerformanceReview/{reviewId}/scores", updateScoresRequest);

            // Submit for approval
            var submitRequest = new
            {
                Level1ApproverId = "approver1-123",
                Level2ApproverId = "approver2-456",
                Level3ApproverId = "approver3-789"
            };

            // Act
            var response = await _helper.PostAsync($"/api/PerformanceReview/{reviewId}/submit", submitRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task SubmitForApproval_WithMissingScores_Returns400BadRequest()
        {
            // Arrange
            await _helper.AuthenticateAsync();
            
            var createRequest = new
            {
                EmployeeId = "employee-123",
                ReviewerId = "reviewer-456",
                ReviewPeriodStart = "2025-07-01",
                ReviewPeriodEnd = "2025-12-31",
                ReviewType = "Annual"
            };
            
            var createResponse = await _helper.PostAsync("/api/PerformanceReview", createRequest);
            var location = createResponse.Headers.Location;
            var reviewId = location.Segments[^1];

            var submitRequest = new
            {
                Level1ApproverId = "approver1-123",
                Level2ApproverId = "approver2-456",
                Level3ApproverId = "approver3-789"
            };

            // Act (submit without filling scores)
            var response = await _helper.PostAsync($"/api/PerformanceReview/{reviewId}/submit", submitRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task GetStatistics_Returns200WithStatistics()
        {
            // Arrange
            await _helper.AuthenticateAsync();

            // Act
            var response = await _helper.GetAsync("/api/PerformanceReview/statistics");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var content = await response.Content.ReadAsStringAsync();
            content.Should().Contain("totalReviews");
        }

        [Fact]
        public async Task DeleteReview_WithValidId_Returns200OK()
        {
            // Arrange
            await _helper.AuthenticateAsync();
            
            var createRequest = new
            {
                EmployeeId = "employee-123",
                ReviewerId = "reviewer-456",
                ReviewPeriodStart = "2025-07-01",
                ReviewPeriodEnd = "2025-12-31",
                ReviewType = "Annual"
            };
            
            var createResponse = await _helper.PostAsync("/api/PerformanceReview", createRequest);
            var location = createResponse.Headers.Location;
            var reviewId = location.Segments[^1];

            // Act
            var response = await _helper.DeleteAsync($"/api/PerformanceReview/{reviewId}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task TenantIsolation_CannotAccessOtherTenantReview()
        {
            // Arrange
            await _helper.AuthenticateAsync();
            var originalTenantId = _helper.TenantId;
            
            // Create review in original tenant
            var createRequest = new
            {
                EmployeeId = "employee-123",
                ReviewerId = "reviewer-456",
                ReviewPeriodStart = "2025-07-01",
                ReviewPeriodEnd = "2025-12-31",
                ReviewType = "Annual"
            };
            
            var createResponse = await _helper.PostAsync("/api/PerformanceReview", createRequest);
            var location = createResponse.Headers.Location;

            // Change tenant ID
            var differentTenantId = "different-tenant-id";
            _helper.SetTenantHeader(differentTenantId);

            // Act - Try to access review from different tenant
            var response = await _helper.GetAsync(location.ToString());

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }
    }
}
