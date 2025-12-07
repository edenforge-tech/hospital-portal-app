-- Verify new permissions count
SELECT COUNT(*) as new_permissions 
FROM permissions 
WHERE "Module" IN (
    'patient_management', 'clinical_documentation', 'pharmacy', 
    'lab_diagnostics', 'radiology', 'ot_management', 'appointments', 
    'billing_revenue', 'inventory', 'hrm', 'vendor_procurement', 
    'bed_management', 'ambulance', 'document_sharing', 
    'system_settings', 'quality_assurance'
);

-- Total permissions
SELECT COUNT(*) as total_permissions FROM permissions;

-- Breakdown by module
SELECT "Module", COUNT(*) as count
FROM permissions
GROUP BY "Module"
ORDER BY "Module";
