-- ============================================================================
-- Seed Sample Data for Counselor Queue Module
-- ============================================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_branch_id UUID;
    v_patient1_id UUID;
    v_patient2_id UUID;
    v_patient3_id UUID;
    v_counselor_id UUID;
    v_user_id UUID;
    v_session1_id UUID;
    v_session2_id UUID;
    v_session3_id UUID;
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Starting Counselor Queue Sample Data Seed';
    RAISE NOTICE '============================================';
    
    -- Get the first active tenant
    SELECT id INTO v_tenant_id 
    FROM tenant 
    WHERE status = 'active' AND deleted_at IS NULL 
    LIMIT 1;
    
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No active tenant found. Please run main migrations first.';
    END IF;
    
    RAISE NOTICE 'Using Tenant ID: %', v_tenant_id;
    
    -- Get the first active branch
    SELECT id INTO v_branch_id 
    FROM branch 
    WHERE tenant_id = v_tenant_id AND deleted_at IS NULL 
    LIMIT 1;
    
    IF v_branch_id IS NULL THEN
        RAISE EXCEPTION 'No branch found for tenant. Please create a branch first.';
    END IF;
    
    RAISE NOTICE 'Using Branch ID: %', v_branch_id;
    
    -- Get a user to act as counselor and creator
    SELECT id INTO v_user_id 
    FROM users 
    WHERE tenant_id = v_tenant_id AND "DeletedAt" IS NULL 
    LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'No user found. Please create users first.';
    END IF;
    
    v_counselor_id := v_user_id;
    RAISE NOTICE 'Using User/Counselor ID: %', v_counselor_id;
    
    -- ============================================================================
    -- Create Sample Patients
    -- ============================================================================
    
    RAISE NOTICE 'Creating sample patients...';
    
    -- Patient 1: John Doe - Financial Counseling
    INSERT INTO patient (
        id, tenant_id, branch_id, first_name, last_name, date_of_birth, gender,
        contact_number, email, medical_record_number, blood_group,
        address_line_1, city, state, pin_code, country,
        insurance_status, status,
        created_at, updated_at, created_by_user_id, updated_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_branch_id, 'John', 'Doe', 
        '1985-03-15', 'Male', '+1-555-0101', 'john.doe@example.com',
        'MRN' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0'), 'O+',
        '123 Main Street', 'New York', 'NY', '10001', 'USA',
        'Insured', 'active',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, v_user_id, v_user_id
    ) RETURNING id INTO v_patient1_id;
    
    RAISE NOTICE '  Created Patient 1: John Doe (ID: %)', v_patient1_id;
    
    -- Patient 2: Jane Smith - Pre-Surgery Counseling
    INSERT INTO patient (
        id, tenant_id, branch_id, first_name, last_name, date_of_birth, gender,
        contact_number, email, medical_record_number, blood_group,
        address_line_1, city, state, pin_code, country,
        insurance_status, status,
        created_at, updated_at, created_by_user_id, updated_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_branch_id, 'Jane', 'Smith',
        '1990-07-22', 'Female', '+1-555-0102', 'jane.smith@example.com',
        'MRN' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0'), 'A+',
        '456 Oak Avenue', 'Los Angeles', 'CA', '90001', 'USA',
        'Insured', 'active',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, v_user_id, v_user_id
    ) RETURNING id INTO v_patient2_id;
    
    RAISE NOTICE '  Created Patient 2: Jane Smith (ID: %)', v_patient2_id;
    
    -- Patient 3: Michael Johnson - Insurance Verification
    INSERT INTO patient (
        id, tenant_id, branch_id, first_name, last_name, date_of_birth, gender,
        contact_number, email, medical_record_number, blood_group,
        address_line_1, city, state, pin_code, country,
        insurance_status, status,
        created_at, updated_at, created_by_user_id, updated_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_branch_id, 'Michael', 'Johnson',
        '1978-11-30', 'Male', '+1-555-0103', 'michael.j@example.com',
        'MRN' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0'), 'B+',
        '789 Pine Road', 'Chicago', 'IL', '60601', 'USA',
        'Pending', 'active',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, v_user_id, v_user_id
    ) RETURNING id INTO v_patient3_id;
    
    RAISE NOTICE '  Created Patient 3: Michael Johnson (ID: %)', v_patient3_id;
    
    -- ============================================================================
    -- Create Counseling Sessions
    -- ============================================================================
    
    RAISE NOTICE 'Creating counseling sessions...';
    
    -- Session 1: Financial Counseling
    INSERT INTO counseling_session (
        id, tenant_id, branch_id, patient_id, assigned_counselor_id,
        session_number, session_type, session_category, status, urgency,
        source, scheduled_date, chief_complaint,
        created_at, updated_at, created_by_user_id, updated_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_branch_id, v_patient1_id, v_counselor_id,
        'CS-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-001',
        'Initial', 'Financial', 'Scheduled', 'Routine',
        'DoctorReferral', CURRENT_TIMESTAMP, 'Financial consultation for cataract surgery',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, v_user_id, v_user_id
    ) RETURNING id INTO v_session1_id;
    
    RAISE NOTICE '  Created Session 1: Financial (ID: %)', v_session1_id;
    
    -- Session 2: Pre-Surgery Counseling
    INSERT INTO counseling_session (
        id, tenant_id, branch_id, patient_id, assigned_counselor_id,
        session_number, session_type, session_category, status, urgency,
        source, scheduled_date, chief_complaint,
        created_at, updated_at, created_by_user_id, updated_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_branch_id, v_patient2_id, v_counselor_id,
        'CS-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-002',
        'Initial', 'PreSurgery', 'Scheduled', 'Urgent',
        'OptometryReferral', CURRENT_TIMESTAMP, 'Pre-operative counseling for LASIK',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, v_user_id, v_user_id
    ) RETURNING id INTO v_session2_id;
    
    RAISE NOTICE '  Created Session 2: Pre-Surgery (ID: %)', v_session2_id;
    
    -- Session 3: Insurance Verification
    INSERT INTO counseling_session (
        id, tenant_id, branch_id, patient_id, assigned_counselor_id,
        session_number, session_type, session_category, status, urgency,
        source, scheduled_date, chief_complaint,
        created_at, updated_at, created_by_user_id, updated_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_branch_id, v_patient3_id, v_counselor_id,
        'CS-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-003',
        'Initial', 'Insurance', 'Scheduled', 'Routine',
        'FrontDesk', CURRENT_TIMESTAMP, 'Insurance coverage verification',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, v_user_id, v_user_id
    ) RETURNING id INTO v_session3_id;
    
    RAISE NOTICE '  Created Session 3: Insurance (ID: %)', v_session3_id;
    
    -- ============================================================================
    -- Add to Counselor Queue
    -- ============================================================================
    
    RAISE NOTICE 'Adding patients to counselor queue...';
    
    -- Queue Item 1: John Doe - Waiting
    INSERT INTO counselor_queue (
        id, tenant_id, branch_id, session_id, patient_id, assigned_counselor_id,
        token_number, queue_type, queue_position, priority_score, urgency_level,
        added_to_queue_at, status, estimated_wait_minutes,
        created_at, updated_at, created_by_user_id, updated_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_branch_id, v_session1_id, v_patient1_id, v_counselor_id,
        'T-001', 'FinancialCounseling', 1, 70, 'Medium',
        CURRENT_TIMESTAMP, 'Waiting', 15,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, v_user_id, v_user_id
    );
    
    RAISE NOTICE '  Queue Item 1: John Doe - Token T-001 (Waiting)';
    
    -- Queue Item 2: Jane Smith - Waiting (High Priority)
    INSERT INTO counselor_queue (
        id, tenant_id, branch_id, session_id, patient_id, assigned_counselor_id,
        token_number, queue_type, queue_position, priority_score, urgency_level,
        added_to_queue_at, status, estimated_wait_minutes,
        created_at, updated_at, created_by_user_id, updated_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_branch_id, v_session2_id, v_patient2_id, v_counselor_id,
        'T-002', 'PreSurgeryCounseling', 2, 85, 'High',
        CURRENT_TIMESTAMP, 'Waiting', 10,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, v_user_id, v_user_id
    );
    
    RAISE NOTICE '  Queue Item 2: Jane Smith - Token T-002 (Waiting, HIGH Priority)';
    
    -- Queue Item 3: Michael Johnson - Waiting
    INSERT INTO counselor_queue (
        id, tenant_id, branch_id, session_id, patient_id, assigned_counselor_id,
        token_number, queue_type, queue_position, priority_score, urgency_level,
        added_to_queue_at, status, estimated_wait_minutes,
        created_at, updated_at, created_by_user_id, updated_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_branch_id, v_session3_id, v_patient3_id, v_counselor_id,
        'T-003', 'InsuranceVerification', 3, 60, 'Low',
        CURRENT_TIMESTAMP, 'Waiting', 20,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, v_user_id, v_user_id
    );
    
    RAISE NOTICE '  Queue Item 3: Michael Johnson - Token T-003 (Waiting)';
    
    -- ============================================================================
    -- Add a Called patient (for demonstration)
    -- ============================================================================
    
    DECLARE
        v_patient4_id UUID;
        v_session4_id UUID;
    BEGIN
        -- Patient 4: Sarah Williams - Called
        INSERT INTO patient (
            id, tenant_id, branch_id, first_name, last_name, date_of_birth, gender,
            contact_number, email, medical_record_number, blood_group,
            status, created_at, updated_at, created_by_user_id, updated_by_user_id
        ) VALUES (
            gen_random_uuid(), v_tenant_id, v_branch_id, 'Sarah', 'Williams',
            '1995-04-10', 'Female', '+1-555-0104', 'sarah.w@example.com',
            'MRN' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0'), 'AB+',
            'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, v_user_id, v_user_id
        ) RETURNING id INTO v_patient4_id;
        
        -- Session 4
        INSERT INTO counseling_session (
            id, tenant_id, branch_id, patient_id, assigned_counselor_id,
            session_number, session_type, session_category, status, urgency,
            source, scheduled_date,
            created_at, updated_at, created_by_user_id, updated_by_user_id
        ) VALUES (
            gen_random_uuid(), v_tenant_id, v_branch_id, v_patient4_id, v_counselor_id,
            'CS-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-004',
            'FollowUp', 'General', 'InProgress', 'Routine',
            'WalkIn', CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, v_user_id, v_user_id
        ) RETURNING id INTO v_session4_id;
        
        -- Queue Item 4: Sarah Williams - Called
        INSERT INTO counselor_queue (
            id, tenant_id, branch_id, session_id, patient_id, assigned_counselor_id,
            token_number, queue_type, queue_position, priority_score, urgency_level,
            added_to_queue_at, called_at, status, estimated_wait_minutes,
            created_at, updated_at, created_by_user_id, updated_by_user_id
        ) VALUES (
            gen_random_uuid(), v_tenant_id, v_branch_id, v_session4_id, v_patient4_id, v_counselor_id,
            'T-004', 'GeneralCounseling', 4, 75, 'Medium',
            CURRENT_TIMESTAMP - INTERVAL '5 minutes', CURRENT_TIMESTAMP - INTERVAL '2 minutes',
            'Called', 5,
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, v_user_id, v_user_id
        );
        
        RAISE NOTICE '  Queue Item 4: Sarah Williams - Token T-004 (Called)';
    END;
    
    -- ============================================================================
    -- Verification
    -- ============================================================================
    
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Sample Data Seed Completed Successfully!';
    RAISE NOTICE '============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '  - 4 Patients created';
    RAISE NOTICE '  - 4 Counseling sessions created';
    RAISE NOTICE '  - 4 Queue items created';
    RAISE NOTICE '    * 3 in Waiting status';
    RAISE NOTICE '    * 1 in Called status';
    RAISE NOTICE '';
    RAISE NOTICE 'Refresh your UI at:';
    RAISE NOTICE '  http://localhost:3000/dashboard/counselor/workspace';
    RAISE NOTICE '';
    
END $$;

-- Final verification query
SELECT 
    'Queue Status Summary' as report,
    status,
    COUNT(*) as count,
    STRING_AGG(token_number, ', ' ORDER BY queue_position) as tokens
FROM counselor_queue 
WHERE deleted_at IS NULL
GROUP BY status
ORDER BY status;
