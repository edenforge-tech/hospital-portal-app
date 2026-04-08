-- Check table names in schema
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND (tablename ILIKE '%user%role%' OR tablename ILIKE '%role%' OR tablename ILIKE '%permission%') ORDER BY tablename;
