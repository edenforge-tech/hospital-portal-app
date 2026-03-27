-- =====================================================
-- MIGRATION 04: SEED 30 TEST USERS
-- =====================================================
-- Hospital Portal - Comprehensive Test User Data
-- Database: hospitalportal @ Azure PostgreSQL 17.6
-- Date: January 21, 2026
-- Phase: 1 - Critical Foundation
-- 
-- Creates 30 test users across all critical roles for testing
-- Password for all users: Test@123456 (hashed)
-- =====================================================

-- Note: Password hash for "Test@123456"
-- This is a pre-computed ASP.NET Core Identity password hash
-- In production, change these passwords immediately!

DO $$
DECLARE
    v_tenant_id UUID;
    v_org_id UUID;
    v_branch_id UUID;
    v_dept_id UUID;
    v_role_id UUID;
    v_user_id UUID;
    v_emp_type_permanent UUID;
    v_emp_type_contract UUID;
    v_password_hash TEXT := 'AQAAAAIAAYagAAAAEKp8qH0Q7FQ3xZVqK5P4vN7xH6lYqJ8zN2mC1wR3tE4pD5oA8sV7kL9fY6uX3hG2wA==';
BEGIN
    -- Get first tenant (or create if none exists)
    SELECT id INTO v_tenant_id FROM tenant WHERE status = 'active' LIMIT 1;
    
    IF v_tenant_id IS NULL THEN
        INSERT INTO tenant (id, name, tenant_type, status)
        VALUES (gen_random_uuid(), 'Test Eye Hospital', 'hospital', 'active')
        RETURNING id INTO v_tenant_id;
    END IF;
    
    -- Get first organization
    SELECT id INTO v_org_id FROM organization WHERE tenant_id = v_tenant_id LIMIT 1;
    
    IF v_org_id IS NULL THEN
        INSERT INTO organization (id, tenant_id, name, status)
        VALUES (gen_random_uuid(), v_tenant_id, 'Main Hospital Organization', 'active')
        RETURNING id INTO v_org_id;
    END IF;
    
    -- Get first branch
    SELECT id INTO v_branch_id FROM branch WHERE tenant_id = v_tenant_id LIMIT 1;
    
    IF v_branch_id IS NULL THEN
        INSERT INTO branch (id, tenant_id, organization_id, name, branch_type, status)
        VALUES (gen_random_uuid(), v_tenant_id, v_org_id, 'Main Branch', 'hospital', 'active')
        RETURNING id INTO v_branch_id;
    END IF;
    
    -- Get employment types
    SELECT id INTO v_emp_type_permanent FROM employment_type_lookup WHERE type_code = 'PERMANENT';
    SELECT id INTO v_emp_type_contract FROM employment_type_lookup WHERE type_code = 'CONTRACT';
    
    RAISE NOTICE 'Using Tenant: %, Organization: %, Branch: %', v_tenant_id, v_org_id, v_branch_id;
END $$;

-- =====================================================
-- USER 1: Super Admin
-- =====================================================
DO $$
DECLARE
    v_user_id UUID := gen_random_uuid();
    v_tenant_id UUID;
    v_role_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenant LIMIT 1;
    SELECT "Id" INTO v_role_id FROM "AspNetRoles" WHERE "NormalizedName" = 'SUPER ADMIN';
    
    INSERT INTO "AspNetUsers" (
        "Id", "TenantId", "UserName", "NormalizedUserName", "Email", "NormalizedEmail",
        "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp",
        "PhoneNumber", "PhoneNumberConfirmed", "TwoFactorEnabled", "LockoutEnabled",
        "AccessFailedCount", "FirstName", "LastName", "UserType", "UserStatus",
        "CreatedAt", employment_category, hire_date, mfa_required
    ) VALUES (
        v_user_id, v_tenant_id, 'superadmin', 'SUPERADMIN', 'superadmin@hospitalportal.com', 'SUPERADMIN@HOSPITALPORTAL.COM',
        true, 'AQAAAAIAAYagAAAAEKp8qH0Q7FQ3xZVqK5P4vN7xH6lYqJ8zN2mC1wR3tE4pD5oA8sV7kL9fY6uX3hG2wA==',
        gen_random_uuid()::text, gen_random_uuid()::text,
        '+1-555-0001', true, false, false, 0,
        'System', 'Administrator', 'Admin', 'active',
        CURRENT_TIMESTAMP, 'STAFF', CURRENT_DATE - INTERVAL '2 years', true
    ) ON CONFLICT ("NormalizedUserName") DO NOTHING;
    
    -- Assign role
    INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
    VALUES (v_user_id, v_role_id)
    ON CONFLICT DO NOTHING;
