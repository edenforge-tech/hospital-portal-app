-- =====================================================
-- MIGRATION 05: COMPREHENSIVE CLINICAL SAMPLE DATA
-- =====================================================
-- Hospital Portal - Realistic Test Data for Demos
-- Database: hospitalportal @ Azure PostgreSQL 17.6
-- Date: January 21, 2026
-- Phase: 2 - High Priority
-- 
-- This migration creates:
-- 1. 5 Additional Tenants (multi-hospital, single practice, clinics)
-- 2. 40 Medical Specialty Departments
-- 3. 100+ Patient Records
-- 4. 200+ Appointments (past, current, upcoming)
-- 5. Clinical Notes, Prescriptions, Lab Orders
-- 6. Insurance Claims and Billing Data
-- =====================================================

-- Get existing tenant for reference
DO $$
DECLARE
    v_existing_tenant_id UUID;
    v_existing_org_id UUID;
    v_existing_branch_id UUID;
BEGIN
    SELECT id INTO v_existing_tenant_id FROM tenant WHERE status = 'active' LIMIT 1;
    SELECT id INTO v_existing_org_id FROM organization WHERE tenant_id = v_existing_tenant_id LIMIT 1;
    SELECT id INTO v_existing_branch_id FROM branch WHERE tenant_id = v_existing_tenant_id LIMIT 1;
    
    RAISE NOTICE 'Using existing tenant: %, org: %, branch: %', v_existing_tenant_id, v_existing_org_id, v_existing_branch_id;
END $$;

-- =====================================================
-- 1. CREATE 5 ADDITIONAL TENANTS
-- =====================================================

-- Tenant 2: Multi-Hospital Eye Care Chain
INSERT INTO tenant (id, name, tenant_type, contact_email, contact_phone, status, created_at)
VALUES 
(gen_random_uuid(), 'VisionCare Multi-Specialty Group', 'hospital_chain', 'admin@visioncare.com', '+1-555-2000', 'active', CURRENT_TIMESTAMP)
RETURNING id INTO temp_tenant_2_id;

-- Tenant 3: Single Eye Clinic
INSERT INTO tenant (id, name, tenant_type, contact_email, contact_phone, status, created_at)
VALUES 
(gen_random_uuid(), 'Downtown Eye Clinic', 'clinic', 'contact@downtowneye.com', '+1-555-3000', 'active', CURRENT_TIMESTAMP);

-- Tenant 4: Laser Vision Center
INSERT INTO tenant (id, name, tenant_type, contact_email, contact_phone, status, created_at)
VALUES 
(gen_random_uuid(), 'Premier Laser Vision Center', 'specialty_center', 'info@premierlaser.com', '+1-555-4000', 'active', CURRENT_TIMESTAMP);

