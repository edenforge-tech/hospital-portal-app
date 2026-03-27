-- Check if admin@test.com has patient.view permission
SELECT 
    u.email,
    r.name as role_name,
    p."Code" as permission_code
FROM "AspNetUsers" u
JOIN "AspNetUserRoles" ur ON u."Id" = ur."UserId"
JOIN app_roles r ON ur."RoleId" = r.id
JOIN role_permission rp ON r.id = rp."RoleId"
JOIN permissions p ON rp."PermissionId" = p.id
WHERE u.email = 'admin@test.com'
    AND p."Code" = 'patient.view';
