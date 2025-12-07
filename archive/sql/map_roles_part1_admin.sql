-- ============================================
-- Role-Permission Mappings - Part 1
-- System Admin + Hospital Administrator
-- ============================================

-- 1. SYSTEM ADMIN - Gets ALL 237 new permissions
INSERT INTO role_permissions (id, role_id, permission_id, granted_at, granted_by, created_at)
SELECT 
    gen_random_uuid(),
    r.id as role_id,
    p.id as permission_id,
    NOW() as granted_at,
    NULL as granted_by,
    NOW() as created_at
FROM roles r
CROSS JOIN permissions p
WHERE r."NormalizedName" = 'SYSTEM ADMIN'
AND p."Module" IN (
    'patient_management', 'clinical_documentation', 'pharmacy', 
    'lab_diagnostics', 'radiology', 'ot_management', 'appointments', 
    'billing_revenue', 'inventory', 'hrm', 'vendor_procurement', 
    'bed_management', 'ambulance', 'document_sharing', 
    'system_settings', 'quality_assurance'
)
ON CONFLICT DO NOTHING;

-- 2. HOSPITAL ADMINISTRATOR - Gets most permissions (exclude system_settings)
INSERT INTO role_permissions (id, role_id, permission_id, granted_at, granted_by, created_at)
SELECT 
    gen_random_uuid(),
    r.id,
    p.id,
    NOW(),
    NULL,
    NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r."NormalizedName" = 'HOSPITAL ADMINISTRATOR'
AND p."Module" IN (
    'patient_management', 'clinical_documentation', 'pharmacy', 
    'lab_diagnostics', 'radiology', 'ot_management', 'appointments', 
    'billing_revenue', 'inventory', 'hrm', 'vendor_procurement', 
    'bed_management', 'ambulance', 'document_sharing', 'quality_assurance'
)
ON CONFLICT DO NOTHING;

-- Verify System Admin
SELECT 
    r.name as role_name,
    COUNT(rp.id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
WHERE r."NormalizedName" = 'SYSTEM ADMIN'
GROUP BY r.name;

-- Verify Hospital Administrator
SELECT 
    r.name as role_name,
    COUNT(rp.id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
WHERE r."NormalizedName" = 'HOSPITAL ADMINISTRATOR'
GROUP BY r.name;
