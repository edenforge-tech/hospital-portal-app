-- Migration: Create system_settings table
-- Date: December 12, 2025
-- Purpose: Store configurable system settings per tenant with categories

CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    category VARCHAR(50) NOT NULL, -- 'general', 'email', 'security', 'hipaa', 'backup', 'integrations'
    key VARCHAR(100) NOT NULL,
    value TEXT,
    data_type VARCHAR(20) NOT NULL DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID,
    updated_by_user_id UUID,
    
    CONSTRAINT uq_system_settings_tenant_category_key UNIQUE (tenant_id, category, key)
);

-- Create index for faster lookups
CREATE INDEX idx_system_settings_tenant_category ON system_settings(tenant_id, category);

-- Add comments for documentation
COMMENT ON TABLE system_settings IS 'System configuration settings organized by category for each tenant';
COMMENT ON COLUMN system_settings.category IS 'Setting category: general, email, security, hipaa, backup, integrations';
COMMENT ON COLUMN system_settings.key IS 'Setting key within the category';
COMMENT ON COLUMN system_settings.value IS 'Setting value stored as text (parsed based on data_type)';
COMMENT ON COLUMN system_settings.data_type IS 'Data type for parsing: string, number, boolean, json';

-- Insert default settings for existing tenant (if any)
DO $$
DECLARE
    existing_tenant_id UUID;
    admin_user_id UUID;
BEGIN
    -- Get first tenant (if exists)
    SELECT id INTO existing_tenant_id FROM tenant LIMIT 1;
    
    -- Get first admin user (if exists)
    SELECT id INTO admin_user_id FROM "AspNetUsers" WHERE user_type = 'Admin' LIMIT 1;
    
    IF existing_tenant_id IS NOT NULL THEN
        -- Insert default general settings
        INSERT INTO system_settings (tenant_id, category, key, value, data_type, created_by_user_id, updated_by_user_id)
        VALUES 
            (existing_tenant_id, 'general', 'systemName', 'Hospital Portal', 'string', admin_user_id, admin_user_id),
            (existing_tenant_id, 'general', 'timezone', 'UTC', 'string', admin_user_id, admin_user_id),
            (existing_tenant_id, 'general', 'language', 'en', 'string', admin_user_id, admin_user_id),
            (existing_tenant_id, 'general', 'maintenanceMode', 'false', 'boolean', admin_user_id, admin_user_id)
        ON CONFLICT (tenant_id, category, key) DO NOTHING;
        
        -- Insert default security settings
        INSERT INTO system_settings (tenant_id, category, key, value, data_type, created_by_user_id, updated_by_user_id)
        VALUES 
            (existing_tenant_id, 'security', 'sessionTimeout', '30', 'number', admin_user_id, admin_user_id),
            (existing_tenant_id, 'security', 'passwordMinLength', '12', 'number', admin_user_id, admin_user_id),
            (existing_tenant_id, 'security', 'passwordRequireUppercase', 'true', 'boolean', admin_user_id, admin_user_id),
            (existing_tenant_id, 'security', 'passwordRequireLowercase', 'true', 'boolean', admin_user_id, admin_user_id),
            (existing_tenant_id, 'security', 'passwordRequireNumbers', 'true', 'boolean', admin_user_id, admin_user_id),
            (existing_tenant_id, 'security', 'passwordRequireSymbols', 'true', 'boolean', admin_user_id, admin_user_id),
            (existing_tenant_id, 'security', 'maxLoginAttempts', '5', 'number', admin_user_id, admin_user_id),
            (existing_tenant_id, 'security', 'lockoutDuration', '15', 'number', admin_user_id, admin_user_id)
        ON CONFLICT (tenant_id, category, key) DO NOTHING;
        
        -- Insert default HIPAA settings
        INSERT INTO system_settings (tenant_id, category, key, value, data_type, created_by_user_id, updated_by_user_id)
        VALUES 
            (existing_tenant_id, 'hipaa', 'auditLogRetention', '7', 'number', admin_user_id, admin_user_id),
            (existing_tenant_id, 'hipaa', 'dataEncryption', 'true', 'boolean', admin_user_id, admin_user_id),
            (existing_tenant_id, 'hipaa', 'accessLogging', 'true', 'boolean', admin_user_id, admin_user_id),
            (existing_tenant_id, 'hipaa', 'breachNotification', 'true', 'boolean', admin_user_id, admin_user_id),
            (existing_tenant_id, 'hipaa', 'complianceOfficer', '', 'string', admin_user_id, admin_user_id)
        ON CONFLICT (tenant_id, category, key) DO NOTHING;
        
        -- Insert default backup settings
        INSERT INTO system_settings (tenant_id, category, key, value, data_type, created_by_user_id, updated_by_user_id)
        VALUES 
            (existing_tenant_id, 'backup', 'autoBackup', 'true', 'boolean', admin_user_id, admin_user_id),
            (existing_tenant_id, 'backup', 'backupFrequency', 'daily', 'string', admin_user_id, admin_user_id),
            (existing_tenant_id, 'backup', 'backupRetention', '30', 'number', admin_user_id, admin_user_id),
            (existing_tenant_id, 'backup', 'backupLocation', '', 'string', admin_user_id, admin_user_id),
            (existing_tenant_id, 'backup', 'encryptionEnabled', 'true', 'boolean', admin_user_id, admin_user_id)
        ON CONFLICT (tenant_id, category, key) DO NOTHING;
        
        -- Insert default integration settings
        INSERT INTO system_settings (tenant_id, category, key, value, data_type, created_by_user_id, updated_by_user_id)
        VALUES 
            (existing_tenant_id, 'integrations', 'apiEnabled', 'true', 'boolean', admin_user_id, admin_user_id),
            (existing_tenant_id, 'integrations', 'webhookUrl', '', 'string', admin_user_id, admin_user_id),
            (existing_tenant_id, 'integrations', 'apiRateLimit', '1000', 'number', admin_user_id, admin_user_id),
            (existing_tenant_id, 'integrations', 'externalAuth', 'false', 'boolean', admin_user_id, admin_user_id),
            (existing_tenant_id, 'integrations', 'ssoEnabled', 'false', 'boolean', admin_user_id, admin_user_id)
        ON CONFLICT (tenant_id, category, key) DO NOTHING;
        
        -- Insert default email settings
        INSERT INTO system_settings (tenant_id, category, key, value, data_type, created_by_user_id, updated_by_user_id)
        VALUES 
            (existing_tenant_id, 'email', 'smtpHost', '', 'string', admin_user_id, admin_user_id),
            (existing_tenant_id, 'email', 'smtpPort', '587', 'number', admin_user_id, admin_user_id),
            (existing_tenant_id, 'email', 'smtpUsername', '', 'string', admin_user_id, admin_user_id),
            (existing_tenant_id, 'email', 'smtpPassword', '', 'string', admin_user_id, admin_user_id),
            (existing_tenant_id, 'email', 'fromEmail', '', 'string', admin_user_id, admin_user_id),
            (existing_tenant_id, 'email', 'fromName', 'Hospital Portal', 'string', admin_user_id, admin_user_id),
            (existing_tenant_id, 'email', 'enableTLS', 'true', 'boolean', admin_user_id, admin_user_id)
        ON CONFLICT (tenant_id, category, key) DO NOTHING;
    END IF;
END $$;

-- Grant permissions (adjust as needed)
GRANT SELECT, INSERT, UPDATE, DELETE ON system_settings TO rls_admin;

PRINT 'system_settings table created successfully';
