-- =====================================================================
-- Workflow Dependencies Seed Data
-- Version: 57
-- Purpose: Populate workflow tables with realistic data linked to counseling sessions
-- Total: ~200 rows across 7 tables
-- =====================================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_user_id UUID;
    v_branch_id UUID;
    
    -- Session IDs by patient type
    v_insurance_sessions UUID[];
    v_copay_sessions UUID[];
    v_esh_sessions UUID[];
    v_cghs_sessions UUID[];
    v_arogyashree_sessions UUID[];
    v_sghs_sessions UUID[];
    v_cash_sessions UUID[];
    v_completed_sessions UUID[];
    v_all_sessions UUID[];
BEGIN
    -- Get reference data
    SELECT id INTO v_tenant_id FROM tenant LIMIT 1;
    SELECT id INTO v_user_id FROM users LIMIT 1;
    SELECT id INTO v_branch_id FROM branch LIMIT 1;
    
    -- Get session IDs by type
    SELECT ARRAY_AGG(id) INTO v_insurance_sessions 
    FROM counseling_sessions WHERE patient_type = 'Insurance' AND session_number LIKE 'CS-2024-%';
    
    SELECT ARRAY_AGG(id) INTO v_copay_sessions 
    FROM counseling_sessions WHERE patient_type = 'CoPay' AND session_number LIKE 'CS-2024-%';
    
    SELECT ARRAY_AGG(id) INTO v_esh_sessions 
    FROM counseling_sessions WHERE patient_type = 'ESH' AND session_number LIKE 'CS-2024-%';
    
    SELECT ARRAY_AGG(id) INTO v_cghs_sessions 
    FROM counseling_sessions WHERE patient_type = 'CGHS' AND session_number LIKE 'CS-2024-%';
    
    SELECT ARRAY_AGG(id) INTO v_arogyashree_sessions 
    FROM counseling_sessions WHERE patient_type = 'Arograshree' AND session_number LIKE 'CS-2024-%';
    
    SELECT ARRAY_AGG(id) INTO v_sghs_sessions 
    FROM counseling_sessions WHERE patient_type = 'SGHS' AND session_number LIKE 'CS-2024-%';
    
    SELECT ARRAY_AGG(id) INTO v_cash_sessions 
    FROM counseling_sessions WHERE patient_type = 'Cash' AND session_number LIKE 'CS-2024-%';
    
    SELECT ARRAY_AGG(id) INTO v_completed_sessions 
    FROM counseling_sessions WHERE status = 'Completed' AND session_number LIKE 'CS-2024-%';
    
    SELECT ARRAY_AGG(id) INTO v_all_sessions 
    FROM counseling_sessions WHERE session_number LIKE 'CS-2024-%';
    
    RAISE NOTICE 'Insurance: %, CoPay: %, ESH: %, CGHS: %, Arogyashree: %, SGHS: %, Cash: %', 
        ARRAY_LENGTH(v_insurance_sessions, 1), ARRAY_LENGTH(v_copay_sessions, 1), 
        ARRAY_LENGTH(v_esh_sessions, 1), ARRAY_LENGTH(v_cghs_sessions, 1),
        ARRAY_LENGTH(v_arogyashree_sessions, 1), ARRAY_LENGTH(v_sghs_sessions, 1),
        ARRAY_LENGTH(v_cash_sessions, 1);
    
    -- =====================================================================
    -- PART 1: INSURANCE PRE-AUTHORIZATIONS (~15 rows for Insurance + CoPay)
    -- =====================================================================
    
    -- Insurance pre-auths for Insurance patient sessions  
    FOR i IN 1..LEAST(ARRAY_LENGTH(v_insurance_sessions, 1), 9) LOOP
        INSERT INTO insurance_pre_authorizations (
            id, tenant_id, branch_id, session_id, patient_id,
            pre_auth_number, insurance_type, insurance_provider, policy_number, policy_holder_name,
            surgery_type, planned_procedure, requested_amount, approved_amount,
            status, tpa_name, tpa_approval_number,
            created_by_user_id, updated_by_user_id, created_at, updated_at
        )
        SELECT 
            gen_random_uuid(), v_tenant_id, v_branch_id, 
            v_insurance_sessions[i], cs.patient_id,
            'PREAUTH-INS-' || TO_CHAR(cs.session_date, 'YYYYMMDD') || '-' || LPAD(i::TEXT, 4, '0'),
            'Private',
            (ARRAY['ICICI Lombard', 'HDFC ERGO', 'Star Health', 'Care Insurance', 'Reliance Health'])[i % 5 + 1],
            'POL' || LPAD((1000000 + i)::TEXT, 7, '0'),
            'Policy Holder ' || i,
            cs.recommended_surgery,
            'Pre-authorization for ' || cs.recommended_surgery,
            (25000 + (i * 5000))::DECIMAL,
            CASE 
                WHEN cs.status = 'Completed' THEN (22000 + (i * 4500))::DECIMAL
                ELSE NULL
            END,
            CASE 
                WHEN cs.status = 'Completed' THEN (ARRAY['TPAApproved', 'TPAApproved', 'TPAPartiallyApproved'])[i % 3 + 1]
                ELSE (ARRAY['Draft', 'PendingInsuranceDeptReview', 'SubmittedToTPA'])[i % 3 + 1]
            END,
            (ARRAY['Medi Assist', 'Paramount TPA', 'Vidal Healthcare', 'Good Health TPA'])[i % 4 + 1],
            CASE WHEN cs.status = 'Completed' THEN 'TPAAPP-' || LPAD(i::TEXT, 6, '0') ELSE NULL END,
            v_user_id, v_user_id,
            cs.created_at, cs.updated_at
        FROM counseling_sessions cs
        WHERE cs.id = v_insurance_sessions[i];
    END LOOP;
    
    -- CoPay pre-auths
    FOR i IN 1..LEAST(ARRAY_LENGTH(v_copay_sessions, 1), 4) LOOP
        INSERT INTO insurance_pre_authorizations (
            id, tenant_id, branch_id, session_id, patient_id,
            pre_auth_number, insurance_type, insurance_provider, policy_number, policy_holder_name,
            surgery_type, planned_procedure, requested_amount, approved_amount,
            copay_amount, patient_payable, status,
            created_by_user_id, created_at
        )
        SELECT 
            gen_random_uuid(), v_tenant_id, v_branch_id, 
            v_copay_sessions[i], cs.patient_id,
            'PREAUTH-COPAY-' || TO_CHAR(cs.session_date, 'YYYYMMDD') || '-' || LPAD(i::TEXT, 4, '0'),
            'Corporate',
            'Corporate Health Insurance',
            'CORP' || LPAD((2000 + i)::TEXT, 6, '0'),
            'Employee ' || (i + 100),
            cs.recommended_surgery,
            'Corporate insurance with 20% co-payment',
            (30000 + (i * 3000))::DECIMAL,
            (24000 + (i * 2400))::DECIMAL,
            (6000 + (i * 600))::DECIMAL,
            (6000 + (i * 600))::DECIMAL,
            'TPAApproved',
            v_user_id,
            cs.created_at
        FROM counseling_sessions cs
        WHERE cs.id = v_copay_sessions[i];
    END LOOP;
    
    -- =====================================================================
    -- PART 2: GOVERNMENT SCHEME CLAIMS (~12 rows for ESH, CGHS, Arogyashree, SGHS)
    -- =====================================================================
    
    -- ESH Claims
    FOR i IN 1..LEAST(ARRAY_LENGTH(v_esh_sessions, 1), 3) LOOP
        INSERT INTO government_scheme_claims (
            id, tenant_id, branch_id, patient_id, session_id,
            scheme_name, scheme_id_number, beneficiary_name,
            claim_amount, approved_amount, treatment_details,
            documents_submitted, submission_date, claim_reference_number,
            claim_status, submitted_to_authority, authority_submission_date,
            created_by_user_id, created_at
        )
        SELECT 
            gen_random_uuid(), v_tenant_id, v_branch_id, cs.patient_id, cs.id,
            'Employees State Insurance (ESI)',
            'ESI' || LPAD((10000 + i)::TEXT, 8, '0'),
            p.first_name || ' ' || p.last_name,
            35000 + (i * 5000),
            CASE WHEN cs.status = 'Completed' THEN 32000 + (i * 4500) ELSE NULL END,
            'ESI coverage for ' || cs.recommended_surgery,
            CASE WHEN cs.status = 'Completed' THEN true ELSE false END,
            CASE WHEN cs.status = 'Completed' THEN cs.session_date + INTERVAL '1 day' ELSE NULL END,
            'ESI-CLAIM-' || LPAD(i::TEXT, 6, '0'),
            CASE WHEN cs.status = 'Completed' THEN 'Approved' ELSE 'Draft' END,
            CASE WHEN cs.status = 'Completed' THEN true ELSE false END,
            CASE WHEN cs.status = 'Completed' THEN cs.session_date + INTERVAL '2 days' ELSE NULL END,
            v_user_id, cs.created_at
        FROM counseling_sessions cs
        INNER JOIN patient p ON cs.patient_id = p.id
        WHERE cs.id = v_esh_sessions[i];
    END LOOP;
    
    -- CGHS Claims
    FOR i IN 1..LEAST(ARRAY_LENGTH(v_cghs_sessions, 1), 3) LOOP
        INSERT INTO government_scheme_claims (
            id, tenant_id, branch_id, patient_id, session_id,
            scheme_name, scheme_id_number, beneficiary_name,
            claim_amount, approved_amount, treatment_details,
            documents_submitted, submission_date, claim_reference_number,
            claim_status, submitted_to_authority,
            created_by_user_id, created_at
        )
        SELECT 
            gen_random_uuid(), v_tenant_id, v_branch_id, cs.patient_id, cs.id,
            'Central Government Health Scheme',
            'CGHS' || LPAD((20000 + i)::TEXT, 8, '0'),
            p.first_name || ' ' || p.last_name,
            28000 + (i * 4000),
            CASE WHEN cs.status = 'Completed' THEN 25000 + (i * 3500) ELSE NULL END,
            'CGHS reimbursement for ' || cs.recommended_surgery,
            true,
            cs.session_date + INTERVAL '1 day',
            'CGHS-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(i::TEXT, 5, '0'),
            CASE WHEN cs.status = 'Completed' THEN 'Approved' ELSE 'UnderReview' END,
            true,
            v_user_id, cs.created_at
        FROM counseling_sessions cs
        INNER JOIN patient p ON cs.patient_id = p.id
        WHERE cs.id = v_cghs_sessions[i];
    END LOOP;
    
    -- Arogyashree Claims
    FOR i IN 1..LEAST(ARRAY_LENGTH(v_arogyashree_sessions, 1), 3) LOOP
        INSERT INTO government_scheme_claims (
            id, tenant_id, branch_id, patient_id, session_id,
            scheme_name, scheme_id_number, beneficiary_name,
            claim_amount, treatment_details,
            documents_submitted, claim_reference_number,
            claim_status, submitted_to_authority,
            created_by_user_id, created_at
        )
        SELECT 
            gen_random_uuid(), v_tenant_id, v_branch_id, cs.patient_id, cs.id,
            'Arogyashree Health Insurance Scheme',
            'AROG' || LPAD((30000 + i)::TEXT, 8, '0'),
            p.first_name || ' ' || p.last_name,
            45000 + (i * 8000),
            'Karnataka Arogyashree coverage for ' || cs.recommended_surgery,
            CASE WHEN cs.status = 'Completed' THEN true ELSE false END,
            'AROG-CLAIM-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || LPAD(i::TEXT, 4, '0'),
            CASE WHEN cs.status = 'Completed' THEN 'Submitted' ELSE 'Draft' END,
            CASE WHEN cs.status = 'Completed' THEN true ELSE false END,
            v_user_id, cs.created_at
        FROM counseling_sessions cs
        INNER JOIN patient p ON cs.patient_id = p.id
        WHERE cs.id = v_arogyashree_sessions[i];
    END LOOP;
    
    -- SGHS Claims
    FOR i IN 1..LEAST(ARRAY_LENGTH(v_sghs_sessions, 1), 2) LOOP
        INSERT INTO government_scheme_claims (
            id, tenant_id, branch_id, patient_id, session_id,
            scheme_name, scheme_id_number, beneficiary_name,
            claim_amount, approved_amount, treatment_details,
            documents_submitted, claim_reference_number, claim_status,
            created_by_user_id, created_at
        )
        SELECT 
            gen_random_uuid(), v_tenant_id, v_branch_id, cs.patient_id, cs.id,
            'State Government Health Scheme',
            'SGHS' || LPAD((40000 + i)::TEXT, 8, '0'),
            p.first_name || ' ' || p.last_name,
            32000 + (i * 5000),
            28000 + (i * 4500),
            'State govt employee health coverage for ' || cs.recommended_surgery,
            true,
            'SGHS-REF-' || LPAD(i::TEXT, 6, '0'),
            'Approved',
            v_user_id, cs.created_at
        FROM counseling_sessions cs
        INNER JOIN patient p ON cs.patient_id = p.id
        WHERE cs.id = v_sghs_sessions[i];
    END LOOP;
    
    -- =====================================================================
    -- PART 3: PAYMENT TRANSACTIONS (~25 rows for Completed sessions)
    -- =====================================================================
    
    -- Payment transactions for completed cash sessions
    FOR i IN 1..LEAST(ARRAY_LENGTH(v_cash_sessions, 1), 9) LOOP
        INSERT INTO payment_transactions (
            id, tenant_id, branch_id, session_id, patient_id,
            transaction_number, transaction_date,
            total_bill_amount, discount_amount, net_payable_amount, amount_paid, balance_due,
            payment_method, payment_status,
            created_by_user_id, created_at
        )
        SELECT 
            gen_random_uuid(), v_tenant_id, v_branch_id, cs.id, cs.patient_id,
            'TXN-' || TO_CHAR(cs.session_date, 'YYYYMMDD') || '-' || LPAD(i::TEXT, 4, '0'),
            cs.session_date + INTERVAL '2 hours',
            (5000 + (i * 1000))::DECIMAL,
            0::DECIMAL,
            (5000 + (i * 1000))::DECIMAL,
            (5000 + (i * 1000))::DECIMAL,
            0::DECIMAL,
            (ARRAY['Cash', 'Card', 'UPI', 'BankTransfer'])[i % 4 + 1],
            'Completed',
            v_user_id, cs.created_at
        FROM counseling_sessions cs
        WHERE cs.id = v_cash_sessions[i] AND cs.status = 'Completed';
    END LOOP;
    
    -- Payment transactions for completed insurance sessions (co-payment)
    FOR i IN 1..5 LOOP
        IF v_insurance_sessions[i] = ANY(v_completed_sessions) THEN
            INSERT INTO payment_transactions (
                id, tenant_id, branch_id, session_id, patient_id,
                transaction_number, transaction_date,
                total_bill_amount, discount_amount, net_payable_amount, amount_paid, balance_due,
                payment_method, payment_status, insurance_pre_auth_id,
                created_by_user_id, created_at
            )
            SELECT 
                gen_random_uuid(), v_tenant_id, v_branch_id, cs.id, cs.patient_id,
                'TXN-INS-' || LPAD(i::TEXT, 5, '0'),
                cs.session_date + INTERVAL '1 hour',
                3000::DECIMAL,
                0::DECIMAL,
                3000::DECIMAL,
                3000::DECIMAL,
                0::DECIMAL,
                'Card',
                'Completed',
                (SELECT id FROM insurance_pre_authorizations WHERE session_id = cs.id LIMIT 1),
                v_user_id, cs.created_at
            FROM counseling_sessions cs
            WHERE cs.id = v_insurance_sessions[i];
        END IF;
    END LOOP;
    
    -- UPI payments for some completed sessions
    FOR i IN 1..6 LOOP
        INSERT INTO payment_transactions (
            id, tenant_id, branch_id, session_id, patient_id,
            transaction_number, transaction_date,
            total_bill_amount, discount_amount, net_payable_amount, amount_paid, balance_due,
            payment_method, payment_status,
            upi_transaction_id, upi_vpa,
            created_by_user_id, created_at
        )
        SELECT 
            gen_random_uuid(), v_tenant_id, v_branch_id, cs.id, cs.patient_id,
            'TXN-UPI-' || LPAD(i::TEXT, 5, '0'),
            cs.session_date + INTERVAL '30 minutes',
            (4000 + i * 500)::DECIMAL,
            0::DECIMAL,
            (4000 + i * 500)::DECIMAL,
            (2000 + i * 500)::DECIMAL,
            (2000)::DECIMAL,
            'UPI',
            'PartiallyPaid',
            'UPI' || LPAD((100000 + i)::TEXT, 10, '0'),
            'patient' || i || '@paytm',
            v_user_id, cs.created_at
        FROM counseling_sessions cs
        WHERE cs.id = v_completed_sessions[6 + i];
    END LOOP;
    
    -- =====================================================================
    -- PART 4: PAYMENT LINKS (~15 rows for Scheduled + InProgress sessions)
    -- =====================================================================
    
    FOR i IN 1..15 LOOP
        INSERT INTO payment_links (
            id, tenant_id, transaction_id, session_id, patient_id,
            payment_link_id, short_url, link_amount,
            sent_via, expires_at, link_status,
            created_by_user_id, created_at
        )
        SELECT 
            gen_random_uuid(), v_tenant_id,
            gen_random_uuid(), -- dummy transaction_id
            cs.id, cs.patient_id,
            'plink_' || MD5(cs.id::TEXT || i::TEXT),
            'https://rzp.io/' || SUBSTRING(MD5(cs.id::TEXT), 1, 8),
            (10000 + i * 2000)::DECIMAL,
            (ARRAY['SMS', 'Email', 'WhatsApp'])[i % 3 + 1],
            CURRENT_TIMESTAMP + INTERVAL '48 hours',
            CASE 
                WHEN cs.status = 'Scheduled' THEN 'Active'
                WHEN cs.status = 'InProgress' THEN 'Active'
                ELSE 'Expired'
            END,
            v_user_id, cs.created_at
        FROM counseling_sessions cs
        WHERE cs.id = v_all_sessions[15 + i];
    END LOOP;
    
    -- =====================================================================
    -- PART 5: PATIENT ADMISSIONS (~12 rows for Completed sessions that agreed to surgery)
    -- =====================================================================
    
    FOR i IN 1..12 LOOP
        INSERT INTO patient_admissions (
            id, tenant_id, branch_id, patient_id, session_id,
            admission_number, admission_type, admission_status,
            admission_date, surgery_type, surgery_date,
            admitting_doctor_id, admission_deposit_paid,
            created_by_user_id, created_at
        )
        SELECT 
            gen_random_uuid(), v_tenant_id, v_branch_id, cs.patient_id, cs.id,
            'ADM-' || TO_CHAR(cs.session_date, 'YYYYMMDD') || '-' || LPAD(i::TEXT, 3, '0'),
            (ARRAY['DayCare', 'IPD'])[i % 2 + 1],
            CASE 
                WHEN cs.session_date < CURRENT_DATE - INTERVAL '5 days' THEN 'Discharged'
                WHEN cs.session_date < CURRENT_DATE - INTERVAL '2 days' THEN 'Admitted'
                ELSE 'Scheduled'
            END,
            (cs.session_date + INTERVAL '3 days')::DATE,
            cs.recommended_surgery,
            (cs.session_date + INTERVAL '3 days')::DATE,
            cs.referred_by_doctor_id,
            (5000 + (i * 1000))::DECIMAL,
            v_user_id, cs.created_at
        FROM counseling_sessions cs
        WHERE cs.id = v_completed_sessions[i] 
        AND cs.patient_agreed_to_surgery = true;
    END LOOP;
    
    -- =====================================================================
    -- PART 6: PATIENT CONSENTS (~15 rows for Completed sessions)
    -- =====================================================================
    
    FOR i IN 1..LEAST(ARRAY_LENGTH(v_completed_sessions, 1), 15) LOOP
        INSERT INTO patient_consents (
            id, tenant_id, branch_id, template_id, patient_id, session_id,
            consent_number, rendered_html,
            patient_signature_base64, patient_signature_timestamp, patient_signed_by,
            witness_signature_base64, witness_signature_timestamp, witness_name, witness_relationship,
            consent_status,
            created_by_user_id, created_at
        )
        SELECT 
            gen_random_uuid(), v_tenant_id, v_branch_id, 
            (SELECT id FROM consent_form_templates WHERE consent_category = 'SurgeryConsent' LIMIT 1),
            cs.patient_id, cs.id,
            'CONSENT-' || TO_CHAR(cs.session_date, 'YYYYMMDD') || '-' || LPAD(i::TEXT, 4, '0'),
            '<div>Consent form for ' || p.first_name || ' ' || p.last_name || ' - ' || cs.recommended_surgery || '</div>',
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            cs.session_end_time,
            p.first_name || ' ' || p.last_name,
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            cs.session_end_time + INTERVAL '2 minutes',
            'Witness ' || i,
            (ARRAY['Spouse', 'Family Member', 'Friend', 'Hospital Staff'])[i % 4 + 1],
            'Completed',
            v_user_id, cs.created_at
        FROM counseling_sessions cs
        INNER JOIN patient p ON cs.patient_id = p.id
        WHERE cs.id = v_completed_sessions[i];
    END LOOP;
    
    -- =====================================================================
    -- PART 7: COUNSELING WORKFLOW STATES (30 rows - one per session)
    -- =====================================================================
    
    FOR i IN 1..ARRAY_LENGTH(v_all_sessions, 1) LOOP
        INSERT INTO counseling_workflow_state (
            id, tenant_id, branch_id, session_id, patient_id,
            current_stage, stages_completed, stages_pending,
            completion_percentage,
            created_by_user_id, created_at
        )
        SELECT 
            gen_random_uuid(), v_tenant_id, v_branch_id, cs.id, cs.patient_id,
            CASE 
                WHEN cs.status = 'Completed' AND cs.patient_agreed_to_surgery THEN 'AdmissionScheduled'
                WHEN cs.status = 'Completed' AND NOT cs.patient_agreed_to_surgery THEN 'SessionCompleted'
                WHEN cs.status = 'InProgress' AND cs.package_discussed THEN 'PackageBuilt'
                WHEN cs.status = 'InProgress' THEN 'AssessmentInProgress'
                WHEN cs.status = 'Scheduled' THEN 'SessionStarted'
                WHEN cs.status = 'Cancelled' THEN 'Cancelled'
                ELSE 'OnHold'
            END,
            CASE 
                WHEN cs.status = 'Completed' THEN ARRAY['SessionStarted', 'AssessmentInProgress', 'PackageBuilt', 'DocumentsCollected']
                WHEN cs.status = 'InProgress' THEN ARRAY['SessionStarted', 'AssessmentInProgress']
                ELSE ARRAY[]::TEXT[]
            END,
            CASE 
                WHEN cs.status = 'Scheduled' THEN ARRAY['AssessmentInProgress', 'PackageBuilt', 'ConsentsSigned']
                WHEN cs.status = 'InProgress' THEN ARRAY['PackageBuilt', 'DocumentsCollected', 'ConsentsSigned']
                WHEN cs.status = 'Completed' AND NOT cs.patient_agreed_to_surgery THEN ARRAY[]::TEXT[]
                ELSE ARRAY['TestsOrdered', 'PaymentCompleted']::TEXT[]
            END,
            CASE 
                WHEN cs.status = 'Completed' THEN 85
                WHEN cs.status = 'InProgress' THEN 50
                WHEN cs.status = 'Scheduled' THEN 10
                ELSE 0
            END,
            v_user_id, cs.created_at
        FROM counseling_sessions cs
        WHERE cs.id = v_all_sessions[i];
    END LOOP;
    
    RAISE NOTICE 'Workflow dependencies seeded successfully!';

