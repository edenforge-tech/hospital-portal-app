-- Fix MFA and assign dashboard permissions to Receptionist role

-- 1. Enable MFA for receptionist6
UPDATE users 
SET two_factor_enabled = true
WHERE email = 'receptionist6@hospital.com';

-- 2. Find dashboard permissions that should be assigned to Receptionist
-- First, let's see what dashboard permissions exist
SELECT 
  id,
  "Code",
  "Name",
  "Description"
FROM permissions 
WHERE "Code" LIKE 'dashboard%' 
  AND "IsActive" = true
ORDER BY "Code";

-- 3. Assign dashboard.view permission to Receptionist role
-- Get role ID and permission ID first
DO $$
DECLARE
  v_role_id UUID;
  v_permission_id UUID;
BEGIN
  -- Get Receptionist role ID
  SELECT id INTO v_role_id 
  FROM app_roles 
  WHERE name = 'Receptionist'
  LIMIT 1;
  
  -- Get dashboard.view permission ID
  SELECT id INTO v_permission_id 
  FROM permissions 
  WHERE "Code" = 'dashboard.view'
  LIMIT 1;
  
  -- Assign permission to role (if not already assigned)
  IF v_role_id IS NOT NULL AND v_permission_id IS NOT NULL THEN
    INSERT INTO role_permission ("RoleId", "PermissionId", "CreatedAt")
    VALUES (v_role_id, v_permission_id, NOW())
    ON CONFLICT ("RoleId", "PermissionId") DO NOTHING;
    
    RAISE NOTICE 'Assigned dashboard.view permission to Receptionist role';
  ELSE
    RAISE NOTICE 'Role or Permission not found';
  END IF;
END $$;

-- Verify the fix
SELECT 
  u.email,
  u.two_factor_enabled,
  r.name as role_name,
  p."Code" as permission_code
FROM users u
LEFT JOIN app_user_roles aur ON u.id = aur.user_id
LEFT JOIN app_roles r ON aur.role_id = r.id
LEFT JOIN role_permission rp ON r.id = rp."RoleId"
LEFT JOIN permissions p ON rp."PermissionId" = p.id
WHERE u.email = 'receptionist6@hospital.com'
  AND p."Code" LIKE 'dashboard%';
