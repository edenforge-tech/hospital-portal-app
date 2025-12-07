using System;
using System.Threading.Tasks;
using AuthService.Context;
using AuthService.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace AuthService.Tests.Services
{
    public class LocalizationServiceTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
        private readonly LocalizationService _service;
        private readonly Guid _testUserId;

        public LocalizationServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
            var mockHttpContext = new DefaultHttpContext();
            _mockHttpContextAccessor.Setup(_ => _.HttpContext).Returns(mockHttpContext);
            
            _context = new AppDbContext(options, _mockHttpContextAccessor.Object);

            _service = new LocalizationService(_context, _mockHttpContextAccessor.Object);
            _testUserId = Guid.NewGuid();
        }

        [Fact]
        public async Task GetEffectiveLocalizationAsync_ReturnsDefaultSettings_WhenNoUserPreferences()
        {
            // Act
            var settings = await _service.GetEffectiveLocalizationAsync(_testUserId);

            // Assert
            Assert.NotNull(settings);
            Assert.Equal("UTC", settings.Timezone);
            Assert.Equal("DD-MM-YYYY", settings.DateFormat);
            Assert.Equal("24h", settings.TimeFormat);
            Assert.Equal("en-US", settings.NumberFormat);
            Assert.Equal("USD", settings.Currency);
        }

        [Fact]
        public async Task ConvertToUserTimezoneAsync_ConvertsUTCToUserTimezone()
        {
            // Arrange
            var utcTime = new DateTime(2024, 12, 7, 12, 0, 0, DateTimeKind.Utc);

            // Act
            var localTime = await _service.ConvertToUserTimezoneAsync(utcTime, _testUserId);

            // Assert
            Assert.NotNull(localTime);
            // Default is UTC, so should be the same
            Assert.Equal(utcTime, localTime);
        }

        [Fact]
        public async Task ConvertFromUserTimezoneAsync_ConvertsLocalTimeToUTC()
        {
            // Arrange
            var localTime = new DateTime(2024, 12, 7, 12, 0, 0, DateTimeKind.Local);

            // Act
            var utcTime = await _service.ConvertFromUserTimezoneAsync(localTime, _testUserId);

            // Assert
            Assert.NotNull(utcTime);
            Assert.Equal(DateTimeKind.Utc, utcTime.Kind);
        }

        [Theory]
        [InlineData(1234.56, "$1,234.56")]
        public async Task FormatCurrencyAsync_FormatsCorrectly(decimal amount, string expected)
        {
            // Act
            var formatted = await _service.FormatCurrencyAsync(amount, _testUserId);

            // Assert
            Assert.Contains("1,234", formatted); // Check thousands separator
            Assert.Contains(".", formatted);      // Check decimal separator
        }

        [Fact]
        public async Task FormatDateAsync_FormatsWithDefaultFormat()
        {
            // Arrange
            var date = new DateTime(2024, 12, 7);

            // Act
            var formatted = await _service.FormatDateAsync(date, _testUserId);

            // Assert
            // Default format is DD-MM-YYYY
            Assert.Equal("07-12-2024", formatted);
        }

        [Fact]
        public async Task FormatTimeAsync_FormatsWithDefaultFormat()
        {
            // Arrange
            var time = new DateTime(2024, 12, 7, 14, 30, 0);

            // Act
            var formatted = await _service.FormatTimeAsync(time, _testUserId);

            // Assert
            // Default format is 24h
            Assert.Equal("14:30", formatted);
        }

        [Theory]
        [InlineData(1234567.89)]
        public async Task FormatNumberAsync_FormatsWithThousandsSeparator(decimal number)
        {
            // Act
            var formatted = await _service.FormatNumberAsync(number, _testUserId);

            // Assert
            Assert.Contains(",", formatted); // Should have thousands separator
        }

        [Fact]
        public void GetDefaultSettings_ReturnsCorrectDefaults()
        {
            // Use reflection to access private method for testing
            var method = typeof(LocalizationService).GetMethod("GetDefaultSettings",
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            
            // Act
            var settings = method?.Invoke(_service, null) as LocalizationSettings;

            // Assert
            Assert.NotNull(settings);
            Assert.Equal("UTC", settings.Timezone);
            Assert.Equal("DD-MM-YYYY", settings.DateFormat);
            Assert.Equal("24h", settings.TimeFormat);
            Assert.Equal("en-US", settings.NumberFormat);
            Assert.Equal("USD", settings.Currency);
            Assert.Equal("$", settings.CurrencySymbol);
            Assert.Equal("en", settings.Language);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
