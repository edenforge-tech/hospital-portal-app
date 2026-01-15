using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Text.Json;
using NotificationService.Models.Requests;
using NotificationService.Models.Responses;
using NotificationService.Services.Mfa;
using NotificationService.Services.Otp;
using NotificationService.Data;
using Microsoft.EntityFrameworkCore;

namespace NotificationService.Functions.Mfa;

public class VerifyMfaLogin
{
    private readonly ILogger<VerifyMfaLogin> _logger;
    private readonly ITotpService _totpService;
    private readonly IOtpService _otpService;
    private readonly IBackupCodeService _backupCodeService;
    private readonly NotificationDbContext _context;

    public VerifyMfaLogin(
        ILogger<VerifyMfaLogin> logger,
        ITotpService totpService,
        IOtpService otpService,
        IBackupCodeService backupCodeService,
        NotificationDbContext context)
    {
        _logger = logger;
        _totpService = totpService;
        _otpService = otpService;
        _backupCodeService = backupCodeService;
        _context = context;
    }

    [Function("VerifyMfaLogin")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "mfa/verify-login")] HttpRequestData req)
    {
        try
        {
            // Reset stream position if needed
            if (req.Body.CanSeek)
            {
                req.Body.Position = 0;
            }

            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            
            _logger.LogInformation("Received MFA verification request. Body length: {Length}, Content: {Body}", 
                requestBody?.Length ?? 0, requestBody);

            if (string.IsNullOrWhiteSpace(requestBody))
            {
                _logger.LogError("Request body is empty or null");
                var emptyBodyResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await emptyBodyResponse.WriteAsJsonAsync(new { success = false, error = "Request body is empty" });
                return emptyBodyResponse;
            }

            var request = JsonSerializer.Deserialize<VerifyMfaLoginRequest>(requestBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (request == null || request.UserId == Guid.Empty || string.IsNullOrEmpty(request.Code) || string.IsNullOrEmpty(request.Method))
            {
                _logger.LogWarning("Invalid request: UserId={UserId}, Code={Code}, Method={Method}", 
                    request?.UserId, request?.Code, request?.Method);
                var errorResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await errorResponse.WriteAsJsonAsync(new { success = false, error = "UserId, Code, and Method are required" });
                return errorResponse;
            }

            var mfaSetting = await _context.UserMfaSettings
                .FirstOrDefaultAsync(m => m.UserId == request.UserId && m.IsMfaEnabled);

            if (mfaSetting == null)
            {
                var notEnabledResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await notEnabledResponse.WriteAsJsonAsync(new { success = false, error = "MFA is not enabled" });
                return notEnabledResponse;
            }

            bool isValid = false;

            switch (request.Method.ToLower())
            {
                case "totp":
                    if (mfaSetting.TotpEnabled && !string.IsNullOrEmpty(mfaSetting.TotpSecretEncrypted))
                    {
                        _logger.LogInformation("Verifying TOTP for user {UserId}, code: {Code}, secret: {Secret}, secretLength: {Length}", 
                            request.UserId, request.Code, mfaSetting.TotpSecretEncrypted, mfaSetting.TotpSecretEncrypted?.Length);
                        
                        // Generate what the server thinks is the correct code
                        var expectedCode = _totpService.GenerateCode(mfaSetting.TotpSecretEncrypted);
                        _logger.LogInformation("Expected TOTP code from server: {ExpectedCode}, User provided: {UserCode}", 
                            expectedCode, request.Code);
                        
                        isValid = _totpService.VerifyCode(mfaSetting.TotpSecretEncrypted, request.Code);
                        _logger.LogInformation("TOTP verification result for user {UserId}: {IsValid}", request.UserId, isValid);
                    }
                    else
                    {
                        _logger.LogWarning("TOTP verification failed for user {UserId}: TotpEnabled={TotpEnabled}, HasSecret={HasSecret}", 
                            request.UserId, mfaSetting.TotpEnabled, !string.IsNullOrEmpty(mfaSetting.TotpSecretEncrypted));
                    }
                    break;

                case "sms":
                case "email":
                    // Verify OTP from database
                    var (success, error, attemptsRemaining) = await _otpService.VerifyAndConsumeOtpAsync(
                        request.Code, // Using code as both identifier and value for now
                        request.Code,
                        "mfa_login");
                    isValid = success;
                    if (!success && attemptsRemaining > 0)
                    {
                        var failResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                        await failResponse.WriteAsJsonAsync(new VerifyMfaResponse
                        {
                            Success = false,
                            Message = error ?? "Invalid code",
                            AttemptsRemaining = attemptsRemaining
                        });
                        return failResponse;
                    }
                    break;

                case "backup_code":
                    if (!string.IsNullOrEmpty(mfaSetting.BackupCodes))
                    {
                        var backupCodes = _backupCodeService.DeserializeBackupCodes(mfaSetting.BackupCodes);
                        
                        foreach (var (hash, used, usedAt) in backupCodes)
                        {
                            if (!used && _backupCodeService.VerifyBackupCode(request.Code, hash))
                            {
                                // Mark as used
                                var updatedCodes = backupCodes.Select(c => 
                                    c.hash == hash 
                                        ? (c.hash, true, (DateTime?)DateTime.UtcNow) 
                                        : c
                                ).ToList();
                                
                                mfaSetting.BackupCodes = _backupCodeService.SerializeBackupCodes(updatedCodes);
                                await _context.SaveChangesAsync();
                                
                                isValid = true;
                                break;
                            }
                        }
                    }
                    break;

                default:
                    var invalidMethodResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                    await invalidMethodResponse.WriteAsJsonAsync(new { success = false, error = "Invalid verification method" });
                    return invalidMethodResponse;
            }

            if (!isValid)
            {
                var invalidResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await invalidResponse.WriteAsJsonAsync(new VerifyMfaResponse
                {
                    Success = false,
                    Message = "Invalid verification code"
                });
                return invalidResponse;
            }

            // Update last verified time
            mfaSetting.LastVerifiedAt = DateTime.UtcNow;
            mfaSetting.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _logger.LogInformation("MFA login verified for user {UserId} using method {Method}", request.UserId, request.Method);

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new VerifyMfaResponse
            {
                Success = true,
                Message = "MFA verification successful",
                Token = "full_access_token_placeholder", // TODO: Generate actual JWT
                RefreshToken = "refresh_token_placeholder"
            });

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying MFA login");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { success = false, error = "An error occurred during verification" });
            return errorResponse;
        }
    }
}
