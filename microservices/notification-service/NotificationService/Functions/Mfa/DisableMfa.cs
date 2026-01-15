using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Text.Json;
using NotificationService.Models.Requests;
using NotificationService.Services.Mfa;
using NotificationService.Data;
using Microsoft.EntityFrameworkCore;

namespace NotificationService.Functions.Mfa;

public class DisableMfa
{
    private readonly ILogger<DisableMfa> _logger;
    private readonly ITotpService _totpService;
    private readonly NotificationDbContext _context;

    public DisableMfa(
        ILogger<DisableMfa> logger,
        ITotpService totpService,
        NotificationDbContext context)
    {
        _logger = logger;
        _totpService = totpService;
        _context = context;
    }

    [Function("DisableMfa")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "mfa/disable")] HttpRequestData req)
    {
        try
        {
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var request = JsonSerializer.Deserialize<DisableMfaRequest>(requestBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (request == null || request.UserId == Guid.Empty)
            {
                var errorResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await errorResponse.WriteAsJsonAsync(new { success = false, error = "UserId is required" });
                return errorResponse;
            }

            // Get user MFA settings
            var mfaSetting = await _context.UserMfaSettings
                .FirstOrDefaultAsync(m => m.UserId == request.UserId);

            if (mfaSetting == null || !mfaSetting.IsMfaEnabled)
            {
                var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
                await notFoundResponse.WriteAsJsonAsync(new { success = false, error = "MFA is not enabled for this user" });
                return notFoundResponse;
            }

            // TODO: Verify password in production by calling auth-service
            // For now, just check if password is provided
            if (string.IsNullOrWhiteSpace(request.Password))
            {
                var passwordRequiredResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await passwordRequiredResponse.WriteAsJsonAsync(new { success = false, error = "Password is required" });
                return passwordRequiredResponse;
            }

            // Verify current MFA code (TOTP or backup code)
            bool codeVerified = false;

            if (mfaSetting.TotpEnabled && !string.IsNullOrEmpty(mfaSetting.TotpSecretEncrypted))
            {
                codeVerified = _totpService.VerifyCode(mfaSetting.TotpSecretEncrypted, request.CurrentCode);
            }

            if (!codeVerified)
            {
                var invalidCodeResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
                await invalidCodeResponse.WriteAsJsonAsync(new { success = false, error = "Invalid MFA code" });
                return invalidCodeResponse;
            }

            // Disable MFA - clear all MFA settings
            mfaSetting.IsMfaEnabled = false;
            mfaSetting.TotpEnabled = false;
            mfaSetting.SmsEnabled = false;
            mfaSetting.EmailEnabled = false;
            mfaSetting.TotpSecretEncrypted = null;
            mfaSetting.BackupCodes = null;
            mfaSetting.PrimaryMethod = null;
            mfaSetting.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("MFA disabled for user {UserId}", request.UserId);

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new
            {
                success = true,
                message = "MFA has been disabled successfully",
                mfaEnabled = false
            });

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error disabling MFA");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { success = false, error = "An error occurred while disabling MFA" });
            return errorResponse;
        }
    }
}
