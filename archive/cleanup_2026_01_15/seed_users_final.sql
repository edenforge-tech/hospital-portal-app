-- =====================================================
-- Comprehensive User Seeding Script - FINAL
-- Creates ~100 users for all roles across departments
-- =====================================================

DO $$
DECLARE
    v_tenant_id UUID := '11111111-1111-1111-1111-111111111111';
    v_admin_role_id UUID := 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
    v_doctor_role_id UUID := 'ccebfc73-c5c5-4b03-b0be-d82d66bce15d';
    v_nurse_role_id UUID;
    v_receptionist_role_id UUID;
    v_lab_tech_role_id UUID;
    v_pharmacist_role_id UUID;
    v_branch_id UUID;
    v_org_id UUID;
    
    v_user_id UUID;
    v_dept_record RECORD;
    v_counter INT := 1;
    v_first_names TEXT[] := ARRAY['James', 'Sarah', 'Michael', 'Emily', 'David', 'Lisa', 'Robert', 'Jennifer', 'William', 'Jessica', 'Christopher', 'Nancy', 'Matthew', 'Betty', 'Joshua'];
    v_last_names TEXT[] := ARRAY['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'];
BEGIN
    -- Get organization ID
    SELECT id INTO v_org_id FROM organization WHERE tenant_id = v_tenant_id LIMIT 1;
    
    -- Create or get default branch
    SELECT id INTO v_branch_id FROM branch WHERE tenant_id = v_tenant_id LIMIT 1;
    IF v_branch_id IS NULL THEN
        v_branch_id := gen_random_uuid();
        INSERT INTO branch (id, tenant_id, organization_id, branch_code, name, status, is_main_branch, created_at, updated_at, created_by_user_id, updated_by_user_id)
        VALUES (v_branch_id, v_tenant_id, v_org_id, 'MAIN', 'Main Branch', 'active', true, NOW(), NOW(), v_admin_role_id, v_admin_role_id);
    END IF;
    -- Get or create roles
    SELECT id INTO v_nurse_role_id FROM app_roles WHERE name = 'Nurse' AND tenant_id = v_tenant_id LIMIT 1;
    IF v_nurse_role_id IS NULL THEN
        v_nurse_role_id := gen_random_uuid();
        INSERT INTO app_roles (id, name, "NormalizedName", tenant_id, "RoleCode", "RoleType", "RoleLevel", "Priority", "IsSystemRole", "IsActive", "CreatedAt", "UpdatedAt")
        VALUES (v_nurse_role_id, 'Nurse', 'NURSE', v_tenant_id, 'NURSE', 'clinical', 3, 4, true, true, NOW(), NOW());
    END IF;

    SELECT id INTO v_receptionist_role_id FROM app_roles WHERE name = 'Receptionist' AND tenant_id = v_tenant_id LIMIT 1;
    IF v_receptionist_role_id IS NULL THEN
        v_receptionist_role_id := gen_random_uuid();
        INSERT INTO app_roles (id, name, "NormalizedName", tenant_id, "RoleCode", "RoleType", "RoleLevel", "Priority", "IsSystemRole", "IsActive", "CreatedAt", "UpdatedAt")
        VALUES (v_receptionist_role_id, 'Receptionist', 'RECEPTIONIST', v_tenant_id, 'RECEPTIONIST', 'administrative', 5, 6, true, true, NOW(), NOW());
    END IF;

    SELECT id INTO v_lab_tech_role_id FROM app_roles WHERE name = 'Lab Technician' AND tenant_id = v_tenant_id LIMIT 1;
    IF v_lab_tech_role_id IS NULL THEN
        v_lab_tech_role_id := gen_random_uuid();
        INSERT INTO app_roles (id, name, "NormalizedName", tenant_id, "RoleCode", "RoleType", "RoleLevel", "Priority", "IsSystemRole", "IsActive", "CreatedAt", "UpdatedAt")
        VALUES (v_lab_tech_role_id, 'Lab Technician', 'LAB TECHNICIAN', v_tenant_id, 'LAB_TECH', 'technical', 4, 5, true, true, NOW(), NOW());
    END IF;

    SELECT id INTO v_pharmacist_role_id FROM app_roles WHERE name = 'Pharmacist' AND tenant_id = v_tenant_id LIMIT 1;
    IF v_pharmacist_role_id IS NULL THEN
        v_pharmacist_role_id := gen_random_uuid();
        INSERT INTO app_roles (id, name, "NormalizedName", tenant_id, "RoleCode", "RoleType", "RoleLevel", "Priority", "IsSystemRole", "IsActive", "CreatedAt", "UpdatedAt")
        VALUES (v_pharmacist_role_id, 'Pharmacist', 'PHARMACIST', v_tenant_id, 'PHARMACIST', 'clinical', 4, 5, true, true, NOW(), NOW());
    END IF;

    RAISE NOTICE 'Roles ready. Starting user creation...';

    -- Create Doctors (30 doctors)
    FOR v_dept_record IN (
        SELECT id, department_name, department_code 
        FROM department 
        WHERE tenant_id = v_tenant_id AND deleted_at IS NULL
        AND department_code IN ('OPD-GEN', 'OPD-PEDIA', 'OPD-ORTHO', 'OPD-ENT', 'OPD-DERM', 'CATARACT', 'GLAUCOMA', 'RETINA', 'CORNEA', 'PEDIATRIC-OPH', 'OCULOPLASTY', 'NEURO-OPH', 'OPD-CARD', 'OPD-NEURO', 'OPD-ENDO')
        LIMIT 15
    ) LOOP
        FOR i IN 1..2 LOOP
            v_user_id := gen_random_uuid();
            INSERT INTO users (id, tenant_id, email, user_name, normalized_email, normalized_user_name, "FirstName", "LastName", "UserType", "UserStatus", "MustChangePasswordOnLogin", phone_number, "CreatedAt", "UpdatedAt", email_confirmed, phone_number_confirmed, two_factor_enabled, lockout_enabled, access_failed_count, concurrency_stamp, security_stamp, password_hash)
            VALUES (v_user_id, v_tenant_id, 'doctor' || v_counter || '@hospital.com', 'doctor' || v_counter || '@hospital.com', 'DOCTOR' || v_counter || '@HOSPITAL.COM', 'DOCTOR' || v_counter || '@HOSPITAL.COM', 
                    'Dr. ' || v_first_names[1 + floor(random() * 15)::int], v_last_names[1 + floor(random() * 15)::int], 'Staff', 'active', false, '+1' || lpad(floor(random() * 9999999999)::text, 10, '0'),
                    NOW() - (random() * 180 || ' days')::interval, NOW(), true, true, false, false, 0, gen_random_uuid()::text, gen_random_uuid()::text, 'AQAAAAIAAYagAAAAEHash' || v_counter);
            INSERT INTO app_user_roles (user_id, role_id, branch_id, "AssignedAt", "IsActive") VALUES (v_user_id, v_doctor_role_id, v_branch_id, NOW(), true) ON CONFLICT DO NOTHING;
            INSERT INTO user_department_access (id, user_id, department_id, role_id, tenant_id, is_primary, effective_from, granted_at, created_at, updated_at) VALUES (gen_random_uuid(), v_user_id, v_dept_record.id, v_doctor_role_id, v_tenant_id, true, NOW(), NOW(), NOW(), NOW()) ON CONFLICT DO NOTHING;
            v_counter := v_counter + 1;
        END LOOP;
    END LOOP;
    RAISE NOTICE 'Created % doctors', v_counter - 1;

    -- Create Nurses (45 nurses)
    FOR v_dept_record IN (
        SELECT id, department_name FROM department 
        WHERE tenant_id = v_tenant_id AND deleted_at IS NULL
        AND (department_code LIKE 'OPD-%' OR department_code IN ('CATARACT', 'GLAUCOMA', 'RETINA', 'CORNEA'))
        LIMIT 15
    ) LOOP
        FOR i IN 1..3 LOOP
            v_user_id := gen_random_uuid();
            INSERT INTO users (id, tenant_id, email, user_name, normalized_email, normalized_user_name, "FirstName", "LastName", "UserType", "UserStatus", "MustChangePasswordOnLogin", phone_number, "CreatedAt", "UpdatedAt", email_confirmed, phone_number_confirmed, two_factor_enabled, lockout_enabled, access_failed_count, concurrency_stamp, security_stamp, password_hash)
            VALUES (v_user_id, v_tenant_id, 'nurse' || v_counter || '@hospital.com', 'nurse' || v_counter || '@hospital.com', 'NURSE' || v_counter || '@HOSPITAL.COM', 'NURSE' || v_counter || '@HOSPITAL.COM',
                    v_first_names[1 + floor(random() * 15)::int], v_last_names[1 + floor(random() * 15)::int], 'Staff', 'active', false, '+1' || lpad(floor(random() * 9999999999)::text, 10, '0'),
                    NOW() - (random() * 180 || ' days')::interval, NOW(), true, true, false, false, 0, gen_random_uuid()::text, gen_random_uuid()::text, 'AQAAAAIAAYagAAAAEHash' || v_counter);
            INSERT INTO app_user_roles (user_id, role_id, branch_id, "AssignedAt", "IsActive") VALUES (v_user_id, v_nurse_role_id, v_branch_id, NOW(), true) ON CONFLICT DO NOTHING;
            INSERT INTO user_department_access (id, user_id, department_id, role_id, tenant_id, is_primary, effective_from, granted_at, created_at, updated_at) VALUES (gen_random_uuid(), v_user_id, v_dept_record.id, v_doctor_role_id, v_tenant_id, true, NOW(), NOW(), NOW(), NOW()) ON CONFLICT DO NOTHING;
            v_counter := v_counter + 1;
        END LOOP;
    END LOOP;
    RAISE NOTICE 'Created nurses. Total users: %', v_counter - 1;

    -- Create Lab Technicians (10)
    FOR v_dept_record IN (SELECT id FROM department WHERE tenant_id = v_tenant_id AND department_code LIKE 'LAB%' AND deleted_at IS NULL LIMIT 5) LOOP
        FOR i IN 1..2 LOOP
            v_user_id := gen_random_uuid();
            INSERT INTO users (id, tenant_id, email, user_name, normalized_email, normalized_user_name, "FirstName", "LastName", "UserType", "UserStatus", "MustChangePasswordOnLogin", phone_number, "CreatedAt", "UpdatedAt", email_confirmed, phone_number_confirmed, two_factor_enabled, lockout_enabled, access_failed_count, concurrency_stamp, security_stamp, password_hash)
            VALUES (v_user_id, v_tenant_id, 'labtech' || v_counter || '@hospital.com', 'labtech' || v_counter || '@hospital.com', 'LABTECH' || v_counter || '@HOSPITAL.COM', 'LABTECH' || v_counter || '@HOSPITAL.COM',
                    v_first_names[1 + floor(random() * 15)::int], v_last_names[1 + floor(random() * 15)::int], 'Staff', 'active', false, '+1' || lpad(floor(random() * 9999999999)::text, 10, '0'),
                    NOW() - (random() * 180 || ' days')::interval, NOW(), true, true, false, false, 0, gen_random_uuid()::text, gen_random_uuid()::text, 'AQAAAAIAAYagAAAAEHash' || v_counter);
            INSERT INTO app_user_roles (user_id, role_id, branch_id, "AssignedAt", "IsActive") VALUES (v_user_id, v_lab_tech_role_id, v_branch_id, NOW(), true) ON CONFLICT DO NOTHING; INSERT INTO user_department_access (id, user_id, department_id, role_id, tenant_id, is_primary, effective_from, granted_at, created_at, updated_at) VALUES (gen_random_uuid(), v_user_id, v_dept_record.id, v_lab_tech_role_id, v_tenant_id, true, NOW(), NOW(), NOW(), NOW()) ON CONFLICT DO NOTHING;
            v_counter := v_counter + 1;
        END LOOP;
    END LOOP;
    RAISE NOTICE 'Created lab techs. Total users: %', v_counter - 1;

    -- Create Pharmacists (6)
    FOR v_dept_record IN (SELECT id FROM department WHERE tenant_id = v_tenant_id AND department_code LIKE 'PHARM%' AND deleted_at IS NULL LIMIT 3) LOOP
        FOR i IN 1..2 LOOP
            v_user_id := gen_random_uuid();
            INSERT INTO users (id, tenant_id, email, user_name, normalized_email, normalized_user_name, "FirstName", "LastName", "UserType", "UserStatus", "MustChangePasswordOnLogin", phone_number, "CreatedAt", "UpdatedAt", email_confirmed, phone_number_confirmed, two_factor_enabled, lockout_enabled, access_failed_count, concurrency_stamp, security_stamp, password_hash)
            VALUES (v_user_id, v_tenant_id, 'pharmacist' || v_counter || '@hospital.com', 'pharmacist' || v_counter || '@hospital.com', 'PHARMACIST' || v_counter || '@HOSPITAL.COM', 'PHARMACIST' || v_counter || '@HOSPITAL.COM',
                    v_first_names[1 + floor(random() * 15)::int], v_last_names[1 + floor(random() * 15)::int], 'Staff', 'active', false, '+1' || lpad(floor(random() * 9999999999)::text, 10, '0'),
                    NOW() - (random() * 180 || ' days')::interval, NOW(), true, true, false, false, 0, gen_random_uuid()::text, gen_random_uuid()::text, 'AQAAAAIAAYagAAAAEHash' || v_counter);
            INSERT INTO app_user_roles (user_id, role_id, branch_id, "AssignedAt", "IsActive") VALUES (v_user_id, v_pharmacist_role_id, v_branch_id, NOW(), true) ON CONFLICT DO NOTHING; INSERT INTO user_department_access (id, user_id, department_id, role_id, tenant_id, is_primary, effective_from, granted_at, created_at, updated_at) VALUES (gen_random_uuid(), v_user_id, v_dept_record.id, v_pharmacist_role_id, v_tenant_id, true, NOW(), NOW(), NOW(), NOW()) ON CONFLICT DO NOTHING;
            v_counter := v_counter + 1;
        END LOOP;
    END LOOP;
    RAISE NOTICE 'Created pharmacists. Total users: %', v_counter - 1;

    -- Create Receptionists (10)
    FOR i IN 1..10 LOOP
        v_user_id := gen_random_uuid();
        INSERT INTO users (id, tenant_id, email, user_name, normalized_email, normalized_user_name, "FirstName", "LastName", "UserType", "UserStatus", "MustChangePasswordOnLogin", phone_number, "CreatedAt", "UpdatedAt", email_confirmed, phone_number_confirmed, two_factor_enabled, lockout_enabled, access_failed_count, concurrency_stamp, security_stamp, password_hash)
        VALUES (v_user_id, v_tenant_id, 'receptionist' || v_counter || '@hospital.com', 'receptionist' || v_counter || '@hospital.com', 'RECEPTIONIST' || v_counter || '@HOSPITAL.COM', 'RECEPTIONIST' || v_counter || '@HOSPITAL.COM',
                v_first_names[1 + floor(random() * 15)::int], v_last_names[1 + floor(random() * 15)::int], 'Staff', 'active', false, '+1' || lpad(floor(random() * 9999999999)::text, 10, '0'),
                NOW() - (random() * 180 || ' days')::interval, NOW(), true, true, false, false, 0, gen_random_uuid()::text, gen_random_uuid()::text, 'AQAAAAIAAYagAAAAEHash' || v_counter);
        INSERT INTO app_user_roles (user_id, role_id, branch_id, "AssignedAt", "IsActive") VALUES (v_user_id, v_receptionist_role_id, v_branch_id, NOW(), true) ON CONFLICT DO NOTHING;
        v_counter := v_counter + 1;
    END LOOP;
    RAISE NOTICE 'Created receptionists. Total users: %', v_counter - 1;

    -- Create inactive users (5)
    FOR i IN 1..5 LOOP
        v_user_id := gen_random_uuid();
        INSERT INTO users (id, tenant_id, email, user_name, normalized_email, normalized_user_name, "FirstName", "LastName", "UserType", "UserStatus", "MustChangePasswordOnLogin", phone_number, "CreatedAt", "UpdatedAt", email_confirmed, phone_number_confirmed, two_factor_enabled, lockout_enabled, access_failed_count, concurrency_stamp, security_stamp, password_hash)
        VALUES (v_user_id, v_tenant_id, 'inactive' || i || '@hospital.com', 'inactive' || i || '@hospital.com', 'INACTIVE' || i || '@HOSPITAL.COM', 'INACTIVE' || i || '@HOSPITAL.COM',
                'Former', 'Staff' || i, 'Former', CASE WHEN i <= 3 THEN 'inactive' ELSE 'suspended' END, false, '+15555555555', NOW() - (random() * 365 || ' days')::interval, NOW(),
                true, false, false, true, 0, gen_random_uuid()::text, gen_random_uuid()::text, 'AQAAAAIAAYagAAAAEHash' || v_counter);
        INSERT INTO app_user_roles (user_id, role_id, branch_id, "AssignedAt", "IsActive") VALUES (v_user_id, (ARRAY[v_doctor_role_id, v_nurse_role_id, v_receptionist_role_id])[1 + floor(random() * 3)::int], v_branch_id, NOW(), false) ON CONFLICT DO NOTHING;
        v_counter := v_counter + 1;
    END LOOP;

    RAISE NOTICE 'Successfully created % total users!', v_counter - 1;
END $$;

-- Display statistics
SELECT 'Total Users' as metric, COUNT(*) as count FROM users WHERE tenant_id = '11111111-1111-1111-1111-111111111111';
SELECT ar.name as role_name, COUNT(DISTINCT aur.user_id) as user_count FROM app_user_roles aur JOIN app_roles ar ON ar.id = aur.role_id WHERE ar.tenant_id = '11111111-1111-1111-1111-111111111111' GROUP BY ar.name ORDER BY user_count DESC;
SELECT u."UserStatus" as status, COUNT(*) as count FROM users u WHERE u.tenant_id = '11111111-1111-1111-1111-111111111111' GROUP BY u."UserStatus" ORDER BY count DESC;







