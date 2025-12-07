-- =====================================================
-- AUDIT SYSTEM IMPLEMENTATION
-- Create audit triggers for critical tables
-- =====================================================

-- Create main audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    changed_fields JSONB,
    user_id UUID,
    user_name VARCHAR(256),
    session_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    transaction_id TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_timestamp ON audit_log(tenant_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);

-- Generic audit function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    old_row JSONB;
    new_row JSONB;
    changed_fields JSONB := '{}';
    field_name TEXT;
BEGIN
    -- Convert OLD and NEW to JSONB
    IF TG_OP = 'DELETE' THEN
        old_row := to_jsonb(OLD);
        new_row := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
        old_row := to_jsonb(OLD);
        new_row := to_jsonb(NEW);

        -- Identify changed fields
        FOR field_name IN SELECT jsonb_object_keys(old_row)
        LOOP
            IF old_row->field_name IS DISTINCT FROM new_row->field_name THEN
                changed_fields := changed_fields || jsonb_build_object(field_name, jsonb_build_object('old', old_row->field_name, 'new', new_row->field_name));
            END IF;
        END LOOP;
    ELSIF TG_OP = 'INSERT' THEN
        old_row := NULL;
        new_row := to_jsonb(NEW);
    END IF;

    -- Insert audit record
    INSERT INTO audit_log (
        tenant_id,
        table_name,
        record_id,
        operation,
        old_values,
        new_values,
        changed_fields,
        user_id,
        user_name,
        session_id,
        transaction_id
    ) VALUES (
        COALESCE(NEW.tenant_id, OLD.tenant_id, '550e8400-e29b-41d4-a716-446655440000'),
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        old_row,
        new_row,
        CASE WHEN changed_fields = '{}' THEN NULL ELSE changed_fields END,
        NULLIF(current_setting('app.user_id', true), ''),
        NULLIF(current_setting('app.user_name', true), ''),
        NULLIF(current_setting('app.session_id', true), ''),
        txid_current()::TEXT
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for existing critical tables

-- Permissions table audit
DROP TRIGGER IF EXISTS audit_permissions_trigger ON permissions;
CREATE TRIGGER audit_permissions_trigger
    AFTER INSERT OR UPDATE OR DELETE ON permissions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Roles table audit
DROP TRIGGER IF EXISTS audit_roles_trigger ON roles;
CREATE TRIGGER audit_roles_trigger
    AFTER INSERT OR UPDATE OR DELETE ON roles
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Role permissions table audit
DROP TRIGGER IF EXISTS audit_role_permissions_trigger ON role_permissions;
CREATE TRIGGER audit_role_permissions_trigger
    AFTER INSERT OR UPDATE OR DELETE ON role_permissions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Departments table audit
DROP TRIGGER IF EXISTS audit_departments_trigger ON departments;
CREATE TRIGGER audit_departments_trigger
    AFTER INSERT OR UPDATE OR DELETE ON departments
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Document types table audit
DROP TRIGGER IF EXISTS audit_document_types_trigger ON document_types;
CREATE TRIGGER audit_document_types_trigger
    AFTER INSERT OR UPDATE OR DELETE ON document_types
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Document access rules table audit
DROP TRIGGER IF EXISTS audit_document_access_rules_trigger ON document_access_rules;
CREATE TRIGGER audit_document_access_rules_trigger
    AFTER INSERT OR UPDATE OR DELETE ON document_access_rules
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Admin configurations table audit
DROP TRIGGER IF EXISTS audit_admin_configurations_trigger ON admin_configurations;
CREATE TRIGGER audit_admin_configurations_trigger
    AFTER INSERT OR UPDATE OR DELETE ON admin_configurations
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Patient document uploads table audit (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_document_uploads') THEN
        EXECUTE 'DROP TRIGGER IF EXISTS audit_patient_document_uploads_trigger ON patient_document_uploads';
        EXECUTE 'CREATE TRIGGER audit_patient_document_uploads_trigger
            AFTER INSERT OR UPDATE OR DELETE ON patient_document_uploads
            FOR EACH ROW EXECUTE FUNCTION audit_trigger_function()';
    END IF;
END $$;

-- Create audit triggers for future tables (these will be activated when tables are created)
-- Note: These are prepared statements that can be executed when the respective tables are created

-- Function to create audit trigger for any table
CREATE OR REPLACE FUNCTION create_audit_trigger(table_name TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE format('DROP TRIGGER IF EXISTS audit_%I_trigger ON %I', table_name, table_name);
    EXECUTE format('CREATE TRIGGER audit_%I_trigger
        AFTER INSERT OR UPDATE OR DELETE ON %I
        FOR EACH ROW EXECUTE FUNCTION audit_trigger_function()', table_name, table_name);
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers for critical future tables when they exist
-- Patients table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients') THEN
        PERFORM create_audit_trigger('patients');
    END IF;
END $$;

-- Medical records table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'medical_records') THEN
        PERFORM create_audit_trigger('medical_records');
    END IF;
END $$;

-- Prescriptions table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prescriptions') THEN
        PERFORM create_audit_trigger('prescriptions');
    END IF;
END $$;

-- Appointments table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
        PERFORM create_audit_trigger('appointments');
    END IF;
END $$;

-- Lab results table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lab_results') THEN
        PERFORM create_audit_trigger('lab_results');
    END IF;
END $$;

-- Imaging results table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'imaging_results') THEN
        PERFORM create_audit_trigger('imaging_results');
    END IF;
END $$;

-- Billing records table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'billing_records') THEN
        PERFORM create_audit_trigger('billing_records');
    END IF;
END $$;

-- User access audit table (separate from main audit log)
CREATE TABLE IF NOT EXISTS user_access_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID,
    user_name VARCHAR(256),
    action VARCHAR(100) NOT NULL, -- LOGIN, LOGOUT, ACCESS_DENIED, etc.
    resource VARCHAR(255),
    resource_type VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    success BOOLEAN DEFAULT true,
    failure_reason TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    additional_data JSONB
);