-- Tenant 5: Pediatric Eye Hospital
INSERT INTO tenant (id, name, tenant_type, contact_email, contact_phone, status, created_at)
VALUES 
(gen_random_uuid(), 'Children's Eye Hospital', 'specialty_hospital', 'contact@childreneyehosp.org', '+1-555-5000', 'active', CURRENT_TIMESTAMP);

-- Tenant 6: Retina Specialty Center
INSERT INTO tenant (id, name, tenant_type, contact_email, contact_phone, status, created_at)
VALUES 
(gen_random_uuid(), 'Advanced Retina Specialists', 'specialty_center', 'admin@advancedretina.com', '+1-555-6000', 'active', CURRENT_TIMESTAMP);

-- =====================================================
-- 2. CREATE 40 MEDICAL SPECIALTY DEPARTMENTS
-- =====================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_branch_id UUID;
    departments TEXT[] := ARRAY[
        'General Ophthalmology',
        'Cataract Surgery',
        'Retina & Vitreous',
        'Glaucoma Management',
        'Cornea & External Disease',
        'Refractive Surgery (LASIK)',
        'Pediatric Ophthalmology',
        'Oculoplastic Surgery',
        'Neuro-Ophthalmology',
        'Uveitis & Ocular Immunology',
        'Ocular Oncology',
        'Low Vision Rehabilitation',
        'Optometry Services',
        'Contact Lens Services',
        'Optical Dispensary',
        'Emergency Eye Care',
        'Pre-Operative Assessment',
        'Post-Operative Care',
        'Diagnostic Imaging',
        'OCT & Visual Field Testing',
        'Fundus Photography',
        'Ultrasound & Biometry',
        'Lab Services',
        'Pharmacy',
        'Medical Records',
        'Patient Counselling',
        'Insurance & Billing',
        'Admissions & Registration',
        'Discharge Planning',
        'Quality Assurance',
        'Infection Control',
        'IT & Informatics',
        'Human Resources',
        'Finance & Accounting',
        'Facility Management',
        'Security',
        'Housekeeping',
        'Research & Clinical Trials',
        'Education & Training',
        'Telemedicine Services'
    ];
    dept_name TEXT;
    dept_code TEXT;
BEGIN
    SELECT id INTO v_tenant_id FROM tenant WHERE status = 'active' ORDER BY created_at LIMIT 1;
    SELECT id INTO v_branch_id FROM branch WHERE tenant_id = v_tenant_id LIMIT 1;
    
    FOREACH dept_name IN ARRAY departments
    LOOP
        -- Generate department code (first 3-4 letters uppercase)
        dept_code := UPPER(LEFT(REPLACE(dept_name, ' ', ''), 4));
        
        INSERT INTO department (
            id, tenant_id, branch_id, department_name, department_code,
            is_clinical, allows_appointments, status, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_tenant_id, v_branch_id, dept_name, dept_code || '-' || LPAD((floor(random() * 99) + 1)::text, 2, '0'),
            dept_name NOT IN ('Human Resources', 'Finance & Accounting', 'IT & Informatics', 'Security', 'Housekeeping', 'Facility Management'),
            dept_name IN ('General Ophthalmology', 'Cataract Surgery', 'Retina & Vitreous', 'Glaucoma Management', 'Pediatric Ophthalmology', 'Optometry Services', 'Emergency Eye Care'),
            'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        ) ON CONFLICT DO NOTHING;
    END LOOP;
    
    RAISE NOTICE '✅ Created 40 medical specialty departments';
END $$;

-- =====================================================
-- 3. CREATE 100+ PATIENT RECORDS
-- =====================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_branch_id UUID;
    v_patient_id UUID;
    v_user_id UUID;
    i INTEGER;
    first_names TEXT[] := ARRAY['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Maria', 
                                  'William', 'Jennifer', 'Richard', 'Linda', 'Joseph', 'Patricia', 'Thomas', 'Barbara', 'Charles', 'Susan',
                                  'Daniel', 'Jessica', 'Matthew', 'Nancy', 'Christopher', 'Karen', 'Andrew', 'Betty', 'Joshua', 'Helen',
                                  'Kevin', 'Sandra', 'Brian', 'Ashley', 'George', 'Kimberly', 'Edward', 'Donna', 'Ronald', 'Carol',
                                  'Timothy', 'Michelle', 'Jason', 'Amanda', 'Jeffrey', 'Melissa', 'Ryan', 'Deborah', 'Jacob', 'Stephanie'];
    last_names TEXT[] := ARRAY['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
                                'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
                                'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright', 'Scott', 'Green', 'Baker',
                                'Adams', 'Nelson', 'Carter', 'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker'];
    genders TEXT[] := ARRAY['Male', 'Female', 'Other'];
    blood_groups TEXT[] := ARRAY['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
BEGIN
    SELECT id INTO v_tenant_id FROM tenant WHERE status = 'active' ORDER BY created_at LIMIT 1;
    SELECT id INTO v_branch_id FROM branch WHERE tenant_id = v_tenant_id LIMIT 1;
    
    FOR i IN 1..100 LOOP
        v_user_id := gen_random_uuid();
        v_patient_id := gen_random_uuid();
        
        -- Create user account for patient
        INSERT INTO "AspNetUsers" (
            "Id", "TenantId", "UserName", "NormalizedUserName", "Email", "NormalizedEmail",
            "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp",
            "PhoneNumber", "FirstName", "LastName", "UserType", "UserStatus",
            employment_category, "CreatedAt"
        ) VALUES (
            v_user_id, v_tenant_id, 
            'patient' || i || '@test.com', 
            'PATIENT' || i || '@TEST.COM',
            'patient' || i || '@test.com',
            'PATIENT' || i || '@TEST.COM',
            true, 'AQAAAAIAAYagAAAAEKp8qH0Q7FQ3xZVqK5P4vN7xH6lYqJ8zN2mC1wR3tE4pD5oA8sV7kL9fY6uX3hG2wA==',
            gen_random_uuid()::text, gen_random_uuid()::text,
            '+1-555-' || LPAD((7000 + i)::text, 4, '0'),
            first_names[1 + floor(random() * array_length(first_names, 1))],
            last_names[1 + floor(random() * array_length(last_names, 1))],
            'Patient', 'active', 'PATIENT', CURRENT_TIMESTAMP - (INTERVAL '1 day' * floor(random() * 1095))
        ) ON CONFLICT ("NormalizedUserName") DO NOTHING;
        
        -- Create patient record
        INSERT INTO patient (
            id, tenant_id, user_id, patient_number, date_of_birth, gender, blood_group,
            address, city, state, zip_code, country, emergency_contact_name, emergency_contact_phone,
            emergency_contact_relationship, insurance_provider, insurance_policy_number,
            primary_physician_id, status, created_at, updated_at
        ) VALUES (
            v_patient_id, v_tenant_id, v_user_id,
            'PT-' || LPAD(i::text, 5, '0'),
            CURRENT_DATE - (INTERVAL '1 year' * (18 + floor(random() * 62))), -- Age 18-80
            genders[1 + floor(random() * array_length(genders, 1))],
            blood_groups[1 + floor(random() * array_length(blood_groups, 1))],
            (100 + floor(random() * 9900))::text || ' Main Street',
            'Sample City',
            'CA',
            (90000 + floor(random() * 9999))::text,
            'USA',
            first_names[1 + floor(random() * array_length(first_names, 1))] || ' ' || last_names[1 + floor(random() * array_length(last_names, 1))],
            '+1-555-' || LPAD((8000 + i)::text, 4, '0'),
            CASE floor(random() * 4)
                WHEN 0 THEN 'Spouse'
                WHEN 1 THEN 'Parent'
                WHEN 2 THEN 'Sibling'
                ELSE 'Child'
            END,
            CASE floor(random() * 4)
                WHEN 0 THEN 'Blue Cross'
                WHEN 1 THEN 'Aetna'
                WHEN 2 THEN 'United Healthcare'
                ELSE 'Medicare'
            END,
            'POL-' || LPAD((100000 + i)::text, 7, '0'),
            (SELECT id FROM "AspNetUsers" WHERE "UserType" = 'Staff' AND "DeletedAt" IS NULL ORDER BY random() LIMIT 1),
            'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        ) ON CONFLICT DO NOTHING;
    END LOOP;
    
    RAISE NOTICE '✅ Created 100 patient records';
END $$;

-- =====================================================
-- 4. CREATE 200+ APPOINTMENTS
-- =====================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_branch_id UUID;
    v_patient_id UUID;
    v_doctor_id UUID;
    v_dept_id UUID;
    i INTEGER;
    appointment_date DATE;
    appointment_time TIME;
    appointment_types TEXT[] := ARRAY['New Patient', 'Follow-up', 'Surgery', 'Emergency', 'Routine Check-up', 'Specialist Consult'];
    appointment_statuses TEXT[] := ARRAY['scheduled', 'completed', 'cancelled', 'no-show'];
BEGIN
    SELECT id INTO v_tenant_id FROM tenant WHERE status = 'active' ORDER BY created_at LIMIT 1;
    SELECT id INTO v_branch_id FROM branch WHERE tenant_id = v_tenant_id LIMIT 1;
    
    FOR i IN 1..200 LOOP
        -- Random date: 90 days in past to 90 days in future
        appointment_date := CURRENT_DATE - INTERVAL '90 days' + (INTERVAL '1 day' * floor(random() * 180));
        appointment_time := TIME '08:00' + (INTERVAL '30 minutes' * floor(random() * 20)); -- 8am-6pm
        
        -- Get random patient
        SELECT id INTO v_patient_id FROM patient WHERE tenant_id = v_tenant_id ORDER BY random() LIMIT 1;
        
        -- Get random doctor (user with Staff type)
        SELECT id INTO v_doctor_id FROM "AspNetUsers" WHERE "TenantId" = v_tenant_id AND "UserType" = 'Staff' AND "DeletedAt" IS NULL ORDER BY random() LIMIT 1;
        
        -- Get random clinical department
        SELECT id INTO v_dept_id FROM department WHERE tenant_id = v_tenant_id AND is_clinical = true ORDER BY random() LIMIT 1;
        
        INSERT INTO appointment (
            id, tenant_id, patient_id, doctor_id, department_id, branch_id,
            appointment_date, appointment_time, duration_minutes, appointment_type,
            appointment_status, reason_for_visit, notes,
            created_at, updated_at, status
        ) VALUES (
            gen_random_uuid(), v_tenant_id, v_patient_id, v_doctor_id, v_dept_id, v_branch_id,
            appointment_date, appointment_time, 30,
            appointment_types[1 + floor(random() * array_length(appointment_types, 1))],
            CASE 
                WHEN appointment_date < CURRENT_DATE THEN appointment_statuses[2 + floor(random() * 3)]::text -- Past: completed/cancelled/no-show
                ELSE 'scheduled'
            END,
            CASE floor(random() * 6)
                WHEN 0 THEN 'Blurred vision'
                WHEN 1 THEN 'Eye pain'
                WHEN 2 THEN 'Routine check-up'
                WHEN 3 THEN 'Cataract evaluation'
                WHEN 4 THEN 'Diabetic retinopathy follow-up'
                ELSE 'Eye infection'
            END,
            'Patient appointment for ' || appointment_types[1 + floor(random() * array_length(appointment_types, 1))],
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'active'
        ) ON CONFLICT DO NOTHING;
    END LOOP;
    
    RAISE NOTICE '✅ Created 200 appointments';
END $$;

-- =====================================================
-- 5. CREATE CLINICAL NOTES, PRESCRIPTIONS, LAB ORDERS
-- =====================================================

-- Clinical Notes (for completed appointments)
INSERT INTO clinical_note (
    id, tenant_id, patient_id, doctor_id, appointment_id, encounter_id,
    note_type, chief_complaint, history_present_illness, examination_findings,
    assessment, plan, created_at, updated_at, status
)
SELECT 
    gen_random_uuid(), a.tenant_id, a.patient_id, a.doctor_id, a.id, NULL,
    'Progress Note',
    a.reason_for_visit,
    'Patient presents with ' || a.reason_for_visit || '. Symptoms started ' || (1 + floor(random() * 14))::text || ' days ago.',
    CASE floor(random() * 3)
        WHEN 0 THEN 'Visual acuity: 20/20 OD, 20/25 OS. No abnormalities detected.'
        WHEN 1 THEN 'Mild cataract noted in right eye. Visual acuity: 20/40 OD, 20/20 OS.'
        ELSE 'Early diabetic retinopathy changes observed. Visual acuity stable.'
    END,
    'Diagnosis: ' || CASE floor(random() * 5)
        WHEN 0 THEN 'Myopia'
        WHEN 1 THEN 'Cataract'
        WHEN 2 THEN 'Diabetic Retinopathy'
        WHEN 3 THEN 'Glaucoma'
        ELSE 'Dry Eye Syndrome'
    END,
    'Continue current treatment. Follow-up in ' || (1 + floor(random() * 6))::text || ' months.',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'finalized'
FROM appointment a
WHERE a.appointment_status = 'completed'
LIMIT 50;

-- Prescriptions (for some completed appointments)
INSERT INTO prescription (
    id, tenant_id, patient_id, doctor_id, appointment_id,
    medication_name, dosage, frequency, duration_days, quantity,
    refills_allowed, instructions, status, created_at, updated_at
)
SELECT 
    gen_random_uuid(), a.tenant_id, a.patient_id, a.doctor_id, a.id,
    CASE floor(random() * 5)
        WHEN 0 THEN 'Latanoprost Eye Drops'
        WHEN 1 THEN 'Prednisolone Acetate 1%'
        WHEN 2 THEN 'Artificial Tears'
        WHEN 3 THEN 'Azithromycin Eye Drops'
        ELSE 'Timolol Maleate 0.5%'
    END,
    CASE floor(random() * 3)
        WHEN 0 THEN '1 drop'
        WHEN 1 THEN '2 drops'
        ELSE '1-2 drops'
    END,
    CASE floor(random() * 3)
        WHEN 0 THEN 'Once daily'
        WHEN 1 THEN 'Twice daily'
        ELSE 'Three times daily'
    END,
    (7 + floor(random() * 23))::integer, -- 7-30 days
    1,
    (floor(random() * 4))::integer, -- 0-3 refills
    'Apply to affected eye(s) as directed. Wash hands before use.',
    'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM appointment a
WHERE a.appointment_status = 'completed'
ORDER BY random()
LIMIT 30;

-- Lab Orders
INSERT INTO lab_order (
    id, tenant_id, patient_id, ordered_by_user_id, appointment_id,
    order_type, test_name, urgency, specimen_type, collection_date,
    status, created_at, updated_at
)
SELECT 
    gen_random_uuid(), a.tenant_id, a.patient_id, a.doctor_id, a.id,
    'Diagnostic Test',
    CASE floor(random() * 4)
        WHEN 0 THEN 'OCT Scan'
        WHEN 1 THEN 'Visual Field Test'
        WHEN 2 THEN 'Fundus Photography'
        ELSE 'A-Scan Biometry'
    END,
    CASE floor(random() * 3)
        WHEN 0 THEN 'Routine'
        WHEN 1 THEN 'Urgent'
        ELSE 'STAT'
    END,
    'Eye Imaging',
    a.appointment_date,
    CASE 
        WHEN a.appointment_date < CURRENT_DATE THEN 'completed'
        ELSE 'pending'
    END,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM appointment a
WHERE a.appointment_status IN ('scheduled', 'completed')
ORDER BY random()
LIMIT 40;

-- =====================================================
-- 6. CREATE BILLING & INSURANCE CLAIMS
-- =====================================================

-- Invoices (for completed appointments)
INSERT INTO invoice (
    id, tenant_id, patient_id, appointment_id, invoice_number, invoice_date,
    due_date, subtotal, tax_amount, discount_amount, total_amount, amount_paid,
    balance, payment_status, status, created_at, updated_at
)
SELECT 
    gen_random_uuid(), a.tenant_id, a.patient_id, a.id,
    'INV-' || LPAD((10000 + ROW_NUMBER() OVER (ORDER BY a.created_at))::text, 6, '0'),
    a.appointment_date,
    a.appointment_date + INTERVAL '30 days',
    (50 + floor(random() * 450))::decimal, -- $50-$500
    (5 + floor(random() * 45))::decimal, -- Tax
    0.00, -- Discount
    (55 + floor(random() * 495))::decimal, -- Total
    CASE 
        WHEN random() < 0.7 THEN (55 + floor(random() * 495))::decimal -- 70% paid in full
        ELSE (20 + floor(random() * 200))::decimal -- Partial payment
    END,
    CASE 
        WHEN random() < 0.7 THEN 0.00 -- Paid
        ELSE (35 + floor(random() * 295))::decimal -- Balance remaining
    END,
    CASE 
        WHEN random() < 0.7 THEN 'paid'
        WHEN random() < 0.85 THEN 'partial'
        ELSE 'pending'
    END,
    'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM appointment a
WHERE a.appointment_status = 'completed'
LIMIT 60;

-- Insurance Claims
INSERT INTO insurance_claim (
    id, tenant_id, patient_id, invoice_id, claim_number, claim_date,
    insurance_provider, policy_number, claim_amount, approved_amount,
    paid_amount, claim_status, status, created_at, updated_at
)
SELECT 
    i.id, i.tenant_id, i.patient_id, i.id,
    'CLM-' || LPAD((20000 + ROW_NUMBER() OVER (ORDER BY i.created_at))::text, 7, '0'),
    i.invoice_date,
    p.insurance_provider,
    p.insurance_policy_number,
    i.total_amount,
    (i.total_amount * (0.7 + random() * 0.3))::decimal, -- 70-100% approved
    CASE 
        WHEN random() < 0.6 THEN (i.total_amount * (0.7 + random() * 0.3))::decimal
        ELSE 0.00
    END,
    CASE 
        WHEN random() < 0.6 THEN 'paid'
        WHEN random() < 0.8 THEN 'approved'
        WHEN random() < 0.9 THEN 'pending'
        ELSE 'denied'
    END,
    'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM invoice i
JOIN patient p ON i.patient_id = p.id
WHERE p.insurance_provider IS NOT NULL
LIMIT 40;

-- =====================================================
-- DATA VALIDATION
-- =====================================================

DO $$
DECLARE
    v_tenant_count INTEGER;
    v_dept_count INTEGER;
    v_patient_count INTEGER;
    v_appointment_count INTEGER;
    v_clinical_note_count INTEGER;
    v_prescription_count INTEGER;
    v_invoice_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_tenant_count FROM tenant WHERE status = 'active';
    SELECT COUNT(*) INTO v_dept_count FROM department;
    SELECT COUNT(*) INTO v_patient_count FROM patient WHERE deleted_at IS NULL;
    SELECT COUNT(*) INTO v_appointment_count FROM appointment WHERE deleted_at IS NULL;
    SELECT COUNT(*) INTO v_clinical_note_count FROM clinical_note;
    SELECT COUNT(*) INTO v_prescription_count FROM prescription;
    SELECT COUNT(*) INTO v_invoice_count FROM invoice;
    
    RAISE NOTICE '========== SAMPLE DATA SUMMARY ==========';
    RAISE NOTICE '✅ Total Tenants: %', v_tenant_count;
    RAISE NOTICE '✅ Total Departments: %', v_dept_count;
    RAISE NOTICE '✅ Total Patients: %', v_patient_count;
    RAISE NOTICE '✅ Total Appointments: %', v_appointment_count;
    RAISE NOTICE '✅ Total Clinical Notes: %', v_clinical_note_count;
    RAISE NOTICE '✅ Total Prescriptions: %', v_prescription_count;
    RAISE NOTICE '✅ Total Invoices: %', v_invoice_count;
    RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- MIGRATION 05 COMPLETE
-- =====================================================
-- Comprehensive sample data created!
-- System ready for realistic testing and demos
-- =====================================================
