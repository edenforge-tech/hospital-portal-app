using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Text.Json;
using NotificationService.Models.Requests;
using NotificationService.Models.Responses;
using NotificationService.Services.Mfa;
using NotificationService.Services.Email;
using NotificationService.Data;
using NotificationService.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace NotificationService.Functions.Admin;

public class RegenerateBackupCodes
{
    private readonly ILogger<RegenerateBackupCodes> _logger;
    private readonly IBackupCodeService _backupCodeService;
    private readonly ITotpService _totpService;
    private readonly IEmailService _emailService;
    private readonly NotificationDbContext _context;
    private readonly IConfiguration _configuration;

    public RegenerateBackupCodes(
        ILogger<RegenerateBackupCodes> logger,
        IBackupCodeService backupCodeService,
        ITotpService totpService,
        IEmailService emailService,
        NotificationDbContext context,
        IConfiguration configuration)
    {
        _logger = logger;
        _backupCodeService = backupCodeService;
        _totpService = totpService;
        _emailService = emailService;
        _context = context;
        _configuration = configuration;
    }

    [Function("RegenerateBackupCodes")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "admin/users/{userId}/mfa/regenerate-backup-codes")] HttpRequestData req,
        string userId)
    {
        try
        {
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var request = JsonSerializer.Deserialize<RegenerateBackupCodesRequest>(requestBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (request == null || request.AdminUserId == Guid.Empty)
            {
                var errorResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await errorResponse.WriteAsJsonAsync(new { success = false, error = "AdminUserId is required" });
                return errorResponse;
            }

            if (!Guid.TryParse(userId, out var userGuid))
            {
                var invalidUserIdResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await invalidUserIdResponse.WriteAsJsonAsync(new { success = false, error = "Invalid UserId" });
                return invalidUserIdResponse;
            }

            // Get user MFA settings
            var mfaSetting = await _context.UserMfaSettings
                .FirstOrDefaultAsync(m => m.UserId == userGuid);

            if (mfaSetting == null)
            {
                var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
                await notFoundResponse.WriteAsJsonAsync(new { success = false, error = "MFA settings not found for this user" });
                return notFoundResponse;
            }

            // Verify admin MFA code for security
            if (!string.IsNullOrEmpty(request.AdminMfaCode))
            {
                // Get admin's MFA settings
                var adminMfaSetting = await _context.UserMfaSettings
                    .FirstOrDefaultAsync(m => m.UserId == request.AdminUserId && m.IsMfaEnabled);

                if (adminMfaSetting == null)
                {
                    var adminMfaNotFoundResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                    await adminMfaNotFoundResponse.WriteAsJsonAsync(new 
                    { 
                        success = false, 
                        error = "Admin MFA is not enabled. MFA is required for this operation." 
                    });
                    return adminMfaNotFoundResponse;
                }

                // Verify admin's MFA code using TOTP service
                // Decrypt the TOTP secret (in production, use proper encryption)
                var adminTotpSecret = adminMfaSetting.TotpSecretEncrypted; // TODO: Add decryption in production
                
                if (string.IsNullOrEmpty(adminTotpSecret))
                {
                    _logger.LogWarning("Admin TOTP secret not found for {AdminId}", request.AdminUserId);
                    var noSecretResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                    await noSecretResponse.WriteAsJsonAsync(new 
                    { 
                        success = false, 
                        error = "Admin TOTP secret not configured. Cannot verify MFA." 
                    });
                    return noSecretResponse;
                }

                var adminMfaValid = _totpService.VerifyCode(adminTotpSecret, request.AdminMfaCode);

                if (!adminMfaValid)
                {
                    _logger.LogWarning("Failed admin MFA verification for user {AdminId} attempting to reset MFA for {UserId}", 
                        request.AdminUserId, userGuid);
                    var invalidMfaResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
                    await invalidMfaResponse.WriteAsJsonAsync(new 
                    { 
                        success = false, 
                        error = "Invalid admin MFA code. Please try again." 
                    });
                    return invalidMfaResponse;
                }

                _logger.LogInformation("Admin MFA verified successfully for {AdminId}", request.AdminUserId);
            }
            else
            {
                _logger.LogWarning("Admin MFA code not provided for backup code regeneration. Production systems should require this.");
            }

            // Generate new backup codes
            var backupCodeCount = int.Parse(_configuration["Mfa:BackupCodes:Count"] ?? "8");
            var backupCodeLength = int.Parse(_configuration["Mfa:BackupCodes:Length"] ?? "8");
            var newBackupCodes = _backupCodeService.GenerateBackupCodes(backupCodeCount, backupCodeLength);

            // Hash backup codes for storage
            var hashedBackupCodes = newBackupCodes.Select(code => (
                hash: _backupCodeService.HashBackupCode(code),
                used: false,
                usedAt: (DateTime?)null
            )).ToList();

            var backupCodesJson = _backupCodeService.SerializeBackupCodes(hashedBackupCodes);

            // Count old codes
            var oldCodesCount = 0;
            if (!string.IsNullOrEmpty(mfaSetting.BackupCodes))
            {
                var oldCodes = _backupCodeService.DeserializeBackupCodes(mfaSetting.BackupCodes);
                oldCodesCount = oldCodes.Count;
            }

            // Update MFA settings
            mfaSetting.BackupCodes = backupCodesJson;
            mfaSetting.BackupCodesGeneratedAt = DateTime.UtcNow;
            mfaSetting.UpdatedAt = DateTime.UtcNow;

            // Log the regeneration
            var regenerationLog = new BackupCodeRegenerationLog
            {
                UserId = userGuid,
                RegeneratedByAdminId = request.AdminUserId,
                Reason = request.Reason,
                OldCodesInvalidated = oldCodesCount,
                NewCodesGenerated = newBackupCodes.Count,
                CreatedAt = DateTime.UtcNow
            };

            _context.Add(regenerationLog);
            await _context.SaveChangesAsync();

            // Send notification email to user
            // TODO: Get user email from database
            var userEmail = "user@example.com";
            var adminName = "Administrator"; // TODO: Get admin name from database
            
            await _emailService.SendMfaResetNotificationAsync(
                userEmail,
                "User",
                adminName,
                DateTime.UtcNow);

            _logger.LogInformation("Backup codes regenerated for user {UserId} by admin {AdminId}", userGuid, request.AdminUserId);

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new BackupCodesResponse
            {
                Success = true,
                Codes = newBackupCodes,
                GeneratedAt = DateTime.UtcNow,
                Message = "Backup codes regenerated successfully. User has been notified. Share these codes securely in person."
            });

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error regenerating backup codes");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { success = false, error = "An error occurred while regenerating backup codes" });
            return errorResponse;
        }
    }
}
