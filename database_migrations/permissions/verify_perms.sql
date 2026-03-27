SELECT 
    u.email,
    r.name as role_name,
    p."Code" as permission_code,
    p."Name" as permission_name
FROM users u
JOIN app_user_roles ur ON u.id::text = ur.user_id::text
JOIN app_roles r ON ur.role_id::text = r.id::text
JOIN role_permission rp ON r.id = rp."RoleId"
JOIN permissions p ON rp."PermissionId" = p.id
WHERE u.email = 'admin@test.com'
AND p."Code" LIKE 'appointment.%'
ORDER BY p."Code";
