using AuthService.Context;
using AuthService.Models.Domain;
using AuthService.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Services
{
    public class VisitorService : IVisitorService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<VisitorService> _logger;

        public VisitorService(AppDbContext context, ILogger<VisitorService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<VisitorLog>> GetActiveVisitorsAsync(Guid branchId)
        {
            return await _context.VisitorLogs
                .Include(v => v.Patient)
                .Where(v => v.BranchId == branchId && v.Status == "active")
                .OrderByDescending(v => v.CheckInTime)
                .ToListAsync();
        }

        public async Task<VisitorLog> CheckInVisitorAsync(VisitorLog visitorLog)
        {
            // Auto-generate pass number
            var today = DateTime.UtcNow.Date;
            var visitorCount = await _context.VisitorLogs
                .Where(v => v.BranchId == visitorLog.BranchId && v.CheckInTime >= today)
                .CountAsync();

            visitorLog.PassNumber = $"VP-{DateTime.UtcNow:yyyyMMdd}-{(visitorCount + 1):D4}";
            visitorLog.CheckInTime = DateTime.UtcNow;
            visitorLog.Status = "active";
            visitorLog.CreatedAt = DateTime.UtcNow;
            visitorLog.UpdatedAt = DateTime.UtcNow;

            _context.VisitorLogs.Add(visitorLog);
            await _context.SaveChangesAsync();

            return visitorLog;
        }

        public async Task<VisitorLog?> CheckOutVisitorAsync(Guid visitorId)
        {
            var visitor = await _context.VisitorLogs.FindAsync(visitorId);
            if (visitor == null || visitor.Status != "active")
                return null;

            visitor.CheckOutTime = DateTime.UtcNow;
            visitor.Status = "checked-out";
            visitor.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return visitor;
        }
    }
}
