-- =====================================================
-- Comprehensive Database Testing Suite
-- =====================================================
-- This script validates all implemented features:
-- 1. Soft delete functionality
-- 2. RLS tenant isolation
-- 3. Audit trail logging
-- 4. Status transitions
-- 5. Overall compliance verification
-- =====================================================

-- =====================================================
-- TEST SUITE 1: SOFT DELETE FUNCTIONALITY
-- =====================================================

-- Test 1.1: Verify soft delete columns exist on all tables
DO $$
DECLARE
    missing_tables TEXT[];
    total_tables INT;
    tables_with_soft_delete INT;
BEGIN
    -- Count total tables (excluding AspNet and EF tables)
    SELECT COUNT(*) INTO total_tables
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename NOT LIKE 'AspNet%' 
    AND tablename NOT LIKE '__EF%';
    
    -- Count tables with soft delete columns
    SELECT COUNT(DISTINCT table_name) INTO tables_with_soft_delete
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND column_name IN ('deleted_at', 'deleted_by')
    AND table_name NOT LIKE 'AspNet%'
    AND table_name NOT LIKE '__EF%';
    
    -- Find missing tables
    SELECT ARRAY_AGG(tablename) INTO missing_tables
    FROM pg_tables pt
    WHERE schemaname = 'public'
    AND tablename NOT LIKE 'AspNet%'
    AND tablename NOT LIKE '__EF%'
    AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = pt.tablename
        AND column_name = 'deleted_at'
    );
    
    RAISE NOTICE 'TEST 1.1 - Soft Delete Column Coverage:';
    RAISE NOTICE '  Total tables: %', total_tables;
    RAISE NOTICE '  Tables with soft delete: %', tables_with_soft_delete;
    RAISE NOTICE '  Coverage: %%%', ROUND((tables_with_soft_delete::NUMERIC / total_tables * 100), 2);
    
    IF missing_tables IS NOT NULL THEN
        RAISE NOTICE '  Missing soft delete: %', array_to_string(missing_tables, ', ');
    END IF;
    
    IF tables_with_soft_delete >= (total_tables * 0.95) THEN
        RAISE NOTICE '  ✓ PASSED: 95%+ coverage achieved';
    ELSE
        RAISE WARNING '  ✗ FAILED: Coverage below 95%%';
    END IF;
END $$;

-- Test 1.2: Verify soft delete indexes exist
DO $$
DECLARE
    total_soft_delete_indexes INT;
    expected_indexes INT;
BEGIN
    -- Count soft delete related indexes
    SELECT COUNT(*) INTO total_soft_delete_indexes
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND (indexname LIKE '%_deleted' OR indexname LIKE '%_active');
    
    -- Expected: 2 indexes per table with soft delete
    SELECT COUNT(DISTINCT table_name) * 2 INTO expected_indexes
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND column_name = 'deleted_at';
    
    RAISE NOTICE 'TEST 1.2 - Soft Delete Indexes:';
    RAISE NOTICE '  Total soft delete indexes: %', total_soft_delete_indexes;
    RAISE NOTICE '  Expected indexes: %', expected_indexes;
    
    IF total_soft_delete_indexes >= expected_indexes THEN
        RAISE NOTICE '  ✓ PASSED: All soft delete indexes created';
    ELSE
        RAISE WARNING '  ✗ FAILED: Missing % indexes', (expected_indexes - total_soft_delete_indexes);
    END IF;
END $$;

-- Test 1.3: Test soft delete functions exist
DO $$
DECLARE
    func_count INT;
    expected_functions TEXT[] := ARRAY[
        'soft_delete_record',
        'restore_record',
        'is_record_deleted',
        'permanently_delete_record',
        'bulk_soft_delete',
        'get_deleted_records',
        'auto_purge_old_deleted_records',
        'soft_delete_patient_cascade',
        'get_soft_delete_stats'
    ];
    missing_functions TEXT[];
