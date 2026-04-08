-- Check Trump Uncle's branch
SELECT 
    id,
    first_name,
    last_name,
    medical_record_number,
    branch_id,
    status
FROM patient
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
    AND (first_name ILIKE '%trump%' OR last_name ILIKE '%uncle%')
    AND deleted_at IS NULL;

-- If not found, check with different column names
SELECT 
    id,
    COALESCE(first_name, '') || ' ' || COALESCE(last_name, '') as full_name,
    medical_record_number,
    branch_id,
    status
FROM patient
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
    AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 5;
