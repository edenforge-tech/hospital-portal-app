-- =====================================================================
-- Payment Transactions Seed Data
-- Version: 56
-- Purpose: Create 30 payment transaction records with various payment types
-- Prerequisite: Run 20_seed_patients.sql, 53_seed_master_data_final.sql, 54_seed_counseling_sessions.sql
-- =====================================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_branch_id UUID;
    v_user_id UUID;
    v_patient_ids UUID[];
    v_session_ids UUID[];
    v_govt_scheme_ids UUID[];
BEGIN
    -- Get first available tenant, branch, and user
    SELECT id INTO v_tenant_id FROM tenant LIMIT 1;
    SELECT id INTO v_branch_id FROM branch WHERE tenant_id = v_tenant_id LIMIT 1;
    SELECT id INTO v_user_id FROM users LIMIT 1;
    
    -- Get patient IDs
    SELECT ARRAY_AGG(id ORDER BY medical_record_number) INTO v_patient_ids
    FROM patient WHERE tenant_id = v_tenant_id AND medical_record_number LIKE 'MRN%' LIMIT 30;
    
    -- Get counseling session IDs
    SELECT ARRAY_AGG(id ORDER BY session_number) INTO v_session_ids
    FROM counseling_sessions WHERE tenant_id = v_tenant_id AND session_number LIKE 'CS-%' LIMIT 30;
    
    -- Get government scheme IDs
    SELECT ARRAY_AGG(id ORDER BY display_order) INTO v_govt_scheme_ids
    FROM government_schemes WHERE tenant_id = v_tenant_id AND is_active = true;
    
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
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SEEDING 30 PAYMENT TRANSACTIONS';
    RAISE NOTICE 'Tenant: %, Branch: %', v_tenant_id, v_branch_id;
    RAISE NOTICE 'Patients: %, Sessions: %', 
                 array_length(v_patient_ids, 1),
                 COALESCE(array_length(v_session_ids, 1), 0);
    RAISE NOTICE '========================================';
    
    -- Delete existing sample payments
    DELETE FROM payment_transactions WHERE transaction_number LIKE 'TXN-%' AND tenant_id = v_tenant_id;
    
    -- =====================================================================
    -- Insert 30 Payment Transactions
    -- =====================================================================
    
    -- Cash Payments (10 records)
    INSERT INTO payment_transactions (
        id, tenant_id, branch_id, patient_id, session_id,
        transaction_number, payment_type, payment_mode,
        amount_paid, transaction_date, transaction_time,
        payment_purpose, status, remarks,
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
        'TXN-' || TO_CHAR(CURRENT_DATE - ((i % 7) * INTERVAL '1 day'), 'YYYYMMDD') || '-' || LPAD(i::TEXT, 6, '0'),
        'Advance',
        'Cash',
        5000 + (i * 500),
        CURRENT_DATE - ((i % 7) * INTERVAL '1 day'),
        (CURRENT_DATE - ((i % 7) * INTERVAL '1 day')) + TIME '09:00:00' + ((i * 30) * INTERVAL '1 minute'),
        CASE (i % 3)
            WHEN 0 THEN 'Surgery advance payment'
            WHEN 1 THEN 'Consultation fee'
            ELSE 'Investigation charges'
        END,
        'Completed',
        'Cash payment received and receipt issued.',
        NOW() - ((i % 7) * INTERVAL '1 day'),
        NOW() - ((i % 7) * INTERVAL '1 day'),
        v_user_id,
        v_user_id
    FROM generate_series(1, 10) AS i;
    
    -- Card Payments (8 records)
    INSERT INTO payment_transactions (
        id, tenant_id, branch_id, patient_id, session_id,
        transaction_number, payment_type, payment_mode,
        amount_paid, transaction_date, transaction_time,
        card_transaction_id, payment_purpose, status, remarks,
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
        'TXN-' || TO_CHAR(CURRENT_DATE - ((i % 5) * INTERVAL '1 day'), 'YYYYMMDD') || '-' || LPAD((1000 + i)::TEXT, 6, '0'),
        CASE (i % 2)
            WHEN 0 THEN 'Advance'
            ELSE 'Final Payment'
        END,
        CASE (i % 2)
            WHEN 0 THEN 'Debit Card'
            ELSE 'Credit Card'
        END,
        15000 + (i * 2500),
        CURRENT_DATE - ((i % 5) * INTERVAL '1 day'),
        (CURRENT_DATE - ((i % 5) * INTERVAL '1 day')) + TIME '10:00:00' + ((i * 25) * INTERVAL '1 minute'),
        'CARD' || LPAD((i * 123456)::TEXT, 16, '0'),
        CASE (i % 3)
            WHEN 0 THEN 'Surgery package payment'
            WHEN 1 THEN 'IOL implant charges'
            ELSE 'Final settlement'
        END,
        'Completed',
        'Card payment processed successfully via POS terminal.',
        NOW() - ((i % 5) * INTERVAL '1 day'),
        NOW() - ((i % 5) * INTERVAL '1 day'),
        v_user_id,
        v_user_id
    FROM generate_series(11, 18) AS i;
    
    -- Online/UPI Payments (7 records)
    INSERT INTO payment_transactions (
        id, tenant_id, branch_id, patient_id, session_id,
        transaction_number, payment_type, payment_mode,
        amount_paid, transaction_date, transaction_time,
        online_transaction_id, payment_purpose, status, remarks,
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
        'TXN-' || TO_CHAR(CURRENT_DATE - ((i % 4) * INTERVAL '1 day'), 'YYYYMMDD') || '-' || LPAD((2000 + i)::TEXT, 6, '0'),
        CASE (i % 3)
            WHEN 0 THEN 'Advance'
            WHEN 1 THEN 'Partial Payment'
            ELSE 'Final Payment'
        END,
        CASE (i % 3)
            WHEN 0 THEN 'UPI'
            WHEN 1 THEN 'Net Banking'
            ELSE 'UPI'
        END,
        8000 + (i * 3500),
        CURRENT_DATE - ((i % 4) * INTERVAL '1 day'),
        (CURRENT_DATE - ((i % 4) * INTERVAL '1 day')) + TIME '11:00:00' + ((i * 20) * INTERVAL '1 minute'),
        'UPI' || LPAD((i * 234567)::TEXT, 12, '0'),
        CASE (i % 3)
            WHEN 0 THEN 'Surgery booking advance'
            WHEN 1 THEN 'Additional investigation charges'
            ELSE 'Balance payment after insurance'
        END,
        'Completed',
        'Online payment received via payment gateway.',
        NOW() - ((i % 4) * INTERVAL '1 day'),
        NOW() - ((i % 4) * INTERVAL '1 day'),
        v_user_id,
        v_user_id
    FROM generate_series(19, 25) AS i;
    
    -- Government Scheme Payments (3 records)
    INSERT INTO payment_transactions (
        id, tenant_id, branch_id, patient_id, session_id,
        transaction_number, payment_type, payment_mode,
        government_scheme_id, scheme_reference_number,
        amount_paid, scheme_covered_amount, patient_contribution,
        transaction_date, transaction_time,
        payment_purpose, status, remarks,
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
        'TXN-' || TO_CHAR(CURRENT_DATE - (2 * INTERVAL '1 day'), 'YYYYMMDD') || '-' || LPAD((3000 + i)::TEXT, 6, '0'),
        'Final Payment',
        'Government Scheme',
        CASE 
            WHEN v_govt_scheme_ids IS NOT NULL AND array_length(v_govt_scheme_ids, 1) > 0
            THEN v_govt_scheme_ids[(i % array_length(v_govt_scheme_ids, 1)) + 1]
            ELSE NULL
        END,
        'SCHEME' || LPAD((i * 345678)::TEXT, 14, '0'),
        30000,
        25000,
        5000,
        CURRENT_DATE - (2 * INTERVAL '1 day'),
        (CURRENT_DATE - (2 * INTERVAL '1 day')) + TIME '14:00:00' + ((i * 15) * INTERVAL '1 minute'),
        'Cataract surgery under government scheme',
        'Completed',
        'Government scheme payment processed. Patient contribution received in cash.',
        NOW() - (2 * INTERVAL '1 day'),
        NOW() - (2 * INTERVAL '1 day'),
        v_user_id,
        v_user_id
    FROM generate_series(26, 28) AS i;
    
    -- Pending/Failed Payments (2 records)
    INSERT INTO payment_transactions (
        id, tenant_id, branch_id, patient_id, session_id,
        transaction_number, payment_type, payment_mode,
        amount_paid, transaction_date, transaction_time,
        online_transaction_id, payment_purpose, status, remarks,
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
        'TXN-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD((4000 + i)::TEXT, 6, '0'),
        'Advance',
        'UPI',
        12000,
        CURRENT_DATE,
        CURRENT_TIMESTAMP,
        'UPI' || LPAD((i * 456789)::TEXT, 12, '0'),
        'Surgery booking advance',
        CASE (i % 2)
            WHEN 0 THEN 'Pending'
            ELSE 'Failed'
        END,
        CASE (i % 2)
            WHEN 0 THEN 'Payment initiated. Awaiting bank confirmation.'
            ELSE 'Payment failed due to insufficient funds. Patient advised to retry.'
        END,
        NOW(),
        NOW(),
        v_user_id,
        v_user_id
    FROM generate_series(29, 30) AS i;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ PAYMENT TRANSACTIONS SEEDING COMPLETE';
    RAISE NOTICE '✅ Created 10 Cash payments';
    RAISE NOTICE '✅ Created 8 Card payments';
    RAISE NOTICE '✅ Created 7 Online/UPI payments';
    RAISE NOTICE '✅ Created 3 Government Scheme payments';
    RAISE NOTICE '✅ Created 2 Pending/Failed payments';
    RAISE NOTICE '========================================';
END $$;

-- Verify
SELECT 
    payment_mode,
    status,
    COUNT(*) as count,
    SUM(amount_paid) as total_amount
FROM payment_transactions
WHERE transaction_number LIKE 'TXN-%'
GROUP BY payment_mode, status
ORDER BY payment_mode, status;

SELECT 
    payment_type,
    COUNT(*) as count,
    SUM(amount_paid) as total_amount,
    AVG(amount_paid) as avg_amount
FROM payment_transactions
WHERE transaction_number LIKE 'TXN-%'
GROUP BY payment_type
ORDER BY total_amount DESC;
