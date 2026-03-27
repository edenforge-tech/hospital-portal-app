using AuthService.Context;
using AuthService.Models.Domain;
using AuthService.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using AuthService.Hubs;

namespace AuthService.Services
{
    public class QueueService : IQueueService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<QueueService> _logger;
        private readonly IHubContext<QueueHub> _hubContext;

        public QueueService(AppDbContext context, ILogger<QueueService> logger, IHubContext<QueueHub> hubContext)
        {
            _context = context;
            _logger = logger;
            _hubContext = hubContext;
        }

        public async Task<Dictionary<string, object>> GetAllQueuesAsync(Guid branchId)
        {
            var queues = await _context.QueueItems
                .Where(q => q.BranchId == branchId && q.Status == "waiting")
                .Include(q => q.Patient)
                .Include(q => q.Appointment)
                .OrderBy(q => q.CheckedInAt)
                .ToListAsync();

            var groupedQueues = new Dictionary<string, List<QueueItem>>
            {
                ["Optometry"] = queues.Where(q => q.QueueType == "Optometry").ToList(),
                ["Doctor"] = queues.Where(q => q.QueueType == "Doctor").ToList(),
                ["Billing"] = queues.Where(q => q.QueueType == "Billing").ToList(),
                ["Pharmacy"] = queues.Where(q => q.QueueType == "Pharmacy").ToList()
            };

            var stats = new Dictionary<string, object>();
            foreach (var queueType in new[] { "Optometry", "Doctor", "Billing", "Pharmacy" })
            {
                var queueItems = groupedQueues[queueType];
                var completed = await _context.QueueItems
                    .Where(q => q.BranchId == branchId && q.QueueType == queueType && 
                                q.Status == "completed" && q.CheckedInAt.Date == DateTime.UtcNow.Date)
                    .CountAsync();

                var absent = await _context.QueueItems
                    .Where(q => q.BranchId == branchId && q.QueueType == queueType && 
                                q.Status == "absent" && q.CheckedInAt.Date == DateTime.UtcNow.Date)
                    .CountAsync();

                var avgWaitTime = queueItems.Any() 
                    ? queueItems.Average(q => (DateTime.UtcNow - q.CheckedInAt).TotalMinutes) 
                    : 0;

                stats[queueType] = new
                {
                    totalWaiting = queueItems.Count,
                    averageWaitTime = (int)avgWaitTime,
                    totalCompleted = completed,
                    totalAbsent = absent
                };
            }

            return new Dictionary<string, object>
            {
                ["queues"] = groupedQueues,
                ["stats"] = stats
            };
        }

        public async Task<QueueDisplayData?> GetQueueDisplayDataAsync(Guid? branchId, Guid? departmentId, string queueType)
        {
            var query = _context.QueueItems
                .Where(q => q.QueueType == queueType && q.Status == "waiting")
                .OrderBy(q => q.CheckedInAt)
                .AsQueryable();

            if (branchId.HasValue)
                query = query.Where(q => q.BranchId == branchId.Value);

            if (departmentId.HasValue)
                query = query.Where(q => q.DepartmentId == departmentId.Value);

            var queueItems = await query
                .Include(q => q.Patient)
                .Include(q => q.Appointment)
                .Take(6)
                .ToListAsync();

            if (!queueItems.Any())
                return null;

            var current = queueItems.First();
            var next = queueItems.Skip(1).Take(5).Select(q => q.TokenNumber).ToList();

            return new QueueDisplayData
            {
                CurrentToken = current.TokenNumber ?? "NONE",
                NextTokens = next,
                DoctorName = current.DoctorName ?? "N/A",
                RoomNumber = current.RoomNumber ?? "N/A",
                DepartmentName = current.Department?.Name ?? "N/A",
                QueueType = queueType,
                Timestamp = DateTime.UtcNow
            };
        }

        public async Task<QueueItem?> CallPatientAsync(Guid queueItemId, string? roomNumber, string? doctorName)
        {
            var queueItem = await _context.QueueItems.FindAsync(queueItemId);
            if (queueItem == null)
                return null;

            queueItem.Status = "called";
            queueItem.CalledAt = DateTime.UtcNow;
            queueItem.RoomNumber = roomNumber;
            queueItem.DoctorName = doctorName;
            queueItem.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Emit SignalR event for real-time TV display update
            try
            {
                // Send to specific queue group
                var groupName = $"Queue-{queueItem.TenantId}-{queueItem.BranchId}-{queueItem.DepartmentId}-{queueItem.QueueType}";
                await _hubContext.Clients.Group(groupName).SendAsync("TokenCalled", new
                {
                    queueItem.Id,
                    queueItem.TokenNumber,
                    queueItem.RoomNumber,
                    queueItem.DoctorName,
                    queueItem.QueueType,
                    queueItem.CalledAt
                });

                // Also send to branch group for dashboard updates
                var branchGroup = $"Branch-{queueItem.TenantId}-{queueItem.BranchId}";
                await _hubContext.Clients.Group(branchGroup).SendAsync("QueueUpdate", new
                {
                    queueItem.Id,
                    queueItem.TokenNumber,
                    queueItem.Status,
                    queueItem.QueueType,
                    Action = "called"
                });

                _logger.LogInformation("SignalR event emitted for token {TokenNumber}", queueItem.TokenNumber);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error emitting SignalR event for queue item {QueueItemId}", queueItemId);
            }

            return queueItem;
        }

        public async Task<bool> MarkAbsentAsync(Guid queueItemId)
        {
            var queueItem = await _context.QueueItems.FindAsync(queueItemId);
            if (queueItem == null)
                return false;

            queueItem.Status = "absent";
            queueItem.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<QueueItem?> TransferQueueAsync(Guid queueItemId, string newQueueType)
        {
            var queueItem = await _context.QueueItems.FindAsync(queueItemId);
            if (queueItem == null)
                return null;

            queueItem.QueueType = newQueueType;
            queueItem.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return queueItem;
        }
    }
}
