-- =====================================================
-- Advanced Access Management Tables Migration
-- Created: December 9, 2025
-- Purpose: Add department access rules, supervised users, and supervisor assignments
-- =====================================================

-- Set search path
SET search_path TO public;

-- =====================================================
-- 1. Department Access Rules Table
-- =====================================================
CREATE TABLE IF NOT EXISTS department_access_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    branch_id UUID,
    
    -- Department Information
    department_id UUID NOT NULL,
    department_code VARCHAR(50) NOT NULL,
    department_name VARCHAR(200) NOT NULL,
    
    -- Approval Workflow Settings
    requires_approval BOOLEAN NOT NULL DEFAULT false,
    approver_role_ids TEXT, -- Comma-separated GUIDs
    approver_role_names TEXT,
    
    -- Supervision Requirements (NABH Compliance)
    requires_supervisor BOOLEAN NOT NULL DEFAULT false,
    supervisor_role_ids TEXT, -- Comma-separated GUIDs
    supervisor_role_names TEXT,
    
    -- Auto-Expiration Settings
    enable_auto_expiration BOOLEAN NOT NULL DEFAULT false,
    max_access_duration_days INTEGER CHECK (max_access_duration_days BETWEEN 1 AND 90),
    
    -- Permission Restrictions
    restricted_permissions JSONB, -- ["CanDelete", "CanApprove"]
    
    -- Justification Requirements
    requires_justification BOOLEAN NOT NULL DEFAULT false,
    min_justification_length INTEGER,
    
    -- Emergency Access
    allow_emergency_access BOOLEAN NOT NULL DEFAULT false,
    emergency_role_ids TEXT, -- Comma-separated GUIDs
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    
    -- Audit Trail
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_dept_rules_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_dept_rules_branch FOREIGN KEY (branch_id) REFERENCES branch(id) ON DELETE SET NULL,
    CONSTRAINT fk_dept_rules_department FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE CASCADE,
    CONSTRAINT fk_dept_rules_created_by FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_dept_rules_updated_by FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Unique Constraint: One rule per department per tenant
    CONSTRAINT uq_dept_access_rule_per_dept UNIQUE (tenant_id, department_id, deleted_at)
);

