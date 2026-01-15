using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Linq;
using System.Net;
using System.Text.Json;
using NotificationService.Models.Requests;
using NotificationService.Models.Responses;
using NotificationService.Services.Otp;

namespace NotificationService.Functions.Activation;

public class VerifyActivationOtp
{
    private readonly ILogger<VerifyActivationOtp> _logger;
    private readonly IOtpService _otpService;

    public VerifyActivationOtp(
        ILogger<VerifyActivationOtp> logger,
        IOtpService otpService)
    {
        _logger = logger;
        _otpService = otpService;
    }

    [Function("VerifyActivationOtp")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", "options", Route = "activation/verify-otp")] HttpRequestData req)
    {
        // Handle CORS
        var origin = req.Headers.TryGetValues("Origin", out var origins) ? origins.FirstOrDefault() : null;
        var allowedOrigins = new[] { "http://localhost:3000", "https://localhost:3000" };

        // Handle preflight OPTIONS request
        if (req.Method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
        {
            var optionsResponse = req.CreateResponse(HttpStatusCode.OK);
            AddCorsHeaders(optionsResponse, origin, allowedOrigins);
            return optionsResponse;
        }

        try
        {
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var request = JsonSerializer.Deserialize<VerifyOtpRequest>(requestBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (request == null || string.IsNullOrEmpty(request.Recipient) || string.IsNullOrEmpty(request.Otp))
            {
                var errorResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await errorResponse.WriteAsJsonAsync(new { success = false, error = "Recipient and OTP are required" });
                return errorResponse;
            }

            var (success, error, attemptsRemaining) = await _otpService.VerifyAndConsumeOtpAsync(
                request.Recipient,
                request.Otp,
                "user_activation");

            if (!success)
            {
                var failResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                AddCorsHeaders(failResponse, origin, allowedOrigins);
                await failResponse.WriteAsJsonAsync(new VerifyOtpResponse
                {
                    Success = false,
                    Message = error ?? "Verification failed",
                    AttemptsRemaining = attemptsRemaining
                });
                return failResponse;
            }

            // Get the userId from the OTP record
            var otpRecord = await _otpService.GetOtpRecordAsync(request.Recipient, "user_activation");
            
            var response = req.CreateResponse(HttpStatusCode.OK);
            AddCorsHeaders(response, origin, allowedOrigins);
            await response.WriteAsJsonAsync(new VerifyOtpResponse
            {
                Success = true,
                Message = "OTP verified successfully",
                UserId = otpRecord?.UserId,
                RequirePasswordSetup = true
            });

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying activation OTP");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            AddCorsHeaders(errorResponse, origin, allowedOrigins);
            await errorResponse.WriteAsJsonAsync(new { success = false, error = "An error occurred during verification" });
            return errorResponse;
        }
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
