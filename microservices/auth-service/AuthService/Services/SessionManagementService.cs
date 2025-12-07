using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Services
{
    public interface ISessionManagementService
    {
        Task<UserSession> CreateSessionAsync(Guid userId, Guid? deviceId, string tokenId, string refreshToken, string ipAddress, string userAgent, string location, string sessionType, string loginMethod);
        Task<UserSession?> RefreshSessionAsync(string sessionId);
        Task TerminateSessionAsync(Guid sessionId, string reason, Guid? terminatedBy);
        Task<int> TerminateAllSessionsAsync(Guid userId, Guid? exceptSessionId = null);
        Task<List<UserSession>> GetActiveSessionsAsync(Guid userId);
        Task<UserSession?> GetSessionByIdAsync(Guid sessionId);
        Task<UserSession?> GetSessionBySessionIdAsync(string sessionId);
        Task<bool> ValidateSessionDeviceAsync(Guid sessionId, Guid deviceId);
        Task<int> CleanupExpiredSessionsAsync();
        Task UpdateSessionActivityAsync(string sessionId);
        Task<bool> DetectSuspiciousActivityAsync(Guid sessionId, string currentIp, string currentLocation);
        Task MarkSessionSuspiciousAsync(Guid sessionId, string reason);
    }

    public class SessionManagementService : ISessionManagementService
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public SessionManagementService(AppDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        private Guid GetCurrentTenantId()
        {
            var tenantId = _httpContextAccessor?.HttpContext?.Items["TenantId"] as Guid?;
            return tenantId ?? Guid.Parse("11111111-1111-1111-1111-111111111111");
        }

        public async Task<UserSession> CreateSessionAsync(Guid userId, Guid? deviceId, string tokenId, string refreshToken, string ipAddress, string userAgent, string location, string sessionType, string loginMethod)
        {
            var tenantId = GetCurrentTenantId();

            // Default expiration: 8 hours for web, 30 days for mobile
            var expirationHours = sessionType == "Mobile" ? 24 * 30 : 8;

            var session = new UserSession
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                UserId = userId,
                DeviceId = deviceId,
                SessionId = Guid.NewGuid().ToString("N"), // 32-character hex string
                TokenId = tokenId,
                RefreshToken = refreshToken,
                IPAddress = ipAddress,
                UserAgent = userAgent,
                Location = location,
                SessionType = sessionType,
                LoginMethod = loginMethod,
                LoginTime = DateTime.UtcNow,
                LastActivityTime = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddHours(expirationHours),
                IsActive = true,
                SuspiciousActivity = false,
                Status = "active",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.UserSessions.Add(session);
            await _context.SaveChangesAsync();

            // Update device last login time if device is provided
            if (deviceId.HasValue)
            {
                var device = await _context.Devices.FindAsync(deviceId.Value);
                if (device != null)
                {
                    device.LastLoginAt = DateTime.UtcNow;
                    device.LastSeenAt = DateTime.UtcNow;
                    device.TotalLogins++;
                    device.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }
            }

            return session;
        }

        public async Task<UserSession?> RefreshSessionAsync(string sessionId)
        {
            var session = await _context.UserSessions
                .FirstOrDefaultAsync(s => s.SessionId == sessionId && s.IsActive);

            if (session == null)
                return null;

            // Check if session has expired
            if (session.ExpiresAt < DateTime.UtcNow)
            {
                session.IsActive = false;
                session.TerminationReason = "Session expired";
                session.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return null;
            }

            // Extend session expiration
            var sessionType = session.SessionType ?? "Web";
            var expirationHours = sessionType == "Mobile" ? 24 * 30 : 8;

            session.LastActivityTime = DateTime.UtcNow;
            session.ExpiresAt = DateTime.UtcNow.AddHours(expirationHours);
            session.UpdatedAt = DateTime.UtcNow;

            // Generate new refresh token
            session.RefreshToken = Guid.NewGuid().ToString("N");

            await _context.SaveChangesAsync();
            return session;
        }

        public async Task TerminateSessionAsync(Guid sessionId, string reason, Guid? terminatedBy)
        {
            var session = await _context.UserSessions.FindAsync(sessionId);
            if (session == null)
                return;

            session.IsActive = false;
            session.LogoutTime = DateTime.UtcNow;
            session.TerminationReason = reason;
            session.TerminatedBy = terminatedBy;
            session.Status = "terminated";
            session.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        public async Task<int> TerminateAllSessionsAsync(Guid userId, Guid? exceptSessionId = null)
        {
            var tenantId = GetCurrentTenantId();

            var sessions = await _context.UserSessions
                .Where(s => s.UserId == userId 
                    && s.TenantId == tenantId 
                    && s.IsActive
                    && (exceptSessionId == null || s.Id != exceptSessionId))
                .ToListAsync();

            foreach (var session in sessions)
            {
                session.IsActive = false;
                session.LogoutTime = DateTime.UtcNow;
                session.TerminationReason = "User requested termination of all sessions";
                session.Status = "terminated";
                session.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return sessions.Count();
        }

        public async Task<List<UserSession>> GetActiveSessionsAsync(Guid userId)
        {
            var tenantId = GetCurrentTenantId();

            return await _context.UserSessions
                .Include(s => s.Device)
                .Where(s => s.UserId == userId 
                    && s.TenantId == tenantId 
                    && s.IsActive)
                .OrderByDescending(s => s.LastActivityTime)
                .ToListAsync();
        }

        public async Task<UserSession?> GetSessionByIdAsync(Guid sessionId)
        {
            return await _context.UserSessions
                .Include(s => s.Device)
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.Id == sessionId);
        }

        public async Task<UserSession?> GetSessionBySessionIdAsync(string sessionId)
        {
            return await _context.UserSessions
                .Include(s => s.Device)
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.SessionId == sessionId);
        }

        public async Task<bool> ValidateSessionDeviceAsync(Guid sessionId, Guid deviceId)
        {
            var session = await _context.UserSessions
                .FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session == null || !session.IsActive)
                return false;

            return session.DeviceId == deviceId;
        }

        public async Task<int> CleanupExpiredSessionsAsync()
        {
            var expiredSessions = await _context.UserSessions
                .Where(s => s.IsActive 
                    && s.ExpiresAt < DateTime.UtcNow)
                .ToListAsync();

            foreach (var session in expiredSessions)
            {
                session.IsActive = false;
                session.LogoutTime = DateTime.UtcNow;
                session.TerminationReason = "Session expired (automatic cleanup)";
                session.Status = "expired";
                session.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return expiredSessions.Count();
        }

        public async Task UpdateSessionActivityAsync(string sessionId)
        {
            var session = await _context.UserSessions
                .FirstOrDefaultAsync(s => s.SessionId == sessionId);

            if (session != null && session.IsActive)
            {
                session.LastActivityTime = DateTime.UtcNow;
                session.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                // Update device last seen if device is linked
                if (session.DeviceId.HasValue)
                {
                    var device = await _context.Devices.FindAsync(session.DeviceId.Value);
                    if (device != null)
                    {
                        device.LastSeenAt = DateTime.UtcNow;
                        device.UpdatedAt = DateTime.UtcNow;
                        await _context.SaveChangesAsync();
                    }
                }
            }
        }

        public async Task<bool> DetectSuspiciousActivityAsync(Guid sessionId, string currentIp, string currentLocation)
        {
            var session = await _context.UserSessions
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session == null)
                return false;

            bool isSuspicious = false;

            // Check for IP address change
            if (!string.IsNullOrEmpty(session.IPAddress) && session.IPAddress != currentIp)
            {
                isSuspicious = true;
            }

            // Check for location change (if available)
            if (!string.IsNullOrEmpty(session.Location) && 
                !string.IsNullOrEmpty(currentLocation) && 
                session.Location != currentLocation)
            {
                isSuspicious = true;
            }

            // Check for concurrent sessions from different locations
            var concurrentSessions = await _context.UserSessions
                .Where(s => s.UserId == session.UserId 
                    && s.Id != sessionId 
                    && s.IsActive
                    && s.LastActivityTime > DateTime.UtcNow.AddMinutes(-5))
                .ToListAsync();

            if (concurrentSessions.Any(s => s.IPAddress != currentIp))
            {
                isSuspicious = true;
            }

            return isSuspicious;
        }

        public async Task MarkSessionSuspiciousAsync(Guid sessionId, string reason)
        {
            var session = await _context.UserSessions.FindAsync(sessionId);
            if (session != null)
            {
                session.SuspiciousActivity = true;
                session.TerminationReason = $"Suspicious activity detected: {reason}";
                session.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }
    }
}
