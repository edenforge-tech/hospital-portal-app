-- =====================================================
-- MASTER MIGRATION SCRIPT - EXECUTE ALL DATABASE CHANGES
-- =====================================================
-- Purpose: Execute all migrations in correct order
-- Date: December 7, 2025
-- =====================================================
-- 
-- EXECUTION ORDER:
-- 1. Create Organization table
-- 2. Update Branch with organization_id
-- 3. Restructure Department table (14 standards + sub-departments)
-- 4. Convert existing 75 departments to new structure
-- 
-- =====================================================

\echo ''
\echo '=========================================='
\echo 'HOSPITAL PORTAL - DATABASE MIGRATION'
\echo 'Architecture: Tenant → Organization → Branch → Department (14 Standard + Sub-departments)'
\echo '=========================================='
\echo ''

\echo 'Step 1/4: Creating Organization table...'
\i database_migrations/01_create_organization_table.sql

\echo ''
\echo 'Step 2/4: Updating Branch table with organization_id...'
\i database_migrations/02_update_branch_with_organization.sql

\echo ''
\echo 'Step 3/4: Restructuring Department table (14 standard departments)...'
\i database_migrations/03_restructure_departments_14_standards.sql

\echo ''
\echo 'Step 4/4: Converting 75 existing departments to sub-departments...'
\i database_migrations/04_convert_75_to_subdepartments.sql

\echo ''
\echo '=========================================='
\echo 'MIGRATION COMPLETED SUCCESSFULLY'
\echo '=========================================='
\echo ''
\echo 'Summary:'
\echo '- Organization table created'
\echo '- Branch linked to Organization'
\echo '- 14 Standard departments created'
\echo '- 75 departments reorganized as sub-departments'
\echo ''
\echo 'Next Steps:'
\echo '1. Update backend models (Organization, Department)'
\echo '2. Update API endpoints'
\echo '3. Update frontend components'
\echo '4. Test with India Eye Hospital Network tenant'
\echo ''
