-- Fix RLS policies for tables with tenant_id
DO $$
DECLARE
    tables_to_enable TEXT[] := ARRAY[
        'admin_configurations', 'app_roles', 'appointment', 'audit_log', 'branch',
        'clinical_examination', 'department', 'document_access_audit', 'failed_login_attempt',
        'organization', 'patient', 'patient_document_uploads', 'user_branch_access',
        'user_department_access', 'users'
    ];
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY tables_to_enable
    LOOP
        -- Enable RLS
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);

        -- Drop existing policy if it exists
        EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', table_name);

        -- Create tenant isolation policy
        EXECUTE format(
            'CREATE POLICY tenant_isolation ON %I FOR ALL USING (tenant_id::text = current_setting(''app.current_tenant_id'', true))',
            table_name
        );

        RAISE NOTICE 'RLS enabled for table: %', table_name;
    END LOOP;

    RAISE NOTICE 'RLS policies creation completed';
END $$;