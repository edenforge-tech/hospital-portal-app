-- =====================================================
-- COMPREHENSIVE ROLE-PERMISSION MAPPING
-- Maps 253 permissions to 77 roles intelligently
-- =====================================================

DO $$
DECLARE
    v_role RECORD;
    v_permission RECORD;
    v_mappings_count INT := 0;
    v_total_mappings INT := 0;
BEGIN
    RAISE NOTICE 'Starting comprehensive role-permission mapping...';
    
    -- =====================================================
    -- 1. CLINICAL SPECIALISTS (Doctors, Surgeons, etc.)
    -- =====================================================
    -- All clinical specialists get full clinical permissions
    FOR v_role IN 
        SELECT id, "RoleCode" FROM app_roles 
        WHERE "RoleType" = 'clinical' 
        AND "RoleCode" IN (
            'DOCTOR', 'CARDIOLOGIST', 'NEUROLOGIST', 'ORTHOPEDIC_SURGEON',
            'PEDIATRICIAN', 'GYNECOLOGIST', 'DERMATOLOGIST', 'PSYCHIATRIST',
            'RADIOLOGIST', 'ANESTHESIOLOGIST', 'PATHOLOGIST', 'ONCOLOGIST',
            'GASTROENTEROLOGIST', 'PULMONOLOGIST', 'NEPHROLOGIST', 'ENDOCRINOLOGIST',
            'OPHTHALMOLOGIST', 'ENT_SPECIALIST', 'UROLOGIST', 'RHEUMATOLOGIST',
            'HEMATOLOGIST', 'ALLERGIST', 'INFECTIOUS_DISEASE', 'GERIATRICIAN',
            'NEONATOLOGIST', 'INTENSIVIST', 'EMERGENCY_MEDICINE', 'FAMILY_MEDICINE',
            'SPORTS_MEDICINE', 'PAIN_MANAGEMENT', 'PLASTIC_SURGEON', 'VASCULAR_SURGEON',
            'THORACIC_SURGEON', 'NEUROSURGEON', 'PEDIATRIC_SURGEON', 'TRANSPLANT_SURGEON',
            'CONSULTANT'
        )
    LOOP
        INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
        SELECT gen_random_uuid(), v_role.id, p.id, NOW()
        FROM permissions p
        WHERE (p."Module" IN ('clinical', 'dashboard', 'reports')
               OR p."Code" ILIKE 'CLINICAL:%'
               OR p."Code" ILIKE 'DASHBOARD:%')
        AND NOT EXISTS (
            SELECT 1 FROM role_permission rp 
            WHERE rp."RoleId" = v_role.id AND rp."PermissionId" = p.id
        );
        
        GET DIAGNOSTICS v_mappings_count = ROW_COUNT;
        v_total_mappings := v_total_mappings + v_mappings_count;
        RAISE NOTICE 'Mapped % permissions to % (Clinical Specialist)', v_mappings_count, v_role."RoleCode";
    END LOOP;
    
    -- =====================================================
    -- 2. ADVANCED PRACTICE PROVIDERS
    -- =====================================================
    FOR v_role IN 
        SELECT id, "RoleCode" FROM app_roles 
        WHERE "RoleCode" IN ('NURSE_PRACTITIONER', 'PHYSICIAN_ASSISTANT', 'CLINICAL_PHARMACIST')
    LOOP
        INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
        SELECT gen_random_uuid(), v_role.id, p.id, NOW()
        FROM permissions p
        WHERE (p."Module" IN ('clinical', 'dashboard')
               OR p."Code" ILIKE 'CLINICAL:%')
        AND NOT EXISTS (
            SELECT 1 FROM role_permission rp 
            WHERE rp."RoleId" = v_role.id AND rp."PermissionId" = p.id
        );
        
        GET DIAGNOSTICS v_mappings_count = ROW_COUNT;
        v_total_mappings := v_total_mappings + v_mappings_count;
        RAISE NOTICE 'Mapped % permissions to %', v_mappings_count, v_role."RoleCode";
    END LOOP;
    
    -- =====================================================
    -- 3. NURSING STAFF
    -- =====================================================
    FOR v_role IN 
        SELECT id, "RoleCode" FROM app_roles 
        WHERE "RoleCode" IN ('NURSE', 'NURSE_MGR')
    LOOP
        INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
        SELECT gen_random_uuid(), v_role.id, p.id, NOW()
        FROM permissions p
        WHERE (p."Module" IN ('clinical', 'dashboard')
               OR p."Code" ILIKE 'CLINICAL:PATIENT:%'
               OR p."Code" ILIKE 'CLINICAL:APPOINTMENT:%'
               OR p."Code" ILIKE 'CLINICAL:RECORD:VIEW%'
               OR p."Code" ILIKE 'CLINICAL:LAB:VIEW%'
               OR p."Code" ILIKE 'DASHBOARD:%')
        AND p."Code" NOT ILIKE '%PRESCRIPTION:CREATE%'
        AND p."Code" NOT ILIKE '%PRESCRIPTION:APPROVE%'
        AND NOT EXISTS (
            SELECT 1 FROM role_permission rp 
            WHERE rp."RoleId" = v_role.id AND rp."PermissionId" = p.id
        );
        
        GET DIAGNOSTICS v_mappings_count = ROW_COUNT;
        v_total_mappings := v_total_mappings + v_mappings_count;
        RAISE NOTICE 'Mapped % permissions to %', v_mappings_count, v_role."RoleCode";
    END LOOP;
    
    -- =====================================================
    -- 4. ALLIED HEALTH PROFESSIONALS
    -- =====================================================
    FOR v_role IN 
        SELECT id, "RoleCode" FROM app_roles 
        WHERE "RoleCode" IN (
            'CLINICAL_PSYCHOLOGIST', 'MEDICAL_SOCIAL_WORKER', 'SPEECH_THERAPIST',
            'OCCUPATIONAL_THERAPIST', 'PHYSICAL_THERAPIST', 'RESPIRATORY_THERAPIST',
            'DIETITIAN', 'AUDIOLOGIST', 'OPTOMETRIST', 'PODIATRIST', 'CHIROPRACTOR'
        )
    LOOP
        INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
        SELECT gen_random_uuid(), v_role.id, p.id, NOW()
        FROM permissions p
        WHERE (p."Code" ILIKE 'CLINICAL:PATIENT:VIEW%'
               OR p."Code" ILIKE 'CLINICAL:APPOINTMENT:%'
               OR p."Code" ILIKE 'CLINICAL:RECORD:VIEW%'
               OR p."Code" ILIKE 'DASHBOARD:VIEW%')
        AND NOT EXISTS (
            SELECT 1 FROM role_permission rp 
            WHERE rp."RoleId" = v_role.id AND rp."PermissionId" = p.id
        );
        
        GET DIAGNOSTICS v_mappings_count = ROW_COUNT;
        v_total_mappings := v_total_mappings + v_mappings_count;
        RAISE NOTICE 'Mapped % permissions to %', v_mappings_count, v_role."RoleCode";
    END LOOP;
    
    -- =====================================================
    -- 5. PHARMACY STAFF
    -- =====================================================
    FOR v_role IN 
        SELECT id, "RoleCode" FROM app_roles 
        WHERE "RoleType" = 'pharmacy' OR "RoleCode" IN ('PHARMACIST', 'PHARM_MGR')
    LOOP
        INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
        SELECT gen_random_uuid(), v_role.id, p.id, NOW()
        FROM permissions p
        WHERE (p."Code" ILIKE '%PRESCRIPTION:%'
               OR p."Code" ILIKE 'CLINICAL:PATIENT:VIEW%'
               OR p."Code" ILIKE 'DASHBOARD:%'
               OR (p."Module" = 'reports' AND v_role."RoleCode" = 'PHARM_MGR'))
        AND NOT EXISTS (
            SELECT 1 FROM role_permission rp 
            WHERE rp."RoleId" = v_role.id AND rp."PermissionId" = p.id
        );
        
        GET DIAGNOSTICS v_mappings_count = ROW_COUNT;
        v_total_mappings := v_total_mappings + v_mappings_count;
        RAISE NOTICE 'Mapped % permissions to %', v_mappings_count, v_role."RoleCode";
    END LOOP;
    
    -- =====================================================
    -- 6. LABORATORY STAFF
    -- =====================================================
    FOR v_role IN 
        SELECT id, "RoleCode" FROM app_roles 
        WHERE "RoleType" = 'laboratory' OR "RoleCode" IN ('LAB_TECH', 'LAB_MGR', 'MEDICAL_TECHNOLOGIST')
    LOOP
        INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
        SELECT gen_random_uuid(), v_role.id, p.id, NOW()
        FROM permissions p
        WHERE (p."Code" ILIKE 'CLINICAL:LAB:%'
               OR p."Code" ILIKE 'CLINICAL:PATIENT:VIEW%'
               OR p."Code" ILIKE 'DASHBOARD:%'
               OR (p."Module" = 'reports' AND v_role."RoleCode" = 'LAB_MGR'))
        AND NOT EXISTS (
            SELECT 1 FROM role_permission rp 
            WHERE rp."RoleId" = v_role.id AND rp."PermissionId" = p.id
        );
        
        GET DIAGNOSTICS v_mappings_count = ROW_COUNT;
        v_total_mappings := v_total_mappings + v_mappings_count;
        RAISE NOTICE 'Mapped % permissions to %', v_mappings_count, v_role."RoleCode";
    END LOOP;
    
    -- =====================================================
    -- 7. RADIOLOGY STAFF
    -- =====================================================
    FOR v_role IN 
        SELECT id, "RoleCode" FROM app_roles 
        WHERE "RoleType" = 'radiology' OR "RoleCode" IN ('RADIOLOGIST', 'RADIO_TECH', 'RADIOLOGIC_TECHNOLOGIST')
    LOOP
        INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
        SELECT gen_random_uuid(), v_role.id, p.id, NOW()
        FROM permissions p
        WHERE (p."Code" ILIKE '%RADIOLOGY:%'
               OR p."Code" ILIKE '%IMAGING:%'
               OR p."Code" ILIKE 'CLINICAL:PATIENT:VIEW%'
               OR p."Code" ILIKE 'DASHBOARD:%')
        AND NOT EXISTS (
            SELECT 1 FROM role_permission rp 
            WHERE rp."RoleId" = v_role.id AND rp."PermissionId" = p.id
        );
        
        GET DIAGNOSTICS v_mappings_count = ROW_COUNT;
        v_total_mappings := v_total_mappings + v_mappings_count;
        RAISE NOTICE 'Mapped % permissions to %', v_mappings_count, v_role."RoleCode";
    END LOOP;
    
    -- =====================================================
    -- 8. ADMINISTRATIVE STAFF
    -- =====================================================
    FOR v_role IN 
        SELECT id, "RoleCode" FROM app_roles 
        WHERE "RoleCode" IN ('RECEPTIONIST', 'MED_RECORDS', 'BILLING')
    LOOP
        -- Receptionist: Appointments + Patient registration
        IF v_role."RoleCode" = 'RECEPTIONIST' THEN
            INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
            SELECT gen_random_uuid(), v_role.id, p.id, NOW()
            FROM permissions p
            WHERE (p."Code" ILIKE 'CLINICAL:PATIENT:VIEW%'
                   OR p."Code" ILIKE 'CLINICAL:PATIENT:CREATE%'
                   OR p."Code" ILIKE 'CLINICAL:APPOINTMENT:%'
                   OR p."Code" ILIKE 'DASHBOARD:VIEW%')
            AND p."Code" NOT ILIKE '%PHI%'
            AND NOT EXISTS (
                SELECT 1 FROM role_permission rp 
                WHERE rp."RoleId" = v_role.id AND rp."PermissionId" = p.id
            );
        
        -- Medical Records: Patient records management
        ELSIF v_role."RoleCode" = 'MED_RECORDS' THEN
            INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
            SELECT gen_random_uuid(), v_role.id, p.id, NOW()
            FROM permissions p
            WHERE (p."Code" ILIKE 'CLINICAL:PATIENT:%'
                   OR p."Code" ILIKE 'CLINICAL:RECORD:%'
                   OR p."Code" ILIKE '%DOCUMENT:%'
                   OR p."Code" ILIKE 'DASHBOARD:%')
            AND NOT EXISTS (
                SELECT 1 FROM role_permission rp 
                WHERE rp."RoleId" = v_role.id AND rp."PermissionId" = p.id
            );
        
        -- Billing: Financial operations
        ELSIF v_role."RoleCode" = 'BILLING' THEN
            INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
            SELECT gen_random_uuid(), v_role.id, p.id, NOW()
            FROM permissions p
            WHERE (p."Code" ILIKE 'BILLING:%'
                   OR p."Code" ILIKE 'CLINICAL:PATIENT:VIEW%'
                   OR p."Code" ILIKE 'CLINICAL:APPOINTMENT:VIEW%'
                   OR p."Code" ILIKE 'DASHBOARD:%')
            AND NOT EXISTS (
                SELECT 1 FROM role_permission rp 
                WHERE rp."RoleId" = v_role.id AND rp."PermissionId" = p.id
            );
        END IF;
        
        GET DIAGNOSTICS v_mappings_count = ROW_COUNT;
        v_total_mappings := v_total_mappings + v_mappings_count;
        RAISE NOTICE 'Mapped % permissions to %', v_mappings_count, v_role."RoleCode";
    END LOOP;
    
    -- =====================================================
    -- 9. TECHNICAL & IT STAFF
    -- =====================================================
    FOR v_role IN 
        SELECT id, "RoleCode" FROM app_roles 
        WHERE "RoleCode" IN ('IT_ADMIN', 'HEALTHCARE_ADMINISTRATOR')
    LOOP
        -- IT Admin gets system administration permissions
        IF v_role."RoleCode" = 'IT_ADMIN' THEN
            INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
            SELECT gen_random_uuid(), v_role.id, p.id, NOW()
            FROM permissions p
            WHERE (p."Module" IN ('admin', 'dashboard', 'reports')
                   OR p."Code" ILIKE 'AUTH:USER:%'
                   OR p."Code" ILIKE 'AUTH:ROLE:%'
                   OR p."Code" ILIKE 'ADMIN:%')
            AND p."Code" NOT ILIKE '%TENANT:CREATE%'
            AND p."Code" NOT ILIKE '%TENANT:DELETE%'
            AND NOT EXISTS (
                SELECT 1 FROM role_permission rp 
                WHERE rp."RoleId" = v_role.id AND rp."PermissionId" = p.id
            );
        
        -- Healthcare Administrator gets all administrative permissions
        ELSIF v_role."RoleCode" = 'HEALTHCARE_ADMINISTRATOR' THEN
            INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
            SELECT gen_random_uuid(), v_role.id, p.id, NOW()
            FROM permissions p
            WHERE p."Module" IN ('admin', 'dashboard', 'reports', 'billing')
            AND NOT EXISTS (
                SELECT 1 FROM role_permission rp 
                WHERE rp."RoleId" = v_role.id AND rp."PermissionId" = p.id
            );
        END IF;
        
        GET DIAGNOSTICS v_mappings_count = ROW_COUNT;
        v_total_mappings := v_total_mappings + v_mappings_count;
        RAISE NOTICE 'Mapped % permissions to %', v_mappings_count, v_role."RoleCode";
    END LOOP;
    
    -- =====================================================
    -- 10. DEPARTMENT MANAGERS
    -- =====================================================
    FOR v_role IN 
        SELECT id, "RoleCode" FROM app_roles 
        WHERE "RoleCode" IN ('NURSE_MGR', 'LAB_MGR', 'PHARM_MGR')
    LOOP
        INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
        SELECT gen_random_uuid(), v_role.id, p.id, NOW()
        FROM permissions p
        WHERE (p."Module" = 'reports'
               OR p."Code" ILIKE 'ADMIN:DEPARTMENT:%'
               OR p."Code" ILIKE 'ADMIN:BRANCH:VIEW%')
        AND NOT EXISTS (
            SELECT 1 FROM role_permission rp 
            WHERE rp."RoleId" = v_role.id AND rp."PermissionId" = p.id
        );
        
        GET DIAGNOSTICS v_mappings_count = ROW_COUNT;
        v_total_mappings := v_total_mappings + v_mappings_count;
        RAISE NOTICE 'Mapped % permissions to % (Manager)', v_mappings_count, v_role."RoleCode";
    END LOOP;
    
    -- =====================================================
    -- 11. EMERGENCY & SUPPORT STAFF
    -- =====================================================
    FOR v_role IN 
        SELECT id, "RoleCode" FROM app_roles 
        WHERE "RoleCode" IN ('PARAMEDIC', 'EMT', 'SURGICAL_TECHNOLOGIST', 'DENTAL_HYGIENIST')
    LOOP
        INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
        SELECT gen_random_uuid(), v_role.id, p.id, NOW()
        FROM permissions p
        WHERE (p."Code" ILIKE 'CLINICAL:PATIENT:VIEW%'
               OR p."Code" ILIKE 'CLINICAL:RECORD:VIEW%'
               OR p."Code" ILIKE 'DASHBOARD:VIEW%')
        AND NOT EXISTS (
            SELECT 1 FROM role_permission rp 
            WHERE rp."RoleId" = v_role.id AND rp."PermissionId" = p.id
        );
        
        GET DIAGNOSTICS v_mappings_count = ROW_COUNT;
        v_total_mappings := v_total_mappings + v_mappings_count;
        RAISE NOTICE 'Mapped % permissions to %', v_mappings_count, v_role."RoleCode";
    END LOOP;
    
    -- =====================================================
    -- 12. SUPPORT STAFF (Minimal Access)
    -- =====================================================
    FOR v_role IN 
        SELECT id, "RoleCode" FROM app_roles 
        WHERE "RoleCode" IN ('HOUSEKEEPING', 'MAINTENANCE', 'COUNSELLOR')
    LOOP
        INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
        SELECT gen_random_uuid(), v_role.id, p.id, NOW()
        FROM permissions p
        WHERE p."Code" ILIKE 'DASHBOARD:VIEW%'
        AND NOT EXISTS (
            SELECT 1 FROM role_permission rp 
            WHERE rp."RoleId" = v_role.id AND rp."PermissionId" = p.id
        );
        
        GET DIAGNOSTICS v_mappings_count = ROW_COUNT;
        v_total_mappings := v_total_mappings + v_mappings_count;
        RAISE NOTICE 'Mapped % permissions to %', v_mappings_count, v_role."RoleCode";
    END LOOP;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Permission mapping completed!';
    RAISE NOTICE 'Total new mappings created: %', v_total_mappings;
    RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- VERIFICATION REPORT
-- =====================================================
SELECT 
    ar."RoleCode",
    ar."RoleType",
    ar."Description",
    COUNT(rp.id) as permission_count
FROM app_roles ar
LEFT JOIN role_permission rp ON ar.id = rp."RoleId"
WHERE ar."IsActive" = true
GROUP BY ar.id, ar."RoleCode", ar."RoleType", ar."Description"
ORDER BY permission_count DESC, ar."RoleCode";

-- Summary Statistics
SELECT 
    'Total Active Roles' as metric,
    COUNT(DISTINCT ar.id) as count
FROM app_roles ar
WHERE ar."IsActive" = true
UNION ALL
SELECT 
    'Total Permissions',
    COUNT(*) 
FROM permissions
UNION ALL
SELECT 
    'Total Role-Permission Mappings',
    COUNT(*) 
FROM role_permission
UNION ALL
SELECT 
    'Roles with Permissions',
    COUNT(DISTINCT rp."RoleId")
FROM role_permission rp;
