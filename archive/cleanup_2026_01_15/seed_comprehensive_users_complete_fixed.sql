-- =====================================================
-- COMPREHENSIVE USER SEEDING - COMPLETE DATA
-- Creates realistic users for all roles, departments, and branches
-- =====================================================

DO $$
DECLARE
    v_tenant_id UUID := '155fe198-6ae5-4a01-9254-ead5b427247e';
    v_admin_user_id UUID := '155fe198-6ae5-4a01-9254-000000000001';
    v_admin_role_id UUID;
    v_doctor_role_id UUID;
    v_nurse_role_id UUID;
    v_receptionist_role_id UUID;
    v_lab_tech_role_id UUID;
    v_pharmacist_role_id UUID;
    v_counsellor_role_id UUID;
    v_branch_id UUID;
    v_org_id UUID;
    v_user_id UUID;
    v_dept_record RECORD;
    v_branch_record RECORD;
    v_counter INT := 1;
    
    -- Realistic names for Indian context
    v_first_names TEXT[] := ARRAY[
        'Rajesh', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Arjun', 'Kavita',
        'Rahul', 'Deepa', 'Sanjay', 'Meera', 'Rohan', 'Neha', 'Karan', 'Pooja',
        'Akash', 'Simran', 'Nikhil', 'Riya', 'Aditya', 'Divya', 'Manish', 'Shruti'
    ];
    v_last_names TEXT[] := ARRAY[
        'Sharma', 'Patel', 'Kumar', 'Singh', 'Desai', 'Reddy', 'Nair', 'Kapoor',
        'Gupta', 'Joshi', 'Mehta', 'Shah', 'Rao', 'Iyer', 'Malhotra', 'Verma',
        'Chopra', 'Agarwal', 'Banerjee', 'Pillai', 'Kulkarni', 'Mishra'
    ];
    v_specializations TEXT[] := ARRAY[
        'General Medicine', 'Pediatrics', 'Cardiology', 'Neurology', 'Orthopedics',
        'Dermatology', 'ENT', 'Ophthalmology', 'Psychiatry', 'General Surgery'
    ];
