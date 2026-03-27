-- Map permissions to roles (CORRECTED VERSION)
-- Uses actual schema: permissions (plural) and role_permission with mixed-case columns

DO $$
DECLARE
    v_super_admin_role_id UUID;
    v_admin_role_id UUID;
    v_doctor_role_id UUID;
    v_nurse_role_id UUID;
    v_receptionist_role_id UUID;
    v_mappings_added INT := 0;
BEGIN
    -- Get role IDs
    SELECT id INTO v_super_admin_role_id FROM app_roles WHERE "RoleCode" ILIKE '%super%admin%' LIMIT 1;
    SELECT id INTO v_admin_role_id FROM app_roles WHERE "RoleCode" ILIKE 'admin' AND "RoleCode" NOT ILIKE '%super%' LIMIT 1;
    SELECT id INTO v_doctor_role_id FROM app_roles WHERE "RoleCode" ILIKE '%doctor%' OR "RoleCode" ILIKE 'physician' LIMIT 1;
    SELECT id INTO v_nurse_role_id FROM app_roles WHERE "RoleCode" ILIKE '%nurse%' LIMIT 1;
    SELECT id INTO v_receptionist_role_id FROM app_roles WHERE "RoleCode" ILIKE '%reception%' LIMIT 1;
    
    RAISE NOTICE 'Found roles: Super Admin=%, Admin=%, Doctor=%, Nurse=%, Receptionist=%', 
        v_super_admin_role_id, v_admin_role_id, v_doctor_role_id, v_nurse_role_id, v_receptionist_role_id;
    
    -- Super Admin gets ALL permissions
    IF v_super_admin_role_id IS NOT NULL THEN
        WITH inserted AS (
            INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
            SELECT 
                gen_random_uuid(),
                v_super_admin_role_id,
                p.id,
                NOW()
            FROM permissions p
            WHERE NOT EXISTS (
                SELECT 1 FROM role_permission rp 
                WHERE rp."RoleId" = v_super_admin_role_id AND rp."PermissionId" = p.id
            )
            RETURNING 1
        )
        SELECT COUNT(*) INTO v_mappings_added FROM inserted;
        RAISE NOTICE 'Mapped % permissions to Super Admin', v_mappings_added;
    END IF;
    
    -- Admin gets most permissions except tenant management
    IF v_admin_role_id IS NOT NULL THEN
        WITH inserted AS (
            INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
            SELECT 
                gen_random_uuid(),
                v_admin_role_id,
                p.id,
                NOW()
            FROM permissions p
            WHERE p."Code" NOT ILIKE '%TENANT:CREATE%' 
              AND p."Code" NOT ILIKE '%TENANT:DELETE%'
              AND NOT EXISTS (
                SELECT 1 FROM role_permission rp 
                WHERE rp."RoleId" = v_admin_role_id AND rp."PermissionId" = p.id
              )
            RETURNING 1
        )
        SELECT COUNT(*) INTO v_mappings_added FROM inserted;
        RAISE NOTICE 'Mapped % permissions to Admin', v_mappings_added;
    END IF;
    
    -- Doctor gets all clinical permissions
    IF v_doctor_role_id IS NOT NULL THEN
        WITH inserted AS (
            INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
            SELECT 
                gen_random_uuid(),
                v_doctor_role_id,
                p.id,
                NOW()
            FROM permissions p
            WHERE (p."Module" ILIKE 'clinical' OR p."Module" ILIKE 'dashboard')
              AND NOT EXISTS (
                SELECT 1 FROM role_permission rp 
                WHERE rp."RoleId" = v_doctor_role_id AND rp."PermissionId" = p.id
              )
            RETURNING 1
        )
        SELECT COUNT(*) INTO v_mappings_added FROM inserted;
        RAISE NOTICE 'Mapped % permissions to Doctor', v_mappings_added;
    END IF;
    
    -- Nurse gets most clinical permissions (no prescriptions)
    IF v_nurse_role_id IS NOT NULL THEN
        WITH inserted AS (
            INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
            SELECT 
                gen_random_uuid(),
                v_nurse_role_id,
                p.id,
                NOW()
            FROM permissions p
            WHERE (p."Module" ILIKE 'clinical' AND p."Code" NOT ILIKE '%PRESCRIPTION:CREATE%' AND p."Code" NOT ILIKE '%PRESCRIPTION:APPROVE%')
               OR p."Code" ILIKE '%DASHBOARD:VIEW%'
              AND NOT EXISTS (
                SELECT 1 FROM role_permission rp 
                WHERE rp."RoleId" = v_nurse_role_id AND rp."PermissionId" = p.id
              )
            RETURNING 1
        )
        SELECT COUNT(*) INTO v_mappings_added FROM inserted;
        RAISE NOTICE 'Mapped % permissions to Nurse', v_mappings_added;
    END IF;
    
    -- Receptionist gets appointment and patient view permissions
    IF v_receptionist_role_id IS NOT NULL THEN
        WITH inserted AS (
            INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
            SELECT 
                gen_random_uuid(),
                v_receptionist_role_id,
                p.id,
                NOW()
            FROM permissions p
            WHERE (p."Code" ILIKE '%PATIENT:VIEW%'
               OR p."Code" ILIKE '%PATIENT:CREATE%'
               OR p."Code" ILIKE '%APPOINTMENT:%'
               OR p."Code" ILIKE '%DASHBOARD:VIEW%')
              AND p."Code" NOT ILIKE '%PHI%'
              AND NOT EXISTS (
                SELECT 1 FROM role_permission rp 
                WHERE rp."RoleId" = v_receptionist_role_id AND rp."PermissionId" = p.id
              )
            RETURNING 1
        )
        SELECT COUNT(*) INTO v_mappings_added FROM inserted;
        RAISE NOTICE 'Mapped % permissions to Receptionist', v_mappings_added;
    END IF;
    
    RAISE NOTICE 'Role-permission mapping completed successfully';
END $$;

-- Verify mappings
SELECT 
    ar."RoleCode",
    ar."Description",
    COUNT(rp.id) as permission_count
FROM app_roles ar
LEFT JOIN role_permission rp ON ar.id = rp."RoleId"
WHERE ar."IsActive" = true
GROUP BY ar.id, ar."RoleCode", ar."Description"
HAVING COUNT(rp.id) > 0
ORDER BY permission_count DESC
LIMIT 15;
