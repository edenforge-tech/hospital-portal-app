using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Text.Json;
using NotificationService.Services.Token;

namespace NotificationService.Functions.Activation
{
    public class VerifyEmail
    {
        private readonly ILogger<VerifyEmail> _logger;
        private readonly ITokenService _tokenService;

        public VerifyEmail(
            ILogger<VerifyEmail> logger,
            ITokenService tokenService)
        {
            _logger = logger;
            _tokenService = tokenService;
        }

        [Function("VerifyEmail")]
        public async Task<HttpResponseData> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "activation/verify-email")] HttpRequestData req)
        {
            _logger.LogInformation("VerifyEmail function triggered");

            // Read request body
            string requestBody;
            using (var reader = new StreamReader(req.Body))
            {
                requestBody = await reader.ReadToEndAsync();
            }

            var request = JsonSerializer.Deserialize<VerifyEmailRequest>(requestBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (request == null || string.IsNullOrEmpty(request.Token))
            {
                var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequest.WriteAsJsonAsync(new
                {
                    success = false,
                    error = "Verification token is required"
                });
                return badRequest;
            }

            // Validate token
            var (isValid, email, userId, error) = await _tokenService.ValidateEmailVerificationTokenAsync(request.Token);

            if (!isValid)
            {
                var errorResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await errorResponse.WriteAsJsonAsync(new
                {
                    success = false,
                    error = error ?? "Invalid or expired verification link"
                });
                return errorResponse;
            }

            // Return success - AuthService will update email_verified flag
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new
            {
                success = true,
                email = email,
                userId = userId,
                message = "Email verified successfully"
            });

            _logger.LogInformation(
                "Email verified successfully for {Email}, userId: {UserId}",
                email,
                userId
            );

            return response;
        }
    }

    public class VerifyEmailRequest
    {
        public string Token { get; set; } = string.Empty;
    }
}
