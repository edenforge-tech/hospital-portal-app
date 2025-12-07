-- =====================================================
-- RBAC & ABAC IMPLEMENTATION VERIFICATION SCRIPT
-- Hospital Portal Database Verification
-- Run this after executing complete_rbac_abac_implementation.sql
-- =====================================================

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- 1. PERMISSIONS VERIFICATION
SELECT
    'Permissions Count' as check_type,
    COUNT(*) as actual_count,
    297 as expected_count,
    CASE WHEN COUNT(*) = 297 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM permissions
WHERE is_system_permission = true;

-- 2. ROLES VERIFICATION
SELECT
    'System Roles Count' as check_type,
    COUNT(*) as actual_count,
    20 as expected_count,
    CASE WHEN COUNT(*) = 20 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM "AspNetRoles"
WHERE is_system_role = true;

-- 3. DOCUMENT TYPES VERIFICATION
SELECT
    'Document Types Count' as check_type,
    COUNT(*) as actual_count,
    9 as expected_count,
    CASE WHEN COUNT(*) >= 9 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM document_types;

-- 4. ADMIN CONFIGURATIONS VERIFICATION
SELECT
    'Admin Configurations Count' as check_type,
    COUNT(*) as actual_count,
    6 as expected_count,
    CASE WHEN COUNT(*) >= 6 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM admin_configurations;

-- 5. ROLE-PERMISSION MAPPINGS VERIFICATION
SELECT
    'Role-Permission Mappings' as check_type,
    COUNT(*) as actual_count,
    'Variable (should be > 1000)' as expected_count,
    CASE WHEN COUNT(*) > 1000 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM role_permissions;

-- =====================================================
-- DETAILED VERIFICATION REPORTS
-- =====================================================

-- 6. PERMISSIONS BY MODULE
SELECT
    module,
    COUNT(*) as permission_count,
    STRING_AGG(DISTINCT action, ', ') as actions
FROM permissions
WHERE is_system_permission = true
GROUP BY module
ORDER BY module;

-- 7. ROLES WITH PERMISSION COUNTS
SELECT
    r.name as role_name,
    COUNT(rp.permission_id) as permission_count,
    STRING_AGG(DISTINCT p.module, ', ') as modules
FROM "AspNetRoles" r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
WHERE r.is_system_role = true
GROUP BY r.id, r.name
ORDER BY r.name;

-- 8. DOCUMENT SHARING RULES
SELECT
    dt.name as document_type,
    COUNT(dar.id) as sharing_rules,
    STRING_AGG(DISTINCT sd.department_name || ' → ' || td.department_name, '; ') as sharing_paths
FROM document_types dt
LEFT JOIN document_access_rules dar ON dt.id = dar.document_type_id
LEFT JOIN department sd ON dar.source_department_id = sd.id
LEFT JOIN department td ON dar.target_department_id = td.id
GROUP BY dt.id, dt.name
ORDER BY dt.name;

-- 9. SYSTEM CONFIGURATIONS
SELECT
    config_key,
    config_type,
    description,
    config_value
FROM admin_configurations
ORDER BY config_type, config_key;

-- 10. TABLE SCHEMA VERIFICATION
SELECT
    schemaname,
    tablename,
    CASE
        WHEN tablename = 'permissions' AND EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'permissions' AND column_name = 'data_classification'
        ) THEN '✅ Enhanced'
        WHEN tablename = 'role_permissions' AND EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'role_permissions' AND column_name = 'condition'
        ) THEN '✅ Enhanced'
        WHEN tablename IN ('patient_document_uploads', 'document_access_audit', 'admin_configurations') THEN '✅ Created'
        ELSE '❌ Missing'
    END as status
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('permissions', 'role_permissions', 'patient_document_uploads', 'document_access_audit', 'admin_configurations')
ORDER BY tablename;

-- =====================================================
-- COMPREHENSIVE IMPLEMENTATION STATUS
-- =====================================================

-- 11. FINAL STATUS SUMMARY
WITH verification_results AS (
    SELECT 'Permissions (297)' as component, CASE WHEN COUNT(*) = 297 THEN 1 ELSE 0 END as passed FROM permissions WHERE is_system_permission = true
    UNION ALL
    SELECT 'Roles (20)', CASE WHEN COUNT(*) = 20 THEN 1 ELSE 0 END FROM "AspNetRoles" WHERE is_system_role = true
    UNION ALL
    SELECT 'Document Types (9+)', CASE WHEN COUNT(*) >= 9 THEN 1 ELSE 0 END FROM document_types
    UNION ALL
    SELECT 'Admin Configs (6+)', CASE WHEN COUNT(*) >= 6 THEN 1 ELSE 0 END FROM admin_configurations
    UNION ALL
    SELECT 'Role Mappings (1000+)', CASE WHEN COUNT(*) > 1000 THEN 1 ELSE 0 END FROM role_permissions
    UNION ALL
    SELECT 'Schema Enhancements', CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'permissions' AND column_name = 'data_classification'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'role_permissions' AND column_name = 'condition'
    ) THEN 1 ELSE 0 END
)
SELECT
    component,
    CASE WHEN passed = 1 THEN '✅ IMPLEMENTED' ELSE '❌ MISSING' END as status
