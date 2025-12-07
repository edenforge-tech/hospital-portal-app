-- Check which roles have 0 or missing mappings
SELECT 
    r.name,
    r."NormalizedName",
    COUNT(rp."PermissionId") as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp."RoleId"
WHERE r.tenant_id = '00000000-0000-0000-0000-000000000000'
GROUP BY r.id, r.name, r."NormalizedName"
ORDER BY permission_count ASC, r.name;

-- Check if Front Desk Officer, Medical Records Officer, Radiologist, and System Administrator are present
SELECT 
    name,
    "NormalizedName"
FROM roles
WHERE tenant_id = '00000000-0000-0000-0000-000000000000'
    AND "NormalizedName" IN (
        'FRONT DESK OFFICER',
        'MEDICAL RECORDS OFFICER',
        'RADIOLOGIST',
        'SYSTEM ADMINISTRATOR'
    )
ORDER BY name;
