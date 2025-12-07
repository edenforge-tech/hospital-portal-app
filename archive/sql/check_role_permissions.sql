-- Check role-permission mapping distribution
SELECT
    ar.name as role_name,
    COUNT(rp.id) as permission_count
FROM app_roles ar
LEFT JOIN role_permission rp ON ar.id = rp."RoleId"
GROUP BY ar.id, ar.name
ORDER BY permission_count DESC;

-- Check permissions by module
SELECT
    "Module",
    COUNT(*) as permissions_in_module
FROM permissions
GROUP BY "Module"
ORDER BY permissions_in_module DESC;

-- Check which roles have the most permissions
SELECT
    ar.name as role_name,
    COUNT(rp.id) as permission_count,
    ROUND(COUNT(rp.id)::numeric / 154 * 100, 1) as percentage_of_total
FROM app_roles ar
LEFT JOIN role_permission rp ON ar.id = rp."RoleId"
GROUP BY ar.id, ar.name
ORDER BY permission_count DESC;