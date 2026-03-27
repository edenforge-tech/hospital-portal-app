-- ============================================================================
-- Phase 1 Test Data Seeding Script (Fixed for actual schema)
-- Date: January 30, 2026
-- Purpose: Create 6 appointments per day for next 30 days with varied scenarios
-- ============================================================================

DO $$
DECLARE
    v_tenant_id UUID := (SELECT id FROM tenant LIMIT 1);
    v_branch_id UUID := (SELECT id FROM branch WHERE tenant_id = v_tenant_id LIMIT 1);
    v_admin_user_id UUID := (SELECT id FROM users WHERE email LIKE '%admin%' LIMIT 1);
    v_doctor_user_id UUID;
    v_department_id UUID;
    
    v_patient_id UUID;
    v_appointment_id UUID;
    v_bill_id UUID;
    v_payment_id UUID;
    v_visit_id UUID;
    
    v_current_date DATE := CURRENT_DATE;
    v_day_offset INT;
    v_scenario INT;
    v_consultation_fee DECIMAL := 500.00;
    v_total_amount DECIMAL;
    v_paid_amount DECIMAL;
BEGIN
    RAISE NOTICE 'Starting Phase 1 test data seeding...';
    RAISE NOTICE 'Tenant: %, Branch: %', v_tenant_id, v_branch_id;
    
    -- Get or create doctor and department
    SELECT id INTO v_doctor_user_id FROM users 
    WHERE email LIKE '%doctor%' LIMIT 1;
    
    IF v_doctor_user_id IS NULL THEN
        v_doctor_user_id := v_admin_user_id;
    END IF;
    
    SELECT id INTO v_department_id FROM department 
    WHERE tenant_id = v_tenant_id LIMIT 1;
    
    IF v_department_id IS NULL THEN
        INSERT INTO department (
            id, tenant_id, name, description, status,
            created_at, created_by_user_id
        ) VALUES (
            gen_random_uuid(), v_tenant_id, 'General Medicine', 'Test Department',
            'active', NOW(), v_admin_user_id
        ) RETURNING id INTO v_department_id;
    END IF;
    
    -- Create 30 patients (reusable pool)
    RAISE NOTICE 'Creating 30 patients...';
    FOR i IN 1..30 LOOP
        INSERT INTO patient (
            id, tenant_id, branch_id, medical_record_number,
            title, first_name, last_name,
            date_of_birth, gender, contact_number, email,
            blood_group, marital_status,
            address_line_1, country, pin_code,
            status, created_at, updated_at, created_by_user_id
        ) VALUES (
            gen_random_uuid(), v_tenant_id, v_branch_id,
            'MRN' || LPAD(i::text, 6, '0'),
            CASE WHEN random() > 0.5 THEN 'Mr.' ELSE 'Mrs.' END,
            'Patient' || i, 'Test' || i,
            CURRENT_DATE - ((random() * 20000 + 7300)::int || ' days')::interval,
            CASE WHEN random() > 0.5 THEN 'male' ELSE 'female' END,
            '+91' || LPAD((9000000000 + i)::text, 10, '0'),
            'patient' || i || '@test.com',
            CASE (random() * 7)::int
                WHEN 0 THEN 'A+' WHEN 1 THEN 'B+' WHEN 2 THEN 'O+'
                WHEN 3 THEN 'AB+' WHEN 4 THEN 'A-' WHEN 5 THEN 'B-'
                ELSE 'O-' END,
            CASE WHEN random() > 0.3 THEN 'married' ELSE 'single' END,
            i || ' Test Street', 'India', '500001',
            'active', NOW(), NOW(), v_admin_user_id
        );
    END LOOP;
    
    -- Create 6 appointments per day for 30 days (180 total)
    RAISE NOTICE 'Creating 180 appointments...';
    FOR v_day_offset IN 0..29 LOOP
        FOR v_scenario IN 1..6 LOOP
            -- Get a patient (cycle through 30 patients)
            SELECT id INTO v_patient_id FROM patient 
            WHERE tenant_id = v_tenant_id 
            ORDER BY created_at 
            OFFSET (v_day_offset * 6 + v_scenario - 1) % 30 
            LIMIT 1;
            
            -- Create appointment
            INSERT INTO appointment (
                id, tenant_id, branch_id, patient_id,
                appointment_date_time, department_id,
                doctor_user_id, appointment_type, status,
                notes, created_at, created_by_user_id
            ) VALUES (
                gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_id,
                v_current_date + v_day_offset + (9 + v_scenario) * INTERVAL '1 hour',
                v_department_id, v_doctor_user_id,
                'consultation', 'scheduled',
                'Scenario ' || v_scenario || ' - Day ' || v_day_offset,
                NOW(), v_admin_user_id
            ) RETURNING id INTO v_appointment_id;
            
            -- Create bill
            v_total_amount := v_consultation_fee;
            INSERT INTO opd_bill (
                id, tenant_id, branch_id, patient_id, appointment_id,
                bill_date, total_amount, discount_amount,
                tax_amount, net_amount, amount_paid, balance_due,
                status, is_finalized, created_at, created_by_user_id
            ) VALUES (
                gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_id, v_appointment_id,
                v_current_date + v_day_offset, v_total_amount, 0, 0,
                v_total_amount, 0, v_total_amount,
                CASE WHEN v_scenario IN (1,2,4,6) THEN 'paid' ELSE 'pending' END,
                v_scenario IN (1,2,6), -- Finalize scenarios 1,2,6
                NOW(), v_admin_user_id
            ) RETURNING id INTO v_bill_id;
            
            -- Create bill item
            INSERT INTO bill_item (
                id, tenant_id, opd_bill_id, item_type, description,
                quantity, unit_price, total_price,
                created_at, created_by_user_id
            ) VALUES (
                gen_random_uuid(), v_tenant_id, v_bill_id,
                'consultation', 'Consultation Fee', 1, v_consultation_fee,
                v_consultation_fee, NOW(), v_admin_user_id
            );
            
            -- Create payments based on scenario
            IF v_scenario IN (1,2) THEN
                -- Fully paid + finalized → REFUND testing
                v_paid_amount := v_total_amount;
                INSERT INTO opd_bill_payment (
                    id, tenant_id, opd_bill_id, payment_date,
                    amount, payment_method, reference_number,
                    status, created_at, created_by_user_id
                ) VALUES (
                    gen_random_uuid(), v_tenant_id, v_bill_id,
                    v_current_date + v_day_offset, v_paid_amount,
                    'cash', 'PMT' || v_bill_id::text, 'completed',
                    NOW(), v_admin_user_id
                );
                UPDATE opd_bill SET amount_paid = v_paid_amount, balance_due = 0
                WHERE id = v_bill_id;
                
            ELSIF v_scenario = 3 THEN
                -- Partial payment → PAYMENT collection
                v_paid_amount := v_total_amount * 0.6; -- 60% paid
                INSERT INTO opd_bill_payment (
                    id, tenant_id, opd_bill_id, payment_date,
                    amount, payment_method, reference_number,
                    status, created_at, created_by_user_id
                ) VALUES (
                    gen_random_uuid(), v_tenant_id, v_bill_id,
                    v_current_date + v_day_offset, v_paid_amount,
                    'card', 'PMT' || v_bill_id::text, 'completed',
                    NOW(), v_admin_user_id
                );
                UPDATE opd_bill SET amount_paid = v_paid_amount, 
                    balance_due = v_total_amount - v_paid_amount,
                    status = 'partially_paid'
                WHERE id = v_bill_id;
                
            ELSIF v_scenario = 4 THEN
                -- Fully paid but NOT finalized → FINALIZATION testing
                v_paid_amount := v_total_amount;
                INSERT INTO opd_bill_payment (
                    id, tenant_id, opd_bill_id, payment_date,
                    amount, payment_method, reference_number,
                    status, created_at, created_by_user_id
                ) VALUES (
                    gen_random_uuid(), v_tenant_id, v_bill_id,
                    v_current_date + v_day_offset, v_paid_amount,
                    'upi', 'PMT' || v_bill_id::text, 'completed',
                    NOW(), v_admin_user_id
                );
                UPDATE opd_bill SET amount_paid = v_paid_amount, balance_due = 0
                WHERE id = v_bill_id;
                
            ELSIF v_scenario = 5 THEN
                -- Unpaid → CHECK-IN gate failure
                UPDATE opd_bill SET amount_paid = 0, balance_due = v_total_amount
                WHERE id = v_bill_id;
                
            ELSIF v_scenario = 6 THEN
                -- Fully paid + finalized + create visit → WALKOUT testing
                v_paid_amount := v_total_amount;
                INSERT INTO opd_bill_payment (
                    id, tenant_id, opd_bill_id, payment_date,
                    amount, payment_method, reference_number,
                    status, created_at, created_by_user_id
                ) VALUES (
                    gen_random_uuid(), v_tenant_id, v_bill_id,
                    v_current_date + v_day_offset, v_paid_amount,
                    'cash', 'PMT' || v_bill_id::text, 'completed',
                    NOW(), v_admin_user_id
                );
                UPDATE opd_bill SET amount_paid = v_paid_amount, balance_due = 0
                WHERE id = v_bill_id;
                
                -- Create visit only for today's scenario 6 (walkout testing)
                IF v_day_offset = 0 THEN
                    INSERT INTO visit (
                        id, tenant_id, branch_id, patient_id, appointment_id,
                        visit_date, visit_type, status,
                        check_in_time, created_at, created_by_user_id
                    ) VALUES (
                        gen_random_uuid(), v_tenant_id, v_branch_id, v_patient_id, v_appointment_id,
                        v_current_date, 'opd', 'waiting_area',
                        NOW(), NOW(), v_admin_user_id
                    );
                END IF;
            END IF;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Test data seeding completed successfully!';
    RAISE NOTICE 'Created: 30 Patients, 180 Appointments, 180 Bills, ~150 Payments, ~6 Visits (today)';
END $$;
