using AuthService.Authorization;
using AuthService.Context;
using AuthService.Models.Domain;
using AuthService.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace AuthService.Controllers
{
    /// <summary>
    /// Patient Upload Links — generate shareable tokens for patients to upload pre-op documents.
    /// Supports Step 2 (Imaging & Scans) upload-link flow.
    /// Migration 73, §4: patient_upload_links table.
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/patient-uploads")]
    public class PatientUploadsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<PatientUploadsController> _logger;
        private readonly IConfiguration _configuration;
        private readonly IBlobStorageService _blobStorageService;

        public PatientUploadsController(
            AppDbContext context,
            ILogger<PatientUploadsController> logger,
            IConfiguration configuration,
            IBlobStorageService blobStorageService)
        {
            _context = context;
            _logger = logger;
            _configuration = configuration;
            _blobStorageService = blobStorageService;
        }

        private Guid GetTenantId()
        {
            var claim = User.FindFirst("TenantId")?.Value;
            if (string.IsNullOrEmpty(claim) || !Guid.TryParse(claim, out var id))
                throw new UnauthorizedAccessException("Tenant ID not found in token");
            return id;
        }

        private Guid GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(claim) || !Guid.TryParse(claim, out var id))
                throw new UnauthorizedAccessException("User ID not found in token");
            return id;
        }

        // ── POST /api/patient-uploads/generate-link ──────────────────────────
        // Creates a patient_upload_links record with a secure token; returns the
        // shareable URL to be sent via SMS/WhatsApp/email (stub — no gateway integration).

        [HttpPost("generate-link")]
        [RequirePermission("counseling_sessions.update")]
        public async Task<IActionResult> GenerateLink([FromBody] GenerateUploadLinkRequest request)
        {
            try
            {
                var tenantId = GetTenantId();
                var userId = GetCurrentUserId();
                var now = DateTime.UtcNow;

                // Generate a cryptographically secure random token
                var tokenBytes = new byte[32];
                System.Security.Cryptography.RandomNumberGenerator.Fill(tokenBytes);
                var token = Convert.ToBase64String(tokenBytes)
                    .Replace("+", "-").Replace("/", "_").Replace("=", "");

                // Build the shareable URL
                var baseUrl = _configuration["Frontend:BaseUrl"] ?? "https://hospitalportal.example.com";
                var linkUrl = $"{baseUrl}/upload/{token}";

                var expiresAt = now.AddHours(request.ExpiresInHours > 0 ? request.ExpiresInHours : 72);

                var link = new PatientUploadLink
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    BranchId = request.BranchId,
                    ScheduleId = request.ScheduleId,
                    SessionId = request.SessionId,
                    PatientId = request.PatientId,
                    LinkToken = token,
                    LinkUrl = linkUrl,
                    Purpose = request.Purpose ?? "pre_op_documents",
                    Description = request.Description,
                    ExpiresAt = expiresAt,
                    IsActive = true,
                    UploadedFiles = "[]",
                    FileCount = 0,
                    CreatedByUserId = userId,
                    UpdatedByUserId = userId,
                    CreatedAt = now,
                    UpdatedAt = now,
                };

                _context.PatientUploadLinks.Add(link);
                await _context.SaveChangesAsync();

                _logger.LogInformation(
                    "Patient upload link generated for patient {PatientId}, schedule {ScheduleId}",
                    request.PatientId, request.ScheduleId);

                return StatusCode(201, new
                {
                    id = link.Id,
                    linkToken = token,
                    linkUrl,
                    expiresAt,
                    purpose = link.Purpose,
                    // NOTE: SMS/WhatsApp/email sending is a stub — integrate real gateway here
                    shareNote = "Use linkUrl to share via SMS, WhatsApp, or Email.",
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating patient upload link");
                return StatusCode(500, new { message = "Error generating upload link", error = ex.Message });
            }
        }

        // ── GET /api/patient-uploads/schedule/{scheduleId} ───────────────────
        // Returns all upload links for a schedule (used to check upload status in Step 2).

        [HttpGet("schedule/{scheduleId}")]
        [RequirePermission("counseling_sessions.read")]
        public async Task<IActionResult> GetBySchedule(Guid scheduleId)
        {
            try
            {
                var tenantId = GetTenantId();
                var links = await _context.PatientUploadLinks
                    .Where(l => l.ScheduleId == scheduleId
                             && l.TenantId == tenantId
                             && l.DeletedAt == null)
                    .OrderByDescending(l => l.CreatedAt)
                    .Select(l => new
                    {
                        l.Id, l.LinkUrl, l.Purpose, l.Description,
                        l.ExpiresAt, l.IsActive, l.FileCount, l.UploadedFiles,
                        l.UsedAt, l.CreatedAt,
                        isExpired = l.ExpiresAt < DateTime.UtcNow,
                    })
                    .ToListAsync();

                return Ok(links);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching upload links for schedule {ScheduleId}", scheduleId);
                return StatusCode(500, new { message = "Error fetching upload links", error = ex.Message });
            }
        }

        // ── GET /api/patient-uploads/{id}/status ─────────────────────────────
        // Poll whether the patient has uploaded files via the link.

        [HttpGet("{id}/status")]
        [RequirePermission("counseling_sessions.read")]
        public async Task<IActionResult> GetLinkStatus(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var link = await _context.PatientUploadLinks
                    .FirstOrDefaultAsync(l => l.Id == id && l.TenantId == tenantId && l.DeletedAt == null);

                if (link == null) return NotFound(new { message = "Upload link not found" });

                return Ok(new
                {
                    id = link.Id,
                    fileCount = link.FileCount,
                    uploadedFiles = link.UploadedFiles,
                    isActive = link.IsActive,
                    isExpired = link.ExpiresAt < DateTime.UtcNow,
                    usedAt = link.UsedAt,
                    expiresAt = link.ExpiresAt,
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching upload link status {Id}", id);
                return StatusCode(500, new { message = "Error fetching link status", error = ex.Message });
            }
        }

        // ── DELETE /api/patient-uploads/{id} ─────────────────────────────────
        // Revoke / soft-delete an upload link.

        [HttpDelete("{id}")]
        [RequirePermission("counseling_sessions.update")]
        public async Task<IActionResult> RevokeLink(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var userId = GetCurrentUserId();
                var now = DateTime.UtcNow;

                var link = await _context.PatientUploadLinks
                    .FirstOrDefaultAsync(l => l.Id == id && l.TenantId == tenantId && l.DeletedAt == null);

                if (link == null) return NotFound(new { message = "Upload link not found" });

                link.IsActive = false;
                link.DeletedAt = now;
                link.UpdatedAt = now;
                link.UpdatedByUserId = userId;

                await _context.SaveChangesAsync();
                return Ok(new { id = link.Id, revoked = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error revoking upload link {Id}", id);
                return StatusCode(500, new { message = "Error revoking link", error = ex.Message });
            }
        }

        // ── GET /api/patient-uploads/{token}/info ─────────────────────────────
        // Public endpoint — no auth — returns non-PII info about what to upload.

        [AllowAnonymous]
        [HttpGet("{token}/info")]
        public async Task<IActionResult> GetLinkInfo(string token)
        {
            try
            {
                var link = await _context.PatientUploadLinks
                    .FirstOrDefaultAsync(l => l.LinkToken == token && l.DeletedAt == null);

                if (link == null)
                    return NotFound(new { message = "Upload link not found", isValid = false });

                var isExpired = link.ExpiresAt < DateTime.UtcNow;
                var isValid = link.IsActive && !isExpired;

                return Ok(new
                {
                    description = link.Description ?? "Pre-operative document upload",
                    purpose = link.Purpose,
                    expiresAt = link.ExpiresAt,
                    isValid,
                    isExpired,
                    fileCount = link.FileCount,
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching upload link info for token");
                return StatusCode(500, new { message = "Error fetching link info", error = ex.Message });
            }
        }

        // ── POST /api/patient-uploads/{token}/submit ──────────────────────────
        // Public endpoint — no auth — patient submits file from share link page.

        [AllowAnonymous]
        [HttpPost("{token}/submit")]
        public async Task<IActionResult> SubmitFile(string token, IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { message = "No file provided" });

                const long maxSize = 20 * 1024 * 1024; // 20 MB
                if (file.Length > maxSize)
                    return BadRequest(new { message = "File too large (max 20 MB)" });

                var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif", "application/pdf" };
                if (!allowedTypes.Contains(file.ContentType.ToLower()))
                    return BadRequest(new { message = "Invalid file type. Allowed: JPEG, PNG, GIF, PDF" });

                var link = await _context.PatientUploadLinks
                    .FirstOrDefaultAsync(l => l.LinkToken == token && l.DeletedAt == null);

                if (link == null)
                    return NotFound(new { message = "Upload link not found" });

                if (!link.IsActive || link.ExpiresAt < DateTime.UtcNow)
                    return StatusCode(410, new { message = "This upload link has expired. Please ask your counselor for a new link." });

                // Upload to Azure Blob Storage under scan-uploads container
                var ext = Path.GetExtension(file.FileName) is { Length: > 0 } e ? e : ".bin";
                var safeName = $"patient-upload/{link.PatientId}/{Guid.NewGuid()}{ext}";

                string fileUrl;
                await using (var stream = file.OpenReadStream())
                {
                    fileUrl = await _blobStorageService.UploadFileAsync(
                        safeName, stream, file.ContentType, "scan-uploads");
                }

                var uploadedAt = DateTime.UtcNow;

                // Append to uploaded_files JSON array
                var existing = JsonSerializer.Deserialize<List<Dictionary<string, object>>>(link.UploadedFiles ?? "[]")
                               ?? new List<Dictionary<string, object>>();
                existing.Add(new Dictionary<string, object>
                {
                    ["fileUrl"] = fileUrl,
                    ["fileName"] = file.FileName,
                    ["uploadedAt"] = uploadedAt.ToString("O"),
                });
                link.UploadedFiles = JsonSerializer.Serialize(existing);
                link.FileCount = existing.Count;
                link.UsedAt ??= uploadedAt;
                link.UpdatedAt = uploadedAt;

                await _context.SaveChangesAsync();

                _logger.LogInformation(
                    "Patient uploaded file for link token (patientId={PatientId})", link.PatientId);

                return Ok(new { fileUrl, fileName = file.FileName, uploadedAt });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing patient file upload for token");
                return StatusCode(500, new { message = "Upload failed. Please try again.", error = ex.Message });
            }
        }
    }

    // ── DTOs ──────────────────────────────────────────────────────────────────

    public class GenerateUploadLinkRequest
    {
        public Guid PatientId { get; set; }
        public Guid? ScheduleId { get; set; }
        public Guid? SessionId { get; set; }
        public Guid? BranchId { get; set; }
        public string? Purpose { get; set; }
        public string? Description { get; set; }
        /// <summary>Hours until the link expires (default 72h).</summary>
        public int ExpiresInHours { get; set; } = 72;
    }
}
