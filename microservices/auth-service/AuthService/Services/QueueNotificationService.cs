using Microsoft.AspNetCore.SignalR;
using AuthService.Hubs;

namespace AuthService.Services;

/// <summary>
/// Service for broadcasting real-time queue updates via SignalR
/// </summary>
public interface IQueueNotificationService
{
    Task NotifyQueueUpdate(Guid tenantId, Guid branchId, Guid? departmentId, string queueType, object updateData);
    Task NotifyPatientCalled(Guid tenantId, Guid branchId, string patientName, string queueType);
    Task NotifyQueuePositionChange(Guid tenantId, Guid branchId, Guid patientId, int oldPosition, int newPosition);
    Task NotifyPatientStatusChange(Guid tenantId, Guid branchId, Guid patientId, string oldStatus, string newStatus);
}

public class QueueNotificationService : IQueueNotificationService
{
    private readonly IHubContext<QueueHub> _hubContext;
    private readonly ILogger<QueueNotificationService> _logger;

    public QueueNotificationService(
        IHubContext<QueueHub> hubContext,
        ILogger<QueueNotificationService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    /// <summary>
    /// Broadcast general queue update to all subscribers
    /// </summary>
    public async Task NotifyQueueUpdate(
        Guid tenantId, 
        Guid branchId, 
        Guid? departmentId, 
        string queueType, 
        object updateData)
    {
        try
        {
            var groupName = $"Queue-{tenantId}-{branchId}-{departmentId}-{queueType}";
            
            await _hubContext.Clients.Group(groupName).SendAsync("QueueUpdated", new
            {
                TenantId = tenantId,
                BranchId = branchId,
                DepartmentId = departmentId,
                QueueType = queueType,
                Timestamp = DateTime.UtcNow,
                Data = updateData
            });

            // Also broadcast to branch-level subscribers (admin, reception)
            var branchGroupName = $"Branch-{tenantId}-{branchId}";
            await _hubContext.Clients.Group(branchGroupName).SendAsync("QueueUpdated", new
            {
                TenantId = tenantId,
                BranchId = branchId,
                DepartmentId = departmentId,
                QueueType = queueType,
                Timestamp = DateTime.UtcNow,
                Data = updateData
            });

            _logger.LogInformation(
                "Queue update broadcast to {GroupName}: {UpdateData}",
                groupName,
                System.Text.Json.JsonSerializer.Serialize(updateData)
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting queue update");
        }
    }

    /// <summary>
    /// Notify when a patient is called from the queue
    /// </summary>
    public async Task NotifyPatientCalled(
        Guid tenantId, 
        Guid branchId, 
        string patientName, 
        string queueType)
    {
        try
        {
            // Broadcast to all subscribers in the branch
            var branchGroupName = $"Branch-{tenantId}-{branchId}";
            
            await _hubContext.Clients.Group(branchGroupName).SendAsync("PatientCalled", new
            {
                TenantId = tenantId,
                BranchId = branchId,
                PatientName = patientName,
                QueueType = queueType,
                Timestamp = DateTime.UtcNow
            });

            _logger.LogInformation(
                "Patient called notification: {PatientName} in {QueueType}",
                patientName,
                queueType
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting patient called notification");
        }
    }

    /// <summary>
    /// Notify when a patient's position in queue changes
    /// </summary>
    public async Task NotifyQueuePositionChange(
        Guid tenantId, 
        Guid branchId, 
        Guid patientId, 
        int oldPosition, 
        int newPosition)
    {
        try
        {
            var branchGroupName = $"Branch-{tenantId}-{branchId}";
            
            await _hubContext.Clients.Group(branchGroupName).SendAsync("QueuePositionChanged", new
            {
                TenantId = tenantId,
                BranchId = branchId,
                PatientId = patientId,
                OldPosition = oldPosition,
                NewPosition = newPosition,
                Timestamp = DateTime.UtcNow
            });

            _logger.LogInformation(
                "Queue position changed for patient {PatientId}: {OldPosition} -> {NewPosition}",
                patientId,
                oldPosition,
                newPosition
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting queue position change");
        }
    }

    /// <summary>
    /// Notify when patient status changes (e.g., Waiting -> In Progress -> Completed)
    /// </summary>
    public async Task NotifyPatientStatusChange(
        Guid tenantId, 
        Guid branchId, 
        Guid patientId, 
        string oldStatus, 
        string newStatus)
    {
        try
        {
            var branchGroupName = $"Branch-{tenantId}-{branchId}";
            
            await _hubContext.Clients.Group(branchGroupName).SendAsync("PatientStatusChanged", new
            {
                TenantId = tenantId,
                BranchId = branchId,
                PatientId = patientId,
                OldStatus = oldStatus,
                NewStatus = newStatus,
                Timestamp = DateTime.UtcNow
            });

            _logger.LogInformation(
                "Patient status changed: {PatientId} from {OldStatus} to {NewStatus}",
                patientId,
                oldStatus,
                newStatus
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting patient status change");
        }
    }
}
