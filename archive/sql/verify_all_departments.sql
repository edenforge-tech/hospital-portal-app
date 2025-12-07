-- Final Department Verification Query
-- Run this after all inserts and cleanups to verify the complete department hierarchy

-- Count departments by type
SELECT
    department_type,
    COUNT(*) as total_departments,
    COUNT(CASE WHEN parent_department_id IS NULL THEN 1 END) as parent_departments,
    COUNT(CASE WHEN parent_department_id IS NOT NULL THEN 1 END) as sub_departments
FROM department
WHERE tenant_id = '11111111-1111-1111-1111-111111111111'
  AND branch_id = '46094c88-dd0c-48ed-9674-5dc2c13f28ed'
  AND deleted_at IS NULL
GROUP BY department_type
ORDER BY department_type;

-- Full department hierarchy
SELECT
    d.department_code,
    d.department_name,
    d.department_type,
    COALESCE(p.department_name, 'ROOT') as parent_department,
    d.status,
    d.is_24x7,
    d.operating_hours_start,
    d.operating_hours_end
FROM department d
LEFT JOIN department p ON d.parent_department_id = p.id
WHERE d.tenant_id = '11111111-1111-1111-1111-111111111111'
  AND d.branch_id = '46094c88-dd0c-48ed-9674-5dc2c13f28ed'
  AND d.deleted_at IS NULL
ORDER BY d.department_type, d.department_code;

-- Check for any duplicates or issues
SELECT
    department_code,
    COUNT(*) as count,
    STRING_AGG(status, ', ') as statuses
FROM department
WHERE tenant_id = '11111111-1111-1111-1111-111111111111'
  AND branch_id = '46094c88-dd0c-48ed-9674-5dc2c13f28ed'
  AND deleted_at IS NULL
GROUP BY department_code
HAVING COUNT(*) > 1
ORDER BY department_code;