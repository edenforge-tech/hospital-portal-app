using AuthService.Authorization;
using AuthService.Context;
using AuthService.Models.Department;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Controllers;

[Authorize]
[ApiController]
[Route("api/departments")]
public class DepartmentsController : ControllerBase
{
    private readonly IDepartmentService _departmentService;
    private readonly AppDbContext _context;

    public DepartmentsController(IDepartmentService departmentService, AppDbContext context)
    {
        _departmentService = departmentService;
        _context = context;
    }

    private Guid GetTenantId()
    {
        // First try to get from HttpContext.Items (set by TenantResolutionMiddleware)
        if (HttpContext.Items.TryGetValue("TenantId", out var tenantIdObj) && tenantIdObj is Guid tenantId)
        {
            return tenantId;
        }

        // Fallback to JWT claims
        var tenantIdClaim = User.FindFirst("TenantId")?.Value 
            ?? User.FindFirst("tenantId")?.Value
            ?? User.FindFirst("tenant_id")?.Value;
        
        if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out tenantId))
        {
            // Use default admin tenant for testing/development
            return Guid.Parse("155fe198-6ae5-4a01-9254-ead5b427247e");
        }
        
        return tenantId;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst("UserId")?.Value 
            ?? User.FindFirst("userId")?.Value
            ?? User.FindFirst("sub")?.Value
            ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value; // Added standard claim
        
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("User ID not found in token");
        }
        
        return userId;
    }

    [HttpGet]
    [AllowAnonymous] // Temporarily allow anonymous access for testing
    // [RequirePermission("department.view")] // TEMPORARILY DISABLED FOR TESTING
    public async Task<IActionResult> GetAll([FromQuery] DepartmentFilters? filters)
    {
        try
        {
            var tenantId = GetTenantId();
            Console.WriteLine($"🔍 GetAll Departments - TenantId: {tenantId}, BranchFilter: {filters?.BranchId}");
            
            var departments = await _departmentService.GetAllAsync(tenantId, filters);
            
            Console.WriteLine($"🔍 Retrieved {departments.Count} departments");
            foreach (var dept in departments.Take(3))
            {
                Console.WriteLine($"   - {dept.DepartmentCode}: {dept.DepartmentName} (Branch: {dept.BranchId})");
            }
            
            // Serialize and log the JSON response
            var json = System.Text.Json.JsonSerializer.Serialize(departments, new System.Text.Json.JsonSerializerOptions 
            { 
                PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase 
            });
            Console.WriteLine($"🔍 JSON Response (first 500 chars): {json.Substring(0, Math.Min(500, json.Length))}");
            
            return Ok(departments);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching departments", error = ex.Message });
        }
    }

    [HttpGet("with-staff-count")]
    [RequirePermission("department.view")]
    public async Task<IActionResult> GetDepartmentsWithStaffCount()
    {
        try
        {
            var tenantId = GetTenantId();
            var departments = await _context.Departments
                .Where(d => d.TenantId == tenantId && d.DeletedAt == null)
                .Select(d => new {
                    d.Id,
                    d.DepartmentCode,
                    d.DepartmentName,
                    d.DepartmentType,
                    d.Status,
                    d.ParentDepartmentId,
                    ParentDepartmentName = _context.Departments
                        .Where(p => p.Id == d.ParentDepartmentId)
                        .Select(p => p.DepartmentName)
                        .FirstOrDefault(),
                    StaffCount = _context.UserDepartments
                        .Count(ud => ud.DepartmentId == d.Id && ud.DeletedAt == null)
                })
                .OrderBy(d => d.DepartmentName)
                .ToListAsync();

            return Ok(departments);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching departments with staff count", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    [RequirePermission("department.view")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var tenantId = GetTenantId();
            var department = await _departmentService.GetByIdAsync(id, tenantId);
            
            if (department == null)
            {
                return NotFound(new { message = "Department not found" });
            }
            
            return Ok(department);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching department", error = ex.Message });
        }
    }

    [HttpPost]
    [RequirePermission("department.create")]
    public async Task<IActionResult> Create([FromBody] DepartmentFormData data)
    {
        try
        {
            var tenantId = GetTenantId();
            var userId = GetUserId();
            var department = await _departmentService.CreateAsync(data, tenantId, userId);
            return CreatedAtAction(nameof(GetById), new { id = department.Id }, department);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating department", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [RequirePermission("department.update")]
    public async Task<IActionResult> Update(Guid id, [FromBody] DepartmentFormData data)
    {
        try
        {
            var tenantId = GetTenantId();
            var userId = GetUserId();
            var department = await _departmentService.UpdateAsync(id, data, tenantId, userId);
            
            if (department == null)
            {
                return NotFound(new { message = "Department not found" });
            }
            
            return Ok(department);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while updating department", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [RequirePermission("department.delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var tenantId = GetTenantId();
            var userId = GetUserId();
            var result = await _departmentService.DeleteAsync(id, tenantId, userId);
            
            if (!result)
            {
                return NotFound(new { message = "Department not found" });
            }
            
            return Ok(new { message = "Department deleted successfully" });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while deleting department", error = ex.Message });
        }
    }

    [HttpGet("hierarchy")]
    [RequirePermission("department.view")]
    public async Task<IActionResult> GetHierarchy()
    {
        try
        {
            var tenantId = GetTenantId();
            var hierarchy = await _departmentService.GetHierarchyAsync(tenantId);
            return Ok(hierarchy);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching hierarchy", error = ex.Message });
        }
    }

    [HttpGet("{id}/sub-departments")]
    [RequirePermission("department.view")]
    public async Task<IActionResult> GetSubDepartments(Guid id)
    {
        try
        {
            var tenantId = GetTenantId();
            var subDepartments = await _departmentService.GetSubDepartmentsAsync(id, tenantId);
            return Ok(subDepartments);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching sub-departments", error = ex.Message });
        }
    }

    [HttpGet("{id}/details")]
    [RequirePermission("department.view")]
    public async Task<IActionResult> GetDetails(Guid id)
    {
        try
        {
            var tenantId = GetTenantId();
            var details = await _departmentService.GetDetailsAsync(id, tenantId);
            
            if (details == null)
            {
                return NotFound(new { message = "Department not found" });
            }
            
            return Ok(details);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching department details", error = ex.Message });
        }
    }

    [HttpGet("{id}/staff")]
    [RequirePermission("department.view")]
    public async Task<IActionResult> GetStaff(Guid id)
    {
        try
        {
            var tenantId = GetTenantId();
            var staff = await _departmentService.GetStaffAsync(id, tenantId);
            return Ok(staff);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching staff", error = ex.Message });
        }
    }

    [HttpGet("{id}/metrics")]
    [RequirePermission("department.view")]
    public async Task<IActionResult> GetMetrics(Guid id)
    {
        try
        {
            var tenantId = GetTenantId();
            var metrics = await _departmentService.GetMetricsAsync(id, tenantId);
            return Ok(metrics);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching metrics", error = ex.Message });
        }
    }

    [HttpGet("types")]
    [RequirePermission("department.view")]
    public async Task<IActionResult> GetTypes()
    {
        try
        {
            var types = await _departmentService.GetDepartmentTypesAsync();
            return Ok(types);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching department types", error = ex.Message });
        }
    }

    [HttpPut("{id}/move")]
    [RequirePermission("department.edit")]
    public async Task<IActionResult> MoveDepartment(Guid id, [FromBody] MoveDepartmentRequest request)
    {
        try
        {
            var tenantId = GetTenantId();
            var userId = GetUserId();
            
            var department = await _departmentService.MoveDepartmentAsync(id, request.NewParentId, tenantId, userId);
            
            if (department == null)
            {
                return NotFound(new { message = "Department not found" });
            }
            
            return Ok(new { message = "Department moved successfully", department });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while moving department", error = ex.Message });
        }
    }

    [HttpPost("from-template")]
    [RequirePermission("department.create")]
    public async Task<IActionResult> CreateFromTemplate([FromBody] CreateFromTemplateRequest request)
    {
        try
        {
            var tenantId = GetTenantId();
            var userId = GetUserId();
            
            var department = await _departmentService.CreateFromTemplateAsync(
                request.TemplateName, 
                request.Data, 
                tenantId, 
                userId
            );
            
            return CreatedAtAction(nameof(GetById), new { id = department.Id }, department);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating department from template", error = ex.Message });
        }
    }

    [HttpGet("templates")]
    [RequirePermission("department.view")]
    public async Task<IActionResult> GetTemplates()
    {
        try
        {
            var templates = await _departmentService.GetTemplateNamesAsync();
            return Ok(templates);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching templates", error = ex.Message });
        }
    }
}

public class MoveDepartmentRequest
{
    public Guid? NewParentId { get; set; }
}

public class CreateFromTemplateRequest
{
    public string TemplateName { get; set; } = string.Empty;
    public DepartmentFormData Data { get; set; } = new();
}