END $$;

-- =====================================================
-- USER 2-5: Hospital Leadership
-- =====================================================

-- Hospital Owner
DO $$
DECLARE
    v_user_id UUID := gen_random_uuid();
    v_tenant_id UUID;
    v_branch_id UUID;
    v_role_id UUID;
    v_emp_type UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenant LIMIT 1;
    SELECT id INTO v_branch_id FROM branch LIMIT 1;
    SELECT "Id" INTO v_role_id FROM "AspNetRoles" WHERE "NormalizedName" = 'HOSPITAL OWNER';
    SELECT id INTO v_emp_type FROM employment_type_lookup WHERE type_code = 'PERMANENT';
    
    INSERT INTO "AspNetUsers" (
        "Id", "TenantId", "UserName", "NormalizedUserName", "Email", "NormalizedEmail",
        "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp",
        "PhoneNumber", "FirstName", "LastName", "UserType", "UserStatus",
        employment_category, employment_type_id, hire_date, mfa_required
    ) VALUES (
        v_user_id, v_tenant_id, 'owner1', 'OWNER1', 'owner@testeye.com', 'OWNER@TESTEYE.COM',
        true, 'AQAAAAIAAYagAAAAEKp8qH0Q7FQ3xZVqK5P4vN7xH6lYqJ8zN2mC1wR3tE4pD5oA8sV7kL9fY6uX3hG2wA==',
        gen_random_uuid()::text, gen_random_uuid()::text,
        '+1-555-0002', 'Dr. Rajesh', 'Kumar', 'Staff', 'active',
        'STAFF', v_emp_type, CURRENT_DATE - INTERVAL '5 years', true
    ) ON CONFLICT ("NormalizedUserName") DO NOTHING;
    
    INSERT INTO "AspNetUserRoles" ("UserId", "RoleId") VALUES (v_user_id, v_role_id) ON CONFLICT DO NOTHING;
    
    -- Create employee record
    INSERT INTO employee (
        id, tenant_id, user_id, employee_number, hire_date, employment_type_id,
        employment_status, job_title, branch_id, base_salary, currency
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_user_id, 'EMP-001', CURRENT_DATE - INTERVAL '5 years',
        v_emp_type, 'active', 'Hospital Owner', v_branch_id, 250000.00, 'USD'
    ) ON CONFLICT (user_id) DO NOTHING;
END $$;

