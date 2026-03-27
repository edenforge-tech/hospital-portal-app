-- Add Transcription Permissions for Counselor Module
-- Date: Feb 24, 2026
-- Purpose: Enable audio transcription and translation features

DO $$
DECLARE
    admin_tenant_id uuid;
    counselor_role_id uuid;
    admin_role_id uuid;
    perm_start_id uuid;
    perm_view_id uuid;
    perm_translate_id uuid;
    perm_edit_id uuid;
BEGIN
    -- Get admin tenant (system-wide permissions)
    SELECT id INTO admin_tenant_id 
    FROM tenant 
    WHERE name = 'Admin Tenant' OR status = 'active'
    ORDER BY created_at ASC 
    LIMIT 1;

    -- If no tenant found, use first available tenant
    IF admin_tenant_id IS NULL THEN
        SELECT id INTO admin_tenant_id FROM tenant LIMIT 1;
    END IF;

    RAISE NOTICE 'Using Tenant ID: %', admin_tenant_id;

    -- Get Counselor role ID
    SELECT id INTO counselor_role_id 
    FROM app_roles 
    WHERE LOWER(name) = 'counselor' AND tenant_id = admin_tenant_id
    LIMIT 1;

    -- Get Admin role ID
    SELECT id INTO admin_role_id 
    FROM app_roles 
    WHERE LOWER(name) = 'admin' OR LOWER(name) = 'system administrator'
    AND tenant_id = admin_tenant_id
    LIMIT 1;

    RAISE NOTICE 'Counselor Role ID: %, Admin Role ID: %', counselor_role_id, admin_role_id;

    -- ====================================================================
    -- CREATE PERMISSIONS
    -- ====================================================================

    -- 1. transcription.start - Start transcription jobs
    INSERT INTO permissions (
        id,
        "TenantId",
        "Code",
        "Name",
        "Description",
        "Module",
        "Action",
        "ResourceType",
        "IsActive",
        "CreatedAt",
        "UpdatedAt"
    ) VALUES (
        gen_random_uuid(),
        admin_tenant_id,
        'transcription.start',
        'Start Transcription',
        'Permission to start audio transcription for counseling sessions',
        'Counseling',
        'create',
        'Transcription',
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT ("TenantId", "Code") DO UPDATE 
    SET "IsActive" = true, "UpdatedAt" = NOW()
    RETURNING id INTO perm_start_id;

    RAISE NOTICE 'Created transcription.start permission: %', perm_start_id;

    -- 2. transcription.view - View transcripts
    INSERT INTO permissions (
        id,
        "TenantId",
        "Code",
        "Name",
        "Description",
        "Module",
        "Action",
        "ResourceType",
        "IsActive",
        "CreatedAt",
        "UpdatedAt"
    ) VALUES (
        gen_random_uuid(),
        admin_tenant_id,
        'transcription.view',
        'View Transcripts',
        'Permission to view transcription results and transcripts',
        'Counseling',
        'read',
        'Transcription',
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT ("TenantId", "Code") DO UPDATE 
    SET "IsActive" = true, "UpdatedAt" = NOW()
    RETURNING id INTO perm_view_id;

    RAISE NOTICE 'Created transcription.view permission: %', perm_view_id;

    -- 3. transcription.translate - Translate transcripts
    INSERT INTO permissions (
        id,
        "TenantId",
        "Code",
        "Name",
        "Description",
        "Module",
        "Action",
        "ResourceType",
        "IsActive",
        "CreatedAt",
        "UpdatedAt"
    ) VALUES (
        gen_random_uuid(),
        admin_tenant_id,
        'transcription.translate',
        'Translate Transcripts',
        'Permission to translate transcripts to other languages',
        'Counseling',
        'create',
        'Transcription',
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT ("TenantId", "Code") DO UPDATE 
    SET "IsActive" = true, "UpdatedAt" = NOW()
    RETURNING id INTO perm_translate_id;

    RAISE NOTICE 'Created transcription.translate permission: %', perm_translate_id;

    -- 4. transcription.edit - Edit transcript segments
    INSERT INTO permissions (
        id,
        "TenantId",
        "Code",
        "Name",
        "Description",
        "Module",
        "Action",
        "ResourceType",
        "IsActive",
        "CreatedAt",
        "UpdatedAt"
    ) VALUES (
        gen_random_uuid(),
        admin_tenant_id,
        'transcription.edit',
        'Edit Transcripts',
        'Permission to manually edit transcript segments',
        'Counseling',
        'update',
        'Transcription',
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT ("TenantId", "Code") DO UPDATE 
    SET "IsActive" = true, "UpdatedAt" = NOW()
    RETURNING id INTO perm_edit_id;

    RAISE NOTICE 'Created transcription.edit permission: %', perm_edit_id;

    -- ====================================================================
    -- ASSIGN PERMISSIONS TO COUNSELOR ROLE
    -- ====================================================================

    IF counselor_role_id IS NOT NULL THEN
        -- Assign transcription.start (check if exists first)
        IF NOT EXISTS (SELECT 1 FROM role_permission WHERE "RoleId" = counselor_role_id AND "PermissionId" = perm_start_id) THEN
            INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
            VALUES (gen_random_uuid(), counselor_role_id, perm_start_id, NOW());
        END IF;

        -- Assign transcription.view
        IF NOT EXISTS (SELECT 1 FROM role_permission WHERE "RoleId" = counselor_role_id AND "PermissionId" = perm_view_id) THEN
            INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
            VALUES (gen_random_uuid(), counselor_role_id, perm_view_id, NOW());
        END IF;

        -- Assign transcription.translate
        IF NOT EXISTS (SELECT 1 FROM role_permission WHERE "RoleId" = counselor_role_id AND "PermissionId" = perm_translate_id) THEN
            INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
            VALUES (gen_random_uuid(), counselor_role_id, perm_translate_id, NOW());
        END IF;

        -- Assign transcription.edit
        IF NOT EXISTS (SELECT 1 FROM role_permission WHERE "RoleId" = counselor_role_id AND "PermissionId" = perm_edit_id) THEN
            INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
            VALUES (gen_random_uuid(), counselor_role_id, perm_edit_id, NOW());
        END IF;

        RAISE NOTICE 'Assigned all transcription permissions to Counselor role';
    ELSE
        RAISE WARNING 'Counselor role not found - permissions created but not assigned';
    END IF;

    -- ====================================================================
    -- ASSIGN PERMISSIONS TO ADMIN ROLE
    -- ====================================================================

    IF admin_role_id IS NOT NULL THEN
        -- Assign transcription.start to admin
        IF NOT EXISTS (SELECT 1 FROM role_permission WHERE "RoleId" = admin_role_id AND "PermissionId" = perm_start_id) THEN
            INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
            VALUES (gen_random_uuid(), admin_role_id, perm_start_id, NOW());
        END IF;

        -- Assign transcription.view to admin
        IF NOT EXISTS (SELECT 1 FROM role_permission WHERE "RoleId" = admin_role_id AND "PermissionId" = perm_view_id) THEN
            INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
            VALUES (gen_random_uuid(), admin_role_id, perm_view_id, NOW());
        END IF;

        -- Assign transcription.translate to admin
        IF NOT EXISTS (SELECT 1 FROM role_permission WHERE "RoleId" = admin_role_id AND "PermissionId" = perm_translate_id) THEN
            INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
            VALUES (gen_random_uuid(), admin_role_id, perm_translate_id, NOW());
        END IF;

        -- Assign transcription.edit to admin
        IF NOT EXISTS (SELECT 1 FROM role_permission WHERE "RoleId" = admin_role_id AND "PermissionId" = perm_edit_id) THEN
            INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
            VALUES (gen_random_uuid(), admin_role_id, perm_edit_id, NOW());
        END IF;

        RAISE NOTICE 'Assigned all transcription permissions to Admin role';
    ELSE
        RAISE WARNING 'Admin role not found - permissions created but not assigned';
    END IF;

END $$;

-- Verify permissions were created
SELECT 
    p."Code" as code,
    p."Name" as name,
    p."Module" as module,
    p."Action" as action,
    COUNT(rp."RoleId") as assigned_to_roles
FROM permissions p
LEFT JOIN role_permission rp ON p.id = rp."PermissionId"
WHERE p."Code" LIKE 'transcription.%'
GROUP BY p.id, p."Code", p."Name", p."Module", p."Action"
ORDER BY p."Code";

-- Show role assignments
SELECT 
    r.name as role_name,
    p."Code" as permission_code,
    p."Name" as permission_name
FROM role_permission rp
JOIN app_roles r ON rp."RoleId" = r.id
JOIN permissions p ON rp."PermissionId" = p.id
WHERE p."Code" LIKE 'transcription.%'
ORDER BY r.name, p."Code";
