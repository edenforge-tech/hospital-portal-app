using AuthService.Authorization;
using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Controllers;

[ApiController]
[Route("api/surgery-requests")]
[Authorize]
public class SurgeryRequestsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<SurgeryRequestsController> _logger;

    public SurgeryRequestsController(AppDbContext context, ILogger<SurgeryRequestsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    private Guid? GetTenantId() => Guid.TryParse(User.FindFirst("TenantId")?.Value ?? User.FindFirst("tenant_id")?.Value, out var id) ? id : null;
    private Guid? GetUserId() => Guid.TryParse(User.FindFirst("sub")?.Value ?? User.FindFirst("UserId")?.Value, out var id) ? id : null;

    [HttpGet]
    [RequirePermission("patient.view")]
    public async Task<ActionResult> GetAll([FromQuery] string? status = null, [FromQuery] string? urgency = null, [FromQuery] Guid? surgeonId = null)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var query = _context.SurgeryRequests
            .Where(s => s.TenantId == tenantId.Value);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(s => s.Status == status);

        if (!string.IsNullOrEmpty(urgency))
            query = query.Where(s => s.Urgency == urgency);

        if (surgeonId.HasValue)
            query = query.Where(s => s.SurgeonId == surgeonId.Value);

        var requests = await query.OrderByDescending(s => s.RequestDate).ToListAsync();
        return Ok(requests);
    }

    [HttpGet("patient/{patientName}")]
    [RequirePermission("patient.view")]
    public async Task<ActionResult> GetByPatientName(string patientName)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var requests = await _context.SurgeryRequests
            .Where(s => s.TenantId == tenantId.Value && s.PatientName.ToLower().Contains(patientName.ToLower()))
            .OrderByDescending(s => s.RequestDate)
            .ToListAsync();

        return Ok(requests);
    }

    [HttpGet("branch/{branchId:guid}")]
    [RequirePermission("patient.view")]
    public async Task<ActionResult> GetByBranch(Guid branchId, [FromQuery] string? status = null)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var query = _context.SurgeryRequests
            .Where(s => s.TenantId == tenantId.Value && s.BranchId == branchId);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(s => s.Status == status);

        var requests = await query.OrderByDescending(s => s.RequestDate).ToListAsync();
        return Ok(requests);
    }

    [HttpGet("{id:guid}")]
    [RequirePermission("patient.view")]
    public async Task<ActionResult> GetById(Guid id)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var request = await _context.SurgeryRequests
            .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId.Value);

        if (request == null) return NotFound();
        return Ok(request);
    }

    [HttpPost]
    [RequirePermission("patient.update")]
    public async Task<ActionResult> Create([FromBody] SurgeryRequest request)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        request.Id = Guid.NewGuid();
        request.TenantId = tenantId.Value;
        request.RequestDate = DateTime.UtcNow;
        request.CreatedAt = DateTime.UtcNow;
        request.UpdatedAt = DateTime.UtcNow;
        request.CreatedByUserId = GetUserId();

        _context.SurgeryRequests.Add(request);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = request.Id }, request);
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("patient.update")]
    public async Task<ActionResult> Update(Guid id, [FromBody] SurgeryRequest request)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var existing = await _context.SurgeryRequests
            .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId.Value);

        if (existing == null) return NotFound();

        existing.PatientName = request.PatientName;
        existing.PatientMobile = request.PatientMobile;
        existing.ProcedureType = request.ProcedureType;
        existing.RequestType = request.RequestType;
        existing.Urgency = request.Urgency;
        existing.PreferredDate = request.PreferredDate;
        existing.PreferredTime = request.PreferredTime;
        existing.Notes = request.Notes;
        existing.SpecialInstructions = request.SpecialInstructions;
        existing.Status = request.Status;
        existing.UpdatedAt = DateTime.UtcNow;
        existing.UpdatedByUserId = GetUserId();

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpPost("{id:guid}/approve")]
    [RequirePermission("patient.update")]
    public async Task<ActionResult> Approve(Guid id, [FromBody] SurgeryApprovalRequest approval)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var request = await _context.SurgeryRequests
            .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId.Value);

        if (request == null) return NotFound();

        request.Status = "approved";
        request.ScheduledDate = approval.ScheduledDate;
        request.SurgeonResponse = approval.Response;
        request.UpdatedAt = DateTime.UtcNow;
        request.UpdatedByUserId = GetUserId();

        await _context.SaveChangesAsync();
        return Ok(request);
    }

    [HttpPost("{id:guid}/reject")]
    [RequirePermission("patient.update")]
    public async Task<ActionResult> Reject(Guid id, [FromBody] SurgeryRejectionRequest rejection)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var request = await _context.SurgeryRequests
            .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId.Value);

        if (request == null) return NotFound();

        request.Status = "rejected";
        request.SurgeonResponse = rejection.Reason;
        request.UpdatedAt = DateTime.UtcNow;
        request.UpdatedByUserId = GetUserId();

        await _context.SaveChangesAsync();
        return Ok(request);
    }

    [HttpPost("{id:guid}/complete")]
    [RequirePermission("patient.update")]
    public async Task<ActionResult> Complete(Guid id)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var request = await _context.SurgeryRequests
            .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId.Value);

        if (request == null) return NotFound();

        request.Status = "completed";
        request.UpdatedAt = DateTime.UtcNow;
        request.UpdatedByUserId = GetUserId();

        await _context.SaveChangesAsync();
        return Ok(request);
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission("patient.update")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var request = await _context.SurgeryRequests
            .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId.Value);

        if (request == null) return NotFound();

        // SurgeryRequest doesn't have DeletedAt, so we set status
        request.Status = "cancelled";
        request.UpdatedAt = DateTime.UtcNow;
        request.UpdatedByUserId = GetUserId();
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class SurgeryApprovalRequest
{
    public DateTime? ScheduledDate { get; set; }
    public string? Response { get; set; }
}

public class SurgeryRejectionRequest
{
    public string? Reason { get; set; }
}
