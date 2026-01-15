-- Create user_mfa_settings table for MFA enrollment
-- This table stores TOTP secrets, backup codes, and MFA configuration per user

CREATE TABLE IF NOT EXISTS user_mfa_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    is_mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    primary_method VARCHAR(20), -- 'totp', 'sms', 'email'
    totp_secret_encrypted TEXT,
    totp_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    sms_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    email_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    backup_codes JSONB, -- JSON array of {hash, used, used_at}
    backup_codes_generated_at TIMESTAMP WITH TIME ZONE,
    enrolled_at TIMESTAMP WITH TIME ZONE,
    last_verified_at TIMESTAMP WITH TIME ZONE,
    grace_period_ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Foreign keys
    CONSTRAINT fk_user_mfa_settings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_mfa_settings_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    
    -- Unique constraint - one MFA setting per user
    CONSTRAINT uq_user_mfa_settings_user_id UNIQUE (user_id)
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_user_mfa_settings_user_id ON user_mfa_settings(user_id);

-- Index for tenant isolation (RLS)
CREATE INDEX IF NOT EXISTS idx_user_mfa_settings_tenant_id ON user_mfa_settings(tenant_id);

-- Enable RLS
ALTER TABLE user_mfa_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policy for tenant isolation
CREATE POLICY tenant_isolation_user_mfa_settings ON user_mfa_settings
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Admin bypass policy
CREATE POLICY admin_all_user_mfa_settings ON user_mfa_settings
    FOR ALL
    TO rls_admin
    USING (true);

COMMENT ON TABLE user_mfa_settings IS 'Stores MFA configuration and secrets for user accounts (HIPAA compliant)';
COMMENT ON COLUMN user_mfa_settings.totp_secret_encrypted IS 'Base32-encoded TOTP secret (should be encrypted in production)';
COMMENT ON COLUMN user_mfa_settings.backup_codes IS 'JSONB array of hashed backup codes with usage tracking';
