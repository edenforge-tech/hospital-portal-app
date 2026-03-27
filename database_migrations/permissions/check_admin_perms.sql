-- Count appointment permissions assigned to admin role
SELECT 
    r.name as role,
    COUNT(rp.id) as appointment_perms
FROM app_roles r
LEFT JOIN role_permission rp ON r.id = rp."RoleId"
LEFT JOIN permissions p ON rp."PermissionId" = p.id
WHERE LOWER(r.name) IN ('admin', 'system administrator')
AND p."Code" LIKE 'appointment.%'
GROUP BY r.name;
