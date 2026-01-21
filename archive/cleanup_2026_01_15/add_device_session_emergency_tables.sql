-- Migration: Add Device, User Session, and Emergency Access tables
-- Purpose: Create tables needed for device management, session management, and emergency access features
-- Date: 2026-01-15

BEGIN;

-- ============================================================================
-- 1. DEVICE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS device (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid NOT NULL,
    device_id character varying(255) NOT NULL,
    device_name character varying(200),
    device_type character varying(50),
    operating_system character varying(100),
    os_version character varying(50),
    browser character varying(100),
    browser_version character varying(50),
    ip_address character varying(45),
    location character varying(200),
    user_agent text,
    trust_level character varying(20) NOT NULL DEFAULT 'Untrusted',
    is_blocked boolean NOT NULL DEFAULT FALSE,
    block_reason character varying(500),
    is_primary_device boolean NOT NULL DEFAULT FALSE,
    registered_at timestamp with time zone NOT NULL,
    last_seen_at timestamp with time zone,
    last_login_at timestamp with time zone,
    total_logins integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone,
    status character varying(20) NOT NULL DEFAULT 'active',
    created_by_user_id uuid,
    updated_by_user_id uuid,
    CONSTRAINT "PK_device" PRIMARY KEY (id),
    CONSTRAINT "FK_device_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE,
    CONSTRAINT "FK_device_users_user_id" FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create indexes for device table
CREATE INDEX IF NOT EXISTS "IX_device_tenant_id" ON device (tenant_id);
CREATE INDEX IF NOT EXISTS "IX_device_user_id" ON device (user_id);
CREATE INDEX IF NOT EXISTS "IX_device_device_id" ON device (device_id);
CREATE UNIQUE INDEX IF NOT EXISTS "IX_device_device_id_user_id" ON device (device_id, user_id) WHERE deleted_at IS NULL;

-- RLS policies for device
ALTER TABLE device ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON device
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- ============================================================================
-- 2. USER SESSION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_session (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid NOT NULL,
    device_id uuid,
    session_id character varying(255) NOT NULL,
    token_id character varying(255),
    refresh_token character varying(500),
    login_time timestamp with time zone NOT NULL,
    last_activity_time timestamp with time zone NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    logout_time timestamp with time zone,
    is_active boolean NOT NULL DEFAULT TRUE,
    ip_address character varying(45),
    user_agent character varying(500),
    location character varying(200),
    session_type character varying(20) NOT NULL DEFAULT 'Web',
    login_method character varying(50),
    suspicious_activity boolean NOT NULL DEFAULT FALSE,
    termination_reason character varying(200),
    terminated_by uuid,
    created_at timestamp with time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp with time zone,
    status character varying(20) NOT NULL DEFAULT 'active',
    created_by_user_id uuid,
    updated_by_user_id uuid,
    CONSTRAINT "PK_user_session" PRIMARY KEY (id),
    CONSTRAINT "FK_user_session_device_device_id" FOREIGN KEY (device_id) REFERENCES device (id),
    CONSTRAINT "FK_user_session_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE,
    CONSTRAINT "FK_user_session_users_terminated_by" FOREIGN KEY (terminated_by) REFERENCES users (id),
    CONSTRAINT "FK_user_session_users_user_id" FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create indexes for user_session table
CREATE INDEX IF NOT EXISTS "IX_user_session_tenant_id" ON user_session (tenant_id);
CREATE INDEX IF NOT EXISTS "IX_user_session_user_id" ON user_session (user_id);
CREATE INDEX IF NOT EXISTS "IX_user_session_device_id" ON user_session (device_id);
CREATE INDEX IF NOT EXISTS "IX_user_session_session_id" ON user_session (session_id);
CREATE INDEX IF NOT EXISTS "IX_user_session_is_active" ON user_session (is_active);

-- RLS policies for user_session
ALTER TABLE user_session ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON user_session
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- ============================================================================
-- 3. EMERGENCY ACCESS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS emergency_access (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid NOT NULL,
    access_code character varying(50),
    reason character varying(1000) NOT NULL,
    emergency_type character varying(100),
    patient_id uuid,
    granted_permissions jsonb,
    scope character varying(50) NOT NULL DEFAULT 'Limited',
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    duration_minutes integer NOT NULL DEFAULT 60,
    auto_revoke_enabled boolean NOT NULL DEFAULT TRUE,
    requires_approval boolean NOT NULL DEFAULT TRUE,
    approved_by uuid,
    approved_at timestamp with time zone,
    approval_notes character varying(500),
    rejected_by uuid,
    rejected_at timestamp with time zone,
    rejection_reason character varying(500),
    revoked_at timestamp with time zone,
    revoked_by uuid,
    revocation_reason character varying(500),
    status character varying(20) NOT NULL DEFAULT 'pending',
    is_active boolean NOT NULL DEFAULT FALSE,
    audit_trail jsonb,
    actions_performed jsonb,
    notification_sent boolean NOT NULL DEFAULT FALSE,
    notified_users jsonb,
    requires_review boolean NOT NULL DEFAULT TRUE,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    review_notes character varying(500),
    review_status character varying(50),
    risk_level character varying(20) NOT NULL DEFAULT 'High',
    suspicious_activity boolean NOT NULL DEFAULT FALSE,
    created_at timestamp with time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp with time zone,
    created_by_user_id uuid,
    updated_by_user_id uuid,
    CONSTRAINT "PK_emergency_access" PRIMARY KEY (id),
    CONSTRAINT "FK_emergency_access_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE,
    CONSTRAINT "FK_emergency_access_users_approved_by" FOREIGN KEY (approved_by) REFERENCES users (id),
    CONSTRAINT "FK_emergency_access_users_rejected_by" FOREIGN KEY (rejected_by) REFERENCES users (id),
    CONSTRAINT "FK_emergency_access_users_reviewed_by" FOREIGN KEY (reviewed_by) REFERENCES users (id),
    CONSTRAINT "FK_emergency_access_users_revoked_by" FOREIGN KEY (revoked_by) REFERENCES users (id),
    CONSTRAINT "FK_emergency_access_users_user_id" FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create indexes for emergency_access table
CREATE INDEX IF NOT EXISTS "IX_emergency_access_tenant_id" ON emergency_access (tenant_id);
CREATE INDEX IF NOT EXISTS "IX_emergency_access_user_id" ON emergency_access (user_id);
CREATE INDEX IF NOT EXISTS "IX_emergency_access_status" ON emergency_access (status);
CREATE INDEX IF NOT EXISTS "IX_emergency_access_is_active" ON emergency_access (is_active);
CREATE INDEX IF NOT EXISTS "IX_emergency_access_access_code" ON emergency_access (access_code);

-- RLS policies for emergency_access
ALTER TABLE emergency_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON emergency_access
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

COMMIT;

-- Verification queries
SELECT 'device table created' AS status, COUNT(*) AS row_count FROM device;
SELECT 'user_session table created' AS status, COUNT(*) AS row_count FROM user_session;
SELECT 'emergency_access table created' AS status, COUNT(*) AS row_count FROM emergency_access;
