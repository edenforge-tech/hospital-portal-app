-- =============================================
-- 51b: Fix Master Data Permissions
-- =============================================
-- Step 1: Insert into permission table (legacy RBAC, code is UNIQUE)
INSERT INTO public.permission (id, code, name, description, module, resource, action, is_active, created_at, updated_at)
VALUES
    (gen_random_uuid(), 'MASTER_DATA_VIEW',   'master_data.view',   'View master data values',     'master_data', 'master_data', 'view',   true, NOW(), NOW()),
    (gen_random_uuid(), 'MASTER_DATA_CREATE', 'master_data.create', 'Create master data values',   'master_data', 'master_data', 'create', true, NOW(), NOW()),
    (gen_random_uuid(), 'MASTER_DATA_UPDATE', 'master_data.update', 'Update master data values',   'master_data', 'master_data', 'update', true, NOW(), NOW()),
    (gen_random_uuid(), 'MASTER_DATA_DELETE', 'master_data.delete', 'Delete master data values',   'master_data', 'master_data', 'delete', true, NOW(), NOW()),
    (gen_random_uuid(), 'MASTER_DATA_MANAGE', 'master_data.manage', 'Full master data management', 'master_data', 'master_data', 'manage', true, NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET is_active = true, updated_at = NOW();

-- Step 2: Assign to Admin role inline (no helper function)
DO $$
DECLARE
    v_role_id  UUID;
    v_perm_id  UUID;
    v_codes    TEXT[] := ARRAY['MASTER_DATA_VIEW','MASTER_DATA_CREATE','MASTER_DATA_UPDATE','MASTER_DATA_DELETE','MASTER_DATA_MANAGE'];
    v_code     TEXT;
BEGIN
    SELECT id INTO v_role_id FROM public.app_roles WHERE name = 'Admin' LIMIT 1;
    IF v_role_id IS NULL THEN
        RAISE NOTICE 'Admin role not found � skipping role assignment';
        RETURN;
    END IF;
    FOREACH v_code IN ARRAY v_codes
    LOOP
        SELECT id INTO v_perm_id FROM public.permission WHERE code = v_code;
        IF v_perm_id IS NULL THEN CONTINUE; END IF;
        IF NOT EXISTS (SELECT 1 FROM public.role_permission WHERE "RoleId" = v_role_id AND "PermissionId" = v_perm_id) THEN
            INSERT INTO public.role_permission (id, "RoleId", "PermissionId", "CreatedAt")
            VALUES (gen_random_uuid(), v_role_id, v_perm_id, NOW());
            RAISE NOTICE 'Assigned % to Admin', v_code;
        END IF;
    END LOOP;
END;
$$;

SELECT p.code, p.name, p.is_active FROM public.permission WHERE code LIKE 'MASTER_DATA%' ORDER BY code;
