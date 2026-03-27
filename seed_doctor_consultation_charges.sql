-- Seed Consultation Charges for 5 Doctors
-- Tenant: 155fe198-6ae5-4a01-9254-ead5b427247e
-- Branch: 74c014cf-9570-4824-bdf9-b369ea11a8f4 (Downtown Hospital)

-- Sarah Johnson - Retina Specialist (₹1,500)
INSERT INTO consultation_charges (
    id, tenant_id, branch_id, charge_type, doctor_id, specialty,
    consultation_fee, follow_up_fee, emergency_consultation_fee,
    validity_days, free_follow_ups_count, accepts_cash, accepts_card, accepts_insurance,
    effective_from, is_active, created_at, updated_at, status
) 
SELECT 
    gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'DoctorSpecific', u.id, 'Retina Specialist',
    1500.00, 800.00, 2500.00,
    30, 1, true, true, true,
    CURRENT_DATE - INTERVAL '30 days', true, NOW(), NOW(), 'active'
FROM users u WHERE u.email = 'sarah.johnson@hospital.com';

-- James Anderson - Ophthalmology (₹1,200)
INSERT INTO consultation_charges (
    id, tenant_id, branch_id, charge_type, doctor_id, specialty,
    consultation_fee, follow_up_fee, emergency_consultation_fee,
    validity_days, free_follow_ups_count, accepts_cash, accepts_card, accepts_insurance,
    effective_from, is_active, created_at, updated_at, status
) 
SELECT 
    gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'DoctorSpecific', u.id, 'Ophthalmology',
    1200.00, 700.00, 2000.00,
    30, 1, true, true, true,
    CURRENT_DATE - INTERVAL '30 days', true, NOW(), NOW(), 'active'
FROM users u WHERE u.email = 'james.anderson@hospital.com';

-- Rajesh Kumar - Cataract Surgeon (₹1,000)
INSERT INTO consultation_charges (
    id, tenant_id, branch_id, charge_type, doctor_id, specialty,
    consultation_fee, follow_up_fee, emergency_consultation_fee,
    validity_days, free_follow_ups_count, accepts_cash, accepts_card, accepts_insurance,
    effective_from, is_active, created_at, updated_at, status
) 
SELECT 
    gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'DoctorSpecific', u.id, 'Cataract Surgeon',
    1000.00, 600.00, 1800.00,
    30, 1, true, true, true,
    CURRENT_DATE - INTERVAL '30 days', true, NOW(), NOW(), 'active'
FROM users u WHERE u.email = 'rajesh.kumar@hospital.com';

-- Maria Garcia - Glaucoma Specialist (₹1,300)
INSERT INTO consultation_charges (
    id, tenant_id, branch_id, charge_type, doctor_id, specialty,
    consultation_fee, follow_up_fee, emergency_consultation_fee,
    validity_days, free_follow_ups_count, accepts_cash, accepts_card, accepts_insurance,
    effective_from, is_active, created_at, updated_at, status
) 
SELECT 
    gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'DoctorSpecific', u.id, 'Glaucoma Specialist',
    1300.00, 750.00, 2200.00,
    30, 1, true, true, true,
    CURRENT_DATE - INTERVAL '30 days', true, NOW(), NOW(), 'active'
FROM users u WHERE u.email = 'maria.garcia@hospital.com';

-- Jennifer Taylor - Optometrist (₹800)
INSERT INTO consultation_charges (
    id, tenant_id, branch_id, charge_type, doctor_id, specialty,
    consultation_fee, follow_up_fee, emergency_consultation_fee,
    validity_days, free_follow_ups_count, accepts_cash, accepts_card, accepts_insurance,
    effective_from, is_active, created_at, updated_at, status
) 
SELECT 
    gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'DoctorSpecific', u.id, 'Optometrist',
    800.00, 500.00, 1500.00,
    30, 2, true, true, true,
    CURRENT_DATE - INTERVAL '30 days', true, NOW(), NOW(), 'active'
FROM users u WHERE u.email = 'jennifer.taylor@hospital.com';

-- Verify
SELECT COUNT(*) as total_consultation_charges_inserted
FROM consultation_charges
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e';