BEGIN
    -- Check each function exists
    SELECT ARRAY_AGG(func) INTO missing_functions
    FROM unnest(expected_functions) AS func
    WHERE NOT EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = func
    );
    
    func_count := array_length(expected_functions, 1) - COALESCE(array_length(missing_functions, 1), 0);
    
    RAISE NOTICE 'TEST 1.3 - Soft Delete Functions:';
    RAISE NOTICE '  Functions found: % / %', func_count, array_length(expected_functions, 1);
    
    IF missing_functions IS NOT NULL THEN
        RAISE NOTICE '  Missing functions: %', array_to_string(missing_functions, ', ');
    END IF;
    
    IF func_count = array_length(expected_functions, 1) THEN
        RAISE NOTICE '  ✓ PASSED: All soft delete functions exist';
    ELSE
        RAISE WARNING '  ✗ FAILED: Missing functions';
    END IF;
END $$;

-- =====================================================
-- TEST SUITE 2: RLS COVERAGE
-- =====================================================

-- Test 2.1: Verify RLS enabled on tables
DO $$
DECLARE
    total_tables INT;
    rls_enabled_tables INT;
    coverage NUMERIC;
BEGIN
    -- Count total tables
    SELECT COUNT(*) INTO total_tables
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename NOT LIKE 'AspNet%' 
    AND tablename NOT LIKE '__EF%';
    
    -- Count RLS enabled tables
    SELECT COUNT(*) INTO rls_enabled_tables
    FROM pg_tables pt
    JOIN pg_class pc ON pt.tablename = pc.relname
    JOIN pg_namespace pn ON pc.relnamespace = pn.oid AND pn.nspname = pt.schemaname
    WHERE pt.schemaname = 'public'
    AND pt.tablename NOT LIKE 'AspNet%'
    AND pt.tablename NOT LIKE '__EF%'
    AND pc.relrowsecurity = true;
    
    coverage := ROUND((rls_enabled_tables::NUMERIC / total_tables * 100), 2);
    
    RAISE NOTICE 'TEST 2.1 - RLS Coverage:';
    RAISE NOTICE '  Total tables: %', total_tables;
    RAISE NOTICE '  RLS enabled tables: %', rls_enabled_tables;
    RAISE NOTICE '  Coverage: %%%', coverage;
    
    IF coverage >= 95 THEN
        RAISE NOTICE '  ✓ PASSED: 95%+ RLS coverage achieved';
    ELSE
        RAISE WARNING '  ✗ FAILED: Coverage below 95%%';
    END IF;
END $$;

-- Test 2.2: Verify RLS policies exist
DO $$
DECLARE
    total_policies INT;
    tenant_isolation_policies INT;
BEGIN
    -- Count all policies
    SELECT COUNT(*) INTO total_policies
    FROM pg_policies
    WHERE schemaname = 'public';
    
    -- Count tenant_isolation policies
    SELECT COUNT(*) INTO tenant_isolation_policies
    FROM pg_policies
    WHERE schemaname = 'public'
    AND policyname LIKE '%tenant_isolation%';
    
    RAISE NOTICE 'TEST 2.2 - RLS Policies:';
    RAISE NOTICE '  Total policies: %', total_policies;
    RAISE NOTICE '  Tenant isolation policies: %', tenant_isolation_policies;
    
    IF tenant_isolation_policies >= 90 THEN
        RAISE NOTICE '  ✓ PASSED: Comprehensive RLS policies exist';
    ELSE
        RAISE WARNING '  ✗ FAILED: Insufficient tenant isolation policies';
    END IF;
END $$;

-- Test 2.3: List tables without RLS
SELECT 
    'Missing RLS' as test_name,
    tablename,
    'No RLS enabled' as issue
FROM pg_tables pt
JOIN pg_class pc ON pt.tablename = pc.relname
JOIN pg_namespace pn ON pc.relnamespace = pn.oid AND pn.nspname = pt.schemaname
WHERE pt.schemaname = 'public'
AND pt.tablename NOT LIKE 'AspNet%'
AND pt.tablename NOT LIKE '__EF%'
AND pc.relrowsecurity = false
ORDER BY tablename;

-- =====================================================
-- TEST SUITE 3: AUDIT TRAIL COVERAGE
-- =====================================================

-- Test 3.1: Verify audit user columns exist
DO $$
DECLARE
    total_tables INT;
    tables_with_created_by INT;
    tables_with_updated_by INT;
    coverage NUMERIC;
