-- Fix missing mappings for 3 roles

-- 1. System Administrator (ALL 237 permissions) - Seems to be missing
-- Let me check if it exists first
SELECT COUNT(rp.*) as system_admin_mappings
FROM roles r
JOIN role_permissions rp ON r.id = rp."RoleId"
WHERE r."NormalizedName" = 'SYSTEM ADMINISTRATOR'
    AND r.tenant_id = '00000000-0000-0000-0000-000000000000';

-- If 0, add them:
INSERT INTO role_permissions (id, "RoleId", "PermissionId", "CreatedAt", tenant_id, status)
SELECT 
    gen_random_uuid(),
    r.id,
    p.id,
    NOW(),
    '00000000-0000-0000-0000-000000000000',
    'active'
FROM roles r
CROSS JOIN permissions p
WHERE r."NormalizedName" = 'SYSTEM ADMINISTRATOR'
    AND r.tenant_id = '00000000-0000-0000-0000-000000000000'
    AND p."Module" IN (
        'patient_management', 'clinical_documentation', 'pharmacy', 
        'lab_diagnostics', 'radiology', 'ot_management', 'appointments', 
        'billing_revenue', 'inventory', 'hrm', 'vendor_procurement', 
        'bed_management', 'ambulance', 'document_sharing', 
        'system_settings', 'quality_assurance'
    )
    AND NOT EXISTS (
        SELECT 1 FROM role_permissions rp2 
        WHERE rp2."RoleId" = r.id AND rp2."PermissionId" = p.id
    );

-- 2. Front Desk Officer (6 permissions)
INSERT INTO role_permissions (id, "RoleId", "PermissionId", "CreatedAt", tenant_id, status)
SELECT 
    gen_random_uuid(),
    r.id,
    p.id,
    NOW(),
    '00000000-0000-0000-0000-000000000000',
    'active'
FROM roles r
CROSS JOIN permissions p
WHERE r."NormalizedName" = 'FRONT DESK OFFICER'
    AND r.tenant_id = '00000000-0000-0000-0000-000000000000'
    AND p."Code" IN (
        'patient_management.patient_record.read',
        'patient_management.patient_record.create',
        'appointments.appointment_schedule.read',
        'appointments.appointment_schedule.create',
        'appointments.appointment_schedule.update',
        'appointments.appointment_schedule.cancel'
    )
    AND NOT EXISTS (
        SELECT 1 FROM role_permissions rp2 
        WHERE rp2."RoleId" = r.id AND rp2."PermissionId" = p.id
    );

-- 3. Medical Records Officer (8 permissions)
INSERT INTO role_permissions (id, "RoleId", "PermissionId", "CreatedAt", tenant_id, status)
SELECT 
    gen_random_uuid(),
    r.id,
    p.id,
    NOW(),
    '00000000-0000-0000-0000-000000000000',
    'active'
FROM roles r
CROSS JOIN permissions p
WHERE r."NormalizedName" = 'MEDICAL RECORDS OFFICER'
    AND r.tenant_id = '00000000-0000-0000-0000-000000000000'
    AND p."Code" IN (
        'patient_management.patient_record.read',
        'patient_management.patient_record.update',
        'clinical_documentation.medical_history.read',
        'clinical_documentation.medical_history.update',
        'document_sharing.document.read',
        'document_sharing.document.create',
        'document_sharing.document.update',
        'document_sharing.shared_access.manage'
    )
    AND NOT EXISTS (
        SELECT 1 FROM role_permissions rp2 
        WHERE rp2."RoleId" = r.id AND rp2."PermissionId" = p.id
    );

-- Final verification
SELECT 
    r.name,
    COUNT(rp."PermissionId") as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp."RoleId"
WHERE r.tenant_id = '00000000-0000-0000-0000-000000000000'
GROUP BY r.id, r.name
ORDER BY permission_count DESC, r.name;

-- Total count
SELECT COUNT(*) as total_role_permission_mappings
FROM role_permissions rp
JOIN roles r ON rp."RoleId" = r.id
WHERE r.tenant_id = '00000000-0000-0000-0000-000000000000';
