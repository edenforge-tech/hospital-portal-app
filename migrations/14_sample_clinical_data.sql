-- =====================================================
-- MIGRATION 14: SAMPLE CLINICAL DATA SEEDING
-- =====================================================
-- Hospital Portal - Sample Patients, Appointments, Clinical Records
-- Database: hospitalportal @ Azure PostgreSQL 17.6
-- Date: January 22, 2026
-- Phase: 2 - Advanced Features
-- =====================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_branch_id UUID;
    v_patient_ids UUID[];
    v_physician_ids UUID[];
    v_nurse_ids UUID[];
    v_counter INTEGER;
BEGIN
    -- Get first active tenant
    SELECT id INTO v_tenant_id FROM tenant WHERE status = 'active' LIMIT 1;
    
    -- Get first active branch
    SELECT id INTO v_branch_id FROM branch WHERE tenant_id = v_tenant_id AND status = 'active' LIMIT 1;
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'SEEDING CLINICAL DATA FOR TENANT: %', v_tenant_id;
    RAISE NOTICE '============================================';
    
    -- =====================================================
    -- 1. SEED 100 SAMPLE PATIENTS
    -- =====================================================
    
    RAISE NOTICE 'Creating 100 sample patients...';
    
    INSERT INTO patient (
        id, tenant_id, branch_id, patient_number, title, first_name, last_name,
        date_of_birth, gender, blood_group, marital_status, occupation,
        phone, email, address_line1, city, state, postal_code, country,
        emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
        status, created_at
    )
    SELECT 
        gen_random_uuid(),
        v_tenant_id,
        v_branch_id,
        'PAT' || LPAD(generate_series::TEXT, 5, '0'),
        CASE (random() * 2)::INTEGER WHEN 0 THEN 'Mr.' WHEN 1 THEN 'Mrs.' ELSE 'Ms.' END,
        (ARRAY['Rajesh', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Rahul', 'Pooja', 'Arjun', 'Divya', 
               'Karan', 'Meera', 'Rohan', 'Kavya', 'Sanjay', 'Ritu', 'Nikhil', 'Swati', 'Arun', 'Neha'])[1 + floor(random() * 20)::INT],
        (ARRAY['Sharma', 'Verma', 'Patel', 'Kumar', 'Singh', 'Reddy', 'Rao', 'Gupta', 'Shah', 'Mehta',
               'Joshi', 'Desai', 'Nair', 'Iyer', 'Pillai', 'Menon', 'Kapoor', 'Malhotra', 'Chopra', 'Agarwal'])[1 + floor(random() * 20)::INT],
        CURRENT_DATE - (20 + floor(random() * 60)::INT * 365 + floor(random() * 365)::INT),
        CASE (random() * 2)::INTEGER WHEN 0 THEN 'Male' WHEN 1 THEN 'Female' ELSE 'Other' END,
        (ARRAY['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-'])[1 + floor(random() * 8)::INT],
        (ARRAY['Single', 'Married', 'Divorced', 'Widowed'])[1 + floor(random() * 4)::INT],
        (ARRAY['Software Engineer', 'Teacher', 'Business Owner', 'Homemaker', 'Retired', 'Student', 'Doctor', 'Lawyer'])[1 + floor(random() * 8)::INT],
        '+91-' || (9000000000 + floor(random() * 999999999)::BIGINT)::TEXT,
        'patient' || generate_series || '@example.com',
        (floor(random() * 999) + 1)::TEXT || ' ' || (ARRAY['MG Road', 'Nehru Street', 'Gandhi Nagar', 'Park Avenue', 'Main Road'])[1 + floor(random() * 5)::INT],
        (ARRAY['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad'])[1 + floor(random() * 8)::INT],
        (ARRAY['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Maharashtra', 'West Bengal', 'Gujarat'])[1 + floor(random() * 8)::INT],
        (100000 + floor(random() * 899999)::INT)::TEXT,
        'India',
        (ARRAY['Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Verma', 'Vikram Singh'])[1 + floor(random() * 5)::INT],
        '+91-' || (9000000000 + floor(random() * 999999999)::BIGINT)::TEXT,
        (ARRAY['Spouse', 'Parent', 'Sibling', 'Friend', 'Child'])[1 + floor(random() * 5)::INT],
        'active',
        CURRENT_TIMESTAMP - (floor(random() * 365)::INT * INTERVAL '1 day')
    FROM generate_series(1, 100);
    
    -- Store patient IDs for appointments
    SELECT ARRAY_AGG(id) INTO v_patient_ids FROM patient WHERE tenant_id = v_tenant_id LIMIT 100;
    
    RAISE NOTICE '✓ Created 100 patients';
    
    -- =====================================================
    -- 2. SEED 200 APPOINTMENTS
    -- =====================================================
    
    RAISE NOTICE 'Creating 200 appointments...';
    
    -- Get physician and nurse IDs
    SELECT ARRAY_AGG(DISTINCT u.id) INTO v_physician_ids 
    FROM users u 
    INNER JOIN employee e ON u.id = e.user_id 
    WHERE e.tenant_id = v_tenant_id AND e.status = 'active' 
    LIMIT 10;
    
    SELECT ARRAY_AGG(DISTINCT u.id) INTO v_nurse_ids 
    FROM users u 
    INNER JOIN employee e ON u.id = e.user_id 
    WHERE e.tenant_id = v_tenant_id AND e.status = 'active' 
    LIMIT 5;
    
    INSERT INTO appointment (
        id, tenant_id, patient_id, physician_user_id, appointment_date, appointment_time,
        appointment_type, appointment_status, reason_for_visit, notes,
        created_at
    )
    SELECT 
        gen_random_uuid(),
        v_tenant_id,
        v_patient_ids[1 + floor(random() * array_length(v_patient_ids, 1))::INT],
        v_physician_ids[1 + floor(random() * LEAST(array_length(v_physician_ids, 1), 10))::INT],
        CURRENT_DATE - (floor(random() * 60)::INT * INTERVAL '1 day') + (floor(random() * 120)::INT * INTERVAL '1 day'),
        ('08:00:00'::TIME + (floor(random() * 10)::INT * INTERVAL '1 hour')),
        (ARRAY['Consultation', 'Follow-up', 'Emergency', 'Routine Checkup', 'Specialist Visit'])[1 + floor(random() * 5)::INT],
        (ARRAY['scheduled', 'completed', 'cancelled', 'no_show'])[1 + floor(random() * 4)::INT],
        (ARRAY['Fever', 'Chest Pain', 'Diabetes Follow-up', 'Hypertension', 'Annual Checkup', 'Eye Problem', 'Joint Pain'])[1 + floor(random() * 7)::INT],
        'Sample appointment note',
        CURRENT_TIMESTAMP - (floor(random() * 60)::INT * INTERVAL '1 day')
    FROM generate_series(1, 200);
    
    RAISE NOTICE '✓ Created 200 appointments';
    
    -- =====================================================
    -- 3. SEED 50 PRESCRIPTIONS
    -- =====================================================
    
    RAISE NOTICE 'Creating 50 prescriptions...';
    
    INSERT INTO prescription (
        id, tenant_id, patient_id, physician_user_id, prescribed_date,
        medication_name, dosage, frequency, duration_days, instructions,
        created_at
    )
    SELECT 
        gen_random_uuid(),
        v_tenant_id,
        v_patient_ids[1 + floor(random() * array_length(v_patient_ids, 1))::INT],
        v_physician_ids[1 + floor(random() * LEAST(array_length(v_physician_ids, 1), 10))::INT],
        CURRENT_DATE - (floor(random() * 30)::INT * INTERVAL '1 day'),
        (ARRAY['Paracetamol', 'Ibuprofen', 'Amoxicillin', 'Metformin', 'Lisinopril', 'Atorvastatin', 'Omeprazole'])[1 + floor(random() * 7)::INT],
        (ARRAY['500mg', '250mg', '10mg', '20mg', '40mg', '100mg'])[1 + floor(random() * 6)::INT],
        (ARRAY['Once daily', 'Twice daily', 'Three times daily', 'Every 6 hours', 'As needed'])[1 + floor(random() * 5)::INT],
        (ARRAY[7, 14, 30, 60, 90])[1 + floor(random() * 5)::INT],
        'Take after meals with water',
        CURRENT_TIMESTAMP - (floor(random() * 30)::INT * INTERVAL '1 day')
    FROM generate_series(1, 50);
    
    RAISE NOTICE '✓ Created 50 prescriptions';
    
    -- =====================================================
    -- 4. SEED 30 LAB ORDERS
    -- =====================================================
    
    RAISE NOTICE 'Creating 30 lab orders...';
    
    INSERT INTO lab_order (
        id, tenant_id, patient_id, physician_user_id, order_date,
        test_name, test_category, order_status, sample_collected_date, result_date,
        created_at
    )
    SELECT 
        gen_random_uuid(),
        v_tenant_id,
        v_patient_ids[1 + floor(random() * array_length(v_patient_ids, 1))::INT],
        v_physician_ids[1 + floor(random() * LEAST(array_length(v_physician_ids, 1), 10))::INT],
        CURRENT_DATE - (floor(random() * 30)::INT * INTERVAL '1 day'),
        (ARRAY['Complete Blood Count', 'Lipid Profile', 'HbA1c', 'Liver Function Test', 'Kidney Function Test', 'Thyroid Panel', 'Urine Analysis'])[1 + floor(random() * 7)::INT],
        (ARRAY['Hematology', 'Biochemistry', 'Serology', 'Microbiology'])[1 + floor(random() * 4)::INT],
        (ARRAY['ordered', 'sample_collected', 'in_progress', 'completed'])[1 + floor(random() * 4)::INT],
        CURRENT_DATE - (floor(random() * 25)::INT * INTERVAL '1 day'),
        CASE WHEN random() > 0.5 THEN CURRENT_DATE - (floor(random() * 20)::INT * INTERVAL '1 day') ELSE NULL END,
        CURRENT_TIMESTAMP - (floor(random() * 30)::INT * INTERVAL '1 day')
    FROM generate_series(1, 30);
    
    RAISE NOTICE '✓ Created 30 lab orders';
    
    -- =====================================================
    -- 5. SEED 20 IMAGING STUDIES
    -- =====================================================
    
    RAISE NOTICE 'Creating 20 imaging studies...';
    
    INSERT INTO imaging_study (
        id, tenant_id, patient_id, physician_user_id, study_date,
        imaging_type, body_part, study_status, radiologist_user_id, report_url,
        created_at
    )
    SELECT 
        gen_random_uuid(),
        v_tenant_id,
        v_patient_ids[1 + floor(random() * array_length(v_patient_ids, 1))::INT],
        v_physician_ids[1 + floor(random() * LEAST(array_length(v_physician_ids, 1), 10))::INT],
        CURRENT_DATE - (floor(random() * 60)::INT * INTERVAL '1 day'),
        (ARRAY['X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'Mammography'])[1 + floor(random() * 5)::INT],
        (ARRAY['Chest', 'Abdomen', 'Head', 'Spine', 'Knee', 'Shoulder'])[1 + floor(random() * 6)::INT],
        (ARRAY['scheduled', 'completed', 'reported'])[1 + floor(random() * 3)::INT],
        v_physician_ids[1 + floor(random() * LEAST(array_length(v_physician_ids, 1), 10))::INT],
        CASE WHEN random() > 0.5 THEN '/reports/imaging/' || gen_random_uuid()::TEXT || '.pdf' ELSE NULL END,
        CURRENT_TIMESTAMP - (floor(random() * 60)::INT * INTERVAL '1 day')
    FROM generate_series(1, 20);
    
    RAISE NOTICE '✓ Created 20 imaging studies';
    
    -- =====================================================
    -- 6. SEED 15 SURGICAL PROCEDURES
    -- =====================================================
    
    RAISE NOTICE 'Creating 15 surgical procedures...';
    
    INSERT INTO surgical_procedure (
        id, tenant_id, patient_id, surgeon_user_id, procedure_date,
        procedure_name, procedure_type, procedure_status, operation_theatre,
        anesthesia_type, duration_minutes, complications, post_op_notes,
        created_at
    )
    SELECT 
        gen_random_uuid(),
        v_tenant_id,
        v_patient_ids[1 + floor(random() * array_length(v_patient_ids, 1))::INT],
        v_physician_ids[1 + floor(random() * LEAST(array_length(v_physician_ids, 1), 10))::INT],
        CURRENT_DATE - (floor(random() * 90)::INT * INTERVAL '1 day'),
        (ARRAY['Appendectomy', 'Cataract Surgery', 'Hernia Repair', 'Knee Arthroscopy', 'Cholecystectomy', 'Tonsillectomy'])[1 + floor(random() * 6)::INT],
        (ARRAY['Elective', 'Emergency', 'Diagnostic'])[1 + floor(random() * 3)::INT],
        (ARRAY['scheduled', 'in_progress', 'completed', 'cancelled'])[1 + floor(random() * 4)::INT],
        'OT-' || (1 + floor(random() * 5)::INT)::TEXT,
        (ARRAY['General', 'Spinal', 'Local', 'Regional'])[1 + floor(random() * 4)::INT],
        (30 + floor(random() * 240)::INT),
        CASE WHEN random() > 0.9 THEN 'Minor bleeding controlled' ELSE 'None' END,
        'Procedure completed successfully. Patient stable.',
        CURRENT_TIMESTAMP - (floor(random() * 90)::INT * INTERVAL '1 day')
    FROM generate_series(1, 15);
    
    RAISE NOTICE '✓ Created 15 surgical procedures';
    
    -- =====================================================
    -- MIGRATION COMPLETE
    -- =====================================================
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'MIGRATION 14: CLINICAL DATA SEEDING COMPLETE';
    RAISE NOTICE '============================================';
    RAISE NOTICE '✓ 100 Patients created';
    RAISE NOTICE '✓ 200 Appointments created';
    RAISE NOTICE '✓ 50 Prescriptions created';
    RAISE NOTICE '✓ 30 Lab Orders created';
    RAISE NOTICE '✓ 20 Imaging Studies created';
    RAISE NOTICE '✓ 15 Surgical Procedures created';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Total Clinical Records: 415';
    RAISE NOTICE '============================================';
    
END $$;
