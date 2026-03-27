-- =====================================================================
-- Insurance Pre-Authorization Seed Data
-- Version: 55
-- Purpose: Create 17 insurance pre-authorization records with various statuses
-- Prerequisite: Run 20_seed_patients.sql, 53_seed_master_data_final.sql, 54_seed_counseling_sessions.sql
-- =====================================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_branch_id UUID;
    v_user_id UUID;
    v_patient_ids UUID[];
    v_session_ids UUID[];
    v_insurance_ids UUID[];
    v_tpa_ids UUID[];
    v_surgery_ids UUID[];
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
    
    -- Get insurance provider IDs
    SELECT ARRAY_AGG(id ORDER BY display_order) INTO v_insurance_ids
    FROM insurance_providers WHERE tenant_id = v_tenant_id AND is_active = true;
    
    -- Get TPA IDs
    SELECT ARRAY_AGG(id ORDER BY display_order) INTO v_tpa_ids
    FROM tpa_providers WHERE tenant_id = v_tenant_id AND is_active = true;
    
    -- Get surgery type IDs
    SELECT ARRAY_AGG(id ORDER BY display_order) INTO v_surgery_ids
    FROM surgery_types WHERE tenant_id = v_tenant_id AND is_active = true LIMIT 15;
    
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
    
    IF v_insurance_ids IS NULL OR array_length(v_insurance_ids, 1) IS NULL THEN
        RAISE EXCEPTION 'No insurance providers found. Please run 53_seed_master_data_final.sql first';
    END IF;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SEEDING 17 INSURANCE PRE-AUTHORIZATIONS';
    RAISE NOTICE 'Tenant: %, Branch: %', v_tenant_id, v_branch_id;
    RAISE NOTICE 'Patients: %, Sessions: %, Providers: %', 
                 array_length(v_patient_ids, 1),
                 COALESCE(array_length(v_session_ids, 1), 0),
                 array_length(v_insurance_ids, 1);
    RAISE NOTICE '========================================';
    
    -- Delete existing sample pre-auths
    DELETE FROM insurance_pre_authorization WHERE pre_auth_number LIKE 'PA-%' AND tenant_id = v_tenant_id;
    
    -- =====================================================================
    -- Insert 17 Insurance Pre-Authorizations
    -- =====================================================================
    
    -- Pending Pre-Auths (5 records)
    INSERT INTO insurance_pre_authorization (
        id, tenant_id, branch_id, patient_id, session_id,
        pre_auth_number, insurance_provider_id, tpa_provider_id,
        policy_number, surgery_type, estimated_cost,
        requested_date, status, remarks,
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
        'PA-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(i::TEXT, 4, '0'),
        v_insurance_ids[(i % array_length(v_insurance_ids, 1)) + 1],
        CASE 
            WHEN v_tpa_ids IS NOT NULL AND array_length(v_tpa_ids, 1) > 0
            THEN v_tpa_ids[(i % array_length(v_tpa_ids, 1)) + 1]
            ELSE NULL
        END,
        'POL' || LPAD((100000 + i * 12345)::TEXT, 10, '0'),
        CASE 
            WHEN v_surgery_ids IS NOT NULL AND array_length(v_surgery_ids, 1) > 0
            THEN (SELECT surgery_name FROM surgery_types WHERE id = v_surgery_ids[(i % array_length(v_surgery_ids, 1)) + 1])
            ELSE 'Phacoemulsification with IOL'
        END,
        25000 + (i * 5000),
        CURRENT_DATE - ((i % 3) * INTERVAL '1 day'),
        'Pending',
        'Pre-authorization request submitted to insurance company. Awaiting approval.',
        NOW() - ((i % 3) * INTERVAL '1 day'),
        NOW() - ((i % 3) * INTERVAL '1 day'),
        v_user_id,
        v_user_id
    FROM generate_series(1, 5) AS i;
    
    -- Approved Pre-Auths (7 records)
    INSERT INTO insurance_pre_authorization (
        id, tenant_id, branch_id, patient_id, session_id,
        pre_auth_number, insurance_provider_id, tpa_provider_id,
        policy_number, surgery_type, estimated_cost, approved_amount,
        requested_date, approved_date, approval_number,
        approval_valid_from, approval_valid_to,
        status, remarks,
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
        'PA-' || TO_CHAR(CURRENT_DATE - ((i % 5) * INTERVAL '1 day'), 'YYYYMMDD') || '-' || LPAD((1000 + i)::TEXT, 4, '0'),
        v_insurance_ids[(i % array_length(v_insurance_ids, 1)) + 1],
        CASE 
            WHEN v_tpa_ids IS NOT NULL AND array_length(v_tpa_ids, 1) > 0
            THEN v_tpa_ids[(i % array_length(v_tpa_ids, 1)) + 1]
            ELSE NULL
        END,
        'POL' || LPAD((200000 + i * 12345)::TEXT, 10, '0'),
        CASE 
            WHEN v_surgery_ids IS NOT NULL AND array_length(v_surgery_ids, 1) > 0
            THEN (SELECT surgery_name FROM surgery_types WHERE id = v_surgery_ids[(i % array_length(v_surgery_ids, 1)) + 1])
            ELSE 'Cataract Surgery'
        END,
        30000 + (i * 8000),
        28000 + (i * 7500),
        CURRENT_DATE - ((i % 5 + 3) * INTERVAL '1 day'),
        CURRENT_DATE - ((i % 5) * INTERVAL '1 day'),
        'APPR' || LPAD((i * 98765)::TEXT, 10, '0'),
        CURRENT_DATE - ((i % 5) * INTERVAL '1 day'),
        CURRENT_DATE + (30 * INTERVAL '1 day'),
        'Approved',
        'Pre-authorization approved by insurance company. Cashless benefit confirmed.',
        NOW() - ((i % 5 + 3) * INTERVAL '1 day'),
        NOW() - ((i % 5) * INTERVAL '1 day'),
        v_user_id,
        v_user_id
    FROM generate_series(6, 12) AS i;
    
    -- Rejected Pre-Auths (3 records)
    INSERT INTO insurance_pre_authorization (
        id, tenant_id, branch_id, patient_id, session_id,
        pre_auth_number, insurance_provider_id, tpa_provider_id,
        policy_number, surgery_type, estimated_cost,
        requested_date, rejection_date, rejection_reason,
        status, remarks,
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
        'PA-' || TO_CHAR(CURRENT_DATE - ((i % 3 + 1) * INTERVAL '1 day'), 'YYYYMMDD') || '-' || LPAD((2000 + i)::TEXT, 4, '0'),
        v_insurance_ids[(i % array_length(v_insurance_ids, 1)) + 1],
        CASE 
            WHEN v_tpa_ids IS NOT NULL AND array_length(v_tpa_ids, 1) > 0
            THEN v_tpa_ids[(i % array_length(v_tpa_ids, 1)) + 1]
            ELSE NULL
        END,
        'POL' || LPAD((300000 + i * 12345)::TEXT, 10, '0'),
        CASE 
            WHEN v_surgery_ids IS NOT NULL AND array_length(v_surgery_ids, 1) > 0
            THEN (SELECT surgery_name FROM surgery_types WHERE id = v_surgery_ids[(i % array_length(v_surgery_ids, 1)) + 1])
            ELSE 'Refractive Surgery'
        END,
        45000 + (i * 10000),
        CURRENT_DATE - ((i % 3 + 2) * INTERVAL '1 day'),
        CURRENT_DATE - ((i % 3) * INTERVAL '1 day'),
        CASE (i % 3)
            WHEN 0 THEN 'Policy expired - renewal pending'
            WHEN 1 THEN 'Pre-existing condition exclusion clause applicable'
            ELSE 'Procedure not covered under current policy'
        END,
        'Rejected',
        'Pre-authorization rejected. Patient advised to opt for cash payment or policy upgrade.',
        NOW() - ((i % 3 + 2) * INTERVAL '1 day'),
        NOW() - ((i % 3) * INTERVAL '1 day'),
        v_user_id,
        v_user_id
    FROM generate_series(13, 15) AS i;
    
    -- Expired Pre-Auths (2 records)
    INSERT INTO insurance_pre_authorization (
        id, tenant_id, branch_id, patient_id, session_id,
        pre_auth_number, insurance_provider_id, tpa_provider_id,
        policy_number, surgery_type, estimated_cost, approved_amount,
        requested_date, approved_date, approval_number,
        approval_valid_from, approval_valid_to,
        status, remarks,
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
        'PA-' || TO_CHAR(CURRENT_DATE - (45 * INTERVAL '1 day'), 'YYYYMMDD') || '-' || LPAD((3000 + i)::TEXT, 4, '0'),
        v_insurance_ids[(i % array_length(v_insurance_ids, 1)) + 1],
        CASE 
            WHEN v_tpa_ids IS NOT NULL AND array_length(v_tpa_ids, 1) > 0
            THEN v_tpa_ids[(i % array_length(v_tpa_ids, 1)) + 1]
            ELSE NULL
        END,
        'POL' || LPAD((400000 + i * 12345)::TEXT, 10, '0'),
        'Glaucoma Surgery',
        50000 + (i * 8000),
        48000 + (i * 7500),
        CURRENT_DATE - (50 * INTERVAL '1 day'),
        CURRENT_DATE - (45 * INTERVAL '1 day'),
        'APPR' || LPAD((i * 87654)::TEXT, 10, '0'),
        CURRENT_DATE - (45 * INTERVAL '1 day'),
        CURRENT_DATE - (15 * INTERVAL '1 day'),
        'Expired',
        'Pre-authorization validity expired. Patient did not proceed with surgery within approved timeframe.',
        NOW() - (50 * INTERVAL '1 day'),
        NOW() - (10 * INTERVAL '1 day'),
        v_user_id,
        v_user_id
    FROM generate_series(16, 17) AS i;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ INSURANCE PRE-AUTHS SEEDING COMPLETE';
    RAISE NOTICE '✅ Created 5 Pending pre-auths';
    RAISE NOTICE '✅ Created 7 Approved pre-auths';
    RAISE NOTICE '✅ Created 3 Rejected pre-auths';
    RAISE NOTICE '✅ Created 2 Expired pre-auths';
    RAISE NOTICE '========================================';
END $$;

-- Verify
SELECT 
    status,
    COUNT(*) as count,
    SUM(estimated_cost) as total_estimated,
    SUM(approved_amount) as total_approved
FROM insurance_pre_authorization
WHERE pre_auth_number LIKE 'PA-%'
GROUP BY status
ORDER BY status;

SELECT 
    ip.provider_name,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE ipa.status = 'Approved') as approved_count
FROM insurance_pre_authorization ipa
INNER JOIN insurance_providers ip ON ipa.insurance_provider_id = ip.id
WHERE ipa.pre_auth_number LIKE 'PA-%'
GROUP BY ip.provider_name
ORDER BY count DESC;
