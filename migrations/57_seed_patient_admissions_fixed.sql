-- =====================================================================
-- Patient Admissions Seed Data (FIXED)
-- Version: 57-FIXED
-- Purpose: Create 15 patient admission records (IPD, Daycare, Emergency)
-- Schema: Matches actual patient_admissions table structure
-- =====================================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_branch_id UUID;
    v_user_id UUID;
    v_patient_ids UUID[];
    v_session_ids UUID[];
    v_doctor_ids UUID[];
BEGIN
    -- Get first available tenant, branch, and user
    SELECT id INTO v_tenant_id FROM tenant LIMIT 1;
    SELECT id INTO v_branch_id FROM branch WHERE tenant_id = v_tenant_id LIMIT 1;
    SELECT id INTO v_user_id FROM users LIMIT 1;
    
    -- Get patient IDs
    SELECT ARRAY_AGG(id ORDER BY medical_record_number) INTO v_patient_ids
    FROM patient WHERE tenant_id = v_tenant_id AND medical_record_number LIKE 'MRN%' LIMIT 20;
    
    -- Get counseling session IDs
    SELECT ARRAY_AGG(id ORDER BY session_number) INTO v_session_ids
    FROM counseling_sessions WHERE tenant_id = v_tenant_id AND session_number LIKE 'CS-%' LIMIT 15;
    
    -- Get doctor IDs (with fallback if user_roles table doesn't exist)
    BEGIN
        SELECT ARRAY_AGG(DISTINCT u.id) INTO v_doctor_ids
        FROM users u
        INNER JOIN user_roles ur ON u.id = ur.user_id
        INNER JOIN roles r ON ur.role_id = r.id
        WHERE r.name ILIKE '%doctor%' AND r.tenant_id = v_tenant_id
        LIMIT 10;
    EXCEPTION WHEN OTHERS THEN
        -- Fallback: just use some user IDs
        SELECT ARRAY_AGG(id) INTO v_doctor_ids FROM users LIMIT 5;
    END;
    
    -- Fallbacks
    IF v_tenant_id IS NULL THEN
        v_tenant_id := '11b26293-9d9c-4633-927e-3294bff2a8d7'::UUID;
    END IF;
    
    IF v_branch_id IS NULL THEN
        SELECT id INTO v_branch_id FROM branch LIMIT 1;
    END IF;
    
    IF v_user_id IS NULL THEN
        v_user_id := '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81'::UUID;
    END IF;
    
    IF v_patient_ids IS NULL OR array_length(v_patient_ids, 1) IS NULL THEN
        RAISE EXCEPTION 'No patients found. Please run 20_seed_patients.sql first';
    END IF;
    
    IF v_doctor_ids IS NULL OR array_length(v_doctor_ids, 1) IS NULL THEN
        v_doctor_ids := ARRAY[v_user_id];
    END IF;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SEEDING 15 PATIENT ADMISSIONS';
    RAISE NOTICE 'Tenant: %, Branch: %', v_tenant_id, v_branch_id;
    RAISE NOTICE 'Patients: %, Sessions: %, Doctors: %',
                 array_length(v_patient_ids, 1),
                 COALESCE(array_length(v_session_ids, 1), 0),
                 array_length(v_doctor_ids, 1);
    RAISE NOTICE '========================================';
    
    -- Delete existing sample admissions
    DELETE FROM patient_admissions WHERE admission_number LIKE 'ADM-%' AND tenant_id = v_tenant_id;
    
    -- =====================================================================
    -- Insert 15 Patient Admissions
    -- =====================================================================
    
    -- 1-3: IPD Admissions - Currently Admitted (No discharge yet)
    INSERT INTO patient_admissions (
        id, tenant_id, branch_id, patient_id, session_id,
        admission_number, admission_type, admission_date, admission_time,
        surgery_type, surgery_date, eye_operated,
        admission_status, admitting_doctor_id, primary_nurse_id,
        attendant_name, attendant_phone, attendant_relation,
        admission_deposit_paid, final_bill_amount, final_settlement_status,
        scheduled_discharge_time,
        created_at, created_by_user_id, updated_at, updated_by_user_id
    )
    SELECT
        gen_random_uuid(),
        v_tenant_id,
        v_branch_id,
        v_patient_ids[(i % array_length(v_patient_ids, 1)) + 1],
        CASE WHEN v_session_ids IS NOT NULL AND array_length(v_session_ids, 1) >= i 
             THEN v_session_ids[i] ELSE NULL END,
        'ADM-IPD-' || TO_CHAR(CURRENT_DATE - INTERVAL '2 days', 'YYYYMMDD') || '-' || LPAD(i::TEXT, 4, '0'),
        'IPD',
        CURRENT_DATE - INTERVAL '2 days',
        TIME '08:30:00' + ((i * 30) * INTERVAL '1 minute'),
        CASE (i % 3)
            WHEN 0 THEN 'Phacoemulsification with IOL'
            WHEN 1 THEN 'Vitrectomy'
            ELSE 'Trabeculectomy'
        END,
        CURRENT_DATE + INTERVAL '1 day',
        CASE (i % 3) WHEN 0 THEN 'OD' WHEN 1 THEN 'OS' ELSE 'OD' END,
        'Admitted',
        v_doctor_ids[(i % array_length(v_doctor_ids, 1)) + 1],
        v_user_id,
        'Attendant Name ' || i,
        '+91' || LPAD((9000000000::BIGINT + i)::TEXT, 10, '0'),
        CASE (i % 4) WHEN 0 THEN 'Spouse' WHEN 1 THEN 'Son' WHEN 2 THEN 'Daughter' ELSE 'Parent' END,
        10000::NUMERIC,
        NULL,
        NULL,
        (CURRENT_DATE + INTERVAL '4 days')::TIMESTAMP + TIME '10:00:00',
        CURRENT_DATE - INTERVAL '2 days' + TIME '08:30:00' + ((i * 30) * INTERVAL '1 minute'),
        v_user_id,
        CURRENT_DATE - INTERVAL '2 days' + TIME '08:30:00' + ((i * 30) * INTERVAL '1 minute'),
        v_user_id
    FROM generate_series(1, 3) AS i;
    
    -- 4-6: IPD Admissions - Discharged
    INSERT INTO patient_admissions (
        id, tenant_id, branch_id, patient_id, session_id,
        admission_number, admission_type, admission_date, admission_time,
        surgery_type, surgery_date, eye_operated,
        admission_status, admitting_doctor_id, discharged_by_user_id, primary_nurse_id,
        attendant_name, attendant_phone, attendant_relation,
        actual_discharge_date, actual_discharge_time,
        discharge_instructions,
        admission_deposit_paid, final_bill_amount, final_settlement_status,
        created_at, created_by_user_id, updated_at, updated_by_user_id
    )
    SELECT
        gen_random_uuid(),
        v_tenant_id,
        v_branch_id,
        v_patient_ids[((i + 3) % array_length(v_patient_ids, 1)) + 1],
        CASE WHEN v_session_ids IS NOT NULL AND array_length(v_session_ids, 1) >= (i+3) 
             THEN v_session_ids[i+3] ELSE NULL END,
        'ADM-IPD-' || TO_CHAR(CURRENT_DATE - INTERVAL '10 days', 'YYYYMMDD') || '-' || LPAD((i+3)::TEXT, 4, '0'),
        'IPD',
        CURRENT_DATE - INTERVAL '10 days',
        TIME '09:00:00' + ((i * 45) * INTERVAL '1 minute'),
        CASE (i % 4)
            WHEN 0 THEN 'Phacoemulsification with IOL'
            WHEN 1 THEN 'ECCE with IOL'
            WHEN 2 THEN 'Vitrectomy'
            ELSE 'Retinal Detachment Repair'
        END,
        CURRENT_DATE - INTERVAL '9 days',
        CASE (i % 3) WHEN 0 THEN 'OD' WHEN 1 THEN 'OS' ELSE 'OU' END,
        'Discharged',
        v_doctor_ids[((i + 1) % array_length(v_doctor_ids, 1)) + 1],
        v_doctor_ids[(i % array_length(v_doctor_ids, 1)) + 1],
        v_user_id,
        'Relative ' || (i + 3),
        '+91' || LPAD((9100000000::BIGINT + i)::TEXT, 10, '0'),
        CASE (i % 3) WHEN 0 THEN 'Son' WHEN 1 THEN 'Daughter' ELSE 'Spouse' END,
        (CURRENT_DATE - INTERVAL '7 days')::DATE,
        TIME '14:00:00' + ((i * 30) * INTERVAL '1 minute'),
        'Post-operative care: Continue antibiotic drops 4 times daily. Avoid water contact for 2 weeks. Follow-up on ' || TO_CHAR(CURRENT_DATE + INTERVAL '7 days', 'DD-Mon-YYYY') || '. Wear protective eye shield at night.',
        15000::NUMERIC,
        (45000 + (i * 5000))::NUMERIC,
        'Completed',
        CURRENT_DATE - INTERVAL '10 days' + TIME '09:00:00' + ((i * 45) * INTERVAL '1 minute'),
        v_user_id,
        CURRENT_DATE - INTERVAL '7 days' + TIME '14:00:00' + ((i * 30) * INTERVAL '1 minute'),
        v_user_id
    FROM generate_series(1, 3) AS i;
    
    -- 7-12: Day Care Admissions (All discharged same day)
    INSERT INTO patient_admissions (
        id, tenant_id, branch_id, patient_id, session_id,
        admission_number, admission_type, admission_date, admission_time,
        surgery_type, surgery_date, eye_operated,
        admission_status, admitting_doctor_id, discharged_by_user_id,
        attendant_name, attendant_phone, attendant_relation,
        actual_discharge_date, actual_discharge_time,
        discharge_instructions,
        admission_deposit_paid, final_bill_amount, final_settlement_status,
        created_at, created_by_user_id, updated_at, updated_by_user_id
    )
    SELECT
        gen_random_uuid(),
        v_tenant_id,
        v_branch_id,
        v_patient_ids[((i + 6) % array_length(v_patient_ids, 1)) + 1],
        CASE WHEN v_session_ids IS NOT NULL AND array_length(v_session_ids, 1) >= (i+6) 
             THEN v_session_ids[i+6] ELSE NULL END,
        'ADM-DAY-' || TO_CHAR(CURRENT_DATE - ((i % 5) * INTERVAL '1 day'), 'YYYYMMDD') || '-' || LPAD((i+6)::TEXT, 4, '0'),
        'DayCare',
        CURRENT_DATE - ((i % 5) * INTERVAL '1 day'),
        TIME '07:30:00' + ((i * 20) * INTERVAL '1 minute'),
        CASE (i % 5)
            WHEN 0 THEN 'Phacoemulsification with IOL'
            WHEN 1 THEN 'YAG Laser Capsulotomy'
            WHEN 2 THEN 'Intravitreal Injection'
            WHEN 3 THEN 'Pterygium Excision'
            ELSE 'Chalazion Excision'
        END,
        CURRENT_DATE - ((i % 5) * INTERVAL '1 day'),
        CASE (i % 3) WHEN 0 THEN 'OD' WHEN 1 THEN 'OS' ELSE 'OD' END,
        'Discharged',
        v_doctor_ids[(i % array_length(v_doctor_ids, 1)) + 1],
        v_doctor_ids[((i + 1) % array_length(v_doctor_ids, 1)) + 1],
        'Attendant Daycare ' || (i + 6),
        '+91' || LPAD((9200000000::BIGINT + i)::TEXT, 10, '0'),
        CASE (i % 4) WHEN 0 THEN 'Spouse' WHEN 1 THEN 'Son' WHEN 2 THEN 'Friend' ELSE 'Sibling' END,
        CURRENT_DATE - ((i % 5) * INTERVAL '1 day'),
        TIME '16:00:00' + ((i * 30) * INTERVAL '1 minute'),
        'Day care discharge: Rest for 24 hours. Start eye drops as prescribed. No heavy lifting. Follow-up in 1 week.',
        5000::NUMERIC,
        (12000 + (i * 2000))::NUMERIC,
        CASE (i % 3) WHEN 0 THEN 'Completed' WHEN 1 THEN 'Completed' ELSE 'Completed' END,
        CURRENT_DATE - ((i % 5) * INTERVAL '1 day') + TIME '07:30:00' + ((i * 20) * INTERVAL '1 minute'),
        v_user_id,
        CURRENT_DATE - ((i % 5) * INTERVAL '1 day') + TIME '16:00:00' + ((i * 30) * INTERVAL '1 minute'),
        v_user_id
    FROM generate_series(1, 6) AS i;
    
    -- 13-15: Emergency Admissions (All currently admitted)
    INSERT INTO patient_admissions (
        id, tenant_id, branch_id, patient_id, session_id,
        admission_number, admission_type, admission_date, admission_time,
        surgery_type, surgery_date, eye_operated,
        admission_status, admitting_doctor_id, primary_nurse_id,
        attendant_name, attendant_phone, attendant_relation,
        admission_deposit_paid, final_bill_amount, final_settlement_status,
        discharge_instructions,
        created_at, created_by_user_id, updated_at, updated_by_user_id
    )
    SELECT
        gen_random_uuid(),
        v_tenant_id,
        v_branch_id,
        v_patient_ids[((i + 12) % array_length(v_patient_ids, 1)) + 1],
        CASE WHEN v_session_ids IS NOT NULL AND array_length(v_session_ids, 1) >= (i+12) 
             THEN v_session_ids[i+12] ELSE NULL END,
        'ADM-EMR-' || TO_CHAR(CURRENT_DATE - INTERVAL '1 day', 'YYYYMMDD') || '-' || LPAD((i+12)::TEXT, 4, '0'),
        'Emergency',
        CURRENT_DATE - INTERVAL '1 day',
        TIME '20:00:00' + ((i * 90) * INTERVAL '1 minute'),
        CASE (i % 3)
            WHEN 0 THEN 'Vitrectomy'
            WHEN 1 THEN 'Corneal Foreign Body Removal'
            ELSE 'Retinal Detachment Repair'
        END,
        CURRENT_DATE,
        CASE (i % 2) WHEN 0 THEN 'OD' ELSE 'OS' END,
        'Admitted',
        v_doctor_ids[(i % array_length(v_doctor_ids, 1)) + 1],
        v_user_id,
        'Emergency Contact ' || (i + 12),
        '+91' || LPAD((9300000000::BIGINT + i)::TEXT, 10, '0'),
        CASE (i % 3) WHEN 0 THEN 'Parent' WHEN 1 THEN 'Spouse' ELSE 'Friend' END,
        8000::NUMERIC,
        NULL,
        NULL,
        NULL,
        CURRENT_DATE - INTERVAL '1 day' + TIME '20:00:00' + ((i * 90) * INTERVAL '1 minute'),
        v_user_id,
        CURRENT_DATE - INTERVAL '1 day' + TIME '20:00:00' + ((i * 90) * INTERVAL '1 minute'),
        v_user_id
    FROM generate_series(1, 3) AS i;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'COMPLETED: Patient admissions seeded';
    RAISE NOTICE '========================================';
END $$;

-- Verification queries
SELECT 'Patient Admissions by Type' AS report, admission_type, COUNT(*) AS count
FROM patient_admissions
WHERE admission_number LIKE 'ADM-%'
GROUP BY admission_type
ORDER BY admission_type;

SELECT 'Patient Admissions by Status' AS report, admission_status, COUNT(*) AS count
FROM patient_admissions
WHERE admission_number LIKE 'ADM-%'
GROUP BY admission_status
ORDER BY admission_status;

SELECT 'Patient Admissions by Surgery Type' AS report, 
       surgery_type, 
       COUNT(*) AS count
FROM patient_admissions
WHERE admission_number LIKE 'ADM-%'
GROUP BY surgery_type
ORDER BY count DESC
LIMIT 5;

SELECT 'Settlement Status' AS report, 
       final_settlement_status, 
       COUNT(*) AS count,
       SUM(final_bill_amount) AS total_amount
FROM patient_admissions
WHERE admission_number LIKE 'ADM-%' AND final_settlement_status IS NOT NULL
GROUP BY final_settlement_status;
