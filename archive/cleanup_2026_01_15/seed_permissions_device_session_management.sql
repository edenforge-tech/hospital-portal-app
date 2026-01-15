-- ============================================
-- Seed Script: DEVICE & SESSION MANAGEMENT PERMISSIONS (14 permissions)
-- Modules: device_management, session_management
-- Created: Current Date
-- Purpose: Add missing permissions for 100% HIPAA compliance
-- ============================================

-- ============================================
-- DEVICE MANAGEMENT (7 permissions)
-- ============================================
-- Note: Using current tenant_id from settings (multi-tenancy)
DO $$
DECLARE
    current_tenant UUID;
BEGIN
    -- Get the first tenant (or default tenant)
    SELECT id INTO current_tenant FROM tenant LIMIT 1;
    
    IF current_tenant IS NULL THEN
        RAISE EXCEPTION 'No tenant found in database. Please create a tenant first.';
    END IF;
    
    INSERT INTO permissions (id, "TenantId", "Code", "Name", "Module", "Description", "IsActive", "CreatedAt", "UpdatedAt") VALUES
    (gen_random_uuid(), current_tenant, 'device.view', 'View Devices', 'device_management', 'View registered devices', true, NOW(), NOW()),
    (gen_random_uuid(), current_tenant, 'device.create', 'Register Device', 'device_management', 'Register new devices', true, NOW(), NOW()),
    (gen_random_uuid(), current_tenant, 'device.update', 'Update Device', 'device_management', 'Modify device settings', true, NOW(), NOW()),
    (gen_random_uuid(), current_tenant, 'device.delete', 'Delete Device', 'device_management', 'Remove registered devices', true, NOW(), NOW()),
    (gen_random_uuid(), current_tenant, 'device.block', 'Block Device', 'device_management', 'Block suspicious devices (Admin)', true, NOW(), NOW()),
    (gen_random_uuid(), current_tenant, 'device.trust_level', 'Manage Device Trust', 'device_management', 'Update device trust level', true, NOW(), NOW()),
    (gen_random_uuid(), current_tenant, 'device.set_primary', 'Set Primary Device', 'device_management', 'Mark device as primary', true, NOW(), NOW())
    ON CONFLICT ("Code") DO NOTHING;
    
    RAISE NOTICE '✓ Device Management permissions created with TenantId: %', current_tenant;
END $$;

-- ============================================
-- SESSION MANAGEMENT (7 permissions)
-- ============================================
INSERT INTO permissions (id, code, name, module, action, resource_type, scope, description, is_system_permission, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'session.view', 'View Sessions', 'session_management', 'read', 'session', 'own', 'View active sessions', true, true, NOW(), NOW()),
(gen_random_uuid(), 'session.terminate', 'Terminate Session', 'session_management', 'delete', 'session', 'own', 'End individual sessions', true, true, NOW(), NOW()),
(gen_random_uuid(), 'session.terminate_all', 'Terminate All Sessions', 'session_management', 'delete', 'session', 'own', 'End all other sessions', true, true, NOW(), NOW()),
(gen_random_uuid(), 'session.refresh', 'Refresh Session', 'session_management', 'update', 'session', 'own', 'Extend session lifetime', true, true, NOW(), NOW()),
(gen_random_uuid(), 'session.mark_suspicious', 'Mark Suspicious Session', 'session_management', 'update', 'session', 'tenant', 'Flag suspicious activity (Admin)', true, true, NOW(), NOW()),
(gen_random_uuid(), 'session.cleanup', 'Cleanup Sessions', 'session_management', 'delete', 'session', 'tenant', 'Remove expired sessions (Admin)', true, true, NOW(), NOW()),
(gen_random_uuid(), 'session.view_all', 'View All User Sessions', 'session_management', 'read', 'session', 'tenant', 'View sessions across all users (Admin)', true, true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- VERIFICATION & SUMMARY
-- ============================================
DO $$
DECLARE
    device_count INTEGER;
    session_count INTEGER;
    total_new INTEGER;
BEGIN
    SELECT COUNT(*) INTO device_count FROM permissions WHERE module = 'device_management';
    SELECT COUNT(*) INTO session_count FROM permissions WHERE module = 'session_management';
    total_new := device_count + session_count;
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'DEVICE & SESSION PERMISSIONS SEEDING SUMMARY';
    RAISE NOTICE '============================================';
    RAISE NOTICE '✓ Device Management: % permissions', device_count;
    RAISE NOTICE '✓ Session Management: % permissions', session_count;
    RAISE NOTICE '--------------------------------------------';
    RAISE NOTICE '✓ TOTAL NEW PERMISSIONS: %', total_new;
    RAISE NOTICE '============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Add these permissions to Admin role';
    RAISE NOTICE '2. Grant device.view + session.view to all authenticated users';
    RAISE NOTICE '3. Restart backend service to pick up new permissions';
    RAISE NOTICE '============================================';
END $$;

-- ============================================
-- AUTO-ASSIGN TO ADMIN ROLE (If exists)
-- ============================================
DO $$
DECLARE
    admin_role_id UUID;
    new_permission_id UUID;
BEGIN
    -- Find Admin role
    SELECT id INTO admin_role_id FROM roles WHERE normalized_name = 'ADMIN' LIMIT 1;
    
    IF admin_role_id IS NOT NULL THEN
        RAISE NOTICE 'Found Admin role: %', admin_role_id;
        
        -- Assign all device management permissions
        FOR new_permission_id IN 
            SELECT id FROM permissions WHERE module = 'device_management'
        LOOP
            INSERT INTO role_permissions (role_id, permission_id, created_at)
            VALUES (admin_role_id, new_permission_id, NOW())
            ON CONFLICT DO NOTHING;
        END LOOP;
        
        -- Assign all session management permissions
        FOR new_permission_id IN 
            SELECT id FROM permissions WHERE module = 'session_management'
        LOOP
            INSERT INTO role_permissions (role_id, permission_id, created_at)
            VALUES (admin_role_id, new_permission_id, NOW())
            ON CONFLICT DO NOTHING;
        END LOOP;
        
        RAISE NOTICE '✓ Assigned 14 permissions to Admin role';
    ELSE
        RAISE NOTICE '⚠ Admin role not found - permissions created but not assigned';
    END IF;
END $$;
