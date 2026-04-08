-- Assign Downtown Hospital branch to existing patients
-- Branch: 74c014cf-9570-4824-bdf9-b369ea11a8f4 (where our doctors are)

UPDATE patient
SET 
    branch_id = '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    updated_at = NOW()
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
    AND deleted_at IS NULL
    AND branch_id IS NULL;

-- Verify the update
SELECT 
    first_name || ' ' || last_name as patient_name,
    medical_record_number,
    b.name as branch_name,
    p.branch_id
FROM patient p
LEFT JOIN branch b ON p.branch_id = b.id
WHERE p.tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
    AND p.deleted_at IS NULL
ORDER BY p.created_at DESC
LIMIT 10;
