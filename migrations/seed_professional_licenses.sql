-- Seed Professional Licenses for Testing
-- This script adds sample professional licenses for existing users

DO $$
DECLARE
    v_tenant_id UUID;
    v_admin_user_id UUID;
BEGIN
    -- Get tenant ID
    SELECT id INTO v_tenant_id FROM tenant LIMIT 1;
    
    -- Get admin user ID
    SELECT id INTO v_admin_user_id FROM users WHERE email = 'admin@test.com' LIMIT 1;
    
    -- Only proceed if we have tenant and user
    IF v_tenant_id IS NULL OR v_admin_user_id IS NULL THEN
        RAISE EXCEPTION 'Cannot find tenant or admin user';
    END IF;
    
    -- Insert sample licenses
    -- License 1: Medical License (Active, Verified)
    INSERT INTO professional_license (
        id, tenant_id, person_id,
        license_type, license_number, issuing_authority,
        issue_date, expiry_date,
        renewal_notification_days, status,
        document_url, verification_status,
        verified_at, verified_by_user_id,
        created_at, updated_at,
        created_by_user_id, updated_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_admin_user_id,
        'Medical Council Registration', 'MED-2024-001', 'State Medical Council',
        '2024-01-15', '2026-12-31',
        90, 'active',
        '/documents/licenses/medical_license.pdf', 'verified',
        NOW(), v_admin_user_id,
        NOW(), NOW(),
        v_admin_user_id, v_admin_user_id
    );
    
    -- License 2: Specialty Board Certification (Expiring in 60 days)
    INSERT INTO professional_license (
        id, tenant_id, person_id,
        license_type, license_number, issuing_authority,
        issue_date, expiry_date,
        renewal_notification_days, status,
        document_url, verification_status,
        verified_at, verified_by_user_id,
        created_at, updated_at,
        created_by_user_id, updated_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_admin_user_id,
        'Cardiology Board Certification', 'CARD-2023-045', 'National Board of Cardiology',
        '2023-03-20', CURRENT_DATE + INTERVAL '60 days',
        90, 'active',
        '/documents/licenses/cardiology_cert.pdf', 'verified',
        NOW(), v_admin_user_id,
        NOW(), NOW(),
        v_admin_user_id, v_admin_user_id
    );
    
    -- License 3: DEA Registration (Expiring in 30 days)
    INSERT INTO professional_license (
        id, tenant_id, person_id,
        license_type, license_number, issuing_authority,
        issue_date, expiry_date,
        renewal_notification_days, status,
        document_url, verification_status,
        created_at, updated_at,
        created_by_user_id, updated_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_admin_user_id,
        'DEA Registration', 'DEA-AB1234567', 'Drug Enforcement Administration',
        '2023-02-01', CURRENT_DATE + INTERVAL '30 days',
        90, 'active',
        '/documents/licenses/dea_registration.pdf', 'pending',
        NOW(), NOW(),
        v_admin_user_id, v_admin_user_id
    );
    
    -- License 4: State Medical License (Pending Verification)
    INSERT INTO professional_license (
        id, tenant_id, person_id,
        license_type, license_number, issuing_authority,
        issue_date, expiry_date,
        renewal_notification_days, status,
        document_url, verification_status,
        created_at, updated_at,
        created_by_user_id, updated_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_admin_user_id,
        'State Medical License', 'CA-MED-987654', 'California Medical Board',
        '2024-01-01', '2027-01-01',
        90, 'active',
        '/documents/licenses/ca_medical_license.pdf', 'pending',
        NOW(), NOW(),
        v_admin_user_id, v_admin_user_id
    );
    
    -- License 5: Expired Pharmacy License
    INSERT INTO professional_license (
        id, tenant_id, person_id,
        license_type, license_number, issuing_authority,
        issue_date, expiry_date,
        renewal_notification_days, status,
        document_url, verification_status,
        verified_at, verified_by_user_id,
        created_at, updated_at,
        created_by_user_id, updated_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_admin_user_id,
        'Pharmacy License', 'PHAR-2022-555', 'State Pharmacy Board',
        '2022-06-01', CURRENT_DATE - INTERVAL '30 days',
        90, 'active',
        '/documents/licenses/pharmacy_license.pdf', 'verified',
        NOW() - INTERVAL '2 years', v_admin_user_id,
        NOW(), NOW(),
        v_admin_user_id, v_admin_user_id
    );
    
    -- License 6: Nursing License (Expiring in 90 days)
    INSERT INTO professional_license (
        id, tenant_id, person_id,
        license_type, license_number, issuing_authority,
        issue_date, expiry_date,
        renewal_notification_days, status,
        document_url, verification_status,
        verified_at, verified_by_user_id,
        created_at, updated_at,
        created_by_user_id, updated_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_admin_user_id,
        'Registered Nurse License', 'RN-2024-789', 'State Board of Nursing',
        '2024-01-10', CURRENT_DATE + INTERVAL '90 days',
        90, 'active',
        '/documents/licenses/rn_license.pdf', 'verified',
        NOW(), v_admin_user_id,
        NOW(), NOW(),
        v_admin_user_id, v_admin_user_id
    );
    
    RAISE NOTICE 'Successfully inserted % professional licenses', 
        (SELECT COUNT(*) FROM professional_license WHERE deleted_at IS NULL);
END $$;