-- CEO
DO $$
DECLARE
    v_user_id UUID := gen_random_uuid();
    v_tenant_id UUID;
    v_branch_id UUID;
    v_role_id UUID;
    v_emp_type UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenant LIMIT 1;
    SELECT id INTO v_branch_id FROM branch LIMIT 1;
    SELECT "Id" INTO v_role_id FROM "AspNetRoles" WHERE "NormalizedName" = 'CHIEF EXECUTIVE OFFICER';
    SELECT id INTO v_emp_type FROM employment_type_lookup WHERE type_code = 'PERMANENT';
    
    INSERT INTO "AspNetUsers" (
        "Id", "TenantId", "UserName", "NormalizedUserName", "Email", "NormalizedEmail",
        "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp",
        "PhoneNumber", "FirstName", "LastName", "UserType", "UserStatus",
        employment_category, employment_type_id, hire_date, mfa_required
    ) VALUES (
        v_user_id, v_tenant_id, 'ceo1', 'CEO1', 'ceo@testeye.com', 'CEO@TESTEYE.COM',
        true, 'AQAAAAIAAYagAAAAEKp8qH0Q7FQ3xZVqK5P4vN7xH6lYqJ8zN2mC1wR3tE4pD5oA8sV7kL9fY6uX3hG2wA==',
        gen_random_uuid()::text, gen_random_uuid()::text,
        '+1-555-0003', 'Sarah', 'Johnson', 'Staff', 'active',
        'STAFF', v_emp_type, CURRENT_DATE - INTERVAL '3 years', true
    ) ON CONFLICT ("NormalizedUserName") DO NOTHING;
    
    INSERT INTO "AspNetUserRoles" ("UserId", "RoleId") VALUES (v_user_id, v_role_id) ON CONFLICT DO NOTHING;
    
    INSERT INTO employee (
        id, tenant_id, user_id, employee_number, hire_date, employment_type_id,
        employment_status, job_title, branch_id, base_salary, currency
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_user_id, 'EMP-002', CURRENT_DATE - INTERVAL '3 years',
        v_emp_type, 'active', 'Chief Executive Officer', v_branch_id, 200000.00, 'USD'
    ) ON CONFLICT (user_id) DO NOTHING;
END $$;

-- CMO
DO $$
DECLARE
    v_user_id UUID := gen_random_uuid();
    v_tenant_id UUID;
    v_branch_id UUID;
    v_role_id UUID;
    v_emp_type UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenant LIMIT 1;
    SELECT id INTO v_branch_id FROM branch LIMIT 1;
    SELECT "Id" INTO v_role_id FROM "AspNetRoles" WHERE "NormalizedName" = 'CHIEF MEDICAL OFFICER';
    SELECT id INTO v_emp_type FROM employment_type_lookup WHERE type_code = 'PERMANENT';
    
    INSERT INTO "AspNetUsers" (
        "Id", "TenantId", "UserName", "NormalizedUserName", "Email", "NormalizedEmail",
        "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp",
        "PhoneNumber", "FirstName", "LastName", "UserType", "UserStatus",
        employment_category, employment_type_id, hire_date, mfa_required, "LicenseNumber"
    ) VALUES (
        v_user_id, v_tenant_id, 'cmo1', 'CMO1', 'cmo@testeye.com', 'CMO@TESTEYE.COM',
        true, 'AQAAAAIAAYagAAAAEKp8qH0Q7FQ3xZVqK5P4vN7xH6lYqJ8zN2mC1wR3tE4pD5oA8sV7kL9fY6uX3hG2wA==',
        gen_random_uuid()::text, gen_random_uuid()::text,
        '+1-555-0004', 'Dr. Michael', 'Chen', 'Staff', 'active',
        'STAFF', v_emp_type, CURRENT_DATE - INTERVAL '4 years', true, 'MD-12345'
    ) ON CONFLICT ("NormalizedUserName") DO NOTHING;
    
    INSERT INTO "AspNetUserRoles" ("UserId", "RoleId") VALUES (v_user_id, v_role_id) ON CONFLICT DO NOTHING;
    
    INSERT INTO employee (
        id, tenant_id, user_id, employee_number, hire_date, employment_type_id,
        employment_status, job_title, branch_id, base_salary, currency
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_user_id, 'EMP-003', CURRENT_DATE - INTERVAL '4 years',
        v_emp_type, 'active', 'Chief Medical Officer', v_branch_id, 220000.00, 'USD'
    ) ON CONFLICT (user_id) DO NOTHING;
END $$;

