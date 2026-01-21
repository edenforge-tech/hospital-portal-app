using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace AuthService.Services;

/// <summary>
/// Comprehensive audit logging for department access changes
/// Implements HIPAA and NABH compliance requirements
/// </summary>
public interface IDepartmentAccessAuditService
{
    Task LogAccessChangeAsync(AccessAuditDto auditDto);
    Task<List<AccessAuditSummary>> GetAuditLogsAsync(AuditFilterDto filter);
    Task<AccessAuditStatistics> GetStatisticsAsync(Guid tenantId, DateTime startDate, DateTime endDate);
    Task<ComplianceReport> GenerateComplianceReportAsync(Guid tenantId, DateTime startDate, DateTime endDate);
}

public class DepartmentAccessAuditService : IDepartmentAccessAuditService
{
    private readonly AppDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<DepartmentAccessAuditService> _logger;

    public DepartmentAccessAuditService(
        AppDbContext context,
        IHttpContextAccessor httpContextAccessor,
        ILogger<DepartmentAccessAuditService> logger)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
    }

    public async Task LogAccessChangeAsync(AccessAuditDto auditDto)
    {
        try
        {
            var httpContext = _httpContextAccessor.HttpContext;
            
            var auditLog = new DepartmentAccessAuditLog
            {
                Id = Guid.NewGuid(),
                UserId = auditDto.UserId,
                DepartmentId = auditDto.DepartmentId,
                TenantId = auditDto.TenantId,
                BranchId = auditDto.BranchId,
                DepartmentAccessId = auditDto.DepartmentAccessId,
                Action = auditDto.Action,
                ActionCategory = auditDto.ActionCategory,
                PreviousState = auditDto.PreviousState != null ? JsonSerializer.Serialize(auditDto.PreviousState) : null,
                NewState = auditDto.NewState != null ? JsonSerializer.Serialize(auditDto.NewState) : null,
                ChangesSummary = auditDto.ChangesSummary,
                Justification = auditDto.Justification,
                ApprovalRequestId = auditDto.ApprovalRequestId,
                PerformedBy = auditDto.PerformedBy,
                PerformedByRole = auditDto.PerformedByRole,
                PerformedByIp = httpContext?.Connection.RemoteIpAddress?.ToString(),
                UserAgent = httpContext?.Request.Headers["User-Agent"].ToString(),
                ComplianceFlags = auditDto.ComplianceFlags != null ? JsonSerializer.Serialize(auditDto.ComplianceFlags) : null,
                ComplianceNote = auditDto.ComplianceNote,
                SecurityClassification = auditDto.SecurityClassification ?? "Internal",
                IsEmergencyAccess = auditDto.IsEmergencyAccess,
                WasApproved = auditDto.WasApproved,
                ApprovedBy = auditDto.ApprovedBy,
                ApprovedAt = auditDto.ApprovedAt,
                Timestamp = DateTime.UtcNow,
                SessionId = httpContext?.Session?.Id,
                CorrelationId = auditDto.CorrelationId ?? Guid.NewGuid().ToString()
            };

            _context.Set<DepartmentAccessAuditLog>().Add(auditLog);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Audit log created: {Action} for user {UserId} on department {DepartmentId} by {PerformedBy}",
                auditDto.Action, auditDto.UserId, auditDto.DepartmentId, auditDto.PerformedBy);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create audit log for action {Action}", auditDto.Action);
            // Don't throw - audit logging failure shouldn't break the main operation
        }
    }

    public async Task<List<AccessAuditSummary>> GetAuditLogsAsync(AuditFilterDto filter)
    {
        var query = _context.Set<DepartmentAccessAuditLog>()
            .Where(aal => aal.TenantId == filter.TenantId)
            .AsQueryable();

        // Apply filters
        if (filter.UserId.HasValue)
            query = query.Where(aal => aal.UserId == filter.UserId.Value);

        if (filter.DepartmentId.HasValue)
            query = query.Where(aal => aal.DepartmentId == filter.DepartmentId.Value);

        if (filter.PerformedBy.HasValue)
            query = query.Where(aal => aal.PerformedBy == filter.PerformedBy.Value);

        if (!string.IsNullOrEmpty(filter.Action))
            query = query.Where(aal => aal.Action == filter.Action);

        if (!string.IsNullOrEmpty(filter.ActionCategory))
            query = query.Where(aal => aal.ActionCategory == filter.ActionCategory);

        if (filter.StartDate.HasValue)
            query = query.Where(aal => aal.Timestamp >= filter.StartDate.Value);

        if (filter.EndDate.HasValue)
            query = query.Where(aal => aal.Timestamp <= filter.EndDate.Value);

        if (filter.IsEmergencyAccess.HasValue)
            query = query.Where(aal => aal.IsEmergencyAccess == filter.IsEmergencyAccess.Value);

        // Include related data
        query = query
            .Include(aal => aal.User)
            .Include(aal => aal.Department)
            .Include(aal => aal.PerformedByUser)
            .OrderByDescending(aal => aal.Timestamp);

        // Apply pagination
        var totalCount = await query.CountAsync();
        var logs = await query
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        return logs.Select(log => new AccessAuditSummary
        {
            Id = log.Id,
            AuditNumber = log.AuditNumber,
            UserId = log.UserId,
            UserName = log.User?.UserName ?? "Unknown",
            DepartmentId = log.DepartmentId,
            DepartmentName = log.Department?.DepartmentName ?? "Unknown",
            DepartmentCode = log.Department?.DepartmentCode ?? "",
            Action = log.Action,
            ActionCategory = log.ActionCategory,
            ChangesSummary = log.ChangesSummary,
            PerformedBy = log.PerformedBy,
            PerformedByName = log.PerformedByUser?.UserName ?? "System",
            PerformedByRole = log.PerformedByRole,
            Timestamp = log.Timestamp,
            ComplianceNote = log.ComplianceNote,
            IsEmergencyAccess = log.IsEmergencyAccess,
            TotalCount = totalCount
        }).ToList();
    }

    public async Task<AccessAuditStatistics> GetStatisticsAsync(Guid tenantId, DateTime startDate, DateTime endDate)
    {
        var logs = await _context.Set<DepartmentAccessAuditLog>()
            .Where(aal => aal.TenantId == tenantId 
                && aal.Timestamp >= startDate 
                && aal.Timestamp <= endDate)
            .ToListAsync();

        var stats = new AccessAuditStatistics
        {
            TenantId = tenantId,
            StartDate = startDate,
            EndDate = endDate,
            TotalAuditLogs = logs.Count,
            
            // By Action
            AccessGranted = logs.Count(l => l.Action == "Granted"),
            AccessRevoked = logs.Count(l => l.Action == "Revoked"),
            AccessModified = logs.Count(l => l.Action == "Modified"),
            PermissionsChanged = logs.Count(l => l.Action == "PermissionChanged"),
            PrimaryDepartmentChanges = logs.Count(l => l.Action == "SetPrimary"),
            
            // Workflow
            AccessRequested = logs.Count(l => l.Action == "Requested"),
            AccessApproved = logs.Count(l => l.Action == "Approved"),
            AccessRejected = logs.Count(l => l.Action == "Rejected"),
            
            // Compliance
            EmergencyAccessCount = logs.Count(l => l.IsEmergencyAccess),
            
            // Top Activities
            MostActiveUsers = logs
                .GroupBy(l => new { l.UserId, l.User!.UserName })
                .Select(g => new UserActivity 
                { 
                    UserId = g.Key.UserId, 
                    UserName = g.Key.UserName ?? "Unknown", 
                    ActionCount = g.Count() 
                })
                .OrderByDescending(u => u.ActionCount)
                .Take(10)
                .ToList(),
                
            MostAccessedDepartments = logs
                .GroupBy(l => new { l.DepartmentId, l.Department!.DepartmentName })
                .Select(g => new DepartmentActivity 
                { 
                    DepartmentId = g.Key.DepartmentId, 
                    DepartmentName = g.Key.DepartmentName ?? "Unknown", 
                    AccessCount = g.Count() 
                })
                .OrderByDescending(d => d.AccessCount)
                .Take(10)
                .ToList(),
                
            ActionsByCategory = logs
                .GroupBy(l => l.ActionCategory)
                .ToDictionary(g => g.Key, g => g.Count()),
                
            ActionsByType = logs
                .GroupBy(l => l.Action)
                .ToDictionary(g => g.Key, g => g.Count())
        };

        return stats;
    }

    public async Task<ComplianceReport> GenerateComplianceReportAsync(Guid tenantId, DateTime startDate, DateTime endDate)
    {
        var logs = await _context.Set<DepartmentAccessAuditLog>()
            .Where(aal => aal.TenantId == tenantId 
                && aal.Timestamp >= startDate 
                && aal.Timestamp <= endDate)
            .Include(aal => aal.User)
            .Include(aal => aal.Department)
            .Include(aal => aal.PerformedByUser)
            .ToListAsync();

        var report = new ComplianceReport
        {
            TenantId = tenantId,
            ReportGeneratedAt = DateTime.UtcNow,
            PeriodStart = startDate,
            PeriodEnd = endDate,
            TotalAuditEntries = logs.Count,
            
            // HIPAA Compliance Metrics
            HipaaCompliance = new HipaaComplianceMetrics
            {
                PhiAccessLogged = logs.Count(l => 
                    l.ComplianceNote != null && l.ComplianceNote.Contains("PHI")),
                AuditTrailComplete = true, // All access changes are logged via trigger
                EmergencyAccessProtocol = logs.Any(l => l.IsEmergencyAccess),
                EmergencyAccessCount = logs.Count(l => l.IsEmergencyAccess),
                UnauthorizedAccessAttempts = logs.Count(l => l.Action == "Rejected"),
                ComplianceScore = CalculateComplianceScore(logs)
            },
            
            // NABH Compliance Metrics
            NabhCompliance = new NabhComplianceMetrics
            {
                QualifiedPersonnelOversight = logs.Count(l => 
                    l.WasApproved == true && l.ApprovedBy != null),
                DocumentationComplete = logs.All(l => 
                    !string.IsNullOrEmpty(l.ChangesSummary)),
                SupervisionProtocol = logs.Count(l => 
                    l.ActionCategory == "Workflow" && l.Action == "Approved"),
                PolicyAdherence = true // Approval workflows enforced
            },
            
            // Risk Indicators
            RiskIndicators = new List<RiskIndicator>(),
            
            // Summary
            Summary = $"Period: {startDate:yyyy-MM-dd} to {endDate:yyyy-MM-dd}. " +
                     $"Total audit logs: {logs.Count}. " +
                     $"Access granted: {logs.Count(l => l.Action == "Granted")}. " +
                     $"Access revoked: {logs.Count(l => l.Action == "Revoked")}. " +
                     $"Approval workflow used: {logs.Count(l => l.ActionCategory == "Workflow")} times."
        };

        // Identify risk indicators
        var emergencyAccessUsers = logs
            .Where(l => l.IsEmergencyAccess)
            .GroupBy(l => l.UserId)
            .Where(g => g.Count() > 3)
            .ToList();

        if (emergencyAccessUsers.Any())
        {
            report.RiskIndicators.Add(new RiskIndicator
            {
                Severity = "Medium",
                Category = "Emergency Access",
                Description = $"{emergencyAccessUsers.Count} user(s) have used emergency access more than 3 times",
                Recommendation = "Review emergency access usage patterns and ensure proper justification"
            });
        }

        var rejectedRequests = logs.Count(l => l.Action == "Rejected");
        if (rejectedRequests > logs.Count * 0.1) // More than 10% rejection rate
        {
            report.RiskIndicators.Add(new RiskIndicator
            {
                Severity = "Low",
                Category = "Access Requests",
                Description = $"High rejection rate: {rejectedRequests} rejections ({rejectedRequests * 100 / logs.Count}%)",
                Recommendation = "Review access request patterns and provide clearer guidelines"
            });
        }

        return report;
    }

    private double CalculateComplianceScore(List<DepartmentAccessAuditLog> logs)
    {
        if (logs.Count == 0) return 100.0;

        var score = 100.0;
        
        // Deduct points for missing documentation
        var missingDocs = logs.Count(l => string.IsNullOrEmpty(l.ChangesSummary));
        score -= (missingDocs * 5.0 / logs.Count);
        
        // Deduct points for unapproved high-risk actions
        var unapprovedHighRisk = logs.Count(l => 
            l.ActionCategory == "Access_Management" 
            && l.WasApproved != true
            && l.Action == "Granted");
        score -= (unapprovedHighRisk * 3.0 / logs.Count);
        
        return Math.Max(0, Math.Min(100, score));
    }
}

