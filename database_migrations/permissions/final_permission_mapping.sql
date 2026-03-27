-- =====================================================
-- COMPREHENSIVE ROLE-PERMISSION MAPPING (CORRECTED)
-- Maps 253 permissions to 77 roles using actual permission codes
-- =====================================================

DO $$
DECLARE
    v_total_new_mappings INT := 0;
    v_batch_count INT;
BEGIN
    RAISE NOTICE 'Starting comprehensive role-permission mapping...';
    
    -- =====================================================
    -- 1. IT ADMIN - Gets all administrative permissions
    -- =====================================================
    INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
    SELECT gen_random_uuid(), ar.id, p.id, NOW()
    FROM app_roles ar
    CROSS JOIN permissions p
    WHERE ar."RoleCode" = 'IT_ADMIN'
      AND p."IsActive" = true
      AND (p."Module" ILIKE '%admin%' 
           OR p."Module" ILIKE 'auth%'
           OR p."Module" ILIKE '%user%'
           OR p."Module" ILIKE '%role%'
           OR p."Module" ILIKE '%dashboard%'
           OR p."Module" ILIKE '%device%'
           OR p."Module" ILIKE '%session%'
           OR p."Module" ILIKE '%audit%'
           OR p."Module" ILIKE '%settings%')
      AND NOT EXISTS (
          SELECT 1 FROM role_permission rp 
          WHERE rp."RoleId" = ar.id AND rp."PermissionId" = p.id
      );
    GET DIAGNOSTICS v_batch_count = ROW_COUNT;
    v_total_new_mappings := v_total_new_mappings + v_batch_count;
    RAISE NOTICE 'IT_ADMIN: % permissions mapped', v_batch_count;
    
    -- =====================================================
    -- 2. HEALTHCARE_ADMINISTRATOR - All admin except technical
    -- =====================================================
    INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
    SELECT gen_random_uuid(), ar.id, p.id, NOW()
    FROM app_roles ar
    CROSS JOIN permissions p
    WHERE ar."RoleCode" = 'HEALTHCARE_ADMINISTRATOR'
      AND p."IsActive" = true
      AND (p."Module" ILIKE '%admin%'
           OR p."Module" ILIKE '%billing%'
           OR p."Module" ILIKE '%dashboard%'
           OR p."Module" ILIKE '%report%'
           OR p."Module" ILIKE '%branch%'
           OR p."Module" ILIKE '%department%'
           OR p."Module" ILIKE '%organization%'
           OR p."Code" ILIKE 'user.%')
      AND p."Module" NOT ILIKE '%device%'
      AND p."Module" NOT ILIKE '%session%'
      AND NOT EXISTS (
          SELECT 1 FROM role_permission rp 
          WHERE rp."RoleId" = ar.id AND rp."PermissionId" = p.id
      );
    GET DIAGNOSTICS v_batch_count = ROW_COUNT;
    v_total_new_mappings := v_total_new_mappings + v_batch_count;
    RAISE NOTICE 'HEALTHCARE_ADMINISTRATOR: % permissions mapped', v_batch_count;
    
    -- =====================================================
    -- 3. ALL CLINICAL DOCTORS/SPECIALISTS - Clinical permissions
    -- =====================================================
    INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
    SELECT gen_random_uuid(), ar.id, p.id, NOW()
    FROM app_roles ar
    CROSS JOIN permissions p
    WHERE ar."RoleType" = 'clinical'
      AND ar."RoleCode" IN ('DOCTOR', 'CONSULTANT', 'CARDIOLOGIST', 'NEUROLOGIST',
                            'ORTHOPEDIC_SURGEON', 'PEDIATRICIAN', 'GYNECOLOGIST',
                            'DERMATOLOGIST', 'PSYCHIATRIST', 'RADIOLOGIST',
                            'ANESTHESIOLOGIST', 'PATHOLOGIST', 'ONCOLOGIST',
                            'GASTROENTEROLOGIST', 'PULMONOLOGIST', 'NEPHROLOGIST',
                            'ENDOCRINOLOGIST', 'OPHTHALMOLOGIST', 'ENT_SPECIALIST',
                            'UROLOGIST', 'RHEUMATOLOGIST', 'HEMATOLOGIST', 'ALLERGIST',
                            'INFECTIOUS_DISEASE', 'GERIATRICIAN', 'NEONATOLOGIST',
                            'INTENSIVIST', 'EMERGENCY_MEDICINE', 'FAMILY_MEDICINE',
                            'SPORTS_MEDICINE', 'PAIN_MANAGEMENT')
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
    RAISE NOTICE 'Clinical Doctors/Specialists: % permissions mapped', v_batch_count;
    
    -- =====================================================
    -- 4. SURGEONS - Clinical + surgical permissions
    -- =====================================================
    INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
    SELECT gen_random_uuid(), ar.id, p.id, NOW()
    FROM app_roles ar
    CROSS JOIN permissions p
    WHERE ar."RoleCode" IN ('PLASTIC_SURGEON', 'VASCULAR_SURGEON', 'THORACIC_SURGEON',
                            'NEUROSURGEON', 'PEDIATRIC_SURGEON', 'TRANSPLANT_SURGEON')
      AND p."IsActive" = true
      AND (p."Module" ILIKE '%patient%'
           OR p."Module" ILIKE '%appointment%'
           OR p."Module" ILIKE '%medical%'
           OR p."Module" ILIKE '%clinical%'
           OR p."Module" ILIKE '%prescription%'
           OR p."Module" ILIKE '%record%'
           OR p."Module" ILIKE '%surgery%'
           OR p."Module" ILIKE '%lab%'
           OR p."Module" ILIKE 'dashboard%'
           OR p."Code" ILIKE 'patient.%'
           OR p."Code" ILIKE 'appointment.%')
      AND NOT EXISTS (
          SELECT 1 FROM role_permission rp 
          WHERE rp."RoleId" = ar.id AND rp."PermissionId" = p.id
      );
    GET DIAGNOSTICS v_batch_count = ROW_COUNT;
    v_total_new_mappings := v_total_new_mappings + v_batch_count;
    RAISE NOTICE 'Surgeons: % permissions mapped', v_batch_count;
    
    -- =====================================================
    -- 5. NURSES & NURSE PRACTITIONERS - Clinical (limited prescriptions)
    -- =====================================================
    INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
    SELECT gen_random_uuid(), ar.id, p.id, NOW()
    FROM app_roles ar
    CROSS JOIN permissions p
    WHERE ar."RoleCode" IN ('NURSE', 'NURSE_MGR', 'NURSE_PRACTITIONER')
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
    RAISE NOTICE 'Nurses: % permissions mapped', v_batch_count;
    
    -- =====================================================
    -- 6. PHARMACISTS - Pharmacy + prescriptions
    -- =====================================================
    INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
    SELECT gen_random_uuid(), ar.id, p.id, NOW()
    FROM app_roles ar
    CROSS JOIN permissions p
    WHERE ar."RoleCode" IN ('PHARMACIST', 'PHARM_MGR', 'CLINICAL_PHARMACIST')
      AND p."IsActive" = true
      AND (p."Module" ILIKE '%pharmacy%'
           OR p."Module" ILIKE '%prescription%'
           OR p."Module" ILIKE '%medication%'
           OR p."Module" ILIKE 'dashboard%'
           OR p."Code" ILIKE 'patient.view%'
           OR p."Code" ILIKE 'prescription.%')
      AND NOT EXISTS (
          SELECT 1 FROM role_permission rp 
          WHERE rp."RoleId" = ar.id AND rp."PermissionId" = p.id
      );
    GET DIAGNOSTICS v_batch_count = ROW_COUNT;
    v_total_new_mappings := v_total_new_mappings + v_batch_count;
    RAISE NOTICE 'Pharmacists: % permissions mapped', v_batch_count;
    
    -- =====================================================
    -- 7. LAB STAFF - Laboratory permissions
    -- =====================================================
    INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
    SELECT gen_random_uuid(), ar.id, p.id, NOW()
    FROM app_roles ar
    CROSS JOIN permissions p
    WHERE ar."RoleCode" IN ('LAB_TECH', 'LAB_MGR', 'MEDICAL_TECHNOLOGIST')
      AND p."IsActive" = true
      AND (p."Module" ILIKE '%lab%'
           OR p."Module" ILIKE '%test%'
           OR p."Module" ILIKE '%specimen%'
           OR p."Module" ILIKE 'dashboard%'
           OR p."Code" ILIKE 'patient.view%'
           OR p."Code" ILIKE 'lab.%')
      AND NOT EXISTS (
          SELECT 1 FROM role_permission rp 
          WHERE rp."RoleId" = ar.id AND rp."PermissionId" = p.id
      );
    GET DIAGNOSTICS v_batch_count = ROW_COUNT;
    v_total_new_mappings := v_total_new_mappings + v_batch_count;
    RAISE NOTICE 'Lab Staff: % permissions mapped', v_batch_count;
    
    -- =====================================================
    -- 8. RADIOLOGY STAFF - Imaging permissions
    -- =====================================================
    INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
    SELECT gen_random_uuid(), ar.id, p.id, NOW()
    FROM app_roles ar
    CROSS JOIN permissions p
    WHERE ar."RoleCode" IN ('RADIO_TECH', 'RADIOLOGIC_TECHNOLOGIST')
      AND p."IsActive" = true
      AND (p."Module" ILIKE '%radiology%'
           OR p."Module" ILIKE '%imaging%'
           OR p."Module" ILIKE '%xray%'
           OR p."Module" ILIKE 'dashboard%'
           OR p."Code" ILIKE 'patient.view%'
           OR p."Code" ILIKE 'imaging.%')
      AND NOT EXISTS (
          SELECT 1 FROM role_permission rp 
          WHERE rp."RoleId" = ar.id AND rp."PermissionId" = p.id
      );
    GET DIAGNOSTICS v_batch_count = ROW_COUNT;
    v_total_new_mappings := v_total_new_mappings + v_batch_count;
    RAISE NOTICE 'Radiology Techs: % permissions mapped', v_batch_count;
    
    -- =====================================================
    -- 9. RECEPTIONIST - Front desk operations
    -- =====================================================
    INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
    SELECT gen_random_uuid(), ar.id, p.id, NOW()
    FROM app_roles ar
    CROSS JOIN permissions p
    WHERE ar."RoleCode" = 'RECEPTIONIST'
      AND p."IsActive" = true
      AND (p."Module" ILIKE 'dashboard%'
           OR p."Code" ILIKE 'patient.view%'
           OR p."Code" ILIKE 'patient.create%'
           OR p."Code" ILIKE 'patient.update%'
           OR p."Code" ILIKE 'appointment.%')
      AND NOT EXISTS (
          SELECT 1 FROM role_permission rp 
          WHERE rp."RoleId" = ar.id AND rp."PermissionId" = p.id
      );
    GET DIAGNOSTICS v_batch_count = ROW_COUNT;
    v_total_new_mappings := v_total_new_mappings + v_batch_count;
    RAISE NOTICE 'RECEPTIONIST: % permissions mapped', v_batch_count;
    
    -- =====================================================
    -- 10. BILLING - Financial operations
    -- =====================================================
    INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
    SELECT gen_random_uuid(), ar.id, p.id, NOW()
    FROM app_roles ar
    CROSS JOIN permissions p
    WHERE ar."RoleCode" = 'BILLING'
      AND p."IsActive" = true
      AND (p."Module" ILIKE '%billing%'
           OR p."Module" ILIKE '%invoice%'
           OR p."Module" ILIKE '%payment%'
           OR p."Module" ILIKE 'dashboard%'
           OR p."Code" ILIKE 'patient.view%'
           OR p."Code" ILIKE 'appointment.view%'
           OR p."Code" ILIKE 'billing%')
      AND NOT EXISTS (
          SELECT 1 FROM role_permission rp 
          WHERE rp."RoleId" = ar.id AND rp."PermissionId" = p.id
      );
    GET DIAGNOSTICS v_batch_count = ROW_COUNT;
    v_total_new_mappings := v_total_new_mappings + v_batch_count;
    RAISE NOTICE 'BILLING: % permissions mapped', v_batch_count;
    
    -- =====================================================
    -- 11. MEDICAL RECORDS - Records management
    -- =====================================================
    INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
    SELECT gen_random_uuid(), ar.id, p.id, NOW()
    FROM app_roles ar
    CROSS JOIN permissions p
    WHERE ar."RoleCode" = 'MED_RECORDS'
      AND p."IsActive" = true
      AND (p."Module" ILIKE '%record%'
           OR p."Module" ILIKE '%document%'
           OR p."Module" ILIKE 'dashboard%'
           OR p."Code" ILIKE 'patient.%'
           OR p."Code" ILIKE 'record.%'
           OR p."Code" ILIKE 'document.%')
      AND NOT EXISTS (
          SELECT 1 FROM role_permission rp 
          WHERE rp."RoleId" = ar.id AND rp."PermissionId" = p.id
      );
    GET DIAGNOSTICS v_batch_count = ROW_COUNT;
    v_total_new_mappings := v_total_new_mappings + v_batch_count;
    RAISE NOTICE 'MED_RECORDS: % permissions mapped', v_batch_count;
    
    -- =====================================================
    -- 12. ALLIED HEALTH PROFESSIONALS - Limited clinical
    -- =====================================================
    INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
    SELECT gen_random_uuid(), ar.id, p.id, NOW()
    FROM app_roles ar
    CROSS JOIN permissions p
    WHERE ar."RoleCode" IN ('PHYSICIAN_ASSISTANT', 'CLINICAL_PSYCHOLOGIST', 
                            'MEDICAL_SOCIAL_WORKER', 'SPEECH_THERAPIST',
                            'OCCUPATIONAL_THERAPIST', 'PHYSICAL_THERAPIST',
                            'RESPIRATORY_THERAPIST', 'DIETITIAN', 'AUDIOLOGIST',
                            'OPTOMETRIST', 'PODIATRIST', 'CHIROPRACTOR')
      AND p."IsActive" = true
      AND (p."Module" ILIKE 'dashboard%'
           OR p."Code" ILIKE 'patient.view%'
           OR p."Code" ILIKE 'appointment.%'
           OR p."Code" ILIKE 'record.view%')
      AND NOT EXISTS (
          SELECT 1 FROM role_permission rp 
          WHERE rp."RoleId" = ar.id AND rp."PermissionId" = p.id
      );
    GET DIAGNOSTICS v_batch_count = ROW_COUNT;
    v_total_new_mappings := v_total_new_mappings + v_batch_count;
    RAISE NOTICE 'Allied Health: % permissions mapped', v_batch_count;
    
    -- =====================================================
    -- 13. EMERGENCY STAFF - Emergency access
    -- =====================================================
    INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
    SELECT gen_random_uuid(), ar.id, p.id, NOW()
    FROM app_roles ar
    CROSS JOIN permissions p
    WHERE ar."RoleCode" IN ('PARAMEDIC', 'EMT')
      AND p."IsActive" = true
      AND (p."Module" ILIKE 'dashboard%'
           OR p."Code" ILIKE 'patient.view%'
           OR p."Code" ILIKE 'patient.create%')
      AND NOT EXISTS (
          SELECT 1 FROM role_permission rp 
          WHERE rp."RoleId" = ar.id AND rp."PermissionId" = p.id
      );
    GET DIAGNOSTICS v_batch_count = ROW_COUNT;
    v_total_new_mappings := v_total_new_mappings + v_batch_count;
    RAISE NOTICE 'Emergency Staff: % permissions mapped', v_batch_count;
    
    -- =====================================================
    -- 14. SUPPORT STAFF - Dashboard only
    -- =====================================================
    INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
    SELECT gen_random_uuid(), ar.id, p.id, NOW()
    FROM app_roles ar
    CROSS JOIN permissions p
    WHERE ar."RoleCode" IN ('HOUSEKEEPING', 'MAINTENANCE', 'COUNSELLOR',
                            'SURGICAL_TECHNOLOGIST', 'DENTAL_HYGIENIST')
      AND p."IsActive" = true
      AND p."Code" = 'dashboard.view'
      AND NOT EXISTS (
          SELECT 1 FROM role_permission rp 
          WHERE rp."RoleId" = ar.id AND rp."PermissionId" = p.id
      );
    GET DIAGNOSTICS v_batch_count = ROW_COUNT;
    v_total_new_mappings := v_total_new_mappings + v_batch_count;
    RAISE NOTICE 'Support Staff: % permissions mapped', v_batch_count;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'TOTAL NEW MAPPINGS CREATED: %', v_total_new_mappings;
    RAISE NOTICE '========================================';
END $$;

-- Final statistics
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
FROM role_permission;
