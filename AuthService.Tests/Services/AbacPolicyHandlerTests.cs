using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AuthService.Authorization.Policies;
using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace AuthService.Tests.Services
{
    public class AbacPolicyHandlerTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
        private readonly AbacPolicyHandler _handler;
        private readonly Guid _testTenantId;
        private readonly Guid _testUserId;

        public AbacPolicyHandlerTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
            var mockHttpContext = new DefaultHttpContext();
            _mockHttpContextAccessor.Setup(_ => _.HttpContext).Returns(mockHttpContext);
            
            _context = new AppDbContext(options, _mockHttpContextAccessor.Object);

            _handler = new AbacPolicyHandler(_context, _mockHttpContextAccessor.Object);

            _testTenantId = Guid.NewGuid();
            _testUserId = Guid.NewGuid();
        }

        [Fact]
        public async Task EvaluatePolicyAsync_AllowPolicy_ReturnsAllow()
        {
            // Arrange
            var policy = new AccessPolicy
            {
                Id = Guid.NewGuid(),
                TenantId = _testTenantId,
                PolicyName = "Allow Access",
                Effect = "Allow",
                Priority = 100,
                IsActive = true,
                Status = "active"
            };
            await _context.AccessPolicies.AddAsync(policy);
            await _context.SaveChangesAsync();

            var context = new PolicyEvaluationContext
            {
                UserId = _testUserId,
                CurrentTime = DateTime.UtcNow,
                IPAddress = "192.168.1.1"
            };

            // Act
            var isAllowed = await _handler.EvaluatePolicyAsync(policy.Id, context);

            // Assert
            Assert.True(isAllowed);
        }

        [Fact]
        public async Task EvaluatePolicyAsync_DenyPolicy_ReturnsDeny()
        {
            // Arrange
            var policy = new AccessPolicy
            {
                Id = Guid.NewGuid(),
                TenantId = _testTenantId,
                PolicyName = "Deny Access",
                Effect = "Deny",
                Priority = 100,
                IsActive = true,
                Status = "active"
            };
            await _context.AccessPolicies.AddAsync(policy);
            await _context.SaveChangesAsync();

            var context = new PolicyEvaluationContext
            {
                UserId = _testUserId,
                CurrentTime = DateTime.UtcNow,
                IPAddress = "192.168.1.1"
            };

            // Act
            var isAllowed = await _handler.EvaluatePolicyAsync(policy.Id, context);

            // Assert
            Assert.False(isAllowed);
        }

        [Fact]
        public async Task EvaluatePolicyAsync_InactivePolicy_ReturnsDeny()
        {
            // Arrange
            var policy = new AccessPolicy
            {
                Id = Guid.NewGuid(),
                TenantId = _testTenantId,
                PolicyName = "Inactive Policy",
                Effect = "Allow",
                IsActive = false,
                Status = "inactive"
            };
            await _context.AccessPolicies.AddAsync(policy);
            await _context.SaveChangesAsync();

            var context = new PolicyEvaluationContext { UserId = _testUserId };

            // Act
            var isAllowed = await _handler.EvaluatePolicyAsync(policy.Id, context);

            // Assert
            Assert.False(isAllowed);
        }

        [Fact]
        public async Task ResolveConflicts_DenyOverride_ReturnsDeny()
        {
            // Arrange
            var decisions = new List<PolicyDecision>
            {
                new PolicyDecision { IsAllowed = true, Effect = "Allow", Priority = 100, PolicyName = "Allow Policy" },
                new PolicyDecision { IsAllowed = false, Effect = "Deny", Priority = 50, PolicyName = "Deny Policy" }
            };

            // Act
            var result = _handler.ResolveConflicts(decisions);

            // Assert
            Assert.False(result.IsAllowed);
            Assert.Equal("Deny", result.Effect);
            Assert.Contains("Deny-override", result.Reason);
        }

        [Fact]
        public async Task ResolveConflicts_AllowWithNoDeny_ReturnsHighestPriorityAllow()
        {
            // Arrange
            var decisions = new List<PolicyDecision>
            {
                new PolicyDecision { IsAllowed = true, Effect = "Allow", Priority = 50, PolicyName = "Low Priority" },
                new PolicyDecision { IsAllowed = true, Effect = "Allow", Priority = 100, PolicyName = "High Priority" }
            };

            // Act
            var result = _handler.ResolveConflicts(decisions);

            // Assert
            Assert.True(result.IsAllowed);
            Assert.Equal(100, result.Priority);
            Assert.Equal("High Priority", result.PolicyName);
        }

        [Fact]
        public async Task CheckTimeConstraintsAsync_WithinBusinessHours_ReturnsTrue()
        {
            // Arrange
            var policy = new AccessPolicy
            {
                Id = Guid.NewGuid(),
                TenantId = _testTenantId,
                PolicyName = "Business Hours Policy",
                TimeOfDayStart = new TimeSpan(9, 0, 0),  // 9 AM
                TimeOfDayEnd = new TimeSpan(17, 0, 0),    // 5 PM
                DaysOfWeek = "Mon,Tue,Wed,Thu,Fri"
            };

            // Create a time that's within business hours (Wednesday 2 PM)
            var wednesday = DateTime.UtcNow;
            while (wednesday.DayOfWeek != DayOfWeek.Wednesday)
            {
                wednesday = wednesday.AddDays(1);
            }
            var testTime = new DateTime(wednesday.Year, wednesday.Month, wednesday.Day, 14, 0, 0, DateTimeKind.Utc);

            // Act
            var result = await _handler.CheckTimeConstraintsAsync(policy, testTime);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task CheckTimeConstraintsAsync_OutsideBusinessHours_ReturnsFalse()
        {
            // Arrange
            var policy = new AccessPolicy
            {
                Id = Guid.NewGuid(),
                TenantId = _testTenantId,
                PolicyName = "Business Hours Policy",
                TimeOfDayStart = new TimeSpan(9, 0, 0),
                TimeOfDayEnd = new TimeSpan(17, 0, 0),
                DaysOfWeek = "Mon,Tue,Wed,Thu,Fri"
            };

            // Create a time outside business hours (Wednesday 8 PM)
            var wednesday = DateTime.UtcNow;
            while (wednesday.DayOfWeek != DayOfWeek.Wednesday)
            {
                wednesday = wednesday.AddDays(1);
            }
            var testTime = new DateTime(wednesday.Year, wednesday.Month, wednesday.Day, 20, 0, 0, DateTimeKind.Utc);

            // Act
            var result = await _handler.CheckTimeConstraintsAsync(policy, testTime);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task CheckLocationConstraintsAsync_IPWhitelist_ReturnsTrue()
        {
            // Arrange
            var policy = new AccessPolicy
            {
                Id = Guid.NewGuid(),
                TenantId = _testTenantId,
                PolicyName = "IP Whitelist Policy",
                Conditions = "{\"ipWhitelist\": [\"192.168.1.1\", \"10.0.0.1\"]}"
            };

            // Act
            var result = await _handler.CheckLocationConstraintsAsync(policy, "192.168.1.1");

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task CheckLocationConstraintsAsync_IPNotInWhitelist_ReturnsFalse()
        {
            // Arrange
            var policy = new AccessPolicy
            {
                Id = Guid.NewGuid(),
                TenantId = _testTenantId,
                PolicyName = "IP Whitelist Policy",
                Conditions = "{\"ipWhitelist\": [\"192.168.1.1\", \"10.0.0.1\"]}"
            };

            // Act
            var result = await _handler.CheckLocationConstraintsAsync(policy, "172.16.0.1");

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task GetApplicablePoliciesAsync_FiltersActiveAndEffectivePolicies()
        {
            // Arrange
            var activePolicy = new AccessPolicy
            {
                Id = Guid.NewGuid(),
                TenantId = _testTenantId,
                PolicyName = "Active Policy",
                Effect = "Allow",
                IsActive = true,
                EffectiveFrom = DateTime.UtcNow.AddDays(-1),
                EffectiveUntil = DateTime.UtcNow.AddDays(1),
                Status = "active"
            };

            var inactivePolicy = new AccessPolicy
            {
                Id = Guid.NewGuid(),
                TenantId = _testTenantId,
                PolicyName = "Inactive Policy",
                Effect = "Allow",
                IsActive = false,
                Status = "inactive"
            };

            await _context.AccessPolicies.AddRangeAsync(activePolicy, inactivePolicy);
            await _context.SaveChangesAsync();

            // Act
            var policies = await _handler.GetApplicablePoliciesAsync(_testUserId, "read", "resource");

            // Assert
            Assert.Single(policies);
            Assert.Equal(activePolicy.Id, policies.First().Id);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
