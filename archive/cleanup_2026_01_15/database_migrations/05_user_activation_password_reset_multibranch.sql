-- ============================================================================
-- Migration: User Activation, Password Reset & Multi-Branch Assignment
-- Date: December 26, 2025
-- Description: Adds user activation workflow, password reset tokens, and
--              multi-branch assignment capabilities
-- ============================================================================

-- ============================================================================
-- PART 1: USER ACTIVATION & PASSWORD RESET COLUMNS
-- ============================================================================

-- Add activation status (Pending, Active, Suspended, Locked)
ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS activation_status VARCHAR(20) DEFAULT 'Active' 
        CHECK (activation_status IN ('Pending', 'Active', 'Suspended', 'Locked'));

-- Add one-time password support for initial user activation
ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS one_time_password_hash VARCHAR(500),
    ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS must_reset_password BOOLEAN DEFAULT false;

-- Add password reset token support
ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(500),
    ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMP;

-- Add password change tracking
ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP;

-- Add email verification support
ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(500),
    ADD COLUMN IF NOT EXISTS email_verification_sent_at TIMESTAMP;

-- Add account lockout tracking
ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS failed_login_attempts INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP,
    ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS last_login_ip INET;

-- Update existing users to have 'Active' status if they have passwords
UPDATE users 
SET activation_status = 'Active', 
    email_verified = true,
    last_password_change = NOW()
WHERE "PasswordHash" IS NOT NULL 
  AND activation_status IS NULL;

-- ============================================================================
-- PART 2: MULTI-BRANCH ASSIGNMENT TABLE
-- ============================================================================

-- Create user_branches junction table for multi-branch support
CREATE TABLE IF NOT EXISTS user_branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    is_default BOOLEAN DEFAULT false,
    assigned_at TIMESTAMP DEFAULT NOW(),
    assigned_by_user_id UUID,
    effective_from TIMESTAMP DEFAULT NOW(),
    effective_until TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by_user_id UUID,
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by_user_id UUID,
    
    -- Foreign keys
    CONSTRAINT fk_user_branches_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_branches_user FOREIGN KEY (user_id) REFERENCES users("Id") ON DELETE CASCADE,
    CONSTRAINT fk_user_branches_branch FOREIGN KEY (branch_id) REFERENCES branch(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_branches_assigned_by FOREIGN KEY (assigned_by_user_id) REFERENCES users("Id") ON DELETE SET NULL,
    CONSTRAINT fk_user_branches_created_by FOREIGN KEY (created_by_user_id) REFERENCES users("Id") ON DELETE SET NULL,
    CONSTRAINT fk_user_branches_updated_by FOREIGN KEY (updated_by_user_id) REFERENCES users("Id") ON DELETE SET NULL,
    
    -- Unique constraint: user can't be assigned to same branch twice
    CONSTRAINT uk_user_branch UNIQUE (user_id, branch_id, tenant_id)
);

-- Only one default branch per user
CREATE UNIQUE INDEX idx_user_branches_default 
    ON user_branches (user_id, tenant_id) 
    WHERE is_default = true;

-- Create indexes for performance
CREATE INDEX idx_user_branches_user ON user_branches (user_id);
CREATE INDEX idx_user_branches_branch ON user_branches (branch_id);
CREATE INDEX idx_user_branches_tenant ON user_branches (tenant_id);
CREATE INDEX idx_user_branches_status ON user_branches (status);

-- ============================================================================
-- PART 3: ROW-LEVEL SECURITY (RLS) FOR user_branches
-- ============================================================================

-- Enable RLS
ALTER TABLE user_branches ENABLE ROW LEVEL SECURITY;

-- Policy: Users see only their tenant's data
CREATE POLICY tenant_isolation ON user_branches
    FOR ALL 
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Policy: System admin can bypass (rls_admin role)
CREATE POLICY admin_bypass ON user_branches
    FOR ALL 
    TO rls_admin
    USING (true);

-- ============================================================================
-- PART 4: AUDIT TRIGGER FOR user_branches
-- ============================================================================

CREATE OR REPLACE FUNCTION audit_user_branches_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_log (
            tenant_id, table_name, record_id, action, 
            changed_by_user_id, changed_at, new_values
        ) VALUES (
            NEW.tenant_id, 'user_branches', NEW.id, 'INSERT',
            NEW.assigned_by_user_id, NOW(), to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_log (
            tenant_id, table_name, record_id, action,
            changed_by_user_id, changed_at, old_values, new_values
        ) VALUES (
            NEW.tenant_id, 'user_branches', NEW.id, 'UPDATE',
            NEW.updated_by_user_id, NOW(), to_jsonb(OLD), to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_log (
            tenant_id, table_name, record_id, action,
            changed_by_user_id, changed_at, old_values
        ) VALUES (
            OLD.tenant_id, 'user_branches', OLD.id, 'DELETE',
            NULL, NOW(), to_jsonb(OLD)
        );
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_audit_user_branches ON user_branches;
CREATE TRIGGER trigger_audit_user_branches
    AFTER INSERT OR UPDATE OR DELETE ON user_branches
    FOR EACH ROW EXECUTE FUNCTION audit_user_branches_changes();

-- ============================================================================
-- PART 5: MIGRATE EXISTING SINGLE-BRANCH DATA TO MULTI-BRANCH
-- ============================================================================

-- Insert existing branch assignments into user_branches (if users have BranchId)
INSERT INTO user_branches (
    tenant_id, user_id, branch_id, is_default, 
    assigned_at, status, created_at
)
SELECT 
    u."TenantId", 
    u."Id", 
    u."BranchId",
    true, -- Set as default branch
    NOW(),
    'active',
    NOW()
FROM users u
WHERE u."BranchId" IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM user_branches ub 
      WHERE ub.user_id = u."Id" AND ub.branch_id = u."BranchId"
  );

-- ============================================================================
-- PART 6: PASSWORD RESET REQUEST LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS password_reset_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    reset_token_hash VARCHAR(500) NOT NULL,
    requested_at TIMESTAMP DEFAULT NOW(),
    requested_by_user_id UUID, -- Admin who initiated reset (if admin-triggered)
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    status VARCHAR(20) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'used', 'expired', 'revoked')),
    
    CONSTRAINT fk_password_reset_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES users("Id") ON DELETE CASCADE,
    CONSTRAINT fk_password_reset_requested_by FOREIGN KEY (requested_by_user_id) REFERENCES users("Id") ON DELETE SET NULL
);

