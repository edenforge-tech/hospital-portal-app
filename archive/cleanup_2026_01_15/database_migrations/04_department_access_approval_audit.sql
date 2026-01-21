-- =====================================================
-- MIGRATION: DEPARTMENT ACCESS APPROVAL WORKFLOW & AUDIT LOGGING
-- =====================================================
-- Purpose: Add approval workflow and comprehensive audit logging for department access
-- Implements: Phase 1 Critical Features (Approval + Audit)
-- Date: December 9, 2025
-- =====================================================

BEGIN;

-- =====================================================
-- TABLE: DEPARTMENT_ACCESS_REQUEST (Approval Workflow)
-- =====================================================

CREATE TABLE IF NOT EXISTS department_access_request (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number VARCHAR(50) UNIQUE NOT NULL, -- e.g., "DAR-2025-00001"
    user_id UUID NOT NULL,
    department_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    branch_id UUID,
    
    -- Request Details
    request_type VARCHAR(20) NOT NULL, -- 'New', 'Modify', 'Revoke'
    justification TEXT NOT NULL,
    
    -- Requested Permissions
    requested_access_type VARCHAR(20) DEFAULT 'Secondary', -- 'Primary' or 'Secondary'
    requested_can_view BOOLEAN DEFAULT true,
    requested_can_create BOOLEAN DEFAULT false,
    requested_can_edit BOOLEAN DEFAULT false,
    requested_can_delete BOOLEAN DEFAULT false,
    requested_can_approve BOOLEAN DEFAULT false,
    requested_can_export BOOLEAN DEFAULT false,
    requested_access_start_date TIMESTAMP,
    requested_access_end_date TIMESTAMP,
    
    -- Workflow Status
    status VARCHAR(20) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected', 'Cancelled'
    priority VARCHAR(20) DEFAULT 'Normal', -- 'Low', 'Normal', 'High', 'Urgent'
    
    -- Approval Details
    reviewed_by UUID,
    reviewed_at TIMESTAMP,
    reviewer_role VARCHAR(100),
    review_notes TEXT,
    rejection_reason TEXT,
    
    -- Auto-approval tracking
    auto_approved BOOLEAN DEFAULT false,
    auto_approval_reason TEXT,
    
    -- Audit Trail
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL,
    updated_at TIMESTAMP,
    updated_by UUID,
    deleted_at TIMESTAMP,
    deleted_by UUID,
    
    -- Foreign Keys
    CONSTRAINT fk_dar_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_dar_department FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE CASCADE,
    CONSTRAINT fk_dar_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_dar_branch FOREIGN KEY (branch_id) REFERENCES branch(id) ON DELETE CASCADE,
    CONSTRAINT fk_dar_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_dar_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Check Constraints
    CONSTRAINT chk_dar_request_type CHECK (request_type IN ('New', 'Modify', 'Revoke')),
    CONSTRAINT chk_dar_status CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Cancelled')),
    CONSTRAINT chk_dar_priority CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')),
    CONSTRAINT chk_dar_access_type CHECK (requested_access_type IN ('Primary', 'Secondary'))
);

