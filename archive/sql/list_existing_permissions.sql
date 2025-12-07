-- Get list of all existing unique permission codes
SELECT DISTINCT 
    LOWER("Code") as permission_code,
    LOWER("Module") as module
FROM permissions 
WHERE "Code" IS NOT NULL
ORDER BY module, permission_code;
