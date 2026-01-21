-- Query to check all departments in the database
SELECT 
    id,
    department_code,
    department_name,
    department_type,
    status,
    branch_id,
    tenant_id,
    created_at,
    deleted_at
FROM department
WHERE tenant_id = '11111111-1111-1111-1111-111111111111'
ORDER BY department_name;

-- Count by status
SELECT 
    status,
    COUNT(*) as count
FROM department
WHERE tenant_id = '11111111-1111-1111-1111-111111111111'
GROUP BY status;

-- Check if there are departments with deleted_at set
SELECT 
    COUNT(*) as active_departments
FROM department
WHERE tenant_id = '11111111-1111-1111-1111-111111111111'
AND deleted_at IS NULL;

SELECT 
    COUNT(*) as deleted_departments
FROM department
WHERE tenant_id = '11111111-1111-1111-1111-111111111111'
AND deleted_at IS NOT NULL;
