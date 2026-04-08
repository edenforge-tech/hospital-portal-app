-- ========================================
-- Counselor Queue Test Data Seeding (SQL)
-- ========================================
-- Directly inserts test data into counselor_queue table
-- Run this after identifying your tenant_id, branch_id, and patient IDs

-- First, let's get some context
\echo '=== Current System Context ==='

-- Show available patients
\echo '=== Available Patients ==='
SELECT 
    id,
    full_name,
    mrn,
    date_of_birth,
    gender,
    phone_number
FROM patient
WHERE deleted_at IS NULL
AND status = 'active'
LIMIT 10;

-- Show available branches
\echo '=== Available Branches ==='
SELECT 
    id,
    name,
    tenant_id
FROM branch
WHERE deleted_at IS NULL
LIMIT 5;

-- Show available users (counselors)
\echo '=== Available Users (potential counselors) ==='
SELECT 
    u.id,
    u.user_name,
    u.email,
    u.first_name,
    u.last_name
FROM "AspNetUsers" u
WHERE NOT EXISTS (
    SELECT 1 FROM "AspNetUsers" deleted 
    WHERE deleted.id = u.id 
    AND deleted.normalized_email LIKE '%DELETED%'
)
LIMIT 5;

\echo ''
\echo '=== Instructions ==='
\echo 'Copy the IDs from above and update the variables in the INSERT section below'
\echo 'Then execute the INSERT statements'
\echo ''

-- ========================================
-- INSERT TEST DATA
-- ========================================
-- IMPORTANT: Update these variables with actual IDs from your system
-- You can get these by running the SELECT queries above

-- Step 1: Set your context (REPLACE THESE VALUES)
DO $$
DECLARE
    v_tenant_id uuid := '00000000-0000-0000-0000-000000000000'; -- REPLACE with your tenant_id
    v_branch_id uuid := '00000000-0000-0000-0000-000000000000'; -- REPLACE with your branch_id
    v_counselor_id uuid := '00000000-0000-0000-0000-000000000000'; -- REPLACE with a user_id (counselor)
    v_patient_ids uuid[] := ARRAY[
        '00000000-0000-0000-0000-000000000000'::uuid, -- Patient 1
        '00000000-0000-0000-0000-000000000000'::uuid, -- Patient 2
        '00000000-0000-0000-0000-000000000000'::uuid, -- Patient 3
        '00000000-0000-0000-0000-000000000000'::uuid, -- Patient 4
        '00000000-0000-0000-0000-000000000000'::uuid, -- Patient 5
        '00000000-0000-0000-0000-000000000000'::uuid  -- Patient 6
    ];
    v_patient_id uuid;
    v_queue_items jsonb[] := ARRAY[
        '{"idx": 1, "referralSource": "DoctorReferral", "urgency": "Critical", "priority": 95, "sessionType": "PreSurgery", "patientType": "Insurance", "financialCounseling": true, "surgicalConsent": true, "notes": "Urgent cataract surgery consent needed - surgery scheduled for tomorrow"}'::jsonb,
        '{"idx": 2, "referralSource": "Emergency", "urgency": "High", "priority": 85, "sessionType": "Financial", "patientType": "Cash", "financialCounseling": true, "surgicalConsent": false, "notes": "Emergency case - needs immediate financial counseling for treatment"}'::jsonb,
        '{"idx": 3, "referralSource": "OptometryReferral", "urgency": "High", "priority": 75, "sessionType": "Initial", "patientType": "CoPay", "financialCounseling": true, "surgicalConsent": false, "notes": "Optometry referred for glasses and lens selection"}'::jsonb,
        '{"idx": 4, "referralSource": "DoctorReferral", "urgency": "Medium", "priority": 55, "sessionType": "Followup", "patientType": "Insurance", "financialCounseling": false, "surgicalConsent": false, "notes": "Follow-up post-operative counseling"}'::jsonb,
        '{"idx": 5, "referralSource": "Scheduled", "urgency": "Medium", "priority": 50, "sessionType": "Initial", "patientType": "GovernmentScheme", "financialCounseling": true, "surgicalConsent": false, "notes": "Scheduled consultation for government scheme benefits"}'::jsonb,
        '{"idx": 6, "referralSource": "WalkIn", "urgency": "Low", "priority": 30, "sessionType": "General", "patientType": "Cash", "financialCounseling": false, "surgicalConsent": false, "notes": "Walk-in patient for general inquiry"}'::jsonb
    ];
    v_item jsonb;
    v_idx int;
