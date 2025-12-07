-- Check current database state
SELECT 
    'Tables' as object_type,
    schemaname,
    tablename as object_name
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename
LIMIT 20;

-- Check if EF migrations table exists
SELECT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = '__EFMigrationsHistory'
) as migrations_table_exists;

-- If it exists, show applied migrations
SELECT * FROM "__EFMigrationsHistory"
ORDER BY "MigrationId";
