using AuthService.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using AuthService.Models.Identity;
using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SeedController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly RoleManager<AppRole> _roleManager;
        private readonly AppDbContext _context;

        public SeedController(UserManager<AppUser> userManager, RoleManager<AppRole> roleManager, AppDbContext context)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _context = context;
        }

        [HttpPost("create-admin")]
        [RequirePermission("system.admin")]
        public async Task<IActionResult> CreateAdmin()
        {
            try
            {
                // Get existing tenant - use existing INDIA_EYE_NET tenant
                var tenantData = _context.Tenants
                    .Select(t => new { t.Id, t.Name, t.TenantCode, t.Status })
                    .FirstOrDefault();
                    
                if (tenantData == null)
                {
                    return BadRequest(new { message = "No tenant found in database. Please ensure tenants exist first." });
                }
                
                var tenantId = tenantData.Id;

                // Create Admin role if not exists
                if (!await _roleManager.RoleExistsAsync("Admin"))
                {
                    var adminRole = new AppRole
                    {
                        Name = "Admin",
                        NormalizedName = "ADMIN",
                        RoleLevel = 1,
                        TenantId = tenantId,
                        IsActive = true,
                        Description = "System Administrator"
                    };
                    await _roleManager.CreateAsync(adminRole);
                }

                // Create admin user if not exists
                var existingUser = await _userManager.FindByEmailAsync("admin@hospital.com");
                if (existingUser == null)
                {
                    var adminUser = new AppUser
                    {
                        UserName = "admin@hospital.com",
                        Email = "admin@hospital.com",
                        FirstName = "Admin",
                        LastName = "User",
                        EmailConfirmed = true,
                        TenantId = tenantId
                        // Note: Removed properties that are ignored in EF Core configuration
                    };

                    var result = await _userManager.CreateAsync(adminUser, "Admin123");
                    if (result.Succeeded)
                    {
                        await _userManager.AddToRoleAsync(adminUser, "Admin");
                        return Ok(new { 
                            message = "Admin user created successfully!", 
                            email = "admin@hospital.com", 
                            password = "Admin123",
                            loginUrl = "http://localhost:3000"
                        });
                    }
                    else
                    {
                        return BadRequest(new { message = "Failed to create admin user", errors = result.Errors });
                    }
                }
                else
                {
                    return Ok(new { 
                        message = "Admin user already exists!", 
                        email = "admin@hospital.com", 
                        password = "Admin123",
                        loginUrl = "http://localhost:3000"
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpPost("execute-rbac-script")]
        // [RequirePermission("system.admin")] // Temporarily disabled for testing
        public async Task<IActionResult> ExecuteRbacScript()
        {
            try
            {
                // Path to the RBAC/ABAC implementation script
                var scriptPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "..", "complete_rbac_abac_implementation.sql");
                scriptPath = Path.GetFullPath(scriptPath);

                if (!System.IO.File.Exists(scriptPath))
                {
                    return NotFound(new { message = "RBAC script file not found", path = scriptPath });
                }

                // Read the SQL script
                var sqlScript = await System.IO.File.ReadAllTextAsync(scriptPath);

                // Execute the entire script at once
                await _context.Database.ExecuteSqlRawAsync(sqlScript);

                return Ok(new { 
                    message = "RBAC script executed successfully",
                    scriptPath = scriptPath
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred executing RBAC script", error = ex.Message });
            }
        }

        [HttpPost("departments")]
        public async Task<IActionResult> SeedDepartments([FromQuery] string tenantId = "11111111-1111-1111-1111-111111111111")
        {
            try
            {
                var tid = Guid.Parse(tenantId);
                
                var sql = $@"
DO $$
DECLARE
    v_tenant_id UUID := '{tid}';
BEGIN
    INSERT INTO department (id, tenant_id, department_code, department_name, department_type, description, status, is_24x7, requires_approval, created_at, updated_at)
    SELECT gen_random_uuid(), v_tenant_id, 'OPD', 'Outpatient Department', 'Clinical', 'Main OPD', 'Active', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM department WHERE department_code = 'OPD' AND tenant_id = v_tenant_id);
    
    INSERT INTO department (id, tenant_id, department_code, department_name, department_type, description, status, is_24x7, requires_approval, created_at, updated_at)
    SELECT gen_random_uuid(), v_tenant_id, 'RETINA', 'Retina & Vitreous', 'Clinical', 'Retinal diseases', 'Active', false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM department WHERE department_code = 'RETINA' AND tenant_id = v_tenant_id);

    INSERT INTO department (id, tenant_id, department_code, department_name, department_type, description, status, is_24x7, requires_approval, created_at, updated_at)
    SELECT gen_random_uuid(), v_tenant_id, 'GLAUCOMA', 'Glaucoma', 'Clinical', 'Glaucoma care', 'Active', false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM department WHERE department_code = 'GLAUCOMA' AND tenant_id = v_tenant_id);

    INSERT INTO department (id, tenant_id, department_code, department_name, department_type, description, status, is_24x7, requires_approval, created_at, updated_at)
    SELECT gen_random_uuid(), v_tenant_id, 'CATARACT', 'Cataract & Anterior Segment', 'Clinical', 'Cataract surgery', 'Active', false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM department WHERE department_code = 'CATARACT' AND tenant_id = v_tenant_id);

    INSERT INTO department (id, tenant_id, department_code, department_name, department_type, description, status, is_24x7, requires_approval, created_at, updated_at)
    SELECT gen_random_uuid(), v_tenant_id, 'CORNEA', 'Cornea & External Diseases', 'Clinical', 'Corneal diseases', 'Active', false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM department WHERE department_code = 'CORNEA' AND tenant_id = v_tenant_id);

    INSERT INTO department (id, tenant_id, department_code, department_name, department_type, description, status, is_24x7, requires_approval, created_at, updated_at)
    SELECT gen_random_uuid(), v_tenant_id, 'PEDIATRIC', 'Pediatric Ophthalmology', 'Clinical', 'Pediatric eye care', 'Active', false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM department WHERE department_code = 'PEDIATRIC' AND tenant_id = v_tenant_id);

    INSERT INTO department (id, tenant_id, department_code, department_name, department_type, description, status, is_24x7, requires_approval, created_at, updated_at)
    SELECT gen_random_uuid(), v_tenant_id, 'OPTOMETRY', 'Optometry', 'Clinical', 'Refraction services', 'Active', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM department WHERE department_code = 'OPTOMETRY' AND tenant_id = v_tenant_id);

    INSERT INTO department (id, tenant_id, department_code, department_name, department_type, description, status, is_24x7, requires_approval, created_at, updated_at)
    SELECT gen_random_uuid(), v_tenant_id, 'EMERGENCY', 'Emergency & Trauma', 'Clinical', '24/7 emergency care', 'Active', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM department WHERE department_code = 'EMERGENCY' AND tenant_id = v_tenant_id);

    INSERT INTO department (id, tenant_id, department_code, department_name, department_type, description, status, is_24x7, requires_approval, created_at, updated_at)
    SELECT gen_random_uuid(), v_tenant_id, 'OCT', 'OCT Imaging', 'Diagnostic', 'OCT scans', 'Active', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM department WHERE department_code = 'OCT' AND tenant_id = v_tenant_id);

    INSERT INTO department (id, tenant_id, department_code, department_name, department_type, description, status, is_24x7, requires_approval, created_at, updated_at)
    SELECT gen_random_uuid(), v_tenant_id, 'VISUAL_FIELD', 'Visual Field Analysis', 'Diagnostic', 'Perimetry', 'Active', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM department WHERE department_code = 'VISUAL_FIELD' AND tenant_id = v_tenant_id);

    INSERT INTO department (id, tenant_id, department_code, department_name, department_type, description, status, is_24x7, requires_approval, created_at, updated_at)
    SELECT gen_random_uuid(), v_tenant_id, 'PHARMACY', 'In-House Pharmacy', 'Support', 'Hospital pharmacy', 'Active', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM department WHERE department_code = 'PHARMACY' AND tenant_id = v_tenant_id);

    INSERT INTO department (id, tenant_id, department_code, department_name, department_type, description, status, is_24x7, requires_approval, created_at, updated_at)
    SELECT gen_random_uuid(), v_tenant_id, 'PATHOLOGY', 'Pathology Laboratory', 'Diagnostic', 'Lab tests', 'Active', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM department WHERE department_code = 'PATHOLOGY' AND tenant_id = v_tenant_id);

    INSERT INTO department (id, tenant_id, department_code, department_name, department_type, description, status, is_24x7, requires_approval, created_at, updated_at)
    SELECT gen_random_uuid(), v_tenant_id, 'OT', 'Operation Theatre', 'Clinical', 'Surgery', 'Active', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM department WHERE department_code = 'OT' AND tenant_id = v_tenant_id);

    INSERT INTO department (id, tenant_id, department_code, department_name, department_type, description, status, is_24x7, requires_approval, created_at, updated_at)
    SELECT gen_random_uuid(), v_tenant_id, 'BILLING', 'Billing & Accounts', 'Administrative', 'Patient billing', 'Active', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM department WHERE department_code = 'BILLING' AND tenant_id = v_tenant_id);

    INSERT INTO department (id, tenant_id, department_code, department_name, department_type, description, status, is_24x7, requires_approval, created_at, updated_at)
    SELECT gen_random_uuid(), v_tenant_id, 'FRONT_DESK', 'Front Desk', 'Administrative', 'Reception', 'Active', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM department WHERE department_code = 'FRONT_DESK' AND tenant_id = v_tenant_id);
END $$;
";

                await _context.Database.ExecuteSqlRawAsync(sql);
                
                var count = await _context.Departments
                    .Where(d => d.TenantId == tid && d.DeletedAt == null)
                    .CountAsync();
                    
                return Ok(new { 
                    success = true, 
                    message = $"Successfully seeded {count} departments for tenant {tid}"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    success = false, 
                    message = $"Error seeding departments: {ex.Message}",
                    details = ex.InnerException?.Message
                });
            }
        }
    }
}