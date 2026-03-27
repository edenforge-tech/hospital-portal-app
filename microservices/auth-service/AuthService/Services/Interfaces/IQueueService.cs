using AuthService.Models.Domain;

namespace AuthService.Services.Interfaces
{
    public interface IQueueService
    {
        Task<Dictionary<string, object>> GetAllQueuesAsync(Guid branchId);
        Task<QueueDisplayData?> GetQueueDisplayDataAsync(Guid? branchId, Guid? departmentId, string queueType);
        Task<QueueItem?> CallPatientAsync(Guid queueItemId, string? roomNumber, string? doctorName);
        Task<bool> MarkAbsentAsync(Guid queueItemId);
        Task<QueueItem?> TransferQueueAsync(Guid queueItemId, string newQueueType);
    }

    public class QueueDisplayData
    {
        public string CurrentToken { get; set; } = string.Empty;
        public List<string> NextTokens { get; set; } = new();
        public string DoctorName { get; set; } = string.Empty;
        public string RoomNumber { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public string QueueType { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }
}
