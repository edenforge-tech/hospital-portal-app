-- Fix Appointment Permissions Issue
-- The backend expects: appointment.view, appointment.create, appointment.update, appointment.cancel, appointment.delete
-- The database has: appointments.appointment.read, appointments.appointment.create, etc.
--
-- Solution: Create missing permission codes OR map existing ones

-- First, get the admin tenant ID
DO $$
DECLARE
    admin_tenant_id uuid := '11111111-1111-1111-1111-111111111111';
    admin_role_id uuid;
    perm_view_id uuid;
    perm_create_id uuid;
    perm_update_id uuid;
    perm_cancel_id uuid;
    perm_delete_id uuid;
BEGIN
    -- Get or create the admin role
    SELECT id INTO admin_role_id 
    FROM app_roles 
    WHERE LOWER(name) = 'admin' 
    OR LOWER(name) = 'system administrator'
    LIMIT 1;

    RAISE NOTICE 'Admin Role ID: %', admin_role_id;

    -- Create appointment.view permission if it doesn't exist
    INSERT INTO permissions (
        id,
        "TenantId",
        "Code",
        "Name",
        "Description",
        "Module",
        "Action",
        "ResourceType",
        "ResourceName",
        "Scope",
        "IsSystemPermission",
        "IsActive",
        "CreatedAt",
        "UpdatedAt"
    ) VALUES (
        gen_random_uuid(),
        admin_tenant_id,
        'appointment.view',
        'View Appointments',
        'Permission to view appointment records',
        'Appointments',
        'view',
        'Appointment',
        'appointments',
        'tenant',
        true,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT ("TenantId", "Code") DO UPDATE 
    SET "IsActive" = true, "UpdatedAt" = NOW()
    RETURNING id INTO perm_view_id;

    -- Create appointment.create permission
    INSERT INTO permissions (
        id,
        "TenantId",
        "Code",
        "Name",
        "Description",
        "Module",
        "Action",
        "ResourceType",
        "ResourceName",
        "Scope",
        "IsSystemPermission",
        "IsActive",
        "CreatedAt",
        "UpdatedAt"
    ) VALUES (
        gen_random_uuid(),
        admin_tenant_id,
        'appointment.create',
        'Create Appointments',
        'Permission to create new appointment records',
        'Appointments',
        'create',
        'Appointment',
        'appointments',
        'tenant',
        true,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT ("TenantId", "Code") DO UPDATE 
    SET "IsActive" = true, "UpdatedAt" = NOW()
    RETURNING id INTO perm_create_id;

    -- Create appointment.update permission
    INSERT INTO permissions (
        id,
        "TenantId",
        "Code",
        "Name",
        "Description",
        "Module",
        "Action",
        "ResourceType",
        "ResourceName",
        "Scope",
        "IsSystemPermission",
        "IsActive",
        "CreatedAt",
        "UpdatedAt"
    ) VALUES (
        gen_random_uuid(),
        admin_tenant_id,
        'appointment.update',
        'Update Appointments',
        'Permission to update appointment records',
        'Appointments',
        'update',
        'Appointment',
        'appointments',
        'tenant',
        true,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT ("TenantId", "Code") DO UPDATE 
    SET "IsActive" = true, "UpdatedAt" = NOW()
    RETURNING id INTO perm_update_id;

    -- Create appointment.cancel permission
    INSERT INTO permissions (
        id,
        "TenantId",
        "Code",
        "Name",
        "Description",
        "Module",
        "Action",
        "ResourceType",
        "ResourceName",
        "Scope",
        "IsSystemPermission",
        "IsActive",
        "CreatedAt",
        "UpdatedAt"
    ) VALUES (
        gen_random_uuid(),
        admin_tenant_id,
        'appointment.cancel',
        'Cancel Appointments',
        'Permission to cancel appointment records',
        'Appointments',
        'cancel',
        'Appointment',
        'appointments',
        'tenant',
        true,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT ("TenantId", "Code") DO UPDATE 
    SET "IsActive" = true, "UpdatedAt" = NOW()
    RETURNING id INTO perm_cancel_id;

    -- Create appointment.delete permission
    INSERT INTO permissions (
        id,
        "TenantId",
        "Code",
        "Name",
        "Description",
        "Module",
        "Action",
        "ResourceType",
        "ResourceName",
        "Scope",
        "IsSystemPermission",
        "IsActive",
        "CreatedAt",
        "UpdatedAt"
    ) VALUES (
        gen_random_uuid(),
        admin_tenant_id,
        'appointment.delete',
        'Delete Appointments',
        'Permission to delete appointment records',
        'Appointments',
        'delete',
        'Appointment',
        'appointments',
        'tenant',
        true,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT ("TenantId", "Code") DO UPDATE 
    SET "IsActive" = true, "UpdatedAt" = NOW()
    RETURNING id INTO perm_delete_id;

    RAISE NOTICE 'Created permissions: view=%, create=%, update=%, cancel=%, delete=%', 
        perm_view_id, perm_create_id, perm_update_id, perm_cancel_id, perm_delete_id;

    -- Assign all permissions to admin role
    IF admin_role_id IS NOT NULL THEN
        -- appointment.view
        INSERT INTO role_permission (
            id,
            "RoleId",
            "PermissionId",
            "CreatedAt"
        ) VALUES (
            gen_random_uuid(),
            admin_role_id,
            perm_view_id,
            NOW()
        )
        ON CONFLICT DO NOTHING;

        -- appointment.create
        INSERT INTO role_permission (
            id,
            "RoleId",
            "PermissionId",
            "CreatedAt"
        ) VALUES (
            gen_random_uuid(),
            admin_role_id,
            perm_create_id,
            NOW()
        )
        ON CONFLICT DO NOTHING;

        -- appointment.update
        INSERT INTO role_permission (
            id,
            "RoleId",
            "PermissionId",
            "CreatedAt"
        ) VALUES (
            gen_random_uuid(),
            admin_role_id,
            perm_update_id,
            NOW()
        )
        ON CONFLICT DO NOTHING;

        -- appointment.cancel
        INSERT INTO role_permission (
            id,
            "RoleId",
            "PermissionId",
            "CreatedAt"
        ) VALUES (
            gen_random_uuid(),
            admin_role_id,
            perm_cancel_id,
            NOW()
        )
        ON CONFLICT DO NOTHING;

        -- appointment.delete
        INSERT INTO role_permission (
            id,
            "RoleId",
            "PermissionId",
            "CreatedAt"
        ) VALUES (
            gen_random_uuid(),
            admin_role_id,
            perm_delete_id,
            NOW()
        )
        ON CONFLICT DO NOTHING;

        RAISE NOTICE 'Assigned all appointment permissions to admin role';
    ELSE
        RAISE WARNING 'Admin role not found!';
    END IF;
END $$;

-- Verify the permissions were created and assigned
SELECT 
    r.name as role_name,
    p."Code" as permission_code,
    p."Name" as permission_name
FROM app_roles r
JOIN role_permission rp ON r.id = rp."RoleId"
JOIN permissions p ON rp."PermissionId" = p.id
WHERE p."Code" LIKE 'appointment.%'
ORDER BY r.name, p."Code";
