-- Find orphan department (no parent AND no STD_ prefix)
SELECT id, department_code, department_name, parent_department_id, department_type, status
FROM department
WHERE tenant_id = '11111111-1111-1111-1111-111111111111'
  AND deleted_at IS NULL
  AND parent_department_id IS NULL
  AND (department_code NOT LIKE 'STD_%' OR department_code IS NULL)
ORDER BY department_name;

-- Verify counts
SELECT 
    COUNT(*) FILTER (WHERE parent_department_id IS NULL) AS departments_without_parent,
    COUNT(*) FILTER (WHERE department_code LIKE 'STD_%') AS departments_with_std_prefix,
    COUNT(*) FILTER (WHERE parent_department_id IS NOT NULL) AS departments_with_parent,
    COUNT(*) AS total_departments
FROM department
WHERE tenant_id = '11111111-1111-1111-1111-111111111111'
  AND deleted_at IS NULL;
