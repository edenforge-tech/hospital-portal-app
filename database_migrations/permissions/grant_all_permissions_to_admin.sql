-- Add ALL missing permissions to Admin role
INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
SELECT 
    gen_random_uuid(),
    ar.id,
    p.id,
    NOW()
FROM app_roles ar
CROSS JOIN permissions p
WHERE ar.tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
  AND ar.name = 'Admin'
  AND NOT EXISTS (
    SELECT 1 FROM role_permission rp
    WHERE rp."RoleId" = ar.id AND rp."PermissionId" = p.id
  );

-- Show all permissions now assigned to Admin
SELECT COUNT(*) as total_permissions
FROM app_roles ar 
JOIN role_permission rp ON ar.id = rp."RoleId" 
WHERE ar.tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e' 
  AND ar.name = 'Admin';