CREATE INDEX idx_password_reset_user ON password_reset_requests (user_id);
CREATE INDEX idx_password_reset_token ON password_reset_requests (reset_token_hash);
CREATE INDEX idx_password_reset_status ON password_reset_requests (status);
CREATE INDEX idx_password_reset_expires ON password_reset_requests (expires_at);

-- Enable RLS
ALTER TABLE password_reset_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON password_reset_requests
    FOR ALL 
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- ============================================================================
-- PART 7: USER ACTIVATION LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_activation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    activation_type VARCHAR(50) NOT NULL 
        CHECK (activation_type IN ('initial_otp', 'manual_activation', 'auto_activation', 'reactivation')),
    activated_at TIMESTAMP DEFAULT NOW(),
    activated_by_user_id UUID, -- Admin who activated
    otp_sent_at TIMESTAMP,
    otp_used_at TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    notes TEXT,
    
    CONSTRAINT fk_activation_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_activation_user FOREIGN KEY (user_id) REFERENCES users("Id") ON DELETE CASCADE,
    CONSTRAINT fk_activation_activated_by FOREIGN KEY (activated_by_user_id) REFERENCES users("Id") ON DELETE SET NULL
);

CREATE INDEX idx_activation_user ON user_activation_log (user_id);
CREATE INDEX idx_activation_type ON user_activation_log (activation_type);
CREATE INDEX idx_activation_date ON user_activation_log (activated_at);

-- Enable RLS
ALTER TABLE user_activation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON user_activation_log
    FOR ALL 
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- ============================================================================
-- PART 8: ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN users.activation_status IS 'User activation status: Pending (awaiting OTP), Active (normal), Suspended (temporary block), Locked (security lock)';
COMMENT ON COLUMN users.one_time_password_hash IS 'Hashed one-time password for initial activation (expires after first login)';
COMMENT ON COLUMN users.otp_expires_at IS 'Expiration timestamp for one-time password (typically 24-48 hours)';
COMMENT ON COLUMN users.must_reset_password IS 'Force user to reset password on next login (set after OTP login or admin reset)';
COMMENT ON COLUMN users.password_reset_token IS 'Hashed password reset token (expires after 1-2 hours)';
COMMENT ON COLUMN users.reset_token_expires_at IS 'Expiration timestamp for password reset token';
COMMENT ON COLUMN users.last_password_change IS 'Timestamp of last password change (for security compliance)';
COMMENT ON COLUMN users.email_verified IS 'Whether user has verified their email address';
COMMENT ON COLUMN users.failed_login_attempts IS 'Count of consecutive failed login attempts (resets on success)';
COMMENT ON COLUMN users.locked_until IS 'Account locked until this timestamp (after multiple failed attempts)';
COMMENT ON COLUMN users.last_login_at IS 'Timestamp of last successful login';
COMMENT ON COLUMN users.last_login_ip IS 'IP address of last successful login';

COMMENT ON TABLE user_branches IS 'Junction table for multi-branch user assignments - allows users to work across multiple branches';
COMMENT ON COLUMN user_branches.is_default IS 'Default branch for user (only one per user, enforced by unique index)';
COMMENT ON COLUMN user_branches.effective_from IS 'Assignment effective start date (for scheduled assignments)';
COMMENT ON COLUMN user_branches.effective_until IS 'Assignment expiration date (NULL = no expiration)';

COMMENT ON TABLE password_reset_requests IS 'Audit log for all password reset requests (admin-triggered or user self-service)';
COMMENT ON TABLE user_activation_log IS 'Audit log for user activation events (OTP generation, manual activation, etc.)';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify new columns exist
DO $$
BEGIN
    RAISE NOTICE 'Verifying migration...';
    
    -- Check users table columns
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'activation_status') THEN
        RAISE NOTICE '✓ users.activation_status created';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'password_reset_token') THEN
        RAISE NOTICE '✓ users.password_reset_token created';
    END IF;
    
    -- Check user_branches table
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_name = 'user_branches') THEN
        RAISE NOTICE '✓ user_branches table created';
        RAISE NOTICE 'User branches migrated: %', (SELECT COUNT(*) FROM user_branches);
    END IF;
    
    -- Check password_reset_requests table
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_name = 'password_reset_requests') THEN
        RAISE NOTICE '✓ password_reset_requests table created';
    END IF;
    
    -- Check user_activation_log table
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_name = 'user_activation_log') THEN
        RAISE NOTICE '✓ user_activation_log table created';
    END IF;
    
    RAISE NOTICE 'Migration completed successfully!';
END $$;
