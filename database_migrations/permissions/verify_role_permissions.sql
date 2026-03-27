-- Check which roles have no permissions
SELECT ar."RoleCode", ar."RoleType", ar."Description"
FROM app_roles ar
LEFT JOIN role_permission rp ON ar.id = rp."RoleId"
WHERE ar."IsActive" = true
  AND rp.id IS NULL
ORDER BY ar."RoleCode";

-- Count permissions per role
SELECT ar."RoleCode", ar."RoleType", COUNT(rp.id) as permission_count
FROM app_roles ar
LEFT JOIN role_permission rp ON ar.id = rp."RoleId"
WHERE ar."IsActive" = true
GROUP BY ar.id, ar."RoleCode", ar."RoleType"
ORDER BY permission_count DESC, ar."RoleCode";
