-- =====================================================================
-- Insurance Pre-Authorization Seed Data (FIXED)
-- Version: 55-FIXED
-- Purpose: Create 17 insurance pre-authorization records with various statuses
-- Schema: Matches actual insurance_pre_authorizations table structure
-- =====================================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_branch_id UUID;
    v_user_id UUID;
    v_patient_ids UUID[];
    v_session_ids UUID[];
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
    FROM counseling_sessions WHERE tenant_id = v_tenant_id AND session_number LIKE 'CS-%' LIMIT 17;
    
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
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SEEDING 17 INSURANCE PRE-AUTHORIZATIONS';
    RAISE NOTICE 'Tenant: %, Branch: %', v_tenant_id, v_branch_id;
    RAISE NOTICE 'Patients: %, Sessions: %',
                 array_length(v_patient_ids, 1),
                 COALESCE(array_length(v_session_ids, 1), 0);
    RAISE NOTICE '========================================';
    
    -- Delete existing sample pre-auths
    DELETE FROM insurance_pre_authorizations WHERE pre_auth_number LIKE 'PA-%' AND tenant_id = v_tenant_id;
    
    -- =====================================================================
    -- Insert 17 Insurance Pre-Authorizations
    -- =====================================================================
    
    -- 1-5: Pending Pre-Auths
    INSERT INTO insurance_pre_authorizations (
        id, tenant_id, branch_id, patient_id, session_id,
        pre_auth_number, insurance_type, insurance_provider, tpa_name,
        policy_number, policy_holder_name, surgery_type, planned_procedure,
        diagnosis_code, procedure_code, eye_operated,
        requested_amount, status, submitted_by_user_id,
        expected_approval_date, queries_raised,
        created_at, created_by_user_id, updated_at, updated_by_user_id
    )
    SELECT
        gen_random_uuid(),
        v_tenant_id,
        v_branch_id,
        v_patient_ids[(i % array_length(v_patient_ids, 1)) + 1],
        CASE WHEN v_session_ids IS NOT NULL AND array_length(v_session_ids, 1) >= i 
             THEN v_session_ids[i] ELSE NULL END,
        'PA-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(i::TEXT, 4, '0'),
        'Corporate',
        CASE (i % 5)
            WHEN 0 THEN 'Star Health Insurance'
            WHEN 1 THEN 'HDFC ERGO'
            WHEN 2 THEN 'ICICI Lombard'
            WHEN 3 THEN 'Bajaj Allianz'
            ELSE 'Reliance Health'
        END,
        CASE (i % 3)
            WHEN 0 THEN 'Medi Assist'
            WHEN 1 THEN 'Paramount Health'
            ELSE 'Vidal Healthcare'
        END,
        'POL' || LPAD((1000000 + i)::TEXT, 10, '0'),
        'Policy Holder ' || i,
        CASE (i % 4)
            WHEN 0 THEN 'Phacoemulsification with IOL'
            WHEN 1 THEN 'ECCE with IOL'
            WHEN 2 THEN 'Vitrectomy'
            ELSE 'Trabeculectomy'
        END,
        'Planned cataract surgery with IOL implantation',
        'H25.9',
        'CPT66984',
        CASE (i % 3) WHEN 0 THEN 'OD' WHEN 1 THEN 'OS' ELSE 'OU' END,
        35000 + (i * 5000),
        'TPAUnderReview',
        v_user_id,
        CURRENT_DATE + INTERVAL '5 days',
        NULL,
        CURRENT_DATE - INTERVAL '1 day',
        v_user_id,
        CURRENT_DATE - INTERVAL '1 day',
        v_user_id
    FROM generate_series(1, 5) AS i;
    
    -- 6-12: Approved Pre-Auths
    INSERT INTO insurance_pre_authorizations (
        id, tenant_id, branch_id, patient_id, session_id,
        pre_auth_number, insurance_type, insurance_provider, tpa_name,
        policy_number, policy_holder_name, surgery_type, planned_procedure,
        diagnosis_code, procedure_code, eye_operated,
        requested_amount, approved_amount, copay_amount, deductible_amount, patient_payable,
        status, submitted_by_user_id, submitted_to_tpa_at,
        expected_approval_date, actual_approval_date, tpa_approval_number,
        valid_from, valid_until, tpa_response_notes,
        created_at, created_by_user_id, updated_at, updated_by_user_id
    )
    SELECT
        gen_random_uuid(),
        v_tenant_id,
        v_branch_id,
        v_patient_ids[((i + 5) % array_length(v_patient_ids, 1)) + 1],
        CASE WHEN v_session_ids IS NOT NULL AND array_length(v_session_ids, 1) >= (i+5) 
             THEN v_session_ids[i+5] ELSE NULL END,
        'PA-' || TO_CHAR(CURRENT_DATE - INTERVAL '10 days', 'YYYYMMDD') || '-' || LPAD((i+5)::TEXT, 4, '0'),
        CASE (i % 2) WHEN 0 THEN 'Corporate' ELSE 'Private' END,
        CASE (i % 5)
            WHEN 0 THEN 'Star Health Insurance'
            WHEN 1 THEN 'HDFC ERGO'
            WHEN 2 THEN 'ICICI Lombard'
            WHEN 3 THEN 'Max Bupa'
            ELSE 'New India Assurance'
        END,
        CASE (i % 3)
            WHEN 0 THEN 'Medi Assist'
            WHEN 1 THEN 'Paramount Health'
            ELSE 'Vidal Healthcare'
        END,
        'POL' || LPAD((2000000 + i)::TEXT, 10, '0'),
        'Policy Holder ' || (i + 5),
        CASE (i % 5)
            WHEN 0 THEN 'Phacoemulsification with IOL'
            WHEN 1 THEN 'Trabeculectomy'
            WHEN 2 THEN 'Vitrectomy'
            WHEN 3 THEN 'ECCE with IOL'
            ELSE 'Retinal Detachment Surgery'
        END,
        'Approved surgery with standard IOL',
        CASE (i % 3) WHEN 0 THEN 'H25.9' WHEN 1 THEN 'H40.1' ELSE 'H33.0' END,
        CASE (i % 3) WHEN 0 THEN 'CPT66984' WHEN 1 THEN 'CPT66170' ELSE 'CPT67108' END,
        CASE (i % 3) WHEN 0 THEN 'OD' WHEN 1 THEN 'OS' ELSE 'OU' END,
        40000 + (i * 5000),
        38000 + (i * 4500),
        2000 + (i * 500),
        1000,
        3000 + (i * 500),
        'TPAApproved',
        v_user_id,
        CURRENT_DATE - INTERVAL '12 days',
        CURRENT_DATE - INTERVAL '7 days',
        CURRENT_DATE - INTERVAL '8 days',
        'APPR' || LPAD((10000000000::BIGINT + i)::TEXT, 12, '0'),
        CURRENT_DATE - INTERVAL '5 days',
        CURRENT_DATE + INTERVAL '25 days',
        'Pre-authorization approved for the planned procedure. Please proceed within validity period.',
        CURRENT_DATE - INTERVAL '15 days',
        v_user_id,
        CURRENT_DATE - INTERVAL '8 days',
        v_user_id
    FROM generate_series(1, 7) AS i;
    
    -- 13-15: Rejected Pre-Auths  
    INSERT INTO insurance_pre_authorizations (
        id, tenant_id, branch_id, patient_id, session_id,
        pre_auth_number, insurance_type, insurance_provider, tpa_name,
        policy_number, policy_holder_name, surgery_type, planned_procedure,
        diagnosis_code, procedure_code, eye_operated,
        requested_amount, status, submitted_by_user_id, submitted_to_tpa_at,
        expected_approval_date, actual_approval_date, tpa_denial_reason,
        created_at, created_by_user_id, updated_at, updated_by_user_id
    )
    SELECT
        gen_random_uuid(),
        v_tenant_id,
        v_branch_id,
        v_patient_ids[((i + 12) % array_length(v_patient_ids, 1)) + 1],
        CASE WHEN v_session_ids IS NOT NULL AND array_length(v_session_ids, 1) >= (i+12) 
             THEN v_session_ids[i+12] ELSE NULL END,
        'PA-' || TO_CHAR(CURRENT_DATE - INTERVAL '20 days', 'YYYYMMDD') || '-' || LPAD((i+12)::TEXT, 4, '0'),
        'Private',
        CASE (i % 3)
            WHEN 0 THEN 'Star Health Insurance'
            WHEN 1 THEN 'Care Health'
            ELSE 'Aditya Birla Health'
        END,
        CASE (i % 2)
            WHEN 0 THEN 'Paramount Health'
            ELSE 'Vidal Healthcare'
        END,
        'POL' || LPAD((3000000 + i)::TEXT, 10, '0'),
        'Policy Holder ' || (i + 12),
        'Phacoemulsification with Premium IOL',
        'Cataract surgery with premium multifocal IOL',
        'H25.9',
        'CPT66984',
        CASE (i % 2) WHEN 0 THEN 'OD' ELSE 'OS' END,
        65000 + (i * 5000),
        'TPADenied',
        v_user_id,
        CURRENT_DATE - INTERVAL '22 days',
        CURRENT_DATE - INTERVAL '17 days',
        CURRENT_DATE - INTERVAL '18 days',
        CASE (i % 3)
            WHEN 0 THEN 'Policy expired. Please renew before applying.'
            WHEN 1 THEN 'Premium IOL not covered under standard policy. Approved for standard IOL only.'
            ELSE 'Pre-existing condition not declared. Claim rejected.'
        END,
        CURRENT_DATE - INTERVAL '25 days',
        v_user_id,
        CURRENT_DATE - INTERVAL '18 days',
        v_user_id
    FROM generate_series(1, 3) AS i;
    
    -- 16-17: Expired Pre-Auths
    INSERT INTO insurance_pre_authorizations (
        id, tenant_id, branch_id, patient_id, session_id,
        pre_auth_number, insurance_type, insurance_provider, tpa_name,
        policy_number, policy_holder_name, surgery_type, planned_procedure,
        diagnosis_code, procedure_code, eye_operated,
        requested_amount, approved_amount, copay_amount, patient_payable,
        status, submitted_by_user_id, submitted_to_tpa_at,
        actual_approval_date, tpa_approval_number,
        valid_from, valid_until,
        created_at, created_by_user_id, updated_at, updated_by_user_id
    )
    SELECT
        gen_random_uuid(),
        v_tenant_id,
        v_branch_id,
        v_patient_ids[((i + 15) % array_length(v_patient_ids, 1)) + 1],
        CASE WHEN v_session_ids IS NOT NULL AND array_length(v_session_ids, 1) >= (i+15) 
             THEN v_session_ids[i+15] ELSE NULL END,
        'PA-' || TO_CHAR(CURRENT_DATE - INTERVAL '50 days', 'YYYYMMDD') || '-' || LPAD((i+15)::TEXT, 4, '0'),
        'Corporate',
        CASE (i % 2)
            WHEN 0 THEN 'Bajaj Allianz'
            ELSE 'Reliance Health'
        END,
        'Medi Assist',
        'POL' || LPAD((4000000 + i)::TEXT, 10, '0'),
        'Policy Holder ' || (i + 15),
        'Vitrectomy',
        'Vitrectomy for vitreous hemorrhage',
        'H43.1',
        'CPT67036',
        CASE (i % 2) WHEN 0 THEN 'OD' ELSE 'OS' END,
        55000,
        50000,
        3000,
        3000,
        'Expired',
        v_user_id,
        CURRENT_DATE - INTERVAL '52 days',
        CURRENT_DATE - INTERVAL '48 days',
        'APPR' || LPAD((20000000000::BIGINT + i)::TEXT, 12, '0'),
        CURRENT_DATE - INTERVAL '45 days',
        CURRENT_DATE - INTERVAL '15 days',
        CURRENT_DATE - INTERVAL '55 days',
        v_user_id,
        CURRENT_DATE - INTERVAL '14 days',
        v_user_id
    FROM generate_series(1, 2) AS i;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'COMPLETED: Insurance pre-auths seeded';
    RAISE NOTICE '========================================';
END $$;

-- Verification queries
SELECT 'Insurance Pre-Authorizations by Status' AS report, status, COUNT(*) AS count
FROM insurance_pre_authorizations
WHERE pre_auth_number LIKE 'PA-%'
GROUP BY status
ORDER BY status;

SELECT 'Insurance Pre-Authorizations by Provider' AS report, insurance_provider, COUNT(*) AS count
FROM insurance_pre_authorizations
WHERE pre_auth_number LIKE 'PA-%'
GROUP BY insurance_provider
ORDER BY count DESC
LIMIT 5;
