-- Check if branch and organization tables have data
SELECT 'Branch Count' AS info, COUNT(*) AS count FROM branch WHERE deleted_at IS NULL;
SELECT 'Organization Count' AS info, COUNT(*) AS count FROM organization WHERE deleted_at IS NULL;

-- Show sample branches
SELECT id, name, branch_code, city, status 
FROM branch 
WHERE deleted_at IS NULL 
LIMIT 5;

-- Show sample organizations
SELECT id, name, organization_code, status 
FROM organization 
WHERE deleted_at IS NULL 
LIMIT 5;
