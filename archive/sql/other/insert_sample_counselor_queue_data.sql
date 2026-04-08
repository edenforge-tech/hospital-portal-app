-- Sample data for Counselor Queue Module
-- This will insert test patients and queue items for demonstration

-- First, let's check if we have patients and users to reference
DO $$
DECLARE
    v_tenant_id UUID;
    v_branch_id UUID;
    v_patient_id UUID;
    v_counselor_id UUID;
    v_session_id UUID;
BEGIN
    -- Get the first active tenant
    SELECT id INTO v_tenant_id FROM tenant WHERE status = 'active' AND deleted_at IS NULL LIMIT 1;
    
    IF v_tenant_id IS NULL THEN
        RAISE NOTICE 'No active tenant found. Please create a tenant first.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Using Tenant ID: %', v_tenant_id;
    
    -- Get the first active branch for this tenant
    SELECT id INTO v_branch_id FROM branch WHERE tenant_id = v_tenant_id AND deleted_at IS NULL LIMIT 1;
    
    IF v_branch_id IS NULL THEN
        RAISE NOTICE 'No branch found. Please create a branch first.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Using Branch ID: %', v_branch_id;
    
    -- Get or create a test patient
    SELECT id INTO v_patient_id FROM patient 
    WHERE tenant_id = v_tenant_id AND first_name = 'John' AND last_name = 'Doe' LIMIT 1;
    
    IF v_patient_id IS NULL THEN
        INSERT INTO patient (
            id, tenant_id, branch_id, first_name, last_name, date_of_birth, gender,
            contact_number, email, medical_record_number, status,
            created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_tenant_id, v_branch_id, 'John', 'Doe', '1985-05-15', 'Male',
            '+1-555-0101', 'john.doe@example.com', 'MRN-' || FLOOR(RANDOM() * 100000)::TEXT, 'active',
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        ) RETURNING id INTO v_patient_id;
        
        RAISE NOTICE 'Created test patient: %', v_patient_id;
    ELSE
        RAISE NOTICE 'Using existing patient: %', v_patient_id;
    END IF;
    
    -- Get a counselor user (usertype = 'Counselor')
    SELECT id INTO v_counselor_id FROM users 
    WHERE tenant_id = v_tenant_id AND "UserType" = 'Counselor' AND "DeletedAt" IS NULL LIMIT 1;
    
    IF v_counselor_id IS NULL THEN
        -- Get any user if no counselor exists
        SELECT id INTO v_counselor_id FROM users 
        WHERE tenant_id = v_tenant_id AND "DeletedAt" IS NULL LIMIT 1;
    END IF;
    
    RAISE NOTICE 'Using Counselor ID: %', v_counselor_id;
    
    -- Create a counseling session
    INSERT INTO counseling_session (
        id, tenant_id, branch_id, patient_id, assigned_counselor_id,
        session_number, session_type, session_category, status, urgency,
        source, scheduled_date,
        created_at, updated_at, created_by_user_id, updated_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_id, v_counselor_id,
        'CS-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-001',
        'Initial', 'Financial', 'Scheduled', 'Routine',
        'DoctorReferral', CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, v_counselor_id, v_counselor_id
    ) RETURNING id INTO v_session_id;
    
    RAISE NOTICE 'Created counseling session: %', v_session_id;
    
    -- Add to counselor queue
    INSERT INTO counselor_queue (
        id, tenant_id, branch_id, session_id, patient_id, assigned_counselor_id,
        token_number, queue_type, queue_position, priority_score, urgency_level,
        added_to_queue_at, status, estimated_wait_minutes,
        created_at, updated_at, created_by_user_id, updated_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_branch_id, v_session_id, v_patient_id, v_counselor_id,
        'T-' || LPAD(FLOOR(RANDOM() * 999)::TEXT, 3, '0'),
        'FinancialCounseling', 1, 75, 'Medium',
        CURRENT_TIMESTAMP, 'Waiting', 15,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, v_counselor_id, v_counselor_id
    );
    
    RAISE NOTICE '✅ Successfully created test queue item!';
    RAISE NOTICE 'Queue item added with status: Waiting';
    
    -- Create another patient for variety
    INSERT INTO patient (
        id, tenant_id, branch_id, first_name, last_name, date_of_birth, gender,
        contact_number, email, medical_record_number, status,
        created_at, updated_at
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_branch_id, 'Jane', 'Smith', '1992-08-20', 'Female',
        '+1-555-0102', 'jane.smith@example.com', 'MRN-' || FLOOR(RANDOM() * 100000)::TEXT, 'active',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) RETURNING id INTO v_patient_id;
    
    -- Create session for second patient
    INSERT INTO counseling_session (
        id, tenant_id, branch_id, patient_id, assigned_counselor_id,
        session_number, session_type, session_category, status, urgency,
        source, scheduled_date,
        created_at, updated_at, created_by_user_id, updated_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_id, v_counselor_id,
        'CS-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-002',
        'Initial', 'PreSurgery', 'Scheduled', 'Urgent',
        'OptometryReferral', CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, v_counselor_id, v_counselor_id
    ) RETURNING id INTO v_session_id;
    
    -- Add second patient to queue
    INSERT INTO counselor_queue (
        id, tenant_id, branch_id, session_id, patient_id, assigned_counselor_id,
        token_number, queue_type, queue_position, priority_score, urgency_level,
        added_to_queue_at, status, estimated_wait_minutes,
        created_at, updated_at, created_by_user_id, updated_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_branch_id, v_session_id, v_patient_id, v_counselor_id,
        'T-' || LPAD(FLOOR(RANDOM() * 999)::TEXT, 3, '0'),
        'PreSurgeryCounseling', 2, 85, 'High',
        CURRENT_TIMESTAMP, 'Waiting', 10,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, v_counselor_id, v_counselor_id
    );
    
    RAISE NOTICE '✅ Created second test queue item with HIGH urgency!';
    
END $$;

-- Verify the data was inserted
SELECT 
    'Queue Items Created' as message,
    COUNT(*) as total_items
FROM counselor_queue 
WHERE deleted_at IS NULL AND status = 'Waiting';
