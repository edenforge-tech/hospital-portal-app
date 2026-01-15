-- Cleanup Duplicate Departments
-- This script removes all departments and allows Program.cs to re-seed with correct data

\echo '=== Cleaning up duplicate departments ==='

-- Delete all departments for the test tenant (cascading will handle sub-departments)
DELETE FROM department 
WHERE tenant_id = '11111111-1111-1111-1111-111111111111';

\echo '✓ All departments deleted for test tenant'
\echo 'Backend will re-seed 15 standard + 62 sub-departments = 77 total on next startup'
