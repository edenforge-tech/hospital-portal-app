-- Fix admin permissions for tenant 155fe198-6ae5-4a01-9254-ead5b427247e
-- This script grants all necessary permissions to the admin@test.com user

DO $$
DECLARE
    v_tenant_id UUID := '155fe198-6ae5-4a01-9254-ead5b427247e';
    v_admin_user_id UUID := 'dddddddd-dddd-dddd-dddd-dddddddddddd';
    v_admin_role_id UUID;
    v_permission_id UUID;
BEGIN
    -- Get or create Admin role for this tenant
    SELECT "Id" INTO v_admin_role_id 
    FROM "AspNetRoles" 
    WHERE "TenantId" = v_tenant_id 
    AND LOWER("Name") = 'admin'
    LIMIT 1;

    IF v_admin_role_id IS NULL THEN
        v_admin_role_id := 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
        INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "TenantId", "CreatedAt", "UpdatedAt", "ConcurrencyStamp")
        VALUES (v_admin_role_id, 'Admin', 'ADMIN', v_tenant_id, NOW(), NOW(), gen_random_uuid()::text)
        ON CONFLICT ("Id") DO NOTHING;
    END IF;

    -- Ensure user has admin role
    INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
    VALUES (v_admin_user_id, v_admin_role_id)
    ON CONFLICT DO NOTHING;

    -- Create appointment permissions if they don't exist
    INSERT INTO permission (id, code, name, description, module, resource, resource_type, action, scope, data_classification, tenant_id, created_at, updated_at, status)
    VALUES 
        (gen_random_uuid(), 'appointment.view', 'View Appointments', 'Can view appointments', 'Appointments', 'Appointment', 'Data', 'View', 'Global', 'PHI', v_tenant_id, NOW(), NOW(), 'active'),
        (gen_random_uuid(), 'appointment.create', 'Create Appointments', 'Can create new appointments', 'Appointments', 'Appointment', 'Data', 'Create', 'Global', 'PHI', v_tenant_id, NOW(), NOW(), 'active'),
        (gen_random_uuid(), 'appointment.update', 'Update Appointments', 'Can update appointments', 'Appointments', 'Appointment', 'Data', 'Update', 'Global', 'PHI', v_tenant_id, NOW(), NOW(), 'active'),
        (gen_random_uuid(), 'appointment.delete', 'Delete Appointments', 'Can delete appointments', 'Appointments', 'Appointment', 'Data', 'Delete', 'Global', 'PHI', v_tenant_id, NOW(), NOW(), 'active'),
        (gen_random_uuid(), 'appointment.cancel', 'Cancel Appointments', 'Can cancel appointments', 'Appointments', 'Appointment', 'Data', 'Cancel', 'Global', 'PHI', v_tenant_id, NOW(), NOW(), 'active'),
        (gen_random_uuid(), 'patient.view', 'View Patients', 'Can view patient records', 'Patients', 'Patient', 'Data', 'View', 'Global', 'PHI', v_tenant_id, NOW(), NOW(), 'active'),
        (gen_random_uuid(), 'user.view', 'View Users', 'Can view user records', 'Users', 'User', 'Data', 'View', 'Global', 'PII', v_tenant_id, NOW(), NOW(), 'active'),
        (gen_random_uuid(), 'department.view', 'View Departments', 'Can view departments', 'Departments', 'Department', 'Data', 'View', 'Global', 'Public', v_tenant_id, NOW(), NOW(), 'active')
    ON CONFLICT (code, tenant_id) DO NOTHING;

    -- Grant all these permissions to Admin role
    INSERT INTO role_permission (role_id, permission_id, granted_at, granted_by_user_id)
    SELECT v_admin_role_id, p.id, NOW(), v_admin_user_id
    FROM permission p
    WHERE p.tenant_id = v_tenant_id
    AND p.code IN ('appointment.view', 'appointment.create', 'appointment.update', 'appointment.delete', 
                   'appointment.cancel', 'patient.view', 'user.view', 'department.view')
    ON CONFLICT (role_id, permission_id) DO NOTHING;

    RAISE NOTICE 'Admin permissions configured successfully for tenant %', v_tenant_id;
END $$;
