using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace AuthService.Hubs
{
    public interface INotificationClient
    {
        Task ReceiveNotification(string type, string message, string details);
        Task AppointmentUpdated(string appointmentId, string status);
        Task AppointmentReminder(string appointmentId, string details);
        
        // Phase 3: Enhanced notification types
        Task NewUserCreated(string userId, string userName);
        Task UserDeactivated(string userId, string userName, string reason);
        Task EmergencyAccessGranted(string accessId, string userId, string resource);
        Task LicenseExpiring(string licenseId, string licenseName, DateTime expiryDate);
        Task ContractExpiring(string contractId, string employeeName, DateTime expiryDate);
        Task AuditThresholdExceeded(string metric, int threshold, int currentValue);
        Task SystemAlert(string alertType, string severity, string message);
        Task BreachDetected(string eventType, string severity, string description);
        Task MfaRequired(string userId, string reason);
        Task DeviceApprovalRequired(string deviceId, string deviceName, string location);
    }

    public class NotificationHub : Hub<INotificationClient>
    {
        private readonly ILogger<NotificationHub> _logger;

        public NotificationHub(ILogger<NotificationHub> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier;
            var tenantId = Context.User?.FindFirst("TenantId")?.Value;

            if (!string.IsNullOrEmpty(tenantId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"tenant_{tenantId}");
            }

            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.UserIdentifier;
            var tenantId = Context.User?.FindFirst("TenantId")?.Value;

            if (!string.IsNullOrEmpty(tenantId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"tenant_{tenantId}");
            }

            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId}");
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}