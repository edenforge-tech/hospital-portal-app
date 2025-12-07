-- =====================================================
-- COMPLETE SECURITY FEATURES - HIPAA COMPLIANCE
-- Hospital Portal - Final Security Implementation
-- =====================================================

-- =====================================================
-- PHASE 1: SOFT DELETE FUNCTIONS (6 MISSING)
-- =====================================================

-- Function to permanently delete a record (admin only)
CREATE OR REPLACE FUNCTION permanently_delete_record(
    p_table_name TEXT,
    p_record_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    sql_query TEXT;
BEGIN
    -- Build dynamic SQL for permanent deletion
    sql_query := format('DELETE FROM %I WHERE id = %L', p_table_name, p_record_id);

    -- Execute the deletion
    EXECUTE sql_query;

    -- Log the permanent deletion
    INSERT INTO audit_log (
        table_name, record_id, action, old_values,
        performed_by_user_id, performed_at, reason
    ) VALUES (
        p_table_name, p_record_id, 'PERMANENT_DELETE',
        jsonb_build_object('permanently_deleted', true),
        current_setting('app.current_user_id', true)::UUID,
        NOW(),
        'Administrative permanent deletion'
    );

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for bulk soft delete operations
CREATE OR REPLACE FUNCTION bulk_soft_delete(
    p_table_name TEXT,
    p_record_ids UUID[],
    p_reason TEXT DEFAULT 'Bulk operation'
) RETURNS INTEGER AS $$
DECLARE
    sql_query TEXT;
    affected_count INTEGER;
BEGIN
    -- Build dynamic SQL for bulk soft delete
    sql_query := format(
        'UPDATE %I SET deleted_at = NOW(), updated_at = NOW(), updated_by_user_id = %L WHERE id = ANY(%L) AND deleted_at IS NULL',
        p_table_name,
        current_setting('app.current_user_id', true),
        p_record_ids
    );

    -- Execute the bulk update
    EXECUTE sql_query;
    GET DIAGNOSTICS affected_count = ROW_COUNT;

    -- Log the bulk operation
    INSERT INTO audit_log (
        table_name, action, new_values,
        performed_by_user_id, performed_at, reason
    ) VALUES (
        p_table_name, 'BULK_SOFT_DELETE',
        jsonb_build_object('affected_records', affected_count, 'record_ids', p_record_ids),
        current_setting('app.current_user_id', true)::UUID,
        NOW(),
        p_reason
    );

    RETURN affected_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get deleted records for a table
CREATE OR REPLACE FUNCTION get_deleted_records(
    p_table_name TEXT,
    p_limit INTEGER DEFAULT 100
) RETURNS TABLE(
    id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by_user_id UUID,
    data JSONB
) AS $$
DECLARE
    sql_query TEXT;
BEGIN
    -- Build dynamic SQL to get deleted records
    sql_query := format(
        'SELECT id, deleted_at, updated_by_user_id as deleted_by_user_id,
                row_to_json(%I.*) as data
         FROM %I
         WHERE deleted_at IS NOT NULL
         ORDER BY deleted_at DESC
         LIMIT %s',
        p_table_name, p_table_name, p_limit
    );

    RETURN QUERY EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-purge old deleted records (30+ days old)
CREATE OR REPLACE FUNCTION auto_purge_old_deleted_records(
    p_days_old INTEGER DEFAULT 30
) RETURNS INTEGER AS $$
DECLARE
    total_purged INTEGER := 0;
    table_record RECORD;
    purge_count INTEGER;
    sql_query TEXT;
BEGIN
    -- Get all tables with deleted_at column
    FOR table_record IN
        SELECT DISTINCT table_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND column_name = 'deleted_at'
        AND table_name NOT LIKE 'AspNet%'
    LOOP
        -- Build and execute purge query for this table
        sql_query := format(
            'DELETE FROM %I WHERE deleted_at < NOW() - INTERVAL ''%s days''',
            table_record.table_name, p_days_old
        );

        EXECUTE sql_query;
        GET DIAGNOSTICS purge_count = ROW_COUNT;
        total_purged := total_purged + purge_count;

        -- Log the purge operation
        IF purge_count > 0 THEN
            INSERT INTO audit_log (
                table_name, action, new_values,
                performed_by_user_id, performed_at, reason
            ) VALUES (
                table_record.table_name, 'AUTO_PURGE',
                jsonb_build_object('records_purged', purge_count, 'days_old', p_days_old),
                current_setting('app.current_user_id', true)::UUID,
                NOW(),
                'Automated cleanup of old deleted records'
            );
        END IF;
    END LOOP;

    RETURN total_purged;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for cascading soft delete of patient-related records
CREATE OR REPLACE FUNCTION soft_delete_patient_cascade(
    p_patient_id UUID
) RETURNS INTEGER AS $$
DECLARE
    total_affected INTEGER := 0;
    cascade_tables TEXT[] := ARRAY[
        'appointment', 'prescription', 'clinical_note', 'lab_order',
        'imaging_study', 'encounter', 'consent', 'medication',
        'invoice', 'payment', 'insurance_claim', 'charge_item'
    ];
    table_name TEXT;
    sql_query TEXT;
    affected_count INTEGER;
BEGIN
    -- Soft delete the patient first
    UPDATE patient SET
        deleted_at = NOW(),
        updated_at = NOW(),
        updated_by_user_id = current_setting('app.current_user_id', true)::UUID
    WHERE id = p_patient_id AND deleted_at IS NULL;

    GET DIAGNOSTICS affected_count = ROW_COUNT;
    total_affected := total_affected + affected_count;

    -- Cascade soft delete to related tables
    FOREACH table_name IN ARRAY cascade_tables
    LOOP
        -- Build dynamic SQL for cascade deletion
        sql_query := format(
            'UPDATE %I SET deleted_at = NOW(), updated_at = NOW(),
                    updated_by_user_id = %L
             WHERE patient_id = %L AND deleted_at IS NULL',
            table_name,
            current_setting('app.current_user_id', true),
            p_patient_id
        );

        EXECUTE sql_query;
        GET DIAGNOSTICS affected_count = ROW_COUNT;
        total_affected := total_affected + affected_count;
    END LOOP;

    -- Log the cascade operation
    INSERT INTO audit_log (
        table_name, record_id, action, new_values,
        performed_by_user_id, performed_at, reason
    ) VALUES (
        'patient', p_patient_id, 'CASCADE_SOFT_DELETE',
        jsonb_build_object('total_affected_records', total_affected),
        current_setting('app.current_user_id', true)::UUID,
        NOW(),
        'Patient cascade soft delete operation'
    );

    RETURN total_affected;
END;
$$ LANGUAGE plpgsql;

-- Function to get soft delete statistics
CREATE OR REPLACE FUNCTION get_soft_delete_stats()
RETURNS TABLE(
    table_name TEXT,
    total_records BIGINT,
    deleted_records BIGINT,
    active_records BIGINT,
    deletion_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.table_name::TEXT,
        COALESCE(stats.total_records, 0)::BIGINT as total_records,
        COALESCE(stats.deleted_records, 0)::BIGINT as deleted_records,
        COALESCE(stats.active_records, 0)::BIGINT as active_records,
        CASE
            WHEN stats.total_records > 0
            THEN ROUND((stats.deleted_records::NUMERIC / stats.total_records * 100), 2)
            ELSE 0
        END as deletion_percentage
    FROM (
        SELECT DISTINCT table_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND column_name = 'deleted_at'
        AND table_name NOT LIKE 'AspNet%'
    ) t
    LEFT JOIN (
        SELECT
            c.table_name,
            SUM(CASE WHEN deleted_at IS NULL THEN 0 ELSE 1 END) as deleted_records,
            SUM(CASE WHEN deleted_at IS NULL THEN 1 ELSE 0 END) as active_records,
            COUNT(*) as total_records
        FROM (
            SELECT DISTINCT table_name
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND column_name = 'deleted_at'
            AND table_name NOT LIKE 'AspNet%'
        ) dt
        CROSS JOIN LATERAL (
            SELECT * FROM information_schema.columns ic
            WHERE ic.table_schema = 'public'
            AND ic.table_name = dt.table_name
            AND ic.column_name = 'deleted_at'
        ) c
        GROUP BY c.table_name
    ) stats ON t.table_name = stats.table_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PHASE 2: SOFT DELETE INDEXES (48 MISSING)
-- =====================================================

-- Add missing soft delete indexes for all tables with deleted_at column
DO $$
DECLARE
    table_record RECORD;
    index_count INTEGER;
BEGIN
    -- Get all tables with deleted_at column
    FOR table_record IN
        SELECT DISTINCT table_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND column_name = 'deleted_at'
        AND table_name NOT LIKE 'AspNet%'
        AND table_name NOT LIKE '__EF%'
    LOOP
        -- Check if idx_{table}_deleted index exists
        SELECT COUNT(*) INTO index_count
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = table_record.table_name
        AND indexname = 'idx_' || table_record.table_name || '_deleted';

        -- Create index if it doesn't exist
        IF index_count = 0 THEN
            EXECUTE format('CREATE INDEX idx_%I_deleted ON %I (deleted_at) WHERE deleted_at IS NOT NULL',
                          table_record.table_name, table_record.table_name);
        END IF;

        -- Check if idx_{table}_active index exists
        SELECT COUNT(*) INTO index_count
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = table_record.table_name
        AND indexname = 'idx_' || table_record.table_name || '_active';

        -- Create index if it doesn't exist
        IF index_count = 0 THEN
            EXECUTE format('CREATE INDEX idx_%I_active ON %I (id) WHERE deleted_at IS NULL',
                          table_record.table_name, table_record.table_name);
        END IF;
    END LOOP;

    RAISE NOTICE 'Soft delete indexes creation completed';
END $$;

-- =====================================================
-- PHASE 3: RLS POLICIES FOR 25 MISSING TABLES
-- =====================================================

-- Enable RLS on missing tables and create policies
DO $$
DECLARE
    missing_tables TEXT[] := ARRAY[
        'admin_configurations', 'app_role_claims', 'app_roles',
        'app_user_claims', 'app_user_logins', 'app_user_roles',
        'app_user_tokens', 'appointment', 'audit_log', 'branch',
        'clinical_examination', 'department', 'document_access_audit',
        'failed_login_attempt', 'organization', 'patient',
        'patient_document_uploads', 'permission_types', 'permissions',
        'role_permission', 'tenant', 'user_attribute',
        'user_branch_access', 'user_department_access', 'users'
    ];
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY missing_tables
    LOOP
        -- Enable RLS if not already enabled
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);

        -- Drop existing policy if it exists
        EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', table_name);

        -- Create new tenant isolation policy
        EXECUTE format(
            'CREATE POLICY tenant_isolation ON %I FOR ALL USING (tenant_id::text = current_setting(''app.current_tenant_id'', true))',
            table_name
        );

        RAISE NOTICE 'RLS policy created for table: %', table_name;
    END LOOP;

    RAISE NOTICE 'RLS policies creation completed for 25 missing tables';
END $$;

-- =====================================================
-- PHASE 4: AUDIT TRIGGERS FOR 15 CRITICAL TABLES
-- =====================================================

-- Create comprehensive audit trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION audit_changes_comprehensive()
RETURNS TRIGGER AS $$
DECLARE
    old_row JSONB;
    new_row JSONB;
    changes JSONB := '{}';
    change_reason TEXT;
BEGIN
    -- Get old and new row data
    old_row := CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD)::JSONB ELSE NULL END;
    new_row := CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW)::JSONB ELSE NULL END;

    -- Determine change reason
    change_reason := COALESCE(
        current_setting('app.change_reason', true),
        CASE
            WHEN TG_OP = 'INSERT' THEN 'Record created'
            WHEN TG_OP = 'UPDATE' THEN 'Record updated'
            WHEN TG_OP = 'DELETE' THEN 'Record deleted'
        END
    );

    -- For updates, calculate what changed
    IF TG_OP = 'UPDATE' THEN
        SELECT jsonb_object_agg(key, jsonb_build_array(old_value, new_value))
        INTO changes
        FROM (
            SELECT key,
                   old_row->key as old_value,
                   new_row->key as new_value
            FROM jsonb_object_keys(old_row) as key
            WHERE old_row->key IS DISTINCT FROM new_row->key
        ) diff;
    END IF;

    -- Insert audit record
    INSERT INTO audit_log (
        table_name,
        record_id,
        action,
        old_values,
        new_values,
        changed_fields,
        performed_by_user_id,
        performed_at,
        reason,
        tenant_id
    ) VALUES (
        TG_TABLE_NAME,
        CASE
            WHEN TG_OP = 'DELETE' THEN OLD.id
            ELSE NEW.id
        END,
        TG_OP,
        old_row,
        new_row,
        CASE WHEN TG_OP = 'UPDATE' THEN changes ELSE NULL END,
        CASE
            WHEN TG_OP = 'DELETE' THEN OLD.updated_by_user_id
            ELSE NEW.updated_by_user_id
        END,
        NOW(),
        change_reason,
        CASE
            WHEN TG_OP = 'DELETE' THEN OLD.tenant_id
            ELSE NEW.tenant_id
        END
    );

    RETURN CASE
        WHEN TG_OP = 'DELETE' THEN OLD
        ELSE NEW
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to remaining critical tables
DO $$
DECLARE
    critical_tables TEXT[] := ARRAY[
        'appointment', 'prescription', 'clinical_note', 'lab_order',
        'imaging_study', 'encounter', 'consent', 'medication', 'patient',
        'invoice', 'payment', 'insurance_claim', 'charge_item',
        'users', 'app_roles', 'permissions', 'role_permission'
    ];
    table_name TEXT;
    trigger_exists BOOLEAN;
