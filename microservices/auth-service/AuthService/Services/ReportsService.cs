using AuthService.Context;
using AuthService.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Services
{
    public class ReportsService : IReportsService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ReportsService> _logger;

        public ReportsService(AppDbContext context, ILogger<ReportsService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<object> GetDailyOpdReportAsync(Guid branchId, DateTime date)
        {
            var startOfDay = date.Date;
            var endOfDay = startOfDay.AddDays(1);

            // Get queue items for the day (branch-specific)
            var queueItems = await _context.QueueItems
                .Where(q => q.BranchId == branchId &&
                           q.CheckedInAt >= startOfDay &&
                           q.CheckedInAt < endOfDay)
                .Include(q => q.Department)
                .ToListAsync();

            // Overall stats
            var totalRegistrations = queueItems.Count;
            var totalCheckedIn = queueItems.Count(q => q.Status != "absent");
            var totalCompleted = queueItems.Count(q => q.Status == "completed");
            var totalAbsent = queueItems.Count(q => q.Status == "absent");
            var totalInProgress = queueItems.Count(q => q.Status == "in-progress");

            var averageWaitTime = queueItems
                .Where(q => q.CalledAt.HasValue)
                .Select(q => (q.CalledAt!.Value - q.CheckedInAt).TotalMinutes)
                .DefaultIfEmpty(0)
                .Average();

            // Department-wise distribution
            var departmentStats = queueItems
                .GroupBy(q => new { q.DepartmentId, DeptName = q.Department != null ? q.Department.Name : "General" })
                .Select(g => new
                {
                    Department = g.Key.DeptName,
                    Count = g.Count(),
                    Percentage = totalRegistrations > 0 ? Math.Round(g.Count() * 100.0 / totalRegistrations, 2) : 0
                })
                .OrderByDescending(x => x.Count)
                .ToList();

            // Peak hours (hourly distribution)
            var peakHours = queueItems
                .GroupBy(q => q.CheckedInAt.Hour)
                .Select(g => new
                {
                    Hour = $"{g.Key:D2}:00",
                    Registrations = g.Count(),
                    CheckIns = g.Count(q => q.Status != "absent")
                })
                .OrderBy(x => x.Hour)
                .ToList();

            return new
            {
                Date = date.ToString("yyyy-MM-dd"),
                Period = "Daily",
                OverallStats = new
                {
                    TotalRegistrations = totalRegistrations,
                    TotalCheckedIn = totalCheckedIn,
                    TotalCompleted = totalCompleted,
                    TotalAbsent = totalAbsent,
                    TotalInProgress = totalInProgress,
                    AverageWaitTime = Math.Round(averageWaitTime, 2),
                    CheckInRate = totalRegistrations > 0 ? Math.Round((totalCheckedIn * 100.0 / totalRegistrations), 2) : 0
                },
                DepartmentDistribution = departmentStats,
                PeakHours = peakHours
            };
        }

        public async Task<object> GetWeeklyOpdReportAsync(Guid branchId, DateTime date)
        {
            // Get start of week (Monday)
            var daysFromMonday = ((int)date.DayOfWeek + 6) % 7;
            var startOfWeek = date.Date.AddDays(-daysFromMonday);
            var endOfWeek = startOfWeek.AddDays(7);

            var queueItems = await _context.QueueItems
                .Where(q => q.BranchId == branchId &&
                           q.CheckedInAt >= startOfWeek &&
                           q.CheckedInAt < endOfWeek)
                .Include(q => q.Department)
                .ToListAsync();

            var totalRegistrations = queueItems.Count;
            var totalCheckedIn = queueItems.Count(q => q.Status != "absent");
            var totalCompleted = queueItems.Count(q => q.Status == "completed");
            var totalAbsent = queueItems.Count(q => q.Status == "absent");

            var averageWaitTime = queueItems
                .Where(q => q.CalledAt.HasValue)
                .Select(q => (q.CalledAt!.Value - q.CheckedInAt).TotalMinutes)
                .DefaultIfEmpty(0)
                .Average();

            // Day-wise distribution
            var dailyStats = Enumerable.Range(0, 7)
                .Select(i => startOfWeek.AddDays(i))
                .Select(day =>
                {
                    var dayStart = day;
                    var dayEnd = day.AddDays(1);
                    var dayRegistrations = queueItems.Count(q => q.CheckedInAt >= dayStart && q.CheckedInAt < dayEnd);
                    var dayCheckIns = queueItems.Count(q => q.CheckedInAt >= dayStart && q.CheckedInAt < dayEnd && q.Status != "absent");

                    return new
                    {
                        Date = day.ToString("yyyy-MM-dd"),
                        Day = day.ToString("dddd"),
                        Registrations = dayRegistrations,
                        CheckIns = dayCheckIns
                    };
                })
                .ToList();

            // Department distribution
            var departmentStats = queueItems
                .GroupBy(q => q.Department != null ? q.Department.Name : "General")
                .Select(g => new
                {
                    Department = g.Key,
                    Count = g.Count(),
                    Percentage = totalRegistrations > 0 ? Math.Round(g.Count() * 100.0 / totalRegistrations, 2) : 0
                })
                .OrderByDescending(x => x.Count)
                .ToList();

            return new
            {
                StartDate = startOfWeek.ToString("yyyy-MM-dd"),
                EndDate = endOfWeek.AddDays(-1).ToString("yyyy-MM-dd"),
                Period = "Weekly",
                OverallStats = new
                {
                    TotalRegistrations = totalRegistrations,
                    TotalCheckedIn = totalCheckedIn,
                    TotalCompleted = totalCompleted,
                    TotalAbsent = totalAbsent,
                    AverageWaitTime = Math.Round(averageWaitTime, 2),
                    CheckInRate = totalRegistrations > 0 ? Math.Round((totalCheckedIn * 100.0 / totalRegistrations), 2) : 0
                },
                DailyStats = dailyStats,
                DepartmentDistribution = departmentStats
            };
        }

        public async Task<object> GetMonthlyOpdReportAsync(Guid branchId, DateTime date)
        {
            var startOfMonth = new DateTime(date.Year, date.Month, 1);
            var endOfMonth = startOfMonth.AddMonths(1);

            var queueItems = await _context.QueueItems
                .Where(q => q.BranchId == branchId &&
                           q.CheckedInAt >= startOfMonth &&
                           q.CheckedInAt < endOfMonth)
                .Include(q => q.Department)
                .ToListAsync();

            var totalRegistrations = queueItems.Count;
            var totalCheckedIn = queueItems.Count(q => q.Status != "absent");
            var totalCompleted = queueItems.Count(q => q.Status == "completed");
            var totalAbsent = queueItems.Count(q => q.Status == "absent");

            var averageWaitTime = queueItems
                .Where(q => q.CalledAt.HasValue)
                .Select(q => (q.CalledAt!.Value - q.CheckedInAt).TotalMinutes)
                .DefaultIfEmpty(0)
                .Average();

            // Week-wise distribution
            var weeklyStats = new List<object>();
            var currentWeekStart = startOfMonth;
            var weekNumber = 1;

            while (currentWeekStart < endOfMonth)
            {
                var weekEnd = currentWeekStart.AddDays(7);
                if (weekEnd > endOfMonth) weekEnd = endOfMonth;

                var weekRegistrations = queueItems.Count(q => q.CheckedInAt >= currentWeekStart && q.CheckedInAt < weekEnd);
                var weekCheckIns = queueItems.Count(q => q.CheckedInAt >= currentWeekStart && q.CheckedInAt < weekEnd && q.Status != "absent");

                weeklyStats.Add(new
                {
                    Week = $"Week {weekNumber}",
                    StartDate = currentWeekStart.ToString("yyyy-MM-dd"),
                    EndDate = weekEnd.AddDays(-1).ToString("yyyy-MM-dd"),
                    Registrations = weekRegistrations,
                    CheckIns = weekCheckIns
                });

                currentWeekStart = weekEnd;
                weekNumber++;
            }

            // Department distribution
            var departmentStats = queueItems
                .GroupBy(q => q.Department != null ? q.Department.Name : "General")
                .Select(g => new
                {
                    Department = g.Key,
                    Count = g.Count(),
                    Percentage = totalRegistrations > 0 ? Math.Round(g.Count() * 100.0 / totalRegistrations, 2) : 0
                })
                .OrderByDescending(x => x.Count)
                .ToList();

            return new
            {
                Month = date.ToString("MMMM yyyy"),
                StartDate = startOfMonth.ToString("yyyy-MM-dd"),
                EndDate = endOfMonth.AddDays(-1).ToString("yyyy-MM-dd"),
                Period = "Monthly",
                OverallStats = new
                {
                    TotalRegistrations = totalRegistrations,
                    TotalCheckedIn = totalCheckedIn,
                    TotalCompleted = totalCompleted,
                    TotalAbsent = totalAbsent,
                    AverageWaitTime = Math.Round(averageWaitTime, 2),
                    CheckInRate = totalRegistrations > 0 ? Math.Round((totalCheckedIn * 100.0 / totalRegistrations), 2) : 0,
                    AverageDailyRegistrations = Math.Round(totalRegistrations / (double)DateTime.DaysInMonth(date.Year, date.Month), 2)
                },
                WeeklyStats = weeklyStats,
                DepartmentDistribution = departmentStats
            };
        }
    }
}
