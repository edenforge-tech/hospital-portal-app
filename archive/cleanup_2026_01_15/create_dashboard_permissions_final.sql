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
  
  -- Check if dashboard.view permission exists
  SELECT id INTO v_dashboard_view_id FROM permissions WHERE "Code" = 'dashboard.view';
  
  -- Create permission if it doesn't exist
  IF v_dashboard_view_id IS NULL THEN
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
      "UpdatedAt",
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
      NOW(),
      v_admin_user_id,
      v_tenant_id
    ) RETURNING id INTO v_dashboard_view_id;
    
    RAISE NOTICE 'Created dashboard.view permission';
  ELSE
    RAISE NOTICE 'dashboard.view permission already exists';
  END IF;
  
  -- Assign permission to Receptionist role
  IF NOT EXISTS (
    SELECT 1 FROM role_permission 
    WHERE "RoleId" = v_role_id AND "PermissionId" = v_dashboard_view_id
  ) THEN
    INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
    VALUES (gen_random_uuid(), v_role_id, v_dashboard_view_id, NOW());
    RAISE NOTICE 'Assigned dashboard.view to Receptionist role';
  ELSE
    RAISE NOTICE 'Permission already assigned to Receptionist role';
  END IF;
  
  -- Enable MFA for receptionist6
  UPDATE users 
  SET two_factor_enabled = true
  WHERE email = 'receptionist6@hospital.com';
  
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
