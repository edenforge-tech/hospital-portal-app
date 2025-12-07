-- ============================================
-- CREATE SAMPLE DOCUMENTS FOR TESTING
-- Documents with different sharing levels and access patterns
-- ============================================

DO $$
DECLARE
    v_patient_id UUID;
    v_doctor_id UUID;
    v_nurse_id UUID;
    v_admin_id UUID;
    v_billing_clerk_id UUID;
    v_tenant_id UUID := '11111111-1111-1111-1111-111111111111';
BEGIN
    -- Get or create test users
    SELECT id INTO v_doctor_id FROM users WHERE email LIKE '%doctor%' LIMIT 1;
    SELECT id INTO v_nurse_id FROM users WHERE email LIKE '%nurse%' LIMIT 1;
    SELECT id INTO v_admin_id FROM users WHERE email LIKE '%admin%' LIMIT 1;

    -- Create test billing clerk if needed
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'billing@test.com') THEN
        INSERT INTO users (id, tenant_id, email, first_name, last_name, created_at, updated_at)
        VALUES (gen_random_uuid(), v_tenant_id, 'billing@test.com', 'John', 'Billing', NOW(), NOW())
        RETURNING id INTO v_billing_clerk_id;
    ELSE
        SELECT id INTO v_billing_clerk_id FROM users WHERE email = 'billing@test.com';
    END IF;

    -- Get or create a patient
    SELECT id INTO v_patient_id FROM patient WHERE tenant_id = v_tenant_id LIMIT 1;
    IF v_patient_id IS NULL THEN
        INSERT INTO patient (id, tenant_id, first_name, last_name, date_of_birth, gender, phone, email, address, created_at, updated_at)
        VALUES (gen_random_uuid(), v_tenant_id, 'John', 'Doe', '1985-06-15', 'Male', '+1234567890', 'john.doe@email.com', '123 Main St', NOW(), NOW())
        RETURNING id INTO v_patient_id;
    END IF;

    -- ============================================
    -- RESTRICTED MEDICAL DOCUMENTS
    -- ============================================

    -- Medical History - Restricted to Cardiology and Internal Medicine departments
    INSERT INTO patient_document_uploads (
        id, tenant_id, patient_id, document_type, document_title, file_url,
        file_size, mime_type, uploaded_by, uploaded_at,
        shared_to_departments, shared_to_roles, is_public, data_classification
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_patient_id, 'Medical History',
        'Complete Medical History - John Doe', '/uploads/medical_history_john_doe.pdf',
        245760, 'application/pdf', COALESCE(v_doctor_id, v_admin_id), NOW(),
        ARRAY['Cardiology', 'Internal Medicine'], ARRAY['Senior Doctor', 'Consultant'], false, 'PHI'
    );

    -- Lab Results - Shared with Laboratory and Cardiology
    INSERT INTO patient_document_uploads (
        id, tenant_id, patient_id, document_type, document_title, file_url,
        file_size, mime_type, uploaded_by, uploaded_at,
        shared_to_departments, shared_to_roles, is_public, data_classification
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_patient_id, 'Lab Results',
        'Blood Chemistry Panel - June 2024', '/uploads/lab_results_june2024.pdf',
        153600, 'application/pdf', COALESCE(v_doctor_id, v_admin_id), NOW(),
        ARRAY['Laboratory', 'Cardiology'], ARRAY['Doctor', 'Nurse', 'Lab Technician'], false, 'PHI'
    );

    -- Imaging Reports - Restricted to Radiology department
    INSERT INTO patient_document_uploads (
        id, tenant_id, patient_id, document_type, document_title, file_url,
        file_size, mime_type, uploaded_by, uploaded_at,
        shared_to_departments, shared_to_roles, is_public, data_classification
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_patient_id, 'Imaging Reports',
        'Chest X-Ray Report - May 2024', '/uploads/chest_xray_may2024.pdf',
        512000, 'application/pdf', COALESCE(v_doctor_id, v_admin_id), NOW(),
        ARRAY['Radiology'], ARRAY['Radiologist', 'Senior Doctor', 'Consultant'], false, 'PHI'
    );

    -- ============================================
    -- ADMINISTRATIVE DOCUMENTS (DEPARTMENTAL)
    -- ============================================

    -- Billing Statement - Shared with Billing department
    INSERT INTO patient_document_uploads (
        id, tenant_id, patient_id, document_type, document_title, file_url,
        file_size, mime_type, uploaded_by, uploaded_at,
        shared_to_departments, shared_to_roles, is_public, data_classification
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_patient_id, 'Billing Statements',
        'Hospital Bill - June 2024', '/uploads/bill_june2024.pdf',
        102400, 'application/pdf', COALESCE(v_admin_id, v_doctor_id), NOW(),
        ARRAY['Billing'], ARRAY['Billing Clerk', 'Admin'], false, 'Financial'
    );

    -- Insurance Documents - Shared with Billing and Administration
    INSERT INTO patient_document_uploads (
        id, tenant_id, patient_id, document_type, document_title, file_url,
        file_size, mime_type, uploaded_by, uploaded_at,
        shared_to_departments, shared_to_roles, is_public, data_classification
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_patient_id, 'Insurance Documents',
        'Insurance Claim Submission', '/uploads/insurance_claim.pdf',
        204800, 'application/pdf', COALESCE(v_admin_id, v_doctor_id), NOW(),
        ARRAY['Billing', 'Administration'], ARRAY['Billing Clerk', 'Admin'], false, 'Financial'
    );

    -- Appointment Records - Shared with multiple departments
    INSERT INTO patient_document_uploads (
        id, tenant_id, patient_id, document_type, document_title, file_url,
        file_size, mime_type, uploaded_by, uploaded_at,
        shared_to_departments, shared_to_roles, is_public, data_classification
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_patient_id, 'Appointment Records',
        'Appointment History - 2024', '/uploads/appointments_2024.pdf',
        76800, 'application/pdf', COALESCE(v_admin_id, v_doctor_id), NOW(),
        ARRAY['Administration', 'Cardiology', 'Internal Medicine'], ARRAY['Receptionist', 'Nurse', 'Doctor'], false, 'Administrative'
    );

    -- ============================================
    -- PATIENT-GENERATED DOCUMENTS (SHARED)
    -- ============================================

    -- Patient Photo - Public document
    INSERT INTO patient_document_uploads (
        id, tenant_id, patient_id, document_type, document_title, file_url,
        file_size, mime_type, uploaded_by, uploaded_at,
        shared_to_departments, shared_to_roles, is_public, data_classification
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_patient_id, 'Patient Photos',
        'Patient ID Photo', '/uploads/patient_id_photo.jpg',
        512000, 'image/jpeg', v_patient_id, NOW(),
        NULL, NULL, true, 'Public'
    );

    -- Patient Notes - Shared broadly
    INSERT INTO patient_document_uploads (
        id, tenant_id, patient_id, document_type, document_title, file_url,
        file_size, mime_type, uploaded_by, uploaded_at,
        shared_to_departments, shared_to_roles, is_public, data_classification
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_patient_id, 'Patient Notes',
        'Daily Health Journal', '/uploads/health_journal.pdf',
        128000, 'application/pdf', v_patient_id, NOW(),
        ARRAY['Cardiology', 'Internal Medicine', 'Nursing'], ARRAY['Doctor', 'Nurse', 'Nurse Manager'], false, 'PHI'
    );

    -- External Records - From another provider
    INSERT INTO patient_document_uploads (
        id, tenant_id, patient_id, document_type, document_title, file_url,
        file_size, mime_type, uploaded_by, uploaded_at,
        shared_to_departments, shared_to_roles, is_public, data_classification
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_patient_id, 'External Records',
        'Records from City General Hospital', '/uploads/external_records.pdf',
        307200, 'application/pdf', v_patient_id, NOW(),
        ARRAY['Medical Records'], ARRAY['Medical Records Officer', 'Senior Doctor'], false, 'PHI'
    );

    -- ============================================
    -- LEGAL DOCUMENTS (RESTRICTED)
    -- ============================================

    -- Treatment Consent - Highly restricted
    INSERT INTO patient_document_uploads (
        id, tenant_id, patient_id, document_type, document_title, file_url,
        file_size, mime_type, uploaded_by, uploaded_at,
        shared_to_departments, shared_to_roles, is_public, data_classification
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_patient_id, 'Treatment Consent',
        'Cardiac Catheterization Consent', '/uploads/cardiac_consent.pdf',
        153600, 'application/pdf', COALESCE(v_doctor_id, v_admin_id), NOW(),
        ARRAY['Cardiology', 'Legal'], ARRAY['Consultant', 'Medical Records Officer'], false, 'Legal'
    );

    -- Privacy Consent - Restricted to compliance roles
    INSERT INTO patient_document_uploads (
        id, tenant_id, patient_id, document_type, document_title, file_url,
        file_size, mime_type, uploaded_by, uploaded_at,
        shared_to_departments, shared_to_roles, is_public, data_classification
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_patient_id, 'Privacy Consent',
        'HIPAA Privacy Notice Acknowledgment', '/uploads/privacy_ack.pdf',
        102400, 'application/pdf', COALESCE(v_admin_id, v_doctor_id), NOW(),
        ARRAY['Legal', 'Compliance'], ARRAY['Admin', 'Medical Records Officer'], false, 'Legal'
    );

    RAISE NOTICE 'Sample documents created successfully for testing document sharing';
END $$;