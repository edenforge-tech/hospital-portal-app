using AuthService.Authorization;
using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Controllers;

[ApiController]
[Route("api/patient-consents")]
[Authorize]
public class PatientConsentsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<PatientConsentsController> _logger;

    public PatientConsentsController(AppDbContext context, ILogger<PatientConsentsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    private Guid? GetTenantId() => Guid.TryParse(User.FindFirst("TenantId")?.Value ?? User.FindFirst("tenant_id")?.Value, out var id) ? id : null;
    private Guid? GetUserId() => Guid.TryParse(User.FindFirst("sub")?.Value ?? User.FindFirst("UserId")?.Value, out var id) ? id : null;

    [HttpGet("patient/{patientId:guid}")]
    [RequirePermission("patient.view")]
    public async Task<ActionResult> GetByPatient(Guid patientId)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var consents = await _context.PatientConsents
            .Where(c => c.TenantId == tenantId.Value && c.PatientId == patientId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return Ok(consents);
    }

    [HttpGet("{id:guid}")]
    [RequirePermission("patient.view")]
    public async Task<ActionResult> GetById(Guid id)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var consent = await _context.PatientConsents
            .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId.Value);

        if (consent == null) return NotFound();
        return Ok(consent);
    }

    [HttpPost]
    [RequirePermission("patient.update")]
    public async Task<ActionResult> Create([FromBody] PatientConsent request)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        request.Id = Guid.NewGuid();
        request.TenantId = tenantId.Value;
        request.CreatedAt = DateTime.UtcNow;
        request.UpdatedAt = DateTime.UtcNow;
        request.CreatedByUserId = GetUserId();

        _context.PatientConsents.Add(request);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = request.Id }, request);
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("patient.update")]
    public async Task<ActionResult> Update(Guid id, [FromBody] PatientConsent request)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var consent = await _context.PatientConsents
            .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId.Value);

        if (consent == null) return NotFound();

        consent.ConsentType = request.ConsentType;
        consent.ConsentName = request.ConsentName;
        consent.Description = request.Description;
        consent.IsGranted = request.IsGranted;
        consent.GrantedAt = request.GrantedAt;
        consent.ExpiresAt = request.ExpiresAt;
        consent.RevokedAt = request.RevokedAt;
        consent.WitnessName = request.WitnessName;
        consent.DocumentUrl = request.DocumentUrl;
        consent.SignatureUrl = request.SignatureUrl;
        consent.Notes = request.Notes;
        consent.Status = request.Status;
        consent.UpdatedAt = DateTime.UtcNow;
        consent.UpdatedByUserId = GetUserId();

        await _context.SaveChangesAsync();
        return Ok(consent);
    }

    [HttpPost("{id:guid}/revoke")]
    [RequirePermission("patient.update")]
    public async Task<ActionResult> Revoke(Guid id)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var consent = await _context.PatientConsents
            .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId.Value);

        if (consent == null) return NotFound();

        consent.IsGranted = false;
        consent.RevokedAt = DateTime.UtcNow;
        consent.Status = "revoked";
        consent.UpdatedAt = DateTime.UtcNow;
        consent.UpdatedByUserId = GetUserId();

        await _context.SaveChangesAsync();
        return Ok(consent);
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission("patient.update")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var consent = await _context.PatientConsents
            .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId.Value);

        if (consent == null) return NotFound();

        consent.DeletedAt = DateTime.UtcNow;
        consent.UpdatedByUserId = GetUserId();
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
