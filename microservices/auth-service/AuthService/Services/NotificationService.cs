using AuthService.Hubs;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace AuthService.Services
{
    public interface INotificationService
    {
        Task SendUserNotificationAsync(Guid userId, string type, string message, string details);
        Task SendTenantNotificationAsync(Guid tenantId, string type, string message, string details);
        Task NotifyAppointmentUpdatedAsync(Guid appointmentId, string status, Guid userId, Guid tenantId);
        Task SendAppointmentReminderAsync(Guid appointmentId, string details, Guid userId);
    }

    public class NotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub, INotificationClient> _hubContext;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            IHubContext<NotificationHub, INotificationClient> hubContext,
            ILogger<NotificationService> logger)
        {
            _hubContext = hubContext;
            _logger = logger;
        }

        public async Task SendUserNotificationAsync(Guid userId, string type, string message, string details)
        {
            try
            {
                await _hubContext.Clients.Group($"user_{userId}")
                    .ReceiveNotification(type, message, details);

                _logger.LogInformation($"Notification sent to user {userId}: {type} - {message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending notification to user {userId}");
            }
        }

        public async Task SendTenantNotificationAsync(Guid tenantId, string type, string message, string details)
        {
            try
            {
                await _hubContext.Clients.Group($"tenant_{tenantId}")
                    .ReceiveNotification(type, message, details);

                _logger.LogInformation($"Notification sent to tenant {tenantId}: {type} - {message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending notification to tenant {tenantId}");
            }
        }

        public async Task NotifyAppointmentUpdatedAsync(Guid appointmentId, string status, Guid userId, Guid tenantId)
        {
            try
            {
                // Notify specific user
                await _hubContext.Clients.Group($"user_{userId}")
                    .AppointmentUpdated(appointmentId.ToString(), status);

                // Also notify tenant group for admin awareness
                await _hubContext.Clients.Group($"tenant_{tenantId}")
                    .ReceiveNotification(
                        "AppointmentUpdate",
                        $"Appointment {appointmentId} status changed to {status}",
                        $"Appointment status update for appointment {appointmentId}");

                _logger.LogInformation($"Appointment update notification sent for appointment {appointmentId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending appointment update notification for appointment {appointmentId}");
            }
        }

        public async Task SendAppointmentReminderAsync(Guid appointmentId, string details, Guid userId)
        {
            try
            {
                await _hubContext.Clients.Group($"user_{userId}")
                    .AppointmentReminder(appointmentId.ToString(), details);

                _logger.LogInformation($"Appointment reminder sent for appointment {appointmentId} to user {userId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending appointment reminder for appointment {appointmentId}");
            }
        }
    }
}