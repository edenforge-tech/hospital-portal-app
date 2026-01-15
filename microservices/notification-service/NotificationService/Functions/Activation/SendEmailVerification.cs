using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Text.Json;
using NotificationService.Services.Email;
using NotificationService.Services.Token;
using NotificationService.Data;
using NotificationService.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace NotificationService.Functions.Activation
{
    public class SendEmailVerification
    {
        private readonly ILogger<SendEmailVerification> _logger;
        private readonly IEmailService _emailService;
        private readonly ITokenService _tokenService;
        private readonly NotificationDbContext _context;

        public SendEmailVerification(
            ILogger<SendEmailVerification> logger,
            IEmailService emailService,
            ITokenService tokenService,
            NotificationDbContext context)
        {
            _logger = logger;
            _emailService = emailService;
            _tokenService = tokenService;
            _context = context;
        }

        [Function("SendEmailVerification")]
        public async Task<HttpResponseData> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "activation/send-email-verification")] HttpRequestData req)
        {
            _logger.LogInformation("SendEmailVerification function triggered");

            // Read request body
            string requestBody;
            using (var reader = new StreamReader(req.Body))
            {
                requestBody = await reader.ReadToEndAsync();
            }

            var request = JsonSerializer.Deserialize<SendEmailVerificationRequest>(requestBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (request == null || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.UserId))
            {
                var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequest.WriteAsJsonAsync(new
                {
                    success = false,
                    error = "Email and UserId are required"
                });
                return badRequest;
            }

            try
            {
                // Generate verification token
                var token = _tokenService.GenerateEmailVerificationToken(request.Email, request.UserId);
                
                // Verification URL - TODO: Replace with production URL
                var verificationUrl = $"http://localhost:3000/verify-email?token={token}";

                // Send verification email
                var subject = "Verify Your Email - Hospital Portal";
                var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }}
        .verify-button {{ display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }}
        .verify-button:hover {{ background: #059669; }}
        .warning {{ background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1 style=""margin: 0; font-size: 28px;"">Verify Your Email</h1>
            <p style=""margin: 10px 0 0 0; opacity: 0.9;"">Hospital Portal</p>
        </div>
        <div class=""content"">
            <p>Hello,</p>
            <p>Please verify your email address to complete your Hospital Portal account activation.</p>
            
            <div style=""text-align: center;"">
                <a href=""{verificationUrl}"" class=""verify-button"">Verify Email Address</a>
            </div>
            
            <div class=""warning"">
                <strong>⚠️ Important:</strong>
                <ul style=""margin: 10px 0 0 0;"">
                    <li>This link expires in 24 hours</li>
                    <li>You must verify your email before activating your account</li>
                    <li>If you didn't request this, please ignore this email</li>
                </ul>
            </div>
            
            <p style=""color: #6b7280; font-size: 14px; margin-top: 20px;"">
                If the button doesn't work, copy and paste this URL into your browser:<br>
                <a href=""{verificationUrl}"">{verificationUrl}</a>
            </p>
        </div>
        <div class=""footer"">
            <p>This is an automated email from Hospital Portal. Please do not reply.</p>
            <p>&copy; 2026 Hospital Portal. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

                var plainTextBody = $@"
Verify Your Email - Hospital Portal

Hello,

Please verify your email address to complete your Hospital Portal account activation.

Click here to verify: {verificationUrl}

⚠️ Important:
- This link expires in 24 hours
- You must verify your email before activating your account
- If you didn't request this, please ignore this email

If the link doesn't work, copy and paste this URL into your browser:
{verificationUrl}

---
This is an automated email from Hospital Portal. Please do not reply.
© 2026 Hospital Portal. All rights reserved.
";

                // Log to notification_logs
                var notificationLog = new NotificationLog
                {
                    Id = Guid.NewGuid(),
                    UserId = Guid.Parse(request.UserId),
                    NotificationType = "email",
                    Recipient = request.Email,
                    Purpose = "email_verification",
                    Subject = subject,
                    Body = plainTextBody,
                    Status = "pending",
                    SentAt = DateTime.UtcNow
                };
                _context.NotificationLogs.Add(notificationLog);
                await _context.SaveChangesAsync();

                // Send email using Azure Communication Services
                var emailClient = new Azure.Communication.Email.EmailClient(
                    Environment.GetEnvironmentVariable("AzureCommunication__ConnectionString") ?? ""
                );
                
                var emailContent = new Azure.Communication.Email.EmailContent(subject)
                {
                    PlainText = plainTextBody,
                    Html = htmlBody
                };

                var emailMessage = new Azure.Communication.Email.EmailMessage(
                    Environment.GetEnvironmentVariable("AzureCommunication__FromEmail") ?? "",
                    request.Email,
                    emailContent
                );

                var emailResult = await emailClient.SendAsync(Azure.WaitUntil.Started, emailMessage);

                // Update log with result
                notificationLog.Status = "sent";
                notificationLog.SentAt = DateTime.UtcNow;
                notificationLog.ProviderMessageId = emailResult.Id;
                await _context.SaveChangesAsync();

                var response = req.CreateResponse(HttpStatusCode.OK);
                await response.WriteAsJsonAsync(new
                {
                    success = true,
                    message = "Verification email sent successfully"
                });

                _logger.LogInformation("Email verification sent to {Email}", request.Email);

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending email verification to {Email}", request.Email);
                
                var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                await errorResponse.WriteAsJsonAsync(new
                {
                    success = false,
                    error = "Failed to send verification email. Please try again."
                });
                return errorResponse;
            }
        }
    }

    public class SendEmailVerificationRequest
    {
        public string Email { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
    }
}
