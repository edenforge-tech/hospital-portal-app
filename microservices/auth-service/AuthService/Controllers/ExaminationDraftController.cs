using AuthService.Authorization;
using AuthService.Context;
using AuthService.Models.Domain;
using AuthService.Models.Domain.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace AuthService.Controllers;

/// <summary>
/// Controller for managing examination drafts (auto-save functionality)
/// Drafts expire after 24 hours by default
/// </summary>
[ApiController]
[Route("api/Examinations")]
[Authorize]
public class ExaminationDraftController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<ExaminationDraftController> _logger;

    public ExaminationDraftController(
        AppDbContext context,
        ILogger<ExaminationDraftController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Save or update examination draft (upsert)
    /// POST /api/Examinations/draft
    /// </summary>
    [HttpPost("draft")]
    [RequirePermission("examination.create")]
    public async Task<ActionResult<ExaminationDraftResponse>> SaveDraft([FromBody] SaveExaminationDraftRequest request)
    {
        try
        {
            var tenantId = User.FindFirst("TenantId")?.Value;
            if (string.IsNullOrEmpty(tenantId))
            {
                _logger.LogWarning("SaveDraft: Missing TenantId claim");
                return Unauthorized("TenantId not found in token");
            }

            var userId = User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("SaveDraft: Missing user ID claim");
                return Unauthorized("User ID not found in token");
            }

            var tenantGuid = Guid.Parse(tenantId);
            var userGuid = Guid.Parse(userId);

            // Validate that doctor matches authenticated user
            if (request.DoctorId != userGuid)
            {
                _logger.LogWarning("SaveDraft: Doctor ID mismatch. Request: {RequestDoctor}, Token: {TokenUser}", 
                    request.DoctorId, userGuid);
                return Forbid("You can only save drafts for yourself");
            }

            // Check for existing draft
            var existingDraft = await _context.ExaminationDrafts
                .FirstOrDefaultAsync(d => 
                    d.PatientId == request.PatientId && 
                    d.DoctorId == request.DoctorId &&
                    d.TenantId == tenantGuid);

            var now = DateTime.UtcNow;
            var expiresAt = request.ExpiresAt ?? now.AddHours(24);

            // Calculate completion percentage from JSON data
            int completionPercentage = CalculateCompletionPercentage(request.Data);

            if (existingDraft != null)
            {
                // Update existing draft
                _logger.LogInformation("Updating existing draft {DraftId} for patient {PatientId}", 
                    existingDraft.Id, request.PatientId);

                existingDraft.Data = request.Data;
                existingDraft.UpdatedAt = now;
                existingDraft.ExpiresAt = expiresAt;
                existingDraft.CompletionPercentage = completionPercentage;
                existingDraft.UpdatedByUserId = userGuid;

                await _context.SaveChangesAsync();

                return Ok(MapToResponse(existingDraft));
            }
            else
            {
                // Create new draft
                var newDraft = new ExaminationDraft
                {
                    Id = Guid.NewGuid(),
                    PatientId = request.PatientId,
                    DoctorId = request.DoctorId,
                    TenantId = tenantGuid,
                    Data = request.Data,
                    Timestamp = now,
                    CreatedAt = now,
                    UpdatedAt = now,
                    ExpiresAt = expiresAt,
                    CompletionPercentage = completionPercentage,
                    CreatedByUserId = userGuid,
                    UpdatedByUserId = userGuid
                };

                _context.ExaminationDrafts.Add(newDraft);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created new draft {DraftId} for patient {PatientId}", 
                    newDraft.Id, request.PatientId);

                return CreatedAtAction(nameof(GetDraft), 
                    new { patientId = request.PatientId }, 
                    MapToResponse(newDraft));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving examination draft for patient {PatientId}", request.PatientId);
            return StatusCode(500, "An error occurred while saving the draft");
        }
    }

    /// <summary>
    /// Get draft for a specific patient (returns 404 if not found)
    /// GET /api/Examinations/draft/{patientId}
    /// </summary>
    [HttpGet("draft/{patientId}")]
    [RequirePermission("examination.view")]
    public async Task<ActionResult<ExaminationDraftResponse>> GetDraft(Guid patientId)
    {
        try
        {
            var tenantId = User.FindFirst("TenantId")?.Value;
            if (string.IsNullOrEmpty(tenantId))
            {
                return Unauthorized("TenantId not found in token");
            }

            var userId = User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User ID not found in token");
            }

            var tenantGuid = Guid.Parse(tenantId);
            var userGuid = Guid.Parse(userId);

            var draft = await _context.ExaminationDrafts
                .FirstOrDefaultAsync(d => 
                    d.PatientId == patientId && 
                    d.DoctorId == userGuid &&
                    d.TenantId == tenantGuid &&
                    d.ExpiresAt > DateTime.UtcNow); // Only return non-expired drafts

            if (draft == null)
            {
                _logger.LogInformation("No draft found for patient {PatientId} and doctor {DoctorId}", 
                    patientId, userGuid);
                return NotFound("No draft found for this patient");
            }

            _logger.LogInformation("Retrieved draft {DraftId} for patient {PatientId}", 
                draft.Id, patientId);

            return Ok(MapToResponse(draft));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving examination draft for patient {PatientId}", patientId);
            return StatusCode(500, "An error occurred while retrieving the draft");
        }
    }

    /// <summary>
    /// Delete draft for a specific patient
    /// DELETE /api/Examinations/draft/{patientId}
    /// </summary>
    [HttpDelete("draft/{patientId}")]
    [RequirePermission("examination.delete")]
    public async Task<ActionResult> DeleteDraft(Guid patientId)
    {
        try
        {
            var tenantId = User.FindFirst("TenantId")?.Value;
            if (string.IsNullOrEmpty(tenantId))
            {
                return Unauthorized("TenantId not found in token");
            }

            var userId = User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User ID not found in token");
            }

            var tenantGuid = Guid.Parse(tenantId);
            var userGuid = Guid.Parse(userId);

            var draft = await _context.ExaminationDrafts
                .FirstOrDefaultAsync(d => 
                    d.PatientId == patientId && 
                    d.DoctorId == userGuid &&
                    d.TenantId == tenantGuid);

            if (draft == null)
            {
                _logger.LogInformation("No draft found to delete for patient {PatientId}", patientId);
                return NotFound("No draft found for this patient");
            }

            _context.ExaminationDrafts.Remove(draft);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Deleted draft {DraftId} for patient {PatientId}", 
                draft.Id, patientId);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting examination draft for patient {PatientId}", patientId);
            return StatusCode(500, "An error occurred while deleting the draft");
        }
    }

    /// <summary>
    /// Get all drafts for current doctor
    /// GET /api/Examinations/drafts
    /// </summary>
    [HttpGet("drafts")]
    [RequirePermission("examination.view")]
    public async Task<ActionResult<List<ExaminationDraftResponse>>> GetAllDrafts()
    {
        try
        {
            var tenantId = User.FindFirst("TenantId")?.Value;
            if (string.IsNullOrEmpty(tenantId))
            {
                return Unauthorized("TenantId not found in token");
            }

            var userId = User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User ID not found in token");
            }

            var tenantGuid = Guid.Parse(tenantId);
            var userGuid = Guid.Parse(userId);

            var drafts = await _context.ExaminationDrafts
                .Where(d => 
                    d.DoctorId == userGuid &&
                    d.TenantId == tenantGuid &&
                    d.ExpiresAt > DateTime.UtcNow)
                .OrderByDescending(d => d.UpdatedAt)
                .ToListAsync();

            _logger.LogInformation("Retrieved {Count} drafts for doctor {DoctorId}", 
                drafts.Count, userGuid);

            return Ok(drafts.Select(d => MapToResponse(d)).ToList());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving examination drafts");
            return StatusCode(500, "An error occurred while retrieving drafts");
        }
    }

    /// <summary>
    /// Cleanup expired drafts (admin endpoint)
    /// POST /api/Examinations/drafts/cleanup
    /// </summary>
    [HttpPost("drafts/cleanup")]
    [RequirePermission("system.admin")]
    public async Task<ActionResult<CleanupExpiredDraftsResponse>> CleanupExpiredDrafts()
    {
        try
        {
            var now = DateTime.UtcNow;
            var expiredDrafts = await _context.ExaminationDrafts
                .Where(d => d.ExpiresAt <= now)
                .ToListAsync();

            var count = expiredDrafts.Count;
            _context.ExaminationDrafts.RemoveRange(expiredDrafts);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Cleaned up {Count} expired examination drafts", count);

            return Ok(new CleanupExpiredDraftsResponse
            {
                DeletedCount = count,
                CleanupTime = now,
                Message = $"Successfully deleted {count} expired draft(s)"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cleaning up expired examination drafts");
            return StatusCode(500, "An error occurred while cleaning up expired drafts");
        }
    }

    // Helper methods
    private static ExaminationDraftResponse MapToResponse(ExaminationDraft draft)
    {
        return new ExaminationDraftResponse
        {
            Id = draft.Id,
            PatientId = draft.PatientId,
            DoctorId = draft.DoctorId,
            TenantId = draft.TenantId,
            Data = draft.Data,
            CompletionPercentage = draft.CompletionPercentage,
            CreatedAt = draft.CreatedAt,
            UpdatedAt = draft.UpdatedAt,
            ExpiresAt = draft.ExpiresAt
        };
    }

    private static int CalculateCompletionPercentage(string jsonData)
    {
        try
        {
            var data = JsonSerializer.Deserialize<Dictionary<string, object>>(jsonData);
            if (data == null) return 0;

            // Count how many sections have data
            string[] sections = {
                "visualAcuityData",
                "iopData",
                "retinoscopyData",
                "anteriorSegmentData",
                "posteriorSegmentData",
                "medicationsData",
                "diagnosisData",
                "adviceData"
            };

            int completed = 0;
            foreach (var section in sections)
            {
                if (data.ContainsKey(section) && data[section] != null)
                {
                    var value = data[section].ToString();
                    if (!string.IsNullOrWhiteSpace(value) && value != "{}" && value != "null")
                    {
                        completed++;
                    }
                }
            }

            return (int)Math.Round((completed / (double)sections.Length) * 100);
        }
        catch
        {
            return 0; // If parsing fails, return 0% completion
        }
    }
}
