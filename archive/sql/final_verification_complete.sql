-- FINAL COMPLETE VERIFICATION
-- Show ALL 20 roles with their permission counts

SELECT 
    r.name,
    COALESCE(COUNT(rp."PermissionId"), 0) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp."RoleId"
WHERE r.tenant_id = '00000000-0000-0000-0000-000000000000'
GROUP BY r.id, r.name
ORDER BY r.name;

-- Total mappings
SELECT COUNT(*) as total_role_permission_mappings
FROM role_permissions rp
JOIN roles r ON rp."RoleId" = r.id
WHERE r.tenant_id = '00000000-0000-0000-0000-000000000000';

-- Expected vs Actual
SELECT 
    'Expected' as type,
    237 + 223 + 15 + 12 + 10 + 8 + 8 + 6 + 8 + 10 + 12 + 10 + 6 + 4 + 12 + 8 + 8 + 8 + 20 + 15 as total
UNION ALL
SELECT 
    'Actual' as type,
    COUNT(*) as total
FROM role_permissions rp
JOIN roles r ON rp."RoleId" = r.id
WHERE r.tenant_id = '00000000-0000-0000-0000-000000000000';