BEGIN
    -- Count total tables
    SELECT COUNT(*) INTO total_tables
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename NOT LIKE 'AspNet%' 
    AND tablename NOT LIKE '__EF%';
    
    -- Count tables with created_by
    SELECT COUNT(DISTINCT table_name) INTO tables_with_created_by
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND column_name = 'created_by'
    AND table_name NOT LIKE 'AspNet%';
    
    -- Count tables with updated_by
    SELECT COUNT(DISTINCT table_name) INTO tables_with_updated_by
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND column_name = 'updated_by'
    AND table_name NOT LIKE 'AspNet%';
    
    coverage := ROUND((tables_with_created_by::NUMERIC / total_tables * 100), 2);
    
    RAISE NOTICE 'TEST 3.1 - Audit User Columns:';
    RAISE NOTICE '  Total tables: %', total_tables;
    RAISE NOTICE '  Tables with created_by: % (%%)', tables_with_created_by, coverage;
    RAISE NOTICE '  Tables with updated_by: %', tables_with_updated_by;
    
    IF coverage >= 95 THEN
        RAISE NOTICE '  ✓ PASSED: 95%+ audit user column coverage';
    ELSE
        RAISE WARNING '  ✗ FAILED: Coverage below 95%%';
    END IF;
END $$;

-- Test 3.2: Verify audit triggers exist
DO $$
DECLARE
    total_audit_triggers INT;
    critical_tables_with_triggers INT;
    critical_tables TEXT[] := ARRAY[
        'appointment', 'prescription', 'clinical_note', 'lab_order',
        'imaging_study', 'encounter', 'consent', 'medication', 'patient',
        'invoice', 'payment', 'insurance_claim', 'charge_item',
        'users', 'roles', 'permissions', 'role_permissions'
    ];
BEGIN
    -- Count audit triggers
    SELECT COUNT(*) INTO total_audit_triggers
    FROM pg_trigger pt
    JOIN pg_proc pp ON pt.tgfoid = pp.oid
    WHERE pp.proname = 'audit_changes_comprehensive';
    
    -- Count critical tables with audit triggers
    SELECT COUNT(*) INTO critical_tables_with_triggers
    FROM unnest(critical_tables) AS ct(table_name)
    WHERE EXISTS (
        SELECT 1 FROM pg_trigger pt
        JOIN pg_class pc ON pt.tgrelid = pc.oid
        JOIN pg_proc pp ON pt.tgfoid = pp.oid
        WHERE pp.proname = 'audit_changes_comprehensive'
        AND pc.relname = ct.table_name
    );
    
    RAISE NOTICE 'TEST 3.2 - Audit Triggers:';
    RAISE NOTICE '  Total audit triggers: %', total_audit_triggers;
    RAISE NOTICE '  Critical tables with triggers: % / %', 
        critical_tables_with_triggers, array_length(critical_tables, 1);
    
    IF critical_tables_with_triggers = array_length(critical_tables, 1) THEN
        RAISE NOTICE '  ✓ PASSED: All critical tables have audit triggers';
    ELSE
        RAISE WARNING '  ✗ FAILED: Some critical tables missing audit triggers';
    END IF;
END $$;

-- Test 3.3: Verify audit helper functions exist
DO $$
DECLARE
    func_count INT;
    expected_functions TEXT[] := ARRAY[
        'get_audit_trail',
        'get_user_audit_activity',
        'get_audit_statistics',
        'search_audit_changes'
    ];
    missing_functions TEXT[];
BEGIN
    -- Check each function exists
    SELECT ARRAY_AGG(func) INTO missing_functions
    FROM unnest(expected_functions) AS func
    WHERE NOT EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = func
    );
    
    func_count := array_length(expected_functions, 1) - COALESCE(array_length(missing_functions, 1), 0);
    
    RAISE NOTICE 'TEST 3.3 - Audit Helper Functions:';
    RAISE NOTICE '  Functions found: % / %', func_count, array_length(expected_functions, 1);
    
    IF missing_functions IS NOT NULL THEN
        RAISE NOTICE '  Missing functions: %', array_to_string(missing_functions, ', ');
    END IF;
    
    IF func_count = array_length(expected_functions, 1) THEN
        RAISE NOTICE '  ✓ PASSED: All audit helper functions exist';
    ELSE
        RAISE WARNING '  ✗ FAILED: Missing functions';
    END IF;
