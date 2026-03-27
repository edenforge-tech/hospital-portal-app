-- =====================================================================
-- Patient Admissions Seed Data
-- Version: 57
-- Purpose: Create 15 patient admission records (IPD, Daycare, Emergency)
-- Prerequisite: Run 20_seed_patients.sql, 53_seed_master_data_final.sql, 54_seed_counseling_sessions.sql
-- =====================================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_branch_id UUID;
    v_user_id UUID;
    v_patient_ids UUID[];
    v_session_ids UUID[];
    v_doctor_ids UUID[];
    v_surgery_ids UUID[];
    v_anesthesia_ids UUID[];
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
    
    -- Get doctor IDs
    SELECT ARRAY_AGG(DISTINCT u.id) INTO v_doctor_ids
    FROM users u
    INNER JOIN user_roles ur ON u.id = ur.user_id
    INNER JOIN roles r ON ur.role_id = r.id
    WHERE r.name ILIKE '%doctor%' AND r.tenant_id = v_tenant_id
    LIMIT 10;
    
    -- Get surgery type IDs
    SELECT ARRAY_AGG(id ORDER BY display_order) INTO v_surgery_ids
    FROM surgery_types WHERE tenant_id = v_tenant_id AND is_active = true LIMIT 15;
    
    -- Get anesthesia type IDs
    SELECT ARRAY_AGG(id ORDER BY display_order) INTO v_anesthesia_ids
    FROM anesthesia_types WHERE tenant_id = v_tenant_id AND is_active = true;
    
    -- Fallbacks
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
        v_doctor_ids := ARRAY[v_user_id];
    END IF;
    
    IF v_surgery_ids IS NULL OR array_length(v_surgery_ids, 1) IS NULL THEN
        RAISE EXCEPTION 'No surgery types found. Please run 53_seed_master_data_final.sql first';
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
    
    -- IPD Admissions (6 records - some admitted, some discharged)
    INSERT INTO patient_admissions (
        id, tenant_id, branch_id, patient_id, session_id,
        admission_number, admission_type, admission_date, admission_time,
        attending_doctor_id, surgery_scheduled_date, planned_surgery_type_id,
        planned_anesthesia_type_id, pre_auth_required, room_category,
        estimated_stay_days, clinical_notes, status,
        created_at, updated_at, created_by_user_id, updated_by_user_id
    )
    SELECT
        gen_random_uuid(),
        v_tenant_id,
        v_branch_id,
        v_patient_ids[(i % array_length(v_patient_ids, 1)) + 1],
        CASE 
            WHEN v_session_ids IS NOT NULL AND array_length(v_session_ids, 1) >= i 
            THEN v_session_ids[i]
            ELSE NULL
        END,
        'ADM-IPD-' || TO_CHAR(CURRENT_DATE - ((i % 5) * INTERVAL '1 day'), 'YYYYMMDD') || '-' || LPAD(i::TEXT, 4, '0'),
        'IPD',
        CURRENT_DATE - ((i % 5) * INTERVAL '1 day'),
        (CURRENT_DATE - ((i % 5) * INTERVAL '1 day')) + TIME '08:00:00' + ((i * 30) * INTERVAL '1 minute'),
        v_doctor_ids[(i % array_length(v_doctor_ids, 1)) + 1],
        CURRENT_DATE + ((i % 3) * INTERVAL '1 day'),
        v_surgery_ids[(i % array_length(v_surgery_ids, 1)) + 1],
        CASE 
            WHEN v_anesthesia_ids IS NOT NULL AND array_length(v_anesthesia_ids, 1) > 0
            THEN v_anesthesia_ids[(i % array_length(v_anesthesia_ids, 1)) + 1]
            ELSE NULL
        END,
        CASE WHEN (i % 2) = 0 THEN true ELSE false END,
        CASE (i % 3)
            WHEN 0 THEN 'General Ward'
            WHEN 1 THEN 'Semi-Private'
            ELSE 'Private'
        END,
        2 + (i % 3),
        'Patient admitted for scheduled cataract surgery. Pre-operative workup completed.',
        CASE 
            WHEN i <= 3 THEN 'Admitted'
            ELSE 'Discharged'
        END,
        NOW() - ((i % 5) * INTERVAL '1 day'),
        NOW() - ((i % 5) * INTERVAL '1 day'),
        v_user_id,
        v_user_id
    FROM generate_series(1, 6) AS i;
    
    -- Update discharge details for discharged IPD patients
    UPDATE patient_admissions
    SET 
        discharge_date = admission_date + (2 * INTERVAL '1 day'),
        discharge_time = admission_time + (48 * INTERVAL '1 hour'),
        discharge_summary = 'Patient recovered well post-surgery. Discharged with medications and follow-up instructions.',
        final_diagnosis = 'Cataract right eye - surgically corrected',
        updated_at = NOW()
    WHERE admission_number LIKE 'ADM-IPD-%' AND status = 'Discharged';
    
    -- Daycare Admissions (6 records)
    INSERT INTO patient_admissions (
        id, tenant_id, branch_id, patient_id, session_id,
        admission_number, admission_type, admission_date, admission_time,
        attending_doctor_id, surgery_scheduled_date, planned_surgery_type_id,
        planned_anesthesia_type_id, pre_auth_required,
        estimated_stay_days, clinical_notes,
        discharge_date, discharge_time, discharge_summary, final_diagnosis,
        status, created_at, updated_at, created_by_user_id, updated_by_user_id
    )
    SELECT
        gen_random_uuid(),
        v_tenant_id,
        v_branch_id,
        v_patient_ids[(i % array_length(v_patient_ids, 1)) + 1],
        CASE 
            WHEN v_session_ids IS NOT NULL AND array_length(v_session_ids, 1) >= i 
            THEN v_session_ids[i]
            ELSE NULL
        END,
        'ADM-DAY-' || TO_CHAR(CURRENT_DATE - ((i % 3) * INTERVAL '1 day'), 'YYYYMMDD') || '-' || LPAD(i::TEXT, 4, '0'),
        'Daycare',
        CURRENT_DATE - ((i % 3) * INTERVAL '1 day'),
        (CURRENT_DATE - ((i % 3) * INTERVAL '1 day')) + TIME '07:00:00' + ((i * 15) * INTERVAL '1 minute'),
        v_doctor_ids[(i % array_length(v_doctor_ids, 1)) + 1],
        CURRENT_DATE - ((i % 3) * INTERVAL '1 day'),
        v_surgery_ids[(i % array_length(v_surgery_ids, 1)) + 1],
        CASE 
            WHEN v_anesthesia_ids IS NOT NULL AND array_length(v_anesthesia_ids, 1) > 0
            THEN v_anesthesia_ids[(i % array_length(v_anesthesia_ids, 1)) + 1]
            ELSE NULL
        END,
        CASE WHEN (i % 3) = 0 THEN true ELSE false END,
        0, -- Same day discharge
        'Daycare admission for cataract surgery. Patient to be discharged same day post-recovery.',
        CURRENT_DATE - ((i % 3) * INTERVAL '1 day'),
        (CURRENT_DATE - ((i % 3) * INTERVAL '1 day')) + TIME '16:00:00' + ((i * 10) * INTERVAL '1 minute'),
        'Patient recovered well. Vision stable. Discharged with post-operative medications and instructions.',
        CASE (i % 3)
            WHEN 0 THEN 'Senile cataract right eye - phacoemulsification with IOL'
            WHEN 1 THEN 'Mature cataract left eye - SICS with IOL'
            ELSE 'Nuclear sclerosis - phacoemulsification completed'
        END,
        'Discharged',
        NOW() - ((i % 3) * INTERVAL '1 day'),
        NOW() - ((i % 3) * INTERVAL '1 day'),
        v_user_id,
        v_user_id
    FROM generate_series(7, 12) AS i;
    
    -- Emergency Admissions (3 records)
    INSERT INTO patient_admissions (
        id, tenant_id, branch_id, patient_id, session_id,
        admission_number, admission_type, admission_date, admission_time,
        attending_doctor_id, surgery_scheduled_date, planned_surgery_type_id,
        planned_anesthesia_type_id, pre_auth_required, room_category,
        estimated_stay_days, emergency_contact_name, emergency_contact_number,
        clinical_notes, status,
        created_at, updated_at, created_by_user_id, updated_by_user_id
    )
    SELECT
        gen_random_uuid(),
        v_tenant_id,
        v_branch_id,
        v_patient_ids[(i % array_length(v_patient_ids, 1)) + 1],
        NULL, -- Emergency admissions may not have prior counseling session
        'ADM-EMR-' || TO_CHAR(CURRENT_DATE - (1 * INTERVAL '1 day'), 'YYYYMMDD') || '-' || LPAD(i::TEXT, 4, '0'),
        'Emergency',
        CURRENT_DATE - (1 * INTERVAL '1 day'),
        (CURRENT_DATE - (1 * INTERVAL '1 day')) + TIME '22:00:00' + ((i * 5) * INTERVAL '1 minute'),
        v_doctor_ids[(i % array_length(v_doctor_ids, 1)) + 1],
        CURRENT_DATE,
        v_surgery_ids[(i % array_length(v_surgery_ids, 1)) + 1],
        CASE 
            WHEN v_anesthesia_ids IS NOT NULL AND array_length(v_anesthesia_ids, 1) > 4
            THEN v_anesthesia_ids[5] -- General Anesthesia for emergency
            ELSE NULL
        END,
        false, -- Emergency - process insurance later
        'Emergency Ward',
        1,
        CASE (i % 3)
            WHEN 0 THEN 'Rajesh Kumar'
            WHEN 1 THEN 'Priya Sharma'
            ELSE 'Amit Patel'
        END,
        CASE (i % 3)
            WHEN 0 THEN '+91-9876543210'
            WHEN 1 THEN '+91-9876543211'
            ELSE '+91-9876543212'
        END,
        CASE (i % 3)
            WHEN 0 THEN 'Emergency admission - Acute angle closure glaucoma. Immediate surgical intervention required.'
            WHEN 1 THEN 'Penetrating eye injury with intraocular foreign body. Emergency vitrectomy planned.'
            ELSE 'Retinal detachment - Emergency scleral buckle surgery required to prevent vision loss.'
        END,
        'Admitted',
        NOW() - (1 * INTERVAL '1 day'),
        NOW() - (1 * INTERVAL '1 day'),
        v_user_id,
        v_user_id
    FROM generate_series(13, 15) AS i;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ PATIENT ADMISSIONS SEEDING COMPLETE';
    RAISE NOTICE '✅ Created 6 IPD admissions (3 admitted, 3 discharged)';
    RAISE NOTICE '✅ Created 6 Daycare admissions (all discharged)';
    RAISE NOTICE '✅ Created 3 Emergency admissions (all admitted)';
    RAISE NOTICE '========================================';
END $$;

-- Verify
SELECT 
    admission_type,
    status,
    COUNT(*) as count
FROM patient_admissions
WHERE admission_number LIKE 'ADM-%'
GROUP BY admission_type, status
ORDER BY admission_type, status;

SELECT 
    pa.admission_type,
    st.surgery_name,
    COUNT(*) as count
FROM patient_admissions pa
INNER JOIN surgery_types st ON pa.planned_surgery_type_id = st.id
WHERE pa.admission_number LIKE 'ADM-%'
GROUP BY pa.admission_type, st.surgery_name
ORDER BY pa.admission_type, count DESC;

SELECT 
    admission_type,
    COUNT(*) as total_admissions,
    COUNT(*) FILTER (WHERE pre_auth_required = true) as with_insurance
FROM patient_admissions
WHERE admission_number LIKE 'ADM-%'
GROUP BY admission_type;
