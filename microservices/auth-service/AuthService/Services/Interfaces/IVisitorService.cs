using AuthService.Models.Domain;

namespace AuthService.Services.Interfaces
{
    public interface IVisitorService
    {
        Task<List<VisitorLog>> GetActiveVisitorsAsync(Guid branchId);
        Task<VisitorLog> CheckInVisitorAsync(VisitorLog visitorLog);
        Task<VisitorLog?> CheckOutVisitorAsync(Guid visitorId);
    }
}
