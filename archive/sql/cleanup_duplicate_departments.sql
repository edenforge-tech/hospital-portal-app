-- Soft-delete (set deleted_at) for old/duplicate departments with the same department_code but not the new UUIDs
-- Only for tenant_id and branch_id in scope

UPDATE department
SET deleted_at = now(), status = 'Archived', change_reason = 'Soft-deleted duplicate after migration'
WHERE tenant_id = '11111111-1111-1111-1111-111111111111'
  AND branch_id = '46094c88-dd0c-48ed-9674-5dc2c13f28ed'
  AND department_code IN (
    'OPD', 'OPD-REG', 'OPD-FOLLOWUP', 'OPD-TRIAGE',
    'IPD', 'IPD-GEN', 'IPD-ICU',
    'EMERG', 'EMERG-TRIAGE',
    'CENTRAL-OT', 'CENTRAL-OT-REC'
  )
  AND id NOT IN (
    'e1a1c1a1-aaaa-4aaa-aaaa-aaaaaaaaaaa1',
    'e1a1c1a1-aaaa-4aaa-aaaa-aaaaaaaaaaa2',
    'e1a1c1a1-aaaa-4aaa-aaaa-aaaaaaaaaaa3',
    'e1a1c1a1-aaaa-4aaa-aaaa-aaaaaaaaaaa4',
    'e2a2c2a2-aaaa-4aaa-aaaa-aaaaaaaaaaa1',
    'e2a2c2a2-aaaa-4aaa-aaaa-aaaaaaaaaaa2',
    'e2a2c2a2-aaaa-4aaa-aaaa-aaaaaaaaaaa3',
    'e3a3c3a3-aaaa-4aaa-aaaa-aaaaaaaaaaa1',
    'e3a3c3a3-aaaa-4aaa-aaaa-aaaaaaaaaaa2',
    'e4a4c4a4-aaaa-4aaa-aaaa-aaaaaaaaaaa1',
    'e4a4c4a4-aaaa-4aaa-aaaa-aaaaaaaaaaa2'
  );

-- You can run this script to archive all old/duplicate departments for the specified tenant and branch, keeping only the new ones active.