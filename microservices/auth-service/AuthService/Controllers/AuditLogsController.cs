using AuthService.Authorization;
using AuthService.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AuditLogsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuditLogsController(AppDbContext context)
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
        /// Get all audit logs with filtering and pagination
        /// Maps RiskLevel→Severity, Status→Success, Changes→Details for frontend compatibility
        /// </summary>
        [HttpGet]
        [RequirePermission("audit.view")]
        public async Task<IActionResult> GetAll(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] string? userId,
            [FromQuery] string? action,
            [FromQuery] string? entityType,
            [FromQuery] string? severity,  // Maps to RiskLevel in DB
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 25)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "TenantId missing" });

            var query = _context.AuditLogs
                .Where(a => a.TenantId == tenantId);

            // Apply filters
            if (startDate.HasValue)
                query = query.Where(a => a.CreatedAt >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(a => a.CreatedAt <= endDate.Value);

            if (!string.IsNullOrEmpty(userId) && Guid.TryParse(userId, out var userIdGuid))
                query = query.Where(a => a.UserId == userIdGuid);

            if (!string.IsNullOrEmpty(action))
                query = query.Where(a => a.Action != null && a.Action.ToLower().Contains(action.ToLower()));

            if (!string.IsNullOrEmpty(entityType))
                query = query.Where(a => 
                    (a.EntityType != null && a.EntityType.ToLower().Contains(entityType.ToLower())) || 
                    (a.ResourceType != null && a.ResourceType.ToLower().Contains(entityType.ToLower())));

            // Note: severity/RiskLevel column doesn't exist in database yet, so this filter is disabled
            // if (!string.IsNullOrEmpty(severity))
            //     query = query.Where(a => a.RiskLevel == severity);

            if (!string.IsNullOrEmpty(search))
                query = query.Where(a => 
                    (a.Description != null && a.Description.Contains(search)) || 
                    (a.Changes != null && a.Changes.Contains(search)) ||
                    (a.UserName != null && a.UserName.Contains(search)));

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply pagination and join with users table to get usernames
            var logs = await query
                .OrderByDescending(a => a.CreatedAt)
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
                        timestamp = x.AuditLog.CreatedAt,
                        userId = x.AuditLog.UserId,
                        userName = user != null ? (user.UserName ?? user.Email ?? "Unknown") : (x.AuditLog.UserName ?? "Unknown"),
                        action = x.AuditLog.Action,
                        entityType = x.AuditLog.EntityType ?? x.AuditLog.ResourceType ?? "",
                        entityId = (x.AuditLog.EntityId ?? x.AuditLog.ResourceId ?? Guid.Empty).ToString(),
                        description = x.AuditLog.Description ?? "",
                        oldValues = x.AuditLog.OldValues,
                        newValues = x.AuditLog.NewValues,
                        ipAddress = x.AuditLog.IpAddress ?? "",
                        severity = "Low",  // Default severity since RiskLevel column doesn't exist yet
                        success = string.IsNullOrEmpty(x.AuditLog.Status) ? true : (x.AuditLog.Status == "Success" || x.AuditLog.Status == "Completed"),
                        details = x.AuditLog.Changes ?? ""
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
        /// Get audit logs for a specific user
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

            var totalCount = await _context.AuditLogs
                .Where(a => a.TenantId == tenantId && a.UserId == userIdGuid)
                .CountAsync();

            var logs = await _context.AuditLogs
                .Where(a => a.TenantId == tenantId && a.UserId == userIdGuid)
                .OrderByDescending(a => a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new
                {
                    id = a.Id,
                    timestamp = a.CreatedAt,
                    action = a.Action,
                    entityType = a.EntityType ?? a.ResourceType,
                    entityId = a.EntityId ?? a.ResourceId,
                    description = a.Description,
                    ipAddress = a.IpAddress,
                    severity = a.RiskLevel,
                    success = a.Status == "Success" || a.Status == "Completed"
                })
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
        /// Get audit logs for a specific entity
        /// </summary>
        [HttpGet("entity/{entityType}/{entityId}")]
        [RequirePermission("audit.view")]
        public async Task<IActionResult> GetByEntity(
            string entityType,
            string entityId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 25)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "TenantId missing" });

            if (!Guid.TryParse(entityId, out var entityIdGuid))
                return BadRequest(new { message = "Invalid entityId" });

            var totalCount = await _context.AuditLogs
                .Where(a => a.TenantId == tenantId && 
                           (a.EntityType == entityType || a.ResourceType == entityType) && 
                           (a.EntityId == entityIdGuid || a.ResourceId == entityIdGuid))
                .CountAsync();

            var logs = await _context.AuditLogs
                .Where(a => a.TenantId == tenantId && 
                           (a.EntityType == entityType || a.ResourceType == entityType) && 
                           (a.EntityId == entityIdGuid || a.ResourceId == entityIdGuid))
                .OrderByDescending(a => a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new
                {
                    id = a.Id,
                    timestamp = a.CreatedAt,
                    userId = a.UserId,
                    userName = a.UserName,
                    action = a.Action,
                    description = a.Description,
                    ipAddress = a.IpAddress,
                    severity = a.RiskLevel,
                    success = a.Status == "Success" || a.Status == "Completed"
                })
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
        /// Export audit logs to CSV
        /// </summary>
        [HttpGet("export")]
        [RequirePermission("audit.view")]
        public async Task<IActionResult> Export(
            [FromQuery] string format = "csv",
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] string? userId = null,
            [FromQuery] string? action = null,
            [FromQuery] string? entityType = null,
            [FromQuery] string? severity = null)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "TenantId missing" });

            if (format.ToLower() != "csv")
                return BadRequest(new { message = "Only CSV format supported currently" });

            var query = _context.AuditLogs
                .Where(a => a.TenantId == tenantId);

            // Apply same filters as GetAll
            if (startDate.HasValue)
                query = query.Where(a => a.CreatedAt >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(a => a.CreatedAt <= endDate.Value);

            if (!string.IsNullOrEmpty(userId) && Guid.TryParse(userId, out var userIdGuid))
                query = query.Where(a => a.UserId == userIdGuid);

            if (!string.IsNullOrEmpty(action))
                query = query.Where(a => a.Action == action);

            if (!string.IsNullOrEmpty(entityType))
                query = query.Where(a => a.EntityType == entityType || a.ResourceType == entityType);

            if (!string.IsNullOrEmpty(severity))
                query = query.Where(a => a.RiskLevel == severity);

            var logs = await query
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new
                {
                    Timestamp = a.CreatedAt,
                    UserName = a.UserName ?? "",
                    Action = a.Action,
                    EntityType = a.EntityType ?? a.ResourceType ?? "",
                    Description = a.Description ?? "",
                    IpAddress = a.IpAddress ?? "",
                    Severity = a.RiskLevel ?? "",
                    Status = a.Status ?? ""
                })
                .ToListAsync();

            var csv = new StringBuilder();
            csv.AppendLine("Timestamp,User,Action,Entity Type,Description,IP Address,Severity,Status");
            
            foreach (var log in logs)
            {
                csv.AppendLine($"\"{log.Timestamp:yyyy-MM-dd HH:mm:ss}\",\"{log.UserName}\",\"{log.Action}\",\"{log.EntityType}\",\"{log.Description}\",\"{log.IpAddress}\",\"{log.Severity}\",\"{log.Status}\"");
            }

            var bytes = Encoding.UTF8.GetBytes(csv.ToString());
            return File(bytes, "text/csv", $"audit-logs-{DateTime.UtcNow:yyyyMMdd-HHmmss}.csv");
        }

        /// <summary>
        /// Get audit log statistics
        /// </summary>
        [HttpGet("statistics")]
        [RequirePermission("audit.view")]
        public async Task<IActionResult> GetStatistics(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "TenantId missing" });

            var query = _context.AuditLogs.Where(a => a.TenantId == tenantId);

            if (startDate.HasValue)
                query = query.Where(a => a.CreatedAt >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(a => a.CreatedAt <= endDate.Value);

            var totalLogs = await query.CountAsync();
            var successCount = await query.CountAsync(a => a.Status == "Success" || a.Status == "Completed");
            var failedCount = await query.CountAsync(a => a.Status == "Failed" || a.Status == "Error");
            
            var actionStats = await query
                .GroupBy(a => a.Action)
                .Select(g => new { action = g.Key, count = g.Count() })
                .ToListAsync();

            var entityStats = await query
                .GroupBy(a => a.EntityType ?? a.ResourceType)
                .Select(g => new { entityType = g.Key, count = g.Count() })
                .ToListAsync();

            var severityStats = await query
                .GroupBy(a => a.RiskLevel)
                .Select(g => new { severity = g.Key, count = g.Count() })
                .ToListAsync();

            return Ok(new
            {
                totalLogs,
                successCount,
                failedCount,
                actionBreakdown = actionStats,
                entityBreakdown = entityStats,
                severityBreakdown = severityStats
            });
        }
    }
}
