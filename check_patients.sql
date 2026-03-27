-- Check existing patients in the database
SELECT 
    id,
    full_name,
    mrn,
    phone_number,
    email,
    date_of_birth,
    gender,
    status,
    created_at
FROM patient
WHERE deleted_at IS NULL
AND status = 'active'
ORDER BY created_at DESC
LIMIT 20;

-- Count total active patients
SELECT COUNT(*) as total_active_patients
FROM patient
WHERE deleted_at IS NULL
AND status = 'active';

-- Check patient structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'patient'
ORDER BY ordinal_position;
