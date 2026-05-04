using AuthService.Context;
using AuthService.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AuthService.Services
{
    /// <summary>
    /// Validates whether a master value can be deleted by checking if any entity in the database
    /// still references it.  The check is performed by entity type against a known set of
    /// reference columns — so we can give the admin a meaningful "X records still use this value"
    /// error instead of a generic FK constraint failure.
    /// </summary>
    public class MasterDataValidationService : IMasterDataValidationService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<MasterDataValidationService> _logger;

        public MasterDataValidationService(AppDbContext context, ILogger<MasterDataValidationService> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <inheritdoc />
        public async Task<DeleteBlockReason?> CanDeleteAsync(Guid tenantId, Guid masterValueId, string entityType, string label)
        {
            // System-locked values can never be deleted
            var value = await _context.MasterValues
                .FirstOrDefaultAsync(v => v.Id == masterValueId && v.TenantId == tenantId);

            if (value is null) return null; // Not found → let controller return 404

            if (value.IsSystemLocked)
            {
                return new DeleteBlockReason
                {
                    Reason = "system_locked",
                    Message = $"\"{label}\" is a system-locked value and cannot be deleted.",
                    UsageCount = 0
                };
            }

            // Reference checks per entity type
            var usageCount = await GetUsageCountAsync(tenantId, masterValueId, entityType, label);
            if (usageCount > 0)
            {
                return new DeleteBlockReason
                {
                    Reason = "in_use",
                    Message = $"\"{label}\" is used by {usageCount} record(s) and cannot be deleted. Disable it instead.",
                    UsageCount = usageCount
                };
            }

            return null;
        }

        // ─── Usage counting per entity type ──────────────────────────────────

        private async Task<int> GetUsageCountAsync(Guid tenantId, Guid masterValueId, string entityType, string label)
        {
            // Get the code/label of the value (we store label in most tables, not UUID)
            var masterValue = await _context.MasterValues
                .FirstOrDefaultAsync(v => v.Id == masterValueId && v.TenantId == tenantId);
            if (masterValue is null) return 0;

            var valueLabel = masterValue.Label;

            try
            {
                return entityType switch
                {
                    "patient.blood_group" => await _context.Patients
                        .CountAsync(p => p.TenantId == tenantId && p.BloodGroup == valueLabel && p.DeletedAt == null),

                    "patient.gender" => await _context.Patients
                        .CountAsync(p => p.TenantId == tenantId && p.Gender == valueLabel && p.DeletedAt == null),

                    "patient.marital_status" => await _context.Patients
                        .CountAsync(p => p.TenantId == tenantId && p.MaritalStatus == valueLabel && p.DeletedAt == null),

                    "appointment.type" => await _context.Appointments
                        .CountAsync(a => a.TenantId == tenantId && a.AppointmentType == valueLabel && a.DeletedAt == null),

                    // For entity types without a direct FK mapping, allow delete
                    _ => 0
                };
            }
            catch (Exception ex)
            {
                // If schema differs or DbSet doesn't exist, log and allow delete
                _logger.LogWarning(ex,
                    "MasterDataValidation: could not check usage for entity type {EntityType}, defaulting to 0",
                    entityType);
                return 0;
            }
        }
    }

    /// <summary>Reason a master value cannot be deleted.</summary>
    public class DeleteBlockReason
    {
        public string Reason { get; set; } = string.Empty;  // "system_locked" | "in_use"
        public string Message { get; set; } = string.Empty;
        public int UsageCount { get; set; }
    }
}
