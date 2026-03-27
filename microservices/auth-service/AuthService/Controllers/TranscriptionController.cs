using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using AuthService.Authorization;
using AuthService.Models.Counselor;
using AuthService.Services.Interfaces;

namespace AuthService.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TranscriptionController : ControllerBase
    {
        private readonly ITranscriptionService _transcriptionService;
        private readonly ILogger<TranscriptionController> _logger;

        public TranscriptionController(
            ITranscriptionService transcriptionService,
            ILogger<TranscriptionController> logger)
        {
            _transcriptionService = transcriptionService;
            _logger = logger;
        }

        private Guid GetTenantId()
        {
            var tenantIdClaim = User.FindFirst("TenantId")?.Value;
            if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var tenantId))
            {
                throw new UnauthorizedAccessException("Tenant ID not found in token");
            }
            return tenantId;
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("User ID not found in token");
            }
            return userId;
        }

        // ============================================================================
        // TRANSCRIPTION OPERATIONS
        // ============================================================================

        /// <summary>
        /// Start transcription for a session recording
        /// </summary>
        [HttpPost("start/{recordingId}")]
        [RequirePermission("transcription.start")]
        public async Task<IActionResult> StartTranscription(
            Guid recordingId,
            [FromBody] StartTranscriptionRequest request)
        {
            try
            {
                var tenantId = GetTenantId();
                var response = await _transcriptionService.StartTranscriptionAsync(
                    tenantId,
                    recordingId,
                    request.SourceLanguage ?? "en-US");

                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting transcription for recording {RecordingId}", recordingId);
                return StatusCode(500, new { message = "Error starting transcription", error = ex.Message });
            }
        }

        /// <summary>
        /// Check transcription status for a recording
        /// </summary>
        [HttpGet("status/{recordingId}")]
        [RequirePermission("transcription.view")]
        public async Task<IActionResult> GetTranscriptionStatus(Guid recordingId)
        {
            try
            {
                var status = await _transcriptionService.CheckTranscriptionStatusAsync(recordingId);
                return Ok(new { recordingId, status });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking transcription status for recording {RecordingId}", recordingId);
                return StatusCode(500, new { message = "Error checking status", error = ex.Message });
            }
        }

        /// <summary>
        /// Get all transcripts (all languages) for a recording
        /// </summary>
        [HttpGet("{recordingId}/transcripts")]
        [RequirePermission("transcription.view")]
        public async Task<IActionResult> GetTranscripts(Guid recordingId)
        {
            try
            {
                var tenantId = GetTenantId();
                var transcripts = await _transcriptionService.GetTranscriptsAsync(tenantId, recordingId);
                return Ok(transcripts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving transcripts for recording {RecordingId}", recordingId);
                return StatusCode(500, new { message = "Error retrieving transcripts", error = ex.Message });
            }
        }

        // ============================================================================
        // TRANSLATION OPERATIONS
        // ============================================================================

        /// <summary>
        /// Start translation for a transcript to one or more target languages
        /// </summary>
        [HttpPost("translate")]
        [RequirePermission("transcription.translate")]
        public async Task<IActionResult> StartTranslation([FromBody] StartTranslationRequest request)
        {
            try
            {
                var tenantId = GetTenantId();
                var response = await _transcriptionService.StartTranslationAsync(
                    tenantId,
                    request.RecordingId,
                    request.SourceTranscriptId,
                    request.TargetLanguages);

                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting translation for transcript {TranscriptId}", request.SourceTranscriptId);
                return StatusCode(500, new { message = "Error starting translation", error = ex.Message });
            }
        }

        // ============================================================================
        // TRANSCRIPT EDITING
        // ============================================================================

        /// <summary>
        /// Edit a transcript segment (manual correction)
        /// </summary>
        [HttpPatch("edit")]
        [RequirePermission("transcription.edit")]
        public async Task<IActionResult> EditTranscriptSegment([FromBody] EditTranscriptRequest request)
        {
            try
            {
                var tenantId = GetTenantId();
                var currentUserId = GetCurrentUserId();

                var result = await _transcriptionService.EditTranscriptSegmentAsync(
                    tenantId,
                    request,
                    currentUserId);

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error editing transcript {TranscriptId}", request.TranscriptId);
                return StatusCode(500, new { message = "Error editing transcript", error = ex.Message });
            }
        }

        /// <summary>
        /// Get edit history for a transcript
        /// </summary>
        [HttpGet("{transcriptId}/edits")]
        [RequirePermission("transcription.view")]
        public async Task<IActionResult> GetTranscriptEdits(Guid transcriptId)
        {
            try
            {
                var tenantId = GetTenantId();
                var edits = await _transcriptionService.GetTranscriptEditsAsync(tenantId, transcriptId);
                return Ok(edits);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving edit history for transcript {TranscriptId}", transcriptId);
                return StatusCode(500, new { message = "Error retrieving edit history", error = ex.Message });
            }
        }

        // ============================================================================
        // UTILITY ENDPOINTS
        // ============================================================================

        /// <summary>
        /// Get supported languages for transcription/translation
        /// </summary>
        [HttpGet("languages")]
        [RequirePermission("transcription.view")]
        public IActionResult GetSupportedLanguages()
        {
            var languages = new[]
            {
                new { code = "en-US", name = "English" },
                new { code = "hi-IN", name = "Hindi" },
                new { code = "te-IN", name = "Telugu" }
            };

            return Ok(languages);
        }
    }
}
