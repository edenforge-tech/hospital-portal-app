using AuthService.Authorization;
using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EmergencyOverrideController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<EmergencyOverrideController> _logger;

    public EmergencyOverrideController(AppDbContext context, ILogger<EmergencyOverrideController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Log an emergency override action (e.g., bypassing payment validation for check-in)
    /// </summary>
    [HttpPost]
    [RequirePermission("emergency.override")]
    public async Task<IActionResult> LogEmergencyOverride([FromBody] EmergencyOverrideRequest request)
    {
        try
        {
            // Get tenant ID from claims (dual claim support)
            var tenantIdClaim = User.FindFirst("TenantId")?.Value ?? User.FindFirst("tenant_id")?.Value;
            if (string.IsNullOrEmpty(tenantIdClaim))
            {
                return Unauthorized(new { message = "Tenant ID not found in claims" });
            }

            // Get user ID from claims
            var userIdClaim = User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized(new { message = "User ID not found in claims" });
            }

            // Validate reason length (min 20 characters as per business rules)
            if (string.IsNullOrWhiteSpace(request.Reason) || request.Reason.Length < 20)
            {
                return BadRequest(new { message = "Reason must be at least 20 characters long" });
            }

            var overrideLog = new EmergencyOverrideLog
            {
                Id = Guid.NewGuid(),
                TenantId = Guid.Parse(tenantIdClaim),
                PatientId = request.PatientId,
                AppointmentId = request.AppointmentId,
                VisitId = request.VisitId,
                OverrideType = "PAYMENT_VALIDATION",
                ApprovedByUserId = Guid.Parse(userIdClaim),
                ApproverName = request.ApproverName,
                Reason = request.Reason,
                OverriddenAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = Guid.Parse(userIdClaim)
            };

            _context.EmergencyOverrideLogs.Add(overrideLog);
            await _context.SaveChangesAsync();

            _logger.LogWarning(
                "Emergency override logged - Type: {Type}, Patient: {PatientId}, Approver: {Approver}, Reason: {Reason}",
                overrideLog.OverrideType,
                overrideLog.PatientId,
                overrideLog.ApproverName,
                overrideLog.Reason
            );

            return Ok(new
            {
                success = true,
                data = new
                {
                    id = overrideLog.Id,
                    patientId = overrideLog.PatientId,
                    overrideType = overrideLog.OverrideType,
                    approverName = overrideLog.ApproverName,
                    reason = overrideLog.Reason,
                    overriddenAt = overrideLog.OverriddenAt
                },
                message = "Emergency override logged successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging emergency override for patient {PatientId}", request.PatientId);
            return StatusCode(500, new { success = false, message = "Failed to log emergency override", error = ex.Message });
        }
    }

    /// <summary>
    /// Get emergency override logs (for audit trail)
    /// </summary>
    [HttpGet]
    [RequirePermission("emergency.override.view")]
    public async Task<IActionResult> GetOverrideLogs(
        [FromQuery] Guid? patientId,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        try
        {
            var query = _context.EmergencyOverrideLogs.AsQueryable();

            // Filter by patient if specified
            if (patientId.HasValue)
            {
                query = query.Where(log => log.PatientId == patientId.Value);
            }

            // Filter by date range
            if (fromDate.HasValue)
            {
                query = query.Where(log => log.OverriddenAt >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(log => log.OverriddenAt <= toDate.Value);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply pagination
            var logs = await query
                .OrderByDescending(log => log.OverriddenAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(log => new
                {
                    id = log.Id,
                    patientId = log.PatientId,
                    appointmentId = log.AppointmentId,
                    visitId = log.VisitId,
                    overrideType = log.OverrideType,
                    approvedByUserId = log.ApprovedByUserId,
                    approverName = log.ApproverName,
                    reason = log.Reason,
                    overriddenAt = log.OverriddenAt,
                    createdAt = log.CreatedAt
                })
                .ToListAsync();

            return Ok(new
            {
                success = true,
                data = logs,
                totalCount,
                currentPage = page,
                pageSize,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving emergency override logs");
            return StatusCode(500, new { success = false, message = "Failed to retrieve override logs", error = ex.Message });
        }
    }

    /// <summary>
    /// Get emergency override log by ID
    /// </summary>
    [HttpGet("{id}")]
    [RequirePermission("emergency.override.view")]
    public async Task<IActionResult> GetOverrideLogById(Guid id)
    {
        try
        {
            var log = await _context.EmergencyOverrideLogs
                .Where(l => l.Id == id)
                .Select(log => new
                {
                    id = log.Id,
                    tenantId = log.TenantId,
                    patientId = log.PatientId,
                    appointmentId = log.AppointmentId,
                    visitId = log.VisitId,
                    overrideType = log.OverrideType,
                    approvedByUserId = log.ApprovedByUserId,
                    approverName = log.ApproverName,
                    reason = log.Reason,
                    overriddenAt = log.OverriddenAt,
                    createdAt = log.CreatedAt,
                    createdByUserId = log.CreatedByUserId
                })
                .FirstOrDefaultAsync();

            if (log == null)
            {
                return NotFound(new { success = false, message = "Override log not found" });
            }

            return Ok(new { success = true, data = log });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving emergency override log {Id}", id);
            return StatusCode(500, new { success = false, message = "Failed to retrieve override log", error = ex.Message });
        }
    }
}

/// <summary>
/// Request model for logging emergency override
/// </summary>
public class EmergencyOverrideRequest
{
    public Guid PatientId { get; set; }
    public Guid? AppointmentId { get; set; }
    public Guid? VisitId { get; set; }
    public string ApproverName { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
}