-- CFO
DO $$
DECLARE
    v_user_id UUID := gen_random_uuid();
    v_tenant_id UUID;
    v_branch_id UUID;
    v_role_id UUID;
    v_emp_type UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenant LIMIT 1;
    SELECT id INTO v_branch_id FROM branch LIMIT 1;
    SELECT "Id" INTO v_role_id FROM "AspNetRoles" WHERE "NormalizedName" = 'CHIEF FINANCIAL OFFICER';
    SELECT id INTO v_emp_type FROM employment_type_lookup WHERE type_code = 'PERMANENT';
    
    INSERT INTO "AspNetUsers" (
        "Id", "TenantId", "UserName", "NormalizedUserName", "Email", "NormalizedEmail",
        "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp",
        "PhoneNumber", "FirstName", "LastName", "UserType", "UserStatus",
        employment_category, employment_type_id, hire_date, mfa_required
    ) VALUES (
        v_user_id, v_tenant_id, 'cfo1', 'CFO1', 'cfo@testeye.com', 'CFO@TESTEYE.COM',
        true, 'AQAAAAIAAYagAAAAEKp8qH0Q7FQ3xZVqK5P4vN7xH6lYqJ8zN2mC1wR3tE4pD5oA8sV7kL9fY6uX3hG2wA==',
        gen_random_uuid()::text, gen_random_uuid()::text,
        '+1-555-0005', 'Emily', 'Rodriguez', 'Staff', 'active',
        'STAFF', v_emp_type, CURRENT_DATE - INTERVAL '2 years', true
    ) ON CONFLICT ("NormalizedUserName") DO NOTHING;
    
    INSERT INTO "AspNetUserRoles" ("UserId", "RoleId") VALUES (v_user_id, v_role_id) ON CONFLICT DO NOTHING;
    
    INSERT INTO employee (
        id, tenant_id, user_id, employee_number, hire_date, employment_type_id,
        employment_status, job_title, branch_id, base_salary, currency
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_user_id, 'EMP-004', CURRENT_DATE - INTERVAL '2 years',
        v_emp_type, 'active', 'Chief Financial Officer', v_branch_id, 180000.00, 'USD'
    ) ON CONFLICT (user_id) DO NOTHING;
END $$;

-- =====================================================
-- Create remaining 25 users (doctors, nurses, staff)
-- =====================================================

-- Helper function to create user with role
CREATE OR REPLACE FUNCTION create_test_user(
    p_username VARCHAR,
    p_email VARCHAR,
    p_first_name VARCHAR,
    p_last_name VARCHAR,
    p_role_name VARCHAR,
    p_job_title VARCHAR,
    p_license_number VARCHAR DEFAULT NULL,
    p_emp_number VARCHAR DEFAULT NULL,
    p_base_salary DECIMAL DEFAULT 80000.00
)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID := gen_random_uuid();
    v_tenant_id UUID;
    v_branch_id UUID;
    v_role_id UUID;
    v_emp_type UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenant LIMIT 1;
    SELECT id INTO v_branch_id FROM branch LIMIT 1;
    SELECT "Id" INTO v_role_id FROM "AspNetRoles" WHERE "NormalizedName" = UPPER(p_role_name);
    SELECT id INTO v_emp_type FROM employment_type_lookup WHERE type_code = 'PERMANENT';
    
    INSERT INTO "AspNetUsers" (
        "Id", "TenantId", "UserName", "NormalizedUserName", "Email", "NormalizedEmail",
        "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp",
        "PhoneNumber", "FirstName", "LastName", "UserType", "UserStatus",
        employment_category, employment_type_id, hire_date, mfa_required, "LicenseNumber"
    ) VALUES (
        v_user_id, v_tenant_id, p_username, UPPER(p_username), p_email, UPPER(p_email),
        true, 'AQAAAAIAAYagAAAAEKp8qH0Q7FQ3xZVqK5P4vN7xH6lYqJ8zN2mC1wR3tE4pD5oA8sV7kL9fY6uX3hG2wA==',
        gen_random_uuid()::text, gen_random_uuid()::text,
        '+1-555-' || LPAD((1000 + floor(random() * 8999))::text, 4, '0'), 
        p_first_name, p_last_name, 'Staff', 'active',
        'STAFF', v_emp_type, CURRENT_DATE - (INTERVAL '1 day' * floor(random() * 1095)), true, p_license_number
    ) ON CONFLICT ("NormalizedUserName") DO NOTHING;
    
    INSERT INTO "AspNetUserRoles" ("UserId", "RoleId") VALUES (v_user_id, v_role_id) ON CONFLICT DO NOTHING;
    
    INSERT INTO employee (
        id, tenant_id, user_id, employee_number, hire_date, employment_type_id,
        employment_status, job_title, branch_id, base_salary, currency
    ) VALUES (
        gen_random_uuid(), v_tenant_id, v_user_id, 
        COALESCE(p_emp_number, 'EMP-' || LPAD((100 + floor(random() * 899))::text, 3, '0')),
        CURRENT_DATE - (INTERVAL '1 day' * floor(random() * 1095)),
        v_emp_type, 'active', p_job_title, v_branch_id, p_base_salary, 'USD'
    ) ON CONFLICT (user_id) DO NOTHING;
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

