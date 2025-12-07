-- Check which parent departments exist for tenant
SELECT 
    id,
    department_code,
    department_name,
    department_type,
    parent_department_id
FROM department
WHERE tenant_id = '11111111-1111-1111-1111-111111111111'
    AND deleted_at IS NULL
    AND parent_department_id IS NULL  -- Only root-level departments
ORDER BY department_name;
