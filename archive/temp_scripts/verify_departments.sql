-- Verify departments exist for test tenant
SELECT 
    id,
    department_code,
    department_name,
    department_type,
    branch_id,
    tenant_id,
    status,
    deleted_at,
    created_at
FROM department
WHERE tenant_id = '11111111-1111-1111-1111-111111111111'
AND deleted_at IS NULL
ORDER BY department_name;

-- Count departments
SELECT COUNT(*) as total_departments
FROM department
WHERE tenant_id = '11111111-1111-1111-1111-111111111111'
AND deleted_at IS NULL;