-- Create indexes for user access audit
CREATE INDEX IF NOT EXISTS idx_user_access_audit_tenant_timestamp ON user_access_audit(tenant_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_user_access_audit_user ON user_access_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_user_access_audit_action ON user_access_audit(action);

-- Function to log user access events
CREATE OR REPLACE FUNCTION log_user_access(
    p_tenant_id UUID,
    p_user_id UUID DEFAULT NULL,
    p_user_name VARCHAR(256) DEFAULT NULL,
    p_action VARCHAR(100),
    p_resource VARCHAR(255) DEFAULT NULL,
    p_resource_type VARCHAR(100) DEFAULT NULL,
    p_success BOOLEAN DEFAULT true,
    p_failure_reason TEXT DEFAULT NULL,
    p_additional_data JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_access_audit (
        tenant_id,
        user_id,
        user_name,
        action,
        resource,
        resource_type,
        ip_address,
        user_agent,
        session_id,
        success,
        failure_reason,
        additional_data
    ) VALUES (
        p_tenant_id,
        p_user_id,
        p_user_name,
        p_action,
        p_resource,
        p_resource_type,
        NULLIF(current_setting('app.client_ip', true), '')::INET,
        NULLIF(current_setting('app.user_agent', true), ''),
        NULLIF(current_setting('app.session_id', true), ''),
        p_success,
        p_failure_reason,
        p_additional_data
    );
END;
$$ LANGUAGE plpgsql;

-- Create HIPAA compliance audit view
CREATE OR REPLACE VIEW hipaa_compliance_audit AS
SELECT
    al.*,
    CASE
        WHEN al.table_name IN ('patients', 'medical_records', 'prescriptions', 'lab_results', 'imaging_results') THEN 'PHI'
        WHEN al.table_name IN ('billing_records', 'insurance_claims') THEN 'PII'
        ELSE 'General'
    END as data_classification,
    CASE
        WHEN al.operation = 'DELETE' THEN 'Data Deletion'
        WHEN al.operation = 'UPDATE' AND al.changed_fields IS NOT NULL THEN 'Data Modification'
        WHEN al.operation = 'INSERT' THEN 'Data Creation'
        ELSE 'Data Access'
    END as compliance_event_type
FROM audit_log al
WHERE al.table_name IN ('patients', 'medical_records', 'prescriptions', 'lab_results', 'imaging_results', 'billing_records', 'insurance_claims', 'permissions', 'roles', 'role_permissions')
ORDER BY al.timestamp DESC;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Audit system implemented successfully!';
    RAISE NOTICE '✓ Created comprehensive audit logging system';
    RAISE NOTICE '✓ Added audit triggers for all existing critical tables';
    RAISE NOTICE '✓ Created user access audit system';
    RAISE NOTICE '✓ Added HIPAA compliance audit view';
    RAISE NOTICE '✓ Audit triggers ready for future tables';
END $$;