-- ============================================================
-- Migration: Admin Configurations Table
-- Purpose: System-wide configuration storage with RBAC
-- Date: November 10, 2025
-- ============================================================

-- Drop table if exists (for clean re-creation)
DROP TABLE IF EXISTS admin_configurations CASCADE;

-- Create admin_configurations table
CREATE TABLE admin_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    
    -- Configuration key-value
    config_key VARCHAR(100) NOT NULL,
    config_value TEXT,
    config_type VARCHAR(50) NOT NULL, -- string, number, boolean, json, array
    
    -- Metadata
    config_category VARCHAR(50), -- system, security, billing, clinical, operational
    description TEXT,
    display_name VARCHAR(200),
    
    -- Access control
    editable_by_roles TEXT[], -- Array of role codes that can edit this config
    visible_to_roles TEXT[], -- Array of role codes that can view this config
    is_system_config BOOLEAN DEFAULT FALSE, -- System configs cannot be deleted
    is_sensitive BOOLEAN DEFAULT FALSE, -- Sensitive configs are masked in logs
    
    -- Validation
    validation_rules JSONB, -- JSON schema for validation
    allowed_values TEXT[], -- For enum-type configs
    min_value NUMERIC,
    max_value NUMERIC,
    
    -- Change tracking
    previous_value TEXT,
    change_reason TEXT,
    requires_restart BOOLEAN DEFAULT FALSE,
    
    -- Standard audit columns
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID,
    updated_at TIMESTAMPTZ,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ,
    deleted_by_user_id UUID,
    
    -- Constraints
    CONSTRAINT fk_admin_config_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    CONSTRAINT fk_admin_config_created_by FOREIGN KEY (created_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_admin_config_updated_by FOREIGN KEY (updated_by_user_id) REFERENCES users(id),
    CONSTRAINT chk_admin_config_type CHECK (config_type IN ('string', 'number', 'boolean', 'json', 'array', 'date', 'time', 'datetime', 'url', 'email')),
    CONSTRAINT chk_admin_config_category CHECK (config_category IN ('system', 'security', 'billing', 'clinical', 'operational', 'integration', 'notification', 'reporting')),
    CONSTRAINT chk_admin_config_status CHECK (status IN ('active', 'inactive', 'deprecated'))
);

-- Unique constraint for config keys per tenant
CREATE UNIQUE INDEX idx_admin_config_key_unique ON admin_configurations(tenant_id, config_key) WHERE deleted_at IS NULL;

