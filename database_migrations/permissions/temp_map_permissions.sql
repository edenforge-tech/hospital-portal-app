-- Map permissions to roles
-- This creates role_permission mappings for common roles

DO $$
DECLARE
    v_super_admin_role_id UUID;
    v_admin_role_id UUID;
    v_doctor_role_id UUID;
    v_nurse_role_id UUID;
    v_receptionist_role_id UUID;
BEGIN
    -- Get role IDs (case-insensitive search)
    SELECT id INTO v_super_admin_role_id FROM app_roles WHERE LOWER("RoleCode") LIKE '%super%admin%' OR LOWER("RoleCode") = 'super_admin' LIMIT 1;
    SELECT id INTO v_admin_role_id FROM app_roles WHERE LOWER("RoleCode") LIKE '%admin%' AND LOWER("RoleCode") NOT LIKE '%super%' LIMIT 1;
    SELECT id INTO v_doctor_role_id FROM app_roles WHERE LOWER("RoleCode") LIKE '%doctor%' OR LOWER("RoleCode") = 'physician' LIMIT 1;
    SELECT id INTO v_nurse_role_id FROM app_roles WHERE LOWER("RoleCode") LIKE '%nurse%' LIMIT 1;
    SELECT id INTO v_receptionist_role_id FROM app_roles WHERE LOWER("RoleCode") LIKE '%reception%' LIMIT 1;
    
    -- Super Admin gets ALL permissions
    IF v_super_admin_role_id IS NOT NULL THEN
        INSERT INTO role_permission (id, role_id, permission_id, granted_at, granted_by_user_id, status, created_at, updated_at)
        SELECT 
            gen_random_uuid(),
            v_super_admin_role_id,
            p.id,
            NOW(),
            NULL,
            'active',
            NOW(),
            NOW()
        FROM permission p
        WHERE NOT EXISTS (
            SELECT 1 FROM role_permission rp WHERE rp.role_id = v_super_admin_role_id AND rp.permission_id = p.id
        );
        RAISE NOTICE 'Mapped all permissions to Super Admin';
    END IF;
    
    -- Admin gets most permissions except super-admin only
    IF v_admin_role_id IS NOT NULL THEN
        INSERT INTO role_permission (id, role_id, permission_id, granted_at, granted_by_user_id, status, created_at, updated_at)
        SELECT 
            gen_random_uuid(),
            v_admin_role_id,
            p.id,
            NOW(),
            NULL,
            'active',
            NOW(),
            NOW()
        FROM permission p
        WHERE p.code NOT LIKE '%TENANT%'  -- Exclude tenant management
        AND NOT EXISTS (
            SELECT 1 FROM role_permission rp WHERE rp.role_id = v_admin_role_id AND rp.permission_id = p.id
        );
        RAISE NOTICE 'Mapped permissions to Admin';
    END IF;
    
    -- Doctor gets clinical permissions
    IF v_doctor_role_id IS NOT NULL THEN
        INSERT INTO role_permission (id, role_id, permission_id, granted_at, granted_by_user_id, status, created_at, updated_at)
        SELECT 
            gen_random_uuid(),
            v_doctor_role_id,
            p.id,
            NOW(),
            NULL,
            'active',
            NOW(),
            NOW()
        FROM permission p
        WHERE p.module IN ('clinical', 'dashboard')
        AND NOT EXISTS (
            SELECT 1 FROM role_permission rp WHERE rp.role_id = v_doctor_role_id AND rp.permission_id = p.id
        );
        RAISE NOTICE 'Mapped clinical permissions to Doctor';
    END IF;
    
    -- Nurse gets most clinical permissions (limited prescriptions)
    IF v_nurse_role_id IS NOT NULL THEN
        INSERT INTO role_permission (id, role_id, permission_id, granted_at, granted_by_user_id, status, created_at, updated_at)
        SELECT 
            gen_random_uuid(),
            v_nurse_role_id,
            p.id,
            NOW(),
            NULL,
            'active',
            NOW(),
            NOW()
        FROM permission p
        WHERE (p.module = 'clinical' AND p.code NOT LIKE '%PRESCRIPTION:CREATE%' AND p.code NOT LIKE '%PRESCRIPTION:APPROVE%')
           OR p.code = 'DASHBOARD:VIEW'
        AND NOT EXISTS (
            SELECT 1 FROM role_permission rp WHERE rp.role_id = v_nurse_role_id AND rp.permission_id = p.id
        );
        RAISE NOTICE 'Mapped clinical permissions to Nurse';
    END IF;
    
    -- Receptionist gets appointment and patient view permissions
    IF v_receptionist_role_id IS NOT NULL THEN
        INSERT INTO role_permission (id, role_id, permission_id, granted_at, granted_by_user_id, status, created_at, updated_at)
        SELECT 
            gen_random_uuid(),
            v_receptionist_role_id,
            p.id,
            NOW(),
            NULL,
            'active',
            NOW(),
            NOW()
        FROM permission p
        WHERE p.code IN (
            'CLINICAL:PATIENT:VIEW',
            'CLINICAL:PATIENT:CREATE',
            'CLINICAL:APPOINTMENT:VIEW',
            'CLINICAL:APPOINTMENT:CREATE',
            'CLINICAL:APPOINTMENT:UPDATE',
            'CLINICAL:APPOINTMENT:CANCEL',
            'DASHBOARD:VIEW'
        )
        AND NOT EXISTS (
            SELECT 1 FROM role_permission rp WHERE rp.role_id = v_receptionist_role_id AND rp.permission_id = p.id
        );
        RAISE NOTICE 'Mapped receptionist permissions';
    END IF;
    
    RAISE NOTICE 'Role-permission mapping completed';
END $$;

-- Verify mappings
SELECT 
    ar."RoleCode",
    COUNT(rp.id) as permission_count
FROM app_roles ar
LEFT JOIN role_permission rp ON ar.id = rp.role_id
WHERE ar."RoleCode" IN ('SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')
   OR ar."RoleCode" ILIKE '%admin%'
   OR ar."RoleCode" ILIKE '%doctor%'
   OR ar."RoleCode" ILIKE '%nurse%'
   OR ar."RoleCode" ILIKE '%reception%'
GROUP BY ar."RoleCode"
ORDER BY permission_count DESC
LIMIT 10;
