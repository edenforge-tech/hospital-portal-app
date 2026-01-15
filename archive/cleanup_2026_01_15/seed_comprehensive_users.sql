-- =====================================================
-- Comprehensive User Seeding Script
-- Creates users for all roles across departments and branches
-- =====================================================

-- Get tenant ID
DO $$
DECLARE
    v_tenant_id UUID := '11111111-1111-1111-1111-111111111111';
    v_admin_role_id UUID;
    v_doctor_role_id UUID;
    v_nurse_role_id UUID;
    v_receptionist_role_id UUID;
    v_lab_tech_role_id UUID;
    v_pharmacist_role_id UUID;
    v_dept_head_role_id UUID;
    v_it_admin_role_id UUID;
    v_accountant_role_id UUID;
    
    v_user_id UUID;
    v_dept_record RECORD;
    v_branch_record RECORD;
    v_counter INT := 0;
BEGIN
    -- Get or create roles
    SELECT id INTO v_admin_role_id FROM app_roles WHERE name = 'Admin' LIMIT 1;
    SELECT id INTO v_doctor_role_id FROM app_roles WHERE name = 'Doctor' LIMIT 1;
    SELECT id INTO v_nurse_role_id FROM app_roles WHERE name = 'Nurse' LIMIT 1;
    SELECT id INTO v_receptionist_role_id FROM app_roles WHERE name = 'Receptionist' LIMIT 1;
    SELECT id INTO v_lab_tech_role_id FROM app_roles WHERE name = 'Lab Technician' LIMIT 1;
    SELECT id INTO v_pharmacist_role_id FROM app_roles WHERE name = 'Pharmacist' LIMIT 1;
    SELECT id INTO v_dept_head_role_id FROM app_roles WHERE name = 'Department Head' LIMIT 1;
    SELECT id INTO v_it_admin_role_id FROM app_roles WHERE name = 'IT Admin' LIMIT 1;
    SELECT id INTO v_accountant_role_id FROM app_roles WHERE name = 'Accountant' LIMIT 1;

    -- Create roles if they don't exist
    IF v_doctor_role_id IS NULL THEN
        v_doctor_role_id := gen_random_uuid();
        INSERT INTO app_roles (id, name, description, normalized_name, tenant_id, created_at)
        VALUES (v_doctor_role_id, 'Doctor', 'Medical Doctor', 'DOCTOR', v_tenant_id, NOW());
    END IF;

    IF v_nurse_role_id IS NULL THEN
        v_nurse_role_id := gen_random_uuid();
        INSERT INTO app_roles (id, name, description, normalized_name, tenant_id, created_at)
        VALUES (v_nurse_role_id, 'Nurse', 'Nursing Staff', 'NURSE', v_tenant_id, NOW());
    END IF;

    IF v_receptionist_role_id IS NULL THEN
        v_receptionist_role_id := gen_random_uuid();
        INSERT INTO app_roles (id, name, description, normalized_name, tenant_id, created_at)
        VALUES (v_receptionist_role_id, 'Receptionist', 'Front Desk Staff', 'RECEPTIONIST', v_tenant_id, NOW());
    END IF;

    IF v_lab_tech_role_id IS NULL THEN
        v_lab_tech_role_id := gen_random_uuid();
        INSERT INTO app_roles (id, name, description, normalized_name, tenant_id, created_at)
        VALUES (v_lab_tech_role_id, 'Lab Technician', 'Laboratory Technician', 'LAB TECHNICIAN', v_tenant_id, NOW());
    END IF;

    IF v_pharmacist_role_id IS NULL THEN
        v_pharmacist_role_id := gen_random_uuid();
        INSERT INTO app_roles (id, name, description, normalized_name, tenant_id, created_at)
        VALUES (v_pharmacist_role_id, 'Pharmacist', 'Pharmacy Staff', 'PHARMACIST', v_tenant_id, NOW());
    END IF;

    IF v_dept_head_role_id IS NULL THEN
        v_dept_head_role_id := gen_random_uuid();
        INSERT INTO app_roles (id, name, description, normalized_name, tenant_id, created_at)
        VALUES (v_dept_head_role_id, 'Department Head', 'Department Head', 'DEPARTMENT HEAD', v_tenant_id, NOW());
    END IF;

    IF v_it_admin_role_id IS NULL THEN
        v_it_admin_role_id := gen_random_uuid();
        INSERT INTO app_roles (id, name, description, normalized_name, tenant_id, created_at)
        VALUES (v_it_admin_role_id, 'IT Admin', 'IT Administrator', 'IT ADMIN', v_tenant_id, NOW());
    END IF;

    IF v_accountant_role_id IS NULL THEN
        v_accountant_role_id := gen_random_uuid();
        INSERT INTO app_roles (id, name, description, normalized_name, tenant_id, created_at)
        VALUES (v_accountant_role_id, 'Accountant', 'Finance Staff', 'ACCOUNTANT', v_tenant_id, NOW());
    END IF;

    -- Create users for Clinical Departments (Doctors and Nurses)
    FOR v_dept_record IN (
        SELECT id, name, department_code FROM department 
        WHERE tenant_id = v_tenant_id 
        AND department_code IN ('OPD-GEN', 'OPD-PEDIA', 'OPD-ORTHO', 'OPD-ENT', 'OPD-DERM', 
                                'CATARACT', 'GLAUCOMA', 'RETINA', 'CORNEA', 'PEDIATRIC-OPH')
        AND deleted_at IS NULL
        LIMIT 15
    ) LOOP
        -- Create 2 doctors per department
        FOR i IN 1..2 LOOP
            v_counter := v_counter + 1;
            v_user_id := gen_random_uuid();
            
            INSERT INTO users (
                id, tenant_id, email, "UserName", "NormalizedEmail", "NormalizedUserName",
                first_name, last_name, "UserStatus", "PhoneNumber", created_at, updated_at,
                "EmailConfirmed", "PhoneNumberConfirmed", "TwoFactorEnabled", "LockoutEnabled",
                "AccessFailedCount", "ConcurrencyStamp", "SecurityStamp", "PasswordHash"
            ) VALUES (
                v_user_id, v_tenant_id,
                'doctor' || v_counter || '@hospital.com',
                'doctor' || v_counter || '@hospital.com',
                'DOCTOR' || v_counter || '@HOSPITAL.COM',
                'DOCTOR' || v_counter || '@HOSPITAL.COM',
                'Dr. ' || (ARRAY['James', 'Sarah', 'Michael', 'Emily', 'David', 'Lisa', 'Robert', 'Jennifer'])[floor(random() * 8 + 1)],
                (ARRAY['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'])[floor(random() * 8 + 1)],
                'active',
                '+1' || lpad(floor(random() * 9999999999)::text, 10, '0'),
                NOW() - (random() * 90 || ' days')::interval,
                NOW(),
                true, true, false, false, 0,
                gen_random_uuid()::text,
                gen_random_uuid()::text,
                'AQAAAAIAAYagAAAAEDummyHashForSeedUser' || v_counter
            );

            -- Assign doctor role
            INSERT INTO app_user_roles (user_id, role_id)
            VALUES (v_user_id, v_doctor_role_id)
            ON CONFLICT DO NOTHING;

            -- Assign to primary department
            INSERT INTO user_departments (user_id, department_id, is_primary, tenant_id, created_at)
            VALUES (v_user_id, v_dept_record.id, true, v_tenant_id, NOW())
            ON CONFLICT DO NOTHING;
        END LOOP;

        -- Create 3 nurses per department
        FOR i IN 1..3 LOOP
            v_counter := v_counter + 1;
            v_user_id := gen_random_uuid();
            
            INSERT INTO users (
                id, tenant_id, email, "UserName", "NormalizedEmail", "NormalizedUserName",
                first_name, last_name, "UserStatus", "PhoneNumber", created_at, updated_at,
                "EmailConfirmed", "PhoneNumberConfirmed", "TwoFactorEnabled", "LockoutEnabled",
                "AccessFailedCount", "ConcurrencyStamp", "SecurityStamp", "PasswordHash"
            ) VALUES (
                v_user_id, v_tenant_id,
                'nurse' || v_counter || '@hospital.com',
                'nurse' || v_counter || '@hospital.com',
                'NURSE' || v_counter || '@HOSPITAL.COM',
                'NURSE' || v_counter || '@HOSPITAL.COM',
                (ARRAY['Mary', 'Patricia', 'Linda', 'Barbara', 'Elizabeth', 'Jessica', 'Nancy', 'Karen'])[floor(random() * 8 + 1)],
                (ARRAY['Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson'])[floor(random() * 8 + 1)],
                'active',
                '+1' || lpad(floor(random() * 9999999999)::text, 10, '0'),
                NOW() - (random() * 90 || ' days')::interval,
                NOW(),
                true, true, false, false, 0,
                gen_random_uuid()::text,
                gen_random_uuid()::text,
                'AQAAAAIAAYagAAAAEDummyHashForSeedUser' || v_counter
            );

            -- Assign nurse role
            INSERT INTO app_user_roles (user_id, role_id)
            VALUES (v_user_id, v_nurse_role_id)
            ON CONFLICT DO NOTHING;

            -- Assign to primary department
            INSERT INTO user_departments (user_id, department_id, is_primary, tenant_id, created_at)
            VALUES (v_user_id, v_dept_record.id, true, v_tenant_id, NOW())
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;

    -- Create Lab Technicians
    FOR v_dept_record IN (
        SELECT id, name FROM department 
        WHERE tenant_id = v_tenant_id 
        AND department_code LIKE 'LAB%'
        AND deleted_at IS NULL
        LIMIT 5
    ) LOOP
        FOR i IN 1..2 LOOP
            v_counter := v_counter + 1;
            v_user_id := gen_random_uuid();
            
            INSERT INTO users (
                id, tenant_id, email, "UserName", "NormalizedEmail", "NormalizedUserName",
                first_name, last_name, "UserStatus", "PhoneNumber", created_at, updated_at,
                "EmailConfirmed", "PhoneNumberConfirmed", "TwoFactorEnabled", "LockoutEnabled",
                "AccessFailedCount", "ConcurrencyStamp", "SecurityStamp", "PasswordHash"
            ) VALUES (
                v_user_id, v_tenant_id,
                'labtech' || v_counter || '@hospital.com',
                'labtech' || v_counter || '@hospital.com',
                'LABTECH' || v_counter || '@HOSPITAL.COM',
                'LABTECH' || v_counter || '@HOSPITAL.COM',
                (ARRAY['John', 'William', 'Richard', 'Charles', 'Thomas', 'Daniel', 'Matthew', 'Anthony'])[floor(random() * 8 + 1)],
                (ARRAY['Moore', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright'])[floor(random() * 8 + 1)],
                'active',
                '+1' || lpad(floor(random() * 9999999999)::text, 10, '0'),
                NOW() - (random() * 90 || ' days')::interval,
                NOW(),
                true, true, false, false, 0,
                gen_random_uuid()::text,
                gen_random_uuid()::text,
                'AQAAAAIAAYagAAAAEDummyHashForSeedUser' || v_counter
            );

            INSERT INTO app_user_roles (user_id, role_id)
            VALUES (v_user_id, v_lab_tech_role_id)
            ON CONFLICT DO NOTHING;

            INSERT INTO user_departments (user_id, department_id, is_primary, tenant_id, created_at)
            VALUES (v_user_id, v_dept_record.id, true, v_tenant_id, NOW())
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;

    -- Create Pharmacists
    FOR v_dept_record IN (
        SELECT id, name FROM department 
        WHERE tenant_id = v_tenant_id 
        AND department_code LIKE 'PHARM%'
        AND deleted_at IS NULL
        LIMIT 3
    ) LOOP
        FOR i IN 1..2 LOOP
            v_counter := v_counter + 1;
            v_user_id := gen_random_uuid();
            
            INSERT INTO users (
                id, tenant_id, email, "UserName", "NormalizedEmail", "NormalizedUserName",
                first_name, last_name, "UserStatus", "PhoneNumber", created_at, updated_at,
                "EmailConfirmed", "PhoneNumberConfirmed", "TwoFactorEnabled", "LockoutEnabled",
                "AccessFailedCount", "ConcurrencyStamp", "SecurityStamp", "PasswordHash"
            ) VALUES (
                v_user_id, v_tenant_id,
                'pharmacist' || v_counter || '@hospital.com',
                'pharmacist' || v_counter || '@hospital.com',
                'PHARMACIST' || v_counter || '@HOSPITAL.COM',
                'PHARMACIST' || v_counter || '@HOSPITAL.COM',
                (ARRAY['Susan', 'Margaret', 'Dorothy', 'Angela', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca'])[floor(random() * 8 + 1)],
                (ARRAY['Lopez', 'Hill', 'Scott', 'Green', 'Adams', 'Baker', 'Nelson', 'Carter'])[floor(random() * 8 + 1)],
                'active',
                '+1' || lpad(floor(random() * 9999999999)::text, 10, '0'),
                NOW() - (random() * 90 || ' days')::interval,
                NOW(),
                true, true, false, false, 0,
                gen_random_uuid()::text,
                gen_random_uuid()::text,
                'AQAAAAIAAYagAAAAEDummyHashForSeedUser' || v_counter
            );

            INSERT INTO app_user_roles (user_id, role_id)
            VALUES (v_user_id, v_pharmacist_role_id)
            ON CONFLICT DO NOTHING;

            INSERT INTO user_departments (user_id, department_id, is_primary, tenant_id, created_at)
            VALUES (v_user_id, v_dept_record.id, true, v_tenant_id, NOW())
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;

    -- Create Receptionists (5 total)
    FOR i IN 1..5 LOOP
        v_counter := v_counter + 1;
        v_user_id := gen_random_uuid();
        
        INSERT INTO users (
            id, tenant_id, email, "UserName", "NormalizedEmail", "NormalizedUserName",
            first_name, last_name, "UserStatus", "PhoneNumber", created_at, updated_at,
            "EmailConfirmed", "PhoneNumberConfirmed", "TwoFactorEnabled", "LockoutEnabled",
            "AccessFailedCount", "ConcurrencyStamp", "SecurityStamp", "PasswordHash"
        ) VALUES (
            v_user_id, v_tenant_id,
            'receptionist' || i || '@hospital.com',
            'receptionist' || i || '@hospital.com',
            'RECEPTIONIST' || i || '@HOSPITAL.COM',
            'RECEPTIONIST' || i || '@HOSPITAL.COM',
            (ARRAY['Amanda', 'Stephanie', 'Nicole', 'Heather', 'Kimberly', 'Michelle', 'Melissa', 'Amy'])[floor(random() * 8 + 1)],
            (ARRAY['Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans'])[floor(random() * 8 + 1)],
            'active',
            '+1' || lpad(floor(random() * 9999999999)::text, 10, '0'),
            NOW() - (random() * 90 || ' days')::interval,
            NOW(),
            true, true, false, false, 0,
            gen_random_uuid()::text,
            gen_random_uuid()::text,
            'AQAAAAIAAYagAAAAEDummyHashForSeedUser' || v_counter
        );

        INSERT INTO app_user_roles (user_id, role_id)
        VALUES (v_user_id, v_receptionist_role_id)
        ON CONFLICT DO NOTHING;
    END LOOP;

    -- Create Department Heads (10 total)
    FOR v_dept_record IN (
        SELECT id, name FROM department 
        WHERE tenant_id = v_tenant_id 
        AND parent_department_id IS NULL
        AND deleted_at IS NULL
        LIMIT 10
    ) LOOP
        v_counter := v_counter + 1;
        v_user_id := gen_random_uuid();
        
        INSERT INTO users (
            id, tenant_id, email, "UserName", "NormalizedEmail", "NormalizedUserName",
            first_name, last_name, "UserStatus", "PhoneNumber", created_at, updated_at,
            "EmailConfirmed", "PhoneNumberConfirmed", "TwoFactorEnabled", "LockoutEnabled",
            "AccessFailedCount", "ConcurrencyStamp", "SecurityStamp", "PasswordHash"
        ) VALUES (
            v_user_id, v_tenant_id,
            'depthead' || v_counter || '@hospital.com',
            'depthead' || v_counter || '@hospital.com',
            'DEPTHEAD' || v_counter || '@HOSPITAL.COM',
            'DEPTHEAD' || v_counter || '@HOSPITAL.COM',
            'Dr. ' || (ARRAY['Christopher', 'Daniel', 'Matthew', 'Joshua', 'Andrew', 'Joseph', 'Ryan', 'Kevin'])[floor(random() * 8 + 1)],
            (ARRAY['Collins', 'Stewart', 'Morris', 'Rogers', 'Reed', 'Cook', 'Morgan', 'Bell'])[floor(random() * 8 + 1)],
            'active',
            '+1' || lpad(floor(random() * 9999999999)::text, 10, '0'),
            NOW() - (random() * 90 || ' days')::interval,
            NOW(),
            true, true, false, false, 0,
            gen_random_uuid()::text,
            gen_random_uuid()::text,
            'AQAAAAIAAYagAAAAEDummyHashForSeedUser' || v_counter
        );

        INSERT INTO app_user_roles (user_id, role_id)
        VALUES (v_user_id, v_dept_head_role_id)
        ON CONFLICT DO NOTHING;

        INSERT INTO user_departments (user_id, department_id, is_primary, tenant_id, created_at)
        VALUES (v_user_id, v_dept_record.id, true, v_tenant_id, NOW())
        ON CONFLICT DO NOTHING;
    END LOOP;

    -- Create some inactive users (5 total)
    FOR i IN 1..5 LOOP
        v_counter := v_counter + 1;
        v_user_id := gen_random_uuid();
        
        INSERT INTO users (
            id, tenant_id, email, "UserName", "NormalizedEmail", "NormalizedUserName",
            first_name, last_name, "UserStatus", "PhoneNumber", created_at, updated_at,
            "EmailConfirmed", "PhoneNumberConfirmed", "TwoFactorEnabled", "LockoutEnabled",
            "AccessFailedCount", "ConcurrencyStamp", "SecurityStamp", "PasswordHash"
        ) VALUES (
            v_user_id, v_tenant_id,
            'inactive' || i || '@hospital.com',
            'inactive' || i || '@hospital.com',
            'INACTIVE' || i || '@HOSPITAL.COM',
            'INACTIVE' || i || '@HOSPITAL.COM',
            (ARRAY['Former', 'Past', 'Previous', 'Old', 'Ex'])[i],
            'Staff',
            'inactive',
            '+1' || lpad(floor(random() * 9999999999)::text, 10, '0'),
            NOW() - (random() * 365 || ' days')::interval,
            NOW(),
            true, false, false, true, 0,
            gen_random_uuid()::text,
            gen_random_uuid()::text,
            'AQAAAAIAAYagAAAAEDummyHashForSeedUser' || v_counter
        );

        INSERT INTO app_user_roles (user_id, role_id)
        VALUES (v_user_id, (ARRAY[v_doctor_role_id, v_nurse_role_id, v_receptionist_role_id])[floor(random() * 3 + 1)])
        ON CONFLICT DO NOTHING;
    END LOOP;

    RAISE NOTICE 'Successfully created % users', v_counter;
END $$;

-- Update statistics
SELECT 
    'Users Created' as metric,
    COUNT(*) as count
FROM users
WHERE tenant_id = '11111111-1111-1111-1111-111111111111';

SELECT 
    ar.name as role_name,
    COUNT(DISTINCT aur.user_id) as user_count
FROM app_user_roles aur
JOIN app_roles ar ON ar.id = aur.role_id
WHERE ar.tenant_id = '11111111-1111-1111-1111-111111111111'
GROUP BY ar.name
ORDER BY user_count DESC;

SELECT 
    u."UserStatus" as status,
    COUNT(*) as count
FROM users u
WHERE u.tenant_id = '11111111-1111-1111-1111-111111111111'
GROUP BY u."UserStatus";