FROM verification_results
ORDER BY passed DESC, component;

-- =====================================================
-- TROUBLESHOOTING QUERIES
-- =====================================================

-- 12. MISSING PERMISSIONS BY MODULE (if any)
SELECT
    expected_module,
    expected_count,
    COALESCE(actual_count, 0) as actual_count,
    expected_count - COALESCE(actual_count, 0) as missing_count
FROM (
    VALUES
        ('Patient Management', 24),
        ('Clinical Assessment', 20),
        ('Prescriptions', 16),
        ('Laboratory', 18),
        ('Imaging', 16),
        ('Appointments', 16),
        ('Billing', 20),
        ('Insurance', 18),
        ('Pharmacy', 20),
        ('Ward/IPD', 18),
        ('Operating Theatre', 18),
        ('Optical Shop', 16),
        ('Medical Records', 12),
        ('Administration', 15),
        ('Reporting', 12),
        ('Quality', 12)
) as expected(expected_module, expected_count)
LEFT JOIN (
    SELECT module, COUNT(*) as actual_count
    FROM permissions
    WHERE is_system_permission = true
    GROUP BY module
) actual ON expected.expected_module = actual.module
WHERE COALESCE(actual_count, 0) < expected_count
ORDER BY missing_count DESC;

-- 13. DUPLICATE PERMISSIONS CHECK
SELECT
    name,
    COUNT(*) as duplicate_count
FROM permissions
WHERE is_system_permission = true
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- 14. ORPHANED ROLE-PERMISSION MAPPINGS
SELECT
    'Orphaned role_permission records' as issue,
    COUNT(*) as count
FROM role_permissions rp
LEFT JOIN "AspNetRoles" r ON rp.role_id = r.id
LEFT JOIN permissions p ON rp.permission_id = p.id
WHERE r.id IS NULL OR p.id IS NULL;

-- =====================================================
-- PERFORMANCE & INDEX VERIFICATION
-- =====================================================

-- 15. INDEX VERIFICATION
SELECT
    indexname,
    tablename,
    CASE
        WHEN indexname LIKE '%permissions%' THEN '✅ Permissions indexed'
        WHEN indexname LIKE '%role_permissions%' THEN '✅ Role permissions indexed'
        WHEN indexname LIKE '%patient_docs%' THEN '✅ Patient docs indexed'
        WHEN indexname LIKE '%doc_audit%' THEN '✅ Doc audit indexed'
        WHEN indexname LIKE '%admin_config%' THEN '✅ Admin config indexed'
        ELSE 'ℹ️ Other index'
    END as status
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('permissions', 'role_permissions', 'patient_document_uploads', 'document_access_audit', 'admin_configurations')
ORDER BY tablename, indexname;

-- =====================================================
-- RLS POLICY VERIFICATION
-- =====================================================

-- 16. RLS POLICIES CHECK
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE WHEN rowsecurity THEN '✅ RLS Enabled' ELSE '❌ RLS Disabled' END as status
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('patient_document_uploads', 'document_access_audit', 'admin_configurations')
ORDER BY tablename;

-- =====================================================
-- FINAL SUCCESS MESSAGE
-- =====================================================

DO $$
DECLARE
    permission_count INTEGER;
    role_count INTEGER;
    doc_type_count INTEGER;
    config_count INTEGER;
    mapping_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO permission_count FROM permissions WHERE is_system_permission = true;
    SELECT COUNT(*) INTO role_count FROM "AspNetRoles" WHERE is_system_role = true;
    SELECT COUNT(*) INTO doc_type_count FROM document_types;
    SELECT COUNT(*) INTO config_count FROM admin_configurations;
    SELECT COUNT(*) INTO mapping_count FROM role_permissions;

    RAISE NOTICE '=================================================';
    RAISE NOTICE 'RBAC & ABAC IMPLEMENTATION VERIFICATION COMPLETE';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Permissions: %/297', permission_count;
    RAISE NOTICE 'Roles: %/20', role_count;
    RAISE NOTICE 'Document Types: %/9+', doc_type_count;
    RAISE NOTICE 'Admin Configs: %/6+', config_count;
    RAISE NOTICE 'Role Mappings: % (should be >1000)', mapping_count;
    RAISE NOTICE '=================================================';

    IF permission_count = 297 AND role_count = 20 AND doc_type_count >= 9 AND config_count >= 6 AND mapping_count > 1000 THEN
        RAISE NOTICE '🎉 ALL CHECKS PASSED - IMPLEMENTATION SUCCESSFUL!';
    ELSE
        RAISE NOTICE '⚠️  SOME CHECKS FAILED - REVIEW OUTPUT ABOVE';
    END IF;

    RAISE NOTICE '=================================================';
END $$;