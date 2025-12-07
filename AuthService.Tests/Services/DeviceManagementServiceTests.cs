using System;
using System.Collections.Generic;
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
    public class DeviceManagementServiceTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
        private readonly DeviceManagementService _service;
        private readonly Guid _testTenantId;
        private readonly Guid _testUserId;

        public DeviceManagementServiceTests()
        {
            // Setup in-memory database
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            // Setup mock HTTP context
            _mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
            var mockHttpContext = new DefaultHttpContext();
            _mockHttpContextAccessor.Setup(_ => _.HttpContext).Returns(mockHttpContext);
            
            _context = new AppDbContext(options, _mockHttpContextAccessor.Object);

            _service = new DeviceManagementService(_context, _mockHttpContextAccessor.Object);

            _testTenantId = Guid.NewGuid();
            _testUserId = Guid.NewGuid();
        }

        [Fact]
        public async Task RegisterDeviceAsync_CreatesNewDevice_WithCorrectFingerprint()
        {
            // Arrange
            var deviceName = "Test Laptop";
            var deviceType = "Desktop";
            var os = "Windows 11";
            var browser = "Chrome";
            var ipAddress = "192.168.1.1";
            var userAgent = "Mozilla/5.0";

            // Act
            var result = await _service.RegisterDeviceAsync(
                _testUserId, deviceName, deviceType, os, browser, ipAddress, userAgent);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(_testUserId, result.UserId);
            Assert.Equal(deviceName, result.DeviceName);
            Assert.Equal(deviceType, result.DeviceType);
            Assert.Equal("Untrusted", result.TrustLevel);
            Assert.False(result.IsBlocked);
            Assert.NotEmpty(result.DeviceId); // DeviceId stores the fingerprint hash
        }

        [Fact]
        public async Task RegisterDeviceAsync_SetsFirstDeviceAsPrimary()
        {
            // Arrange
            var deviceName = "First Device";

            // Act
            var result = await _service.RegisterDeviceAsync(
                _testUserId, deviceName, "Desktop", "Windows", "Chrome", "192.168.1.1", "Mozilla");

            // Assert
            Assert.True(result.IsPrimaryDevice);
        }

        [Fact]
        public async Task TrustDeviceAsync_UpdatesTrustLevel()
        {
            // Arrange
            var device = await _service.RegisterDeviceAsync(
                _testUserId, "Test Device", "Desktop", "Windows", "Chrome", "192.168.1.1", "Mozilla");

            // Act
            var result = await _service.TrustDeviceAsync(device.Id, "Trusted");

            // Assert
            Assert.Equal("Trusted", result.TrustLevel);
        }

        [Fact]
        public async Task BlockDeviceAsync_BlocksDevice_AndRecordsReason()
        {
            // Arrange
            var device = await _service.RegisterDeviceAsync(
                _testUserId, "Test Device", "Desktop", "Windows", "Chrome", "192.168.1.1", "Mozilla");
            var blockReason = "Suspicious activity detected";

            // Act
            await _service.BlockDeviceAsync(device.Id, blockReason);

            // Assert
            var blocked = await _context.Devices.FindAsync(device.Id);
            Assert.NotNull(blocked);
            Assert.True(blocked.IsBlocked);
            Assert.Equal(blockReason, blocked.BlockReason);
        }

        [Fact]
        public async Task UnblockDeviceAsync_UnblocksDevice()
        {
            // Arrange
            var device = await _service.RegisterDeviceAsync(
                _testUserId, "Test Device", "Desktop", "Windows", "Chrome", "192.168.1.1", "Mozilla");
            await _service.BlockDeviceAsync(device.Id, "Test block");

            // Act
            await _service.UnblockDeviceAsync(device.Id);

            // Assert
            var unblocked = await _context.Devices.FindAsync(device.Id);
            Assert.NotNull(unblocked);
            Assert.False(unblocked.IsBlocked);
            Assert.Null(unblocked.BlockReason);
        }

        [Fact]
        public async Task SetPrimaryDeviceAsync_UpdatesPrimaryDevice()
        {
            // Arrange
            var device1 = await _service.RegisterDeviceAsync(
                _testUserId, "Device 1", "Desktop", "Windows", "Chrome", "192.168.1.1", "Mozilla");
            var device2 = await _service.RegisterDeviceAsync(
                _testUserId, "Device 2", "Mobile", "Android", "Chrome", "192.168.1.2", "Mozilla");

            // Act
            await _service.SetPrimaryDeviceAsync(_testUserId, device2.Id);

            // Assert
            var updatedDevice1 = await _context.Devices.FindAsync(device1.Id);
            var updatedDevice2 = await _context.Devices.FindAsync(device2.Id);
            
            Assert.False(updatedDevice1?.IsPrimaryDevice);
            Assert.True(updatedDevice2?.IsPrimaryDevice);
        }

        [Fact]
        public async Task GetUserDevicesAsync_ReturnsAllUserDevices()
        {
            // Arrange
            await _service.RegisterDeviceAsync(_testUserId, "Device 1", "Desktop", "Windows", "Chrome", "192.168.1.1", "Mozilla");
            await _service.RegisterDeviceAsync(_testUserId, "Device 2", "Mobile", "Android", "Chrome", "192.168.1.2", "Mozilla");

            // Act
            var devices = await _service.GetUserDevicesAsync(_testUserId);

            // Assert
            Assert.Equal(2, devices.Count);
            Assert.All(devices, d => Assert.Equal(_testUserId, d.UserId));
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
