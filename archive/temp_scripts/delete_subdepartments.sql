-- Delete existing sub-departments for test tenant to allow full re-seeding
DELETE FROM department 
WHERE parent_department_id IS NOT NULL 
  AND tenant_id = '11111111-1111-1111-1111-111111111111';

-- Verify deletion
SELECT COUNT(*) as remaining_subdepartments
FROM department 
WHERE parent_department_id IS NOT NULL 
  AND tenant_id = '11111111-1111-1111-1111-111111111111';
