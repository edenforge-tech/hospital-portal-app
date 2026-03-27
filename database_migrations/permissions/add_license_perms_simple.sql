-- Add License Permissions - SIMPLE VERSION
-- Just add the permissions, we'll verify user has them separately

DO $$
DECLARE
    admin_tenant_id UUID := '155fe198-6ae5-4a01-9254-ead5b427247e';
BEGIN
    -- Insert license permissions
    INSERT INTO permission (id, tenant_id, name, description, resource, action, created_at, updated_at, status)
    VALUES
        (gen_random_uuid(), admin_tenant_id, 'license.view', 'View professional licenses', 'license', 'view', NOW(), NOW(), 'active'),
        (gen_random_uuid(), admin_tenant_id, 'license.create', 'Create professional licenses', 'license', 'create', NOW(), NOW(), 'active'),
        (gen_random_uuid(), admin_tenant_id, 'license.update', 'Update professional licenses', 'license', 'update', NOW(), NOW(), 'active'),
        (gen_random_uuid(), admin_tenant_id, 'license.delete', 'Delete professional licenses', 'license', 'delete', NOW(), NOW(), 'active'),
        (gen_random_uuid(), admin_tenant_id, 'license.statistics', 'View license statistics', 'license', 'statistics', NOW(), NOW(), 'active')
    ON CONFLICT (name, tenant_id) DO UPDATE SET updated_at = NOW();

    RAISE NOTICE '✓ License permissions added/updated';

END $$;

-- Show added permissions
SELECT name, description, resource, action, status
FROM permission
WHERE name LIKE 'license.%'
ORDER BY name;
