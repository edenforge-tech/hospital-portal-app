-- Add License Permissions - FINAL VERSION

INSERT INTO permission (id, code, name, description, module, resource, action, is_active, created_at, updated_at)
VALUES
    (gen_random_uuid(), 'LICENSE_VIEW', 'license.view', 'View professional licenses', 'license', 'license', 'view', true, NOW(), NOW()),
    (gen_random_uuid(), 'LICENSE_CREATE', 'license.create', 'Create professional licenses', 'license', 'license', 'create', true, NOW(), NOW()),
    (gen_random_uuid(), 'LICENSE_UPDATE', 'license.update', 'Update professional licenses', 'license', 'license', 'update', true, NOW(), NOW()),
    (gen_random_uuid(), 'LICENSE_DELETE', 'license.delete', 'Delete professional licenses', 'license', 'license', 'delete', true, NOW(), NOW()),
    (gen_random_uuid(), 'LICENSE_STATS', 'license.statistics', 'View license statistics', 'license', 'license', 'view', true, NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET updated_at = NOW(), is_active = true;

-- Show added permissions
SELECT name, description, resource, action, is_active
FROM permission
WHERE name LIKE 'license.%'
ORDER BY name;
