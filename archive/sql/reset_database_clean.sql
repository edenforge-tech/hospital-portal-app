-- =====================================================
-- CLEAN DATABASE RESET SCRIPT
-- =====================================================
-- This will drop and recreate the schema from scratch
-- Then EF migrations can be applied cleanly
-- =====================================================

-- Drop the public schema and recreate it
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Grant permissions
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Enable UUID extension (needed for gen_random_uuid())
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verify clean state
SELECT 'Database reset complete - Ready for EF migrations' as status;
SELECT 
    COUNT(*) as table_count,
    'Should be 0' as expected
FROM pg_tables 
WHERE schemaname = 'public';