-- Indexes for queries
CREATE INDEX idx_admin_config_tenant ON admin_configurations(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_admin_config_category ON admin_configurations(config_category) WHERE deleted_at IS NULL;
CREATE INDEX idx_admin_config_type ON admin_configurations(config_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_admin_config_system ON admin_configurations(is_system_config) WHERE deleted_at IS NULL AND is_system_config = true;
CREATE INDEX idx_admin_config_updated ON admin_configurations(updated_at DESC) WHERE deleted_at IS NULL;

-- GIN indexes for array columns (RBAC queries)
CREATE INDEX idx_admin_config_editable_roles ON admin_configurations USING GIN(editable_by_roles) WHERE deleted_at IS NULL;
CREATE INDEX idx_admin_config_visible_roles ON admin_configurations USING GIN(visible_to_roles) WHERE deleted_at IS NULL;

-- JSONB index for validation rules
CREATE INDEX idx_admin_config_validation ON admin_configurations USING GIN(validation_rules) WHERE validation_rules IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE admin_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Tenant Isolation
CREATE POLICY tenant_isolation_admin_configurations 
ON admin_configurations
FOR ALL 
USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Comments for documentation
COMMENT ON TABLE admin_configurations IS 'System-wide configuration storage with role-based access control';
COMMENT ON COLUMN admin_configurations.config_key IS 'Unique configuration key within tenant';
COMMENT ON COLUMN admin_configurations.config_type IS 'Data type of configuration value for validation';
COMMENT ON COLUMN admin_configurations.editable_by_roles IS 'RBAC: Roles that can edit this configuration';
COMMENT ON COLUMN admin_configurations.visible_to_roles IS 'RBAC: Roles that can view this configuration';
COMMENT ON COLUMN admin_configurations.is_system_config IS 'System configurations cannot be deleted';
COMMENT ON COLUMN admin_configurations.validation_rules IS 'JSON schema for configuration value validation';
COMMENT ON COLUMN admin_configurations.requires_restart IS 'Whether changing this config requires application restart';

-- Create function to get configuration value
CREATE OR REPLACE FUNCTION get_config_value(
    p_tenant_id UUID,
    p_config_key VARCHAR,
    p_default_value TEXT DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
    v_config_value TEXT;
BEGIN
    SELECT config_value INTO v_config_value
    FROM admin_configurations
    WHERE tenant_id = p_tenant_id
        AND config_key = p_config_key
        AND status = 'active'
        AND deleted_at IS NULL;
    
    RETURN COALESCE(v_config_value, p_default_value);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_config_value IS 'Helper function to retrieve configuration value with fallback to default';

-- Create function to update configuration with history
CREATE OR REPLACE FUNCTION update_config_value(
    p_tenant_id UUID,
    p_config_key VARCHAR,
    p_new_value TEXT,
    p_updated_by UUID,
    p_change_reason TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_old_value TEXT;
    v_rows_updated INTEGER;
BEGIN
    -- Get old value
    SELECT config_value INTO v_old_value
    FROM admin_configurations
    WHERE tenant_id = p_tenant_id
        AND config_key = p_config_key
        AND deleted_at IS NULL;
    
    -- Update configuration
    UPDATE admin_configurations
    SET config_value = p_new_value,
        previous_value = v_old_value,
        updated_at = CURRENT_TIMESTAMP,
        updated_by_user_id = p_updated_by,
        change_reason = p_change_reason
    WHERE tenant_id = p_tenant_id
        AND config_key = p_config_key
        AND deleted_at IS NULL;
    
    GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
    
    RETURN v_rows_updated > 0;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_config_value IS 'Helper function to update configuration with change tracking';

-- Seed common system configurations
INSERT INTO admin_configurations (tenant_id, config_key, config_value, config_type, config_category, description, is_system_config, editable_by_roles, created_at) VALUES
-- System Settings
('00000000-0000-0000-0000-000000000000', 'system.timezone', 'UTC', 'string', 'system', 'Default system timezone', true, ARRAY['SYSTEM ADMINISTRATOR'], NOW()),
('00000000-0000-0000-0000-000000000000', 'system.date_format', 'YYYY-MM-DD', 'string', 'system', 'Default date format', true, ARRAY['SYSTEM ADMINISTRATOR'], NOW()),
('00000000-0000-0000-0000-000000000000', 'system.session_timeout_minutes', '30', 'number', 'security', 'User session timeout in minutes', true, ARRAY['SYSTEM ADMINISTRATOR'], NOW()),

-- Security Settings
('00000000-0000-0000-0000-000000000000', 'security.password_min_length', '8', 'number', 'security', 'Minimum password length', true, ARRAY['SYSTEM ADMINISTRATOR'], NOW()),
('00000000-0000-0000-0000-000000000000', 'security.password_require_uppercase', 'true', 'boolean', 'security', 'Require uppercase in passwords', true, ARRAY['SYSTEM ADMINISTRATOR'], NOW()),
('00000000-0000-0000-0000-000000000000', 'security.password_require_lowercase', 'true', 'boolean', 'security', 'Require lowercase in passwords', true, ARRAY['SYSTEM ADMINISTRATOR'], NOW()),
('00000000-0000-0000-0000-000000000000', 'security.password_require_digit', 'true', 'boolean', 'security', 'Require digit in passwords', true, ARRAY['SYSTEM ADMINISTRATOR'], NOW()),
('00000000-0000-0000-0000-000000000000', 'security.password_require_special_char', 'true', 'boolean', 'security', 'Require special character in passwords', true, ARRAY['SYSTEM ADMINISTRATOR'], NOW()),
('00000000-0000-0000-0000-000000000000', 'security.max_login_attempts', '5', 'number', 'security', 'Maximum failed login attempts before lockout', true, ARRAY['SYSTEM ADMINISTRATOR'], NOW()),
('00000000-0000-0000-0000-000000000000', 'security.lockout_duration_minutes', '15', 'number', 'security', 'Account lockout duration in minutes', true, ARRAY['SYSTEM ADMINISTRATOR'], NOW()),

-- Clinical Settings
('00000000-0000-0000-0000-000000000000', 'clinical.appointment_slot_duration', '15', 'number', 'clinical', 'Default appointment slot duration in minutes', false, ARRAY['SYSTEM ADMINISTRATOR', 'HOSPITAL ADMINISTRATOR'], NOW()),
('00000000-0000-0000-0000-000000000000', 'clinical.max_appointments_per_day', '50', 'number', 'clinical', 'Maximum appointments per day per doctor', false, ARRAY['SYSTEM ADMINISTRATOR', 'HOSPITAL ADMINISTRATOR'], NOW()),

-- Billing Settings
('00000000-0000-0000-0000-000000000000', 'billing.currency', 'USD', 'string', 'billing', 'Default currency code', false, ARRAY['SYSTEM ADMINISTRATOR', 'HOSPITAL ADMINISTRATOR'], NOW()),
('00000000-0000-0000-0000-000000000000', 'billing.tax_rate', '0.00', 'number', 'billing', 'Default tax rate percentage', false, ARRAY['SYSTEM ADMINISTRATOR', 'HOSPITAL ADMINISTRATOR'], NOW()),

-- Notification Settings
('00000000-0000-0000-0000-000000000000', 'notification.email_enabled', 'true', 'boolean', 'notification', 'Enable email notifications', false, ARRAY['SYSTEM ADMINISTRATOR'], NOW()),
('00000000-0000-0000-0000-000000000000', 'notification.sms_enabled', 'false', 'boolean', 'notification', 'Enable SMS notifications', false, ARRAY['SYSTEM ADMINISTRATOR'], NOW())
ON CONFLICT (tenant_id, config_key) WHERE deleted_at IS NULL DO NOTHING;

-- Verification
SELECT 
    'admin_configurations' as table_name,
    COUNT(*) as row_count,
    pg_size_pretty(pg_total_relation_size('admin_configurations')) as table_size
FROM admin_configurations;

-- Show sample configurations
SELECT 
    config_category,
    config_key,
    config_value,
    config_type,
    is_system_config
FROM admin_configurations
WHERE deleted_at IS NULL
ORDER BY config_category, config_key
LIMIT 20;

-- Show indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'admin_configurations'
ORDER BY indexname;

-- Show RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'admin_configurations';
