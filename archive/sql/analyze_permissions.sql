-- Check for duplicate permissions
SELECT 
    "Code", 
    COUNT(*) as duplicate_count 
FROM permissions 
WHERE "Code" IS NOT NULL 
GROUP BY "Code" 
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC
LIMIT 20;

-- Get unique permission codes count
SELECT COUNT(DISTINCT "Code") as unique_permission_codes 
FROM permissions 
WHERE "Code" IS NOT NULL;

-- Get all unique modules (case-insensitive)
SELECT DISTINCT LOWER("Module") as module_lower, COUNT(*) as count
FROM permissions 
WHERE "Module" IS NOT NULL
GROUP BY LOWER("Module")
ORDER BY count DESC;
