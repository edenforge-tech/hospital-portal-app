using System;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using AuthService.Authorization;
using AuthService.Context;
using AuthService.Models.Domain;

namespace AuthService.Controllers;

[Authorize]
[ApiController]
[Route("api/patient-medical-history")]
public class PatientMedicalHistoryController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<PatientMedicalHistoryController> _logger;

    public PatientMedicalHistoryController(AppDbContext context, ILogger<PatientMedicalHistoryController> logger)
    {
        _context = context;
        _logger = logger;
    }

    private Guid GetTenantId()
    {
        var tenantIdStr = User.FindFirst("TenantId")?.Value
            ?? User.FindFirst("tenant_id")?.Value;
        return Guid.TryParse(tenantIdStr, out var id) ? id : Guid.Empty;
    }

    private Guid? GetCurrentUserId()
    {
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value;
        return Guid.TryParse(sub, out var id) ? id : null;
    }

    /// <summary>
    /// Get all medical history for a patient across all sources (Optometrist, Counselor, Doctor, etc.)
    /// </summary>
    [HttpGet("patient/{patientId}")]
    [RequirePermission("counseling_sessions.read")]
    public async Task<IActionResult> GetPatientHistory(Guid patientId)
    {
        var tenantId = GetTenantId();
        if (tenantId == Guid.Empty) return Unauthorized("Tenant ID not found");

        try
        {
            var history = await _context.PatientMedicalHistory
                .Where(h => h.PatientId == patientId && h.TenantId == tenantId && h.DeletedAt == null && h.IsActive)
                .OrderByDescending(h => h.RecordedAt)
                .ToListAsync();

            return Ok(history);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving medical history for patient {PatientId}", patientId);
            return StatusCode(500, new { message = "Error retrieving patient medical history", error = ex.Message });
        }
    }

    /// <summary>
    /// Append a new medical history condition for a patient (counselors may only add, never overwrite)
    /// </summary>
    [HttpPost]
    [RequirePermission("counseling_sessions.update")]
    public async Task<IActionResult> AppendHistory([FromBody] AppendMedicalHistoryRequest request)
    {
        var tenantId = GetTenantId();
        if (tenantId == Guid.Empty) return Unauthorized("Tenant ID not found");

        var userId = GetCurrentUserId();

        try
        {
            var entry = new PatientMedicalHistory
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                PatientId = request.PatientId,
                Source = "Counselor",
                RecordedByUserId = userId,
                ConditionName = request.ConditionName,
                ConditionCategory = request.ConditionCategory,
                Details = request.Details,
                IsActive = true,
                RecordedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Status = "active"
            };

            _context.PatientMedicalHistory.Add(entry);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Appended medical history for patient {PatientId} by user {UserId}", request.PatientId, userId);
            return Ok(entry);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error appending medical history for patient {PatientId}", request.PatientId);
            return StatusCode(500, new { message = "Error appending medical history", error = ex.Message });
        }
    }
}

public class AppendMedicalHistoryRequest
{
    [Required]
    public Guid PatientId { get; set; }

    [Required]
    [StringLength(200)]
    public string ConditionName { get; set; } = null!;

    [StringLength(100)]
    public string? ConditionCategory { get; set; }

    public string? Details { get; set; }
}