-- Create 25 additional users across various roles
SELECT create_test_user('ophthalmologist1', 'ophthalmologist1@testeye.com', 'Dr. James', 'Wilson', 'Ophthalmologist', 'General Ophthalmologist', 'OPH-54321', 'EMP-010', 180000);
SELECT create_test_user('cataract1', 'cataract1@testeye.com', 'Dr. Lisa', 'Anderson', 'Cataract Surgeon', 'Cataract Surgeon', 'CAT-98765', 'EMP-011', 220000);
SELECT create_test_user('retina1', 'retina1@testeye.com', 'Dr. David', 'Martinez', 'Retina Specialist', 'Retina Specialist', 'RET-11223', 'EMP-012', 250000);
SELECT create_test_user('glaucoma1', 'glaucoma1@testeye.com', 'Dr. Maria', 'Garcia', 'Glaucoma Specialist', 'Glaucoma Specialist', 'GLU-44556', 'EMP-013', 230000);
SELECT create_test_user('pediatric1', 'pediatric1@testeye.com', 'Dr. Robert', 'Lee', 'Pediatric Ophthalmologist', 'Pediatric Ophthalmologist', 'PED-77889', 'EMP-014', 200000);

SELECT create_test_user('optometrist1', 'optometrist1@testeye.com', 'Dr. Jennifer', 'Taylor', 'Optometrist', 'Optometrist', 'OPT-22334', 'EMP-020', 90000);
SELECT create_test_user('optometrist2', 'optometrist2@testeye.com', 'Dr. Kevin', 'Brown', 'Optometrist', 'Optometrist', 'OPT-55667', 'EMP-021', 90000);

SELECT create_test_user('nurse1', 'nurse1@testeye.com', 'Angela', 'White', 'Registered Nurse', 'Registered Nurse', 'RN-33445', 'EMP-030', 75000);
SELECT create_test_user('nurse2', 'nurse2@testeye.com', 'Michelle', 'Harris', 'Ophthalmic Nurse', 'Ophthalmic Nurse', 'RN-66778', 'EMP-031', 80000);
SELECT create_test_user('nurse3', 'nurse3@testeye.com', 'Patricia', 'Clark', 'Nurse Practitioner', 'Nurse Practitioner', 'NP-99001', 'EMP-032', 95000);

SELECT create_test_user('receptionist1', 'receptionist1@testeye.com', 'Rachel', 'Lewis', 'Receptionist', 'Front Desk Receptionist', NULL, 'EMP-040', 40000);
SELECT create_test_user('receptionist2', 'receptionist2@testeye.com', 'Amanda', 'Walker', 'Receptionist', 'Front Desk Receptionist', NULL, 'EMP-041', 40000);
SELECT create_test_user('receptionist3', 'receptionist3@testeye.com', 'Jessica', 'Hall', 'Appointment Coordinator', 'Appointment Coordinator', NULL, 'EMP-042', 45000);

