-- Check if admin has patient.view permission
SELECT 
    r.name as role_name, 
    p."Code" as permission_code
FROM app_user_roles ur 
JOIN app_roles r ON ur.role_id = r.id 
JOIN role_permission rp ON r.id = rp."RoleId"
JOIN permissions p ON rp."PermissionId" = p.id 
WHERE ur.user_id = 'dddddddd-dddd-dddd-dddd-dddddddddddd' 
    AND p."Code" = 'patient.view';
