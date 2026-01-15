using AuthService.Authorization;
using AuthService.Context;
using AuthService.Models.Identity;
using AuthService.Models.Domain;
using AuthService.Models.User;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Diagnostics; // For Stopwatch
using System.Linq;
using System.Threading.Tasks;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly RoleManager<AppRole> _roleManager;
        private readonly AppDbContext _context;
        private readonly IUserService _userService;
        private readonly INotificationClient _notificationClient;
        private readonly IActivationAuditService _activationAuditService;
        private readonly ILogger<UsersController> _logger;

        public UsersController(
            UserManager<AppUser> userManager, 
            RoleManager<AppRole> roleManager, 
            AppDbContext context,
            IUserService userService,
            INotificationClient notificationClient,
            IActivationAuditService activationAuditService,
            ILogger<UsersController> logger)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _context = context;
            _userService = userService;
            _notificationClient = notificationClient;
            _activationAuditService = activationAuditService;
            _logger = logger;
        }

        private bool TryGetTenantId(out Guid tenantId)
        {
            tenantId = Guid.Empty;
            if (!HttpContext.Items.TryGetValue("TenantId", out var t)) return false;
            if (t is Guid g) { tenantId = g; return true; }
            return false;
        }

        [HttpGet]
        [RequirePermission("user.view")]
        public async Task<IActionResult> GetAll()
        {
            if (!TryGetTenantId(out var tenantId)) return BadRequest(new { message = "TenantId missing" });

            var users = await _userManager.Users
                .Where(u => u.TenantId == tenantId)
                .Select(u => new {
                    id = u.Id,
                    userName = u.UserName,
                    email = u.Email,
                    firstName = u.FirstName,
                    lastName = u.LastName,
                    userType = u.UserType,
                    userStatus = u.UserStatus
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("with-details")]
        [RequirePermission("user.view")]
        public async Task<IActionResult> GetUsersWithDetails()
        {
            if (!TryGetTenantId(out var tenantId)) return BadRequest(new { message = "TenantId missing" });

            // Get users first
            var users = await _userManager.Users
                .Where(u => u.TenantId == tenantId && u.DeletedAt == null)
                .ToListAsync();

            // Then fetch related data separately to avoid client evaluation
            var userIds = users.Select(u => u.Id).ToList();
            
            var userRoles = await _context.UserRoles
                .Where(ur => userIds.Contains(ur.UserId))
                .Join(_context.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => new { ur.UserId, RoleId = r.Id, RoleName = r.Name, BranchId = (Guid?)ur.BranchId })
                .ToListAsync();

            var userDepartments = await _context.UserDepartments
                .Where(ud => userIds.Contains(ud.UserId) && ud.DeletedAt == null)
                .Join(_context.Departments, ud => ud.DepartmentId, d => d.Id, (ud, d) => new { 
                    ud.UserId, 
                    DepartmentId = d.Id, 
                    DepartmentName = d.DepartmentName, 
                    ud.IsPrimary 
                })
                .ToListAsync();

            var branches = await _context.Branches
                .Where(b => b.TenantId == tenantId)
                .ToDictionaryAsync(b => b.Id, b => b.Name);

            // Combine results
            var result = users.Select(u => new {
                id = u.Id,
                userName = u.UserName,
                email = u.Email,
                phoneNumber = u.PhoneNumber,
                firstName = u.FirstName,
                lastName = u.LastName,
                userType = u.UserType,
                userStatus = u.UserStatus,
                employeeId = u.EmployeeId,
                designation = u.Designation,
                qualifications = u.Qualifications,
                specialization = u.Specialization,
                licenseNumber = u.LicenseNumber,
                dateOfBirth = u.DateOfBirth?.ToString("yyyy-MM-dd"),
                gender = u.Gender,
                branchId = u.BranchId,
                departmentId = userDepartments.FirstOrDefault(ud => ud.UserId == u.Id && ud.IsPrimary)?.DepartmentId,
                roleId = userRoles.FirstOrDefault(ur => ur.UserId == u.Id)?.RoleId,
                roles = userRoles.Where(ur => ur.UserId == u.Id).Select(ur => ur.RoleName).ToList(),
                departments = userDepartments.Where(ud => ud.UserId == u.Id).Select(ud => new {
                    departmentId = ud.DepartmentId,
                    departmentName = ud.DepartmentName,
                    isPrimary = ud.IsPrimary
                }).ToList(),
                primaryDepartment = userDepartments.FirstOrDefault(ud => ud.UserId == u.Id && ud.IsPrimary)?.DepartmentName,
                branch = u.BranchId.HasValue && branches.ContainsKey(u.BranchId.Value) ? branches[u.BranchId.Value] : null
            }).ToList();

            return Ok(result);
        }

        [HttpGet("{id}")]
        [RequirePermission("user.view")]
        public async Task<IActionResult> GetById(Guid id)
        {
            if (!TryGetTenantId(out var tenantId)) return BadRequest(new { message = "TenantId missing" });

            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == id && u.TenantId == tenantId);
            if (user == null) return NotFound(new { message = "User not found" });

            // Get user roles
            var userRoles = await _userManager.GetRolesAsync(user);

            return Ok(new {
                id = user.Id,
                userName = user.UserName,
                email = user.Email,
                firstName = user.FirstName,
                lastName = user.LastName,
                fullName = $"{user.FirstName} {user.LastName}".Trim(),
                userType = user.UserType,
                userStatus = user.UserStatus,
                roles = userRoles.Select(r => new { name = r }).ToList()
            });
        }

        public class CreateUserRequest
        {
            public string UserName { get; set; }
            public string Email { get; set; }
            public string FirstName { get; set; }
            public string LastName { get; set; }
            public string Password { get; set; }
            public string UserType { get; set; }
            public string? PhoneNumber { get; set; }
            public string? Designation { get; set; }
            public string? EmployeeId { get; set; }
            public string? Qualifications { get; set; }
            public string? Specialization { get; set; }
            public string? LicenseNumber { get; set; }
            public DateTime? DateOfBirth { get; set; }
            public string? Gender { get; set; }
            public Guid? BranchId { get; set; }
            public string? DepartmentId { get; set; }
            public string? PrimaryRole { get; set; }
        }

        public class GenerateOTPRequest
        {
            public string? DeliveryMethod { get; set; } // "email" or "sms"
            public string? CredentialType { get; set; } // "otp" or "auto_password"
        }

        [HttpPost]
        [RequirePermission("user.create")]
        public async Task<IActionResult> Create([FromBody] CreateUserRequest req)
        {
            // Log incoming request for debugging
            var jsonReq = System.Text.Json.JsonSerializer.Serialize(req);
            Console.WriteLine($"=== CREATE USER REQUEST ===");
            Console.WriteLine($"JSON: {jsonReq}");
            
            // Log model state errors if any
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage + " | " + e.Exception?.Message).ToList();
                Console.WriteLine($"Model validation failed: {string.Join(", ", errors)}");
                return BadRequest(new { message = "Validation failed", errors = errors, modelState = ModelState });
            }

            if (!TryGetTenantId(out var tenantId)) return BadRequest(new { message = "TenantId missing" });

            Console.WriteLine($"Creating user: Username={req.UserName}, Email={req.Email}, EmployeeId={req.EmployeeId}");

            // Auto-generate EmployeeID if not provided
            var employeeId = req.EmployeeId;
            if (string.IsNullOrEmpty(employeeId))
            {
                // Get count of existing users for this tenant to generate sequential ID
                var userCount = await _userManager.Users.CountAsync(u => u.TenantId == tenantId);
                var userTypePrefix = req.UserType?.ToUpper().Substring(0, Math.Min(3, req.UserType.Length)) ?? "USR";
                employeeId = $"EMP-{userTypePrefix}-{(userCount + 1):D4}";
            }

            var user = new AppUser
            {
                UserName = req.UserName,
                Email = req.Email,
                PhoneNumber = req.PhoneNumber,
                FirstName = req.FirstName,
                LastName = req.LastName,
                TenantId = tenantId,
                UserType = req.UserType ?? "Staff",
                UserStatus = "Active",
                EmailConfirmed = true,
                EmployeeId = employeeId,
                Designation = req.Designation,
                Qualifications = req.Qualifications,
                Specialization = req.Specialization,
                LicenseNumber = req.LicenseNumber,
                DateOfBirth = req.DateOfBirth,
                Gender = req.Gender,
                BranchId = req.BranchId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Generate secure password that meets policy: 12 chars, upper, lower, digit, symbol
            var password = string.IsNullOrEmpty(req.Password) 
                ? $"Temp@{Guid.NewGuid().ToString("N").Substring(0, 8)}1" 
                : req.Password;

            Console.WriteLine($"Creating user with password: {password}");
            var result = await _userManager.CreateAsync(user, password);
            if (!result.Succeeded)
            {
                var errorMessages = result.Errors.Select(e => e.Description).ToList();
                Console.WriteLine($"❌ User creation failed:");
                foreach (var error in errorMessages)
                {
                    Console.WriteLine($"   - {error}");
                }
                return BadRequest(new { errors = errorMessages });
            }

            // If a branch is assigned, create corresponding user_branches entry
            if (req.BranchId.HasValue)
            {
                var userBranch = new UserBranch
                {
                    UserId = user.Id,
                    BranchId = req.BranchId.Value,
                    TenantId = tenantId,
                    IsDefault = true, // First branch is default
                    AssignedAt = DateTime.UtcNow,
                    EffectiveFrom = DateTime.UtcNow,
                    Status = "active",
                    Notes = "Auto-assigned during user creation"
                };
                
                _context.UserBranches.Add(userBranch);
                await _context.SaveChangesAsync();
                Console.WriteLine($"✓ Branch access created: UserId={user.Id}, BranchId={req.BranchId.Value}");
            }

            // Assign role if provided
            if (!string.IsNullOrEmpty(req.PrimaryRole))
            {
                var role = await _context.Roles.FirstOrDefaultAsync(r => 
                    r.TenantId == tenantId && (r.Name == req.PrimaryRole || r.Id.ToString() == req.PrimaryRole));
                
                if (role != null)
                {
                    var userRole = new AppUserRole
                    {
                        UserId = user.Id,
                        RoleId = role.Id,
                        BranchId = req.BranchId
                    };
                    _context.UserRoles.Add(userRole);
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"✓ Role assigned: UserId={user.Id}, RoleId={role.Id}, RoleName={role.Name}");
                }
            }

            // Assign department if provided
            if (!string.IsNullOrEmpty(req.DepartmentId) && Guid.TryParse(req.DepartmentId, out var deptId))
            {
                // Verify department exists
                var department = await _context.Departments
                    .FirstOrDefaultAsync(d => d.Id == deptId && d.TenantId == tenantId && d.DeletedAt == null);
                
                if (department != null)
                {
                    var currentUserIdStr = User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value;
                    var currentUserId = Guid.TryParse(currentUserIdStr, out var userId) ? userId : Guid.Empty;

                    var deptAccess = new UserDepartment
                    {
                        Id = Guid.NewGuid(),
                        TenantId = tenantId,
                        UserId = user.Id,
                        DepartmentId = deptId,
                        AccessType = "Primary",
                        CanView = true,
                        CanCreate = true,
                        CanEdit = true,
                        CanDelete = false,
                        CanApprove = false,
                        CanExport = false,
                        AccessStartDate = DateTime.UtcNow.Date,
                        Status = "active",
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = currentUserId,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.UserDepartments.Add(deptAccess);
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"✓ Department assigned: UserId={user.Id}, DepartmentId={deptId}, DepartmentName={department.DepartmentName}");
                }
            }

            return CreatedAtAction(nameof(GetById), new { id = user.Id }, new { id = user.Id, employeeId = employeeId });
        }

        [HttpPut("{id}")]
        [RequirePermission("user.update")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateUserRequest req)
        {
            if (!TryGetTenantId(out var tenantId)) return BadRequest(new { message = "TenantId missing" });

            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == id && u.TenantId == tenantId);
            if (user == null) return NotFound();

            // Update basic info
            user.FirstName = req.FirstName;
            user.LastName = req.LastName;
            user.UserName = req.UserName;
            user.Email = req.Email;
            user.UserType = req.UserType ?? user.UserType;
            
            // Update professional info
            user.PhoneNumber = req.PhoneNumber;
            user.Designation = req.Designation;
            user.Qualifications = req.Qualifications;
            user.Specialization = req.Specialization;
            user.LicenseNumber = req.LicenseNumber;
            user.DateOfBirth = req.DateOfBirth;
            user.Gender = req.Gender;
            user.BranchId = req.BranchId;
            user.UpdatedAt = DateTime.UtcNow;
            
            // EmployeeID is read-only after creation, but keep it if provided
            if (!string.IsNullOrEmpty(req.EmployeeId) && string.IsNullOrEmpty(user.EmployeeId))
            {
                user.EmployeeId = req.EmployeeId;
            }

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
            }

            // Sync branch assignment to user_branches table
            if (req.BranchId.HasValue)
            {
                // Check if user_branches entry exists
                var existingUserBranch = await _context.UserBranches
                    .FirstOrDefaultAsync(ub => ub.UserId == id && ub.BranchId == req.BranchId.Value && ub.TenantId == tenantId);
                
                if (existingUserBranch == null)
                {
                    // Deactivate old branch assignments
                    var oldBranches = await _context.UserBranches
                        .Where(ub => ub.UserId == id && ub.TenantId == tenantId && ub.Status == "active")
                        .ToListAsync();
                    
                    foreach (var old in oldBranches)
                    {
                        old.Status = "inactive";
                        old.EffectiveUntil = DateTime.UtcNow;
                        old.UpdatedAt = DateTime.UtcNow;
                    }

                    // Create new user_branches entry
                    var userBranch = new UserBranch
                    {
                        UserId = id,
                        BranchId = req.BranchId.Value,
                        TenantId = tenantId,
                        IsDefault = true,
                        AssignedAt = DateTime.UtcNow,
                        EffectiveFrom = DateTime.UtcNow,
                        Status = "active",
                        Notes = "Synced from user update",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    
                    _context.UserBranches.Add(userBranch);
                    Console.WriteLine($"✓ Branch access synced: UserId={id}, BranchId={req.BranchId.Value}");
                }
                else if (existingUserBranch.Status != "active")
                {
                    // Reactivate existing branch
                    existingUserBranch.Status = "active";
                    existingUserBranch.IsDefault = true;
                    existingUserBranch.EffectiveFrom = DateTime.UtcNow;
                    existingUserBranch.EffectiveUntil = null;
                    existingUserBranch.UpdatedAt = DateTime.UtcNow;
                    Console.WriteLine($"✓ Branch access reactivated: UserId={id}, BranchId={req.BranchId.Value}");
                }
            }

            // Update role assignment if provided
            if (!string.IsNullOrEmpty(req.PrimaryRole))
            {
                // Remove existing roles
                var existingRoles = await _context.UserRoles.Where(ur => ur.UserId == id).ToListAsync();
                _context.UserRoles.RemoveRange(existingRoles);
                
                // Find role by name or ID
                var role = await _context.Roles.FirstOrDefaultAsync(r => 
                    r.TenantId == tenantId && (r.Name == req.PrimaryRole || r.Id.ToString() == req.PrimaryRole));
                
                if (role != null)
                {
                    var userRole = new AppUserRole
                    {
                        UserId = id,
                        RoleId = role.Id,
                        BranchId = req.BranchId
                    };
                    _context.UserRoles.Add(userRole);
                    Console.WriteLine($"✓ Role assigned: UserId={id}, RoleId={role.Id}, RoleName={role.Name}");
                }
            }

            await _context.SaveChangesAsync();

            // Update department assignment if provided
            if (!string.IsNullOrEmpty(req.DepartmentId) && Guid.TryParse(req.DepartmentId, out var deptId))
            {
                // Remove existing department assignments
                var existingDepts = await _context.UserDepartments
                    .Where(ud => ud.UserId == id && ud.DeletedAt == null)
                    .ToListAsync();
                
                foreach (var dept in existingDepts)
                {
                    dept.DeletedAt = DateTime.UtcNow;
                    dept.Status = "inactive";
                }

                // Verify department exists
                var department = await _context.Departments
                    .FirstOrDefaultAsync(d => d.Id == deptId && d.TenantId == tenantId && d.DeletedAt == null);
                
                if (department != null)
                {
                    // Get current user ID for audit
                    var currentUserIdStr = User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value;
                    var currentUserId = Guid.TryParse(currentUserIdStr, out var userId) ? userId : Guid.Empty;

                    // Create new primary department assignment
                    var newDeptAccess = new UserDepartment
                    {
                        Id = Guid.NewGuid(),
                        TenantId = tenantId,
                        UserId = id,
                        DepartmentId = deptId,
                        AccessType = "Primary",
                        CanView = true,
                        CanCreate = true,
                        CanEdit = true,
                        CanDelete = false,
                        CanApprove = false,
                        CanExport = false,
                        AccessStartDate = DateTime.UtcNow.Date,
                        Status = "active",
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = currentUserId,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.UserDepartments.Add(newDeptAccess);
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"✓ Department assigned: UserId={id}, DepartmentId={deptId}, DepartmentName={department.DepartmentName}");
                }
            }

            return NoContent();
        }

        [HttpPost("{id}/deactivate")]
        [RequirePermission("user.delete")]
        public async Task<IActionResult> Deactivate(Guid id)
        {
            if (!TryGetTenantId(out var tenantId)) return BadRequest(new { message = "TenantId missing" });

            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == id && u.TenantId == tenantId);
            if (user == null) return NotFound();

            user.UserStatus = "Inactive";
            await _userManager.UpdateAsync(user);

            return Ok(new { message = "User deactivated" });
        }

        /// <summary>
        /// Generate one-time password for user activation with delivery method option
        /// POST /api/users/{id}/generate-otp
        /// </summary>
        [HttpPost("{id}/generate-otp")]
        [RequirePermission("user.activate")]
        public async Task<IActionResult> GenerateOTP(Guid id, [FromBody] GenerateOTPRequest request)
        {
            if (!TryGetTenantId(out var tenantId)) return BadRequest(new { message = "TenantId missing" });

            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == id && u.TenantId == tenantId);
            if (user == null) return NotFound(new { message = "User not found" });

            // Validate delivery method
            var deliveryMethod = request?.DeliveryMethod?.ToLower() ?? "email";
            if (deliveryMethod != "email" && deliveryMethod != "sms")
                return BadRequest(new { message = "Invalid delivery method. Use 'email' or 'sms'" });

            // Validate credential type
            var credentialType = request?.CredentialType?.ToLower() ?? "otp";
            if (credentialType != "otp" && credentialType != "auto_password")
                return BadRequest(new { message = "Invalid credential type. Use 'otp' or 'auto_password'" });

            // Validate phone number if SMS delivery
            if (deliveryMethod == "sms" && string.IsNullOrWhiteSpace(user.PhoneNumber))
                return BadRequest(new { message = "User phone number not found. Cannot send SMS." });

            // Validate email if email delivery
            if (deliveryMethod == "email" && string.IsNullOrWhiteSpace(user.Email))
                return BadRequest(new { message = "User email not found. Cannot send email." });

            // Generate secure password based on type
            string credential;
            if (credentialType == "otp")
            {
                // Generate 6-digit OTP for one-time use
                credential = GenerateNumericOTP(6);
            }
            else
            {
                // Generate secure 12-character auto-password
                credential = GenerateSecurePassword(12);
            }

            var credentialHash = _userManager.PasswordHasher.HashPassword(user, credential);

            user.OneTimePasswordHash = credentialHash;
            user.OtpExpiresAt = DateTime.UtcNow.AddHours(48); // 48 hours expiry
            user.MustResetPassword = (credentialType == "otp"); // OTP requires password reset
            user.ActivationStatus = "pending";
            user.UserStatus = "pending_activation";
            user.UpdatedAt = DateTime.UtcNow;
            
            await _userManager.UpdateAsync(user);

            // Get current user ID for audit
            var currentUserId = Guid.Parse(User.FindFirst("sub")?.Value ?? 
                                         User.FindFirst("user_id")?.Value ?? 
                                         User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? 
                                         Guid.Empty.ToString());

            _logger.LogInformation("[SendActivation] User details - UserId: {UserId}, TenantId: {TenantId}, Email: {Email}, Phone: {Phone}",
                user.Id, user.TenantId, user.Email, user.PhoneNumber);

            // Log activation event with delivery method
            await _context.Set<UserActivationLog>().AddAsync(new UserActivationLog
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                UserId = id,
                ActivationType = $"{credentialType}_{deliveryMethod}",
                ActivatedAt = DateTime.UtcNow,
                ActivatedByUserId = currentUserId,
                OtpSentAt = DateTime.UtcNow,
                DeliveryMethod = deliveryMethod,
                CredentialType = credentialType,
                Notes = $"{(credentialType == "otp" ? "OTP" : "Auto-password")} generated for user activation via {deliveryMethod}",
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = currentUserId
            });
            await _context.SaveChangesAsync();

            // Prepare delivery destination
            string deliveryDestination = deliveryMethod == "email" ? user.Email : user.PhoneNumber;
            string maskedDestination = deliveryMethod == "email" 
                ? MaskEmail(user.Email!) 
                : MaskPhoneNumber(user.PhoneNumber!);

            _logger.LogInformation("[SendActivation] Calling notification service - UserId: {UserId}, TenantId: {TenantId}, DeliveryMethod: {DeliveryMethod}, Recipient: {Recipient}",
                user.Id, user.TenantId, deliveryMethod, deliveryDestination);

            // Send via notification service
            var (notifSuccess, otpId, otp, notifError) = await _notificationClient.SendActivationOtpAsync(
                user.Id, 
                user.TenantId, 
                deliveryMethod, 
                deliveryDestination);

            if (!notifSuccess)
            {
                _logger.LogError("[SendActivation] Notification service failed - Error: {Error}", notifError);
                // Continue anyway - credential is already saved in database
            }
            else
            {
                _logger.LogInformation("[SendActivation] Notification service succeeded - OtpId: {OtpId}, OTP: {Otp}", otpId, otp);
            }

            return Ok(new { 
                message = $"{(credentialType == "otp" ? "OTP" : "Auto-password")} generated and sent via {deliveryMethod}",
                deliveryMethod = deliveryMethod,
                credential = otp,  // The OTP code for admin to share
                deliveryDestination = maskedDestination,
                credentialType = credentialType
            });
        }

        /// <summary>
        /// Generate numeric OTP (for SMS/Email)
        /// </summary>
        private string GenerateNumericOTP(int length)
        {
            var random = new Random();
            return string.Concat(Enumerable.Range(0, length).Select(_ => random.Next(0, 10)));
        }

        /// <summary>
        /// Mask email for security (show first 2 and domain)
        /// </summary>
        private string MaskEmail(string email)
        {
            if (string.IsNullOrEmpty(email)) return string.Empty;
            var parts = email.Split('@');
            if (parts.Length != 2) return email;
            var localPart = parts[0];
            if (localPart.Length <= 2) return email;
            return $"{localPart.Substring(0, 2)}***@{parts[1]}";
        }

        /// <summary>
        /// Mask phone number for security (show last 4 digits)
        /// </summary>
        private string MaskPhoneNumber(string phone)
        {
            if (string.IsNullOrEmpty(phone) || phone.Length < 4) return "***";
            return $"***{phone.Substring(phone.Length - 4)}";
        }

        /// <summary>
        /// Activate user account (change status from Pending to Active)
        /// POST /api/users/{id}/activate
        /// </summary>
        [HttpPost("{id}/activate")]
        [RequirePermission("user.activate")]
        public async Task<IActionResult> ActivateUser(Guid id)
        {
            if (!TryGetTenantId(out var tenantId)) return BadRequest(new { message = "TenantId missing" });

            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == id && u.TenantId == tenantId);
            if (user == null) return NotFound(new { message = "User not found" });

            user.ActivationStatus = "Active";
            user.UserStatus = "Active";
            user.EmailVerified = true;
            
            await _userManager.UpdateAsync(user);

            // Log activation
            await _context.Set<UserActivationLog>().AddAsync(new UserActivationLog
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                UserId = id,
                ActivationType = "manual_activation",
                ActivatedByUserId = Guid.Parse(User.FindFirst("sub")?.Value ?? Guid.Empty.ToString()),
                ActivatedAt = DateTime.UtcNow,
                Notes = "User manually activated by administrator"
            });
            await _context.SaveChangesAsync();

            return Ok(new { message = "User activated successfully" });
        }

        /// <summary>
        /// Request password reset for a user (admin-triggered)
        /// POST /api/users/{id}/reset-password
        /// </summary>
        [HttpPost("{id}/reset-password")]
        [RequirePermission("user.manage")]
        public async Task<IActionResult> ResetPassword(Guid id)
        {
            if (!TryGetTenantId(out var tenantId)) return BadRequest(new { message = "TenantId missing" });

            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == id && u.TenantId == tenantId);
            if (user == null) return NotFound(new { message = "User not found" });

            // Generate password reset token
            var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
            var resetTokenHash = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(resetToken));

            user.PasswordResetToken = resetTokenHash;
            user.ResetTokenExpiresAt = DateTime.UtcNow.AddHours(2); // 2 hours expiry
            
            await _userManager.UpdateAsync(user);

            // Log reset request
            await _context.Set<PasswordResetRequest>().AddAsync(new PasswordResetRequest
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                UserId = id,
                ResetTokenHash = resetTokenHash,
                RequestedByUserId = Guid.Parse(User.FindFirst("sub")?.Value ?? Guid.Empty.ToString()),
                ExpiresAt = user.ResetTokenExpiresAt.Value,
                Status = "pending",
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString()
            });
            await _context.SaveChangesAsync();

            // TODO: Send email with reset link
            // var resetUrl = $"{Request.Scheme}://{Request.Host}/reset-password?token={resetToken}&userId={id}";
            // await _emailService.SendPasswordResetEmail(user.Email, user.UserName, resetUrl);

            return Ok(new { 
                message = "Password reset email sent to user",
                email = user.Email,
                expiresAt = user.ResetTokenExpiresAt,
                resetToken = resetToken // REMOVE IN PRODUCTION - only for testing
            });
        }

        /// <summary>
        /// Helper method to generate secure random password
        /// </summary>
        private string GenerateSecurePassword(int length)
        {
            const string validChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
            var random = new Random();
            var chars = new char[length];
            
            for (int i = 0; i < length; i++)
            {
                chars[i] = validChars[random.Next(validChars.Length)];
            }
            
            return new string(chars);
        }

        public class AssignRoleRequest
        {
            public Guid RoleId { get; set; }
            public Guid? BranchId { get; set; }
        }

        [HttpPost("{userId}/roles")]
        [RequirePermission("role.assign")]
        public async Task<IActionResult> AssignRole(Guid userId, [FromBody] AssignRoleRequest req)
        {
            if (!TryGetTenantId(out var tenantId)) return BadRequest(new { message = "TenantId missing" });

            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == userId && u.TenantId == tenantId);
            if (user == null) return NotFound(new { message = "User not found" });

            var role = await _roleManager.FindByIdAsync(req.RoleId.ToString());
            if (role == null || role.TenantId != tenantId) return NotFound(new { message = "Role not found" });

            // Check if role assignment already exists (use AsNoTracking to avoid EF tracking conflicts)
            var exists = await _context.Set<AppUserRole>()
                .AsNoTracking()
                .AnyAsync(ur => ur.UserId == userId && ur.RoleId == req.RoleId && ur.BranchId == (req.BranchId ?? Guid.Empty));
            
            if (exists)
            {
                return Ok(new { message = "Role already assigned" });
            }

            // Add AppUserRole record with additional properties for branch/scoped assignment
            // Note: AppUserRole extends IdentityUserRole, so this creates the AspNetUserRoles entry
            var userRole = new AppUserRole
            {
                UserId = userId,
                RoleId = req.RoleId,
                BranchId = req.BranchId ?? Guid.Empty,
                AssignedAt = DateTime.UtcNow,
                IsActive = true
            };
            
            _context.Set<AppUserRole>().Add(userRole);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Role assigned" });
        }

        /// <summary>
        /// Assign departments to a user
        /// POST /api/users/{userId}/departments
        /// </summary>
        [HttpPost("{userId}/departments")]
        [RequirePermission("user.edit")]
        public async Task<IActionResult> AssignDepartments(Guid userId, [FromBody] List<DepartmentAssignment> departments)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "TenantId missing" });

            // Get current user ID for audit
            var currentUserIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("user_id")?.Value;
            if (!Guid.TryParse(currentUserIdClaim, out var currentUserId))
                return Unauthorized(new { message = "Current user ID not found" });

            // Verify user exists
            var user = await _userManager.Users
                .FirstOrDefaultAsync(u => u.Id == userId && u.TenantId == tenantId);
            
            if (user == null)
                return NotFound(new { message = "User not found" });

            // Assign departments
            var success = await _userService.AssignDepartmentsAsync(userId, tenantId, departments, currentUserId);

            if (!success)
                return BadRequest(new { message = "Failed to assign departments" });

            return Ok(new { 
                message = "Departments assigned successfully",
                count = departments.Count,
                departments = departments.Select(d => new { 
                    d.DepartmentId, 
                    d.DepartmentName, 
                    d.IsPrimary, 
                    d.AccessLevel 
                })
            });
        }

        /// <summary>
        /// Get user's department assignments
        /// GET /api/users/{userId}/departments
        /// </summary>
        [HttpGet("{userId}/departments")]
        [RequirePermission("user.view")]
        public async Task<IActionResult> GetUserDepartments(Guid userId)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "TenantId missing" });

            var departments = await _context.Set<UserDepartment>()
                .Where(ud => ud.UserId == userId && ud.TenantId == tenantId && ud.DeletedAt == null)
                .Join(_context.Set<Department>(),
                    ud => ud.DepartmentId,
                    d => d.Id,
                    (ud, d) => new
                    {
                        departmentId = d.Id,
                        departmentName = d.DepartmentName,
                        departmentType = d.DepartmentType,
                        isPrimary = ud.AccessType == "Primary",
                        accessLevel = ud.AccessType ?? "Full Access",
                        status = ud.Status,
                        assignedOn = ud.CreatedAt,
                        validFrom = ud.AccessStartDate,
                        validUntil = ud.AccessEndDate
                    })
                .ToListAsync();

            return Ok(new { 
                userId,
                count = departments.Count,
                departments
            });
        }

        // ========================
        // USER ACTIVATION ENDPOINT
        // ========================

        [HttpPost("{id}/send-activation")]
        [RequirePermission("user.manage")]
        public async Task<IActionResult> SendActivation(Guid id, [FromBody] SendActivationRequest request)
        {
            if (!TryGetTenantId(out var tenantId))
                return Unauthorized(new { message = "Tenant context required" });

            var user = await _userManager.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.TenantId == tenantId);

            if (user == null)
                return NotFound(new { message = "User not found" });

            // Validate delivery method and recipient
            if (string.IsNullOrEmpty(request.DeliveryMethod) || 
                (request.DeliveryMethod != "email" && request.DeliveryMethod != "sms"))
            {
                return BadRequest(new { message = "DeliveryMethod must be 'email' or 'sms'" });
            }

            // Use custom recipient if provided, otherwise use user's contact info
            string recipient;
            if (!string.IsNullOrWhiteSpace(request.Recipient))
            {
                recipient = request.Recipient.Trim();
            }
            else if (request.DeliveryMethod == "email")
            {
                recipient = user.Email ?? string.Empty;
                if (string.IsNullOrEmpty(recipient))
                    return BadRequest(new { message = "User has no email address and no recipient provided" });
            }
            else // sms
            {
                recipient = user.PhoneNumber ?? string.Empty;
                if (string.IsNullOrEmpty(recipient))
                    return BadRequest(new { message = "User has no phone number and no recipient provided" });
            }

            _logger.LogInformation("[SendActivation] Calling notification service - UserId: {UserId}, TenantId: {TenantId}, DeliveryMethod: {DeliveryMethod}, Recipient: {Recipient}",
                user.Id, user.TenantId, request.DeliveryMethod, recipient);

            // Call notification service to send OTP
            var (success, otpId, otp, error) = await _notificationClient.SendActivationOtpAsync(
                user.Id,
                user.TenantId, // Pass tenant ID to notification service
                request.DeliveryMethod,
                recipient
            );

            if (!success)
            {
                return StatusCode(500, new { 
                    message = "Failed to send activation code", 
                    error 
                });
            }

            // Update user status to pending activation (status lifecycle: created → invitation_sent)
            user.ActivationStatus = "invitation_sent";
            user.UserStatus = "pending_activation";  // Lowercase with underscore to match CHECK constraint
            user.UpdatedAt = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);

            return Ok(new
            {
                success = true,
                message = $"Activation code sent successfully to {recipient}",
                deliveryMethod = request.DeliveryMethod
            });
        }

        private string MaskRecipient(string recipient, string method)
        {
            if (method == "email")
            {
                var parts = recipient.Split('@');
                if (parts.Length != 2) return recipient;
                var local = parts[0].Length > 2 ? parts[0][0] + "***" : parts[0];
                return $"{local}@{parts[1]}";
            }
            else // sms
            {
                if (recipient.Length < 7) return recipient;
                return recipient.Substring(0, 3) + "***" + recipient.Substring(recipient.Length - 4);
            }
        }

        /// <summary>
        /// Reset password for a user (used during activation or password reset)
        /// POST: /api/users/{id}/reset-password
        /// </summary>
        [HttpPost("{id}/reset-password")]
        [RequirePermission("user.manage")]
        public async Task<IActionResult> ResetPassword(string id, [FromBody] ResetPasswordRequest request)
        {
            _logger.LogInformation("Reset password request for user {UserId}", id);

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { success = false, message = "User not found" });
            }

            // Remove existing password if any
            if (await _userManager.HasPasswordAsync(user))
            {
                var removeResult = await _userManager.RemovePasswordAsync(user);
                if (!removeResult.Succeeded)
                {
                    return BadRequest(new { success = false, message = "Failed to reset password", errors = removeResult.Errors });
                }
            }

            // Add new password
            var addResult = await _userManager.AddPasswordAsync(user, request.NewPassword);
            if (!addResult.Succeeded)
            {
                return BadRequest(new { 
                    success = false, 
                    message = "Password does not meet requirements", 
                    errors = addResult.Errors.Select(e => e.Description) 
                });
            }

            // HIPAA Compliance: Set 90-day password expiry
            user.PasswordExpiresAt = DateTime.UtcNow.AddDays(90);
            user.LastPasswordChangeAt = DateTime.UtcNow;
            user.LastPasswordChange = DateTime.UtcNow;
            user.MustChangePasswordOnLogin = false; // Reset flag after successful password set
            user.UserStatus = "Active"; // Activate user after password set
            
            await _userManager.UpdateAsync(user);

            _logger.LogInformation(
                "Password reset successfully for user {UserId}. Password expires at {ExpiryDate}",
                id,
                user.PasswordExpiresAt
            );

            return Ok(new { 
                success = true, 
                message = "Password set successfully",
                passwordExpiresAt = user.PasswordExpiresAt
            });
        }

        /// <summary>
        /// Set password during user activation (no authentication required)
        /// POST: /api/users/{id}/set-activation-password
        /// </summary>
        [HttpPost("{id}/set-activation-password")]
        [AllowAnonymous]
        public async Task<IActionResult> SetActivationPassword(string id, [FromBody] SetActivationPasswordRequest request)
        {
            _logger.LogInformation("Activation password setup request for user {UserId}", id);

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { Success = false, Message = "User not found" });
            }

            // Verify user is in activation process (not already active)
            if (user.UserStatus == "Active" && await _userManager.HasPasswordAsync(user))
            {
                return BadRequest(new { Success = false, Message = "User is already activated" });
            }

            // Remove existing password if any
            if (await _userManager.HasPasswordAsync(user))
            {
                var removeResult = await _userManager.RemovePasswordAsync(user);
                if (!removeResult.Succeeded)
                {
                    return BadRequest(new { Success = false, Message = "Failed to set password", Errors = removeResult.Errors });
                }
            }

            // Add new password
            var addResult = await _userManager.AddPasswordAsync(user, request.Password);
            if (!addResult.Succeeded)
            {
                return BadRequest(new { 
                    Success = false, 
                    Message = "Password does not meet requirements", 
                    Errors = addResult.Errors.Select(e => e.Description) 
                });
            }

            // HIPAA Compliance: Set 90-day password expiry
            user.PasswordExpiresAt = DateTime.UtcNow.AddDays(90);
            user.LastPasswordChangeAt = DateTime.UtcNow;
            user.LastPasswordChange = DateTime.UtcNow;
            user.MustChangePasswordOnLogin = false;
            user.MustResetPassword = false;
            
            // Update status lifecycle
            user.ActivationStatus = "password_set";
            user.UserStatus = "pending_activation";  // Still in activation process
            
            await _userManager.UpdateAsync(user);

            _logger.LogInformation(
                "Activation password set successfully for user {UserId}. Password expires at {ExpiryDate}",
                id,
                user.PasswordExpiresAt
            );

            return Ok(new { 
                Success = true, 
                Message = "Password set successfully",
                PasswordExpiresAt = user.PasswordExpiresAt
            });
        }

        /// <summary>
        /// Accept terms, privacy policy, and HIPAA training acknowledgment (activation flow)
        /// </summary>
        [HttpPost("{id}/accept-terms")]
        [AllowAnonymous] // Called during activation before full authentication
        public async Task<IActionResult> AcceptTerms(string id, [FromBody] AcceptTermsRequest request)
        {
            var stopwatch = Stopwatch.StartNew();
            var user = await _userManager.FindByIdAsync(id);
            
            if (user == null)
            {
                return NotFound(new { success = false, message = "User not found" });
            }

            try
            {
                // Validate all required acceptances
                if (!request.AcceptedTerms || !request.AcceptedPrivacy || !request.AcceptedHipaa)
                {
                    await _activationAuditService.LogStepAsync(
                        Guid.Parse(id), 
                        user.TenantId, 
                        "terms_accepted", 
                        "failed", 
                        "Missing required compliance acceptances",
                        new { 
                            userId = id, 
                            acceptedTerms = request.AcceptedTerms, 
                            acceptedPrivacy = request.AcceptedPrivacy, 
                            acceptedHipaa = request.AcceptedHipaa 
                        },
                        null,
                        (int)stopwatch.ElapsedMilliseconds
                    );
                    
                    return BadRequest(new { 
                        success = false, 
                        message = "All compliance acceptances are required for HIPAA compliance" 
                    });
                }

                // Store compliance acceptance with audit trail
                user.AcceptedTerms = request.AcceptedTerms;
                user.AcceptedTermsAt = request.AcceptedAt ?? DateTime.UtcNow;
                user.AcceptedPrivacy = request.AcceptedPrivacy;
                user.AcceptedPrivacyAt = request.AcceptedAt ?? DateTime.UtcNow;
                user.AcceptedHipaa = request.AcceptedHipaa;
                user.AcceptedHipaaAt = request.AcceptedAt ?? DateTime.UtcNow;
                user.ComplianceAcceptanceIp = HttpContext.Connection.RemoteIpAddress?.ToString();
                
                // Update status lifecycle
                user.ActivationStatus = "terms_accepted";
                user.UserStatus = "pending_activation";  // Still in activation process (MFA pending)

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                {
                    await _activationAuditService.LogStepAsync(
                        Guid.Parse(id), 
                        user.TenantId, 
                        "terms_accepted", 
                        "failed", 
                        "Database update failed: " + string.Join(", ", result.Errors.Select(e => e.Description)),
                        request,
                        null,
                        (int)stopwatch.ElapsedMilliseconds
                    );
                    
                    return BadRequest(new { 
                        success = false, 
                        message = "Failed to save compliance acceptance",
                        errors = result.Errors.Select(e => e.Description)
                    });
                }

                _logger.LogInformation(
                    "User {UserId} accepted compliance terms at {Timestamp} from IP {IpAddress}",
                    id,
                    user.AcceptedTermsAt,
                    user.ComplianceAcceptanceIp
                );

                // Log terms acceptance
                await _activationAuditService.LogStepAsync(
                    Guid.Parse(id), 
                    user.TenantId, 
                    "terms_accepted", 
                    "success", 
                    null,
                    new { userId = id },
                    new { acceptedAt = user.AcceptedTermsAt },
                    (int)stopwatch.ElapsedMilliseconds
                );

                // Log HIPAA acknowledgment (separate compliance step)
                await _activationAuditService.LogStepAsync(
                    Guid.Parse(id), 
                    user.TenantId, 
                    "hipaa_accepted", 
                    "success", 
                    null,
                    new { userId = id },
                    new { acceptedAt = user.AcceptedHipaaAt },
                    (int)stopwatch.ElapsedMilliseconds
                );

                return Ok(new { 
                    success = true, 
                    message = "Compliance acceptance recorded successfully",
                    data = new {
                        acceptedTermsAt = user.AcceptedTermsAt,
                        acceptedPrivacyAt = user.AcceptedPrivacyAt,
                        acceptedHipaaAt = user.AcceptedHipaaAt
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error accepting terms for user {UserId}", id);
                
                await _activationAuditService.LogStepAsync(
                    Guid.Parse(id), 
                    user.TenantId, 
                    "terms_accepted", 
                    "failed", 
                    ex.Message,
                    request,
                    null,
                    (int)stopwatch.ElapsedMilliseconds
                );

                return StatusCode(500, new { success = false, message = "An error occurred recording compliance acceptance" });
            }
        }

        /// <summary>
        /// Mark user's email as verified (email verification flow)
        /// </summary>
        [HttpPost("{id}/verify-email")]
        [AllowAnonymous] // Called from verification link
        public async Task<IActionResult> VerifyEmail(string id)
        {
            var stopwatch = Stopwatch.StartNew();
            var user = await _userManager.FindByIdAsync(id);
            
            if (user == null)
            {
                return NotFound(new { success = false, message = "User not found" });
            }

            try
            {
                if (user.EmailVerified)
                {
                    await _activationAuditService.LogStepAsync(
                        Guid.Parse(id), 
                        user.TenantId, 
                        "email_verified", 
                        "success", 
                        "Email already verified",
                        new { userId = id },
                        new { alreadyVerified = true },
                        (int)stopwatch.ElapsedMilliseconds
                    );

                    return Ok(new { 
                        success = true, 
                        message = "Email already verified",
                        emailVerified = true
                    });
                }

                // Mark email as verified
                user.EmailVerified = true;
                user.EmailConfirmed = true; // ASP.NET Identity field

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                {
                    await _activationAuditService.LogStepAsync(
                        Guid.Parse(id), 
                        user.TenantId, 
                        "email_verified", 
                        "failed", 
                        "Database update failed: " + string.Join(", ", result.Errors.Select(e => e.Description)),
                        new { userId = id },
                        null,
                        (int)stopwatch.ElapsedMilliseconds
                    );

                    return BadRequest(new { 
                        success = false, 
                        message = "Failed to verify email",
                        errors = result.Errors.Select(e => e.Description)
                    });
                }

                _logger.LogInformation(
                    "Email verified for user {UserId} ({Email})",
                    id,
                    user.Email
                );

                // Log successful verification
                await _activationAuditService.LogStepAsync(
                    Guid.Parse(id), 
                    user.TenantId, 
                    "email_verified", 
                    "success", 
                    null,
                    new { userId = id },
                    new { emailVerified = true },
                    (int)stopwatch.ElapsedMilliseconds
                );

                return Ok(new { 
                    success = true, 
                    message = "Email verified successfully. You can now complete account activation.",
                    emailVerified = true
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying email for user {UserId}", id);
                
                await _activationAuditService.LogStepAsync(
                    Guid.Parse(id), 
                    user.TenantId, 
                    "email_verified", 
                    "failed", 
                    ex.Message,
                    new { userId = id },
                    null,
                    (int)stopwatch.ElapsedMilliseconds
                );

                return StatusCode(500, new { success = false, message = "An error occurred during email verification" });
            }
        }

        /// <summary>
        /// Save professional credentials for medical staff (doctors, nurses)
        /// Required for HIPAA compliance to verify professional credentials
        /// </summary>
        [HttpPost("{id}/professional-info")]
        [AllowAnonymous]
        public async Task<IActionResult> SaveProfessionalInfo(string id, [FromBody] ProfessionalInfoRequest request)
        {
            var stopwatch = Stopwatch.StartNew();
            
            if (!Guid.TryParse(id, out var userId))
            {
                return BadRequest(new { success = false, message = "Invalid user ID format." });
            }

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { success = false, message = "User not found." });
            }

            try
            {
                // Validate required fields
                if (string.IsNullOrWhiteSpace(request.LicenseNumber))
                {
                    await _activationAuditService.LogStepAsync(
                        userId, 
                        user.TenantId, 
                        "professional_info_saved", 
                        "failed", 
                        "License number is required",
                        new { userId = id, hasLicense = false },
                        null,
                        (int)stopwatch.ElapsedMilliseconds
                    );
                    
                    return BadRequest(new { success = false, message = "License number is required." });
                }

                if (string.IsNullOrWhiteSpace(request.Specialization))
                {
                    await _activationAuditService.LogStepAsync(
                        userId, 
                        user.TenantId, 
                        "professional_info_saved", 
                        "failed", 
                        "Specialization is required",
                        new { userId = id, hasSpecialization = false },
                        null,
                        (int)stopwatch.ElapsedMilliseconds
                    );
                    
                    return BadRequest(new { success = false, message = "Specialization is required." });
                }

                // Update professional credentials
                user.LicenseNumber = request.LicenseNumber.Trim();
                user.NpiNumber = string.IsNullOrWhiteSpace(request.NpiNumber) ? null : request.NpiNumber.Trim();
                user.Specialization = request.Specialization.Trim();
                user.ProfessionalRegistrationDate = request.RegistrationDate;

                var result = await _userManager.UpdateAsync(user);

                if (!result.Succeeded)
                {
                    _logger.LogError(
                        "Failed to save professional info for user {UserId}: {Errors}",
                        id,
                        string.Join(", ", result.Errors.Select(e => e.Description))
                    );

                    await _activationAuditService.LogStepAsync(
                        userId, 
                        user.TenantId, 
                        "professional_info_saved", 
                        "failed", 
                        "Database update failed: " + string.Join(", ", result.Errors.Select(e => e.Description)),
                        request,
                        null,
                        (int)stopwatch.ElapsedMilliseconds
                    );

                    return BadRequest(new
                    {
                        success = false,
                        message = "Failed to save professional information",
                        errors = result.Errors.Select(e => e.Description)
                    });
                }

                _logger.LogInformation(
                    "Professional credentials saved for user {UserId} - License: {License}, Specialization: {Specialization}",
                    id,
                    user.LicenseNumber,
                    user.Specialization
                );

                // Log successful save
                await _activationAuditService.LogStepAsync(
                    userId, 
                    user.TenantId, 
                    "professional_info_saved", 
                    "success", 
                    null,
                    new { userId = id, specialization = user.Specialization },
                    new { saved = true },
                    (int)stopwatch.ElapsedMilliseconds
                );

                return Ok(new
                {
                    success = true,
                    message = "Professional credentials saved successfully",
                    professionalInfo = new
                    {
                        licenseNumber = user.LicenseNumber,
                        npiNumber = user.NpiNumber,
                        specialization = user.Specialization,
                        registrationDate = user.ProfessionalRegistrationDate
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving professional info for user {UserId}", id);
                
                await _activationAuditService.LogStepAsync(
                    userId, 
                    user.TenantId, 
                    "professional_info_saved", 
                    "failed", 
                    ex.Message,
                    request,
                    null,
                    (int)stopwatch.ElapsedMilliseconds
                );

                return StatusCode(500, new { success = false, message = "An error occurred saving professional information" });
            }
        }
    }
}

// Request DTO for activation
public class SendActivationRequest
{
    public string DeliveryMethod { get; set; } = string.Empty; // "email" or "sms"
    public string? Recipient { get; set; } // Optional: custom email or phone number
}

// Request DTO for password reset
public class ResetPasswordRequest
{
    public string NewPassword { get; set; } = string.Empty;
}

// Request DTO for activation password setup
public class SetActivationPasswordRequest
{
    public string Password { get; set; } = string.Empty;
}

// Request DTO for compliance acceptance
public class AcceptTermsRequest
{
    public bool AcceptedTerms { get; set; }
    public bool AcceptedPrivacy { get; set; }
    public bool AcceptedHipaa { get; set; }
    public DateTime? AcceptedAt { get; set; }
}
// Request DTO for professional credentials (doctors, nurses)
public class ProfessionalInfoRequest
{
    public string LicenseNumber { get; set; } = string.Empty;
    public string? NpiNumber { get; set; }
    public string Specialization { get; set; } = string.Empty;
    public DateTime? RegistrationDate { get; set; }
}
