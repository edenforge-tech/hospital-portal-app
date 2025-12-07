-- ============================================
-- EXPAND ROLE-PERMISSION MAPPINGS
-- Assign permissions to roles that currently have none
-- ============================================

DO $$
DECLARE
    v_billing_clerk_role_id UUID := '92e0b364-3775-4461-8267-dd29610cf420';
    v_lab_manager_role_id UUID;
    v_radiology_tech_role_id UUID;
    v_security_officer_role_id UUID;
    v_tenant_id UUID := '11111111-1111-1111-1111-111111111111';
BEGIN
    -- Get other role IDs
    SELECT id INTO v_lab_manager_role_id FROM app_roles WHERE name = 'Lab Manager';
    SELECT id INTO v_radiology_tech_role_id FROM app_roles WHERE name = 'Radiology Technician';
    SELECT id INTO v_security_officer_role_id FROM app_roles WHERE name = 'Security Officer';

    -- ============================================
    -- BILLING CLERK PERMISSIONS
    -- ============================================

    -- Administration permissions (billing related)
    INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
    SELECT
        gen_random_uuid(),
        v_billing_clerk_role_id,
        p.id,
        NOW()
    FROM permissions p
    WHERE p."Module" = 'Administration'
       OR p."Name" LIKE '%Bill%'
       OR p."Name" LIKE '%Payment%'
       OR p."Name" LIKE '%Insurance%'
       OR p."Name" LIKE '%Financial%';

    -- ============================================
    -- LAB MANAGER PERMISSIONS
    -- ============================================

    -- Lab-related permissions
    INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
    SELECT
        gen_random_uuid(),
        v_lab_manager_role_id,
        p.id,
        NOW()
    FROM permissions p
    WHERE p."Module" IN ('Clinical Assessment', 'Quality Assurance')
       OR p."Name" LIKE '%Lab%'
       OR p."Name" LIKE '%Test%'
       OR p."Name" LIKE '%Sample%';

    -- ============================================
    -- RADIOLOGY TECHNICIAN PERMISSIONS
    -- ============================================

    -- Radiology-related permissions
    INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
    SELECT
        gen_random_uuid(),
        v_radiology_tech_role_id,
        p.id,
        NOW()
    FROM permissions p
    WHERE p."Module" = 'Radiology'
       OR p."Name" LIKE '%Imaging%'
       OR p."Name" LIKE '%Radiology%'
       OR p."Name" LIKE '%X-Ray%'
       OR p."Name" LIKE '%Scan%';

    -- ============================================
    -- SECURITY OFFICER PERMISSIONS
    -- ============================================

    -- Basic system access permissions
    INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
    SELECT
        gen_random_uuid(),
        v_security_officer_role_id,
        p.id,
        NOW()
    FROM permissions p
    WHERE p."Module" = 'System Settings'
       AND (p."Name" LIKE '%View%' OR p."Name" LIKE '%Access%' OR p."Name" LIKE '%Security%');

    RAISE NOTICE 'Role-permission mappings expanded for missing roles';
END $$;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check updated permission distribution
SELECT
    ar.name as role_name,
    COUNT(rp.id) as permission_count,
    ROUND(COUNT(rp.id)::numeric / 154 * 100, 1) as percentage_of_total
FROM app_roles ar
LEFT JOIN role_permission rp ON ar.id = rp."RoleId"
GROUP BY ar.id, ar.name
ORDER BY permission_count DESC;