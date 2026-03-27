using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using AuthService.Authorization;
using AuthService.Context;
using AuthService.Models.Domain;

namespace AuthService.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/pre-admission-checklist")]
    public class PreAdmissionChecklistController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<PreAdmissionChecklistController> _logger;

        public PreAdmissionChecklistController(AppDbContext context, ILogger<PreAdmissionChecklistController> logger)
        {
            _context = context;
            _logger = logger;
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

        // ── GET template ─────────────────────────────────────────────────────

        [HttpGet("template")]
        [RequirePermission("counseling_sessions.read")]
        public async Task<IActionResult> GetTemplate(
            [FromQuery] string? patientType,
            [FromQuery] string? surgeryType,
            [FromQuery] int? patientAge)
        {
            try
            {
                var tenantId = GetTenantId();

                // Find best-match template (most specific first)
                var templates = await _context.PreAdmissionChecklistTemplates
                    .Where(t => t.TenantId == tenantId && t.IsActive && t.DeletedAt == null)
                    .OrderBy(t => t.DisplayOrder)
                    .ToListAsync();

                // Score each template: higher score = more specific match
                PreAdmissionChecklistTemplate? best = templates
                    .Where(t =>
                        (t.PatientType == null || t.PatientType == patientType) &&
                        (t.SurgeryCategory == null || t.SurgeryCategory == surgeryType) &&
                        (t.MinPatientAge == null || patientAge == null || patientAge >= t.MinPatientAge) &&
                        (t.MaxPatientAge == null || patientAge == null || patientAge <= t.MaxPatientAge))
                    .OrderByDescending(t =>
                        (t.PatientType != null ? 4 : 0) +
                        (t.SurgeryCategory != null ? 2 : 0) +
                        (t.MinPatientAge != null || t.MaxPatientAge != null ? 1 : 0))
                    .FirstOrDefault();

                if (best == null)
                {
                    // Return default hardcoded items if no template configured
                    return Ok(new
                    {
                        templateId = (Guid?)null,
                        templateName = "Default Checklist",
                        items = GetDefaultItems(),
                        patientTypeInstructions = GetPatientTypeInstructions(patientType),
                        isDefault = true,
                    });
                }

                var items = await _context.PreAdmissionChecklistItems
                    .Where(i => i.TemplateId == best.Id && i.IsActive && i.DeletedAt == null)
                    .OrderBy(i => i.DisplayOrder)
                    .Select(i => new
                    {
                        i.Id,
                        i.ItemKey,
                        i.ItemLabel,
                        i.Description,
                        i.DepartmentOwner,
                        i.DepartmentColor,
                        i.IsMandatory,
                        i.IsBlocking,
                        i.AppliesIfAgeBelow,
                        i.RequiresDocument,
                        i.DisplayOrder,
                    })
                    .ToListAsync();

                return Ok(new
                {
                    templateId = best.Id,
                    templateName = best.TemplateName,
                    description = best.Description,
                    items,
                    patientTypeInstructions = GetPatientTypeInstructions(patientType),
                    isDefault = false,
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving pre-admission checklist template");
                return StatusCode(500, new { message = "Error retrieving template", error = ex.Message });
            }
        }

        // ── GET completion status for a schedule ─────────────────────────────

        [HttpGet("completion/{scheduleId}")]
        [RequirePermission("counseling_sessions.read")]
        public async Task<IActionResult> GetCompletion(Guid scheduleId)
        {
            try
            {
                var tenantId = GetTenantId();

                var completions = await _context.OtAdmissionChecklistCompletions
                    .Where(c => c.ScheduleId == scheduleId && c.TenantId == tenantId && c.DeletedAt == null)
                    .Join(_context.PreAdmissionChecklistItems,
                        c => c.ItemId,
                        i => i.Id,
                        (c, i) => new
                        {
                            completionId = c.Id,
                            itemId = c.ItemId,
                            templateId = c.TemplateId,
                            itemKey = i.ItemKey,
                            itemLabel = i.ItemLabel,
                            departmentOwner = i.DepartmentOwner,
                            departmentColor = i.DepartmentColor,
                            isMandatory = i.IsMandatory,
                            isBlocking = i.IsBlocking,
                            isComplete = c.IsComplete,
                            completedAt = c.CompletedAt,
                            completedByDept = c.CompletedByDept,
                            documentUrl = c.DocumentUrl,
                            notes = c.Notes,
                        })
                    .ToListAsync();

                return Ok(new { scheduleId, completions });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving checklist completion for schedule {ScheduleId}", scheduleId);
                return StatusCode(500, new { message = "Error retrieving completion", error = ex.Message });
            }
        }

        // ── PATCH completion — mark/unmark items ─────────────────────────────

        [HttpPatch("completion/{scheduleId}")]
        [RequirePermission("counseling_sessions.update")]
        public async Task<IActionResult> UpdateCompletion(Guid scheduleId, [FromBody] UpdateChecklistCompletionRequest request)
        {
            try
            {
                var tenantId = GetTenantId();
                var userId = GetCurrentUserId();
                var now = DateTime.UtcNow;

                foreach (var update in request.Updates)
                {
                    var existing = await _context.OtAdmissionChecklistCompletions
                        .FirstOrDefaultAsync(c => c.ScheduleId == scheduleId
                                               && c.ItemId == update.ItemId
                                               && c.TenantId == tenantId
                                               && c.DeletedAt == null);

                    if (existing == null)
                    {
                        // Need template_id — derive from item
                        var item = await _context.PreAdmissionChecklistItems
                            .FirstOrDefaultAsync(i => i.Id == update.ItemId && i.TenantId == tenantId);
                        if (item == null) continue;

                        existing = new OtAdmissionChecklistCompletion
                        {
                            Id = Guid.NewGuid(),
                            TenantId = tenantId,
                            ScheduleId = scheduleId,
                            ItemId = update.ItemId,
                            TemplateId = item.TemplateId,
                            CreatedByUserId = userId,
                            CreatedAt = now,
                        };
                        _context.OtAdmissionChecklistCompletions.Add(existing);
                    }

                    existing.IsComplete = update.IsComplete;
                    existing.UpdatedAt = now;
                    existing.UpdatedByUserId = userId;
                    existing.Notes = update.Notes ?? existing.Notes;
                    existing.CompletedByDept = update.CompletedByDept ?? existing.CompletedByDept;
                    existing.DocumentUrl = update.DocumentUrl ?? existing.DocumentUrl;

                    if (update.IsComplete && !existing.CompletedAt.HasValue)
                    {
                        existing.CompletedAt = now;
                        existing.CompletedByUserId = userId;
                    }
                    else if (!update.IsComplete)
                    {
                        existing.CompletedAt = null;
                        existing.CompletedByUserId = null;
                    }
                }

                await _context.SaveChangesAsync();
                return Ok(new { scheduleId, message = "Checklist updated", updatedAt = now });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating checklist completion for schedule {ScheduleId}", scheduleId);
                return StatusCode(500, new { message = "Error updating completion", error = ex.Message });
            }
        }

        // ── GET step-grouped workflow for a schedule ──────────────────────────

        [HttpGet("workflow/{scheduleId}")]
        [RequirePermission("counseling_sessions.read")]
        public async Task<IActionResult> GetWorkflow(Guid scheduleId)
        {
            try
            {
                var tenantId = GetTenantId();

                var completions = await _context.OtAdmissionChecklistCompletions
                    .Where(c => c.ScheduleId == scheduleId && c.TenantId == tenantId && c.DeletedAt == null)
                    .ToListAsync();

                var allItems = await _context.PreAdmissionChecklistItems
                    .Where(i => i.TenantId == tenantId && i.IsActive && i.DeletedAt == null && i.WorkflowStep != null)
                    .OrderBy(i => i.WorkflowStep)
                    .ThenBy(i => i.DisplayOrder)
                    .ToListAsync();

                var stepGroups = allItems
                    .GroupBy(i => i.WorkflowStep!.Value)
                    .OrderBy(g => g.Key)
                    .Select(g =>
                    {
                        var stepItems = g.Select(item =>
                        {
                            var completion = completions.FirstOrDefault(c => c.ItemId == item.Id);
                            return new
                            {
                                item.Id,
                                item.ItemKey,
                                item.ItemLabel,
                                item.Description,
                                item.DepartmentOwner,
                                item.DepartmentColor,
                                item.IsMandatory,
                                item.IsBlocking,
                                item.RequiresDocument,
                                item.RequiresDeptNotification,
                                item.NotificationDepartment,
                                isComplete = completion?.IsComplete ?? false,
                                completedAt = completion?.CompletedAt,
                                completedByDept = completion?.CompletedByDept,
                                documentUrl = completion?.DocumentUrl,
                                notes = completion?.Notes,
                                completionId = completion?.Id
                            };
                        }).ToList();

                        var mandatoryItems = stepItems.Where(x => x.IsMandatory).ToList();
                        var allMandatoryDone = mandatoryItems.All(x => x.isComplete);
                        var anyBlockerIncomplete = stepItems.Any(x => x.IsBlocking && !x.isComplete);

                        return new
                        {
                            step = g.Key,
                            stepTitle = g.First().StepTitle ?? $"Step {g.Key}",
                            widgetComponent = g.First().StepWidgetComponent,
                            isComplete = allMandatoryDone,
                            isBlocked = anyBlockerIncomplete,
                            progressPercent = mandatoryItems.Count == 0 ? 100
                                : (int)Math.Round((double)mandatoryItems.Count(x => x.isComplete) / mandatoryItems.Count * 100),
                            items = stepItems
                        };
                    }).ToList();

                var totalSteps = stepGroups.Count;
                var completedSteps = stepGroups.Count(s => s.isComplete);

                return Ok(new
                {
                    scheduleId,
                    totalSteps,
                    completedSteps,
                    overallProgress = totalSteps == 0 ? 0 : (int)Math.Round((double)completedSteps / totalSteps * 100),
                    steps = stepGroups
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving workflow for schedule {ScheduleId}", scheduleId);
                return StatusCode(500, new { message = "Error retrieving workflow", error = ex.Message });
            }
        }

        // ── PATCH step-level completion ───────────────────────────────────────

        [HttpPatch("workflow/{scheduleId}/step/{stepNumber}")]
        [RequirePermission("counseling_sessions.update")]
        public async Task<IActionResult> UpdateWorkflowStep(
            Guid scheduleId,
            int stepNumber,
            [FromBody] UpdateWorkflowStepRequest request)
        {
            try
            {
                var tenantId = GetTenantId();
                var userId = GetCurrentUserId();
                var now = DateTime.UtcNow;

                var stepItems = await _context.PreAdmissionChecklistItems
                    .Where(i => i.TenantId == tenantId && i.WorkflowStep == stepNumber
                            && i.IsActive && i.DeletedAt == null)
                    .ToListAsync();

                if (!stepItems.Any())
                    return NotFound(new { message = $"No items found for step {stepNumber}" });

                var updatedItemIds = new List<Guid>();

                if (request.ItemUpdates != null && request.ItemUpdates.Any())
                {
                    foreach (var upd in request.ItemUpdates)
                    {
                        var item = stepItems.FirstOrDefault(i => i.Id == upd.ItemId);
                        if (item == null) continue;

                        var existing = await _context.OtAdmissionChecklistCompletions
                            .FirstOrDefaultAsync(c => c.ScheduleId == scheduleId
                                                   && c.ItemId == upd.ItemId
                                                   && c.TenantId == tenantId
                                                   && c.DeletedAt == null);

                        if (existing == null)
                        {
                            existing = new OtAdmissionChecklistCompletion
                            {
                                Id = Guid.NewGuid(),
                                TenantId = tenantId,
                                ScheduleId = scheduleId,
                                ItemId = upd.ItemId,
                                TemplateId = item.TemplateId,
                                CreatedByUserId = userId,
                                CreatedAt = now,
                            };
                            _context.OtAdmissionChecklistCompletions.Add(existing);
                        }

                        existing.IsComplete = upd.IsComplete;
                        existing.UpdatedAt = now;
                        existing.UpdatedByUserId = userId;
                        if (upd.Notes != null) existing.Notes = upd.Notes;
                        if (upd.CompletedByDept != null) existing.CompletedByDept = upd.CompletedByDept;
                        if (upd.DocumentUrl != null) existing.DocumentUrl = upd.DocumentUrl;

                        if (upd.IsComplete && !existing.CompletedAt.HasValue)
                        {
                            existing.CompletedAt = now;
                            existing.CompletedByUserId = userId;
                        }
                        else if (!upd.IsComplete)
                        {
                            existing.CompletedAt = null;
                            existing.CompletedByUserId = null;
                        }

                        updatedItemIds.Add(upd.ItemId);
                    }
                }
                else if (request.MarkAllComplete.HasValue)
                {
                    foreach (var item in stepItems.Where(i => i.IsMandatory))
                    {
                        var existing = await _context.OtAdmissionChecklistCompletions
                            .FirstOrDefaultAsync(c => c.ScheduleId == scheduleId
                                                   && c.ItemId == item.Id
                                                   && c.TenantId == tenantId
                                                   && c.DeletedAt == null);

                        if (existing == null)
                        {
                            existing = new OtAdmissionChecklistCompletion
                            {
                                Id = Guid.NewGuid(),
                                TenantId = tenantId,
                                ScheduleId = scheduleId,
                                ItemId = item.Id,
                                TemplateId = item.TemplateId,
                                CreatedByUserId = userId,
                                CreatedAt = now,
                            };
                            _context.OtAdmissionChecklistCompletions.Add(existing);
                        }

                        existing.IsComplete = request.MarkAllComplete.Value;
                        existing.UpdatedAt = now;
                        existing.UpdatedByUserId = userId;

                        if (request.MarkAllComplete.Value && !existing.CompletedAt.HasValue)
                        {
                            existing.CompletedAt = now;
                            existing.CompletedByUserId = userId;
                        }
                        else if (!request.MarkAllComplete.Value)
                        {
                            existing.CompletedAt = null;
                            existing.CompletedByUserId = null;
                        }

                        if (request.Notes != null) existing.Notes = request.Notes;
                        updatedItemIds.Add(item.Id);
                    }
                }

                // Update schedule-level denormalised summary
                var schedule = await _context.OTSchedules
                    .FirstOrDefaultAsync(s => s.Id == scheduleId && s.TenantId == tenantId && s.DeletedAt == null);

                await _context.SaveChangesAsync();

                if (schedule != null)
                {
                    var allStepItemsSummary = await _context.PreAdmissionChecklistItems
                        .Where(i => i.TenantId == tenantId && i.IsActive && i.DeletedAt == null && i.WorkflowStep != null)
                        .Select(i => new { i.Id, i.WorkflowStep, i.IsMandatory })
                        .ToListAsync();

                    var doneIds = await _context.OtAdmissionChecklistCompletions
                        .Where(c => c.ScheduleId == scheduleId && c.TenantId == tenantId && c.DeletedAt == null && c.IsComplete)
                        .Select(c => c.ItemId)
                        .ToListAsync();

                    var completedStepCount = allStepItemsSummary
                        .GroupBy(x => x.WorkflowStep)
                        .Count(g => g.Where(x => x.IsMandatory).All(x => doneIds.Contains(x.Id)));

                    schedule.WorkflowStepsCompleted = completedStepCount;
                    schedule.WorkflowLastUpdatedAt = now;
                    schedule.UpdatedAt = now;
                    schedule.UpdatedByUserId = userId;

                    await _context.SaveChangesAsync();
                }

                return Ok(new
                {
                    scheduleId,
                    stepNumber,
                    updatedItems = updatedItemIds.Count,
                    message = "Workflow step updated"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating workflow step {StepNumber} for schedule {ScheduleId}", stepNumber, scheduleId);
                return StatusCode(500, new { message = "Error updating workflow step", error = ex.Message });
            }
        }

        // ── Admin: list templates ─────────────────────────────────────────────
        [RequirePermission("admin.manage")]
        public async Task<IActionResult> ListTemplates()
        {
            try
            {
                var tenantId = GetTenantId();
                var templates = await _context.PreAdmissionChecklistTemplates
                    .Where(t => t.TenantId == tenantId && t.DeletedAt == null)
                    .OrderBy(t => t.DisplayOrder)
                    .Select(t => new
                    {
                        t.Id, t.TemplateName, t.Description, t.PatientType,
                        t.SurgeryCategory, t.MinPatientAge, t.MaxPatientAge,
                        t.AppliesToEye, t.DisplayOrder, t.IsActive, t.CreatedAt,
                    })
                    .ToListAsync();
                return Ok(templates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error listing checklist templates");
                return StatusCode(500, new { message = "Error listing templates", error = ex.Message });
            }
        }

        // ── Admin: create template ────────────────────────────────────────────

        [HttpPost("templates")]
        [RequirePermission("admin.manage")]
        public async Task<IActionResult> CreateTemplate([FromBody] CreateTemplateRequest request)
        {
            try
            {
                var tenantId = GetTenantId();
                var userId = GetCurrentUserId();
                var now = DateTime.UtcNow;

                var template = new PreAdmissionChecklistTemplate
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    TemplateName = request.TemplateName,
                    Description = request.Description,
                    PatientType = request.PatientType,
                    SurgeryCategory = request.SurgeryCategory,
                    MinPatientAge = request.MinPatientAge,
                    MaxPatientAge = request.MaxPatientAge,
                    AppliesToEye = request.AppliesToEye,
                    DisplayOrder = request.DisplayOrder,
                    IsActive = true,
                    CreatedByUserId = userId,
                    UpdatedByUserId = userId,
                    CreatedAt = now,
                    UpdatedAt = now,
                };
                _context.PreAdmissionChecklistTemplates.Add(template);

                foreach (var (itemReq, idx) in request.Items.Select((r, i) => (r, i)))
                {
                    _context.PreAdmissionChecklistItems.Add(new PreAdmissionChecklistItem
                    {
                        Id = Guid.NewGuid(),
                        TenantId = tenantId,
                        TemplateId = template.Id,
                        ItemKey = itemReq.ItemKey,
                        ItemLabel = itemReq.ItemLabel,
                        Description = itemReq.Description,
                        DepartmentOwner = itemReq.DepartmentOwner,
                        DepartmentColor = itemReq.DepartmentColor,
                        IsMandatory = itemReq.IsMandatory,
                        IsBlocking = itemReq.IsBlocking,
                        AppliesIfAgeBelow = itemReq.AppliesIfAgeBelow,
                        RequiresDocument = itemReq.RequiresDocument,
                        DisplayOrder = itemReq.DisplayOrder ?? idx,
                        IsActive = true,
                        CreatedByUserId = userId,
                        UpdatedByUserId = userId,
                        CreatedAt = now,
                        UpdatedAt = now,
                    });
                }

                await _context.SaveChangesAsync();
                return StatusCode(201, new { templateId = template.Id, message = "Template created" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating checklist template");
                return StatusCode(500, new { message = "Error creating template", error = ex.Message });
            }
        }

        // ── Helpers ───────────────────────────────────────────────────────────

        private static List<object> GetDefaultItems() => new()
        {
            new { itemKey = "biometry_done",          itemLabel = "Biometry / A-Scan",             departmentOwner = "Optometry",   departmentColor = "bg-teal-100 text-teal-700",   isMandatory = true,  isBlocking = false, displayOrder = 0 },
            new { itemKey = "labs_done",               itemLabel = "Pre-op lab reports",            departmentOwner = "Lab",         departmentColor = "bg-yellow-100 text-yellow-700", isMandatory = true,  isBlocking = false, displayOrder = 1 },
            new { itemKey = "ecg_done",                itemLabel = "ECG / Anaesthesia fitness",     departmentOwner = "Cardiology",  departmentColor = "bg-red-100 text-red-700",     isMandatory = true,  isBlocking = false, displayOrder = 2 },
            new { itemKey = "anesthesia_clearance",    itemLabel = "Anaesthesia clearance",         departmentOwner = "Anaesthesia", departmentColor = "bg-orange-100 text-orange-700", isMandatory = true, isBlocking = true,  displayOrder = 3 },
            new { itemKey = "consent_signed",          itemLabel = "Surgical consent signed",       departmentOwner = "Counselor",   departmentColor = "bg-blue-100 text-blue-700",   isMandatory = true,  isBlocking = true,  displayOrder = 4 },
            new { itemKey = "payment_confirmed",       itemLabel = "Payment / Insurance cleared",   departmentOwner = "Billing",     departmentColor = "bg-green-100 text-green-700", isMandatory = true,  isBlocking = false, displayOrder = 5 },
            new { itemKey = "bed_assigned",            itemLabel = "Bed / ward assigned",           departmentOwner = "Admissions",  departmentColor = "bg-purple-100 text-purple-700", isMandatory = false, isBlocking = false, displayOrder = 6 },
            new { itemKey = "ot_slot_confirmed",       itemLabel = "OT slot confirmed",             departmentOwner = "OT",          departmentColor = "bg-indigo-100 text-indigo-700", isMandatory = true,  isBlocking = true,  displayOrder = 7 },
        };

        private static object? GetPatientTypeInstructions(string? patientType) => patientType switch
        {
            "Cash" => new { docs = new[] { "Govt. ID proof", "Address proof" }, financial = "Full payment due before surgery. Ask billing for package quote.", specialNote = (string?)null },
            "Insurance" => new { docs = new[] { "Insurance card (original + copy)", "Pre-authorization letter", "Referral letter (if required)", "Policy schedule" }, financial = "Ensure pre-auth is approved before OT booking. Balance (non-covered) due on admission.", specialNote = "Confirm network status of hospital with insurer." },
            "CoPay" => new { docs = new[] { "Insurance card", "Pre-authorization letter" }, financial = "Co-pay amount due on day of admission. Balance claimed from insurer.", specialNote = (string?)null },
            "ESH" => new { docs = new[] { "ESI card / ESI number", "Referral form from ESI dispensary" }, financial = "Fully covered under ESI. No payment needed unless non-covered items.", specialNote = "Valid ESI referral mandatory before surgery." },
            "CGHS" => new { docs = new[] { "CGHS card", "CGHS referral letter from empanelled doctor", "Treatment permission letter (for major surgeries)" }, financial = "Covered under CGHS approved rates. Obtain prior approval for procedures > ₹15,000.", specialNote = "Ensure hospital is on CGHS empanelled list for current financial year." },
            "Arograshree" => new { docs = new[] { "Aarogya Sri / Aarogyasri health card", "Referral slip from network hospital" }, financial = "Covered under Aarogya Sri scheme. Verify eligibility online before admission.", specialNote = "Patient must be from Telangana/AP. Card must show active status." },
            "SGHS" => new { docs = new[] { "State Government Health Scheme card", "Referral letter from dept head" }, financial = "Fully covered under SGHS. Approval from designated authority required for surgery.", specialNote = (string?)null },
            "Camp" => new { docs = new[] { "Camp registration slip", "Referring doctor's note from camp" }, financial = "Subsidized / no-charge as per camp agreement. Confirm package with admin.", specialNote = "Confirm camp code with front desk before creating file." },
            "Railway" => new { docs = new[] { "Railway Beneficiary Card", "RELHS Referral Letter from CMO/RMD", "Employee ID / Service Certificate" }, financial = "Zero advance payment — billed directly to Railway. Obtain pre-auth from Chief Medical Director for major surgeries.", specialNote = "Valid RELHS referral is mandatory. Verify beneficiary card expiry date before surgery." },
            "Free" => new { docs = new[] { "BPL Card or Below-Poverty-Line Certificate", "Income Certificate", "Charity Approval Form signed by Social Worker", "Management Approval Letter" }, financial = "All surgery and hospital charges waived under charity scheme. Mandatory management approval required before OT booking.", specialNote = "Social worker approval and management sign-off must be obtained prior to scheduling." },
            _ => null
        };
    }

    // ── Request DTOs ──────────────────────────────────────────────────────────

    public class UpdateChecklistCompletionRequest
    {
        public List<ChecklistItemUpdate> Updates { get; set; } = new();
    }

    public class ChecklistItemUpdate
    {
        public Guid ItemId { get; set; }
        public bool IsComplete { get; set; }
        public string? Notes { get; set; }
        public string? CompletedByDept { get; set; }
        public string? DocumentUrl { get; set; }
    }

    public class CreateTemplateRequest
    {
        public string TemplateName { get; set; } = null!;
        public string? Description { get; set; }
        public string? PatientType { get; set; }
        public string? SurgeryCategory { get; set; }
        public int? MinPatientAge { get; set; }
        public int? MaxPatientAge { get; set; }
        public string? AppliesToEye { get; set; }
        public int DisplayOrder { get; set; } = 0;
        public List<CreateTemplateItemRequest> Items { get; set; } = new();
    }

    public class CreateTemplateItemRequest
    {
        public string ItemKey { get; set; } = null!;
        public string ItemLabel { get; set; } = null!;
        public string? Description { get; set; }
        public string? DepartmentOwner { get; set; }
        public string? DepartmentColor { get; set; }
        public bool IsMandatory { get; set; } = true;
        public bool IsBlocking { get; set; } = false;
        public int? AppliesIfAgeBelow { get; set; }
        public bool RequiresDocument { get; set; } = false;
        public int? DisplayOrder { get; set; }
    }

    public class UpdateWorkflowStepRequest
    {
        /// <summary>Provide specific per-item updates, OR use MarkAllComplete for bulk.</summary>
        public List<ChecklistItemUpdate>? ItemUpdates { get; set; }

        /// <summary>If set, marks all mandatory items in the step complete (true) or incomplete (false).</summary>
        public bool? MarkAllComplete { get; set; }

        /// <summary>Optional note applied to all updated items when using MarkAllComplete.</summary>
        public string? Notes { get; set; }
    }
}
