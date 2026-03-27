using AuthService.Hubs;
using AuthService.Context;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace AuthService.Services
{
    public interface INotificationService
    {
        // Existing methods
        Task SendUserNotificationAsync(Guid userId, string type, string message, string details);
        Task SendTenantNotificationAsync(Guid tenantId, string type, string message, string details);
        Task NotifyAppointmentUpdatedAsync(Guid appointmentId, string status, Guid userId, Guid tenantId);
        Task SendAppointmentReminderAsync(Guid appointmentId, string details, Guid userId);
        
        // Phase 3: User events
        Task NotifyNewUserCreatedAsync(Guid tenantId, Guid userId, string userName);
        Task NotifyUserDeactivatedAsync(Guid tenantId, Guid userId, string userName, string reason);
        
        // Phase 3: Emergency access
        Task NotifyEmergencyAccessGrantedAsync(Guid tenantId, Guid accessId, Guid userId, string resource);
        
        // Phase 3: Expiration warnings
        Task NotifyLicenseExpiringAsync(Guid tenantId, Guid licenseId, string licenseName, DateTime expiryDate);
        Task NotifyContractExpiringAsync(Guid tenantId, Guid contractId, string employeeName, DateTime expiryDate);
        
        // Phase 3: Audit and compliance
        Task NotifyAuditThresholdExceededAsync(Guid tenantId, string metric, int threshold, int currentValue);
        Task NotifyBreachDetectedAsync(Guid tenantId, string eventType, string severity, string description);
        
        // Phase 3: Security
        Task NotifySystemAlertAsync(Guid tenantId, string alertType, string severity, string message);
        Task NotifyMfaRequiredAsync(Guid tenantId, Guid userId, string reason);
        Task NotifyDeviceApprovalRequiredAsync(Guid tenantId, Guid deviceId, string deviceName, string location);
        
        // Targeted notifications
        Task NotifyRoleAsync(Guid tenantId, string roleCode, string type, string message, string details);
    }

    public class NotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub, AuthService.Hubs.INotificationClient> _hubContext;
        private readonly AppDbContext _context;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            IHubContext<NotificationHub, AuthService.Hubs.INotificationClient> hubContext,
            AppDbContext context,
            ILogger<NotificationService> logger)
        {
            _hubContext = hubContext;
            _context = context;
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

        #region Phase 3: User Events

        public async Task NotifyNewUserCreatedAsync(Guid tenantId, Guid userId, string userName)
        {
            try
            {
                await _hubContext.Clients.Group($"tenant_{tenantId}")
                    .NewUserCreated(userId.ToString(), userName);
                
                _logger.LogInformation("Notified tenant {TenantId} of new user: {UserName}", tenantId, userName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send NewUserCreated notification");
            }
        }

        public async Task NotifyUserDeactivatedAsync(Guid tenantId, Guid userId, string userName, string reason)
        {
            try
            {
                await _hubContext.Clients.Group($"tenant_{tenantId}")
                    .UserDeactivated(userId.ToString(), userName, reason);
                
                _logger.LogInformation("Notified tenant {TenantId} of user deactivation: {UserName}", tenantId, userName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send UserDeactivated notification");
            }
        }

        #endregion

        #region Phase 3: Emergency Access

        public async Task NotifyEmergencyAccessGrantedAsync(Guid tenantId, Guid accessId, Guid userId, string resource)
        {
            try
            {
                await _hubContext.Clients.Group($"tenant_{tenantId}")
                    .EmergencyAccessGranted(accessId.ToString(), userId.ToString(), resource);
                
                _logger.LogWarning("Emergency access granted: User {UserId} accessed {Resource}", userId, resource);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send EmergencyAccessGranted notification");
            }
        }

        #endregion

        #region Phase 3: Expiration Warnings

        public async Task NotifyLicenseExpiringAsync(Guid tenantId, Guid licenseId, string licenseName, DateTime expiryDate)
        {
            try
            {
                await _hubContext.Clients.Group($"tenant_{tenantId}")
                    .LicenseExpiring(licenseId.ToString(), licenseName, expiryDate);
                
                _logger.LogInformation("Notified tenant {TenantId} of license expiring: {LicenseName} on {ExpiryDate}", 
                    tenantId, licenseName, expiryDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send LicenseExpiring notification");
            }
        }

        public async Task NotifyContractExpiringAsync(Guid tenantId, Guid contractId, string employeeName, DateTime expiryDate)
        {
            try
            {
                await _hubContext.Clients.Group($"tenant_{tenantId}")
                    .ContractExpiring(contractId.ToString(), employeeName, expiryDate);
                
                _logger.LogInformation("Notified tenant {TenantId} of contract expiring: {EmployeeName} on {ExpiryDate}", 
                    tenantId, employeeName, expiryDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send ContractExpiring notification");
            }
        }

        #endregion

        #region Phase 3: Audit and Compliance

        public async Task NotifyAuditThresholdExceededAsync(Guid tenantId, string metric, int threshold, int currentValue)
        {
            try
            {
                await _hubContext.Clients.Group($"tenant_{tenantId}")
                    .AuditThresholdExceeded(metric, threshold, currentValue);
                
                _logger.LogWarning("Audit threshold exceeded for {Metric}: {CurrentValue}/{Threshold}", 
                    metric, currentValue, threshold);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send AuditThresholdExceeded notification");
            }
        }

        public async Task NotifyBreachDetectedAsync(Guid tenantId, string eventType, string severity, string description)
        {
            try
            {
                await _hubContext.Clients.Group($"tenant_{tenantId}")
                    .BreachDetected(eventType, severity, description);
                
                _logger.LogCritical("Breach detected for tenant {TenantId}: {EventType} - {Description}", 
                    tenantId, eventType, description);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send BreachDetected notification");
            }
        }

        #endregion

        #region Phase 3: Security

        public async Task NotifySystemAlertAsync(Guid tenantId, string alertType, string severity, string message)
        {
            try
            {
                await _hubContext.Clients.Group($"tenant_{tenantId}")
                    .SystemAlert(alertType, severity, message);
                
                _logger.LogWarning("System alert for tenant {TenantId}: {AlertType} - {Message}", 
                    tenantId, alertType, message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send SystemAlert notification");
            }
        }

        public async Task NotifyMfaRequiredAsync(Guid tenantId, Guid userId, string reason)
        {
            try
            {
                await _hubContext.Clients.Group($"user_{userId}")
                    .MfaRequired(userId.ToString(), reason);
                
                _logger.LogInformation("MFA required for user {UserId}: {Reason}", userId, reason);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send MfaRequired notification");
            }
        }

        public async Task NotifyDeviceApprovalRequiredAsync(Guid tenantId, Guid deviceId, string deviceName, string location)
        {
            try
            {
                await _hubContext.Clients.Group($"tenant_{tenantId}")
                    .DeviceApprovalRequired(deviceId.ToString(), deviceName, location);
                
                _logger.LogInformation("Device approval required: {DeviceName} from {Location}", deviceName, location);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send DeviceApprovalRequired notification");
            }
        }

        #endregion

        #region Targeted Notifications

        public async Task NotifyRoleAsync(Guid tenantId, string roleCode, string type, string message, string details)
        {
            try
            {
                // Get all users with this role
                var userIds = await _context.Set<Models.Identity.AppUserRole>()
                    .Where(ur => ur.Role.RoleCode == roleCode && ur.Role.TenantId == tenantId)
                    .Select(ur => ur.UserId)
                    .ToListAsync();

                foreach (var userId in userIds)
                {
                    await _hubContext.Clients.Group($"user_{userId}")
                        .ReceiveNotification(type, message, details);
                }
                
                _logger.LogInformation("Role notification sent to {RoleCode} in tenant {TenantId}: {Type}", 
                    roleCode, tenantId, type);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send role notification");
            }
        }

        #endregion
    }
}