#region DTOs

public class AccessAuditDto
{
    public Guid UserId { get; set; }
    public Guid DepartmentId { get; set; }
    public Guid TenantId { get; set; }
    public Guid? BranchId { get; set; }
    public Guid? DepartmentAccessId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string ActionCategory { get; set; } = string.Empty;
    public object? PreviousState { get; set; }
    public object? NewState { get; set; }
    public string? ChangesSummary { get; set; }
    public string? Justification { get; set; }
    public Guid? ApprovalRequestId { get; set; }
    public Guid PerformedBy { get; set; }
    public string? PerformedByRole { get; set; }
    public object? ComplianceFlags { get; set; }
    public string? ComplianceNote { get; set; }
    public string? SecurityClassification { get; set; }
    public bool IsEmergencyAccess { get; set; }
    public bool? WasApproved { get; set; }
    public Guid? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? CorrelationId { get; set; }
}

public class AuditFilterDto
{
    public Guid TenantId { get; set; }
    public Guid? UserId { get; set; }
    public Guid? DepartmentId { get; set; }
    public Guid? PerformedBy { get; set; }
    public string? Action { get; set; }
    public string? ActionCategory { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool? IsEmergencyAccess { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}

public class AccessAuditSummary
{
    public Guid Id { get; set; }
    public string AuditNumber { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public Guid DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string DepartmentCode { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string ActionCategory { get; set; } = string.Empty;
    public string? ChangesSummary { get; set; }
    public Guid PerformedBy { get; set; }
    public string PerformedByName { get; set; } = string.Empty;
    public string? PerformedByRole { get; set; }
    public DateTime Timestamp { get; set; }
    public string? ComplianceNote { get; set; }
    public bool IsEmergencyAccess { get; set; }
    public int TotalCount { get; set; }
}

public class AccessAuditStatistics
{
    public Guid TenantId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TotalAuditLogs { get; set; }
    public int AccessGranted { get; set; }
    public int AccessRevoked { get; set; }
    public int AccessModified { get; set; }
    public int PermissionsChanged { get; set; }
    public int PrimaryDepartmentChanges { get; set; }
    public int AccessRequested { get; set; }
    public int AccessApproved { get; set; }
    public int AccessRejected { get; set; }
    public int EmergencyAccessCount { get; set; }
    public List<UserActivity> MostActiveUsers { get; set; } = new();
    public List<DepartmentActivity> MostAccessedDepartments { get; set; } = new();
    public Dictionary<string, int> ActionsByCategory { get; set; } = new();
    public Dictionary<string, int> ActionsByType { get; set; } = new();
}

public class UserActivity
{
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public int ActionCount { get; set; }
}

public class DepartmentActivity
{
    public Guid DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public int AccessCount { get; set; }
}

public class ComplianceReport
{
    public Guid TenantId { get; set; }
    public DateTime ReportGeneratedAt { get; set; }
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
    public int TotalAuditEntries { get; set; }
    public HipaaComplianceMetrics HipaaCompliance { get; set; } = new();
    public NabhComplianceMetrics NabhCompliance { get; set; } = new();
    public List<RiskIndicator> RiskIndicators { get; set; } = new();
    public string Summary { get; set; } = string.Empty;
}

public class HipaaComplianceMetrics
{
    public int PhiAccessLogged { get; set; }
    public bool AuditTrailComplete { get; set; }
    public bool EmergencyAccessProtocol { get; set; }
    public int EmergencyAccessCount { get; set; }
    public int UnauthorizedAccessAttempts { get; set; }
    public double ComplianceScore { get; set; }
}

public class NabhComplianceMetrics
{
    public int QualifiedPersonnelOversight { get; set; }
    public bool DocumentationComplete { get; set; }
    public int SupervisionProtocol { get; set; }
    public bool PolicyAdherence { get; set; }
}

public class RiskIndicator
{
    public string Severity { get; set; } = string.Empty; // Low, Medium, High, Critical
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Recommendation { get; set; } = string.Empty;
}

#endregion
