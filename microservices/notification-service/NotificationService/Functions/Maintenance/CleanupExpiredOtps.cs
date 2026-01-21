using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using NotificationService.Data;
using Microsoft.EntityFrameworkCore;

namespace NotificationService.Functions.Maintenance;

public class CleanupExpiredOtps
{
    private readonly ILogger<CleanupExpiredOtps> _logger;
    private readonly NotificationDbContext _context;

    public CleanupExpiredOtps(
        ILogger<CleanupExpiredOtps> logger,
        NotificationDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    // Temporarily disabled - requires Azure Storage emulator
    // [Function("CleanupExpiredOtps")]
    public async Task Run([TimerTrigger("0 0 * * * *")] TimerInfo timer) // Runs every hour
    {
        _logger.LogInformation("Cleanup job started at: {Time}", DateTime.UtcNow);

        try
        {
            var now = DateTime.UtcNow;
            var sevenDaysAgo = now.AddDays(-7);

            // Update status to 'expired' for OTPs past their expiry time
            var expiredOtps = await _context.OtpActivations
                .Where(o => o.Status == "pending" && o.ExpiresAt < now)
                .ToListAsync();

            foreach (var otp in expiredOtps)
            {
                otp.Status = "expired";
            }

            _logger.LogInformation("Marked {Count} OTPs as expired", expiredOtps.Count);

            // Delete old expired OTPs (older than 7 days)
            var oldExpiredOtps = await _context.OtpActivations
                .Where(o => (o.Status == "expired" || o.Status == "verified" || o.Status == "blocked") && 
                           o.CreatedAt < sevenDaysAgo)
                .ToListAsync();

            _context.OtpActivations.RemoveRange(oldExpiredOtps);

            _logger.LogInformation("Deleted {Count} old OTP records", oldExpiredOtps.Count);

            await _context.SaveChangesAsync();

            _logger.LogInformation("Cleanup job completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during cleanup job");
        }
    }
}
