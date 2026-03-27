using AuthService.Authorization;
using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Controllers;

[ApiController]
[Route("api/patient-allergies")]
[Authorize]
public class PatientAllergiesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<PatientAllergiesController> _logger;

    public PatientAllergiesController(AppDbContext context, ILogger<PatientAllergiesController> logger)
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

        var allergies = await _context.PatientAllergies
            .Where(a => a.TenantId == tenantId.Value && a.PatientId == patientId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        return Ok(allergies);
    }

    [HttpGet("{id:guid}")]
    [RequirePermission("patient.view")]
    public async Task<ActionResult> GetById(Guid id)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var allergy = await _context.PatientAllergies
            .FirstOrDefaultAsync(a => a.Id == id && a.TenantId == tenantId.Value);

        if (allergy == null) return NotFound();
        return Ok(allergy);
    }

    [HttpPost]
    [RequirePermission("patient.update")]
    public async Task<ActionResult> Create([FromBody] PatientAllergy request)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        request.Id = Guid.NewGuid();
        request.TenantId = tenantId.Value;
        request.CreatedAt = DateTime.UtcNow;
        request.UpdatedAt = DateTime.UtcNow;
        request.CreatedByUserId = GetUserId();

        _context.PatientAllergies.Add(request);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = request.Id }, request);
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("patient.update")]
    public async Task<ActionResult> Update(Guid id, [FromBody] PatientAllergy request)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var allergy = await _context.PatientAllergies
            .FirstOrDefaultAsync(a => a.Id == id && a.TenantId == tenantId.Value);

        if (allergy == null) return NotFound();

        allergy.AllergenName = request.AllergenName;
        allergy.AllergenType = request.AllergenType;
        allergy.Severity = request.Severity;
        allergy.Reaction = request.Reaction;
        allergy.OnsetDate = request.OnsetDate;
        allergy.Verified = request.Verified;
        allergy.VerifiedBy = request.VerifiedBy;
        allergy.Notes = request.Notes;
        allergy.Status = request.Status;
        allergy.UpdatedAt = DateTime.UtcNow;
        allergy.UpdatedByUserId = GetUserId();

        await _context.SaveChangesAsync();
        return Ok(allergy);
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission("patient.update")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var allergy = await _context.PatientAllergies
            .FirstOrDefaultAsync(a => a.Id == id && a.TenantId == tenantId.Value);

        if (allergy == null) return NotFound();

        allergy.DeletedAt = DateTime.UtcNow;
        allergy.UpdatedByUserId = GetUserId();
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
