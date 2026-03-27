using AuthService.Authorization;
using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Controllers;

[ApiController]
[Route("api/patient-notes")]
[Authorize]
public class PatientNotesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<PatientNotesController> _logger;

    public PatientNotesController(AppDbContext context, ILogger<PatientNotesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    private Guid? GetTenantId() => Guid.TryParse(User.FindFirst("TenantId")?.Value ?? User.FindFirst("tenant_id")?.Value, out var id) ? id : null;
    private Guid? GetUserId() => Guid.TryParse(User.FindFirst("sub")?.Value ?? User.FindFirst("UserId")?.Value, out var id) ? id : null;

    [HttpGet("patient/{patientId:guid}")]
    [RequirePermission("patient.view")]
    public async Task<ActionResult> GetByPatient(Guid patientId, [FromQuery] string? noteType = null, [FromQuery] bool? flaggedOnly = null)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var query = _context.PatientNotes
            .Where(n => n.TenantId == tenantId.Value && n.PatientId == patientId);

        if (!string.IsNullOrEmpty(noteType))
            query = query.Where(n => n.NoteType == noteType);

        if (flaggedOnly == true)
            query = query.Where(n => n.IsFlagged == true);

        var notes = await query.OrderByDescending(n => n.CreatedAt).ToListAsync();
        return Ok(notes);
    }

    [HttpGet("{id:guid}")]
    [RequirePermission("patient.view")]
    public async Task<ActionResult> GetById(Guid id)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var note = await _context.PatientNotes
            .FirstOrDefaultAsync(n => n.Id == id && n.TenantId == tenantId.Value);

        if (note == null) return NotFound();
        return Ok(note);
    }

    [HttpPost]
    [RequirePermission("patient.update")]
    public async Task<ActionResult> Create([FromBody] PatientNote request)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        request.Id = Guid.NewGuid();
        request.TenantId = tenantId.Value;
        request.AuthorId = GetUserId();
        request.CreatedAt = DateTime.UtcNow;
        request.UpdatedAt = DateTime.UtcNow;
        request.CreatedByUserId = GetUserId();

        _context.PatientNotes.Add(request);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = request.Id }, request);
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("patient.update")]
    public async Task<ActionResult> Update(Guid id, [FromBody] PatientNote request)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var note = await _context.PatientNotes
            .FirstOrDefaultAsync(n => n.Id == id && n.TenantId == tenantId.Value);

        if (note == null) return NotFound();

        note.NoteType = request.NoteType;
        note.Title = request.Title;
        note.Content = request.Content;
        note.IsFlagged = request.IsFlagged;
        note.FlagReason = request.FlagReason;
        note.Priority = request.Priority;
        note.IsConfidential = request.IsConfidential;
        note.Status = request.Status;
        note.UpdatedAt = DateTime.UtcNow;
        note.UpdatedByUserId = GetUserId();

        await _context.SaveChangesAsync();
        return Ok(note);
    }

    [HttpPost("{id:guid}/flag")]
    [RequirePermission("patient.update")]
    public async Task<ActionResult> ToggleFlag(Guid id, [FromBody] FlagRequest? request = null)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var note = await _context.PatientNotes
            .FirstOrDefaultAsync(n => n.Id == id && n.TenantId == tenantId.Value);

        if (note == null) return NotFound();

        note.IsFlagged = !note.IsFlagged;
        note.FlagReason = note.IsFlagged ? request?.Reason : null;
        note.UpdatedAt = DateTime.UtcNow;
        note.UpdatedByUserId = GetUserId();

        await _context.SaveChangesAsync();
        return Ok(note);
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission("patient.update")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var note = await _context.PatientNotes
            .FirstOrDefaultAsync(n => n.Id == id && n.TenantId == tenantId.Value);

        if (note == null) return NotFound();

        note.DeletedAt = DateTime.UtcNow;
        note.UpdatedByUserId = GetUserId();
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class FlagRequest
{
    public string? Reason { get; set; }
}
