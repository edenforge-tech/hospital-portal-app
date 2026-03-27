-- Add wildcard permission to Admin role
INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
SELECT 
    gen_random_uuid(),
    (SELECT id FROM app_roles WHERE "Name" = 'Admin' AND "TenantId" = '155fe198-6ae5-4a01-9254-ead5b427247e'),
    (SELECT id FROM permissions WHERE "Code" = '*'),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM role_permission rp
    WHERE rp."RoleId" = (SELECT id FROM app_roles WHERE "Name" = 'Admin' AND "TenantId" = '155fe198-6ae5-4a01-9254-ead5b427247e')
    AND rp."PermissionId" = (SELECT id FROM permissions WHERE "Code" = '*')
);

SELECT 'SUCCESS: Admin role now has wildcard (*) permission!' as result;
