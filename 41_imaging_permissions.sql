-- =============================================
-- 41_imaging_permissions.sql
-- Adds imaging module permissions
-- =============================================

-- Imaging Upload Permission
INSERT INTO permissions (id, "TenantId", "Code", "Name", "Description", "Module", "Action", "ResourceType", "IsActive", "CreatedAt", "UpdatedAt")
SELECT 
  gen_random_uuid(),
  (SELECT id FROM tenant LIMIT 1),
  'imaging.upload',
  'Upload Medical Images',
  'Upload medical images (DICOM, X-ray, CT, MRI, etc.)',
  'imaging',
  'upload',
  'image',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE "Code" = 'imaging.upload');

-- Imaging Annotate Permission
INSERT INTO permissions (id, "TenantId", "Code", "Name", "Description", "Module", "Action", "ResourceType", "IsActive", "CreatedAt", "UpdatedAt")
SELECT 
  gen_random_uuid(),
  (SELECT id FROM tenant LIMIT 1),
  'imaging.annotate',
  'Annotate Medical Images',
  'Add annotations (measurements, findings) to medical images',
  'imaging',
  'annotate',
  'image',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE "Code" = 'imaging.annotate');

-- Imaging Export Permission
INSERT INTO permissions (id, "TenantId", "Code", "Name", "Description", "Module", "Action", "ResourceType", "IsActive", "CreatedAt", "UpdatedAt")
SELECT 
  gen_random_uuid(),
  (SELECT id FROM tenant LIMIT 1),
  'imaging.export',
  'Export Medical Images',
  'Export medical images and reports (PDF, DICOM)',
  'imaging',
  'export',
  'image',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE "Code" = 'imaging.export');

-- Imaging View Permission
INSERT INTO permissions (id, "TenantId", "Code", "Name", "Description", "Module", "Action", "ResourceType", "IsActive", "CreatedAt", "UpdatedAt")
SELECT 
  gen_random_uuid(),
  (SELECT id FROM tenant LIMIT 1),
  'imaging.view',
  'View Medical Images',
  'View medical images in DICOM viewer',
  'imaging',
  'view',
  'image',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE "Code" = 'imaging.view');

-- Assign imaging permissions to Doctor role
INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
SELECT 
  gen_random_uuid(),
  (SELECT id FROM app_roles WHERE name = 'Doctor' LIMIT 1),
  p.id,
  CURRENT_TIMESTAMP
FROM permissions p
WHERE p."Code" IN ('imaging.upload', 'imaging.annotate', 'imaging.export', 'imaging.view')
  AND NOT EXISTS (
    SELECT 1 FROM role_permission rp 
    WHERE rp."RoleId" = (SELECT id FROM app_roles WHERE name = 'Doctor' LIMIT 1) 
      AND rp."PermissionId" = p.id
  );

-- Assign imaging permissions to Radiologist role (if exists)
INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
SELECT 
  gen_random_uuid(),
  r.id,
  p.id,
  CURRENT_TIMESTAMP
FROM permissions p
CROSS JOIN app_roles r
WHERE p."Code" IN ('imaging.upload', 'imaging.annotate', 'imaging.export', 'imaging.view')
  AND r.name = 'Radiologist'
  AND NOT EXISTS (
    SELECT 1 FROM role_permission rp 
    WHERE rp."RoleId" = r.id AND rp."PermissionId" = p.id
  );

-- Assign imaging view permission to Nurse role
INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
SELECT 
  gen_random_uuid(),
  (SELECT id FROM app_roles WHERE name = 'Nurse' LIMIT 1),
  p.id,
  CURRENT_TIMESTAMP
FROM permissions p
WHERE p."Code" = 'imaging.view'
  AND NOT EXISTS (
    SELECT 1 FROM role_permission rp 
    WHERE rp."RoleId" = (SELECT id FROM app_roles WHERE name = 'Nurse' LIMIT 1) 
      AND rp."PermissionId" = p.id
  );

-- Verify permissions created
SELECT "Code", "Name", "Description", "Module", "Action", "IsActive" 
FROM permissions 
WHERE "Code" LIKE 'imaging%'
ORDER BY "Code";
