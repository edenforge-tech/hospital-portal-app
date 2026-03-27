using AuthService.Models;
using AuthService.Models.Domain;
using AuthService.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace AuthService.Services;

public class BackgroundReminderService : BackgroundService
{
    private readonly ILogger<BackgroundReminderService> _logger;
    private readonly IServiceProvider _serviceProvider;
    private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(15); // Check every 15 minutes

    public BackgroundReminderService(
        ILogger<BackgroundReminderService> _logger,
        IServiceProvider serviceProvider)
    {
        this._logger = _logger;
        this._serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Background Reminder Service started at: {time}", DateTimeOffset.Now);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessPendingRemindersAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing reminders: {message}", ex.Message);
            }

            await Task.Delay(_checkInterval, stoppingToken);
        }

        _logger.LogInformation("Background Reminder Service stopped at: {time}", DateTimeOffset.Now);
    }

    private async Task ProcessPendingRemindersAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var emailService = scope.ServiceProvider.GetService<IEmailService>();
        var smsService = scope.ServiceProvider.GetService<ISmsService>();

        var now = DateTime.UtcNow;
        var checkUntil = now.AddMinutes(30); // Process reminders due in next 30 minutes

        // Get pending reminders
        var pendingReminders = await context.AppointmentReminders
            .Include(r => r.Appointment)
                .ThenInclude(a => a!.Patient)
            .Include(r => r.Appointment)
                .ThenInclude(a => a!.Doctor)
            .Where(r => r.ScheduledTime <= checkUntil &&
                       r.ScheduledTime > now.AddMinutes(-15) && // Don't reprocess old ones
                       r.SentAt == null &&
                       r.DeliveryStatus == "pending" &&
                       r.Appointment != null &&
                       r.Appointment.Status != "Cancelled" &&
                       r.Appointment.DeletedAt == null)
            .ToListAsync();

        _logger.LogInformation("Found {count} pending reminders to process", pendingReminders.Count);

        foreach (var reminder in pendingReminders)
        {
            try
            {
                var sent = await SendReminderAsync(reminder, emailService, smsService);

                if (sent)
                {
                    reminder.DeliveryStatus = "sent";
                    reminder.SentAt = DateTime.UtcNow;
                    _logger.LogInformation("Sent reminder {reminderId} via {method} for appointment {appointmentId}",
                    reminder.Id, reminder.ReminderType, reminder.AppointmentId);
                }
                else
                {
                    reminder.DeliveryStatus = "failed";
                    reminder.ErrorMessage = "Delivery failed";
                    _logger.LogWarning("Failed to send reminder {reminderId} via {method}",
                        reminder.Id, reminder.ReminderType);
                }
            }
            catch (Exception ex)
            {
                reminder.Status = "Failed";
                reminder.ErrorMessage = ex.Message;
                _logger.LogError(ex, "Error sending reminder {reminderId}: {message}",
                    reminder.Id, ex.Message);
            }
        }

        if (pendingReminders.Any())
        {
            await context.SaveChangesAsync();
        }

        // ── Counselor callback reminders ──────────────────────────────────────
        await ProcessCallbackRemindersAsync(context, smsService);
    }

    private async Task ProcessCallbackRemindersAsync(AppDbContext context, ISmsService? smsService)
    {
        var now = DateTime.UtcNow;
        // Remind about callbacks due today or tomorrow
        var tomorrow = now.Date.AddDays(1);

        var dueCallbacks = await context.CounselorCallbackRequests
            .Where(c =>
                c.CallbackDate <= tomorrow &&
                c.CallbackStatus == "Scheduled" &&
                c.PatientReminderSentAt == null &&
                c.DeletedAt == null)
            .ToListAsync();

        if (!dueCallbacks.Any()) return;

        _logger.LogInformation("Found {count} callback reminders to send", dueCallbacks.Count);

        var patientIds = dueCallbacks.Select(c => c.PatientId).Distinct().ToList();
        var patientPhones = await context.Patients
            .Where(p => patientIds.Contains(p.Id) && p.DeletedAt == null)
            .Select(p => new { p.Id, p.ContactNumber, p.FirstName, p.LastName })
            .ToDictionaryAsync(p => p.Id);

        foreach (var cb in dueCallbacks)
        {
            try
            {
                patientPhones.TryGetValue(cb.PatientId, out var patient);
                var phone = patient?.ContactNumber;

                // Send SMS if channel is SMS/WhatsApp and phone is available
                if (smsService != null && !string.IsNullOrEmpty(phone) &&
                    (cb.Channel == "SMS" || cb.Channel == "WhatsApp"))
                {
                    var dateLabel = cb.CallbackDate.Date == now.Date ? "today" : "tomorrow";
                    var msg = $"Reminder: A counselor will call you {dateLabel}" +
                              (cb.CallbackTime.HasValue ? $" at {cb.CallbackTime:hh\\:mm}" : "") +
                              ". Please keep your phone available.";

                    await smsService.SendSmsAsync(phone, msg);
                    _logger.LogInformation("Sent callback reminder SMS to patient {patientId}", cb.PatientId);
                }

                cb.PatientReminderSentAt = now;
                cb.UpdatedAt = now;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending callback reminder for callback {callbackId}", cb.Id);
            }
        }

        await context.SaveChangesAsync();
    }

    private async Task<bool> SendReminderAsync(
        AppointmentReminder reminder,
        IEmailService? emailService,
        ISmsService? smsService)
    {
        var appointment = reminder.Appointment;
        if (appointment == null) return false;
        
        var patient = appointment.Patient;
        var doctor = appointment.Doctor;

        var appointmentDetails = $@"
Appointment Reminder

Date: {appointment.AppointmentDate:MMMM dd, yyyy}
Time: {appointment.StartTime:hh\\:mm tt} - {appointment.EndTime:hh\\:mm tt}
Doctor: Dr. {doctor?.FirstName} {doctor?.LastName}
Reason: {appointment.AppointmentType ?? "Consultation"}
Location: Main Clinic

Please arrive 15 minutes early for check-in.
";

        switch (reminder.ReminderType?.ToLower())
        {
            case "email":
                if (emailService == null || string.IsNullOrEmpty(patient?.Email))
                    return false;

                return await emailService.SendEmailAsync(
                    to: patient.Email,
                    subject: "Appointment Reminder",
                    body: appointmentDetails);

            case "sms":
                if (smsService == null || string.IsNullOrEmpty(patient?.ContactNumber))
                    return false;

                return await smsService.SendSmsAsync(
                    to: patient.ContactNumber,
                    message: $"Appointment reminder: {appointment.AppointmentDate:MMM dd} at {appointment.StartTime:hh\\:mm tt} with Dr. {doctor?.LastName}. Reply CONFIRM to confirm.");

            case "push":
                // TODO: Implement push notification service
                _logger.LogWarning("Push notifications not yet implemented");
                return false;

            default:
                _logger.LogWarning("Unknown reminder type: {type}", reminder.ReminderType);
                return false;
        }
    }
}