BEGIN
    RAISE NOTICE '=== Starting Comprehensive User Seeding ===';
    
    -- Get organization ID
    SELECT id INTO v_org_id FROM organization WHERE tenant_id = v_tenant_id LIMIT 1;
    RAISE NOTICE 'Organization ID: %', v_org_id;
    
    -- Get all roles
    SELECT id INTO v_admin_role_id FROM app_roles WHERE name = 'Admin' AND tenant_id = v_tenant_id LIMIT 1;
    SELECT id INTO v_doctor_role_id FROM app_roles WHERE name = 'Doctor' AND tenant_id = v_tenant_id LIMIT 1;
    SELECT id INTO v_nurse_role_id FROM app_roles WHERE name = 'Nurse' AND tenant_id = v_tenant_id LIMIT 1;
    SELECT id INTO v_receptionist_role_id FROM app_roles WHERE name = 'Receptionist' AND tenant_id = v_tenant_id LIMIT 1;
    SELECT id INTO v_lab_tech_role_id FROM app_roles WHERE name = 'Lab Technician' AND tenant_id = v_tenant_id LIMIT 1;
    SELECT id INTO v_pharmacist_role_id FROM app_roles WHERE name = 'Pharmacist' AND tenant_id = v_tenant_id LIMIT 1;
    SELECT id INTO v_counsellor_role_id FROM app_roles WHERE name = 'Counsellor' AND tenant_id = v_tenant_id LIMIT 1;
    
    RAISE NOTICE 'Role IDs - Admin: %, Doctor: %, Nurse: %, Receptionist: %, LabTech: %, Pharmacist: %, Counsellor: %', 
                 v_admin_role_id, v_doctor_role_id, v_nurse_role_id, v_receptionist_role_id, 
                 v_lab_tech_role_id, v_pharmacist_role_id, v_counsellor_role_id;
    
    -- Update existing admin user with complete data
    UPDATE users SET
        "FirstName" = 'System',
        "LastName" = 'Administrator',
        "UserType" = 'Staff',
        "UserStatus" = 'active',
        "MustChangePasswordOnLogin" = false,
        phone_number = '+919876543210',
        "Designation" = 'Chief Administrator',
        "EmployeeId" = 'EMP-ADMIN-001',
        "OrganizationId" = v_org_id,
        "BranchId" = (SELECT id FROM branch WHERE tenant_id = v_tenant_id AND deleted_at IS NULL LIMIT 1),
        email_confirmed = true,
        phone_number_confirmed = true,
        two_factor_enabled = false,
        lockout_enabled = false,
        "UpdatedAt" = NOW()
    WHERE id = v_admin_user_id;
    
    RAISE NOTICE 'âœ“ Updated admin user with complete data';
    
    -- ====================
    -- CREATE DOCTORS (3 per branch)
    -- ====================
    FOR v_branch_record IN (
        SELECT id, name FROM branch WHERE tenant_id = v_tenant_id AND deleted_at IS NULL ORDER BY created_at
    ) LOOP
        RAISE NOTICE 'Creating doctors for branch: %', v_branch_record.name;
        
        FOR i IN 1..3 LOOP
            v_user_id := gen_random_uuid();
            v_counter := (SELECT COUNT(*) + 1 FROM users WHERE tenant_id = v_tenant_id AND email LIKE 'doctor%');
            
            INSERT INTO users (
                id, tenant_id, email, user_name, normalized_email, normalized_user_name,
                "FirstName", "LastName", "UserType", "UserStatus", "MustChangePasswordOnLogin",
                phone_number, "DateOfBirth", "Gender", "Qualifications", "Specialization",
                "Designation", "LicenseNumber", "ProfessionalRegistrationDate", "EmployeeId",
                "OrganizationId", "BranchId",
                "CreatedAt", "UpdatedAt", "LastLoginAt",
                email_confirmed, phone_number_confirmed, two_factor_enabled, lockout_enabled,
                access_failed_count, concurrency_stamp, security_stamp, password_hash
            ) VALUES (
                v_user_id,
                v_tenant_id,
                'doctor' || v_counter || '@hospital.com',
                'doctor' || v_counter || '@hospital.com',
                'DOCTOR' || v_counter || '@HOSPITAL.COM',
                'DOCTOR' || v_counter || '@HOSPITAL.COM',
                'Dr. ' || v_first_names[1 + floor(random() * array_length(v_first_names, 1))::int],
                v_last_names[1 + floor(random() * array_length(v_last_names, 1))::int],
                'Staff',
                'active',
                false,
                '+91' || (9000000000 + floor(random() * 999999999))::bigint,
                (NOW() - ((25 + floor(random() * 20)) || ' years')::interval)::date,
                CASE WHEN random() > 0.5 THEN 'Male' ELSE 'Female' END,
                'MBBS, MD',
                v_specializations[1 + floor(random() * array_length(v_specializations, 1))::int],
                CASE 
                    WHEN i = 1 THEN 'Senior Consultant'
                    WHEN i = 2 THEN 'Consultant'
                    ELSE 'Assistant Consultant'
                END,
                'MCI-' || lpad(floor(random() * 99999)::text, 5, '0'),
                (NOW() - ((5 + floor(random() * 15)) || ' years')::interval)::date,
                'DOC-' || lpad(v_counter::text, 4, '0'),
                v_org_id,
                v_branch_record.id,
                NOW() - (floor(random() * 365) || ' days')::interval,
                NOW(),
                NOW() - (floor(random() * 7) || ' days')::interval,
                true,
                true,
                false,
                false,
                0,
                gen_random_uuid()::text,
                gen_random_uuid()::text,
                '$2a$11$XdH9VQH8yh5lXqLqJZGQY.nKQn8lXSQzG9fXZkJ9XdH9VQH8yh5lX' -- bcrypt hash for "Doctor@123"
            )
            ON CONFLICT (normalized_user_name) DO NOTHING;
            
            -- Get the actual user_id (handles both new and existing users)
            SELECT id INTO v_user_id FROM users WHERE email = 'doctor' || v_counter || '@hospital.com' LIMIT 1;
            
            -- Assign role
            IF v_user_id IS NOT NULL THEN
                INSERT INTO app_user_roles (user_id, role_id, branch_id, "AssignedAt", "AssignedBy", "IsActive")
                VALUES (v_user_id, v_doctor_role_id, v_branch_record.id, NOW(), v_admin_user_id, true)
                ON CONFLICT DO NOTHING;
            END IF;
            
            -- Assign to 2-3 departments
            FOR v_dept_record IN (
                SELECT id FROM department 
                WHERE tenant_id = v_tenant_id AND deleted_at IS NULL 
                ORDER BY random() 
                LIMIT (2 + floor(random() * 2))::int
            ) LOOP
                INSERT INTO user_department_access (
                    id, user_id, department_id, role_id, tenant_id,
                    is_primary, access_type, status,
                    effective_from, granted_at, granted_by_user_id,
                    created_at, created_by_user_id, updated_at
                ) VALUES (
                    gen_random_uuid(),
                    v_user_id,
                    v_dept_record.id,
                    v_doctor_role_id,
                    v_tenant_id,
                    true,
                    'full',
                    'active',
                    NOW(),
                    NOW(),
                    v_admin_user_id,
                    NOW(),
                    v_admin_user_id,
                    NOW()
                ) ON CONFLICT DO NOTHING;
            END LOOP;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'âœ“ Created doctors across all branches';
    
    -- ====================
    -- CREATE NURSES (5 per branch)
    -- ====================
    FOR v_branch_record IN (
        SELECT id, name FROM branch WHERE tenant_id = v_tenant_id AND deleted_at IS NULL ORDER BY created_at
    ) LOOP
        FOR i IN 1..5 LOOP
            v_user_id := gen_random_uuid();
            v_counter := (SELECT COUNT(*) + 1 FROM users WHERE tenant_id = v_tenant_id AND email LIKE 'nurse%');
            
            INSERT INTO users (
                id, tenant_id, email, user_name, normalized_email, normalized_user_name,
                "FirstName", "LastName", "UserType", "UserStatus", "MustChangePasswordOnLogin",
                phone_number, "DateOfBirth", "Gender", "Qualifications",
                "Designation", "LicenseNumber", "EmployeeId",
                "OrganizationId", "BranchId",
                "CreatedAt", "UpdatedAt", "LastLoginAt",
                email_confirmed, phone_number_confirmed, two_factor_enabled, lockout_enabled,
                access_failed_count, concurrency_stamp, security_stamp, password_hash
            ) VALUES (
                v_user_id,
                v_tenant_id,
                'nurse' || v_counter || '@hospital.com',
                'nurse' || v_counter || '@hospital.com',
                'NURSE' || v_counter || '@HOSPITAL.COM',
                'NURSE' || v_counter || '@HOSPITAL.COM',
                v_first_names[1 + floor(random() * array_length(v_first_names, 1))::int],
                v_last_names[1 + floor(random() * array_length(v_last_names, 1))::int],
                'Staff',
                'active',
                false,
                '+91' || (8000000000 + floor(random() * 999999999))::bigint,
                (NOW() - ((23 + floor(random() * 15)) || ' years')::interval)::date,
                CASE WHEN random() > 0.3 THEN 'Female' ELSE 'Male' END,
                'B.Sc Nursing, GNM',
                CASE 
                    WHEN i <= 2 THEN 'Staff Nurse'
                    WHEN i <= 4 THEN 'Junior Nurse'
                    ELSE 'Trainee Nurse'
                END,
                'INC-' || lpad(floor(random() * 99999)::text, 5, '0'),
                'NUR-' || lpad(v_counter::text, 4, '0'),
                v_org_id,
                v_branch_record.id,
                NOW() - (floor(random() * 365) || ' days')::interval,
                NOW(),
                NOW() - (floor(random() * 3) || ' days')::interval,
                true,
                true,
                false,
                false,
                0,
                gen_random_uuid()::text,
                gen_random_uuid()::text,
                '$2a$11$YdH9VQH8yh5lXqLqJZGQY.nKQn8lXSQzG9fXZkJ9XdH9VQH8yh5lY' -- bcrypt hash for "Nurse@123"
            )
            ON CONFLICT (normalized_user_name) DO NOTHING;
            
            -- Get the actual user_id
            SELECT id INTO v_user_id FROM users WHERE email = 'nurse' || v_counter || '@hospital.com' LIMIT 1;
            
            -- Assign role
            IF v_user_id IS NOT NULL THEN
                INSERT INTO app_user_roles (user_id, role_id, branch_id, "AssignedAt", "AssignedBy", "IsActive")
                VALUES (v_user_id, v_nurse_role_id, v_branch_record.id, NOW(), v_admin_user_id, true)
                ON CONFLICT DO NOTHING;
            END IF;
            
            -- Assign to departments
            FOR v_dept_record IN (
                SELECT id FROM department 
                WHERE tenant_id = v_tenant_id AND deleted_at IS NULL 
                ORDER BY random() 
                LIMIT (1 + floor(random() * 2))::int
            ) LOOP
                INSERT INTO user_department_access (
                    id, user_id, department_id, role_id, tenant_id,
                    is_primary, access_type, status,
                    effective_from, granted_at, granted_by_user_id,
                    created_at, created_by_user_id, updated_at
                ) VALUES (
                    gen_random_uuid(), v_user_id, v_dept_record.id, v_nurse_role_id, v_tenant_id,
                    true, 'full', 'active',
                    NOW(), NOW(), v_admin_user_id, NOW(), v_admin_user_id, NOW()
                ) ON CONFLICT DO NOTHING;
            END LOOP;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'âœ“ Created nurses across all branches';
    
    -- ====================
    -- CREATE RECEPTIONISTS (2 per branch)
    -- ====================
    FOR v_branch_record IN (
        SELECT id, name FROM branch WHERE tenant_id = v_tenant_id AND deleted_at IS NULL ORDER BY created_at
    ) LOOP
        FOR i IN 1..2 LOOP
            v_user_id := gen_random_uuid();
            v_counter := (SELECT COUNT(*) + 1 FROM users WHERE tenant_id = v_tenant_id AND email LIKE 'receptionist%');
            
            INSERT INTO users (
                id, tenant_id, email, user_name, normalized_email, normalized_user_name,
                "FirstName", "LastName", "UserType", "UserStatus", "MustChangePasswordOnLogin",
                phone_number, "DateOfBirth", "Gender", "Qualifications", "Designation", "EmployeeId",
                "OrganizationId", "BranchId",
                "CreatedAt", "UpdatedAt", "LastLoginAt",
                email_confirmed, phone_number_confirmed, two_factor_enabled, lockout_enabled,
                access_failed_count, concurrency_stamp, security_stamp, password_hash
            ) VALUES (
                v_user_id, v_tenant_id,
                'receptionist' || v_counter || '@hospital.com',
                'receptionist' || v_counter || '@hospital.com',
                'RECEPTIONIST' || v_counter || '@HOSPITAL.COM',
                'RECEPTIONIST' || v_counter || '@HOSPITAL.COM',
                v_first_names[1 + floor(random() * array_length(v_first_names, 1))::int],
                v_last_names[1 + floor(random() * array_length(v_last_names, 1))::int],
                'Staff', 'active', false,
                '+91' || (7000000000 + floor(random() * 999999999))::bigint,
                (NOW() - ((22 + floor(random() * 10)) || ' years')::interval)::date,
                CASE WHEN random() > 0.5 THEN 'Female' ELSE 'Male' END,
                'B.Com, Diploma in Hospital Administration',
                CASE WHEN i = 1 THEN 'Senior Receptionist' ELSE 'Receptionist' END,
                'REC-' || lpad(v_counter::text, 4, '0'),
                v_org_id, v_branch_record.id,
                NOW() - (floor(random() * 180) || ' days')::interval, NOW(),
                NOW() - (floor(random() * 2) || ' days')::interval,
                true, true, false, false, 0,
                gen_random_uuid()::text, gen_random_uuid()::text,
                '$2a$11$ZdH9VQH8yh5lXqLqJZGQY.nKQn8lXSQzG9fXZkJ9XdH9VQH8yh5lZ'
            )
            ON CONFLICT (normalized_user_name) DO NOTHING;
            
            -- Get the actual user_id
            SELECT id INTO v_user_id FROM users WHERE email = 'receptionist' || v_counter || '@hospital.com' LIMIT 1;
            
            IF v_user_id IS NOT NULL THEN
                INSERT INTO app_user_roles (user_id, role_id, branch_id, "AssignedAt", "AssignedBy", "IsActive")
                VALUES (v_user_id, v_receptionist_role_id, v_branch_record.id, NOW(), v_admin_user_id, true)
                ON CONFLICT DO NOTHING;
            END IF;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'âœ“ Created receptionists across all branches';
    
    -- ====================
    -- CREATE LAB TECHNICIANS (2 per branch)
    -- ====================
    IF v_lab_tech_role_id IS NOT NULL THEN
        FOR v_branch_record IN (
            SELECT id, name FROM branch WHERE tenant_id = v_tenant_id AND deleted_at IS NULL ORDER BY created_at
        ) LOOP
            FOR i IN 1..2 LOOP
                v_user_id := gen_random_uuid();
                v_counter := (SELECT COUNT(*) + 1 FROM users WHERE tenant_id = v_tenant_id AND email LIKE 'labtech%');
                
                INSERT INTO users (
                    id, tenant_id, email, user_name, normalized_email, normalized_user_name,
                    "FirstName", "LastName", "UserType", "UserStatus", "MustChangePasswordOnLogin",
                    phone_number, "DateOfBirth", "Gender", "Qualifications", "Designation", "EmployeeId",
                    "OrganizationId", "BranchId",
                    "CreatedAt", "UpdatedAt", email_confirmed, phone_number_confirmed,
                    two_factor_enabled, lockout_enabled, access_failed_count,
                    concurrency_stamp, security_stamp, password_hash
                ) VALUES (
                    v_user_id, v_tenant_id,
                    'labtech' || v_counter || '@hospital.com',
                    'labtech' || v_counter || '@hospital.com',
                    'LABTECH' || v_counter || '@HOSPITAL.COM',
                    'LABTECH' || v_counter || '@HOSPITAL.COM',
                    v_first_names[1 + floor(random() * array_length(v_first_names, 1))::int],
                    v_last_names[1 + floor(random() * array_length(v_last_names, 1))::int],
                    'Staff', 'active', false,
                    '+91' || (6000000000 + floor(random() * 999999999))::bigint,
                    (NOW() - ((24 + floor(random() * 12)) || ' years')::interval)::date,
                    CASE WHEN random() > 0.5 THEN 'Male' ELSE 'Female' END,
                    'B.Sc Medical Lab Technology',
                    'Lab Technician',
                    'LAB-' || lpad(v_counter::text, 4, '0'),
                    v_org_id, v_branch_record.id,
                    NOW() - (floor(random() * 200) || ' days')::interval, NOW(),
                    true, true, false, false, 0,
                    gen_random_uuid()::text, gen_random_uuid()::text,
                    '$2a$11$AdH9VQH8yh5lXqLqJZGQY.nKQn8lXSQzG9fXZkJ9XdH9VQH8yh5lA'
                )
                ON CONFLICT (normalized_user_name) DO NOTHING;
                
                -- Get the actual user_id
                SELECT id INTO v_user_id FROM users WHERE email = 'labtech' || v_counter || '@hospital.com' LIMIT 1;
                
                IF v_user_id IS NOT NULL THEN
                    INSERT INTO app_user_roles (user_id, role_id, branch_id, "AssignedAt", "AssignedBy", "IsActive")
                    VALUES (v_user_id, v_lab_tech_role_id, v_branch_record.id, NOW(), v_admin_user_id, true)
                    ON CONFLICT DO NOTHING;
                END IF;
            END LOOP;
        END LOOP;
        RAISE NOTICE 'âœ“ Created lab technicians across all branches';
    END IF;
    
    -- ====================
    -- CREATE PHARMACISTS (2 per branch)
    -- ====================
    IF v_pharmacist_role_id IS NOT NULL THEN
        FOR v_branch_record IN (
            SELECT id, name FROM branch WHERE tenant_id = v_tenant_id AND deleted_at IS NULL ORDER BY created_at
        ) LOOP
            FOR i IN 1..2 LOOP
                v_user_id := gen_random_uuid();
                v_counter := (SELECT COUNT(*) + 1 FROM users WHERE tenant_id = v_tenant_id AND email LIKE 'pharmacist%');
                
                INSERT INTO users (
                    id, tenant_id, email, user_name, normalized_email, normalized_user_name,
                    "FirstName", "LastName", "UserType", "UserStatus", "MustChangePasswordOnLogin",
                    phone_number, "DateOfBirth", "Gender", "Qualifications", "Designation",
                    "LicenseNumber", "EmployeeId",
                    "OrganizationId", "BranchId",
                    "CreatedAt", "UpdatedAt", email_confirmed, phone_number_confirmed,
                    two_factor_enabled, lockout_enabled, access_failed_count,
                    concurrency_stamp, security_stamp, password_hash
                ) VALUES (
                    v_user_id, v_tenant_id,
                    'pharmacist' || v_counter || '@hospital.com',
                    'pharmacist' || v_counter || '@hospital.com',
                    'PHARMACIST' || v_counter || '@HOSPITAL.COM',
                    'PHARMACIST' || v_counter || '@HOSPITAL.COM',
                    v_first_names[1 + floor(random() * array_length(v_first_names, 1))::int],
                    v_last_names[1 + floor(random() * array_length(v_last_names, 1))::int],
                    'Staff', 'active', false,
                    '+91' || (5000000000 + floor(random() * 999999999))::bigint,
                    (NOW() - ((25 + floor(random() * 10)) || ' years')::interval)::date,
                    CASE WHEN random() > 0.5 THEN 'Male' ELSE 'Female' END,
                    'B.Pharm, M.Pharm',
                    CASE WHEN i = 1 THEN 'Chief Pharmacist' ELSE 'Pharmacist' END,
                    'PCI-' || lpad(floor(random() * 99999)::text, 5, '0'),
                    'PHR-' || lpad(v_counter::text, 4, '0'),
                    v_org_id, v_branch_record.id,
                    NOW() - (floor(random() * 250) || ' days')::interval, NOW(),
                    true, true, false, false, 0,
                    gen_random_uuid()::text, gen_random_uuid()::text,
                    '$2a$11$BdH9VQH8yh5lXqLqJZGQY.nKQn8lXSQzG9fXZkJ9XdH9VQH8yh5lB'
                )
                ON CONFLICT (normalized_user_name) DO NOTHING;
                
                -- Get the actual user_id
                SELECT id INTO v_user_id FROM users WHERE email = 'pharmacist' || v_counter || '@hospital.com' LIMIT 1;
                
                IF v_user_id IS NOT NULL THEN
                    INSERT INTO app_user_roles (user_id, role_id, branch_id, "AssignedAt", "AssignedBy", "IsActive")
                    VALUES (v_user_id, v_pharmacist_role_id, v_branch_record.id, NOW(), v_admin_user_id, true)
                    ON CONFLICT DO NOTHING;
                END IF;
            END LOOP;
        END LOOP;
        RAISE NOTICE 'âœ“ Created pharmacists across all branches';
    END IF;
    
    -- ====================
    -- CREATE COUNSELLORS (1 per branch)
    -- ====================
    IF v_counsellor_role_id IS NOT NULL THEN
        FOR v_branch_record IN (
            SELECT id, name FROM branch WHERE tenant_id = v_tenant_id AND deleted_at IS NULL ORDER BY created_at
        ) LOOP
            v_user_id := gen_random_uuid();
            v_counter := (SELECT COUNT(*) + 1 FROM users WHERE tenant_id = v_tenant_id AND email LIKE 'counsellor%');
            
            INSERT INTO users (
                id, tenant_id, email, user_name, normalized_email, normalized_user_name,
                "FirstName", "LastName", "UserType", "UserStatus", "MustChangePasswordOnLogin",
                phone_number, "DateOfBirth", "Gender", "Qualifications", "Designation", "EmployeeId",
                "OrganizationId", "BranchId",
                "CreatedAt", "UpdatedAt", email_confirmed, phone_number_confirmed,
                two_factor_enabled, lockout_enabled, access_failed_count,
                concurrency_stamp, security_stamp, password_hash
            ) VALUES (
                v_user_id, v_tenant_id,
                'counsellor' || v_counter || '@hospital.com',
                'counsellor' || v_counter || '@hospital.com',
                'COUNSELLOR' || v_counter || '@HOSPITAL.COM',
                'COUNSELLOR' || v_counter || '@HOSPITAL.COM',
                v_first_names[1 + floor(random() * array_length(v_first_names, 1))::int],
                v_last_names[1 + floor(random() * array_length(v_last_names, 1))::int],
                'Staff', 'active', false,
                '+91' || (4000000000 + floor(random() * 999999999))::bigint,
                (NOW() - ((28 + floor(random() * 8)) || ' years')::interval)::date,
                CASE WHEN random() > 0.3 THEN 'Female' ELSE 'Male' END,
                'M.A Psychology, Certified Counsellor',
                'Patient Counsellor',
                'COU-' || lpad(v_counter::text, 4, '0'),
                v_org_id, v_branch_record.id,
                NOW() - (floor(random() * 150) || ' days')::interval, NOW(),
                true, true, false, false, 0,
                gen_random_uuid()::text, gen_random_uuid()::text,
                '$2a$11$CdH9VQH8yh5lXqLqJZGQY.nKQn8lXSQzG9fXZkJ9XdH9VQH8yh5lC'
            )
            ON CONFLICT (normalized_user_name) DO NOTHING;
            
            -- Get the actual user_id
            SELECT id INTO v_user_id FROM users WHERE email = 'counsellor' || v_counter || '@hospital.com' LIMIT 1;
            
            IF v_user_id IS NOT NULL THEN
                INSERT INTO app_user_roles (user_id, role_id, branch_id, "AssignedAt", "AssignedBy", "IsActive")
                VALUES (v_user_id, v_counsellor_role_id, v_branch_record.id, NOW(), v_admin_user_id, true)
                ON CONFLICT DO NOTHING;
            END IF;
        END LOOP;
        RAISE NOTICE 'âœ“ Created counsellors across all branches';
    END IF;
    
    RAISE NOTICE '=== User seeding completed successfully! ===';
