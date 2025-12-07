-- ============================================================
-- Migration: Patient Document Uploads Table
-- Purpose: Store patient document metadata with RLS and audit
-- Date: November 10, 2025
-- ============================================================

-- Drop table if exists (for clean re-creation)
DROP TABLE IF EXISTS patient_document_uploads CASCADE;

-- Create patient_document_uploads table
CREATE TABLE patient_document_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    
    -- Document metadata
    document_type VARCHAR(50) NOT NULL, -- insurance_card, lab_report, prescription, medical_history, etc.
    document_title VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size BIGINT, -- in bytes
    mime_type VARCHAR(100),
    
    -- Upload tracking
    uploaded_by UUID NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Access control (ABAC support)
    shared_to_departments TEXT[], -- Array of department names/codes
    shared_to_roles TEXT[], -- Array of role names/codes
    is_public BOOLEAN DEFAULT FALSE, -- Visible to all staff in same tenant
    
    -- Data classification (HIPAA)
    data_classification VARCHAR(20) DEFAULT 'sensitive', -- public, internal, sensitive, confidential
    retention_days INTEGER DEFAULT 2555, -- 7 years for HIPAA compliance
    
    -- Standard audit columns
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID,
    updated_at TIMESTAMPTZ,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ,
    deleted_by_user_id UUID,
    
    -- Constraints
    CONSTRAINT fk_patient_document_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    CONSTRAINT fk_patient_document_patient FOREIGN KEY (patient_id) REFERENCES users(id),
    CONSTRAINT fk_patient_document_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id),
    CONSTRAINT fk_patient_document_created_by FOREIGN KEY (created_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_patient_document_updated_by FOREIGN KEY (updated_by_user_id) REFERENCES users(id),
    CONSTRAINT chk_patient_document_status CHECK (status IN ('active', 'archived', 'deleted', 'expired')),
    CONSTRAINT chk_patient_document_classification CHECK (data_classification IN ('public', 'internal', 'sensitive', 'confidential'))
);

-- Indexes for performance
CREATE INDEX idx_patient_uploads_patient ON patient_document_uploads(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_patient_uploads_tenant ON patient_document_uploads(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_patient_uploads_date ON patient_document_uploads(uploaded_at DESC);
CREATE INDEX idx_patient_uploads_type ON patient_document_uploads(document_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_patient_uploads_status ON patient_document_uploads(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_patient_uploads_uploaded_by ON patient_document_uploads(uploaded_by) WHERE deleted_at IS NULL;

-- GIN index for array columns (ABAC queries)
CREATE INDEX idx_patient_uploads_departments ON patient_document_uploads USING GIN(shared_to_departments) WHERE deleted_at IS NULL;
CREATE INDEX idx_patient_uploads_roles ON patient_document_uploads USING GIN(shared_to_roles) WHERE deleted_at IS NULL;

-- Enable Row Level Security
ALTER TABLE patient_document_uploads ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Tenant Isolation
CREATE POLICY tenant_isolation_patient_document_uploads 
ON patient_document_uploads
FOR ALL 
USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- RLS Policy: Users can see their own documents
CREATE POLICY patient_own_documents 
ON patient_document_uploads
FOR SELECT
USING (patient_id::text = current_setting('app.current_user_id', true));

-- Comments for documentation
COMMENT ON TABLE patient_document_uploads IS 'Stores patient document metadata with HIPAA-compliant access control';
COMMENT ON COLUMN patient_document_uploads.data_classification IS 'HIPAA data classification level';
COMMENT ON COLUMN patient_document_uploads.retention_days IS 'Days to retain document (default 7 years for HIPAA)';
COMMENT ON COLUMN patient_document_uploads.shared_to_departments IS 'ABAC: Departments with access to this document';
COMMENT ON COLUMN patient_document_uploads.shared_to_roles IS 'ABAC: Roles with access to this document';

-- Verification
SELECT 
    'patient_document_uploads' as table_name,
    COUNT(*) as row_count,
    pg_size_pretty(pg_total_relation_size('patient_document_uploads')) as table_size
FROM patient_document_uploads;

-- Show indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'patient_document_uploads'
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
WHERE tablename = 'patient_document_uploads';
