using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using AuthService.Data;
using AuthService.Services;
using AuthService.Models.Training;
using System;
using System.Threading.Tasks;
using System.Linq;

namespace AuthService.Tests.Services
{
    public class TrainingManagementServiceTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly TrainingManagementService _service;
        private readonly string _testTenantId;
        private readonly string _testUserId;

        public TrainingManagementServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);
            _service = new TrainingManagementService(_context);
            _testTenantId = Guid.NewGuid().ToString();
            _testUserId = Guid.NewGuid().ToString();
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task AssignTrainingAsync_ValidRequest_CreatesAssignmentSuccessfully()
        {
            // Arrange
            var course = await CreateTestCourse(isMandatory: true);
            var request = new AssignTrainingRequest
            {
                UserId = _testUserId,
                CourseId = course.Id,
                DueDate = DateTime.UtcNow.AddDays(30)
            };

            // Act
            var result = await _service.AssignTrainingAsync(request, _testUserId, _testTenantId);

            // Assert
            result.Should().NotBeNull();
            result.UserId.Should().Be(_testUserId);
            result.CourseId.Should().Be(course.Id);
            result.TrainingStatus.Should().Be(TrainingStatus.NotStarted);
        }

        [Fact]
        public async Task AssignTrainingAsync_DuplicateActiveAssignment_ThrowsInvalidOperationException()
        {
            // Arrange
            var course = await CreateTestCourse(isMandatory: true);
            var assignment = new TrainingAssignment
            {
                Id = Guid.NewGuid().ToString(),
                TenantId = _testTenantId,
                UserId = _testUserId,
                CourseId = course.Id,
                AssignedDate = DateTime.UtcNow,
                DueDate = DateTime.UtcNow.AddDays(30),
                TrainingStatus = TrainingStatus.InProgress
            };
            _context.TrainingAssignments.Add(assignment);
            await _context.SaveChangesAsync();

            var request = new AssignTrainingRequest
            {
                UserId = _testUserId,
                CourseId = course.Id,
                DueDate = DateTime.UtcNow.AddDays(30)
            };

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(
                () => _service.AssignTrainingAsync(request, _testUserId, _testTenantId)
            );
        }

        [Fact]
        public async Task RecordCompletionAsync_ValidityPeriodDaysSet_CalculatesExpiryDate()
        {
            // Arrange
            var course = await CreateTestCourse(isMandatory: true, validityPeriodDays: 365);
            var assignment = await CreateTestAssignment(_testUserId, course.Id);
            var completionDate = DateTime.UtcNow;

            var request = new RecordCompletionRequest
            {
                CompletionDate = completionDate,
                CompletionCertificateUrl = "https://example.com/cert.pdf"
            };

            // Act
            var result = await _service.RecordCompletionAsync(assignment.Id, request, _testTenantId);

            // Assert
            result.Should().NotBeNull();
            result.TrainingStatus.Should().Be(TrainingStatus.Completed);
            result.ExpiryDate.Should().NotBeNull();
            result.ExpiryDate.Value.Date.Should().Be(completionDate.AddDays(365).Date);
        }

        [Fact]
        public async Task RecordCompletionAsync_ValidityPeriodDaysZero_DoesNotSetExpiryDate()
        {
            // Arrange
            var course = await CreateTestCourse(isMandatory: true, validityPeriodDays: 0);
            var assignment = await CreateTestAssignment(_testUserId, course.Id);

            var request = new RecordCompletionRequest
            {
                CompletionDate = DateTime.UtcNow,
                CompletionCertificateUrl = "https://example.com/cert.pdf"
            };

            // Act
            var result = await _service.RecordCompletionAsync(assignment.Id, request, _testTenantId);

            // Assert
            result.Should().NotBeNull();
            result.TrainingStatus.Should().Be(TrainingStatus.Completed);
            result.ExpiryDate.Should().BeNull();
        }

        [Fact]
        public async Task GetUserComplianceReportAsync_AllMandatoryCompleted_Returns100PercentCompliance()
        {
            // Arrange
            var course1 = await CreateTestCourse(isMandatory: true);
            var course2 = await CreateTestCourse(isMandatory: true, courseName: "Course 2");
            var assignment1 = await CreateTestAssignment(_testUserId, course1.Id, TrainingStatus.Completed);
            var assignment2 = await CreateTestAssignment(_testUserId, course2.Id, TrainingStatus.Completed);

            // Act
            var result = await _service.GetUserComplianceReportAsync(_testUserId, _testTenantId);

            // Assert
            result.Should().NotBeNull();
            result.CompliancePercentage.Should().Be(100);
            result.IsCompliant.Should().BeTrue();
            result.TotalAssignments.Should().Be(2);
            result.CompletedAssignments.Should().Be(2);
        }

        [Fact]
        public async Task GetUserComplianceReportAsync_SomeMandatoryIncomplete_ReturnsCorrectPercentage()
        {
            // Arrange
            var course1 = await CreateTestCourse(isMandatory: true);
            var course2 = await CreateTestCourse(isMandatory: true, courseName: "Course 2");
            var course3 = await CreateTestCourse(isMandatory: true, courseName: "Course 3");
            var assignment1 = await CreateTestAssignment(_testUserId, course1.Id, TrainingStatus.Completed);
            var assignment2 = await CreateTestAssignment(_testUserId, course2.Id, TrainingStatus.InProgress);
            var assignment3 = await CreateTestAssignment(_testUserId, course3.Id, TrainingStatus.NotStarted);

            // Act
            var result = await _service.GetUserComplianceReportAsync(_testUserId, _testTenantId);

            // Assert
            result.Should().NotBeNull();
            result.CompliancePercentage.Should().BeApproximately(33.33, 0.1); // 1 out of 3
            result.IsCompliant.Should().BeFalse();
            result.TotalAssignments.Should().Be(3);
            result.CompletedAssignments.Should().Be(1);
        }

        [Fact]
        public async Task GetUserComplianceReportAsync_OverdueTraining_IdentifiesOverdueAssignments()
        {
            // Arrange
            var course = await CreateTestCourse(isMandatory: true);
            var assignment = new TrainingAssignment
            {
                Id = Guid.NewGuid().ToString(),
                TenantId = _testTenantId,
                UserId = _testUserId,
                CourseId = course.Id,
                AssignedDate = DateTime.UtcNow.AddDays(-60),
                DueDate = DateTime.UtcNow.AddDays(-5), // Overdue
                TrainingStatus = TrainingStatus.InProgress
            };
            _context.TrainingAssignments.Add(assignment);
            await _context.SaveChangesAsync();

            // Act
            var result = await _service.GetUserComplianceReportAsync(_testUserId, _testTenantId);

            // Assert
            result.Should().NotBeNull();
            result.OverdueAssignments.Should().HaveCount(1);
            result.IsCompliant.Should().BeFalse();
        }

        [Fact]
        public async Task GetUserComplianceReportAsync_ExpiredCredential_MarksAsNonCompliant()
        {
            // Arrange
            var course = await CreateTestCourse(isMandatory: true);
            var assignment = await CreateTestAssignment(_testUserId, course.Id, TrainingStatus.Completed);
            
            var credential = new UserCredential
            {
                Id = Guid.NewGuid().ToString(),
                TenantId = _testTenantId,
                UserId = _testUserId,
                CredentialName = "Test License",
                CredentialType = "License",
                IssuingAuthority = "Test Authority",
                IssuedDate = DateTime.UtcNow.AddYears(-2),
                ExpiryDate = DateTime.UtcNow.AddDays(-1), // Expired
                CredentialStatus = CredentialStatus.Expired,
                IsRequired = true
            };
            _context.UserCredentials.Add(credential);
            await _context.SaveChangesAsync();

            // Act
            var result = await _service.GetUserComplianceReportAsync(_testUserId, _testTenantId);

            // Assert
            result.Should().NotBeNull();
            result.IsCompliant.Should().BeFalse();
            result.ExpiredCredentials.Should().HaveCount(1);
        }

        [Fact]
        public async Task GetExpiringCredentialsAsync_CredentialsExpiringWithin30Days_ReturnsCredentials()
        {
            // Arrange
            var credential1 = new UserCredential
            {
                Id = Guid.NewGuid().ToString(),
                TenantId = _testTenantId,
                UserId = _testUserId,
                CredentialName = "Expiring License 1",
                CredentialType = "License",
                IssuingAuthority = "Test Authority",
                IssuedDate = DateTime.UtcNow.AddYears(-1),
                ExpiryDate = DateTime.UtcNow.AddDays(15), // Expiring in 15 days
                CredentialStatus = CredentialStatus.Valid,
                IsRequired = true
            };

            var credential2 = new UserCredential
            {
                Id = Guid.NewGuid().ToString(),
                TenantId = _testTenantId,
                UserId = Guid.NewGuid().ToString(),
                CredentialName = "Not Expiring",
                CredentialType = "License",
                IssuingAuthority = "Test Authority",
                IssuedDate = DateTime.UtcNow.AddMonths(-6),
                ExpiryDate = DateTime.UtcNow.AddDays(60), // Not expiring within 30 days
                CredentialStatus = CredentialStatus.Valid,
                IsRequired = true
            };

            _context.UserCredentials.AddRange(credential1, credential2);
            await _context.SaveChangesAsync();

            // Act
            var result = await _service.GetExpiringCredentialsAsync(_testTenantId, 30);

            // Assert
            result.Should().HaveCount(1);
            result.First().CredentialName.Should().Be("Expiring License 1");
        }

        [Fact]
        public async Task AutoSuspendExpiredCredentialsAsync_ExpiredRequiredCredentials_MarksAsExpired()
        {
            // Arrange
            var credential = new UserCredential
            {
                Id = Guid.NewGuid().ToString(),
                TenantId = _testTenantId,
                UserId = _testUserId,
                CredentialName = "Expired Required License",
                CredentialType = "License",
                IssuingAuthority = "Test Authority",
                IssuedDate = DateTime.UtcNow.AddYears(-2),
                ExpiryDate = DateTime.UtcNow.AddDays(-5), // Expired 5 days ago
                CredentialStatus = CredentialStatus.Valid, // Still marked as valid
                IsRequired = true
            };
            _context.UserCredentials.Add(credential);
            await _context.SaveChangesAsync();

            // Act
            var suspendedCount = await _service.AutoSuspendExpiredCredentialsAsync(_testTenantId);

            // Assert
            suspendedCount.Should().Be(1);
            
            var updatedCredential = await _context.UserCredentials.FindAsync(credential.Id);
            updatedCredential.CredentialStatus.Should().Be(CredentialStatus.Expired);
        }

        [Fact]
        public async Task AutoSuspendExpiredCredentialsAsync_ExpiredOptionalCredentials_DoesNotSuspend()
        {
            // Arrange
            var credential = new UserCredential
            {
                Id = Guid.NewGuid().ToString(),
                TenantId = _testTenantId,
                UserId = _testUserId,
                CredentialName = "Expired Optional Certificate",
                CredentialType = "Certificate",
                IssuingAuthority = "Test Authority",
                IssuedDate = DateTime.UtcNow.AddYears(-2),
                ExpiryDate = DateTime.UtcNow.AddDays(-5),
                CredentialStatus = CredentialStatus.Valid,
                IsRequired = false // Optional credential
            };
            _context.UserCredentials.Add(credential);
            await _context.SaveChangesAsync();

            // Act
            var suspendedCount = await _service.AutoSuspendExpiredCredentialsAsync(_testTenantId);

            // Assert
            suspendedCount.Should().Be(0); // Optional credentials not suspended
            
            var updatedCredential = await _context.UserCredentials.FindAsync(credential.Id);
            updatedCredential.CredentialStatus.Should().Be(CredentialStatus.Valid);
        }

        [Fact]
        public async Task GetTenantComplianceReportAsync_MultipleUsers_AggregatesCorrectly()
        {
            // Arrange
            var user2Id = Guid.NewGuid().ToString();
            var course = await CreateTestCourse(isMandatory: true);
            
            // User 1: Compliant (completed)
            await CreateTestAssignment(_testUserId, course.Id, TrainingStatus.Completed);
            
            // User 2: Non-compliant (not started)
            await CreateTestAssignment(user2Id, course.Id, TrainingStatus.NotStarted);

            // Act
            var result = await _service.GetTenantComplianceReportAsync(_testTenantId);

            // Assert
            result.Should().HaveCount(2);
            result.Should().ContainSingle(r => r.IsCompliant);
            result.Should().ContainSingle(r => !r.IsCompliant);
        }

        [Fact]
        public async Task GetTrainingStatisticsAsync_VariousAssignments_CalculatesCorrectly()
        {
            // Arrange
            var user2Id = Guid.NewGuid().ToString();
            var course = await CreateTestCourse(isMandatory: true);
            
            await CreateTestAssignment(_testUserId, course.Id, TrainingStatus.Completed);
            await CreateTestAssignment(user2Id, course.Id, TrainingStatus.InProgress);

            // Act
            var result = await _service.GetTrainingStatisticsAsync(_testTenantId);

            // Assert
            result.Should().NotBeNull();
            result.TotalUsers.Should().Be(2);
            result.TotalAssignments.Should().Be(2);
            result.CompletedAssignments.Should().Be(1);
            result.OverallComplianceRate.Should().Be(50); // 1 out of 2 compliant
        }

        // Helper methods
        private async Task<TrainingCourse> CreateTestCourse(
            bool isMandatory,
            int validityPeriodDays = 0,
            string courseName = "Test Training Course")
        {
            var course = new TrainingCourse
            {
                Id = Guid.NewGuid().ToString(),
                TenantId = _testTenantId,
                CourseName = courseName,
                Description = "Test course description",
                IsMandatory = isMandatory,
                ValidityPeriodDays = validityPeriodDays,
                CourseProvider = "Test Provider",
                DurationHours = 8,
                Status = "active"
            };
            _context.TrainingCourses.Add(course);
            await _context.SaveChangesAsync();
            return course;
        }

        private async Task<TrainingAssignment> CreateTestAssignment(
            string userId,
            string courseId,
            TrainingStatus status = TrainingStatus.NotStarted)
        {
            var assignment = new TrainingAssignment
            {
                Id = Guid.NewGuid().ToString(),
                TenantId = _testTenantId,
                UserId = userId,
                CourseId = courseId,
                AssignedDate = DateTime.UtcNow,
                DueDate = DateTime.UtcNow.AddDays(30),
                TrainingStatus = status
            };

            if (status == TrainingStatus.Completed)
            {
                assignment.CompletionDate = DateTime.UtcNow;
            }

            _context.TrainingAssignments.Add(assignment);
            await _context.SaveChangesAsync();
            return assignment;
        }
    }
}