BEGIN
    -- Validate that IDs are set
    IF v_tenant_id = '00000000-0000-0000-0000-000000000000' THEN
        RAISE EXCEPTION 'Please update v_tenant_id with your actual tenant ID';
    END IF;
    
    IF v_branch_id = '00000000-0000-0000-0000-000000000000' THEN
        RAISE EXCEPTION 'Please update v_branch_id with your actual branch ID';
    END IF;
    
    IF v_counselor_id = '00000000-0000-0000-0000-000000000000' THEN
        RAISE EXCEPTION 'Please update v_counselor_id with your actual user/counselor ID';
    END IF;
    
    RAISE NOTICE '=== Starting Counselor Queue Seeding ===';
    RAISE NOTICE 'Tenant ID: %', v_tenant_id;
    RAISE NOTICE 'Branch ID: %', v_branch_id;
    RAISE NOTICE 'Counselor ID: %', v_counselor_id;
    RAISE NOTICE '';
    
    -- Loop through each queue item definition
    FOREACH v_item IN ARRAY v_queue_items LOOP
        v_idx := (v_item->>'idx')::int;
        
        -- Check if we have a patient for this index
        IF v_idx <= array_length(v_patient_ids, 1) THEN
            v_patient_id := v_patient_ids[v_idx];
            
            -- Skip if patient ID is not set
            IF v_patient_id = '00000000-0000-0000-0000-000000000000' THEN
                RAISE NOTICE 'Skipping patient index % - ID not set', v_idx;
                CONTINUE;
            END IF;
            
            -- Insert queue item
            INSERT INTO counselor_queue (
                id,
                tenant_id,
                branch_id,
                patient_id,
                assigned_counselor_id,
                referred_by_user_id,
                referral_source,
                referral_notes,
                urgency_level,
                priority_score,
                session_type,
                patient_type,
                requires_financial_counseling,
                requires_surgical_consent,
                queue_status,
                added_to_queue_at,
                created_at,
                updated_at,
                created_by_user_id,
                updated_by_user_id,
                status
            ) VALUES (
                gen_random_uuid(),
                v_tenant_id,
                v_branch_id,
                v_patient_id,
                v_counselor_id,
                v_counselor_id,
                v_item->>'referralSource',
                v_item->>'notes',
                v_item->>'urgency',
                (v_item->>'priority')::int,
                v_item->>'sessionType',
                v_item->>'patientType',
                (v_item->>'financialCounseling')::boolean,
                (v_item->>'surgicalConsent')::boolean,
                'Waiting',
                NOW(),
                NOW(),
                NOW(),
                v_counselor_id,
                v_counselor_id,
                'active'
            );
            
            RAISE NOTICE 'Added patient % to queue with % urgency', v_patient_id, v_item->>'urgency';
        ELSE
            RAISE NOTICE 'Skipping index % - exceeds patient array length', v_idx;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== Seeding Complete ===';
    RAISE NOTICE 'Check queue with: SELECT * FROM counselor_queue WHERE deleted_at IS NULL ORDER BY created_at DESC;';
END $$;

-- Verify inserted data
\echo ''
\echo '=== Newly Created Queue Items ==='
SELECT 
    cq.id,
    cq.token_number,
    p.full_name as patient_name,
    p.mrn,
    cq.referral_source,
    cq.urgency_level,
    cq.priority_score,
    cq.queue_status,
    cq.session_type,
    cq.created_at
FROM counselor_queue cq
JOIN patient p ON p.id = cq.patient_id
WHERE cq.deleted_at IS NULL
ORDER BY cq.created_at DESC
LIMIT 10;

\echo ''
\echo '=== Queue Summary ==='
SELECT 
    queue_status,
    urgency_level,
    COUNT(*) as count
FROM counselor_queue
WHERE deleted_at IS NULL
GROUP BY queue_status, urgency_level
ORDER BY queue_status, urgency_level;
