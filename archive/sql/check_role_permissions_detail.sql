SELECT
    ar.name as role_name,
    COUNT(rp.id) as permission_count,
    ROUND((COUNT(rp.id)::decimal / 154 * 100), 1) as percentage_of_total
FROM app_roles ar
LEFT JOIN role_permission rp ON ar.id = rp."RoleId"
GROUP BY ar.id, ar.name
ORDER BY permission_count DESC, ar.name;