// Email Service Interface and Implementation
public interface IEmailService
{
    Task<bool> SendEmailAsync(string to, string subject, string body);
}

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;
    private readonly IConfiguration _configuration;

    public EmailService(ILogger<EmailService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    public async Task<bool> SendEmailAsync(string to, string subject, string body)
    {
        try
        {
            // TODO: Implement actual SMTP sending
            // Example using MailKit:
            /*
            var smtpHost = _configuration["Email:SmtpHost"];
            var smtpPort = int.Parse(_configuration["Email:SmtpPort"]);
            var smtpUser = _configuration["Email:SmtpUser"];
            var smtpPass = _configuration["Email:SmtpPassword"];
            var fromEmail = _configuration["Email:FromAddress"];
            var fromName = _configuration["Email:FromName"];

            using var client = new SmtpClient();
            await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(smtpUser, smtpPass);

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(fromName, fromEmail));
            message.To.Add(MailboxAddress.Parse(to));
            message.Subject = subject;
            message.Body = new TextPart("plain") { Text = body };

            await client.SendAsync(message);
            await client.DisconnectAsync(true);
            */

            _logger.LogInformation("Email sent to {to}: {subject}", to, subject);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {to}: {message}", to, ex.Message);
            return false;
        }
    }
}

// SMS Service Interface and Implementation
public interface ISmsService
{
    Task<bool> SendSmsAsync(string to, string message);
}

public class SmsService : ISmsService
{
    private readonly ILogger<SmsService> _logger;
    private readonly IConfiguration _configuration;

    public SmsService(ILogger<SmsService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    public async Task<bool> SendSmsAsync(string to, string message)
    {
        try
        {
            var accountSid = _configuration["Twilio:AccountSid"];
            var authToken = _configuration["Twilio:AuthToken"];
            var fromNumber = _configuration["Twilio:FromNumber"];

            if (string.IsNullOrWhiteSpace(accountSid) || accountSid.StartsWith("your-") ||
                string.IsNullOrWhiteSpace(authToken) || authToken.StartsWith("your-") ||
                string.IsNullOrWhiteSpace(fromNumber))
            {
                _logger.LogWarning("Twilio credentials not configured. SMS to {To} would contain: {Message}", to, message);
                return false;
            }

            TwilioClient.Init(accountSid, authToken);
            var smsMessage = await MessageResource.CreateAsync(
                to: new PhoneNumber(to),
                from: new PhoneNumber(fromNumber),
                body: message
            );

            _logger.LogInformation("SMS sent to {To} — SID: {Sid}", to, smsMessage.Sid);
            return smsMessage.ErrorCode == null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send SMS to {To}", to);
            return false;
        }
    }
}
