using System;
using System.Linq;
using System.Threading.Tasks;
using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/message-templates")]
    [Authorize]
    public class MessageTemplatesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MessageTemplatesController(AppDbContext context)
        {
            _context = context;
        }

        // ── Helpers ──────────────────────────────────────────────────────────

        private bool TryGetTenantId(out Guid tenantId)
        {
            var claim = User.FindFirst("tenant_id") ?? User.FindFirst("TenantId");
            return Guid.TryParse(claim?.Value, out tenantId);
        }

        private Guid GetCurrentUserId()
        {
            var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)
                ?? User.FindFirst("sub");
            Guid.TryParse(claim?.Value, out var id);
            return id;
        }

        // ── List ─────────────────────────────────────────────────────────────

        /// <summary>GET /api/message-templates — list templates, optionally filtered</summary>
        [HttpGet]
        public async Task<IActionResult> List(
            [FromQuery] string? channel = null,
            [FromQuery] string? category = null,
            [FromQuery] string? patientType = null,
            [FromQuery] bool includeGlobal = true,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "TenantId missing" });

            var query = _context.CommunicationMessageTemplates
                .Where(t => t.DeletedAt == null && t.IsActive)
                .Where(t => t.TenantId == tenantId || (includeGlobal && t.IsGlobal));

            if (!string.IsNullOrEmpty(channel))
                query = query.Where(t => t.Channel == channel);

            if (!string.IsNullOrEmpty(category))
                query = query.Where(t => t.TemplateCategory == category);

            if (!string.IsNullOrEmpty(patientType))
                query = query.Where(t => t.PatientTypeTarget == null || t.PatientTypeTarget == patientType);

            var total = await query.CountAsync();
            var items = await query
                .OrderBy(t => t.TemplateCategory)
                .ThenBy(t => t.TemplateName)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(t => new
                {
                    t.Id,
                    t.TemplateName,
                    t.TemplateCategory,
                    t.Channel,
                    t.Subject,
                    t.Body,
                    t.PatientTypeTarget,
                    t.DelayReasonTarget,
                    t.EstimatedReadTimeSec,
                    t.IsGlobal,
                    t.RequiresApproval,
                    t.CreatedAt,
                    t.UpdatedAt,
                })
                .ToListAsync();

            return Ok(new { total, page, pageSize, items });
        }

        // ── Get by ID ─────────────────────────────────────────────────────────

        /// <summary>GET /api/message-templates/{id}</summary>
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "TenantId missing" });

            var template = await _context.CommunicationMessageTemplates
                .Where(t => t.Id == id && t.DeletedAt == null)
                .Where(t => t.TenantId == tenantId || t.IsGlobal)
                .FirstOrDefaultAsync();

            if (template == null)
                return NotFound(new { message = "Template not found" });

            return Ok(template);
        }

        // ── Create ────────────────────────────────────────────────────────────

        public class CreateTemplateRequest
        {
            public string TemplateName { get; set; } = null!;
            public string TemplateCategory { get; set; } = "General";
            public string Channel { get; set; } = "SMS";
            public string? Subject { get; set; }
            public string Body { get; set; } = null!;
            public string? PatientTypeTarget { get; set; }
            public string? DelayReasonTarget { get; set; }
            public int? EstimatedReadTimeSec { get; set; }
            public bool RequiresApproval { get; set; } = false;
        }

        /// <summary>POST /api/message-templates — create a new template</summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTemplateRequest request)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "TenantId missing" });

            if (string.IsNullOrWhiteSpace(request.TemplateName))
                return BadRequest(new { message = "TemplateName is required" });

            if (string.IsNullOrWhiteSpace(request.Body))
                return BadRequest(new { message = "Body is required" });

            var template = new CommunicationMessageTemplate
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                TemplateName = request.TemplateName.Trim(),
                TemplateCategory = request.TemplateCategory,
                Channel = request.Channel,
                Subject = request.Subject,
                Body = request.Body,
                PatientTypeTarget = request.PatientTypeTarget,
                DelayReasonTarget = request.DelayReasonTarget,
                EstimatedReadTimeSec = request.EstimatedReadTimeSec,
                RequiresApproval = request.RequiresApproval,
                IsActive = true,
                IsGlobal = false,
                Status = "active",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedByUserId = GetCurrentUserId(),
                UpdatedByUserId = GetCurrentUserId(),
            };

            _context.CommunicationMessageTemplates.Add(template);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = template.Id }, template);
        }

        // ── Update ────────────────────────────────────────────────────────────

        public class UpdateTemplateRequest
        {
            public string? TemplateName { get; set; }
            public string? TemplateCategory { get; set; }
            public string? Channel { get; set; }
            public string? Subject { get; set; }
            public string? Body { get; set; }
            public string? PatientTypeTarget { get; set; }
            public string? DelayReasonTarget { get; set; }
            public int? EstimatedReadTimeSec { get; set; }
            public bool? RequiresApproval { get; set; }
            public bool? IsActive { get; set; }
        }

        /// <summary>PATCH /api/message-templates/{id} — update a template</summary>
        [HttpPatch("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTemplateRequest request)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "TenantId missing" });

            var template = await _context.CommunicationMessageTemplates
                .Where(t => t.Id == id && t.TenantId == tenantId && t.DeletedAt == null)
                .FirstOrDefaultAsync();

            if (template == null)
                return NotFound(new { message = "Template not found" });

            if (request.TemplateName != null) template.TemplateName = request.TemplateName.Trim();
            if (request.TemplateCategory != null) template.TemplateCategory = request.TemplateCategory;
            if (request.Channel != null) template.Channel = request.Channel;
            if (request.Subject != null) template.Subject = request.Subject;
            if (request.Body != null) template.Body = request.Body;
            if (request.PatientTypeTarget != null) template.PatientTypeTarget = request.PatientTypeTarget;
            if (request.DelayReasonTarget != null) template.DelayReasonTarget = request.DelayReasonTarget;
            if (request.EstimatedReadTimeSec.HasValue) template.EstimatedReadTimeSec = request.EstimatedReadTimeSec;
            if (request.RequiresApproval.HasValue) template.RequiresApproval = request.RequiresApproval.Value;
            if (request.IsActive.HasValue)
            {
                template.IsActive = request.IsActive.Value;
                template.Status = request.IsActive.Value ? "active" : "inactive";
            }

            template.UpdatedAt = DateTime.UtcNow;
            template.UpdatedByUserId = GetCurrentUserId();

            await _context.SaveChangesAsync();
            return Ok(template);
        }

        // ── Delete ────────────────────────────────────────────────────────────

        /// <summary>DELETE /api/message-templates/{id} — soft delete</summary>
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "TenantId missing" });

            var template = await _context.CommunicationMessageTemplates
                .Where(t => t.Id == id && t.TenantId == tenantId && t.DeletedAt == null)
                .FirstOrDefaultAsync();

            if (template == null)
                return NotFound(new { message = "Template not found" });

            template.DeletedAt = DateTime.UtcNow;
            template.Status = "archived";
            template.UpdatedAt = DateTime.UtcNow;
            template.UpdatedByUserId = GetCurrentUserId();

            await _context.SaveChangesAsync();
            return Ok(new { message = "Template deleted", id });
        }
    }
}
