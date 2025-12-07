-- ============================================
-- TEST DOCUMENT SHARING FUNCTIONALITY
-- Create sample documents and test access controls
-- ============================================

-- ============================================
-- SAMPLE PATIENT DOCUMENTS WITH SHARING
-- ============================================

-- Get some sample IDs for testing
DO $$
DECLARE
    v_patient_id UUID;
    v_doctor_id UUID;
    v_nurse_id UUID;
    v_admin_id UUID;
    v_tenant_id UUID := '11111111-1111-1111-1111-111111111111';
BEGIN
    -- Get sample user IDs
    SELECT id INTO v_doctor_id FROM asp_net_users WHERE email LIKE '%doctor%' LIMIT 1;
    SELECT id INTO v_nurse_id FROM asp_net_users WHERE email LIKE '%nurse%' LIMIT 1;
    SELECT id INTO v_admin_id FROM asp_net_users WHERE email LIKE '%admin%' LIMIT 1;

    -- Get a patient ID
    SELECT id INTO v_patient_id FROM patient WHERE tenant_id = v_tenant_id LIMIT 1;

    -- If no patient exists, create one
    IF v_patient_id IS NULL THEN
        INSERT INTO patient (id, tenant_id, first_name, last_name, date_of_birth, gender, phone, email, address, emergency_contact_name, emergency_contact_phone, medical_record_number, created_at, updated_at)
        VALUES (gen_random_uuid(), v_tenant_id, 'John', 'Doe', '1985-06-15', 'Male', '+1234567890', 'john.doe@email.com', '123 Main St', 'Jane Doe', '+1234567891', 'MRN001', NOW(), NOW())
        RETURNING id INTO v_patient_id;
    END IF;

    -- Create sample documents with different sharing levels
    INSERT INTO patient_document_uploads (
        id, tenant_id, patient_id, document_type, title, file_name, file_path,
        file_size_bytes, mime_type, uploaded_by, is_public,
        shared_to_departments, shared_to_roles, created_at, updated_at
    ) VALUES
    -- Medical History - Restricted sharing (only treating physicians)
    (gen_random_uuid(), v_tenant_id, v_patient_id, 'Medical History', 'Complete Medical History', 'medical_history.pdf',
     '/uploads/medical_history.pdf', 245760, 'application/pdf', COALESCE(v_doctor_id, v_admin_id), false,
     ARRAY['Cardiology', 'Internal Medicine'], ARRAY['Senior Doctor', 'Consultant'], NOW(), NOW()),

    -- Lab Results - Departmental sharing
    (gen_random_uuid(), v_tenant_id, v_patient_id, 'Lab Results', 'Blood Test Results', 'lab_results.pdf',
     '/uploads/lab_results.pdf', 153600, 'application/pdf', COALESCE(v_doctor_id, v_admin_id), false,
     ARRAY['Laboratory', 'Cardiology'], ARRAY['Doctor', 'Nurse', 'Lab Technician'], NOW(), NOW()),

    -- Billing Statement - Administrative sharing
    (gen_random_uuid(), v_tenant_id, v_patient_id, 'Billing Statements', 'Hospital Bill - January 2024', 'bill_jan2024.pdf',
     '/uploads/bill_jan2024.pdf', 102400, 'application/pdf', COALESCE(v_admin_id, v_doctor_id), false,
     ARRAY['Billing', 'Administration'], ARRAY['Billing Clerk', 'Admin'], NOW(), NOW()),

    -- Patient Photo - Broad sharing
    (gen_random_uuid(), v_tenant_id, v_patient_id, 'Patient Photos', 'Patient ID Photo', 'patient_photo.jpg',
     '/uploads/patient_photo.jpg', 512000, 'image/jpeg', v_patient_id, true,
     ARRAY['All Departments'], ARRAY['All Roles'], NOW(), NOW()),

    -- Treatment Consent - Legal sharing (restricted)
    (gen_random_uuid(), v_tenant_id, v_patient_id, 'Treatment Consent', 'Cardiac Surgery Consent', 'surgery_consent.pdf',
     '/uploads/surgery_consent.pdf', 204800, 'application/pdf', COALESCE(v_doctor_id, v_admin_id), false,
     ARRAY['Cardiology', 'Legal'], ARRAY['Consultant', 'Medical Records Officer'], NOW(), NOW());

    RAISE NOTICE 'Sample documents created successfully';
END $$;

-- ============================================
-- TEST ACCESS CONTROL FUNCTION
-- ============================================

-- Create a test function to verify document access
CREATE OR REPLACE FUNCTION test_document_access()
RETURNS TABLE (
    test_case TEXT,
    user_role TEXT,
    document_type TEXT,
    action TEXT,
    access_granted BOOLEAN,
    permission_used TEXT,
    denial_reason TEXT
) AS $$
DECLARE
    v_patient_id UUID;
    v_doctor_id UUID;
    v_nurse_id UUID;
    v_admin_id UUID;
    v_billing_clerk_id UUID;
    v_document_id UUID;
