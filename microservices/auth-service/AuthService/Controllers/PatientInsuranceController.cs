using AuthService.Authorization;
using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Controllers;

[ApiController]
[Route("api/patient-insurance")]
[Authorize]
public class PatientInsuranceController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<PatientInsuranceController> _logger;

    public PatientInsuranceController(AppDbContext context, ILogger<PatientInsuranceController> logger)
    {
        _context = context;
        _logger = logger;
    }

    private Guid? GetTenantId() => Guid.TryParse(User.FindFirst("TenantId")?.Value ?? User.FindFirst("tenant_id")?.Value, out var id) ? id : null;
    private Guid? GetUserId() => Guid.TryParse(User.FindFirst("sub")?.Value ?? User.FindFirst("UserId")?.Value, out var id) ? id : null;

    [HttpGet("patient/{patientId:guid}")]
    [RequirePermission("patient.view")]
    public async Task<ActionResult> GetByPatient(Guid patientId, [FromQuery] string? policyType = null)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var query = _context.PatientInsurances
            .Where(i => i.TenantId == tenantId.Value && i.PatientId == patientId);

        if (!string.IsNullOrEmpty(policyType))
            query = query.Where(i => i.PolicyType == policyType);

        var insurance = await query.OrderBy(i => i.PolicyType).ToListAsync();
        return Ok(insurance);
    }

    [HttpGet("{id:guid}")]
    [RequirePermission("patient.view")]
    public async Task<ActionResult> GetById(Guid id)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var insurance = await _context.PatientInsurances
            .FirstOrDefaultAsync(i => i.Id == id && i.TenantId == tenantId.Value);

        if (insurance == null) return NotFound();
        return Ok(insurance);
    }

    [HttpPost]
    [RequirePermission("patient.update")]
    public async Task<ActionResult> Create([FromBody] PatientInsurance request)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        request.Id = Guid.NewGuid();
        request.TenantId = tenantId.Value;
        request.CreatedAt = DateTime.UtcNow;
        request.UpdatedAt = DateTime.UtcNow;
        request.CreatedByUserId = GetUserId();

        _context.PatientInsurances.Add(request);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = request.Id }, request);
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("patient.update")]
    public async Task<ActionResult> Update(Guid id, [FromBody] PatientInsurance request)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var insurance = await _context.PatientInsurances
            .FirstOrDefaultAsync(i => i.Id == id && i.TenantId == tenantId.Value);

        if (insurance == null) return NotFound();

        insurance.ProviderName = request.ProviderName;
        insurance.PolicyNumber = request.PolicyNumber;
        insurance.GroupNumber = request.GroupNumber;
        insurance.PolicyType = request.PolicyType;
        insurance.PlanName = request.PlanName;
        insurance.SubscriberName = request.SubscriberName;
        insurance.SubscriberId = request.SubscriberId;
        insurance.SubscriberRelation = request.SubscriberRelation;
        insurance.StartDate = request.StartDate;
        insurance.EndDate = request.EndDate;
        insurance.CopayAmount = request.CopayAmount;
        insurance.DeductibleAmount = request.DeductibleAmount;
        insurance.DeductibleMet = request.DeductibleMet;
        insurance.OutOfPocketMax = request.OutOfPocketMax;
        insurance.OutOfPocketMet = request.OutOfPocketMet;
        insurance.CoverageDetails = request.CoverageDetails;
        insurance.PreAuthRequired = request.PreAuthRequired;
        insurance.PreAuthNumber = request.PreAuthNumber;
        insurance.ContactPhone = request.ContactPhone;
        insurance.Notes = request.Notes;
        insurance.Status = request.Status;
        insurance.UpdatedAt = DateTime.UtcNow;
        insurance.UpdatedByUserId = GetUserId();

        await _context.SaveChangesAsync();
        return Ok(insurance);
    }

    [HttpPost("{id:guid}/verify")]
    [RequirePermission("patient.update")]
    public async Task<ActionResult> Verify(Guid id)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var insurance = await _context.PatientInsurances
            .FirstOrDefaultAsync(i => i.Id == id && i.TenantId == tenantId.Value);

        if (insurance == null) return NotFound();

        insurance.Status = "active";
        insurance.UpdatedAt = DateTime.UtcNow;
        insurance.UpdatedByUserId = GetUserId();

        await _context.SaveChangesAsync();
        return Ok(insurance);
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission("patient.update")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var insurance = await _context.PatientInsurances
            .FirstOrDefaultAsync(i => i.Id == id && i.TenantId == tenantId.Value);

        if (insurance == null) return NotFound();

        insurance.DeletedAt = DateTime.UtcNow;
        insurance.UpdatedByUserId = GetUserId();
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
