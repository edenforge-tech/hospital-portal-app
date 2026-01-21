using AuthService.Authorization;
using AuthService.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ActivationAuditLogsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ActivationAuditLogsController(AppDbContext context)
        {
            _context = context;
        }

        private bool TryGetTenantId(out Guid tenantId)
        {
            tenantId = Guid.Empty;
            if (!HttpContext.Items.TryGetValue("TenantId", out var t)) return false;
            if (t is Guid g) { tenantId = g; return true; }
            return false;
        }

        /// <summary>
        /// Get all activation audit logs with filtering and pagination
        /// Tracks user activation workflow steps for HIPAA compliance
        /// </summary>
        [HttpGet]
        [RequirePermission("audit.view")]
        public async Task<IActionResult> GetAll(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] string? userId,
            [FromQuery] string? activationStep,  // token_validated, email_verified, password_set, etc.
            [FromQuery] string? status,  // success, failed, pending
            [FromQuery] bool? suspiciousOnly,
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 25)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "TenantId missing" });

            var query = _context.ActivationAuditLogs
                .Where(a => a.TenantId == tenantId);

            // Apply filters
            if (startDate.HasValue)
                query = query.Where(a => a.Timestamp >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(a => a.Timestamp <= endDate.Value);

            if (!string.IsNullOrEmpty(userId) && Guid.TryParse(userId, out var userIdGuid))
                query = query.Where(a => a.UserId == userIdGuid);

            if (!string.IsNullOrEmpty(activationStep))
                query = query.Where(a => a.ActivationStep == activationStep);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(a => a.Status.ToLower() == status.ToLower());

            if (suspiciousOnly.HasValue && suspiciousOnly.Value)
                query = query.Where(a => a.SuspiciousActivity);

            if (!string.IsNullOrEmpty(search))
                query = query.Where(a =>
                    (a.ErrorMessage != null && a.ErrorMessage.Contains(search)) ||
                    (a.ComplianceNotes != null && a.ComplianceNotes.Contains(search)) ||
                    (a.IpAddress != null && a.IpAddress.Contains(search)));

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply pagination and join with users table to get usernames
            var logs = await query
                .OrderByDescending(a => a.Timestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .GroupJoin(
                    _context.Users,
                    a => a.UserId,
                    u => u.Id,
                    (a, users) => new { AuditLog = a, Users = users }
                )
                .SelectMany(
                    x => x.Users.DefaultIfEmpty(),
                    (x, user) => new
                    {
                        id = x.AuditLog.Id,
                        timestamp = x.AuditLog.Timestamp,
                        userId = x.AuditLog.UserId,
                        userName = user != null ? (user.UserName ?? user.Email ?? "Unknown") : "Unknown",
                        activationStep = x.AuditLog.ActivationStep,
                        status = x.AuditLog.Status,
                        errorMessage = x.AuditLog.ErrorMessage,
                        ipAddress = x.AuditLog.IpAddress ?? "",
                        userAgent = x.AuditLog.UserAgent,
                        deviceInfo = x.AuditLog.DeviceInfo,
                        geolocationInfo = x.AuditLog.GeolocationInfo,
                        suspiciousActivity = x.AuditLog.SuspiciousActivity,
                        complianceNotes = x.AuditLog.ComplianceNotes,
                        requestData = x.AuditLog.RequestData,
                        responseData = x.AuditLog.ResponseData,
                        responseTimeMs = x.AuditLog.ResponseTimeMs,
                        completedAt = x.AuditLog.CompletedAt
                    }
                )
                .ToListAsync();

            return Ok(new
            {
                logs,
                totalCount,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize),
                currentPage = page,
                pageSize
            });
        }

        /// <summary>
        /// Get activation audit logs for a specific user
        /// </summary>
        [HttpGet("user/{userId}")]
        [RequirePermission("audit.view")]
        public async Task<IActionResult> GetByUser(
            string userId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 25)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "TenantId missing" });

            if (!Guid.TryParse(userId, out var userIdGuid))
                return BadRequest(new { message = "Invalid userId" });

            var totalCount = await _context.ActivationAuditLogs
                .Where(a => a.TenantId == tenantId && a.UserId == userIdGuid)
                .CountAsync();

            var logs = await _context.ActivationAuditLogs
                .Where(a => a.TenantId == tenantId && a.UserId == userIdGuid)
                .OrderByDescending(a => a.Timestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .GroupJoin(
                    _context.Users,
                    a => a.UserId,
                    u => u.Id,
                    (a, users) => new { AuditLog = a, Users = users }
                )
                .SelectMany(
                    x => x.Users.DefaultIfEmpty(),
                    (x, user) => new
                    {
                        id = x.AuditLog.Id,
                        timestamp = x.AuditLog.Timestamp,
                        userId = x.AuditLog.UserId,
                        userName = user != null ? (user.UserName ?? user.Email ?? "Unknown") : "Unknown",
                        activationStep = x.AuditLog.ActivationStep,
                        status = x.AuditLog.Status,
                        errorMessage = x.AuditLog.ErrorMessage,
                        ipAddress = x.AuditLog.IpAddress ?? "",
                        userAgent = x.AuditLog.UserAgent,
                        deviceInfo = x.AuditLog.DeviceInfo,
                        geolocationInfo = x.AuditLog.GeolocationInfo,
                        suspiciousActivity = x.AuditLog.SuspiciousActivity,
                        complianceNotes = x.AuditLog.ComplianceNotes,
                        requestData = x.AuditLog.RequestData,
                        responseData = x.AuditLog.ResponseData,
                        responseTimeMs = x.AuditLog.ResponseTimeMs,
                        completedAt = x.AuditLog.CompletedAt
                    }
                )
                .ToListAsync();

            return Ok(new
            {
                logs,
                totalCount,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize),
                currentPage = page,
                pageSize
            });
        }

        /// <summary>
        /// Get activation audit statistics (success/failure rates, suspicious activity counts)
        /// </summary>
        [HttpGet("stats")]
        [RequirePermission("audit.view")]
        public async Task<IActionResult> GetStats(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "TenantId missing" });

            var query = _context.ActivationAuditLogs
                .Where(a => a.TenantId == tenantId);

            if (startDate.HasValue)
                query = query.Where(a => a.Timestamp >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(a => a.Timestamp <= endDate.Value);

            var totalLogs = await query.CountAsync();
            var successCount = await query.Where(a => a.Status == "success").CountAsync();
            var failedCount = await query.Where(a => a.Status == "failed").CountAsync();
            var suspiciousCount = await query.Where(a => a.SuspiciousActivity).CountAsync();

            // Group by activation step
            var stepStats = await query
                .GroupBy(a => a.ActivationStep)
                .Select(g => new
                {
                    step = g.Key,
                    count = g.Count(),
                    successCount = g.Count(a => a.Status == "success"),
                    failedCount = g.Count(a => a.Status == "failed")
                })
                .ToListAsync();

            // Average response time
            var avgResponseTime = await query
                .Where(a => a.ResponseTimeMs.HasValue)
                .AverageAsync(a => (double?)a.ResponseTimeMs) ?? 0;

            return Ok(new
            {
                totalLogs,
                successCount,
                failedCount,
                suspiciousCount,
                successRate = totalLogs > 0 ? (double)successCount / totalLogs * 100 : 0,
                failureRate = totalLogs > 0 ? (double)failedCount / totalLogs * 100 : 0,
                avgResponseTimeMs = avgResponseTime,
                stepStats
            });
        }

        /// <summary>
        /// Get suspicious activation activities
        /// </summary>
        [HttpGet("suspicious")]
        [RequirePermission("audit.view")]
        public async Task<IActionResult> GetSuspicious(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 25)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "TenantId missing" });

            var query = _context.ActivationAuditLogs
                .Where(a => a.TenantId == tenantId && a.SuspiciousActivity);

            var totalCount = await query.CountAsync();

            var logs = await query
                .OrderByDescending(a => a.Timestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .GroupJoin(
                    _context.Users,
                    a => a.UserId,
                    u => u.Id,
                    (a, users) => new { AuditLog = a, Users = users }
                )
                .SelectMany(
                    x => x.Users.DefaultIfEmpty(),
                    (x, user) => new
                    {
                        id = x.AuditLog.Id,
                        timestamp = x.AuditLog.Timestamp,
                        userId = x.AuditLog.UserId,
                        userName = user != null ? (user.UserName ?? user.Email ?? "Unknown") : "Unknown",
                        activationStep = x.AuditLog.ActivationStep,
                        status = x.AuditLog.Status,
                        errorMessage = x.AuditLog.ErrorMessage,
                        ipAddress = x.AuditLog.IpAddress ?? "",
                        userAgent = x.AuditLog.UserAgent,
                        deviceInfo = x.AuditLog.DeviceInfo,
                        responseTimeMs = x.AuditLog.ResponseTimeMs
                    }
                )
                .ToListAsync();

            return Ok(new
            {
                logs,
                totalCount,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize),
                currentPage = page,
                pageSize
            });
        }
    }
}