END $$;

-- Display statistics
SELECT '=== USER STATISTICS ===' as info;

SELECT 'Total Users' as metric, COUNT(*) as count 
FROM users WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e';

SELECT ar.name as role_name, COUNT(DISTINCT aur.user_id) as user_count 
FROM app_user_roles aur 
JOIN app_roles ar ON ar.id = aur.role_id 
WHERE ar.tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
GROUP BY ar.name 
ORDER BY user_count DESC;

SELECT u."UserStatus" as status, COUNT(*) as count 
FROM users u 
WHERE u.tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e' 
GROUP BY u."UserStatus" 
ORDER BY count DESC;

SELECT b.name as branch_name, COUNT(DISTINCT u.id) as user_count
FROM branch b
LEFT JOIN users u ON u."BranchId" = b.id
WHERE b.tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e' AND b.deleted_at IS NULL
GROUP BY b.name
ORDER BY user_count DESC;

-- Show sample users
SELECT 
    u.email,
    u."FirstName" || ' ' || u."LastName" as name,
    ar.name as role,
    b.name as branch,
    u."Designation",
    u."EmployeeId",
    u."UserStatus"
FROM users u
LEFT JOIN app_user_roles aur ON aur.user_id = u.id
LEFT JOIN app_roles ar ON ar.id = aur.role_id
LEFT JOIN branch b ON b.id = u."BranchId"
WHERE u.tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
ORDER BY ar.name, u."FirstName"
LIMIT 30;