-- Indexes for department_access_request
CREATE INDEX IF NOT EXISTS idx_dar_user ON department_access_request(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_dar_department ON department_access_request(department_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_dar_tenant ON department_access_request(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_dar_status ON department_access_request(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_dar_created_at ON department_access_request(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_dar_pending ON department_access_request(status, created_at) WHERE status = 'Pending' AND deleted_at IS NULL;

-- RLS for department_access_request
ALTER TABLE department_access_request ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_dar ON department_access_request
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY admin_bypass_dar ON department_access_request
    FOR ALL
    TO rls_admin
    USING (true);

-- =====================================================
-- TABLE: DEPARTMENT_ACCESS_AUDIT_LOG (Comprehensive Audit Trail)
-- =====================================================

CREATE TABLE IF NOT EXISTS department_access_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_number VARCHAR(50) UNIQUE NOT NULL, -- e.g., "DAAL-2025-00001"
    
    -- Subject of Audit
    user_id UUID NOT NULL,
    department_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    branch_id UUID,
    department_access_id UUID, -- Links to department_access record
    
    -- Action Details
    action VARCHAR(50) NOT NULL, -- 'Granted', 'Revoked', 'Modified', 'Accessed', 'PermissionChanged', 'SetPrimary'
    action_category VARCHAR(30) NOT NULL, -- 'Access_Management', 'Permission_Change', 'Data_Access', 'Emergency_Access'
    
    -- Change Tracking (JSON for flexibility)
    previous_state JSONB, -- {"access_type": "Secondary", "can_view": true, ...}
    new_state JSONB, -- {"access_type": "Primary", "can_view": true, ...}
    changes_summary TEXT, -- Human-readable: "Changed access_type from Secondary to Primary, enabled can_approve"
    
    -- Context
    justification TEXT,
    approval_request_id UUID, -- Link to department_access_request if part of workflow
    
    -- Performed By
    performed_by UUID NOT NULL,
    performed_by_role VARCHAR(100),
    performed_by_ip VARCHAR(45), -- IPv4 or IPv6
    user_agent TEXT,
    
    -- Compliance & Security
    compliance_flags JSONB, -- {"hipaa_phi_accessed": true, "nabh_audit_required": true}
    compliance_note TEXT, -- "HIPAA: PHI accessed for treatment purposes"
    security_classification VARCHAR(30), -- 'Public', 'Internal', 'Confidential', 'Restricted'
    is_emergency_access BOOLEAN DEFAULT false,
    
    -- Approval Tracking
    was_approved BOOLEAN,
    approved_by UUID,
    approved_at TIMESTAMP,
    
    -- Audit Metadata
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(100),
    correlation_id VARCHAR(100), -- For tracking related actions
    
    -- Foreign Keys
    CONSTRAINT fk_daal_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_daal_department FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE CASCADE,
    CONSTRAINT fk_daal_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_daal_branch FOREIGN KEY (branch_id) REFERENCES branch(id) ON DELETE CASCADE,
    CONSTRAINT fk_daal_dept_access FOREIGN KEY (department_access_id) REFERENCES department_access(id) ON DELETE SET NULL,
    CONSTRAINT fk_daal_performed_by FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_daal_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Check Constraints
    CONSTRAINT chk_daal_action CHECK (action IN ('Granted', 'Revoked', 'Modified', 'Accessed', 'PermissionChanged', 'SetPrimary', 'Requested', 'Approved', 'Rejected')),
    CONSTRAINT chk_daal_category CHECK (action_category IN ('Access_Management', 'Permission_Change', 'Data_Access', 'Emergency_Access', 'Workflow'))
);

-- Indexes for department_access_audit_log
CREATE INDEX IF NOT EXISTS idx_daal_user ON department_access_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_daal_department ON department_access_audit_log(department_id);
CREATE INDEX IF NOT EXISTS idx_daal_tenant ON department_access_audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_daal_timestamp ON department_access_audit_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_daal_action ON department_access_audit_log(action, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_daal_performed_by ON department_access_audit_log(performed_by);
CREATE INDEX IF NOT EXISTS idx_daal_emergency ON department_access_audit_log(is_emergency_access) WHERE is_emergency_access = true;
CREATE INDEX IF NOT EXISTS idx_daal_compliance ON department_access_audit_log(compliance_flags) USING GIN;

-- RLS for department_access_audit_log
ALTER TABLE department_access_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_daal ON department_access_audit_log
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY admin_bypass_daal ON department_access_audit_log
    FOR ALL
    TO rls_admin
    USING (true);

-- =====================================================
-- FUNCTION: Generate Request Number
-- =====================================================

CREATE OR REPLACE FUNCTION generate_request_number()
RETURNS TRIGGER AS $$
DECLARE
    year_suffix VARCHAR(4);
    next_seq INT;
BEGIN
    year_suffix := TO_CHAR(CURRENT_TIMESTAMP, 'YYYY');
    
    -- Get next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(request_number FROM 10) AS INT)), 0) + 1
    INTO next_seq
    FROM department_access_request
    WHERE request_number LIKE 'DAR-' || year_suffix || '-%';
    
    NEW.request_number := 'DAR-' || year_suffix || '-' || LPAD(next_seq::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_request_number
    BEFORE INSERT ON department_access_request
    FOR EACH ROW
    WHEN (NEW.request_number IS NULL)
    EXECUTE FUNCTION generate_request_number();

-- =====================================================
-- FUNCTION: Generate Audit Number
-- =====================================================

CREATE OR REPLACE FUNCTION generate_audit_number()
RETURNS TRIGGER AS $$
DECLARE
    year_suffix VARCHAR(4);
    next_seq INT;
BEGIN
    year_suffix := TO_CHAR(CURRENT_TIMESTAMP, 'YYYY');
    
    -- Get next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(audit_number FROM 11) AS INT)), 0) + 1
    INTO next_seq
    FROM department_access_audit_log
    WHERE audit_number LIKE 'DAAL-' || year_suffix || '-%';
    
    NEW.audit_number := 'DAAL-' || year_suffix || '-' || LPAD(next_seq::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_audit_number
    BEFORE INSERT ON department_access_audit_log
    FOR EACH ROW
    WHEN (NEW.audit_number IS NULL)
    EXECUTE FUNCTION generate_audit_number();

-- =====================================================
-- TRIGGER: Auto-Audit on Department Access Changes
-- =====================================================

CREATE OR REPLACE FUNCTION audit_department_access_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_action VARCHAR(50);
    v_previous_state JSONB;
    v_new_state JSONB;
    v_changes_summary TEXT := '';
BEGIN
    -- Determine action
    IF TG_OP = 'INSERT' THEN
        v_action := 'Granted';
        v_previous_state := NULL;
        v_new_state := jsonb_build_object(
            'access_type', NEW.access_type,
            'can_view', NEW.can_view,
            'can_create', NEW.can_create,
            'can_edit', NEW.can_edit,
            'can_delete', NEW.can_delete,
            'can_approve', NEW.can_approve,
            'can_export', NEW.can_export
        );
        v_changes_summary := 'Department access granted with ' || NEW.access_type || ' access type';
        
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
            v_action := 'Revoked';
            v_changes_summary := 'Department access revoked';
        ELSIF OLD.access_type <> NEW.access_type THEN
            v_action := 'SetPrimary';
            v_changes_summary := 'Access type changed from ' || OLD.access_type || ' to ' || NEW.access_type;
        ELSE
            v_action := 'Modified';
            v_changes_summary := 'Permissions updated: ';
            IF OLD.can_view <> NEW.can_view THEN v_changes_summary := v_changes_summary || 'can_view=' || NEW.can_view || ' '; END IF;
            IF OLD.can_create <> NEW.can_create THEN v_changes_summary := v_changes_summary || 'can_create=' || NEW.can_create || ' '; END IF;
            IF OLD.can_edit <> NEW.can_edit THEN v_changes_summary := v_changes_summary || 'can_edit=' || NEW.can_edit || ' '; END IF;
            IF OLD.can_delete <> NEW.can_delete THEN v_changes_summary := v_changes_summary || 'can_delete=' || NEW.can_delete || ' '; END IF;
            IF OLD.can_approve <> NEW.can_approve THEN v_changes_summary := v_changes_summary || 'can_approve=' || NEW.can_approve || ' '; END IF;
            IF OLD.can_export <> NEW.can_export THEN v_changes_summary := v_changes_summary || 'can_export=' || NEW.can_export || ' '; END IF;
        END IF;
        
        v_previous_state := jsonb_build_object(
            'access_type', OLD.access_type,
            'can_view', OLD.can_view,
            'can_create', OLD.can_create,
            'can_edit', OLD.can_edit,
            'can_delete', OLD.can_delete,
            'can_approve', OLD.can_approve,
            'can_export', OLD.can_export
        );
        v_new_state := jsonb_build_object(
            'access_type', NEW.access_type,
            'can_view', NEW.can_view,
            'can_create', NEW.can_create,
            'can_edit', NEW.can_edit,
            'can_delete', NEW.can_delete,
            'can_approve', NEW.can_approve,
            'can_export', NEW.can_export
        );
        
    ELSIF TG_OP = 'DELETE' THEN
        v_action := 'Revoked';
        v_previous_state := jsonb_build_object(
            'access_type', OLD.access_type,
            'can_view', OLD.can_view,
            'can_create', OLD.can_create,
            'can_edit', OLD.can_edit,
            'can_delete', OLD.can_delete,
            'can_approve', OLD.can_approve,
            'can_export', OLD.can_export
        );
        v_new_state := NULL;
        v_changes_summary := 'Department access permanently deleted';
    END IF;
    
    -- Insert audit log
    INSERT INTO department_access_audit_log (
        user_id,
        department_id,
        tenant_id,
        branch_id,
        department_access_id,
        action,
        action_category,
        previous_state,
        new_state,
        changes_summary,
        performed_by,
        compliance_note,
        timestamp
    ) VALUES (
        COALESCE(NEW.user_id, OLD.user_id),
        COALESCE(NEW.department_id, OLD.department_id),
        COALESCE(NEW.tenant_id, OLD.tenant_id),
        COALESCE(NEW.branch_id, OLD.branch_id),
        COALESCE(NEW.id, OLD.id),
        v_action,
        'Access_Management',
        v_previous_state,
        v_new_state,
        v_changes_summary,
        COALESCE(NEW.updated_by, NEW.created_by, OLD.updated_by, OLD.created_by),
        'HIPAA: Department access change logged for compliance',
        CURRENT_TIMESTAMP
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_department_access_changes
    AFTER INSERT OR UPDATE OR DELETE ON department_access
    FOR EACH ROW
    EXECUTE FUNCTION audit_department_access_changes();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE department_access_request IS 'Approval workflow for department access requests (new/modify/revoke)';
COMMENT ON TABLE department_access_audit_log IS 'Comprehensive audit trail for all department access changes (HIPAA/NABH compliance)';
COMMENT ON COLUMN department_access_request.request_number IS 'Unique request identifier: DAR-YYYY-00001';
COMMENT ON COLUMN department_access_audit_log.audit_number IS 'Unique audit log identifier: DAAL-YYYY-00001';
COMMENT ON COLUMN department_access_audit_log.compliance_flags IS 'JSON flags for compliance tracking: {"hipaa_phi_accessed": true}';
COMMENT ON COLUMN department_access_audit_log.previous_state IS 'JSON snapshot of permissions before change';
COMMENT ON COLUMN department_access_audit_log.new_state IS 'JSON snapshot of permissions after change';

COMMIT;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('department_access_request', 'department_access_audit_log')
ORDER BY table_name;

-- Verify triggers
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name IN ('trg_generate_request_number', 'trg_generate_audit_number', 'trg_audit_department_access_changes')
ORDER BY trigger_name;

-- Test request number generation
DO $$
DECLARE
    test_request_id UUID;
BEGIN
    INSERT INTO department_access_request (
        user_id, department_id, tenant_id, request_type, justification, created_by
    )
    SELECT 
        u.id, d.id, t.id, 'New', 'Test request number generation', u.id
    FROM users u
    CROSS JOIN department d
    CROSS JOIN tenant t
    WHERE u.email = 'admin@test.com'
      AND d.department_code = 'STD_DOCTOR'
      AND t.name = 'India Eye Hospital Network'
    LIMIT 1
    RETURNING id INTO test_request_id;
    
    RAISE NOTICE 'Test request created with ID: %', test_request_id;
    
    -- Verify request number format
    IF EXISTS (
        SELECT 1 FROM department_access_request 
        WHERE id = test_request_id 
        AND request_number ~ '^DAR-\d{4}-\d{5}$'
    ) THEN
        RAISE NOTICE '✓ Request number format is correct';
    ELSE
        RAISE EXCEPTION '✗ Request number format is incorrect';
    END IF;
    
    -- Clean up test data
    DELETE FROM department_access_request WHERE id = test_request_id;
    RAISE NOTICE '✓ Test data cleaned up';
END $$;

RAISE NOTICE '==============================================';
RAISE NOTICE '✓ Approval Workflow & Audit Logging Migration Complete';
RAISE NOTICE '==============================================';
