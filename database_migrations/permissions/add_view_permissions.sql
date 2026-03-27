-- Simple direct INSERT for missing view permissions
SET app.current_tenant_id = '11111111-1111-1111-1111-111111111111';

-- patient.view
INSERT INTO permissions (id, "TenantId", "Code", "Name", "Description", "Action", "ResourceType", "CreatedAt", "UpdatedAt", "CreatedBy", "UpdatedBy", "IsSystemPermission", "IsActive")
VALUES (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'patient.view', 'View Patients', 'Allows viewing patient information', 'View', 'Patient', NOW(), NOW(), '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', true, true)
ON CONFLICT (id) DO NOTHING;

-- user.view
INSERT INTO permissions (id, "TenantId", "Code", "Name", "Description", "Action", "ResourceType", "CreatedAt", "UpdatedAt", "CreatedBy", "UpdatedBy", "IsSystemPermission", "IsActive")
VALUES (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'user.view', 'View Users', 'Allows viewing user/staff information', 'View', 'User', NOW(), NOW(), '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', true, true)
ON CONFLICT (id) DO NOTHING;

-- department.view
INSERT INTO permissions (id, "TenantId", "Code", "Name", "Description", "Action", "ResourceType", "CreatedAt", "UpdatedAt", "CreatedBy", "UpdatedBy", "IsSystemPermission", "IsActive")
VALUES (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'department.view', 'View Departments', 'Allows viewing department information', 'View', 'Department', NOW(), NOW(), '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', true, true)
ON CONFLICT (id) DO NOTHING;

-- Get permission IDs for role assignment
DO $$
DECLARE
    v_patient_perm_id UUID;
    v_user_perm_id UUID;
    v_dept_perm_id UUID;
    v_admin_role_id UUID;
    v_tenant_id UUID := '11111111-1111-1111-1111-111111111111';
BEGIN
    -- Get permission IDs
    SELECT id INTO v_patient_perm_id FROM permissions WHERE "Code" = 'patient.view' AND "TenantId" = v_tenant_id;
    SELECT id INTO v_user_perm_id FROM permissions WHERE "Code" = 'user.view' AND "TenantId" = v_tenant_id;
    SELECT id INTO v_dept_perm_id FROM permissions WHERE "Code" = 'department.view' AND "TenantId" = v_tenant_id;
    
    -- Get admin role ID
    SELECT id INTO v_admin_role_id FROM app_roles WHERE "RoleCode" = 'admin' AND tenant_id = v_tenant_id LIMIT 1;
    
    RAISE NOTICE 'Admin Role ID: %', v_admin_role_id;
    RAISE NOTICE 'Patient Perm ID: %', v_patient_perm_id;
    
    -- Assign to admin role
    IF v_admin_role_id IS NOT NULL AND v_patient_perm_id IS NOT NULL THEN
        INSERT INTO role_permission (id, role_id, permission_id, tenant_id, created_at, updated_at)
        VALUES (gen_random_uuid(), v_admin_role_id, v_patient_perm_id, v_tenant_id, NOW(), NOW())
        ON CONFLICT DO NOTHING;
        RAISE NOTICE 'Assigned patient.view to admin';
    END IF;
    
    IF v_admin_role_id IS NOT NULL AND v_user_perm_id IS NOT NULL THEN
        INSERT INTO role_permission (id, role_id, permission_id, tenant_id, created_at, updated_at)
        VALUES (gen_random_uuid(), v_admin_role_id, v_user_perm_id, v_tenant_id, NOW(), NOW())
        ON CONFLICT DO NOTHING;
        RAISE NOTICE 'Assigned user.view to admin';
    END IF;
    
    IF v_admin_role_id IS NOT NULL AND v_dept_perm_id IS NOT NULL THEN
        INSERT INTO role_permission (id, role_id, permission_id, tenant_id, created_at, updated_at)
        VALUES (gen_random_uuid(), v_admin_role_id, v_dept_perm_id, v_tenant_id, NOW(), NOW())
        ON CONFLICT DO NOTHING;
        RAISE NOTICE 'Assigned department.view to admin';
    END IF;
END $$;

-- Verify
SELECT "Code", "Name", "Action", "ResourceType"
FROM permissions  
WHERE "Code" IN ('patient.view', 'user.view', 'department.view')
  AND "TenantId" = '11111111-1111-1111-1111-111111111111';
