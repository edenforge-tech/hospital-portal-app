-- Check if Receptionist role has dashboard permissions
SELECT 
  r.name as role_name,
  p."Code" as permission_code,
  p."Name" as permission_name,
  p."IsActive" as is_active
FROM app_roles r
INNER JOIN role_permission rp ON r.id = rp."RoleId"
INNER JOIN permissions p ON rp."PermissionId" = p.id
WHERE r.name = 'Receptionist' 
  AND p."Code" LIKE 'dashboard%'
ORDER BY p."Code";
