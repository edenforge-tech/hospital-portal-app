-- Check consultation_charges table
SELECT 
    id,
    branch_id,
    department_id,
    specialty,
    doctor_user_id,
    consultation_fee,
    follow_up_fee,
    emergency_consultation_fee,
    is_active,
    effective_from
FROM consultation_charges
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
    AND is_active = true
ORDER BY created_at DESC
LIMIT 10;

-- Count total consultation charges
SELECT COUNT(*) as total_consultation_charges
FROM consultation_charges
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e';

-- Check if Sarah Johnson has consultation charges configured
SELECT 
    cc.id,
    u."FirstName" || ' ' || u."LastName" as doctor_name,
    cc.specialty,
    cc.consultation_fee,
    cc.follow_up_fee,
    cc.is_active
FROM consultation_charges cc
JOIN users u ON cc.doctor_user_id = u.id
WHERE cc.tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
    AND u.email = 'sarah.johnson@hospital.com';
