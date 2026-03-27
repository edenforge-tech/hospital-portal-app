-- Check if consultation fees exist for doctors
SELECT 
    d.id as doctor_id,
    u."FirstName" || ' ' || u."LastName" as doctor_name,
    d.specialization,
    d.consultation_fee,
    d.follow_up_consultation_fee,
    d.branch_id,
    b.name as branch_name
FROM doctors d
JOIN users u ON d.user_id = u.id
LEFT JOIN branch b ON d.branch_id = b.id
WHERE d.tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
    AND u."UserStatus" = 'active'
    AND u."DeletedAt" IS NULL;

-- Check consultation_fees table
SELECT 
    cf.id,
    cf.doctor_id,
    cf.branch_id,
    cf.specialty,
    cf.consultation_fee,
    cf.follow_up_fee,
    cf.effective_from,
    cf.is_active
FROM consultation_fees cf
WHERE cf.tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
    AND cf.is_active = true
LIMIT 10;
