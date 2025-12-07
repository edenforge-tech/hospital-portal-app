-- ============================================
-- ROLE-PERMISSION MAPPINGS - UPDATED FOR CURRENT PERMISSIONS
-- Map existing permissions to appropriate roles
-- ============================================

-- Disable audit triggers temporarily
ALTER TABLE role_permission DISABLE TRIGGER audit_role_permission_changes;

-- Clear existing mappings first (in case of re-run)
DELETE FROM role_permission;

-- Get role and permission IDs for mapping
-- Admin role gets ALL permissions
INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
SELECT
    gen_random_uuid(),
    r.id,
    p.id,
    NOW()
FROM app_roles r
CROSS JOIN permissions p
WHERE r.name = 'Admin';

-- Consultant gets all permissions (like admin but different role)
INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
SELECT
    gen_random_uuid(),
    r.id,
    p.id,
    NOW()
FROM app_roles r
CROSS JOIN permissions p
WHERE r.name = 'Consultant';

-- Senior Doctor gets all permissions
INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
SELECT
    gen_random_uuid(),
    r.id,
    p.id,
    NOW()
FROM app_roles r
CROSS JOIN permissions p
WHERE r.name = 'Senior Doctor';

-- Doctor role gets patient and clinical permissions
INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
SELECT
    gen_random_uuid(),
    r.id,
    p.id,
    NOW()
FROM app_roles r
CROSS JOIN permissions p
WHERE r.name = 'Doctor'
AND p."Module" IN ('Patient Management', 'Clinical Assessment');

-- Nurse role gets patient and clinical permissions
INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
SELECT
    gen_random_uuid(),
    r.id,
    p.id,
    NOW()
FROM app_roles r
CROSS JOIN permissions p
WHERE r.name = 'Nurse'
AND p."Module" IN ('Patient Management', 'Clinical Assessment');

-- Nurse Manager gets patient and clinical permissions
INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
SELECT
    gen_random_uuid(),
    r.id,
    p.id,
    NOW()
FROM app_roles r
CROSS JOIN permissions p
WHERE r.name = 'Nurse Manager'
AND p."Module" IN ('Patient Management', 'Clinical Assessment');

-- Pharmacist role gets patient permissions (for now)
INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
SELECT
    gen_random_uuid(),
    r.id,
    p.id,
    NOW()
FROM app_roles r
CROSS JOIN permissions p
WHERE r.name = 'Pharmacist'
AND p."Module" IN ('Patient Management');

-- Receptionist role gets appointment permissions
INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
SELECT
    gen_random_uuid(),
    r.id,
    p.id,
    NOW()
FROM app_roles r
CROSS JOIN permissions p
WHERE r.name = 'Receptionist'
AND p."Module" IN ('Appointments');

-- IT Administrator gets admin permissions
INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
SELECT
    gen_random_uuid(),
    r.id,
    p.id,
    NOW()
FROM app_roles r
CROSS JOIN permissions p
WHERE r.name = 'IT Administrator'
AND p."Module" IN ('Administration');

-- Lab Technician gets patient permissions (for now)
INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
SELECT
    gen_random_uuid(),
    r.id,
    p.id,
    NOW()
FROM app_roles r
CROSS JOIN permissions p
WHERE r.name = 'Lab Technician'
AND p."Module" IN ('Patient Management');

-- Radiologist gets patient permissions (for now)
INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
SELECT
    gen_random_uuid(),
    r.id,
    p.id,
    NOW()
FROM app_roles r
CROSS JOIN permissions p
WHERE r.name = 'Radiologist'
AND p."Module" IN ('Patient Management');

-- Re-enable audit triggers
ALTER TABLE role_permission ENABLE TRIGGER audit_role_permission_changes;

-- Verification queries
SELECT 'Total role-permission mappings:' as info, COUNT(*) as count FROM role_permission;

SELECT
    r.name as role_name,
    COUNT(rp."PermissionId") as permission_count
FROM app_roles r
LEFT JOIN role_permission rp ON r.id = rp."RoleId"
GROUP BY r.id, r.name
ORDER BY r.name;