-- =====================================================
-- Add Users for ALL Remaining Roles
-- =====================================================

DO $$
DECLARE
    v_tenant_id UUID := '11111111-1111-1111-1111-111111111111';
    v_branch_id UUID;
    v_org_id UUID;
    v_user_id UUID;
    v_role_id UUID;
    v_counter INT := 1;
    v_dept_id UUID;
    v_first_names TEXT[] := ARRAY['James', 'Sarah', 'Michael', 'Emily', 'David', 'Lisa', 'Robert', 'Jennifer', 'William', 'Jessica', 'Christopher', 'Nancy', 'Matthew', 'Betty', 'Joshua', 'Amanda', 'Daniel', 'Michelle', 'Joseph', 'Stephanie'];
    v_last_names TEXT[] := ARRAY['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin'];
BEGIN
    -- Get branch ID
    SELECT id INTO v_branch_id FROM branch WHERE tenant_id = v_tenant_id LIMIT 1;
    
    RAISE NOTICE 'Starting to create users for all roles...';
    
    -- ===== BILLING CLERKS (5 users) =====
    SELECT id INTO v_role_id FROM app_roles WHERE "RoleCode" = 'BILLING' AND tenant_id = v_tenant_id LIMIT 1;
    IF v_role_id IS NOT NULL THEN
        FOR i IN 1..5 LOOP
            v_user_id := gen_random_uuid();
            INSERT INTO users (id, tenant_id, email, user_name, normalized_email, normalized_user_name, "FirstName", "LastName", "UserType", "UserStatus", "MustChangePasswordOnLogin", phone_number, "CreatedAt", "UpdatedAt", email_confirmed, phone_number_confirmed, two_factor_enabled, lockout_enabled, access_failed_count, concurrency_stamp, security_stamp, password_hash)
            VALUES (v_user_id, v_tenant_id, 'billing' || i || '@hospital.com', 'billing' || i || '@hospital.com', 'BILLING' || i || '@HOSPITAL.COM', 'BILLING' || i || '@HOSPITAL.COM',
                    v_first_names[1 + floor(random() * 20)::int], v_last_names[1 + floor(random() * 20)::int], 'Staff', 'active', false, '+1' || lpad(floor(random() * 9999999999)::text, 10, '0'),
                    NOW() - (random() * 180 || ' days')::interval, NOW(), true, true, false, false, 0, gen_random_uuid()::text, gen_random_uuid()::text, 'AQAAAAIAAYagAAAAEHashBilling' || i);
            INSERT INTO app_user_roles (user_id, role_id, branch_id, "AssignedAt", "IsActive") VALUES (v_user_id, v_role_id, v_branch_id, NOW(), true) ON CONFLICT DO NOTHING;
            v_counter := v_counter + 1;
        END LOOP;
        RAISE NOTICE 'Created 5 Billing Clerks';
    END IF;
    
    -- ===== CONSULTANTS (3 users) =====
    SELECT id INTO v_role_id FROM app_roles WHERE "RoleCode" = 'CONSULTANT' AND tenant_id = v_tenant_id LIMIT 1;
    IF v_role_id IS NOT NULL THEN
        FOR i IN 1..3 LOOP
            v_user_id := gen_random_uuid();
            INSERT INTO users (id, tenant_id, email, user_name, normalized_email, normalized_user_name, "FirstName", "LastName", "UserType", "UserStatus", "MustChangePasswordOnLogin", phone_number, "CreatedAt", "UpdatedAt", email_confirmed, phone_number_confirmed, two_factor_enabled, lockout_enabled, access_failed_count, concurrency_stamp, security_stamp, password_hash)
            VALUES (v_user_id, v_tenant_id, 'consultant' || i || '@hospital.com', 'consultant' || i || '@hospital.com', 'CONSULTANT' || i || '@HOSPITAL.COM', 'CONSULTANT' || i || '@HOSPITAL.COM',
                    'Dr. ' || v_first_names[1 + floor(random() * 20)::int], v_last_names[1 + floor(random() * 20)::int], 'Medical', 'active', false, '+1' || lpad(floor(random() * 9999999999)::text, 10, '0'),
                    NOW() - (random() * 180 || ' days')::interval, NOW(), true, true, false, false, 0, gen_random_uuid()::text, gen_random_uuid()::text, 'AQAAAAIAAYagAAAAEHashConsult' || i);
            INSERT INTO app_user_roles (user_id, role_id, branch_id, "AssignedAt", "IsActive") VALUES (v_user_id, v_role_id, v_branch_id, NOW(), true) ON CONFLICT DO NOTHING;
            v_counter := v_counter + 1;
        END LOOP;
        RAISE NOTICE 'Created 3 Consultants';
    END IF;
    
    -- ===== HOUSEKEEPING SUPERVISORS (2 users) =====
    SELECT id INTO v_role_id FROM app_roles WHERE "RoleCode" = 'HOUSEKEEPING' AND tenant_id = v_tenant_id LIMIT 1;
    IF v_role_id IS NOT NULL THEN
        FOR i IN 1..2 LOOP
            v_user_id := gen_random_uuid();
            INSERT INTO users (id, tenant_id, email, user_name, normalized_email, normalized_user_name, "FirstName", "LastName", "UserType", "UserStatus", "MustChangePasswordOnLogin", phone_number, "CreatedAt", "UpdatedAt", email_confirmed, phone_number_confirmed, two_factor_enabled, lockout_enabled, access_failed_count, concurrency_stamp, security_stamp, password_hash)
            VALUES (v_user_id, v_tenant_id, 'housekeeping' || i || '@hospital.com', 'housekeeping' || i || '@hospital.com', 'HOUSEKEEPING' || i || '@HOSPITAL.COM', 'HOUSEKEEPING' || i || '@HOSPITAL.COM',
                    v_first_names[1 + floor(random() * 20)::int], v_last_names[1 + floor(random() * 20)::int], 'Staff', 'active', false, '+1' || lpad(floor(random() * 9999999999)::text, 10, '0'),
                    NOW() - (random() * 180 || ' days')::interval, NOW(), true, true, false, false, 0, gen_random_uuid()::text, gen_random_uuid()::text, 'AQAAAAIAAYagAAAAEHashHouse' || i);
            INSERT INTO app_user_roles (user_id, role_id, branch_id, "AssignedAt", "IsActive") VALUES (v_user_id, v_role_id, v_branch_id, NOW(), true) ON CONFLICT DO NOTHING;
            v_counter := v_counter + 1;
        END LOOP;
        RAISE NOTICE 'Created 2 Housekeeping Supervisors';
    END IF;
    
    -- ===== IT ADMINISTRATORS (2 users) =====
    SELECT id INTO v_role_id FROM app_roles WHERE "RoleCode" = 'IT_ADMIN' AND tenant_id = v_tenant_id LIMIT 1;
    IF v_role_id IS NOT NULL THEN
        FOR i IN 1..2 LOOP
            v_user_id := gen_random_uuid();
            INSERT INTO users (id, tenant_id, email, user_name, normalized_email, normalized_user_name, "FirstName", "LastName", "UserType", "UserStatus", "MustChangePasswordOnLogin", phone_number, "CreatedAt", "UpdatedAt", email_confirmed, phone_number_confirmed, two_factor_enabled, lockout_enabled, access_failed_count, concurrency_stamp, security_stamp, password_hash)
            VALUES (v_user_id, v_tenant_id, 'itadmin' || i || '@hospital.com', 'itadmin' || i || '@hospital.com', 'ITADMIN' || i || '@HOSPITAL.COM', 'ITADMIN' || i || '@HOSPITAL.COM',
                    v_first_names[1 + floor(random() * 20)::int], v_last_names[1 + floor(random() * 20)::int], 'Staff', 'active', false, '+1' || lpad(floor(random() * 9999999999)::text, 10, '0'),
                    NOW() - (random() * 180 || ' days')::interval, NOW(), true, true, false, false, 0, gen_random_uuid()::text, gen_random_uuid()::text, 'AQAAAAIAAYagAAAAEHashIT' || i);
            INSERT INTO app_user_roles (user_id, role_id, branch_id, "AssignedAt", "IsActive") VALUES (v_user_id, v_role_id, v_branch_id, NOW(), true) ON CONFLICT DO NOTHING;
            v_counter := v_counter + 1;
        END LOOP;
        RAISE NOTICE 'Created 2 IT Administrators';
    END IF;
    
    -- ===== LAB MANAGERS (2 users) =====
    SELECT id INTO v_role_id FROM app_roles WHERE "RoleCode" = 'LAB_MGR' AND tenant_id = v_tenant_id LIMIT 1;
    IF v_role_id IS NOT NULL THEN
        FOR i IN 1..2 LOOP
            v_user_id := gen_random_uuid();
            INSERT INTO users (id, tenant_id, email, user_name, normalized_email, normalized_user_name, "FirstName", "LastName", "UserType", "UserStatus", "MustChangePasswordOnLogin", phone_number, "CreatedAt", "UpdatedAt", email_confirmed, phone_number_confirmed, two_factor_enabled, lockout_enabled, access_failed_count, concurrency_stamp, security_stamp, password_hash)
            VALUES (v_user_id, v_tenant_id, 'labmgr' || i || '@hospital.com', 'labmgr' || i || '@hospital.com', 'LABMGR' || i || '@HOSPITAL.COM', 'LABMGR' || i || '@HOSPITAL.COM',
                    v_first_names[1 + floor(random() * 20)::int], v_last_names[1 + floor(random() * 20)::int], 'Medical', 'active', false, '+1' || lpad(floor(random() * 9999999999)::text, 10, '0'),
                    NOW() - (random() * 180 || ' days')::interval, NOW(), true, true, false, false, 0, gen_random_uuid()::text, gen_random_uuid()::text, 'AQAAAAIAAYagAAAAEHashLabMgr' || i);
            INSERT INTO app_user_roles (user_id, role_id, branch_id, "AssignedAt", "IsActive") VALUES (v_user_id, v_role_id, v_branch_id, NOW(), true) ON CONFLICT DO NOTHING;
            v_counter := v_counter + 1;
        END LOOP;
        RAISE NOTICE 'Created 2 Lab Managers';
    END IF;
    
    -- ===== MAINTENANCE TECHNICIANS (3 users) =====
    SELECT id INTO v_role_id FROM app_roles WHERE "RoleCode" = 'MAINTENANCE' AND tenant_id = v_tenant_id LIMIT 1;
    IF v_role_id IS NOT NULL THEN
        FOR i IN 1..3 LOOP
            v_user_id := gen_random_uuid();
            INSERT INTO users (id, tenant_id, email, user_name, normalized_email, normalized_user_name, "FirstName", "LastName", "UserType", "UserStatus", "MustChangePasswordOnLogin", phone_number, "CreatedAt", "UpdatedAt", email_confirmed, phone_number_confirmed, two_factor_enabled, lockout_enabled, access_failed_count, concurrency_stamp, security_stamp, password_hash)
            VALUES (v_user_id, v_tenant_id, 'maintenance' || i || '@hospital.com', 'maintenance' || i || '@hospital.com', 'MAINTENANCE' || i || '@HOSPITAL.COM', 'MAINTENANCE' || i || '@HOSPITAL.COM',
                    v_first_names[1 + floor(random() * 20)::int], v_last_names[1 + floor(random() * 20)::int], 'Staff', 'active', false, '+1' || lpad(floor(random() * 9999999999)::text, 10, '0'),
                    NOW() - (random() * 180 || ' days')::interval, NOW(), true, true, false, false, 0, gen_random_uuid()::text, gen_random_uuid()::text, 'AQAAAAIAAYagAAAAEHashMaint' || i);
            INSERT INTO app_user_roles (user_id, role_id, branch_id, "AssignedAt", "IsActive") VALUES (v_user_id, v_role_id, v_branch_id, NOW(), true) ON CONFLICT DO NOTHING;
            v_counter := v_counter + 1;
        END LOOP;
        RAISE NOTICE 'Created 3 Maintenance Technicians';
    END IF;
    
    -- ===== MEDICAL RECORDS OFFICERS (3 users) =====
    SELECT id INTO v_role_id FROM app_roles WHERE "RoleCode" = 'MED_RECORDS' AND tenant_id = v_tenant_id LIMIT 1;
    IF v_role_id IS NOT NULL THEN
        FOR i IN 1..3 LOOP
            v_user_id := gen_random_uuid();
            INSERT INTO users (id, tenant_id, email, user_name, normalized_email, normalized_user_name, "FirstName", "LastName", "UserType", "UserStatus", "MustChangePasswordOnLogin", phone_number, "CreatedAt", "UpdatedAt", email_confirmed, phone_number_confirmed, two_factor_enabled, lockout_enabled, access_failed_count, concurrency_stamp, security_stamp, password_hash)
            VALUES (v_user_id, v_tenant_id, 'medrecords' || i || '@hospital.com', 'medrecords' || i || '@hospital.com', 'MEDRECORDS' || i || '@HOSPITAL.COM', 'MEDRECORDS' || i || '@HOSPITAL.COM',
                    v_first_names[1 + floor(random() * 20)::int], v_last_names[1 + floor(random() * 20)::int], 'Staff', 'active', false, '+1' || lpad(floor(random() * 9999999999)::text, 10, '0'),
                    NOW() - (random() * 180 || ' days')::interval, NOW(), true, true, false, false, 0, gen_random_uuid()::text, gen_random_uuid()::text, 'AQAAAAIAAYagAAAAEHashMedRec' || i);
            INSERT INTO app_user_roles (user_id, role_id, branch_id, "AssignedAt", "IsActive") VALUES (v_user_id, v_role_id, v_branch_id, NOW(), true) ON CONFLICT DO NOTHING;
            v_counter := v_counter + 1;
        END LOOP;
        RAISE NOTICE 'Created 3 Medical Records Officers';
    END IF;
    
    -- ===== NURSE MANAGERS (2 users) =====
    SELECT id INTO v_role_id FROM app_roles WHERE "RoleCode" = 'NURSE_MGR' AND tenant_id = v_tenant_id LIMIT 1;
    IF v_role_id IS NOT NULL THEN
        FOR i IN 1..2 LOOP
            v_user_id := gen_random_uuid();
            INSERT INTO users (id, tenant_id, email, user_name, normalized_email, normalized_user_name, "FirstName", "LastName", "UserType", "UserStatus", "MustChangePasswordOnLogin", phone_number, "CreatedAt", "UpdatedAt", email_confirmed, phone_number_confirmed, two_factor_enabled, lockout_enabled, access_failed_count, concurrency_stamp, security_stamp, password_hash)
            VALUES (v_user_id, v_tenant_id, 'nursemgr' || i || '@hospital.com', 'nursemgr' || i || '@hospital.com', 'NURSEMGR' || i || '@HOSPITAL.COM', 'NURSEMGR' || i || '@HOSPITAL.COM',
                    v_first_names[1 + floor(random() * 20)::int], v_last_names[1 + floor(random() * 20)::int], 'Medical', 'active', false, '+1' || lpad(floor(random() * 9999999999)::text, 10, '0'),
                    NOW() - (random() * 180 || ' days')::interval, NOW(), true, true, false, false, 0, gen_random_uuid()::text, gen_random_uuid()::text, 'AQAAAAIAAYagAAAAEHashNurseMgr' || i);
            INSERT INTO app_user_roles (user_id, role_id, branch_id, "AssignedAt", "IsActive") VALUES (v_user_id, v_role_id, v_branch_id, NOW(), true) ON CONFLICT DO NOTHING;
            v_counter := v_counter + 1;
        END LOOP;
        RAISE NOTICE 'Created 2 Nurse Managers';
    END IF;
    
    -- ===== PHARMACY MANAGERS (2 users) =====
    SELECT id INTO v_role_id FROM app_roles WHERE "RoleCode" = 'PHARM_MGR' AND tenant_id = v_tenant_id LIMIT 1;
    IF v_role_id IS NOT NULL THEN
        FOR i IN 1..2 LOOP
            v_user_id := gen_random_uuid();
            INSERT INTO users (id, tenant_id, email, user_name, normalized_email, normalized_user_name, "FirstName", "LastName", "UserType", "UserStatus", "MustChangePasswordOnLogin", phone_number, "CreatedAt", "UpdatedAt", email_confirmed, phone_number_confirmed, two_factor_enabled, lockout_enabled, access_failed_count, concurrency_stamp, security_stamp, password_hash)
            VALUES (v_user_id, v_tenant_id, 'pharmmgr' || i || '@hospital.com', 'pharmmgr' || i || '@hospital.com', 'PHARMMGR' || i || '@HOSPITAL.COM', 'PHARMMGR' || i || '@HOSPITAL.COM',
                    v_first_names[1 + floor(random() * 20)::int], v_last_names[1 + floor(random() * 20)::int], 'Medical', 'active', false, '+1' || lpad(floor(random() * 9999999999)::text, 10, '0'),
                    NOW() - (random() * 180 || ' days')::interval, NOW(), true, true, false, false, 0, gen_random_uuid()::text, gen_random_uuid()::text, 'AQAAAAIAAYagAAAAEHashPharmMgr' || i);
            INSERT INTO app_user_roles (user_id, role_id, branch_id, "AssignedAt", "IsActive") VALUES (v_user_id, v_role_id, v_branch_id, NOW(), true) ON CONFLICT DO NOTHING;
            v_counter := v_counter + 1;
        END LOOP;
        RAISE NOTICE 'Created 2 Pharmacy Managers';
    END IF;
    
    -- ===== RADIOLOGISTS (3 users) =====
    SELECT id INTO v_role_id FROM app_roles WHERE "RoleCode" = 'RADIOLOGIST' AND tenant_id = v_tenant_id LIMIT 1;
    IF v_role_id IS NOT NULL THEN
        FOR i IN 1..3 LOOP
            v_user_id := gen_random_uuid();
            INSERT INTO users (id, tenant_id, email, user_name, normalized_email, normalized_user_name, "FirstName", "LastName", "UserType", "UserStatus", "MustChangePasswordOnLogin", phone_number, "CreatedAt", "UpdatedAt", email_confirmed, phone_number_confirmed, two_factor_enabled, lockout_enabled, access_failed_count, concurrency_stamp, security_stamp, password_hash)
            VALUES (v_user_id, v_tenant_id, 'radiologist' || i || '@hospital.com', 'radiologist' || i || '@hospital.com', 'RADIOLOGIST' || i || '@HOSPITAL.COM', 'RADIOLOGIST' || i || '@HOSPITAL.COM',
                    'Dr. ' || v_first_names[1 + floor(random() * 20)::int], v_last_names[1 + floor(random() * 20)::int], 'Medical', 'active', false, '+1' || lpad(floor(random() * 9999999999)::text, 10, '0'),
                    NOW() - (random() * 180 || ' days')::interval, NOW(), true, true, false, false, 0, gen_random_uuid()::text, gen_random_uuid()::text, 'AQAAAAIAAYagAAAAEHashRadio' || i);
            INSERT INTO app_user_roles (user_id, role_id, branch_id, "AssignedAt", "IsActive") VALUES (v_user_id, v_role_id, v_branch_id, NOW(), true) ON CONFLICT DO NOTHING;
            v_counter := v_counter + 1;
        END LOOP;
        RAISE NOTICE 'Created 3 Radiologists';
    END IF;
    
    -- ===== RADIOLOGY TECHNICIANS (4 users) =====
    SELECT id INTO v_role_id FROM app_roles WHERE "RoleCode" = 'RADIO_TECH' AND tenant_id = v_tenant_id LIMIT 1;
    IF v_role_id IS NOT NULL THEN
        FOR i IN 1..4 LOOP
            v_user_id := gen_random_uuid();
            INSERT INTO users (id, tenant_id, email, user_name, normalized_email, normalized_user_name, "FirstName", "LastName", "UserType", "UserStatus", "MustChangePasswordOnLogin", phone_number, "CreatedAt", "UpdatedAt", email_confirmed, phone_number_confirmed, two_factor_enabled, lockout_enabled, access_failed_count, concurrency_stamp, security_stamp, password_hash)
            VALUES (v_user_id, v_tenant_id, 'radiotech' || i || '@hospital.com', 'radiotech' || i || '@hospital.com', 'RADIOTECH' || i || '@HOSPITAL.COM', 'RADIOTECH' || i || '@HOSPITAL.COM',
                    v_first_names[1 + floor(random() * 20)::int], v_last_names[1 + floor(random() * 20)::int], 'Staff', 'active', false, '+1' || lpad(floor(random() * 9999999999)::text, 10, '0'),
                    NOW() - (random() * 180 || ' days')::interval, NOW(), true, true, false, false, 0, gen_random_uuid()::text, gen_random_uuid()::text, 'AQAAAAIAAYagAAAAEHashRadioTech' || i);
            INSERT INTO app_user_roles (user_id, role_id, branch_id, "AssignedAt", "IsActive") VALUES (v_user_id, v_role_id, v_branch_id, NOW(), true) ON CONFLICT DO NOTHING;
            v_counter := v_counter + 1;
        END LOOP;
        RAISE NOTICE 'Created 4 Radiology Technicians';
    END IF;
    
    -- ===== SECURITY OFFICERS (3 users) =====
    SELECT id INTO v_role_id FROM app_roles WHERE "RoleCode" = 'SECURITY' AND tenant_id = v_tenant_id LIMIT 1;
    IF v_role_id IS NOT NULL THEN
        FOR i IN 1..3 LOOP
            v_user_id := gen_random_uuid();
            INSERT INTO users (id, tenant_id, email, user_name, normalized_email, normalized_user_name, "FirstName", "LastName", "UserType", "UserStatus", "MustChangePasswordOnLogin", phone_number, "CreatedAt", "UpdatedAt", email_confirmed, phone_number_confirmed, two_factor_enabled, lockout_enabled, access_failed_count, concurrency_stamp, security_stamp, password_hash)
            VALUES (v_user_id, v_tenant_id, 'security' || i || '@hospital.com', 'security' || i || '@hospital.com', 'SECURITY' || i || '@HOSPITAL.COM', 'SECURITY' || i || '@HOSPITAL.COM',
                    v_first_names[1 + floor(random() * 20)::int], v_last_names[1 + floor(random() * 20)::int], 'Staff', 'active', false, '+1' || lpad(floor(random() * 9999999999)::text, 10, '0'),
                    NOW() - (random() * 180 || ' days')::interval, NOW(), true, true, false, false, 0, gen_random_uuid()::text, gen_random_uuid()::text, 'AQAAAAIAAYagAAAAEHashSecurity' || i);
            INSERT INTO app_user_roles (user_id, role_id, branch_id, "AssignedAt", "IsActive") VALUES (v_user_id, v_role_id, v_branch_id, NOW(), true) ON CONFLICT DO NOTHING;
            v_counter := v_counter + 1;
        END LOOP;
        RAISE NOTICE 'Created 3 Security Officers';
    END IF;
    
    -- ===== SENIOR DOCTORS (2 users) =====
    SELECT id INTO v_role_id FROM app_roles WHERE "RoleCode" = 'SR_DOCTOR' AND tenant_id = v_tenant_id LIMIT 1;
    IF v_role_id IS NOT NULL THEN
        FOR i IN 1..2 LOOP
            v_user_id := gen_random_uuid();
            INSERT INTO users (id, tenant_id, email, user_name, normalized_email, normalized_user_name, "FirstName", "LastName", "UserType", "UserStatus", "MustChangePasswordOnLogin", phone_number, "CreatedAt", "UpdatedAt", email_confirmed, phone_number_confirmed, two_factor_enabled, lockout_enabled, access_failed_count, concurrency_stamp, security_stamp, password_hash)
            VALUES (v_user_id, v_tenant_id, 'srdoctor' || i || '@hospital.com', 'srdoctor' || i || '@hospital.com', 'SRDOCTOR' || i || '@HOSPITAL.COM', 'SRDOCTOR' || i || '@HOSPITAL.COM',
                    'Dr. ' || v_first_names[1 + floor(random() * 20)::int], v_last_names[1 + floor(random() * 20)::int], 'Medical', 'active', false, '+1' || lpad(floor(random() * 9999999999)::text, 10, '0'),
                    NOW() - (random() * 180 || ' days')::interval, NOW(), true, true, false, false, 0, gen_random_uuid()::text, gen_random_uuid()::text, 'AQAAAAIAAYagAAAAEHashSrDoc' || i);
            INSERT INTO app_user_roles (user_id, role_id, branch_id, "AssignedAt", "IsActive") VALUES (v_user_id, v_role_id, v_branch_id, NOW(), true) ON CONFLICT DO NOTHING;
            v_counter := v_counter + 1;
        END LOOP;
        RAISE NOTICE 'Created 2 Senior Doctors';
    END IF;
    
    -- ===== SENIOR NURSES (3 users) =====
    SELECT id INTO v_role_id FROM app_roles WHERE "RoleCode" = 'SR_NURSE' AND tenant_id = v_tenant_id LIMIT 1;
    IF v_role_id IS NOT NULL THEN
        FOR i IN 1..3 LOOP
            v_user_id := gen_random_uuid();
            INSERT INTO users (id, tenant_id, email, user_name, normalized_email, normalized_user_name, "FirstName", "LastName", "UserType", "UserStatus", "MustChangePasswordOnLogin", phone_number, "CreatedAt", "UpdatedAt", email_confirmed, phone_number_confirmed, two_factor_enabled, lockout_enabled, access_failed_count, concurrency_stamp, security_stamp, password_hash)
            VALUES (v_user_id, v_tenant_id, 'srnurse' || i || '@hospital.com', 'srnurse' || i || '@hospital.com', 'SRNURSE' || i || '@HOSPITAL.COM', 'SRNURSE' || i || '@HOSPITAL.COM',
                    v_first_names[1 + floor(random() * 20)::int], v_last_names[1 + floor(random() * 20)::int], 'Medical', 'active', false, '+1' || lpad(floor(random() * 9999999999)::text, 10, '0'),
                    NOW() - (random() * 180 || ' days')::interval, NOW(), true, true, false, false, 0, gen_random_uuid()::text, gen_random_uuid()::text, 'AQAAAAIAAYagAAAAEHashSrNurse' || i);
            INSERT INTO app_user_roles (user_id, role_id, branch_id, "AssignedAt", "IsActive") VALUES (v_user_id, v_role_id, v_branch_id, NOW(), true) ON CONFLICT DO NOTHING;
            v_counter := v_counter + 1;
        END LOOP;
        RAISE NOTICE 'Created 3 Senior Nurses';
    END IF;
    
    RAISE NOTICE 'Successfully created % additional users for all roles!', v_counter - 1;
END $$;

-- Display updated statistics
SELECT 'Total Users' as metric, COUNT(*) as count FROM users WHERE tenant_id = '11111111-1111-1111-1111-111111111111';
SELECT r.name as role_name, COUNT(aur.user_id) as user_count 
FROM app_roles r 
LEFT JOIN app_user_roles aur ON r.id = aur.role_id 
WHERE r.tenant_id = '11111111-1111-1111-1111-111111111111' 
GROUP BY r.name 
ORDER BY user_count DESC, r.name;
SELECT "UserStatus" as status, COUNT(*) as count FROM users WHERE tenant_id = '11111111-1111-1111-1111-111111111111' GROUP BY "UserStatus";
