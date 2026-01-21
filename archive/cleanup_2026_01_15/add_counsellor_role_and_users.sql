-- =====================================================
-- Add Counsellor Role and Create Counsellor Users
-- =====================================================

DO $$
DECLARE
    v_tenant_id UUID := '11111111-1111-1111-1111-111111111111';
    v_branch_id UUID;
    v_counsellor_role_id UUID;
    v_user_id UUID;
    v_counter INT := 1;
    v_first_names TEXT[] := ARRAY['Emma', 'Olivia', 'Sophia', 'Isabella', 'Ava', 'Mia', 'Charlotte', 'Amelia'];
    v_last_names TEXT[] := ARRAY['Thompson', 'Williams', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Lewis', 'Walker'];
BEGIN
    -- Get branch ID
    SELECT id INTO v_branch_id FROM branch WHERE tenant_id = v_tenant_id LIMIT 1;
    
    -- Create Counsellor role if it doesn't exist
    SELECT id INTO v_counsellor_role_id FROM app_roles WHERE "RoleCode" = 'COUNSELLOR' AND tenant_id = v_tenant_id LIMIT 1;
    
    IF v_counsellor_role_id IS NULL THEN
        v_counsellor_role_id := gen_random_uuid();
        INSERT INTO app_roles (
            id, name, "NormalizedName", tenant_id, 
            "RoleCode", "RoleType", "RoleLevel", "Priority", 
            "Description", "IsSystemRole", "IsActive", 
            "CreatedAt", "UpdatedAt"
        )
        VALUES (
            v_counsellor_role_id, 'Counsellor', 'COUNSELLOR', v_tenant_id,
            'COUNSELLOR', 'clinical', 4, 7,
            'Mental health and patient counselling specialist', true, true,
            NOW(), NOW()
        );
        RAISE NOTICE 'Created Counsellor role';
    ELSE
        RAISE NOTICE 'Counsellor role already exists';
    END IF;
    
    -- Create 4 Counsellor users
    FOR i IN 1..4 LOOP
        v_user_id := gen_random_uuid();
        
        INSERT INTO users (
            id, tenant_id, email, user_name, normalized_email, normalized_user_name,
            "FirstName", "LastName", "UserType", "UserStatus", "MustChangePasswordOnLogin",
            phone_number, "CreatedAt", "UpdatedAt", email_confirmed, phone_number_confirmed,
            two_factor_enabled, lockout_enabled, access_failed_count,
            concurrency_stamp, security_stamp, password_hash
        )
        VALUES (
            v_user_id, v_tenant_id, 
            'counsellor' || i || '@hospital.com', 
            'counsellor' || i || '@hospital.com',
            'COUNSELLOR' || i || '@HOSPITAL.COM',
            'COUNSELLOR' || i || '@HOSPITAL.COM',
            v_first_names[1 + floor(random() * 8)::int],
            v_last_names[1 + floor(random() * 8)::int],
            'Medical', 'active', false,
            '+1' || lpad(floor(random() * 9999999999)::text, 10, '0'),
            NOW() - (random() * 180 || ' days')::interval, NOW(),
            true, true, false, false, 0,
            gen_random_uuid()::text,
            gen_random_uuid()::text,
            'AQAAAAIAAYagAAAAEHashCounsellor' || i
        );
        
        -- Assign Counsellor role
        INSERT INTO app_user_roles (user_id, role_id, branch_id, "AssignedAt", "IsActive")
        VALUES (v_user_id, v_counsellor_role_id, v_branch_id, NOW(), true)
        ON CONFLICT DO NOTHING;
        
        v_counter := v_counter + 1;
    END LOOP;
    
    RAISE NOTICE 'Successfully created 4 Counsellor users!';
END $$;

-- Display updated statistics
SELECT 'Total Users' as metric, COUNT(*) as count 
FROM users 
WHERE tenant_id = '11111111-1111-1111-1111-111111111111';

SELECT r.name as role_name, COUNT(aur.user_id) as user_count 
FROM app_roles r 
LEFT JOIN app_user_roles aur ON r.id = aur.role_id 
WHERE r.tenant_id = '11111111-1111-1111-1111-111111111111' 
GROUP BY r.name 
HAVING COUNT(aur.user_id) > 0
ORDER BY user_count DESC, r.name;
