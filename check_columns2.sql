-- Check permissions table columns
SELECT column_name FROM information_schema.columns WHERE table_name = 'permissions' ORDER BY ordinal_position;

-- Check role_permission table columns  
SELECT column_name FROM information_schema.columns WHERE table_name = 'role_permission' ORDER BY ordinal_position;

-- Get admin user's BranchId
SELECT id, tenant_id, "BranchId" as branch_id FROM users LIMIT 10;

-- Check ot.schedules.view permission exists
SELECT "Id", "Name" FROM permissions WHERE "Name" = 'ot.schedules.view';
