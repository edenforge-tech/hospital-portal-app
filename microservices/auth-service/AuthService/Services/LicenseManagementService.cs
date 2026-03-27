using AuthService.Context;
using AuthService.Models.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AuthService.Services
{
    public interface ILicenseManagementService
    {
        Task<List<ProfessionalLicense>> GetLicensesByTenantAsync(Guid tenantId);
        Task<List<ProfessionalLicense>> GetLicensesByUserIdAsync(Guid userId, Guid tenantId);
        Task<ProfessionalLicense?> GetLicenseByIdAsync(Guid licenseId, Guid tenantId);
        Task<ProfessionalLicense> CreateLicenseAsync(ProfessionalLicense license, Guid currentUserId);
        Task<ProfessionalLicense> UpdateLicenseAsync(ProfessionalLicense license, Guid currentUserId);
        Task DeleteLicenseAsync(Guid licenseId, Guid tenantId, Guid currentUserId);
        Task<ProfessionalLicense> VerifyLicenseAsync(Guid licenseId, Guid tenantId, Guid verifiedByUserId, string? notes = null);
        Task<List<ProfessionalLicense>> GetExpiringLicensesAsync(Guid tenantId, int daysAhead = 90);
        Task<List<ProfessionalLicense>> GetExpiredLicensesAsync(Guid tenantId);
        Task<List<ProfessionalLicense>> GetUnverifiedLicensesAsync(Guid tenantId);
        Task SendRenewalRemindersAsync(Guid tenantId);
        Task AutoSuspendExpiredLicensesAsync(Guid tenantId);
    }

    public class LicenseManagementService : ILicenseManagementService
    {
        private readonly AppDbContext _context;

        public LicenseManagementService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ProfessionalLicense>> GetLicensesByTenantAsync(Guid tenantId)
        {
            return await _context.ProfessionalLicenses
                .Where(l => l.TenantId == tenantId && l.DeletedAt == null)
                .Include(l => l.User)
                .OrderBy(l => l.ExpiryDate)
                .ToListAsync();
        }

        public async Task<List<ProfessionalLicense>> GetLicensesByUserIdAsync(Guid userId, Guid tenantId)
        {
            return await _context.ProfessionalLicenses
                .Where(l => l.UserId == userId && l.TenantId == tenantId && l.DeletedAt == null)
                .OrderBy(l => l.ExpiryDate)
                .ToListAsync();
        }

        public async Task<ProfessionalLicense?> GetLicenseByIdAsync(Guid licenseId, Guid tenantId)
        {
            return await _context.ProfessionalLicenses
                .Where(l => l.Id == licenseId && l.TenantId == tenantId && l.DeletedAt == null)
                .Include(l => l.User)
                .Include(l => l.VerifiedByUser)
                .FirstOrDefaultAsync();
        }

        public async Task<ProfessionalLicense> CreateLicenseAsync(ProfessionalLicense license, Guid currentUserId)
        {
            license.Id = Guid.NewGuid();
            license.CreatedAt = DateTime.UtcNow;
            license.UpdatedAt = DateTime.UtcNow;
            license.CreatedByUserId = currentUserId;
            license.UpdatedByUserId = currentUserId;
            license.Status = "active";
            license.RenewalStatus = license.ExpiryDate.HasValue ? DetermineRenewalStatus(license.ExpiryDate.Value) : "active";
            license.VerificationStatus = "pending";

            _context.ProfessionalLicenses.Add(license);
            await _context.SaveChangesAsync();

            // Update user's license fields (only if license is assigned to a user)
            if (license.UserId.HasValue)
            {
                await UpdateUserLicenseFieldsAsync(license.UserId.Value, license.TenantId);
            }

            return await GetLicenseByIdAsync(license.Id, license.TenantId) ?? license;
        }

        public async Task<ProfessionalLicense> UpdateLicenseAsync(ProfessionalLicense license, Guid currentUserId)
        {
            var existing = await _context.ProfessionalLicenses
                .FirstOrDefaultAsync(l => l.Id == license.Id && l.TenantId == license.TenantId && l.DeletedAt == null);

            if (existing == null)
                throw new InvalidOperationException("License not found");

            existing.LicenseType = license.LicenseType;
            existing.LicenseCategory = license.LicenseCategory;
            existing.IssuingAuthority = license.IssuingAuthority;
            existing.IssuingCountry = license.IssuingCountry;
            existing.IssuingState = license.IssuingState;
            existing.LicenseNumber = license.LicenseNumber;
            existing.IssueDate = license.IssueDate;
            existing.ExpiryDate = license.ExpiryDate;
            // Renewal fields ignored - columns don't exist in DB
            existing.DocumentUrl = license.DocumentUrl;
            existing.RenewalDocumentUrl = license.RenewalDocumentUrl;
            existing.ScopeOfPractice = license.ScopeOfPractice;
            existing.Restrictions = license.Restrictions;
            existing.Specializations = license.Specializations;
            existing.UpdatedAt = DateTime.UtcNow;
            existing.UpdatedByUserId = currentUserId;

            await _context.SaveChangesAsync();

            // Update user's license fields (only if license is assigned to a user)
            if (existing.UserId.HasValue)
            {
                await UpdateUserLicenseFieldsAsync(existing.UserId.Value, existing.TenantId);
            }

            return await GetLicenseByIdAsync(existing.Id, existing.TenantId) ?? existing;
        }

        public async Task DeleteLicenseAsync(Guid licenseId, Guid tenantId, Guid currentUserId)
        {
            var license = await _context.ProfessionalLicenses
                .FirstOrDefaultAsync(l => l.Id == licenseId && l.TenantId == tenantId && l.DeletedAt == null);

            if (license == null)
                throw new InvalidOperationException("License not found");

            license.DeletedAt = DateTime.UtcNow;
            license.DeletedByUserId = currentUserId;
            license.Status = "deleted";

            await _context.SaveChangesAsync();

            // Update user's license fields (only if license is assigned to a user)
            if (license.UserId.HasValue)
            {
                await UpdateUserLicenseFieldsAsync(license.UserId.Value, license.TenantId);
            }
        }

        public async Task<ProfessionalLicense> VerifyLicenseAsync(Guid licenseId, Guid tenantId, Guid verifiedByUserId, string? notes = null)
        {
            var license = await _context.ProfessionalLicenses
                .FirstOrDefaultAsync(l => l.Id == licenseId && l.TenantId == tenantId && l.DeletedAt == null);

            if (license == null)
                throw new InvalidOperationException("License not found");

            license.VerificationStatus = "verified";
            license.VerifiedAt = DateTime.UtcNow;
            license.VerifiedByUserId = verifiedByUserId;
            license.VerificationNotes = notes;
            license.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Update user's license fields (only if license is assigned to a user)
            if (license.UserId.HasValue)
            {
                await UpdateUserLicenseFieldsAsync(license.UserId.Value, license.TenantId);
            }

            return await GetLicenseByIdAsync(license.Id, license.TenantId) ?? license;
        }

        public async Task<List<ProfessionalLicense>> GetExpiringLicensesAsync(Guid tenantId, int daysAhead = 90)
        {
            var today = DateTime.UtcNow.Date;
            var futureDate = today.AddDays(daysAhead);

            return await _context.ProfessionalLicenses
                .Where(l => l.TenantId == tenantId 
                    && l.DeletedAt == null 
                    && l.ExpiryDate >= today 
                    && l.ExpiryDate <= futureDate
                    && l.VerificationStatus == "verified")
                .Include(l => l.User)
                .OrderBy(l => l.ExpiryDate)
                .ToListAsync();
        }

        public async Task<List<ProfessionalLicense>> GetExpiredLicensesAsync(Guid tenantId)
        {
            var today = DateTime.UtcNow.Date;

            return await _context.ProfessionalLicenses
                .Where(l => l.TenantId == tenantId 
                    && l.DeletedAt == null 
                    && l.ExpiryDate < today
                    && l.RenewalStatus != "renewed")
                .Include(l => l.User)
                .OrderBy(l => l.ExpiryDate)
                .ToListAsync();
        }

        public async Task<List<ProfessionalLicense>> GetUnverifiedLicensesAsync(Guid tenantId)
        {
            return await _context.ProfessionalLicenses
                .Where(l => l.TenantId == tenantId 
                    && l.DeletedAt == null 
                    && l.VerificationStatus == "pending")
                .Include(l => l.User)
                .OrderBy(l => l.CreatedAt)
                .ToListAsync();
        }

        public async Task SendRenewalRemindersAsync(Guid tenantId)
        {
            var today = DateTime.UtcNow.Date;

            var licensesNeedingReminder = await _context.ProfessionalLicenses
                .Where(l => l.TenantId == tenantId 
                    && l.DeletedAt == null 
                    && l.VerificationStatus == "verified"
                    && l.ExpiryDate > today
                    && l.ExpiryDate <= today.AddDays(90)) // Fixed: use constant 90 days instead of missing column
                .Include(l => l.User)
                .ToListAsync();

            foreach (var license in licensesNeedingReminder)
            {
                // TODO: Send email/notification
                // For now, just update the reminder timestamp
                license.LastReminderSentAt = DateTime.UtcNow;
                
                // Note: User table doesn't have LicenseRenewalReminderSent property
                // License reminder status is tracked via LastReminderSentAt on the license itself
            }

            await _context.SaveChangesAsync();
        }

        public async Task AutoSuspendExpiredLicensesAsync(Guid tenantId)
        {
            var today = DateTime.UtcNow.Date;

            var expiredLicenses = await _context.ProfessionalLicenses
                .Where(l => l.TenantId == tenantId 
                    && l.DeletedAt == null 
                    && l.ExpiryDate < today
                    && l.RenewalStatus != "suspended"
                    && l.VerificationStatus == "verified")
                .Include(l => l.User)
                .ToListAsync();

            foreach (var license in expiredLicenses)
            {
                license.RenewalStatus = "suspended";
                license.VerificationStatus = "expired";
                
                // Update user status or access based on expired license
                // Note: License status is tracked in professional_license table
                // Optionally suspend user account if critical license
                // var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == license.UserId);
                // if (user != null) user.UserStatus = "suspended";
            }

            await _context.SaveChangesAsync();
        }

        private string DetermineRenewalStatus(DateTime expiryDate)
        {
            var today = DateTime.UtcNow.Date;
            var daysUntilExpiry = (expiryDate - today).Days;

            if (daysUntilExpiry < 0)
                return "expired";
            else if (daysUntilExpiry <= 30)
                return "expiring";
            else
                return "active";
        }

        private async Task UpdateUserLicenseFieldsAsync(Guid userId, Guid tenantId)
        {
            // Note: License information is tracked in professional_license table
            // User table does not have HasActiveLicense or LicenseExpiryDate properties
            // To check if user has active license, query professional_license table:
            // var hasActiveLicense = await _context.ProfessionalLicenses
            //     .AnyAsync(l => l.UserId == userId && l.TenantId == tenantId 
            //         && l.DeletedAt == null && l.VerificationStatus == "verified"
            //         && l.ExpiryDate >= DateTime.UtcNow.Date);
            
            await Task.CompletedTask; // Placeholder to maintain async signature
        }
    }
}
