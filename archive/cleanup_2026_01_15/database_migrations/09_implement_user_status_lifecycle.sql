-- Implement comprehensive user status lifecycle
-- activation_status: Detailed tracking for audit/workflow
-- UserStatus: Simplified display for UI

-- 1. Update all current users to proper initial status
UPDATE users
SET 
    activation_status = 'created',
    "UserStatus" = 'pending_invitation',
    updated_at = NOW()
WHERE activation_status IS NULL OR activation_status = '';

-- 2. Add check constraints for valid status values
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_activation_status;
ALTER TABLE users ADD CONSTRAINT chk_activation_status 
CHECK (activation_status IN (
    'created',
    'invitation_sent', 
    'email_verified',
    'password_set',
    'terms_accepted',
    'mfa_enrolled',
    'active',
    'locked',
    'inactive',
    'deleted'
));

ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_user_status;
ALTER TABLE users ADD CONSTRAINT chk_user_status 
CHECK ("UserStatus" IN (
    'pending_invitation',
    'pending_activation',
    'active',
    'locked',
    'inactive',
    'deleted'
));

-- 3. Add index for status queries
CREATE INDEX IF NOT EXISTS idx_users_activation_status ON users(activation_status);
CREATE INDEX IF NOT EXISTS idx_users_user_status ON users("UserStatus");

-- 4. Create status transition log table for audit trail
CREATE TABLE IF NOT EXISTS user_status_transitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,
    transition_type VARCHAR(50) NOT NULL, -- 'activation_status' or 'user_status'
    changed_by_user_id UUID REFERENCES users(id),
    reason TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_status_transitions_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_status_transitions_user_id ON user_status_transitions(user_id);
CREATE INDEX IF NOT EXISTS idx_status_transitions_created_at ON user_status_transitions(created_at DESC);

-- Enable RLS
ALTER TABLE user_status_transitions ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY tenant_isolation_status_transitions ON user_status_transitions
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY admin_all_status_transitions ON user_status_transitions
    FOR ALL
    TO rls_admin
    USING (true);

-- 5. Create function to log status transitions automatically
CREATE OR REPLACE FUNCTION log_user_status_transition()
RETURNS TRIGGER AS $$
BEGIN
    -- Log activation_status changes
    IF OLD.activation_status IS DISTINCT FROM NEW.activation_status THEN
        INSERT INTO user_status_transitions (
            user_id,
            tenant_id,
            from_status,
            to_status,
            transition_type,
            changed_by_user_id,
            reason
        ) VALUES (
            NEW.id,
            NEW.tenant_id,
            OLD.activation_status,
            NEW.activation_status,
            'activation_status',
            NEW.updated_by_user_id,
            'Status changed from ' || COALESCE(OLD.activation_status, 'null') || ' to ' || NEW.activation_status
        );
    END IF;
    
    -- Log UserStatus changes
    IF OLD."UserStatus" IS DISTINCT FROM NEW."UserStatus" THEN
        INSERT INTO user_status_transitions (
            user_id,
            tenant_id,
            from_status,
            to_status,
            transition_type,
            changed_by_user_id,
            reason
        ) VALUES (
            NEW.id,
            NEW.tenant_id,
            OLD."UserStatus",
            NEW."UserStatus",
            'user_status',
            NEW.updated_by_user_id,
            'Display status changed from ' || COALESCE(OLD."UserStatus", 'null') || ' to ' || NEW."UserStatus"
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger for automatic logging
DROP TRIGGER IF EXISTS trg_log_user_status_transition ON users;
CREATE TRIGGER trg_log_user_status_transition
    AFTER UPDATE ON users
    FOR EACH ROW
    WHEN (OLD.activation_status IS DISTINCT FROM NEW.activation_status 
          OR OLD."UserStatus" IS DISTINCT FROM NEW."UserStatus")
    EXECUTE FUNCTION log_user_status_transition();

-- 7. Add comments for documentation
COMMENT ON COLUMN users.activation_status IS 'Detailed activation workflow status: created, invitation_sent, email_verified, password_set, terms_accepted, mfa_enrolled, active, locked, inactive, deleted';
COMMENT ON COLUMN users."UserStatus" IS 'Simplified UI display status: pending_invitation, pending_activation, active, locked, inactive, deleted';
COMMENT ON TABLE user_status_transitions IS 'Audit log of all user status changes for HIPAA compliance';

-- 8. Show current status distribution
SELECT 
    activation_status,
    "UserStatus",
    COUNT(*) as user_count
FROM users
GROUP BY activation_status, "UserStatus"
ORDER BY user_count DESC;

COMMENT ON CONSTRAINT chk_activation_status ON users IS 'Enforces valid activation_status workflow values';
COMMENT ON CONSTRAINT chk_user_status ON users IS 'Enforces valid UserStatus UI display values';
