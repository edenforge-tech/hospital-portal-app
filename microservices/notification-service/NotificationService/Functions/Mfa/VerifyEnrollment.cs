using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Linq;
using System.Net;
using System.Text.Json;
using NotificationService.Models.Requests;
using NotificationService.Models.Responses;
using NotificationService.Services.Mfa;
using NotificationService.Data;
using Microsoft.EntityFrameworkCore;

namespace NotificationService.Functions.Mfa;

public class VerifyEnrollment
{
    private readonly ILogger<VerifyEnrollment> _logger;
    private readonly ITotpService _totpService;
    private readonly NotificationDbContext _context;

    public VerifyEnrollment(
        ILogger<VerifyEnrollment> logger,
        ITotpService totpService,
        NotificationDbContext context)
    {
        _logger = logger;
        _totpService = totpService;
        _context = context;
    }

    [Function("VerifyEnrollment")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", "options", Route = "mfa/enroll/verify")] HttpRequestData req)
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
            var request = JsonSerializer.Deserialize<VerifyEnrollmentRequest>(requestBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (request == null || request.UserId == Guid.Empty || string.IsNullOrEmpty(request.Code))
            {
                var errorResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await errorResponse.WriteAsJsonAsync(new { success = false, error = "UserId and Code are required" });
                return errorResponse;
            }

            var mfaSetting = await _context.UserMfaSettings
                .FirstOrDefaultAsync(m => m.UserId == request.UserId);

            if (mfaSetting == null || string.IsNullOrEmpty(mfaSetting.TotpSecretEncrypted))
            {
                var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
                await notFoundResponse.WriteAsJsonAsync(new { success = false, error = "No pending MFA enrollment found" });
                return notFoundResponse;
            }

            // Verify TOTP code
            var isValid = _totpService.VerifyCode(mfaSetting.TotpSecretEncrypted, request.Code);

            if (!isValid)
            {
                var invalidResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                AddCorsHeaders(invalidResponse, origin, allowedOrigins);
                await invalidResponse.WriteAsJsonAsync(new { success = false, error = "Invalid verification code" });
                return invalidResponse;
            }

            // Enable MFA
            mfaSetting.IsMfaEnabled = true;
            mfaSetting.TotpEnabled = true;
            mfaSetting.PrimaryMethod = "totp";
            mfaSetting.EnrolledAt = DateTime.UtcNow;
            mfaSetting.LastVerifiedAt = DateTime.UtcNow;
            mfaSetting.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("MFA enrollment verified and enabled for user {UserId}", request.UserId);

            var response = req.CreateResponse(HttpStatusCode.OK);
            AddCorsHeaders(response, origin, allowedOrigins);
            await response.WriteAsJsonAsync(new
            {
                success = true,
                message = "MFA enabled successfully",
                mfaEnabled = true,
                primaryMethod = "totp"
            });

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying MFA enrollment");
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
