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
using NotificationService.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace NotificationService.Functions.Mfa;

public class EnrollTotp
{
    private readonly ILogger<EnrollTotp> _logger;
    private readonly ITotpService _totpService;
    private readonly IQrCodeService _qrCodeService;
    private readonly IBackupCodeService _backupCodeService;
    private readonly NotificationDbContext _context;
    private readonly IConfiguration _configuration;

    public EnrollTotp(
        ILogger<EnrollTotp> logger,
        ITotpService totpService,
        IQrCodeService qrCodeService,
        IBackupCodeService backupCodeService,
        NotificationDbContext context,
        IConfiguration configuration)
    {
        _logger = logger;
        _totpService = totpService;
        _qrCodeService = qrCodeService;
        _backupCodeService = backupCodeService;
        _context = context;
        _configuration = configuration;
    }

    [Function("EnrollTotp")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", "options", Route = "mfa/enroll/totp")] HttpRequestData req)
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
            var request = JsonSerializer.Deserialize<EnrollTotpRequest>(requestBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (request == null || request.UserId == Guid.Empty)
            {
                var errorResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await errorResponse.WriteAsJsonAsync(new { success = false, error = "UserId is required" });
                return errorResponse;
            }

            // Check if MFA already enabled
            var existingMfa = await _context.UserMfaSettings
                .FirstOrDefaultAsync(m => m.UserId == request.UserId);

            if (existingMfa?.IsMfaEnabled == true)
            {
                var alreadyEnabledResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await alreadyEnabledResponse.WriteAsJsonAsync(new { success = false, error = "MFA is already enabled for this user" });
                return alreadyEnabledResponse;
            }

            // Generate TOTP secret
            var secret = _totpService.GenerateSecret();
            var issuer = _configuration["Mfa:Totp:Issuer"] ?? "Hospital Portal";
            
            // TODO: Get actual user email from database
            var accountName = $"user-{request.UserId.ToString().Substring(0, 8)}";
            
            var totpUri = _totpService.GetTotpUri(secret, accountName, issuer);
            var qrCodeUrl = _qrCodeService.GenerateQrCodeDataUrl(totpUri);

            // Generate backup codes
            var backupCodeCount = int.Parse(_configuration["Mfa:BackupCodes:Count"] ?? "8");
            var backupCodeLength = int.Parse(_configuration["Mfa:BackupCodes:Length"] ?? "8");
            var backupCodes = _backupCodeService.GenerateBackupCodes(backupCodeCount, backupCodeLength);

            // Hash backup codes for storage
            var hashedBackupCodes = backupCodes.Select(code => (
                hash: _backupCodeService.HashBackupCode(code),
                used: false,
                usedAt: (DateTime?)null
            )).ToList();

            var backupCodesJson = _backupCodeService.SerializeBackupCodes(hashedBackupCodes);

            // Get tenant_id from users table (read-only query)
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == request.UserId);
            
            if (user == null)
            {
                var userNotFoundResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await userNotFoundResponse.WriteAsJsonAsync(new { success = false, error = "User not found" });
                return userNotFoundResponse;
            }

            // Create or update MFA settings (not enabled yet - pending verification)
            if (existingMfa == null)
            {
                existingMfa = new UserMfaSetting
                {
                    UserId = request.UserId,
                    TenantId = user.TenantId, // Get from user record
                    TotpSecretEncrypted = secret, // TODO: Encrypt this
                    BackupCodes = backupCodesJson,
                    BackupCodesGeneratedAt = DateTime.UtcNow,
                    IsMfaEnabled = false, // Not enabled until verified
                    TotpEnabled = false
                };
                _context.UserMfaSettings.Add(existingMfa);
            }
            else
            {
                existingMfa.TotpSecretEncrypted = secret;
                existingMfa.BackupCodes = backupCodesJson;
                existingMfa.BackupCodesGeneratedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("TOTP enrollment initiated for user {UserId}", request.UserId);

            var response = req.CreateResponse(HttpStatusCode.OK);
            AddCorsHeaders(response, origin, allowedOrigins);
            await response.WriteAsJsonAsync(new EnrollTotpResponse
            {
                Success = true,
                Secret = secret,
                QrCodeUrl = qrCodeUrl,
                QrCodeDataUrl = qrCodeUrl, // Alias for frontend
                BackupCodes = backupCodes
            });

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error enrolling TOTP");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            AddCorsHeaders(errorResponse, origin, allowedOrigins);
            await errorResponse.WriteAsJsonAsync(new { success = false, error = "An error occurred during enrollment" });
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
