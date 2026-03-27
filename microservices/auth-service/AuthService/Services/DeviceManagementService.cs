using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace AuthService.Services
{
    public class DeviceAnalytics
    {
        public int TotalDevices { get; set; }
        public int ActiveDevices { get; set; }
        public int TrustedDevices { get; set; }
        public int BlockedDevices { get; set; }
        public int UntrustedDevices { get; set; }
        public Dictionary<string, int> DeviceTypeDistribution { get; set; } = new();
        public Dictionary<string, int> TrustLevelDistribution { get; set; } = new();
        public Dictionary<string, int> MonthlyRegistrations { get; set; } = new();
        public double AverageDevicesPerUser { get; set; }
        public List<string> MostActiveDeviceTypes { get; set; } = new();
    }

    public class DeviceSecurityMetrics
    {
        public int SecurityIncidents { get; set; }
        public int BlockedAttempts { get; set; }
        public int SuspiciousLogins { get; set; }
        public double TrustScoreAverage { get; set; }
        public List<SecurityTrend> TrendData { get; set; } = new();
        public Dictionary<string, int> BlockReasons { get; set; } = new();
    }

    public class SecurityTrend
    {
        public DateTime Date { get; set; }
        public int Incidents { get; set; }
        public int BlockedDevices { get; set; }
    }

    public class DeviceActivity
    {
        public Guid DeviceId { get; set; }
        public string DeviceName { get; set; } = string.Empty;
        public string DeviceType { get; set; } = string.Empty;
        public DateTime LastActivity { get; set; }
        public int LoginCount { get; set; }
        public string TrustLevel { get; set; } = string.Empty;
        public TimeSpan TotalUsageTime { get; set; }
        public List<string> RecentLocations { get; set; } = new();
    }

    public interface IDeviceManagementService
    {
        Task<Device> RegisterDeviceAsync(Guid userId, string deviceName, string deviceType, string os, string browser, string ipAddress, string userAgent);
        Task<Device> TrustDeviceAsync(Guid deviceId, string trustLevel);
        Task<Device> ApproveDeviceAsync(Guid deviceId, Guid approverId, string notes);
        Task BlockDeviceAsync(Guid deviceId, string reason);
        Task UnblockDeviceAsync(Guid deviceId);
        Task<List<Device>> GetUserDevicesAsync(Guid userId);
        Task<Device?> GetDeviceByIdAsync(Guid deviceId);
        Task<bool> ValidateDeviceAccessAsync(Guid userId, string deviceFingerprint);
        Task UpdateDeviceActivityAsync(Guid deviceId);
        Task<bool> SetPrimaryDeviceAsync(Guid userId, Guid deviceId);
        Task<string> GenerateDeviceFingerprint(string userAgent, string browser, string os, string screenResolution);
        Task<DeviceAnalytics> GetDeviceAnalyticsAsync(Guid? userId = null);
        Task<DeviceSecurityMetrics> GetDeviceSecurityMetricsAsync();
        Task<List<DeviceActivity>> GetDeviceActivitySummaryAsync(Guid userId, int days = 30);
    }

    public class DeviceManagementService : IDeviceManagementService
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public DeviceManagementService(AppDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        private Guid GetCurrentTenantId()
        {
            // Try to get tenant ID from HttpContext.Items (set during login)
            var tenantId = _httpContextAccessor?.HttpContext?.Items["TenantId"] as Guid?;
            
            // If not found, try to get from JWT claims
            if (tenantId == null)
            {
                var tenantIdClaim = _httpContextAccessor?.HttpContext?.User?.FindFirst("tenant_id")?.Value;
                if (!string.IsNullOrEmpty(tenantIdClaim) && Guid.TryParse(tenantIdClaim, out var parsedTenantId))
                {
                    tenantId = parsedTenantId;
                }
            }
            
            // If still not found, try to get from X-Tenant-ID header
            if (tenantId == null)
            {
                var tenantIdHeader = _httpContextAccessor?.HttpContext?.Request.Headers["X-Tenant-ID"].FirstOrDefault();
                if (!string.IsNullOrEmpty(tenantIdHeader) && Guid.TryParse(tenantIdHeader, out var parsedTenantId))
                {
                    tenantId = parsedTenantId;
                }
            }
            
            return tenantId ?? Guid.Parse("11111111-1111-1111-1111-111111111111");
        }

        public async Task<Device> RegisterDeviceAsync(Guid userId, string deviceName, string deviceType, string os, string browser, string ipAddress, string userAgent)
        {
            var tenantId = GetCurrentTenantId();

            // Generate device fingerprint
            var deviceFingerprint = await GenerateDeviceFingerprint(userAgent, browser, os, "unknown");

            // Check if device already exists
            var existingDevice = await _context.Devices
                .FirstOrDefaultAsync(d => d.UserId == userId && d.DeviceId == deviceFingerprint && d.TenantId == tenantId);

            if (existingDevice != null)
            {
                // Update existing device
                existingDevice.LastSeenAt = DateTime.UtcNow;
                existingDevice.LastLoginAt = DateTime.UtcNow;
                existingDevice.TotalLogins++;
                existingDevice.IPAddress = ipAddress;
                existingDevice.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return existingDevice;
            }

            // Check if this is the first device for the user
            var userDeviceCount = await _context.Devices
                .CountAsync(d => d.UserId == userId && d.TenantId == tenantId && d.DeletedAt == null);

            var device = new Device
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                UserId = userId,
                DeviceId = deviceFingerprint,
                DeviceName = deviceName,
                DeviceType = deviceType,
                OS = os,
                Browser = browser,
                IPAddress = ipAddress,
                TrustLevel = "Untrusted", // Default to untrusted
                IsBlocked = false,
                IsPrimaryDevice = userDeviceCount == 0, // First device is primary
                RegisteredAt = DateTime.UtcNow,
                LastSeenAt = DateTime.UtcNow,
                LastLoginAt = DateTime.UtcNow,
                TotalLogins = 1,
                Status = "active",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Devices.Add(device);
            await _context.SaveChangesAsync();

            return device;
        }

        public async Task<Device> TrustDeviceAsync(Guid deviceId, string trustLevel)
        {
            var device = await _context.Devices.FindAsync(deviceId);
            if (device == null)
                throw new ArgumentException("Device not found");

            if (!new[] { "Untrusted", "Trusted", "Verified" }.Contains(trustLevel))
                throw new ArgumentException("Invalid trust level. Must be: Untrusted, Trusted, or Verified");

            device.TrustLevel = trustLevel;
            device.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return device;
        }

        public async Task<Device> ApproveDeviceAsync(Guid deviceId, Guid approverId, string notes)
        {
            var device = await _context.Devices.FindAsync(deviceId);
            if (device == null)
                throw new ArgumentException("Device not found");

            // Approve the device by upgrading trust level
            device.TrustLevel = "Trusted";
            device.Status = "approved";
            device.UpdatedAt = DateTime.UtcNow;

            // Create an approval record (if DeviceApproval entity exists)
            // For now, we'll update the device status and log the approval

            await _context.SaveChangesAsync();
            return device;
        }

        public async Task BlockDeviceAsync(Guid deviceId, string reason)
        {
            var device = await _context.Devices.FindAsync(deviceId);
            if (device == null)
                throw new ArgumentException("Device not found");

            device.IsBlocked = true;
            device.BlockReason = reason;
            device.Status = "blocked";
            device.UpdatedAt = DateTime.UtcNow;

            // Terminate all active sessions on this device
            var activeSessions = await _context.UserSessions
                .Where(s => s.DeviceId == deviceId && s.IsActive)
                .ToListAsync();

            foreach (var session in activeSessions)
            {
                session.IsActive = false;
                session.LogoutTime = DateTime.UtcNow;
                session.TerminationReason = $"Device blocked: {reason}";
                session.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }

        public async Task UnblockDeviceAsync(Guid deviceId)
        {
            var device = await _context.Devices.FindAsync(deviceId);
            if (device == null)
                throw new ArgumentException("Device not found");

            device.IsBlocked = false;
            device.BlockReason = null;
            device.Status = "active";
            device.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        public async Task<List<Device>> GetUserDevicesAsync(Guid userId)
        {
            var tenantId = GetCurrentTenantId();

            return await _context.Devices
                .Where(d => d.UserId == userId && d.TenantId == tenantId && d.DeletedAt == null)
                .OrderByDescending(d => d.IsPrimaryDevice)
                .ThenByDescending(d => d.LastSeenAt)
                .ToListAsync();
        }

        public async Task<Device?> GetDeviceByIdAsync(Guid deviceId)
        {
            return await _context.Devices
                .FirstOrDefaultAsync(d => d.Id == deviceId && d.DeletedAt == null);
        }

        public async Task<bool> ValidateDeviceAccessAsync(Guid userId, string deviceFingerprint)
        {
            var tenantId = GetCurrentTenantId();

            var device = await _context.Devices
                .FirstOrDefaultAsync(d => d.UserId == userId 
                    && d.DeviceId == deviceFingerprint 
                    && d.TenantId == tenantId 
                    && d.DeletedAt == null);

            if (device == null)
                return false;

            if (device.IsBlocked)
                return false;

            // Update last seen
            device.LastSeenAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task UpdateDeviceActivityAsync(Guid deviceId)
        {
            var device = await _context.Devices.FindAsync(deviceId);
            if (device != null)
            {
                device.LastSeenAt = DateTime.UtcNow;
                device.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> SetPrimaryDeviceAsync(Guid userId, Guid deviceId)
        {
            var tenantId = GetCurrentTenantId();

            // Unset all other primary devices for this user
            var userDevices = await _context.Devices
                .Where(d => d.UserId == userId && d.TenantId == tenantId && d.DeletedAt == null)
                .ToListAsync();

            foreach (var device in userDevices)
            {
                device.IsPrimaryDevice = (device.Id == deviceId);
                device.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<string> GenerateDeviceFingerprint(string userAgent, string browser, string os, string screenResolution)
        {
            // Create a unique fingerprint based on device characteristics
            var fingerprintData = $"{userAgent}|{browser}|{os}|{screenResolution}";
            
            using (var sha256 = SHA256.Create())
            {
                var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(fingerprintData));
                return Convert.ToBase64String(hashBytes);
            }
        }

        public async Task<DeviceAnalytics> GetDeviceAnalyticsAsync(Guid? userId = null)
        {
            var tenantId = GetCurrentTenantId();
            var query = _context.Devices.Where(d => d.TenantId == tenantId && d.DeletedAt == null);

            if (userId.HasValue)
            {
                query = query.Where(d => d.UserId == userId.Value);
            }

            var devices = await query.ToListAsync();
            var totalUsers = await _context.Users.CountAsync(u => u.TenantId == tenantId);

            var analytics = new DeviceAnalytics
            {
                TotalDevices = devices.Count,
                ActiveDevices = devices.Count(d => d.Status == "active" && !d.IsBlocked),
                TrustedDevices = devices.Count(d => d.TrustLevel == "Trusted" || d.TrustLevel == "Verified"),
                BlockedDevices = devices.Count(d => d.IsBlocked),
                UntrustedDevices = devices.Count(d => d.TrustLevel == "Untrusted"),
                AverageDevicesPerUser = totalUsers > 0 ? (double)devices.Count / totalUsers : 0
            };

            // Device type distribution
            analytics.DeviceTypeDistribution = devices
                .GroupBy(d => d.DeviceType ?? "Unknown")
                .ToDictionary(g => g.Key, g => g.Count());

            // Trust level distribution
            analytics.TrustLevelDistribution = devices
                .GroupBy(d => d.TrustLevel)
                .ToDictionary(g => g.Key, g => g.Count());

            // Monthly registrations (last 6 months)
            var sixMonthsAgo = DateTime.UtcNow.AddMonths(-6);
            var monthlyData = devices
                .Where(d => d.RegisteredAt >= sixMonthsAgo)
                .GroupBy(d => d.RegisteredAt.ToString("yyyy-MM"))
                .ToDictionary(g => g.Key, g => g.Count());

            analytics.MonthlyRegistrations = monthlyData;

            // Most active device types
            analytics.MostActiveDeviceTypes = devices
                .Where(d => d.LastSeenAt >= DateTime.UtcNow.AddDays(-30))
                .GroupBy(d => d.DeviceType ?? "Unknown")
                .OrderByDescending(g => g.Sum(d => d.TotalLogins))
                .Take(5)
                .Select(g => g.Key)
                .ToList();

            return analytics;
        }

        public async Task<DeviceSecurityMetrics> GetDeviceSecurityMetricsAsync()
        {
            var tenantId = GetCurrentTenantId();
            var devices = await _context.Devices
                .Where(d => d.TenantId == tenantId && d.DeletedAt == null)
                .ToListAsync();

            var metrics = new DeviceSecurityMetrics
            {
                SecurityIncidents = devices.Count(d => d.IsBlocked),
                BlockedAttempts = devices.Count(d => d.IsBlocked),
                SuspiciousLogins = devices.Count(d => d.TrustLevel == "Untrusted" && d.TotalLogins > 5),
                TrustScoreAverage = CalculateAverageTrustScore(devices)
            };

            // Block reasons distribution
            metrics.BlockReasons = devices
                .Where(d => !string.IsNullOrEmpty(d.BlockReason))
                .GroupBy(d => d.BlockReason!)
                .ToDictionary(g => g.Key, g => g.Count());

            // Security trend data (last 30 days)
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
            var trendData = new List<SecurityTrend>();
            
            for (int i = 29; i >= 0; i--)
            {
                var date = DateTime.UtcNow.AddDays(-i).Date;
                var dayDevices = devices.Where(d => d.RegisteredAt.Date == date);
                
                trendData.Add(new SecurityTrend
                {
                    Date = date,
                    Incidents = dayDevices.Count(d => d.IsBlocked),
                    BlockedDevices = dayDevices.Count(d => d.IsBlocked)
                });
            }

            metrics.TrendData = trendData;

            return metrics;
        }

        public async Task<List<DeviceActivity>> GetDeviceActivitySummaryAsync(Guid userId, int days = 30)
        {
            var tenantId = GetCurrentTenantId();
            var startDate = DateTime.UtcNow.AddDays(-days);

            var devices = await _context.Devices
                .Where(d => d.UserId == userId && d.TenantId == tenantId && d.DeletedAt == null)
                .Where(d => d.LastSeenAt >= startDate)
                .ToListAsync();

            var activities = devices.Select(device => new DeviceActivity
            {
                DeviceId = device.Id,
                DeviceName = device.DeviceName ?? device.DeviceType ?? "Unknown Device",
                DeviceType = device.DeviceType ?? "Unknown",
                LastActivity = device.LastSeenAt ?? device.RegisteredAt,
                LoginCount = device.TotalLogins,
                TrustLevel = device.TrustLevel,
                TotalUsageTime = CalculateUsageTime(device),
                RecentLocations = GetRecentLocations(device)
            }).ToList();

            return activities.OrderByDescending(a => a.LastActivity).ToList();
        }

        private double CalculateAverageTrustScore(List<Device> devices)
        {
            if (!devices.Any()) return 0;

            var trustScores = devices.Select(d => d.TrustLevel switch
            {
                "Verified" => 100,
                "Trusted" => 75,
                "Untrusted" => 25,
                _ => 0
            });

            return trustScores.Average();
        }

        private TimeSpan CalculateUsageTime(Device device)
        {
            // Simplified calculation - in real implementation, you'd track actual session durations
            var daysSinceRegistration = (DateTime.UtcNow - device.RegisteredAt).TotalDays;
            var estimatedHoursPerDay = device.TotalLogins * 0.5; // Estimate 0.5 hours per login
            return TimeSpan.FromHours(Math.Min(daysSinceRegistration * estimatedHoursPerDay, daysSinceRegistration * 8));
        }

        private List<string> GetRecentLocations(Device device)
        {
            // Simplified - in real implementation, you'd track location history
            var locations = new List<string>();
            if (!string.IsNullOrEmpty(device.IPAddress))
            {
                locations.Add($"IP: {device.IPAddress}");
            }
            return locations;
        }
    }
}