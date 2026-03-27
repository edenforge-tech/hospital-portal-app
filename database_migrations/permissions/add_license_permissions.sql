-- Add License Management Permissions
-- These permissions are required for the LicenseController endpoints

DO $$
DECLARE
    admin_tenant_id UUID := '155fe198-6ae5-4a01-9254-ead5b427247e';
    super_admin_role_id UUID;
BEGIN
    -- Get Super Admin role ID
    SELECT id INTO super_admin_role_id 
    FROM role_definition 
    WHERE UPPER(name) = 'SUPER ADMIN' 
    LIMIT 1;

    -- Insert license permissions
    INSERT INTO permission (id, tenant_id, name, description, resource, action, created_at, updated_at, status)
    VALUES
        (gen_random_uuid(), admin_tenant_id, 'license.view', 'View professional licenses', 'license', 'view', NOW(), NOW(), 'active'),
        (gen_random_uuid(), admin_tenant_id, 'license.create', 'Create professional licenses', 'license', 'create', NOW(), NOW(), 'active'),
        (gen_random_uuid(), admin_tenant_id, 'license.update', 'Update professional licenses', 'license', 'update', NOW(), NOW(), 'active'),
        (gen_random_uuid(), admin_tenant_id, 'license.delete', 'Delete professional licenses', 'license', 'delete', NOW(), NOW(), 'active'),
        (gen_random_uuid(), admin_tenant_id, 'license.statistics', 'View license statistics', 'license', 'statistics', NOW(), NOW(), 'active')
    ON CONFLICT (name, tenant_id) DO NOTHING;

    RAISE NOTICE '✓ License permissions added';

    -- Map all license permissions to Super Admin role
    INSERT INTO role_permission (role_id, permission_id)
    SELECT super_admin_role_id, p.id
    FROM permission p
    WHERE p.name LIKE 'license.%'
    AND p.tenant_id = admin_tenant_id
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '✓ License permissions mapped to Super Admin role';

END $$;

-- Verify
SELECT p.name, p.description, COUNT(rp.permission_id) as role_count
FROM permission p
LEFT JOIN role_permission rp ON rp.permission_id = p.id
WHERE p.name LIKE 'license.%'
GROUP BY p.id, p.name, p.description
ORDER BY p.name;