END $$;

-- Verification Queries
SELECT 'Insurance Pre-Authorizations' as table_name, COUNT(*) as row_count FROM insurance_pre_authorizations;
SELECT 'Government Scheme Claims' as table_name, COUNT(*) as row_count FROM government_scheme_claims;
SELECT 'Payment Transactions' as table_name, COUNT(*) as row_count FROM payment_transactions;
SELECT 'Payment Links' as table_name, COUNT(*) as row_count FROM payment_links;
SELECT 'Patient Admissions' as table_name, COUNT(*) as row_count FROM patient_admissions;
SELECT 'Patient Consents' as table_name, COUNT(*) as row_count FROM patient_consents;
SELECT 'Counseling Workflow State' as table_name, COUNT(*) as row_count FROM counseling_workflow_state;

-- Summary by status
SELECT 'Pre-Auth Status' as metric, status, COUNT(*) FROM insurance_pre_authorizations GROUP BY status;
SELECT 'Payment Status' as metric, payment_status, COUNT(*) FROM payment_transactions GROUP BY payment_status;
SELECT 'Admission Status' as metric, admission_status, COUNT(*) FROM patient_admissions GROUP BY admission_status;
SELECT 'Workflow Stages' as metric, current_stage, COUNT(*) FROM counseling_workflow_state GROUP BY current_stage ORDER BY COUNT(*) DESC;