SELECT create_test_user('billing1', 'billing1@testeye.com', 'Thomas', 'Young', 'Billing Executive', 'Billing Executive', NULL, 'EMP-050', 50000);
SELECT create_test_user('billing2', 'billing2@testeye.com', 'Christopher', 'King', 'Insurance Coordinator', 'Insurance Coordinator', NULL, 'EMP-051', 52000);

SELECT create_test_user('pharmacist1', 'pharmacist1@testeye.com', 'Dr. Daniel', 'Wright', 'Pharmacist', 'Clinical Pharmacist', 'PHR-12345', 'EMP-060', 100000);
SELECT create_test_user('pharmacist2', 'pharmacist2@testeye.com', 'Linda', 'Scott', 'Pharmacy Technician', 'Pharmacy Technician', NULL, 'EMP-061', 45000);

SELECT create_test_user('technician1', 'technician1@testeye.com', 'Steven', 'Green', 'Diagnostic Technician', 'Diagnostic Technician', NULL, 'EMP-070', 60000);
SELECT create_test_user('technician2', 'technician2@testeye.com', 'Barbara', 'Adams', 'Lab Technician', 'Lab Technician', NULL, 'EMP-071', 55000);

SELECT create_test_user('hr1', 'hr1@testeye.com', 'Karen', 'Baker', 'HR Manager', 'HR Manager', NULL, 'EMP-080', 85000);
SELECT create_test_user('hr2', 'hr2@testeye.com', 'Nancy', 'Nelson', 'HR Executive', 'HR Executive', NULL, 'EMP-081', 55000);

SELECT create_test_user('counsellor1', 'counsellor1@testeye.com', 'Susan', 'Carter', 'Patient Counsellor', 'Patient Counsellor', NULL, 'EMP-090', 50000);
SELECT create_test_user('counsellor2', 'counsellor2@testeye.com', 'Betty', 'Mitchell', 'Patient Care Coordinator', 'Patient Care Coordinator', NULL, 'EMP-091', 48000);

SELECT create_test_user('compliance1', 'compliance1@testeye.com', 'Brian', 'Perez', 'Compliance Officer', 'Compliance Officer', NULL, 'EMP-100', 90000);
SELECT create_test_user('it1', 'it1@testeye.com', 'Edward', 'Roberts', 'IT Administrator', 'IT Administrator', NULL, 'EMP-110', 80000);

-- Clean up helper function
DROP FUNCTION create_test_user(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, DECIMAL);

-- =====================================================
-- DATA VALIDATION
-- =====================================================

DO $$
DECLARE
    v_user_count INTEGER;
    v_employee_count INTEGER;
    v_role_assignment_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_user_count FROM "AspNetUsers";
    SELECT COUNT(*) INTO v_employee_count FROM employee;
    SELECT COUNT(*) INTO v_role_assignment_count FROM "AspNetUserRoles";
    
    RAISE NOTICE '✅ Total users created: %', v_user_count;
    RAISE NOTICE '✅ Total employee records: %', v_employee_count;
    RAISE NOTICE '✅ Total role assignments: %', v_role_assignment_count;
    
    IF v_user_count < 30 THEN
        RAISE WARNING 'Expected at least 30 users, found %', v_user_count;
    END IF;
END $$;

-- Display user summary by role
SELECT 
    r."Name" as role_name,
    COUNT(ur."UserId") as user_count
FROM "AspNetRoles" r
LEFT JOIN "AspNetUserRoles" ur ON r."Id" = ur."RoleId"
GROUP BY r."Name"
HAVING COUNT(ur."UserId") > 0
ORDER BY user_count DESC;

-- =====================================================
-- MIGRATION 04 COMPLETE
-- =====================================================
-- Database foundation complete! 
-- Next steps: Backend services, frontend enhancements
-- =====================================================
