-- Check all system roles to understand the naming pattern
SELECT 
    COUNT(*) as total_system_roles
FROM roles 
WHERE "IsSystemRole" = true;

-- Get all unique role "base names" (before the dash)
SELECT DISTINCT
    SUBSTRING(name FROM 1 FOR POSITION(' -' IN name) - 1) as base_role_name,
    COUNT(*) as count_per_base
FROM roles
WHERE "IsSystemRole" = true 
    AND POSITION(' -' IN name) > 0
GROUP BY SUBSTRING(name FROM 1 FOR POSITION(' -' IN name) - 1)
ORDER BY base_role_name;

-- Check if there are any roles WITHOUT tenant suffix
SELECT 
    name,
    "NormalizedName"
FROM roles
WHERE "IsSystemRole" = true
    AND name NOT LIKE '% - %'
ORDER BY name;
