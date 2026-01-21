using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Text.Json;
using NotificationService.Models.Requests;
using NotificationService.Models.Responses;
using NotificationService.Services.Email;
using NotificationService.Services.Sms;
using NotificationService.Services.Otp;
using NotificationService.Data;
using NotificationService.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace NotificationService.Functions.Mfa;

public class SendMfaLoginOtp
{
    private readonly ILogger<SendMfaLoginOtp> _logger;
    private readonly IOtpService _otpService;
    private readonly IEmailService _emailService;
    private readonly ISmsService _smsService;
    private readonly NotificationDbContext _context;
    private readonly IConfiguration _configuration;

    public SendMfaLoginOtp(
        ILogger<SendMfaLoginOtp> logger,
        IOtpService otpService,
        IEmailService emailService,
        ISmsService smsService,
        NotificationDbContext context,
        IConfiguration configuration)
    {
        _logger = logger;
        _otpService = otpService;
        _emailService = emailService;
        _smsService = smsService;
        _context = context;
        _configuration = configuration;
    }

    [Function("SendMfaLoginOtp")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "mfa/send-login-otp")] HttpRequestData req)
    {
        try
        {
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var request = JsonSerializer.Deserialize<SendMfaLoginOtpRequest>(requestBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (request == null || request.UserId == Guid.Empty || string.IsNullOrEmpty(request.Method))
            {
                var errorResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await errorResponse.WriteAsJsonAsync(new { success = false, error = "UserId and Method are required" });
                return errorResponse;
            }

            // Get user MFA settings
            var mfaSetting = await _context.UserMfaSettings
                .FirstOrDefaultAsync(m => m.UserId == request.UserId && m.IsMfaEnabled);

            if (mfaSetting == null)
            {
                var notEnabledResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await notEnabledResponse.WriteAsJsonAsync(new { success = false, error = "MFA is not enabled for this user" });
                return notEnabledResponse;
            }

            // Determine recipient based on method
            string recipient;
            string deliveryMethod;

            if (request.Method.ToLower() == "sms" && mfaSetting.SmsEnabled)
            {
                // TODO: Get phone from user table
                recipient = "+1234567890"; // Placeholder
                deliveryMethod = "sms";
            }
            else if (request.Method.ToLower() == "email" && mfaSetting.EmailEnabled)
            {
                // TODO: Get email from user table
                recipient = "user@example.com"; // Placeholder
                deliveryMethod = "email";
            }
            else
            {
                var methodNotEnabledResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await methodNotEnabledResponse.WriteAsJsonAsync(new { success = false, error = $"MFA method '{request.Method}' is not enabled for this user" });
                return methodNotEnabledResponse;
            }

            // Generate OTP
            var expiryMinutes = int.Parse(_configuration["Otp:MfaExpiryMinutes"] ?? "5");
            var otpCode = _otpService.GenerateOtp(6);
            var otpHash = _otpService.HashOtp(otpCode);

            // Create OTP record
            var otpActivation = new OtpActivation
            {
                UserId = request.UserId,
                TenantId = mfaSetting.TenantId,
                OtpHash = otpHash,
                DeliveryMethod = deliveryMethod,
                Recipient = recipient,
                Purpose = "mfa_login",
                ExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes),
                Status = "pending"
            };

            _context.OtpActivations.Add(otpActivation);
            await _context.SaveChangesAsync();

            // Send OTP
            bool sendSuccess;
            string? messageId = null;
            string? sendError = null;

            if (deliveryMethod == "email")
            {
                (sendSuccess, messageId, sendError) = await _emailService.SendMfaLoginOtpAsync(
                    recipient,
                    "User", // TODO: Get actual user name
                    otpCode,
                    expiryMinutes);
            }
            else
            {
                (sendSuccess, messageId, sendError) = await _smsService.SendMfaLoginOtpAsync(
                    recipient,
                    otpCode,
                    expiryMinutes);
            }

            // Log notification
            var log = new NotificationLog
            {
                UserId = request.UserId,
                TenantId = mfaSetting.TenantId,
                OtpActivationId = otpActivation.Id,
                NotificationType = deliveryMethod,
                Recipient = recipient,
                Purpose = "mfa_login",
                Provider = deliveryMethod == "email" ? "resend" : "twilio",
                ProviderMessageId = messageId,
                Status = sendSuccess ? "sent" : "failed",
                ErrorMessage = sendError,
                CostUsd = deliveryMethod == "sms" ? 0.0075m : 0m
            };

            _context.NotificationLogs.Add(log);
            await _context.SaveChangesAsync();

            if (!sendSuccess)
            {
                var sendFailResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                await sendFailResponse.WriteAsJsonAsync(new { success = false, error = $"Failed to send OTP: {sendError}" });
                return sendFailResponse;
            }

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new SendOtpResponse
            {
                Success = true,
                Message = "MFA login OTP sent successfully",
                OtpId = otpActivation.Id,
                ExpiresAt = otpActivation.ExpiresAt,
                DeliveryMethod = deliveryMethod,
                MaskedRecipient = _otpService.MaskRecipient(recipient)
            });

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending MFA login OTP");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { success = false, error = "An error occurred while sending OTP" });
            return errorResponse;
        }
    }
}