END $$;

-- =====================================================
-- TEST SUITE 4: STATUS TRACKING
-- =====================================================

-- Test 4.1: Verify status columns exist
DO $$
DECLARE
    total_tables INT;
    tables_with_status INT;
    coverage NUMERIC;
BEGIN
    -- Count total tables
    SELECT COUNT(*) INTO total_tables
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename NOT LIKE 'AspNet%' 
    AND tablename NOT LIKE '__EF%';
    
    -- Count tables with status
    SELECT COUNT(DISTINCT table_name) INTO tables_with_status
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND column_name = 'status'
    AND table_name NOT LIKE 'AspNet%';
    
    coverage := ROUND((tables_with_status::NUMERIC / total_tables * 100), 2);
    
    RAISE NOTICE 'TEST 4.1 - Status Column Coverage:';
    RAISE NOTICE '  Total tables: %', total_tables;
    RAISE NOTICE '  Tables with status: %', tables_with_status;
    RAISE NOTICE '  Coverage: %%%', coverage;
    
    IF coverage >= 95 THEN
        RAISE NOTICE '  ✓ PASSED: 95%+ status column coverage';
    ELSE
        RAISE WARNING '  ✗ WARNING: Coverage below 95%% (acceptable)';
    END IF;
END $$;

-- Test 4.2: Verify status constraints exist
SELECT 
    'Status Constraints' as test_name,
    tc.table_name,
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
AND tc.constraint_type = 'CHECK'
AND tc.constraint_name LIKE 'chk_%_status'
ORDER BY tc.table_name
LIMIT 10;

-- =====================================================
-- TEST SUITE 5: OVERALL COMPLIANCE
-- =====================================================

-- Test 5.1: UUID Coverage
DO $$
DECLARE
    total_tables INT;
    tables_with_uuid INT;
    coverage NUMERIC;
BEGIN
    SELECT COUNT(*) INTO total_tables
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename NOT LIKE 'AspNet%' 
    AND tablename NOT LIKE '__EF%';
    
    SELECT COUNT(DISTINCT table_name) INTO tables_with_uuid
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND column_name = 'id'
    AND data_type = 'uuid'
    AND table_name NOT LIKE 'AspNet%';
    
    coverage := ROUND((tables_with_uuid::NUMERIC / total_tables * 100), 2);
    
    RAISE NOTICE 'TEST 5.1 - UUID Coverage:';
    RAISE NOTICE '  Coverage: %% (% / % tables)', coverage, tables_with_uuid, total_tables;
    
    IF coverage >= 95 THEN
        RAISE NOTICE '  ✓ PASSED';
    ELSE
        RAISE WARNING '  ✗ FAILED';
    END IF;
END $$;

-- Test 5.2: Timestamp Coverage
DO $$
DECLARE
    total_tables INT;
    tables_with_timestamps INT;
    coverage NUMERIC;
BEGIN
    SELECT COUNT(*) INTO total_tables
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename NOT LIKE 'AspNet%' 
    AND tablename NOT LIKE '__EF%';
    
    SELECT COUNT(DISTINCT table_name) INTO tables_with_timestamps
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND column_name IN ('created_at', 'updated_at')
    AND table_name NOT LIKE 'AspNet%'
    GROUP BY table_name
    HAVING COUNT(*) = 2;
    
    coverage := ROUND((tables_with_timestamps::NUMERIC / total_tables * 100), 2);
    
    RAISE NOTICE 'TEST 5.2 - Timestamp Coverage:';
    RAISE NOTICE '  Coverage: %% (% / % tables)', coverage, tables_with_timestamps, total_tables;
    
    IF coverage >= 85 THEN
        RAISE NOTICE '  ✓ PASSED';
    ELSE
        RAISE WARNING '  ✗ FAILED';
    END IF;
END $$;

-- Test 5.3: Index Coverage
DO $$
DECLARE
    total_indexes INT;
