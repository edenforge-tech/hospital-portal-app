-- ============================================
-- CREATE SAMPLE DOCUMENTS FOR TESTING (SIMPLIFIED)
-- ============================================

-- Disable audit triggers temporarily
ALTER TABLE patient DISABLE TRIGGER audit_patient_changes;

DO $$
DECLARE
    v_patient_id UUID;
    v_user_id UUID := 'dddddddd-dddd-dddd-dddd-dddddddddddd'; -- Use existing user ID
    v_tenant_id UUID := '11111111-1111-1111-1111-111111111111';
BEGIN
    -- Get or create a patient
    SELECT id INTO v_patient_id FROM patient WHERE tenant_id = v_tenant_id LIMIT 1;
    IF v_patient_id IS NULL THEN
        INSERT INTO patient (id, tenant_id, medical_record_number, first_name, last_name, date_of_birth, gender, contact_number, email, address, created_at, updated_at)
        VALUES (gen_random_uuid(), v_tenant_id, 'MRN001', 'John', 'Doe', '1985-06-15', 'Male', '+1234567890', 'john.doe@email.com', '123 Main St', NOW(), NOW())
        RETURNING id INTO v_patient_id;
    END IF;

    -- ============================================
    -- SAMPLE DOCUMENTS WITH DIFFERENT SHARING LEVELS
    -- ============================================

    -- Medical History - Restricted sharing
    INSERT INTO patient_document_uploads (
        id, tenant_id, patient_id, document_type, document_title, file_url,
        file_size, mime_type, uploaded_by, uploaded_at,
        shared_to_departments, shared_to_roles, is_public, data_classification,
        status, created_at, created_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_patient_id, 'Medical History',
        'Complete Medical History - John Doe', '/uploads/medical_history_john_doe.pdf',
        245760, 'application/pdf', v_user_id, NOW(),
        ARRAY['Cardiology', 'Internal Medicine'], ARRAY['Senior Doctor', 'Consultant'], false, 'PHI',
        'active', NOW(), v_user_id
    );

    -- Lab Results - Departmental sharing
    INSERT INTO patient_document_uploads (
        id, tenant_id, patient_id, document_type, document_title, file_url,
        file_size, mime_type, uploaded_by, uploaded_at,
        shared_to_departments, shared_to_roles, is_public, data_classification,
        status, created_at, created_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_patient_id, 'Lab Results',
        'Blood Chemistry Panel - June 2024', '/uploads/lab_results_june2024.pdf',
        153600, 'application/pdf', v_user_id, NOW(),
        ARRAY['Laboratory', 'Cardiology'], ARRAY['Doctor', 'Nurse', 'Lab Technician'], false, 'PHI',
        'active', NOW(), v_user_id
    );

    -- Billing Statement - Administrative sharing
    INSERT INTO patient_document_uploads (
        id, tenant_id, patient_id, document_type, document_title, file_url,
        file_size, mime_type, uploaded_by, uploaded_at,
        shared_to_departments, shared_to_roles, is_public, data_classification,
        status, created_at, created_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_patient_id, 'Billing Statements',
        'Hospital Bill - June 2024', '/uploads/bill_june2024.pdf',
        102400, 'application/pdf', v_user_id, NOW(),
        ARRAY['Billing'], ARRAY['Billing Clerk', 'Admin'], false, 'Financial',
        'active', NOW(), v_user_id
    );

    -- Patient Photo - Public document
    INSERT INTO patient_document_uploads (
        id, tenant_id, patient_id, document_type, document_title, file_url,
        file_size, mime_type, uploaded_by, uploaded_at,
        shared_to_departments, shared_to_roles, is_public, data_classification,
        status, created_at, created_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_patient_id, 'Patient Photos',
        'Patient ID Photo', '/uploads/patient_id_photo.jpg',
        512000, 'image/jpeg', v_patient_id, NOW(),
        NULL, NULL, true, 'Public',
        'active', NOW(), v_patient_id
    );

    -- Treatment Consent - Legal sharing (restricted)
    INSERT INTO patient_document_uploads (
        id, tenant_id, patient_id, document_type, document_title, file_url,
        file_size, mime_type, uploaded_by, uploaded_at,
        shared_to_departments, shared_to_roles, is_public, data_classification,
        status, created_at, created_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_patient_id, 'Treatment Consent',
        'Cardiac Catheterization Consent', '/uploads/cardiac_consent.pdf',
        153600, 'application/pdf', v_user_id, NOW(),
        ARRAY['Cardiology', 'Legal'], ARRAY['Consultant', 'Medical Records Officer'], false, 'Legal',
        'active', NOW(), v_user_id
    );

    RAISE NOTICE 'Sample documents created successfully';
END $$;

-- Re-enable audit triggers
ALTER TABLE patient ENABLE TRIGGER audit_patient_changes;