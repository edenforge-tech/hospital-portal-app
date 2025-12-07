-- ============================================
-- FINAL PERMISSIONS STATUS REPORT
-- ============================================

-- 1. Total counts
SELECT 
    'CURRENT STATUS' as report_section,
    COUNT(*) as total_rows,
    COUNT(DISTINCT LOWER("Code")) as unique_codes_case_insensitive,
    COUNT(DISTINCT "Code") as unique_codes_exact
FROM permissions;

-- 2. Check for patient_management module
SELECT 
    'PATIENT MANAGEMENT CHECK' as report_section,
    COUNT(*) as total,
    COUNT(DISTINCT LOWER("Code")) as unique_codes
FROM permissions 
WHERE LOWER("Module") = 'patient_management';

-- 3. List all patient_management permissions
SELECT 
    "Code", 
    "Name", 
    scope as scope_level
FROM permissions 
WHERE LOWER("Module") = 'patient_management'
ORDER BY "Code";

-- 4. Missing modules from required 16
WITH required_modules AS (
    SELECT unnest(ARRAY[
        'patient_management',
        'clinical_documentation',
        'pharmacy',
        'lab_diagnostics',
        'radiology',
        'ot_management',
        'appointments',
        'billing_revenue',
        'inventory',
        'hrm',
        'vendor_procurement',
        'bed_management',
        'ambulance',
        'document_sharing',
        'system_settings',
        'quality_assurance'
    ]) as required_module
),
existing_modules AS (
    SELECT DISTINCT LOWER("Module") as existing_module
    FROM permissions
    WHERE "Module" IS NOT NULL
)
SELECT 
    'MISSING MODULES' as report_section,
    rm.required_module
FROM required_modules rm
LEFT JOIN existing_modules em ON rm.required_module = em.existing_module
WHERE em.existing_module IS NULL;
