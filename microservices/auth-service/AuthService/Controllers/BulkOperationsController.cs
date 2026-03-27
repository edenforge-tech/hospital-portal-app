using AuthService.Authorization;
using AuthService.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BulkOperationsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<BulkOperationsController> _logger;

        public BulkOperationsController(AppDbContext context, ILogger<BulkOperationsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        private bool TryGetTenantId(out Guid tenantId)
        {
            var tenantIdClaim = User.FindFirst("tenant_id")?.Value;
            if (Guid.TryParse(tenantIdClaim, out tenantId))
            {
                return true;
            }
            tenantId = Guid.Empty;
            return false;
        }

        // GET: api/bulkoperations/template/users
        [HttpGet("template/users")]
        [RequirePermission("bulk.export")]
        public IActionResult GetUserImportTemplate()
        {
            var csv = new StringBuilder();
            csv.AppendLine("FirstName,LastName,Email,PhoneNumber,Role,Department,Branch");
            csv.AppendLine("John,Doe,john.doe@example.com,+1234567890,Staff,Cardiology,Main Branch");

            return File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv", "user_import_template.csv");
        }

        // GET: api/bulkoperations/template/employees
        [HttpGet("template/employees")]
        [RequirePermission("bulk.export")]
        public IActionResult GetEmployeeImportTemplate()
        {
            var csv = new StringBuilder();
            csv.AppendLine("Email,EmployeeNumber,HireDate,JobTitle,EmploymentType,Department,Branch,BaseSalary,Currency");
            csv.AppendLine("employee@example.com,EMP001,2024-01-15,Software Engineer,Permanent,IT,Main Branch,50000,USD");

            return File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv", "employee_import_template.csv");
        }

        // POST: api/bulkoperations/import/users
        [HttpPost("import/users")]
        [RequirePermission("bulk.import")]
        public async Task<ActionResult<object>> ImportUsers(IFormFile file)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "Tenant ID is required" });

            if (file == null || file.Length == 0)
                return BadRequest(new { message = "File is required" });

            try
            {
                // Stub implementation
                return Ok(new
                {
                    message = "User import feature coming soon",
                    fileName = file.FileName,
                    fileSize = file.Length,
                    status = "pending_implementation"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error importing users");
                return StatusCode(500, new { message = "Error importing users", error = ex.Message });
            }
        }

        // POST: api/bulkoperations/import/employees
        [HttpPost("import/employees")]
        [RequirePermission("bulk.import")]
        public async Task<ActionResult<object>> ImportEmployees(IFormFile file)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "Tenant ID is required" });

            if (file == null || file.Length == 0)
                return BadRequest(new { message = "File is required" });

            try
            {
                // Stub implementation
                return Ok(new
                {
                    message = "Employee import feature coming soon",
                    fileName = file.FileName,
                    fileSize = file.Length,
                    status = "pending_implementation"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error importing employees");
                return StatusCode(500, new { message = "Error importing employees", error = ex.Message });
            }
        }

        // GET: api/bulkoperations/export/users
        [HttpGet("export/users")]
        [RequirePermission("bulk.export")]
        public async Task<IActionResult> ExportUsers()
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "Tenant ID is required" });

            try
            {
                var users = await _context.Users
                    .Where(u => u.TenantId == tenantId && u.DeletedAt == null)
                    .OrderBy(u => u.LastName)
                    .Select(u => new
                    {
                        u.FirstName,
                        u.LastName,
                        u.Email,
                        u.PhoneNumber,
                        u.CreatedAt
                    })
                    .ToListAsync();

                var csv = new StringBuilder();
                csv.AppendLine("FirstName,LastName,Email,PhoneNumber,CreatedAt");

                foreach (var user in users)
                {
                    csv.AppendLine($"{user.FirstName},{user.LastName},{user.Email},{user.PhoneNumber},{user.CreatedAt:yyyy-MM-dd}");
                }

                return File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv", $"users_export_{DateTime.UtcNow:yyyyMMdd}.csv");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting users");
                return StatusCode(500, new { message = "Error exporting users", error = ex.Message });
            }
        }

        // GET: api/bulkoperations/export/employees
        [HttpGet("export/employees")]
        [RequirePermission("bulk.export")]
        public async Task<IActionResult> ExportEmployees()
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "Tenant ID is required" });

            try
            {
                var employees = await _context.Employees
                    .Include(e => e.User)
                    .Include(e => e.EmploymentType)
                    .Where(e => e.TenantId == tenantId && e.DeletedAt == null)
                    .OrderBy(e => e.EmployeeNumber)
                    .Select(e => new
                    {
                        e.EmployeeNumber,
                        FirstName = e.User!.FirstName,
                        LastName = e.User.LastName,
                        Email = e.User.Email,
                        e.HireDate,
                        e.JobTitle,
                        EmploymentType = e.EmploymentType != null ? e.EmploymentType.TypeName : "",
                        e.BaseSalary,
                        e.Currency
                    })
                    .ToListAsync();

                var csv = new StringBuilder();
                csv.AppendLine("EmployeeNumber,FirstName,LastName,Email,HireDate,JobTitle,EmploymentType,BaseSalary,Currency");

                foreach (var emp in employees)
                {
                    csv.AppendLine($"{emp.EmployeeNumber},{emp.FirstName},{emp.LastName},{emp.Email},{emp.HireDate:yyyy-MM-dd},{emp.JobTitle},{emp.EmploymentType},{emp.BaseSalary},{emp.Currency}");
                }

                return File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv", $"employees_export_{DateTime.UtcNow:yyyyMMdd}.csv");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting employees");
                return StatusCode(500, new { message = "Error exporting employees", error = ex.Message });
            }
        }

        // POST: api/bulkoperations/assign-roles
        [HttpPost("assign-roles")]
        [RequirePermission("bulk.update")]
        public async Task<ActionResult<object>> BulkAssignRoles([FromBody] BulkRoleAssignmentDto dto)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "Tenant ID is required" });

            try
            {
                // Stub implementation
                return Ok(new
                {
                    message = "Bulk role assignment feature coming soon",
                    userCount = dto.UserIds.Count,
                    roleCount = dto.RoleIds.Count,
                    status = "pending_implementation"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk role assignment");
                return StatusCode(500, new { message = "Error in bulk role assignment", error = ex.Message });
            }
        }

        // POST: api/bulkoperations/update-status
        [HttpPost("update-status")]
        [RequirePermission("bulk.update")]
        public async Task<ActionResult<object>> BulkUpdateStatus([FromBody] BulkStatusUpdateDto dto)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "Tenant ID is required" });

            try
            {
                // Stub implementation
                return Ok(new
                {
                    message = "Bulk status update feature coming soon",
                    targetCount = dto.TargetIds.Count,
                    newStatus = dto.Status,
                    status = "pending_implementation"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk status update");
                return StatusCode(500, new { message = "Error in bulk status update", error = ex.Message });
            }
        }

        // POST: api/bulkoperations/activate
        [HttpPost("activate")]
        [RequirePermission("bulk.update")]
        public async Task<ActionResult<object>> BulkActivate([FromBody] BulkActionDto dto)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "Tenant ID is required" });

            var currentUserId = User.FindFirst("user_id")?.Value;
            if (!Guid.TryParse(currentUserId, out var userId))
                return Unauthorized(new { message = "User ID not found" });

            try
            {
                var users = await _context.Users
                    .Where(u => dto.TargetIds.Contains(u.Id) && u.TenantId == tenantId && u.DeletedAt == null)
                    .ToListAsync();

                foreach (var user in users)
                {
                    user.UserStatus = "Active";
                    user.ActivationStatus = "Active";
                    user.UpdatedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = $"{users.Count} users activated successfully",
                    count = users.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk activation");
                return StatusCode(500, new { message = "Error in bulk activation", error = ex.Message });
            }
        }

        // POST: api/bulkoperations/deactivate
        [HttpPost("deactivate")]
        [RequirePermission("bulk.update")]
        public async Task<ActionResult<object>> BulkDeactivate([FromBody] BulkActionDto dto)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "Tenant ID is required" });

            var currentUserId = User.FindFirst("user_id")?.Value;
            if (!Guid.TryParse(currentUserId, out var userId))
                return Unauthorized(new { message = "User ID not found" });

            try
            {
                var users = await _context.Users
                    .Where(u => dto.TargetIds.Contains(u.Id) && u.TenantId == tenantId && u.DeletedAt == null)
                    .ToListAsync();

                foreach (var user in users)
                {
                    user.UserStatus = "Inactive";
                    user.ActivationStatus = "Suspended";
                    user.UpdatedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = $"{users.Count} users deactivated successfully",
                    count = users.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk deactivation");
                return StatusCode(500, new { message = "Error in bulk deactivation", error = ex.Message });
            }
        }

        // POST: api/bulkoperations/delete
        [HttpPost("delete")]
        [RequirePermission("bulk.delete")]
        public async Task<ActionResult<object>> BulkDelete([FromBody] BulkActionDto dto)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "Tenant ID is required" });

            var currentUserId = User.FindFirst("user_id")?.Value;
            if (!Guid.TryParse(currentUserId, out var userId))
                return Unauthorized(new { message = "User ID not found" });

            try
            {
                var users = await _context.Users
                    .Where(u => dto.TargetIds.Contains(u.Id) && u.TenantId == tenantId && u.DeletedAt == null)
                    .ToListAsync();

                foreach (var user in users)
                {
                    user.DeletedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = $"{users.Count} users deleted successfully",
                    count = users.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk deletion");
                return StatusCode(500, new { message = "Error in bulk deletion", error = ex.Message });
            }
        }
    }

    // DTOs
    public class BulkRoleAssignmentDto
    {
        public List<Guid> UserIds { get; set; } = new();
        public List<Guid> RoleIds { get; set; } = new();
    }

    public class BulkStatusUpdateDto
    {
        public List<Guid> TargetIds { get; set; } = new();
        public string Status { get; set; } = string.Empty;
    }

    public class BulkActionDto
    {
        public List<Guid> TargetIds { get; set; } = new();
    }
}
