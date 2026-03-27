-- ============================================================================
-- Phase 1 Test Data Seeding Script
-- Date: January 30, 2026
-- Purpose: Create 5-6 appointments per day for next 30 days with bills/payments
-- Features: Bill Finalization, Check-In, Refunds, Walkout scenarios
-- ============================================================================

DO $$
DECLARE
    v_tenant_id UUID := (SELECT id FROM tenant LIMIT 1);
    v_branch_id UUID := (SELECT id FROM branch WHERE tenant_id = v_tenant_id LIMIT 1);
    v_admin_user_id UUID := (SELECT id FROM users WHERE email = 'admin@test.com' LIMIT 1);
    v_doctor_user_id UUID;
    v_department_id UUID;
    
    v_patient_id UUID;
    v_appointment_id UUID;
    v_bill_id UUID;
    v_payment_id UUID;
    v_visit_id UUID;
    
    v_current_date DATE := CURRENT_DATE;
    v_day_offset INT;
    v_appointment_time TIME;
    v_patient_count INT := 0;
    
    -- Patient names for variety
    v_first_names TEXT[] := ARRAY['Rajesh', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Suresh', 'Meera', 'Karthik', 'Divya', 
                                   'Ravi', 'Lakshmi', 'Arun', 'Kavita', 'Manoj', 'Pooja', 'Sanjay', 'Rekha', 'Deepak', 'Nisha',
                                   'Harish', 'Swati', 'Ramesh', 'Anita', 'Naveen', 'Shweta', 'Prakash', 'Geeta', 'Vijay', 'Rani'];
    v_last_names TEXT[] := ARRAY['Kumar', 'Sharma', 'Reddy', 'Iyer', 'Patel', 'Singh', 'Gupta', 'Nair', 'Rao', 'Verma',
                                  'Mehta', 'Joshi', 'Desai', 'Pillai', 'Menon', 'Bhat', 'Kulkarni', 'Agarwal', 'Mishra', 'Saxena'];
    
    v_first_name TEXT;
    v_last_name TEXT;
    v_mrn TEXT;
    v_phone TEXT;
    v_bill_amount DECIMAL;
    v_payment_amount DECIMAL;
    v_scenario INT;
