using Xunit;
using FluentAssertions;
using System.Net;
using System.Threading.Tasks;
using System.Net.Http;
using AuthService.IntegrationTests.Helpers;

namespace AuthService.IntegrationTests.Endpoints
{
    public class AuthEndpointsTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;
        private readonly IntegrationTestHelper _helper;

        public AuthEndpointsTests(CustomWebApplicationFactory factory)
        {
            _client = factory.CreateClient();
            _helper = new IntegrationTestHelper(_client);
        }

        [Fact]
        public async Task Login_WithInvalidCredentials_Returns401Unauthorized()
        {
            // Arrange
            var loginRequest = new
            {
                Email = "invalid@hospital.com",
                Password = "WrongPassword123!"
            };

            // Act
            var response = await _helper.PostAsync("/api/auth/login", loginRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task Login_WithMissingEmail_Returns400BadRequest()
        {
            // Arrange
            var loginRequest = new
            {
                Password = "SomePassword123!"
            };

            // Act
            var response = await _helper.PostAsync("/api/auth/login", loginRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task Login_WithMissingPassword_Returns400BadRequest()
        {
            // Arrange
            var loginRequest = new
            {
                Email = "test@hospital.com"
            };

            // Act
            var response = await _helper.PostAsync("/api/auth/login", loginRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task Register_WithValidData_Returns200OK()
        {
            // Arrange
            var registerRequest = new
            {
                Email = $"newuser{System.Guid.NewGuid()}@hospital.com",
                Password = "NewUser@123456",
                FirstName = "Test",
                LastName = "User",
                TenantId = System.Guid.NewGuid().ToString()
            };

            // Act
            var response = await _helper.PostAsync("/api/auth/register", registerRequest);

            // Assert
            response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Created);
        }

        [Fact]
        public async Task Register_WithWeakPassword_Returns400BadRequest()
        {
            // Arrange
            var registerRequest = new
            {
                Email = $"newuser{System.Guid.NewGuid()}@hospital.com",
                Password = "weak", // Too weak
                FirstName = "Test",
                LastName = "User",
                TenantId = System.Guid.NewGuid().ToString()
            };

            // Act
            var response = await _helper.PostAsync("/api/auth/register", registerRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task RefreshToken_WithoutAuthentication_Returns401Unauthorized()
        {
            // Arrange
            _helper.ClearAuthHeaders();
            var refreshRequest = new
            {
                RefreshToken = "invalid-token"
            };

            // Act
            var response = await _helper.PostAsync("/api/auth/refresh", refreshRequest);

            // Assert
            response.StatusCode.Should().BeOneOf(HttpStatusCode.Unauthorized, HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task Logout_WithAuthentication_Returns200OK()
        {
            // Arrange
            await _helper.AuthenticateAsync();

            // Act
            var response = await _helper.PostAsync("/api/auth/logout", new { });

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task Logout_WithoutAuthentication_Returns401Unauthorized()
        {
            // Arrange
            _helper.ClearAuthHeaders();

            // Act
            var response = await _helper.PostAsync("/api/auth/logout", new { });

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }
    }
}
