-- Final Permission Status Report
-- After Duplicate Removal
-- Date: 2025-11-10

-- ============================================
-- SUMMARY
-- ============================================
SELECT 
    COUNT(*) as total_permissions,
    COUNT(DISTINCT "Code") as unique_codes,
    COUNT(*) - COUNT(DISTINCT "Code") as duplicates
FROM permissions;

-- ============================================
-- NEW RBAC MODULES (Required 16 modules)
-- ============================================
SELECT 
    "Module",
    COUNT(*) as permission_count
FROM permissions
WHERE "Module" IN (
    'patient_management', 'clinical_documentation', 'pharmacy', 
    'lab_diagnostics', 'radiology', 'ot_management', 'appointments', 
    'billing_revenue', 'inventory', 'hrm', 'vendor_procurement', 
    'bed_management', 'ambulance', 'document_sharing', 
    'system_settings', 'quality_assurance'
)
GROUP BY "Module"
ORDER BY "Module";

-- ============================================
-- OLD MODULES (Legacy - Mixed Case)
-- ============================================
SELECT 
    "Module",
    COUNT(*) as permission_count
FROM permissions
WHERE "Module" NOT IN (
    'patient_management', 'clinical_documentation', 'pharmacy', 
    'lab_diagnostics', 'radiology', 'ot_management', 'appointments', 
    'billing_revenue', 'inventory', 'hrm', 'vendor_procurement', 
    'bed_management', 'ambulance', 'document_sharing', 
    'system_settings', 'quality_assurance'
)
GROUP BY "Module"
ORDER BY "Module";

-- ============================================
-- VERIFICATION: Check for remaining duplicates
-- ============================================
SELECT "Code", COUNT(*) as count
FROM permissions
GROUP BY "Code"
HAVING COUNT(*) > 1;

-- ============================================
-- MODULE SUMMARY
-- ============================================
SELECT 
    'NEW RBAC MODULES' as category,
    COUNT(DISTINCT "Module") as module_count,
    COUNT(*) as permission_count
FROM permissions
WHERE "Module" IN (
    'patient_management', 'clinical_documentation', 'pharmacy', 
    'lab_diagnostics', 'radiology', 'ot_management', 'appointments', 
    'billing_revenue', 'inventory', 'hrm', 'vendor_procurement', 
    'bed_management', 'ambulance', 'document_sharing', 
    'system_settings', 'quality_assurance'
)
UNION ALL
SELECT 
    'OLD/LEGACY MODULES' as category,
    COUNT(DISTINCT "Module") as module_count,
    COUNT(*) as permission_count
FROM permissions
WHERE "Module" NOT IN (
    'patient_management', 'clinical_documentation', 'pharmacy', 
    'lab_diagnostics', 'radiology', 'ot_management', 'appointments', 
    'billing_revenue', 'inventory', 'hrm', 'vendor_procurement', 
    'bed_management', 'ambulance', 'document_sharing', 
    'system_settings', 'quality_assurance'
);