BEGIN
    -- Get test user IDs
    SELECT id INTO v_doctor_id FROM asp_net_users WHERE email LIKE '%doctor%' LIMIT 1;
    SELECT id INTO v_nurse_id FROM asp_net_users WHERE email LIKE '%nurse%' LIMIT 1;
    SELECT id INTO v_admin_id FROM asp_net_users WHERE email LIKE '%admin%' LIMIT 1;

    -- Create a test billing clerk if needed
    IF NOT EXISTS (SELECT 1 FROM asp_net_users WHERE email = 'billing@test.com') THEN
        INSERT INTO asp_net_users (id, user_name, normalized_user_name, email, normalized_email, email_confirmed, password_hash, security_stamp, concurrency_stamp, phone_number, phone_number_confirmed, two_factor_enabled, lockout_enabled, access_failed_count)
        VALUES (gen_random_uuid(), 'billing@test.com', 'BILLING@TEST.COM', 'billing@test.com', 'BILLING@TEST.COM', true, 'hashed_password', gen_random_uuid()::text, gen_random_uuid()::text, NULL, false, false, true, 0);
        SELECT id INTO v_billing_clerk_id FROM asp_net_users WHERE email = 'billing@test.com';
    ELSE
        SELECT id INTO v_billing_clerk_id FROM asp_net_users WHERE email = 'billing@test.com';
    END IF;

    -- Get a document ID for testing
    SELECT id INTO v_document_id FROM patient_document_uploads WHERE document_type = 'Billing Statements' LIMIT 1;

    -- Test Case 1: Admin accessing billing document (should succeed)
    RETURN QUERY
    SELECT 'Admin accessing billing document'::TEXT, 'Admin'::TEXT, 'Billing Statements'::TEXT, 'read'::TEXT,
           access_granted, permission_used, denial_reason
    FROM check_document_access(v_admin_id, v_document_id, 'read');

    -- Test Case 2: Doctor accessing billing document (should fail - not in allowed roles)
    RETURN QUERY
    SELECT 'Doctor accessing billing document'::TEXT, 'Doctor'::TEXT, 'Billing Statements'::TEXT, 'read'::TEXT,
           access_granted, permission_used, denial_reason
    FROM check_document_access(v_doctor_id, v_document_id, 'read');

    -- Test Case 3: Billing clerk accessing billing document (should succeed)
    RETURN QUERY
    SELECT 'Billing clerk accessing billing document'::TEXT, 'Billing Clerk'::TEXT, 'Billing Statements'::TEXT, 'read'::TEXT,
           access_granted, permission_used, denial_reason
    FROM check_document_access(v_billing_clerk_id, v_document_id, 'read');

    -- Get medical history document
    SELECT id INTO v_document_id FROM patient_document_uploads WHERE document_type = 'Medical History' LIMIT 1;

    -- Test Case 4: Nurse accessing medical history (should succeed - in allowed roles)
    RETURN QUERY
    SELECT 'Nurse accessing medical history'::TEXT, 'Nurse'::TEXT, 'Medical History'::TEXT, 'read'::TEXT,
           access_granted, permission_used, denial_reason
    FROM check_document_access(v_nurse_id, v_document_id, 'read');

    -- Test Case 5: Billing clerk accessing medical history (should fail - not in allowed roles)
    RETURN QUERY
    SELECT 'Billing clerk accessing medical history'::TEXT, 'Billing Clerk'::TEXT, 'Medical History'::TEXT, 'read'::TEXT,
           access_granted, permission_used, denial_reason
    FROM check_document_access(v_billing_clerk_id, v_document_id, 'read');

END $$ LANGUAGE plpgsql;

-- ============================================
-- RUN ACCESS TESTS
-- ============================================

-- Execute the test function
SELECT * FROM test_document_access();

-- ============================================
-- SHOW DOCUMENT SHARING SUMMARY
-- ============================================

-- Show all documents with their sharing settings
SELECT
    pdu.title,
    pdu.document_type,
    dt.category,
    pdu.is_public,
    CASE WHEN pdu.shared_to_departments IS NOT NULL THEN array_length(pdu.shared_to_departments, 1) ELSE 0 END as dept_shares,
    CASE WHEN pdu.shared_to_roles IS NOT NULL THEN array_length(pdu.shared_to_roles, 1) ELSE 0 END as role_shares,
    dsp.sharing_level,
    array_length(dsp.allowed_roles, 1) as allowed_roles_count
FROM patient_document_uploads pdu
LEFT JOIN document_type dt ON pdu.document_type = dt.name
LEFT JOIN document_sharing_policies dsp ON dt.name = dsp.document_type
ORDER BY dt.category, pdu.document_type;

-- Show sharing policy summary
SELECT
    category,
    sharing_level,
    COUNT(*) as document_types,
    SUM(array_length(allowed_roles, 1)) as total_allowed_roles
FROM document_sharing_policies
GROUP BY category, sharing_level
ORDER BY category;