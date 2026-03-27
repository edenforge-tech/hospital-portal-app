using System;
using System.Security.Claims;
using System.Threading.Tasks;
using AuthService.Models.Counselor;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers
{
    [Route("api/consents")]
    [ApiController]
    [Authorize]
    public class ConsentsController : ControllerBase
    {
        private readonly IConsentManagementService _consentService;

        public ConsentsController(IConsentManagementService consentService)
        {
            _consentService = consentService;
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
        }

        private Guid GetTenantId()
        {
            var tenantIdClaim = User.FindFirst("TenantId")?.Value 
                             ?? User.FindFirst("tenant_id")?.Value;
            
            if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var tenantId))
            {
                throw new UnauthorizedAccessException("Tenant ID not found in user claims");
            }
            
            return tenantId;
        }

        // ==================== Consent Templates ====================

        [HttpGet("templates")]
        public async Task<IActionResult> GetAllTemplates()
        {
            var templates = await _consentService.GetAllTemplatesAsync();
            return Ok(templates);
        }

        [HttpGet("templates/{id}")]
        public async Task<IActionResult> GetTemplateById(Guid id)
        {
            var template = await _consentService.GetTemplateByIdAsync(id);
            return template != null ? Ok(template) : NotFound();
        }

        [HttpPost("templates")]
        public async Task<IActionResult> CreateTemplate([FromBody] CreateConsentTemplateRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var tenantId = GetTenantId();
                var template = await _consentService.CreateTemplateAsync(request, tenantId, userId);
                return CreatedAtAction(nameof(GetTemplateById), new { id = template.Id }, template);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpDelete("templates/{id}")]
        public async Task<IActionResult> DeleteTemplate(Guid id)
        {
            var result = await _consentService.DeleteTemplateAsync(id);
            return result ? NoContent() : NotFound();
        }

        // ==================== Patient Consents ====================

        [HttpGet]
        public async Task<IActionResult> GetAllConsents([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] Guid? sessionId = null)
        {
            try
            {
                var result = await _consentService.GetAllConsentsAsync(page, pageSize, sessionId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ERROR in GetAllConsents: {ex.Message}");
                Console.WriteLine($"   Stack Trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"   Inner Exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, new { error = ex.Message, details = ex.InnerException?.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetConsentById(Guid id)
        {
            var consent = await _consentService.GetConsentByIdAsync(id);
            return consent != null ? Ok(consent) : NotFound();
        }

        [HttpPost("render")]
        public async Task<IActionResult> RenderConsent([FromBody] RenderConsentRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var tenantId = GetTenantId();
                var consent = await _consentService.RenderConsentAsync(request, tenantId, userId);
                return CreatedAtAction(nameof(GetConsentById), new { id = consent.Id }, consent);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("{id}/sign")]
        public async Task<IActionResult> SignConsent(Guid id, [FromBody] SignConsentRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var consent = await _consentService.SignConsentAsync(id, request, userId);
                return Ok(consent);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("{id}/revoke")]
        public async Task<IActionResult> RevokeConsent(Guid id, [FromBody] RevokeConsentRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var consent = await _consentService.RevokeConsentAsync(id, request, userId);
                return Ok(consent);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("{id}/generate-pdf")]
        public async Task<IActionResult> GenerateConsentPdf(Guid id)
        {
            var pdfUrl = await _consentService.GenerateConsentPdfAsync(id);
            return pdfUrl != null ? Ok(new { pdfUrl }) : NotFound();
        }
    }
}
