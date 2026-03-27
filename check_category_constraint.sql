-- Check surgery_category constraint
SELECT conname, pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'surgery_types'::regclass
    AND conname LIKE '%category%';