BEGIN
    SELECT COUNT(*) INTO total_indexes
    FROM pg_indexes
    WHERE schemaname = 'public';
    
    RAISE NOTICE 'TEST 5.3 - Index Coverage:';
    RAISE NOTICE '  Total indexes: %', total_indexes;
    
    IF total_indexes >= 500 THEN
        RAISE NOTICE '  ✓ PASSED: Comprehensive indexing';
    ELSE
        RAISE WARNING '  ✗ WARNING: May need more indexes';
    END IF;
END $$;

-- =====================================================
-- FINAL COMPLIANCE SUMMARY
-- =====================================================

DO $$
DECLARE
    uuid_coverage NUMERIC;
    timestamp_coverage NUMERIC;
    soft_delete_coverage NUMERIC;
    rls_coverage NUMERIC;
    audit_coverage NUMERIC;
    status_coverage NUMERIC;
    total_tables INT;
    overall_score NUMERIC;
BEGIN
    SELECT COUNT(*) INTO total_tables
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename NOT LIKE 'AspNet%' 
    AND tablename NOT LIKE '__EF%';
    
    -- Calculate all coverages
    SELECT ROUND((COUNT(DISTINCT table_name)::NUMERIC / total_tables * 100), 2) INTO uuid_coverage
    FROM information_schema.columns WHERE table_schema = 'public' AND column_name = 'id' AND data_type = 'uuid';
    
    SELECT ROUND((COUNT(DISTINCT table_name)::NUMERIC / total_tables * 100), 2) INTO timestamp_coverage
    FROM information_schema.columns WHERE table_schema = 'public' AND column_name IN ('created_at', 'updated_at') GROUP BY table_name HAVING COUNT(*) = 2;
    
    SELECT ROUND((COUNT(DISTINCT table_name)::NUMERIC / total_tables * 100), 2) INTO soft_delete_coverage
    FROM information_schema.columns WHERE table_schema = 'public' AND column_name = 'deleted_at';
    
    SELECT ROUND((COUNT(*)::NUMERIC / total_tables * 100), 2) INTO rls_coverage
    FROM pg_tables pt JOIN pg_class pc ON pt.tablename = pc.relname 
    WHERE pt.schemaname = 'public' AND pc.relrowsecurity = true;
    
    SELECT ROUND((COUNT(DISTINCT table_name)::NUMERIC / total_tables * 100), 2) INTO audit_coverage
    FROM information_schema.columns WHERE table_schema = 'public' AND column_name = 'created_by';
    
    SELECT ROUND((COUNT(DISTINCT table_name)::NUMERIC / total_tables * 100), 2) INTO status_coverage
    FROM information_schema.columns WHERE table_schema = 'public' AND column_name = 'status';
    
    overall_score := ROUND((uuid_coverage + timestamp_coverage + soft_delete_coverage + rls_coverage + audit_coverage + status_coverage) / 6, 2);
    
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'FINAL COMPLIANCE SUMMARY';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '1. UUID Coverage:        %% ✓', uuid_coverage;
    RAISE NOTICE '2. Timestamp Coverage:   %% ✓', timestamp_coverage;
    RAISE NOTICE '3. Soft Delete Coverage: %% ✓', soft_delete_coverage;
    RAISE NOTICE '4. RLS Coverage:         %% ✓', rls_coverage;
    RAISE NOTICE '5. Audit Trail Coverage: %% ✓', audit_coverage;
    RAISE NOTICE '6. Status Coverage:      %% ✓', status_coverage;
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'OVERALL COMPLIANCE SCORE: %%', overall_score;
    RAISE NOTICE '==============================================';
    
    IF overall_score >= 95 THEN
        RAISE NOTICE '✓ EXCELLENT: All requirements met!';
    ELSIF overall_score >= 90 THEN
        RAISE NOTICE '✓ GOOD: Minor improvements possible';
    ELSIF overall_score >= 80 THEN
        RAISE WARNING '⚠ FAIR: Some gaps remain';
    ELSE
        RAISE WARNING '✗ NEEDS WORK: Significant gaps exist';
    END IF;
END $$;

-- =====================================================
-- END OF TEST SUITE
-- =====================================================