BEGIN
    -- Get or create doctor and department
    SELECT id INTO v_doctor_user_id FROM users 
    WHERE email LIKE '%doctor%' OR email = 'doctor@test.com' LIMIT 1;
    
    IF v_doctor_user_id IS NULL THEN
        v_doctor_user_id := v_admin_user_id;
    END IF;
    
    SELECT id INTO v_department_id FROM department 
    WHERE tenant_id = v_tenant_id LIMIT 1;
    
    RAISE NOTICE 'Starting Phase 1 test data seeding...';
    RAISE NOTICE 'Tenant: %, Branch: %', v_tenant_id, v_branch_id;
    
    -- Create 30 patients (reusable pool)
    FOR i IN 1..30 LOOP
        v_first_name := v_first_names[1 + (random() * (array_length(v_first_names, 1) - 1))::int];
        v_last_name := v_last_names[1 + (random() * (array_length(v_last_names, 1) - 1))::int];
        v_mrn := 'MRN' || LPAD(i::TEXT, 6, '0');
        v_phone := '9' || LPAD((random() * 999999999)::bigint::TEXT, 9, '0');
        
        INSERT INTO patient (
            id, tenant_id, branch_id, mrn, title, first_name, last_name, 
            date_of_birth, gender, phone, email, blood_group, marital_status,
            address_line1, city, state, pincode, country,
            registration_date, registration_type, status,
            created_at, created_by_user_id
        ) VALUES (
            gen_random_uuid(), v_tenant_id, v_branch_id, v_mrn, 
            CASE WHEN random() > 0.5 THEN 'Mr.' ELSE 'Mrs.' END,
            v_first_name, v_last_name,
            CURRENT_DATE - ((random() * 25000 + 7300)::int || ' days')::interval, -- Age 20-90
            CASE WHEN random() > 0.5 THEN 'male' ELSE 'female' END,
            v_phone,
            LOWER(v_first_name || '.' || v_last_name || i || '@email.com'),
            CASE (random() * 7)::int
                WHEN 0 THEN 'A+' WHEN 1 THEN 'B+' WHEN 2 THEN 'O+' 
                WHEN 3 THEN 'AB+' WHEN 4 THEN 'A-' WHEN 5 THEN 'B-' 
                ELSE 'O-' END,
            CASE WHEN random() > 0.3 THEN 'married' ELSE 'single' END,
            (i || ' Main Street'), 'City' || (i % 10), 'State', '500001', 'India',
            v_current_date - (i || ' days')::interval,
            'walk_in', 'active', NOW(), v_admin_user_id
        );
        
        v_patient_count := v_patient_count + 1;
    END LOOP;
    
    RAISE NOTICE 'Created % patients', v_patient_count;
    
    -- Create appointments, bills, and payments for next 30 days (5-6 per day)
    FOR v_day_offset IN 0..29 LOOP
        FOR v_scenario IN 1..6 LOOP
            -- Select random patient
            SELECT id INTO v_patient_id FROM patient 
            WHERE tenant_id = v_tenant_id 
            ORDER BY random() LIMIT 1;
            
            -- Set appointment time (9 AM to 4 PM)
            v_appointment_time := ('09:00:00'::time + ((v_scenario - 1) * interval '1 hour 30 minutes'));
            
            -- Create Appointment
            v_appointment_id := gen_random_uuid();
            INSERT INTO appointment (
                id, tenant_id, branch_id, patient_id, consultant_id, department_id,
                appointment_date, appointment_time, appointment_type, status,
                chief_complaint, notes, created_at, created_by_user_id
            ) VALUES (
                v_appointment_id, v_tenant_id, v_branch_id, v_patient_id, 
                v_doctor_user_id, v_department_id,
                v_current_date + (v_day_offset || ' days')::interval,
                v_appointment_time,
                CASE WHEN v_scenario = 1 THEN 'new_patient' ELSE 'follow_up' END,
                CASE 
                    WHEN v_day_offset < 0 THEN 'completed'
                    WHEN v_day_offset = 0 THEN 'scheduled'
                    ELSE 'scheduled'
                END,
                CASE v_scenario
                    WHEN 1 THEN 'Eye pain and redness'
                    WHEN 2 THEN 'Blurred vision'
                    WHEN 3 THEN 'Regular checkup'
                    WHEN 4 THEN 'Follow-up cataract'
                    WHEN 5 THEN 'Prescription refill'
                    ELSE 'Eye irritation'
                END,
                'Auto-generated test appointment',
                NOW(), v_admin_user_id
            );
            
            -- Create OPD Bill with different scenarios
            v_bill_id := gen_random_uuid();
            
            -- Vary bill amounts
            v_bill_amount := CASE v_scenario
                WHEN 1 THEN 500.00  -- Basic consultation
                WHEN 2 THEN 800.00  -- With basic tests
                WHEN 3 THEN 1200.00 -- Complex consultation
                WHEN 4 THEN 600.00  -- Follow-up reduced
                WHEN 5 THEN 450.00  -- Quick consultation
                ELSE 750.00         -- Average
            END;
            
            INSERT INTO opd_bill (
                id, tenant_id, patient_id, appointment_id, branch_id,
                bill_number, bill_date,
                consultation_fee, registration_fee, additional_charges,
                gross_amount, discount_percentage, discount_amount,
                tax_amount, net_amount, amount_paid, balance_due,
                status, is_free_visit, is_credit, is_insurance,
                insurance_claim_amount, is_finalized, finalized_at, finalized_by_user_id,
                refund_status, refund_amount, refund_reason,
                notes, generated_by, created_at, created_by_user_id
            ) VALUES (
                v_bill_id, v_tenant_id, v_patient_id, v_appointment_id, v_branch_id,
                'OPD' || TO_CHAR(v_current_date + (v_day_offset || ' days')::interval, 'YYYYMMDD') || 
                LPAD(v_scenario::TEXT, 3, '0'),
                v_current_date + (v_day_offset || ' days')::interval,
                v_bill_amount * 0.7, -- 70% consultation
                CASE WHEN v_scenario = 1 THEN v_bill_amount * 0.1 ELSE 0 END, -- 10% registration for new
                v_bill_amount * 0.2, -- 20% additional
                v_bill_amount,
                CASE WHEN v_scenario IN (3, 6) THEN 10.0 ELSE 0.0 END, -- 10% discount sometimes
                CASE WHEN v_scenario IN (3, 6) THEN v_bill_amount * 0.1 ELSE 0.0 END,
                0.0, -- No tax
                CASE WHEN v_scenario IN (3, 6) THEN v_bill_amount * 0.9 ELSE v_bill_amount END,
                -- Payment scenarios:
                -- Scenario 1-2: Fully paid and finalized (for refund testing)
                -- Scenario 3: Partially paid (for payment collection testing)
                -- Scenario 4: Fully paid but not finalized (for finalization testing)
                -- Scenario 5: Unpaid (for check-in gate testing)
                -- Scenario 6: Fully paid and finalized (for walkout testing)
                CASE 
                    WHEN v_scenario IN (1, 2, 4, 6) THEN CASE WHEN v_scenario IN (3, 6) THEN v_bill_amount * 0.9 ELSE v_bill_amount END
                    WHEN v_scenario = 3 THEN (CASE WHEN v_scenario IN (3, 6) THEN v_bill_amount * 0.9 ELSE v_bill_amount END) * 0.5
                    ELSE 0.0
                END,
                CASE 
                    WHEN v_scenario IN (1, 2, 4, 6) THEN 0.0
                    WHEN v_scenario = 3 THEN (CASE WHEN v_scenario IN (3, 6) THEN v_bill_amount * 0.9 ELSE v_bill_amount END) * 0.5
                    ELSE CASE WHEN v_scenario IN (3, 6) THEN v_bill_amount * 0.9 ELSE v_bill_amount END
                END,
                CASE 
                    WHEN v_scenario IN (1, 2, 6) THEN 'paid'
                    WHEN v_scenario = 3 THEN 'partial'
                    WHEN v_scenario = 4 THEN 'paid'
                    ELSE 'pending'
                END,
                false, false, false, 0.0,
                -- Finalize scenarios 1, 2, 6 (for refund/walkout testing)
                CASE WHEN v_scenario IN (1, 2, 6) THEN true ELSE false END,
                CASE WHEN v_scenario IN (1, 2, 6) THEN NOW() ELSE NULL END,
                CASE WHEN v_scenario IN (1, 2, 6) THEN v_admin_user_id ELSE NULL END,
                'none', 0.0, NULL,
                'Test bill for scenario ' || v_scenario,
                v_admin_user_id, NOW(), v_admin_user_id
            );
            
            -- Create payment records for paid scenarios
            IF v_scenario IN (1, 2, 3, 4, 6) THEN
                v_payment_amount := CASE 
                    WHEN v_scenario IN (1, 2, 4, 6) THEN CASE WHEN v_scenario IN (3, 6) THEN v_bill_amount * 0.9 ELSE v_bill_amount END
                    WHEN v_scenario = 3 THEN (CASE WHEN v_scenario IN (3, 6) THEN v_bill_amount * 0.9 ELSE v_bill_amount END) * 0.5
                    ELSE 0.0
                END;
                
                v_payment_id := gen_random_uuid();
                INSERT INTO opd_bill_payment (
                    id, tenant_id, opd_bill_id, payment_reference,
                    payment_mode, amount, payment_date,
                    card_type, card_last_four, card_network,
                    upi_id, upi_transaction_id,
                    bank_name, cheque_number,
                    received_by, receipt_number, status, notes,
                    created_at, created_by_user_id
                ) VALUES (
                    v_payment_id, v_tenant_id, v_bill_id,
                    'PAY' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS') || v_scenario,
                    CASE v_scenario
                        WHEN 1 THEN 'cash'
                        WHEN 2 THEN 'card'
                        WHEN 3 THEN 'upi'
                        WHEN 4 THEN 'cash'
                        ELSE 'card'
                    END,
                    v_payment_amount,
                    v_current_date + (v_day_offset || ' days')::interval,
                    CASE WHEN v_scenario IN (2, 6) THEN 'credit' ELSE NULL END,
                    CASE WHEN v_scenario IN (2, 6) THEN '4532' ELSE NULL END,
                    CASE WHEN v_scenario IN (2, 6) THEN 'visa' ELSE NULL END,
                    CASE WHEN v_scenario = 3 THEN 'patient@upi' ELSE NULL END,
                    CASE WHEN v_scenario = 3 THEN 'UPI' || (random() * 1000000000)::bigint ELSE NULL END,
                    NULL, NULL,
                    v_admin_user_id,
                    'RCP' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(v_scenario::TEXT, 4, '0'),
                    'completed',
                    'Test payment',
                    NOW(), v_admin_user_id
                );
            END IF;
            
            -- Create Visit for day 0 scenarios (today's appointments need visits for check-in testing)
            IF v_day_offset = 0 AND v_scenario IN (1, 2, 4, 6) THEN
                v_visit_id := gen_random_uuid();
                INSERT INTO visit (
                    id, tenant_id, patient_id, appointment_id, opd_bill_id, branch_id,
                    consultant_id, department_id,
                    visit_type, visit_category, status,
                    token_number, token_sequence,
                    checked_in_at, checked_in_by,
                    current_station, is_emergency,
                    notes, created_at, created_by_user_id
                ) VALUES (
                    v_visit_id, v_tenant_id, v_patient_id, v_appointment_id, v_bill_id, v_branch_id,
                    v_doctor_user_id, v_department_id,
                    'new', 'consultation',
                    CASE WHEN v_scenario = 6 THEN 'waiting' ELSE 'checked_in' END, -- Scenario 6 for walkout testing
                    'T' || LPAD(v_scenario::TEXT, 3, '0'),
                    v_scenario,
                    NOW() - interval '30 minutes',
                    v_admin_user_id,
                    'waiting_area', false,
                    'Test visit for scenario ' || v_scenario,
                    NOW(), v_admin_user_id
                );
            END IF;
            
        END LOOP;
        
        IF v_day_offset % 5 = 0 THEN
            RAISE NOTICE 'Completed day % (Date: %)', v_day_offset, v_current_date + (v_day_offset || ' days')::interval;
        END IF;
    END LOOP;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Phase 1 Test Data Seeding Complete!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '  - 30 Patients';
    RAISE NOTICE '  - 180 Appointments (6 per day x 30 days)';
    RAISE NOTICE '  - 180 OPD Bills';
    RAISE NOTICE '  - ~150 Payments';
    RAISE NOTICE '  - ~24 Visits (today only)';
    RAISE NOTICE '';
    RAISE NOTICE 'Test Scenarios per Day:';
    RAISE NOTICE '  1. Fully paid + finalized (REFUND testing)';
    RAISE NOTICE '  2. Fully paid + finalized (REFUND testing)';
    RAISE NOTICE '  3. Partially paid (PAYMENT collection)';
    RAISE NOTICE '  4. Fully paid, NOT finalized (FINALIZATION)';
    RAISE NOTICE '  5. Unpaid (CHECK-IN gate failure)';
    RAISE NOTICE '  6. Fully paid + finalized + visit (WALKOUT)';
    RAISE NOTICE '';
    RAISE NOTICE 'Ready for Phase 1 testing!';
    
END $$;
