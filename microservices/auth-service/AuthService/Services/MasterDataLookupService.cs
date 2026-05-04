using AuthService.Context;
using AuthService.Models.MasterData;
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
    /// Feature-flag-aware lookup wrapper for master data.
    /// When a group flag is ON → reads from master.master_value.
    /// When OFF or on error → falls back to the hardcoded static list.
    /// 
    /// Usage pattern for any consumer:
    ///   var depts = await _lookup.GetLabelsAsync(tenantId, "system.department", FallbackDepartments);
    /// </summary>
    public class MasterDataLookupService : IMasterDataLookupService
    {
        private readonly AppDbContext _context;
        private readonly IFeatureFlagService _flags;
        private readonly ILogger<MasterDataLookupService> _logger;

        public MasterDataLookupService(
            AppDbContext context,
            IFeatureFlagService flags,
            ILogger<MasterDataLookupService> logger)
        {
            _context = context;
            _flags = flags;
            _logger = logger;
        }

        /// <summary>
        /// Returns a list of active labels for the given entity type.
        /// Falls back to <paramref name="fallback"/> if master data flag is off or query fails.
        /// </summary>
        public async Task<IReadOnlyList<string>> GetLabelsAsync(
            Guid tenantId,
            string entityType,
            IReadOnlyList<string> fallback)
        {
            var groupKey = EntityTypeGroupMap.TryGetValue(entityType, out var g) ? g : null;
            if (groupKey == null || !_flags.IsMasterDataGroupEnabled(groupKey))
                return fallback;

            try
            {
                var labels = await _context.MasterValues
                    .Where(v => v.TenantId == tenantId
                             && v.EntityType == entityType
                             && v.IsActive)
                    .OrderBy(v => v.SortOrder)
                    .ThenBy(v => v.Label)
                    .Select(v => v.Label)
                    .ToListAsync();

                if (labels.Count == 0)
                {
                    _logger.LogWarning(
                        "MasterDataLookup: no active values for {EntityType} (tenant {TenantId}), using fallback",
                        entityType, tenantId);
                    return fallback;
                }

                return labels;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "MasterDataLookup: error fetching {EntityType}, using fallback", entityType);
                return fallback;
            }
        }

        /// <summary>
        /// Returns code→label dictionary for the given entity type.
        /// Useful for dropdowns that need both a stored code and a display label.
        /// </summary>
        public async Task<IReadOnlyDictionary<string, string>> GetCodeLabelMapAsync(
            Guid tenantId,
            string entityType,
            IReadOnlyDictionary<string, string> fallback)
        {
            var groupKey = EntityTypeGroupMap.TryGetValue(entityType, out var g) ? g : null;
            if (groupKey == null || !_flags.IsMasterDataGroupEnabled(groupKey))
                return fallback;

            try
            {
                var map = await _context.MasterValues
                    .Where(v => v.TenantId == tenantId
                             && v.EntityType == entityType
                             && v.IsActive)
                    .OrderBy(v => v.SortOrder)
                    .ThenBy(v => v.Label)
                    .ToDictionaryAsync(v => v.Code, v => v.Label);

                return map.Count > 0 ? map : fallback;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "MasterDataLookup: error fetching code-label map for {EntityType}, using fallback", entityType);
                return fallback;
            }
        }

        /// <summary>
        /// Returns full MasterValue objects for the given entity type (for rich UIs).
        /// </summary>
        public async Task<IReadOnlyList<MasterValue>> GetValuesAsync(
            Guid tenantId,
            string entityType,
            IReadOnlyList<string>? labelFallback = null)
        {
            var groupKey = EntityTypeGroupMap.TryGetValue(entityType, out var g) ? g : null;
            if (groupKey == null || !_flags.IsMasterDataGroupEnabled(groupKey))
                return [];

            try
            {
                return await _context.MasterValues
                    .Where(v => v.TenantId == tenantId
                             && v.EntityType == entityType
                             && v.IsActive)
                    .OrderBy(v => v.SortOrder)
                    .ThenBy(v => v.Label)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "MasterDataLookup: error fetching values for {EntityType}", entityType);
                return [];
            }
        }

        // ─── Entity type → group key mapping ─────────────────────────────────

        private static readonly Dictionary<string, string> EntityTypeGroupMap = new(StringComparer.OrdinalIgnoreCase)
        {
            // Patient Setup
            { "patient.title",          "PatientSetup" },
            { "patient.blood_group",    "PatientSetup" },
            { "patient.type",           "PatientSetup" },
            { "patient.gender",         "PatientSetup" },
            { "patient.marital_status", "PatientSetup" },
            { "patient.religion",       "PatientSetup" },
            { "patient.occupation",     "PatientSetup" },
            { "patient.id_proof_type",  "PatientSetup" },
            { "patient.relationship",   "PatientSetup" },
            { "patient.nationality",    "PatientSetup" },

            // Clinical
            { "clinical.surgery_type",          "Clinical" },
            { "clinical.anesthesia_type",        "Clinical" },
            { "clinical.surgical_procedure",     "Clinical" },
            { "clinical.intraop_finding",        "Clinical" },
            { "clinical.intraop_complication",   "Clinical" },
            { "clinical.anesthesia_technique",   "Clinical" },
            { "clinical.iol_catalog",            "Clinical" },
            { "clinical.postop_checklist_item",  "Clinical" },
            { "clinical.preop_clearance_type",   "Clinical" },
            { "clinical.eye_notation",           "Clinical" },
            { "clinical.scan_type",              "Clinical" },

            // Appointments
            { "appointment.type",              "Appointments" },
            { "appointment.consultation_type", "Appointments" },
            { "appointment.priority",          "Appointments" },
            { "appointment.cancellation_reason","Appointments" },

            // Counsellor
            { "counsellor.session_type",      "Counsellor" },
            { "counsellor.surgery_package",   "Counsellor" },
            { "counsellor.callback_type",     "Counsellor" },
            { "counsellor.reminder_type",     "Counsellor" },
            { "counsellor.comm_channel",      "Counsellor" },

            // Billing & Finance
            { "billing.payment_mode",    "BillingFinance" },
            { "billing.bill_item_type",  "BillingFinance" },
            { "billing.transaction_type","BillingFinance" },

            // Insurance
            { "insurance.provider",     "Insurance" },
            { "insurance.tpa_provider", "Insurance" },
            { "insurance.govt_scheme",  "Insurance" },
            { "insurance.type",         "Insurance" },

            // Inventory
            { "inventory.item_type",         "Inventory" },
            { "inventory.uom",               "Inventory" },
            { "inventory.purchase_category", "Inventory" },
            { "inventory.vendor_category",   "Inventory" },
            { "inventory.gst_rate",          "Inventory" },
            { "inventory.storage_condition", "Inventory" },
            { "inventory.payment_term",      "Inventory" },

            // Pharmacy
            { "pharmacy.drug_form",       "Pharmacy" },
            { "pharmacy.drug_route",      "Pharmacy" },
            { "pharmacy.dosage_frequency","Pharmacy" },
            { "pharmacy.drug_schedule",   "Pharmacy" },

            // Lab & Diagnostics
            { "lab.specimen_type",       "LabDiagnostics" },
            { "lab.imaging_modality",    "LabDiagnostics" },
            { "lab.ep_type",             "LabDiagnostics" },

            // Ward & IP
            { "ward.ward_type",      "WardIp" },
            { "ward.bed_type",       "WardIp" },
            { "ward.admission_type", "WardIp" },

            // HR & Staff
            { "hr.employment_type",    "HrStaff" },
            { "hr.qualification_type", "HrStaff" },
            { "hr.leave_type",         "HrStaff" },
            { "hr.shift_type",         "HrStaff" },
            { "hr.performance_rating", "HrStaff" },
            { "hr.credential_type",    "HrStaff" },

            // System
            { "system.department",        "System" },
            { "system.timezone",          "System" },
            { "system.currency",          "System" },
            { "system.language",          "System" },
            { "system.checklist_default", "System" },
        };
    }
}
