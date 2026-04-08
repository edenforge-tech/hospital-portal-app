-- Check charge_type constraint
SELECT conname, pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'consultation_charges'::regclass
    AND conname LIKE '%charge_type%';
