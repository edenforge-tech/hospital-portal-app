-- Create remaining appointment permissions
INSERT INTO permissions (id, "TenantId", "Code", "Name", "Description", "Module", "Action", "IsSystemPermission", "IsActive", "CreatedAt", "UpdatedAt")
VALUES 
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111'::uuid, 'appointment.create', 'Create Appointments', 'Permission to create appointment records', 'Appointments', 'create', true, true, NOW(), NOW()),
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111'::uuid, 'appointment.update', 'Update Appointments', 'Permission to update appointment records', 'Appointments', 'update', true, true, NOW(), NOW()),
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111'::uuid, 'appointment.cancel', 'Cancel Appointments', 'Permission to cancel appointment records', 'Appointments', 'cancel', true, true, NOW(), NOW()),
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111'::uuid, 'appointment.delete', 'Delete Appointments', 'Permission to delete appointment records', 'Appointments', 'delete', true, true, NOW(), NOW())
ON CONFLICT ("TenantId", "Code") DO UPDATE SET "IsActive" = true
RETURNING "Code", "Name";

-- Assign all appointment permissions to admin role
WITH admin_role AS (
    SELECT id FROM app_roles WHERE LOWER(name) IN ('admin', 'system administrator') LIMIT 1
),
appointment_perms AS (
    SELECT id FROM permissions WHERE "Code" LIKE 'appointment.%'
)
INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
SELECT 
    gen_random_uuid(),
    admin_role.id,
    appointment_perms.id,
    NOW()
FROM admin_role, appointment_perms
ON CONFLICT DO NOTHING;

-- Verify permissions assigned
SELECT 
    r.name as role_name,
    p."Code" as permission_code,
    p."Name" as permission_name
FROM app_roles r
JOIN role_permission rp ON r.id = rp."RoleId"
JOIN permissions p ON rp."PermissionId" = p.id
WHERE p."Code" LIKE 'appointment.%'
ORDER BY p."Code";
