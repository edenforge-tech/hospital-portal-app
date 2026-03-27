-- Seed appointments for today to test Check-In flow
-- Run this via psql or Azure Data Studio

DO $$
DECLARE
    v_tenant_id UUID;
    v_branch_id UUID;
    v_patient_id UUID;
    v_doctor_id UUID;
    v_department_id UUID;
    v_today DATE := CURRENT_DATE;
    v_created_by UUID;
BEGIN
    -- Get tenant (use the one that has patients - India Eye Hospital Network)
    SELECT id INTO v_tenant_id FROM tenant WHERE name = 'India Eye Hospital Network' LIMIT 1;
    IF v_tenant_id IS NULL THEN
        -- Fallback to any active tenant
        SELECT id INTO v_tenant_id FROM tenant WHERE is_active = true LIMIT 1;
    END IF;
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No active tenant found';
    END IF;
    
    RAISE NOTICE 'Using tenant: %', v_tenant_id;
    
    -- Get branch
    SELECT id INTO v_branch_id FROM branch WHERE tenant_id = v_tenant_id AND deleted_at IS NULL LIMIT 1;
    IF v_branch_id IS NULL THEN
        RAISE EXCEPTION 'No branch found for tenant';
    END IF;
    
    -- Get a doctor (user)
    SELECT id INTO v_doctor_id FROM users WHERE tenant_id = v_tenant_id AND "UserType" = 'Staff' LIMIT 1;
    IF v_doctor_id IS NULL THEN
        -- Fallback: Get any user
        SELECT id INTO v_doctor_id FROM users WHERE tenant_id = v_tenant_id LIMIT 1;
    END IF;
    
    -- Get created_by (admin user)
    SELECT id INTO v_created_by FROM users WHERE email = 'admin@test.com' LIMIT 1;
    IF v_created_by IS NULL THEN
        v_created_by := v_doctor_id;
    END IF;
    
    -- Get a department
    SELECT id INTO v_department_id FROM department WHERE tenant_id = v_tenant_id AND deleted_at IS NULL LIMIT 1;
    
    -- Check if we have patients
    SELECT id INTO v_patient_id FROM patient WHERE tenant_id = v_tenant_id AND deleted_at IS NULL LIMIT 1;
    
    -- If no patient exists, raise an error (don't try to create due to audit trigger)
    IF v_patient_id IS NULL THEN
        RAISE EXCEPTION 'No patients found in the database. Please create a patient first via the UI.';
    END IF;
    
    -- Delete existing appointments for today (for clean test)
    -- DELETE FROM appointment WHERE appointment_date = v_today AND tenant_id = v_tenant_id;
    
    -- Insert 5 appointments for today with 'Scheduled' status
    FOR i IN 1..5 LOOP
        INSERT INTO appointment (
            id,
            tenant_id,
            patient_id,
            doctor_id,
            department_id,
            appointment_date,
            start_time,
            end_time,
            appointment_type,
            duration_minutes,
            status,
            priority,
            reason_for_visit,
            notes,
            reminder_sent,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            v_tenant_id,
            v_patient_id,
            v_doctor_id,
            v_department_id,
            v_today,
            (TIME '09:00:00' + (interval '30 minutes' * (i - 1)))::TIME,
            (TIME '09:30:00' + (interval '30 minutes' * (i - 1)))::TIME,
            CASE i 
                WHEN 1 THEN 'Consultation'
                WHEN 2 THEN 'FollowUp'
                WHEN 3 THEN 'Routine'
                WHEN 4 THEN 'Specialist'
                ELSE 'Consultation'
            END,
            30,
            'Scheduled', -- Important: Must be 'Scheduled' to show check-in button
            CASE i 
                WHEN 1 THEN 'normal'
                WHEN 2 THEN 'high'
                ELSE 'normal'
            END,
            CASE i 
                WHEN 1 THEN 'Initial consultation for vision problems'
                WHEN 2 THEN 'Follow-up after cataract surgery'
                WHEN 3 THEN 'Routine eye checkup'
                WHEN 4 THEN 'Glaucoma specialist consultation'
                ELSE 'General eye examination'
            END,
            'Test appointment ' || i || ' for OPD Check-In flow testing',
            false,
            NOW(),
            NOW()
        )
        ON CONFLICT DO NOTHING;
    END LOOP;
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Created 5 appointments for today: %', v_today;
    RAISE NOTICE 'Tenant ID: %', v_tenant_id;
    RAISE NOTICE 'Branch ID: %', v_branch_id;
    RAISE NOTICE 'Patient ID: %', v_patient_id;
    RAISE NOTICE 'Doctor ID: %', v_doctor_id;
    RAISE NOTICE '============================================';
END $$;

-- Verify appointments created
SELECT 
    a.id,
    a.appointment_date,
    a.start_time,
    a.status,
    a.appointment_type,
    p.first_name || ' ' || p.last_name as patient_name,
    a.reason_for_visit
FROM appointment a
JOIN patient p ON a.patient_id = p.id
WHERE a.appointment_date = CURRENT_DATE
  AND a.deleted_at IS NULL
ORDER BY a.start_time;
