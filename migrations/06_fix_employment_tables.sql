-- Migration 06: Fix Employment Tables
-- Purpose: Add missing columns to professional_license and create bulk_operation_job

BEGIN;

-- =====================================================
-- 1. ADD MISSING COLUMNS TO professional_license
-- =====================================================
DO $$
BEGIN
    -- Add user_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'professional_license' AND column_name = 'user_id') THEN
        ALTER TABLE professional_license ADD COLUMN user_id UUID REFERENCES users(id);
        RAISE NOTICE 'Added column: user_id';
    END IF;
    
    -- Add license_category
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'professional_license' AND column_name = 'license_category') THEN
        ALTER TABLE professional_license ADD COLUMN license_category VARCHAR(50);
        RAISE NOTICE 'Added column: license_category';
    END IF;
    
    -- Add issuing_country
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'professional_license' AND column_name = 'issuing_country') THEN
        ALTER TABLE professional_license ADD COLUMN issuing_country VARCHAR(100);
        RAISE NOTICE 'Added column: issuing_country';
    END IF;
    
    -- Add issuing_state
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'professional_license' AND column_name = 'issuing_state') THEN
        ALTER TABLE professional_license ADD COLUMN issuing_state VARCHAR(100);
        RAISE NOTICE 'Added column: issuing_state';
    END IF;
    
    -- Add renewal_date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'professional_license' AND column_name = 'renewal_date') THEN
        ALTER TABLE professional_license ADD COLUMN renewal_date DATE;
        RAISE NOTICE 'Added column: renewal_date';
    END IF;
    
    -- Add renewal_status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'professional_license' AND column_name = 'renewal_status') THEN
        ALTER TABLE professional_license ADD COLUMN renewal_status VARCHAR(20) DEFAULT 'active';
        RAISE NOTICE 'Added column: renewal_status';
    END IF;
    
    -- Add last_reminder_sent_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'professional_license' AND column_name = 'last_reminder_sent_at') THEN
        ALTER TABLE professional_license ADD COLUMN last_reminder_sent_at TIMESTAMPTZ;
        RAISE NOTICE 'Added column: last_reminder_sent_at';
    END IF;
    
    -- Add verification_notes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'professional_license' AND column_name = 'verification_notes') THEN
        ALTER TABLE professional_license ADD COLUMN verification_notes TEXT;
        RAISE NOTICE 'Added column: verification_notes';
    END IF;
    
    -- Add renewal_document_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'professional_license' AND column_name = 'renewal_document_url') THEN
        ALTER TABLE professional_license ADD COLUMN renewal_document_url VARCHAR(500);
        RAISE NOTICE 'Added column: renewal_document_url';
    END IF;
    
    -- Add scope_of_practice
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'professional_license' AND column_name = 'scope_of_practice') THEN
        ALTER TABLE professional_license ADD COLUMN scope_of_practice TEXT;
        RAISE NOTICE 'Added column: scope_of_practice';
    END IF;
    
    -- Add restrictions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'professional_license' AND column_name = 'restrictions') THEN
        ALTER TABLE professional_license ADD COLUMN restrictions TEXT;
        RAISE NOTICE 'Added column: restrictions';
    END IF;
    
    -- Add specializations
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'professional_license' AND column_name = 'specializations') THEN
        ALTER TABLE professional_license ADD COLUMN specializations JSONB;
        RAISE NOTICE 'Added column: specializations';
    END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_professional_license_user ON professional_license(user_id);
CREATE INDEX IF NOT EXISTS idx_professional_license_renewal ON professional_license(renewal_status);
CREATE INDEX IF NOT EXISTS idx_professional_license_category ON professional_license(license_category);

-- =====================================================
-- 2. DROP AND RECREATE bulk_operation_job
-- =====================================================
DROP TABLE IF EXISTS bulk_operation_job CASCADE;

CREATE TABLE bulk_operation_job (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    operation_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    total_records INTEGER DEFAULT 0,
    processed_records INTEGER DEFAULT 0,
    successful_records INTEGER DEFAULT 0,
    failed_records INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'queued',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    output_file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID NOT NULL REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_bulk_job_tenant ON bulk_operation_job(tenant_id);
CREATE INDEX idx_bulk_job_status ON bulk_operation_job(status, created_at DESC);
CREATE INDEX idx_bulk_job_created_by ON bulk_operation_job(created_by_user_id);
CREATE INDEX idx_bulk_job_operation ON bulk_operation_job(operation_type, created_at DESC);

-- RLS
ALTER TABLE bulk_operation_job ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_bulk_job ON bulk_operation_job
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

DO $$
BEGIN
    RAISE NOTICE 'Migration 06 Complete!';
    RAISE NOTICE 'Professional license columns added';
    RAISE NOTICE 'Bulk operation job table created';
END $$;

COMMIT;
