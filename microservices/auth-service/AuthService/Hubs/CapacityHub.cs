using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace AuthService.Hubs
{
    /// <summary>
    /// SignalR Hub for real-time branch capacity updates
    /// Broadcasts bed availability changes, capacity alerts, and transfer updates
    /// </summary>
    [Authorize]
    public class CapacityHub : Hub
    {
        private readonly ILogger<CapacityHub> _logger;

        public CapacityHub(ILogger<CapacityHub> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Subscribe to capacity updates for a specific branch
        /// Client joins a SignalR group named "Branch_{branchId}"
        /// </summary>
        public async Task JoinBranchGroup(string branchId)
        {
            var tenantId = GetTenantId();
            var userId = Context.UserIdentifier;

            // Add connection to branch-specific group
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Branch_{branchId}");
            
            _logger.LogInformation(
                "User {UserId} (Tenant {TenantId}) joined capacity updates for Branch {BranchId}",
                userId, tenantId, branchId
            );

            // Optionally notify other users in the group
            await Clients.OthersInGroup($"Branch_{branchId}").SendAsync(
                "UserJoined",
                new { userId, branchId, timestamp = DateTime.UtcNow }
            );
        }

        /// <summary>
        /// Unsubscribe from capacity updates for a specific branch
        /// </summary>
        public async Task LeaveBranchGroup(string branchId)
        {
            var userId = Context.UserIdentifier;

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Branch_{branchId}");
            
            _logger.LogInformation(
                "User {UserId} left capacity updates for Branch {BranchId}",
                userId, branchId
            );

            await Clients.OthersInGroup($"Branch_{branchId}").SendAsync(
                "UserLeft",
                new { userId, branchId, timestamp = DateTime.UtcNow }
            );
        }

        /// <summary>
        /// Subscribe to capacity updates for all branches in tenant
        /// </summary>
        public async Task JoinTenantGroup()
        {
            var tenantId = GetTenantId();
            var userId = Context.UserIdentifier;

            await Groups.AddToGroupAsync(Context.ConnectionId, $"Tenant_{tenantId}");
            
            _logger.LogInformation(
                "User {UserId} joined tenant-wide capacity updates for Tenant {TenantId}",
                userId, tenantId
            );
        }

        /// <summary>
        /// Unsubscribe from tenant-wide updates
        /// </summary>
        public async Task LeaveTenantGroup()
        {
            var tenantId = GetTenantId();

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Tenant_{tenantId}");
        }

        /// <summary>
        /// Broadcast capacity update to all clients monitoring a specific branch
        /// Called by BranchCapacityService when bed status changes
        /// </summary>
        public async Task BroadcastCapacityUpdate(string branchId, object capacitySummary)
        {
            await Clients.Group($"Branch_{branchId}").SendAsync(
                "CapacityUpdated",
                new
                {
                    branchId,
                    summary = capacitySummary,
                    timestamp = DateTime.UtcNow
                }
            );

            _logger.LogInformation(
                "Broadcasted capacity update for Branch {BranchId}",
                branchId
            );
        }

        /// <summary>
        /// Broadcast bed status change to branch group
        /// </summary>
        public async Task BroadcastBedStatusChange(string branchId, object bedUpdate)
        {
            await Clients.Group($"Branch_{branchId}").SendAsync(
                "BedStatusChanged",
                new
                {
                    branchId,
                    bedUpdate,
                    timestamp = DateTime.UtcNow
                }
            );
        }

        /// <summary>
        /// Broadcast capacity alert (warning/critical) to branch group
        /// </summary>
        public async Task BroadcastCapacityAlert(string branchId, string alertLevel, object alertData)
        {
            await Clients.Group($"Branch_{branchId}").SendAsync(
                "CapacityAlert",
                new
                {
                    branchId,
                    alertLevel,
                    alertData,
                    timestamp = DateTime.UtcNow
                }
            );

            _logger.LogWarning(
                "Capacity alert {AlertLevel} for Branch {BranchId}: {AlertData}",
                alertLevel, branchId, alertData
            );
        }

        /// <summary>
        /// Broadcast transfer request update to involved branches
        /// </summary>
        public async Task BroadcastTransferUpdate(string fromBranchId, string toBranchId, object transferData)
        {
            // Notify both source and destination branches
            await Clients.Groups($"Branch_{fromBranchId}", $"Branch_{toBranchId}").SendAsync(
                "TransferUpdated",
                new
                {
                    fromBranchId,
                    toBranchId,
                    transferData,
                    timestamp = DateTime.UtcNow
                }
            );
        }

        /// <summary>
        /// Broadcast tenant-wide capacity summary to all clients in tenant
        /// </summary>
        public async Task BroadcastTenantCapacitySummary(string tenantId, object summaries)
        {
            await Clients.Group($"Tenant_{tenantId}").SendAsync(
                "TenantCapacitySummary",
                new
                {
                    tenantId,
                    summaries,
                    timestamp = DateTime.UtcNow
                }
            );
        }

        /// <summary>
        /// Called when client connects
        /// </summary>
        public override async Task OnConnectedAsync()
        {
            var tenantId = GetTenantId();
            var userId = Context.UserIdentifier;

            _logger.LogInformation(
                "Client connected: ConnectionId={ConnectionId}, UserId={UserId}, TenantId={TenantId}",
                Context.ConnectionId, userId, tenantId
            );

            // Auto-join tenant group on connection
            await JoinTenantGroup();

            await base.OnConnectedAsync();
        }

        /// <summary>
        /// Called when client disconnects
        /// </summary>
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.UserIdentifier;

            if (exception != null)
            {
                _logger.LogError(
                    exception,
                    "Client disconnected with error: ConnectionId={ConnectionId}, UserId={UserId}",
                    Context.ConnectionId, userId
                );
            }
            else
            {
                _logger.LogInformation(
                    "Client disconnected: ConnectionId={ConnectionId}, UserId={UserId}",
                    Context.ConnectionId, userId
                );
            }

            await base.OnDisconnectedAsync(exception);
        }

        /// <summary>
        /// Extract TenantId from JWT claims
        /// </summary>
        private string GetTenantId()
        {
            var tenantIdClaim = Context.User?.Claims.FirstOrDefault(c => c.Type == "TenantId");
            return tenantIdClaim?.Value ?? throw new UnauthorizedAccessException("TenantId not found in claims");
        }
    }

    /// <summary>
    /// Extension methods to broadcast capacity updates from services
    /// Usage: await _hubContext.Clients.Group($"Branch_{branchId}").SendCapacityUpdate(summary);
    /// </summary>
    public static class CapacityHubExtensions
    {
        /// <summary>
        /// Broadcast capacity update to branch group
        /// </summary>
        public static async Task SendCapacityUpdate(this IClientProxy clients, string branchId, object summary)
        {
            await clients.SendAsync("CapacityUpdated", new
            {
                branchId,
                summary,
                timestamp = DateTime.UtcNow
            });
        }

        /// <summary>
        /// Broadcast bed status change
        /// </summary>
        public static async Task SendBedStatusChange(this IClientProxy clients, string branchId, object bedUpdate)
        {
            await clients.SendAsync("BedStatusChanged", new
            {
                branchId,
                bedUpdate,
                timestamp = DateTime.UtcNow
            });
        }

        /// <summary>
        /// Broadcast capacity alert
        /// </summary>
        public static async Task SendCapacityAlert(this IClientProxy clients, string branchId, string alertLevel, object alertData)
        {
            await clients.SendAsync("CapacityAlert", new
            {
                branchId,
                alertLevel,
                alertData,
                timestamp = DateTime.UtcNow
            });
        }
    }
}
