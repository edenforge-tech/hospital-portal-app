-- Create dashboard permissions and assign to Receptionist role

DO $$
DECLARE
  v_role_id UUID;
  v_tenant_id UUID;
  v_admin_user_id UUID;
  v_dashboard_view_id UUID;
BEGIN
  -- Get first tenant ID
  SELECT id INTO v_tenant_id FROM tenant LIMIT 1;
  
  -- Get admin user ID for created_by
  SELECT id INTO v_admin_user_id FROM users WHERE email = 'admin@test.com' LIMIT 1;
  
  -- Get Receptionist role ID
  SELECT id INTO v_role_id FROM app_roles WHERE name = 'Receptionist' LIMIT 1;
  
  -- Create dashboard.view permission
  INSERT INTO permissions (
    id,
    "Code",
    "Name",
    "Description",
    "Module",
    "ResourceType",
    "Action",
    "Scope",
    "IsActive",
    "IsSystemPermission",
    "CreatedAt",
    "CreatedBy",
    "TenantId"
  ) VALUES (
    gen_random_uuid(),
    'dashboard.view',
    'View Dashboard',
    'Allows viewing dashboard and analytics',
    'Dashboard',
    'Dashboard',
    'View',
    'Tenant',
    true,
    true,
    NOW(),
    v_admin_user_id,
    v_tenant_id
  ) ON CONFLICT ("Code") DO UPDATE 
    SET "IsActive" = true
  RETURNING id INTO v_dashboard_view_id;
  
  -- Assign permission to Receptionist role
  INSERT INTO role_permission ("RoleId", "PermissionId", "CreatedAt")
  VALUES (v_role_id, v_dashboard_view_id, NOW())
  ON CONFLICT ("RoleId", "PermissionId") DO NOTHING;
  
  -- Also enable MFA for receptionist6
  UPDATE users 
  SET two_factor_enabled = true
  WHERE email = 'receptionist6@hospital.com';
  
  RAISE NOTICE 'Dashboard permission created and assigned to Receptionist role';
  RAISE NOTICE 'MFA enabled for receptionist6@hospital.com';
END $$;

-- Verify the setup
SELECT 
  u.email,
  u.two_factor_enabled as mfa_enabled,
  r.name as role_name,
  p."Code" as permission_code,
  p."Name" as permission_name
FROM users u
INNER JOIN app_user_roles aur ON u.id = aur.user_id
INNER JOIN app_roles r ON aur.role_id = r.id
LEFT JOIN role_permission rp ON r.id = rp."RoleId"
LEFT JOIN permissions p ON rp."PermissionId" = p.id
WHERE u.email = 'receptionist6@hospital.com';
