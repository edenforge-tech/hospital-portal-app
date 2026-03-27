-- =====================================================================
-- Payment Transactions Seed Data (FIXED)
-- Version: 56-FIXED
-- Purpose: Create 30 payment transaction records with various payment methods
-- Schema: Matches actual payment_transactions table structure
-- =====================================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_branch_id UUID;
    v_user_id UUID;
    v_patient_ids UUID[];
    v_session_ids UUID[];
    v_package_ids UUID[];
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
    
    -- Get package IDs (if any exist)
    SELECT ARRAY_AGG(id) INTO v_package_ids
    FROM counselor_packages WHERE tenant_id = v_tenant_id LIMIT 10;
    
    -- Fallbacks
    IF v_tenant_id IS NULL THEN
        v_tenant_id := '11b26293-9d9c-4633-927e-3294bff2a8d7'::UUID;
    END IF;
    
    IF v_branch_id IS NULL THEN
        SELECT id INTO v_branch_id FROM branch LIMIT 1;
    END IF;
    
    IF v_user_id IS NULL THEN
        v_user_id := '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81'::UUID;
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
    
    -- 1-10: Cash Payments
    INSERT INTO payment_transactions (
        id, tenant_id, branch_id, patient_id, session_id, package_id,
        transaction_number, transaction_date,
        total_bill_amount, discount_amount, net_payable_amount, amount_paid, balance_due,
        payment_method, payment_status, receipt_number, receipt_generated_at,
        created_at, created_by_user_id, updated_at, updated_by_user_id
    )
    SELECT
        gen_random_uuid(),
        v_tenant_id,
        v_branch_id,
        v_patient_ids[(i % array_length(v_patient_ids, 1)) + 1],
        CASE WHEN v_session_ids IS NOT NULL AND array_length(v_session_ids, 1) >= i 
             THEN v_session_ids[i] ELSE NULL END,
        NULL,
        'TXN-' || TO_CHAR(CURRENT_DATE - ((i % 7) * INTERVAL '1 day'), 'YYYYMMDD') || '-' || LPAD(i::TEXT, 6, '0'),
        CURRENT_DATE - ((i % 7) * INTERVAL '1 day'),
        (5000 + (i * 500))::NUMERIC,
        (200 + (i * 50))::NUMERIC,
        (4800 + (i * 450))::NUMERIC,
        (4800 + (i * 450))::NUMERIC,
        0::NUMERIC,
        'Cash',
        'Completed',
        'RCP-CASH-' || TO_CHAR(CURRENT_DATE - ((i % 7) * INTERVAL '1 day'), 'YYYYMMDD') || '-' || LPAD(i::TEXT, 6, '0'),
        CURRENT_DATE - ((i % 7) * INTERVAL '1 day') + TIME '09:00:00' + ((i * 15) * INTERVAL '1 minute'),
        CURRENT_DATE - ((i % 7) * INTERVAL '1 day') + TIME '09:00:00' + ((i * 15) * INTERVAL '1 minute'),
        v_user_id,
        CURRENT_DATE - ((i % 7) * INTERVAL '1 day') + TIME '09:00:00' + ((i * 15) * INTERVAL '1 minute'),
        v_user_id
    FROM generate_series(1, 10) AS i;
    
    -- 11-18: Card Payments (Credit/Debit)
    INSERT INTO payment_transactions (
        id, tenant_id, branch_id, patient_id, session_id, package_id,
        transaction_number, transaction_date,
        total_bill_amount, discount_amount, net_payable_amount, amount_paid, balance_due,
        payment_method, payment_status, 
        card_last_four, card_type, card_approval_code, bank_reference_number,
        receipt_number, receipt_generated_at,
        created_at, created_by_user_id, updated_at, updated_by_user_id
    )
    SELECT
        gen_random_uuid(),
        v_tenant_id,
        v_branch_id,
        v_patient_ids[((i + 10) % array_length(v_patient_ids, 1)) + 1],
        CASE WHEN v_session_ids IS NOT NULL AND array_length(v_session_ids, 1) >= (i+10) 
             THEN v_session_ids[i+10] ELSE NULL END,
        NULL,
        'TXN-' || TO_CHAR(CURRENT_DATE - ((i % 5) * INTERVAL '1 day'), 'YYYYMMDD') || '-' || LPAD((i+10)::TEXT, 6, '0'),
        CURRENT_DATE - ((i % 5) * INTERVAL '1 day'),
        (7000 + (i * 1000))::NUMERIC,
        (300 + (i * 100))::NUMERIC,
        (6700 + (i * 900))::NUMERIC,
        (6700 + (i * 900))::NUMERIC,
        0::NUMERIC,
        CASE (i % 2) WHEN 0 THEN 'Card' ELSE 'Card' END,
        'Completed',
        LPAD((1234 + i)::TEXT, 4, '0'),
        CASE (i % 3) WHEN 0 THEN 'Visa' WHEN 1 THEN 'Mastercard' ELSE 'Rupay' END,
        'APPR' || LPAD((100000 + i)::TEXT, 6, '0'),
        'BNK' || LPAD((200000000 + i)::TEXT, 12, '0'),
        'RCP-CARD-' || TO_CHAR(CURRENT_DATE - ((i % 5) * INTERVAL '1 day'), 'YYYYMMDD') || '-' || LPAD((i+10)::TEXT, 6, '0'),
        CURRENT_DATE - ((i % 5) * INTERVAL '1 day') + TIME '10:30:00' + ((i * 20) * INTERVAL '1 minute'),
        CURRENT_DATE - ((i % 5) * INTERVAL '1 day') + TIME '10:30:00' + ((i * 20) * INTERVAL '1 minute'),
        v_user_id,
        CURRENT_DATE - ((i % 5) * INTERVAL '1 day') + TIME '10:30:00' + ((i * 20) * INTERVAL '1 minute'),
        v_user_id
    FROM generate_series(1, 8) AS i;
    
    -- 19-25: UPI/Online Payments (Razorpay)
    INSERT INTO payment_transactions (
        id, tenant_id, branch_id, patient_id, session_id, package_id,
        transaction_number, transaction_date,
        total_bill_amount, discount_amount, net_payable_amount, amount_paid, balance_due,
        payment_method, payment_status,
        razorpay_order_id, razorpay_payment_id, razorpay_signature,
        upi_transaction_id, upi_vpa,
        receipt_number, receipt_generated_at,
        created_at, created_by_user_id, updated_at, updated_by_user_id
    )
    SELECT
        gen_random_uuid(),
        v_tenant_id,
        v_branch_id,
        v_patient_ids[((i + 18) % array_length(v_patient_ids, 1)) + 1],
        CASE WHEN v_session_ids IS NOT NULL AND array_length(v_session_ids, 1) >= (i+18) 
             THEN v_session_ids[i+18] ELSE NULL END,
        NULL,
        'TXN-' || TO_CHAR(CURRENT_DATE - ((i % 3) * INTERVAL '1 day'), 'YYYYMMDD') || '-' || LPAD((i+18)::TEXT, 6, '0'),
        CURRENT_DATE - ((i % 3) * INTERVAL '1 day'),
        (6000 + (i * 800))::NUMERIC,
        (250 + (i * 80))::NUMERIC,
        (5750 + (i * 720))::NUMERIC,
        (5750 + (i * 720))::NUMERIC,
        0::NUMERIC,
        CASE (i % 3) WHEN 0 THEN 'UPI' WHEN 1 THEN 'OnlineGateway' ELSE 'OnlineGateway' END,
        'Completed',
        'order_' || LPAD((i + 1000000)::TEXT, 14, '0'),
        'pay_' || LPAD((i + 2000000)::TEXT, 14, '0'),
        md5(random()::TEXT),
        'UPI' || LPAD((300000000000::BIGINT + i)::TEXT, 12, '0'),
        CASE (i % 3)
            WHEN 0 THEN 'patient' || i || '@paytm'
            WHEN 1 THEN 'user' || i || '@phonepe'
            ELSE 'pay' || i || '@gpay'
        END,
        'RCP-UPI-' || TO_CHAR(CURRENT_DATE - ((i % 3) * INTERVAL '1 day'), 'YYYYMMDD') || '-' || LPAD((i+18)::TEXT, 6, '0'),
        CURRENT_DATE - ((i % 3) * INTERVAL '1 day') + TIME '14:15:00' + ((i * 25) * INTERVAL '1 minute'),
        CURRENT_DATE - ((i % 3) * INTERVAL '1 day') + TIME '14:15:00' + ((i * 25) * INTERVAL '1 minute'),
        v_user_id,
        CURRENT_DATE - ((i % 3) * INTERVAL '1 day') + TIME '14:15:00' + ((i * 25) * INTERVAL '1 minute'),
        v_user_id
    FROM generate_series(1, 7) AS i;
    
    -- 26-28: Cheque Payments
    INSERT INTO payment_transactions (
        id, tenant_id, branch_id, patient_id, session_id, package_id,
        transaction_number, transaction_date,
        total_bill_amount, discount_amount, net_payable_amount, amount_paid, balance_due,
        payment_method, payment_status,
        cheque_number, cheque_date, cheque_bank_name, cheque_clearance_status,
        created_at, created_by_user_id, updated_at, updated_by_user_id
    )
    SELECT
        gen_random_uuid(),
        v_tenant_id,
        v_branch_id,
        v_patient_ids[((i + 25) % array_length(v_patient_ids, 1)) + 1],
        CASE WHEN v_session_ids IS NOT NULL AND array_length(v_session_ids, 1) >= (i+25) 
             THEN v_session_ids[i+25] ELSE NULL END,
        NULL,
        'TXN-' || TO_CHAR(CURRENT_DATE - INTERVAL '2 days', 'YYYYMMDD') || '-' || LPAD((i+25)::TEXT, 6, '0'),
        CURRENT_DATE - INTERVAL '2 days',
        (10000 + (i * 2000))::NUMERIC,
        (500 + (i * 200))::NUMERIC,
        (9500 + (i * 1800))::NUMERIC,
        (9500 + (i * 1800))::NUMERIC,
        0::NUMERIC,
        'Cheque',
        CASE (i % 3) WHEN 0 THEN 'Processing' WHEN 1 THEN 'Completed' ELSE 'Completed' END,
        'CHQ' || LPAD((500000 + i)::TEXT, 6, '0'),
        CURRENT_DATE - INTERVAL '2 days',
        CASE (i % 3) WHEN 0 THEN 'HDFC Bank' WHEN 1 THEN 'ICICI Bank' ELSE 'SBI' END,
        CASE (i % 3) WHEN 0 THEN 'Pending' WHEN 1 THEN 'Cleared' ELSE 'Cleared' END,
        CURRENT_DATE - INTERVAL '2 days' + TIME '11:00:00',
        v_user_id,
        CURRENT_DATE - INTERVAL '2 days' + TIME '11:00:00',
        v_user_id
    FROM generate_series(1, 3) AS i;
    
    -- 29-30: Partial Payments (Pending/Failed)
    INSERT INTO payment_transactions (
        id, tenant_id, branch_id, patient_id, session_id, package_id,
        transaction_number, transaction_date,
        total_bill_amount, discount_amount, net_payable_amount, amount_paid, balance_due,
        payment_method, payment_status,
        gateway_response,
        created_at, created_by_user_id, updated_at, updated_by_user_id
    )
    SELECT
        gen_random_uuid(),
        v_tenant_id,
        v_branch_id,
        v_patient_ids[((i + 28) % array_length(v_patient_ids, 1)) + 1],
        CASE WHEN v_session_ids IS NOT NULL AND array_length(v_session_ids, 1) >= (i+28) 
             THEN v_session_ids[i+28] ELSE NULL END,
        NULL,
        'TXN-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD((i+28)::TEXT, 6, '0'),
        CURRENT_DATE,
        (15000 + (i * 5000))::NUMERIC,
        (0)::NUMERIC,
        (15000 + (i * 5000))::NUMERIC,
        CASE (i % 2) WHEN 0 THEN 5000::NUMERIC ELSE 0::NUMERIC END,
        (15000 + (i * 5000) - CASE (i % 2) WHEN 0 THEN 5000 ELSE 0 END)::NUMERIC,
        CASE (i % 2) WHEN 0 THEN 'Cash' ELSE 'UPI' END,
        CASE (i % 2) WHEN 0 THEN 'PartiallyPaid' ELSE 'Failed' END,
        CASE (i % 2) 
            WHEN 0 THEN '{"status": "partial", "message": "Partial payment received, balance pending"}'::JSONB
            ELSE '{"status": "failed", "error": "Insufficient funds", "code": "BAD_REQUEST_ERROR"}'::JSONB
        END,
        CURRENT_DATE + TIME '16:45:00',
        v_user_id,
        CURRENT_DATE + TIME '16:45:00',
        v_user_id
    FROM generate_series(1, 2) AS i;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'COMPLETED: Payment transactions seeded';
    RAISE NOTICE '========================================';
END $$;

-- Verification queries
SELECT 'Payment Transactions by Method' AS report, payment_method, COUNT(*) AS count
FROM payment_transactions
WHERE transaction_number LIKE 'TXN-%'
GROUP BY payment_method
ORDER BY count DESC;

SELECT 'Payment Transactions by Status' AS report, payment_status, COUNT(*) AS count
FROM payment_transactions
WHERE transaction_number LIKE 'TXN-%'
GROUP BY payment_status
ORDER BY payment_status;

SELECT 'Total Amount Collected' AS report, 
       SUM(amount_paid)::TEXT || ' INR' AS total_collected,
       SUM(balance_due)::TEXT || ' INR' AS total_pending
FROM payment_transactions
WHERE transaction_number LIKE 'TXN-%';
