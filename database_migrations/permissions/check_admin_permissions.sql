-- Check what permissions Admin role has
SELECT ar.name as role_name, p."Code" as permission_code 
FROM app_roles ar 
JOIN role_permission rp ON ar.id = rp."RoleId" 
JOIN permissions p ON rp."PermissionId" = p.id 
WHERE ar."TenantId" = '155fe198-6ae5-4a01-9254-ead5b427247e' 
  AND ar.name = 'Admin' 
ORDER BY p."Code";
