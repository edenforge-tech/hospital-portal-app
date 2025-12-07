-- ============================================================
-- Migration: Document Access Audit Table
-- Purpose: HIPAA-compliant audit log for all document access
-- Date: November 10, 2025
-- ============================================================

-- Drop table if exists (for clean re-creation)
DROP TABLE IF EXISTS document_access_audit CASCADE;

-- Create document_access_audit table
CREATE TABLE document_access_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    
    -- Access details
    user_id UUID NOT NULL,
    user_email VARCHAR(255),
    user_role VARCHAR(100),
    
    -- Document details
    document_id UUID NOT NULL,
    document_type VARCHAR(50),
    document_title VARCHAR(255),
    patient_id UUID,
    
    -- Action tracking
    action VARCHAR(50) NOT NULL, -- read, update, delete, download, share, unshare, print, export
    action_result VARCHAR(50) NOT NULL, -- success, denied, error
    
    -- Authorization details
    access_granted BOOLEAN NOT NULL,
    denial_reason VARCHAR(500),
    permission_used VARCHAR(100), -- Which permission was checked
    
    -- Request metadata
    ip_address INET,
    user_agent TEXT,
    request_path VARCHAR(500),
    request_method VARCHAR(10),
    
    -- Performance tracking
    response_time_ms INTEGER,
    
    -- Timestamp (immutable - no updates)
    accessed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_doc_audit_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    CONSTRAINT fk_doc_audit_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT chk_doc_audit_action CHECK (action IN ('read', 'update', 'delete', 'download', 'share', 'unshare', 'print', 'export', 'view', 'create')),
    CONSTRAINT chk_doc_audit_result CHECK (action_result IN ('success', 'denied', 'error', 'invalid_request'))
);

-- Indexes for audit queries
CREATE INDEX idx_audit_user ON document_access_audit(user_id, accessed_at DESC);
CREATE INDEX idx_audit_document ON document_access_audit(document_id, accessed_at DESC);
CREATE INDEX idx_audit_patient ON document_access_audit(patient_id, accessed_at DESC) WHERE patient_id IS NOT NULL;
CREATE INDEX idx_audit_timestamp ON document_access_audit(accessed_at DESC);
CREATE INDEX idx_audit_tenant ON document_access_audit(tenant_id, accessed_at DESC);
CREATE INDEX idx_audit_action ON document_access_audit(action, accessed_at DESC);
CREATE INDEX idx_audit_denied ON document_access_audit(accessed_at DESC) WHERE access_granted = false;
CREATE INDEX idx_audit_ip ON document_access_audit(ip_address, accessed_at DESC);

-- Composite index for common queries
CREATE INDEX idx_audit_user_doc_date ON document_access_audit(user_id, document_id, accessed_at DESC);
CREATE INDEX idx_audit_tenant_date ON document_access_audit(tenant_id, accessed_at DESC);

-- Enable Row Level Security
ALTER TABLE document_access_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Tenant Isolation
CREATE POLICY tenant_isolation_document_access_audit 
ON document_access_audit
FOR ALL 
USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- RLS Policy: Users can see their own audit logs
CREATE POLICY user_own_audit_logs 
ON document_access_audit
FOR SELECT
USING (user_id::text = current_setting('app.current_user_id', true));

-- Comments for documentation
COMMENT ON TABLE document_access_audit IS 'HIPAA-compliant audit log for all document access attempts';
COMMENT ON COLUMN document_access_audit.action IS 'Type of action performed on document';
COMMENT ON COLUMN document_access_audit.access_granted IS 'Whether access was granted or denied';
COMMENT ON COLUMN document_access_audit.denial_reason IS 'Reason for access denial (if applicable)';
COMMENT ON COLUMN document_access_audit.permission_used IS 'Permission code that was checked';
COMMENT ON COLUMN document_access_audit.accessed_at IS 'Immutable timestamp - records are never updated';

-- Create function to auto-log document access
CREATE OR REPLACE FUNCTION log_document_access(
    p_tenant_id UUID,
    p_user_id UUID,
    p_document_id UUID,
    p_action VARCHAR,
    p_access_granted BOOLEAN,
    p_denial_reason VARCHAR DEFAULT NULL,
    p_ip_address INET DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_audit_id UUID;
BEGIN
    INSERT INTO document_access_audit (
        tenant_id,
        user_id,
        document_id,
        action,
        action_result,
        access_granted,
        denial_reason,
        ip_address,
        accessed_at
    ) VALUES (
        p_tenant_id,
        p_user_id,
        p_document_id,
        p_action,
        CASE WHEN p_access_granted THEN 'success' ELSE 'denied' END,
        p_access_granted,
        p_denial_reason,
        p_ip_address,
        CURRENT_TIMESTAMP
    ) RETURNING id INTO v_audit_id;
    
    RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION log_document_access IS 'Helper function to log document access attempts';

-- Verification
SELECT 
    'document_access_audit' as table_name,
    COUNT(*) as row_count,
    pg_size_pretty(pg_total_relation_size('document_access_audit')) as table_size
FROM document_access_audit;

-- Show indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'document_access_audit'
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
WHERE tablename = 'document_access_audit';
