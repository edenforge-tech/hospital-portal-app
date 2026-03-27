-- =====================================================
-- MAP REMAINING 5 UNMAPPED ROLES
-- =====================================================

DO $$
DECLARE
    v_total_new_mappings INT := 0;
    v_batch_count INT;
BEGIN
    RAISE NOTICE 'Mapping permissions for remaining 5 roles...';
    
    -- =====================================================
    -- 1. RADIOLOGIST - Full clinical + imaging permissions
    -- =====================================================
    INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
    SELECT gen_random_uuid(), ar.id, p.id, NOW()
    FROM app_roles ar
    CROSS JOIN permissions p
    WHERE ar."RoleCode" = 'RADIOLOGIST'
      AND p."IsActive" = true
      AND (p."Module" ILIKE '%patient%'
           OR p."Module" ILIKE '%appointment%'
           OR p."Module" ILIKE '%medical%'
           OR p."Module" ILIKE '%clinical%'
           OR p."Module" ILIKE '%radiology%'
           OR p."Module" ILIKE '%imaging%'
           OR p."Module" ILIKE '%record%'
           OR p."Module" ILIKE '%lab%'
           OR p."Module" ILIKE 'dashboard%'
           OR p."Code" ILIKE 'patient.%'
           OR p."Code" ILIKE 'appointment.%'
           OR p."Code" ILIKE 'imaging.%')
      AND NOT EXISTS (
          SELECT 1 FROM role_permission rp 
          WHERE rp."RoleId" = ar.id AND rp."PermissionId" = p.id
      );
    GET DIAGNOSTICS v_batch_count = ROW_COUNT;
    v_total_new_mappings := v_total_new_mappings + v_batch_count;
    RAISE NOTICE 'RADIOLOGIST: % permissions mapped', v_batch_count;
    
    -- =====================================================
    -- 2. SECURITY - Dashboard + basic access control
    -- =====================================================
    INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
    SELECT gen_random_uuid(), ar.id, p.id, NOW()
    FROM app_roles ar
    CROSS JOIN permissions p
    WHERE ar."RoleCode" = 'SECURITY'
      AND p."IsActive" = true
      AND (p."Code" = 'dashboard.view'
           OR p."Code" ILIKE 'device.view%'
           OR p."Code" ILIKE 'session.view%')
      AND NOT EXISTS (
          SELECT 1 FROM role_permission rp 
          WHERE rp."RoleId" = ar.id AND rp."PermissionId" = p.id
      );
    GET DIAGNOSTICS v_batch_count = ROW_COUNT;
    v_total_new_mappings := v_total_new_mappings + v_batch_count;
    RAISE NOTICE 'SECURITY: % permissions mapped', v_batch_count;
    
    -- =====================================================
    -- 3. SR_DOCTOR - All clinical permissions
    -- =====================================================
    INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
    SELECT gen_random_uuid(), ar.id, p.id, NOW()
    FROM app_roles ar
    CROSS JOIN permissions p
    WHERE ar."RoleCode" = 'SR_DOCTOR'
      AND p."IsActive" = true
      AND (p."Module" ILIKE '%patient%'
           OR p."Module" ILIKE '%appointment%'
           OR p."Module" ILIKE '%medical%'
           OR p."Module" ILIKE '%clinical%'
           OR p."Module" ILIKE '%prescription%'
           OR p."Module" ILIKE '%record%'
           OR p."Module" ILIKE '%lab%'
           OR p."Module" ILIKE 'dashboard%'
           OR p."Code" ILIKE 'patient.%'
           OR p."Code" ILIKE 'appointment.%'
           OR p."Code" ILIKE 'prescription.%')
      AND NOT EXISTS (
          SELECT 1 FROM role_permission rp 
          WHERE rp."RoleId" = ar.id AND rp."PermissionId" = p.id
      );
    GET DIAGNOSTICS v_batch_count = ROW_COUNT;
    v_total_new_mappings := v_total_new_mappings + v_batch_count;
    RAISE NOTICE 'SR_DOCTOR: % permissions mapped', v_batch_count;
    
    -- =====================================================
    -- 4. SR_NURSE - Clinical (no prescriptions)
    -- =====================================================
    INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
    SELECT gen_random_uuid(), ar.id, p.id, NOW()
    FROM app_roles ar
    CROSS JOIN permissions p
    WHERE ar."RoleCode" = 'SR_NURSE'
      AND p."IsActive" = true
      AND (p."Module" ILIKE '%patient%'
           OR p."Module" ILIKE '%appointment%'
           OR p."Module" ILIKE '%medical%'
           OR p."Module" ILIKE '%clinical%'
           OR p."Module" ILIKE '%record%'
           OR p."Module" ILIKE '%lab%'
           OR p."Module" ILIKE 'dashboard%'
           OR p."Code" ILIKE 'patient.%'
           OR p."Code" ILIKE 'appointment.%')
      AND p."Code" NOT ILIKE '%prescription.create%'
      AND p."Code" NOT ILIKE '%prescription.approve%'
      AND NOT EXISTS (
          SELECT 1 FROM role_permission rp 
          WHERE rp."RoleId" = ar.id AND rp."PermissionId" = p.id
      );
    GET DIAGNOSTICS v_batch_count = ROW_COUNT;
    v_total_new_mappings := v_total_new_mappings + v_batch_count;
    RAISE NOTICE 'SR_NURSE: % permissions mapped', v_batch_count;
    
    -- =====================================================
    -- 5. UNNAMED ROLE (Doctor Assistant) - Limited clinical
    -- =====================================================
    INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
    SELECT gen_random_uuid(), ar.id, p.id, NOW()
    FROM app_roles ar
    CROSS JOIN permissions p
    WHERE ar."RoleCode" = '' OR ar."RoleCode" IS NULL
      AND p."IsActive" = true
      AND (p."Module" ILIKE 'dashboard%'
           OR p."Code" ILIKE 'patient.view%'
           OR p."Code" ILIKE 'appointment.view%')
      AND NOT EXISTS (
          SELECT 1 FROM role_permission rp 
          WHERE rp."RoleId" = ar.id AND rp."PermissionId" = p.id
      );
    GET DIAGNOSTICS v_batch_count = ROW_COUNT;
    v_total_new_mappings := v_total_new_mappings + v_batch_count;
    RAISE NOTICE 'Doctor Assistant (unnamed): % permissions mapped', v_batch_count;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'TOTAL NEW MAPPINGS CREATED: %', v_total_new_mappings;
    RAISE NOTICE '========================================';
END $$;

-- Final verification
SELECT 
    'Total Roles' as metric,
    COUNT(*) as count
FROM app_roles WHERE "IsActive" = true
UNION ALL
SELECT 
    'Total Permissions',
    COUNT(*)
FROM permissions WHERE "IsActive" = true
UNION ALL
SELECT 
    'Total Mappings',
    COUNT(*)
FROM role_permission
UNION ALL
SELECT 
    'Roles with Permissions',
    COUNT(DISTINCT "RoleId")
FROM role_permission
UNION ALL
SELECT 
    'Roles WITHOUT Permissions',
    COUNT(*)
FROM app_roles ar
LEFT JOIN role_permission rp ON ar.id = rp."RoleId"
WHERE ar."IsActive" = true AND rp.id IS NULL;
