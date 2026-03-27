-- Add all permissions needed for Appointments module to work fully
-- This includes permissions for patients, users, and departments that
-- the AppointmentFormModal needs when creating/editing appointments

-- Set tenant context
SET app.current_tenant_id = '11111111-1111-1111-1111-111111111111';

-- Get the admin role ID
DO $$
DECLARE
    v_admin_role_id UUID;
    v_tenant_id UUID := '11111111-1111-1111-1111-111111111111';
    v_admin_user_id UUID;
    v_permission_id UUID;
BEGIN
    -- Find admin role
    SELECT "Id" INTO v_admin_role_id
    FROM "role"
    WHERE "Name" = 'Admin' AND "TenantId" = v_tenant_id
    LIMIT 1;

    -- Find admin user for created_by
    SELECT "Id" INTO v_admin_user_id
    FROM "AspNetUsers"
    WHERE LOWER("Email") = 'admin@test.com'
    LIMIT 1;

    IF v_admin_user_id IS NULL THEN
        v_admin_user_id := '00000000-0000-0000-0000-000000000001'; -- fallback
    END IF;

    RAISE NOTICE 'Admin Role ID: %', v_admin_role_id;
    RAISE NOTICE 'Admin User ID: %', v_admin_user_id;

    -- Create patient.view permission if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM "permissions" WHERE "Code" = 'patient.view' AND "TenantId" = v_tenant_id) THEN
        v_permission_id := gen_random_uuid();
        INSERT INTO "permissions" (
            "Id", "TenantId", "Code", "Name", "Description", "Action", "ResourceType",
            "CreatedAt", "UpdatedAt", "CreatedByUserId", "UpdatedByUserId", "Status"
        ) VALUES (
            v_permission_id, v_tenant_id, 'patient.view', 'View Patients', 
            'Allows viewing patient information', 'View', 'Patient',
            NOW(), NOW(), v_admin_user_id, v_admin_user_id, 'active'
        );
        RAISE NOTICE 'Created patient.view permission: %', v_permission_id;

        -- Assign to admin role
        INSERT INTO "role_permission" ("Id", "RoleId", "PermissionId", "TenantId", "CreatedAt", "UpdatedAt", "CreatedByUserId", "UpdatedByUserId", "Status")
        VALUES (gen_random_uuid(), v_admin_role_id, v_permission_id, v_tenant_id, NOW(), NOW(), v_admin_user_id, v_admin_user_id, 'active')
        ON CONFLICT DO NOTHING;
        RAISE NOTICE 'Assigned patient.view to Admin role';
    ELSE
        RAISE NOTICE 'patient.view already exists';
    END IF;

    -- Create user.view permission if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM "permissions" WHERE "Code" = 'user.view' AND "TenantId" = v_tenant_id) THEN
        v_permission_id := gen_random_uuid();
        INSERT INTO "permissions" (
            "Id", "TenantId", "Code", "Name", "Description", "Action", "ResourceType",
            "CreatedAt", "UpdatedAt", "CreatedByUserId", "UpdatedByUserId", "Status"
        ) VALUES (
            v_permission_id, v_tenant_id, 'user.view', 'View Users', 
            'Allows viewing user/staff information', 'View', 'User',
            NOW(), NOW(), v_admin_user_id, v_admin_user_id, 'active'
        );
        RAISE NOTICE 'Created user.view permission: %', v_permission_id;

        -- Assign to admin role
        INSERT INTO "role_permission" ("Id", "RoleId", "PermissionId", "TenantId", "CreatedAt", "UpdatedAt", "CreatedByUserId", "UpdatedByUserId", "Status")
        VALUES (gen_random_uuid(), v_admin_role_id, v_permission_id, v_tenant_id, NOW(), NOW(), v_admin_user_id, v_admin_user_id, 'active')
        ON CONFLICT DO NOTHING;
        RAISE NOTICE 'Assigned user.view to Admin role';
    ELSE
        RAISE NOTICE 'user.view already exists';
    END IF;

    -- Create department.view permission if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM "permissions" WHERE "Code" = 'department.view' AND "TenantId" = v_tenant_id) THEN
        v_permission_id := gen_random_uuid();
        INSERT INTO "permissions" (
            "Id", "TenantId", "Code", "Name", "Description", "Action", "ResourceType",
            "CreatedAt", "UpdatedAt", "CreatedByUserId", "UpdatedByUserId", "Status"
        ) VALUES (
            v_permission_id, v_tenant_id, 'department.view', 'View Departments', 
            'Allows viewing department information', 'View', 'Department',
            NOW(), NOW(), v_admin_user_id, v_admin_user_id, 'active'
        );
        RAISE NOTICE 'Created department.view permission: %', v_permission_id;

        -- Assign to admin role
        INSERT INTO "role_permission" ("Id", "RoleId", "PermissionId", "TenantId", "CreatedAt", "UpdatedAt", "CreatedByUserId", "UpdatedByUserId", "Status")
        VALUES (gen_random_uuid(), v_admin_role_id, v_permission_id, v_tenant_id, NOW(), NOW(), v_admin_user_id, v_admin_user_id, 'active')
        ON CONFLICT DO NOTHING;
        RAISE NOTICE 'Assigned department.view to Admin role';
    ELSE
        RAISE NOTICE 'department.view already exists';
    END IF;

END $$;

-- Verify all permissions are assigned to admin
SELECT 
    COUNT(*) as total_view_permissions_for_admin,
    STRING_AGG(p."Code", ', ') as permission_codes
FROM "role_permission" rp
JOIN "permissions" p ON p."Id" = rp."PermissionId"
JOIN "role" r ON r."Id" = rp."RoleId"
WHERE r."Name" = 'Admin' 
  AND r."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND p."Code" IN ('patient.view', 'user.view', 'department.view', 
                   'appointment.view', 'appointment.create', 'appointment.update', 
                   'appointment.cancel', 'appointment.delete');
