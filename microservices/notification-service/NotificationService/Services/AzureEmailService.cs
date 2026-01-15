using Azure;
using Azure.Communication.Email;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace NotificationService.Services
{
    /// <summary>
    /// Azure Communication Services email service implementation
    /// Replaces Resend for email delivery
    /// </summary>
    public interface IAzureEmailService
    {
        Task<(bool Success, string? MessageId, string? Error)> SendEmailAsync(
            string to, 
            string subject, 
            string htmlBody, 
            string? plainTextBody = null);
    }

    public class AzureEmailService : IAzureEmailService
    {
        private readonly EmailClient _emailClient;
        private readonly string _fromEmail;
        private readonly string _fromName;
        private readonly ILogger<AzureEmailService> _logger;

        public AzureEmailService(IConfiguration configuration, ILogger<AzureEmailService> logger)
        {
            _logger = logger;
            
            var connectionString = configuration["AzureCommunication:ConnectionString"];
            _fromEmail = configuration["AzureCommunication:FromEmail"] 
                ?? throw new InvalidOperationException("AzureCommunication:FromEmail not configured");
            _fromName = configuration["AzureCommunication:FromName"] ?? "Hospital Portal";

            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException("AzureCommunication:ConnectionString not configured");
            }

            _emailClient = new EmailClient(connectionString);
            _logger.LogInformation("AzureEmailService initialized with from: {FromEmail}", _fromEmail);
        }

        public async Task<(bool Success, string? MessageId, string? Error)> SendEmailAsync(
            string to, 
            string subject, 
            string htmlBody, 
            string? plainTextBody = null)
        {
            try
            {
                _logger.LogInformation(
                    "Sending email via Azure Communication Services - To: {To}, Subject: {Subject}", 
                    to, 
                    subject);

                var emailContent = new EmailContent(subject)
                {
                    Html = htmlBody
                };

                if (!string.IsNullOrEmpty(plainTextBody))
                {
                    emailContent.PlainText = plainTextBody;
                }

                var emailMessage = new EmailMessage(
                    senderAddress: _fromEmail,
                    recipientAddress: to,
                    content: emailContent);

                EmailSendOperation emailSendOperation = await _emailClient.SendAsync(
                    WaitUntil.Started, 
                    emailMessage);

                _logger.LogInformation(
                    "Email queued successfully - MessageId: {MessageId}, Status: {Status}", 
                    emailSendOperation.Id, 
                    emailSendOperation.HasValue ? "Sent" : "Queued");

                return (true, emailSendOperation.Id, null);
            }
            catch (RequestFailedException ex)
            {
                _logger.LogError(ex, 
                    "Azure Communication Services request failed - Status: {Status}, ErrorCode: {ErrorCode}, Message: {Message}", 
                    ex.Status, 
                    ex.ErrorCode, 
                    ex.Message);

                return (false, null, $"Email service error: {ex.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error sending email via Azure Communication Services");
                return (false, null, $"Failed to send email: {ex.Message}");
            }
        }
    }
}
