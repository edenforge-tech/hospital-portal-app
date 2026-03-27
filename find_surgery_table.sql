-- Find surgery type tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name LIKE '%surgery%'
ORDER BY table_name;
