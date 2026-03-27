-- =====================================================================
-- Counseling Sessions Seed Data
-- Version: 54
-- Purpose: Create 30 sample counseling sessions across different statuses
-- Prerequisite: Run 20_seed_patients.sql and 53_seed_master_data_final.sql
-- =====================================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_branch_id UUID;
    v_user_id UUID;
    v_patient_ids UUID[];
    v_doctor_ids UUID[];
    v_counselor_ids UUID[];
    v_surgery_ids UUID[];
BEGIN
    -- Get first available tenant, branch, and user
    SELECT id INTO v_tenant_id FROM tenant LIMIT 1;
    SELECT id INTO v_branch_id FROM branch WHERE tenant_id = v_tenant_id LIMIT 1;
    SELECT id INTO v_user_id FROM users LIMIT 1;
    
    -- Get patient IDs (assumes 20_seed_patients.sql has run)
    SELECT ARRAY_AGG(id ORDER BY medical_record_number) INTO v_patient_ids
    FROM patient WHERE tenant_id = v_tenant_id AND medical_record_number LIKE 'MRN%' LIMIT 30;
    
    -- Get doctor IDs (users with doctor role)
    SELECT ARRAY_AGG(DISTINCT u.id) INTO v_doctor_ids
    FROM users u
    INNER JOIN user_roles ur ON u.id = ur.user_id
    INNER JOIN roles r ON ur.role_id = r.id
    WHERE r.name ILIKE '%doctor%' AND r.tenant_id = v_tenant_id
    LIMIT 10;
    
    -- Get counselor IDs (users with counselor role)
    SELECT ARRAY_AGG(DISTINCT u.id) INTO v_counselor_ids
    FROM users u
    INNER JOIN user_roles ur ON u.id = ur.user_id
    INNER JOIN roles r ON ur.role_id = r.id
    WHERE r.name ILIKE '%counsel%' AND r.tenant_id = v_tenant_id
    LIMIT 5;
    
    -- Get surgery type IDs
    SELECT ARRAY_AGG(id) INTO v_surgery_ids
    FROM surgery_types WHERE tenant_id = v_tenant_id AND is_active = true
    LIMIT 15;
    
    -- Fallback if no data found
    IF v_tenant_id IS NULL THEN
        v_tenant_id := '11b26293-9d9c-4633-927e-3294bff2a8d7'::UUID;
    END IF;
    
    IF v_branch_id IS NULL THEN
        SELECT id INTO v_branch_id FROM branch LIMIT 1;
    END IF;
    
    IF v_user_id IS NULL THEN
        v_user_id := 'dddddddd-dddd-dddd-dddd-dddddddddddd'::UUID;
    END IF;
    
    IF v_patient_ids IS NULL OR array_length(v_patient_ids, 1) IS NULL THEN
        RAISE EXCEPTION 'No patients found. Please run 20_seed_patients.sql first';
    END IF;
    
    IF v_doctor_ids IS NULL OR array_length(v_doctor_ids, 1) IS NULL THEN
        -- Use generic user ID if no doctors found
        v_doctor_ids := ARRAY[v_user_id];
    END IF;
    
    IF v_counselor_ids IS NULL OR array_length(v_counselor_ids, 1) IS NULL THEN
        -- Use generic user ID if no counselors found
        v_counselor_ids := ARRAY[v_user_id];
    END IF;
    
    IF v_surgery_ids IS NULL OR array_length(v_surgery_ids, 1) IS NULL THEN
        RAISE NOTICE 'No surgery types found. Please run 53_seed_master_data_final.sql first';
        -- Continue without surgery types - optional field
    END IF;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SEEDING 30 COUNSELING SESSIONS';
    RAISE NOTICE 'Tenant: %, Branch: %', v_tenant_id, v_branch_id;
    RAISE NOTICE 'Patients: %, Doctors: %, Counselors: %', 
                 array_length(v_patient_ids, 1), 
                 array_length(v_doctor_ids, 1),
                 array_length(v_counselor_ids, 1);
    RAISE NOTICE '========================================';
    
    -- Delete existing sample sessions to avoid duplicates
    DELETE FROM counseling_sessions WHERE session_number LIKE 'CS-%' AND tenant_id = v_tenant_id;
    
    -- =====================================================================
    -- Insert 30 Counseling Sessions (Mix of statuses and types)
    -- =====================================================================
    
    -- Scheduled Sessions (8 sessions - today and future)
    INSERT INTO counseling_sessions (
        id, tenant_id, branch_id, patient_id, referred_by_doctor_id, counselor_id,
        session_number, session_type, session_date, patient_type, 
        clinical_summary, recommended_surgery, urgency, 
        patient_agreed_to_surgery, pending_decision, status,
        created_at, updated_at, created_by_user_id, updated_by_user_id
    )
    SELECT
        gen_random_uuid(),
        v_tenant_id,
        v_branch_id,
        v_patient_ids[(i % array_length(v_patient_ids, 1)) + 1],
        v_doctor_ids[(i % GREATEST(array_length(v_doctor_ids, 1), 1)) + 1],
        v_counselor_ids[(i % GREATEST(array_length(v_counselor_ids, 1), 1)) + 1],
        'CS-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(i::TEXT, 4, '0'),
        CASE (i % 4)
            WHEN 0 THEN 'Pre-Surgery'
            WHEN 1 THEN 'Financial'
            WHEN 2 THEN 'Insurance'
            ELSE 'General'
        END,
        CURRENT_DATE + ((i % 7) * INTERVAL '1 day'),
        CASE (i % 4)
            WHEN 0 THEN 'IPD Admission'
            WHEN 1 THEN 'Daycare'
            WHEN 2 THEN 'Emergency'
            ELSE 'Follow-up'
        END,
        CASE (i % 3)
            WHEN 0 THEN 'Patient presents with decreased vision in right eye. Cataract surgery recommended.'
            WHEN 1 THEN 'Glaucoma progression noted. Surgical intervention required to prevent vision loss.'
            ELSE 'Routine pre-operative counseling for scheduled cataract surgery.'
        END,
        CASE 
            WHEN v_surgery_ids IS NOT NULL AND array_length(v_surgery_ids, 1) > 0 
            THEN (SELECT surgery_name FROM surgery_types WHERE id = v_surgery_ids[(i % array_length(v_surgery_ids, 1)) + 1])
            ELSE 'Phacoemulsification with IOL'
        END,
        CASE (i % 3)
            WHEN 0 THEN 'Routine'
            WHEN 1 THEN 'Urgent'
            ELSE 'Emergency'
        END,
        false,
        CASE WHEN (i % 3) = 1 THEN true ELSE false END,
        'Scheduled',
        NOW() - ((i % 5) * INTERVAL '1 day'),
        NOW() - ((i % 5) * INTERVAL '1 day'),
        v_user_id,
        v_user_id
    FROM generate_series(1, 8) AS i;
    
    -- In Progress Sessions (5 sessions - currently active)
    INSERT INTO counseling_sessions (
        id, tenant_id, branch_id, patient_id, referred_by_doctor_id, counselor_id,
        session_number, session_type, session_date, session_start_time, patient_type,
        clinical_summary, recommended_surgery, urgency, 
        package_discussed, patient_agreed_to_surgery, status,
        created_at, updated_at, created_by_user_id, updated_by_user_id
    )
    SELECT
        gen_random_uuid(),
        v_tenant_id,
        v_branch_id,
        v_patient_ids[(i % array_length(v_patient_ids, 1)) + 1],
        v_doctor_ids[(i % GREATEST(array_length(v_doctor_ids, 1), 1)) + 1],
        v_counselor_ids[(i % GREATEST(array_length(v_counselor_ids, 1), 1)) + 1],
        'CS-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD((1000 + i)::TEXT, 4, '0'),
        CASE (i % 3)
            WHEN 0 THEN 'Pre-Surgery'
            WHEN 1 THEN 'Financial'
            ELSE 'Insurance'
        END,
        CURRENT_DATE,
        NOW() - ((30 + (i * 15)) * INTERVAL '1 minute'),
        CASE (i % 3)
            WHEN 0 THEN 'IPD Admission'
            WHEN 1 THEN 'Daycare'
            ELSE 'Emergency'
        END,
        'Detailed counseling in progress. Discussing surgical options and package details.',
        CASE 
            WHEN v_surgery_ids IS NOT NULL AND array_length(v_surgery_ids, 1) > 0 
            THEN (SELECT surgery_name FROM surgery_types WHERE id = v_surgery_ids[(i % array_length(v_surgery_ids, 1)) + 1])
            ELSE 'LASIK'
        END,
        'Routine',
        true,
        false,
        'InProgress',
        NOW() - (2 * INTERVAL '1 hour'),
        NOW() - (30 * INTERVAL '1 minute'),
        v_user_id,
        v_user_id
    FROM generate_series(9, 13) AS i;
    
    -- Completed Sessions (12 sessions - past 7 days)
    INSERT INTO counseling_sessions (
        id, tenant_id, branch_id, patient_id, referred_by_doctor_id, counselor_id,
        session_number, session_type, session_date, 
        session_start_time, session_end_time, duration_minutes,
        patient_type, clinical_summary, recommended_surgery, 
        recommended_iol, iol_power, urgency, 
        package_discussed, patient_agreed_to_surgery, decision_date,
        status, created_at, updated_at, created_by_user_id, updated_by_user_id
    )
    SELECT
        gen_random_uuid(),
        v_tenant_id,
        v_branch_id,
        v_patient_ids[(i % array_length(v_patient_ids, 1)) + 1],
        v_doctor_ids[(i % GREATEST(array_length(v_doctor_ids, 1), 1)) + 1],
        v_counselor_ids[(i % GREATEST(array_length(v_counselor_ids, 1), 1)) + 1],
        'CS-' || TO_CHAR(CURRENT_DATE - ((i % 7) * INTERVAL '1 day'), 'YYYYMMDD') || '-' || LPAD((2000 + i)::TEXT, 4, '0'),
        CASE (i % 5)
            WHEN 0 THEN 'Pre-Surgery'
            WHEN 1 THEN 'Post-Surgery'
            WHEN 2 THEN 'Financial'
            WHEN 3 THEN 'Insurance'
            ELSE 'General'
        END,
        CURRENT_DATE - ((i % 7) * INTERVAL '1 day'),
        (CURRENT_DATE - ((i % 7) * INTERVAL '1 day')) + TIME '09:00:00' + ((i * 30) * INTERVAL '1 minute'),
        (CURRENT_DATE - ((i % 7) * INTERVAL '1 day')) + TIME '09:00:00' + ((i * 30 + 25) * INTERVAL '1 minute'),
        25 + (i % 20),
        CASE (i % 4)
            WHEN 0 THEN 'IPD Admission'
            WHEN 1 THEN 'Daycare'
            WHEN 2 THEN 'Emergency'
            ELSE 'Follow-up'
        END,
        CASE (i % 4)
            WHEN 0 THEN 'Completed counseling. Patient educated about cataract surgery procedure, risks, and benefits.'
            WHEN 1 THEN 'Financial counseling completed. Insurance verification done. Patient agreed to package.'
            WHEN 2 THEN 'Post-operative counseling. Patient recovery progressing well. Follow-up scheduled.'
            ELSE 'General counseling for eye care and preventive measures discussed.'
        END,
        CASE 
            WHEN v_surgery_ids IS NOT NULL AND array_length(v_surgery_ids, 1) > 0 
            THEN (SELECT surgery_name FROM surgery_types WHERE id = v_surgery_ids[(i % array_length(v_surgery_ids, 1)) + 1])
            ELSE 'Phacoemulsification with IOL'
        END,
        CASE (i % 3)
            WHEN 0 THEN 'Monofocal IOL'
            WHEN 1 THEN 'Multifocal IOL'
            ELSE 'Toric IOL'
        END,
        CASE (i % 3)
            WHEN 0 THEN '+20.5 D'
            WHEN 1 THEN '+22.0 D'
            ELSE '+19.5 D'
        END,
        'Routine',
        true,
        CASE WHEN (i % 2) = 0 THEN true ELSE false END,
        CASE WHEN (i % 2) = 0 THEN CURRENT_DATE + (7 * INTERVAL '1 day') ELSE NULL END,
        'Completed',
        NOW() - ((i % 7 + 1) * INTERVAL '1 day'),
        NOW() - ((i % 7) * INTERVAL '1 day'),
        v_user_id,
        v_user_id
    FROM generate_series(14, 25) AS i;
    
    -- Cancelled Sessions (3 sessions)
    INSERT INTO counseling_sessions (
        id, tenant_id, branch_id, patient_id, referred_by_doctor_id, counselor_id,
        session_number, session_type, session_date, patient_type,
        clinical_summary, reasons_for_delay, status,
        created_at, updated_at, created_by_user_id, updated_by_user_id
    )
    SELECT
        gen_random_uuid(),
        v_tenant_id,
        v_branch_id,
        v_patient_ids[(i % array_length(v_patient_ids, 1)) + 1],
        v_doctor_ids[(i % GREATEST(array_length(v_doctor_ids, 1), 1)) + 1],
        v_counselor_ids[(i % GREATEST(array_length(v_counselor_ids, 1), 1)) + 1],
        'CS-' || TO_CHAR(CURRENT_DATE - ((i % 3) * INTERVAL '1 day'), 'YYYYMMDD') || '-' || LPAD((3000 + i)::TEXT, 4, '0'),
        'Pre-Surgery',
        CURRENT_DATE - ((i % 3) * INTERVAL '1 day'),
        'IPD Admission',
        'Session scheduled but cancelled.',
        CASE (i % 3)
            WHEN 0 THEN 'Patient requested reschedule due to personal reasons'
            WHEN 1 THEN 'Medical emergency - patient admitted'
            ELSE 'Patient came without requisite documents'
        END,
        'Cancelled',
        NOW() - ((i % 3 + 1) * INTERVAL '1 day'),
        NOW() - ((i % 3) * INTERVAL '1 day'),
        v_user_id,
        v_user_id
    FROM generate_series(26, 28) AS i;
    
    -- Pending Decision Sessions (2 sessions)
    INSERT INTO counseling_sessions (
        id, tenant_id, branch_id, patient_id, referred_by_doctor_id, counselor_id,
        session_number, session_type, session_date, 
        session_start_time, session_end_time, duration_minutes,
        patient_type, clinical_summary, recommended_surgery, urgency,
        package_discussed, patient_agreed_to_surgery, pending_decision,
        reasons_for_delay, status,
        created_at, updated_at, created_by_user_id, updated_by_user_id
    )
    SELECT
        gen_random_uuid(),
        v_tenant_id,
        v_branch_id,
        v_patient_ids[(i % array_length(v_patient_ids, 1)) + 1],
        v_doctor_ids[(i % GREATEST(array_length(v_doctor_ids, 1), 1)) + 1],
        v_counselor_ids[(i % GREATEST(array_length(v_counselor_ids, 1), 1)) + 1],
        'CS-' || TO_CHAR(CURRENT_DATE - (1 * INTERVAL '1 day'), 'YYYYMMDD') || '-' || LPAD((4000 + i)::TEXT, 4, '0'),
        'Financial',
        CURRENT_DATE - (1 * INTERVAL '1 day'),
        (CURRENT_DATE - (1 * INTERVAL '1 day')) + TIME '10:00:00',
        (CURRENT_DATE - (1 * INTERVAL '1 day')) + TIME '10:35:00',
        35,
        'Daycare',
        'Financial counseling completed. Patient needs time to arrange funds.',
        CASE 
            WHEN v_surgery_ids IS NOT NULL AND array_length(v_surgery_ids, 1) > 0 
            THEN (SELECT surgery_name FROM surgery_types WHERE id = v_surgery_ids[(i % array_length(v_surgery_ids, 1)) + 1])
            ELSE 'Phacoemulsification with IOL'
        END,
        'Routine',
        true,
        false,
        true,
        CASE (i % 2)
            WHEN 0 THEN 'Patient needs to arrange funds - will confirm in 3 days'
            ELSE 'Patient discussing with family members before decision'
        END,
        'Completed',
        NOW() - (2 * INTERVAL '1 day'),
        NOW() - (1 * INTERVAL '1 day'),
        v_user_id,
        v_user_id
    FROM generate_series(29, 30) AS i;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ COUNSELING SESSIONS SEEDING COMPLETE';
    RAISE NOTICE '✅ Created 8 Scheduled sessions';
    RAISE NOTICE '✅ Created 5 InProgress sessions';
    RAISE NOTICE '✅ Created 12 Completed sessions';
    RAISE NOTICE '✅ Created 3 Cancelled sessions';
    RAISE NOTICE '✅ Created 2 Pending Decision sessions';
    RAISE NOTICE '========================================';
END $$;

-- Verify
SELECT 
    status,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE session_date = CURRENT_DATE) as today_count
FROM counseling_sessions
WHERE session_number LIKE 'CS-%'
GROUP BY status
ORDER BY status;

SELECT 
    session_type,
    patient_type,
    COUNT(*) as count
FROM counseling_sessions
WHERE session_number LIKE 'CS-%'
GROUP BY session_type, patient_type
ORDER BY session_type, patient_type;