-- Indexes for department_access_rules
CREATE INDEX IF NOT EXISTS idx_dept_rules_tenant ON department_access_rules(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_dept_rules_department ON department_access_rules(department_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_dept_rules_active ON department_access_rules(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_dept_rules_requires_approval ON department_access_rules(requires_approval) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_dept_rules_requires_supervisor ON department_access_rules(requires_supervisor) WHERE deleted_at IS NULL;

-- Row-Level Security for department_access_rules
ALTER TABLE department_access_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_dept_rules ON department_access_rules
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Comments for department_access_rules
COMMENT ON TABLE department_access_rules IS 'Configurable validation rules for department access requests (approval, supervision, expiration)';
COMMENT ON COLUMN department_access_rules.requires_approval IS 'Whether access requests require approval';
COMMENT ON COLUMN department_access_rules.requires_supervisor IS 'Whether junior doctors require supervisor assignment (NABH compliance)';
COMMENT ON COLUMN department_access_rules.enable_auto_expiration IS 'Whether access automatically expires after max_access_duration_days';
COMMENT ON COLUMN department_access_rules.max_access_duration_days IS 'Maximum access duration in days (1-90)';
COMMENT ON COLUMN department_access_rules.restricted_permissions IS 'JSON array of permission codes that are restricted for this department';

-- =====================================================
-- 2. Supervised Users Table (NABH Compliance)
-- =====================================================
CREATE TABLE IF NOT EXISTS supervised_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    branch_id UUID,
    
    -- User Information
    user_id UUID NOT NULL,
    user_name VARCHAR(256) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(256) NOT NULL,
    qualification VARCHAR(100), -- "MBBS", "BDS", "Intern"
    years_of_experience INTEGER,
    
    -- Supervision Settings
    assigned_supervisor_id UUID,
    supervisor_name VARCHAR(200),
    oversight_level VARCHAR(50) NOT NULL DEFAULT 'Close', -- Close, Moderate, Light
    requires_co_signature BOOLEAN NOT NULL DEFAULT true,
    supervision_start_date TIMESTAMP,
    supervision_end_date TIMESTAMP,
    
    -- Compliance Tracking
    compliance_score INTEGER NOT NULL DEFAULT 100 CHECK (compliance_score BETWEEN 0 AND 100),
    last_compliance_check TIMESTAMP,
    compliance_notes TEXT,
    
    -- Activity Tracking
    total_activities INTEGER NOT NULL DEFAULT 0,
    supervised_activities INTEGER NOT NULL DEFAULT 0,
    pending_approvals INTEGER NOT NULL DEFAULT 0,
    last_activity_date TIMESTAMP,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'Active', -- Active, On Leave, Graduated, Inactive
    
    -- Audit Trail
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_supervised_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_supervised_users_branch FOREIGN KEY (branch_id) REFERENCES branch(id) ON DELETE SET NULL,
    CONSTRAINT fk_supervised_users_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_supervised_users_supervisor FOREIGN KEY (assigned_supervisor_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_supervised_users_created_by FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_supervised_users_updated_by FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Unique Constraint: One supervision record per user per tenant
    CONSTRAINT uq_supervised_user_per_tenant UNIQUE (tenant_id, user_id, deleted_at)
);

-- Indexes for supervised_users
CREATE INDEX IF NOT EXISTS idx_supervised_users_tenant ON supervised_users(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_supervised_users_user ON supervised_users(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_supervised_users_supervisor ON supervised_users(assigned_supervisor_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_supervised_users_status ON supervised_users(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_supervised_users_oversight_level ON supervised_users(oversight_level) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_supervised_users_compliance_score ON supervised_users(compliance_score) WHERE deleted_at IS NULL;

-- Row-Level Security for supervised_users
ALTER TABLE supervised_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_supervised_users ON supervised_users
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Comments for supervised_users
COMMENT ON TABLE supervised_users IS 'Junior doctors requiring supervision tracking (NABH compliance)';
COMMENT ON COLUMN supervised_users.oversight_level IS 'Supervision intensity: Close (every case), Moderate (selected cases), Light (review only)';
COMMENT ON COLUMN supervised_users.compliance_score IS 'Supervision compliance percentage (0-100%), calculated as supervised_activities/total_activities * 100';
COMMENT ON COLUMN supervised_users.requires_co_signature IS 'Whether supervisor co-signature is required for clinical decisions';

-- =====================================================
-- 3. Supervisor Assignments Table (Capacity Tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS supervisor_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    branch_id UUID,
    
    -- Supervisor Information
    supervisor_user_id UUID NOT NULL,
    supervisor_name VARCHAR(200) NOT NULL,
    specialty VARCHAR(100),
    
    -- Capacity Management
    max_supervisees INTEGER NOT NULL DEFAULT 5 CHECK (max_supervisees <= 10),
    current_supervisees INTEGER NOT NULL DEFAULT 0,
    available_slots INTEGER NOT NULL DEFAULT 5,
    
    -- Supervision Statistics
    total_supervised INTEGER NOT NULL DEFAULT 0,
    active_supervisions INTEGER NOT NULL DEFAULT 0,
    completed_supervisions INTEGER NOT NULL DEFAULT 0,
    average_compliance_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    status VARCHAR(50) NOT NULL DEFAULT 'Active', -- Active, On Leave, Full Capacity, Inactive
    
    -- Audit Trail
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_supervisor_assignments_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_supervisor_assignments_branch FOREIGN KEY (branch_id) REFERENCES branch(id) ON DELETE SET NULL,
    CONSTRAINT fk_supervisor_assignments_supervisor FOREIGN KEY (supervisor_user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Unique Constraint: One assignment record per supervisor per tenant
    CONSTRAINT uq_supervisor_assignment_per_tenant UNIQUE (tenant_id, supervisor_user_id)
);

-- Indexes for supervisor_assignments
CREATE INDEX IF NOT EXISTS idx_supervisor_assignments_tenant ON supervisor_assignments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_supervisor_assignments_supervisor ON supervisor_assignments(supervisor_user_id);
CREATE INDEX IF NOT EXISTS idx_supervisor_assignments_status ON supervisor_assignments(status);
CREATE INDEX IF NOT EXISTS idx_supervisor_assignments_is_active ON supervisor_assignments(is_active);
CREATE INDEX IF NOT EXISTS idx_supervisor_assignments_available_slots ON supervisor_assignments(available_slots);

-- Row-Level Security for supervisor_assignments
ALTER TABLE supervisor_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_supervisor_assignments ON supervisor_assignments
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Comments for supervisor_assignments
COMMENT ON TABLE supervisor_assignments IS 'Supervisor capacity tracking for junior doctor supervision (max 5-10 supervisees per supervisor)';
COMMENT ON COLUMN supervisor_assignments.max_supervisees IS 'Maximum number of junior doctors this supervisor can oversee simultaneously (typically 5, max 10)';
COMMENT ON COLUMN supervisor_assignments.current_supervisees IS 'Current number of active supervised users assigned to this supervisor';
COMMENT ON COLUMN supervisor_assignments.available_slots IS 'Remaining capacity: max_supervisees - current_supervisees';

-- =====================================================
-- 4. Audit Trigger for department_access_rules
-- =====================================================
CREATE OR REPLACE FUNCTION audit_dept_access_rules_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (
            id, tenant_id, entity_type, entity_id, action, 
            actor_user_id, details, timestamp
        ) VALUES (
            gen_random_uuid(),
            NEW.tenant_id,
            'DepartmentAccessRule',
            NEW.id,
            'CREATE',
            NEW.created_by_user_id,
            jsonb_build_object(
                'department_id', NEW.department_id,
                'department_name', NEW.department_name,
                'requires_approval', NEW.requires_approval,
                'requires_supervisor', NEW.requires_supervisor,
                'enable_auto_expiration', NEW.enable_auto_expiration
            ),
            CURRENT_TIMESTAMP
        );
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (
            id, tenant_id, entity_type, entity_id, action, 
            actor_user_id, details, timestamp
        ) VALUES (
            gen_random_uuid(),
            NEW.tenant_id,
            'DepartmentAccessRule',
            NEW.id,
            CASE WHEN NEW.deleted_at IS NOT NULL THEN 'DELETE' ELSE 'UPDATE' END,
            NEW.updated_by_user_id,
            jsonb_build_object(
                'department_id', NEW.department_id,
                'changes', jsonb_build_object(
                    'requires_approval', jsonb_build_object('old', OLD.requires_approval, 'new', NEW.requires_approval),
                    'requires_supervisor', jsonb_build_object('old', OLD.requires_supervisor, 'new', NEW.requires_supervisor),
                    'is_active', jsonb_build_object('old', OLD.is_active, 'new', NEW.is_active)
                )
            ),
            CURRENT_TIMESTAMP
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_audit_dept_access_rules ON department_access_rules;
CREATE TRIGGER trigger_audit_dept_access_rules
    AFTER INSERT OR UPDATE ON department_access_rules
    FOR EACH ROW
    EXECUTE FUNCTION audit_dept_access_rules_changes();

-- =====================================================
-- 5. Audit Trigger for supervised_users
-- =====================================================
CREATE OR REPLACE FUNCTION audit_supervised_users_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (
            id, tenant_id, entity_type, entity_id, action, 
            actor_user_id, details, timestamp
        ) VALUES (
            gen_random_uuid(),
            NEW.tenant_id,
            'SupervisedUser',
            NEW.id,
            'CREATE',
            NEW.created_by_user_id,
            jsonb_build_object(
                'user_id', NEW.user_id,
                'user_name', NEW.user_name,
                'assigned_supervisor_id', NEW.assigned_supervisor_id,
                'oversight_level', NEW.oversight_level,
                'requires_co_signature', NEW.requires_co_signature
            ),
            CURRENT_TIMESTAMP
        );
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (
            id, tenant_id, entity_type, entity_id, action, 
            actor_user_id, details, timestamp
        ) VALUES (
            gen_random_uuid(),
            NEW.tenant_id,
            'SupervisedUser',
            NEW.id,
            CASE WHEN NEW.deleted_at IS NOT NULL THEN 'DELETE' ELSE 'UPDATE' END,
            NEW.updated_by_user_id,
            jsonb_build_object(
                'user_id', NEW.user_id,
                'changes', jsonb_build_object(
                    'assigned_supervisor_id', jsonb_build_object('old', OLD.assigned_supervisor_id, 'new', NEW.assigned_supervisor_id),
                    'oversight_level', jsonb_build_object('old', OLD.oversight_level, 'new', NEW.oversight_level),
                    'compliance_score', jsonb_build_object('old', OLD.compliance_score, 'new', NEW.compliance_score),
                    'status', jsonb_build_object('old', OLD.status, 'new', NEW.status)
                )
            ),
            CURRENT_TIMESTAMP
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_audit_supervised_users ON supervised_users;
CREATE TRIGGER trigger_audit_supervised_users
    AFTER INSERT OR UPDATE ON supervised_users
    FOR EACH ROW
    EXECUTE FUNCTION audit_supervised_users_changes();

-- =====================================================
-- 6. Grant Permissions
-- =====================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON department_access_rules TO PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON supervised_users TO PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON supervisor_assignments TO PUBLIC;

-- =====================================================
-- 7. Verification Queries
-- =====================================================
-- Run these queries to verify the migration:
-- SELECT COUNT(*) FROM department_access_rules;
-- SELECT COUNT(*) FROM supervised_users;
-- SELECT COUNT(*) FROM supervisor_assignments;

COMMENT ON SCHEMA public IS 'Advanced Access Management Tables Migration - Completed';
