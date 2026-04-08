-- Verify consultation charges
SELECT 
    u."FirstName" || ' ' || u."LastName" as doctor_name,
    cc.specialty,
    cc.consultation_fee,
    cc.follow_up_fee,
    cc.is_active
FROM consultation_charges cc
JOIN users u ON cc.doctor_id = u.id
WHERE cc.tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
    AND cc.is_active = true
ORDER BY u."FirstName";
