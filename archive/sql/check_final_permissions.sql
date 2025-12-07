SELECT
    'Total Permissions' as metric, 154 as count
UNION ALL
SELECT
    'Total Role-Permission Mappings' as metric, COUNT(*) as count
FROM role_permission
UNION ALL
SELECT
    'Roles with Permissions' as metric, COUNT(DISTINCT "RoleId") as count
FROM role_permission
UNION ALL
SELECT
    'Average Permissions per Role' as metric, ROUND(AVG(permission_count), 1) as count
FROM (
    SELECT COUNT(rp.id) as permission_count
    FROM app_roles ar
    LEFT JOIN role_permission rp ON ar.id = rp."RoleId"
    GROUP BY ar.id
) as role_counts;