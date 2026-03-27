-- Migration: Add imaging_comparisons table for Phase 7 (Medical Imaging Platform)
-- Date: February 21, 2026
-- Description: Creates imaging_comparisons table to track progression, side-by-side comparisons, and longitudinal analysis

-- Create imaging_comparisons table
CREATE TABLE IF NOT EXISTS imaging_comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    
    -- Patient relationship
    patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    
    -- Images being compared
    baseline_image_id UUID NOT NULL REFERENCES imaging_images(id) ON DELETE CASCADE,
    followup_image_id UUID NOT NULL REFERENCES imaging_images(id) ON DELETE CASCADE,
    
    -- Comparison metadata
    comparison_type VARCHAR(50) NOT NULL DEFAULT 'progression', -- progression, response_to_treatment, bilateral, pre_post_surgery
    time_interval_days INTEGER, -- Calculated from image dates (e.g., 90 days between scans)
    
    -- Clinical findings
    findings TEXT, -- Doctor's interpretation of changes
    change_percentage NUMERIC(5, 2), -- Percentage change (-100.00 to +100.00)
    clinical_significance VARCHAR(50), -- improving, stable, worsening, significant_progression
    
    -- Quantitative analysis (optional, for OCT/Visual Field progression)
    quantitative_metrics JSONB, -- E.g., {"rnfl_change": -5.2, "gcl_change": -3.1, "vfi_change": -2.5}
    
    -- Review tracking
    reviewed_by_user_id UUID NOT NULL, -- Doctor who performed comparison
    reviewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Standard HIPAA audit columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete
    status VARCHAR(50) DEFAULT 'active',
    
    -- Constraints
    CONSTRAINT chk_comparison_type CHECK (comparison_type IN ('progression', 'response_to_treatment', 'bilateral', 'pre_post_surgery', 'multi_modality')),
    CONSTRAINT chk_clinical_significance CHECK (clinical_significance IN ('improving', 'stable', 'worsening', 'significant_progression', 'rapid_decline', 'no_change')),
    CONSTRAINT chk_comparison_status CHECK (status IN ('active', 'archived', 'deleted')),
    CONSTRAINT chk_different_images CHECK (baseline_image_id != followup_image_id), -- Cannot compare image to itself
    CONSTRAINT chk_time_interval CHECK (time_interval_days IS NULL OR time_interval_days >= 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_imaging_comparisons_patient_id ON imaging_comparisons(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_imaging_comparisons_baseline_id ON imaging_comparisons(baseline_image_id);
CREATE INDEX IF NOT EXISTS idx_imaging_comparisons_followup_id ON imaging_comparisons(followup_image_id);
CREATE INDEX IF NOT EXISTS idx_imaging_comparisons_tenant_id ON imaging_comparisons(tenant_id);
CREATE INDEX IF NOT EXISTS idx_imaging_comparisons_reviewed_by ON imaging_comparisons(reviewed_by_user_id);
CREATE INDEX IF NOT EXISTS idx_imaging_comparisons_significance ON imaging_comparisons(clinical_significance);
CREATE INDEX IF NOT EXISTS idx_imaging_comparisons_status ON imaging_comparisons(status) WHERE deleted_at IS NULL;

-- GIN index for quantitative metrics JSONB queries
CREATE INDEX IF NOT EXISTS idx_imaging_comparisons_metrics ON imaging_comparisons USING GIN (quantitative_metrics);

-- Enable Row-Level Security for multi-tenancy
ALTER TABLE imaging_comparisons ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for tenant isolation
CREATE POLICY tenant_isolation_imaging_comparisons ON imaging_comparisons
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Grant permissions
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'hospital_app_user') THEN
        GRANT SELECT, INSERT, UPDATE, DELETE ON imaging_comparisons TO hospital_app_user;
    END IF;
END $$;

-- Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_imaging_comparisons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_imaging_comparisons_updated_at
    BEFORE UPDATE ON imaging_comparisons
    FOR EACH ROW
    EXECUTE FUNCTION update_imaging_comparisons_updated_at();

-- Create trigger to auto-calculate time_interval_days
CREATE OR REPLACE FUNCTION calculate_time_interval()
RETURNS TRIGGER AS $$
DECLARE
    baseline_date TIMESTAMP WITH TIME ZONE;
    followup_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get upload dates from imaging_images
    SELECT uploaded_at INTO baseline_date FROM imaging_images WHERE id = NEW.baseline_image_id;
    SELECT uploaded_at INTO followup_date FROM imaging_images WHERE id = NEW.followup_image_id;
    
    -- Calculate interval in days
    IF baseline_date IS NOT NULL AND followup_date IS NOT NULL THEN
        NEW.time_interval_days := EXTRACT(DAY FROM (followup_date - baseline_date));
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_time_interval
    BEFORE INSERT OR UPDATE OF baseline_image_id, followup_image_id ON imaging_comparisons
    FOR EACH ROW
    EXECUTE FUNCTION calculate_time_interval();

-- Create audit log trigger for HIPAA compliance
CREATE OR REPLACE FUNCTION audit_imaging_comparisons_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, record_id, action, changed_by, changed_at, new_values, tenant_id)
        VALUES ('imaging_comparisons', NEW.id, 'INSERT', NEW.created_by_user_id, CURRENT_TIMESTAMP, row_to_json(NEW), NEW.tenant_id);
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, record_id, action, changed_by, changed_at, old_values, new_values, tenant_id)
        VALUES ('imaging_comparisons', NEW.id, 'UPDATE', NEW.updated_by_user_id, CURRENT_TIMESTAMP, row_to_json(OLD), row_to_json(NEW), NEW.tenant_id);
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, record_id, action, changed_by, changed_at, old_values, tenant_id)
        VALUES ('imaging_comparisons', OLD.id, 'DELETE', OLD.updated_by_user_id, CURRENT_TIMESTAMP, row_to_json(OLD), OLD.tenant_id);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit trigger if audit_log table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_log') THEN
        CREATE TRIGGER trg_audit_imaging_comparisons
            AFTER INSERT OR UPDATE OR DELETE ON imaging_comparisons
            FOR EACH ROW
            EXECUTE FUNCTION audit_imaging_comparisons_changes();
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON TABLE imaging_comparisons IS 'Tracks longitudinal progression and side-by-side comparisons of medical imaging studies';
COMMENT ON COLUMN imaging_comparisons.time_interval_days IS 'Auto-calculated interval between baseline and follow-up scans';
COMMENT ON COLUMN imaging_comparisons.quantitative_metrics IS 'Structured quantitative analysis data (RNFL thickness change, VFI change, etc.)';
COMMENT ON COLUMN imaging_comparisons.clinical_significance IS 'Doctor''s assessment of clinical importance of changes';
