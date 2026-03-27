-- Check users table columns
SELECT column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position;

-- Check permissions table columns
SELECT column_name FROM information_schema.columns WHERE table_name = 'permissions' ORDER BY ordinal_position LIMIT 5;

-- Check role_permission table columns
SELECT column_name FROM information_schema.columns WHERE table_name = 'role_permission' ORDER BY ordinal_position;
