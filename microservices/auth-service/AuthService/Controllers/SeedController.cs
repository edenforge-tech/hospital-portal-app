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

        [HttpPost("counselor-queue")]
        public async Task<IActionResult> SeedCounselorQueue()
        {
            try
            {
                // Get tenant ID from HTTP context (set by middleware from X-Tenant-ID header)
                var tenantIdClaim = User.FindFirst("TenantId");
                if (tenantIdClaim == null || !Guid.TryParse(tenantIdClaim.Value, out var tenantId))
                {
                    // Fallback: try to get from X-Tenant-ID header directly
                    if (Request.Headers.TryGetValue("X-Tenant-ID", out var tenantIdHeader) && Guid.TryParse(tenantIdHeader.FirstOrDefault(), out tenantId))
                    {
                        // Successfully got tenant ID from header
                    }
                    else  
                    {
                        // If no tenant in context or header, get first active tenant
                        var firstTenant = await _context.Tenants
                            .Where(t => t.Status == "Active")
                            .FirstOrDefaultAsync();
                        
                        if (firstTenant == null)
                            return BadRequest(new { message = "No active tenant found" });
                        
                        tenantId = firstTenant.Id;
                    }
                }

                // Get tenant details
                var tenant = await _context.Tenants.FindAsync(tenantId);
                if (tenant == null)
                    return BadRequest(new { message = $"Tenant {tenantId} not found" });

                var branch = await _context.Branches
                    .Where(b => b.TenantId == tenant.Id && b.DeletedAt == null)
                    .FirstOrDefaultAsync();

                if (branch == null)
                    return BadRequest(new { message = "No branch found for tenant" });

                // Get or create test patients
                var patients = new List<Patient>();
                var patientData = new[]
                {
                    new { FirstName = "Ramesh", LastName = "Kumar", Age = 65, Gender = "Male", MRN = "MRN001234" },
                    new { FirstName = "Priya", LastName = "Sharma", Age = 42, Gender = "Female", MRN = "MRN001235" },
                    new { FirstName = "Ahmed", LastName = "Khan", Age = 58, Gender = "Male", MRN = "MRN001236" }
                };

                foreach (var pd in patientData)
                {
                    var existing = await _context.Patients
                        .Where(p => p.MedicalRecordNumber == pd.MRN && p.TenantId == tenant.Id)
                        .FirstOrDefaultAsync();

                    if (existing == null)
                    {
                        existing = new Patient
                        {
                            Id = Guid.NewGuid(),
                            TenantId = tenant.Id,
                            BranchId = branch.Id,
                            FirstName = pd.FirstName,
                            LastName = pd.LastName,
                            DateOfBirth = DateTime.UtcNow.AddYears(-pd.Age),
                            Gender = pd.Gender,
                            ContactNumber = $"+91-98765432{10 + patients.Count}",
                            MedicalRecordNumber = pd.MRN,
                            BloodGroup = "O+",
                            InsuranceStatus = "Insured",
                            Status = "active",
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow,
                            CreatedByUserId = null,
                            UpdatedByUserId = null
                        };
                        _context.Patients.Add(existing);
                        await _context.SaveChangesAsync();
                    }
                    patients.Add(existing);
                }

                // Clear old sessions for these test patients to avoid conflicts
                var oldSessions = await _context.CounselingSession
                    .Where(s => s.TenantId == tenant.Id && patients.Select(p => p.Id).Contains(s.PatientId))
                    .ToListAsync();
                
                if (oldSessions.Any())
                {
                    // First delete queue items referencing these sessions (due to FK constraint)
                    var oldQueueItems = await _context.CounselorQueue
                        .Where(q => oldSessions.Select(s => s.Id).Contains(q.SessionId))
                        .ToListAsync();
                    _context.CounselorQueue.RemoveRange(oldQueueItems);
                    
                    // Then delete the sessions
                    _context.CounselingSession.RemoveRange(oldSessions);
                    await _context.SaveChangesAsync();
                }

                // Get a doctor for referring (required for counseling sessions)
                // Query directly from users table using raw SQL
                var connection = _context.Database.GetDbConnection();
                await connection.OpenAsync();
                using var command = connection.CreateCommand();
                command.CommandText = $"SELECT id FROM users WHERE tenant_id = '{tenant.Id}' LIMIT 1";
                var result = await command.ExecuteScalarAsync();
                await connection.CloseAsync();

                if (result == null || result == DBNull.Value)
                {
                    return BadRequest(new { message = "No users found in tenant" });
                }

                var doctor = Guid.Parse(result.ToString()!);

                // Per-patient surgery data: surgery name, eye laterality, category
                var surgeryData = new[]
                {
                    // Ramesh Kumar — Cataract Surgery (Right Eye)
                    new { Surgery = "Cataract Surgery (Phacoemulsification)", Eye = "RE", Category = "Surgery" },
                    // Priya Sharma   — LASIK (Both Eyes — bilateral refractive)
                    new { Surgery = "LASIK",                                   Eye = "BE", Category = "Surgery" },
                    // Ahmed Khan     — Cataract Surgery (Right Eye)
                    new { Surgery = "Cataract Surgery (Phacoemulsification)", Eye = "RE", Category = "Surgery" },
                };

                // Create counseling sessions for each patient
                var sessions = new List<CounselingSession>();
                for (var i = 0; i < patients.Count; i++)
                {
                    var sd = surgeryData[i];
                    var session = new CounselingSession
                    {
                        Id = Guid.NewGuid(),
                        TenantId = tenant.Id,
                        BranchId = branch.Id,
                        PatientId = patients[i].Id,
                        ReferredByDoctorId = doctor,
                        SessionNumber = $"CS-{DateTime.UtcNow:yyyyMMdd}-{sessions.Count + 1:D3}",
                        SessionType = "Initial",
                        SessionDate = DateTime.UtcNow,
                        PatientType = "Cash",
                        Status = "Scheduled",
                        CurrentStage = "Initial",
                        PackageDiscussed = false,
                        PendingDecision = true,
                        RecommendedSurgery   = sd.Surgery,
                        SurgeryTentativeEye  = sd.Eye,
                        SessionCategory      = sd.Category,
                        CreatedAt = DateTime.UtcNow
                    };
                    sessions.Add(session);
                    _context.CounselingSession.Add(session);
                }
                await _context.SaveChangesAsync();

                // Verify sessions were created
                if (sessions.Count != 3 || sessions.Any(s => s.Id == Guid.Empty))
                {
                    return StatusCode(500, new { message = "Failed to create counseling sessions" });
                }

                // Create queue items
                var queueItems = new[]
                {
                    new CounselorQueueItem
                    {
                        Id = Guid.NewGuid(),
                        TenantId = tenant.Id,
                        BranchId = branch.Id,
                        SessionId = sessions[0].Id,
                        PatientId = patients[0].Id,
                        TokenNumber = "T-001",
                        QueueType = "Counseling",
                        QueuePosition = 1,
                        PriorityScore = 85,
                        UrgencyLevel = "High",
                        AddedToQueueAt = DateTime.UtcNow.AddMinutes(-25),
                        EstimatedWaitMinutes = 25,
                        Status = "Waiting",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new CounselorQueueItem
                    {
                        Id = Guid.NewGuid(),
                        TenantId = tenant.Id,
                        BranchId = branch.Id,
                        SessionId = sessions[1].Id,
                        PatientId = patients[1].Id,
                        TokenNumber = "T-002",
                        QueueType = "Counseling",
                        QueuePosition = 2,
                        PriorityScore = 55,
                        UrgencyLevel = "Normal",
                        AddedToQueueAt = DateTime.UtcNow.AddMinutes(-18),
                        EstimatedWaitMinutes = 18,
                        Status = "Waiting",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new CounselorQueueItem
                    {
                        Id = Guid.NewGuid(),
                        TenantId = tenant.Id,
                        BranchId = branch.Id,
                        SessionId = sessions[2].Id,
                        PatientId = patients[2].Id,
                        TokenNumber = "T-003",
                        QueueType = "Counseling",
                        QueuePosition = 3,
                        PriorityScore = 30,
                        UrgencyLevel = "Low",
                        AddedToQueueAt = DateTime.UtcNow.AddMinutes(-10),
                        EstimatedWaitMinutes = 10,
                        Status = "Waiting",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    }
                };

                _context.CounselorQueue.AddRange(queueItems);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = $"Successfully seeded {queueItems.Length} counselor queue items",
                    tenantId = tenant.Id,
                    tenantName = tenant.Name,
                    branchId = branch.Id,
                    branchName = branch.Name,
                    queueItemsCreated = queueItems.Length,
                    patients = patients.Select((p, index) => new { 
                        p.Id, 
                        p.FirstName,
                        p.LastName,
                        p.MedicalRecordNumber, 
                        p.DateOfBirth,
                        TokenNumber = queueItems[index].TokenNumber,
                        UrgencyLevel = queueItems[index].UrgencyLevel,
                        Status = queueItems[index].Status
                    }).ToList()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = $"Error seeding counselor queue: {ex.Message}",
                    details = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }
    }
}