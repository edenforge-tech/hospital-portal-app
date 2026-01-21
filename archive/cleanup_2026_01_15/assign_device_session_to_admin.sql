-- ============================================
-- Assign Device & Session Permissions to Admin Role
-- ============================================

DO $$
DECLARE
    admin_role_id UUID;
    perm_record RECORD;
    assigned_count INTEGER := 0;
BEGIN
    -- Find the Admin role from app_roles
    SELECT id INTO admin_role_id FROM app_roles WHERE name = 'Admin' LIMIT 1;
    
    IF admin_role_id IS NULL THEN
        RAISE EXCEPTION 'Admin role not found in app_roles table';
    END IF;
    
    RAISE NOTICE 'Found Admin role with ID: %', admin_role_id;
    
    -- Assign all device and session management permissions
    FOR perm_record IN 
        SELECT id, "Code", "Name" FROM permissions 
        WHERE "Module" IN ('device_management', 'session_management')
    LOOP
        INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
        VALUES (gen_random_uuid(), admin_role_id, perm_record.id, NOW());
        
        assigned_count := assigned_count + 1;
        RAISE NOTICE '  ✓ Assigned permission: % (%)', perm_record."Name", perm_record."Code";
    END LOOP;
    
    RAISE NOTICE '============================================';
    RAISE NOTICE '✅ SUCCESS: Assigned % permissions to Admin role!', assigned_count;
    RAISE NOTICE '============================================';
END $$;

-- Verify the assignments
SELECT 
    r.name AS "Role",
    p."Code" AS "Permission Code",
    p."Name" AS "Permission Name",
    p."Module" AS "Module"
FROM role_permission rp
JOIN app_roles r ON rp."RoleId" = r.id
JOIN permissions p ON rp."PermissionId" = p.id
WHERE p."Module" IN ('device_management', 'session_management')
ORDER BY p."Module", p."Code";
