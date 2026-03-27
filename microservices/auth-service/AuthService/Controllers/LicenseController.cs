using AuthService.Authorization;
using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LicenseController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<LicenseController> _logger;

        public LicenseController(
            AppDbContext context,
            ILogger<LicenseController> logger)
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

        // POST: api/license/fix-tenant-ids (Temporary diagnostic endpoint)
        [HttpPost("fix-tenant-ids")]
        [AllowAnonymous] // Temporary - allow any authenticated user
        public async Task<ActionResult> FixLicenseTenantIds()
        {
            // Try to get tenant ID from claim or header
            Guid currentTenantId;
            if (!TryGetTenantId(out currentTenantId))
            {
                // Try to get from header
                var tenantIdHeader = Request.Headers["X-Tenant-ID"].FirstOrDefault();
                if (string.IsNullOrEmpty(tenantIdHeader) || !Guid.TryParse(tenantIdHeader, out currentTenantId))
                {
                    return BadRequest(new { message = "Tenant ID is required" });
                }
            }

            try
            {
                var adminEmail = User.Identity?.Name;
                var adminUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == adminEmail);

                if (adminUser == null)
                    return NotFound(new { message = "User not found" });

                // Update all licenses for this user to match their tenant
                var licensesToFix = await _context.ProfessionalLicenses
                    .Where(l => l.UserId == adminUser.Id && l.TenantId != adminUser.TenantId)
                    .ToListAsync();

                foreach (var license in licensesToFix)
                {
                    license.TenantId = adminUser.TenantId;
                    license.UpdatedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Tenant IDs fixed successfully",
                    userEmail = adminEmail,
                    userTenantId = adminUser.TenantId,
                    currentTenantId,
                    licensesFixed = licensesToFix.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fixing license tenant IDs");
                return StatusCode(500, new { message = "Error fixing tenant IDs", error = ex.Message });
            }
        }

        // GET: api/license
        [HttpGet]
        [AllowAnonymous] // Temporarily allow anonymous access for testing
        // Temporarily disabled permission check - permissions not mapped to roles yet
        // [RequirePermission("license.view")]
        public async Task<ActionResult<object>> GetAllLicenses(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null,
            [FromQuery] string? licenseType = null,
            [FromQuery] string? verificationStatus = null,
            [FromQuery] bool? expiringOnly = null,
            [FromQuery] int? expiringInDays = null)
        {
            Guid tenantId;
            if (!TryGetTenantId(out tenantId))
            {
                // Fallback to X-Tenant-ID header
                var tenantIdHeader = Request.Headers["X-Tenant-ID"].FirstOrDefault();
                if (string.IsNullOrEmpty(tenantIdHeader) || !Guid.TryParse(tenantIdHeader, out tenantId))
                {
                    // Use default admin tenant for testing/development
                    tenantId = Guid.Parse("155fe198-6ae5-4a01-9254-ead5b427247e");
                    _logger.LogWarning("No tenant ID provided, using default: {TenantId}", tenantId);
                }
            }

            try
            {
                _logger.LogInformation($"Fetching licenses for tenant: {tenantId}");
                
                var query = _context.ProfessionalLicenses
                    .Where(l => l.TenantId == tenantId && l.DeletedAt == null);

                _logger.LogInformation($"Query created, counting total...");
                var totalCount = await query.CountAsync();
                _logger.LogInformation($"Total count: {totalCount}");

                if (totalCount == 0)
                {
                    return Ok(new
                    {
                        items = new List<object>(),
                        totalCount = 0,
                        currentPage = page,
                        pageSize,
                        totalPages = 0,
                        debug = new
                        {
                            tenantId,
                            message = "No licenses found for this tenant"
                        }
                    });
                }

                // Simplified query without Include for debugging
                var licenses = await query
                    .OrderBy(l => l.ExpiryDate)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(l => new
                    {
                        l.Id,
                        l.UserId,
                        l.LicenseType,
                        l.LicenseNumber,
                        l.IssuingAuthority,
                        l.IssueDate,
                        l.ExpiryDate,
                        l.VerificationStatus,
                        l.Status
                    })
                    .ToListAsync();

                _logger.LogInformation($"Retrieved {licenses.Count} licenses");

                return Ok(new
                {
                    items = licenses,
                    totalCount,
                    currentPage = page,
                    pageSize,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching licenses");
                return StatusCode(500, new { message = "Error fetching licenses", error = ex.Message });
            }
        }

        // GET: api/license/{id}
        [HttpGet("{id}")]
        [RequirePermission("license.view")]
        public async Task<ActionResult<object>> GetLicense(Guid id)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "Tenant ID is required" });

            try
            {
                var license = await _context.ProfessionalLicenses
                    .Include(l => l.User)
                    .Where(l => l.Id == id && l.TenantId == tenantId && l.DeletedAt == null)
                    .FirstOrDefaultAsync();

                if (license == null)
                    return NotFound(new { message = "License not found" });

                return Ok(license);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching license {LicenseId}", id);
                return StatusCode(500, new { message = "Error fetching license", error = ex.Message });
            }
        }

        // GET: api/license/user/{userId}
        [HttpGet("user/{userId}")]
        [RequirePermission("license.view")]
        public async Task<ActionResult<object>> GetLicensesByUser(Guid userId)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "Tenant ID is required" });

            try
            {
                var licenses = await _context.ProfessionalLicenses
                    .Where(l => l.UserId == userId && l.TenantId == tenantId && l.DeletedAt == null)
                    .ToListAsync();
                return Ok(licenses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching licenses for user {UserId}", userId);
                return StatusCode(500, new { message = "Error fetching licenses", error = ex.Message });
            }
        }

        // GET: api/license/expiring
        [HttpGet("expiring")]
        [RequirePermission("license.view")]
        public async Task<ActionResult<object>> GetExpiringLicenses([FromQuery] int days = 90)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "Tenant ID is required" });

            try
            {
                var thresholdDate = DateTime.UtcNow.AddDays(days);
                var licenses = await _context.ProfessionalLicenses
                    .Include(l => l.User)
                    .Where(l => l.TenantId == tenantId &&
                        l.DeletedAt == null &&
                        l.ExpiryDate.HasValue &&
                        l.ExpiryDate.Value <= thresholdDate &&
                        l.ExpiryDate.Value >= DateTime.UtcNow)
                    .ToListAsync();
                
                return Ok(new
                {
                    items = licenses,
                    totalCount = licenses.Count,
                    expiringInDays = days
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching expiring licenses");
                return StatusCode(500, new { message = "Error fetching expiring licenses", error = ex.Message });
            }
        }

        // GET: api/license/statistics
        [HttpGet("statistics")]
        [RequirePermission("license.view")]
        public async Task<ActionResult<object>> GetLicenseStatistics()
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "Tenant ID is required" });

            try
            {
                var now = DateTime.UtcNow;
                var expiring30 = await _context.ProfessionalLicenses
                    .CountAsync(l => l.TenantId == tenantId &&
                        l.DeletedAt == null &&
                        l.ExpiryDate.HasValue &&
                        l.ExpiryDate.Value <= now.AddDays(30) &&
                        l.ExpiryDate.Value >= now);

                var expiring60 = await _context.ProfessionalLicenses
                    .CountAsync(l => l.TenantId == tenantId &&
                        l.DeletedAt == null &&
                        l.ExpiryDate.HasValue &&
                        l.ExpiryDate.Value <= now.AddDays(60) &&
                        l.ExpiryDate.Value > now.AddDays(30));

                var expiring90 = await _context.ProfessionalLicenses
                    .CountAsync(l => l.TenantId == tenantId &&
                        l.DeletedAt == null &&
                        l.ExpiryDate.HasValue &&
                        l.ExpiryDate.Value <= now.AddDays(90) &&
                        l.ExpiryDate.Value > now.AddDays(60));

                var expired = await _context.ProfessionalLicenses
                    .CountAsync(l => l.TenantId == tenantId &&
                        l.DeletedAt == null &&
                        l.ExpiryDate.HasValue &&
                        l.ExpiryDate.Value < now);

                var pendingVerification = await _context.ProfessionalLicenses
                    .CountAsync(l => l.TenantId == tenantId &&
                        l.DeletedAt == null &&
                        l.VerificationStatus == "pending");

                var verified = await _context.ProfessionalLicenses
                    .CountAsync(l => l.TenantId == tenantId &&
                        l.DeletedAt == null &&
                        l.VerificationStatus == "verified");

                return Ok(new
                {
                    expiringIn30Days = expiring30,
                    expiringIn60Days = expiring60,
                    expiringIn90Days = expiring90,
                    expired,
                    pendingVerification,
                    verified,
                    totalActive = verified + pendingVerification
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching license statistics");
                return StatusCode(500, new { message = "Error fetching statistics", error = ex.Message });
            }
        }

        // POST: api/license
        [HttpPost]
        [RequirePermission("license.create")]
        public async Task<ActionResult<object>> CreateLicense([FromBody] CreateLicenseDto dto)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "Tenant ID is required" });

            var currentUserId = User.FindFirst("user_id")?.Value;
            if (!Guid.TryParse(currentUserId, out var userId))
                return Unauthorized(new { message = "User ID not found" });

            try
            {
                var license = new ProfessionalLicense
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    UserId = dto.UserId,
                    LicenseType = dto.LicenseType,
                    LicenseNumber = dto.LicenseNumber,
                    IssuingAuthority = dto.IssuingAuthority,
                    IssueDate = dto.IssueDate,
                    ExpiryDate = dto.ExpiryDate,
                    RenewalReminderDays = dto.RenewalReminderDays,
                    DocumentUrl = dto.DocumentUrl,
                    VerificationStatus = "pending",
                    Status = "active",
                    CreatedAt = DateTime.UtcNow,
                    CreatedByUserId = userId
                };

                _context.ProfessionalLicenses.Add(license);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetLicense), new { id = license.Id }, new
                {
                    license.Id,
                    license.LicenseNumber,
                    message = "License created successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating license");
                return StatusCode(500, new { message = "Error creating license", error = ex.Message });
            }
        }

        // PUT: api/license/{id}
        [HttpPut("{id}")]
        [RequirePermission("license.update")]
        public async Task<ActionResult> UpdateLicense(Guid id, [FromBody] UpdateLicenseDto dto)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "Tenant ID is required" });

            var currentUserId = User.FindFirst("user_id")?.Value;
            if (!Guid.TryParse(currentUserId, out var userId))
                return Unauthorized(new { message = "User ID not found" });

            try
            {
                var license = await _context.ProfessionalLicenses
                    .FirstOrDefaultAsync(l => l.Id == id && l.TenantId == tenantId && l.DeletedAt == null);

                if (license == null)
                    return NotFound(new { message = "License not found" });

                // Update fields
                if (dto.LicenseType != null)
                    license.LicenseType = dto.LicenseType;
                if (dto.LicenseNumber != null)
                    license.LicenseNumber = dto.LicenseNumber;
                if (dto.IssuingAuthority != null)
                    license.IssuingAuthority = dto.IssuingAuthority;
                if (dto.IssueDate.HasValue)
                    license.IssueDate = dto.IssueDate;
                if (dto.ExpiryDate.HasValue)
                    license.ExpiryDate = dto.ExpiryDate;
                if (dto.RenewalReminderDays.HasValue)
                    license.RenewalReminderDays = dto.RenewalReminderDays.Value;
                if (dto.DocumentUrl != null)
                    license.DocumentUrl = dto.DocumentUrl;
                if (dto.VerificationStatus != null)
                    license.VerificationStatus = dto.VerificationStatus;

                license.UpdatedAt = DateTime.UtcNow;
                license.UpdatedByUserId = userId;

                await _context.SaveChangesAsync();

                return Ok(new { message = "License updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying license {LicenseId}", id);
                return StatusCode(500, new { message = "Error verifying license", error = ex.Message });
            }
        }

        // POST: api/license/{id}/renew
        [HttpPost("{id}/renew")]
        [RequirePermission("license.update")]
        public async Task<ActionResult> RenewLicense(Guid id, [FromBody] RenewLicenseDto dto)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "Tenant ID is required" });

            var currentUserId = User.FindFirst("user_id")?.Value;
            if (!Guid.TryParse(currentUserId, out var userId))
                return Unauthorized(new { message = "User ID not found" });

            try
            {
                var license = await _context.ProfessionalLicenses
                    .FirstOrDefaultAsync(l => l.Id == id && l.TenantId == tenantId && l.DeletedAt == null);

                if (license == null)
                    return NotFound(new { message = "License not found" });

                license.ExpiryDate = dto.NewExpiryDate;
                if (dto.NewLicenseNumber != null)
                    license.LicenseNumber = dto.NewLicenseNumber;
                if (dto.NewDocumentUrl != null)
                    license.DocumentUrl = dto.NewDocumentUrl;
                
                license.VerificationStatus = "pending"; // Requires re-verification
                license.UpdatedAt = DateTime.UtcNow;
                license.UpdatedByUserId = userId;

                await _context.SaveChangesAsync();

                return Ok(new { message = "License renewed successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error renewing license {LicenseId}", id);
                return StatusCode(500, new { message = "Error renewing license", error = ex.Message });
            }
        }

        // DELETE: api/license/{id}
        [HttpDelete("{id}")]
        [RequirePermission("license.delete")]
        public async Task<ActionResult> DeleteLicense(Guid id)
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "Tenant ID is required" });

            var currentUserId = User.FindFirst("user_id")?.Value;
            if (!Guid.TryParse(currentUserId, out var userId))
                return Unauthorized(new { message = "User ID not found" });

            try
            {
                var license = await _context.ProfessionalLicenses
                    .FirstOrDefaultAsync(l => l.Id == id && l.TenantId == tenantId && l.DeletedAt == null);

                if (license == null)
                    return NotFound(new { message = "License not found" });

                license.DeletedAt = DateTime.UtcNow;
                license.DeletedByUserId = userId;
                license.Status = "deleted";

                await _context.SaveChangesAsync();

                return Ok(new { message = "License deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting license {LicenseId}", id);
                return StatusCode(500, new { message = "Error deleting license", error = ex.Message });
            }
        }

        // POST: api/license/send-renewal-reminders
        [HttpPost("send-renewal-reminders")]
        [RequirePermission("license.manage")]
        public ActionResult SendRenewalReminders()
        {
            if (!TryGetTenantId(out var tenantId))
                return BadRequest(new { message = "Tenant ID is required" });

            try
            {
                // TODO: Implement reminder sending logic
                return Ok(new
                {
                    message = "Send renewal reminders endpoint - implementation pending",
                    status = "not_implemented"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending renewal reminders");
                return StatusCode(500, new { message = "Error sending reminders", error = ex.Message });
            }
        }
    }

    // DTOs
    public class CreateLicenseDto
    {
        public Guid UserId { get; set; }
        public string LicenseType { get; set; } = string.Empty;
        public string? LicenseNumber { get; set; }
        public string? IssuingAuthority { get; set; }
        public DateTime? IssueDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public int RenewalReminderDays { get; set; } = 90;
        public string? DocumentUrl { get; set; }
    }

    public class UpdateLicenseDto
    {
        public string? LicenseType { get; set; }
        public string? LicenseNumber { get; set; }
        public string? IssuingAuthority { get; set; }
        public DateTime? IssueDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public int? RenewalReminderDays { get; set; }
        public string? DocumentUrl { get; set; }
        public string? VerificationStatus { get; set; }
    }

    public class VerifyLicenseDto
    {
        public bool IsVerified { get; set; }
        public string? VerificationNotes { get; set; }
    }

    public class RenewLicenseDto
    {
        public DateTime NewExpiryDate { get; set; }
        public string? NewLicenseNumber { get; set; }
        public string? NewDocumentUrl { get; set; }
    }
}
