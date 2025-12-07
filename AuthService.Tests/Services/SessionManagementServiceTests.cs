using System;
using System.Linq;
using System.Threading.Tasks;
using AuthService.Context;
using AuthService.Models.Domain;
using AuthService.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace AuthService.Tests.Services
{
    /// <summary>
    /// Note: These tests use the actual 9-parameter CreateSessionAsync signature from ISessionManagementService
    /// </summary>
    public class SessionManagementServiceTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
        private readonly SessionManagementService _service;
        private readonly Guid _testUserId;

        public SessionManagementServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
            var mockHttpContext = new DefaultHttpContext();
            _mockHttpContextAccessor.Setup(_ => _.HttpContext).Returns(mockHttpContext);
            
            _context = new AppDbContext(options, _mockHttpContextAccessor.Object);

            _service = new SessionManagementService(_context, _mockHttpContextAccessor.Object);

            _testUserId = Guid.NewGuid();
        }

        [Fact]
        public async Task CreateSessionAsync_CreatesNewSession()
        {
            // Arrange - all 9 required parameters
            var userId = _testUserId;
            Guid? deviceId = Guid.NewGuid();
            var tokenId = "test-token-123";
            var refreshToken = "test-refresh-token-456";
            var ipAddress = "192.168.1.1";
            var userAgent = "Mozilla/5.0";
            var location = "New York, USA";
            var sessionType = "Web";
            var loginMethod = "Password";

            // Act
            var result = await _service.CreateSessionAsync(
                userId, deviceId, tokenId, refreshToken, ipAddress, 
                userAgent, location, sessionType, loginMethod);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(userId, result.UserId);
            Assert.Equal(deviceId, result.DeviceId);
            Assert.Equal(tokenId, result.TokenId);
            Assert.True(result.IsActive);
            Assert.NotEmpty(result.SessionId);
        }

        // TODO: Add more comprehensive tests matching the actual 9-parameter API
        // Current implementation signature: CreateSessionAsync(userId, deviceId, tokenId, refreshToken, ipAddress, userAgent, location, sessionType, loginMethod)
        // Additional tests needed: RefreshSession, TerminateSession, DetectSuspiciousActivity, etc.

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
