-- Step 1: Check current Admin role permissions
SELECT ar.name as role_name, p."Code" as permission_code 
FROM app_roles ar 
JOIN role_permission rp ON ar.id = rp."RoleId" 
JOIN permissions p ON rp."PermissionId" = p.id 
WHERE ar.tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e' 
  AND ar.name = 'Admin' 
ORDER BY p."Code";

-- Step 2: Add wildcard permission if not exists
INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
SELECT 
    gen_random_uuid(),
    ar.id,
    p.id,
    NOW()
FROM app_roles ar
CROSS JOIN permissions p
WHERE ar.tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
  AND ar.name = 'Admin'
  AND p."Code" = '*'
  AND NOT EXISTS (
    SELECT 1 FROM role_permission rp
    WHERE rp."RoleId" = ar.id AND rp."PermissionId" = p.id
  );

-- Step 3: Also add patient.view permission specifically
INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
SELECT 
    gen_random_uuid(),
    ar.id,
    p.id,
    NOW()
FROM app_roles ar
CROSS JOIN permissions p
WHERE ar.tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
  AND ar.name = 'Admin'
  AND p."Code" = 'patient.view'
  AND NOT EXISTS (
    SELECT 1 FROM role_permission rp
    WHERE rp."RoleId" = ar.id AND rp."PermissionId" = p.id
  );

-- Step 4: Verify permissions were added
SELECT ar.name as role_name, p."Code" as permission_code 
FROM app_roles ar 
JOIN role_permission rp ON ar.id = rp."RoleId" 
JOIN permissions p ON rp."PermissionId" = p.id 
WHERE ar.tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e' 
  AND ar.name = 'Admin' 
ORDER BY p."Code";
