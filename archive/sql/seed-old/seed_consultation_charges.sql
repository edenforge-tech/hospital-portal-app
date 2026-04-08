-- Seed Consultation Charges for Doctors
-- Branch: 74c014cf-9570-4824-bdf9-b369ea11a8f4 (Downtown Hospital)
-- Tenant: 155fe198-6ae5-4a01-9254-ead5b427247e

-- Get doctor IDs first
WITH doctor_ids AS (
    SELECT 
        u.id,
        u."FirstName" || ' ' || u."LastName" as name,
        ur.branch_id
    FROM users u
    JOIN app_user_roles ur ON u.id = ur.user_id
    JOIN app_roles r ON ur.role_id = r.id
    WHERE u.tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
        AND u."UserStatus" = 'active'
        AND u."DeletedAt" IS NULL
        AND r.name LIKE '%Doctor%'
)
SELECT * FROM doctor_ids;

-- Insert consultation charges for doctors
-- Sarah Johnson - Retina Specialist
INSERT INTO consultation_charges (
    id,
    tenant_id,
    branch_id,
    charge_type,
    doctor_id,
    specialty,
    consultation_fee,
    follow_up_fee,
    emergency_consultation_fee,
    validity_days,
    free_follow_ups_count,
    accepts_cash,
    accepts_card,
    accepts_insurance,
    effective_from,
    is_active,
    created_at,
    updated_at,
    status
) 
SELECT 
    gen_random_uuid(),
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'Doctor',
    u.id,
    'Retina Specialist',
    1500.00,
    800.00,
    2500.00,
    30,
    1,
    true,
    true,
    true,
    CURRENT_DATE - INTERVAL '30 days',
    true,
    NOW(),
    NOW(),
    'active'
FROM users u
WHERE u.email = 'sarah.johnson@hospital.com';

-- James Anderson - Ophthalmology
INSERT INTO consultation_charges (
    id, tenant_id, branch_id, charge_type, doctor_id, specialty,
    consultation_fee, follow_up_fee, emergency_consultation_fee,
    validity_days, free_follow_ups_count, accepts_cash, accepts_card, accepts_insurance,
    effective_from, is_active, created_at, updated_at, status
) 
SELECT 
    gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'Doctor', u.id, 'Ophthalmology',
    1200.00, 700.00, 2000.00,
    30, 1, true, true, true,
    CURRENT_DATE - INTERVAL '30 days', true, NOW(), NOW(), 'active'
FROM users u WHERE u.email = 'james.anderson@hospital.com';

-- Rajesh Kumar - Cataract Surgeon
INSERT INTO consultation_charges (
    id, tenant_id, branch_id, charge_type, doctor_id, specialty,
    consultation_fee, follow_up_fee, emergency_consultation_fee,
    validity_days, free_follow_ups_count, accepts_cash, accepts_card, accepts_insurance,
    effective_from, is_active, created_at, updated_at, status
) 
SELECT 
    gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'Doctor', u.id, 'Cataract Surgeon',
    1000.00, 600.00, 1800.00,
    30, 1, true, true, true,
    CURRENT_DATE - INTERVAL '30 days', true, NOW(), NOW(), 'active'
FROM users u WHERE u.email = 'rajesh.kumar@hospital.com';

-- Maria Garcia - Glaucoma Specialist
INSERT INTO consultation_charges (
    id, tenant_id, branch_id, charge_type, doctor_id, specialty,
    consultation_fee, follow_up_fee, emergency_consultation_fee,
    validity_days, free_follow_ups_count, accepts_cash, accepts_card, accepts_insurance,
    effective_from, is_active, created_at, updated_at, status
) 
SELECT 
    gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'Doctor', u.id, 'Glaucoma Specialist',
    1300.00, 750.00, 2200.00,
    30, 1, true, true, true,
    CURRENT_DATE - INTERVAL '30 days', true, NOW(), NOW(), 'active'
FROM users u WHERE u.email = 'maria.garcia@hospital.com';

-- Jennifer Taylor - Optometrist
INSERT INTO consultation_charges (
    id, tenant_id, branch_id, charge_type, doctor_id, specialty,
    consultation_fee, follow_up_fee, emergency_consultation_fee,
    validity_days, free_follow_ups_count, accepts_cash, accepts_card, accepts_insurance,
    effective_from, is_active, created_at, updated_at, status
) 
SELECT 
    gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'Doctor', u.id, 'Optometrist',
    800.00, 500.00, 1500.00,
    30, 2, true, true, true,
    CURRENT_DATE - INTERVAL '30 days', true, NOW(), NOW(), 'active'
FROM users u WHERE u.email = 'jennifer.taylor@hospital.com';

-- Verify inserted consultation charges
SELECT 
    cc.id,
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
