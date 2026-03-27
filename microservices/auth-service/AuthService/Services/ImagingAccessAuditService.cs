// ImagingAccessAuditService - HIPAA-compliant audit logging for medical imaging access
// Tracks all PHI access (image viewing, annotations, comparisons, exports)

using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace AuthService.Services;

public interface IImagingAccessAuditService
{
    Task LogImageAccessAsync(ImageAccessAuditDto auditDto);
    Task LogAnnotationActionAsync(AnnotationAuditDto auditDto);
    Task LogComparisonAccessAsync(ComparisonAuditDto auditDto);
    Task LogExportActionAsync(ExportAuditDto auditDto);
    Task<List<ImagingAccessLogEntry>> GetPatientImagingAccessLogsAsync(Guid patientId, Guid tenantId, DateTime? startDate, DateTime? endDate);
    Task<ImagingAccessStatistics> GetAccessStatisticsAsync(Guid tenantId, DateTime startDate, DateTime endDate);
    Task<List<SuspiciousActivityAlert>> DetectSuspiciousActivityAsync(Guid tenantId);
}

public class ImagingAccessAuditService : IImagingAccessAuditService
{
    private readonly AppDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<ImagingAccessAuditService> _logger;

    public ImagingAccessAuditService(
        AppDbContext context,
        IHttpContextAccessor httpContextAccessor,
        ILogger<ImagingAccessAuditService> logger)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
    }

    public async Task LogImageAccessAsync(ImageAccessAuditDto auditDto)
    {
        try
        {
            var httpContext = _httpContextAccessor.HttpContext;
            
            var auditLog = new ImagingAccessLog
            {
                Id = Guid.NewGuid(),
                TenantId = auditDto.TenantId,
                UserId = auditDto.UserId,
                PatientId = auditDto.PatientId,
                ResourceType = "ImagingImage",
                ResourceId = auditDto.ImageId,
                Action = auditDto.Action, // VIEW, DOWNLOAD, ANNOTATE
                ActionDetails = auditDto.ActionDetails,
                AccessGranted = true,
                IpAddress = httpContext?.Connection.RemoteIpAddress?.ToString(),
                UserAgent = httpContext?.Request.Headers["User-Agent"].ToString(),
                SessionId = httpContext?.Session?.Id,
                AccessedAt = DateTime.UtcNow,
                DurationSeconds = auditDto.DurationSeconds,
                CreatedAt = DateTime.UtcNow,
                Status = "active"
            };

            _context.Set<ImagingAccessLog>().Add(auditLog);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "HIPAA Audit: User {UserId} {Action} image {ImageId} for patient {PatientId}",
                auditDto.UserId, auditDto.Action, auditDto.ImageId, auditDto.PatientId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log image access audit");
            // Don't throw - audit logging should never break application
        }
    }

    public async Task LogAnnotationActionAsync(AnnotationAuditDto auditDto)
    {
        try
        {
            var httpContext = _httpContextAccessor.HttpContext;

            var auditLog = new ImagingAccessLog
            {
                Id = Guid.NewGuid(),
                TenantId = auditDto.TenantId,
                UserId = auditDto.UserId,
                PatientId = auditDto.PatientId,
                ResourceType = "ImagingAnnotation",
                ResourceId = auditDto.AnnotationId,
                Action = auditDto.Action, // CREATE, UPDATE, DELETE
                ActionDetails = JsonSerializer.Serialize(new
                {
                    AnnotationType = auditDto.AnnotationType,
                    MeasurementValue = auditDto.MeasurementValue,
                    ImageId = auditDto.ImageId
                }),
                AccessGranted = true,
                IpAddress = httpContext?.Connection.RemoteIpAddress?.ToString(),
                UserAgent = httpContext?.Request.Headers["User-Agent"].ToString(),
                AccessedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                Status = "active"
            };

            _context.Set<ImagingAccessLog>().Add(auditLog);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "HIPAA Audit: User {UserId} {Action} annotation on image {ImageId}",
                auditDto.UserId, auditDto.Action, auditDto.ImageId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log annotation audit");
        }
    }

    public async Task LogComparisonAccessAsync(ComparisonAuditDto auditDto)
    {
        try
        {
            var httpContext = _httpContextAccessor.HttpContext;

            var auditLog = new ImagingAccessLog
            {
                Id = Guid.NewGuid(),
                TenantId = auditDto.TenantId,
                UserId = auditDto.UserId,
                PatientId = auditDto.PatientId,
                ResourceType = "ImagingComparison",
                ResourceId = auditDto.ComparisonId ?? Guid.Empty,
                Action = auditDto.Action, // VIEW_COMPARISON, CREATE_COMPARISON, GENERATE_TIMELINE
                ActionDetails = JsonSerializer.Serialize(new
                {
                    BaselineImageId = auditDto.BaselineImageId,
                    FollowupImageId = auditDto.FollowupImageId,
                    ComparisonType = auditDto.ComparisonType,
                    DifferenceOverlayUsed = auditDto.DifferenceOverlayUsed
                }),
                AccessGranted = true,
                IpAddress = httpContext?.Connection.RemoteIpAddress?.ToString(),
                UserAgent = httpContext?.Request.Headers["User-Agent"].ToString(),
                AccessedAt = DateTime.UtcNow,
                DurationSeconds = auditDto.DurationSeconds,
                CreatedAt = DateTime.UtcNow,
                Status = "active"
            };

            _context.Set<ImagingAccessLog>().Add(auditLog);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "HIPAA Audit: User {UserId} {Action} comparison for patient {PatientId}",
                auditDto.UserId, auditDto.Action, auditDto.PatientId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log comparison audit");
        }
    }

    public async Task LogExportActionAsync(ExportAuditDto auditDto)
    {
        try
        {
            var httpContext = _httpContextAccessor.HttpContext;

            var auditLog = new ImagingAccessLog
            {
                Id = Guid.NewGuid(),
                TenantId = auditDto.TenantId,
                UserId = auditDto.UserId,
                PatientId = auditDto.PatientId,
                ResourceType = "ImagingExport",
                ResourceId = auditDto.OrderId ?? Guid.Empty,
                Action = "EXPORT_PDF",
                ActionDetails = JsonSerializer.Serialize(new
                {
                    ExportType = auditDto.ExportType,
                    IncludePatientDemographics = auditDto.IncludePatientDemographics,
                    ReportTemplate = auditDto.ReportTemplate,
                    FileSize = auditDto.FileSizeBytes,
                    ReportUrl = auditDto.ReportUrl
                }),
                AccessGranted = true,
                IpAddress = httpContext?.Connection.RemoteIpAddress?.ToString(),
                UserAgent = httpContext?.Request.Headers["User-Agent"].ToString(),
                AccessedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                Status = "active"
            };

            _context.Set<ImagingAccessLog>().Add(auditLog);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "HIPAA Audit: User {UserId} exported {ExportType} for patient {PatientId} (PHI: {PHI})",
                auditDto.UserId, auditDto.ExportType, auditDto.PatientId, auditDto.IncludePatientDemographics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log export audit");
        }
    }

    public async Task<List<ImagingAccessLogEntry>> GetPatientImagingAccessLogsAsync(
        Guid patientId,
        Guid tenantId,
        DateTime? startDate,
        DateTime? endDate)
    {
        var query = _context.Set<ImagingAccessLog>()
            .Where(log => log.PatientId == patientId && log.TenantId == tenantId);

        if (startDate.HasValue)
            query = query.Where(log => log.AccessedAt >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(log => log.AccessedAt <= endDate.Value);

        var logs = await query
            .OrderByDescending(log => log.AccessedAt)
            .Take(500) // Limit to prevent performance issues
            .ToListAsync();

        return logs.Select(log => new ImagingAccessLogEntry
        {
            Id = log.Id,
            UserId = log.UserId.GetValueOrDefault(),
            UserName = "User", // TODO: Load from AspNetUsers
            PatientId = log.PatientId ?? Guid.Empty,
            ResourceType = log.ResourceType ?? "Unknown",
            ResourceId = log.ResourceId ?? Guid.Empty,
            Action = log.Action ?? "UNKNOWN",
            ActionDetails = log.ActionDetails,
            AccessedAt = log.AccessedAt ?? DateTime.UtcNow,
            IpAddress = log.IpAddress,
            UserAgent = log.UserAgent,
            DurationSeconds = log.DurationSeconds
        }).ToList();
    }

    public async Task<ImagingAccessStatistics> GetAccessStatisticsAsync(
        Guid tenantId,
        DateTime startDate,
        DateTime endDate)
    {
        var logs = await _context.Set<ImagingAccessLog>()
            .Where(log => log.TenantId == tenantId
                && log.AccessedAt >= startDate
                && log.AccessedAt <= endDate)
            .ToListAsync();

        return new ImagingAccessStatistics
        {
            TenantId = tenantId,
            PeriodStart = startDate,
            PeriodEnd = endDate,
            TotalAccesses = logs.Count,
            UniqueUsers = logs.Select(l => l.UserId).Distinct().Count(),
            UniquePatients = logs.Where(l => l.PatientId.HasValue).Select(l => l.PatientId).Distinct().Count(),
            ImageViewCount = logs.Count(l => l.Action == "VIEW"),
            AnnotationCount = logs.Count(l => l.ResourceType == "ImagingAnnotation"),
            ComparisonCount = logs.Count(l => l.ResourceType == "ImagingComparison"),
            ExportCount = logs.Count(l => l.Action == "EXPORT_PDF"),
            AverageDurationSeconds = logs.Where(l => l.DurationSeconds.HasValue)
                .Average(l => l.DurationSeconds ?? 0),
            PeakAccessHour = logs.GroupBy(l => l.AccessedAt?.Hour ?? 0)
                .OrderByDescending(g => g.Count())
                .FirstOrDefault()?.Key ?? 0
        };
    }

    public async Task<List<SuspiciousActivityAlert>> DetectSuspiciousActivityAsync(Guid tenantId)
    {
        var alerts = new List<SuspiciousActivityAlert>();
        var last24Hours = DateTime.UtcNow.AddHours(-24);

        var recentLogs = await _context.Set<ImagingAccessLog>()
            .Where(log => log.TenantId == tenantId && log.AccessedAt >= last24Hours)
            .ToListAsync();

        // Alert 1: Excessive access (>100 images in 1 hour)
        var excessiveAccessUsers = recentLogs
            .GroupBy(l => new { l.UserId, Hour = l.AccessedAt?.Hour })
            .Where(g => g.Count() > 100)
            .Select(g => g.Key.UserId)
            .Distinct();

        foreach (var userId in excessiveAccessUsers)
        {
            alerts.Add(new SuspiciousActivityAlert
            {
                Severity = "High",
                AlertType = "Excessive Access",
                Description = $"User {userId} accessed >100 images in 1 hour",
                UserId = userId ?? Guid.Empty,
                DetectedAt = DateTime.UtcNow,
                Recommendation = "Review user activity and verify legitimate clinical need"
            });
        }

        // Alert 2: After-hours access
        var afterHoursLogs = recentLogs
            .Where(l => l.AccessedAt.HasValue &&
                (l.AccessedAt.Value.Hour < 7 || l.AccessedAt.Value.Hour > 20));

        if (afterHoursLogs.Count() > 20)
        {
            alerts.Add(new SuspiciousActivityAlert
            {
                Severity = "Medium",
                AlertType = "After-Hours Access",
                Description = $"{afterHoursLogs.Count()} imaging accesses outside 7am-8pm",
                DetectedAt = DateTime.UtcNow,
                Recommendation = "Verify on-call doctors or emergency access protocols"
            });
        }

        // Alert 3: Bulk export activity
        var bulkExports = recentLogs
            .Where(l => l.Action == "EXPORT_PDF")
            .GroupBy(l => l.UserId)
            .Where(g => g.Count() > 10);

        foreach (var exportGroup in bulkExports)
        {
            alerts.Add(new SuspiciousActivityAlert
            {
                Severity = "Critical",
                AlertType = "Bulk Export",
                Description = $"User exported >10 reports in 24 hours",
                UserId = exportGroup.Key ?? Guid.Empty,
                DetectedAt = DateTime.UtcNow,
                Recommendation = "Investigate potential data exfiltration. Contact HIPAA Privacy Officer."
            });
        }

        return alerts;
    }
}

