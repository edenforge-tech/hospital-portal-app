-- CONSOLIDATED MASTER RUN-IT-ALL SQL
-- This wrapper runs the primary database migrations, permissions seeding, and sample data load
-- It aims to provide a single entry point to set up the DB for new installations

\echo '=== START CONSOLIDATED DATABASE SCRIPT ==='
\echo 'Step 1: Run EF migrations (via dotnet ef or include schema SQLs)'
-- Many EF migrations are controlled via dotnet ef; for SQL-only run, include the master SQL below
\i MASTER_DATABASE_MIGRATIONS.sql

\echo 'Step 2: Seed master permissions and role mappings (MASTER_PERMISSIONS_SEED.sql)'
\i MASTER_PERMISSIONS_SEED.sql

\echo 'Step 3: Seed sample data (optional)'
-- Uncomment the following line to include sample data during the automated run
-- \i sample_data_complete.sql

\echo 'Step 4: Ensure system configurations and test users are added'
-- You can run additional files as needed (create_test_users_for_testing.sql etc.)
\i create_test_users_for_testing.sql

\echo '=== END CONSOLIDATED DATABASE SCRIPT ==='
