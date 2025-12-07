-- =====================================================
-- CREATE TEST USERS FOR END-TO-END PERMISSION TESTING
-- =====================================================
-- This script creates 5 test users with different roles
-- Password for all users: Test@123456
-- Pre-hashed with ASP.NET Core Identity v2 (PBKDF2-SHA256)
-- =====================================================

BEGIN;

DO $$
DECLARE
    usa_tenant_id UUID;
    admin_user_id UUID;
    doctor_user_id UUID;
    nurse_user_id UUID;
    receptionist_user_id UUID;
    lab_tech_user_id UUID;
    admin_role_id UUID;
    doctor_role_id UUID;
    nurse_role_id UUID;
    receptionist_role_id UUID;
    technician_role_id UUID;
BEGIN
    -- Get USA Healthcare Hospital tenant ID
    SELECT id INTO usa_tenant_id FROM tenant WHERE tenant_code = 'USA_HEALTH_HOSP' LIMIT 1;
    
    IF usa_tenant_id IS NULL THEN
        RAISE NOTICE 'ERROR: USA_HEALTH_HOSP tenant not found. Run sample_data_complete.sql first.';
        RAISE EXCEPTION 'Tenant not found';
    END IF;
    
    RAISE NOTICE 'Using tenant: USA Healthcare Hospital (ID: %)', usa_tenant_id;
    
    -- =====================================================
    -- 1. CREATE ADMIN USER
    -- =====================================================
    admin_user_id := gen_random_uuid();
    
    INSERT INTO users (
        id, tenant_id, user_name, normalized_user_name, email, normalized_email,
        email_confirmed, password_hash, security_stamp, concurrency_stamp,
        phone_number_confirmed, two_factor_enabled, lockout_enabled, access_failed_count,
        first_name, last_name, user_status, created_at, updated_at
    ) VALUES (
        admin_user_id,
        usa_tenant_id,
        'admin@test.com',
        'ADMIN@TEST.COM',
        'admin@test.com',
        'ADMIN@TEST.COM',
        true,
        -- Password: Test@123456 (ASP.NET Core Identity hashed)
        'AQAAAAIAAYagAAAAEHxqp8qLKJZH1nI0R7oXZ+JvPHvdWZHxVOFf3KFZy5g+BwK5VR0p0YwHqNxTvWJKYA==',
        gen_random_uuid()::text,
        gen_random_uuid()::text,
        false, false, true, 0,
        'Test', 'Admin', 'Active',
        NOW(), NOW()
    ) ON CONFLICT (normalized_user_name, tenant_id) DO UPDATE 
    SET password_hash = EXCLUDED.password_hash,
        updated_at = NOW();
    
    RAISE NOTICE 'Created user: admin@test.com (ID: %)', admin_user_id;
    
    -- =====================================================
    -- 2. CREATE DOCTOR USER
    -- =====================================================
    doctor_user_id := gen_random_uuid();
    
    INSERT INTO users (
        id, tenant_id, user_name, normalized_user_name, email, normalized_email,
        email_confirmed, password_hash, security_stamp, concurrency_stamp,
        phone_number_confirmed, two_factor_enabled, lockout_enabled, access_failed_count,
        first_name, last_name, user_status, created_at, updated_at
    ) VALUES (
        doctor_user_id,
        usa_tenant_id,
        'doctor@test.com',
        'DOCTOR@TEST.COM',
        'doctor@test.com',
        'DOCTOR@TEST.COM',
        true,
        'AQAAAAIAAYagAAAAEHxqp8qLKJZH1nI0R7oXZ+JvPHvdWZHxVOFf3KFZy5g+BwK5VR0p0YwHqNxTvWJKYA==',
        gen_random_uuid()::text,
        gen_random_uuid()::text,
        false, false, true, 0,
        'Dr. John', 'Smith', 'Active',
        NOW(), NOW()
    ) ON CONFLICT (normalized_user_name, tenant_id) DO UPDATE 
    SET password_hash = EXCLUDED.password_hash,
        updated_at = NOW();
    
    RAISE NOTICE 'Created user: doctor@test.com (ID: %)', doctor_user_id;
    
    -- =====================================================
    -- 3. CREATE NURSE USER
    -- =====================================================
    nurse_user_id := gen_random_uuid();
    
    INSERT INTO users (
        id, tenant_id, user_name, normalized_user_name, email, normalized_email,
        email_confirmed, password_hash, security_stamp, concurrency_stamp,
        phone_number_confirmed, two_factor_enabled, lockout_enabled, access_failed_count,
        first_name, last_name, user_status, created_at, updated_at
    ) VALUES (
        nurse_user_id,
        usa_tenant_id,
        'nurse@test.com',
        'NURSE@TEST.COM',
        'nurse@test.com',
        'NURSE@TEST.COM',
        true,
        'AQAAAAIAAYagAAAAEHxqp8qLKJZH1nI0R7oXZ+JvPHvdWZHxVOFf3KFZy5g+BwK5VR0p0YwHqNxTvWJKYA==',
        gen_random_uuid()::text,
        gen_random_uuid()::text,
        false, false, true, 0,
        'Sarah', 'Johnson', 'Active',
        NOW(), NOW()
    ) ON CONFLICT (normalized_user_name, tenant_id) DO UPDATE 
    SET password_hash = EXCLUDED.password_hash,
        updated_at = NOW();
    
    RAISE NOTICE 'Created user: nurse@test.com (ID: %)', nurse_user_id;
    
    -- =====================================================
    -- 4. CREATE RECEPTIONIST USER
    -- =====================================================
    receptionist_user_id := gen_random_uuid();
    
    INSERT INTO users (
        id, tenant_id, user_name, normalized_user_name, email, normalized_email,
        email_confirmed, password_hash, security_stamp, concurrency_stamp,
        phone_number_confirmed, two_factor_enabled, lockout_enabled, access_failed_count,
        first_name, last_name, user_status, created_at, updated_at
    ) VALUES (
        receptionist_user_id,
        usa_tenant_id,
        'receptionist@test.com',
        'RECEPTIONIST@TEST.COM',
        'receptionist@test.com',
        'RECEPTIONIST@TEST.COM',
        true,
        'AQAAAAIAAYagAAAAEHxqp8qLKJZH1nI0R7oXZ+JvPHvdWZHxVOFf3KFZy5g+BwK5VR0p0YwHqNxTvWJKYA==',
        gen_random_uuid()::text,
        gen_random_uuid()::text,
        false, false, true, 0,
        'Emily', 'Davis', 'Active',
        NOW(), NOW()
    ) ON CONFLICT (normalized_user_name, tenant_id) DO UPDATE 
    SET password_hash = EXCLUDED.password_hash,
        updated_at = NOW();
    
    RAISE NOTICE 'Created user: receptionist@test.com (ID: %)', receptionist_user_id;
    
    -- =====================================================
    -- 5. CREATE LAB TECHNICIAN USER
    -- =====================================================
    lab_tech_user_id := gen_random_uuid();
    
    INSERT INTO users (
        id, tenant_id, user_name, normalized_user_name, email, normalized_email,
        email_confirmed, password_hash, security_stamp, concurrency_stamp,
        phone_number_confirmed, two_factor_enabled, lockout_enabled, access_failed_count,
        first_name, last_name, user_status, created_at, updated_at
    ) VALUES (
        lab_tech_user_id,
        usa_tenant_id,
        'labtech@test.com',
        'LABTECH@TEST.COM',
        'labtech@test.com',
        'LABTECH@TEST.COM',
        true,
        'AQAAAAIAAYagAAAAEHxqp8qLKJZH1nI0R7oXZ+JvPHvdWZHxVOFf3KFZy5g+BwK5VR0p0YwHqNxTvWJKYA==',
        gen_random_uuid()::text,
        gen_random_uuid()::text,
        false, false, true, 0,
        'Michael', 'Brown', 'Active',
        NOW(), NOW()
    ) ON CONFLICT (normalized_user_name, tenant_id) DO UPDATE 
    SET password_hash = EXCLUDED.password_hash,
        updated_at = NOW();
    
    RAISE NOTICE 'Created user: labtech@test.com (ID: %)', lab_tech_user_id;
    
    -- =====================================================
    -- ASSIGN ROLES TO USERS
    -- =====================================================
    
    -- Get role IDs
    SELECT id INTO admin_role_id 
    FROM roles 
    WHERE tenant_id = usa_tenant_id 
      AND name LIKE '%System Admin%' 
    LIMIT 1;
    
    SELECT id INTO doctor_role_id 
    FROM roles 
    WHERE tenant_id = usa_tenant_id 
      AND name LIKE '%Doctor%' 
    LIMIT 1;
    
    SELECT id INTO nurse_role_id 
    FROM roles 
    WHERE tenant_id = usa_tenant_id 
      AND name LIKE '%Nurse%' 
    LIMIT 1;
    
    SELECT id INTO receptionist_role_id 
    FROM roles 
    WHERE tenant_id = usa_tenant_id 
      AND name LIKE '%Receptionist%' 
    LIMIT 1;
    
    SELECT id INTO technician_role_id 
    FROM roles 
    WHERE tenant_id = usa_tenant_id 
      AND name LIKE '%Technician%' 
    LIMIT 1;
    
    -- Assign admin role
    IF admin_role_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role_id, tenant_id, assigned_at)
        VALUES (admin_user_id, admin_role_id, usa_tenant_id, NOW())
        ON CONFLICT (user_id, role_id) DO NOTHING;
        RAISE NOTICE 'Assigned System Admin role to admin@test.com';
    ELSE
        RAISE NOTICE 'WARNING: System Admin role not found';
    END IF;
    
    -- Assign doctor role
    IF doctor_role_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role_id, tenant_id, assigned_at)
        VALUES (doctor_user_id, doctor_role_id, usa_tenant_id, NOW())
        ON CONFLICT (user_id, role_id) DO NOTHING;
        RAISE NOTICE 'Assigned Doctor role to doctor@test.com';
    ELSE
        RAISE NOTICE 'WARNING: Doctor role not found';
    END IF;
    
    -- Assign nurse role
    IF nurse_role_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role_id, tenant_id, assigned_at)
        VALUES (nurse_user_id, nurse_role_id, usa_tenant_id, NOW())
        ON CONFLICT (user_id, role_id) DO NOTHING;
        RAISE NOTICE 'Assigned Nurse role to nurse@test.com';
    ELSE
        RAISE NOTICE 'WARNING: Nurse role not found';
    END IF;
    
    -- Assign receptionist role
    IF receptionist_role_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role_id, tenant_id, assigned_at)
        VALUES (receptionist_user_id, receptionist_role_id, usa_tenant_id, NOW())
        ON CONFLICT (user_id, role_id) DO NOTHING;
        RAISE NOTICE 'Assigned Receptionist role to receptionist@test.com';
    ELSE
        RAISE NOTICE 'WARNING: Receptionist role not found';
    END IF;
    
    -- Assign technician role
    IF technician_role_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role_id, tenant_id, assigned_at)
        VALUES (lab_tech_user_id, technician_role_id, usa_tenant_id, NOW())
        ON CONFLICT (user_id, role_id) DO NOTHING;
        RAISE NOTICE 'Assigned Technician role to labtech@test.com';
    ELSE
        RAISE NOTICE 'WARNING: Technician role not found';
    END IF;
    
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'TEST USERS CREATED SUCCESSFULLY';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'All passwords: Test@123456';
    RAISE NOTICE '-----------------------------------------------------';
    RAISE NOTICE '1. admin@test.com       - System Admin (Full Access)';
    RAISE NOTICE '2. doctor@test.com      - Doctor (Medical Access)';
    RAISE NOTICE '3. nurse@test.com       - Nurse (Clinical Support)';
    RAISE NOTICE '4. receptionist@test.com - Receptionist (Front Desk)';
    RAISE NOTICE '5. labtech@test.com     - Lab Technician (Lab Access)';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'TenantId: %', usa_tenant_id;
    RAISE NOTICE 'Use this TenantId in X-Tenant-ID header';
    RAISE NOTICE '=====================================================';
    
END $$;

COMMIT;

-- =====================================================
-- VERIFY TEST USERS
-- =====================================================
SELECT 
    u.user_name as email,
    u.first_name || ' ' || u.last_name as full_name,
    r.name as role,
    u.user_status as status,
    u.email_confirmed,
    t.name as tenant
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN tenant t ON u.tenant_id = t.id
WHERE u.user_name IN (
    'admin@test.com',
    'doctor@test.com',
    'nurse@test.com',
    'receptionist@test.com',
    'labtech@test.com'
)
ORDER BY r.name;
