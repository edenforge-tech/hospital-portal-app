using AuthService.Authorization;
using AuthService.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AuthService.Models.Domain;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EmployeeController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<EmployeeController> _logger;

        public EmployeeController(AppDbContext context, ILogger<EmployeeController> logger)
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

        // GET: api/employee
        [HttpGet]
        [RequirePermission("employee.view")]
        public async Task<ActionResult<object>> GetAllEmployees(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null,
            [FromQuery] string? employmentStatus = null,
            [FromQuery] Guid? departmentId = null,
            [FromQuery] Guid? branchId = null)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "Tenant ID is required" });

            try
            {
                var query = _context.Employees
                    .Include(e => e.User)
                    .Include(e => e.Department)
                    .Where(e => e.TenantId == tenantId && e.DeletedAt == null);

                if (!string.IsNullOrWhiteSpace(searchTerm))
                {
                    query = query.Where(e => 
                        e.EmployeeNumber!.Contains(searchTerm) ||
                        e.User!.FirstName!.Contains(searchTerm) ||
                        e.User!.LastName!.Contains(searchTerm) ||
                        e.User!.Email!.Contains(searchTerm));
                }

                // Note: employmentStatus and branchId filters removed since columns don't exist in DB
                if (departmentId.HasValue)
                    query = query.Where(e => e.DepartmentId == departmentId.Value);

                var total = await query.CountAsync();
                
                // Calculate statistics with efficient queries
                var stats = new
                {
                    totalEmployees = total,
                    active = await query.CountAsync(e => e.Status == "active"),
                    fullTime = await query.CountAsync(e => e.EmploymentType != null && e.EmploymentType.TypeName == "Full-Time"),
                    partTime = await query.CountAsync(e => e.EmploymentType != null && e.EmploymentType.TypeName == "Part-Time"),
                    contract = await query.CountAsync(e => e.EmploymentType != null && e.EmploymentType.TypeName == "Contract")
                };
                
                var employees = await query
                    .OrderByDescending(e => e.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(e => new
                    {
                        e.Id,
                        e.EmployeeNumber,
                        e.HireDate,
                        DateOfJoining = e.HireDate, // Add this for frontend compatibility
                        e.JobTitle,
                        EmploymentType = e.EmploymentType != null ? e.EmploymentType.TypeName : null,
                        e.Status,
                        e.EmergencyContactName,
                        e.EmergencyContactPhone,
                        e.BaseSalary,
                        e.DepartmentId,
                        User = new
                        {
                            e.User!.FirstName,
                            e.User.LastName,
                            e.User.Email,
                            e.User.PhoneNumber
                        },
                        Department = e.Department != null ? e.Department.DepartmentName : null,
                        e.CreatedAt
                    })
                    .ToListAsync();

                return Ok(new
                {
                    total,
                    page,
                    pageSize,
                    totalPages = (int)Math.Ceiling(total / (double)pageSize),
                    employees,
                    stats
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching employees");
                return StatusCode(500, new { message = "Error fetching employees", error = ex.Message });
            }
        }

        // GET: api/employee/{id}
        [HttpGet("{id}")]
        [RequirePermission("employee.view")]
        public async Task<ActionResult<object>> GetEmployee(Guid id)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "Tenant ID is required" });

            try
            {
                var employee = await _context.Employees
                    .Include(e => e.User)
                    .Include(e => e.EmploymentType)
                    .Include(e => e.Department)
                    .Include(e => e.Branch)
                    .Include(e => e.Manager)
                    .FirstOrDefaultAsync(e => e.Id == id && e.TenantId == tenantId && e.DeletedAt == null);

                if (employee == null)
                    return NotFound(new { message = "Employee not found" });

                return Ok(employee);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching employee {EmployeeId}", id);
                return StatusCode(500, new { message = "Error fetching employee", error = ex.Message });
            }
        }

        // GET: api/employee/user/{userId}
        [HttpGet("user/{userId}")]
        [RequirePermission("employee.view")]
        public async Task<ActionResult<object>> GetEmployeeByUserId(Guid userId)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "Tenant ID is required" });

            try
            {
                var employee = await _context.Employees
                    .Include(e => e.User)
                    .Include(e => e.EmploymentType)
                    .Include(e => e.Department)
                    .Include(e => e.Branch)
                    .FirstOrDefaultAsync(e => e.UserId == userId && e.TenantId == tenantId && e.DeletedAt == null);

                if (employee == null)
                    return NotFound(new { message = "Employee not found for this user" });

                return Ok(employee);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching employee for user {UserId}", userId);
                return StatusCode(500, new { message = "Error fetching employee", error = ex.Message });
            }
        }

        // GET: api/employee/employment-types
        [HttpGet("employment-types")]
        [RequirePermission("employee.view")]
        public async Task<ActionResult<object>> GetEmploymentTypes()
        {
            try
            {
                var types = await _context.EmploymentTypes
                    .Where(t => t.IsActive)
                    .OrderBy(t => t.DisplayOrder)
                    .Select(t => new
                    {
                        t.Id,
                        t.TypeCode,
                        t.TypeName,
                        t.Description
                    })
                    .ToListAsync();

                return Ok(types);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching employment types");
                return StatusCode(500, new { message = "Error fetching employment types", error = ex.Message });
            }
        }

        // POST: api/employee
        [HttpPost]
        [RequirePermission("employee.create")]
        public async Task<ActionResult<object>> CreateEmployee([FromBody] CreateEmployeeDto dto)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "Tenant ID is required" });

            var currentUserId = User.FindFirst("user_id")?.Value;
            if (!Guid.TryParse(currentUserId, out var userId))
                return Unauthorized(new { message = "User ID not found" });

            try
            {
                // Check if employee already exists for this user
                var existingEmployee = await _context.Employees
                    .AnyAsync(e => e.UserId == dto.UserId && e.TenantId == tenantId && e.DeletedAt == null);

                if (existingEmployee)
                    return BadRequest(new { message = "Employee record already exists for this user" });

                var employee = new Employee
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    UserId = dto.UserId,
                    EmployeeNumber = dto.EmployeeNumber,
                    HireDate = dto.HireDate,
                    EmploymentTypeId = dto.EmploymentTypeId,
                    EmploymentStatus = dto.EmploymentStatus ?? "active",
                    JobTitle = dto.JobTitle,
                    DepartmentId = dto.DepartmentId,
                    BranchId = dto.BranchId,
                    ManagerId = dto.ManagerId,
                    ProbationEndDate = dto.ProbationEndDate,
                    EmergencyContactName = dto.EmergencyContactName,
                    EmergencyContactRelationship = dto.EmergencyContactRelationship,
                    EmergencyContactPhone = dto.EmergencyContactPhone,
                    EmergencyContactEmail = dto.EmergencyContactEmail,
                    SalaryGrade = dto.SalaryGrade,
                    BaseSalary = dto.BaseSalary,
                    Currency = dto.Currency ?? "USD",
                    PayrollFrequency = dto.PayrollFrequency,
                    WeeklyHours = dto.WeeklyHours,
                    ShiftPattern = dto.ShiftPattern,
                    Status = "active",
                    CreatedAt = DateTime.UtcNow,
                    CreatedByUserId = userId
                };

                _context.Employees.Add(employee);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    employee.Id,
                    employee.EmployeeNumber,
                    message = "Employee created successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating employee");
                return StatusCode(500, new { message = "Error creating employee", error = ex.Message });
            }
        }

        // PUT: api/employee/{id}
        [HttpPut("{id}")]
        [RequirePermission("employee.update")]
        public async Task<ActionResult> UpdateEmployee(Guid id, [FromBody] UpdateEmployeeDto dto)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "Tenant ID is required" });

            var currentUserId = User.FindFirst("user_id")?.Value;
            if (!Guid.TryParse(currentUserId, out var userId))
                return Unauthorized(new { message = "User ID not found" });

            try
            {
                var employee = await _context.Employees
                    .FirstOrDefaultAsync(e => e.Id == id && e.TenantId == tenantId && e.DeletedAt == null);

                if (employee == null)
                    return NotFound(new { message = "Employee not found" });

                // Update fields
                if (dto.EmploymentTypeId.HasValue)
                    employee.EmploymentTypeId = dto.EmploymentTypeId;
                if (dto.EmploymentStatus != null)
                    employee.EmploymentStatus = dto.EmploymentStatus;
                if (dto.JobTitle != null)
                    employee.JobTitle = dto.JobTitle;
                if (dto.DepartmentId.HasValue)
                    employee.DepartmentId = dto.DepartmentId;
                if (dto.BranchId.HasValue)
                    employee.BranchId = dto.BranchId;
                if (dto.ManagerId.HasValue)
                    employee.ManagerId = dto.ManagerId;
                if (dto.ProbationEndDate.HasValue)
                    employee.ProbationEndDate = dto.ProbationEndDate;
                if (dto.ConfirmationDate.HasValue)
                    employee.ConfirmationDate = dto.ConfirmationDate;
                if (dto.ContractEndDate.HasValue)
                    employee.ContractEndDate = dto.ContractEndDate;
                if (dto.EmergencyContactName != null)
                    employee.EmergencyContactName = dto.EmergencyContactName;
                if (dto.EmergencyContactRelationship != null)
                    employee.EmergencyContactRelationship = dto.EmergencyContactRelationship;
                if (dto.EmergencyContactPhone != null)
                    employee.EmergencyContactPhone = dto.EmergencyContactPhone;
                if (dto.EmergencyContactEmail != null)
                    employee.EmergencyContactEmail = dto.EmergencyContactEmail;
                if (dto.SalaryGrade != null)
                    employee.SalaryGrade = dto.SalaryGrade;
                if (dto.BaseSalary.HasValue)
                    employee.BaseSalary = dto.BaseSalary;
                if (dto.PayrollFrequency != null)
                    employee.PayrollFrequency = dto.PayrollFrequency;
                if (dto.WeeklyHours.HasValue)
                    employee.WeeklyHours = dto.WeeklyHours;
                if (dto.ShiftPattern != null)
                    employee.ShiftPattern = dto.ShiftPattern;

                employee.UpdatedAt = DateTime.UtcNow;
                employee.UpdatedByUserId = userId;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Employee updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating employee {EmployeeId}", id);
                return StatusCode(500, new { message = "Error updating employee", error = ex.Message });
            }
        }

        // DELETE: api/employee/{id}
        [HttpDelete("{id}")]
        [RequirePermission("employee.delete")]
        public async Task<ActionResult> DeleteEmployee(Guid id)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "Tenant ID is required" });

            var currentUserId = User.FindFirst("user_id")?.Value;
            if (!Guid.TryParse(currentUserId, out var userId))
                return Unauthorized(new { message = "User ID not found" });

            try
            {
                var employee = await _context.Employees
                    .FirstOrDefaultAsync(e => e.Id == id && e.TenantId == tenantId && e.DeletedAt == null);

                if (employee == null)
                    return NotFound(new { message = "Employee not found" });

                employee.DeletedAt = DateTime.UtcNow;
                employee.DeletedByUserId = userId;
                employee.Status = "deleted";

                await _context.SaveChangesAsync();

                return Ok(new { message = "Employee deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting employee {EmployeeId}", id);
                return StatusCode(500, new { message = "Error deleting employee", error = ex.Message });
            }
        }
    }

    // DTOs
    public class CreateEmployeeDto
    {
        public Guid UserId { get; set; }
        public string? EmployeeNumber { get; set; }
        public DateTime HireDate { get; set; }
        public Guid? EmploymentTypeId { get; set; }
        public string? EmploymentStatus { get; set; }
        public string? JobTitle { get; set; }
        public Guid? DepartmentId { get; set; }
        public Guid? BranchId { get; set; }
        public Guid? ManagerId { get; set; }
        public DateTime? ProbationEndDate { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactRelationship { get; set; }
        public string? EmergencyContactPhone { get; set; }
        public string? EmergencyContactEmail { get; set; }
        public string? SalaryGrade { get; set; }
        public decimal? BaseSalary { get; set; }
        public string? Currency { get; set; }
        public string? PayrollFrequency { get; set; }
        public decimal? WeeklyHours { get; set; }
        public string? ShiftPattern { get; set; }
    }

    public class UpdateEmployeeDto
    {
        public Guid? EmploymentTypeId { get; set; }
        public string? EmploymentStatus { get; set; }
        public string? JobTitle { get; set; }
        public Guid? DepartmentId { get; set; }
        public Guid? BranchId { get; set; }
        public Guid? ManagerId { get; set; }
        public DateTime? ProbationEndDate { get; set; }
        public DateTime? ConfirmationDate { get; set; }
        public DateTime? ContractEndDate { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactRelationship { get; set; }
        public string? EmergencyContactPhone { get; set; }
        public string? EmergencyContactEmail { get; set; }
        public string? SalaryGrade { get; set; }
        public decimal? BaseSalary { get; set; }
        public string? PayrollFrequency { get; set; }
        public decimal? WeeklyHours { get; set; }
        public string? ShiftPattern { get; set; }
    }
}
