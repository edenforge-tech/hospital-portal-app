-- Soft-delete (set deleted_at) for old/duplicate departments for ANY department group, keeping only the latest UUID for each (tenant_id, branch_id, department_code)
-- This script works for all department groups, not just clinical


-- Soft-delete (set deleted_at) for old/duplicate departments for ANY department group, keeping only the latest UUID for each (tenant_id, branch_id, department_code)
-- This version works for both PostgreSQL and SQL Server

UPDATE department
SET deleted_at = now(), status = 'Archived', change_reason = 'Soft-deleted duplicate after migration (automated)'
WHERE tenant_id = '11111111-1111-1111-1111-111111111111'
  AND branch_id = '46094c88-dd0c-48ed-9674-5dc2c13f28ed'
  AND deleted_at IS NULL
  AND id NOT IN (
    SELECT sub.id FROM (
      SELECT d1.id
      FROM department d1
      INNER JOIN (
        SELECT tenant_id, branch_id, department_code, MAX(created_at) AS max_created
        FROM department
        WHERE tenant_id = '11111111-1111-1111-1111-111111111111'
          AND branch_id = '46094c88-dd0c-48ed-9674-5dc2c13f28ed'
          AND deleted_at IS NULL
        GROUP BY tenant_id, branch_id, department_code
      ) d2
      ON d1.tenant_id = d2.tenant_id
        AND d1.branch_id = d2.branch_id
        AND d1.department_code = d2.department_code
        AND d1.created_at = d2.max_created
    ) sub
  );

-- This will keep only the most recently created (by created_at) department row for each department_code active, and archive all others.
-- You can adjust tenant_id and branch_id as needed for other tenants/branches.
