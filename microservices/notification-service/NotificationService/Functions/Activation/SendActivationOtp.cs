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
using Microsoft.EntityFrameworkCore;
using NotificationService.Data.Entities;
using Microsoft.Extensions.Configuration;

namespace NotificationService.Functions.Activation;

public class SendActivationOtp
{
    private readonly ILogger<SendActivationOtp> _logger;
    private readonly IOtpService _otpService;
    private readonly IEmailService _emailService;
    private readonly ISmsService _smsService;
    private readonly NotificationDbContext _context;
    private readonly IConfiguration _configuration;

    public SendActivationOtp(
        ILogger<SendActivationOtp> logger,
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

    [Function("SendActivationOtp")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "activation/send-otp")] HttpRequestData req)
    {
        try
        {
            _logger.LogInformation("Received activation OTP request");
            
            // Read the request body
            string requestBody;
            using (var reader = new StreamReader(req.Body))
            {
                requestBody = await reader.ReadToEndAsync();
            }
            
            _logger.LogInformation("Request body: {RequestBody}", requestBody);
            
            var request = JsonSerializer.Deserialize<SendActivationOtpRequest>(requestBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            
            _logger.LogInformation("Deserialized request: UserId={UserId}, DeliveryMethod={DeliveryMethod}, Recipient={Recipient}", 
                request?.UserId, request?.DeliveryMethod, request?.Recipient);

            if (request == null || request.UserId == Guid.Empty || string.IsNullOrEmpty(request.DeliveryMethod) || string.IsNullOrEmpty(request.Recipient))
            {
                var errorResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await errorResponse.WriteAsJsonAsync(new { success = false, error = "Invalid request. UserId, DeliveryMethod, and Recipient are required." });
                return errorResponse;
            }

            // Check rate limiting (max 3 per day)
            var today = DateTime.UtcNow.Date;
            var sentToday = await _context.OtpActivations
                .Where(o => o.UserId == request.UserId && 
                           o.Purpose == "user_activation" && 
                           o.CreatedAt >= today)
                .CountAsync();

            var maxSendsPerDay = int.Parse(_configuration["Otp:MaxSendsPerDay"] ?? "3");
            if (sentToday >= maxSendsPerDay)
            {
                var rateLimitResponse = req.CreateResponse((HttpStatusCode)429);
                await rateLimitResponse.WriteAsJsonAsync(new SendOtpResponse
                {
                    Success = false,
                    Message = $"Rate limit exceeded. Maximum {maxSendsPerDay} activation codes per day."
                });
                return rateLimitResponse;
            }

            // Generate OTP
            var expiryHours = int.Parse(_configuration["Otp:ActivationExpiryHours"] ?? "48");
            var otpCode = _otpService.GenerateOtp(6);
            var otpHash = _otpService.HashOtp(otpCode);

            _logger.LogInformation("Creating OTP record - UserId: {UserId}, TenantId: {TenantId}, OTP: {OtpCode}",
                request.UserId, request.TenantId, otpCode);

            // Create OTP record
            var otpActivation = new OtpActivation
            {
                UserId = request.UserId,
                TenantId = request.TenantId, // FIXED: Use actual tenant ID from request
                OtpHash = otpHash,
                DeliveryMethod = request.DeliveryMethod.ToLower(),
                Recipient = request.Recipient,
                Purpose = "user_activation",
                ExpiresAt = DateTime.UtcNow.AddHours(expiryHours),
                Status = "pending"
            };

            _logger.LogInformation("Saving OTP activation to database...");
            _context.OtpActivations.Add(otpActivation);
            await _context.SaveChangesAsync();
            _logger.LogInformation("OTP activation saved successfully with ID: {OtpId}", otpActivation.Id);

            // Send via email or SMS
            bool sendSuccess;
            string? messageId = null;
            string? sendError = null;

            if (request.DeliveryMethod.ToLower() == "email")
            {
                (sendSuccess, messageId, sendError) = await _emailService.SendActivationOtpAsync(
                    request.Recipient,
                    "User", // TODO: Get actual user name from database
                    otpCode,
                    expiryHours,
                    request.UserId.ToString());
            }
            else if (request.DeliveryMethod.ToLower() == "sms")
            {
                (sendSuccess, messageId, sendError) = await _smsService.SendActivationOtpAsync(
                    request.Recipient,
                    otpCode,
                    expiryHours);
            }
            else
            {
                var invalidMethodResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await invalidMethodResponse.WriteAsJsonAsync(new { success = false, error = "Invalid delivery method. Use 'email' or 'sms'." });
                return invalidMethodResponse;
            }

            // Log notification
            var log = new NotificationLog
            {
                UserId = request.UserId,
                OtpActivationId = otpActivation.Id,
                NotificationType = request.DeliveryMethod.ToLower(),
                Recipient = request.Recipient,
                Purpose = "user_activation",
                Provider = request.DeliveryMethod.ToLower() == "email" ? "azure" : "twilio",
                ProviderMessageId = messageId,
                Status = sendSuccess ? "sent" : "failed",
                ErrorMessage = sendError,
                CostUsd = request.DeliveryMethod.ToLower() == "sms" ? 0.0075m : 0m
            };

            _context.NotificationLogs.Add(log);
            await _context.SaveChangesAsync();

            if (!sendSuccess)
            {
                var sendFailResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                await sendFailResponse.WriteAsJsonAsync(new SendOtpResponse
                {
                    Success = false,
                    Message = $"Failed to send OTP: {sendError}"
                });
                return sendFailResponse;
            }

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new SendOtpResponse
            {
                Success = true,
                Message = "OTP sent successfully",
                OtpId = otpActivation.Id,
                Otp = otpCode,  // Return the actual OTP for admin to share with user
                ExpiresAt = otpActivation.ExpiresAt,
                DeliveryMethod = request.DeliveryMethod,
                MaskedRecipient = _otpService.MaskRecipient(request.Recipient)
            });

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending activation OTP");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { success = false, error = "An error occurred while sending OTP" });
            return errorResponse;
        }
    }
}
