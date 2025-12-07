-- Get exact count
SELECT COUNT(*) as total_roles
FROM roles
WHERE tenant_id = '00000000-0000-0000-0000-000000000000';

-- Show roles with 0-10 permissions (likely the missing ones)
SELECT 
    r.name,
    COALESCE(COUNT(rp."PermissionId"), 0) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp."RoleId"
WHERE r.tenant_id = '00000000-0000-0000-0000-000000000000'
GROUP BY r.id, r.name
HAVING COALESCE(COUNT(rp."PermissionId"), 0) <= 10
ORDER BY permission_count ASC, r.name;
