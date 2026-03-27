namespace AuthService.Services.Interfaces
{
    public interface IReportsService
    {
        Task<object> GetDailyOpdReportAsync(Guid branchId, DateTime date);
        Task<object> GetWeeklyOpdReportAsync(Guid branchId, DateTime date);
        Task<object> GetMonthlyOpdReportAsync(Guid branchId, DateTime date);
    }
}
