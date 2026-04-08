-- Check if ot.schedules.view permission exists
SELECT id, "Name", "Code", "Module" FROM permissions WHERE "Name" = 'ot.schedules.view';

-- Check role_permission with correct column names
SELECT rp."RoleId", rp."PermissionId"
FROM role_permission rp
JOIN permissions p ON p.id = rp."PermissionId"
WHERE p."Name" = 'ot.schedules.view'
LIMIT 10;

-- Check app_roles
SELECT id, name FROM app_roles WHERE name ILIKE '%admin%' OR name ILIKE '%sysadmin%' OR name ILIKE '%doctor%' LIMIT 10;

-- Check app_user_roles for first few users
SELECT user_id, role_id FROM app_user_roles LIMIT 10;
