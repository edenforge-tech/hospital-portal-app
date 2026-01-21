-- ============================================
-- Seed Script: DEVICE & SESSION MANAGEMENT PERMISSIONS (14 permissions)
-- Simplest version - Direct inserts
-- ============================================

DO $$
DECLARE
    current_tenant UUID;
BEGIN
    -- Get the first tenant
    SELECT id INTO current_tenant FROM tenant LIMIT 1;
    
    IF current_tenant IS NULL THEN
        RAISE EXCEPTION 'No tenant found in database. Please create a tenant first.';
    END IF;
    
    RAISE NOTICE 'Using TenantId: %', current_tenant;
    
    -- Device Management Permissions (7)
    INSERT INTO permissions (id, "TenantId", "Code", "Name", "Module", "Description", "IsActive", "CreatedAt", "UpdatedAt") VALUES
    (gen_random_uuid(), current_tenant, 'device.view', 'View Devices', 'device_management', 'View registered devices', true, NOW(), NOW()),
    (gen_random_uuid(), current_tenant, 'device.create', 'Register Device', 'device_management', 'Register new devices', true, NOW(), NOW()),
    (gen_random_uuid(), current_tenant, 'device.update', 'Update Device', 'device_management', 'Modify device settings', true, NOW(), NOW()),
    (gen_random_uuid(), current_tenant, 'device.delete', 'Delete Device', 'device_management', 'Remove registered devices', true, NOW(), NOW()),
    (gen_random_uuid(), current_tenant, 'device.block', 'Block Device', 'device_management', 'Block suspicious devices (Admin)', true, NOW(), NOW()),
    (gen_random_uuid(), current_tenant, 'device.trust_level', 'Manage Device Trust', 'device_management', 'Update device trust level', true, NOW(), NOW()),
    (gen_random_uuid(), current_tenant, 'device.set_primary', 'Set Primary Device', 'device_management', 'Mark device as primary', true, NOW(), NOW());
    
    RAISE NOTICE '✓ Inserted 7 device management permissions';
    
    -- Session Management Permissions (7)
    INSERT INTO permissions (id, "TenantId", "Code", "Name", "Module", "Description", "IsActive", "CreatedAt", "UpdatedAt") VALUES
    (gen_random_uuid(), current_tenant, 'session.view', 'View Sessions', 'session_management', 'View active sessions', true, NOW(), NOW()),
    (gen_random_uuid(), current_tenant, 'session.terminate', 'Terminate Session', 'session_management', 'End individual sessions', true, NOW(), NOW()),
    (gen_random_uuid(), current_tenant, 'session.terminate_all', 'Terminate All Sessions', 'session_management', 'End all other sessions', true, NOW(), NOW()),
    (gen_random_uuid(), current_tenant, 'session.refresh', 'Refresh Session', 'session_management', 'Extend session lifetime', true, NOW(), NOW()),
    (gen_random_uuid(), current_tenant, 'session.mark_suspicious', 'Mark Suspicious Session', 'session_management', 'Flag suspicious activity (Admin)', true, NOW(), NOW()),
    (gen_random_uuid(), current_tenant, 'session.cleanup', 'Cleanup Sessions', 'session_management', 'Remove expired sessions (Admin)', true, NOW(), NOW()),
    (gen_random_uuid(), current_tenant, 'session.view_all', 'View All User Sessions', 'session_management', 'View sessions across all users (Admin)', true, NOW(), NOW());
    
    RAISE NOTICE '✓ Inserted 7 session management permissions';
    RAISE NOTICE '============================================';
    RAISE NOTICE '✅ SUCCESS: 14 permissions created!';
    RAISE NOTICE '============================================';
END $$;

-- Verify the result
SELECT "Code", "Name", "Module" FROM permissions 
WHERE "Module" IN ('device_management', 'session_management')
ORDER BY "Module", "Code";
