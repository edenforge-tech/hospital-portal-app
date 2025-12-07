-- Check for duplicate permission codes
SELECT "Code", COUNT(*) as duplicate_count
FROM permissions
GROUP BY "Code"
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, "Code";

-- Check for duplicate Code + TenantId combinations
SELECT "Code", "TenantId", COUNT(*) as duplicate_count
FROM permissions
GROUP BY "Code", "TenantId"
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, "Code";

-- Get total unique codes
SELECT COUNT(DISTINCT "Code") as unique_permission_codes FROM permissions;

-- Get total rows
SELECT COUNT(*) as total_permission_rows FROM permissions;

-- Show all modules with counts
SELECT "Module", COUNT(*) as count
FROM permissions
GROUP BY "Module"
ORDER BY "Module";
