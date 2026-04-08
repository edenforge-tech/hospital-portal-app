-- Find doctor-related tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND (table_name LIKE '%doctor%' OR table_name LIKE '%consult%' OR table_name LIKE '%fee%')
ORDER BY table_name;
