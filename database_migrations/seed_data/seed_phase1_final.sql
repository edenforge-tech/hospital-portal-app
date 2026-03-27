-- ============================================================================
-- Phase 1 Test Data Seeding Script (Schema-Correct Version)
-- Date: January 30, 2026
-- 6 scenarios/day x 30 days = 180 appointments
-- ============================================================================

DO $$
DECLARE
    v_tenant_id UUID := (SELECT id FROM tenant LIMIT 1);
    v_admin_user_id UUID := (SELECT id FROM users WHERE email LIKE '%admin%' LIMIT 1);
    v_doctor_id UUID;
    v_department_id UUID;
    
    v_patient_id UUID;
    v_appointment_id UUID;
    v_bill_id UUID;
    v_visit_id UUID;
    
    v_current_date DATE := CURRENT_DATE;
    v_day_offset INT;
    v_scenario INT;
    v_consultation_fee DECIMAL := 500.00;
    v_total_amount DECIMAL;
    v_paid_amount DECIMAL;
BEGIN
    RAISE NOTICE 'Phase 1 Test Data Seeding Started...';
    RAISE NOTICE 'Tenant: %', v_tenant_id;
    
    -- Get or create department
    SELECT id INTO v_department_id FROM department 
    WHERE tenant_id = v_tenant_id LIMIT 1;
    
    IF v_department_id IS NULL THEN
        INSERT INTO department (
            id, tenant_id, name, description, status,
            created_at, updated_at, created_by_user_id
        ) VALUES (
            gen_random_uuid(), v_tenant_id, 'General Medicine', 'Test Dept',
            'active', NOW(), NOW(), v_admin_user_id
        ) RETURNING id INTO v_department_id;
    END IF;
    
    -- Use admin as doctor
    v_doctor_id := v_admin_user_id;
    
    -- Create 30 reusable patients
    RAISE NOTICE 'Creating 30 patients...';
    FOR i IN 1..30 LOOP
        INSERT INTO patient (
            id, tenant_id, medical_record_number,
            title, first_name, last_name,
            date_of_birth, gender, contact_number, email,
            blood_group, marital_status,
            address_line_1, country, pin_code,
            status, created_at, updated_at, created_by_user_id
        ) VALUES (
            gen_random_uuid(), v_tenant_id,
            'MRN' || LPAD(i::text, 6, '0'),
            CASE WHEN i % 2 = 0 THEN 'Mr.' ELSE 'Mrs.' END,
            'Patient' || i, 'Test' || i,
            CURRENT_DATE - ((20 + i) || ' years')::interval,
            CASE WHEN i % 2 = 0 THEN 'male' ELSE 'female' END,
            '+91900000' || LPAD(i::text, 4, '0'),
            'patient' || i || '@test.com',
            CASE i % 8 WHEN 0 THEN 'A+' WHEN 1 THEN 'B+' WHEN 2 THEN 'O+'
                WHEN 3 THEN 'AB+' WHEN 4 THEN 'A-' WHEN 5 THEN 'B-'
                WHEN 6 THEN 'O-' ELSE 'AB-' END,
            CASE WHEN i % 3 = 0 THEN 'single' ELSE 'married' END,
            i || ' Test Street', 'India', '500001',
            'active', NOW(), NOW(), v_admin_user_id
        );
    END LOOP;
    
    -- Create 180 appointments (6/day x 30 days)
    RAISE NOTICE 'Creating 180 appointments...';
    FOR v_day_offset IN 0..29 LOOP
        FOR v_scenario IN 1..6 LOOP
            -- Select patient (cycle through 30)
            SELECT id INTO v_patient_id FROM patient 
            WHERE tenant_id = v_tenant_id 
            ORDER BY created_at 
            OFFSET ((v_day_offset * 6 + v_scenario - 1) % 30) 
            LIMIT 1;
            
            -- Create appointment
            INSERT INTO appointment (
                id, tenant_id, patient_id, doctor_id,
                appointment_date, start_time, end_time,
                duration_minutes, department_id, appointment_type, status,
                reminder_sent, notes, created_at, updated_at
            ) VALUES (
                gen_random_uuid(), v_tenant_id, v_patient_id, v_doctor_id,
                v_current_date + v_day_offset,
                (9 + v_scenario || ':00')::time,
                (10 + v_scenario || ':00')::time,
                60, v_department_id, 'consultation', 'scheduled',
                false, 'Scenario ' || v_scenario || ' Day ' || v_day_offset,
                NOW(), NOW()
            ) RETURNING id INTO v_appointment_id;
            
            -- Create OPD bill
            v_total_amount := v_consultation_fee;
            INSERT INTO opd_bills (
                id, tenant_id, patient_id, appointment_id,
                bill_date, total_amount, discount_amount,
                tax_amount, net_amount, amount_paid, balance_due,
                status, is_finalized, created_at, updated_at,
                created_by_user_id
            ) VALUES (
                gen_random_uuid(), v_tenant_id, v_patient_id, v_appointment_id,
                v_current_date + v_day_offset, v_total_amount, 0, 0,
                v_total_amount, 0, v_total_amount,
                CASE WHEN v_scenario IN (1,2,4,6) THEN 'paid' ELSE 'pending' END,
                v_scenario IN (1,2,6), -- Finalize 1,2,6
                NOW(), NOW(), v_admin_user_id
            ) RETURNING id INTO v_bill_id;
            
            -- Create bill item
            INSERT INTO bill_items (
                id, tenant_id, opd_bills_id, item_type, description,
                quantity, unit_price, total_price,
                created_at, updated_at, created_by_user_id
            ) VALUES (
                gen_random_uuid(), v_tenant_id, v_bill_id,
                'consultation', 'Consultation Fee', 1, v_consultation_fee,
                v_consultation_fee, NOW(), NOW(), v_admin_user_id
            );
            
            -- Create payments based on scenario
            IF v_scenario IN (1,2) THEN
                -- Scenarios 1-2: Fully paid + finalized → REFUND testing
                v_paid_amount := v_total_amount;
                INSERT INTO opd_bill_payments (
                    id, tenant_id, opd_bills_id, payment_date,
                    amount, payment_method, reference_number,
                    status, created_at, updated_at, created_by_user_id
                ) VALUES (
                    gen_random_uuid(), v_tenant_id, v_bill_id,
                    v_current_date + v_day_offset, v_paid_amount,
                    'cash', 'REF' || v_bill_id::text, 'completed',
                    NOW(), NOW(), v_admin_user_id
                );
                UPDATE opd_bills SET amount_paid = v_paid_amount, balance_due = 0
                WHERE id = v_bill_id;
                
            ELSIF v_scenario = 3 THEN
                -- Scenario 3: Partial payment → PAYMENT collection
                v_paid_amount := v_total_amount * 0.6;
                INSERT INTO opd_bill_payments (
                    id, tenant_id, opd_bills_id, payment_date,
                    amount, payment_method, reference_number,
                    status, created_at, updated_at, created_by_user_id
                ) VALUES (
                    gen_random_uuid(), v_tenant_id, v_bill_id,
                    v_current_date + v_day_offset, v_paid_amount,
                    'card', 'REF' || v_bill_id::text, 'completed',
                    NOW(), NOW(), v_admin_user_id
                );
                UPDATE opd_bills SET amount_paid = v_paid_amount, 
                    balance_due = v_total_amount - v_paid_amount,
                    status = 'partially_paid'
                WHERE id = v_bill_id;
                
            ELSIF v_scenario = 4 THEN
                -- Scenario 4: Fully paid NOT finalized → FINALIZATION testing
                v_paid_amount := v_total_amount;
                INSERT INTO opd_bill_payments (
                    id, tenant_id, opd_bills_id, payment_date,
                    amount, payment_method, reference_number,
                    status, created_at, updated_at, created_by_user_id
                ) VALUES (
                    gen_random_uuid(), v_tenant_id, v_bill_id,
                    v_current_date + v_day_offset, v_paid_amount,
                    'upi', 'REF' || v_bill_id::text, 'completed',
                    NOW(), NOW(), v_admin_user_id
                );
                UPDATE opd_bills SET amount_paid = v_paid_amount, balance_due = 0
                WHERE id = v_bill_id;
                
            ELSIF v_scenario = 5 THEN
                -- Scenario 5: Unpaid → CHECK-IN gate failure
                NULL; -- No payment
                
            ELSIF v_scenario = 6 THEN
                -- Scenario 6: Fully paid + finalized + visit → WALKOUT testing
                v_paid_amount := v_total_amount;
                INSERT INTO opd_bill_payments (
                    id, tenant_id, opd_bills_id, payment_date,
                    amount, payment_method, reference_number,
                    status, created_at, updated_at, created_by_user_id
                ) VALUES (
                    gen_random_uuid(), v_tenant_id, v_bill_id,
                    v_current_date + v_day_offset, v_paid_amount,
                    'cash', 'REF' || v_bill_id::text, 'completed',
                    NOW(), NOW(), v_admin_user_id
                );
                UPDATE opd_bills SET amount_paid = v_paid_amount, balance_due = 0
                WHERE id = v_bill_id;
                
                -- Create visit only for today (walkout testing)
                IF v_day_offset = 0 THEN
                    INSERT INTO visit (
                        id, tenant_id, patient_id, appointment_id,
                        visit_date, visit_type, status,
                        check_in_time, created_at, updated_at
                    ) VALUES (
                        gen_random_uuid(), v_tenant_id, v_patient_id, v_appointment_id,
                        v_current_date, 'opd', 'waiting_area',
                        NOW(), NOW(), NOW()
                    );
                END IF;
            END IF;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'SUCCESS! Created: 30 patients, 180 appointments, 180 bills';
END $$;
