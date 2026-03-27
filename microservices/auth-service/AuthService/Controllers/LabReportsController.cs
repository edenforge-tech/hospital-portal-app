using AuthService.Authorization;
using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Controllers;

[ApiController]
[Route("api/lab-reports")]
[Authorize]
public class LabReportsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<LabReportsController> _logger;

    public LabReportsController(AppDbContext context, ILogger<LabReportsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    private Guid? GetTenantId() => Guid.TryParse(User.FindFirst("TenantId")?.Value ?? User.FindFirst("tenant_id")?.Value, out var id) ? id : null;
    private Guid? GetUserId() => Guid.TryParse(User.FindFirst("sub")?.Value ?? User.FindFirst("UserId")?.Value, out var id) ? id : null;

    [HttpGet("patient/{patientId:guid}")]
    [RequirePermission("patient.view")]
    public async Task<ActionResult> GetByPatient(Guid patientId, [FromQuery] string? status = null, [FromQuery] string? category = null)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var query = _context.LabReports
            .Where(l => l.TenantId == tenantId.Value && l.PatientId == patientId);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(l => l.Status == status);

        if (!string.IsNullOrEmpty(category))
            query = query.Where(l => l.TestCategory == category);

        var reports = await query.OrderByDescending(l => l.OrderedAt ?? l.CreatedAt).ToListAsync();
        return Ok(reports);
    }

    [HttpGet("{id:guid}")]
    [RequirePermission("patient.view")]
    public async Task<ActionResult> GetById(Guid id)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var report = await _context.LabReports
            .FirstOrDefaultAsync(l => l.Id == id && l.TenantId == tenantId.Value);

        if (report == null) return NotFound();
        return Ok(report);
    }

    [HttpPost]
    [RequirePermission("patient.update")]
    public async Task<ActionResult> Create([FromBody] LabReport request)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        request.Id = Guid.NewGuid();
        request.TenantId = tenantId.Value;
        request.CreatedAt = DateTime.UtcNow;
        request.UpdatedAt = DateTime.UtcNow;
        request.CreatedByUserId = GetUserId();

        _context.LabReports.Add(request);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = request.Id }, request);
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("patient.update")]
    public async Task<ActionResult> Update(Guid id, [FromBody] LabReport request)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var report = await _context.LabReports
            .FirstOrDefaultAsync(l => l.Id == id && l.TenantId == tenantId.Value);

        if (report == null) return NotFound();

        report.TestName = request.TestName;
        report.TestCode = request.TestCode;
        report.TestCategory = request.TestCategory;
        report.OrderedByName = request.OrderedByName;
        report.OrderedById = request.OrderedById;
        report.OrderedAt = request.OrderedAt;
        report.SampleCollectedAt = request.SampleCollectedAt;
        report.CompletedAt = request.CompletedAt;
        report.ResultValue = request.ResultValue;
        report.ResultUnit = request.ResultUnit;
        report.ReferenceRange = request.ReferenceRange;
        report.Interpretation = request.Interpretation;
        report.LabName = request.LabName;
        report.TechnicianName = request.TechnicianName;
        report.VerifiedByName = request.VerifiedByName;
        report.SpecimenType = request.SpecimenType;
        report.Priority = request.Priority;
        report.Notes = request.Notes;
        report.ReportUrl = request.ReportUrl;
        report.Status = request.Status;
        report.UpdatedAt = DateTime.UtcNow;
        report.UpdatedByUserId = GetUserId();

        await _context.SaveChangesAsync();
        return Ok(report);
    }

    [HttpPost("{id:guid}/complete")]
    [RequirePermission("patient.update")]
    public async Task<ActionResult> Complete(Guid id, [FromBody] LabReportResultRequest result)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var report = await _context.LabReports
            .FirstOrDefaultAsync(l => l.Id == id && l.TenantId == tenantId.Value);

        if (report == null) return NotFound();

        report.ResultValue = result.ResultValue;
        report.ResultUnit = result.ResultUnit;
        report.ReferenceRange = result.ReferenceRange;
        report.Interpretation = result.Interpretation;
        report.CompletedAt = DateTime.UtcNow;
        report.Status = "completed";
        report.UpdatedAt = DateTime.UtcNow;
        report.UpdatedByUserId = GetUserId();

        await _context.SaveChangesAsync();
        return Ok(report);
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission("patient.update")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var report = await _context.LabReports
            .FirstOrDefaultAsync(l => l.Id == id && l.TenantId == tenantId.Value);

        if (report == null) return NotFound();

        report.DeletedAt = DateTime.UtcNow;
        report.UpdatedByUserId = GetUserId();
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class LabReportResultRequest
{
    public string? ResultValue { get; set; }
    public string? ResultUnit { get; set; }
    public string? ReferenceRange { get; set; }
    public string? Interpretation { get; set; }
}
