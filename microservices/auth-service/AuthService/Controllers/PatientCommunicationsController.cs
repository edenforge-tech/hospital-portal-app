using AuthService.Authorization;
using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Controllers;

[ApiController]
[Route("api/patient-communications")]
[Authorize]
public class PatientCommunicationsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<PatientCommunicationsController> _logger;

    public PatientCommunicationsController(AppDbContext context, ILogger<PatientCommunicationsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    private Guid? GetTenantId() => Guid.TryParse(User.FindFirst("TenantId")?.Value ?? User.FindFirst("tenant_id")?.Value, out var id) ? id : null;
    private Guid? GetUserId() => Guid.TryParse(User.FindFirst("sub")?.Value ?? User.FindFirst("UserId")?.Value, out var id) ? id : null;

    [HttpGet("patient/{patientId:guid}")]
    [RequirePermission("patient.view")]
    public async Task<ActionResult> GetByPatient(Guid patientId, [FromQuery] string? type = null)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var query = _context.PatientCommunications
            .Where(c => c.TenantId == tenantId.Value && c.PatientId == patientId);

        if (!string.IsNullOrEmpty(type))
            query = query.Where(c => c.CommunicationType == type);

        var communications = await query.OrderByDescending(c => c.SentAt ?? c.CreatedAt).ToListAsync();
        return Ok(communications);
    }

    [HttpGet("{id:guid}")]
    [RequirePermission("patient.view")]
    public async Task<ActionResult> GetById(Guid id)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var comm = await _context.PatientCommunications
            .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId.Value);

        if (comm == null) return NotFound();
        return Ok(comm);
    }

    [HttpPost]
    [RequirePermission("patient.update")]
    public async Task<ActionResult> Create([FromBody] PatientCommunication request)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        request.Id = Guid.NewGuid();
        request.TenantId = tenantId.Value;
        request.CreatedAt = DateTime.UtcNow;
        request.UpdatedAt = DateTime.UtcNow;
        request.CreatedByUserId = GetUserId();
        request.SentByUserId = GetUserId();
        if (request.Status == "sent") request.SentAt = DateTime.UtcNow;

        _context.PatientCommunications.Add(request);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = request.Id }, request);
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("patient.update")]
    public async Task<ActionResult> Update(Guid id, [FromBody] PatientCommunication request)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var comm = await _context.PatientCommunications
            .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId.Value);

        if (comm == null) return NotFound();

        comm.CommunicationType = request.CommunicationType;
        comm.Direction = request.Direction;
        comm.Subject = request.Subject;
        comm.Message = request.Message;
        comm.Recipient = request.Recipient;
        comm.Sender = request.Sender;
        comm.Priority = request.Priority;
        comm.Category = request.Category;
        comm.Notes = request.Notes;
        comm.Status = request.Status;
        comm.UpdatedAt = DateTime.UtcNow;
        comm.UpdatedByUserId = GetUserId();

        await _context.SaveChangesAsync();
        return Ok(comm);
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission("patient.update")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var comm = await _context.PatientCommunications
            .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId.Value);

        if (comm == null) return NotFound();

        comm.DeletedAt = DateTime.UtcNow;
        comm.UpdatedByUserId = GetUserId();
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