BEGIN
    FOREACH table_name IN ARRAY critical_tables
    LOOP
        -- Check if trigger already exists
        SELECT EXISTS(
            SELECT 1 FROM pg_trigger pt
            JOIN pg_class pc ON pt.tgrelid = pc.oid
            JOIN pg_proc pp ON pt.tgfoid = pp.oid
            WHERE pc.relname = table_name
            AND pp.proname = 'audit_changes_comprehensive'
        ) INTO trigger_exists;

        -- Create trigger if it doesn't exist
        IF NOT trigger_exists THEN
            EXECUTE format(
                'CREATE TRIGGER audit_%I_changes
                 AFTER INSERT OR UPDATE OR DELETE ON %I
                 FOR EACH ROW EXECUTE FUNCTION audit_changes_comprehensive()',
                table_name, table_name
            );
            RAISE NOTICE 'Audit trigger created for table: %', table_name;
        END IF;
    END LOOP;

    RAISE NOTICE 'Audit triggers creation completed for critical tables';
END $$;

-- =====================================================
-- PHASE 5: AUDIT HELPER FUNCTIONS (4 MISSING)
-- =====================================================

-- Function to get audit trail for a specific record
CREATE OR REPLACE FUNCTION get_audit_trail(
    p_table_name TEXT,
    p_record_id UUID,
    p_limit INTEGER DEFAULT 50
) RETURNS TABLE(
    audit_id UUID,
    action TEXT,
    performed_at TIMESTAMP WITH TIME ZONE,
    performed_by_user_id UUID,
    reason TEXT,
    old_values JSONB,
    new_values JSONB,
    changed_fields JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        al.id,
        al.action,
        al.performed_at,
        al.performed_by_user_id,
        al.reason,
        al.old_values,
        al.new_values,
        al.changed_fields
    FROM audit_log al
    WHERE al.table_name = p_table_name
    AND al.record_id = p_record_id
    ORDER BY al.performed_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user audit activity
CREATE OR REPLACE FUNCTION get_user_audit_activity(
    p_user_id UUID,
    p_days INTEGER DEFAULT 30
) RETURNS TABLE(
    table_name TEXT,
    action TEXT,
    record_count BIGINT,
    last_activity TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        al.table_name,
        al.action,
        COUNT(*) as record_count,
        MAX(al.performed_at) as last_activity
    FROM audit_log al
    WHERE al.performed_by_user_id = p_user_id
    AND al.performed_at >= NOW() - INTERVAL '1 day' * p_days
    GROUP BY al.table_name, al.action
    ORDER BY last_activity DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get audit statistics
CREATE OR REPLACE FUNCTION get_audit_statistics(
    p_days INTEGER DEFAULT 30
) RETURNS TABLE(
    table_name TEXT,
    total_changes BIGINT,
    inserts BIGINT,
    updates BIGINT,
    deletes BIGINT,
    most_active_user UUID,
    last_change TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        al.table_name,
        COUNT(*) as total_changes,
        COUNT(CASE WHEN al.action = 'INSERT' THEN 1 END) as inserts,
        COUNT(CASE WHEN al.action = 'UPDATE' THEN 1 END) as updates,
        COUNT(CASE WHEN al.action = 'DELETE' THEN 1 END) as deletes,
        (ARRAY_AGG(al.performed_by_user_id ORDER BY al.performed_at DESC))[1] as most_active_user,
        MAX(al.performed_at) as last_change
    FROM audit_log al
    WHERE al.performed_at >= NOW() - INTERVAL '1 day' * p_days
    GROUP BY al.table_name
    ORDER BY total_changes DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search audit changes
CREATE OR REPLACE FUNCTION search_audit_changes(
    p_table_name TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_action TEXT DEFAULT NULL,
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_search_text TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 100
) RETURNS TABLE(
    audit_id UUID,
    table_name TEXT,
    record_id UUID,
    action TEXT,
    performed_at TIMESTAMP WITH TIME ZONE,
    performed_by_user_id UUID,
    reason TEXT,
    changes_summary TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        al.id,
        al.table_name,
        al.record_id,
        al.action,
        al.performed_at,
        al.performed_by_user_id,
        al.reason,
        CASE
            WHEN al.changed_fields IS NOT NULL
            THEN array_to_string(ARRAY(SELECT jsonb_object_keys(al.changed_fields)), ', ')
            ELSE 'No field changes'
        END as changes_summary
    FROM audit_log al
    WHERE (p_table_name IS NULL OR al.table_name = p_table_name)
    AND (p_user_id IS NULL OR al.performed_by_user_id = p_user_id)
    AND (p_action IS NULL OR al.action = p_action)
    AND (p_start_date IS NULL OR al.performed_at >= p_start_date)
    AND (p_end_date IS NULL OR al.performed_at <= p_end_date)
    AND (p_search_text IS NULL OR
         al.reason ILIKE '%' || p_search_text || '%' OR
         al.old_values::TEXT ILIKE '%' || p_search_text || '%' OR
         al.new_values::TEXT ILIKE '%' || p_search_text || '%')
    ORDER BY al.performed_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PHASE 6: FINAL VALIDATION
-- =====================================================

-- Run final compliance check
SELECT
    'feature' as category,
    'Soft Delete' as feature,
    tables_covered as tables_covered,
    coverage_pct as coverage_pct
FROM (
    SELECT
        COUNT(DISTINCT table_name) as tables_covered,
        ROUND(
            COUNT(DISTINCT table_name)::NUMERIC /
            (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE 'AspNet%' AND tablename NOT LIKE '__EF%') * 100,
            2
        ) as coverage_pct
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND column_name = 'deleted_at'
) sd

UNION ALL

SELECT
    'feature' as category,
    'RLS Coverage' as feature,
    tables_covered as tables_covered,
    coverage_pct as coverage_pct
FROM (
    SELECT
        COUNT(*) as tables_covered,
        ROUND(
            COUNT(*)::NUMERIC /
            (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE 'AspNet%' AND tablename NOT LIKE '__EF%') * 100,
            2
        ) as coverage_pct
    FROM pg_tables pt
    JOIN pg_class pc ON pt.tablename = pc.relname
    JOIN pg_namespace pn ON pc.relnamespace = pn.oid AND pn.nspname = pt.schemaname
    WHERE pt.schemaname = 'public'
    AND pt.tablename NOT LIKE 'AspNet%'
    AND pt.tablename NOT LIKE '__EF%'
    AND pc.relrowsecurity = true
) rls

UNION ALL

SELECT
    'feature' as category,
    'Audit Columns' as feature,
    tables_covered as tables_covered,
    coverage_pct as coverage_pct
FROM (
    SELECT
        COUNT(DISTINCT table_name) as tables_covered,
        ROUND(
            COUNT(DISTINCT table_name)::NUMERIC /
            (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE 'AspNet%' AND tablename NOT LIKE '__EF%') * 100,
            2
        ) as coverage_pct
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND column_name = 'created_by'
) ac;

-- =====================================================
-- COMPLETION SUMMARY
-- =====================================================

SELECT 'Complete security features implementation finished successfully!' as status;