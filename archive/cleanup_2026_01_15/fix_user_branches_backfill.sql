-- Fix existing users who have BranchId set but no user_branches entry
-- This creates the missing user_branches records

INSERT INTO user_branches (
    id,
    tenant_id,
    user_id,
    branch_id,
    is_default,
    assigned_at,
    effective_from,
    status,
    notes,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid() as id,
    u.tenant_id,
    u.id as user_id,
    u."BranchId" as branch_id,
    true as is_default,
    NOW() as assigned_at,
    NOW() as effective_from,
    'active' as status,
    'Backfilled from users.BranchId' as notes,
    NOW() as created_at,
    NOW() as updated_at
FROM users u
WHERE u."BranchId" IS NOT NULL
  AND u."DeletedAt" IS NULL
  AND NOT EXISTS (
      SELECT 1 
      FROM user_branches ub 
      WHERE ub.user_id = u.id 
        AND ub.branch_id = u."BranchId"
        AND ub.status = 'active'
  );

-- Show how many records were created
SELECT COUNT(*) as backfilled_count
FROM user_branches
WHERE notes = 'Backfilled from users.BranchId';
