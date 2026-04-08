-- Check consultation_charges table schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'consultation_charges' 
    AND table_schema = 'public'
ORDER BY ordinal_position;
