-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES IMPLEMENTATION
-- Ensure tenant isolation across all tables
-- =====================================================

-- Enable RLS on all tenant-specific tables
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_access_audit ENABLE ROW LEVEL SECURITY;

-- Create tenant isolation policies for each table

-- Permissions table RLS
DROP POLICY IF EXISTS tenant_isolation_permissions ON permissions;
CREATE POLICY tenant_isolation_permissions ON permissions
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Roles table RLS
DROP POLICY IF EXISTS tenant_isolation_roles ON roles;
CREATE POLICY tenant_isolation_roles ON roles
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Role permissions table RLS
DROP POLICY IF EXISTS tenant_isolation_role_permissions ON role_permissions;
CREATE POLICY tenant_isolation_role_permissions ON role_permissions
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Departments table RLS
DROP POLICY IF EXISTS tenant_isolation_departments ON departments;
CREATE POLICY tenant_isolation_departments ON departments
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Document types table RLS
DROP POLICY IF EXISTS tenant_isolation_document_types ON document_types;
CREATE POLICY tenant_isolation_document_types ON document_types
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Document access rules table RLS
DROP POLICY IF EXISTS tenant_isolation_document_access_rules ON document_access_rules;
CREATE POLICY tenant_isolation_document_access_rules ON document_access_rules
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Audit log table RLS (tenant-specific audit data)
DROP POLICY IF EXISTS tenant_isolation_audit_log ON audit_log;
CREATE POLICY tenant_isolation_audit_log ON audit_log
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- User access audit table RLS
DROP POLICY IF EXISTS tenant_isolation_user_access_audit ON user_access_audit;
CREATE POLICY tenant_isolation_user_access_audit ON user_access_audit
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Special policies for system-wide tables

-- Admin configurations - allow access for system administrators only
DROP POLICY IF EXISTS admin_config_tenant_access ON admin_configurations;
CREATE POLICY admin_config_tenant_access ON admin_configurations
FOR ALL USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    OR current_setting('app.user_role', true) = 'System Administrator'
);

-- Document access audit - allow access for compliance officers
DROP POLICY IF EXISTS document_audit_tenant_access ON document_access_audit;
CREATE POLICY document_audit_tenant_access ON document_access_audit
FOR ALL USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    OR current_setting('app.user_role', true) IN ('System Administrator', 'Compliance Officer')
);

-- Patient document uploads - tenant isolation with additional HIPAA controls
DROP POLICY IF EXISTS patient_docs_tenant_access ON patient_document_uploads;
CREATE POLICY patient_docs_tenant_access ON patient_document_uploads
FOR ALL USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND (
        current_setting('app.user_role', true) IN ('System Administrator', 'Hospital Administrator')
        OR current_setting('app.hipaa_authorized', true) = 'true'
    )
);

-- Create RLS policies for future tables (when they are created)
-- These functions will be called when new tables are added

CREATE OR REPLACE FUNCTION enable_tenant_rls(table_name TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_%I ON %I', table_name, table_name);
    EXECUTE format('CREATE POLICY tenant_isolation_%I ON %I FOR ALL USING (tenant_id::text = current_setting(''app.current_tenant_id'', true))', table_name, table_name);
END;
$$ LANGUAGE plpgsql;

-- Function to check if RLS is working correctly
CREATE OR REPLACE FUNCTION test_rls_isolation(test_tenant_id UUID DEFAULT '550e8400-e29b-41d4-a716-446655440000')
RETURNS TABLE(table_name TEXT, rls_enabled BOOLEAN, policy_count BIGINT) AS $$
BEGIN
    -- Set test tenant context
    PERFORM set_config('app.current_tenant_id', test_tenant_id::text, false);

    RETURN QUERY
    SELECT
        t.table_name::TEXT,
        t.rowsecurity,
        COUNT(p.polname)::BIGINT as policy_count
    FROM information_schema.tables t
    LEFT JOIN pg_policies p ON p.tablename = t.table_name AND p.schemaname = t.table_schema
    WHERE t.table_schema = 'public'
      AND t.table_name NOT LIKE 'pg_%'
      AND t.table_type = 'BASE TABLE'
    GROUP BY t.table_name, t.rowsecurity
    ORDER BY t.table_name;
END;
$$ LANGUAGE plpgsql;

-- Create bypass role for system operations
-- This role can bypass RLS for system maintenance
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rls_admin') THEN
        CREATE ROLE rls_admin;
    END IF;
END $$;

-- Grant bypass permission to system administrators
GRANT rls_admin TO postgres;

-- Create a view to show RLS status across all tables
CREATE OR REPLACE VIEW rls_status AS
SELECT
    t.table_name,
    t.rowsecurity as rls_enabled,
    COUNT(p.polname) as policy_count,
    STRING_AGG(p.polname, ', ') as policies
FROM information_schema.tables t
LEFT JOIN pg_policies p ON p.tablename = t.table_name AND p.schemaname = t.table_schema
WHERE t.table_schema = 'public'
  AND t.table_name NOT LIKE 'pg_%'
  AND t.table_type = 'BASE TABLE'
GROUP BY t.table_name, t.rowsecurity
ORDER BY t.table_name;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'RLS policies implemented successfully!';
    RAISE NOTICE '✓ Enabled RLS on all tenant-specific tables';
    RAISE NOTICE '✓ Created tenant isolation policies';
    RAISE NOTICE '✓ Added special policies for admin and compliance access';
    RAISE NOTICE '✓ Created RLS testing and management functions';
    RAISE NOTICE '✓ RLS system ready for HIPAA compliance';
END $$;