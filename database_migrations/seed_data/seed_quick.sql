-- Phase 1 Test Data - Minimal Working Version
DO $$
DECLARE
    v_tenant_id UUID := '155fe198-6ae5-4a01-9254-ead5b427247e'::uuid;
    v_branch_id UUID := (SELECT id FROM branch WHERE tenant_id = v_tenant_id LIMIT 1);
    v_admin_id UUID := (SELECT id FROM users WHERE email LIKE '%admin%' LIMIT 1);
    v_dept_id UUID;
    v_patient_id UUID;
    v_appt_id UUID;
    v_bill_id UUID;
    d INT; s INT;
    fee DECIMAL := 500.00;
BEGIN
    -- Get/create department
    SELECT id INTO v_dept_id FROM department WHERE tenant_id = v_tenant_id LIMIT 1;
    IF v_dept_id IS NULL THEN
        INSERT INTO department (id, tenant_id, name, status, created_at, updated_at, created_by_user_id)
        VALUES (gen_random_uuid(), v_tenant_id, 'General', 'active', NOW(), NOW(), v_admin_id)
        RETURNING id INTO v_dept_id;
    END IF;
    
    -- Create 30 patients
    FOR i IN 1..30 LOOP
        INSERT INTO patient (id, tenant_id, medical_record_number, first_name, last_name,
            date_of_birth, gender, contact_number, email, status, created_at, updated_at, created_by_user_id)
        VALUES (gen_random_uuid(), v_tenant_id, 'MRN' || LPAD(i::text, 6, '0'),
            'Patient' || i, 'Test' || i, CURRENT_DATE - (25 + i || ' years')::interval,
            CASE WHEN i % 2 = 0 THEN 'male' ELSE 'female' END,
            '+91900000' || LPAD(i::text, 4, '0'), 'p' || i || '@test.com',
            'active', NOW(), NOW(), v_admin_id);
    END LOOP;
    
    -- Create 180 appointments (6/day x 30 days)
    FOR d IN 0..29 LOOP
        FOR s IN 1..6 LOOP
            SELECT id INTO v_patient_id FROM patient WHERE tenant_id = v_tenant_id
            ORDER BY created_at OFFSET ((d * 6 + s - 1) % 30) LIMIT 1;
            
            -- Appointment
            INSERT INTO appointment (id, tenant_id, patient_id, doctor_id, appointment_date,
                start_time, end_time, duration_minutes, department_id, appointment_type,
                status, reminder_sent, created_at, updated_at)
            VALUES (gen_random_uuid(), v_tenant_id, v_patient_id, v_admin_id, CURRENT_DATE + d,
                (9 + s || ':00')::time, (10 + s || ':00')::time, 60, v_dept_id,
                'consultation', 'scheduled', false, NOW(), NOW())
            RETURNING id INTO v_appt_id;
            
            -- Bill
            INSERT INTO opd_bills (id, tenant_id, branch_id, patient_id, appointment_id,
                bill_number, bill_date,
                consultation_fee, gross_amount, net_amount, amount_paid, balance_due,
                status, is_finalized, generated_by, created_at, updated_at, created_by_user_id)
            VALUES (gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_id, v_appt_id,
                'BILL' || SUBSTRING(v_tenant_id::text, 1, 8) || TO_CHAR(CURRENT_DATE + d, 'YYMMDD') || LPAD((d * 6 + s)::text, 3, '0'),
                CURRENT_DATE + d,
                fee, fee, fee, 0, fee,
                CASE WHEN s IN (1,2,4,6) THEN 'paid' ELSE 'pending' END,
                s IN (1,2,6), v_admin_id, NOW(), NOW(), v_admin_id)
            RETURNING id INTO v_bill_id;
            
            -- Payments
            IF s IN (1,2,4,6) THEN
                INSERT INTO opd_bill_payments (id, tenant_id, opd_bill_id, payment_reference, payment_date,
                    amount, payment_mode, status, created_at, updated_at, created_by_user_id)
                VALUES (gen_random_uuid(), v_tenant_id, v_bill_id, 'REF' || gen_random_uuid()::text, CURRENT_DATE + d,
                    fee, CASE s WHEN 1 THEN 'cash' WHEN 2 THEN 'cash' WHEN 4 THEN 'upi' ELSE 'cash' END,
                    'completed', NOW(), NOW(), v_admin_id);
                UPDATE opd_bills SET amount_paid = fee, balance_due = 0 WHERE id = v_bill_id;
            ELSIF s = 3 THEN
                INSERT INTO opd_bill_payments (id, tenant_id, opd_bill_id, payment_reference, payment_date,
                    amount, payment_mode, status, created_at, updated_at, created_by_user_id)
                VALUES (gen_random_uuid(), v_tenant_id, v_bill_id, 'REF' || gen_random_uuid()::text, CURRENT_DATE + d,
                    fee * 0.6, 'card', 'completed', NOW(), NOW(), v_admin_id);
                UPDATE opd_bills SET amount_paid = fee * 0.6, balance_due = fee * 0.4,
                    status = 'partially_paid' WHERE id = v_bill_id;
            END IF;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'SUCCESS! Created 30 patients, 180 appointments, 180 bills';
END $$;
