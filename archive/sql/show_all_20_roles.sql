-- Show ALL 20 roles including those with 0 mappings
SELECT 
    r.name,
    r."NormalizedName",
    COALESCE(COUNT(rp."PermissionId"), 0) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp."RoleId"
WHERE r.tenant_id = '00000000-0000-0000-0000-000000000000'
GROUP BY r.id, r.name, r."NormalizedName"
ORDER BY permission_count DESC, r.name;
