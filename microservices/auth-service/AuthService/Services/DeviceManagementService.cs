using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace AuthService.Services
{
    public interface IDeviceManagementService
    {
        Task<Device> RegisterDeviceAsync(Guid userId, string deviceName, string deviceType, string os, string browser, string ipAddress, string userAgent);
        Task<Device> TrustDeviceAsync(Guid deviceId, string trustLevel);
        Task BlockDeviceAsync(Guid deviceId, string reason);
        Task UnblockDeviceAsync(Guid deviceId);
        Task<List<Device>> GetUserDevicesAsync(Guid userId);
        Task<Device?> GetDeviceByIdAsync(Guid deviceId);
        Task<bool> ValidateDeviceAccessAsync(Guid userId, string deviceFingerprint);
        Task UpdateDeviceActivityAsync(Guid deviceId);
        Task<bool> SetPrimaryDeviceAsync(Guid userId, Guid deviceId);
        Task<string> GenerateDeviceFingerprint(string userAgent, string browser, string os, string screenResolution);
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
            var tenantId = _httpContextAccessor?.HttpContext?.Items["TenantId"] as Guid?;
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
    }
}
