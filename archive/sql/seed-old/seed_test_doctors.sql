-- =====================================================
-- QUICK DOCTOR SEED FOR COUNSELOR MODULE TESTING
-- =====================================================
-- Adds 5 doctors to tenant: 155fe198-6ae5-4a01-9254-ead5b427247e
-- Password for all: Test@123456
-- =====================================================

DO $$
DECLARE
    v_tenant_id UUID := '155fe198-6ae5-4a01-9254-ead5b427247e';
    v_branch_id UUID;
    v_dept_id UUID;
    v_doctor_role_id UUID;
    v_user_id UUID;
    v_password_hash TEXT := 'AQAAAAIAAYagAAAAEKp8qH0Q7FQ3xZVqK5P4vN7xH6lYqJ8zN2mC1wR3tE4pD5oA8sV7kL9fY6uX3hG2wA==';
BEGIN
    -- Get first branch and department for this tenant
    SELECT id INTO v_branch_id FROM branch WHERE tenant_id = v_tenant_id AND deleted_at IS NULL LIMIT 1;
    SELECT id INTO v_dept_id FROM department WHERE tenant_id = v_tenant_id AND deleted_at IS NULL LIMIT 1;
    
    -- Get a doctor-related role (Ophthalmologist, Doctor, etc.)
    SELECT id INTO v_doctor_role_id FROM app_roles 
    WHERE tenant_id = v_tenant_id 
      AND ("NormalizedName" LIKE '%DOCTOR%' OR "NormalizedName" LIKE '%OPHTHAL%' OR "NormalizedName" LIKE '%SURGEON%')
      AND "DeletedAt" IS NULL 
    LIMIT 1;
    
    IF v_doctor_role_id IS NULL THEN
        RAISE EXCEPTION 'No doctor role found for tenant. Please ensure roles are created.';
    END IF;
    
    IF v_branch_id IS NULL THEN
        RAISE EXCEPTION 'No branch found for tenant';
    END IF;
    
    RAISE NOTICE 'Using tenant: %, branch: %, dept: %, role: %', v_tenant_id, v_branch_id, v_dept_id, v_doctor_role_id;
    
    -- Doctor 1: Dr. James Anderson
    v_user_id := gen_random_uuid();
    INSERT INTO users (
        id, tenant_id, user_name, normalized_user_name, email, normalized_email,
        email_confirmed, password_hash, security_stamp, concurrency_stamp,
        phone_number, phone_number_confirmed, two_factor_enabled, lockout_enabled,
        access_failed_count, "FirstName", "LastName", "UserType", "UserStatus",
        "Specialization", license_number, "CreatedAt", "UpdatedAt", "MustChangePasswordOnLogin"
    ) VALUES (
        v_user_id, v_tenant_id, 'james.anderson', 'JAMES.ANDERSON', 
        'james.anderson@hospital.com', 'JAMES.ANDERSON@HOSPITAL.COM',
        true, v_password_hash, gen_random_uuid()::text, gen_random_uuid()::text,
        '+1-555-1001', true, false, false, 0,
        'James', 'Anderson', 'Staff', 'active',
        'Ophthalmology', 'OPH-12345', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false
    ) ON CONFLICT (normalized_user_name) DO NOTHING;
    
    -- Assign doctor role
    INSERT INTO app_user_roles (user_id, role_id, branch_id, "AssignedAt", "IsActive")
    VALUES (v_user_id, v_doctor_role_id, v_branch_id, CURRENT_TIMESTAMP, true)
    ON CONFLICT DO NOTHING;
    
    -- Assign to department if exists
    IF v_dept_id IS NOT NULL THEN
        INSERT INTO department_access (id, tenant_id, user_id, department_id, access_type, created_at, updated_at, created_by, updated_by, status)
        VALUES (gen_random_uuid(), v_tenant_id, v_user_id, v_dept_id, 'Primary', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, v_user_id, v_user_id, 'active');
    END IF;
    
    -- Doctor 2: Dr. Sarah Johnson  
    v_user_id := gen_random_uuid();
    INSERT INTO users (
        id, tenant_id, user_name, normalized_user_name, email, normalized_email,
        email_confirmed, password_hash, security_stamp, concurrency_stamp,
        phone_number, phone_number_confirmed, two_factor_enabled, lockout_enabled,
        access_failed_count, "FirstName", "LastName", "UserType", "UserStatus",
        "Specialization", license_number, "CreatedAt", "UpdatedAt", "MustChangePasswordOnLogin"
    ) VALUES (
        v_user_id, v_tenant_id, 'sarah.johnson', 'SARAH.JOHNSON',
        'sarah.johnson@hospital.com', 'SARAH.JOHNSON@HOSPITAL.COM',
        true, v_password_hash, gen_random_uuid()::text, gen_random_uuid()::text,
        '+1-555-1002', true, false, false, 0,
        'Sarah', 'Johnson', 'Staff', 'active',
        'Retina Specialist', 'RET-67890', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false
    ) ON CONFLICT (normalized_user_name) DO NOTHING;
    
    INSERT INTO app_user_roles (user_id, role_id, branch_id, "AssignedAt", "IsActive")
    VALUES (v_user_id, v_doctor_role_id, v_branch_id, CURRENT_TIMESTAMP, true)
    ON CONFLICT DO NOTHING;
    
    IF v_dept_id IS NOT NULL THEN
        INSERT INTO department_access (id, tenant_id, user_id, department_id, access_type, created_at, updated_at, created_by, updated_by, status)
        VALUES (gen_random_uuid(), v_tenant_id, v_user_id, v_dept_id, 'Primary', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, v_user_id, v_user_id, 'active');
    END IF;
    
    -- Doctor 3: Dr. Rajesh Kumar
    v_user_id := gen_random_uuid();
    INSERT INTO users (
        id, tenant_id, user_name, normalized_user_name, email, normalized_email,
        email_confirmed, password_hash, security_stamp, concurrency_stamp,
        phone_number, phone_number_confirmed, two_factor_enabled, lockout_enabled,
        access_failed_count, "FirstName", "LastName", "UserType", "UserStatus",
        "Specialization", license_number, "CreatedAt", "UpdatedAt", "MustChangePasswordOnLogin"
    ) VALUES (
        v_user_id, v_tenant_id, 'rajesh.kumar', 'RAJESH.KUMAR',
        'rajesh.kumar@hospital.com', 'RAJESH.KUMAR@HOSPITAL.COM',
        true, v_password_hash, gen_random_uuid()::text, gen_random_uuid()::text,
        '+1-555-1003', true, false, false, 0,
        'Rajesh', 'Kumar', 'Staff', 'active',
        'Cataract Surgeon', 'CAT-11223', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false
    ) ON CONFLICT (normalized_user_name) DO NOTHING;
    
    INSERT INTO app_user_roles (user_id, role_id, branch_id, "AssignedAt", "IsActive")
    VALUES (v_user_id, v_doctor_role_id, v_branch_id, CURRENT_TIMESTAMP, true)
    ON CONFLICT DO NOTHING;
    
    IF v_dept_id IS NOT NULL THEN
        INSERT INTO department_access (id, tenant_id, user_id, department_id, access_type, created_at, updated_at, created_by, updated_by, status)
        VALUES (gen_random_uuid(), v_tenant_id, v_user_id, v_dept_id, 'Primary', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, v_user_id, v_user_id, 'active');
    END IF;
    
    -- Doctor 4: Dr. Maria Garcia
    v_user_id := gen_random_uuid();
    INSERT INTO users (
        id, tenant_id, user_name, normalized_user_name, email, normalized_email,
        email_confirmed, password_hash, security_stamp, concurrency_stamp,
        phone_number, phone_number_confirmed, two_factor_enabled, lockout_enabled,
        access_failed_count, "FirstName", "LastName", "UserType", "UserStatus",
        "Specialization", license_number, "CreatedAt", "UpdatedAt", "MustChangePasswordOnLogin"
    ) VALUES (
        v_user_id, v_tenant_id, 'maria.garcia', 'MARIA.GARCIA',
        'maria.garcia@hospital.com', 'MARIA.GARCIA@HOSPITAL.COM',
        true, v_password_hash, gen_random_uuid()::text, gen_random_uuid()::text,
        '+1-555-1004', true, false, false, 0,
        'Maria', 'Garcia', 'Staff', 'active',
        'Glaucoma Specialist', 'GLU-44556', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false
    ) ON CONFLICT (normalized_user_name) DO NOTHING;
    
    INSERT INTO app_user_roles (user_id, role_id, branch_id, "AssignedAt", "IsActive")
    VALUES (v_user_id, v_doctor_role_id, v_branch_id, CURRENT_TIMESTAMP, true)
    ON CONFLICT DO NOTHING;
    
    IF v_dept_id IS NOT NULL THEN
        INSERT INTO department_access (id, tenant_id, user_id, department_id, access_type, created_at, updated_at, created_by, updated_by, status)
        VALUES (gen_random_uuid(), v_tenant_id, v_user_id, v_dept_id, 'Primary', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, v_user_id, v_user_id, 'active');
    END IF;
    
    -- Doctor 5: Dr. Jennifer Taylor
    v_user_id := gen_random_uuid();
    INSERT INTO users (
        id, tenant_id, user_name, normalized_user_name, email, normalized_email,
        email_confirmed, password_hash, security_stamp, concurrency_stamp,
        phone_number, phone_number_confirmed, two_factor_enabled, lockout_enabled,
        access_failed_count, "FirstName", "LastName", "UserType", "UserStatus",
        "Specialization", license_number, "CreatedAt", "UpdatedAt", "MustChangePasswordOnLogin"
    ) VALUES (
        v_user_id, v_tenant_id, 'jennifer.taylor', 'JENNIFER.TAYLOR',
        'jennifer.taylor@hospital.com', 'JENNIFER.TAYLOR@HOSPITAL.COM',
        true, v_password_hash, gen_random_uuid()::text, gen_random_uuid()::text,
        '+1-555-1005', true, false, false, 0,
        'Jennifer', 'Taylor', 'Staff', 'active',
        'Optometrist', 'OPT-77889', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false
    ) ON CONFLICT (normalized_user_name) DO NOTHING;
    
    INSERT INTO app_user_roles (user_id, role_id, branch_id, "AssignedAt", "IsActive")
    VALUES (v_user_id, v_doctor_role_id, v_branch_id, CURRENT_TIMESTAMP, true)
    ON CONFLICT DO NOTHING;
    
    IF v_dept_id IS NOT NULL THEN
        INSERT INTO department_access (id, tenant_id, user_id, department_id, access_type, created_at, updated_at, created_by, updated_by, status)
        VALUES (gen_random_uuid(), v_tenant_id, v_user_id, v_dept_id, 'Primary', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, v_user_id, v_user_id, 'active');
    END IF;
    
    RAISE NOTICE '✅ Created 5 test doctors: James Anderson, Sarah Johnson, Rajesh Kumar, Maria Garcia, Jennifer Taylor';
    RAISE NOTICE '📧 You can now search for: "james", "sarah", "rajesh", "maria", or "jennifer"';
    RAISE NOTICE '🔑 Password for all: Test@123456';
END $$;

-- Verify doctors were created
SELECT 
    u."FirstName" || ' ' || u."LastName" as doctor_name,
    u.email as email,
    u."Specialization" as specialization,
    u.license_number as license,
    r.name as role_name
FROM users u
JOIN app_user_roles ur ON u.id = ur.user_id
JOIN app_roles r ON ur.role_id = r.id
WHERE u.tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
  AND u."UserStatus" = 'active'
  AND u."DeletedAt" IS NULL
  AND (r."NormalizedName" LIKE '%DOCTOR%' OR r."NormalizedName" LIKE '%OPHTHAL%' OR r."NormalizedName" LIKE '%SURGEON%')
ORDER BY u."FirstName";
