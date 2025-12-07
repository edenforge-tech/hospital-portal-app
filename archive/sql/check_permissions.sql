-- Get permission counts by module
SELECT 
    "Module", 
    COUNT(*) as permission_count 
FROM permissions 
WHERE "Module" IS NOT NULL 
GROUP BY "Module" 
ORDER BY permission_count DESC;

-- Get sample permissions
SELECT 
    "Code", 
    "Name", 
    "Module", 
    "Action", 
    "ResourceType"
FROM permissions 
LIMIT 10;
