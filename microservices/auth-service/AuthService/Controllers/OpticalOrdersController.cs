using AuthService.Authorization;
using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Controllers;

[ApiController]
[Route("api/optical-orders")]
[Authorize]
public class OpticalOrdersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<OpticalOrdersController> _logger;

    public OpticalOrdersController(AppDbContext context, ILogger<OpticalOrdersController> logger)
    {
        _context = context;
        _logger = logger;
    }

    private Guid? GetTenantId() => Guid.TryParse(User.FindFirst("TenantId")?.Value ?? User.FindFirst("tenant_id")?.Value, out var id) ? id : null;
    private Guid? GetUserId() => Guid.TryParse(User.FindFirst("sub")?.Value ?? User.FindFirst("UserId")?.Value, out var id) ? id : null;

    [HttpGet("patient/{patientId:guid}")]
    [RequirePermission("patient.view")]
    public async Task<ActionResult> GetByPatient(Guid patientId, [FromQuery] string? status = null)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var query = _context.OpticalOrders
            .Where(o => o.TenantId == tenantId.Value && o.PatientId == patientId);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(o => o.Status == status);

        var orders = await query.OrderByDescending(o => o.OrderDate).ToListAsync();
        return Ok(orders);
    }

    [HttpGet("{id:guid}")]
    [RequirePermission("patient.view")]
    public async Task<ActionResult> GetById(Guid id)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var order = await _context.OpticalOrders
            .FirstOrDefaultAsync(o => o.Id == id && o.TenantId == tenantId.Value);

        if (order == null) return NotFound();
        return Ok(order);
    }

    [HttpPost]
    [RequirePermission("patient.update")]
    public async Task<ActionResult> Create([FromBody] OpticalOrder request)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        request.Id = Guid.NewGuid();
        request.TenantId = tenantId.Value;
        request.OrderNumber = $"OPT-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";
        request.CreatedAt = DateTime.UtcNow;
        request.UpdatedAt = DateTime.UtcNow;
        request.CreatedByUserId = GetUserId();

        _context.OpticalOrders.Add(request);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = request.Id }, request);
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("patient.update")]
    public async Task<ActionResult> Update(Guid id, [FromBody] OpticalOrder request)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var order = await _context.OpticalOrders
            .FirstOrDefaultAsync(o => o.Id == id && o.TenantId == tenantId.Value);

        if (order == null) return NotFound();

        order.OrderType = request.OrderType;
        order.OdSphere = request.OdSphere;
        order.OdCylinder = request.OdCylinder;
        order.OdAxis = request.OdAxis;
        order.OdAdd = request.OdAdd;
        order.OdPrism = request.OdPrism;
        order.OdVa = request.OdVa;
        order.OsSphere = request.OsSphere;
        order.OsCylinder = request.OsCylinder;
        order.OsAxis = request.OsAxis;
        order.OsAdd = request.OsAdd;
        order.OsPrism = request.OsPrism;
        order.OsVa = request.OsVa;
        order.Pd = request.Pd;
        order.PdRight = request.PdRight;
        order.PdLeft = request.PdLeft;
        order.SegHeight = request.SegHeight;
        order.FrameType = request.FrameType;
        order.FrameBrand = request.FrameBrand;
        order.FrameModel = request.FrameModel;
        order.FrameColor = request.FrameColor;
        order.LensType = request.LensType;
        order.LensMaterial = request.LensMaterial;
        order.LensCoating = request.LensCoating;
        order.Tint = request.Tint;
        order.OrderDate = request.OrderDate;
        order.EstimatedDelivery = request.EstimatedDelivery;
        order.DeliveredAt = request.DeliveredAt;
        order.Amount = request.Amount;
        order.PaidAmount = request.PaidAmount;
        order.PrescribedByName = request.PrescribedByName;
        order.PrescribedById = request.PrescribedById;
        order.Notes = request.Notes;
        order.Status = request.Status;
        order.UpdatedAt = DateTime.UtcNow;
        order.UpdatedByUserId = GetUserId();

        await _context.SaveChangesAsync();
        return Ok(order);
    }

    [HttpPost("{id:guid}/deliver")]
    [RequirePermission("patient.update")]
    public async Task<ActionResult> MarkDelivered(Guid id)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var order = await _context.OpticalOrders
            .FirstOrDefaultAsync(o => o.Id == id && o.TenantId == tenantId.Value);

        if (order == null) return NotFound();

        order.Status = "delivered";
        order.DeliveredAt = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;
        order.UpdatedByUserId = GetUserId();

        await _context.SaveChangesAsync();
        return Ok(order);
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission("patient.update")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var tenantId = GetTenantId();
        if (tenantId == null) return Unauthorized();

        var order = await _context.OpticalOrders
            .FirstOrDefaultAsync(o => o.Id == id && o.TenantId == tenantId.Value);

        if (order == null) return NotFound();

        order.DeletedAt = DateTime.UtcNow;
        order.UpdatedByUserId = GetUserId();
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
