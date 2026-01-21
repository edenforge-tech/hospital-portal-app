using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Linq;
using System.Net;
using System.Text.Json;
using NotificationService.Services.Token;

namespace NotificationService.Functions.Activation
{
    public class ValidateActivationToken
    {
        private readonly ILogger<ValidateActivationToken> _logger;
        private readonly ITokenService _tokenService;

        public ValidateActivationToken(
            ILogger<ValidateActivationToken> logger,
            ITokenService tokenService)
        {
            _logger = logger;
            _tokenService = tokenService;
        }

        [Function("ValidateActivationToken")]
        public async Task<HttpResponseData> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", "options", Route = "activation/validate-token")] HttpRequestData req)
        {
            _logger.LogInformation("ValidateActivationToken function triggered");

            HttpResponseData response;

            // Add CORS headers
            var origin = req.Headers.TryGetValues("Origin", out var origins) ? origins.FirstOrDefault() : null;
            var allowedOrigins = new[] { "http://localhost:3000", "https://localhost:3000" };

            // Handle preflight OPTIONS request
            if (req.Method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
            {
                response = req.CreateResponse(HttpStatusCode.OK);
                AddCorsHeaders(response, origin, allowedOrigins);
                return response;
            }

            // Read request body
            string requestBody;
            using (var reader = new StreamReader(req.Body))
            {
                requestBody = await reader.ReadToEndAsync();
            }

            var request = JsonSerializer.Deserialize<ValidateTokenRequest>(requestBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (request == null || string.IsNullOrEmpty(request.Token))
            {
                response = req.CreateResponse(HttpStatusCode.BadRequest);
                AddCorsHeaders(response, origin, allowedOrigins);
                await response.WriteAsJsonAsync(new
                {
                    success = false,
                    error = "Token is required"
                });
                return response;
            }

            // Validate token
            var (isValid, email, userId, tenantId, error) = await _tokenService.ValidateActivationTokenAsync(request.Token);

            if (!isValid)
            {
                response = req.CreateResponse(HttpStatusCode.BadRequest);
                AddCorsHeaders(response, origin, allowedOrigins);
                await response.WriteAsJsonAsync(new
                {
                    success = false,
                    error = error ?? "Invalid or expired activation link"
                });
                return response;
            }

            // Return success with email, userId, and tenantId
            response = req.CreateResponse(HttpStatusCode.OK);
            AddCorsHeaders(response, origin, allowedOrigins);
            await response.WriteAsJsonAsync(new
            {
                success = true,
                email = email,
                userId = userId,
                tenantId = tenantId,
                message = "Activation link is valid"
            });

            _logger.LogInformation(
                "Token validated successfully for email: {Email}, userId: {UserId}, tenantId: {TenantId}",
                email,
                userId,
                tenantId
            );

            return response;
        }

        private void AddCorsHeaders(HttpResponseData response, string? origin, string[] allowedOrigins)
        {
            if (!string.IsNullOrEmpty(origin) && allowedOrigins.Contains(origin))
            {
                response.Headers.Add("Access-Control-Allow-Origin", origin);
                response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization");
                response.Headers.Add("Access-Control-Allow-Credentials", "true");
            }
        }
    }

    public class ValidateTokenRequest
    {
        public string Token { get; set; } = string.Empty;
    }
}
