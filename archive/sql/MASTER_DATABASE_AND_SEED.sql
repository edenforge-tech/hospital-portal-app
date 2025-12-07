-- CONSOLIDATED - MASTER DATABASE MIGRATIONS + PERMISSIONS SEED
-- This file consolidates the MASTER_DATABASE_MIGRATIONS.sql and MASTER_PERMISSIONS_SEED.sql
-- It executes database schema migrations followed by permission seeding.
-- Execution: psql -U <user> -d <db> -f consolidated/MASTER_DATABASE_AND_SEED.sql

\echo '=== START: Master DATABASE migrations + permissions seeding ==='
\echo 'Step 1: Execute MASTER_DATABASE_MIGRATIONS.sql (schema and migrations)'
\i MASTER_DATABASE_MIGRATIONS.sql

\echo 'Step 2: Execute MASTER_PERMISSIONS_SEED.sql (297 permissions and mappings)'
\i MASTER_PERMISSIONS_SEED.sql

\echo 'Step 3: Optional: sample data (if present in sample_data_complete.sql)'
-- Uncomment to import sample data after migrations and permissions
--\i sample_data_complete.sql

\echo '=== END: Consolidated migrations and seeding ==='
