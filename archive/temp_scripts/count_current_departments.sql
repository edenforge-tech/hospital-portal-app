-- Count departments in database for test tenant
SELECT COUNT(*) as current_departments_in_db
FROM department
WHERE tenant_id = '11111111-1111-1111-1111-111111111111'
AND deleted_at IS NULL;

-- List all current departments
SELECT 
    department_code,
    department_name,
    department_type,
    status
FROM department
WHERE tenant_id = '11111111-1111-1111-1111-111111111111'
AND deleted_at IS NULL
ORDER BY department_name;