#region DTOs

public class ImageAccessAuditDto
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public Guid PatientId { get; set; }
    public Guid ImageId { get; set; }
    public string Action { get; set; } = string.Empty; // VIEW, DOWNLOAD, ANNOTATE
    public string? ActionDetails { get; set; }
    public int? DurationSeconds { get; set; }
}

public class AnnotationAuditDto
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public Guid PatientId { get; set; }
    public Guid ImageId { get; set; }
    public Guid AnnotationId { get; set; }
    public string Action { get; set; } = string.Empty; // CREATE, UPDATE, DELETE
    public string? AnnotationType { get; set; }
    public double? MeasurementValue { get; set; }
}

public class ComparisonAuditDto
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public Guid PatientId { get; set; }
    public Guid? ComparisonId { get; set; }
    public Guid BaselineImageId { get; set; }
    public Guid FollowupImageId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? ComparisonType { get; set; }
    public bool DifferenceOverlayUsed { get; set; }
    public int? DurationSeconds { get; set; }
}

public class ExportAuditDto
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public Guid PatientId { get; set; }
    public Guid? OrderId { get; set; }
    public string ExportType { get; set; } = string.Empty; // ORDER, COMPARISON
    public bool IncludePatientDemographics { get; set; }
    public string? ReportTemplate { get; set; }
    public long? FileSizeBytes { get; set; }
    public string? ReportUrl { get; set; }
}

