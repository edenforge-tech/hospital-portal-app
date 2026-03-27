using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AuthService.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AuthService.Controllers
{
    /// <summary>
    /// Phase 8: HIPAA Audit Controller
    /// Provides endpoints for imaging PHI access audit logs and compliance reporting
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ImagingAuditController : ControllerBase
    {
        private readonly IImagingAccessAuditService _auditService;
        private readonly ILogger<ImagingAuditController> _logger;

        public ImagingAuditController(
            IImagingAccessAuditService auditService,
            ILogger<ImagingAuditController> logger)
        {
            _auditService = auditService;
            _logger = logger;
        }

        /// <summary>
        /// Log image access event (VIEW, DOWNLOAD, ANNOTATE)
        /// </summary>
        [HttpPost("log-image-access")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> LogImageAccess([FromBody] ImageAccessAuditDto auditDto)
        {
            try
            {
                await _auditService.LogImageAccessAsync(auditDto);
                return Ok(new { message = "Image access logged successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log image access");
                return BadRequest(new { error = "Failed to log image access", details = ex.Message });
            }
        }

        /// <summary>
        /// Log annotation action (CREATE, UPDATE, DELETE)
        /// </summary>
        [HttpPost("log-annotation-action")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> LogAnnotationAction([FromBody] AnnotationAuditDto auditDto)
        {
            try
            {
                await _auditService.LogAnnotationActionAsync(auditDto);
                return Ok(new { message = "Annotation action logged successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log annotation action");
                return BadRequest(new { error = "Failed to log annotation action", details = ex.Message });
            }
        }

        /// <summary>
        /// Log comparison access
        /// </summary>
        [HttpPost("log-comparison-access")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> LogComparisonAccess([FromBody] ComparisonAuditDto auditDto)
        {
            try
            {
                await _auditService.LogComparisonAccessAsync(auditDto);
                return Ok(new { message = "Comparison access logged successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log comparison access");
                return BadRequest(new { error = "Failed to log comparison access", details = ex.Message });
            }
        }

        /// <summary>
        /// Log PDF export action
        /// </summary>
        [HttpPost("log-export-action")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> LogExportAction([FromBody] ExportAuditDto auditDto)
        {
            try
            {
                await _auditService.LogExportActionAsync(auditDto);
                return Ok(new { message = "Export action logged successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log export action");
                return BadRequest(new { error = "Failed to log export action", details = ex.Message });
            }
        }

        /// <summary>
        /// Get patient imaging access logs (HIPAA audit trail)
        /// </summary>
        /// <param name="patientId">Patient UUID</param>
        /// <param name="startDate">Optional start date filter (ISO 8601)</param>
        /// <param name="endDate">Optional end date filter (ISO 8601)</param>
        /// <param name="userId">Optional user filter</param>
        [HttpGet("patient-logs/{patientId}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,ComplianceOfficer")]
        [ProducesResponseType(typeof(List<ImagingAccessLogEntry>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetPatientImagingAccessLogs(
            Guid patientId,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] Guid? userId = null)
        {
            try
            {
                // Get tenant from authenticated user claims
                var tenantIdClaim = User.Claims.FirstOrDefault(c => c.Type == "TenantId");
                if (tenantIdClaim == null || !Guid.TryParse(tenantIdClaim.Value, out var tenantId))
                {
                    return BadRequest(new { error = "Tenant ID not found in user claims" });
                }

                var logs = await _auditService.GetPatientImagingAccessLogsAsync(
                    patientId,
                    tenantId,
                    startDate,
                    endDate);

                return Ok(logs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve patient imaging access logs");
                return BadRequest(new { error = "Failed to retrieve audit logs", details = ex.Message });
            }
        }

        /// <summary>
        /// Get imaging access statistics for compliance reporting
        /// </summary>
        /// <param name="startDate">Start date (ISO 8601)</param>
        /// <param name="endDate">End date (ISO 8601)</param>
        /// <param name="patientId">Optional patient filter</param>
        [HttpGet("statistics")]
        [Authorize(Roles = "Admin,ComplianceOfficer,SystemAdmin")]
        [ProducesResponseType(typeof(ImagingAccessStatistics), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetAccessStatistics(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate,
            [FromQuery] Guid? patientId = null)
        {
            try
            {
                // Get tenant from authenticated user claims
                var tenantIdClaim = User.Claims.FirstOrDefault(c => c.Type == "TenantId");
                if (tenantIdClaim == null || !Guid.TryParse(tenantIdClaim.Value, out var tenantId))
                {
                    return BadRequest(new { error = "Tenant ID not found in user claims" });
                }

                var statistics = await _auditService.GetAccessStatisticsAsync(
                    tenantId,
                    startDate,
                    endDate);

                return Ok(statistics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve access statistics");
                return BadRequest(new { error = "Failed to retrieve statistics", details = ex.Message });
            }
        }

        /// <summary>
        /// Detect suspicious imaging access activity (HIPAA security monitoring)
        /// </summary>
        [HttpGet("suspicious-activity")]
        [Authorize(Roles = "Admin,ComplianceOfficer,SystemAdmin,SecurityAuditor")]
        [ProducesResponseType(typeof(List<SuspiciousActivityAlert>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> DetectSuspiciousActivity()
        {
            try
            {
                // Get tenant from authenticated user claims
                var tenantIdClaim = User.Claims.FirstOrDefault(c => c.Type == "TenantId");
                if (tenantIdClaim == null || !Guid.TryParse(tenantIdClaim.Value, out var tenantId))
                {
                    return BadRequest(new { error = "Tenant ID not found in user claims" });
                }

                var alerts = await _auditService.DetectSuspiciousActivityAsync(tenantId);

                // Log suspicious activity detection for compliance
                if (alerts.Any())
                {
                    _logger.LogWarning(
                        "Detected {AlertCount} suspicious imaging access activities for tenant {TenantId}",
                        alerts.Count,
                        tenantId);
                }

                return Ok(alerts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to detect suspicious activity");
                return BadRequest(new { error = "Failed to detect suspicious activity", details = ex.Message });
            }
        }

        /// <summary>
        /// Get audit log summary for compliance dashboard
        /// </summary>
        [HttpGet("summary")]
        [Authorize(Roles = "Admin,ComplianceOfficer,SystemAdmin")]
        [ProducesResponseType(typeof(AuditSummary), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetAuditSummary([FromQuery] int days = 30)
        {
            try
            {
                // Get tenant from authenticated user claims
                var tenantIdClaim = User.Claims.FirstOrDefault(c => c.Type == "TenantId");
                if (tenantIdClaim == null || !Guid.TryParse(tenantIdClaim.Value, out var tenantId))
                {
                    return BadRequest(new { error = "Tenant ID not found in user claims" });
                }

                var endDate = DateTime.UtcNow;
                var startDate = endDate.AddDays(-days);

                // Get statistics and suspicious activity in parallel
                var statisticsTask = _auditService.GetAccessStatisticsAsync(tenantId, startDate, endDate);
                var alertsTask = _auditService.DetectSuspiciousActivityAsync(tenantId);

                await Task.WhenAll(statisticsTask, alertsTask);

                var summary = new AuditSummary
                {
                    TenantId = tenantId,
                    Period = $"Last {days} days",
                    StartDate = startDate,
                    EndDate = endDate,
                    Statistics = statisticsTask.Result,
                    SuspiciousActivityAlerts = alertsTask.Result,
                    ComplianceScore = CalculateComplianceScore(statisticsTask.Result, alertsTask.Result)
                };

                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate audit summary");
                return BadRequest(new { error = "Failed to generate audit summary", details = ex.Message });
            }
        }

        /// <summary>
        /// Calculate HIPAA compliance score (0-100)
        /// </summary>
        private double CalculateComplianceScore(ImagingAccessStatistics stats, List<SuspiciousActivityAlert> alerts)
        {
            double score = 100.0;

            // Deduct points for suspicious activity
            score -= alerts.Count * 5.0; // -5 points per alert

            // Deduct points if audit logging is sparse (suspicious)
            if (stats.TotalAccesses < 10 && (stats.PeriodEnd - stats.PeriodStart).TotalDays > 7)
            {
                score -= 10.0; // Suspicious lack of activity
            }

            return Math.Max(0, Math.Min(100, score)); // Clamp to 0-100
        }
    }

    #region DTOs

    public class AuditSummary
    {
        public Guid TenantId { get; set; }
        public string Period { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public ImagingAccessStatistics Statistics { get; set; } = new();
        public List<SuspiciousActivityAlert> SuspiciousActivityAlerts { get; set; } = new();
        public double ComplianceScore { get; set; } // 0-100
    }

    #endregion
}
