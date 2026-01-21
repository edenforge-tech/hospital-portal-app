-- Check existing permissions
SELECT "Code", "Name", "Module" 
FROM permissions 
WHERE "Module" = 'Dashboard' OR "Code" LIKE 'dashboard%' 
ORDER BY "Code"
LIMIT 20;