public class ImagingAccessLogEntry
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public Guid PatientId { get; set; }
    public string ResourceType { get; set; } = string.Empty;
    public Guid ResourceId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? ActionDetails { get; set; }
    public DateTime AccessedAt { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public int? DurationSeconds { get; set; }
}

public class ImagingAccessStatistics
{
    public Guid TenantId { get; set; }
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
    public int TotalAccesses { get; set; }
    public int UniqueUsers { get; set; }
    public int UniquePatients { get; set; }
    public int ImageViewCount { get; set; }
    public int AnnotationCount { get; set; }
    public int ComparisonCount { get; set; }
    public int ExportCount { get; set; }
    public double AverageDurationSeconds { get; set; }
    public int PeakAccessHour { get; set; }
}

public class SuspiciousActivityAlert
{
    public string Severity { get; set; } = string.Empty; // Low, Medium, High, Critical
    public string AlertType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public DateTime DetectedAt { get; set; }
    public string Recommendation { get; set; } = string.Empty;
}

// Domain model for imaging_access_log table
public class ImagingAccessLog
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid? UserId { get; set; }
    public Guid? PatientId { get; set; }
    public string? ResourceType { get; set; }
    public Guid? ResourceId { get; set; }
    public string? Action { get; set; }
    public string? ActionDetails { get; set; }
    public bool AccessGranted { get; set; }
    public string? DenialReason { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? SessionId { get; set; }
    public DateTime? AccessedAt { get; set; }
    public int? DurationSeconds { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Status { get; set; } = "active";
}

#endregion
