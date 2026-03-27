-- ================================================
-- PHASE 3 MANUAL SCHEMA UPDATE
-- Module 1: Doctor Desk - Examination Drafts
-- Date: February 18, 2026
-- ================================================
-- Run this if migration fails to apply
-- ================================================

-- 1. CREATE examination_drafts TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS examination_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    doctor_id UUID NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    completion_percentage INT NOT NULL DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    
    -- Audit fields
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    
    -- Foreign keys
    CONSTRAINT fk_examination_drafts_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_examination_drafts_patient FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE,
    CONSTRAINT fk_examination_drafts_doctor FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_examination_drafts_tenant ON examination_drafts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_examination_drafts_patient ON examination_drafts(patient_id);
CREATE INDEX IF NOT EXISTS idx_examination_drafts_doctor ON examination_drafts(doctor_id);
CREATE INDEX IF NOT EXISTS idx_examination_drafts_expires_at ON examination_drafts(expires_at);

-- Row Level Security (RLS)
ALTER TABLE examination_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY examination_drafts_tenant_isolation ON examination_drafts
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Cleanup policy for system maintenance role
CREATE POLICY examination_drafts_cleanup ON examination_drafts
    FOR DELETE
    USING (
        expires_at < NOW() 
        OR current_user = 'rls_admin'
    );

COMMENT ON TABLE examination_drafts IS 'Auto-save drafts for examination forms with 24-hour expiry';
COMMENT ON COLUMN examination_drafts.data IS 'JSONB field storing complete examination form data';
COMMENT ON COLUMN examination_drafts.expires_at IS 'Draft expires 24 hours after last save';
COMMENT ON COLUMN examination_drafts.completion_percentage IS 'Percentage 0-100 of form completion';


-- 2. UPDATE clinical_examination TABLE
-- ================================================
-- Add new columns for digital signature and examination type

-- Add examination_type column (e.g., "Optometry", "Ophthalmology", "Follow-up")
ALTER TABLE IF EXISTS clinical_examination 
ADD COLUMN IF NOT EXISTS examination_type VARCHAR(100);

-- Add digital signature fields
ALTER TABLE IF EXISTS clinical_examination 
ADD COLUMN IF NOT EXISTS is_signed BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE IF EXISTS clinical_examination 
ADD COLUMN IF NOT EXISTS signed_by_user_id UUID;

ALTER TABLE IF EXISTS clinical_examination 
ADD COLUMN IF NOT EXISTS signed_at TIMESTAMP;

-- Add foreign key for signed_by_user_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_clinical_examination_signed_by'
    ) THEN
        ALTER TABLE clinical_examination 
        ADD CONSTRAINT fk_clinical_examination_signed_by 
        FOREIGN KEY (signed_by_user_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create index for examination type filtering
CREATE INDEX IF NOT EXISTS idx_clinical_examination_type ON clinical_examination(examination_type);

-- Create index for signed status
CREATE INDEX IF NOT EXISTS idx_clinical_examination_signed ON clinical_examination(is_signed);

COMMENT ON COLUMN clinical_examination.examination_type IS 'Type of examination: Optometry, Ophthalmology, Follow-up, etc.';
COMMENT ON COLUMN clinical_examination.is_signed IS 'Digital signature status - true when doctor signs';
COMMENT ON COLUMN clinical_examination.signed_by_user_id IS 'Doctor who digitally signed the examination';
COMMENT ON COLUMN clinical_examination.signed_at IS 'Timestamp when examination was signed';


-- 3. VERIFY SCHEMA
-- ================================================
DO $$
DECLARE
    draft_table_exists BOOLEAN;
    exam_columns_exist BOOLEAN;
BEGIN
    -- Check if examination_drafts table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'examination_drafts'
    ) INTO draft_table_exists;

    -- Check if new columns exist in clinical_examination
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'clinical_examination' 
        AND column_name IN ('examination_type', 'is_signed', 'signed_by_user_id', 'signed_at')
    ) INTO exam_columns_exist;

    -- Output results
    IF draft_table_exists THEN
        RAISE NOTICE '✅ examination_drafts table created successfully';
    ELSE
        RAISE WARNING '❌ examination_drafts table NOT created';
    END IF;

    IF exam_columns_exist THEN
        RAISE NOTICE '✅ clinical_examination columns added successfully';
    ELSE
        RAISE WARNING '❌ clinical_examination columns NOT added';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE 'Schema update complete! You can now test draft save/recovery.';
END $$;


-- 4. SEED SAMPLE DATA (OPTIONAL)
-- ================================================
-- Uncomment to create test examination types

-- UPDATE clinical_examination 
-- SET examination_type = 'Optometry'
-- WHERE examination_notes ILIKE '%visual acuity%' 
--    OR examination_notes ILIKE '%refraction%';

-- UPDATE clinical_examination 
-- SET examination_type = 'Ophthalmology'
-- WHERE examination_type IS NULL;


-- 5. CLEANUP FUNCTION (OPTIONAL)
-- ================================================
-- Background job to delete expired drafts

CREATE OR REPLACE FUNCTION cleanup_expired_examination_drafts()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM examination_drafts
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_examination_drafts IS 'Deletes examination drafts older than 24 hours. Returns count of deleted rows.';

-- Example: Manual cleanup
-- SELECT cleanup_expired_examination_drafts();


-- ================================================
-- ROLLBACK (if needed)
-- ================================================
-- Uncomment to remove changes

-- DROP TABLE IF EXISTS examination_drafts CASCADE;
-- ALTER TABLE clinical_examination DROP COLUMN IF EXISTS examination_type;
-- ALTER TABLE clinical_examination DROP COLUMN IF EXISTS is_signed;
-- ALTER TABLE clinical_examination DROP COLUMN IF EXISTS signed_by_user_id;
-- ALTER TABLE clinical_examination DROP COLUMN IF EXISTS signed_at;
-- DROP FUNCTION IF EXISTS cleanup_expired_examination_drafts();


-- ================================================
-- SCRIPT COMPLETE
-- ================================================
